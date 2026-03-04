// --- Mock Dataset ---
const players = [
    { name: "V. Kohli", team: "IND", role: "Batsman", avg: 51.7, sr: 138.1, runs: 4008 },
    { name: "R. Sharma", team: "IND", role: "Batsman", avg: 31.3, sr: 139.2, runs: 3853 },
    { name: "S. Yadav", team: "IND", role: "Batsman", avg: 46.0, sr: 171.5, runs: 2141 },
    { name: "G. Maxwell", team: "AUS", role: "Batsman", avg: 29.5, sr: 153.0, runs: 2468 },
    { name: "D. Warner", team: "AUS", role: "Batsman", avg: 32.8, sr: 141.3, runs: 3099 },
    { name: "J. Buttler", team: "ENG", role: "Batsman", avg: 34.8, sr: 144.6, runs: 2927 },
    { name: "H. Klaasen", team: "SA", role: "Batsman", avg: 22.8, sr: 147.6, runs: 722 },
    { name: "N. Pooran", team: "WI", role: "Batsman", avg: 25.4, sr: 134.8, runs: 1848 },
    
    { name: "J. Bumrah", team: "IND", role: "Bowler", wkts: 74, econ: 6.55, avg: 19.6 },
    { name: "A. Singh", team: "IND", role: "Bowler", wkts: 59, econ: 8.44, avg: 19.1 },
    { name: "A. Zampa", team: "AUS", role: "Bowler", wkts: 82, econ: 6.93, avg: 21.4 },
    { name: "M. Starc", team: "AUS", role: "Bowler", wkts: 74, econ: 7.66, avg: 22.9 },
    { name: "A. Rashid", team: "ENG", role: "Bowler", wkts: 103, econ: 7.37, avg: 25.8 },
    { name: "K. Rabada", team: "SA", role: "Bowler", wkts: 58, econ: 8.61, avg: 29.8 },
    { name: "A. Nortje", team: "SA", role: "Bowler", wkts: 38, econ: 7.14, avg: 19.4 }
];

// --- DOM Elements ---
const canvas = document.getElementById('statCanvas');
const ctx = canvas.getContext('2d');
const roleFilter = document.getElementById('roleFilter');
const teamFilter = document.getElementById('teamFilter');
const tooltip = document.getElementById('tooltip');
const canvasWrapper = document.querySelector('.canvas-wrapper');

const xAxisLabel = document.getElementById('xAxisLabel');
const yAxisLabel = document.getElementById('yAxisLabel');
const tableHeaders = document.getElementById('tableHeaders');
const tableBody = document.getElementById('tableBody');

// --- State ---
let filteredData = [];
let drawnPoints = []; // Stores plotted coordinates for hover detection

// --- Initialization ---
function init() {
    roleFilter.addEventListener('change', updateDashboard);
    teamFilter.addEventListener('change', updateDashboard);
    
    canvas.addEventListener('mousemove', handleHover);
    canvas.addEventListener('mouseout', () => tooltip.classList.add('hidden'));

    updateDashboard();
}

// --- Core Logic ---
function updateDashboard() {
    const role = roleFilter.value;
    const team = teamFilter.value;

    // Filter array
    filteredData = players.filter(p => p.role === role && (team === "All" || p.team === team));

    // Update UI Labels
    if (role === "Batsman") {
        xAxisLabel.innerText = "Batting Average";
        yAxisLabel.innerText = "Strike Rate";
    } else {
        xAxisLabel.innerText = "Wickets Taken";
        yAxisLabel.innerText = "Economy Rate";
    }

    drawChart(role);
    populateTable(role);
}

