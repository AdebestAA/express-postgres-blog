import pool from "../../configs/init-db";

import { createError } from "../../util/create-error";

export const addPostToDb = async ({
  content,
  email,
}: {
  content: string;
  email: string;
}) => {
  try {
    const getUserDetailFromDb = await pool.query(
      `
        SELECT u.id,u.email FROM users u WHERE email = $1 
        `,
      [email],
    );

    // if users is not seen
    if (getUserDetailFromDb.rows.length < 1) {
      throw createError(406, "user doesn't exists");
    }

    const userData: { email: string; id: string } = getUserDetailFromDb.rows[0];

    // now add user content
    await pool.query(
      `
            INSERT INTO posts(user_id,content,user_email)
            VALUES($1,$2,$3)
            `,
      [userData.id, content, userData.email],
    );
  } catch (error: unknown) {
    // console.log(error);

    if (typeof error === "object" && error !== null) {
      const err = error as { code?: string; message?: string };

      if (err.code === "23503") {
        throw createError(400, "user doesn't exist");
      }
    }
    const extendError = error as { message?: string; status?: number };
    if (extendError instanceof Error && "status" in extendError) {
      throw extendError;
    } else {
      const errorMsg =
        error instanceof Error ? error.message : "something went wrong";
      throw createError(500, errorMsg);
    }
  }
};

export const editPostService = async ({
  post_id,
  content,
  email,
}: {
  post_id: string;
  email: string;
  content: string;
}) => {
  try {
    const getUserId = await pool.query(
      `
      SELECT users.id  FROM users WHERE email = $1
      `,
      [email],
    );
    if (getUserId.rows.length < 1) {
      throw new Error("user doesn't exsits");
    }

    const userId: string = getUserId.rows[0].id;
    console.log(getUserId.rows[0]);
    const result = await pool.query(
      `
      UPDATE posts
      SET content = $1
      WHERE id = $2 AND user_id = $3
     `,
      [content, post_id, userId],
    );

    if (result.rowCount === 0) {
      throw new Error("post not found or unauthorized");
    }
  } catch (error) {
    console.log(error);

    if (typeof error === "object" && error !== null) {
      const err = error as { code?: string; message?: string };

      if (err.code === "23503") {
        throw new Error("user doesn't exist");
      }
      if (err.code === "22P02") {
        throw new Error("Invalid Id Format");
      }
    }
    // const errorMsg =
    //   error instanceof Error ? error.message : "something went wrong";

    // console.log("errorMsg", errorMsg);

    throw new Error("something went wrong");
  }
};

export const getPostByIdService = async (post_id: string) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.content, p.created_at, u.nickname
       FROM posts p LEFT JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [post_id],
    );
    if (result.rows.length < 1) {
      throw createError(404, "post not found");
    }
    return result.rows[0];
  } catch (error: unknown) {
    const pgCode =
      typeof error === "object" && error !== null
        ? (error as { code?: string }).code
        : undefined;
    if (pgCode === "22P02") throw createError(400, "invalid post id");
    if (error instanceof Error) throw error;
    // if (error instanceof Error && "status" in error) throw error;
    throw createError(
      500,
      error instanceof Error ? error.message : "something went wrong",
    );
  }
};
