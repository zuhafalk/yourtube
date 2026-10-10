require("dotenv/config");
const { Client } = require("pg");

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  await client.query(`
    DELETE FROM "comment"
    WHERE "id" = 'f90735b7-f33e-4c73-ba43-056ec5634b00'
  `);

  console.log("Older duplicate comment deleted.");

  await client.end();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
