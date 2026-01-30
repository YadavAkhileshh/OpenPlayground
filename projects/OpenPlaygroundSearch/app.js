// Mock data for demonstration; replace with real data as needed
const projects = [
  { title: 'CalmRoute', description: 'A wellness planning dashboard for routines, mood, and breathing.', category: 'productivity' },
  { title: 'Category Analytics Widget', description: 'Shows project counts by category with a bar chart.', category: 'productivity' },
  { title: 'Habit Tracker', description: 'Track your daily habits and streaks.', category: 'utility' },
  { title: '2048 Puzzle', description: 'Classic 2048 game in the browser.', category: 'game' },
  { title: 'StudyFlow', description: 'A study planner and focus timer for students.', category: 'education' },
  { title: 'Smart Search Highlighting', description: 'Improved search with highlight and debounce.', category: 'productivity' },
];

const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');
const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');

let searchTimeout;
let lastQuery = '';

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function renderResults() {
  const query = searchInput.value.trim();
  const cat = categoryFilter.value;
  const sort = sortFilter.value;
  let filtered = projects.filter(p =>
    (!cat || p.category === cat) &&
    (p.title.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))
  );
  if (sort === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'za') filtered.sort((a, b) => b.title.localeCompare(a.title));
  resultsDiv.innerHTML = filtered.length ? filtered.map(p => `
    <div class="card">
      <div class="card-title">${highlight(p.title, query)}</div>
      <div class="card-desc">${highlight(p.description, query)}</div>
      <div class="card-category">${p.category}</div>
    </div>
  `).join('') : '<div style="text-align:center;color:#aaa;">No results found.</div>';
}

function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(renderResults, 250);
}

searchInput.addEventListener('input', debouncedSearch);
categoryFilter.addEventListener('change', renderResults);
sortFilter.addEventListener('change', renderResults);

// Initial render
renderResults();

// Dark mode support (auto)
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
