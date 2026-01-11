// ===============================
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

        // Sort alphabetically by title (case-insensitive)
        state.allProjects.sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            return titleA.localeCompare(titleB);
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
            </a>
        `;
    }).join('');

    // Add audio listeners to new cards
    setTimeout(() => {
        container.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', () => window.audioManager?.playHover());
            card.addEventListener('click', () => window.audioManager?.playClick());
        });
    }, 0);
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

    // Add audio listeners to new list items
    setTimeout(() => {
        container.querySelectorAll('.list-card').forEach(card => {
            card.addEventListener('mouseenter', () => window.audioManager?.playHover());
            card.addEventListener('click', () => window.audioManager?.playClick());
        });
    }, 0);
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



    if (state.searchQuery.length > 0) {
        window.audioManager?.playClick();
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



    window.audioManager?.playClick();
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

        window.audioManager?.playError(); // Distinct sound for clearing
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



    if (isNowBookmarked) {
        window.audioManager?.playSuccess();
    } else {
        window.audioManager?.playClick();
    }

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
    }
}

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

// ===============================
// Degradation System (Meta-Narrative)
// ===============================
class DegradationManager {
    constructor() {
        this.maxLevel = 5;
        this.clickThreshold = 15; // Clicks per level
        this.timeThreshold = 60000; // Milliseconds per level (1 min)

        this.state = {
            level: 0,
            clicks: 0,
            startTime: Date.now(),
            ...JSON.parse(localStorage.getItem('degradationState') || '{}')
        };

        // Reset start time on new session if not persisting strictly
        if (!localStorage.getItem('degradationState')) {
            this.state.startTime = Date.now();
        }

        this.init();
    }

    init() {
        this.bindEvents();
        this.checkLevel();
        this.applyEffects();

        // Periodic check for time-based degradation
        setInterval(() => this.checkLevel(), 10000);

        // Expose global reset
        window.resetDegradation = () => this.reset();
    }

    bindEvents() {
        document.addEventListener('click', () => {
            this.state.clicks++;
            this.saveState();
            this.checkLevel();
        });
    }

    checkLevel() {
        const timeElapsed = Date.now() - this.state.startTime;
        const clickLevel = Math.floor(this.state.clicks / this.clickThreshold);
        const timeLevel = Math.floor(timeElapsed / this.timeThreshold);

        // Level is determined by whichever is higher
        const newLevel = Math.min(Math.max(clickLevel, timeLevel), this.maxLevel);

        if (newLevel !== this.state.level) {
            this.state.level = newLevel;
            this.saveState();
            this.applyEffects();

            if (newLevel > 0) {
                console.log(`⚠️ System Integrity Dropping... Level ${newLevel}`);
            }
        }
    }

    saveState() {
        localStorage.setItem('degradationState', JSON.stringify(this.state));
    }

    applyEffects() {
        // Remove existing level classes
        document.body.classList.forEach(cls => {
            if (cls.startsWith('degradation-level-')) {
                document.body.classList.remove(cls);
            }
        });

        // Apply new level
        if (this.state.level > 0) {
            document.body.classList.add(`degradation-level-${this.state.level}`);
        }

        // Dynamic random glitch injection for higher levels
        if (this.state.level >= 3) {
            this.startGlitchEffects();
        }
    }

    startGlitchEffects() {
        // Clear any existing interval
        if (this.glitchInterval) clearInterval(this.glitchInterval);

        // Frequency increases with level
        const frequency = Math.max(500, 3000 - (this.state.level * 500));

        this.glitchInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                const elements = document.querySelectorAll('h1, h2, h3, p, a, button');
                if (elements.length) {
                    const el = elements[Math.floor(Math.random() * elements.length)];
                    el.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;

                    setTimeout(() => {
                        el.style.transform = '';
                    }, 150);
                }
            }
        }, frequency);
    }

    reset() {
        this.state = {
            level: 0,
            clicks: 0,
            startTime: Date.now()
        };
        this.saveState();
        this.applyEffects();
        if (this.glitchInterval) clearInterval(this.glitchInterval);

        // Visual feedback for reset
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0; background: #fff; z-index: 99999;
            opacity: 0; transition: opacity 0.5s; pointer-events: none;
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.style.opacity = 0.8);
        setTimeout(() => {
            overlay.style.opacity = 0;
            setTimeout(() => overlay.remove(), 500);
        }, 500);

        console.log('✅ System Integrity Restored.');
    }
}

// Initialize
window.degradationManager = new DegradationManager();

console.log('%c🚀 OpenPlayground - https://github.com/YadavAkhileshh/OpenPlayground', 'color:#6366f1;font-size:14px;font-weight:bold;');
