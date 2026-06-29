"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicSchema = exports.nodeEnvironment = exports.refreshTokenSecret = exports.accessTokenSecret = exports.redisUrl = exports.brevo_api_key = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.brevo_api_key = process.env.BREVO_API_KEY;
exports.redisUrl = process.env.REDIS_URL;
exports.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
exports.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
exports.nodeEnvironment = process.env.NODE_ENV;
const dynamicSchema = (schema, data) => {
    const result = schema.safeParse(data);
    console.log(data, "data");
    if (!result.success) {
        console.log(result.error.flatten().fieldErrors, "here atleast");
        return {
            success: false,
            message: "Validation Failed",
        };
    }
    return {
        success: true,
        data: result.data,
    };
};
exports.dynamicSchema = dynamicSchema;
