import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createPostController, editPost, getAllPosts } from "./post.controller";
import {
  createPostValidationMiddleWare,
  editPostValidation,
} from "../../middlewares/validatation.middle";

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

export default postRoute;
