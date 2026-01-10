// ===============================
// OpenPlayground - Unified App Logic
// ===============================



import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";


/* =====================================================
   GLOBAL ELEMENTS & STATE
===================================================== */
const html = document.documentElement;
const toggleBtn = document.getElementById("toggle-mode-btn");
const themeIcon = document.getElementById("theme-icon");


// ===============================

// THEME TOGGLE

// Architecture: ProjectVisibilityEngine Integration
// ===============================
// We're introducing a centralized visibility engine to handle project filtering logic.
// Phase 1: Migrate SEARCH functionality to use the engine.
// Phase 2 (future): Migrate category filtering, sorting, and pagination.
// Benefits:
// - Separation of concerns: logic vs. DOM manipulation
// - Reusability: engine can be used across multiple views
// - Testability: pure functions easier to unit test
// - Scalability: complex filters (multi-select, tags, dates) become manageable


import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";

/**
 * ProjectManager
 * Manages project data fetching, filtering, and rendering.
 * Acts as the centerpiece for the OpenPlayground project hub.
 */
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
            viewMode: 'card', // 'card' or 'list'
            currentPage: 1,
            initialized: false
        };

        window.projectManagerInstance = this;
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


// ===============================
// Architecture: ProjectVisibilityEngine Instance
// ===============================
// This engine will progressively replace inline filtering logic.
// Currently handles: search query matching
// Future: category filters, sorting, advanced filters
let visibilityEngine = null;

const searchInput = document.getElementById("project-search");
const sortSelect = document.getElementById("project-sort");
const filterBtns = document.querySelectorAll(".filter-btn");

const clearBtn = document.getElementById("clear-filters");
const surpriseBtn = document.getElementById("surprise-btn");

const surpriseBtn = document.getElementById("surprise-btn");
const clearBtn = document.getElementById("clear-filters");

// Reset all filters, search input, and pagination when clear button is clicked
if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        sortSelect.value = "default";
        currentCategory = "all";
        currentPage = 1;

        filterBtns.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-filter="all"]').classList.add("active");

        // Architecture: Clear search query in engine
        if (visibilityEngine) {
            visibilityEngine.setSearchQuery("");

        } catch (error) {
            console.error('❌ ProjectManager Error:', error);
            const elements = this.getElements();
            if (elements.projectsGrid) {
                elements.projectsGrid.innerHTML = `<div class="error-msg">Failed to load projects.</div>`;
            }

        }
    }


        renderProjects();
    });
}


const projectsContainer = document.querySelector(".projects-container");
const paginationContainer = document.getElementById("pagination-controls");
const emptyState = document.getElementById("empty-state");



const scrollBtn = document.getElementById("scrollToTopBtn");
const navbar = document.getElementById("navbar");

let allProjectsData = [];
let currentPage = 1;
const itemsPerPage = 9;
let currentCategory = "all";
let currentSort = "default";


const allCards = Array.from(document.querySelectorAll(".card"));

// Updates the project count displayed on category filter buttons
function updateCategoryCounts() {
    const counts = {};

    allCards.forEach(card => {
        const cat = card.dataset.category;
        counts[cat] = (counts[cat] || 0) + 1;
    });

    filterBtns.forEach(btn => {
        const cat = btn.dataset.filter;
        if (cat === "all") {
            btn.innerText = `All (${allCards.length})`;
        } else {
            btn.innerText = `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${counts[cat] || 0})`;
        }
    });
}

// ===============================
// Add GitHub link button to cards
// ===============================


const contributorsGrid = document.getElementById("contributors-grid");

let allProjectsData = [];
let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";
const itemsPerPage = 9;

let visibilityEngine = null;

/* =====================================================
   THEME TOGGLE
===================================================== */
const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);


toggleBtn?.addEventListener("click", () => {
  const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);

  toggleBtn.classList.add("shake");
  setTimeout(() => toggleBtn.classList.remove("shake"), 500);
});


