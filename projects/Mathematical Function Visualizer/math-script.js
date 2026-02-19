// Global variables
let canvas, ctx;
let currentFunction = 'x^2';
let xMin = -10, xMax = 10;
let resolution = 100;

// Initialize on load
window.onload = function() {
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Add event listeners
    document.getElementById('xMin').addEventListener('input', updateRangeDisplay);
    document.getElementById('xMax').addEventListener('input', updateRangeDisplay);
    document.getElementById('resolution').addEventListener('input', updateRangeDisplay);
    
    // Initial plot
    plotFunction();
};

function updateRangeDisplay() {
    xMin = parseInt(document.getElementById('xMin').value);
    xMax = parseInt(document.getElementById('xMax').value);
    resolution = parseInt(document.getElementById('resolution').value);
    
    document.getElementById('xMinValue').textContent = xMin;
    document.getElementById('xMaxValue').textContent = xMax;
    document.getElementById('resolutionValue').textContent = resolution;
}

function setPreset(func) {
    document.getElementById('functionInput').value = func;
    currentFunction = func;
    plotFunction();
}

// Parse and evaluate mathematical expression
function evaluateFunction(x, funcStr) {
    try {
        // Replace common math notation
        let expr = funcStr
            .replace(/\^/g, '**')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/exp/g, 'Math.exp')
            .replace(/log/g, 'Math.log')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/abs/g, 'Math.abs')
            .replace(/PI/g, 'Math.PI')
            .replace(/E/g, 'Math.E');
        
        // Evaluate
        return eval(expr);
    } catch (e) {
        return NaN;
    }
}

// Calculate numerical derivative
function numericalDerivative(x, funcStr, h = 0.0001) {
    const f1 = evaluateFunction(x + h, funcStr);
    const f2 = evaluateFunction(x - h, funcStr);
    return (f1 - f2) / (2 * h);
}

// Main plotting function
function plotFunction() {
    currentFunction = document.getElementById('functionInput').value;
    updateRangeDisplay();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const showDerivative = document.getElementById('showDerivative').checked;
    const showGrid = document.getElementById('showGrid').checked;
    const showPoints = document.getElementById('showPoints').checked;
    
    // Generate data points
    const step = (xMax - xMin) / resolution;
    const points = [];
    const derivativePoints = [];
    
    for (let x = xMin; x <= xMax; x += step) {
        const y = evaluateFunction(x, currentFunction);
        if (!isNaN(y) && isFinite(y)) {
            points.push({ x, y });
            
            if (showDerivative) {
                const dy = numericalDerivative(x, currentFunction);
                if (!isNaN(dy) && isFinite(dy)) {
                    derivativePoints.push({ x, y: dy });
                }
            }
        }
    }
    
    if (points.length === 0) {
        ctx.fillStyle = '#e74c3c';
        ctx.font = '20px Arial';
        ctx.fillText('Invalid function or no valid points', canvas.width / 2 - 150, canvas.height / 2);
        return;
    }
    
    // Find y range
    const yValues = points.map(p => p.y);
    let yMin = Math.min(...yValues);
    let yMax = Math.max(...yValues);
    
    // Add padding
    const yPadding = (yMax - yMin) * 0.1 || 1;
    yMin -= yPadding;
    yMax += yPadding;
    
    // Draw grid
    if (showGrid) {
        drawGrid(xMin, xMax, yMin, yMax);
    }
    
    // Draw axes
    drawAxes(xMin, xMax, yMin, yMax);
    
    // Draw function
    drawCurve(points, xMin, xMax, yMin, yMax, '#5b21b6', 3, showPoints);
    
    // Draw derivative
    if (showDerivative && derivativePoints.length > 0) {
        drawCurve(derivativePoints, xMin, xMax, yMin, yMax, '#10b981', 2, false);
    }
    
    // Update function properties
    updateFunctionProperties(points);
}

function drawGrid(xMin, xMax, yMin, yMax) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    const xStep = (xMax - xMin) / 10;
    for (let x = xMin; x <= xMax; x += xStep) {
        const px = mapX(x, xMin, xMax);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    const yStep = (yMax - yMin) / 10;
    for (let y = yMin; y <= yMax; y += yStep) {
        const py = mapY(y, yMin, yMax);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(canvas.width, py);
        ctx.stroke();
    }
}

function drawAxes(xMin, xMax, yMin, yMax) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // X-axis
    if (yMin <= 0 && yMax >= 0) {
        const y0 = mapY(0, yMin, yMax);
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.lineTo(canvas.width, y0);
        ctx.stroke();
    }
    
    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
        const x0 = mapX(0, xMin, xMax);
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0, canvas.height);
        ctx.stroke();
    }
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`x: [${xMin}, ${xMax}]`, 10, 20);
    ctx.fillText(`y: [${yMin.toFixed(2)}, ${yMax.toFixed(2)}]`, 10, 40);
}

