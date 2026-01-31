
// ===============================
// Global Feedback System - Orange Theme
// ===============================

// Configuration - Using JSONBin as a mock backend
const CONFIG = {
    BIN_ID: '67a746c3acd3cb34a91c7b2a', // This is a public JSONBin ID
    BIN_URL: 'https://api.jsonbin.io/v3/b/67a746c3acd3cb34a91c7b2a',
    API_KEY: '$2a$10$Qpx2X6j3mGjB7VZ8Lw4H.OpW7nJkLmNqP8rStUvYxZzA1bC3dE5fG', // Read-only key
    STORAGE_KEY: 'feedpage_local_cache',
    LIKED_POSTS_KEY: 'feedpage_liked_posts',
    USER_ID_KEY: 'feedpage_user_id',
    MAX_CHARACTERS: 500,
    POSTS_PER_PAGE: 9
};

// DEMO DATA
const DEMO_FEEDBACK = [
    {
        id: 'demo_1',
        userId: 'demo_user_1',
        name: 'Alex Chen',
        initials: 'AC',
        category: 'appreciation',
        rating: 5,
        message: 'Love this platform! The real-time feedback feature is amazing. Can\'t believe I can see feedback from people across the world in real-time.',
        likes: 15,
        likedBy: [],
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        device: 'web',
        location: 'New York, USA'
    },
    {
        id: 'demo_2',
        userId: 'demo_user_2',
        name: 'Sofia Rodriguez',
        initials: 'SR',
        category: 'suggestion',
        rating: 4,
        message: 'Great concept! Would love to see categories for different types of projects. Maybe add tags or filters for specific topics?',
        likes: 8,
        likedBy: [],
        timestamp: Date.now() - (5 * 60 * 60 * 1000), // 5 hours ago
        device: 'mobile',
        location: 'Madrid, Spain'
    },
    {
        id: 'demo_3',
        userId: 'demo_user_3',
        name: 'Anonymous',
        initials: 'AN',
        category: 'experience',
        rating: 5,
        message: 'First time using this and I\'m blown away. Shared my thoughts and immediately saw them appear on my friend\'s phone across the country!',
        likes: 12,
        likedBy: [],
        timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
        device: 'web',
        location: 'London, UK'
    },
    {
        id: 'demo_4',
        userId: 'demo_user_4',
        name: 'Marcus Kim',
        initials: 'MK',
        category: 'idea',
        rating: 5,
        message: 'What if we could add images or screenshots to feedback? Sometimes a picture speaks louder than words!',
        likes: 6,
        likedBy: [],
        timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        device: 'web',
        location: 'Seoul, Korea'
    },
    {
        id: 'demo_5',
        userId: 'demo_user_5',
        name: 'Priya Sharma',
        initials: 'PS',
        category: 'question',
        rating: 3,
        message: 'How does the global sync work? Is it using WebSockets or polling? I\'m curious about the tech stack!',
        likes: 4,
        likedBy: [],
        timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
        device: 'mobile',
        location: 'Mumbai, India'
    },
    {
        id: 'demo_6',
        userId: 'demo_user_6',
        name: 'Liam Johnson',
        initials: 'LJ',
        category: 'fun',
        rating: 5,
        message: 'Just testing if this works globally... Hello from Australia! 🇦🇺 Can anyone see this from other continents?',
        likes: 9,
        likedBy: [],
        timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000), // 4 days ago
        device: 'mobile',
        location: 'Sydney, Australia'
    },
    {
        id: 'demo_7',
        userId: 'demo_user_7',
        name: 'Emma Wilson',
        initials: 'EW',
        category: 'appreciation',
        rating: 5,
        message: 'The orange theme is beautiful! Dark mode works perfectly too. Great attention to design details.',
        likes: 7,
        likedBy: [],
        timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        device: 'web',
        location: 'Toronto, Canada'
    },
    {
        id: 'demo_8',
        userId: 'demo_user_8',
        name: 'TechExplorer',
        initials: 'TE',
        category: 'suggestion',
        rating: 4,
        message: 'Would be awesome to have real-time notifications when someone likes your post or replies to your feedback!',
        likes: 5,
        likedBy: [],
        timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000), // 6 days ago
        device: 'web',
        location: 'Berlin, Germany'
    }
];

