// netlify/functions/get-blog-posts.js

const postgres = require('postgres');

exports.handler = async function(event, context) {
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Fetch all fields, including the new 'content' field
    const posts = await sql`
      SELECT id, title, excerpt, image_url, slug, content 
      FROM blog_posts 
      ORDER BY created_at DESC 
      LIMIT 3
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posts),
    };
  } catch (err) {
    console.error('Error fetching from database:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch blog posts' }),
    };
  }
};