// Fetch projects JSON
async function fetchProjects() {
    try {

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

        // Sorting
        const sortMode = elements.sortSelect?.value || 'default';
        if (sortMode === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortMode === 'za') filtered.sort((a, b) => b.title.localeCompare(a.title));
        else if (sortMode === 'newest') filtered.reverse();

        // Pagination Calculations
        const totalPages = Math.ceil(filtered.length / this.config.ITEMS_PER_PAGE);
        const start = (this.state.currentPage - 1) * this.config.ITEMS_PER_PAGE;
        const pageItems = filtered.slice(start, start + this.config.ITEMS_PER_PAGE);

        // Grid/List visibility management
        if (elements.projectsGrid) {
            elements.projectsGrid.style.display = this.state.viewMode === 'card' ? 'grid' : 'none';
            if (this.state.viewMode !== 'card') elements.projectsGrid.innerHTML = '';
        }
        if (elements.projectsList) {
            elements.projectsList.style.display = this.state.viewMode === 'list' ? 'flex' : 'none';
            if (this.state.viewMode !== 'list') elements.projectsList.innerHTML = '';
        }



function updateThemeIcon(theme) {
  themeIcon.className = theme === "dark" ? "ri-moon-fill" : "ri-sun-line";
}

/* =====================================================
   SCROLL TO TOP + NAVBAR SHADOW
===================================================== */
window.addEventListener("scroll", () => {
  scrollBtn?.classList.toggle("show", window.scrollY > 300);
  navbar?.classList.toggle("scrolled", window.scrollY > 50);
});


scrollBtn?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

// Surprise Me Button Logic
if (surpriseBtn) {
    surpriseBtn.addEventListener("click", () => {
        if (allProjectsData.length > 0) {
            const randomIndex = Math.floor(Math.random() * allProjectsData.length);
            const randomProject = allProjectsData[randomIndex];
            // Open project link
            window.open(randomProject.link, "_self");

        // Handle empty state
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

        // Page numbers
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


        // Stagger animation
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        projectsContainer.appendChild(card);
    });



/* =====================================================
   FETCH PROJECTS
===================================================== */
async function fetchProjects() {
  try {
    const res = await fetch("./projects.json");
    const data = await res.json();
    allProjectsData = data;

    const metadata = data.map(p => ({
      id: p.title,
      title: p.title,
      category: p.category,
      description: p.description || ""
    }));

    visibilityEngine = new ProjectVisibilityEngine(metadata);
    renderProjects();
  } catch (err) {
    console.error("Failed to load projects:", err);
    projectsContainer.innerHTML = `<p>Unable to load projects.</p>`;
  }
}

/* =====================================================
   RENDER PROJECTS
===================================================== */
function renderProjects() {
  if (!projectsContainer) return;

  let filtered = [...allProjectsData];

  // Search via engine
  if (visibilityEngine) {
    const visibleIds = new Set(visibilityEngine.getVisibleProjects());
    filtered = filtered.filter(p => visibleIds.has(p.title));
  }

  // Category filter
  if (currentCategory !== "all") {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // Sorting
  if (currentSort === "az") filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (currentSort === "za") filtered.sort((a, b) => b.title.localeCompare(a.title));
  if (currentSort === "newest") filtered.reverse();

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  projectsContainer.innerHTML = "";

  if (paginated.length === 0) {
    emptyState.style.display = "block";
    renderPagination(0);
    return;
  } else {
    emptyState.style.display = "none";
  }

  paginated.forEach(project => {
    const card = document.createElement("a");
    card.href = project.link;
    card.className = "card";
    card.dataset.category = project.category;

    card.innerHTML = `
      <div class="card-cover"><i class="${project.icon}"></i></div>
      <div class="card-content">
        <h3 class="card-heading">${escapeHtml(project.title)}</h3>
        <p class="card-description">${escapeHtml(project.description)}</p>
        <div class="card-tech">
          ${(project.tech || []).map(t => `<span>${t}</span>`).join("")}
        </div>
      </div>
    `;

    projectsContainer.appendChild(card);
  });

  renderPagination(totalPages);

    renderPagination(totalPages);
}


        const prev = container.querySelector('#pagination-prev');
        if (prev && !prev.disabled) {
            prev.addEventListener('click', () => {
                this.state.currentPage--;
                this.render();
                this.scrollToTop();
            });


        const next = container.querySelector('#pagination-next');
        if (next && !next.disabled) {
            next.addEventListener('click', () => {
                this.state.currentPage++;
                this.render();
                this.scrollToTop();
            });
        }
    }


// Capitalize the first letter of a given string
function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);

}


/* =====================================================
   PAGINATION
===================================================== */

// Escape HTML to prevent XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

    scrollToTop() {
        const section = document.getElementById('projects');
        if (section) {
            const navbarHeight = 75;
            window.scrollTo({
                top: section.offsetTop - navbarHeight,
                behavior: 'smooth'
            });
        }
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

    getSourceCodeUrl(link) {
        if (!link) return 'https://github.com/YadavAkhileshh/OpenPlayground';

        let path = link;
        // Remove leading ./
        if (path.startsWith('./')) {
            path = path.slice(2);
        }
        // Remove trailing /index.html or index.html
        path = path.replace(/\/index\.html$/, '').replace(/^index\.html$/, '');


// Pagination
// ===============================


function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.toggle("active", i === currentPage);
    btn.onclick = () => {
      currentPage = i;
      renderProjects();
      scrollToProjects();
    };
    paginationContainer.appendChild(btn);
  }
}

function scrollToProjects() {
  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
}


// Pagination
function renderPagination(totalPages){
    paginationContainer.innerHTML = "";
    if(totalPages <= 1) return;

    for(let i=1;i<=totalPages;i++){
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.toggle("active", i===currentPage);
        btn.addEventListener("click", () => {
            currentPage=i;
            renderProjects();
            window.scrollTo({top: document.getElementById("projects").offsetTop-80, behavior:"smooth"});
        });
        paginationContainer.appendChild(btn);

        return `https://github.com/YadavAkhileshh/OpenPlayground/tree/main/${path}`;

    }
}

/**
 * Contributors Fetcher
 */
async function fetchContributors() {
    const grid = document.getElementById('contributors-grid');
    if (!grid) return;


function capitalize(str){ return str.charAt(0).toUpperCase() + str.slice(1); }



/* =====================================================
   FILTER / SEARCH / SORT EVENTS
===================================================== */
searchInput?.addEventListener("input", () => {
  visibilityEngine?.setSearchQuery(searchInput.value);
  currentPage = 1;
  renderProjects();
});

// ===============================
// Init
// ===============================

updateCategoryCounts();


sortSelect?.addEventListener("change", () => {
  currentSort = sortSelect.value;
  currentPage = 1;
  renderProjects();
});


filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.filter;
    currentPage = 1;
    renderProjects();
  });
});

