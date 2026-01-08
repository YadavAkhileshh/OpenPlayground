// ===============================
// OpenPlayground - Main JavaScript
// ===============================

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";

// ===============================
// Global State
// ===============================
const itemsPerPage = 9;
let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";
let allProjectsData = [];
let visibilityEngine = null;

// ===============================
// Theme Toggle
// ===============================
function initTheme() {
    const toggleBtn = document.getElementById("toggle-mode-btn");
    const themeIcon = document.getElementById("theme-icon");
    const html = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem("theme") || "light";
    html.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme, themeIcon);

    if (toggleBtn) {
        // Remove old listeners to prevent duplicates
        const newBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
        
        newBtn.addEventListener("click", () => {
            const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
            html.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateThemeIcon(newTheme, document.getElementById("theme-icon"));

            // Add shake animation
            newBtn.classList.add("shake");
            setTimeout(() => newBtn.classList.remove("shake"), 500);
        });
    }
}

function updateThemeIcon(theme, iconElement) {
    if (!iconElement) return;
    if (theme === "dark") {
        iconElement.className = "ri-moon-fill";
    } else {
        iconElement.className = "ri-sun-line";
    }
}

// ===============================
// Projects Logic
// ===============================

// Fetch and Initialize Projects
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

        // Initialize Visibility Engine
        const projectMetadata = data.map(project => ({
            id: project.title,
            title: project.title,
            category: project.category,
            description: project.description || ""
        }));

        visibilityEngine = new ProjectVisibilityEngine(projectMetadata);

        setupProjectEventListeners();
        updateCategoryCounts();
        renderProjects();
    } catch (error) {
        console.error("Error loading projects:", error);
        const projectsContainer = document.querySelector(".projects-container");
        if (projectsContainer) {
            projectsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load projects</h3>
                    <p>Please check your internet connection or try refreshing.</p>
                </div>
            `;
        }
    }
}

function setupProjectEventListeners() {
    const searchInput = document.getElementById("project-search");
    const sortSelect = document.getElementById("project-sort");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const clearBtn = document.getElementById("search-clear");

    // 1. Search
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            if (visibilityEngine) {
                visibilityEngine.setSearchQuery(searchInput.value);
            }
            currentPage = 1;
            renderProjects();
        });
    }

    // 2. Clear Search
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = "";
                if (visibilityEngine) visibilityEngine.setSearchQuery("");
            }
            renderProjects();
        });
    }

    // 3. Sort
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentSort = sortSelect.value;
            currentPage = 1;
            renderProjects();
        });
    }

    // 4. Category Filters
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

// Update Filter Button Counts
function updateCategoryCounts() {
    if (allProjectsData.length === 0) return;

    const filterBtns = document.querySelectorAll(".filter-btn");
    const counts = {};
    
    allProjectsData.forEach(project => {
        const cat = project.category.toLowerCase();
        counts[cat] = (counts[cat] || 0) + 1;
    });

    filterBtns.forEach(btn => {
        const cat = btn.dataset.filter;
        if (cat === "all") {
            btn.innerText = `All (${allProjectsData.length})`;
        } else {
            const label = cat.charAt(0).toUpperCase() + cat.slice(1);
            btn.innerText = `${label} (${counts[cat] || 0})`;
        }
    });
}

// Render Projects to DOM
function renderProjects() {
    const projectsContainer = document.querySelector(".projects-container");
    if (!projectsContainer) return;

    let filteredProjects = [...allProjectsData];

    // 1. Search Filtering
    if (visibilityEngine) {
        const visibleProjects = visibilityEngine.getFilteredProjects();
        const visibleTitles = new Set(visibleProjects.map(p => p.title));
        
        filteredProjects = filteredProjects.filter(project =>
            visibleTitles.has(project.title)
        );
    }

    // 2. Category Filtering
    if (currentCategory !== "all") {
        filteredProjects = filteredProjects.filter(
            (project) => project.category.toLowerCase() === currentCategory.toLowerCase()
        );
    }

    // 3. Sorting
    switch (currentSort) {
        case "az":
            filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "za":
            filteredProjects.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "newest":
            // Assuming data is static, we just reverse for now
            filteredProjects.reverse();
            break;
    }

    // 4. Pagination
    const totalItems = filteredProjects.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredProjects.slice(start, start + itemsPerPage);

    projectsContainer.innerHTML = "";

    // Empty State
    const emptyState = document.getElementById("empty-state");
    const showMoreBtn = document.getElementById("viewMoreProjects"); // Fix ID reference

    if (paginatedItems.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        if (showMoreBtn) showMoreBtn.style.display = "none";
        renderPagination(0);
        return;
    } else {
        if (emptyState) emptyState.style.display = "none";
    }

    // Render Cards
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
                <div class="card-tech">${techStackHtml}</div>
            </div>
        `;

        // GitHub Button
        if (project.github) {
            const githubBtn = document.createElement("a");
            githubBtn.href = project.github;
            githubBtn.target = "_blank";
            githubBtn.rel = "noopener noreferrer";
            githubBtn.className = "github-link";
            githubBtn.innerHTML = `<i class="ri-github-fill"></i>`;
            githubBtn.addEventListener("click", e => e.stopPropagation());
            card.style.position = "relative";
            card.appendChild(githubBtn);
        }

        // Bookmark Event
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleBookmarkClick(bookmarkBtn, project);
            });
        }

        // Animation
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

