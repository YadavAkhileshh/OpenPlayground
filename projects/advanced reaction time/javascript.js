/**
 * Reflex Pulse - Logic
 */

const state = {
    view: 'settings', // settings, game, result
    testCount: 1,
    delayRange: [1000, 3000],
    inputMethod: 'mouse',

    currentTest: 0,
    times: [],

    gameStatus: 'idle', // idle, waiting, go, early
    startTime: 0,
    timer: null,

    history: JSON.parse(localStorage.getItem('art_history') || '[]'),
    pb: localStorage.getItem('art_best') ? parseInt(localStorage.getItem('art_best')) : null
};

// DOM Elements
const views = {
    settings: document.getElementById('settingsView'),
    game: document.getElementById('gameView'),
    result: document.getElementById('resultView')
};

const reactionArea = document.getElementById('reactionArea');
const gameStatusText = document.getElementById('gameStatus');
const gameHintText = document.getElementById('gameHint');
const gameIcon = document.getElementById('gameIcon');
const progressBar = document.getElementById('progressBar');
const testProgressText = document.getElementById('testProgress');

const testList = document.getElementById('testList');
const finalAvg = document.getElementById('finalAvg');
const avgRank = document.getElementById('avgRank');
const encouragement = document.getElementById('encouragement');
const pbValueText = document.getElementById('pbValue');
const rankStatusText = document.getElementById('rankStatus');

/**
 * Initialize Event Listeners
 */
function init() {
    // Setup option buttons
    const setupOptionButtons = (containerId, stateKey) => {
        const btns = document.querySelectorAll(`#${containerId} .opt-btn`);
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const val = btn.dataset.value;
                if (stateKey === 'testCount') state.testCount = parseInt(val);
                if (stateKey === 'delayRange') state.delayRange = val.split('-').map(Number);
                if (stateKey === 'inputMethod') state.inputMethod = val;
            });
        });
    };

    setupOptionButtons('testCountOptions', 'testCount');
    setupOptionButtons('delayOptions', 'delayRange');
    setupOptionButtons('inputOptions', 'inputMethod');

    document.getElementById('startBtn').addEventListener('click', startSession);
    document.getElementById('retryBtn').addEventListener('click', () => switchView('settings'));
    document.getElementById('clearData').addEventListener('click', clearData);

    // Game Interactions
    reactionArea.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && state.inputMethod === 'space' && state.view === 'game') {
            e.preventDefault();
            handleInteraction();
        }
    });

    updateStatsDisplay();
}

/**
 * Switch between different app views
 */
function switchView(viewName) {
    state.view = viewName;
    Object.keys(views).forEach(v => {
        views[v].classList.toggle('hidden', v !== viewName);
    });

    if (viewName === 'settings') setTimeout(updateStatsDisplay, 50);
}

/**
 * Start a new testing session
 */
function startSession() {
    state.currentTest = 0;
    state.times = [];
    switchView('game');
    prepareNextTest();
}

/**
 * Prepare for the next individual reaction test
 */
function prepareNextTest() {
    state.currentTest++;
    state.gameStatus = 'waiting';

    // Update progress
    const progress = (state.currentTest - 1) / state.testCount * 100;
    progressBar.style.setProperty('--progress', `${progress}%`);
    testProgressText.textContent = `Test ${state.currentTest} / ${state.testCount}`;

    // Reset UI
    reactionArea.className = 'reaction-area waiting';
    gameStatusText.textContent = 'Wait for green...';
    gameHintText.textContent = 'Stay focused';
    gameIcon.innerHTML = '<i class="ri-hourglass-2-line"></i>';

    const delay = Math.random() * (state.delayRange[1] - state.delayRange[0]) + state.delayRange[0];

    state.timer = setTimeout(() => {
        state.gameStatus = 'go';
        state.startTime = performance.now();
        reactionArea.className = 'reaction-area go';
        gameStatusText.textContent = 'CLICK NOW!';
        gameHintText.textContent = 'AS FAST AS YOU CAN';
        gameIcon.innerHTML = '<i class="ri-flashlight-line"></i>';
    }, delay);
}

