import { Request, Response } from "express";
import {
  emailVerifyType,
  forgotPasswordDataType,
  googleAuthDataType,
  resetPasswordDataType,
  signupType,
} from "../../validations/schemas";
import { generateOtp } from "../../helpers/generate-otp";
import {
  addUserOtpToOtpTable,
  addUserToDb,
  checkIfOtpIsValidAndNotExpiredAndUserExist,
  checkOtpValidity,
  createAccessToken,
  createRefreshToken,
  exchangeGoogleCode,
  getGoogleUser,
  sendVerificationToken,
  signInCheck,
  updateUserPasswordAndGetRidOfUserDataInOtpTable,
} from "./auth.service";
import { nodeEnvironment, refreshTokenSecret } from "../../constants";
import jwt from "jsonwebtoken";
import { redisClient } from "../../configs/redis-config";
import { createError } from "../../util/create-error";
import pool from "../../configs/init-db";
import { googleData } from "../../types";

export const signUpController = async (
  req: Request<{}, {}, signupType>,
  res: Response,
) => {
  // generate 6 OTP
  const otp = generateOtp();

  try {
    // Add user to db
    await addUserToDb(req.body);

    // add user otp to otp table
    await addUserOtpToOtpTable(req.body.email, otp.toString());

    // Send OTP
    await sendVerificationToken(req.body.email, otp.toString());

    res.json({ success: true, message: "an email has been sent to you" });
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status: number }).status
        : 500;

    const message =
      error instanceof Error ? error.message : "something went wrong";

    res.status(status).json({ success: false, message });
  }
};

export const googleAuthController = async (
  req: Request<{}, {}, googleAuthDataType>,
  res: Response,
) => {
  // For local testing, pass a Google OAuth access token as `token` in the body.
  // The browser Google flow sends an authorization `code` instead — wiring that
  // up properly means calling exchangeGoogleCode(req.body.code) here, since the
  // client secret must never leave the server.
  const getData: googleData = await getGoogleUser(req.body.token);

  return res.json({ success: true, data: { ...getData } });
};

// verify email controller
export const verifyEmailController = async (
  req: Request<{}, {}, emailVerifyType>,
  res: Response,
) => {
  const { email, otp } = req.body;

  try {
    //   check otp validity service

    await checkOtpValidity(req.body);
    res.json({ success: true, message: "email verified" });
  } catch (error) {
    console.log(error, "error message");

    const message =
      error instanceof Error ? error.message : "something went wrong";
    res.status(500).json({ status: false, message });
  }
};
// verify email controller
export const signInController = async (
  req: Request<{}, {}, signupType>,
  res: Response,
) => {
  try {
    await signInCheck(req.body);

    // access token
    const accessToken = await createAccessToken(req.body.email);
    // refreshtoken
    const refreshToken = await createRefreshToken(req.body.email);

    // set reresh token, as http only cookie
    // In production the frontend (Vercel) and this API are cross-site, so the
    // browser will not attach a `strict` cookie — it must be "none" (+ Secure,
    // which browsers require alongside SameSite=None).
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: nodeEnvironment === "production" ? "none" : "strict",
      secure: nodeEnvironment === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // console.log(accessToken);

    return res.json({
      success: true,
      data: { email: req.body.email, token: accessToken },
    });
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status: number }).status
        : 500;
    const message =
      error instanceof Error ? error.message : "something went wrong";
    res.status(status).json({ success: false, message });
  }
};

// refresh
export const refreshTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  try {
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Logout" });
    }
    const verifyToken = jwt.verify(refreshToken, refreshTokenSecret) as
      | { userEmail: string; userSession: string }
      | undefined;

    if (!verifyToken) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    // check if sessionId is present in redis

    const getSessionId = await redisClient.get(
      `refresh:${verifyToken.userSession}`,
    );

    // ( if session id is not present then force logout)
    if (!getSessionId) {
      return res.status(401).json({ success: false, message: "Logout" });
    }

    // now generate new access token

    const accessToken = await createAccessToken(verifyToken.userEmail);

    return res.status(200).json({
      success: true,
      data: { email: verifyToken.userEmail, token: accessToken },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
};

export const logOutController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  // Attributes MUST match the ones used in res.cookie above, otherwise the
  // browser won't match and remove the cookie.
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: nodeEnvironment === "production",
    sameSite: nodeEnvironment === "production" ? "none" : "strict",
    path: "/",
  });

  if (!refreshToken) {
    return res.status(200).json({ success: true });
  }

  try {
    const verifyToken = jwt.verify(refreshToken, refreshTokenSecret) as
      | { userEmail: string; userSession: string }
      | undefined;

    if (!verifyToken) {
      return res.status(200).json({ success: true });
    }

    await redisClient.del(`refresh:${verifyToken.userSession}`);

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(200).json({ success: true });
  }
};

// Forgot Password

export const forgotPassword = async (
  req: Request<{}, {}, forgotPasswordDataType>,
  res: Response,
) => {
  const email = req.body.email;

  // now check for email exist
  const checkEmailExist = await pool.query(
    `SELECT u.email FROM users u WHERE u.email = $1`,
    [email],
  );
  // GET OTP
  const otp = generateOtp().toString();
  // SEND VERIFCATION EMAIL
  const sendEmail = sendVerificationToken(
    email,
    otp.toString(),
    "password_reset",
  );
  if (checkEmailExist.rows.length < 1) {
    throw createError(404, "emails doesn't exist");
  }

  const checkEmailExistData: { email: string } = checkEmailExist.rows[0];

  // if email sends succeeds then add code to the otp table
  await pool.query(
    `
    INSERT INTO otp(email,token,expiry_time)
    VALUES($1,$2,NOW() + INTERVAL '10 minutes')
ON CONFLICT(email)
DO UPDATE
SET 
token = EXCLUDED.token,
expiry_time = NOW() + INTERVAL '10 minutes'
      `,
    [email, otp],
  );

  // console.log(checkEmailExist);

  return res.json({ success: true, message: "email sent " });
};

export const resetPasswordController = async (
  req: Request<{}, {}, resetPasswordDataType>,
  res: Response,
) => {
  const data = req.body;

  await checkIfOtpIsValidAndNotExpiredAndUserExist({
    email: data.email,
    code: data.otp,
  });

  // now update the password with the incoming new password and also get rid of user data in the otp table

  await updateUserPasswordAndGetRidOfUserDataInOtpTable(data);

  return res.status(200).json({ success: true });
};
