import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
});

export const withTransaction = async <T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
