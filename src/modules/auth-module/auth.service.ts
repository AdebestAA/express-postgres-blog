import { Request, Response } from "express";
import {
  accessTokenSecret,
  brevo_api_key,
  googleClientId,
  googleClientSecret,
  refreshTokenSecret,
} from "../../constants";
import { signupType } from "../../validations/schemas";
import pool from "../../configs/init-db";
import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../../configs/redis-config";
import { createError } from "../../util/create-error";
import { error } from "console";

// ADD USER TO DB
export const addUserToDb = async (data: signupType) => {
  const salt = await genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  try {
    // check if user exists
    const checkIfUserExists = await pool.query(
      `
      SELECT * FROM users WHERE email = $1 
      `,
      [data.email],
    );

    if (checkIfUserExists.rows.length > 0) {
      // check is user is verified
      if (checkIfUserExists.rows[0].is_verified === 1) {
        throw createError(409, "email is already registered");
      }
      // if user is not verified now update the table with the new details sent
      await pool.query(
        `UPDATE users
        SET nickname = $1,
 password = $2
        WHERE email = $3
        `,
        [data.nickname, hashedPassword, data.email],
      );
    } else {
      await pool.query(
        `
          INSERT INTO users (email,password,nickname)
          VALUES($1,$2,$3)
          RETURNING *
          `,
        [data.email, hashedPassword, data.nickname],
      );
    }
  } catch (error) {
    // Preserve the status from createError (e.g. 409) instead of flattening it to 500
    if (error && typeof error === "object" && "status" in error) {
      throw error;
    }
    throw createError(500, "something went wrong, unable to create account");
  }
};
// add user otp to otp table
export const addUserOtpToOtpTable = async (email: string, token: string) => {
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

  // this updates the token even if the user email already exist in teh otp table
  try {
    await pool.query(
      `
        INSERT INTO otp (email,token,expiry_time)
        VALUES($1,$2,$3)
        ON CONFLICT (email)
        DO UPDATE SET
        token = EXCLUDED.token,
        expiry_time = EXCLUDED.expiry_time
        RETURNING *
        `,
      [email, token, expiryTime],
    );
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "something went wrong, unable save verification details";
    throw new Error(errorMsg);
  }
};

export const sendVerificationToken = async (
  email: string,
  otp: string,
  type: "signup_verify" | "password_reset" = "signup_verify",
) => {
  try {
    const isSignupVerify = type === "signup_verify";

    const subject = isSignupVerify
      ? "Very Your Email Before Signup"
      : "Reset Password";

    const html = `
        <h2>${subject}</h2>
        <p>Below is your opt (expires in 10min)</p>
        <h1>
         ${otp}
        </h1>
      `;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevo_api_key,

        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: "aadebesta@gmail.com",
          name: "My Project",
        },
        to: [{ email }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Brevo send failed:", response.status, errorBody);
      throw createError(502, "failed to send verification email");
    }
  } catch (error) {
    if (error && typeof error === "object" && "status" in error) {
      throw error;
    }

    throw createError(500, "failed to send email");
  }
};

export const checkOtpValidity = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  try {
    // check if email exist in the db
    const result = await pool.query(
      `
      SELECT u.email,u.is_verified FROM users u WHERE email = $1
      `,
      [email],
    );

    // if email does not exsit in the db
    if (result.rows.length < 1) {
      throw new Error("user does not exsit");
    }
    // now check if user is verified
    if (result.rows[0].is_verified === 1) {
      throw new Error("accout already verified");
    }

    // get check if user otp exist
    const otpCheckResult = await pool.query(
      `
      SELECT o.email,o.token,o.expiry_time FROM otp o  WHERE email = $1 
      `,
      [email],
    );

    // if user doesn't exist in the opt table
    if (otpCheckResult.rows.length < 1) {
      throw new Error("sorry otp does not exist");
    }

    // check if otp hasn't expired

    const now = new Date(Date.now());
    const expiryTime = otpCheckResult.rows[0].expiry_time;

    if (now > expiryTime) {
      throw new Error("code is expired already");
    }

    // compare code now
    if (otp !== otpCheckResult.rows[0].token) {
      throw new Error("invalid otp code");
    }

    // verify user
    await pool.query(
      `
      UPDATE users 
      SET is_verified = $1
      WHERE email = $2
      `,
      [1, email],
    );
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : " something went wrong";
    throw new Error(errorMsg);
  }
};

