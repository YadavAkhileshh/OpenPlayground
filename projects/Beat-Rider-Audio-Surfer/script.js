const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioUpload = document.getElementById('audioUpload');
const audioPlayer = document.getElementById('audioPlayer');
const btnStart = document.getElementById('btnStart');
const btnRestart = document.getElementById('btnRestart');
const startMenu = document.getElementById('startMenu');
const gameOverMenu = document.getElementById('gameOver');
const scoreText = document.getElementById('scoreText');
const finalScoreText = document.getElementById('finalScoreText');

// --- Web Audio API Setup ---
let audioContext, analyser, dataArray;
let isAudioSetup = false;

// --- Game State ---
const LANES = [100, 300, 500]; // X coordinates for 3 lanes
let state = {
    isPlaying: false,
    score: 0,
    speed: 8,
    bassCooldown: 0,
    trebleCooldown: 0,
    pulse: 0
};

const player = {
    lane: 1, // 0: Left, 1: Center, 2: Right
    y: 650,
    size: 40
};

let entities = []; // Combines obstacles and collectibles

// --- Inputs ---
audioUpload.addEventListener('change', function() {
    if (this.files[0]) {
        const url = URL.createObjectURL(this.files[0]);
        audioPlayer.src = url;
        btnStart.disabled = false;
    }
});

btnStart.addEventListener('click', () => {
    startMenu.classList.add('hidden');
    initAudio();
    startGame();
});

btnRestart.addEventListener('click', () => {
    gameOverMenu.classList.add('hidden');
    startMenu.classList.remove('hidden');
    audioUpload.value = "";
    btnStart.disabled = true;
});

window.addEventListener('keydown', (e) => {
    if (!state.isPlaying) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        if (player.lane > 0) player.lane--;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        if (player.lane < 2) player.lane++;
    }
});

// --- Audio Processing ---
function initAudio() {
    if (isAudioSetup) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioPlayer);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    isAudioSetup = true;
}

// --- Game Logic ---
function startGame() {
    entities = [];
    state.score = 0;
    state.isPlaying = true;
    player.lane = 1;
    scoreText.innerText = state.score;
    
    audioPlayer.play();
    audioPlayer.onended = triggerGameOver;
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    requestAnimationFrame(gameLoop);
}

function triggerGameOver() {
    state.isPlaying = false;
    finalScoreText.innerText = state.score;
    gameOverMenu.classList.remove('hidden');
}

function processAudioBeats() {
    analyser.getByteFrequencyData(dataArray);

    // Calculate Bass (Lower frequencies: bins 0-10)
    let bassSum = 0;
    for (let i = 0; i < 10; i++) bassSum += dataArray[i];
    let bassAvg = bassSum / 10;

    // Calculate Treble (Higher frequencies: bins 50-100)
    let trebleSum = 0;
    for (let i = 50; i < 100; i++) trebleSum += dataArray[i];
    let trebleAvg = trebleSum / 50;

    // Visual pulse effect based on bass
    state.pulse = bassAvg / 255;

    // Spawn Obstacle on heavy bass
    if (bassAvg > 210 && state.bassCooldown <= 0) {
        spawnEntity('obstacle');
        state.bassCooldown = 25; // Prevent clustering
    }

    // Spawn Coin on sharp treble
    if (trebleAvg > 120 && state.trebleCooldown <= 0) {
        spawnEntity('coin');
        state.trebleCooldown = 30;
    }

    if (state.bassCooldown > 0) state.bassCooldown--;
    if (state.trebleCooldown > 0) state.trebleCooldown--;
}

function spawnEntity(type) {
    const randomLane = Math.floor(Math.random() * 3);
    entities.push({
        type: type,
        lane: randomLane,
        y: -50,
        size: type === 'obstacle' ? 50 : 30
    });
}

function update() {
    if (!state.isPlaying) return;

    processAudioBeats();

    const targetX = LANES[player.lane];
    
    for (let i = entities.length - 1; i >= 0; i--) {
        let e = entities[i];
        e.y += state.speed;

        // Collision Detection
        let playerX = targetX;
        let eX = LANES[e.lane];

        if (
            playerX < eX + e.size &&
            playerX + player.size > eX &&
            player.y < e.y + e.size &&
            player.y + player.size > e.y
        ) {
            if (e.type === 'coin') {
                state.score += 100;
                scoreText.innerText = state.score;
                entities.splice(i, 1);
            } else if (e.type === 'obstacle') {
                state.score = Math.max(0, state.score - 50);
                scoreText.innerText = state.score;
                entities.splice(i, 1);
                // Simple camera shake effect
                canvas.style.transform = `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)`;
                setTimeout(() => canvas.style.transform = 'none', 100);
            }
            continue;
        }

        // Cleanup off-screen
        if (e.y > canvas.height + 100) {
            entities.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Lanes (Grid effect pulsing to music)
    ctx.strokeStyle = `rgba(157, 0, 255, ${0.2 + (state.pulse * 0.5)})`;
    ctx.lineWidth = 2;
    LANES.forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x + 20, 0);
        ctx.lineTo(x + 20, canvas.height);
        ctx.stroke();
    });

    // Draw Entities
    entities.forEach(e => {
        const x = LANES[e.lane] + 20 - (e.size / 2); // Center in lane
        
        if (e.type === 'obstacle') {
            ctx.fillStyle = '#ff007f';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff007f';
            ctx.fillRect(x, e.y, e.size, e.size);
        } else {
            ctx.fillStyle = '#00f3ff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00f3ff';
            ctx.beginPath();
            ctx.arc(x + e.size/2, e.y + e.size/2, e.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    });

    // Draw Player
    const pX = LANES[player.lane] + 20 - (player.size / 2);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#fff';
    
    // Player pulses with the beat
    const dynamicSize = player.size + (state.pulse * 10);
    ctx.fillRect(pX - (dynamicSize - player.size)/2, player.y, dynamicSize, dynamicSize);
    ctx.shadowBlur = 0;
}

function gameLoop() {
    update();
    draw();
    if (state.isPlaying) requestAnimationFrame(gameLoop);
}

// Initial draw to show lanes before starting
draw();