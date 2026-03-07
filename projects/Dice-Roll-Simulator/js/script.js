/**
 * Acoustic String Lab Engine
 * Simulates 1D wave strings using damped harmonic oscillators and Web Audio API.
 */

const canvas = document.getElementById('string-canvas');
const ctx = canvas.getContext('2d');

// --- State & Config ---
let width, height;
let strings = [];
let audioCtx = null;
let masterGain = null;

let isPlaying = false;
let draggedString = null;
let mouse = { x: 0, y: 0 };

// Global audio/physics settings
let currentWaveform = 'sine';
let globalStiffness = 0.2; 
const FRICTION = 0.92; // Damping factor

// Musical Frequencies (Pentatonic Scale for pleasant plucks)
// C3, D3, E3, G3, A3, C4, D4, E4
const FREQUENCIES = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63];

// --- Physics Classes ---

class AcousticString {
    constructor(x, y, length, frequency) {
        this.x = x;       // Top X
        this.y = y;       // Top Y
        this.length = length;
        
        // Control Point (Center of the string, which moves)
        this.baseCx = x;
        this.baseCy = y + length / 2;
        this.cx = this.baseCx;
        this.cy = this.baseCy;
        
        this.vx = 0; // Velocity X
        
        // Audio properties
        this.frequency = frequency;
        this.isGrabbed = false;
        
        // Visual
        this.color = '#555';
        this.thickness = Math.max(1, 4 - (frequency / 100)); // Lower notes are thicker
    }

    update() {
        if (this.isGrabbed) {
            // Pull the control point toward the mouse
            // Clamp how far it can be pulled to prevent breaking the visual
            let dx = mouse.x - this.baseCx;
            const maxPull = 150;
            if (dx > maxPull) dx = maxPull;
            if (dx < -maxPull) dx = -maxPull;
            
            this.cx = this.baseCx + dx;
            this.vx = 0; // Reset velocity while holding
            this.color = '#00e5ff'; // Highlight
        } else {
            // Simple Harmonic Motion (Hooke's Law: F = -kx)
            let force = (this.baseCx - this.cx) * globalStiffness;
            this.vx += force;
            this.vx *= FRICTION; // Damping
            this.cx += this.vx;
            
            // Visual fade back to rest state
            let speed = Math.abs(this.vx);
            if (speed > 0.5) {
                this.color = `rgba(0, 229, 255, ${Math.min(speed / 10, 1)})`;
            } else {
                this.color = '#555';
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        
        // Use a quadratic curve to simulate the string bending 
        ctx.quadraticCurveTo(this.cx, this.cy, this.x, this.y + this.length);
        
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color;
        
        // Glow if active
        if (this.color !== '#555') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00e5ff';
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.stroke();
    }

    pluck(pullDistance) {
        if (!audioCtx) return;

        // Amplitude based on how far it was pulled (normalized 0 to 1)
        const amplitude = Math.min(Math.abs(pullDistance) / 150, 1);
        if (amplitude < 0.05) return; // Too soft to hear

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = currentWaveform;
        
        // Small pitch bend based on tension (higher amplitude = slightly sharper)
        const tensionDetune = amplitude * 50; 
        osc.frequency.setValueAtTime(this.frequency, audioCtx.currentTime);
        osc.detune.setValueAtTime(tensionDetune, audioCtx.currentTime);
        osc.detune.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        // Envelope (ADSR)
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        // Attack
        gain.gain.linearRampToValueAtTime(amplitude * 0.5, audioCtx.currentTime + 0.02);
        // Decay/Release (Longer for lower frequencies)
        const decayTime = 1 + (400 / this.frequency); 
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + decayTime);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start();
        osc.stop(audioCtx.currentTime + decayTime);
    }
}

// --- Init & Environment ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Rebuild strings on resize to fit screen
    if (isPlaying) buildStrings();
}

function startEngine() {
    // Initialize Web Audio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);
    
    // UI Updates
    document.getElementById('init-screen').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    isPlaying = true;
    
    buildStrings();
    loop();
}

function buildStrings() {
    strings = [];
    const numStrings = FREQUENCIES.length;
    const spacing = width / (numStrings + 1);
    
    // Leave margin at top and bottom
    const marginY = height * 0.15;
    const stringLength = height - (marginY * 2);
    
    for (let i = 0; i < numStrings; i++) {
        // Reverse frequencies so lowest is on the left
        const freq = FREQUENCIES[numStrings - 1 - i]; 
        const xPos = spacing * (i + 1);
        
        strings.push(new AcousticString(xPos, marginY, stringLength, freq));
    }
}

// --- Input Handling ---

function setupInput() {
    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left,
            y: e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top
        };
    };

    const handleDown = (e) => {
        if (!isPlaying) return;
        mouse = getPos(e);
        
        // Find closest string within grab radius
        let closest = null;
        let minDist = 40; // Grab tolerance
        
        strings.forEach(s => {
            // Check distance to the control point or base vertical line
            const dist = Math.abs(s.baseCx - mouse.x);
            // Only grab if we click roughly in the middle vertical bounds of the string
            if (dist < minDist && mouse.y > s.y && mouse.y < s.y + s.length) {
                minDist = dist;
                closest = s;
            }
        });

        if (closest) {
            draggedString = closest;
            draggedString.isGrabbed = true;
        }
    };

    const handleMove = (e) => {
        if (draggedString) {
            mouse = getPos(e);
        }
    };

    const handleUp = () => {
        if (draggedString) {
            draggedString.isGrabbed = false;
            // Calculate pull distance for volume
            let pullDist = draggedString.cx - draggedString.baseCx;
            draggedString.pluck(pullDist);
            draggedString = null;
        }
    };

    // Mouse
    canvas.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    canvas.addEventListener('mouseleave', handleUp);

    // Touch
    canvas.addEventListener('touchstart', e => { e.preventDefault(); handleDown(e); });
    window.addEventListener('touchmove', e => { e.preventDefault(); handleMove(e); });
    window.addEventListener('touchend', handleUp);
    
    // UI Controls
    document.getElementById('stiffness-slider').addEventListener('input', (e) => {
        globalStiffness = parseFloat(e.target.value);
    });
    
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        if (masterGain) {
            masterGain.gain.value = parseFloat(e.target.value);
        }
    });
}

// Exposed to HTML UI
window.setWaveform = function(type, btnElement) {
    currentWaveform = type;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
};

// --- Render Loop ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw bridge/nut (top and bottom bars)
    if (strings.length > 0) {
        const topY = strings[0].y;
        const botY = strings[0].y + strings[0].length;
        
        ctx.fillStyle = '#222';
        ctx.fillRect(0, topY - 10, width, 10);
        ctx.fillRect(0, botY, width, 10);
        
        ctx.fillStyle = '#444';
        ctx.fillRect(0, topY - 5, width, 5);
        ctx.fillRect(0, botY, width, 5);
    }
    
    // Update and draw strings
    strings.forEach(s => {
        s.update();
        s.draw();
    });
}

function loop() {
    if (isPlaying) {
        draw();
    }
    requestAnimationFrame(loop);
}

// Start visual loop (audio waits for button)
init();