// --- Helper Functions ---

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
    toast.innerHTML = `<i class="ri-bookmark-fill"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// --- Pagination ---

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById("pagination-controls");
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

    // Prev Button
    paginationContainer.appendChild(
        createBtn('<i class="ri-arrow-left-s-line"></i>', currentPage === 1, () => {
            currentPage--;
            renderProjects();
            scrollToProjects();
        })
    );

    // Logic for page numbers...
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        paginationContainer.appendChild(createBtn("1", false, () => {
            currentPage = 1;
            renderProjects();
            scrollToProjects();
        }));
        if (startPage > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-btn";
            ellipsis.textContent = "...";
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createBtn(i, false, () => {
            currentPage = i;
            renderProjects();
            scrollToProjects();
        }, i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-btn";
            ellipsis.textContent = "...";
            paginationContainer.appendChild(ellipsis);
        }
        paginationContainer.appendChild(createBtn(totalPages, false, () => {
            currentPage = totalPages;
            renderProjects();
            scrollToProjects();
        }));
    }

    // Next Button
    paginationContainer.appendChild(
        createBtn('<i class="ri-arrow-right-s-line"></i>', currentPage === totalPages, () => {
            currentPage++;
            renderProjects();
            scrollToProjects();
        })
    );
}

function scrollToProjects() {
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// ===============================
// Contributors Logic
// ===============================
async function fetchContributors() {
    try {
        const response = await fetch(
            "https://api.github.com/repos/YadavAkhileshh/OpenPlayground/contributors"
        );
        
        if (!response.ok) throw new Error("Failed to fetch contributors");
        
        const contributors = await response.json();

        // Update count
        const contributorCount = document.getElementById("contributor-count");
        if (contributorCount) {
            contributorCount.textContent = `${contributors.length}+`;
        }

        // Render Grid (if exists)
        const contributorsGrid = document.getElementById("contributors-grid");
        if (contributorsGrid) {
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
        }
    } catch (error) {
        console.error("Error fetching contributors:", error);
    }
}

// ===============================
// Animations & Nav Logic
// ===============================
function setupAnimations() {
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
}

function initNavLogic() {
    const navbar = document.getElementById('navbar');
    const scrollBtn = document.getElementById("scrollToTopBtn");
    
    window.addEventListener('scroll', () => {
        if (navbar && window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else if (navbar) {
            navbar.classList.remove('scrolled');
        }

        if (scrollBtn) {
            scrollBtn.classList.toggle("show", window.scrollY > 300);
        }
    });

    if (scrollBtn) {
        scrollBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

// ===============================
// Initialization
// ===============================

// Listen for the custom event fired by components.js
let loadedCount = 0;
const expectedComponents = 6; // header, hero, projects, contribute, footer, chatbot

document.addEventListener('componentLoaded', () => {
    loadedCount++;
    // Once everything is loaded, run our main logic
    if (loadedCount === expectedComponents) {
        initializeApp();
    }
});

// Fallback: If event system fails, try to init anyway after a delay
setTimeout(() => {
    if (loadedCount < expectedComponents) {
        console.log("Fallback init triggered");
        initializeApp();
    }
}, 3000);

function initializeApp() {
    console.log("🚀 Initializing App Logic...");
    initTheme();
    initNavLogic();
    fetchProjects();
    fetchContributors();
    setupAnimations();
}

console.log(
    "%c🚀 Want to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
    "color: #6366f1; font-size: 14px; font-weight: bold;"
);