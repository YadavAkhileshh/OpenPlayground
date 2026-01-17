// System Configuration
const SERVICES = [
    { id: 'api', x: 0.5, y: 0.2, name: 'API Gateway', type: 'gateway' },
    { id: 'auth', x: 0.25, y: 0.5, name: 'Auth Service', type: 'service' },
    { id: 'payment', x: 0.5, y: 0.5, name: 'Payment', type: 'service' },
    { id: 'inventory', x: 0.75, y: 0.5, name: 'Inventory', type: 'service' },
    { id: 'db1', x: 0.25, y: 0.8, name: 'User DB', type: 'database' },
    { id: 'db2', x: 0.5, y: 0.8, name: 'Payment DB', type: 'database' },
    { id: 'db3', x: 0.75, y: 0.8, name: 'Inventory DB', type: 'database' }
];

const CONNECTIONS = [
    { from: 'api', to: 'auth' },
    { from: 'api', to: 'payment' },
    { from: 'api', to: 'inventory' },
    { from: 'auth', to: 'db1' },
    { from: 'payment', to: 'db2' },
    { from: 'inventory', to: 'db3' }
];

const OBJECTIVES = [
    { 
        id: 1, 
        text: 'Inject any chaos into a service', 
        check: () => Object.values(state.services).some(s => s.chaosType) 
    },
    { 
        id: 2, 
        text: 'Experience a cascade failure (3+ services down)', 
        check: () => Object.values(state.services).filter(s => s.health === 'failing').length >= 3 
    },
    { 
        id: 3, 
        text: 'Test a chaos scenario', 
        check: () => state.scenariosRun > 0 
    },
    { 
        id: 4, 
        text: 'Watch 50+ requests flow through the system', 
        check: () => state.stats.totalRequests >= 50 
    },
    { 
        id: 5, 
        text: 'Survive 100 requests with 80%+ success rate', 
        check: () => state.stats.totalRequests >= 100 && getSuccessRate() >= 80 
    }
];

// State Management
const state = {
    selectedTool: null,
    services: {},
    requests: [],
    particles: [],
    stats: {
        totalRequests: 0,
        failedRequests: 0,
        activeRequests: 0,
        latencies: []
    },
    trafficMode: 'normal',
    scenariosRun: 0,
    currentObjective: 0,
    objectivesCompleted: []
};

// Initialize service states
SERVICES.forEach(service => {
    state.services[service.id] = {
        health: 'healthy',
        status: 'operational',
        chaosType: null,
        recoveryTimer: null,
        requestsHandled: 0,
        failures: 0,
        load: 0
    };
});

// Canvas Setup
const canvas = document.getElementById('systemCanvas');
const ctx = canvas.getContext('2d');
const particleCanvas = document.getElementById('particleCanvas');
const particleCtx = particleCanvas.getContext('2d');

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    particleCanvas.width = window.innerWidth * window.devicePixelRatio;
    particleCanvas.height = window.innerHeight * window.devicePixelRatio;
    particleCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Tool Selection
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const chaosType = btn.dataset.chaos;
        
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        
        if (state.selectedTool === chaosType) {
            state.selectedTool = null;
            updateToolHint('Click a chaos tool, then click a service to inject failure');
        } else {
            state.selectedTool = chaosType;
            btn.classList.add('active');
            updateToolHint(`Click a service to inject: ${getChaosName(chaosType)}`);
        }
    });
});

// Scenario Buttons
document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const scenario = btn.dataset.scenario;
        runScenario(scenario);
    });
});

// Traffic Control
document.querySelectorAll('.traffic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.traffic-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.trafficMode = btn.dataset.traffic;
        showAlert('info', 'Traffic Mode Changed', `Traffic set to: ${state.trafficMode}`);
    });
});

// Canvas Click Handler
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedService = getServiceAtPosition(x, y);
    if (clickedService) {
        if (state.selectedTool) {
            injectChaos(clickedService.id, state.selectedTool);
        } else {
            showServiceDetails(clickedService.id);
        }
    }
});

// Canvas Hover for Tooltip
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const hoveredService = getServiceAtPosition(x, y);
    canvas.style.cursor = hoveredService ? 'pointer' : 'default';
});