// State Management
let state = {
    feedbackData: [...DEMO_FEEDBACK],
    likedPosts: new Set(),
    currentUserId: null,
    currentView: 'grid',
    currentSort: 'newest',
    currentPage: 1,
    hasMorePosts: true,
    isLoading: false,
    lastSyncTime: 0
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
    console.log('🚀 Initializing FeedPage Matters...');
    loadThemePreference();
    setupEventListeners();
    setupRatingStars();
    setupCharacterCounter();
    generateUserId();
    loadLikedPosts();
    initializeDemoData();

    // Initialize theme toggle position
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateThemeToggle(currentTheme);

    console.log('✅ App initialized successfully');

    // Auto-sync every 30 seconds
    setInterval(syncWithGlobalServer, 30000);
}

// ===============================
// Theme Management
// ===============================

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme_orange') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('🌓 Theme loaded:', savedTheme);
}

function updateThemeToggle(theme) {
    // Note: The feedback.html uses a different theme toggle structure (SVG-based) than index.html
    // If you have a specific slider in your CSS, keep this:
    const slider = document.querySelector('.theme-toggle-slider');
    if (slider) {
        if (theme === 'dark') {
            slider.style.transform = 'translateX(28px)';
            slider.style.background = 'var(--primary-500)';
            const sun = document.querySelector('.sun');
            const moon = document.querySelector('.moon');
            if (sun) sun.style.opacity = '0.5';
            if (moon) moon.style.opacity = '1';
        } else {
            slider.style.transform = 'translateX(2px)';
            slider.style.background = 'var(--primary-500)';
            const sun = document.querySelector('.sun');
            const moon = document.querySelector('.moon');
            if (sun) sun.style.opacity = '1';
            if (moon) moon.style.opacity = '0.5';
        }
    }
}

// ===============================
// Demo Data Initialization
// ===============================

function initializeDemoData() {
    console.log('📊 Loading demo data...');
    showLoading(true);

    try {
        // Add demo data to state if not already present
        const existingIds = state.feedbackData.map(post => post.id);
        DEMO_FEEDBACK.forEach(demoPost => {
            if (!existingIds.includes(demoPost.id)) {
                state.feedbackData.push(demoPost);
            }
        });

        // Sort by timestamp (newest first)
        state.feedbackData.sort((a, b) => b.timestamp - a.timestamp);

        // Update stats
        updateGlobalStats();
        renderFeed();
        renderTrending();

        console.log('✅ Demo data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading demo data:', error);
    } finally {
        showLoading(false);
    }
}

// ===============================
// User Management
// ===============================

function generateUserId() {
    let userId = localStorage.getItem(CONFIG.USER_ID_KEY);
    if (!userId) {
        // Generate a unique user ID
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(CONFIG.USER_ID_KEY, userId);
    }
    state.currentUserId = userId;
    console.log('👤 User ID generated:', userId);
}

// ===============================
// Data Management - GLOBAL SERVER SIMULATION
// ===============================

async function loadInitialData() {
    console.log('📂 Loading initial data...');
    showLoading(true);

    try {
        // Try to load from global server first
        await syncWithGlobalServer();

        // If no data from server, load from local cache
        if (state.feedbackData.length === 0) {
            const localData = loadLocalData();
            state.feedbackData = localData;
            console.log('📱 Loaded from local cache:', state.feedbackData.length, 'posts');
        }

        updateGlobalStats();
        renderFeed();
        renderTrending();

    } catch (error) {
        console.error('❌ Error loading data:', error);
        // Fallback to demo data
        console.log('📱 Fallback to demo data');
        updateGlobalStats();
        renderFeed();
        renderTrending();
    } finally {
        showLoading(false);
    }
}

