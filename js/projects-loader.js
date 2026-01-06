/**
 * Projects Loader - Dynamically loads projects from projects.json
 * This keeps index.html clean and makes adding projects easier
 */

class ProjectsLoader {
    constructor() {
        this.container = document.querySelector('.projects-container');
        this.projects = [];
        this.filteredProjects = [];
        this.currentPage = 1;
        this.cardsPerPage = 12;
        this.currentFilter = 'all';
        this.currentSort = 'default';
        this.currentSearch = '';
        
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.renderProjects();
        this.setupEventListeners();
        this.setupPagination();
    }

    async loadProjects() {
        try {
            const response = await fetch('./projects.json');
            if (!response.ok) throw new Error('Failed to load projects');
            this.projects = await response.json();
            this.filteredProjects = [...this.projects];
        } catch (error) {
            console.error('Error loading projects:', error);
            this.container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="ri-error-warning-line"></i></div>
                    <h3>Failed to load projects</h3>
                    <p>Please try refreshing the page.</p>
                </div>
            `;
        }
    }

    createProjectCard(project) {
        const card = document.createElement('a');
        card.href = project.link;
        card.className = 'card';
        card.dataset.category = project.category;
        
        const techTags = project.tech.map(t => `<span>${t}</span>`).join('');
        
        card.innerHTML = `
            <div class="card-cover" style="${project.coverStyle}">
                <i class="${project.icon}"></i>
            </div>
            <div class="card-content">
                <div class="card-header-flex">
                    <h3 class="card-heading">${project.title}</h3>
                    <span class="category-tag">${this.capitalizeFirst(project.category)}</span>
                </div>
                <p class="card-description">${project.description}</p>
                <div class="card-tech">${techTags}</div>
            </div>
        `;
        
        return card;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    renderProjects() {
        this.container.innerHTML = '';
        
        const start = (this.currentPage - 1) * this.cardsPerPage;
        const end = start + this.cardsPerPage;
        const pageProjects = this.filteredProjects.slice(start, end);
        
        if (pageProjects.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="ri-folder-open-line"></i></div>
                    <h3>No projects found</h3>
                    <p>Try adjusting your search or filter.</p>
                </div>
            `;
            return;
        }
        
        pageProjects.forEach(project => {
            const card = this.createProjectCard(project);
            this.container.appendChild(card);
        });
        
        this.updatePagination();
    }

    applyFilters() {
        let filtered = [...this.projects];
        
        // Apply search
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.category.toLowerCase().includes(searchLower) ||
                p.tech.some(t => t.toLowerCase().includes(searchLower))
            );
        }
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(p => p.category === this.currentFilter);
        }
        
        // Apply sorting
        filtered = this.sortProjects(filtered);
        
        this.filteredProjects = filtered;
        this.currentPage = 1;
        this.renderProjects();
    }

    sortProjects(projects) {
        const sorted = [...projects];
        
        switch (this.currentSort) {
            case 'az':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'za':
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'newest':
                // Reverse order (newest first, assuming JSON is ordered oldest to newest)
                sorted.reverse();
                break;
            default:
                break;
        }
        
        return sorted;
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.applyFilters();
            });
        }
        
        // Sort select
        const sortSelect = document.getElementById('project-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFilters();
            });
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.applyFilters();
            });
        });
    }

    setupPagination() {
        this.paginationContainer = document.getElementById('pagination-controls');
        if (!this.paginationContainer) {
            this.paginationContainer = document.createElement('div');
            this.paginationContainer.id = 'pagination-controls';
            this.paginationContainer.className = 'pagination-container';
            this.container.parentElement.appendChild(this.paginationContainer);
        }
        this.updatePagination();
    }

    updatePagination() {
        if (!this.paginationContainer) return;
        
        this.paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(this.filteredProjects.length / this.cardsPerPage);
        
        if (totalPages <= 1) {
            this.paginationContainer.style.display = 'none';
            return;
        }
        
        this.paginationContainer.style.display = 'flex';
        
        // Previous button
        if (this.currentPage > 1) {
            const prevBtn = this.createPaginationButton('«', () => this.goToPage(this.currentPage - 1));
            this.paginationContainer.appendChild(prevBtn);
        }
        
        // Page buttons
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const btn = this.createPaginationButton(i, () => this.goToPage(i), i === this.currentPage);
            this.paginationContainer.appendChild(btn);
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            const nextBtn = this.createPaginationButton('»', () => this.goToPage(this.currentPage + 1));
            this.paginationContainer.appendChild(nextBtn);
        }
    }

    createPaginationButton(text, onClick, isActive = false) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.addEventListener('click', onClick);
        if (isActive) btn.classList.add('active');
        return btn;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderProjects();
        
        // Scroll to projects section
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            const navbarHeight = 75;
            window.scrollTo({
                top: projectsSection.offsetTop - navbarHeight,
                behavior: 'smooth'
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProjectsLoader();
});
