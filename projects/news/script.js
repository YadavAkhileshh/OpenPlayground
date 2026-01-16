/**
 * NewsWave - News Aggregator Application
 * Main JavaScript File
 */

// Configuration
const CONFIG = {
    API_KEY: 'demo', // Replace with your NewsAPI key
    BASE_URL: 'https://newsapi.org/v2',
    DEFAULT_CATEGORY: 'general',
    DEFAULT_COUNTRY: 'us',
    PAGE_SIZE: 20,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    FALLBACK_ENABLED: true
};

// Application State
const AppState = {
    currentCategory: CONFIG.DEFAULT_CATEGORY,
    currentSearch: '',
    articles: [],
    sources: new Set(),
    isLoading: false,
    isGridView: true,
    lastUpdate: null,
    cache: new Map()
};

// DOM Elements
const Elements = {
    newsContainer: document.getElementById('newsContainer'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    refreshBtn: document.getElementById('refreshBtn'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    articleCount: document.getElementById('articleCount'),
    sourceCount: document.getElementById('sourceCount'),
    lastUpdated: document.getElementById('lastUpdated'),
    currentCategory: document.getElementById('currentCategory'),
    trendingTopics: document.getElementById('trendingTopics'),
    gridViewBtn: document.getElementById('gridViewBtn'),
    listViewBtn: document.getElementById('listViewBtn'),
    articleModal: document.getElementById('articleModal'),
    closeModal: document.getElementById('closeModal'),
    modalBody: document.getElementById('modalBody'),
    modalTitle: document.getElementById('modalTitle'),
    toast: document.getElementById('toast'),
    loadingState: document.getElementById('loadingState')
};

// Fallback Data for when API is unavailable
const FALLBACK_ARTICLES = {
    general: [
        {
            title: "Global Climate Summit Reaches Historic Agreement",
            description: "World leaders have agreed on ambitious new targets to combat climate change at the latest international summit.",
            urlToImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&h=300&fit=crop",
            source: { name: "Global News" },
            publishedAt: new Date().toISOString(),
            url: "#",
            author: "Climate Desk",
            category: "general"
        },
        {
            title: "Tech Giants Announce Major AI Partnership",
            description: "Leading technology companies have formed a coalition to establish ethical standards for artificial intelligence development.",
            urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop",
            source: { name: "Tech Insider" },
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            url: "#",
            author: "Alex Johnson",
            category: "technology"
        }
    ],
    business: [
        {
            title: "Stock Markets Reach All-Time High",
            description: "Global stock markets have surged to record levels following positive economic indicators.",
            urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&h=300&fit=crop",
            source: { name: "Financial Times" },
            publishedAt: new Date().toISOString(),
            url: "#",
            author: "Market Watch",
            category: "business"
        }
    ],
    technology: [
        {
            title: "Revolutionary Quantum Computer Breakthrough",
            description: "Scientists have achieved a major milestone in quantum computing that could revolutionize data processing.",
            urlToImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&h=300&fit=crop",
            source: { name: "Science Daily" },
            publishedAt: new Date().toISOString(),
            url: "#",
            author: "Dr. Sarah Chen",
            category: "technology"
        }
    ],
    sports: [
        {
            title: "Championship Final Ends in Dramatic Victory",
            description: "The championship final concluded with a last-minute goal, securing a historic win for the underdog team.",
            urlToImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop",
            source: { name: "Sports Network" },
            publishedAt: new Date().toISOString(),
            url: "#",
            author: "Mike Thompson",
            category: "sports"
        }
    ]
};

// Initialize Application
class NewsAggregator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNews();
        this.updateViewControls();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Category buttons
        Elements.categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCategoryChange(e));
        });

        // Search functionality
        Elements.searchBtn.addEventListener('click', () => this.handleSearch());
        Elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        Elements.clearSearchBtn.addEventListener('click', () => this.clearSearch());

        // View controls
        Elements.gridViewBtn.addEventListener('click', () => this.setGridView(true));
        Elements.listViewBtn.addEventListener('click', () => this.setGridView(false));

        // Refresh button
        Elements.refreshBtn.addEventListener('click', () => this.loadNews());

        // Modal
        Elements.closeModal.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === Elements.articleModal) this.closeModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.loadNews();
            }
        });
    }

    // Category Change Handler
    handleCategoryChange(event) {
        const button = event.currentTarget;
        const category = button.dataset.category;

        // Update UI
        Elements.categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        // Update state and load news
        AppState.currentCategory = category;
        AppState.currentSearch = '';
        Elements.searchInput.value = '';
        Elements.currentCategory.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        
        this.loadNews();
    }

    // Search Handler
    handleSearch() {
        const query = Elements.searchInput.value.trim();
        if (query) {
            AppState.currentSearch = query;
            this.loadNews();
            this.showToast(`Searching for: ${query}`);
        }
    }

    // Clear Search
    clearSearch() {
        Elements.searchInput.value = '';
        AppState.currentSearch = '';
        this.loadNews();
    }

    // View Mode Setters
    setGridView(isGrid) {
        AppState.isGridView = isGrid;
        this.updateViewControls();
        this.renderArticles();
    }

    updateViewControls() {
        Elements.gridViewBtn.classList.toggle('active', AppState.isGridView);
        Elements.listViewBtn.classList.toggle('active', !AppState.isGridView);
        Elements.newsContainer.classList.toggle('grid-view', AppState.isGridView);
        Elements.newsContainer.classList.toggle('list-view', !AppState.isGridView);
    }

    // Main News Loading Function
    async loadNews() {
        try {
            this.setLoadingState(true);
            
            let articles;
            const cacheKey = this.getCacheKey();

            // Check cache first
            if (this.isCacheValid(cacheKey)) {
                articles = AppState.cache.get(cacheKey).data;
                this.showToast('Loaded from cache');
            } else {
                // Try API first
                try {
                    articles = await this.fetchFromAPI();
                    // Cache the results
                    AppState.cache.set(cacheKey, {
                        data: articles,
                        timestamp: Date.now()
                    });
                } catch (apiError) {
                    console.warn('API failed, using fallback data:', apiError);
                    
                    if (CONFIG.FALLBACK_ENABLED) {
                        articles = this.getFallbackData();
                        this.showToast('Using fallback data', 'warning');
                    } else {
                        throw apiError;
                    }
                }
            }

            AppState.articles = articles;
            this.updateSources();
            this.renderArticles();
            this.updateStats();
            this.updateTrendingTopics();
            this.updateLastUpdated();

        } catch (error) {
            this.showError('Failed to load news. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    // API Fetch Function
    async fetchFromAPI() {
        let url;
        
        if (AppState.currentSearch) {
            url = `${CONFIG.BASE_URL}/everything?q=${encodeURIComponent(AppState.currentSearch)}&sortBy=publishedAt&language=en&pageSize=${CONFIG.PAGE_SIZE}`;
        } else {
            url = `${CONFIG.BASE_URL}/top-headlines?country=${CONFIG.DEFAULT_COUNTRY}&category=${AppState.currentCategory}&pageSize=${CONFIG.PAGE_SIZE}`;
        }

        // For demo purposes, we'll use a mock response
        // In production, you would use your actual API key
        if (CONFIG.API_KEY === 'demo') {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Return mock data based on category or search
            if (AppState.currentSearch) {
                // Search results - mix of categories
                return this.generateMockSearchResults(AppState.currentSearch);
            } else {
                // Category-specific results
                return this.generateMockCategoryResults(AppState.currentCategory);
            }
        } else {
            // Real API call
            const response = await fetch(`${url}&apiKey=${CONFIG.API_KEY}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'ok') {
                return data.articles.map(article => ({
                    ...article,
                    category: AppState.currentCategory
                }));
            } else {
                throw new Error(data.message || 'Failed to fetch news');
            }
        }
    }

    // Mock Data Generators (for demo)
    generateMockCategoryResults(category) {
        const mockArticles = FALLBACK_ARTICLES[category] || FALLBACK_ARTICLES.general;
        
        // Generate additional articles for the category
        const additionalArticles = Array.from({ length: 8 }, (_, i) => ({
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} News Headline ${i + 1}`,
            description: `This is a sample description for ${category} news article ${i + 1}. It provides a brief overview of the latest developments in this category.`,
            urlToImage: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=500&h=300&fit=crop`,
            source: { name: `${category.charAt(0).toUpperCase() + category.slice(1)} News` },
            publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
            url: "#",
            author: `Author ${String.fromCharCode(65 + i)}`,
            category: category
        }));

        return [...mockArticles, ...additionalArticles];
    }

    generateMockSearchResults(query) {
        return Array.from({ length: 12 }, (_, i) => ({
            title: `Search Result: ${query} - Article ${i + 1}`,
            description: `This article discusses ${query} in detail. It covers the latest developments and provides analysis on the topic.`,
            urlToImage: `https://images.unsplash.com/photo-${1600000000000 + i * 100000}?w=500&h=300&fit=crop`,
            source: { name: ['News Network', 'Media Today', 'Press International'][i % 3] },
            publishedAt: new Date(Date.now() - i * 1800000).toISOString(),
            url: "#",
            author: `Reporter ${String.fromCharCode(65 + i)}`,
            category: 'search'
        }));
    }

    getFallbackData() {
        if (AppState.currentSearch) {
            return this.generateMockSearchResults(AppState.currentSearch);
        }
        return FALLBACK_ARTICLES[AppState.currentCategory] || FALLBACK_ARTICLES.general;
    }

    // Cache Management
    getCacheKey() {
        return AppState.currentSearch ? 
            `search:${AppState.currentSearch}` : 
            `category:${AppState.currentCategory}`;
    }

    isCacheValid(key) {
        const cached = AppState.cache.get(key);
        if (!cached) return false;
        
        return Date.now() - cached.timestamp < CONFIG.CACHE_DURATION;
    }

    // UI Rendering
    renderArticles() {
        if (!AppState.articles || AppState.articles.length === 0) {
            this.showNoResults();
            return;
        }

        const articlesHTML = AppState.articles.map((article, index) => 
            this.createNewsCard(article, index)
        ).join('');

        Elements.newsContainer.innerHTML = articlesHTML;
        
        // Add event listeners to read more buttons
        document.querySelectorAll('.read-more').forEach((btn, index) => {
            btn.addEventListener('click', () => this.openArticleModal(AppState.articles[index]));
        });
    }

    createNewsCard(article, index) {
        const viewClass = AppState.isGridView ? 'grid-view' : 'list-view';
        const imageUrl = article.urlToImage || 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=500&h=300&fit=crop';
        const date = new Date(article.publishedAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const category = article.category || AppState.currentCategory;
        const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

        return `
            <article class="news-card ${viewClass}" role="article">
                <div class="card-image">
                    <img src="${imageUrl}" alt="${article.title || 'News image'}" loading="lazy">
                    <div class="image-overlay"></div>
                    <span class="card-category">${displayCategory}</span>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="card-title">${article.title || 'No title available'}</h3>
                        <p class="card-description">${article.description || 'No description available.'}</p>
                    </div>
                    <div class="card-footer">
                        <div class="card-source">
                            <i class="fas fa-newspaper"></i>
                            <span>${article.source?.name || 'Unknown source'}</span>
                        </div>
                        <div class="card-date">${formattedDate}</div>
                    </div>
                    <button class="read-more" data-index="${index}" aria-label="Read full article about ${article.title}">
                        <i class="fas fa-external-link-alt"></i>
                        <span>Read More</span>
                    </button>
                </div>
            </article>
        `;
    }

    // Modal Functions
    openArticleModal(article) {
        const date = new Date(article.publishedAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const content = `
            <div class="article-full">
                <div class="article-meta">
                    <span class="article-source">
                        <i class="fas fa-newspaper"></i>
                        ${article.source?.name || 'Unknown source'}
                    </span>
                    <span class="article-date">
                        <i class="far fa-calendar-alt"></i>
                        ${formattedDate}
                    </span>
                    ${article.author ? `<span class="article-author">
                        <i class="fas fa-user-edit"></i>
                        ${article.author}
                    </span>` : ''}
                </div>
                
                <div class="article-image">
                    <img src="${article.urlToImage || 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800&h=400&fit=crop'}" 
                         alt="${article.title}" loading="lazy">
                </div>
                
                <div class="article-body">
                    <h2>${article.title}</h2>
                    <p class="article-lead">${article.description || ''}</p>
                    <div class="article-content">
                        <p>${article.content || 'Full content not available. Please visit the source website to read the complete article.'}</p>
                    </div>
                </div>
                
                <div class="article-actions">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="btn-visit-source">
                        <i class="fas fa-external-link-alt"></i>
                        Visit Source Website
                    </a>
                    <button class="btn-close-modal" onclick="app.closeModal()">
                        <i class="fas fa-times"></i>
                        Close
                    </button>
                </div>
            </div>
        `;

        Elements.modalTitle.textContent = article.title || 'Article Details';
        Elements.modalBody.innerHTML = content;
        Elements.articleModal.style.display = 'block';
        Elements.articleModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        Elements.articleModal.style.display = 'none';
        Elements.articleModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Stats and Updates
    updateStats() {
        Elements.articleCount.textContent = AppState.articles.length;
        Elements.sourceCount.textContent = AppState.sources.size;
    }

    updateSources() {
        AppState.sources.clear();
        AppState.articles.forEach(article => {
            if (article.source?.name) {
                AppState.sources.add(article.source.name);
            }
        });
    }

    updateTrendingTopics() {
        // Extract keywords from article titles
        const keywords = new Map();
        
        AppState.articles.forEach(article => {
            if (article.title) {
                const words = article.title.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
                words.forEach(word => {
                    if (!['about', 'their', 'would', 'could', 'should'].includes(word)) {
                        keywords.set(word, (keywords.get(word) || 0) + 1);
                    }
                });
            }
        });

        // Get top 5 keywords
        const topKeywords = Array.from(keywords.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);

        // If not enough keywords, add defaults
        const defaultTopics = ['technology', 'politics', 'sports', 'health', 'business'];
        while (topKeywords.length < 5) {
            const topic = defaultTopics[topKeywords.length];
            if (!topKeywords.includes(topic)) {
                topKeywords.push(topic);
            }
        }

        const topicsHTML = topKeywords.map(topic => `
            <div class="topic" role="button" tabindex="0" onclick="app.searchTopic('${topic}')" onkeypress="if(event.key==='Enter') app.searchTopic('${topic}')">
                <i class="fas fa-hashtag"></i>
                <span>${topic.charAt(0).toUpperCase() + topic.slice(1)}</span>
            </div>
        `).join('');

        Elements.trendingTopics.innerHTML = topicsHTML;
    }

    searchTopic(topic) {
        Elements.searchInput.value = topic;
        this.handleSearch();
    }

    updateLastUpdated() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        Elements.lastUpdated.textContent = timeString;
        AppState.lastUpdate = now;
    }

    // UI State Management
    setLoadingState(isLoading) {
        AppState.isLoading = isLoading;
        if (isLoading) {
            Elements.loadingState.classList.remove('hidden');
        } else {
            Elements.loadingState.classList.add('hidden');
        }
    }

    showNoResults() {
        Elements.newsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-search" style="color: var(--text-light);"></i>
                <h2>No articles found</h2>
                <p>Try a different search term or category</p>
                <button onclick="app.clearSearch()" class="refresh-btn" style="margin-top: 1rem;">
                    <i class="fas fa-times"></i>
                    Clear Search
                </button>
            </div>
        `;
    }

    showError(message) {
        Elements.newsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Something went wrong</h2>
                <p>${message}</p>
                <button onclick="app.loadNews()" class="refresh-btn" style="margin-top: 1rem;">
                    <i class="fas fa-redo-alt"></i>
                    Try Again
                </button>
            </div>
        `;
    }

    showToast(message, type = 'info') {
        const toast = Elements.toast;
        toast.textContent = message;
        toast.className = 'toast';
        
        // Add type class
        if (type === 'warning') {
            toast.style.background = 'var(--warning-color)';
        } else if (type === 'error') {
            toast.style.background = 'var(--error-color)';
        } else if (type === 'success') {
            toast.style.background = 'var(--success-color)';
        }
        
        toast.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NewsAggregator();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NewsAggregator };
}