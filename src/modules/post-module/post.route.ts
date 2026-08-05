import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createPostController,
  editPost,
  getAllPosts,
  postLikesController,
} from "./post.controller";
import {
  createPostValidationMiddleWare,
  editPostValidation,
  validate,
} from "../../middlewares/validatation.middle";
import { paramSchema } from "../../validations/schemas";

const postRoute = express.Router();

// create post
postRoute.post(
  "/posts",
  createPostValidationMiddleWare,
  authMiddleware,
  createPostController,
);
// get post
postRoute.get("/posts", authMiddleware, getAllPosts);

// edit post
postRoute.patch("/posts/:id", editPostValidation, authMiddleware, editPost);

// post likes
postRoute.post(
  "/posts/likes/:id",
  authMiddleware,
  validate({ paramsSchema: paramSchema }),
  postLikesController,
);

export default postRoute;
