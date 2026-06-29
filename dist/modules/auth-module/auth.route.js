"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validatation_middle_1 = require("../../middlewares/validatation.middle");
const auth_controller_1 = require("./auth.controller");
const authRoute = express_1.default.Router();
// sign in
authRoute.post("/signin", validatation_middle_1.signinValidationMiddleWare, auth_controller_1.signInController);
// signup;
authRoute.post("/register", validatation_middle_1.validationMiddleWare, auth_controller_1.signUpController);
// email verify
authRoute.post("/email-verify", validatation_middle_1.emailVerifyValidationMiddleWare, auth_controller_1.verifyEmailController);
// refresh token
authRoute.post("/refresh", auth_controller_1.refreshTokenController);
// logout
authRoute.post("/logout", auth_controller_1.logOutController);
exports.default = authRoute;
