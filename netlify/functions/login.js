const postgres = require('postgres');
const bcrypt = require('bcryptjs');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email and password are required.' }) };
  }

  const sql = postgres(process.env.DATABASE_URL, { ssl: { rejectUnauthorized: false } });

  try {
    const clients = await sql`
      SELECT id, full_name, password_hash FROM clients WHERE email = ${email}
    `;

    if (clients.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials.' }) };
    }

    const client = clients[0];
    const passwordMatch = await bcrypt.compare(password, client.password_hash);

    if (!passwordMatch) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials.' }) };
    }

    // On successful login, return the client's name
    return {
      statusCode: 200,
      body: JSON.stringify({ fullName: client.full_name }),
    };
  } catch (err) {
    console.error('Database error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'An error occurred during login.' }) };
  }
};