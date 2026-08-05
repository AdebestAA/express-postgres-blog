import { Request, Response } from "express";
import {
  emailVerifyType,
  forgotPasswordDataType,
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
  sendVerificationToken,
  signInCheck,
  updateUserPasswordAndGetRidOfUserDataInOtpTable,
} from "./auth.service";
import { nodeEnvironment, refreshTokenSecret } from "../../constants";
import jwt from "jsonwebtoken";
import { redisClient } from "../../configs/redis-config";
import { createError } from "../../util/create-error";
import pool from "../../configs/init-db";
import { success } from "zod";

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
    await addUserOtpToOtpTable(req.body.email, otp);

    // Send OTP
    await sendVerificationToken(req.body.email, otp.toString());

    res.json({ success: true, message: "an email has been sent to you" });
  } catch (error) {
    console.log(error, "error message");

    const message =
      error instanceof Error ? error.message : "something went wrong";
    res.status(500).json({ status: false, message });
  }
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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
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
    console.log(error, "error message");

    const message =
      error instanceof Error ? error.message : "something went wrong";
    res.status(500).json({ status: false, message });
  }
};

// refresh
export const refreshTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  try {
    if (!refreshToken) {
      return res.status(403).json({ success: false, message: "Logout" });
    }
    const verifyToken = jwt.verify(refreshToken, refreshTokenSecret) as
      | { userEmail: string; userSession: string }
      | undefined;

    if (!verifyToken) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // check if sessionId is present in redis

    // const getSessionId = await redisClient.get(
    //   `refresh:${verifyToken.userSession}`,
    // );

    // console.log(getSessionId, "redis user data");
    // ( if session id is not present then force logout)
    // if (!getSessionId) {
    //   return res.status(401).json({ success: false, message: "Logout" });
    // }

    // now generate new access token

    const accessToken = await createAccessToken(verifyToken.userEmail);

    console.log("verify token", verifyToken);

    return res.status(201).json({
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
    console.log("verify token", verifyToken);

    // now delete the user session from redis

    const del = await redisClient.del(`refresh:${verifyToken.userSession}`);

    // clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: nodeEnvironment === "production",
      sameSite: "strict",
      path: "/",
    });
    console.log("del", del);

    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
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
  const sendEmail = sendVerificationToken(email, otp, "password_reset");
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
