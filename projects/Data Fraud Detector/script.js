/**
 * Benford-Viz Engine
 * Calculates leading digit distribution and renders comparison chart.
 */

const canvas = document.getElementById('benford-chart');
const ctx = canvas.getContext('2d');
const dataInput = document.getElementById('data-input');
const verdictBox = document.getElementById('verdict-box');
const statusInd = document.getElementById('status-indicator');
const verdictText = document.getElementById('verdict-text');
const verdictDesc = document.getElementById('verdict-desc');
const rmseVal = document.getElementById('rmse-val');

// Benford's Law Probabilities for 1-9
// P(d) = log10(1 + 1/d)
const BENFORD_PROBS = [0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];

// --- Initialization ---
function init() {
    document.getElementById('btn-analyze').addEventListener('click', analyzeData);
    document.getElementById('btn-sample-pop').addEventListener('click', loadPopulationSample);
    document.getElementById('btn-sample-rand').addEventListener('click', loadRandomSample);
    
    window.addEventListener('resize', () => {
        // Redraw if data exists
        if (lastData) drawChart(lastData);
    });

    // Initial Empty Chart
    drawChart(Array(9).fill(0));
}

let lastData = null;

// --- Core Logic ---

function analyzeData() {
    const rawText = dataInput.value;
    // Extract all numbers using Regex (handles decimals, negatives, etc.)
    // We strictly look for the first non-zero digit of each number
    
    // Split by lines or whitespace
    const tokens = rawText.split(/[\s,]+/);
    const counts = Array(9).fill(0);
    let totalValid = 0;

    tokens.forEach(token => {
        // Clean: remove non-numeric chars except . and -
        const clean = token.replace(/[^0-9.-]/g, '');
        const num = parseFloat(clean);
        
        if (!isNaN(num) && num !== 0) {
            // Find leading digit
            // String method: "0.0052" -> "5", "-12" -> "1"
            const str = Math.abs(num).toString();
            // Match first digit 1-9
            const match = str.match(/[1-9]/);
            if (match) {
                const digit = parseInt(match[0]);
                counts[digit - 1]++;
                totalValid++;
            }
        }
    });

    if (totalValid < 10) {
        alert("Please enter at least 10 valid numbers for analysis.");
        return;
    }

    // Calculate Frequencies
    const actualFreqs = counts.map(c => c / totalValid);
    lastData = actualFreqs;

    // Verdict Logic
    calculateVerdict(actualFreqs);
    
    // Render
    drawChart(actualFreqs);
}

function calculateVerdict(actual) {
    // Root Mean Square Error (RMSE)
    let sumSqErr = 0;
    for (let i = 0; i < 9; i++) {
        const diff = actual[i] - BENFORD_PROBS[i];
        sumSqErr += diff * diff;
    }
    const rmse = Math.sqrt(sumSqErr / 9);

    // Thresholds (Arbitrary for this demo, usually <0.05 is good)
    verdictBox.classList.remove('hidden');
    rmseVal.innerText = rmse.toFixed(4);

    if (rmse < 0.05) {
        statusInd.className = 'status-indicator safe';
        statusInd.innerHTML = '<i class="fas fa-check-circle"></i> <span>Likely Natural</span>';
        verdictDesc.innerText = "The dataset follows Benford's Law closely. It is likely organic or naturally occurring data.";
    } else {
        statusInd.className = 'status-indicator sus';
        statusInd.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Suspicious</span>';
        verdictDesc.innerText = "The dataset deviates significantly from the expected curve. This often indicates manipulated, random, or constrained data.";
    }
}

// --- Chart Rendering ---

function drawChart(actualData) {
    // Canvas Setup
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    // Handle HDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Config
    const padding = { top: 40, bottom: 40, left: 50, right: 20 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const barWidth = (chartW / 9) * 0.6;
    const gap = (chartW / 9) - barWidth;
    
    // Max Scale (usually 0.35 is enough for Benford)
    const maxVal = 0.4; 

    // Helper: Y pos
    const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;

    // Draw Grid / Axis
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    
    // X Axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    // Bars Loop
    for (let i = 0; i < 9; i++) {
        const x = padding.left + (gap/2) + i * (barWidth + gap);
        const digit = i + 1;

        // 1. Draw Expected Bar (Ghost/Outline) [Image of Benford's law distribution graph]
        const expH = (BENFORD_PROBS[i] / maxVal) * chartH;
        const expY = padding.top + chartH - expH;

        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'; // Faint Blue
        ctx.fillRect(x - 2, expY, barWidth + 4, expH);
        
        ctx.strokeStyle = '#38bdf8'; // Blue Outline
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, expY, barWidth + 4, expH);

        // 2. Draw Actual Bar (Foreground)
        const actVal = actualData[i] || 0; // Handle initial empty
        const actH = (actVal / maxVal) * chartH;
        const actY = padding.top + chartH - actH;

        ctx.fillStyle = '#f472b6'; // Pink
        // Draw slightly narrower
        ctx.fillRect(x + 4, actY, barWidth - 8, actH);

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 14px Roboto Mono';
        ctx.textAlign = 'center';
        ctx.fillText(digit, x + barWidth / 2, padding.top + chartH + 20);
        
        // Percentages (if actual exists)
        if (actVal > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px Inter';
            ctx.fillText((actVal*100).toFixed(0) + '%', x + barWidth / 2, actY - 5);
        }
    }
}

// --- Sample Data Helpers ---

function loadPopulationSample() {
    // Real-ish population data simulation (follows Benford)
    let str = "";
    for(let i=0; i<200; i++) {
        // Log-uniform distribution generates Benford sets
        const r = Math.pow(10, Math.random() * 4 + 2); // 100 to 1,000,000
        str += r.toFixed(2) + "\n";
    }
    dataInput.value = str;
    analyzeData();
}

function loadRandomSample() {
    // Uniform random distribution (Breaks Benford)
    let str = "";
    for(let i=0; i<200; i++) {
        const r = Math.random() * 1000; 
        str += r.toFixed(2) + "\n";
    }
    dataInput.value = str;
    analyzeData();
}

// Start
init();