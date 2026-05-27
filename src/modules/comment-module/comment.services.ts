import pool from "../../configs/init-db";

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
    if (getUserDetailFromDb.rows.length < 0) {
      throw new Error("sorry something went wrong");
    }

    const userData: { email: string; id: string } = getUserDetailFromDb.rows[0];
    // add comment to comment table
    await pool.query(
      `
    
    INSERT INTO comments(post_id,comment,user_id)
    VALUES($1,$2,$3)
    `,
      [post_id, comment, userData.id],
    );
  } catch (error) {
    // console.log(error);

    if (typeof error === "object" && error !== null) {
      const err = error as { code?: string; message?: string };

      if (err.code === "23503") {
        throw new Error("user doesn't exist");
      }
    }
    const errorMsg =
      error instanceof Error ? error.message : "something went wrong";
    throw new Error(errorMsg);
  }
};
