// Task Dependency Visualizer core logic
// Create tasks, define dependencies, visualize as directed graph, drag-and-drop, export, filter/search, highlight critical path

const taskNameInput = document.getElementById('task-name');
const addTaskBtn = document.getElementById('add-task');
const fromTaskSelect = document.getElementById('from-task');
const toTaskSelect = document.getElementById('to-task');
const addDepBtn = document.getElementById('add-dependency');
const searchTaskInput = document.getElementById('search-task');
const exportJsonBtn = document.getElementById('export-json');
const exportImgBtn = document.getElementById('export-img');
const graphArea = document.getElementById('graph-area');
const criticalPathInfo = document.getElementById('critical-path-info');

let tasks = [];
let dependencies = [];

function updateTaskSelects() {
  fromTaskSelect.innerHTML = '';
  toTaskSelect.innerHTML = '';
  tasks.forEach(t => {
    const opt1 = document.createElement('option');
    opt1.value = t.id;
    opt1.textContent = t.name;
    fromTaskSelect.appendChild(opt1);
    const opt2 = document.createElement('option');
    opt2.value = t.id;
    opt2.textContent = t.name;
    toTaskSelect.appendChild(opt2);
  });
}

addTaskBtn.addEventListener('click', () => {
  const name = taskNameInput.value.trim();
  if (!name) return;
  const id = 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2,7);
  tasks.push({id, name, status: 'pending'});
  taskNameInput.value = '';
  updateTaskSelects();
  renderGraph();
});

addDepBtn.addEventListener('click', () => {
  const from = fromTaskSelect.value;
  const to = toTaskSelect.value;
  if (from && to && from !== to && !dependencies.find(d => d.from === from && d.to === to)) {
    dependencies.push({from, to});
    renderGraph();
  }
});

searchTaskInput.addEventListener('input', () => {
  renderGraph(searchTaskInput.value.trim().toLowerCase());
});

exportJsonBtn.addEventListener('click', () => {
  const data = {tasks, dependencies};
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'task-graph.json';
  a.click();
});

exportImgBtn.addEventListener('click', () => {
  html2canvas(graphArea).then(canvas => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'task-graph.png';
    a.click();
  });
});

function renderGraph(filter = '') {
  graphArea.innerHTML = '';
  // Filter tasks
  const filteredTasks = filter ? tasks.filter(t => t.name.toLowerCase().includes(filter)) : tasks;
  // Simple layout: vertical list with arrows
  const nodeMap = {};
  filteredTasks.forEach((t, i) => {
    const node = document.createElement('div');
    node.className = 'task-node';
    node.textContent = t.name;
    node.style.position = 'absolute';
    node.style.left = '40px';
    node.style.top = (i * 70 + 40) + 'px';
    node.draggable = true;
    node.dataset.id = t.id;
    node.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', t.id);
    });
    node.addEventListener('dragover', e => e.preventDefault());
    node.addEventListener('drop', e => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      const fromIdx = tasks.findIndex(x => x.id === draggedId);
      const toIdx = tasks.findIndex(x => x.id === t.id);
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        const [moved] = tasks.splice(fromIdx, 1);
        tasks.splice(toIdx, 0, moved);
        renderGraph(filter);
      }
    });
    graphArea.appendChild(node);
    nodeMap[t.id] = node;
  });
  // Draw arrows (SVG)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', (filteredTasks.length * 70 + 80));
  svg.style.position = 'absolute';
  svg.style.left = '0';
  svg.style.top = '0';
  dependencies.forEach(dep => {
    if (!nodeMap[dep.from] || !nodeMap[dep.to]) return;
    const fromNode = nodeMap[dep.from];
    const toNode = nodeMap[dep.to];
    const x1 = 180, y1 = parseInt(fromNode.style.top) + 20;
    const x2 = 40, y2 = parseInt(toNode.style.top) + 20;
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arrow.setAttribute('x1', x1);
    arrow.setAttribute('y1', y1);
    arrow.setAttribute('x2', x2);
    arrow.setAttribute('y2', y2);
    arrow.setAttribute('stroke', '#8b5cf6');
    arrow.setAttribute('stroke-width', '3');
    arrow.setAttribute('marker-end', 'url(#arrowhead)');
    svg.appendChild(arrow);
  });
  // Arrowhead marker
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrowhead');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '7');
  marker.setAttribute('refX', '10');
  marker.setAttribute('refY', '3.5');
  marker.setAttribute('orient', 'auto');
  const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrowPath.setAttribute('d', 'M0,0 L10,3.5 L0,7 Z');
  arrowPath.setAttribute('fill', '#8b5cf6');
  marker.appendChild(arrowPath);
  svg.appendChild(marker);
  svg.innerHTML += '';
  graphArea.appendChild(svg);
  // Highlight critical path (simple longest path)
  const critPath = getCriticalPath();
  if (critPath.length > 1) {
    criticalPathInfo.textContent = 'Critical Path: ' + critPath.map(id => tasks.find(t => t.id === id)?.name).join(' → ');
  } else {
    criticalPathInfo.textContent = '';
  }
}

function getCriticalPath() {
  // Longest path in DAG (simple DFS)
  const adj = {};
  tasks.forEach(t => adj[t.id] = []);
  dependencies.forEach(d => adj[d.from].push(d.to));
  let maxPath = [];
  function dfs(node, path) {
    path.push(node);
    if (path.length > maxPath.length) maxPath = [...path];
    adj[node].forEach(next => {
      if (!path.includes(next)) dfs(next, path);
    });
    path.pop();
  }
  tasks.forEach(t => dfs(t.id, []));
  return maxPath;
}

// Initial render
renderGraph();
updateTaskSelects();

// Dark mode support (auto)
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
// Export image dependency: html2canvas CDN
(function(){
  if (!window.html2canvas) {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.body.appendChild(s);
  }
})();
