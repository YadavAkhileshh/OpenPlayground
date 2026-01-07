/* ===============================
   THEME TOGGLE
================================ */
const toggleBtn = document.getElementById('toggle-mode-btn');
const themeIcon = document.getElementById('theme-icon');
const html = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

toggleBtn.addEventListener('click', () => {
    const theme = html.getAttribute('data-theme');
    const newTheme = theme === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    toggleBtn.classList.add('shake');
    setTimeout(() => toggleBtn.classList.remove('shake'), 500);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark'
        ? 'ri-lightbulb-fill'
        : 'ri-lightbulb-line';
}

/* ===============================
   SCROLL TO TOP
================================ */
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
    scrollToTopBtn.classList.toggle('show', window.pageYOffset > 300);
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===============================
   CARD ANIMATION ON SCROLL
================================ */
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

/* ===============================
   SEARCH + FILTER + PAGINATION
================================ */
const searchInput = document.getElementById('project-search');
const filterButtons = document.querySelectorAll('.filter-btn');
const paginationContainer = document.getElementById('pagination-controls');
const emptyState = document.getElementById('empty-state');

const allCards = Array.from(document.querySelectorAll('.card'));

const ITEMS_PER_PAGE = 6;
let currentPage = 1;
let activeCategory = 'all';

/* ---------- CORE FILTER ---------- */
function getFilteredCards() {
    const searchText = searchInput.value.toLowerCase();

    return allCards.filter(card => {
        const title = card.querySelector('.card-heading').textContent.toLowerCase();
        const category = card.dataset.category;

        const matchesSearch = title.includes(searchText);
        const matchesCategory = activeCategory === 'all' || category === activeCategory;

        return matchesSearch && matchesCategory;
    });
}

/* ---------- EMPTY STATE ---------- */
function updateEmptyState(visibleCount) {
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
}

/* ---------- RENDER PROJECTS ---------- */
function renderProjects() {
    const filteredCards = getFilteredCards();
    const totalItems = filteredCards.length;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedCards = filteredCards.slice(start, end);

    // Hide all cards
    allCards.forEach(card => card.style.display = 'none');

    // Show current page cards
    paginatedCards.forEach(card => {
        card.style.display = 'block';
    });

    updateEmptyState(totalItems);
    renderPagination(totalItems);
}

/* ---------- PAGINATION ---------- */
function renderPagination(totalItems) {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const createBtn = (label, disabled, onClick) => {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn';
        btn.innerHTML = label;
        btn.disabled = disabled;
        btn.onclick = onClick;
        paginationContainer.appendChild(btn);
    };

    createBtn('‹', currentPage === 1, () => {
        currentPage--;
        renderProjects();
    });

    for (let i = 1; i <= totalPages; i++) {
        createBtn(i, false, () => {
            currentPage = i;
            renderProjects();
        }).classList?.add(i === currentPage ? 'active' : '');
    }

    createBtn('›', currentPage === totalPages, () => {
        currentPage++;
        renderProjects();
    });
}

/* ---------- EVENTS ---------- */
searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderProjects();
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeCategory = btn.dataset.filter;
        currentPage = 1;
        renderProjects();
    });
});

/* ---------- INITIAL LOAD ---------- */
renderProjects();

/* ===============================
   MOBILE NAVBAR
================================ */
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

console.log(
    '%cWant to contribute? https://github.com/YadavAkhileshh/OpenPlayground',
    'font-size:14px;color:#8b5cf6;'
);
