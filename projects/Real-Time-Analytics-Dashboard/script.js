document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initializeCharts();
    
    // Start real-time updates
    startRealTimeUpdates();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial data stream events
    generateInitialEvents();
});

// Chart instances storage
let charts = {};

function initializeCharts() {
    const ctx = document.getElementById('traffic-chart').getContext('2d');
    charts.traffic = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            datasets: [
                {
                    label: 'Organic',
                    data: [320, 280, 350, 420, 510, 480, 520, 500],
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Direct',
                    data: [180, 160, 200, 240, 300, 280, 320, 310],
                    borderColor: '#50E3C2',
                    backgroundColor: 'rgba(80, 227, 194, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Social',
                    data: [120, 100, 140, 180, 220, 200, 240, 230],
                    borderColor: '#F5A623',
                    backgroundColor: 'rgba(245, 166, 35, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // Regional chart
    const regionalCtx = document.getElementById('regional-chart').getContext('2d');
    charts.regional = new Chart(regionalCtx, {
        type: 'doughnut',
        data: {
            labels: ['North America', 'Europe', 'Asia', 'South America', 'Africa'],
            datasets: [{
                data: [35, 28, 22, 10, 5],
                backgroundColor: [
                    '#4A90E2',
                    '#50E3C2',
                    '#F5A623',
                    '#9B59B6',
                    '#E74C3C'
                ],
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });

    // Performance gauge
    const gaugeCtx = document.getElementById('performance-gauge').getContext('2d');
    charts.gauge = new Chart(gaugeCtx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [87, 13],
                backgroundColor: ['#4A90E2', '#ECF0F1'],
                borderWidth: 0,
                circumference: 250,
                rotation: 125
            }]
        },
        options: {
            responsive: true,
            cutout: '80%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });

    // Initialize mini charts
    initializeMiniCharts();
}

function initializeMiniCharts() {
    const miniCharts = ['users', 'conversions', 'revenue', 'errors'];
    
    miniCharts.forEach(chartId => {
        const ctx = document.getElementById(`${chartId}-chart`).getContext('2d');
        charts[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(10).fill(''),
                datasets: [{
                    data: generateRandomData(10, chartId),
                    borderColor: getChartColor(chartId),
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    });
}

function getChartColor(chartId) {
    const colors = {
        users: '#4A90E2',
        conversions: '#50E3C2',
        revenue: '#F5A623',
        errors: '#E74C3C'
    };
    return colors[chartId] || '#4A90E2';
}

// Real-time updates
let updateInterval;
let isUpdating = true;

function startRealTimeUpdates() {
    updateInterval = setInterval(updateDashboard, 3000);
}

function updateDashboard() {
    if (!isUpdating) return;
    
    // Update timestamp
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('update-time').textContent = timeString;
    
    // Update metrics with animation
    updateMetric('active-users', getRandomNumber(1800, 1900));
    updateMetric('conversions', getRandomNumber(300, 350));
    updateMetric('revenue', '$' + getRandomNumber(12000, 13000).toLocaleString());
    updateMetric('errors', getRandomNumber(8, 16));
    
    // Update mini charts
    updateMiniCharts();
    
    // Update main charts
    updateMainCharts();
    
    // Add new event to stream
    addNewEvent();
    
    // Update event count
    const eventCount = getRandomNumber(20, 30);
    document.getElementById('event-count').textContent = eventCount;
}

function updateMetric(elementId, newValue) {
    const element = document.getElementById(elementId);
    const oldValue = parseInt(element.textContent.replace(/[^0-9]/g, ''));
    const newNum = parseInt(newValue.toString().replace(/[^0-9]/g, ''));
    
    if (isNaN(oldValue) || isNaN(newNum)) {
        element.textContent = newValue;
        return;
    }
    
    // Animate the number change
    animateNumberChange(element, oldValue, newNum, 1000);
}

function animateNumberChange(element, start, end, duration) {
    const startTime = performance.now();
    const valueDifference = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(start + valueDifference * progress);
        element.textContent = element.id === 'revenue' 
            ? '$' + currentValue.toLocaleString()
            : currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function updateMiniCharts() {
    const miniCharts = ['users', 'conversions', 'revenue', 'errors'];
    
    miniCharts.forEach(chartId => {
        const chart = charts[chartId];
        if (chart) {
            // Remove first data point and add new one
            chart.data.datasets[0].data.shift();
            chart.data.datasets[0].data.push(
                getRandomNumber(getChartRange(chartId).min, getChartRange(chartId).max)
            );
            chart.update('quiet');
        }
    });
}

function getChartRange(chartId) {
    const ranges = {
        users: { min: 1700, max: 2000 },
        conversions: { min: 280, max: 370 },
        revenue: { min: 11000, max: 14000 },
        errors: { min: 5, max: 20 }
    };
    return ranges[chartId] || { min: 0, max: 100 };
}

function updateMainCharts() {
    // Update traffic chart
    if (charts.traffic) {
        charts.traffic.data.datasets.forEach(dataset => {
            dataset.data = dataset.data.map(value => 
                Math.max(0, value + getRandomNumber(-20, 30))
            );
        });
        charts.traffic.update();
    }
    
    // Update regional chart slightly
    if (charts.regional) {
        const newData = charts.regional.data.datasets[0].data.map(value =>
            Math.max(5, value + getRandomNumber(-2, 3))
        );
        // Normalize to 100%
        const total = newData.reduce((a, b) => a + b, 0);
        charts.regional.data.datasets[0].data = newData.map(value =>
            Math.round((value / total) * 100)
        );
        charts.regional.update();
    }
    
    // Update performance gauge
    if (charts.gauge) {
        const currentValue = parseInt(document.querySelector('.gauge-value').textContent);
        const newValue = Math.max(70, Math.min(95, currentValue + getRandomNumber(-2, 3)));
        
        charts.gauge.data.datasets[0].data = [newValue, 100 - newValue];
        charts.gauge.update();
        
        document.querySelector('.gauge-value').textContent = newValue;
    }
}

// Event handling
function setupEventListeners() {
    // Pause/resume button
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.addEventListener('click', function() {
        isUpdating = !isUpdating;
        
        if (isUpdating) {
            this.innerHTML = '<i class="fas fa-pause"></i> Pause Updates';
            this.classList.remove('btn-secondary');
            this.classList.add('btn-primary');
        } else {
            this.innerHTML = '<i class="fas fa-play"></i> Resume Updates';
            this.classList.remove('btn-primary');
            this.classList.add('btn-secondary');
        }
    });
    
    // Time range selector
    const timeRange = document.getElementById('time-range');
    timeRange.addEventListener('change', function() {
        const minutes = parseInt(this.value);
        document.getElementById('update-interval').textContent = 
            minutes <= 15 ? '3' : minutes <= 30 ? '5' : '10';
        
        // Simulate data reload for selected range
        console.log(`Loading data for last ${minutes} minutes`);
    });
}

// Event stream
function generateInitialEvents() {
    const events = [
        { type: 'user', icon: 'user-plus', color: '#4A90E2', title: 'New user registered', user: 'john_doe', time: '2 min ago' },
        { type: 'purchase', icon: 'shopping-cart', color: '#50E3C2', title: 'Purchase completed', amount: '$249.99', time: '4 min ago' },
        { type: 'error', icon: 'exclamation-circle', color: '#E74C3C', title: 'API timeout error', endpoint: '/api/data', time: '6 min ago' },
        { type: 'pageview', icon: 'eye', color: '#9B59B6', title: 'High traffic page', page: '/products', time: '8 min ago' },
        { type: 'login', icon: 'sign-in-alt', color: '#F5A623', title: 'User logged in', user: 'admin', time: '10 min ago' }
    ];
    
    events.forEach(event => addEventToStream(event));
}

function addNewEvent() {
    const eventTypes = [
        { type: 'user', icon: 'user-plus', color: '#4A90E2', titles: ['New user registered', 'User profile updated', 'User logged in'] },
        { type: 'purchase', icon: 'shopping-cart', color: '#50E3C2', titles: ['Purchase completed', 'Payment processed', 'Order shipped'] },
        { type: 'pageview', icon: 'eye', color: '#9B59B6', titles: ['Page viewed', 'High traffic detected', 'New session started'] },
        { type: 'system', icon: 'server', color: '#2C3E50', titles: ['System backup completed', 'Cache cleared', 'Database optimized'] },
        { type: 'alert', icon: 'bell', color: '#F5A623', titles: ['Performance alert', 'Security notification', 'Update available'] }
    ];
    
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const randomTitle = randomType.titles[Math.floor(Math.random() * randomType.titles.length)];
    
    const event = {
        type: randomType.type,
        icon: randomType.icon,
        color: randomType.color,
        title: randomTitle,
        time: 'Just now'
    };
    
    addEventToStream(event);
}

function addEventToStream(event) {
    const stream = document.getElementById('event-stream');
    const eventElement = document.createElement('div');
    eventElement.className = 'event-item';
    eventElement.innerHTML = `
        <div class="event-icon" style="background: ${event.color}20; color: ${event.color}">
            <i class="fas fa-${event.icon}"></i>
        </div>
        <div class="event-content">
            <div class="event-title">${event.title}</div>
            <div class="event-meta">${event.time} • ${event.user || event.amount || event.endpoint || event.page || 'System'}</div>
        </div>
    `;
    
    // Add to top
    stream.insertBefore(eventElement, stream.firstChild);
    
    // Limit to 10 events
    if (stream.children.length > 10) {
        stream.removeChild(stream.lastChild);
    }
    
    // Add animation
    eventElement.style.animation = 'fadeIn 0.5s ease';
}

// Utility functions
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomData(count, type) {
    const data = [];
    let baseValue;
    
    switch(type) {
        case 'users': baseValue = 1800; break;
        case 'conversions': baseValue = 320; break;
        case 'revenue': baseValue = 12000; break;
        case 'errors': baseValue = 12; break;
        default: baseValue = 100;
    }
    
    for (let i = 0; i < count; i++) {
        data.push(baseValue + Math.random() * 200 - 100);
    }
    
    return data;
}

// Add btn-secondary style
const style = document.createElement('style');
style.textContent = `
    .btn-secondary {
        background: #95A5A6;
        color: white;
    }
    .btn-secondary:hover {
        background: #7F8C8D;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);