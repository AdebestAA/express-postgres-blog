import { Request, Response } from "express";
import { createPostType } from "../../validations/schemas";
import { addPostToDb, editPostService } from "./post.services";
import pool from "../../configs/init-db";
import { queryParamType } from "../../util/types";

export const createPostController = async (
  req: Request<{}, {}, createPostType>,
  res: Response,
) => {
  try {
    await addPostToDb({
      content: req.body.content,
      email: req.user?.email as string,
    });

    res.json({ success: true, message: "post added successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "something went wrong",
    });
  }
};
export const getAllPosts = async (
  req: Request<{}, {}, {}, queryParamType>,
  res: Response,
) => {
  const queryParams = req.query;
  try {
    console.log("query params", queryParams);

    const result = await pool.query(
      `
    SELECT p.user_email,p.content,p.created_at,p.id,COUNT(c.id) AS comment_count FROM posts p LEFT JOIN comments c ON c.post_id = p.id GROUP BY p.user_email,p.content,p.created_at,p.id 
      `,
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.log("failed");
    console.log(
      error instanceof Error ? error.message : "something went wrong",
    );

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "something went wrong",
    });
  }
};

export const editPost = async (
  req: Request<{ id: string }, {}, { content: string }>,
  res: Response,
) => {
  const data = {
    post_id: req.params.id,
    content: req.body.content,
    email: req.user?.email as string,
  };

  try {
    await editPostService(data);

    res.json({ success: true, message: "post edited" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "something went wrong",
    });
  }
};
