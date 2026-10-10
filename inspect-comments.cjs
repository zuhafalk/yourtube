require("dotenv/config");
const { Client } = require("pg");

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  const result = await client.query(`
    SELECT *
    FROM "comment"
    WHERE "userId" = '66b1db50-5905-484f-ac8b-02df22540ff5'
      AND "videoId" = '9b24b88c-b652-4003-9913-063f6add50ba'
    ORDER BY "createdAt" ASC
  `);

  console.table(result.rows);

  await client.end();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
