const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { fullname, email, password } = JSON.parse(event.body);

  if (!fullname || !email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'All fields are required.' }) };
  }

  const sql = postgres(process.env.DATABASE_URL, { ssl: { rejectUnauthorized: false } });

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const verification_token = crypto.randomBytes(32).toString('hex');

    await sql`
      INSERT INTO clients (full_name, email, password_hash, verification_token)
      VALUES (${fullname}, ${email}, ${password_hash}, ${verification_token})
    `;

    // Send verification email
    const verificationUrl = `${process.env.URL}/.netlify/functions/verify-email?token=${verification_token}`;
    const msg = {
      to: email,
      from: process.env.VERIFIED_SENDER_EMAIL,
      subject: 'Verify Your Email for Defiahnt Client Portal',
      html: `
        <p>Hello ${fullname},</p>
        <p>Thank you for signing up! Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Thanks,<br>The Defiahnt Team</p>
      `,
    };
    await sgMail.send(msg);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Account created. Please check your email to verify.' }),
    };
  } catch (err) {
    if (err.code === '23505') {
      return { statusCode: 409, body: JSON.stringify({ error: 'An account with this email already exists.' }) };
    }
    console.error('Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not create account.' }) };
  }
};
