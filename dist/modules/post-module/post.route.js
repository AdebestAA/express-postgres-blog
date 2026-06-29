"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const post_controller_1 = require("./post.controller");
const validatation_middle_1 = require("../../middlewares/validatation.middle");
const postRoute = express_1.default.Router();
// create post
postRoute.post("/posts", validatation_middle_1.createPostValidationMiddleWare, auth_middleware_1.authMiddleware, post_controller_1.createPostController);
// get post
postRoute.get("/posts", auth_middleware_1.authMiddleware, post_controller_1.getAllPosts);
// edit post
postRoute.patch("/posts/:id", validatation_middle_1.editPostValidation, auth_middleware_1.authMiddleware, post_controller_1.editPost);
exports.default = postRoute;
