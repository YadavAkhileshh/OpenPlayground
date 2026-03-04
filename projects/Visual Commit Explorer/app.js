// Visual Commit Explorer
// Vanilla JS, HTML, CSS

const loadRepoBtn = document.getElementById('loadRepoBtn');
const repoLoader = document.getElementById('repoLoader');
const searchInput = document.getElementById('searchInput');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const commitGraph = document.getElementById('commitGraph');
const commitDetails = document.getElementById('commitDetails');
const diffDetails = document.getElementById('diffDetails');
const authorStats = document.getElementById('authorStats');
const activityHeatmap = document.getElementById('activityHeatmap');

document.body.classList.toggle('dark', localStorage.getItem('vce_theme') === 'dark');

toggleThemeBtn.onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('vce_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};

loadRepoBtn.onclick = () => repoLoader.click();

repoLoader.onchange = async (e) => {
    // Placeholder: In browser, cannot parse .git directly. In real app, use backend or WASM git parser.
    alert('Loading local git repo is not supported in browser-only mode. Use a backend or WASM git parser for real data.');
};

// Demo data for UI preview
const demoCommits = [
    { hash: 'a1b2c3', author: 'Alice', date: '2026-01-29', message: 'Initial commit', parents: [], branch: 'main' },
    { hash: 'b2c3d4', author: 'Bob', date: '2026-01-29', message: 'Add README', parents: ['a1b2c3'], branch: 'main' },
    { hash: 'c3d4e5', author: 'Alice', date: '2026-01-30', message: 'Implement feature X', parents: ['b2c3d4'], branch: 'main' },
    { hash: 'd4e5f6', author: 'Carol', date: '2026-01-30', message: 'Merge branch feature', parents: ['c3d4e5', 'b2c3d4'], branch: 'main' },
];

function drawGraph(commits) {
    const ctx = commitGraph.getContext('2d');
    ctx.clearRect(0, 0, commitGraph.width, commitGraph.height);
    // Simple vertical graph for demo
    const spacing = 80;
    commits.forEach((commit, i) => {
        const y = 50 + i * spacing;
        ctx.beginPath();
        ctx.arc(100, y, 18, 0, 2 * Math.PI);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(commit.hash.slice(0, 6), 100, y + 5);
        if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(100, y - spacing + 18);
            ctx.lineTo(100, y - 18);
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    });
}

function showCommitDetails(commit) {
    commitDetails.innerHTML = `<h3>Commit Details</h3>
        <b>Hash:</b> ${commit.hash}<br>
        <b>Author:</b> ${commit.author}<br>
        <b>Date:</b> ${commit.date}<br>
        <b>Message:</b> ${commit.message}`;
    diffDetails.innerHTML = `<h3>Diff</h3><pre>// Diff not available in demo</pre>`;
}

function showAuthorStats(commits) {
    const stats = {};
    commits.forEach(c => { stats[c.author] = (stats[c.author] || 0) + 1; });
    authorStats.innerHTML = `<h3>Author Stats</h3>` +
        Object.entries(stats).map(([a, n]) => `<div>${a}: ${n} commit(s)</div>`).join('');
}

function showActivityHeatmap(commits) {
    const days = {};
    commits.forEach(c => { days[c.date] = (days[c.date] || 0) + 1; });
    activityHeatmap.innerHTML = `<h3>Activity Heatmap</h3>` +
        Object.entries(days).map(([d, n]) => `<div>${d}: ${n} commit(s)</div>`).join('');
}

commitGraph.width = 800;
commitGraph.height = 350;
drawGraph(demoCommits);
showCommitDetails(demoCommits[0]);
showAuthorStats(demoCommits);
showActivityHeatmap(demoCommits);

commitGraph.onclick = e => {
    // Simple hit test for demo
    const rect = commitGraph.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const idx = Math.floor((y - 50 + 40) / 80);
    if (demoCommits[idx]) showCommitDetails(demoCommits[idx]);
};

searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase();
    const filtered = demoCommits.filter(c =>
        c.author.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        c.date.includes(q)
    );
    drawGraph(filtered);
    if (filtered.length) showCommitDetails(filtered[0]);
    showAuthorStats(filtered);
    showActivityHeatmap(filtered);
};
