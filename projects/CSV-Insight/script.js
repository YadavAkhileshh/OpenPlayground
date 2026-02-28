// --- DOM Elements ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileNameDisplay = document.getElementById('fileName');
const fileSizeDisplay = document.getElementById('fileSize');
const btnReset = document.getElementById('btnReset');

const welcomeState = document.getElementById('welcomeState');
const dashboardState = document.getElementById('dashboardState');

const statRows = document.getElementById('statRows');
const statCols = document.getElementById('statCols');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');

// Chart instances
let barChartInst = null;
let pieChartInst = null;

// --- Drag and Drop Logic ---
dropZone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
});

dropZone.addEventListener('drop', (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
});

fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

btnReset.addEventListener('click', () => {
    fileInput.value = '';
    fileInfo.classList.add('hidden');
    dropZone.classList.remove('hidden');
    welcomeState.classList.add('active');
    welcomeState.classList.remove('hidden');
    dashboardState.classList.add('hidden');
    dashboardState.classList.remove('active');
});

// --- File Handling & Parsing ---
function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert("Please upload a valid .csv file.");
        return;
    }

    // Update UI
    fileNameDisplay.innerText = file.name;
    fileSizeDisplay.innerText = (file.size / 1024).toFixed(1) + ' KB';
    dropZone.classList.add('hidden');
    fileInfo.classList.remove('hidden');

    // Read File
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        processData(text);
    };
    reader.readAsText(file);
}

// Robust CSV Parser (handles commas inside quotes)
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        // Regex splits on commas NOT inside quotes
        const currentLine = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j] ? currentLine[j].trim().replace(/^"|"$/g, '') : '';
        }
        data.push(obj);
    }
    return { headers, data };
}

// --- Data Processing & Dashboard Generation ---
function processData(csvText) {
    const parsed = parseCSV(csvText);
    const { headers, data } = parsed;

    if (data.length === 0) {
        alert("CSV is empty or poorly formatted.");
        return;
    }

    // Switch Views
    welcomeState.classList.remove('active');
    welcomeState.classList.add('hidden');
    dashboardState.classList.remove('hidden');
    dashboardState.classList.add('active');

    // Update Stats
    statRows.innerText = data.length.toLocaleString();
    statCols.innerText = headers.length;

    generateTable(headers, data);
    generateCharts(headers, data);
}

function generateTable(headers, data) {
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // Headers
    const trHead = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.innerText = h;
        trHead.appendChild(th);
    });
    tableHead.appendChild(trHead);

    // Body (limit to 15 rows for preview)
    const limit = Math.min(data.length, 15);
    for (let i = 0; i < limit; i++) {
        const tr = document.createElement('tr');
        headers.forEach(h => {
            const td = document.createElement('td');
            td.innerText = data[i][h];
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    }
}

// --- Chart.js Integration ---
function generateCharts(headers, data) {
    // 1. Auto-detect a categorical column (for labels) and a numeric column (for values)
    let labelCol = headers[0];
    let valueCol = headers.find(h => !isNaN(parseFloat(data[0][h]))) || headers[1] || headers[0];

    // 2. Aggregate Data (Count frequencies if non-numeric, or sum if numeric)
    const aggregated = {};
    data.forEach(row => {
        let label = row[labelCol] || "Unknown";
        let val = parseFloat(row[valueCol]);
        
        // Limit label length
        if(label.length > 20) label = label.substring(0, 20) + '...';

        if (isNaN(val)) {
            // If the value column isn't actually numbers, just count occurrences
            aggregated[label] = (aggregated[label] || 0) + 1;
        } else {
            aggregated[label] = (aggregated[label] || 0) + val;
        }
    });

    // 3. Sort and limit to top 10 for clean charting
    const sortedEntries = Object.entries(aggregated)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = sortedEntries.map(e => e[0]);
    const values = sortedEntries.map(e => e[1]);

    // 4. Colors
    const colors = [
        'rgba(99, 102, 241, 0.8)', // Indigo
        'rgba(236, 72, 153, 0.8)', // Pink
        'rgba(16, 185, 129, 0.8)', // Emerald
        'rgba(245, 158, 11, 0.8)', // Amber
        'rgba(14, 165, 233, 0.8)', // Sky
        'rgba(139, 92, 246, 0.8)', // Violet
        'rgba(239, 68, 68, 0.8)',  // Red
        'rgba(20, 184, 166, 0.8)', // Teal
        'rgba(249, 115, 22, 0.8)', // Orange
        'rgba(100, 116, 139, 0.8)' // Slate
    ];

    // Destroy existing charts to prevent canvas overlap bugs
    if (barChartInst) barChartInst.destroy();
    if (pieChartInst) pieChartInst.destroy();

    // Chart.js Global Config for Dark Mode
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = '#334155';

    // Build Bar Chart
    const ctxBar = document.getElementById('barChart').getContext('2d');
    barChartInst = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Aggregated ${valueCol}`,
                data: values,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Build Doughnut Chart
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    pieChartInst = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, font: {size: 10} } }
            },
            cutout: '65%'
        }
    });
}