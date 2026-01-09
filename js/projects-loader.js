/**
 * Enhanced Projects Loader - Dynamic section-based project display
 * Organizes projects by categories with "View More" functionality
 */

class ProjectsLoader {
    constructor() {
        this.sectionsContainer = document.getElementById('projects-sections-container');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.categoryNavBtns = document.querySelectorAll('.nav-btn');
        this.searchInput = document.getElementById('project-search');
        this.searchClear = document.getElementById('search-clear');
        this.sortSelect = document.getElementById('project-sort');
        this.randomBtn = document.getElementById('random-project-btn');
        this.emptyState = document.getElementById('empty-state');

        this.allProjects = [];
        this.filteredProjects = [];
        this.currentSection = 'all';
        this.currentSearch = '';
        this.currentSort = 'default';
        this.projectsPerSection = 6; // Initial projects per section
        this.maxProjectsPerSection = 12; // Maximum before "View More"
        this.ratings = {};

        this.init();
    }

    async init() {
        this.showSkeletonSections();
        await this.loadProjects();
        this.setupEventListeners();
        this.renderAllSections();
        this.hideSkeletonSections();
    }

    showSkeletonSections() {
        const categories = ['utility', 'game', 'productivity', 'experimental', 'fun'];
        this.sectionsContainer.innerHTML = '';

        categories.forEach(category => {
            const section = this.createSkeletonSection(category);
            this.sectionsContainer.appendChild(section);
        });
    }

    createSkeletonSection(category) {
        const section = document.createElement('div');
        section.className = 'projects-section-block';
        section.setAttribute('data-category', category);

        const title = category.charAt(0).toUpperCase() + category.slice(1);
        section.innerHTML = `
            <div class="section-header">
                <h3 class="section-title">${title} Projects</h3>
                <div class="section-divider"></div>
            </div>
            <div class="projects-grid skeleton-grid">
                ${'<div class="card skeleton-card"><div class="card-cover skeleton"></div><div class="card-content"><div class="card-header-flex"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-category"></div></div><div class="skeleton skeleton-description"></div><div class="card-tech"><span class="skeleton skeleton-tech"></span><span class="skeleton skeleton-tech"></span><span class="skeleton skeleton-tech"></span></div></div></div>'.repeat(6)}
            </div>
        `;

        return section;
    }

    hideSkeletonSections() {
        const skeletons = this.sectionsContainer.querySelectorAll('.skeleton-card');
        skeletons.forEach(skeleton => skeleton.style.display = 'none');
    }

    async loadProjects() {
        try {
            const response = await fetch('./projects.json');
            if (!response.ok) throw new Error('Failed to load projects');
            this.allProjects = await response.json();
            this.filteredProjects = [...this.allProjects];
            this.loadRatings();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showErrorState();
        }
    }

    loadRatings() {
        const stored = localStorage.getItem('projectRatings');
        this.ratings = stored ? JSON.parse(stored) : {};
    }

    saveRatings() {
        localStorage.setItem('projectRatings', JSON.stringify(this.ratings));
    }