/**
 * Handle user click or keypress
 */
function handleInteraction() {
    if (state.view !== 'game') return;

    if (state.gameStatus === 'waiting') {
        clearTimeout(state.timer);
        state.gameStatus = 'early';
        reactionArea.className = 'reaction-area early';
        gameStatusText.textContent = 'Too early!';
        gameHintText.textContent = 'Click to try this test again';
        gameIcon.innerHTML = '<i class="ri-error-warning-line"></i>';
    } else if (state.gameStatus === 'go') {
        const endTime = performance.now();
        const reactionTime = Math.round(endTime - state.startTime);
        state.times.push(reactionTime);

        state.gameStatus = 'idle';

        if (state.currentTest < state.testCount) {
            prepareNextTest();
        } else {
            progressBar.style.setProperty('--progress', `100%`);
            setTimeout(showResults, 300);
        }
    } else if (state.gameStatus === 'early') {
        state.currentTest--; // Re-run the same test
        prepareNextTest();
    }
}

/**
 * Calculate results and display them
 */
function showResults() {
    const avg = Math.round(state.times.reduce((a, b) => a + b) / state.times.length);
    const rank = getRank(avg);

    finalAvg.textContent = `${avg} ms`;
    avgRank.textContent = rank.label;
    avgRank.style.backgroundColor = rank.color;
    encouragement.innerHTML = `${rank.enc} ${rank.icon}`;

    // Update individual results
    testList.innerHTML = state.times.map((t, i) => `
        <div class="test-time">
            <span class="ms">${t}</span>
            <span class="label">T${i + 1}</span>
        </div>
    `).join('');

    // Persistence
    state.history.push(avg);
    if (state.history.length > 20) state.history.shift();
    localStorage.setItem('art_history', JSON.stringify(state.history));

    const minTime = Math.min(...state.times);
    if (!state.pb || minTime < state.pb) {
        state.pb = minTime;
        localStorage.setItem('art_best', state.pb);
    }

    switchView('result');

    // Session Chart - render AFTER switching view so dimensions are non-zero
    const sessionChartBox = document.getElementById('sessionChartBox');
    const sessionChartContainer = document.getElementById('sessionChartContainer');
    if (state.testCount > 1) {
        sessionChartBox.classList.remove('hidden');
        const sessionLabels = state.times.map((_, i) => `T${i + 1}`);
        setTimeout(() => createSVGChart(sessionChartContainer, state.times, sessionLabels), 50);
    } else {
        sessionChartBox.classList.add('hidden');
    }
}

/**
 * Determine rank based on ms
 */
function getRank(ms) {
    if (ms < 150) return { label: 'Elite', color: '#8b5cf6', enc: 'Unreal speed!', icon: '<i class="ri-speed-up-line"></i>' };
    if (ms < 200) return { label: 'Pro', color: '#ef4444', enc: 'Insane reflexes!', icon: '<i class="ri-fire-line"></i>' };
    if (ms < 300) return { label: 'Advanced', color: '#f59e0b', enc: 'Great job!', icon: '<i class="ri-medal-2-line"></i>' };
    if (ms < 400) return { label: 'Intermediate', color: '#22c55e', enc: 'You can do better!', icon: '<i class="ri-seedling-line"></i>' };
    return { label: 'Beginner', color: '#3b82f6', enc: 'Keep practicing!', icon: '<i class="ri-bike-line"></i>' };
}

/**
 * Update stats displayed in settings
 */
function updateStatsDisplay() {
    pbValueText.textContent = state.pb ? `${state.pb} ms` : '-- ms';
    if (state.pb) {
        rankStatusText.textContent = getRank(state.pb).label;
        rankStatusText.style.color = getRank(state.pb).color;
    }

    // Home history chart
    const historyContainer = document.getElementById('historyChartContainer');
    if (state.history.length > 0) {
        const historyData = state.history.slice(-10);
        const historyLabels = historyData.map((_, i) => `#${state.history.length - historyData.length + i + 1}`);
        createSVGChart(historyContainer, historyData, historyLabels);
    } else {
        historyContainer.innerHTML = '<div class="empty-state">No data yet. Complete a test!</div>';
    }
}

