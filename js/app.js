// ===============================
// Theme Toggle
// ===============================
const toggleBtn = document.getElementById("toggle-mode-btn");
const themeIcon = document.getElementById("theme-icon");
const html = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);

toggleBtn.addEventListener("click", () => {
    const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);

    toggleBtn.classList.add("shake");
    setTimeout(() => toggleBtn.classList.remove("shake"), 500);
});

function updateThemeIcon(theme) {
    themeIcon.className =
        theme === "dark" ? "ri-lightbulb-fill" : "ri-lightbulb-line";
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
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// ===============================
// Projects Logic (JSON + SEARCH + SORT + FILTER + PAGINATION)
// ===============================
const itemsPerPage = 9;
let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";
let allProjectsData = []; // Store raw JSON data here

const searchInput = document.getElementById("project-search");
const sortSelect = document.getElementById("project-sort");
const filterBtns = document.querySelectorAll(".filter-btn");

const projectsContainer = document.querySelector(".projects-container");
const paginationContainer = document.getElementById("pagination-controls");

// 1. Fetch Data on Load
async function fetchProjects() {
    try {
        const response = await fetch('./projects.json');
        const data = await response.json();
        allProjectsData = data;
        renderProjects(); // Initial Render
    } catch (error) {
        console.error("Error loading projects:", error);
        projectsContainer.innerHTML = "<p style='text-align:center; width:100%;'>Failed to load projects. Please try again later.</p>";
    }
}

// 2. Event Listeners
searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderProjects();
});

sortSelect.addEventListener("change", () => {
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

// 3. Core Render Function
function renderProjects() {
    let filteredProjects = [...allProjectsData];

    // Search
    const searchText = searchInput.value.toLowerCase();
    if (searchText) {
        filteredProjects = filteredProjects.filter(project =>
            project.title.toLowerCase().includes(searchText)
        );
    }

    // Filter Category
    if (currentCategory !== "all") {
        filteredProjects = filteredProjects.filter(
            project => project.category === currentCategory
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
            filteredProjects.reverse(); // Assumes JSON is ordered oldest -> newest by default
            break;
        default:
            // Default order (usually oldest to newest as in JSON)
            break;
    }

    // Pagination
    const totalItems = filteredProjects.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredProjects.slice(start, start + itemsPerPage);

    // Clear Container
    projectsContainer.innerHTML = "";

    if (paginatedItems.length === 0) {
        projectsContainer.innerHTML = "<p style='text-align:center; width:100%; opacity:0.7;'>No projects found matching your criteria.</p>";
        renderPagination(0);
        return;
    }

    // Generate HTML for each project
    paginatedItems.forEach(project => {
        const card = document.createElement("a");
        card.href = project.link;
        card.className = "card";
        card.setAttribute("data-category", project.category);
        
        // Handle cover style (class vs inline)
        let coverAttr = "";
        if (project.coverClass) {
            coverAttr = `class="card-cover ${project.coverClass}"`;
        } else if (project.coverStyle) {
            coverAttr = `class="card-cover" style="${project.coverStyle}"`;
        } else {
             // Fallback default style
            coverAttr = `class="card-cover" style="background:#e0e7ff; color:#4338ca;"`;
        }

        // Generate Tech Stack HTML
        const techStackHtml = project.tech.map(t => `<span>${t}</span>`).join('');

        card.innerHTML = `
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

        // Animation setup
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        projectsContainer.appendChild(card);

        // Trigger animation
        requestAnimationFrame(() => {
            card.style.transition = "0.4s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        });
    });

    renderPagination(totalPages);
}

// Helper to capitalize category tag
function capitalize(str) {
    if(!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===============================
// Pagination Controls
// ===============================
function renderPagination(totalPages) {
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    const createBtn = (label, disabled, onClick) => {
        const btn = document.createElement("button");
        btn.className = "pagination-btn";
        btn.innerHTML = label;
        btn.disabled = disabled;
        btn.onclick = onClick;
        return btn;
    };

    // Prev Button
    paginationContainer.appendChild(
        createBtn("‹", currentPage === 1, () => {
            currentPage--;
            renderProjects();
            scrollToProjects();
        })
    );

    // Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        const btn = createBtn(i, false, () => {
            currentPage = i;
            renderProjects();
            scrollToProjects();
        });
        if (i === currentPage) btn.classList.add("active");
        paginationContainer.appendChild(btn);
    }

    // Next Button
    paginationContainer.appendChild(
        createBtn("›", currentPage === totalPages, () => {
            currentPage++;
            renderProjects();
            scrollToProjects();
        })
    );
}

function scrollToProjects() {
    document.getElementById("projects")
        .scrollIntoView({ behavior: "smooth" });
}

// ===============================
// Init
// ===============================
fetchProjects();

console.log(
    "%cWant to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
    "color:#8b5cf6;font-size:14px"
);