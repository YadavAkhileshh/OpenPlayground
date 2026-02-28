const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
const toast  = document.getElementById('toast');

let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function lerpRing() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(lerpRing);
})();

document.querySelectorAll('button, select, input, a').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1.8)';
    ring.style.width = ring.style.height = '48px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.width = ring.style.height = '30px';
  });
});

const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let   W, H, dots = [];

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

for (let i = 0; i < 90; i++) {
  dots.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.2 + 0.3,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    a: Math.random() * 0.35 + 0.05,
  });
}

function drawBg() {
  ctx.clearRect(0, 0, W, H);
  dots.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = '#6ee7b7';
    ctx.globalAlpha = d.a;
    ctx.fill();
    d.x += d.vx; d.y += d.vy;
    if (d.x < 0) d.x = W;
    if (d.x > W) d.x = 0;
    if (d.y < 0) d.y = H;
    if (d.y > H) d.y = 0;
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawBg);
}
drawBg();

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

const searchBtn    = document.getElementById('searchBtn');
const issuesGrid   = document.getElementById('issuesGrid');
const skeletonGrid = document.getElementById('skeletonGrid');
const emptyState   = document.getElementById('emptyState');
const loadMoreBtn  = document.getElementById('loadMoreBtn');
const statusDot    = document.getElementById('statusDot');
const statusText   = document.getElementById('statusText');

let currentPage    = 1;
let currentParams  = {};
let savedIssues    = JSON.parse(localStorage.getItem('savedIssues') || '[]');
let sortBy         = 'created';
let assignedFilter = 'false';

document.querySelectorAll('.filter-btn[data-sort]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-sort]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sortBy = btn.dataset.sort;
    if (Object.keys(currentParams).length) { currentPage = 1; fetchIssues(true); }
  });
});

document.querySelectorAll('.filter-btn[data-assigned]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-assigned]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    assignedFilter = btn.dataset.assigned;
    if (Object.keys(currentParams).length) { currentPage = 1; fetchIssues(true); }
  });
});

searchBtn.addEventListener('click', () => {
  currentPage = 1;
  fetchIssues(true);
});

document.getElementById('topicInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') { currentPage = 1; fetchIssues(true); }
});

loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  fetchIssues(false);
});

function setStatus(state, msg) {
  statusDot.className = 'status-dot ' + state;
  statusText.textContent = msg;
}

async function fetchIssues(fresh) {
  const lang  = document.getElementById('langSelect').value;
  const label = document.getElementById('labelSelect').value;
  const topic = document.getElementById('topicInput').value.trim();

  currentParams = { lang, label, topic };

  searchBtn.disabled = true;
  setStatus('loading', 'Fetching issues from GitHub...');

  if (fresh) {
    issuesGrid.innerHTML = '';
    skeletonGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    loadMoreBtn.classList.add('hidden');
  }

  let q = `label:"${label}" language:${lang} state:open`;
  if (topic) q += ` ${topic} in:title,body`;
  if (assignedFilter === 'false') q += ' no:assignee';

  const perPage = 12;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=${sortBy}&order=desc&per_page=${perPage}&page=${currentPage}`;

  try {
    const res  = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
    const data = await res.json();

    skeletonGrid.classList.add('hidden');
    searchBtn.disabled = false;

    if (!data.items || data.items.length === 0) {
      emptyState.classList.remove('hidden');
      setStatus('error', 'No issues found. Try different filters.');
      return;
    }

    const repoDataCache = {};

    for (const issue of data.items) {
      const repoFull = issue.repository_url.replace('https://api.github.com/repos/', '');
      if (!repoDataCache[repoFull]) {
        try {
          const rRes  = await fetch(`https://api.github.com/repos/${repoFull}`);
          repoDataCache[repoFull] = await rRes.json();
        } catch {
          repoDataCache[repoFull] = { stargazers_count: '?' };
        }
      }
      const repo = repoDataCache[repoFull];
      issuesGrid.appendChild(buildCard(issue, repoFull, repo.stargazers_count));
    }

    const total = Math.min(data.total_count, 1000);
    setStatus('success', `Found ${total.toLocaleString()} issues · Showing page ${currentPage}`);

    if (data.items.length === perPage && currentPage * perPage < total) {
      loadMoreBtn.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.add('hidden');
    }

  } catch (err) {
    skeletonGrid.classList.add('hidden');
    searchBtn.disabled = false;
    setStatus('error', 'GitHub API error. You may be rate limited — try again in 60s.');
    emptyState.classList.remove('hidden');
  }
}

function buildCard(issue, repoFull, stars) {
  const card = document.createElement('div');
  card.className = 'issue-card';
  card.style.animationDelay = (Math.random() * 0.2).toFixed(2) + 's';

  const starsFormatted = typeof stars === 'number'
    ? stars >= 1000 ? (stars / 1000).toFixed(1) + 'k' : stars
    : '?';

  const labelsHtml = issue.labels.slice(0, 4).map(l => {
    const bg  = '#' + l.color;
    const rgb = hexToRgb(l.color);
    const fg  = rgb && (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 128 ? '#000' : '#fff';
    return `<span class="label-pill" style="background:${bg}22;border-color:${bg};color:${bg}">${l.name}</span>`;
  }).join('');

  const age     = timeAgo(issue.created_at);
  const isSaved = savedIssues.includes(issue.id);

  card.innerHTML = `
    <div class="card-top">
      <div class="repo-name">⌥ ${repoFull}</div>
      <div class="card-stars">★ ${starsFormatted}</div>
    </div>
    <div class="issue-title">${escHtml(issue.title)}</div>
    <div class="card-labels">${labelsHtml}</div>
    <div class="card-meta">
      <div class="meta-info">
        <span>◌ ${age}</span>
        <span class="meta-comments">💬 ${issue.comments}</span>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn-view" onclick="window.open('${issue.html_url}','_blank')">VIEW ISSUE ↗</button>
      <button class="btn-save ${isSaved ? 'saved' : ''}" data-id="${issue.id}">${isSaved ? '★ SAVED' : '☆ SAVE'}</button>
    </div>
  `;

  const saveBtn = card.querySelector('.btn-save');
  saveBtn.addEventListener('click', () => toggleSave(issue.id, saveBtn));

  return card;
}

function toggleSave(id, btn) {
  const idx = savedIssues.indexOf(id);
  if (idx === -1) {
    savedIssues.push(id);
    btn.textContent = '★ SAVED';
    btn.classList.add('saved');
    showToast('ISSUE SAVED!');
  } else {
    savedIssues.splice(idx, 1);
    btn.textContent = '☆ SAVE';
    btn.classList.remove('saved');
    showToast('REMOVED FROM SAVED');
  }
  localStorage.setItem('savedIssues', JSON.stringify(savedIssues));
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d    = Math.floor(diff / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return '1d ago';
  if (d < 30)  return `${d}d ago`;
  if (d < 365) return `${Math.floor(d/30)}mo ago`;
  return `${Math.floor(d/365)}y ago`;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return isNaN(r) ? null : { r, g, b };
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
