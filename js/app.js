// ===============================
// OpenPlayground - Main JavaScript
// ===============================

// This file controls core UI behavior such as theme switching,
// project rendering, filtering, sorting, pagination, and contributor display.

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";

// ===============================
// Global UI Variables (Initialized dynamically)
// ===============================
let toggleBtn;
let themeIcon;
let scrollBtn;
let navToggle;
let navLinks;
let searchInput;
let sortSelect;
let filterBtns;
let surpriseBtn;
let clearBtn;
let projectsContainer;
let paginationContainer;
let contributorsGrid;

// ===============================
// Projects Logic Variables
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
let visibilityEngine = null;

// ===============================
// Initialization Logic
// ===============================

// Wait for all components to be loaded before initializing
let componentsLoaded = 0;
const totalComponents = 6; // header, hero, projects, contribute, footer, chatbot

document.addEventListener('componentLoaded', (e) => {
    componentsLoaded++;
    // Once all components are loaded, initialize the app
    if (componentsLoaded === totalComponents) {
        initializeApp();
    }
});

// Also add a fallback timeout in case event doesn't fire
setTimeout(() => {
    if (componentsLoaded < totalComponents) {
        initializeApp();
    }
}, 3000);

function initializeApp() {
    initializeUI();
    setupEventListeners();
    fetchProjects();
    fetchContributors();

    // Initialize Theme Logic after UI is ready
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "light";
    html.setAttribute("data-theme", savedTheme);
    if (themeIcon) updateThemeIcon(savedTheme);

    console.log('🚀 OpenPlayground app initialized with UI!');
}

function initializeUI() {
    // Select elements after they have been injected by components.js
    toggleBtn = document.getElementById("toggle-mode-btn");
    themeIcon = document.getElementById("theme-icon");
    scrollBtn = document.getElementById("scrollToTopBtn");
    navToggle = document.getElementById("navToggle");
    navLinks = document.getElementById("navLinks");

    // Projects Elements
    searchInput = document.getElementById("project-search");
    sortSelect = document.getElementById("project-sort");
    filterBtns = document.querySelectorAll(".filter-btn");
    surpriseBtn = document.getElementById("surprise-btn");
    clearBtn = document.getElementById("clear-filters");
    projectsContainer = document.querySelector(".projects-container");
    paginationContainer = document.getElementById("pagination-controls");

    // Contributors Elements
    contributorsGrid = document.getElementById("contributors-grid");
}

function setupEventListeners() {
    // Theme Toggle
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const html = document.documentElement;
            const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
            html.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateThemeIcon(newTheme);

            // Add shake animation
            toggleBtn.classList.add("shake");
            setTimeout(() => toggleBtn.classList.remove("shake"), 500);
        });
    }

    // Scroll to Top
    if (scrollBtn) {
        window.addEventListener("scroll", () => {
            scrollBtn.classList.toggle("show", window.scrollY > 300);
        });
        scrollBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Mobile Navbar
    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            const icon = navToggle.querySelector("i");
            if (navLinks.classList.contains("active")) {
                icon.className = "ri-close-line";
            } else {
                icon.className = "ri-menu-3-line";
            }
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                navToggle.querySelector("i").className = "ri-menu-3-line";
            });
        });
    }

    // Project Controls


    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentSort = sortSelect.value;
            currentPage = 1;
            renderProjects();
        });
    }

    if (filterBtns) {
        filterBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                filterBtns.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                currentCategory = btn.dataset.filter;
                currentPage = 1;
                renderProjects();
            });
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (sortSelect) sortSelect.value = "default";
            currentCategory = "all";
            currentPage = 1;

            if (filterBtns) {
                filterBtns.forEach(b => b.classList.remove("active"));
                const allBtn = document.querySelector('[data-filter="all"]');
                if (allBtn) allBtn.classList.add("active");
            }

            if (visibilityEngine) {
                visibilityEngine.setSearchQuery("");
            }

            renderProjects();
        });
    }

    if (surpriseBtn) {
        surpriseBtn.addEventListener("click", () => {
            if (allProjectsData.length > 0) {
                const randomIndex = Math.floor(Math.random() * allProjectsData.length);
                const randomProject = allProjectsData[randomIndex];
                window.open(randomProject.link, "_self");
            }
        });
    }
}

// Updates the theme icon based on the currently active theme
function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === "dark") {
        themeIcon.className = "ri-moon-fill";
    } else {
        themeIcon.className = "ri-sun-line";
    }
}

// ===============================
// Project Logic
// ===============================

