// ===============================
 filter-button
 filter-button
// Global State
// ===============================
const itemsPerPage = 1000; // All projects on one page
let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";
let allProjectsData = [];

// ===============================
// Initialization
// ===============================
window.addEventListener('load', () => {
    setTimeout(() => {
        initializeApp();
    }, 500);
});

function initializeApp() {
    console.log("🚀 Initializing App...");
    fetchProjects();
    setupTheme();
    setupMobileNav();
    setupEventListeners();
}

// ===============================
// Data Fetching
// ===============================
async function fetchProjects() {
    try {
        // Cache Buster: Forces browser to load the new 73-item file
        const uniqueUrl = "./projects.json?v=" + Date.now();
        const response = await fetch(uniqueUrl);
        
        if (!response.ok) throw new Error("projects.json not found");
        
        const data = await response.json();
        allProjectsData = data;
        
        console.log(`✅ Loaded ${data.length} projects.`);
        
        updateCategoryCounts();
        renderProjects();
        
    } catch (error) {
        console.error("❌ Error:", error);
        const container = document.querySelector(".projects-container");
        if(container) container.innerHTML = `<div class="empty-state"><h3>Error loading projects</h3><p>${error.message}</p></div>`;
    }
}

// ===============================
// STRICT CATEGORY LOGIC (FIXED)
// ===============================
function projectMatchesCategory(project, filterCategory) {
    const filter = filterCategory.toLowerCase().trim();
    // Only look at the category label
    const pCat = project.category ? project.category.toLowerCase().trim() : "uncategorized";

    if (filter === "all") return true;

    // --- RULES ---

    // 1. GAME Button: Acts as a "Master" category for all games
    // It matches "Game", "Action", "Strategy", "Puzzle"
    if (filter === "game") {
        return pCat.includes("game") || pCat.includes("action") || pCat.includes("strategy") || pCat.includes("puzzle");
    }

    // 2. UTILITY Button: Matches "Utility" or "Tool"
    if (filter === "utility") {
        return pCat.includes("utility") || pCat.includes("tool");
    }

    // 3. ALL OTHER BUTTONS (Action, Strategy, Puzzle)
    // STRICT MATCH: The project label must contain the filter name.
    // Example: "Action" button will ONLY show "Action" or "Action Game".
    // It will NOT show "Tic Tac Toe" (which is just "Game").
    return pCat.includes(filter);
}

// ===============================
// Rendering Logic
// ===============================
function renderProjects() {
    const projectsContainer = document.querySelector(".projects-container");
    if (!projectsContainer) return;

    let filteredProjects = [...allProjectsData];

    // 1. Search Filter
    const searchInput = document.getElementById("project-search");
    if (searchInput && searchInput.value.trim() !== "") {
        const query = searchInput.value.toLowerCase().trim();
        filteredProjects = filteredProjects.filter(project => 
            project.title.toLowerCase().includes(query)
        );
    }

    // 2. Category Filter
    if (currentCategory !== "all") {
        filteredProjects = filteredProjects.filter(project => 
            projectMatchesCategory(project, currentCategory)
        );
    }

    // 3. Sorting
    switch (currentSort) {
        case "az": filteredProjects.sort((a, b) => a.title.localeCompare(b.title)); break;
        case "za": filteredProjects.sort((a, b) => b.title.localeCompare(a.title)); break;
        case "newest": filteredProjects.reverse(); break;
    }

    // 4. Render
    projectsContainer.innerHTML = "";

    if (filteredProjects.length === 0) {
        projectsContainer.innerHTML = `<div class="empty-state" style="text-align:center; padding:2rem;"><h3>No projects found!</h3></div>`;
        return;
    }

    filteredProjects.forEach((project, index) => {
        const card = document.createElement("a");
        card.href = project.link;
        card.className = "card";
        
        let coverAttr = 'class="card-cover"';
        if (project.coverClass) coverAttr = `class="card-cover ${project.coverClass}"`;
        else if (project.coverStyle) coverAttr = `class="card-cover" style="${project.coverStyle}"`;
        
        const techStackHtml = project.tech ? project.tech.map(t => `<span>${t}</span>`).join("") : "";
        const isBookmarked = window.bookmarksManager && window.bookmarksManager.isBookmarked(project.title);

        card.innerHTML = `
            <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-project-title="${escapeHtml(project.title)}">
                <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
            </button>
            <div ${coverAttr}><i class="${project.icon}"></i></div>
            <div class="card-content">
                <div class="card-header-flex">
                    <h3 class="card-heading">${project.title}</h3>
                    <span class="category-tag">${capitalize(project.category)}</span>
                </div>
                <p class="card-description">${project.description}</p>
                <div class="card-tech">${techStackHtml}</div>
            </div>
        `;

        const bBtn = card.querySelector('.bookmark-btn');
        if(bBtn) bBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(window.bookmarksManager) {
                const isNow = window.bookmarksManager.toggleBookmark(project);
                bBtn.querySelector('i').className = isNow ? 'ri-bookmark-fill' : 'ri-bookmark-line';
                bBtn.classList.toggle('bookmarked', isNow);
            }
        });

        projectsContainer.appendChild(card);
        card.style.opacity = "1"; 
        card.style.transform = "translateY(0)";
    });
    
    const paginationContainer = document.getElementById("pagination-controls");
    if(paginationContainer) paginationContainer.innerHTML = "";
}