// Reset Button
document.getElementById('resetBtn').addEventListener('click', () => {
    Object.keys(state.services).forEach(id => {
        clearTimeout(state.services[id].recoveryTimer);
        state.services[id] = {
            health: 'healthy',
            status: 'operational',
            chaosType: null,
            recoveryTimer: null,
            requestsHandled: 0,
            failures: 0,
            load: 0
        };
    });
    
    state.requests = [];
    state.stats = {
        totalRequests: 0,
        failedRequests: 0,
        activeRequests: 0,
        latencies: []
    };
    
    updateStats();
    showAlert('success', 'System Reset', 'All services restored to healthy state');
});

// Modal Controls
document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('serviceModal').classList.remove('show');
});

document.getElementById('serviceModal').addEventListener('click', (e) => {
    if (e.target.id === 'serviceModal') {
        document.getElementById('serviceModal').classList.remove('show');
    }
});

// Core Functions
function getChaosName(type) {
    const names = {
        crash: 'Crash',
        slowdown: 'Slowdown',
        network: 'Network Loss',
        overload: 'Overload',
        memory: 'Memory Leak',
        corruption: 'Data Corruption'
    };
    return names[type] || type;
}

function getServiceAtPosition(x, y) {
    const rect = canvas.getBoundingClientRect();
    
    for (let service of SERVICES) {
        const sx = service.x * rect.width;
        const sy = service.y * rect.height;
        const distance = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2);
        
        if (distance < 30) {
            return service;
        }
    }
    return null;
}

function injectChaos(serviceId, chaosType) {
    const service = state.services[serviceId];
    const serviceDef = SERVICES.find(s => s.id === serviceId);
    
    clearTimeout(service.recoveryTimer);
    
    service.chaosType = chaosType;
    
    // Create explosion particles
    const rect = canvas.getBoundingClientRect();
    createExplosion(
        serviceDef.x * rect.width + rect.left,
        serviceDef.y * rect.height + rect.top,
        chaosType === 'crash' ? '#ef4444' : '#f59e0b'
    );
    
    let recoveryTime;
    switch (chaosType) {
        case 'crash':
            service.health = 'failing';
            service.status = 'crashed';
            recoveryTime = 5000;
            showAlert('error', 'Service Crashed!', `${serviceDef.name} has crashed and is recovering...`);
            break;
        case 'slowdown':
            service.health = 'degraded';
            service.status = 'slow';
            recoveryTime = 8000;
            showAlert('warning', 'Service Slow', `${serviceDef.name} is experiencing slowdowns`);
            break;
        case 'network':
            service.health = 'degraded';
            service.status = 'network-issue';
            recoveryTime = 6000;
            showAlert('warning', 'Network Issues', `${serviceDef.name} has packet loss`);
            break;
        case 'overload':
            service.health = 'degraded';
            service.status = 'overloaded';
            recoveryTime = 7000;
            showAlert('error', 'Overload!', `${serviceDef.name} is overloaded with requests`);
            break;
        case 'memory':
            service.health = 'degraded';
            service.status = 'memory-leak';
            recoveryTime = 9000;
            showAlert('warning', 'Memory Leak', `${serviceDef.name} has a memory leak`);
            break;
        case 'corruption':
            service.health = 'failing';
            service.status = 'data-corrupted';
            recoveryTime = 6500;
            showAlert('error', 'Data Corruption!', `${serviceDef.name} data is corrupted`);
            break;
    }
    
    scheduleRecovery(serviceId, recoveryTime);
    checkObjectives();
}

function scheduleRecovery(serviceId, delay) {
    const service = state.services[serviceId];
    const serviceDef = SERVICES.find(s => s.id === serviceId);
    
    service.recoveryTimer = setTimeout(() => {
        service.health = 'healthy';
        service.status = 'operational';
        service.chaosType = null;
        showAlert('success', 'Service Recovered', `${serviceDef.name} is back online`);
    }, delay);
}

