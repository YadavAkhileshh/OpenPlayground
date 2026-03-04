const canvas = document.getElementById('tapestryCanvas');
const particleCanvas = document.getElementById('particleCanvas');
const neuralCanvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');
const particleCtx = particleCanvas.getContext('2d');
const neuralCtx = neuralCanvas.getContext('2d');

let width, height;
let time = 0;
let mouseX = 0.5, mouseY = 0.5;
let mouseVelocity = { x: 0, y: 0 };
let lastMousePos = { x: 0.5, y: 0.5 };
let currentMood = 'joyful';
let targetColors = [];
let currentColors = [];
let particles = [];
let neurons = [];
let audioContext = null;
let analyser = null;
let audioData = null;
let savedPatterns = JSON.parse(localStorage.getItem('tapestryPatterns')) || [];

const moodPalettes = {
    joyful: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98', '#FFB6C1', '#FFDAB9', '#E6E6FA'],
    melancholic: ['#4A4E69', '#9A8C98', '#C9ADA7', '#22223B', '#F2E9E4', '#6C5B7B', '#355C7D', '#99B898'],
    energetic: ['#FF0000', '#FF4500', '#FF1493', '#DC143C', '#B22222', '#FF6347', '#FF7F50', '#FF8C00'],
    calm: ['#A8E6CF', '#D4EDF7', '#FFD3B6', '#B5EAD7', '#C7CEEA', '#E2F0CB', '#B0E0E6', '#F0E68C'],
    curious: ['#9400D3', '#4B0082', '#00FF00', '#FFFF00', '#FF7F00', '#8A2BE2', '#7FFF00', '#FF1493'],
    chaotic: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00', '#0000FF', '#FF1493', '#7CFC00'],
    ethereal: ['#E0B0FF', '#C0C0C0', '#B0E0E6', '#D8BFD8', '#FFE4E1', '#F0FFF0', '#F5F5DC', '#FFF0F5'],
    nostalgic: ['#C0C0C0', '#A9A9A9', '#808080', '#696969', '#778899', '#708090', '#2F4F4F', '#DCDCDC']
};

class Particle {
    constructor(x, y) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1;
        this.color = currentColors[Math.floor(Math.random() * currentColors.length)];
        this.size = 2 + Math.random() * 3;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.002;
        
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        
        const dx = mouseX * width - this.x;
        const dy = mouseY * height - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
            this.vx -= dx * 0.0001;
            this.vy -= dy * 0.0001;
        }
    }
    
    draw() {
        particleCtx.beginPath();
        particleCtx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        particleCtx.fillStyle = this.color;
        particleCtx.globalAlpha = this.life * 0.5;
        particleCtx.fill();
    }
}

class Neuron {
    constructor(x, y) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;
        this.connections = [];
        this.activation = 0;
        this.targetActivation = 0;
    }
    
    connect(other) {
        this.connections.push(other);
    }
    
    update(mouseInfluence) {
        this.targetActivation = mouseInfluence * (1 - Math.sqrt(
            Math.pow(this.x - mouseX * width, 2) + 
            Math.pow(this.y - mouseY * height, 2)
        ) / 1000);
        
        this.activation += (this.targetActivation - this.activation) * 0.1;
    }
    
    draw() {
        neuralCtx.beginPath();
        neuralCtx.arc(this.x, this.y, 3 + this.activation * 10, 0, Math.PI * 2);
        neuralCtx.fillStyle = `rgba(255, 215, 0, ${this.activation})`;
        neuralCtx.fill();
    }
}

function init() {
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
    
    canvas.addEventListener('mousemove', (e) => {
        const newX = e.clientX / width;
        const newY = e.clientY / height;
        
        mouseVelocity.x = newX - mouseX;
        mouseVelocity.y = newY - mouseY;
        
        mouseX = newX;
        mouseY = newY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        mouseX = touch.clientX / width;
        mouseY = touch.clientY / height;
    }, { passive: false });
    
    setupAudio();
    setupNeuralNetwork();
    setupEventListeners();
    
    targetColors = moodPalettes.joyful;
    currentColors = [...targetColors];
    
    for (let i = 0; i < 200; i++) {
        particles.push(new Particle());
    }
    
    animate();
    updateTime();
}

function resizeCanvases() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    particleCanvas.width = width;
    particleCanvas.height = height;
    neuralCanvas.width = width;
    neuralCanvas.height = height;
}

function setupAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                audioData = new Uint8Array(analyser.frequencyBinCount);
            })
            .catch(err => console.log('Audio input not available'));
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function setupNeuralNetwork() {
    for (let i = 0; i < 30; i++) {
        for (let j = 0; j < 30; j++) {
            const neuron = new Neuron(
                (i / 30) * width + Math.random() * 20,
                (j / 30) * height + Math.random() * 20
            );
            neurons.push(neuron);
        }
    }
    
    for (let i = 0; i < neurons.length; i++) {
        const connections = Math.floor(Math.random() * 5) + 1;
        for (let j = 0; j < connections; j++) {
            const other = neurons[Math.floor(Math.random() * neurons.length)];
            if (other !== neurons[i]) {
                neurons[i].connect(other);
            }
        }
    }
}

function setupEventListeners() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMood = btn.dataset.mood;
            targetColors = moodPalettes[currentMood];
            document.getElementById('currentMoodDisplay').textContent = btn.textContent.replace(/[^\w\s]/g, '');
        });
    });
    
    document.getElementById('densitySlider').addEventListener('input', (e) => {
        document.getElementById('densityValue').textContent = e.target.value;
    });
    
    document.getElementById('complexitySlider').addEventListener('input', (e) => {
        document.getElementById('complexityValue').textContent = e.target.value;
        const count = 50 + parseInt(e.target.value) * 3;
        document.getElementById('neuronCount').textContent = count;
    });
    
    document.getElementById('speedSlider').addEventListener('input', (e) => {
        document.getElementById('speedValue').textContent = e.target.value;
    });
    
    document.getElementById('savePattern').addEventListener('click', savePattern);
    document.getElementById('loadPattern').addEventListener('click', loadPattern);
    document.getElementById('exportPNG').addEventListener('click', exportPNG);
    
    document.querySelectorAll('.mood-mix').forEach(slider => {
        slider.addEventListener('input', updateMixedMood);
    });
    
    document.getElementById('ambientMode').addEventListener('change', (e) => {
        if (e.target.checked) startAmbientMode();
    });
    
    document.getElementById('timeAdapt').addEventListener('change', (e) => {
        if (e.target.checked) adaptToTime();
    });
}

function updateMixedMood() {
    const joy = document.getElementById('mixJoyful').value / 100;
    const energy = document.getElementById('mixEnergetic').value / 100;
    const calm = document.getElementById('mixCalm').value / 100;
    
    const total = joy + energy + calm;
    
    if (total > 0) {
        const mixedPalette = [];
        for (let i = 0; i < 8; i++) {
            const c1 = moodPalettes.joyful[i % moodPalettes.joyful.length];
            const c2 = moodPalettes.energetic[i % moodPalettes.energetic.length];
            const c3 = moodPalettes.calm[i % moodPalettes.calm.length];
            
            const r1 = parseInt(c1.slice(1,3), 16) * joy;
            const g1 = parseInt(c1.slice(3,5), 16) * joy;
            const b1 = parseInt(c1.slice(5,7), 16) * joy;
            
            const r2 = parseInt(c2.slice(1,3), 16) * energy;
            const g2 = parseInt(c2.slice(3,5), 16) * energy;
            const b2 = parseInt(c2.slice(5,7), 16) * energy;
            
            const r3 = parseInt(c3.slice(1,3), 16) * calm;
            const g3 = parseInt(c3.slice(3,5), 16) * calm;
            const b3 = parseInt(c3.slice(5,7), 16) * calm;
            
            const r = Math.round((r1 + r2 + r3) / total);
            const g = Math.round((g1 + g2 + g3) / total);
            const b = Math.round((b1 + b2 + b3) / total);
            
            mixedPalette.push(`#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`);
        }
        targetColors = mixedPalette;
    }
}

function startAmbientMode() {
    const moods = Object.keys(moodPalettes);
    let index = 0;
    
    setInterval(() => {
        if (document.getElementById('ambientMode').checked) {
            index = (index + 1) % moods.length;
            currentMood = moods[index];
            targetColors = moodPalettes[currentMood];
            document.getElementById('currentMoodDisplay').textContent = 
                currentMood.charAt(0).toUpperCase() + currentMood.slice(1);
        }
    }, 10000);
}

