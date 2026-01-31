// ===============================
// OpenPlayground - Unified App Logic
// Feature #1291: Added Analytics Engine Integration
// ===============================

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";
import { keyevents } from "./core/Shortcut.js"
import { deadlineManager } from "./projectDeadlineManager.js";
import { deadlineUI } from "./deadlineUI.js";
import notificationManager from "./core/notificationManager.js";

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
        this.analyticsEngine = window.analyticsEngine || null;
        this.viewportObserver = null; // For tracking card views
        window.projectManagerInstance = this;
    }

    async init() {
        if (this.state.initialized) return;

        console.log("🚀 ProjectManager: Initializing...");

        // Cache DOM elements once
        this.elements = this.getElements();
        this.setupEventListeners();
        await this.fetchProjects();

        // Initialize analytics integration
        this.initializeAnalytics();

        // Setup viewport observer for tracking card views
        this.setupViewportObserver();

        this.state.initialized = true;
        console.log("✅ ProjectManager: Ready.");
    }

    /**
     * Initialize analytics engine integration
     */
    initializeAnalytics() {
        // Get analytics engine from global scope
        this.analyticsEngine = window.analyticsEngine || null;

        if (this.analyticsEngine && this.state.visibilityEngine) {
            // Connect analytics to visibility engine
            this.state.visibilityEngine.setAnalyticsEngine(this.analyticsEngine);
            console.log("📊 Analytics Engine connected to ProjectManager");
        }
    }

    /**
     * Setup IntersectionObserver for tracking card views
     */
    setupViewportObserver() {
        if (!this.analyticsEngine) return;

        this.viewportObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const projectId = entry.target.dataset.projectId;
                    if (projectId) {
                        this.analyticsEngine.trackView(projectId);
                    }
                }
            });
        }, { threshold: 0.5 }); // 50% visible
    }

    /**
     * Track project click for analytics
     */
    trackProjectClick(project) {
        if (!this.analyticsEngine) return;

        const projectId = project.folder || project.name || project.title;
        this.analyticsEngine.trackClick(projectId, {
            category: project.category,
            title: project.title
        });
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
            randomProjectBtn: document.getElementById('random-project-btn'),
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

            // Load state from URL after engine is ready
            this.loadURLState();

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
            // Enhanced mobile search with debouncing and suggestions
            let searchTimeout;

            el.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300); // Debounce for better performance
            });

            // Enter key support
            el.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch(e.target.value);
                }
                if (e.key === 'Escape') {
                    e.target.value = '';
                    this.handleSearch('');
                    e.target.blur();
                }
            });

            // Search history and suggestions
            this.setupSearchSuggestions(el.searchInput);
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
                    const filter = btn.dataset.filter;
                    this.state.visibilityEngine?.toggleCategory(filter);

                    this.state.currentPage = 1;
                    this.state.visibilityEngine?.updateURL(this.state.viewMode);
                    this.updateFilterUI();
                    this.render();


                });
            });
        }

        if (el.cardViewBtn && el.listViewBtn) {
            el.cardViewBtn.addEventListener('click', () => this.setViewMode('card'));
            el.listViewBtn.addEventListener('click', () => this.setViewMode('list'));
        }

        if (el.randomProjectBtn) {
            el.randomProjectBtn.addEventListener('click', () => this.openRandomProject());
        }

        // Listen for deadline updates
        window.addEventListener('deadlineUpdated', () => {
            this.render();
        });
    }

    handleSearch(query) {
        // Save to search history
        if (query.trim()) {
            this.saveSearchHistory(query.trim());
        }

        this.state.visibilityEngine?.setSearchQuery(query);
        this.state.currentPage = 1;
        this.state.visibilityEngine?.updateURL(this.state.viewMode);
        this.render();
    }


    setupSearchSuggestions(searchInput) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        searchInput.parentNode.appendChild(suggestionsContainer);

        searchInput.addEventListener('focus', () => {
            this.showSearchSuggestions(searchInput, suggestionsContainer);
        });

        searchInput.addEventListener('blur', (e) => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
        });
    }

    showSearchSuggestions(input, container) {
        const history = this.getSearchHistory();
        const currentValue = input.value.toLowerCase();

        // Get project suggestions based on current input
        const projectSuggestions = this.state.allProjects
            .filter(p => p.title.toLowerCase().includes(currentValue))
            .slice(0, 3)
            .map(p => p.title);

        const suggestions = [...new Set([...projectSuggestions, ...history])].slice(0, 5);

        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = suggestions.map(suggestion =>
            `<div class="suggestion-item" onclick="this.parentNode.previousElementSibling.value='${suggestion}'; window.projectManagerInstance.handleSearch('${suggestion}');">
                <i class="ri-search-line"></i>
                <span>${suggestion}</span>
            </div>`
        ).join('');

        container.style.display = 'block';
    }

    saveSearchHistory(query) {
        let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        history = history.filter(item => item !== query); // Remove duplicates
        history.unshift(query); // Add to beginning
        history = history.slice(0, 10); // Keep only last 10
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    getSearchHistory() {
        return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    }

    setViewMode(mode) {
        this.state.viewMode = mode;
        const el = this.elements;

        el.cardViewBtn?.classList.toggle('active', mode === 'card');
        el.listViewBtn?.classList.toggle('active', mode === 'list');

        this.state.visibilityEngine?.updateURL(mode);
        this.render();
    }

    openRandomProject() {
        if (this.state.allProjects.length === 0) return;

        const randomIndex = Math.floor(Math.random() * this.state.allProjects.length);
        const randomProject = this.state.allProjects[randomIndex];

        // Navigate to the project
        window.location.href = randomProject.link;
    }

    /* -----------------------------------------------------------
     * Rendering Logic
     * ----------------------------------------------------------- */
    render() {
        if (!this.state.visibilityEngine) return;

        const el = this.elements;

        this.state.visibilityEngine.setPage(this.state.currentPage);

        // Get sort mode and set in visibility engine
        const sortMode = el.sortSelect?.value || 'default';
        if (sortMode === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortMode === 'za') filtered.sort((a, b) => b.title.localeCompare(a.title));
        else if (sortMode === 'newest') filtered.reverse();
        else if (sortMode === 'deadline') filtered = deadlineManager.sortByDeadline(filtered);
        else if (sortMode === 'importance') filtered = deadlineManager.sortByImportance(filtered);
        this.state.visibilityEngine.setSortMode(sortMode);

        // Get filtered and sorted projects from visibility engine
        let filtered = this.state.visibilityEngine.getVisibleProjects();

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

        // Setup viewport tracking for newly rendered cards
        this.observeProjectCards();
    }

    /**
     * Observe project cards for viewport tracking
     */
    observeProjectCards() {
        if (!this.viewportObserver) return;

        // Disconnect previous observations
        this.viewportObserver.disconnect();

        // Observe all project cards
        const cards = document.querySelectorAll('.card[data-project-id], .list-card[data-project-id]');
        cards.forEach(card => {
            this.viewportObserver.observe(card);
        });
    }

    /**
     * Get badge HTML for a project
     */
    getProjectBadgeHtml(project) {
        if (!this.analyticsEngine) return '';

        const projectId = project.folder || project.name || project.title;
        const badge = this.analyticsEngine.getProjectBadge(projectId);

        if (!badge) return '';

        return `<span class="project-badge ${badge.class}">${badge.label}</span>`;
    }

    renderCardView(container, projects) {
        container.innerHTML = projects.map((project) => {
            const isBookmarked = window.bookmarksManager?.isBookmarked(project.title);
            const techHtml = project.tech?.map(t => `<span>${this.escapeHtml(t)}</span>`).join('') || '';
            const coverStyle = project.coverStyle || '';
            const coverClass = project.coverClass || '';
            const sourceUrl = this.getSourceCodeUrl(project.link);
            const projectJson = JSON.stringify(project).replace(/'/g, "&apos;");

            // Get deadline info
            const deadline = deadlineManager.getProjectDeadline(project.title);
            const deadlineHtml = deadline ? (() => {
                const importance = deadlineManager.getImportanceMetadata(deadline.importance);
                const daysLeft = deadlineManager.getDaysUntilDeadline(deadline.deadline);
                const statusText = deadlineManager.getDeadlineStatus(deadline.deadline);
                
                let statusClass = 'deadline-normal';
                if (daysLeft < 0) statusClass = 'deadline-overdue';
                else if (daysLeft <= 3) statusClass = 'deadline-urgent';
                else if (daysLeft <= 7) statusClass = 'deadline-soon';

                return `
                    <div class="deadline-badge ${statusClass}">
                        <div class="deadline-importance" style="background-color: ${importance.color};">
                            <i class="${importance.icon}"></i>
                        </div>
                        <div class="deadline-info">
                            <span class="deadline-date">${deadline.deadline}</span>
                            <span class="deadline-status">${statusText}</span>
                        </div>
                    </div>
                `;
            })() : '';

            return `
                <div class="card" 
                     data-category="${this.escapeHtml(project.category)}" 
                     data-link="${this.escapeHtml(project.link)}"
                     onclick="window.location.href='${this.escapeHtml(project.link)}'; event.stopPropagation();">
                    <div class="card-actions">
                        <button class="preview-btn" 
                                onclick="event.preventDefault(); event.stopPropagation(); window.openSandboxPreview(this);"
                                data-project='${projectJson}'
                                title="Quick Preview">
                            <i class="ri-play-circle-line"></i>
                        </button>
                        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                                data-project-title="${this.escapeHtml(project.title)}" 
                                onclick="event.preventDefault(); event.stopPropagation(); window.toggleProjectBookmark(this, '${this.escapeHtml(project.title)}', '${this.escapeHtml(project.link)}', '${this.escapeHtml(project.category)}', '${this.escapeHtml(project.description || '')}');"
                                title="${isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}">
                            <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                        </button>
                        <button class="deadline-btn" 
                                onclick="event.preventDefault(); event.stopPropagation(); window.openDeadlineModal('${this.escapeHtml(project.title)}');"
                                title="Set deadline and importance">
                            <i class="ri-calendar-line"></i>
                        </button>
                        <a href="${sourceUrl}" target="_blank" class="source-btn" 
                           onclick="event.stopPropagation();" 
                           title="View Source Code">
                            <i class="ri-github-fill"></i>
                        </a>
                        <button class="view-insights-btn"
                                onclick="event.preventDefault(); event.stopPropagation(); window.openInsightsPanel('${this.escapeHtml(project.title)}');"
                                title="View Community Insights">
                            <i class="ri-lightbulb-line"></i>
                        </button>
                    </div>
                    ${deadlineHtml}
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

    /**
     * Handle project card click with analytics tracking
     */
    handleProjectClick(event, project) {
        event.stopPropagation();

        // Track the click
        this.trackProjectClick(project);

        // Navigate to project
        window.location.href = project.link;
    }

    renderListView(container, projects) {
        container.innerHTML = projects.map(project => {
            const isBookmarked = window.bookmarksManager?.isBookmarked(project.title);
            const coverStyle = project.coverStyle || '';
            const coverClass = project.coverClass || '';
            const projectJson = JSON.stringify(project).replace(/'/g, "&apos;");
            const badgeHtml = this.getProjectBadgeHtml(project);

            // Get deadline info
            const deadline = deadlineManager.getProjectDeadline(project.title);
            const deadlineBadgeHtml = deadline ? (() => {
                const importance = deadlineManager.getImportanceMetadata(deadline.importance);
                return `<span class="list-card-deadline-badge" style="background-color: ${importance.color};" title="Importance: ${importance.label}">
                    <i class="${importance.icon}"></i>
                    ${deadline.deadline}
                </span>`;
            })() : '';

            return `
                <div class="list-card"
                     data-link="${this.escapeHtml(project.link)}">
                    <div class="list-card-icon ${coverClass}" style="${coverStyle}">
                        <i class="${this.escapeHtml(project.icon || 'ri-code-s-slash-line')}"></i>
                    </div>
                    <div class="list-card-content">
                        <div class="list-card-header">
                            <h3 class="list-card-title">${this.escapeHtml(project.title)}</h3>
                            ${deadlineBadgeHtml}
                            ${badgeHtml}
                            <span class="category-tag">${this.capitalize(project.category)}</span>
                        </div>
                        <p class="list-card-description">${this.escapeHtml(project.description || '')}</p>
                    </div>
                    <div class="list-card-actions">
                        <button class="preview-btn" 
                                onclick="window.openSandboxPreview(this);"
                                data-project='${projectJson}'
                                title="Quick Preview">
                            <i class="ri-play-circle-line"></i>
                        </button>
                        <button class="collection-btn ${isBookmarked ? 'visible' : ''}"
                                onclick="window.showCollectionDropdown(this, '${this.escapeHtml(project.title)}', '${this.escapeHtml(project.link)}', '${this.escapeHtml(project.category)}', '${this.escapeHtml(project.description || '')}');"
                                title="Add to Collection">
                            <i class="ri-folder-add-line"></i>
                        </button>
                        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}"
                                onclick="window.toggleProjectBookmark(this, '${this.escapeHtml(project.title)}', '${this.escapeHtml(project.link)}', '${this.escapeHtml(project.category)}', '${this.escapeHtml(project.description || '')}');"
                                title="${isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}">
                            <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                        </button>
                        <button class="deadline-btn" 
                                onclick="window.openDeadlineModal('${this.escapeHtml(project.title)}');"
                                title="Set deadline and importance">
                            <i class="ri-calendar-line"></i>
                        </button>
                        <a href="${project.link}" class="view-btn" title="View Project">
                        <a href="${project.link}" class="view-btn" title="View Project"
                           onclick="window.projectManagerInstance.trackProjectClick(${JSON.stringify(project).replace(/"/g, '&quot;')})">
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
        this.state.visibilityEngine?.updateURL(this.state.viewMode);
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

    /* -----------------------------------------------------------
     * Multi-Filter and URL Persistence Logic
     * ----------------------------------------------------------- */
    updateFilterUI() {
        const activeCategories = this.state.visibilityEngine.state.categories;
        const el = this.elements;

        if (!el.filterBtns) return;

        el.filterBtns.forEach(btn => {
            const filter = btn.dataset.filter.toLowerCase();
            const isActive = activeCategories.has(filter);
            btn.classList.toggle('active', isActive);
        });
    }

    resetFilters() {
        if (!this.state.visibilityEngine) return;
        this.state.visibilityEngine.reset();
        this.state.currentPage = 1;
        if (this.elements.searchInput) this.elements.searchInput.value = '';
        this.state.visibilityEngine.updateURL(this.state.viewMode);
        this.updateFilterUI();
        this.render();
    }



    loadURLState() {
        const engine = this.state.visibilityEngine;
        if (!engine) return;

        const urlState = engine.getStateFromURL();

        // Search
        if (urlState.search) {
            engine.setSearchQuery(urlState.search);
            if (this.elements.searchInput) this.elements.searchInput.value = urlState.search;
        }

        // Categories
        if (urlState.categories && urlState.categories.length > 0) {
            engine.state.categories.clear();
            urlState.categories.forEach(c => engine.state.categories.add(c.toLowerCase()));
            this.updateFilterUI();
        }

        // Page
        if (urlState.page) this.state.currentPage = urlState.page;

        // View Mode
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        if (view === 'list' || view === 'card') {
            this.state.viewMode = view;
            const el = this.elements;
            el.cardViewBtn?.classList.toggle('active', view === 'card');
            el.listViewBtn?.classList.toggle('active', view === 'list');
        }
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

    // Track bookmark in analytics
    if (window.analyticsEngine) {
        window.analyticsEngine.trackBookmark(title, isNowBookmarked);
    }

    showToast(isNowBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
};

/**
 * Global Collection Dropdown Function
 */
window.showCollectionDropdown = function (btn, title, link, category, description) {
    if (!window.bookmarksManager) return;

    // Ensure project is bookmarked first
    const project = { title, link, category, description };
    if (!window.bookmarksManager.isBookmarked(title)) {
        window.bookmarksManager.addBookmark(project);

        // Update bookmark button state
        const card = btn.closest('.card, .list-card');
        if (card) {
            const bookmarkBtn = card.querySelector('.bookmark-btn');
            if (bookmarkBtn) {
                bookmarkBtn.classList.add('bookmarked');
                const icon = bookmarkBtn.querySelector('i');
                if (icon) icon.className = 'ri-bookmark-fill';
            }
        }

        notificationManager.success('Added to bookmarks');
    }

    // Remove any existing dropdown
    const existingDropdown = document.querySelector('.collection-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }

    const collections = window.bookmarksManager.getAllCollections();
    const projectCollections = window.bookmarksManager.getProjectCollections(title);

    const dropdown = document.createElement('div');
    dropdown.className = 'collection-dropdown';

    const escapeHtml = (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    const escapeHtmlAttr = (str) => {
        if (!str) return '';
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    let collectionsHtml = collections.map(collection => {
        const isInCollection = projectCollections.some(c => c.id === collection.id);
        return `
            <button class="collection-dropdown-item ${isInCollection ? 'in-collection' : ''}" 
                    data-collection-id="${collection.id}"
                    data-project-title="${escapeHtmlAttr(title)}">
                <i class="${collection.icon}" style="color: ${collection.color}"></i>
                <span>${escapeHtml(collection.name)}</span>
                ${isInCollection ? '<i class="ri-check-line check-icon"></i>' : ''}
            </button>
        `;
    }).join('');

    dropdown.innerHTML = `
        <div class="collection-dropdown-header">
            <span>Add to Collection</span>
        </div>
        <div class="collection-dropdown-list">
            ${collectionsHtml}
        </div>
        <div class="collection-dropdown-footer">
            <button class="collection-dropdown-create">
                <i class="ri-add-line"></i>
                <span>New Collection</span>
            </button>
        </div>
    `;

    // Position the dropdown
    const rect = btn.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + 8}px`;
    dropdown.style.left = `${Math.min(rect.left, window.innerWidth - 220)}px`;
    dropdown.style.zIndex = '10001';

    document.body.appendChild(dropdown);

    // Handle collection item clicks
    dropdown.querySelectorAll('.collection-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const collectionId = item.dataset.collectionId;
            const projectTitle = item.dataset.projectTitle;

            if (item.classList.contains('in-collection')) {
                window.bookmarksManager.removeFromCollection(projectTitle, collectionId);
                item.classList.remove('in-collection');
                item.querySelector('.check-icon')?.remove();
                notificationManager.success('Removed from collection');
            } else {
                window.bookmarksManager.addToCollection(projectTitle, collectionId);
                item.classList.add('in-collection');
                const checkIcon = document.createElement('i');
                checkIcon.className = 'ri-check-line check-icon';
                item.appendChild(checkIcon);
                notificationManager.success('Added to collection');
            }
        });
    });

    // Handle create collection button
    dropdown.querySelector('.collection-dropdown-create').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.remove();
        if (window.showCreateCollectionModal) {
            window.showCreateCollectionModal(title);
        }
    });

    // Close dropdown when clicking outside
    const closeDropdown = (e) => {
        if (!dropdown.contains(e.target) && e.target !== btn) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeDropdown);
    }, 0);
};

// Toast notifications are now handled by NotificationManager

/**
 * Global Sandbox Preview Handler
 * Feature #1334: Project Playground Sandbox & Live Preview
 */
window.openSandboxPreview = function (btn) {
    if (!window.sandboxEngine) {
        console.warn('Sandbox engine not loaded');
        return;
    }

    try {
        const projectData = btn.dataset.project;
        if (projectData) {
            const project = JSON.parse(projectData);
            window.sandboxEngine.open(project);
        }
    } catch (e) {
        console.error('Failed to open sandbox preview:', e);
    }
};

/**
 * Global Compare Toggle Handler
 * Feature #1333: Project Comparison
 */
window.handleCompareToggle = function (checkbox, projectJson) {
    if (!window.comparisonEngine) {
        console.warn('Comparison engine not loaded');
        return;
    }

    try {
        const project = JSON.parse(projectJson);
        const isSelected = window.comparisonEngine.toggleSelection(project);

        // Update card visual state
        const card = checkbox.closest('.card, .list-card');
        if (card) {
            card.classList.toggle('compare-selected', isSelected);
        }
    } catch (e) {
        console.error('Failed to toggle comparison:', e);
    }
};

// Listen for comparison updates to re-render if needed
document.addEventListener('comparisonUpdated', (e) => {
    // Update all compare checkboxes
    document.querySelectorAll('.compare-checkbox').forEach(checkbox => {
        const title = checkbox.dataset.projectTitle;
        const isSelected = e.detail.projects.some(p => p.title === title);
        checkbox.checked = isSelected;
        const card = checkbox.closest('.card, .list-card');
        if (card) {
            card.classList.toggle('compare-selected', isSelected);
        }
    });
});

// ===============================
// Global Initialization
// ===============================

window.ProjectManager = ProjectManager;
window.fetchContributors = fetchContributors;

// Initialize ProjectManager - handles both immediate and event-based loading
function initProjectManager() {
    if (window.projectManagerInstance?.state.initialized) return;

    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
        console.log('📋 Projects component found, initializing...');
        const manager = new ProjectManager();
        manager.init();
    }
}

// Listen for component load events from components.js
document.addEventListener('componentLoaded', (e) => {
    if (e.detail && e.detail.component === 'projects') {
        initProjectManager();
    }
    if (e.detail && e.detail.component === 'contributors') {
        fetchContributors();
    }
});

// Initialize Command Palette
let commandPalette = null;
function initCommandPalette() {
    const manager = window.projectManagerInstance;
    if (manager && !commandPalette) {
        commandPalette = new CommandPalette(manager);
        keyevents(commandPalette); // Pass command palette instance to keyboard handler
        console.log("✨ Command Palette initialized");
    }
}

// Also check immediately in case components already loaded (module timing issue)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        keyevents();
        deadlineUI.init(); // Initialize deadline UI
        initCommandPalette();
        setTimeout(initProjectManager, 100); // Small delay to ensure components are ready
        setTimeout(checkInsightDeepLink, 600); // Check for insight deep links
    });
} else {
    // DOM already loaded
    keyevents();
    deadlineUI.init(); // Initialize deadline UI
    initCommandPalette();
    setTimeout(initProjectManager, 100);
    setTimeout(checkInsightDeepLink, 600);
}

// Fade-in animation observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

console.log('%c🚀 OpenPlayground Unified Logic Active', 'color:#6366f1;font-weight:bold;');

