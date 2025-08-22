const postgres = require('postgres');

exports.handler = async function(event, context) {
  const { token } = event.queryStringParameters;

  if (!token) {
    return { statusCode: 400, body: 'Missing verification token.' };
  }

  const sql = postgres(process.env.DATABASE_URL, { ssl: { rejectUnauthorized: false } });

  try {
    const result = await sql`
      UPDATE clients
      SET is_verified = TRUE, verification_token = NULL
      WHERE verification_token = ${token}
      RETURNING id
    `;

    if (result.length === 0) {
      return { statusCode: 400, body: 'Invalid or expired verification token.' };
    }

    // Redirect to a success page
    return {
      statusCode: 302,
      headers: {
        Location: '/verified.html',
      },
    };
  } catch (err) {
    console.error('Database error:', err);
    return { statusCode: 500, body: 'An error occurred during verification.' };
  }
};