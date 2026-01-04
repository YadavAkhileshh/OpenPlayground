// ===============================
// OpenPlayground - Main JavaScript
// ===============================

// ===============================
// Theme Toggle
// ===============================
const toggleBtn = document.getElementById("toggle-mode-btn");
const themeIcon = document.getElementById("theme-icon");
const html = document.documentElement;

// Load saved theme or default to light
const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);

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
const scrollBtn = document.getElementById("scrollToTopBtn");

window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("show", window.scrollY > 300);
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===============================
// Mobile Navbar
// ===============================
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
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

  // Close menu when clicking a link
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
const itemsPerPage = 9;
let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";
let allProjectsData = [];

const searchInput = document.getElementById("project-search");
const sortSelect = document.getElementById("project-sort");
const filterBtns = document.querySelectorAll(".filter-btn");

const clearBtn = document.getElementById("clear-filters");

if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        sortSelect.value = "default";
        currentCategory = "all";
        currentPage = 1;

        filterBtns.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-filter="all"]').classList.add("active");

        renderProjects();
    });
}


const projectsContainer = document.querySelector(".projects-container");
const paginationContainer = document.getElementById("pagination-controls");

const allCards = Array.from(document.querySelectorAll(".card"));
// ===============================
// Add GitHub link button to cards
// ===============================
allCards.forEach(card => {
    const githubUrl = card.dataset.github;
    if (!githubUrl) return;

    const githubBtn = document.createElement("a");
    githubBtn.href = githubUrl;
    githubBtn.target = "_blank";
    githubBtn.rel = "noopener noreferrer";
    githubBtn.className = "github-link";
    githubBtn.innerHTML = `<i class="ri-github-fill"></i>`;

    // Prevent card click when clicking GitHub button
    githubBtn.addEventListener("click", e => e.stopPropagation());

    card.style.position = "relative";
    card.appendChild(githubBtn);
});

// Fetch Projects from JSON
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

    renderProjects();
  } catch (error) {
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

// Event Listeners
if (searchInput) {
  searchInput.addEventListener("input", () => {
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

// Core Render Function
function renderProjects() {
  if (!projectsContainer) return;

  let filteredProjects = [...allProjectsData];

  // Search filter
  const searchText = searchInput?.value.toLowerCase() || "";
  if (searchText) {
    filteredProjects = filteredProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchText) ||
        project.description.toLowerCase().includes(searchText)
    );
  }

  // Category filter
  if (currentCategory !== "all") {
    filteredProjects = filteredProjects.filter(
      (project) => project.category === currentCategory
    );
  }

  // Sort
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

  // Pagination
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredProjects.slice(start, start + itemsPerPage);

  // Clear container
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

  renderPagination(totalPages);
}

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

  // Previous button
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

  // Next button
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
renderProjects();

console.log(
    "%cWant to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
    "color:#8b5cf6;font-size:14px"
);


// ===============================
// Hall of Contributors Logic
// ===============================
const contributorsGrid = document.getElementById("contributors-grid");

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
        observer.unobserve(entry.target); // Run once
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
  });
});

