// Fetch project-manifest.json and render category analytics
fetch('../../project-manifest.json')
  .then(res => res.json())
  .then(data => {
    const counts = {};
    data.projects.forEach(p => {
      const cat = p.category || 'Uncategorized';
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
