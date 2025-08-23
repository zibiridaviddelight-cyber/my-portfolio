const postgres = require('postgres');

exports.handler = async function(event, context) {
  // In a real application, you would add authentication here to ensure only admins can access this.
  // For now, we will keep it open for simplicity.

  const sql = postgres(process.env.DATABASE_URL, { ssl: { rejectUnauthorized: false } });

  try {
    const clients = await sql`
      SELECT full_name, email, is_verified, created_at 
      FROM clients 
      WHERE is_admin = FALSE
      ORDER BY created_at DESC
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clients),
    };
  } catch (err) {
    console.error('Database error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch client data' }),
    };
  }
};
