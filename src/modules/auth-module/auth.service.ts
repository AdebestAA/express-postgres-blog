import { Request, Response } from "express";
import { brevo_api_key } from "../../constants";
import { signupType } from "../../validations/schemas";
import pool from "../../configs/init-db";
import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";

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
        throw new Error("Account is verifed already");
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
    const errorMsg =
      error instanceof Error ? error.message : "something went wrong";
    throw new Error(errorMsg);
  }
};
// add user otp to otp table
export const addUserOtpToOtpTable = async (email: string, token: number) => {
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
    console.log("KEY EXISTS:", !!brevo_api_key);
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevo_api_key,
        // "api-key": process.env.BREVO_API_KEY!,
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

    console.log("sent successfully", await response.json());
  } catch (error) {
    console.log("EMAIL ERROR:", error);

    throw new Error("Failed to send otp");
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
      throw new Error("user does not exsit");
    }
    // chekc if password is correct
    const comparePassword = await bcrypt.compare(
      password,
      result.rows[0].password,
    );

    if (!comparePassword) {
      throw new Error("invalid credentials");
    }

    // now check if user isn't verified
    if (result.rows[0].is_verified !== 1) {
      throw new Error("accout is not verified");
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : " something went wrong";
    throw new Error(errorMsg);
  }
};

export const createJwtToken = async (email: string) => {
  const generateToken = jwt.sign({ email: email }, "secret-key", {
    expiresIn: "1d",
  });

  console.log(generateToken, "generate token");

  return { email: email, token: generateToken };
};
