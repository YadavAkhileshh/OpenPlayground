const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

const fractalCanvas = document.getElementById('fractalCanvas');
const fractalCtx = fractalCanvas.getContext('2d');
const fractalIterations = document.getElementById('fractalIterations');
const fractalZoom = document.getElementById('fractalZoom');
const resetFractal = document.getElementById('resetFractal');

let fractalOffsetX = 0;
let fractalOffsetY = 0;

function drawMandelbrot() {
    const width = fractalCanvas.width;
    const height = fractalCanvas.height;
    const imageData = fractalCtx.createImageData(width, height);
    const maxIter = parseInt(fractalIterations.value);
    const zoom = fractalZoom.value / 50;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let a = (x - width / 2) / (width / 4) / zoom + fractalOffsetX;
            let b = (y - height / 2) / (height / 4) / zoom + fractalOffsetY;
            
            let ca = a;
            let cb = b;
            let n = 0;
            
            while (n < maxIter) {
                let aa = a * a - b * b;
                let bb = 2 * a * b;
                
                a = aa + ca;
                b = bb + cb;
                
                if (a * a + b * b > 16) break;
                n++;
            }
            
            const pixel = (x + y * width) * 4;
            const brightness = n === maxIter ? 0 : (n / maxIter) * 255;
            
            imageData.data[pixel] = brightness;
            imageData.data[pixel + 1] = brightness * 1.5;
            imageData.data[pixel + 2] = 255 - brightness;
            imageData.data[pixel + 3] = 255;
        }
    }
    
    fractalCtx.putImageData(imageData, 0, 0);
}

fractalIterations.addEventListener('input', drawMandelbrot);
fractalZoom.addEventListener('input', drawMandelbrot);
resetFractal.addEventListener('click', () => {
    fractalOffsetX = 0;
    fractalOffsetY = 0;
    fractalZoom.value = 100;
    drawMandelbrot();
});

fractalCanvas.addEventListener('click', (e) => {
    const rect = fractalCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const zoom = fractalZoom.value / 50;
    
    fractalOffsetX += (x - fractalCanvas.width / 2) / (fractalCanvas.width / 4) / zoom;
    fractalOffsetY += (y - fractalCanvas.height / 2) / (fractalCanvas.height / 4) / zoom;
    drawMandelbrot();
});

drawMandelbrot();

const graphCanvas = document.getElementById('graphCanvas');
const graphCtx = graphCanvas.getContext('2d');
const functionInput = document.getElementById('functionInput');
const xMin = document.getElementById('xMin');
const xMax = document.getElementById('xMax');
const plotGraph = document.getElementById('plotGraph');

function evaluateFunction(funcStr, x) {
    try {
        const func = funcStr.replace(/\^/g, '**')
                            .replace(/sin/g, 'Math.sin')
                            .replace(/cos/g, 'Math.cos')
                            .replace(/tan/g, 'Math.tan')
                            .replace(/sqrt/g, 'Math.sqrt')
                            .replace(/log/g, 'Math.log')
                            .replace(/abs/g, 'Math.abs');
        return eval(func);
    } catch {
        return NaN;
    }
}

