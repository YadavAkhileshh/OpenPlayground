// ===============================
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
// ===============================

// ===============================
// Configuration
// ===============================
const CONFIG = {
    ITEMS_PER_PAGE: 12,
    ANIMATION_DURATION: 300
};

// ===============================
// State Management
// ===============================
let state = {
    allProjects: [],
    filteredProjects: [],
    currentPage: 1,
    currentCategory: 'all',
    currentSort: 'default',
    searchQuery: '',
    viewMode: 'card', // 'card' or 'list'
    itemsShown: CONFIG.ITEMS_PER_PAGE,
    initialized: false
};

// ===============================
// DOM Elements (lazy getters)
// ===============================
function getElements() {
    return {
        searchInput: document.getElementById('project-search'),
        searchBox: document.getElementById('search-box'),
        searchClear: document.getElementById('search-clear'),
        sortSelect: document.getElementById('project-sort'),
        projectsGrid: document.getElementById('projects-grid'),
        projectsList: document.getElementById('projects-list'),
        emptyState: document.getElementById('empty-state'),
        viewMoreContainer: document.getElementById('view-more-container'),
        viewMoreBtn: document.getElementById('view-more-btn'),
        remainingCount: document.getElementById('remaining-count'),
        cardViewBtn: document.getElementById('card-view-btn'),
        listViewBtn: document.getElementById('list-view-btn'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        randomBtn: document.getElementById('random-project-btn'),
        projectCount: document.getElementById('project-count')
    };
}

// ===============================
// Utility Functions
// ===============================
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===============================
// Data Fetching
// ===============================
async function fetchProjects() {
    const elements = getElements();

    try {
        const response = await fetch('./projects.json');
        if (!response.ok) throw new Error('Failed to fetch projects');

        state.allProjects = await response.json();

        // Remove duplicates by title
        const seen = new Set();
        state.allProjects = state.allProjects.filter(project => {
            if (!project.title || !project.link) return false;
            const key = project.title.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Update project count in hero
        if (elements.projectCount) {
            elements.projectCount.textContent = `${state.allProjects.length}+`;
        }

        console.log(`✅ Loaded ${state.allProjects.length} projects`);
        filterAndRenderProjects();

    } catch (error) {
        console.error('❌ Failed to load projects:', error);
        if (elements.projectsGrid) {
            elements.projectsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">
                    <p>Failed to load projects. Please refresh the page.</p>
                </div>
            `;
        }
    }
}

// ===============================
// Filtering & Sorting
// ===============================
function filterAndRenderProjects() {
    let projects = [...state.allProjects];

    // Apply search filter
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        projects = projects.filter(p =>
            p.title?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query) ||
            p.tech?.some(t => t.toLowerCase().includes(query))
        );
    }

    // Apply category filter
    if (state.currentCategory && state.currentCategory !== 'all') {
        projects = projects.filter(p =>
            p.category?.toLowerCase() === state.currentCategory.toLowerCase()
        );
    }

    // Apply sorting
    switch (state.currentSort) {
        case 'az':
            projects.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            break;
        case 'za':
            projects.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
            break;
        case 'newest':
            projects.reverse();
            break;
    }

    state.filteredProjects = projects;
    renderProjects();
}

// ===============================
// Rendering
// ===============================
function renderProjects() {
    const elements = getElements();

    const projectsToShow = state.filteredProjects.slice(0, state.itemsShown);
    const remaining = Math.max(0, state.filteredProjects.length - state.itemsShown);

    // Handle empty state
    if (projectsToShow.length === 0) {
        if (elements.projectsGrid) elements.projectsGrid.innerHTML = '';
        if (elements.projectsList) elements.projectsList.innerHTML = '';
        if (elements.emptyState) elements.emptyState.style.display = 'block';
        if (elements.viewMoreContainer) elements.viewMoreContainer.style.display = 'none';
        return;
    }

    if (elements.emptyState) elements.emptyState.style.display = 'none';

    // ALWAYS render BOTH views (so switching is instant)
    if (elements.projectsGrid) {
        renderCardView(elements.projectsGrid, projectsToShow);
    }
    if (elements.projectsList) {
        renderListView(elements.projectsList, projectsToShow);
    }

    // Toggle visibility based on current view mode
    if (elements.projectsGrid) {
        elements.projectsGrid.style.display = state.viewMode === 'card' ? 'grid' : 'none';
    }
    if (elements.projectsList) {
        elements.projectsList.style.display = state.viewMode === 'list' ? 'flex' : 'none';
    }

    // Update view more button
    updateViewMoreButton(remaining);
}

function renderCardView(container, projects) {
    container.innerHTML = projects.map((project, index) => {
        const isBookmarked = window.bookmarksManager?.isBookmarked?.(project.title) || false;
        const techHtml = project.tech?.map(t => `<span>${escapeHtml(t)}</span>`).join('') || '';
        const coverStyle = project.coverStyle || 'background: var(--gradient-primary); color: white;';

        return `
            <a href="${escapeHtml(project.link)}" class="card" data-category="${escapeHtml(project.category || 'utility')}">
                <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                        data-project-title="${escapeHtml(project.title)}" 
                        aria-label="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}"
                        onclick="event.preventDefault(); event.stopPropagation(); window.toggleProjectBookmark(this, '${escapeHtml(project.title)}', '${escapeHtml(project.link)}', '${escapeHtml(project.category || 'utility')}', '${escapeHtml(project.description || '')}');">
                    <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                </button>
                <div class="card-cover" style="${coverStyle}">
                    <i class="${project.icon || 'ri-code-s-slash-line'}"></i>
                </div>
                <div class="card-content">
                    <div class="card-header-flex">
                        <h3 class="card-heading">${escapeHtml(project.title)}</h3>
                        <span class="category-tag">${capitalize(project.category || 'utility')}</span>
                    </div>
                    <p class="card-description">${escapeHtml(project.description || '')}</p>
                    <div class="card-tech">${techHtml}</div>
                </div>
            </a>
        `;
    }).join('');
}

function renderListView(container, projects) {
    container.innerHTML = projects.map((project, index) => {
        const isBookmarked = window.bookmarksManager?.isBookmarked?.(project.title) || false;
        const coverStyle = project.coverStyle || 'background: var(--gradient-primary); color: white;';

        return `
            <div class="list-card">
                <div class="list-card-icon" style="${coverStyle}">
                    <i class="${project.icon || 'ri-code-s-slash-line'}"></i>
                </div>
                <div class="list-card-content">
                    <h4 class="list-card-title">${escapeHtml(project.title)}</h4>
                    <p class="list-card-description">${escapeHtml(project.description || '')}</p>
                </div>
                <div class="list-card-meta">
                    <span class="list-card-category">${capitalize(project.category || 'utility')}</span>
                    <div class="list-card-actions">
                        <button class="list-card-btn ${isBookmarked ? 'bookmarked' : ''}" 
                                onclick="window.toggleProjectBookmark(this, '${escapeHtml(project.title)}', '${escapeHtml(project.link)}', '${escapeHtml(project.category || 'utility')}', '${escapeHtml(project.description || '')}');" 
                                title="Bookmark">
                            <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                        </button>
                        <a href="${escapeHtml(project.link)}" class="list-card-btn" title="Open Project">
                            <i class="ri-external-link-line"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateViewMoreButton(remaining) {
    const elements = getElements();

    if (!elements.viewMoreContainer || !elements.viewMoreBtn) return;

    if (remaining > 0) {
        elements.viewMoreContainer.style.display = 'flex';
        if (elements.remainingCount) {
            elements.remainingCount.textContent = `(${remaining} more)`;
        }
    } else {
        elements.viewMoreContainer.style.display = 'none';
    }
}

// ===============================
// Event Handlers
// ===============================
function handleSearch(e) {
    state.searchQuery = e.target.value.trim();
    state.itemsShown = CONFIG.ITEMS_PER_PAGE;

    const elements = getElements();
    // Toggle clear button visibility
    if (elements.searchBox) {
        elements.searchBox.classList.toggle('has-text', state.searchQuery.length > 0);
    }

    filterAndRenderProjects();
}

function handleSort(e) {
    state.currentSort = e.target.value;
    state.itemsShown = CONFIG.ITEMS_PER_PAGE;
    filterAndRenderProjects();
}

function handleFilter(category) {
    state.currentCategory = category;
    state.itemsShown = CONFIG.ITEMS_PER_PAGE;

    // Update active state
    const elements = getElements();
    elements.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });

    filterAndRenderProjects();
}

function handleViewMore() {
    state.itemsShown += CONFIG.ITEMS_PER_PAGE;
    renderProjects();
}

function handleViewToggle(mode) {
    state.viewMode = mode;

    const elements = getElements();
    // Update button states
    if (elements.cardViewBtn) elements.cardViewBtn.classList.toggle('active', mode === 'card');
    if (elements.listViewBtn) elements.listViewBtn.classList.toggle('active', mode === 'list');

    renderProjects();
}

function handleRandomProject() {
    if (state.allProjects.length > 0) {
        const randomIndex = Math.floor(Math.random() * state.allProjects.length);
        const randomProject = state.allProjects[randomIndex];
        window.location.href = randomProject.link;
    }
}

function handleClearSearch() {
    const elements = getElements();
    if (elements.searchInput) {
        elements.searchInput.value = '';
        state.searchQuery = '';
        if (elements.searchBox) elements.searchBox.classList.remove('has-text');
        filterAndRenderProjects();
    }
}

// Global function for bookmark toggle
window.toggleProjectBookmark = function (btn, title, link, category, description) {
    if (!window.bookmarksManager) {
        console.warn('Bookmarks manager not initialized');
        return;
    }

    const project = { title, link, category, description };
    const isNowBookmarked = window.bookmarksManager.toggleBookmark(project);
    const icon = btn.querySelector('i');

    btn.classList.toggle('bookmarked', isNowBookmarked);
    if (icon) icon.className = isNowBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';

    // Show toast
    showToast(isNowBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
};

function showToast(message) {
    const existingToast = document.querySelector('.bookmark-toast');
    if (existingToast) existingToast.remove();

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
// Initialization
// ===============================
function initEventListeners() {
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
window.ProjectManager = ProjectManager;

// Also listen for component loaded event
document.addEventListener('componentLoaded', (e) => {
    if (e.detail && e.detail.component === 'projects') {
        console.log('Projects component loaded, initializing...');
        setTimeout(initApp, 100); // Small delay to ensure DOM is ready
    }
});

// Fallback initialization
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!state.initialized && state.allProjects.length === 0) {
            console.log('Fallback initialization...');
            initApp();
        }
    }, 1500);
});

// ===============================
// Theme Toggle
// ===============================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

initTheme();

console.log('%c🚀 OpenPlayground - https://github.com/YadavAkhileshh/OpenPlayground', 'color:#6366f1;font-size:14px;font-weight:bold;');
 main
