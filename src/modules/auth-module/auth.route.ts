import express from "express";
import {
  emailVerifyValidationMiddleWare,
  signinValidationMiddleWare,
  validate,
  validationMiddleWare,
} from "../../middlewares/validatation.middle";
import {
  forgotPassword,
  googleAuthController,
  logOutController,
  refreshTokenController,
  resendVerificationController,
  resetPasswordController,
  signInController,
  signUpController,
  verifyEmailController,
} from "./auth.controller";
import {
  forgotPasswordSchema,
  googleAuthSchema,
  resetPasswordSchema,
} from "../../validations/schemas";
import { asyncHandler } from "../../util/async-handler";

const authRoute = express.Router();
// sign in
authRoute.post("/signin", signinValidationMiddleWare, signInController);
// google signup
authRoute.post(
  "/google",
  validate({ bodySchema: googleAuthSchema }),
  googleAuthController,
);
// signup;
authRoute.post("/register", validationMiddleWare, signUpController);
// email verify
authRoute.post(
  "/email-verify",
  emailVerifyValidationMiddleWare,
  verifyEmailController,
);
// resend signup verification code
authRoute.post(
  "/resend-verification",
  validate({ bodySchema: forgotPasswordSchema }),
  asyncHandler(resendVerificationController),
);
// refresh token
authRoute.post("/refresh", refreshTokenController);
// logout
authRoute.post("/logout", logOutController);
authRoute.post(
  "/forgot-password",
  validate({ bodySchema: forgotPasswordSchema }),
  asyncHandler(forgotPassword),
);

// reset password
authRoute.post(
  "/reset-password",
  validate({ bodySchema: resetPasswordSchema }),
  asyncHandler(resetPasswordController),
);

export default authRoute;
