import fs from "fs";
import path from "path";
import { pool, withTransaction } from "../configs/init-db";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

const migrate = async () => {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  );

  const { rows } = await pool.query("SELECT name FROM schema_migrations");
  const alreadyRun = rows.map((row) => row.name);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (alreadyRun.includes(file)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        file,
      ]);
    });

    console.log(`✔ Applied ${file}`);
  }

  console.log("✔ Database is up to date");
};

migrate()
  .catch((err) => {
    console.error("✖ Migration failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

