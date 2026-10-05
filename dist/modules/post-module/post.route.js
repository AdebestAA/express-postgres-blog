"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const post_controller_1 = require("./post.controller");
const validatation_middle_1 = require("../../middlewares/validatation.middle");
const schemas_1 = require("../../validations/schemas");
const async_handler_1 = require("../../util/async-handler");
const postRoute = express_1.default.Router();
// create post
postRoute.post("/posts", validatation_middle_1.createPostValidationMiddleWare, auth_middleware_1.authMiddleware, post_controller_1.createPostController);
// get post
postRoute.get("/posts", auth_middleware_1.authMiddleware, post_controller_1.getAllPosts);
postRoute.get("/posts/:id", auth_middleware_1.authMiddleware, (0, async_handler_1.asyncHandler)(post_controller_1.getPostByIdController));
// edit post
postRoute.patch("/posts/:id", validatation_middle_1.editPostValidation, auth_middleware_1.authMiddleware, post_controller_1.editPost);
// post likes
postRoute.post("/posts/likes/:id", auth_middleware_1.authMiddleware, (0, validatation_middle_1.validate)({ paramsSchema: schemas_1.paramSchema }), post_controller_1.postLikesController);
exports.default = postRoute;
