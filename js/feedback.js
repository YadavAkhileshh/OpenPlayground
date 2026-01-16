// ===============================
// Global Feedback System - Orange Theme
// ===============================

// Configuration
const CONFIG = {
    STORAGE_KEY: 'feedpage_global_feedback_orange',
    LIKED_POSTS_KEY: 'feedpage_liked_posts_orange',
    USER_ID_KEY: 'feedpage_user_id_orange',
    MAX_CHARACTERS: 500,
    POSTS_PER_PAGE: 9
};

// State Management
let state = {
    feedbackData: [],
    likedPosts: new Set(),
    currentUserId: null,
    currentView: 'grid',
    currentSort: 'newest',
    currentPage: 1,
    hasMorePosts: true,
    isLoading: false
};

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const feedbackForm = document.getElementById('feedbackForm');
const footerFeedbackForm = document.getElementById('footerFeedbackForm');
const ratingStars = document.querySelectorAll('#ratingStars .star');
const ratingInput = document.getElementById('rating');
const ratingText = document.getElementById('ratingText');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');
const clearFormBtn = document.getElementById('clearForm');
const sortFilter = document.getElementById('sortFilter');
const viewButtons = document.querySelectorAll('.view-btn');
const refreshBtn = document.getElementById('refreshFeed');
const feedGrid = document.getElementById('feedGrid');
const emptyState = document.getElementById('emptyState');
const loadMore = document.getElementById('loadMore');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const emptyStateShare = document.getElementById('emptyStateShare');
const toast = document.getElementById('toast');

// Global stats elements
const globalPosts = document.getElementById('globalPosts');
const globalLikes = document.getElementById('globalLikes');
const activeUsers = document.getElementById('activeUsers');
const showingCount = document.getElementById('showingCount');
const totalPosts = document.getElementById('totalPosts');
const totalLikesCount = document.getElementById('totalLikesCount');
const uniqueUsers = document.getElementById('uniqueUsers');

// ===============================
// Initialize Application
// ===============================

function init() {
    loadThemePreference();
    setupEventListeners();
    setupRatingStars();
    setupCharacterCounter();
    generateUserId();
    loadLikedPosts();
    loadInitialData();
}

// ===============================
// Theme Management
// ===============================

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme_orange') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
}

function updateThemeToggle(theme) {
    const slider = document.querySelector('.theme-toggle-slider');
    if (theme === 'dark') {
        slider.style.transform = 'translateX(28px)';
        slider.style.background = 'var(--primary-500)';
        document.querySelector('.sun').style.opacity = '0.5';
        document.querySelector('.moon').style.opacity = '1';
    } else {
        slider.style.transform = 'translateX(2px)';
        slider.style.background = 'var(--primary-500)';
        document.querySelector('.sun').style.opacity = '1';
        document.querySelector('.moon').style.opacity = '0.5';
    }
}

// ===============================
// User Management
// ===============================

function generateUserId() {
    let userId = localStorage.getItem(CONFIG.USER_ID_KEY);
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(CONFIG.USER_ID_KEY, userId);
    }
    state.currentUserId = userId;
}

// ===============================
// Data Management
// ===============================

async function loadInitialData() {
    showLoading(true);
    
    try {
        // Load only user-submitted data from localStorage
        const localData = loadLocalData();
        state.feedbackData = localData;
        
        updateGlobalStats();
        renderFeed();
        renderTrending();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading feedback data', 'error');
    } finally {
        showLoading(false);
    }
}

function loadLocalData() {
    const storedData = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (error) {
            console.error('Error parsing local data:', error);
            return [];
        }
    }
    return [];
}

function saveLocalData() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.feedbackData));
    updateGlobalStats();
}

function loadLikedPosts() {
    const storedLikes = localStorage.getItem(CONFIG.LIKED_POSTS_KEY);
    if (storedLikes) {
        try {
            state.likedPosts = new Set(JSON.parse(storedLikes));
        } catch (error) {
            console.error('Error parsing liked posts:', error);
            state.likedPosts = new Set();
        }
    }
}

function saveLikedPosts() {
    localStorage.setItem(CONFIG.LIKED_POSTS_KEY, JSON.stringify(Array.from(state.likedPosts)));
}

// ===============================
// UI Components
// ===============================

// Rating System
function setupRatingStars() {
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            setRating(value);
        });
        
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.getAttribute('data-value'));
            highlightStars(value);
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = parseInt(ratingInput.value);
            highlightStars(currentRating);
        });
    });
}

