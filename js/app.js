// ===============================
// OpenPlayground - Main JavaScript
// ===============================

import { ProjectVisibilityEngine } from "./core/projectVisibilityEngine.js";

/* =====================================================
   GLOBAL ELEMENTS & STATE
===================================================== */
const html = document.documentElement;
const toggleBtn = document.getElementById("toggle-mode-btn");
const themeIcon = document.getElementById("theme-icon");

const searchInput = document.getElementById("project-search");
const sortSelect = document.getElementById("project-sort");
const filterBtns = document.querySelectorAll(".filter-btn");
const clearBtn = document.getElementById("clear-filters");
const surpriseBtn = document.getElementById("surprise-btn");

const projectsContainer = document.querySelector(".projects-container");
const paginationContainer = document.getElementById("pagination-controls");
const emptyState = document.getElementById("empty-state");

const scrollBtn = document.getElementById("scrollToTopBtn");
const navbar = document.getElementById("navbar");

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
}

/* =====================================================
   PAGINATION
===================================================== */
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

/* =====================================================
   FILTER / SEARCH / SORT EVENTS
===================================================== */
searchInput?.addEventListener("input", () => {
  visibilityEngine?.setSearchQuery(searchInput.value);
  currentPage = 1;
  renderProjects();
});

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
});

console.log(
  "%c🚀 Want to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
  "color:#6366f1;font-size:14px;font-weight:bold"
);
