/**
 * Rhythm-Runner Engine
 * Syncs Game Logic with Web Audio API Analysis
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Audio Logic ---
let audioCtx, analyser, source;
let dataArray;
let bufferLength;
let bassVal = 0;
let trebleVal = 0;

// --- Game State ---
let width, height;
let isPlaying = false;
let score = 0;
let speed = 6;
let obstacles = [];
let particles = [];
let gameTime = 0;

// --- Player ---
const player = {
    x: 100,
    y: 100,
    w: 40,
    h: 40,
    vy: 0,
    gravity: 0.8,
    jumpStrength: -15,
    groundY: 0,
    state: 'run', // run, jump, duck
    color: '#00f3ff'
};

// --- Cooldowns ---
let lastSpawnTime = 0;

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupEvents();
    
    // Initial loop for background
    requestAnimationFrame(loop);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    player.groundY = height - 100;
    player.y = player.groundY - player.h;
}

function setupEvents() {
    // File Upload
    const input = document.getElementById('audio-upload');
    input.addEventListener('change', handleFileUpload);
    
    // Drag & Drop
    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#bc13fe'; });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.style.borderColor = '#444'; });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if(file) processAudioFile(file);
    });

    // Controls
    window.addEventListener('keydown', (e) => {
        if (!isPlaying) return;
        if ((e.code === 'ArrowUp' || e.code === 'Space') && player.y >= player.groundY - player.h) {
            player.vy = player.jumpStrength;
            player.state = 'jump';
        }
        if (e.code === 'ArrowDown') {
            player.state = 'duck';
            player.h = 20; // Shrink
            player.y = player.groundY - 20;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowDown') {
            player.state = 'run';
            player.y = player.groundY - 40;
            player.h = 40; // Grow back
        }
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    });
}

// --- Audio Processing ---

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) processAudioFile(file);
}

function processAudioFile(file) {
    const reader = new FileReader();
    reader.onload = function(ev) {
        initAudio(ev.target.result);
    };
    reader.readAsArrayBuffer(file);
}

async function initAudio(arrayBuffer) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
    
    startGame(decodedAudio);
}

function startGame(buffer) {
    // Hide UI
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    
    // Reset State
    score = 0;
    obstacles = [];
    particles = [];
    isPlaying = true;
    
    // Setup Audio Graph
    if (source) source.stop();
    source = audioCtx.createBufferSource();
    source.buffer = buffer;
    
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    source.start(0);
    source.onended = () => endGame(true);
}

// --- Analysis Logic ---

function analyzeAudio() {
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate Bass (Low Freqs ~bins 0-10)
    let bassSum = 0;
    for (let i = 0; i < 10; i++) bassSum += dataArray[i];
    bassVal = bassSum / 10;
    
    // Calculate Treble (High Freqs ~bins 100-150)
    let trebleSum = 0;
    for (let i = 100; i < 150; i++) trebleSum += dataArray[i];
    trebleVal = trebleSum / 50;

    // Procedural Spawning
    const now = Date.now();
    if (now - lastSpawnTime > 400) { // Cooldown
        if (bassVal > 220) {
            spawnObstacle('spike');
            lastSpawnTime = now;
        } else if (trebleVal > 100) {
            spawnObstacle('drone');
            lastSpawnTime = now;
        }
    }

    // Visualize
    updateVisualizerHUD();
}

function updateVisualizerHUD() {
    const container = document.getElementById('viz-bars');
    container.innerHTML = '';
    // Sample a few bars for performance
    for(let i=0; i<30; i++) {
        const h = (dataArray[i * 2] / 255) * 100;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${h}%`;
        container.appendChild(bar);
    }
}

// --- Game Logic ---

function spawnObstacle(type) {
    const obs = {
        type: type,
        x: width,
        y: type === 'spike' ? player.groundY - 30 : player.groundY - 90,
        w: 30,
        h: 30,
        color: type === 'spike' ? '#bc13fe' : '#0aff0a'
    };
    obstacles.push(obs);
}

function updatePhysics() {
    // Player
    if (player.state !== 'duck') {
        player.vy += player.gravity;
        player.y += player.vy;
        
        if (player.y > player.groundY - player.h) {
            player.y = player.groundY - player.h;
            player.vy = 0;
            if (player.state === 'jump') player.state = 'run';
        }
    }

    // Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= speed;
        
        // Collision AABB
        if (
            player.x < obs.x + obs.w &&
            player.x + player.w > obs.x &&
            player.y < obs.y + obs.h &&
            player.y + player.h > obs.y
        ) {
            endGame(false);
        }

        if (obs.x < -50) {
            obstacles.splice(i, 1);
            score += 100;
            document.getElementById('score-val').innerText = score;
        }
    }
}

function draw() {
    // Clear & Background Effect
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);
    
    // Audio Reactive Background
    const bgIntensity = bassVal / 255;
    ctx.fillStyle = `rgba(188, 19, 254, ${bgIntensity * 0.2})`;
    ctx.beginPath();
    ctx.arc(width/2, height/2, width * bgIntensity, 0, Math.PI*2);
    ctx.fill();

    // Floor
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, player.groundY, width, 2);

    // Player
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.shadowBlur = 0;

    // Obstacles
    obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        if (obs.type === 'spike') {
            // Triangle
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.h);
            ctx.lineTo(obs.x + obs.w/2, obs.y);
            ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
            ctx.fill();
        } else {
            // Circle Drone
            ctx.beginPath();
            ctx.arc(obs.x + obs.w/2, obs.y + obs.h/2, obs.w/2, 0, Math.PI*2);
            ctx.fill();
        }
    });
}

function endGame(completed) {
    isPlaying = false;
    if (source) source.stop();
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    document.querySelector('.glitch').dataset.text = completed ? "TRACK COMPLETE" : "SYNC LOST";
    document.querySelector('.glitch').innerText = completed ? "TRACK COMPLETE" : "SYNC LOST";
}

// --- Main Loop ---

function loop() {
    if (isPlaying) {
        analyzeAudio();
        updatePhysics();
    }
    draw();
    requestAnimationFrame(loop);
}

// Start
init();
