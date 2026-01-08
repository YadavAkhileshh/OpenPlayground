// ===============================
// Global State
// ===============================
const itemsPerPage = 1000; // All projects on one page
let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";
let allProjectsData = [];

// ===============================
// Initialization
// ===============================
window.addEventListener('load', () => {
    setTimeout(() => {
        initializeApp();
    }, 500);
});

function initializeApp() {
    console.log("🚀 Initializing App...");
    fetchProjects();
    setupTheme();
    setupMobileNav();
    setupEventListeners();
}

// ===============================
// Data Fetching
// ===============================
async function fetchProjects() {
    try {
        // Cache Buster: Forces browser to load the new 73-item file
        const uniqueUrl = "./projects.json?v=" + Date.now();
        const response = await fetch(uniqueUrl);
        
        if (!response.ok) throw new Error("projects.json not found");
        
        const data = await response.json();
        allProjectsData = data;
        
        console.log(`✅ Loaded ${data.length} projects.`);
        
        updateCategoryCounts();
        renderProjects();
        
    } catch (error) {
        console.error("❌ Error:", error);
        const container = document.querySelector(".projects-container");
        if(container) container.innerHTML = `<div class="empty-state"><h3>Error loading projects</h3><p>${error.message}</p></div>`;
    }
}

// ===============================
// STRICT CATEGORY LOGIC (FIXED)
// ===============================
function projectMatchesCategory(project, filterCategory) {
    const filter = filterCategory.toLowerCase().trim();
    // Only look at the category label
    const pCat = project.category ? project.category.toLowerCase().trim() : "uncategorized";

    if (filter === "all") return true;

    // --- RULES ---

    // 1. GAME Button: Acts as a "Master" category for all games
    // It matches "Game", "Action", "Strategy", "Puzzle"
    if (filter === "game") {
        return pCat.includes("game") || pCat.includes("action") || pCat.includes("strategy") || pCat.includes("puzzle");
    }

    // 2. UTILITY Button: Matches "Utility" or "Tool"
    if (filter === "utility") {
        return pCat.includes("utility") || pCat.includes("tool");
    }

    // 3. ALL OTHER BUTTONS (Action, Strategy, Puzzle)
    // STRICT MATCH: The project label must contain the filter name.
    // Example: "Action" button will ONLY show "Action" or "Action Game".
    // It will NOT show "Tic Tac Toe" (which is just "Game").
    return pCat.includes(filter);
}

// ===============================
// Rendering Logic
// ===============================
function renderProjects() {
    const projectsContainer = document.querySelector(".projects-container");
    if (!projectsContainer) return;

    let filteredProjects = [...allProjectsData];

    // 1. Search Filter
    const searchInput = document.getElementById("project-search");
    if (searchInput && searchInput.value.trim() !== "") {
        const query = searchInput.value.toLowerCase().trim();
        filteredProjects = filteredProjects.filter(project => 
            project.title.toLowerCase().includes(query)
        );
    }

    // 2. Category Filter
    if (currentCategory !== "all") {
        filteredProjects = filteredProjects.filter(project => 
            projectMatchesCategory(project, currentCategory)
        );
    }

    // 3. Sorting
    switch (currentSort) {
        case "az": filteredProjects.sort((a, b) => a.title.localeCompare(b.title)); break;
        case "za": filteredProjects.sort((a, b) => b.title.localeCompare(a.title)); break;
        case "newest": filteredProjects.reverse(); break;
    }

    // 4. Render
    projectsContainer.innerHTML = "";

    if (filteredProjects.length === 0) {
        projectsContainer.innerHTML = `<div class="empty-state" style="text-align:center; padding:2rem;"><h3>No projects found!</h3></div>`;
        return;
    }

    filteredProjects.forEach((project, index) => {
        const card = document.createElement("a");
        card.href = project.link;
        card.className = "card";
        
        let coverAttr = 'class="card-cover"';
        if (project.coverClass) coverAttr = `class="card-cover ${project.coverClass}"`;
        else if (project.coverStyle) coverAttr = `class="card-cover" style="${project.coverStyle}"`;
        
        const techStackHtml = project.tech ? project.tech.map(t => `<span>${t}</span>`).join("") : "";
        const isBookmarked = window.bookmarksManager && window.bookmarksManager.isBookmarked(project.title);

        card.innerHTML = `
            <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-project-title="${escapeHtml(project.title)}">
                <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
            </button>
            <div ${coverAttr}><i class="${project.icon}"></i></div>
            <div class="card-content">
                <div class="card-header-flex">
                    <h3 class="card-heading">${project.title}</h3>
                    <span class="category-tag">${capitalize(project.category)}</span>
                </div>
                <p class="card-description">${project.description}</p>
                <div class="card-tech">${techStackHtml}</div>
            </div>
        `;

        const bBtn = card.querySelector('.bookmark-btn');
        if(bBtn) bBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(window.bookmarksManager) {
                const isNow = window.bookmarksManager.toggleBookmark(project);
                bBtn.querySelector('i').className = isNow ? 'ri-bookmark-fill' : 'ri-bookmark-line';
                bBtn.classList.toggle('bookmarked', isNow);
            }
        });

        projectsContainer.appendChild(card);
        card.style.opacity = "1"; 
        card.style.transform = "translateY(0)";
    });
    
    const paginationContainer = document.getElementById("pagination-controls");
    if(paginationContainer) paginationContainer.innerHTML = "";
}

// ===============================
// Helper Functions
// ===============================
function updateCategoryCounts() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const counts = {};
    
    allProjectsData.forEach(project => {
        filterBtns.forEach(btn => {
            const filterKey = btn.dataset.filter;
            if (filterKey === "all") return;
            
            if (projectMatchesCategory(project, filterKey)) {
                counts[filterKey] = (counts[filterKey] || 0) + 1;
            }
        });
    });

    filterBtns.forEach(btn => {
        const key = btn.dataset.filter;
        if (key === "all") {
            btn.innerText = `All (${allProjectsData.length})`;
        } else {
            const count = counts[key] || 0;
            const originalText = btn.dataset.filter;
            const formatted = originalText.charAt(0).toUpperCase() + originalText.slice(1);
            btn.innerText = `${formatted} (${count})`;
        }
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById("project-search");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderProjects();
        });
    }

    const sortSelect = document.getElementById("project-sort");
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentSort = sortSelect.value;
            renderProjects();
        });
    }

    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
            newBtn.classList.add("active");
            currentCategory = newBtn.dataset.filter; 
            renderProjects();
        });
    });

    const clearBtn = document.getElementById("clear-filters");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (sortSelect) sortSelect.value = "default";
            currentCategory = "all";
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            const allBtn = document.querySelector('[data-filter="all"]');
            if(allBtn) allBtn.classList.add("active");
            renderProjects();
        });
    }
}

function setupTheme() {
    const toggleBtn = document.getElementById("toggle-mode-btn");
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "light";
    html.setAttribute("data-theme", savedTheme);
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
            html.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }
}

function setupMobileNav() {
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }
}

function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ""; }
function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }