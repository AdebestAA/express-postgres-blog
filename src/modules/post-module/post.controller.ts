import { Request, Response } from "express";
import { createPostType } from "../../validations/schemas";
import {
  addPostToDb,
  editPostService,
  getPostByIdService,
} from "./post.services";
import pool from "../../configs/init-db";
import { queryParamType } from "../../util/types";
import {
  createError,
  getErrorStatus,
  pgErrorStatus,
} from "../../util/create-error";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../../configs/r2-config";

// export const createPostController = async (
//   req: Request<{}, {}, createPostType>,
//   res: Response,
// ) => {
//   try {
//     await addPostToDb({
//       content: req.body.content,
//       email: "chrisss@gmail.com",
//     });
//     // await addPostToDb({
//     //   content: req.body.content,
//     //   email: req.user?.email as string,
//     // });

//     res.json({ success: true, message: "post added successfully" });
//   } catch (error) {
//     // const err  = (error as {status:number,message:string}).status

//     const errStatusAndMessage = error as { message: string; status: number };
//     res.status(errStatusAndMessage.status || 500).json({
//       success: false,
//       message: errStatusAndMessage.message,
//     });
//   }
// };

export const createPostController = async (
  req: Request<{}, {}, createPostType>,
  res: Response,
) => {
  const imagesArray = Array.isArray(req.files) ? req.files : [];
  const imageUrls = [];

  // add post to db
  const returnedRes = await addPostToDb({
    content: req.body.content,
    email: req.user?.email!,
  });

  if (
    returnedRes &&
    returnedRes.id &&
    returnedRes.user_id &&
    imagesArray.length > 0
  ) {
    try {
      for (let i = 0; i < imagesArray.length; i++) {
        const file = imagesArray[i];

        const key = `${crypto.randomUUID()}-${file?.originalname}`;

        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await r2.send(command);

        const url = `${process.env.R2_PUBLIC_URL}/${key}`;
        imageUrls.push(url);
        await pool.query(
          `INSERT INTO post_images(post_id,user_id,url)
            VALUES($1,$2,$3)
            `,
          [returnedRes.id, returnedRes.user_id, url],
        );
      }

      console.log(imageUrls);

      return res.json({
        success: true,
        message: "image successfully uploaded",
        images: imageUrls,
        // files: req.files,
      });
    } catch (error) {
      console.error("Post image attach failed", {
        postId: returnedRes.id,
        reason: error instanceof Error ? error.message : String(error),
      });
      return res.json({
        success: true,
      });

      // createError()
      // if (error instanceof Error) {
      //   return res.status(500).json({ success: false, message: error.message });
      // } else {
      //   return res
      //     .status(500)
      //     .json({ success: false, message: "something went wrong" });
      // }
    }
  }

  // now handle images uplaod

  return res.json({ success: true });
};

export const getAllPosts = async (
  req: Request<{}, {}, {}, queryParamType>,
  res: Response,
) => {
  const queryParams = req.query;

  const whereConditions: string[] = [];
  const paginationConditions: string[] = [];
  let values = [];

  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.items_per_page) || 10;

  const offset = (Number(page) - 1) * limit;

  values.push(limit);
  paginationConditions.push(`LIMIT $${values.length}`);
  values.push(offset);
  paginationConditions.push(`OFFSET $${values.length}`);

  if (queryParams.start_date && queryParams.end_date) {
    values.push(queryParams.start_date);
    whereConditions.push(` WHERE p.created_at >= $${values.length}`);
    values.push(queryParams.end_date);
    whereConditions.push(`AND p.created_at <= $${values.length}`);
  }

  try {
    const getUserId = await pool.query(
      `SELECT u.id FROM users u WHERE u.email = $1`,
      [req.user?.email!],
    );

    values.push(getUserId.rows[0]?.id ?? null);

    const result = await pool.query(
      `
SELECT p.id,p.content,p.created_at,u.nickname,COALESCE(c.comment_count,0) AS comments_count,COALESCE(likes_count,0) AS likes_count, COALESCE((SELECT json_agg(pi.url ORDER BY pi.created_at) FROM post_images pi WHERE pi.post_id = p.id), '[]') AS images, COUNT(*) OVER() as total_posts_count, EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $${values.length} AND l.post_id = p.id ) AS liked_by_me FROM posts p 
  LEFT JOIN (SELECT post_id,COUNT(*) AS comment_count 
  FROM comments GROUP BY post_id) c ON p.id = c.post_id 
  LEFT JOIN (SELECT post_id,COUNT(*) AS likes_count 
  FROM likes GROUP BY post_id) l ON p.id = l.post_id LEFT JOIN users u ON u.id = p.user_id  ${whereConditions.join(" ")} ORDER BY p.created_at DESC ${paginationConditions.join(" ")} 
      `,
      values,
    );

    const mapThrough = result.rows.map((item) => {
      const { total_posts_count, ...rest } = item;
      return rest;
    });
    return res.json({
      success: true,
      count: Number(result.rows[0]?.total_posts_count ?? 0),
      data: mapThrough,
    });
    // THIS ALSO WORKED AND RETURN SAME RESULT AS ABOVE BUT I PREFER THE ABOVE ONE BETTER
    // const result = await pool.query(
    //   `
    // SELECT p.user_email,p.content,p.created_at,p.id,COUNT(c.id) AS comment_count , COUNT(DISTINCT(l.id)) AS likes_count
    // FROM posts p LEFT JOIN comments c ON c.post_id = p.id LEFT JOIN likes l ON p.id = l.post_id
    // GROUP BY p.user_email,p.content,p.created_at,p.id
    //   `,
    // );
  } catch (error) {
    const pgCode =
      typeof error === "object" && error !== null
        ? (error as { code?: string }).code
        : undefined;

    console.log("and error occured");

    res.status(getErrorStatus(error, pgErrorStatus(pgCode) ?? 500)).json({
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
    res.status(getErrorStatus(error)).json({
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
        .status(404)
        .json({ success: false, message: "user doesn't exist" });
    }
    const id = response.rows[0].id;

    // toggle: if already liked -> unlike, else -> like
    const existing = await pool.query(
      `SELECT id FROM likes WHERE user_id = $1 AND post_id = $2`,
      [id, postId],
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
        [id, postId],
      );
      return res.status(200).json({ success: true, liked: false });
    }

    try {
      await pool.query(
        `
      INSERT INTO likes(user_id,post_id)
      VALUES($1,$2)
      `,
        [id, postId],
      );
    } catch (insertError) {
      const insertPgCode =
        typeof insertError === "object" && insertError !== null
          ? (insertError as { code?: string }).code
          : undefined;
      // race: two requests passed the SELECT at the same time,
      // unique constraint stopped the double-insert -> treat as liked
      if (insertPgCode === "23505") {
        return res.status(200).json({ success: true, liked: true });
      }
      throw insertError;
    }

    return res.status(200).json({ success: true, liked: true });
  } catch (error) {
    const pgCode =
      typeof error === "object" && error !== null
        ? (error as { code?: string }).code
        : undefined;

    res.status(getErrorStatus(error, pgErrorStatus(pgCode) ?? 500)).json({
      success: false,
      message: error instanceof Error ? error.message : "something went wrong",
    });
  }
};

export const getPostByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const post = await getPostByIdService(req.params.id);
  res.json({ success: true, data: post });
};