// ===============================
// Helper Functions
// ===============================
function updateCategoryCounts() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const counts = {};
    
    allProjectsData.forEach(project => {
        filterBtns.forEach(btn => {
            const filterKey = btn.dataset.filter;
            if (filterKey === "all") return;
            
            if (projectMatchesCategory(project, filterKey)) {
                counts[filterKey] = (counts[filterKey] || 0) + 1;
            }
        });
    });

    filterBtns.forEach(btn => {
        const key = btn.dataset.filter;
        if (key === "all") {
            btn.innerText = `All (${allProjectsData.length})`;
        } else {
            const count = counts[key] || 0;
            const originalText = btn.dataset.filter;
            const formatted = originalText.charAt(0).toUpperCase() + originalText.slice(1);
            btn.innerText = `${formatted} (${count})`;
        }
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById("project-search");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderProjects();
        });
    }

    const sortSelect = document.getElementById("project-sort");
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentSort = sortSelect.value;
            renderProjects();
        });

// OpenPlayground - Main JavaScript
// Clean, Modular Implementation

// OpenPlayground - Unified App Logic
 main
// ===============================

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";

/**
 * ProjectManager
 * Manages project data fetching, filtering, and rendering.
 * Acts as the centerpiece for the OpenPlayground project hub.
 */
class ProjectManager {
    constructor() {
        // Prevent multiple instances
        if (window.projectManagerInstance) {
            console.log("♻️ ProjectManager: Instance already exists.");
            return window.projectManagerInstance;
        }

        this.config = {
            ITEMS_PER_PAGE: 12,
            ANIMATION_DELAY: 50
        };

        this.state = {
            allProjects: [],
            visibilityEngine: null,
            viewMode: 'card', // 'card' or 'list'
            currentPage: 1,
            initialized: false
        };

        window.projectManagerInstance = this;
    }

    async init() {
        if (this.state.initialized) return;

        console.log("🚀 ProjectManager: Initializing...");

        // Initial setup
        this.setupEventListeners();
        await this.fetchProjects();

        this.state.initialized = true;
        console.log("✅ ProjectManager: Ready.");
    }