function runScenario(scenario) {
    state.scenariosRun++;
    
    switch (scenario) {
        case 'blackfriday':
            showAlert('info', 'Scenario: Black Friday', 'Massive traffic spike incoming!');
            state.trafficMode = 'stress';
            document.querySelectorAll('.traffic-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-traffic="stress"]').classList.add('active');
            setTimeout(() => {
                injectChaos('payment', 'overload');
                setTimeout(() => injectChaos('inventory', 'slowdown'), 2000);
            }, 1000);
            break;
            
        case 'ddos':
            showAlert('error', 'Scenario: DDoS Attack', 'System under attack!');
            injectChaos('api', 'overload');
            setTimeout(() => {
                injectChaos('auth', 'network');
                injectChaos('payment', 'network');
            }, 1500);
            break;
            
        case 'cascade':
            showAlert('error', 'Scenario: Cascade Failure', 'Watch the domino effect...');
            injectChaos('db2', 'crash');
            setTimeout(() => injectChaos('payment', 'crash'), 2000);
            setTimeout(() => injectChaos('api', 'degraded'), 3000);
            setTimeout(() => {
                injectChaos('auth', 'slowdown');
                injectChaos('inventory', 'slowdown');
            }, 4000);
            break;
    }
    
    checkObjectives();
}

function updateToolHint(text) {
    document.getElementById('tool-hint').textContent = text;
}

function showServiceDetails(serviceId) {
    const service = state.services[serviceId];
    const serviceDef = SERVICES.find(s => s.id === serviceId);
    
    const modal = document.getElementById('serviceModal');
    document.getElementById('modalTitle').textContent = serviceDef.name;
    
    const healthColor = service.health === 'healthy' ? '#10b981' : 
                        service.health === 'degraded' ? '#f59e0b' : '#ef4444';
    
    const dependencies = CONNECTIONS
        .filter(c => c.from === serviceId)
        .map(c => SERVICES.find(s => s.id === c.to).name)
        .join(', ') || 'None';
    
    document.getElementById('modalBody').innerHTML = `
        <div class="service-detail">
            <div class="service-detail-label">Health Status</div>
            <div class="service-detail-value" style="color: ${healthColor}">${service.health.toUpperCase()}</div>
        </div>
        <div class="service-detail">
            <div class="service-detail-label">Current Status</div>
            <div class="service-detail-value">${service.status}</div>
        </div>
        <div class="service-detail">
            <div class="service-detail-label">Requests Handled</div>
            <div class="service-detail-value">${service.requestsHandled}</div>
        </div>
        <div class="service-detail">
            <div class="service-detail-label">Failures</div>
            <div class="service-detail-value">${service.failures}</div>
        </div>
        <div class="service-detail">
            <div class="service-detail-label">Success Rate</div>
            <div class="service-detail-value">${service.requestsHandled > 0 ? ((service.requestsHandled - service.failures) / service.requestsHandled * 100).toFixed(1) : 100}%</div>
        </div>
        <div class="service-detail">
            <div class="service-detail-label">Dependencies</div>
            <div class="service-detail-value">${dependencies}</div>
        </div>
        ${service.chaosType ? `
        <div class="service-detail" style="border-left-color: #ef4444">
            <div class="service-detail-label">Active Chaos</div>
            <div class="service-detail-value">${getChaosName(service.chaosType)}</div>
        </div>
        ` : ''}
    `;
    
    modal.classList.add('show');
}

// Alert System
function showAlert(type, title, message) {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    const icons = {
        error: '🔴',
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️'
    };
    
    alert.innerHTML = `
        <div class="alert-header">
            <span class="alert-icon">${icons[type]}</span>
            <span class="alert-title">${title}</span>
        </div>
        <div class="alert-message">${message}</div>
    `;
    
    container.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 4000);
}

// Particle System
function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 / 20) * i;
        const velocity = 2 + Math.random() * 3;
        state.particles.push({
            x, y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 1,
            color
        });
    }
}

function updateParticles(deltaTime) {
    particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    state.particles = state.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // gravity
        particle.life -= deltaTime * 0.001;
        
        if (particle.life > 0) {
            particleCtx.beginPath();
            particleCtx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            particleCtx.fillStyle = particle.color;
            particleCtx.globalAlpha = particle.life;
            particleCtx.fill();
            particleCtx.globalAlpha = 1;
            return true;
        }
        return false;
    });
}

