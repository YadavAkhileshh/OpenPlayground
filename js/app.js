// ===============================
// OpenPlayground - Unified App Logic
// ===============================

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";

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
            viewMode: 'card',
            currentPage: 1,
            initialized: false
        };

        this.elements = null;

        window.projectManagerInstance = this;
    }

    async init() {
        if (this.state.initialized) return;

        console.log("🚀 ProjectManager: Initializing...");

        // Cache DOM elements once
        this.elements = this.getElements();

        this.setupEventListeners();
        await this.fetchProjects();

        this.state.initialized = true;
        console.log("✅ ProjectManager: Ready.");
    }

    /* -----------------------------------------------------------
     * DOM Element Selection (cached once)
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

            const seen = new Set();
            this.state.allProjects = data.filter(project => {
                if (!project.title || !project.link) return false;
                const key = project.title.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            if (this.elements.projectCount) {
                this.elements.projectCount.textContent = `${this.state.allProjects.length}+`;
            }

            this.state.visibilityEngine = new ProjectVisibilityEngine(this.state.allProjects);
            this.state.visibilityEngine.state.itemsPerPage = this.config.ITEMS_PER_PAGE;

            console.log(`📦 Loaded ${this.state.allProjects.length} projects.`);
            this.render();

        } catch (error) {
            console.error('❌ ProjectManager Error:', error);
            if (this.elements.projectsGrid) {
                this.elements.projectsGrid.innerHTML =
                    `<div class="error-msg">Failed to load projects.</div>`;
            }
        }
    }

    /* -----------------------------------------------------------
     * Event Handling
     * ----------------------------------------------------------- */
    setupEventListeners() {
        const el = this.elements;

        if (el.searchInput) {
            el.searchInput.addEventListener('input', (e) => {
                this.state.visibilityEngine.setSearchQuery(e.target.value);
                this.state.currentPage = 1;
                this.render();
            });
        }

        if (el.sortSelect) {
            el.sortSelect.addEventListener('change', () => {
                this.state.currentPage = 1;
                this.render();
            });
        }

        if (el.filterBtns) {
            el.filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    el.filterBtns.forEach(b => b.classList.toggle('active', b === btn));
                    this.state.visibilityEngine.setCategory(btn.dataset.filter);
                    this.state.currentPage = 1;
                    this.render();
                });
            });
        }

        if (el.cardViewBtn && el.listViewBtn) {
            el.cardViewBtn.addEventListener('click', () => this.setViewMode('card'));
            el.listViewBtn.addEventListener('click', () => this.setViewMode('list'));
        }
    }

    setViewMode(mode) {
        this.state.viewMode = mode;
        const el = this.elements;

        el.cardViewBtn?.classList.toggle('active', mode === 'card');
        el.listViewBtn?.classList.toggle('active', mode === 'list');

        this.render();
    }

    /* -----------------------------------------------------------
     * Rendering Logic
     * ----------------------------------------------------------- */
    render() {
        if (!this.state.visibilityEngine) return;

        const el = this.elements;

        this.state.visibilityEngine.setPage(this.state.currentPage);
        let filtered = this.state.visibilityEngine.getVisibleProjects();

        const sortMode = el.sortSelect?.value || 'default';
        if (sortMode === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortMode === 'za') filtered.sort((a, b) => b.title.localeCompare(a.title));
        else if (sortMode === 'newest') filtered.reverse();

        const totalPages = Math.ceil(filtered.length / this.config.ITEMS_PER_PAGE);
        const start = (this.state.currentPage - 1) * this.config.ITEMS_PER_PAGE;
        const pageItems = filtered.slice(start, start + this.config.ITEMS_PER_PAGE);

        if (el.projectsGrid) {
            el.projectsGrid.style.display = this.state.viewMode === 'card' ? 'grid' : 'none';
            el.projectsGrid.innerHTML = '';
        }
        if (el.projectsList) {
            el.projectsList.style.display = this.state.viewMode === 'list' ? 'flex' : 'none';
            el.projectsList.innerHTML = '';
        }

        if (pageItems.length === 0) {
            if (el.emptyState) el.emptyState.style.display = 'block';
            this.renderPagination(0);
            return;
        }

        if (el.emptyState) el.emptyState.style.display = 'none';

        if (this.state.viewMode === 'card') {
            this.renderCardView(el.projectsGrid, pageItems);
        } else {
            this.renderListView(el.projectsList, pageItems);
        }

        this.renderPagination(totalPages);
    }

    renderCardView(container, projects) {
        if (!container) return;
        container.innerHTML = projects.map(project => {
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
        if (!container) return;
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
        const container = this.elements.paginationContainer;
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = '';

        html += `<button class="pagination-btn" ${this.state.currentPage === 1 ? 'disabled' : ''} id="pagination-prev">
                    <i class="ri-arrow-left-s-line"></i>
                 </button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.state.currentPage - 1 && i <= this.state.currentPage + 1)) {
                html += `<button class="pagination-btn ${i === this.state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.state.currentPage - 2 || i === this.state.currentPage + 2) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }

        html += `<button class="pagination-btn" ${this.state.currentPage === totalPages ? 'disabled' : ''} id="pagination-next">
                    <i class="ri-arrow-right-s-line"></i>
                 </button>`;

        container.innerHTML = html;

        container.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.currentPage = parseInt(btn.dataset.page);
                this.render();
                this.scrollToTop();
            });
        });

        container.querySelector('#pagination-prev')?.addEventListener('click', () => {
            if (this.state.currentPage > 1) {
                this.state.currentPage--;
                this.render();
                this.scrollToTop();
            }
        });

        container.querySelector('#pagination-next')?.addEventListener('click', () => {
            if (this.state.currentPage < totalPages) {
                this.state.currentPage++;
                this.render();
                this.scrollToTop();
            }
        });
    }

    scrollToTop() {
        const section = document.getElementById('projects');
        if (!section) return;

        window.scrollTo({
            top: section.offsetTop - 75,
            behavior: 'smooth'
        });
    }

    /* -----------------------------------------------------------
     * Utilities
     * ----------------------------------------------------------- */
    capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    getSourceCodeUrl(link) {
        if (!link) return 'https://github.com/YadavAkhileshh/OpenPlayground';

        let path = link.startsWith('./') ? link.slice(2) : link;
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

    const icon = btn.querySelector('i');
    btn.classList.toggle('bookmarked', isNowBookmarked);
    if (icon) icon.className = isNowBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';

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

console.log('%c🚀 OpenPlayground Unified Logic Active', 'color:#6366f1;font-weight:bold;');