    /* -----------------------------------------------------------
     * DOM Element Selection
     * ----------------------------------------------------------- */
    getElements() {
        return {
            projectsGrid: document.getElementById('projects-grid'),
            projectsList: document.getElementById('projects-list'),
            paginationContainer: document.getElementById('pagination-controls'),
            searchInput: document.getElementById('project-search'),
            sortSelect: document.getElementById('project-sort'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            cardViewBtn: document.getElementById('card-view-btn'),
            listViewBtn: document.getElementById('list-view-btn'),
            emptyState: document.getElementById('empty-state'),
            projectCount: document.getElementById('project-count')
        };
    }

    /* -----------------------------------------------------------
     * Data Management
     * ----------------------------------------------------------- */
    async fetchProjects() {
        try {
            const response = await fetch('./projects.json');
            if (!response.ok) throw new Error('Failed to fetch projects');

            const data = await response.json();

            // Deduplicate and validate
            const seen = new Set();
            this.state.allProjects = data.filter(project => {
                if (!project.title || !project.link) return false;
                const key = project.title.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            // Update UI count
            const elements = this.getElements();
            if (elements.projectCount) {
                elements.projectCount.textContent = `${this.state.allProjects.length}+`;
            }

            // Initialize Visibility Engine
            this.state.visibilityEngine = new ProjectVisibilityEngine(this.state.allProjects);
            this.state.visibilityEngine.state.itemsPerPage = this.config.ITEMS_PER_PAGE;

            console.log(`📦 Loaded ${this.state.allProjects.length} projects.`);
            this.render();

        } catch (error) {
            console.error('❌ ProjectManager Error:', error);
            const elements = this.getElements();
            if (elements.projectsGrid) {
                elements.projectsGrid.innerHTML = `<div class="error-msg">Failed to load projects.</div>`;
            }
        }
    }

    /* -----------------------------------------------------------
     * Event Handling
     * ----------------------------------------------------------- */
    setupEventListeners() {
        const elements = this.getElements();

        // Search
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', (e) => {
                this.state.visibilityEngine.setSearchQuery(e.target.value);
                this.state.currentPage = 1;
                this.render();
            });
        }

        // Sort
        if (elements.sortSelect) {
            elements.sortSelect.addEventListener('change', (e) => {
                this.state.currentPage = 1;
                this.render();
            });
        }

        // Category Filters
        if (elements.filterBtns) {
            elements.filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const category = btn.dataset.filter;

                    // Update active class
                    elements.filterBtns.forEach(b => b.classList.toggle('active', b === btn));

                    this.state.visibilityEngine.setCategory(category);
                    this.state.currentPage = 1;
                    this.render();
                });
            });
        }

        // View Toggles
        if (elements.cardViewBtn && elements.listViewBtn) {
            elements.cardViewBtn.addEventListener('click', () => this.setViewMode('card'));
            elements.listViewBtn.addEventListener('click', () => this.setViewMode('list'));
        }
    }

    setViewMode(mode) {
        this.state.viewMode = mode;
        const elements = this.getElements();

        if (elements.cardViewBtn) elements.cardViewBtn.classList.toggle('active', mode === 'card');
        if (elements.listViewBtn) elements.listViewBtn.classList.toggle('active', mode === 'list');

        this.render();
    }

    /* -----------------------------------------------------------
     * Rendering Logic
     * ----------------------------------------------------------- */
    render() {
        const elements = this.getElements();
        if (!this.state.visibilityEngine) return;

        // Sync visibility engine page
        this.state.visibilityEngine.setPage(this.state.currentPage);

        let filtered = this.state.visibilityEngine.getVisibleProjects();

        // Sorting
        const sortMode = elements.sortSelect?.value || 'default';
        if (sortMode === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortMode === 'za') filtered.sort((a, b) => b.title.localeCompare(a.title));
        else if (sortMode === 'newest') filtered.reverse();

        // Pagination Calculations
        const totalPages = Math.ceil(filtered.length / this.config.ITEMS_PER_PAGE);
        const start = (this.state.currentPage - 1) * this.config.ITEMS_PER_PAGE;
        const pageItems = filtered.slice(start, start + this.config.ITEMS_PER_PAGE);

        // Grid/List visibility management
        if (elements.projectsGrid) {
            elements.projectsGrid.style.display = this.state.viewMode === 'card' ? 'grid' : 'none';
            if (this.state.viewMode !== 'card') elements.projectsGrid.innerHTML = '';
        }
        if (elements.projectsList) {
            elements.projectsList.style.display = this.state.viewMode === 'list' ? 'flex' : 'none';
            if (this.state.viewMode !== 'list') elements.projectsList.innerHTML = '';
        }

        // Handle empty state
        if (pageItems.length === 0) {
            if (elements.emptyState) elements.emptyState.style.display = 'block';
            if (elements.projectsGrid) elements.projectsGrid.innerHTML = '';
            if (elements.projectsList) elements.projectsList.innerHTML = '';
            this.renderPagination(0);
            return;
        }

        if (elements.emptyState) elements.emptyState.style.display = 'none';

        // Render appropriate view
        if (this.state.viewMode === 'card') {
            this.renderCardView(elements.projectsGrid, pageItems);
        } else {
            this.renderListView(elements.projectsList, pageItems);
        }

        this.renderPagination(totalPages);
    }

    renderCardView(container, projects) {
        container.innerHTML = projects.map((project) => {
            const isBookmarked = window.bookmarksManager?.isBookmarked(project.title);
            const techHtml = project.tech?.map(t => `<span>${this.escapeHtml(t)}</span>`).join('') || '';
            const coverStyle = project.coverStyle || '';
            const coverClass = project.coverClass || '';

            const sourceUrl = this.getSourceCodeUrl(project.link);

            return `
                <div class="card" data-category="${this.escapeHtml(project.category)}" onclick="window.location.href='${this.escapeHtml(project.link)}'; event.stopPropagation();">
                    <div class="card-actions">
                        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                                data-project-title="${this.escapeHtml(project.title)}" 
                                onclick="event.preventDefault(); event.stopPropagation(); window.toggleProjectBookmark(this, '${this.escapeHtml(project.title)}', '${this.escapeHtml(project.link)}', '${this.escapeHtml(project.category)}', '${this.escapeHtml(project.description || '')}');"
                                title="${isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}">
                            <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                        </button>
                        <a href="${sourceUrl}" target="_blank" class="source-btn" 
                           onclick="event.stopPropagation();" 
                           title="View Source Code">
                            <i class="ri-github-fill"></i>
                        </a>
                    </div>
                    <div class="card-link">
                        <div class="card-cover ${coverClass}" style="${coverStyle}">
                            <i class="${this.escapeHtml(project.icon || 'ri-code-s-slash-line')}"></i>
                        </div>
                        <div class="card-content">
                            <div class="card-header-flex">
                                <h3 class="card-heading">${this.escapeHtml(project.title)}</h3>
                                <span class="category-tag">${this.capitalize(project.category)}</span>
                            </div>
                            <p class="card-description">${this.escapeHtml(project.description || '')}</p>
                            <div class="card-tech">${techHtml}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderListView(container, projects) {
        container.innerHTML = projects.map(project => {
            const isBookmarked = window.bookmarksManager?.isBookmarked(project.title);
            const coverStyle = project.coverStyle || '';
            const coverClass = project.coverClass || '';

            return `
                <div class="list-card">
                    <div class="list-card-icon ${coverClass}" style="${coverStyle}">
                        <i class="${this.escapeHtml(project.icon || 'ri-code-s-slash-line')}"></i>
                    </div>
                    <div class="list-card-content">
                        <h4 class="list-card-title">${this.escapeHtml(project.title)}</h4>
                        <p class="list-card-description">${this.escapeHtml(project.description || '')}</p>
                    </div>
                    <div class="list-card-meta">
                        <span class="list-card-category">${this.capitalize(project.category || 'project')}</span>
                        <div class="list-card-actions">
                            <button class="list-card-btn ${isBookmarked ? 'bookmarked' : ''}" 
                                    onclick="window.toggleProjectBookmark(this, '${this.escapeHtml(project.title)}', '${this.escapeHtml(project.link)}', '${this.escapeHtml(project.category)}', '${this.escapeHtml(project.description || '')}');">
                                <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                            </button>
                            <a href="${this.escapeHtml(project.link)}" class="list-card-btn" title="Open Project">
                                <i class="ri-external-link-line"></i>
                            </a>
                            <a href="${this.getSourceCodeUrl(project.link)}" target="_blank" class="list-card-btn" title="View Source Code">
                                <i class="ri-github-fill"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPagination(totalPages) {
        const container = this.getElements().paginationContainer;
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = '';

        // Prev button
        html += `<button class="pagination-btn" ${this.state.currentPage === 1 ? 'disabled' : ''} id="pagination-prev">
                    <i class="ri-arrow-left-s-line"></i>
                 </button>`;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.state.currentPage - 1 && i <= this.state.currentPage + 1)) {
                html += `<button class="pagination-btn ${i === this.state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.state.currentPage - 2 || i === this.state.currentPage + 2) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }

        // Next button
        html += `<button class="pagination-btn" ${this.state.currentPage === totalPages ? 'disabled' : ''} id="pagination-next">
                    <i class="ri-arrow-right-s-line"></i>
                 </button>`;

        container.innerHTML = html;

        // Events
        container.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.currentPage = parseInt(btn.dataset.page);
                this.render();
                this.scrollToTop();
            });
        });

        const prev = container.querySelector('#pagination-prev');
        if (prev && !prev.disabled) {
            prev.addEventListener('click', () => {
                this.state.currentPage--;
                this.render();
                this.scrollToTop();
            });
        }

        const next = container.querySelector('#pagination-next');
        if (next && !next.disabled) {
            next.addEventListener('click', () => {
                this.state.currentPage++;
                this.render();
                this.scrollToTop();
            });
        }
    }

    scrollToTop() {
        const section = document.getElementById('projects');
        if (section) {
            const navbarHeight = 75;
            window.scrollTo({
                top: section.offsetTop - navbarHeight,
                behavior: 'smooth'
            });
        }
    }

    /* -----------------------------------------------------------
     * Utilities
     * ----------------------------------------------------------- */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    getSourceCodeUrl(link) {
        if (!link) return 'https://github.com/YadavAkhileshh/OpenPlayground';

        let path = link;
        // Remove leading ./
        if (path.startsWith('./')) {
            path = path.slice(2);
        }
        // Remove trailing /index.html or index.html
        path = path.replace(/\/index\.html$/, '').replace(/^index\.html$/, '');

        return `https://github.com/YadavAkhileshh/OpenPlayground/tree/main/${path}`;
    }
}

/**
 * Contributors Fetcher
 */
async function fetchContributors() {
    const grid = document.getElementById('contributors-grid');
    if (!grid) return;

    try {
        const response = await fetch('https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors');
        if (!response.ok) throw new Error('Failed to fetch contributors');

        const contributors = await response.json();

        // Update count if exists
        const count = document.getElementById('contributor-count');
        if (count) count.textContent = `${contributors.length}+`;

        grid.innerHTML = contributors.map(user => `
            <div class="contributor-card">
                <img src="${user.avatar_url}" alt="${user.login}" class="contributor-avatar" loading="lazy">
                <div class="contributor-info">
                    <h3 class="contributor-name">${user.login}</h3>
                    <div class="contributor-stats">
                        <span class="contributor-contributions">
                            <i class="ri-git-commit-line"></i> ${user.contributions} contributions
                        </span>
                    </div>
                </div>
                <a href="${user.html_url}" target="_blank" class="contributor-github-link">
                    <i class="ri-github-fill"></i>
                </a>
            </div>
        `).join('');

    } catch (error) {
        console.warn('Contributors Load Error:', error);
        grid.innerHTML = `<div class="loading-msg">Unable to load contributors.</div>`;
    }
}

/**
 * Global Bookmark Toggle Wrapper
 */
window.toggleProjectBookmark = function (btn, title, link, category, description) {
    if (!window.bookmarksManager) return;

    const project = { title, link, category, description };
    const isNowBookmarked = window.bookmarksManager.toggleBookmark(project);

    // Update button icon
    const icon = btn.querySelector('i');
    btn.classList.toggle('bookmarked', isNowBookmarked);
    if (icon) icon.className = isNowBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';

    // Show toast
    showToast(isNowBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
};

function showToast(message) {
    const existing = document.querySelector('.bookmark-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'bookmark-toast';
    toast.innerHTML = `<i class="ri-bookmark-fill"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ===============================
// Global Initialization
// ===============================
 filter-button
function initCustomDropdown() {
    const wrapper = document.querySelector('.custom-select-wrapper');
    const customSelect = document.querySelector('.custom-select');
    const trigger = document.querySelector('.custom-select-trigger');
    const options = document.querySelectorAll('.custom-option');
    const hiddenSelect = document.getElementById('project-sort');

    if (!wrapper || !trigger || !options.length || !hiddenSelect) return;

    // Toggle dropdown
    trigger.addEventListener('click', () => {
        customSelect.classList.toggle('open');
    });

    // Handle option click
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const text = option.textContent;

            // Update selected class
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Update trigger text
            trigger.querySelector('.selected-text').textContent = text;

            // Update hidden select used by app logic
            hiddenSelect.value = value;
            // Trigger change event for app logic
            hiddenSelect.dispatchEvent(new Event('change'));

            // Close dropdown
            customSelect.classList.remove('open');
        });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });

    // Keyboard support
    trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            customSelect.classList.toggle('open');
        }
    });
}

function initEventListeners() {
    // Initialize custom dropdown
    initCustomDropdown();

    const elements = getElements();

    // Search
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce(handleSearch, 200));
        console.log('✅ Search listener attached');
    }

    // Clear search
    if (elements.searchClear) {
        elements.searchClear.addEventListener('click', handleClearSearch);
    }

    // Sort
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener('change', handleSort);
        console.log('✅ Sort listener attached');
    }

    // Filter buttons
    if (elements.filterBtns.length > 0) {
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
        });
        console.log(`✅ ${elements.filterBtns.length} filter buttons attached`);
    }

    // View more
    if (elements.viewMoreBtn) {
        elements.viewMoreBtn.addEventListener('click', handleViewMore);
        console.log('✅ View more button attached');
    }

    // View toggle
    if (elements.cardViewBtn) {
        elements.cardViewBtn.addEventListener('click', () => handleViewToggle('card'));
        console.log('✅ Card view button attached');
    }
    if (elements.listViewBtn) {
        elements.listViewBtn.addEventListener('click', () => handleViewToggle('list'));
        console.log('✅ List view button attached');
    }

    // Random project
    if (elements.randomBtn) {
        elements.randomBtn.addEventListener('click', handleRandomProject);
    }
}

function initApp() {
    if (state.initialized) {
        console.log('App already initialized');
        return;
    }

    console.log('🚀 Initializing OpenPlayground Projects...');
    initEventListeners();
    fetchProjects();
    state.initialized = true;
}

// ===============================
// ProjectManager Class (for components.js compatibility)
// ===============================
class ProjectManager {
    constructor() {
        console.log('ProjectManager initialized');
        initApp();
 main
    }

 filter-button
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
            newBtn.classList.add("active");
            currentCategory = newBtn.dataset.filter; 
            renderProjects();
        });
    });

    const clearBtn = document.getElementById("clear-filters");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (sortSelect) sortSelect.value = "default";
            currentCategory = "all";
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            const allBtn = document.querySelector('[data-filter="all"]');
            if(allBtn) allBtn.classList.add("active");
            renderProjects();
        });
    }
}

function setupTheme() {
    const toggleBtn = document.getElementById("toggle-mode-btn");
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "light";
    html.setAttribute("data-theme", savedTheme);
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
            html.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }
}

function setupMobileNav() {
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }
}

function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ""; }
function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

// Expose to global scope


// Expose to global scope for components.js compatibility
 main
window.ProjectManager = ProjectManager;
window.fetchContributors = fetchContributors;

// Listen for component load events from components.js
document.addEventListener('componentLoaded', (e) => {
    if (e.detail && e.detail.component === 'projects') {
        const manager = new ProjectManager();
        manager.init();
    }
    if (e.detail && e.detail.component === 'contributors') {
        fetchContributors();
    }
});

// Fade-in animation observer
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
});

 filter-button
console.log('%c🚀 OpenPlayground - https://github.com/YadavAkhileshh/OpenPlayground', 'color:#6366f1;font-size:14px;font-weight:bold;');
 main

console.log('%c🚀 OpenPlayground Unified Logic Active', 'color:#6366f1;font-weight:bold;');
 main