function adaptToTime() {
    const hour = new Date().getHours();
    if (hour < 6 || hour > 20) {
        targetColors = moodPalettes.melancholic;
    } else if (hour < 10) {
        targetColors = moodPalettes.calm;
    } else if (hour < 16) {
        targetColors = moodPalettes.energetic;
    } else {
        targetColors = moodPalettes.ethereal;
    }
}

function updateTime() {
    const now = new Date();
    document.getElementById('timeDisplay').textContent = 
        now.getHours().toString().padStart(2, '0') + ':' + 
        now.getMinutes().toString().padStart(2, '0');
    setTimeout(updateTime, 60000);
}

function savePattern() {
    const pattern = {
        id: Date.now(),
        mood: currentMood,
        colors: currentColors,
        density: document.getElementById('densitySlider').value,
        complexity: document.getElementById('complexitySlider').value,
        speed: document.getElementById('speedSlider').value,
        timestamp: new Date().toISOString()
    };
    
    savedPatterns.push(pattern);
    localStorage.setItem('tapestryPatterns', JSON.stringify(savedPatterns));
    alert('Pattern saved!');
}

function loadPattern() {
    if (savedPatterns.length === 0) {
        alert('No saved patterns');
        return;
    }
    
    const latest = savedPatterns[savedPatterns.length - 1];
    document.getElementById('densitySlider').value = latest.density;
    document.getElementById('complexitySlider').value = latest.complexity;
    document.getElementById('speedSlider').value = latest.speed;
    
    document.getElementById('densityValue').textContent = latest.density;
    document.getElementById('complexityValue').textContent = latest.complexity;
    document.getElementById('speedValue').textContent = latest.speed;
    
    alert('Pattern loaded!');
}

