/**
 * Polyrhythm Audio Engine
 * Synchronizes a visual radar sweep with Web Audio API events.
 */

const canvas = document.getElementById('viz-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const RINGS = 12; // Number of concentric circles
const BASE_RADIUS = 40;
const SPACING = 30;
const BASE_FREQ = 220; // A3

// Pentatonic Scale (Major) Ratios
const SCALE = [1, 9/8, 5/4, 3/2, 5/3, 2]; 

// --- State ---
let width, height;
let center = { x: 0, y: 0 };
let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let globalAngle = 0; // The sweeper arm angle
let speed = 1.0;
let volume = 0.5;

// Ring Data
let rings = [];

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    generateRings();
    
    // Animation Loop (starts but does nothing until isPlaying)
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    center.x = width / 2;
    center.y = height / 2;
}

function generateRings() {
    rings = [];
    for(let i = 0; i < RINGS; i++) {
        // Each ring has increasing nodes.
        // Outer rings = more nodes = faster hits (if line speed is constant)
        // Actually, for polyrhythms, usually:
        // Ring 1: 1 beat per cycle
        // Ring 2: 2 beats per cycle...
        
        const noteIndex = i % SCALE.length;
        const octave = Math.floor(i / SCALE.length);
        const freq = BASE_FREQ * SCALE[noteIndex] * Math.pow(2, octave);
        
        rings.push({
            radius: BASE_RADIUS + (i * SPACING),
            nodes: i + 1, // 1, 2, 3...
            freq: freq,
            color: `hsl(${260 + (i * 10)}, 80%, 60%)`,
            lastHit: -1,
            pulse: 0 // Visual pulse value (0 to 1)
        });
    }
}

// --- Audio Logic ---

function startAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.value = volume;
    }
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    isPlaying = true;
    document.getElementById('start-screen').classList.add('hidden');
}

function playNote(freq) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine'; // Sine is clean, Triangle is buzzy
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Envelope (ADSR) - Pluck sound
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5); // Decay

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
    
    // UI Counter
    const el = document.getElementById('osc-count');
    el.innerText = parseInt(el.innerText) + 1;
    setTimeout(() => el.innerText = parseInt(el.innerText) - 1, 600);
}

function toggleMute() {
    if(!masterGain) return;
    const btn = document.getElementById('mute-btn');
    if (masterGain.gain.value > 0) {
        masterGain.gain.value = 0;
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        btn.style.color = '#777';
    } else {
        masterGain.gain.value = volume;
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        btn.style.color = '#fff';
    }
}

// --- Animation & Logic ---

function update() {
    if (!isPlaying) return;

    // Move Sweeper
    // Speed control: 0.02 radians per frame * slider
    const delta = 0.01 * speed; 
    const prevAngle = globalAngle;
    globalAngle = (globalAngle + delta) % (Math.PI * 2);

    // Check Intersections
    rings.forEach(ring => {
        // A ring has N nodes spaced at 2PI/N
        const spacing = (Math.PI * 2) / ring.nodes;
        
        // Check if we crossed a node
        // We calculate "progress" along the circle
        // If (prevAngle / spacing) int part != (currAngle / spacing) int part, we crossed a boundary
        
        const prevIndex = Math.floor(prevAngle / spacing);
        const currIndex = Math.floor(globalAngle / spacing);
        
        // Handle wrap around (2PI -> 0)
        // If angle reset, force check or just ignore one frame glitch?
        // Better: Check modulo
        
        // Easier math:
        // Did we pass a multiple of 'spacing' in this frame?
        // let normalizedPrev = prevAngle % spacing;
        // let normalizedCurr = globalAngle % spacing;
        // if (normalizedCurr < normalizedPrev) ...
        
        if (currIndex !== prevIndex || (prevAngle > globalAngle)) {
            // Hit!
            playNote(ring.freq);
            ring.pulse = 1.0;
        }
        
        // Decay visual pulse
        ring.pulse *= 0.95;
    });
}

function draw() {
    // Trail effect
    ctx.fillStyle = 'rgba(10, 10, 18, 0.2)'; // Fade out
    ctx.fillRect(0, 0, width, height);

    if (!isPlaying) return;

    ctx.save();
    ctx.translate(center.x, center.y);
    // Rotate canvas -90deg so 0 is Up
    ctx.rotate(-Math.PI / 2);

    // Draw Sweeper Line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(globalAngle) * (BASE_RADIUS + RINGS * SPACING), Math.sin(globalAngle) * (BASE_RADIUS + RINGS * SPACING));
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Rings & Nodes
    rings.forEach(ring => {
        // Draw Track (Dim)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Nodes
        const nodeSpacing = (Math.PI * 2) / ring.nodes;
        for (let i = 0; i < ring.nodes; i++) {
            const angle = i * nodeSpacing;
            const x = Math.cos(angle) * ring.radius;
            const y = Math.sin(angle) * ring.radius;

            // Is this node currently being hit?
            // Just use the ring.pulse for all nodes on the ring for simplicity
            // Or calculate if this SPECIFIC node was the one hit.
            // Since sweeper only hits one at a time, we can check proximity to sweeper.
            
            // Proximity check for visual glow
            let distToSweeper = Math.abs(angle - globalAngle);
            if (distToSweeper > Math.PI) distToSweeper = (Math.PI * 2) - distToSweeper;
            
            let size = 3;
            let alpha = 0.3;
            
            if (distToSweeper < 0.1) {
                // Active Hit
                size = 6 + (ring.pulse * 5);
                alpha = 1.0;
                ctx.shadowColor = ring.color;
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = ring.color;
                ctx.shadowBlur = 0;
            }
            
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    });

    ctx.restore();
}

// --- Input ---

function setupInput() {
    document.getElementById('speed-slider').oninput = (e) => speed = parseFloat(e.target.value);
    document.getElementById('vol-slider').oninput = (e) => {
        volume = parseFloat(e.target.value);
        if(masterGain) masterGain.gain.value = volume;
    };
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();