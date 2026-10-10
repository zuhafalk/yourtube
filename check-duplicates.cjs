require("dotenv/config");
const { Client } = require("pg");

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  const result = await client.query(`
    SELECT "userId", "videoId", COUNT(*) AS duplicate_count
    FROM "comment"
    GROUP BY "userId", "videoId"
    HAVING COUNT(*) > 1
  `);

  console.table(result.rows);

  await client.end();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