/**
 * Create a dynamic SVG line chart with Axes and Area Fill
 */
function createSVGChart(container, data, labels = []) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth || 300;
    const height = rect.height || container.clientHeight || 200;

    container.innerHTML = '';

    // Internal margins within the SVG (matching CSS padding-ish)
    const margin = { top: 20, right: 10, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.classList.add("chart-svg");

    // Definition for Gradient
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", "chartGradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "var(--accent)");

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "transparent");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    if (data.length < 1) return;

    // Scaling
    const maxVal = Math.max(...data, 500);
    const minVal = 0; // Fixed floor at 0 for area chart looks better
    const range = maxVal;

    const getX = (i) => margin.left + (i * chartWidth / (Math.max(data.length - 1, 1)));
    const getY = (v) => margin.top + chartHeight - ((v / range) * chartHeight);

    // Draw Grid Lines & Y-Labels
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
        const val = Math.round((range / gridSteps) * i);
        const y = getY(val);

        // Grid Line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", margin.left);
        line.setAttribute("y1", y);
        line.setAttribute("x2", margin.left + chartWidth);
        line.setAttribute("y2", y);
        line.classList.add("chart-grid");
        svg.appendChild(line);

        // Y Label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", margin.left - 10);
        text.setAttribute("y", y + 4);
        text.textContent = val;
        text.classList.add("chart-label", "y-axis");
        svg.appendChild(text);
    }

    // Create Area Path
    let areaD = `M ${getX(0)} ${getY(0)}`;
    areaD += ` L ${getX(0)} ${getY(data[0])}`;
    for (let i = 1; i < data.length; i++) {
        areaD += ` L ${getX(i)} ${getY(data[i])}`;
    }
    areaD += ` L ${getX(data.length - 1)} ${getY(0)} Z`;

    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", areaD);
    area.classList.add("chart-area");
    svg.appendChild(area);

    // Create Line Path
    let lineD = `M ${getX(0)} ${getY(data[0])}`;
    for (let i = 1; i < data.length; i++) {
        lineD += ` L ${getX(i)} ${getY(data[i])}`;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", lineD);
    path.classList.add("chart-line");
    svg.appendChild(path);

    // Create Points & X-Labels
    data.forEach((val, i) => {
        const x = getX(i);
        const y = getY(val);

        // Point
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", "5");
        circle.classList.add("chart-point");

        circle.addEventListener('click', (e) => {
            e.stopPropagation();
            showTooltip(container, x, y, `${val} ms`);
            container.querySelectorAll('.chart-point').forEach(p => p.classList.remove('active'));
            circle.classList.add('active');
        });
        svg.appendChild(circle);

        // X Label
        if (labels[i]) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x);
            text.setAttribute("y", margin.top + chartHeight + 20);
            text.textContent = labels[i];
            text.classList.add("chart-label", "x-axis");
            svg.appendChild(text);
        }
    });

    container.appendChild(svg);
}

function showTooltip(container, x, y, text) {
    // Remove existing
    const existing = container.querySelector('.point-tooltip');
    if (existing) existing.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'point-tooltip';
    tooltip.textContent = text;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    container.appendChild(tooltip);

    // Auto remove
    setTimeout(() => {
        if (tooltip.parentNode) tooltip.remove();
        container.querySelectorAll('.chart-point').forEach(p => p.classList.remove('active'));
    }, 2000);
}

/**
 * Render historical data chart (deprecated in favor of SVG chart)
 */
function renderHistoryChart() {
    // Keep for potential alternate view, but unused now
}

/**
 * Clear user data
 */
function clearData() {
    if (confirm('Are you sure you want to clear your history and personal best?')) {
        localStorage.removeItem('art_history');
        localStorage.removeItem('art_best');
        state.history = [];
        state.pb = null;
        updateStatsDisplay();
        renderHistoryChart();
    }
}

// Start
init();
