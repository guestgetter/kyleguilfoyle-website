// Function to format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// Function to create a valid slug if one doesn't exist
const getValidSlug = (post) => {
    // If slug is empty or undefined, generate one from the title
    if (!post.slug || post.slug.trim() === '') {
        // Convert title to lowercase, replace spaces with hyphens, remove special chars
        return post.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
    }
    return post.slug;
};

// Function to create thought card HTML
const createThoughtCard = (post) => {
    const slug = getValidSlug(post);
    return `
        <article class="thought-card">
            <div class="thought-date">${formatDate(post.date)}</div>
            <h3 class="thought-title">${post.title}</h3>
            <div class="thought-excerpt">${post.excerpt}</div>
            <a href="thoughts/${slug}.html" class="thought-link">Read More →</a>
        </article>
    `;
};

// Function to load thoughts
async function loadThoughts() {
    try {
        // Determine if we're on the archive page
        const isArchivePage = window.location.pathname.includes('thoughts.html');
        
        const response = await fetch('thoughts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let posts = Array.isArray(data) ? data : (data.thoughts || []); // Handle both array and object formats
        
        // Filter out posts without titles
        posts = posts.filter(post => post.title && post.title.trim() !== '');
        
        // Sort posts by date
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // If not on archive page, only show first 3 posts
        if (!isArchivePage) {
            posts = posts.slice(0, 3);
        }
        
        const thoughtsGrid = document.querySelector('.thoughts-grid');
        if (thoughtsGrid) {
            thoughtsGrid.innerHTML = posts.map(post => createThoughtCard(post)).join('');
        } else {
            console.error('Could not find .thoughts-grid element');
        }
    } catch (error) {
        console.error('Error loading thoughts:', error);
        // Display error message to user
        const thoughtsGrid = document.querySelector('.thoughts-grid');
        if (thoughtsGrid) {
            thoughtsGrid.innerHTML = '<p>Sorry, there was an error loading the thoughts. Please try again later.</p>';
        }
    }
}

// Load thoughts when the page loads
document.addEventListener('DOMContentLoaded', loadThoughts); 