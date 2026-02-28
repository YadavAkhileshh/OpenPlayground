// Sound Wave Visualizer - Main JavaScript File
// Web Audio API Integration with Multiple Visualization Modes

// DOM Elements
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');
const micBtn = document.getElementById('micBtn');
const fileInput = document.getElementById('fileInput');
const styleSelect = document.getElementById('styleSelect');
const sensitivitySlider = document.getElementById('sensitivity');
const stopBtn = document.getElementById('stopBtn');
const colorBtns = document.querySelectorAll('.color-btn');
const canvasContainer = document.querySelector('.canvas-container');

// Audio Context and Nodes
let audioContext;
let analyser;
let source;
let dataArray;
let animationId;

// State
let isPlaying = false;
let currentStyle = 'bars';
let currentTheme = 'neon';
let sensitivity = 5;
let particles = [];

// Color Themes
const themes = {
    neon: {
        primary: '#00f5ff',
        secondary: '#ff00ff',
        gradient: ['#00f5ff', '#ff00ff', '#00f5ff']
    },
    fire: {
        primary: '#ff416c',
        secondary: '#ff4b2b',
        gradient: ['#ff416c', '#ff4b2b', '#ff416c']
    },
    ocean: {
        primary: '#2193b0',
        secondary: '#6dd5ed',
        gradient: ['#2193b0', '#6dd5ed', '#2193b0']
    },
    forest: {
        primary: '#134e5e',
        secondary: '#71b280',
        gradient: ['#134e5e', '#71b280', '#134e5e']
    },
    sunset: {
        primary: '#f7971e',
        secondary: '#ffd200',
        gradient: ['#f7971e', '#ffd200', '#f7971e']
    }
};

// Initialize Canvas
function resizeCanvas() {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Event Listeners
micBtn.addEventListener('click', startMicrophone);
fileInput.addEventListener('change', handleFileUpload);
styleSelect.addEventListener('change', (e) => currentStyle = e.target.value);
sensitivitySlider.addEventListener('change', (e) => sensitivity = parseInt(e.target.value));
stopBtn.addEventListener('click', stopVisualization);

// Color Theme Selection
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTheme = btn.dataset.theme;
        
        // Update glow effect
        canvasContainer.className = 'canvas-container';
        canvasContainer.classList.add(`glow-${currentTheme}`);
    });
});

// Set initial glow
canvasContainer.classList.add('glow-neon');

// Start Microphone
async function startMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        initAudioContext();
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        startVisualization();
    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please ensure microphone permissions are granted.');
    }
}

// Handle File Upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    
    audio.oncanplaythrough = () => {
        initAudioContext();
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        audio.play();
        startVisualization();
    };
}

// Initialize Audio Context
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

// Start Visualization
function startVisualization() {
    isPlaying = true;
    placeholder.classList.add('hidden');
    micBtn.disabled = true;
    fileInput.disabled = true;
    stopBtn.disabled = false;
    
    // Initialize particles for particle mode
    if (currentStyle === 'particles') {
        initParticles();
    }
    
    animate();
}

// Stop Visualization
function stopVisualization() {
    isPlaying = false;
    placeholder.classList.remove('hidden');
    micBtn.disabled = false;
    fileInput.disabled = false;
    stopBtn.disabled = true;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Disconnect source if it's a file
    if (source && source.mediaElement) {
        source.mediaElement.pause();
    }
}

// Animation Loop
function animate() {
    if (!isPlaying) return;
    
    animationId = requestAnimationFrame(animate);
    analyser.getByteFrequencyData(dataArray);
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply visualization based on current style
    switch (currentStyle) {
        case 'bars':
            drawBars();
            break;
        case 'wave':
            drawWave();
            break;
        case 'particles':
            drawParticles();
            break;
        case 'circular':
            drawCircular();
            break;
        case 'spiral':
            drawSpiral();
            break;
    }
}

// Initialize Particles
function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            life: 100,
            hue: Math.random() * 60 + (currentTheme === 'neon' ? 180 : 0)
        });
    }
}

// Draw Frequency Bars
function drawBars() {
    const barCount = dataArray.length;
    const barWidth = canvas.width / barCount;
    const theme = themes[currentTheme];
    
    for (let i = 0; i < barCount; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * (sensitivity / 5);
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, theme.primary);
        gradient.addColorStop(1, theme.secondary);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            i * barWidth + 1,
            canvas.height - barHeight,
            barWidth - 2,
            barHeight
        );
        
        // Add glow effect
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 15;
    }
    ctx.shadowBlur = 0;
}

// Draw Waveform
function drawWave() {
    const theme = themes[currentTheme];
    ctx.beginPath();
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 3;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 20;
    
    const sliceWidth = canvas.width / dataArray.length;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 255.0;
        const y = (v * canvas.height * (sensitivity / 5)) + (canvas.height / 2) - (canvas.height * sensitivity / 10);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Draw Particles
function drawParticles() {
    const theme = themes[currentTheme];
    const avgFrequency = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    
    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update velocity based on audio
        const speed = (avgFrequency / 255) * sensitivity * 2;
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        
        // Bounce off walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (avgFrequency / 100 + 0.5), 0, Math.PI * 2);
        ctx.fillStyle = theme.primary;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 10;
        ctx.fill();
    }
    
    // Add new particles based on frequency
    if (avgFrequency > 50 && particles.length < 200) {
        for (let i = 0; i < 2; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: Math.random() * 4 + 1,
                life: 100,
                hue: Math.random() * 60 + 180
            });
        }
    }
    
    ctx.shadowBlur = 0;
}

// Draw Circular Visualization
function drawCircular() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const theme = themes[currentTheme];
    const radius = Math.min(centerX, centerY) * 0.4;
    
    ctx.beginPath();
    
    for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i];
        const angle = (i / dataArray.length) * Math.PI * 2;
        const barLength = (value / 255) * radius * (sensitivity / 3);
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barLength);
        const y2 = centerY + Math.sin(angle) * (radius + barLength);
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, theme.primary);
        gradient.addColorStop(1, theme.secondary);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 15;
        ctx.stroke();
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = theme.primary;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 30;
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

// Draw Spiral Visualization
function drawSpiral() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const theme = themes[currentTheme];
    
    ctx.beginPath();
    
    for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i];
        const angle = (i / dataArray.length) * Math.PI * 8;
        const radius = (i / dataArray.length) * Math.min(centerX, centerY) * 0.8;
        const barLength = (value / 255) * 30 * sensitivity;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, barLength);
        gradient.addColorStop(0, theme.primary);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(x, y, barLength, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 10;
        ctx.fill();
    }
    
    ctx.shadowBlur = 0;
}
