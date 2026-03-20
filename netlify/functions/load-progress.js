const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const user_id = event.queryStringParameters && event.queryStringParameters.user_id;
    if (!user_id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing user_id" }) };
    }

    const result = await pool.query(
      `SELECT data FROM progress WHERE user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: null })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: JSON.parse(result.rows[0].data) })
    };
  } catch (err) {
    console.error("load-progress error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};