export const signInCheck = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    // check if email exist in the db
    const result = await pool.query(
      `
      SELECT u.email,u.password,u.is_verified FROM users u WHERE email = $1
      `,
      [email],
    );

    // console.log();

    // if email does not exsit in the db
    if (result.rows.length < 1) {
      throw createError(401, "invalid email or password");
    }
    // chekc if password is correct
    const comparePassword = await bcrypt.compare(
      password,
      result.rows[0].password,
    );

    if (!comparePassword) {
      throw createError(401, "invalid email or password");
    }

    // now check if user isn't verified
    if (result.rows[0].is_verified !== 1) {
      throw createError(403, "please verify your email first");
    }
  } catch (error) {
    if (error && typeof error === "object" && "status" in error) throw error;
    throw createError(500, "something went wrong");
  }
};

// create access token
export const createAccessToken = async (email: string): Promise<string> => {
  const accessToken = jwt.sign({ email: email }, accessTokenSecret, {
    expiresIn: "1d",
  });

  return accessToken;
};

// create refresh token ( the refresh token stores the userEmail and userSession)
export const createRefreshToken = async (email: string): Promise<string> => {
  const sessionId = uuidv4();

  try {
    // add sessionId for user multii device signin => (i.e when user signin in on PC and on thier mobile phone => when they sign out from one of the devices it doesn't affect the other cause both devices have different sesssions generated on login)
    await redisClient.set(
      `refresh:${sessionId}`,
      JSON.stringify({
        email: email,
        create_at: new Date(Date.now()),
      }),
      "EX",
      60 * 60 * 24 * 7,
    );
  } catch (error) {
    console.log(error);
  }
  const refreshToken = jwt.sign(
    { userEmail: email, userSession: sessionId },
    refreshTokenSecret,
    {
      expiresIn: "7d",
    },
  );

  return refreshToken;
};

export const checkIfOtpIsValidAndNotExpiredAndUserExist = async (data: {
  email: string;
  code: string;
}) => {
  const checkEmailExistInDb = await pool.query(
    `SELECT * FROM otp WHERE otp.email = $1`,
    [data.email],
  );

  if (checkEmailExistInDb.rows.length < 1) {
    throw createError(400, "sorry,email doesn't exist");
  }
  const emailExistIntOtpData: {
    email: string;
    token: string;
    expiry_time: string;
  } = checkEmailExistInDb.rows[0];

  // now check if code has expired
  const now = new Date(Date.now());
  const expiresAt = new Date(emailExistIntOtpData.expiry_time);
  // console.log("now", now);
  // console.log("expiresAt", expiresAt.getTime());
  // console.log("expiresAtNormal", expiresAt);

  if (now > expiresAt) {
    throw createError(400, "otp has expired");
  }

  // check if otp is the same

  if (data.code != emailExistIntOtpData.token) {
    throw createError(400, "otp is incorrect");
  }
};

export const updateUserPasswordAndGetRidOfUserDataInOtpTable = async (data: {
  email: string;
  otp: string;
  new_password: string;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const salt = await genSalt(10);
    const hashedPassword = await bcrypt.hash(data.new_password, salt);

    // now update user password in the user table

    await client.query(
      `
    UPDATE users 
    SET password = $1 WHERE email = $2
    `,
      [hashedPassword, data.email],
    );

    // now delete user data from the otp table

    await client.query(
      `
      DELETE FROM otp
      WHERE otp.email = $1
      `,
      [data.email],
    );

    await client.query("COMMIT");
  } catch (error) {
    client.query("ROLLBACK");
    throw createError(
      500,
      "sorry,something went wrong,unable to complete actions",
    );
  }
};

export const exchangeGoogleCode = async (
  code: string,
): Promise<{
  status?: number;
  message?: string;
  access_token?: string;
  expires_in?: string;
  scope?: string;
  token_type: string;
  id_token: string;
}> => {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: "http://localhost:5176/auth/google/callback",
        grant_type: "authorization_code",
      }),
    });

    if (!res.ok) {
      const googleError = await res.json();

      console.error("Google token exchange failed:", googleError);

      throw createError(400, "Unable to authenticate with Google");
    }

    const tokens = await res.json();
    console.log("tokens from exchange", tokens);

    return tokens;
  } catch (error) {
    // console.error("Google auth error:", error);

    if (error instanceof Error && "status" in error) {
      throw error;
    }

    throw createError(500, "Sorry, something went wrong. Please try again.");
  }
};
export const getGoogleUser = async (accessToken: string) => {
  try {
    const res = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    console.log(res);

    if (!res.ok) throw createError(res.status, `userinfo failed`);
    return await res.json();
  } catch (error) {
    // const err = error as { message: string };
    // console.log("error", err.message);
    if (error instanceof Error && "status" in error) {
      throw error;
    }

    throw createError(500, "unable to complete operation");
  }
};