function plotFunction() {
    const width = graphCanvas.width;
    const height = graphCanvas.height;
    const minX = parseFloat(xMin.value);
    const maxX = parseFloat(xMax.value);
    
    graphCtx.fillStyle = '#ffffff';
    graphCtx.fillRect(0, 0, width, height);
    
    graphCtx.strokeStyle = '#ddd';
    graphCtx.lineWidth = 1;
    graphCtx.beginPath();
    graphCtx.moveTo(0, height / 2);
    graphCtx.lineTo(width, height / 2);
    graphCtx.moveTo(width / 2, 0);
    graphCtx.lineTo(width / 2, height);
    graphCtx.stroke();
    
    const points = [];
    let minY = Infinity;
    let maxY = -Infinity;
    
    for (let px = 0; px < width; px++) {
        const x = minX + (px / width) * (maxX - minX);
        const y = evaluateFunction(functionInput.value, x);
        if (!isNaN(y) && isFinite(y)) {
            points.push({ x: px, y: y });
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    }
    
    graphCtx.strokeStyle = '#667eea';
    graphCtx.lineWidth = 3;
    graphCtx.beginPath();
    
    points.forEach((point, i) => {
        const py = height - ((point.y - minY) / (maxY - minY)) * height;
        if (i === 0) {
            graphCtx.moveTo(point.x, py);
        } else {
            graphCtx.lineTo(point.x, py);
        }
    });
    
    graphCtx.stroke();
}

plotGraph.addEventListener('click', plotFunction);
plotFunction();

const primeCanvas = document.getElementById('primeCanvas');
const primeCtx = primeCanvas.getContext('2d');
const primeCount = document.getElementById('primeCount');
const primeCountLabel = document.getElementById('primeCountLabel');
const generatePrime = document.getElementById('generatePrime');

primeCount.addEventListener('input', () => {
    primeCountLabel.textContent = primeCount.value;
});

function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

function drawPrimeSpiral() {
    const width = primeCanvas.width;
    const height = primeCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxPrimes = parseInt(primeCount.value);
    
    primeCtx.fillStyle = '#000000';
    primeCtx.fillRect(0, 0, width, height);
    
    let num = 2;
    let primeFound = 0;
    
    while (primeFound < maxPrimes) {
        if (isPrime(num)) {
            const angle = primeFound * 2.4;
            const radius = Math.sqrt(primeFound) * 3;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            const hue = (primeFound / maxPrimes) * 360;
            primeCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            primeCtx.beginPath();
            primeCtx.arc(x, y, 2, 0, Math.PI * 2);
            primeCtx.fill();
            
            primeFound++;
        }
        num++;
    }
}

generatePrime.addEventListener('click', drawPrimeSpiral);
drawPrimeSpiral();

const fourierCanvas = document.getElementById('fourierCanvas');
const fourierCtx = fourierCanvas.getContext('2d');
const harmonics = document.getElementById('harmonics');
const harmonicsLabel = document.getElementById('harmonicsLabel');
const fourierSpeed = document.getElementById('fourierSpeed');
const toggleAnimation = document.getElementById('toggleAnimation');

let fourierTime = 0;
let fourierAnimating = true;

harmonics.addEventListener('input', () => {
    harmonicsLabel.textContent = harmonics.value;
});

toggleAnimation.addEventListener('click', () => {
    fourierAnimating = !fourierAnimating;
    toggleAnimation.textContent = fourierAnimating ? 'Pause' : 'Play';
});

function drawFourier() {
    const width = fourierCanvas.width;
    const height = fourierCanvas.height;
    const centerY = height / 2;
    const numHarmonics = parseInt(harmonics.value);
    
    fourierCtx.fillStyle = '#000000';
    fourierCtx.fillRect(0, 0, width, height);
    
    fourierCtx.strokeStyle = '#444';
    fourierCtx.lineWidth = 1;
    fourierCtx.beginPath();
    fourierCtx.moveTo(0, centerY);
    fourierCtx.lineTo(width, centerY);
    fourierCtx.stroke();
    
    let x = 50;
    let y = centerY;
    
    for (let i = 0; i < numHarmonics; i++) {
        const n = i * 2 + 1;
        const radius = 50 * (4 / (n * Math.PI));
        const angle = n * fourierTime;
        
        const prevX = x;
        const prevY = y;
        
        x += radius * Math.cos(angle);
        y += radius * Math.sin(angle);
        
        fourierCtx.strokeStyle = `hsl(${i * 360 / numHarmonics}, 100%, 50%)`;
        fourierCtx.lineWidth = 2;
        fourierCtx.beginPath();
        fourierCtx.arc(prevX, prevY, radius, 0, Math.PI * 2);
        fourierCtx.stroke();
        
        fourierCtx.beginPath();
        fourierCtx.moveTo(prevX, prevY);
        fourierCtx.lineTo(x, y);
        fourierCtx.stroke();
    }
    
    fourierCtx.fillStyle = '#ffffff';
    fourierCtx.beginPath();
    fourierCtx.arc(x, y, 5, 0, Math.PI * 2);
    fourierCtx.fill();
    
    if (fourierAnimating) {
        fourierTime += 0.02 * parseFloat(fourierSpeed.value);
    }
    
    requestAnimationFrame(drawFourier);
}

drawFourier();