// Request Simulation
function simulateRequest() {
    const request = {
        id: Date.now() + Math.random(),
        path: ['api'],
        currentIndex: 0,
        startTime: Date.now(),
        failed: false
    };
    
    // Determine path through system
    const targetService = ['auth', 'payment', 'inventory'][Math.floor(Math.random() * 3)];
    request.path.push(targetService);
    
    if (targetService === 'auth') request.path.push('db1');
    else if (targetService === 'payment') request.path.push('db2');
    else request.path.push('db3');
    
    state.requests.push(request);
    state.stats.activeRequests++;
    state.stats.totalRequests++;
}

function updateRequests(deltaTime) {
    state.requests = state.requests.filter(request => {
        const speedMultiplier = state.trafficMode === 'stress' ? 0.003 : 
                               state.trafficMode === 'burst' ? 0.0025 : 0.002;
        
        request.currentIndex += deltaTime * speedMultiplier;
        
        const currentServiceIndex = Math.floor(request.currentIndex);
        
        if (currentServiceIndex >= request.path.length) {
            // Request completed
            state.stats.activeRequests--;
            
            if (!request.failed) {
                const latency = Date.now() - request.startTime;
                state.stats.latencies.push(latency);
                if (state.stats.latencies.length > 100) {
                    state.stats.latencies.shift();
                }
            }
            
            return false;
        }
        
        // Check if current service is healthy
        const serviceId = request.path[currentServiceIndex];
        const service = state.services[serviceId];
        
        service.requestsHandled++;
        service.load = Math.min(service.load + 0.1, 10);
        
        if (!request.failed) {
            let failureChance = 0;
            
            if (service.health === 'failing') {
                failureChance = service.chaosType === 'crash' ? 0.9 : 0.7;
            } else if (service.health === 'degraded') {
                failureChance = service.chaosType === 'memory' ? 0.4 : 0.3;
            }
            
            if (Math.random() < failureChance) {
                request.failed = true;
                state.stats.failedRequests++;
                state.stats.activeRequests--;
                service.failures++;
                return false;
            }
        }
        
        return true;
    });
    
    // Reduce service load over time
    Object.values(state.services).forEach(s => {
        s.load = Math.max(s.load - 0.05, 0);
    });
}

// Objectives System
function checkObjectives() {
    if (state.currentObjective >= OBJECTIVES.length) return;
    
    const objective = OBJECTIVES[state.currentObjective];
    if (objective.check() && !state.objectivesCompleted.includes(objective.id)) {
        state.objectivesCompleted.push(objective.id);
        state.currentObjective++;
        
        showAlert('success', '🎯 Objective Complete!', objective.text);
        
        if (state.currentObjective < OBJECTIVES.length) {
            updateObjectiveDisplay();
        } else {
            document.getElementById('objectiveText').textContent = '🏆 All objectives complete! You\'re a Chaos Master!';
        }
    }
}

function updateObjectiveDisplay() {
    if (state.currentObjective < OBJECTIVES.length) {
        const objective = OBJECTIVES[state.currentObjective];
        document.getElementById('objectiveText').textContent = objective.text;
        
        const progress = (state.currentObjective / OBJECTIVES.length) * 100;
        document.getElementById('objectiveProgress').style.width = `${progress}%`;
    }
}

function getSuccessRate() {
    return state.stats.totalRequests > 0 
        ? ((state.stats.totalRequests - state.stats.failedRequests) / state.stats.totalRequests * 100)
        : 100;
}

