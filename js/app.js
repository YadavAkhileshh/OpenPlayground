// ===============================
// OpenPlayground - Main JavaScript
// ===============================

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

// ===============================
// Theme Toggle

// ===============================
const toggleBtn = document.getElementById("toggle-mode-btn");
const themeIcon = document.getElementById("theme-icon");
const html = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);


function updateThemeIcon(theme) {
    if (theme === "dark") {
        themeIcon.className = "ri-moon-fill";
    } else {
        themeIcon.className = "ri-sun-line";
    }
}

toggleBtn?.addEventListener("click", () => {
    const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";

// Toggle between light and dark theme when the user clicks the theme button
toggleBtn.addEventListener("click", () => {
    const newTheme =
        html.getAttribute("data-theme") === "light" ? "dark" : "light";

  html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
    toggleBtn.classList.add("shake");
    setTimeout(() => toggleBtn.classList.remove("shake"), 500);
});

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("project-search");
    const projectsPlaceholder = document.getElementById("projects-placeholder");
    const emptyState = document.getElementById("empty-state");

    // Function to filter projects
    function filterProjects() {
        // Get current cards (in case they are dynamically loaded)
        const cards = projectsPlaceholder.querySelectorAll(".card");
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.querySelector(".card-heading")?.textContent.toLowerCase() || "";
            const description = card.querySelector(".card-description")?.textContent.toLowerCase() || "";
            const category = card.dataset.category?.toLowerCase() || "";

            if (title.includes(query) || description.includes(query) || category.includes(query)) {
                card.style.display = ""; // Keep default CSS layout
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        emptyState.style.display = visibleCount === 0 ? "flex" : "none";
    }

    // Listen for input on search box
    searchInput.addEventListener("input", filterProjects);

    // Optional: if projects are loaded asynchronously, observe changes
    const observer = new MutationObserver(() => {
        filterProjects(); // Re-apply filter whenever new cards are added
    });

    observer.observe(projectsPlaceholder, { childList: true, subtree: true });
});


// ===============================
// SCROLL TO TOP
// ===============================
const scrollBtn = document.getElementById("scrollToTopBtn");
window.addEventListener("scroll", () => {
    scrollBtn.classList.toggle("show", window.scrollY > 300);
});
scrollBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===============================
// MOBILE NAVBAR
// ===============================
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if(navToggle && navLinks){
    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        const icon = navToggle.querySelector("i");
        icon.className = navLinks.classList.contains("active") ? "ri-close-line" : "ri-menu-3-line";
    });
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            navToggle.querySelector("i").className = "ri-menu-3-line";
        });
    });
}

// ===============================
// PROJECTS SEARCH, FILTER, SORT, PAGINATION
// ===============================

  const searchInput = document.getElementById("project-search");
const sortSelect = document.getElementById("project-sort");
const filterBtns = document.querySelectorAll(".filter-btn");

  
// Number of project cards displayed per page
const itemsPerPage = 9;
// Tracks the current page number for pagination
let currentPage = 1;
// Stores the currently selected project category filter
let currentCategory = "all";
// Stores the currently selected sorting option
let currentSort = "default";
// Holds all project data fetched from the projects.json file
let allProjectsData = [];

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
        }

        renderProjects();
    });
}


const projectsContainer = document.querySelector(".projects-container");
const paginationContainer = document.getElementById("pagination-controls");
const emptyState = document.getElementById("empty-state");


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

// Dynamically add GitHub repository links to project cards
allCards.forEach(card => {
    const githubUrl = card.dataset.github;
    if (!githubUrl) return;

    const githubBtn = document.createElement("a");
    githubBtn.href = githubUrl;
    githubBtn.target = "_blank";
    githubBtn.rel = "noopener noreferrer";
    githubBtn.className = "github-link";
    githubBtn.innerHTML = `<i class="ri-github-fill"></i>`;

    // Prevent card navigation when clicking the GitHub button
    githubBtn.addEventListener("click", e => e.stopPropagation());

    card.style.position = "relative";
    card.appendChild(githubBtn);
});


// Fetch projects JSON
async function fetchProjects() {
    try {

        const res = await fetch("./projects.json");
        allProjectsData = await res.json();

        const response = await fetch("./projects.json");
        const data = await response.json();
        allProjectsData = data;

        // Update project count in hero
        const projectCount = document.getElementById("project-count");
        if (projectCount) {
            projectCount.textContent = `${data.length}+`;
        }

        // ===============================
        // Architecture: Initialize ProjectVisibilityEngine
        // ===============================
        // Extract metadata from project data to initialize the engine
        // This creates a clean separation between data model and presentation
        const projectMetadata = data.map(project => ({
            id: project.title, // Using title as unique identifier
            title: project.title,
            category: project.category,
            description: project.description || ""
        }));

        visibilityEngine = new ProjectVisibilityEngine(projectMetadata);


        renderProjects();
    } catch(err) {
        console.error("Failed to load projects:", err);
        projectsContainer.innerHTML = `<p>Unable to load projects.</p>`;
    }
}


