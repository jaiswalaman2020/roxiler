require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function run() {
  const sqlFile = process.argv[2];

  if (!sqlFile) {
    console.error("Usage: node scripts/run-sql.js <sql-file-path>");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Set it in your .env file.");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), sqlFile);
  const sql = fs.readFileSync(resolvedPath, "utf-8");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    await pool.query(sql);
    console.log(`Executed ${sqlFile} successfully.`);
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Failed to execute SQL file:", error.message);
  process.exit(1);
});
