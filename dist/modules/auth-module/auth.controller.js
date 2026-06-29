"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logOutController = exports.refreshTokenController = exports.signInController = exports.verifyEmailController = exports.signUpController = void 0;
const generate_otp_1 = require("../../helpers/generate-otp");
const auth_service_1 = require("./auth.service");
const constants_1 = require("../../constants");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_config_1 = require("../../configs/redis-config");
const signUpController = async (req, res) => {
    // generate 6 OTP
    const otp = (0, generate_otp_1.generateOtp)();
    try {
        // Add user to db
        await (0, auth_service_1.addUserToDb)(req.body);
        // add user otp to otp table
        await (0, auth_service_1.addUserOtpToOtpTable)(req.body.email, otp);
        // Send OTP
        await (0, auth_service_1.sendVerificationToken)(req.body.email, otp.toString());
        res.json({ success: true, message: "an email has been sent to you" });
    }
    catch (error) {
        console.log(error, "error message");
        const message = error instanceof Error ? error.message : "something went wrong";
        res.status(500).json({ status: false, message });
    }
};
exports.signUpController = signUpController;
// verify email controller
const verifyEmailController = async (req, res) => {
    const { email, otp } = req.body;
    try {
        //   check otp validity service
        await (0, auth_service_1.checkOtpValidity)(req.body);
        res.json({ success: true, message: "email verified" });
    }
    catch (error) {
        console.log(error, "error message");
        const message = error instanceof Error ? error.message : "something went wrong";
        res.status(500).json({ status: false, message });
    }
};
exports.verifyEmailController = verifyEmailController;
// verify email controller
const signInController = async (req, res) => {
    try {
        await (0, auth_service_1.signInCheck)(req.body);
        // access token
        const accessToken = await (0, auth_service_1.createAccessToken)(req.body.email);
        const refreshToken = await (0, auth_service_1.createRefreshToken)(req.body.email);
        // set reresh token, as http only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: constants_1.nodeEnvironment === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
        return res.json({
            success: true,
            data: { email: req.body.email, token: accessToken },
        });
    }
    catch (error) {
        console.log(error, "error message");
        const message = error instanceof Error ? error.message : "something went wrong";
        res.status(500).json({ status: false, message });
    }
};
exports.signInController = signInController;
// refresh
const refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    try {
        if (!refreshToken) {
            return res.status(403).json({ success: false, message: "Logout" });
        }
        const verifyToken = jsonwebtoken_1.default.verify(refreshToken, constants_1.refreshTokenSecret);
        if (!verifyToken) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        // check if sessionId is present in redis
        const getSessionId = await redis_config_1.redisClient.get(`refresh:${verifyToken.userSession}`);
        console.log(getSessionId, "redis user data");
        // ( if session id is not present then force logout)
        if (!getSessionId) {
            return res.status(401).json({ success: false, message: "Logout" });
        }
        // now generate new access token
        const accessToken = await (0, auth_service_1.createAccessToken)(verifyToken.userEmail);
        console.log("verify token", verifyToken);
        return res.status(201).json({
            success: true,
            data: { email: verifyToken.userEmail, token: accessToken },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "something went wrong" });
    }
};
exports.refreshTokenController = refreshTokenController;
const logOutController = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    console.log(refreshToken);
    if (!refreshToken) {
        return res.status(200).json({ success: true });
    }
    console.log("refresh token", refreshToken);
    try {
        const verifyToken = jsonwebtoken_1.default.verify(refreshToken, constants_1.refreshTokenSecret);
        if (!verifyToken) {
            return res.status(200).json({ success: true });
        }
        console.log("verify token", verifyToken);
        // now delete the user session from redis
        const del = await redis_config_1.redisClient.del(`refresh:${verifyToken.userSession}`);
        // clear cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: constants_1.nodeEnvironment === "production",
            sameSite: "strict",
            path: "/",
        });
        console.log("del", del);
        return res.status(200).json({ success: true });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "something went wrong" });
    }
};
exports.logOutController = logOutController;
