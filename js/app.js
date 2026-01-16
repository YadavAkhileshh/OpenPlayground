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

        el.projectsGrid.style.display = this.state.viewMode === 'card' ? 'grid' : 'none';
        el.projectsList.style.display = this.state.viewMode === 'list' ? 'flex' : 'none';

        el.projectsGrid.innerHTML = '';
        el.projectsList.innerHTML = '';

        if (pageItems.length === 0) {
            el.emptyState.style.display = 'block';
            this.renderPagination(0);
            return;
        }

        el.emptyState.style.display = 'none';

        if (this.state.viewMode === 'card') {
            this.renderCardView(el.projectsGrid, pageItems);
        } else {
            this.renderListView(el.projectsList, pageItems);
        }

        this.renderPagination(totalPages);
    }

    renderCardView(container, projects) {
        container.innerHTML = projects
            .map(project => this.createCardViewMarkup(project))
            .join('');
    }

    renderListView(container, projects) {
        container.innerHTML = projects
            .map(project => this.createListViewMarkup(project))
            .join('');
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
            this.state.currentPage--;
            this.render();
            this.scrollToTop();
        });

        container.querySelector('#pagination-next')?.addEventListener('click', () => {
            this.state.currentPage++;
            this.render();
            this.scrollToTop();
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

/* ---------------- Global exports & listeners remain unchanged ---------------- */

window.ProjectManager = ProjectManager;
