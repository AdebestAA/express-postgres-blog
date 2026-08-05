import express from "express";
import {
  emailVerifyValidationMiddleWare,
  signinValidationMiddleWare,
  validate,
  validationMiddleWare,
} from "../../middlewares/validatation.middle";
import {
  forgotPassword,
  logOutController,
  refreshTokenController,
  resetPasswordController,
  signInController,
  signUpController,
  verifyEmailController,
} from "./auth.controller";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validations/schemas";
import { asyncHandler } from "../../util/async-handler";

const authRoute = express.Router();
// sign in
authRoute.post("/signin", signinValidationMiddleWare, signInController);
// signup;
authRoute.post("/register", validationMiddleWare, signUpController);
// email verify
authRoute.post(
  "/email-verify",
  emailVerifyValidationMiddleWare,
  verifyEmailController,
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
