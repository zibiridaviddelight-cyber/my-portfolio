const postgres = require('postgres');
const bcrypt = require('bcryptjs');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { fullname, email, password } = JSON.parse(event.body);

  // Basic validation
  if (!fullname || !email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'All fields are required.' }) };
  }

  const sql = postgres(process.env.DATABASE_URL, { ssl: { rejectUnauthorized: false } });

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert the new client into the database
    await sql`
      INSERT INTO clients (full_name, email, password_hash)
      VALUES (${fullname}, ${email}, ${password_hash})
    `;

    return {
      statusCode: 201, // 201 Created
      body: JSON.stringify({ message: 'Account created successfully!' }),
    };
  } catch (err) {
    // Handle potential duplicate email error
    if (err.code === '23505') { // Unique constraint violation
      return { statusCode: 409, body: JSON.stringify({ error: 'An account with this email already exists.' }) };
    }
    console.error('Database error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not create account.' }) };
  }
};
