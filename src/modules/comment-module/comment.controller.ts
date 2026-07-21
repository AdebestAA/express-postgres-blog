import { Request, Response } from "express";
import { createCommentType } from "../../validations/schemas";
import { addComment } from "./comment.services";
import { success } from "zod";
import pool from "../../configs/init-db";

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
export const getCommentsForPostsController = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: "bad request" });
    }

    const result = await pool.query(
      `
      SELECT * FROM comments WHERE comments.post_id = $1
      `,
      [req.params.id],
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "something went wrong",
    });
  }
};
