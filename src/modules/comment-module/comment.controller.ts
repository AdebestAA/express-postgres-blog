import { Request, Response } from "express";
import { createCommentType } from "../../validations/schemas";
import { addComment } from "./comment.services";

export const createCommentController = async (
  req: Request<{}, {}, createCommentType>,
  res: Response,
) => {
  try {
    await addComment({
      email: req.user?.email as string,
      post_id: req.body.post_id,
      comment: req.body.comment,
    });
    res.json({ success: true, message: "comment added successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "something went wrong",
    });
  }
};