async function syncWithGlobalServer() {
    try {
        console.log('🌐 Syncing with global server...');
        const response = await fetch(CONFIG.BIN_URL + '/latest', {
            headers: {
                'X-Master-Key': CONFIG.API_KEY,
                'X-Bin-Meta': 'false'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch from server');
        }

        const serverData = await response.json();
        console.log('🌐 Received from server:', serverData);

        // Merge server data with local data
        if (serverData && Array.isArray(serverData.posts)) {
            const serverPosts = serverData.posts;
            const localPosts = state.feedbackData;

            // Create a map of posts by ID for easy lookup
            const postMap = new Map();

            // Add all server posts first (newest data)
            serverPosts.forEach(post => {
                postMap.set(post.id, post);
            });

            // Add local posts that aren't on server yet
            localPosts.forEach(post => {
                if (!postMap.has(post.id)) {
                    postMap.set(post.id, post);
                }
            });

            // Convert back to array and sort by timestamp
            const mergedPosts = Array.from(postMap.values());
            mergedPosts.sort((a, b) => b.timestamp - a.timestamp);

            state.feedbackData = mergedPosts;
            state.lastSyncTime = Date.now();

            // Save merged data to local cache
            saveLocalData();

            console.log('✅ Synced successfully:', state.feedbackData.length, 'total posts');
            console.log('📊 Merged data:', state.feedbackData);

            // Update UI if we're not currently loading
            if (!state.isLoading) {
                updateGlobalStats();
                renderFeed();
                renderTrending();
            }

            return true;
        }

    } catch (error) {
        console.error('❌ Sync failed:', error);
        return false;
    }
}

async function postToGlobalServer(feedback) {
    try {
        console.log('🌐 Posting to global server...');

        // For demo purposes, we'll simulate server posting
        // In a real app, you would have write access to the API

        // Get current server data
        const response = await fetch(CONFIG.BIN_URL + '/latest', {
            headers: {
                'X-Master-Key': CONFIG.API_KEY,
                'X-Bin-Meta': 'false'
            }
        });

        let serverData = { posts: [] };
        if (response.ok) {
            serverData = await response.json();
        }

        // Add new post to server data
        if (!Array.isArray(serverData.posts)) {
            serverData.posts = [];
        }

        serverData.posts.unshift(feedback);

        // In a real app, you would POST this back to the server
        // For now, we'll simulate by updating local cache and showing success

        console.log('✅ Post would be sent to server:', feedback);
        console.log('📊 Updated server data would have:', serverData.posts.length, 'posts');

        // Simulate server delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return { success: true, message: 'Shared globally!' };

    } catch (error) {
        console.error('❌ Server post failed:', error);
        return { success: false, message: 'Shared locally only' };
    }
}

function loadLocalData() {
    try {
        const storedData = localStorage.getItem(CONFIG.STORAGE_KEY);

        if (!storedData || storedData === 'undefined' || storedData === 'null') {
            console.log('📭 No local data found');
            return [...DEMO_FEEDBACK];
        }

        const parsed = JSON.parse(storedData);

        if (!Array.isArray(parsed)) {
            console.warn('⚠️ Local data is not an array');
            return [...DEMO_FEEDBACK];
        }

        // Filter out invalid entries
        const validData = parsed.filter(item =>
            item &&
            typeof item === 'object' &&
            item.id &&
            item.message
        );

        console.log(`📱 Local cache: ${validData.length} valid posts`);
        return validData.length > 0 ? validData : [...DEMO_FEEDBACK];

    } catch (error) {
        console.error('❌ Error parsing local data:', error);
        return [...DEMO_FEEDBACK];
    }
}

function saveLocalData() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.feedbackData));
        console.log('💾 Saved to local cache:', state.feedbackData.length, 'posts');
    } catch (error) {
        console.error('❌ Error saving to local cache:', error);
    }
}

function loadLikedPosts() {
    const storedLikes = localStorage.getItem(CONFIG.LIKED_POSTS_KEY);
    if (storedLikes) {
        try {
            state.likedPosts = new Set(JSON.parse(storedLikes));
            console.log('❤️ Loaded liked posts:', state.likedPosts.size);
        } catch (error) {
            console.error('❌ Error parsing liked posts:', error);
            state.likedPosts = new Set();
        }
    }
}

function saveLikedPosts() {
    try {
        localStorage.setItem(CONFIG.LIKED_POSTS_KEY, JSON.stringify(Array.from(state.likedPosts)));
    } catch (error) {
        console.error('❌ Error saving liked posts:', error);
    }
}

// ===============================
// UI Components
// ===============================