function setRating(value) {
    ratingInput.value = value;
    highlightStars(value);
    
    const ratingTexts = {
        1: 'Not great - Needs significant improvement',
        2: 'Could be better - Has room for improvement',
        3: 'Good - Met expectations',
        4: 'Great - Exceeded expectations',
        5: 'Excellent - Outstanding experience!'
    };
    ratingText.textContent = ratingTexts[value] || 'Select your feeling';
}

function highlightStars(value) {
    ratingStars.forEach((star, index) => {
        const starIcon = star.querySelector('i');
        const starLabel = star.querySelector('.star-label');
        
        if (index < value) {
            star.classList.add('active');
            starIcon.className = 'fas fa-star';
            starIcon.style.color = '#FFD700';
            if (starLabel) starLabel.style.color = '#FFD700';
        } else {
            star.classList.remove('active');
            starIcon.className = 'far fa-star';
            starIcon.style.color = '';
            if (starLabel) starLabel.style.color = 'var(--text-muted)';
        }
    });
}

// Character Counter
function setupCharacterCounter() {
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = length;
            
            if (length > CONFIG.MAX_CHARACTERS) {
                charCount.style.color = 'var(--danger-500)';
                this.value = this.value.substring(0, CONFIG.MAX_CHARACTERS);
                charCount.textContent = CONFIG.MAX_CHARACTERS;
            } else if (length > CONFIG.MAX_CHARACTERS * 0.8) {
                charCount.style.color = 'var(--warning-500)';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        });
    }
}

