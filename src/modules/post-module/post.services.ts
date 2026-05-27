
import pool from "../../configs/init-db";


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

    // if users is not seens
    if (getUserDetailFromDb.rows.length < 0) {
      throw new Error("sorry something went wrong");
    }

    const userData: { email: string; id: string } = getUserDetailFromDb.rows[0];

    // now add user content
    await pool.query(
      `
            INSERT INTO posts(user_id,content)
            VALUES($1,$2)
            `,
      [userData.id, content],
    );
  } catch (error: unknown) {
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

    console.log(result);

    console.log("success");
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