function exportPNG() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const exportCtx = exportCanvas.getContext('2d');
    
    exportCtx.fillStyle = '#0a0a0f';
    exportCtx.fillRect(0, 0, width, height);
    
    drawWeaveToContext(exportCtx);
    
    const link = document.createElement('a');
    link.download = `tapestry-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL();
    link.click();
}

function drawWeaveToContext(targetCtx) {
    const density = parseInt(document.getElementById('densitySlider').value);
    const complexity = parseInt(document.getElementById('complexitySlider').value);
    const speed = parseInt(document.getElementById('speedSlider').value);
    
    const warpCount = 20 + density;
    const weftCount = 15 + density;
    const cellWidth = width / warpCount;
    const cellHeight = height / weftCount;
    
    for (let i = 0; i <= warpCount; i++) {
        const x = i * cellWidth;
        const warpOffset = Math.sin(i * 0.3 + time * (speed / 50)) * 20 * mouseX;
        
        for (let j = 0; j <= weftCount; j++) {
            const y = j * cellHeight;
            const weftOffset = Math.cos(j * 0.3 + time * 0.5 * (speed / 50)) * 20 * mouseY;
            
            const colorIndex1 = Math.floor((i + time) % currentColors.length);
            const colorIndex2 = Math.floor((j + time) % currentColors.length);
            
            targetCtx.beginPath();
            targetCtx.arc(x + warpOffset, y + weftOffset, 4 + complexity/20, 0, Math.PI * 2);
            targetCtx.fillStyle = currentColors[colorIndex1];
            targetCtx.globalAlpha = 0.6;
            targetCtx.fill();
            
            targetCtx.beginPath();
            targetCtx.arc(x - warpOffset, y - weftOffset, 3 + complexity/25, 0, Math.PI * 2);
            targetCtx.fillStyle = currentColors[colorIndex2];
            targetCtx.globalAlpha = 0.6;
            targetCtx.fill();
        }
    }
}

function lerpColor(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1,3), 16);
    const g1 = parseInt(color1.slice(3,5), 16);
    const b1 = parseInt(color1.slice(5,7), 16);
    const r2 = parseInt(color2.slice(1,3), 16);
    const g2 = parseInt(color2.slice(3,5), 16);
    const b2 = parseInt(color2.slice(5,7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function updateColors() {
    for (let i = 0; i < currentColors.length; i++) {
        if (targetColors[i]) {
            currentColors[i] = lerpColor(currentColors[i], targetColors[i], 0.05);
        }
    }
}

function drawMainWeave() {
    const density = parseInt(document.getElementById('densitySlider').value);
    const complexity = parseInt(document.getElementById('complexitySlider').value);
    const speed = parseInt(document.getElementById('speedSlider').value);
    const soundReactive = document.getElementById('soundReactive').checked;
    
    let audioFactor = 1;
    if (soundReactive && analyser && audioData) {
        analyser.getByteFrequencyData(audioData);
        const avg = audioData.reduce((a, b) => a + b, 0) / audioData.length;
        audioFactor = 0.5 + (avg / 256);
        document.getElementById('frequencyDisplay').textContent = 
            Math.round(avg * 10) / 10 + ' Hz';
    }
    
    const warpCount = 20 + density;
    const weftCount = 15 + density;
    const cellWidth = width / warpCount;
    const cellHeight = height / weftCount;
    
    for (let i = 0; i <= warpCount; i++) {
        const x = i * cellWidth;
        const warpOffset = Math.sin(i * 0.3 + time * (speed / 50)) * 20 * mouseX * audioFactor;
        
        for (let j = 0; j <= weftCount; j++) {
            const y = j * cellHeight;
            const weftOffset = Math.cos(j * 0.3 + time * 0.5 * (speed / 50)) * 20 * mouseY * audioFactor;
            
            const colorIndex1 = Math.floor((i + time) % currentColors.length);
            const colorIndex2 = Math.floor((j + time) % currentColors.length);
            
            ctx.beginPath();
            ctx.arc(x + warpOffset, y + weftOffset, 4 + complexity/20, 0, Math.PI * 2);
            ctx.fillStyle = currentColors[colorIndex1];
            ctx.globalAlpha = 0.6 * audioFactor;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x - warpOffset, y - weftOffset, 3 + complexity/25, 0, Math.PI * 2);
            ctx.fillStyle = currentColors[colorIndex2];
            ctx.globalAlpha = 0.6 * audioFactor;
            ctx.fill();
            
            if (complexity > 50) {
                ctx.beginPath();
                ctx.moveTo(x - cellWidth/2 + warpOffset, y - cellHeight/2 + weftOffset);
                ctx.lineTo(x + cellWidth/2 + warpOffset, y + cellHeight/2 + weftOffset);
                ctx.strokeStyle = currentColors[colorIndex1];
                ctx.lineWidth = 1 + complexity/50;
                ctx.globalAlpha = 0.2 * audioFactor;
                ctx.stroke();
            }
        }
    }
}

function drawParticles() {
    particleCtx.clearRect(0, 0, width, height);
    
    const soundReactive = document.getElementById('soundReactive').checked;
    const density = parseInt(document.getElementById('densitySlider').value);
    
    let audioFactor = 1;
    if (soundReactive && analyser && audioData) {
        analyser.getByteFrequencyData(audioData);
        const avg = audioData.reduce((a, b) => a + b, 0) / audioData.length;
        audioFactor = avg / 128;
    }
    
    if (particles.length < density * 2) {
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle());
        }
    }
    
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.vx += (Math.random() - 0.5) * 0.1 * audioFactor;
        p.vy += (Math.random() - 0.5) * 0.1 * audioFactor;
        p.update();
        p.draw();
    });
}

function drawNeuralNetwork() {
    neuralCtx.clearRect(0, 0, width, height);
    
    const neuralMode = document.getElementById('neuralMode').checked;
    if (!neuralMode) return;
    
    const mouseInfluence = Math.sqrt(mouseVelocity.x * mouseVelocity.x + mouseVelocity.y * mouseVelocity.y) * 10;
    
    neurons.forEach(neuron => {
        neuron.update(mouseInfluence);
        
        neuron.connections.forEach(other => {
            if (neuron.activation > 0.1 || other.activation > 0.1) {
                neuralCtx.beginPath();
                neuralCtx.moveTo(neuron.x, neuron.y);
                neuralCtx.lineTo(other.x, other.y);
                neuralCtx.strokeStyle = `rgba(255, 215, 0, ${(neuron.activation + other.activation) * 0.2})`;
                neuralCtx.lineWidth = 0.5;
                neuralCtx.stroke();
            }
        });
        
        neuron.draw();
    });
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    updateColors();
    drawMainWeave();
    drawParticles();
    drawNeuralNetwork();
    
    time += 0.02;
    
    lastMousePos.x = mouseX;
    lastMousePos.y = mouseY;
    
    requestAnimationFrame(animate);
}

init();