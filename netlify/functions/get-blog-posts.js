// netlify/functions/get-blog-posts.js

const postgres = require('postgres');

exports.handler = async function(event, context) {
  // Connect to the database using the environment variable
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: {
      rejectUnauthorized: false, // Required for Neon connections
    },
  });

  try {
    // Fetch the latest 3 blog posts
    const posts = await sql`
      SELECT id, title, excerpt, image_url, slug 
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