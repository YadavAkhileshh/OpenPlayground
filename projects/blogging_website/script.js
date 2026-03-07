// Blog Post Management
class Blog {
    constructor() {
        this.posts = this.loadPosts();
        this.initializeEventListeners();
        this.renderPosts();
    }

    // Load posts from localStorage
    loadPosts() {
        const stored = localStorage.getItem('blogPosts');
        return stored ? JSON.parse(stored) : [];
    }

    // Save posts to localStorage
    savePosts() {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }

    // Add a new post
    addPost(title, content) {
        const post = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // Add to beginning of array so newest posts appear first
        this.posts.unshift(post);
        this.savePosts();
        this.renderPosts();
        this.clearForm();
    }

    // Delete a post
    deletePost(id) {
        this.posts = this.posts.filter(post => post.id !== id);
        this.savePosts();
        this.renderPosts();
    }

    // Render all posts
    renderPosts() {
        const postsList = document.getElementById('postsList');

        if (this.posts.length === 0) {
            postsList.innerHTML = '<div class="no-posts">No posts yet. Be the first to share your thoughts!</div>';
            return;
        }

        postsList.innerHTML = this.posts.map(post => `
            <div class="post-card">
                <h4>${this.escapeHtml(post.title)}</h4>
                <div class="post-date">${post.date}</div>
                <div class="post-content">${this.escapeHtml(post.content)}</div>
                <button class="btn-delete" data-id="${post.id}" style="margin-top: 1rem; padding: 0.5rem 1rem; background-color: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
            </div>
        `).join('');

        // Add delete event listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Are you sure you want to delete this post?')) {
                    this.deletePost(parseInt(e.target.dataset.id));
                }
            });
        });
    }

    // Clear the form
    clearForm() {
        document.getElementById('postForm').reset();
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize event listeners
    initializeEventListeners() {
        const form = document.getElementById('postForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;

            if (title && content) {
                this.addPost(title, content);
            }
        });
    }
}

// Initialize blog when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Blog();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
