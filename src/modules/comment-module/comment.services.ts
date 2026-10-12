import pool from "../../configs/init-db";
import { createError, getErrorStatus, pgErrorStatus } from "../../util/create-error";

export const addComment = async ({
  email,
  post_id,
  comment,
}: {
  email: string;
  post_id: string;
  comment: string;
}) => {
  try {
    // get user form db
    const getUserDetailFromDb = await pool.query(
      `
        SELECT u.id,u.email FROM users u WHERE email = $1 
        `,
      [email],
    );

    // if users is not seens
    if (getUserDetailFromDb.rows.length < 1) {
      throw createError(404, "user doesn't exist");
    }

    const userData: { email: string; id: string } = getUserDetailFromDb.rows[0];
    // add comment to comment table
    await pool.query(
      `
    
    INSERT INTO comments(post_id,comment,user_id,user_email)
    VALUES($1,$2,$3,$4)
    `,
      [post_id, comment, userData.id, userData.email],
    );
  } catch (error) {
    const pgCode =
      typeof error === "object" && error !== null
        ? (error as { code?: string }).code
        : undefined;

    // 23503 here means the post_id doesn't exist (comments.post_id FK), not the user
    if (pgErrorStatus(pgCode)) {
      throw createError(404, "post not found");
    }

    // Preserve any status thrown via createError above
    if (getErrorStatus(error, 500) !== 500) throw error as Error;

    throw createError(500, "something went wrong");
  }
};