function drawCurve(points, xMin, xMax, yMin, yMax, color, lineWidth, showPoints) {
    if (points.length === 0) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    
    const firstPoint = points[0];
    ctx.moveTo(mapX(firstPoint.x, xMin, xMax), mapY(firstPoint.y, yMin, yMax));
    
    for (let i = 1; i < points.length; i++) {
        const px = mapX(points[i].x, xMin, xMax);
        const py = mapY(points[i].y, yMin, yMax);
        ctx.lineTo(px, py);
    }
    
    ctx.stroke();
    
    // Draw points
    if (showPoints) {
        ctx.fillStyle = color;
        for (let point of points) {
            const px = mapX(point.x, xMin, xMax);
            const py = mapY(point.y, yMin, yMax);
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

function mapX(x, xMin, xMax) {
    return ((x - xMin) / (xMax - xMin)) * canvas.width;
}

function mapY(y, yMin, yMax) {
    return canvas.height - ((y - yMin) / (yMax - yMin)) * canvas.height;
}

function updateFunctionProperties(points) {
    const yValues = points.map(p => p.y);
    const min = Math.min(...yValues);
    const max = Math.max(...yValues);
    const avg = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    
    const html = `
        <div class="property-item">
            <span class="property-label">Domain:</span>
            <span class="property-value">[${xMin}, ${xMax}]</span>
        </div>
        <div class="property-item">
            <span class="property-label">Range:</span>
            <span class="property-value">[${min.toFixed(3)}, ${max.toFixed(3)}]</span>
        </div>
        <div class="property-item">
            <span class="property-label">Average:</span>
            <span class="property-value">${avg.toFixed(3)}</span>
        </div>
    `;
    
    document.getElementById('functionProperties').innerHTML = html;
    
    // Find critical points
    findCriticalPoints();
    
    // Calculate statistics
    calculateStatistics(points);
}

function analyzePoint() {
    const x = parseFloat(document.getElementById('pointX').value);
    const y = evaluateFunction(x, currentFunction);
    const dy = numericalDerivative(x, currentFunction);
    const d2y = numericalDerivative(x, currentFunction, 0.001);
    
    const html = `
        <strong>At x = ${x}:</strong><br>
        f(x) = ${y.toFixed(4)}<br>
        f'(x) = ${dy.toFixed(4)}<br>
        f''(x) = ${d2y.toFixed(4)}<br>
        <br>
        ${dy > 0 ? '📈 Increasing' : dy < 0 ? '📉 Decreasing' : '➡️ Stationary'}<br>
        ${d2y > 0 ? '⤴️ Concave Up' : d2y < 0 ? '⤵️ Concave Down' : '➡️ Inflection'}
    `;
    
    document.getElementById('pointResults').innerHTML = html;
}

function calculateDerivative() {
    const x = parseFloat(document.getElementById('pointX').value) || 0;
    document.getElementById('pointX').value = x;
    analyzePoint();
}

function findCriticalPoints() {
    const criticalPoints = [];
    const step = (xMax - xMin) / 200;
    
    for (let x = xMin + step; x < xMax; x += step) {
        const dy = numericalDerivative(x, currentFunction);
        if (Math.abs(dy) < 0.01) {
            const y = evaluateFunction(x, currentFunction);
            const d2y = numericalDerivative(x, currentFunction, 0.001);
            const type = d2y > 0 ? 'Minimum' : d2y < 0 ? 'Maximum' : 'Inflection';
            criticalPoints.push({ x: x.toFixed(3), y: y.toFixed(3), type });
        }
    }
    
    let html = '';
    if (criticalPoints.length === 0) {
        html = '<p style="color: #999;">No critical points found in range</p>';
    } else {
        html = criticalPoints.slice(0, 5).map(p => 
            `<div class="property-item">
                <span class="property-label">${p.type}:</span>
                <span class="property-value">(${p.x}, ${p.y})</span>
            </div>`
        ).join('');
    }
    
    document.getElementById('criticalPoints').innerHTML = html;
}

function findRoots() {
    const roots = [];
    const step = (xMax - xMin) / 500;
    let prevY = evaluateFunction(xMin, currentFunction);
    
    for (let x = xMin + step; x <= xMax; x += step) {
        const y = evaluateFunction(x, currentFunction);
        if (!isNaN(y) && !isNaN(prevY)) {
            if ((prevY < 0 && y > 0) || (prevY > 0 && y < 0)) {
                roots.push(x.toFixed(4));
            }
        }
        prevY = y;
    }
    
    let message = roots.length > 0 
        ? `🎯 Roots found near x = ${roots.slice(0, 5).join(', ')}`
        : '❌ No roots found in range';
    
    alert(message);
}

function calculateStatistics(points) {
    const yValues = points.map(p => p.y);
    const n = yValues.length;
    const sum = yValues.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const variance = yValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    const html = `
        <div class="property-item">
            <span class="property-label">Points:</span>
            <span class="property-value">${n}</span>
        </div>
        <div class="property-item">
            <span class="property-label">Mean:</span>
            <span class="property-value">${mean.toFixed(3)}</span>
        </div>
        <div class="property-item">
            <span class="property-label">Std Dev:</span>
            <span class="property-value">${stdDev.toFixed(3)}</span>
        </div>
    `;
    
    document.getElementById('statistics').innerHTML = html;
}

// Handle window resize
window.addEventListener('resize', function() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    plotFunction();
});