async function fetchProjects() {
    if (!projectsContainer && document.querySelector(".projects-container")) {
        projectsContainer = document.querySelector(".projects-container");
    }

    try {
        const response = await fetch("./projects.json");
        const data = await response.json();

        // Explicitly sort data alphabetically by default initially
        allProjectsData = data.sort((a, b) => {
            const titleA = (a.title || "").toLowerCase();
            const titleB = (b.title || "").toLowerCase();
            return titleA.localeCompare(titleB);
        });

        // Update project count in hero
        const projectCount = document.getElementById("project-count");
        if (projectCount) {
            projectCount.textContent = `${data.length}+`;
        }

        const projectMetadata = data.map(project => ({
            id: project.title,
            title: project.title,
            category: project.category,
            description: project.description || ""
        }));

        visibilityEngine = new ProjectVisibilityEngine(projectMetadata);

        updateCategoryCounts();
        renderProjects();
    } catch (error) {
        console.error("Error loading projects:", error);
        if (projectsContainer) {
            // Display specific error message for easier debugging
            projectsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load projects</h3>
                    <p>${error.message}</p>
                    <p class="error-detail" style="font-size: 0.8rem; opacity: 0.7;">Check console for details</p>
                </div>
            `;
        }
    }
}

function renderProjects() {
    if (!projectsContainer) projectsContainer = document.querySelector(".projects-container");
    if (!projectsContainer) return;

    let filteredProjects = [...allProjectsData];

    if (visibilityEngine) {
        // Corrected method name: getFilteredProjects returns the array of project objects
        const visibleProjects = visibilityEngine.getFilteredProjects();
        const visibleIdSet = new Set(visibleProjects.map(p => p.title));

        filteredProjects = filteredProjects.filter(project =>
            visibleIdSet.has(project.title)
        );
    }

    if (currentCategory !== "all") {
        filteredProjects = filteredProjects.filter(
            (project) => project.category === currentCategory
        );
    }

    // Robust sorting logic
    switch (currentSort) {
        case "default":
        case "az":
            filteredProjects.sort((a, b) => {
                const titleA = (a.title || "").toLowerCase();
                const titleB = (b.title || "").toLowerCase();
                return titleA.localeCompare(titleB);
            });
            break;
        case "za":
            filteredProjects.sort((a, b) => {
                const titleA = (a.title || "").toLowerCase();
                const titleB = (b.title || "").toLowerCase();
                return titleB.localeCompare(titleA);
            });
            break;
        case "newest":
            filteredProjects.reverse();
            break;
    }

    const totalItems = filteredProjects.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredProjects.slice(start, start + itemsPerPage);

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

    paginatedItems.forEach((project, index) => {
        const card = document.createElement("a");
        card.href = project.link;
        card.className = "card";
        card.setAttribute("data-category", project.category);

        let coverAttr = "";
        if (project.coverClass) {
            coverAttr = `class="card-cover ${project.coverClass}"`;
        } else if (project.coverStyle) {
            coverAttr = `class="card-cover" style="${project.coverStyle}"`;
        } else {
            coverAttr = `class="card-cover"`;
        }

        const techStackHtml = (project.tech || []).map((t) => `<span>${t}</span>`).join("");

        const isBookmarked = window.bookmarksManager && window.bookmarksManager.isBookmarked(project.title);
        const bookmarkClass = isBookmarked ? 'bookmarked' : '';
        const bookmarkIcon = isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';

        card.innerHTML = `
            <button class="bookmark-btn ${bookmarkClass}" data-project-title="${escapeHtml(project.title || '')}" aria-label="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
                <i class="${bookmarkIcon}"></i>
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

        const bookmarkBtn = card.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBookmarkClick(bookmarkBtn, project);
        });

        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        projectsContainer.appendChild(card);

        setTimeout(() => {
            card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 50);
    });

    renderPagination(totalPages);
}

// Updates the project count displayed on category filter buttons
function updateCategoryCounts() {
    if (!filterBtns) return;
    const counts = {};

    // We calculate counts based on allProjectsData source of truth
    allProjectsData.forEach(p => {
        const cat = p.category;
        counts[cat] = (counts[cat] || 0) + 1;
    });

    filterBtns.forEach(btn => {
        const cat = btn.dataset.filter;
        if (cat === "all") {
            btn.innerText = `All (${allProjectsData.length})`;
        } else {
            btn.innerText = `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${counts[cat] || 0})`;
        }
    });
}


// ===============================
// Helpers
// ===============================

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function handleBookmarkClick(btn, project) {
    if (!window.bookmarksManager) return;

    const isNowBookmarked = window.bookmarksManager.toggleBookmark(project);
    const icon = btn.querySelector('i');

    btn.classList.toggle('bookmarked', isNowBookmarked);
    icon.className = isNowBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';
    btn.setAttribute('aria-label', isNowBookmarked ? 'Remove bookmark' : 'Add bookmark');

    btn.classList.add('animate');
    setTimeout(() => btn.classList.remove('animate'), 300);
    showBookmarkToast(isNowBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
}

function showBookmarkToast(message) {
    const existingToast = document.querySelector('.bookmark-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'bookmark-toast';
    toast.innerHTML = `
        <i class="ri-bookmark-fill"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function renderPagination(totalPages) {
    if (!paginationContainer) {
        paginationContainer = document.getElementById("pagination-controls");
    }
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

    paginationContainer.appendChild(
        createBtn('<i class="ri-arrow-left-s-line"></i>', currentPage === 1, () => {
            currentPage--;
            renderProjects();
            scrollToProjects();
        })
    );

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

async function fetchContributors() {
    if (!contributorsGrid) contributorsGrid = document.getElementById("contributors-grid");
    if (!contributorsGrid) return;

    try {
        const response = await fetch(
            "https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors"
        );
        if (!response.ok) throw new Error("Failed to fetch contributors");
        const contributors = await response.json();

        const contributorCount = document.getElementById("contributor-count");
        if (contributorCount) {
            contributorCount.textContent = `${contributors.length}+`;
        }

        contributorsGrid.innerHTML = "";
        contributors.forEach((contributor, index) => {
            const card = document.createElement("div");
            card.className = "contributor-card";
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

// Smooth Scroll for Anchor Links (re-initialized)
document.addEventListener('DOMContentLoaded', () => {
    // This part might run before components are loaded, but header anchors are dynamic.
    // So better keep the logic in components.js which initializeSmoothScrolling.
    // But we keep this for static anchors if any.
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
});