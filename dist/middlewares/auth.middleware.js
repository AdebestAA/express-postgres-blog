"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../constants");
const authMiddleware = async (req, res, next) => {
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith("Bearer ")) {
        res.status(400).json({ success: false, message: "No token" });
        return;
    }
    try {
        const getToken = authToken.split(" ")[1];
        const verifyToken = jsonwebtoken_1.default.verify(getToken, constants_1.accessTokenSecret);
        req.user = { email: verifyToken.email };
        // res.json({ success: true, message: "verified" });
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
exports.authMiddleware = authMiddleware;
