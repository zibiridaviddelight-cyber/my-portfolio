// Store posts data globally to be accessible by the modal function
let blogPostsData = [];

// --- Modal Elements ---
const modalOverlay = document.getElementById('blog-modal-overlay');
const modal = document.getElementById('blog-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalContent = document.getElementById('modal-content');

// --- Functions to control the modal ---
function openModal() {
    modalOverlay.classList.remove('hidden');
    modal.classList.remove('hidden');
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    modal.classList.add('hidden');
}

// --- Event Listeners for closing the modal ---
modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);


// Function to fetch blog posts and render them
async function loadBlogPosts() {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;

  try {
    const response = await fetch('/.netlify/functions/get-blog-posts');
    if (!response.ok) throw new Error('Network response was not ok');
    
    blogPostsData = await response.json(); // Store data globally

    blogGrid.innerHTML = '';

    if (blogPostsData.length === 0) {
      blogGrid.innerHTML = '<p class="text-gray-400 col-span-3 text-center">No blog posts found.</p>';
      return;
    }

    blogPostsData.forEach((post, index) => {
      const postCard = `
        <div class="blog-card p-0 overflow-hidden" data-aos="fade-up">
          <img src="${post.image_url}" alt="Blog post image for ${post.title}" class="w-full h-48 object-cover">
          <div class="p-8">
            <h3 class="text-xl font-bold mb-2">${post.title}</h3>
            <p class="text-gray-400 mb-4">${post.excerpt}</p>
            <a href="#" class="read-more-btn font-bold text-indigo-400 hover:text-indigo-300" data-index="${index}">Read More &rarr;</a>
          </div>
        </div>
      `;
      blogGrid.insertAdjacentHTML('beforeend', postCard);
    });

    // Add event listeners to the new "Read More" buttons
    document.querySelectorAll('.read-more-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const postIndex = e.target.dataset.index;
            const post = blogPostsData[postIndex];
            
            // Populate and open the modal
            modalTitle.textContent = post.title;
            modalImage.src = post.image_url;
            // Note: For security, you might want to sanitize this HTML if it comes from untrusted sources.
            // For now, we assume you trust your own database content.
            modalContent.innerHTML = post.content; 
            openModal();
        });
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