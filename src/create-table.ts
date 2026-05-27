import pool from "./configs/init-db";

const createUserTable = async () => {
  try {
    await pool.query(
      `
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        nickname TEXT NOT NULL,
        is_verified INT NOT NULL DEFAULT 0,
        password TEXT NOT NULL
        )`,
    );
    console.log("succssfully created the table");
  } catch (error) {
    console.log(error || "somethign went wrong");
  }
};
const createUserOtpTable = async () => {
  try {
    await pool.query(
      `
        CREATE TABLE IF NOT EXISTS otp (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        token TEXT NOT NULL,
        expiry_time TIMESTAMP WITHOUT TIME ZONE
        )`,
    );
    console.log("succssfully created the table");
  } catch (error) {
    console.log(error || "somethign went wrong");
  }
};

const postsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT,
      created_at TIMESTAMP WITH TIME ZONE
      )`);
    console.log("successful");
  } catch (error) {
    console.log(error);
  }
};
const commentsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_randoM_uuid(),
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   
      )`);
    console.log("successful");
  } catch (error) {
    console.log(error);
  }
};

// postsTable();

// createUserTable();

// createUserOtpTable();

//

commentsTable();
