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
        this.ratings = {};
        
        this.init();
    }

    showSkeletonCards() {
        this.container.innerHTML = '';
        for (let i = 0; i < this.cardsPerPage; i++) {
            const skeleton = this.createSkeletonCard();
            this.container.appendChild(skeleton);
        }
    }

    createSkeletonCard() {
        const card = document.createElement('div');
        card.className = 'card skeleton-card';
        card.innerHTML = `
            <div class="card-cover skeleton"></div>
            <div class="card-content">
                <div class="card-header-flex">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-category"></div>
                </div>
                <div class="skeleton skeleton-description"></div>
                <div class="skeleton skeleton-rating"></div>
                <div class="card-tech">
                    <span class="skeleton skeleton-tech"></span>
                    <span class="skeleton skeleton-tech"></span>
                    <span class="skeleton skeleton-tech"></span>
                </div>
            </div>
        `;
        return card;
    }

    async init() {
        this.showSkeletonCards();
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
            this.loadRatings();
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

    loadRatings() {
        const stored = localStorage.getItem('projectRatings');
        this.ratings = stored ? JSON.parse(stored) : {};
    }

    saveRatings() {
        localStorage.setItem('projectRatings', JSON.stringify(this.ratings));
    }

    getProjectRating(projectTitle) {
        const key = this.sanitizeKey(projectTitle);
        const projectRatings = this.ratings[key] || [];
        if (projectRatings.length === 0) return { average: 0, count: 0 };
        
        const sum = projectRatings.reduce((acc, r) => acc + r.rating, 0);
        return {
            average: sum / projectRatings.length,
            count: projectRatings.length
        };
    }

    sanitizeKey(title) {
        return title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }

    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="ri-star-fill"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="ri-star-half-fill"></i>';
            } else {
                stars += '<i class="ri-star-line"></i>';
            }
        }
        return stars;
    }

    showRatingModal(project) {
        const modal = document.createElement('div');
        modal.className = 'rating-modal-overlay';
        modal.innerHTML = `
            <div class="rating-modal">
                <div class="rating-modal-header">
                    <h3>Rate "${project.title}"</h3>
                    <button class="rating-modal-close">&times;</button>
                </div>
                <div class="rating-modal-body">
                    <div class="star-rating">
                        <span class="star" data-rating="1">★</span>
                        <span class="star" data-rating="2">★</span>
                        <span class="star" data-rating="3">★</span>
                        <span class="star" data-rating="4">★</span>
                        <span class="star" data-rating="5">★</span>
                    </div>
                    <textarea placeholder="Leave a review (optional)" class="review-textarea"></textarea>
                    <button class="submit-rating">Submit Rating</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Star selection
        const stars = modal.querySelectorAll('.star');
        let selectedRating = 0;
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                stars.forEach((s, i) => {
                    s.classList.toggle('selected', i < selectedRating);
                });
            });
        });
        
        // Close modal
        modal.querySelector('.rating-modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Submit rating
        modal.querySelector('.submit-rating').addEventListener('click', () => {
            if (selectedRating > 0) {
                const review = modal.querySelector('.review-textarea').value.trim();
                this.submitRating(project.title, selectedRating, review);
                modal.remove();
                this.renderProjects(); // Re-render to update ratings
            }
        });
    }

    openRandomProject() {
        if (this.projects.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.projects.length);
        const randomProject = this.projects[randomIndex];
        
        // Navigate to the project
        window.location.href = randomProject.link;
    }

    submitRating(projectTitle, rating, review) {
        const key = this.sanitizeKey(projectTitle);
        if (!this.ratings[key]) {
            this.ratings[key] = [];
        }
        
        this.ratings[key].push({
            rating: rating,
            review: review,
            timestamp: Date.now()
        });
        
        this.saveRatings();
    }

    createProjectCard(project) {
        const card = document.createElement('a');
        card.href = project.link;
        card.className = 'card';
        card.dataset.category = project.category;
        
        const techTags = project.tech.map(t => `<span>${this.highlightText(t, this.currentSearch)}</span>`).join('');
        const rating = this.getProjectRating(project.title);
        const stars = this.generateStars(rating.average);
        
        card.innerHTML = `
            <div class="card-cover" style="${project.coverStyle}">
                <i class="${project.icon}" aria-hidden="true"></i>
            </div>
            <div class="card-content">
                <div class="card-header-flex">
                    <h3 class="card-heading">${this.highlightText(project.title, this.currentSearch)}</h3>
                    <span class="category-tag">${this.capitalizeFirst(this.highlightText(project.category, this.currentSearch))}</span>
                </div>
                <p class="card-description">${this.highlightText(project.description, this.currentSearch)}</p>
                <div class="card-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-text">${rating.average.toFixed(1)} (${rating.count})</span>
                </div>
                <div class="card-tech">${techTags}</div>
            </div>
        `;
        
        // Add click handler for rating
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-rating')) {
                e.preventDefault();
                this.showRatingModal(project);
            }
        });
        
        return card;
    }

    highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
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
            case 'rating-high':
                sorted.sort((a, b) => this.getProjectRating(b.title).average - this.getProjectRating(a.title).average);
                break;
            case 'rating-low':
                sorted.sort((a, b) => this.getProjectRating(a.title).average - this.getProjectRating(b.title).average);
                break;
            default:
                break;
        }
        
        return sorted;
    }

    toggleClearButton() {
        const searchBox = document.querySelector('.search-box');
        const hasText = this.currentSearch.length > 0;
        searchBox.classList.toggle('has-text', hasText);
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('project-search');
        const searchBox = document.querySelector('.search-box');
        const clearButton = document.getElementById('search-clear');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.applyFilters();
                this.toggleClearButton();
            });
        }
        
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.currentSearch = '';
                searchInput.value = '';
                this.applyFilters();
                this.toggleClearButton();
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
        
        // Random project button
        const randomBtn = document.getElementById('random-project-btn');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.openRandomProject();
            });
        }
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
