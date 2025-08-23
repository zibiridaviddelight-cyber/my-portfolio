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
      SELECT id, full_name, password_hash, is_admin FROM clients WHERE email = ${email}
    `;

    if (clients.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials.' }) };
    }

    const client = clients[0];
    
    // Crucial check: Ensure the user is an admin
    if (!client.is_admin) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Access denied. Administrator privileges required.' }) };
    }

    const passwordMatch = await bcrypt.compare(password, client.password_hash);

    if (!passwordMatch) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials.' }) };
    }

    // On successful login, return a success message
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Admin login successful.' }),
    };
  } catch (err) {
    console.error('Database error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'An error occurred during login.' }) };
  }
};
