import express from "express";
import { createCommentValidationMiddleWare } from "../../middlewares/validatation.middle";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createCommentController } from "./comment.controller";

const commentRoute = express.Router();

commentRoute.post(
  "/comments",
  createCommentValidationMiddleWare,
  authMiddleware,
  createCommentController,
);

export default commentRoute;