    setupEventListeners() {
        // Category navigation
        this.categoryNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveCategory(btn.dataset.section);
            });
        });

        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.filterAndRender();
        });

        this.searchClear.addEventListener('click', () => {
            this.searchInput.value = '';
            this.currentSearch = '';
            this.filterAndRender();
        });

        // Sort functionality
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.filterAndRender();
        });

        // Load more button
        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMoreProjects();
        });

        // Random project
        this.randomBtn.addEventListener('click', () => {
            this.showRandomProject();
        });
    }

    setActiveCategory(section) {
        this.currentSection = section;

        // Update active button
        this.categoryNavBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });

        this.filterAndRender();
    }

    filterAndRender() {
        this.applyFilters();
        this.renderAllSections();
        this.updateLoadMoreButton();
        this.updateEmptyState();
    }

    applyFilters() {
        let filtered = [...this.allProjects];

        // Apply category filter
        if (this.currentSection !== 'all') {
            filtered = filtered.filter(project =>
                project.category.toLowerCase() === this.currentSection
            );
        }

        // Apply search filter
        if (this.currentSearch) {
            filtered = filtered.filter(project =>
                project.title.toLowerCase().includes(this.currentSearch) ||
                project.description.toLowerCase().includes(this.currentSearch) ||
                project.tech.some(tech => tech.toLowerCase().includes(this.currentSearch))
            );
        }

        // Apply sorting
        filtered = this.sortProjects(filtered);

        this.filteredProjects = filtered;
    }

    sortProjects(projects) {
        switch (this.currentSort) {
            case 'az':
                return projects.sort((a, b) => a.title.localeCompare(b.title));
            case 'za':
                return projects.sort((a, b) => b.title.localeCompare(a.title));
            case 'newest':
                return projects.sort((a, b) => b.id - a.id); // Assuming higher ID = newer
            case 'rating-high':
                return projects.sort((a, b) => this.getRating(b) - this.getRating(a));
            case 'rating-low':
                return projects.sort((a, b) => this.getRating(a) - this.getRating(b));
            default:
                return projects;
        }
    }

    getRating(project) {
        const key = this.sanitizeKey(project.title);
        const rating = this.ratings[key];
        return rating ? rating.average : 0;
    }

    sanitizeKey(title) {
        return title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }

    renderAllSections() {
        if (this.currentSection === 'all') {
            this.renderCategorizedSections();
        } else {
            this.renderSingleCategorySection();
        }
    }

    renderCategorizedSections() {
        const categories = ['utility', 'game', 'productivity', 'experimental', 'fun'];
        this.sectionsContainer.innerHTML = '';

        categories.forEach(category => {
            const categoryProjects = this.filteredProjects.filter(p =>
                p.category.toLowerCase() === category
            );

            if (categoryProjects.length > 0) {
                const section = this.createCategorySection(category, categoryProjects);
                this.sectionsContainer.appendChild(section);
            }
        });
    }

    renderSingleCategorySection() {
        this.sectionsContainer.innerHTML = '';
        const section = this.createCategorySection(this.currentSection, this.filteredProjects);
        this.sectionsContainer.appendChild(section);
    }

    createCategorySection(category, projects) {
        const section = document.createElement('div');
        section.className = 'projects-section-block';
        section.setAttribute('data-category', category);

        const title = category === 'all' ? 'All Projects' : category.charAt(0).toUpperCase() + category.slice(1) + ' Projects';
        const displayProjects = projects.slice(0, this.projectsPerSection);

        section.innerHTML = `
            <div class="section-header">
                <h3 class="section-title">${title}</h3>
                <div class="section-divider"></div>
                ${projects.length > this.projectsPerSection ? `<button class="view-more-btn" data-category="${category}">View More (${projects.length - this.projectsPerSection})</button>` : ''}
            </div>
            <div class="projects-grid">
                ${displayProjects.map(project => this.createProjectCard(project)).join('')}
            </div>
        `;

        // Add event listener for view more button
        const viewMoreBtn = section.querySelector('.view-more-btn');
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', () => {
                this.expandSection(category);
            });
        }

        return section;
    }

    createProjectCard(project) {
        const rating = this.getRating(project);
        const coverStyle = project.coverStyle || `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;`;

        return `
            <a href="${project.link}" class="card" data-category="${project.category}">
                <div class="card-cover" style="${coverStyle}">
                    <i class="${project.icon}"></i>
                </div>
                <div class="card-content">
                    <div class="card-header-flex">
                        <h3 class="card-heading">${project.title}</h3>
                        <span class="category-tag">${project.category.charAt(0).toUpperCase() + project.category.slice(1)}</span>
                    </div>
                    <p class="card-description">${project.description}</p>
                    ${rating > 0 ? `<div class="card-rating"><i class="ri-star-fill"></i> ${rating.toFixed(1)} (${this.ratings[this.sanitizeKey(project.title)]?.count || 0})</div>` : ''}
                    <div class="card-tech">
                        ${project.tech.map(tech => `<span>${tech}</span>`).join('')}
                    </div>
                </div>
            </a>
        `;
    }

    expandSection(category) {
        const section = this.sectionsContainer.querySelector(`[data-category="${category}"]`);
        if (!section) return;

        const categoryProjects = this.filteredProjects.filter(p =>
            p.category.toLowerCase() === category
        );

        const currentCount = section.querySelectorAll('.card').length;
        const remainingProjects = categoryProjects.slice(currentCount);

        const grid = section.querySelector('.projects-grid');
        remainingProjects.forEach(project => {
            const cardHTML = this.createProjectCard(project);
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Hide view more button
        const viewMoreBtn = section.querySelector('.view-more-btn');
        if (viewMoreBtn) {
            viewMoreBtn.style.display = 'none';
        }
    }

    loadMoreProjects() {
        this.projectsPerSection += 6;
        this.filterAndRender();
    }

    updateLoadMoreButton() {
        const totalDisplayed = this.sectionsContainer.querySelectorAll('.card').length;
        const hasMore = totalDisplayed < this.filteredProjects.length;

        this.loadMoreBtn.style.display = hasMore ? 'flex' : 'none';
    }

    updateEmptyState() {
        const hasProjects = this.sectionsContainer.querySelectorAll('.card').length > 0;
        this.emptyState.style.display = hasProjects ? 'none' : 'block';
    }

    showRandomProject() {
        if (this.filteredProjects.length === 0) return;

        const randomProject = this.filteredProjects[Math.floor(Math.random() * this.filteredProjects.length)];
        window.open(randomProject.link, '_blank');
    }

    showErrorState() {
        this.sectionsContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon"><i class="ri-error-warning-line"></i></div>
                <h3>Failed to load projects</h3>
                <p>Please try refreshing the page.</p>
                <button onclick="location.reload()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the projects component to be loaded before initializing
    document.addEventListener('componentLoaded', (e) => {
        if (e.detail.component === 'projects') {
            console.log('🎯 Projects component loaded, initializing ProjectsLoader...');
            new ProjectsLoader();
        }
    });
});
