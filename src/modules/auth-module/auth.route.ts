import express from "express";
import {
  emailVerifyValidationMiddleWare,
  signinValidationMiddleWare,
  validationMiddleWare,
} from "../../middlewares/validatation.middle";
import {
  signInController,
  signUpController,
  verifyEmailController,
} from "./auth.controller";

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

export default authRoute;