// Rating System
function setupRatingStars() {
    console.log('⭐ Setting up rating stars...');
    ratingStars.forEach(star => {
        star.addEventListener('click', function () {
            const value = parseInt(this.getAttribute('data-value'));
            setRating(value);
        });

        star.addEventListener('mouseover', function () {
            const value = parseInt(this.getAttribute('data-value'));
            highlightStars(value);
        });

        star.addEventListener('mouseout', function () {
            const currentRating = parseInt(ratingInput.value);
            highlightStars(currentRating);
        });
    });

    highlightStars(0);
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
        messageInput.addEventListener('input', function () {
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
        themeToggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme_orange', newTheme);
            updateThemeToggle(newTheme);
        });
    }

    // Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'ri-close-line';
            } else {
                icon.className = 'ri-menu-3-line';
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.querySelector('i').className = 'ri-menu-3-line';
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
        btn.addEventListener('click', function () {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.currentView = this.dataset.view;
            renderFeed();
        });
    });

    // Sort Control
    if (sortFilter) {
        sortFilter.addEventListener('change', function () {
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
    let name = nameInput.value.trim() || 'Anonymous';
    const category = document.getElementById('category').value;
    const rating = parseInt(ratingInput.value);
    const message = messageInput.value.trim();

    // Validation using ValidationEngine
    const validationRules = {
        category: { required: true },
        message: { required: true, min: 5, max: CONFIG.MAX_CHARACTERS }
    };

    const validationResult = window.ValidationEngine.validate({ category, message }, validationRules);

    if (!validationResult.isValid) {
        const errorMsg = Object.values(validationResult.errors)[0];
        window.notificationManager.error(errorMsg);
        return;
    }

    if (rating === 0 || isNaN(rating)) {
        window.notificationManager.warning('Please select a rating');
        return;
    }

    // Create initials
    let initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    if (initials.length === 1) {
        initials = initials + (name[1]?.toUpperCase() || name[0]?.toUpperCase() || 'A');
    }

    // Create feedback object
    const feedback = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9), // More unique ID
        userId: state.currentUserId,
        name: name,
        initials: initials,
        category: category,
        rating: rating,
        message: message,
        likes: 0,
        likedBy: [],
        timestamp: Date.now(),
        device: 'web',
        location: 'global'
    };

    // Show loading state
    const submitBtn = feedbackForm.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sharing Globally...';
    submitBtn.disabled = true;

    try {
        // Add to local data immediately
        state.feedbackData = [feedback, ...state.feedbackData];
        saveLocalData();

        // Try to post to global server (simulated)
        const serverResult = await postToGlobalServer(feedback);

        // Reset form
        clearForm();

        // Update UI
        state.currentPage = 1;
        renderFeed();
        renderTrending();
        updateGlobalStats();

        // Show success message
        if (serverResult.success) {
            window.notificationManager.success('Posted globally! Visible everywhere! 🌍');
        } else {
            window.notificationManager.info('Posted locally. Will sync when online.');
        }

        // Scroll to feed
        setTimeout(() => {
            document.querySelector('#feed').scrollIntoView({ behavior: 'smooth' });
        }, 300);

    } catch (error) {
        console.error('❌ Error sharing feedback:', error);
        window.notificationManager.error('Error sharing feedback');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleFooterFeedbackSubmit(e) {
    e.preventDefault();

    let name = document.getElementById('footerName').value.trim() || 'Anonymous';
    const message = document.getElementById('footerMessage').value.trim();

    if (!window.ValidationEngine.isRequired(message)) {
        window.notificationManager.error('Please enter your feedback');
        return;
    }

    // Create initials
    let initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    if (initials.length === 1) {
        initials = initials + (name[1]?.toUpperCase() || name[0]?.toUpperCase() || 'A');
    }

    // Create feedback
    const feedback = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: state.currentUserId,
        name: name,
        initials: initials,
        category: 'suggestion',
        rating: 5,
        message: message,
        likes: 0,
        likedBy: [],
        timestamp: Date.now(),
        device: 'web',
        location: 'global'
    };

    state.feedbackData = [feedback, ...state.feedbackData];
    saveLocalData();

    // Try to post to server
    postToGlobalServer(feedback).then(result => {
        if (result.success) {
            console.log('✅ Footer feedback shared globally');
        }
    });

    footerFeedbackForm.reset();
    state.currentPage = 1;
    renderFeed();
    renderTrending();
    updateGlobalStats();

    window.notificationManager.success('Thank you for your feedback!');
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

    const filteredData = getFilteredData();
    const paginatedData = getPaginatedData(filteredData);

    updateFeedStats(filteredData.length);

    if (filteredData.length === 0) {
        emptyState.style.display = 'block';
        feedGrid.style.display = 'none';
        loadMore.style.display = 'none';
        return;
    } else {
        emptyState.style.display = 'none';
        feedGrid.style.display = 'grid';
    }

    feedGrid.innerHTML = '';

    paginatedData.forEach(feedback => {
        const postElement = createPostElement(feedback);
        feedGrid.appendChild(postElement);
    });

    state.hasMorePosts = paginatedData.length < filteredData.length;
    loadMore.style.display = state.hasMorePosts ? 'block' : 'none';
}

function getFilteredData() {
    let data = [...state.feedbackData];

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

    const date = new Date(feedback.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const isLiked = state.likedPosts.has(feedback.id);
    const categoryEmoji = getCategoryEmoji(feedback.category);

    // Check if post is from current user
    const isCurrentUser = feedback.userId === state.currentUserId;

    post.innerHTML = `
                <div class="post-header">
                    <div class="user-avatar" style="${isCurrentUser ? 'border: 2px solid var(--primary-500);' : ''}">
                        ${feedback.initials}
                        ${isCurrentUser ? '<div style="position: absolute; bottom: -2px; right: -2px; background: var(--primary-500); color: white; width: 16px; height: 16px; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center;">✓</div>' : ''}
                    </div>
                    <div class="post-meta">
                        <div class="user-name">
                            ${feedback.name}
                            ${isCurrentUser ? '<span style="color: var(--primary-500); font-size: 0.8em; margin-left: 5px;">(You)</span>' : ''}
                        </div>
                        <div class="post-date">${formattedDate}</div>
                    </div>
                    <div class="post-category">${categoryEmoji} ${feedback.category}</div>
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
                    <div class="post-global-badge">
                        <i class="fas fa-globe-americas"></i>
                        ${feedback.device ? `From ${feedback.device}` : 'Visible Everywhere'}
                    </div>
                </div>
            `;

    const likeBtn = post.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => handleLike(feedback.id));

    return post;
}

function getStarsHTML(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
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

    const trendingData = [...state.feedbackData]
        .sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a))
        .slice(0, 3);

    trendingGrid.innerHTML = '';

    if (trendingData.length === 0) {
        trendingGrid.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary); grid-column: 1 / -1;">
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

        const isCurrentUser = feedback.userId === state.currentUserId;

        card.innerHTML = `
                    <div class="trending-badge">#${index + 1} Trending</div>
                    <div class="post-header" style="margin-top: 1rem;">
                        <div class="user-avatar" style="width: 40px; height: 40px; font-size: 1rem; ${isCurrentUser ? 'border: 2px solid var(--primary-500);' : ''}">
                            ${feedback.initials}
                        </div>
                        <div class="post-meta">
                            <div class="user-name">
                                ${feedback.name}
                                ${isCurrentUser ? '<span style="color: var(--primary-500); font-size: 0.7em;">(You)</span>' : ''}
                            </div>
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
        feedback.likes = Math.max(0, feedback.likes - 1);
        feedback.likedBy = feedback.likedBy.filter(id => id !== state.currentUserId);
        state.likedPosts.delete(postId);
        window.notificationManager.info('Removed like');
    } else {
        feedback.likes++;
        feedback.likedBy.push(state.currentUserId);
        state.likedPosts.add(postId);
        window.notificationManager.success('Liked! ❤️');
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
    const totalPostsCount = state.feedbackData.length;
    const totalLikesCount = state.feedbackData.reduce((sum, post) => sum + (post.likes || 0), 0);

    const uniqueUserIds = new Set(state.feedbackData.map(post => post.userId));
    const uniqueUsersCount = uniqueUserIds.size;

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

async function refreshFeed() {
    showLoading(true);

    try {
        await syncWithGlobalServer();
        window.notificationManager.success('Feed synced with global server!');
    } catch (error) {
        window.notificationManager.info('Using cached data');
    } finally {
        showLoading(false);
    }
}

function loadMorePosts() {
    state.currentPage++;
    renderFeed();

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

// Toast notifications are now handled by NotificationManager

// ===============================
// Navbar Active Link Management
// ===============================

function updateActiveNavLink() {
    // Remove active class from all links first
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    // Get current page URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Determine which link should be active
    let activeLink;
    if (currentPage === 'feedback.html') {
        activeLink = document.querySelector('a[href="feedback.html"]');
    } else if (currentPage === 'about.html') {
        activeLink = document.querySelector('a[href="about.html"]');
    } else if (currentPage === 'bookmarks.html') {
        activeLink = document.querySelector('a[href="bookmarks.html"]');
    } else if (window.location.hash === '#projects') {
        activeLink = document.querySelector('a[href="#projects"]');
    } else if (window.location.hash === '#contribute') {
        activeLink = document.querySelector('a[href="#contribute"]');
    } else {
        // Default to Projects if no specific page
        activeLink = document.querySelector('a[href="#projects"]');
    }

    // Add active class to the current page link
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// ===============================
// Initialize
// ===============================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Initialize navbar active state
document.addEventListener('DOMContentLoaded', updateActiveNavLink);