// Render projects based on search/filter/sort/pagination
function renderProjects() {
    if(!projectsContainer) return;

    const searchText = searchInput.value.toLowerCase();
    let filtered = allProjectsData.filter(p => 
        p.title.toLowerCase().includes(searchText) || 
        p.description.toLowerCase().includes(searchText)
    );

    if(currentCategory !== "all") filtered = filtered.filter(p => p.category === currentCategory);

// ===============================
// Event Listeners
// ===============================

if (searchInput) {
    // Architecture: Search input now updates the visibility engine
    // The engine computes which projects should be visible
    // renderProjects() will read this state and update the DOM accordingly
    searchInput.addEventListener("input", () => {
        if (visibilityEngine) {
            visibilityEngine.setSearchQuery(searchInput.value);
        }
        currentPage = 1;
        renderProjects();
    });
}

if (sortSelect) {
    sortSelect.addEventListener("change", () => {
        currentSort = sortSelect.value;
        currentPage = 1;
        renderProjects();
    });
}

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.filter;
        currentPage = 1;
        renderProjects();
    });
});

// Surprise Me Button Logic
if (surpriseBtn) {
    surpriseBtn.addEventListener("click", () => {
        if (allProjectsData.length > 0) {
            const randomIndex = Math.floor(Math.random() * allProjectsData.length);
            const randomProject = allProjectsData[randomIndex];
            // Open project link
            window.open(randomProject.link, "_self");
        }
    });
}

