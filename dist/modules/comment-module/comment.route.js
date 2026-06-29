"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validatation_middle_1 = require("../../middlewares/validatation.middle");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const comment_controller_1 = require("./comment.controller");
const commentRoute = express_1.default.Router();
commentRoute.post("/comments", validatation_middle_1.createCommentValidationMiddleWare, auth_middleware_1.authMiddleware, comment_controller_1.createCommentController);
exports.default = commentRoute;
