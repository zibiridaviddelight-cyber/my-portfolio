// assets/js/main.js

// Function to fetch blog posts and render them
async function loadBlogPosts() {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return; // Exit if the blog grid isn't on the page

  try {
    // Fetch data from our Netlify Function endpoint
    const response = await fetch('/.netlify/functions/get-blog-posts');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const posts = await response.json();

    // Clear placeholder content
    blogGrid.innerHTML = '';

    // If no posts, show a message
    if (posts.length === 0) {
      blogGrid.innerHTML = '<p class="text-gray-400 col-span-3 text-center">No blog posts found.</p>';
      return;
    }

    // Create and append a card for each post
    posts.forEach(post => {
      const postCard = `
        <div class="blog-card p-0 overflow-hidden" data-aos="fade-up">
          <img src="${post.image_url}" alt="Blog post image for ${post.title}" class="w-full h-48 object-cover">
          <div class="p-8">
            <h3 class="text-xl font-bold mb-2">${post.title}</h3>
            <p class="text-gray-400 mb-4">${post.excerpt}</p>
            <a href="/blog/${post.slug}" class="font-bold text-indigo-400 hover:text-indigo-300">Read More &rarr;</a>
          </div>
        </div>
      `;
      blogGrid.insertAdjacentHTML('beforeend', postCard);
    });

  } catch (error) {
    console.error('Failed to load blog posts:', error);
    blogGrid.innerHTML = '<p class="text-gray-400 col-span-3 text-center">Could not load blog posts at this time.</p>';
  }
}


// --- All the other JS code remains the same ---

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true,
});

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
        if (!mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    });
});

// Load blog posts when the page content has loaded
document.addEventListener('DOMContentLoaded', loadBlogPosts);