// Rendering
function draw() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw connections with gradient based on health
    CONNECTIONS.forEach(conn => {
        const from = SERVICES.find(s => s.id === conn.from);
        const to = SERVICES.find(s => s.id === conn.to);
        const toService = state.services[conn.to];
        
        const gradient = ctx.createLinearGradient(
            from.x * rect.width, from.y * rect.height,
            to.x * rect.width, to.y * rect.height
        );
        
        const connectionColor = toService.health === 'failing' ? 'rgba(239, 68, 68, 0.3)' :
                               toService.health === 'degraded' ? 'rgba(245, 158, 11, 0.3)' :
                               'rgba(255, 255, 255, 0.1)';
        
        ctx.strokeStyle = connectionColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(from.x * rect.width, from.y * rect.height);
        ctx.lineTo(to.x * rect.width, to.y * rect.height);
        ctx.stroke();
    });
    
    // Draw requests flowing
    state.requests.forEach(request => {
        const currentIndex = Math.floor(request.currentIndex);
        const nextIndex = Math.min(currentIndex + 1, request.path.length - 1);
        const progress = request.currentIndex - currentIndex;
        
        const fromService = SERVICES.find(s => s.id === request.path[currentIndex]);
        const toService = SERVICES.find(s => s.id === request.path[nextIndex]);
        
        if (fromService && toService) {
            const x = fromService.x + (toService.x - fromService.x) * progress;
            const y = fromService.y + (toService.y - fromService.y) * progress;
            
            ctx.beginPath();
            ctx.arc(x * rect.width, y * rect.height, 4, 0, Math.PI * 2);
            ctx.fillStyle = request.failed ? '#ef4444' : '#667eea';
            ctx.shadowColor = request.failed ? 'rgba(239, 68, 68, 0.5)' : 'rgba(102, 126, 234, 0.5)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });
    
    // Draw services
    SERVICES.forEach(service => {
        const x = service.x * rect.width;
        const y = service.y * rect.height;
        const serviceState = state.services[service.id];
        
        // Load ring (outer)
        if (serviceState.load > 0) {
            ctx.beginPath();
            ctx.arc(x, y, 35, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(102, 126, 234, ${serviceState.load / 10})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Service circle
        ctx.beginPath();
        ctx.arc(x, y, 28, 0, Math.PI * 2);
        
        let fillColor, glowColor;
        switch (serviceState.health) {
            case 'healthy':
                fillColor = '#10b981';
                glowColor = 'rgba(16, 185, 129, 0.4)';
                break;
            case 'degraded':
                fillColor = '#f59e0b';
                glowColor = 'rgba(245, 158, 11, 0.4)';
                break;
            case 'failing':
                fillColor = '#ef4444';
                glowColor = 'rgba(239, 68, 68, 0.4)';
                break;
        }
        
        ctx.fillStyle = fillColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Pulsing effect for failing services
        if (serviceState.health === 'failing') {
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(x, y, 28, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Service icon
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const icon = service.type === 'database' ? '🗄️' : 
                     service.type === 'gateway' ? '🚪' : '⚙️';
        ctx.fillText(icon, x, y);
        
        // Service name
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(service.name, x, y + 45);
        
        // Status indicator
        if (serviceState.chaosType) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x - 35, y - 45, 70, 16);
            ctx.fillStyle = '#fff';
            ctx.font = '9px sans-serif';
            ctx.fillText(serviceState.status.toUpperCase(), x, y - 37);
        }
    });
}

function updateStats() {
    const successRate = getSuccessRate();
    
    document.getElementById('successRate').textContent = `${successRate.toFixed(1)}%`;
    document.getElementById('activeRequests').textContent = state.stats.activeRequests;
    document.getElementById('failedRequests').textContent = state.stats.failedRequests;
    
    const avgLatency = state.stats.latencies.length > 0
        ? Math.round(state.stats.latencies.reduce((a, b) => a + b, 0) / state.stats.latencies.length)
        : 12;
    document.getElementById('avgLatency').textContent = `${avgLatency}ms`;
    
    const successBar = document.getElementById('successBar');
    successBar.style.width = `${successRate}%`;
    
    if (successRate >= 80) {
        successBar.className = 'stat-fill';
    } else if (successRate >= 50) {
        successBar.className = 'stat-fill warning';
    } else {
        successBar.className = 'stat-fill danger';
    }
    
    checkObjectives();
}

// Animation Loop
let lastTime = Date.now();
let requestTimer = 0;

function animate() {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Generate requests based on traffic mode
    if (state.trafficMode !== 'stop') {
        requestTimer += deltaTime;
        
        let requestInterval;
        switch (state.trafficMode) {
            case 'burst':
                requestInterval = 500;
                break;
            case 'stress':
                requestInterval = 300;
                break;
            default:
                requestInterval = 1000;
        }
        
        if (requestTimer > requestInterval) {
            simulateRequest();
            requestTimer = 0;
        }
    }
    
    updateRequests(deltaTime);
    updateParticles(deltaTime);
    draw();
    updateStats();
    
    requestAnimationFrame(animate);
}

// Initialize and Start
updateObjectiveDisplay();
animate();

// Welcome message
setTimeout(() => {
    showAlert('info', 'Welcome to Chaos Engineering!', 'Start by clicking a chaos tool and injecting failures into services');
}, 500);
