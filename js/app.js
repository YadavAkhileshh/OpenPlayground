// ===============================
// OpenPlayground - Unified App Logic
// ===============================

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";

/**
 * ProjectManager
 * Manages project data fetching, filtering, and rendering.
 * Acts as the centerpiece for the OpenPlayground project hub.
 */
class ProjectManager {
    constructor() {
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

        this.init();
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
                // Sorting logic handled during render for now
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

        // Sorting (Custom Switch)
        const sortMode = elements.sortSelect?.value || 'default';
        if (sortMode === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortMode === 'za') filtered.sort((a, b) => b.title.localeCompare(a.title));
        else if (sortMode === 'newest') filtered.reverse();

        // Pagination
        const totalPages = Math.ceil(filtered.length / this.config.ITEMS_PER_PAGE);
        const start = (this.state.currentPage - 1) * this.config.ITEMS_PER_PAGE;
        const pageItems = filtered.slice(start, start + this.config.ITEMS_PER_PAGE);

        // Visibility
        if (elements.projectsGrid) elements.projectsGrid.style.display = this.state.viewMode === 'card' ? 'grid' : 'none';
        if (elements.projectsList) elements.projectsList.style.display = this.state.viewMode === 'list' ? 'flex' : 'none';

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
        container.innerHTML = projects.map((project, index) => {
            const isBookmarked = window.bookmarksManager?.isBookmarked(project.title);
            const techHtml = project.tech?.map(t => `<span>${this.escapeHtml(t)}</span>`).join('') || '';
            const coverStyle = project.coverStyle || '';
            const coverClass = project.coverClass || '';

            return `
                <a href="${this.escapeHtml(project.link)}" class="card" data-category="${this.escapeHtml(project.category)}">
                    <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                            data-project-title="${this.escapeHtml(project.title)}" 
                            onclick="event.preventDefault(); event.stopPropagation(); window.toggleProjectBookmark(this, '${this.escapeHtml(project.title)}', '${this.escapeHtml(project.link)}', '${this.escapeHtml(project.category)}', '${this.escapeHtml(project.description || '')}');">
                        <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                    </button>
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
                </a>
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

        // Page numbers (简化的)
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
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

        // Update count
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
    if (typeof showToast === 'function') {
        showToast(isNowBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
    }
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

// Export for window scope
window.ProjectManager = ProjectManager;
window.fetchContributors = fetchContributors;

// Listen for component load events
document.addEventListener('componentLoaded', (e) => {
    if (e.detail && e.detail.component === 'projects') {
        console.log("📍 Projects component loaded, initializing ProjectManager...");
        new ProjectManager();
    }
    if (e.detail && e.detail.component === 'contributors') {
        fetchContributors();
    }
});

// Animation triggers (from user version)
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

console.log('%c🚀 OpenPlayground Unified Logic Active', 'color:#6366f1;font-weight:bold;');