// Render project cards based on search text, category filter, sorting option,
// and pagination state
function renderProjects() {
    if (!projectsContainer) return;

    let filteredProjects = [...allProjectsData];

    // ===============================
    // Architecture: Use ProjectVisibilityEngine for Search Filtering
    // ===============================
    // Instead of inline search logic, we delegate to the engine
    // The engine returns IDs of visible projects based on search query
    // We then filter our data array to match these IDs
    // This enables:
    // 1. Complex search algorithms without cluttering this function
    // 2. Easy A/B testing of different search strategies
    // 3. Consistent search behavior across multiple UI components
    if (visibilityEngine) {
        const visibleProjectIds = visibilityEngine.getVisibleProjects();
        const visibleIdSet = new Set(visibleProjectIds);
        filteredProjects = filteredProjects.filter(project =>
            visibleIdSet.has(project.title)
        );
    }

    // Filter projects based on selected category
    // Note: This will be migrated to the engine in Phase 2
    if (currentCategory !== "all") {
        filteredProjects = filteredProjects.filter(
            (project) => project.category === currentCategory
        );
    }

    // Sort projects according to the selected sorting option
    // Note: This will be migrated to the engine in Phase 2
    switch (currentSort) {
        case "az":
            filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "za":
            filteredProjects.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "newest":
            filteredProjects.reverse();
            break;
    }


    switch(currentSort){
        case "az": filtered.sort((a,b)=>a.title.localeCompare(b.title)); break;
        case "za": filtered.sort((a,b)=>b.title.localeCompare(a.title)); break;
        case "newest": filtered.reverse(); break;
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage-1)*itemsPerPage;
    const paginated = filtered.slice(start, start+itemsPerPage);

    // Empty state
    if(paginated.length===0){
        emptyState.style.display = "block";
        projectsContainer.innerHTML = "";
        paginationContainer.innerHTML = "";
        return;
    } else {
        emptyState.style.display = "none";
    }

    // Render project cards
    projectsContainer.innerHTML = "";
    paginated.forEach(project=>{
        const card = document.createElement("a");
        card.href = project.link;
        card.className = "card";
        card.setAttribute("data-category", project.category);

        card.innerHTML = `
            <div class="card-cover" style="${project.coverStyle || ''}"><i class="${project.icon}"></i></div>


        // Cover style
        let coverAttr = "";
        if (project.coverClass) {
            coverAttr = `class="card-cover ${project.coverClass}"`;
        } else if (project.coverStyle) {
            coverAttr = `class="card-cover" style="${project.coverStyle}"`;
        } else {
            coverAttr = `class="card-cover"`;
        }

        // Tech stack
        const techStackHtml = project.tech.map((t) => `<span>${t}</span>`).join("");

        // Check if project is bookmarked
        const isBookmarked = window.bookmarksManager && window.bookmarksManager.isBookmarked(project.title);
        const bookmarkClass = isBookmarked ? 'bookmarked' : '';
        const bookmarkIcon = isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';

        card.innerHTML = `
            <button class="bookmark-btn ${bookmarkClass}" data-project-title="${escapeHtml(project.title)}" aria-label="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
                <i class="${bookmarkIcon}"></i>
            </button>
            <div ${coverAttr}><i class="${project.icon}"></i></div>

            <div class="card-content">
                <div class="card-header-flex">
                    <h3 class="card-heading">${project.title}</h3>
                    <span class="category-tag">${capitalize(project.category)}</span>
                </div>
                <p class="card-description">${project.description}</p>
                <div class="card-tech">${project.tech.map(t=>`<span>${t}</span>`).join('')}</div>
            </div>
        `;



        // Add bookmark button click handler
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBookmarkClick(bookmarkBtn, project);
        });

        // Stagger animation
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        projectsContainer.appendChild(card);
    });

    renderPagination(totalPages);
}



// Capitalize the first letter of a given string
function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Handle bookmark button click
function handleBookmarkClick(btn, project) {
    if (!window.bookmarksManager) return;
    
    const isNowBookmarked = window.bookmarksManager.toggleBookmark(project);
    const icon = btn.querySelector('i');
    
    // Update button state
    btn.classList.toggle('bookmarked', isNowBookmarked);
    icon.className = isNowBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';
    btn.setAttribute('aria-label', isNowBookmarked ? 'Remove bookmark' : 'Add bookmark');
    
    // Add animation
    btn.classList.add('animate');
    setTimeout(() => btn.classList.remove('animate'), 300);
    
    // Show toast notification
    showBookmarkToast(isNowBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
}

// Show toast notification
function showBookmarkToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.bookmark-toast');
    if (existingToast) existingToast.remove();
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'bookmark-toast';
    toast.innerHTML = `
        <i class="ri-bookmark-fill"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ===============================

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
    }
}


function capitalize(str){ return str.charAt(0).toUpperCase() + str.slice(1); }

// ===============================
// Init
// ===============================

updateCategoryCounts();

console.log(
    "%cWant to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
    "color:#8b5cf6;font-size:14px"
);


// Event listeners
searchInput?.addEventListener("input", ()=>{ currentPage=1; renderProjects(); });
sortSelect?.addEventListener("change", ()=>{ currentSort=sortSelect.value; currentPage=1; renderProjects(); });
filterBtns.forEach(btn=>btn.addEventListener("click", ()=>{
    filterBtns.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory=btn.dataset.filter;
    currentPage=1;
    renderProjects();
}));

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
                <div class="contributor-info">
                    <h3 class="contributor-name">${contributor.login}</h3>
                    <div class="contributor-stats">
                        <span class="contributor-contributions">
                            <i class="ri-git-commit-line"></i> ${contributor.contributions} contributions
                        </span>
                        ${badgeHTML}
                    </div>
                </div>
                <a href="${contributor.html_url}" target="_blank" rel="noopener noreferrer" class="contributor-github-link" aria-label="View ${contributor.login} on GitHub">
                    <i class="ri-github-fill"></i>
                </a>

            `;
            contributorsGrid.appendChild(card);
        });
    } catch(err){
        console.error("Failed to fetch contributors:", err);
        contributorsGrid.innerHTML = `<p>Unable to load contributors.</p>`;
    }
}

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


// Wait for all components to be loaded before initializing
// The components.js dispatches a 'componentLoaded' event when each component is loaded
let componentsLoaded = 0;
const totalComponents = 6; // header, hero, projects, contribute, footer, chatbot

document.addEventListener('componentLoaded', (e) => {
    componentsLoaded++;
    console.log(`✅ Component loaded: ${e.detail.component} (${componentsLoaded}/${totalComponents})`);

    // Once all components are loaded, initialize the app
    if (componentsLoaded === totalComponents) {
        console.log('🎉 All components loaded! Initializing app...');
        initializeApp();
    }
});

// Also add a fallback timeout in case event doesn't fire
setTimeout(() => {
    if (componentsLoaded < totalComponents) {
        console.log('⏰ Timeout reached, initializing app anyway...');
        initializeApp();
    }
}, 3000);

function initializeApp() {
    // Initialize project data
    fetchProjects();

    console.log('🚀 OpenPlayground app initialized!');
}

// Console message
console.log(
    "%c🚀 Want to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
    "color: #6366f1; font-size: 14px; font-weight: bold;"
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


// --- 1. Navbar Scroll Logic ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- 2. Fade Up Animation Trigger ---
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });
});

