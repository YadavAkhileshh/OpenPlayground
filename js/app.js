// ===============================
// OpenPlayground - Main JavaScript
// ===============================

// This file controls core UI behavior such as theme switching,
// project rendering, filtering, sorting, pagination, and contributor display.

// ===============================
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

// Elements related to theme toggle (light/dark mode)
const toggleBtn = document.getElementById("toggle-mode-btn");
const themeIcon = document.getElementById("theme-icon");
const html = document.documentElement;

// Load previously saved theme from localStorage or default to light theme
const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);

// Toggle between light and dark theme when the user clicks the theme button
toggleBtn.addEventListener("click", () => {
    const newTheme =
        html.getAttribute("data-theme") === "light" ? "dark" : "light";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);

    // Add shake animation
    toggleBtn.classList.add("shake");
    setTimeout(() => toggleBtn.classList.remove("shake"), 500);
});

// Updates the theme icon based on the currently active theme
function updateThemeIcon(theme) {
    if (theme === "dark") {
        themeIcon.className = "ri-moon-fill";
    } else {
        themeIcon.className = "ri-sun-line";
    }
}

// ===============================
// Scroll to Top
// ===============================

// Button used to scroll back to the top of the page
const scrollBtn = document.getElementById("scrollToTopBtn");

// Show or hide the scroll-to-top button based on scroll position
window.addEventListener("scroll", () => {
    scrollBtn.classList.toggle("show", window.scrollY > 300);
});

// Smoothly scroll to the top when the button is clicked
scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===============================
// Mobile Navbar
// ===============================

// Mobile navigation toggle elements
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
    // Toggle mobile navigation menu and update menu icon
    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");

        // Toggle icon
        const icon = navToggle.querySelector("i");
        if (navLinks.classList.contains("active")) {
            icon.className = "ri-close-line";
        } else {
            icon.className = "ri-menu-3-line";
        }
    });

    // Close mobile menu when a navigation link is clicked
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            navToggle.querySelector("i").className = "ri-menu-3-line";
        });
    });
}

// ===============================
// Projects Logic
// ===============================

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

// Fetch project data from projects.json and initialize project rendering
async function fetchProjects() {
    try {
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
    } catch (error) {
        // Display a fallback message if project data fails to load
        console.error("Error loading projects:", error);
        if (projectsContainer) {
            projectsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load projects</h3>
                    <p>Please try refreshing the page</p>
                </div>
            `;
        }
    }
}

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

    // Calculate pagination values and slice project list accordingly
    const totalItems = filteredProjects.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredProjects.slice(start, start + itemsPerPage);

    // Display empty state message if no projects match the criteria
    projectsContainer.innerHTML = "";

    if (paginatedItems.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-state">
              <div class = "empty-icon">📂</div>
                <h3>No projects found! </h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        renderPagination(0);
        return;
    }

    // Render cards with stagger animation
    paginatedItems.forEach((project, index) => {
        const card = document.createElement("a");
        card.href = project.link;
        card.className = "card";
        card.setAttribute("data-category", project.category);

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

        card.innerHTML = `
            <div ${coverAttr}><i class="${project.icon}"></i></div>
            <div class="card-content">
                <div class="card-header-flex">
                    <h3 class="card-heading">${project.title}</h3>
                    <span class="category-tag">${capitalize(
            project.category
        )}</span>
                </div>
                <p class="card-description">${project.description}</p>
                <div class="card-tech">${techStackHtml}</div>
            </div>
        `;

        // Stagger animation
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        projectsContainer.appendChild(card);

        setTimeout(() => {
            card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 50);
    });

    // Render pagination controls and handle page navigation
    renderPagination(totalPages);
}

// Capitalize the first letter of a given string
function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===============================
// Pagination
// ===============================

function renderPagination(totalPages) {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";
    if (totalPages <= 1) return;

    const createBtn = (label, disabled, onClick, isActive = false) => {
        const btn = document.createElement("button");
        btn.className = `pagination-btn${isActive ? " active" : ""}`;
        btn.innerHTML = label;
        btn.disabled = disabled;
        btn.onclick = onClick;
        return btn;
    };

    // Create previous page navigation button
    paginationContainer.appendChild(
        createBtn('<i class="ri-arrow-left-s-line"></i>', currentPage === 1, () => {
            currentPage--;
            renderProjects();
            scrollToProjects();
        })
    );

    // Page numbers (with ellipsis for many pages)
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        paginationContainer.appendChild(
            createBtn("1", false, () => {
                currentPage = 1;
                renderProjects();
                scrollToProjects();
            })
        );
        if (startPage > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-btn";
            ellipsis.textContent = "...";
            ellipsis.style.cursor = "default";
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(
            createBtn(
                i,
                false,
                () => {
                    currentPage = i;
                    renderProjects();
                    scrollToProjects();
                },
                i === currentPage
            )
        );
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-btn";
            ellipsis.textContent = "...";
            ellipsis.style.cursor = "default";
            paginationContainer.appendChild(ellipsis);
        }
        paginationContainer.appendChild(
            createBtn(totalPages, false, () => {
                currentPage = totalPages;
                renderProjects();
                scrollToProjects();
            })
        );
    }

    // Create next page navigation button
    paginationContainer.appendChild(
        createBtn(
            '<i class="ri-arrow-right-s-line"></i>',
            currentPage === totalPages,
            () => {
                currentPage++;
                renderProjects();
                scrollToProjects();
            }
        )
    );
}

function scrollToProjects() {
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// ===============================
// Init
// ===============================

updateCategoryCounts();

console.log(
    "%cWant to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
    "color:#8b5cf6;font-size:14px"
);


// ===============================
// Hall of Contributors Logic
// ===============================

const contributorsGrid = document.getElementById("contributors-grid");

// Fetch GitHub contributors and display them in the contributors section
async function fetchContributors() {
    if (!contributorsGrid) return;

    try {
        const response = await fetch(
            "https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch contributors");
        }

        const contributors = await response.json();

        // Update contributor count in hero
        const contributorCount = document.getElementById("contributor-count");
        if (contributorCount) {
            contributorCount.textContent = `${contributors.length}+`;
        }

        contributorsGrid.innerHTML = "";

        contributors.forEach((contributor, index) => {
            const card = document.createElement("a");
            card.href = contributor.html_url;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            card.className = "contributor-card";

            card.innerHTML = `
                <img src="${contributor.avatar_url}" alt="${contributor.login}" class="contributor-avatar" loading="lazy">
                <span class="contributor-name">${contributor.login}</span>
            `;

            // Stagger animation
            card.style.opacity = "0";
            card.style.transform = "translateY(20px)";
            contributorsGrid.appendChild(card);

            setTimeout(() => {
                card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            }, index * 30);
        });
    } catch (error) {
        // Show fallback message if contributors cannot be loaded
        console.error("Error fetching contributors:", error);
        contributorsGrid.innerHTML = `
            <div class="loading-msg">
                Unable to load contributors. 
                <a href="https://github.com/YadavAkhileshh/OpenPlayground/graphs/contributors" 
                   target="_blank" 
                   style="color: var(--primary-500); text-decoration: underline;">
                   View on GitHub
                </a>
            </div>
        `;
    }
}

// ===============================
// Smooth Scroll for Anchor Links
// ===============================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    // Enable smooth scrolling behavior for internal anchor links
    anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    });
});

// ===============================
// Initialize
// ===============================

// Initialize project data and contributor list on page load
fetchProjects();
fetchContributors();

// Console message
console.log(
    "%c🚀 Want to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
    "color: #6366f1; font-size: 14px; font-weight: bold;"
);


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