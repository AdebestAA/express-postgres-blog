import { Request, Response } from "express";
import { emailVerifyType, signupType } from "../../validations/schemas";
import { generateOtp } from "../../helpers/generate-otp";
import {
  addUserOtpToOtpTable,
  addUserToDb,
  checkOtpValidity,
  createJwtToken,
  sendVerificationToken,
  signInCheck,
} from "./auth.service";
import { email, success } from "zod";

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

    const jwtTokenAssin = await createJwtToken(req.body.email);

    res.json({ success: true, data: jwtTokenAssin });
  } catch (error) {
    console.log(error, "error message");

    const message =
      error instanceof Error ? error.message : "something went wrong";
    res.status(500).json({ status: false, message });
  }
};