// --- Canvas Charting ---
function drawChart(role) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnPoints = [];

    if (filteredData.length === 0) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "16px Inter";
        ctx.fillText("No data available for this filter.", canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    // Determine Metrics Based on Role
    let getX = p => role === "Batsman" ? p.avg : p.wkts;
    let getY = p => role === "Batsman" ? p.sr : p.econ;

    // Find Min/Max for Scaling
    const pad = 0.1; // 10% padding
    const xVals = filteredData.map(getX);
    const yVals = filteredData.map(getY);
    
    const minX = Math.min(...xVals) * (1 - pad);
    const maxX = Math.max(...xVals) * (1 + pad);
    let minY = Math.min(...yVals) * (1 - pad);
    let maxY = Math.max(...yVals) * (1 + pad);

    // Flip Y for Bowlers (Lower economy is better, so it should visually be "higher" on the chart)
    if (role === "Bowler") {
        [minY, maxY] = [maxY, minY]; 
    }

    const paddingX = 40;
    const paddingY = 40;
    const drawWidth = canvas.width - (paddingX * 2);
    const drawHeight = canvas.height - (paddingY * 2);

    // Map Value to Pixel Math
    const mapX = val => paddingX + ((val - minX) / (maxX - minX)) * drawWidth;
    const mapY = val => canvas.height - paddingY - ((val - minY) / (maxY - minY)) * drawHeight;

    // Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
        let yLine = paddingY + (drawHeight / 4) * i;
        let xLine = paddingX + (drawWidth / 4) * i;
        
        ctx.beginPath(); ctx.moveTo(paddingX, yLine); ctx.lineTo(canvas.width - paddingX, yLine); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(xLine, paddingY); ctx.lineTo(xLine, canvas.height - paddingY); ctx.stroke();
    }

    // Plot Points
    filteredData.forEach(player => {
        const cx = mapX(getX(player));
        const cy = mapY(getY(player));
        const radius = role === "Batsman" ? (player.runs / 400) : (player.wkts / 8); // Size scale

        // Save for hover detection
        drawnPoints.push({ x: cx, y: cy, r: Math.max(radius, 5), data: player });

        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(radius, 5), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function handleHover(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    let hoveredPoint = null;

    // Hit detection
    for (let pt of drawnPoints) {
        const dist = Math.sqrt(Math.pow(mx - pt.x, 2) + Math.pow(my - pt.y, 2));
        if (dist <= pt.r + 3) {
            hoveredPoint = pt;
            break;
        }
    }

    if (hoveredPoint) {
        const p = hoveredPoint.data;
        let html = `<strong>${p.name} (${p.team})</strong>`;
        if (p.role === "Batsman") {
            html += `Avg: ${p.avg}<br>SR: ${p.sr}<br>Runs: ${p.runs}`;
        } else {
            html += `Wickets: ${p.wkts}<br>Econ: ${p.econ}<br>Avg: ${p.avg}`;
        }
        
        tooltip.innerHTML = html;
        tooltip.style.left = `${(e.clientX - canvasWrapper.getBoundingClientRect().left) + 15}px`;
        tooltip.style.top = `${(e.clientY - canvasWrapper.getBoundingClientRect().top) + 15}px`;
        tooltip.classList.remove('hidden');
        
        canvas.style.cursor = 'pointer';
    } else {
        tooltip.classList.add('hidden');
        canvas.style.cursor = 'crosshair';
    }
}

// --- Data Table ---
function populateTable(role) {
    tableHeaders.innerHTML = '';
    tableBody.innerHTML = '';

    if (role === "Batsman") {
        tableHeaders.innerHTML = `<th>Player</th><th>Team</th><th>Runs</th><th>Average</th><th>Strike Rate</th>`;
        filteredData.forEach(p => {
            tableBody.innerHTML += `<tr><td>${p.name}</td><td>${p.team}</td><td>${p.runs}</td><td>${p.avg}</td><td>${p.sr}</td></tr>`;
        });
    } else {
        tableHeaders.innerHTML = `<th>Player</th><th>Team</th><th>Wickets</th><th>Average</th><th>Economy</th>`;
        filteredData.forEach(p => {
            tableBody.innerHTML += `<tr><td>${p.name}</td><td>${p.team}</td><td>${p.wkts}</td><td>${p.avg}</td><td>${p.econ}</td></tr>`;
        });
    }
}

init();