// Event Listeners
function setupEventListeners() {
    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme_orange', newTheme);
            updateThemeToggle(newTheme);
        });
    }
    
    // Navigation Toggle (for mobile)
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // Close menu when clicking links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.querySelector('i').className = 'fas fa-bars';
            });
        });
    }
    
    // Feedback Forms
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
    
    if (footerFeedbackForm) {
        footerFeedbackForm.addEventListener('submit', handleFooterFeedbackSubmit);
    }
    
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }
    
    // View Controls
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.currentView = this.dataset.view;
            renderFeed();
        });
    });
    
    // Sort Control
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            state.currentSort = this.value;
            state.currentPage = 1;
            renderFeed();
        });
    }
    
    // Refresh Button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshFeed);
    }
    
    // Load More
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
    
    // Empty State Share Button
    if (emptyStateShare) {
        emptyStateShare.addEventListener('click', () => {
            document.querySelector('#share').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ===============================
// Feedback Handling
// ===============================

async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim() || 'Anonymous';
    const category = document.getElementById('category').value;
    const rating = parseInt(ratingInput.value);
    const message = messageInput.value.trim();
    
    // Validation
    if (!category || !rating || !message) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (rating === 0) {
        showToast('Please select a rating', 'error');
        return;
    }
    
    // Create initials
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    if (initials.length === 1) initials += name[1]?.toUpperCase() || name[0]?.toUpperCase() || 'A';
    
    // Create feedback object
    const feedback = {
        id: Date.now(),
        userId: state.currentUserId,
        name: name,
        initials: initials,
        category: category,
        rating: rating,
        message: message,
        likes: 0,
        likedBy: [],
        timestamp: Date.now()
    };
    
    // Show loading state
    const submitBtn = feedbackForm.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sharing Globally...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Add to local data
        state.feedbackData.unshift(feedback);
        saveLocalData();
        
        // Reset form
        clearForm();
        
        // Update UI
        state.currentPage = 1;
        renderFeed();
        renderTrending();
        
        // Show success message
        showToast('Your feedback is now visible to everyone! 🌍', 'success');
        
        // Scroll to feed
        document.querySelector('#feed').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error sharing feedback:', error);
        showToast('Error sharing feedback. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function handleFooterFeedbackSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('footerName').value.trim() || 'Anonymous';
    const message = document.getElementById('footerMessage').value.trim();
    
    if (!message) {
        showToast('Please enter your feedback', 'error');
        return;
    }
    
    // Create feedback from footer form
    const feedback = {
        id: Date.now(),
        userId: state.currentUserId,
        name: name,
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        category: 'suggestion',
        rating: 5,
        message: message,
        likes: 0,
        likedBy: [],
        timestamp: Date.now()
    };
    
    state.feedbackData.unshift(feedback);
    saveLocalData();
    
    // Reset form
    footerFeedbackForm.reset();
    
    // Update UI
    state.currentPage = 1;
    renderFeed();
    
    showToast('Thank you for your feedback!', 'success');
}

function clearForm() {
    if (feedbackForm) {
        feedbackForm.reset();
        ratingInput.value = '0';
        ratingText.textContent = 'Select your feeling';
        highlightStars(0);
        charCount.textContent = '0';
        charCount.style.color = 'var(--text-muted)';
    }
}

// ===============================
// Feed Rendering
// ===============================

function renderFeed() {
    if (!feedGrid) return;
    
    // Get sorted and filtered data
    const filteredData = getFilteredData();
    const paginatedData = getPaginatedData(filteredData);
    
    // Update stats
    updateFeedStats(filteredData.length);
    
    // Show/hide empty state
    if (filteredData.length === 0) {
        emptyState.style.display = 'block';
        feedGrid.style.display = 'none';
        loadMore.style.display = 'none';
        return;
    } else {
        emptyState.style.display = 'none';
        feedGrid.style.display = 'grid';
    }
    
    // Clear grid
    feedGrid.innerHTML = '';
    
    // Render posts
    paginatedData.forEach(feedback => {
        const postElement = createPostElement(feedback);
        feedGrid.appendChild(postElement);
    });
    
    // Show/hide load more
    state.hasMorePosts = paginatedData.length < filteredData.length;
    loadMore.style.display = state.hasMorePosts ? 'block' : 'none';
}

function getFilteredData() {
    let data = [...state.feedbackData];
    
    // Sort data
    switch (state.currentSort) {
        case 'newest':
            data.sort((a, b) => b.timestamp - a.timestamp);
            break;
        case 'most-liked':
            data.sort((a, b) => b.likes - a.likes || b.timestamp - a.timestamp);
            break;
        case 'highest-rating':
            data.sort((a, b) => b.rating - a.rating || b.likes - a.likes);
            break;
        case 'trending':
            // Trending: recent posts with high engagement
            data.sort((a, b) => {
                const aScore = calculateTrendingScore(a);
                const bScore = calculateTrendingScore(b);
                return bScore - aScore;
            });
            break;
    }
    
    return data;
}

function calculateTrendingScore(feedback) {
    const ageInHours = (Date.now() - feedback.timestamp) / (1000 * 60 * 60);
    const likes = feedback.likes || 0;
    const rating = feedback.rating || 0;
    
    // Score favors recent posts with high likes and ratings
    return (likes * 10 + rating * 5) / Math.max(ageInHours, 1);
}

function getPaginatedData(data) {
    const start = (state.currentPage - 1) * CONFIG.POSTS_PER_PAGE;
    const end = start + CONFIG.POSTS_PER_PAGE;
    return data.slice(0, end);
}

function createPostElement(feedback) {
    const post = document.createElement('div');
    post.className = 'post-card';
    
    // Format date
    const date = new Date(feedback.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Check if user liked this post
    const isLiked = state.likedPosts.has(feedback.id);
    
    // Get category emoji
    const categoryEmoji = getCategoryEmoji(feedback.category);
    
    post.innerHTML = `
        <div class="post-header">
            <div class="user-avatar" style="background: var(--gradient-primary);">${feedback.initials}</div>
            <div class="post-meta">
                <div class="user-name">${feedback.name}</div>
                <div class="post-date">${formattedDate}</div>
            </div>
            <div class="post-category" style="background: var(--primary-100); color: var(--primary-700); border-color: var(--primary-300);">${categoryEmoji} ${feedback.category}</div>
        </div>
        
        <div class="post-rating">
            ${getStarsHTML(feedback.rating)}
        </div>
        
        <div class="post-content">
            ${feedback.message}
        </div>
        
        <div class="post-actions">
            <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${feedback.id}">
                <i class="fas fa-heart"></i>
                <span class="like-count">${feedback.likes}</span>
            </button>
            <div class="post-global-badge" style="background: var(--primary-100); color: var(--primary-700); border-color: var(--primary-300);">
                <i class="fas fa-globe-americas"></i>
                Visible Everywhere
            </div>
        </div>
    `;
    
    // Add like event listener
    const likeBtn = post.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => handleLike(feedback.id));
    
    return post;
}

function getStarsHTML(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function getCategoryEmoji(category) {
    const emojis = {
        'appreciation': '💖',
        'suggestion': '💡',
        'experience': '✨',
        'question': '❓',
        'idea': '🚀',
        'fun': '🎉'
    };
    return emojis[category] || '📝';
}

// ===============================
// Trending Section
// ===============================

function renderTrending() {
    const trendingGrid = document.getElementById('trendingGrid');
    if (!trendingGrid) return;
    
    // Get trending posts (top 3 by trending score)
    const trendingData = [...state.feedbackData]
        .sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a))
        .slice(0, 3);
    
    trendingGrid.innerHTML = '';
    
    if (trendingData.length === 0) {
        trendingGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-fire" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No trending posts yet. Be the first to share!</p>
            </div>
        `;
        return;
    }
    
    trendingData.forEach((feedback, index) => {
        const card = document.createElement('div');
        card.className = 'trending-card';
        
        const formattedDate = new Date(feedback.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        card.innerHTML = `
            <div class="trending-badge" style="background: var(--gradient-primary);">#${index + 1} Trending</div>
            <div class="post-header" style="margin-top: 1rem;">
                <div class="user-avatar" style="width: 40px; height: 40px; font-size: 1rem; background: var(--gradient-primary);">
                    ${feedback.initials}
                </div>
                <div class="post-meta">
                    <div class="user-name">${feedback.name}</div>
                    <div class="post-date">${formattedDate}</div>
                </div>
            </div>
            <div class="post-content" style="font-size: 0.9375rem; margin: 1rem 0;">
                ${feedback.message.substring(0, 100)}${feedback.message.length > 100 ? '...' : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-secondary); font-size: 0.875rem;">
                <span><i class="fas fa-heart" style="color: var(--heart-color);"></i> ${feedback.likes}</span>
                <span><i class="fas fa-star" style="color: #FFD700;"></i> ${feedback.rating}/5</span>
            </div>
        `;
        
        trendingGrid.appendChild(card);
    });
}

// ===============================
// Like System
// ===============================

function handleLike(postId) {
    const feedback = state.feedbackData.find(f => f.id === postId);
    if (!feedback) return;
    
    if (state.likedPosts.has(postId)) {
        // Unlike
        feedback.likes = Math.max(0, feedback.likes - 1);
        feedback.likedBy = feedback.likedBy.filter(id => id !== state.currentUserId);
        state.likedPosts.delete(postId);
        showToast('Removed like', 'info');
    } else {
        // Like
        feedback.likes++;
        feedback.likedBy.push(state.currentUserId);
        state.likedPosts.add(postId);
        showToast('Liked! ❤️', 'success');
    }
    
    saveLocalData();
    saveLikedPosts();
    renderFeed();
    renderTrending();
    updateGlobalStats();
}

// ===============================
// Stats & Updates
// ===============================

function updateGlobalStats() {
    if (!state.feedbackData.length) {
        if (globalPosts) globalPosts.textContent = '0';
        if (globalLikes) globalLikes.textContent = '0';
        if (activeUsers) activeUsers.textContent = '0';
        if (totalPosts) totalPosts.textContent = '0';
        if (totalLikesCount) totalLikesCount.textContent = '0';
        if (uniqueUsers) uniqueUsers.textContent = '0';
        return;
    }
    
    const totalPostsCount = state.feedbackData.length;
    const totalLikesCount = state.feedbackData.reduce((sum, post) => sum + (post.likes || 0), 0);
    
    // Count unique users
    const uniqueUserIds = new Set(state.feedbackData.map(post => post.userId));
    const uniqueUsersCount = uniqueUserIds.size;
    
    // Update DOM elements
    if (globalPosts) globalPosts.textContent = totalPostsCount.toLocaleString();
    if (globalLikes) globalLikes.textContent = totalLikesCount.toLocaleString();
    if (activeUsers) activeUsers.textContent = uniqueUsersCount.toLocaleString();
    if (totalPosts) totalPosts.textContent = totalPostsCount.toLocaleString();
    if (totalLikesCount) totalLikesCount.textContent = totalLikesCount.toLocaleString();
    if (uniqueUsers) uniqueUsers.textContent = uniqueUsersCount.toLocaleString();
}

function updateFeedStats(showingCountNum) {
    if (showingCount) showingCount.textContent = showingCountNum;
}

function refreshFeed() {
    state.currentPage = 1;
    showLoading(true);
    
    setTimeout(() => {
        renderFeed();
        renderTrending();
        updateGlobalStats();
        showLoading(false);
        showToast('Feed refreshed!', 'success');
    }, 500);
}

function loadMorePosts() {
    state.currentPage++;
    renderFeed();
    
    // Scroll to newly loaded posts
    setTimeout(() => {
        const posts = document.querySelectorAll('.post-card');
        if (posts.length > CONFIG.POSTS_PER_PAGE) {
            posts[posts.length - CONFIG.POSTS_PER_PAGE].scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, 100);
}

// ===============================
// UI Utilities
// ===============================

function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
    state.isLoading = show;
}

function showToast(message, type = 'info') {
    if (!toast) return;
    
    // Set content and type
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Add icon
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    
    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after delay
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===============================
// Initialize
// ===============================

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}