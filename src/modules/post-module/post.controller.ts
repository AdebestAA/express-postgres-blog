import { Request, Response } from "express";
import { createPostType } from "../../validations/schemas";
import { addPostToDb, editPostService } from "./post.services";
import pool from "../../configs/init-db";
import { queryParamType } from "../../util/types";
import { success } from "zod";

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
SELECT p.id,p.content,p.created_at,u.nickname,COALESCE(c.comment_count,0) AS comments_count,COALESCE(likes_count,0) AS likes_count FROM posts p 
  LEFT JOIN (SELECT post_id,COUNT(*) AS comment_count 
  FROM comments GROUP BY post_id) c ON p.id = c.post_id 
  LEFT JOIN (SELECT post_id,COUNT(*) AS likes_count 
  FROM likes GROUP BY  post_id) l ON p.id = l.post_id LEFT JOIN users u ON u.id = p.user_id
      `,
    );
    // THIS ALSO WORKED AND RETURN SAME RESULT AS ABOVE BUT I PREFER THE ABOVE ONE BETTER
    // const result = await pool.query(
    //   `
    // SELECT p.user_email,p.content,p.created_at,p.id,COUNT(c.id) AS comment_count , COUNT(DISTINCT(l.id)) AS likes_count
    // FROM posts p LEFT JOIN comments c ON c.post_id = p.id LEFT JOIN likes l ON p.id = l.post_id
    // GROUP BY p.user_email,p.content,p.created_at,p.id
    //   `,
    // );

    console.log(result.rows);

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

export const postLikesController = async (
  req: Request<{ id: string }, {}, { content: string }>,
  res: Response,
) => {
  const postId = req.params.id;
  const userEmail = req.user?.email;
  try {
    const response = await pool.query(
      `SELECT u.id FROM users u WHERE u.email = $1 `,
      [userEmail],
    );
    if (response.rows.length < 1) {
      return res
        .status(400)
        .json({ success: false, message: "cant complete operation" });
    }
    const id = response.rows[0].id;

    await pool.query(
      `
      INSERT INTO likes(user_id,post_id)
      VALUES($1,$2)
      `,
      [id, postId],
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "something went wrong",
    });
  }
};