clearBtn?.addEventListener("click", () => {
  searchInput.value = "";
  sortSelect.value = "default";
  currentCategory = "all";
  currentPage = 1;
  visibilityEngine?.setSearchQuery("");
  renderProjects();
});

surpriseBtn?.addEventListener("click", () => {
  if (!allProjectsData.length) return;
  const random = allProjectsData[Math.floor(Math.random() * allProjectsData.length)];
  window.location.href = random.link;
});

/* =====================================================
   CONTRIBUTORS
===================================================== */
async function fetchContributors() {

  if (!contributorsGrid) return;
  try {
    const res = await fetch(
      "https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors"
    );
    const contributors = await res.json();

    contributorsGrid.innerHTML = "";
    contributors.forEach(c => {
      const card = document.createElement("a");
      card.href = c.html_url;
      card.target = "_blank";
      card.className = "contributor-card";
      card.innerHTML = `
        <img src="${c.avatar_url}" alt="${c.login}" loading="lazy">
        <span>${c.login}</span>
      `;
      contributorsGrid.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to fetch contributors:", err);
  }

    if (!contributorsGrid) return;

    try {
        const response = await fetch('https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors');
        if (!response.ok) throw new Error('Failed to fetch contributors');


        const contributors = await response.json();

        // Update count if exists
        const count = document.getElementById('contributor-count');
        if (count) count.textContent = `${contributors.length}+`;


// ===============================
// FETCH CONTRIBUTORS
// ===============================
const contributorsGrid = document.getElementById("contributors-grid");
async function fetchContributors(){
    if(!contributorsGrid) return;

    try {
        const res = await fetch("https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors");
        const contributors = await res.json();
        contributorsGrid.innerHTML = "";

        contributors.forEach((c,i)=>{
            const card = document.createElement("a");
            card.href = c.html_url;
            card.target = "_blank";
            card.className = "contributor-card";
            card.innerHTML = `
                <img src="${c.avatar_url}" alt="${c.login}" class="contributor-avatar" loading="lazy">
                <span class="contributor-name">${c.login}</span>


        contributors.forEach((contributor, index) => {
            const card = document.createElement("div");
            card.className = "contributor-card";

            // Determine if this is a developer (>50 contributions)
            const isDeveloper = contributor.contributions > 50;
            const badgeHTML = isDeveloper
                ? `<span class="contributor-badge developer-badge"><i class="ri-code-s-slash-line"></i> Developer</span>`
                : '';

            card.innerHTML = `
                <img src="${contributor.avatar_url}" alt="${contributor.login}" class="contributor-avatar" loading="lazy">

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

/* =====================================================
   UTILS
===================================================== */
function escapeHtml(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}


/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  fetchProjects();
  fetchContributors();

// ===============================
// SMOOTH SCROLL ANCHORS
// ===============================
document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
    anchor.addEventListener("click", function(e){
        const targetId = this.getAttribute("href");
        if(targetId==="#") return;
        const target = document.querySelector(targetId);
        if(target){
            e.preventDefault();
            target.scrollIntoView({behavior:"smooth", block:"start"});
        }
    });

});



// ===============================
// NAVBAR SCROLL SHADOW
// ===============================

const navbar = document.getElementById('navbar');
window.addEventListener("scroll", ()=>{
    navbar?.classList.toggle("scrolled", window.scrollY > 50);
});

// ===============================
// INITIALIZATION
// ===============================
fetchProjects();
fetchContributors();
console.log("%c🚀 Contribute at https://github.com/YadavAkhileshh/OpenPlayground", "color:#6366f1;font-size:14px;font-weight:bold;");


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


// Console message

console.log(
  "%c🚀 Want to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
  "color:#6366f1;font-size:14px;font-weight:bold"
);



feat / your - feature
// ================= CATEGORY FILTERING FOR PROJECTS =================
document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".projects-container .card");
    const emptyState = document.getElementById("empty-state");

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            // Active button UI
            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const selectedCategory = btn.dataset.filter;
            let visibleCount = 0;

            projectCards.forEach((card) => {
                const cardCategory = card.dataset.category;

                if (
                    selectedCategory === "all" ||
                    cardCategory === selectedCategory
                ) {
                    card.style.display = "block";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            // Empty state handling
            if (emptyState) {
                emptyState.style.display = visibleCount === 0 ? "block" : "none";
            }
        });
    });
});

// ===============================
// Global Initialization
// ===============================


// Expose to global scope for components.js compatibility
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