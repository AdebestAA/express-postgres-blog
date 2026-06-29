"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPostSchema = exports.createCommentSchema = exports.createPostSchema = exports.emailVerifySchema = exports.signInSchema = exports.signUpSchema = void 0;
const zod_1 = __importDefault(require("zod"));
// signup schema and type
exports.signUpSchema = zod_1.default.object({
    nickname: zod_1.default
        .string()
        .min(5, { message: "nickname must be atleast 3 characters" }),
    email: zod_1.default.email({ message: "invalid email entered" }),
    password: zod_1.default
        .string()
        .min(3, { message: "password must be more than three characters" }),
});
// signin schema and type
exports.signInSchema = zod_1.default.object({
    email: zod_1.default.email({ message: "invalid email entered" }),
    password: zod_1.default
        .string()
        .min(3, { message: "password must be more than three characters" }),
});
// email verify schema and type
exports.emailVerifySchema = zod_1.default.object({
    email: zod_1.default.email({ message: "invalid email entered" }),
    otp: zod_1.default.string().length(6, { message: "password length must be string" }),
});
// create post schema
exports.createPostSchema = zod_1.default.object({
    content: zod_1.default.string({ message: "empty field" }),
    // email: z.email({ message: "email is verified" }),
});
// comment schema
exports.createCommentSchema = zod_1.default.object({
    comment: zod_1.default.string({ message: "empty field" }),
    post_id: zod_1.default.string({ message: "Post Id is required" }),
});
exports.editPostSchema = zod_1.default.object({
    content: zod_1.default.string({ message: "empty field" }),
    post_id: zod_1.default.string({ message: "param is needed" }),
});
