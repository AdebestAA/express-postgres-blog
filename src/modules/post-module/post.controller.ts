import { Request, Response } from "express";
import { createPostType } from "../../validations/schemas";
import { addPostToDb, editPostService } from "./post.services";
import pool from "../../configs/init-db";

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
  req: Request<{}, {}, createPostType>,
  res: Response,
) => {
  // SELECT * FROM posts JOIN comments ON posts.id = comments.post_id
  try {
    const result = await pool.query(
      `
     SELECT posts.id AS post_id,posts.content AS posts_contents,posts.created_at AS post_created_at, comments.id AS comment_id,comments.comment AS comment_content, comments.created_at AS comment_created_at,users.id AS post_creator_id,users.email AS post_creator FROM posts  JOIN comments ON posts.id = comments.post_id 
      `,
    );
    //  SELECT posts.id,posts.content,posts.user_id , json_agg(
    //       json_build_object(
    //       'id',comments.id,
    //       'comment',comments.comment,
    //       'created_at',comments.created_at
    //       )
    //       ) AS
    //         comments FROM posts
    //        JOIN comments ON posts.id = comments.post_id
    //        GROUP BY posts.id
    res.json({ success: true, data: result.rows });
  } catch (error) {
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
