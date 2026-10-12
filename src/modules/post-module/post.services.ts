import pool from "../../configs/init-db";

import {
  createError,
  getErrorStatus,
  pgErrorStatus,
} from "../../util/create-error";

export const addPostToDb = async ({
  content,
  email,
}: {
  content: string;
  email: string;
}): Promise<void | { id: string; user_id: string }> => {
  try {
    const getUserDetailFromDb = await pool.query(
      `
        SELECT u.id,u.email FROM users u WHERE email = $1 
        `,
      [email],
    );

    // if users is not seen
    if (getUserDetailFromDb.rows.length < 1) {
      throw createError(404, "user doesn't exists");
    }

    const userData: { email: string; id: string } = getUserDetailFromDb.rows[0];

    // now add user content
    const postRes = await pool.query(
      `
            INSERT INTO posts(user_id,content,user_email)
            VALUES($1,$2,$3) RETURNING id,user_id
            `,
      [userData.id, content, userData.email],
    );

    const resIds: { id: string; user_id: string } = postRes.rows[0];

    return resIds;
  } catch (error: unknown) {
    const pgCode =
      typeof error === "object" && error !== null
        ? (error as { code?: string }).code
        : undefined;

    const mapped = pgErrorStatus(pgCode);
    if (mapped) throw createError(mapped, "unable to add post");

    // Preserve any status thrown via createError above
    if (getErrorStatus(error, 500) !== 500) throw error as Error;

    throw createError(500, "something went wrong");
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
      throw createError(404, "user doesn't exist");
    }

    const userId: string = getUserId.rows[0].id;

    const result = await pool.query(
      `
      UPDATE posts
      SET content = $1
      WHERE id = $2 AND user_id = $3
     `,
      [content, post_id, userId],
    );

    // rowCount 0 means the post doesn't exist OR belongs to someone else
    if (result.rowCount === 0) {
      throw createError(404, "post not found or you are not authorized");
    }
  } catch (error) {
    const pgCode =
      typeof error === "object" && error !== null
        ? (error as { code?: string }).code
        : undefined;

    const mapped = pgErrorStatus(pgCode);
    if (mapped) {
      throw createError(
        mapped,
        pgCode === "22P02" ? "invalid post id" : "something went wrong",
      );
    }

    // Preserve any status thrown via createError above
    throw getErrorStatus(error, 500) !== 500
      ? (error as Error)
      : createError(500, "something went wrong");
  }
};

export const getPostByIdService = async (post_id: string) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.content, p.created_at, u.nickname,
        COALESCE((SELECT json_agg(pi.url ORDER BY pi.created_at) FROM post_images pi WHERE pi.post_id = p.id), '[]') AS images
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

    // Preserve any status thrown via createError above
    if (getErrorStatus(error, 500) !== 500) throw error as Error;

    throw createError(500, "something went wrong");
  }
};
