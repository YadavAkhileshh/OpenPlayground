// ===============================
// OpenPlayground - Unified App Logic
// ===============================

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";
import {keyevents} from "./core/Shortcut.js"

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
     * Data Management - NEW MODULAR SYSTEM
     * Each project has its own project.json file
     * ----------------------------------------------------------- */
    async fetchProjects() {
        try {
            // Try new modular system first (project-manifest.json)
            let projects = await this.fetchFromManifest();

            // Fallback to legacy projects.json if manifest fails
            if (!projects || projects.length === 0) {
                console.log('⚠️ Manifest not found, trying legacy projects.json...');
                projects = await this.fetchFromLegacyJson();
            }

            // Deduplicate projects
            const seen = new Set();
            this.state.allProjects = projects.filter(project => {
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
                    `<div class="error-msg">Failed to load projects. Please refresh.</div>`;
            }
        }
    }

    /**
     * Fetch projects using the new manifest system
     * Each project has its own project.json file
     */
    async fetchFromManifest() {
        try {
            const manifestResponse = await fetch('./project-manifest.json');
            if (!manifestResponse.ok) return null;

            const manifest = await manifestResponse.json();
            console.log(`📋 Loading ${manifest.count} projects from manifest...`);

            // Load all individual project.json files in parallel
            const projectPromises = manifest.projects.map(async (entry) => {
                try {
                    const response = await fetch(entry.path);
                    if (!response.ok) return null;

                    const projectData = await response.json();
                    // Add the link from manifest (ensures correct path)
                    projectData.link = entry.link;
                    return projectData;
                } catch (e) {
                    console.warn(`⚠️ Failed to load ${entry.folder}/project.json`);
                    return null;
                }
            });

            const results = await Promise.all(projectPromises);
            return results.filter(p => p !== null);

        } catch (e) {
            console.warn('Manifest load failed:', e.message);
            return null;
        }
    }

    /**
     * Fallback: Load from legacy centralized projects.json
     */
    async fetchFromLegacyJson() {
        try {
            const response = await fetch('./projects.json');
            if (!response.ok) throw new Error('Failed to fetch projects');
            return await response.json();
        } catch (e) {
            console.error('Legacy JSON failed:', e.message);
            return [];
        }
    }

    /* -----------------------------------------------------------
     * Event Handling
     * ----------------------------------------------------------- */
    setupEventListeners() {
        const el = this.elements;

        if (el.searchInput) {
            el.searchInput.addEventListener('input', (e) => {
                this.state.visibilityEngine?.setSearchQuery(e.target.value);
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
                    el.filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filter = btn.dataset.filter;
                    this.state.visibilityEngine?.setCategory(filter);
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

        // Sorting
        const sortMode = el.sortSelect?.value || 'default';
        if (sortMode === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortMode === 'za') filtered.sort((a, b) => b.title.localeCompare(a.title));
        else if (sortMode === 'newest') filtered.reverse();

        // Pagination
        const totalPages = Math.ceil(filtered.length / this.config.ITEMS_PER_PAGE);
        const start = (this.state.currentPage - 1) * this.config.ITEMS_PER_PAGE;
        const pageItems = filtered.slice(start, start + this.config.ITEMS_PER_PAGE);

        // Grid/List display management
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

        if (this.state.viewMode === 'card' && el.projectsGrid) {
            this.renderCardView(el.projectsGrid, pageItems);
        } else if (this.state.viewMode === 'list' && el.projectsList) {
            this.renderListView(el.projectsList, pageItems);
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
                        <div class="list-card-header">
                            <h3 class="list-card-title">${this.escapeHtml(project.title)}</h3>
                            <span class="category-tag">${this.capitalize(project.category)}</span>
                        </div>
                        <p class="list-card-description">${this.escapeHtml(project.description || '')}</p>
                    </div>
                    <div class="list-card-actions">
                        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}"
                                onclick="window.toggleProjectBookmark(this, '${this.escapeHtml(project.title)}', '${this.escapeHtml(project.link)}', '${this.escapeHtml(project.category)}', '${this.escapeHtml(project.description || '')}');"
                                title="${isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}">
                            <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                        </button>
                        <a href="${project.link}" class="view-btn" title="View Project">
                            <i class="ri-arrow-right-line"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPagination(totalPages) {
        const container = this.elements.paginationContainer;
        if (!container) return;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button class="pagination-btn" ${this.state.currentPage === 1 ? 'disabled' : ''} 
                    onclick="window.projectManagerInstance.goToPage(${this.state.currentPage - 1})">
                <i class="ri-arrow-left-s-line"></i>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.state.currentPage - 2 && i <= this.state.currentPage + 2)) {
                html += `<button class="pagination-btn ${i === this.state.currentPage ? 'active' : ''}" 
                         onclick="window.projectManagerInstance.goToPage(${i})">${i}</button>`;
            } else if (i === this.state.currentPage - 3 || i === this.state.currentPage + 3) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }

        html += `
            <button class="pagination-btn" ${this.state.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="window.projectManagerInstance.goToPage(${this.state.currentPage + 1})">
                <i class="ri-arrow-right-s-line"></i>
            </button>
        `;

        container.innerHTML = html;
    }

    goToPage(page) {
        this.state.currentPage = page;
        this.render();
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    }

    /* -----------------------------------------------------------
     * Helper Methods
     * ----------------------------------------------------------- */
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    getSourceCodeUrl(link) {
        if (!link) return '#';
        const folderMatch = link.match(/\.\/projects\/([^/]+)\//);
        if (folderMatch) {
            return `https://github.com/YadavAkhileshh/OpenPlayground/tree/main/projects/${encodeURIComponent(folderMatch[1])}`;
        }
        return link;
    }
}

/* -----------------------------------------------------------
 * GitHub Contributors
 * ----------------------------------------------------------- */
async function fetchContributors() {
    const grid = document.getElementById('contributors-grid');
    if (!grid) return;

    try {
        const response = await fetch('https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors?per_page=100');
        const contributors = await response.json();

        const humanContributors = contributors.filter(c => !c.login.includes('[bot]'));

        grid.innerHTML = humanContributors.map(c => `
            <a href="${c.html_url}" target="_blank" rel="noopener" class="contributor-card">
                <img src="${c.avatar_url}" alt="${c.login}" loading="lazy" class="contributor-avatar">
                <span class="contributor-name">${c.login}</span>
                <span class="contributor-contributions">${c.contributions} commits</span>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error fetching contributors:', error);
        grid.innerHTML = '<p class="error-msg">Unable to load contributors</p>';
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
    keyevents();
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
