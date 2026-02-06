// Fetch project-manifest.json, then fetch each project's project.json to get categories
fetch('../../project-manifest.json')
  .then(res => res.json())
  .then(async data => {
    const counts = {};
    // Get all project.json fetch promises
    const promises = data.projects.map(async p => {
      try {
        const res = await fetch(p.path);
        if (!res.ok) return 'Uncategorized';
        const proj = await res.json();
        return proj.category || 'Uncategorized';
      } catch {
        return 'Uncategorized';
      }
    });
    const categories = await Promise.all(promises);
    categories.forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
    renderChart(counts);
  });

function renderChart(counts) {
  const chart = document.getElementById('bar-chart');
  const labels = document.getElementById('category-labels');
  chart.innerHTML = '';
  labels.innerHTML = '';
  const max = Math.max(...Object.values(counts));
  Object.entries(counts).forEach(([cat, count]) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = (count / max * 100) + '%';
    bar.innerHTML = `<span>${count}</span>`;
    chart.appendChild(bar);
    const label = document.createElement('div');
    label.className = 'category-label';
    label.textContent = cat;
    labels.appendChild(label);
  });
}
// Dark mode support (auto)
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
