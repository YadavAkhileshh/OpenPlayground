// --- DOM Elements ---
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const btnMic = document.getElementById('btnMic');
const statusText = document.getElementById('statusText');
const transcriptToast = document.getElementById('transcriptToast');
const transcriptText = document.getElementById('transcriptText');

// --- Setup Canvas Resizing ---
function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call

// --- Speech Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (!SpeechRecognition) {
    statusText.innerText = "Speech API not supported. Please use Chrome/Edge.";
    btnMic.disabled = true;
    btnMic.style.background = "#555";
} else {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    // Events
    recognition.onstart = () => {
        btnMic.classList.add('listening');
        statusText.innerText = "Listening...";
        transcriptToast.classList.remove('hidden');
        transcriptText.innerText = "Listening...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptText.innerText = `"${transcript}"`;
        parseIntent(transcript.toLowerCase());
    };

    recognition.onerror = (event) => {
        statusText.innerText = `Error: ${event.error}`;
        transcriptToast.classList.add('hidden');
    };

    recognition.onend = () => {
        btnMic.classList.remove('listening');
        statusText.innerText = "Click mic to activate AI";
        setTimeout(() => transcriptToast.classList.add('hidden'), 3000);
    };

    btnMic.addEventListener('click', () => {
        try {
            recognition.start();
        } catch (e) {
            // Failsafe if already started
            recognition.stop();
        }
    });
}

// --- Custom NLP Parsing Engine ---
function parseIntent(text) {
    console.log("Parsed Input:", text);

    // 1. UI Commands
    if (text.includes("dark mode") || text.includes("dark theme")) {
        document.body.className = "dark-mode";
        return;
    }
    if (text.includes("light mode") || text.includes("light theme")) {
        document.body.className = "light-mode";
        return;
    }
    if (text.includes("clear") || text.includes("erase")) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // 2. Drawing Commands
    if (text.includes("draw") || text.includes("create") || text.includes("make")) {
        // Extract Color (Fallback to purple)
        const colors = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "cyan", "magenta"];
        let selectedColor = "#8b5cf6"; // Default accent
        for (let color of colors) {
            if (text.includes(color)) {
                selectedColor = color;
                break;
            }
        }

        // Extract Size
        let size = 50; // default radius/width
        if (text.includes("small") || text.includes("tiny")) size = 20;
        if (text.includes("large") || text.includes("big") || text.includes("huge")) size = 120;

        // Extract Shape
        let shape = "circle";
        if (text.includes("square") || text.includes("box")) shape = "square";
        if (text.includes("rectangle")) shape = "rectangle";
        if (text.includes("triangle")) shape = "triangle";

        // Execute drawing
        drawShape(shape, selectedColor, size);
    }
}

// --- Canvas Drawing Logic ---
function drawShape(shape, color, size) {
    // Generate random position within canvas bounds
    const margin = size + 10;
    const x = Math.max(margin, Math.random() * (canvas.width - margin * 2));
    const y = Math.max(margin, Math.random() * (canvas.height - margin * 2));

    ctx.fillStyle = color;
    ctx.beginPath();

    if (shape === "circle") {
        ctx.arc(x, y, size, 0, Math.PI * 2);
    }
    else if (shape === "square") {
        ctx.rect(x - size, y - size, size * 2, size * 2);
    }
    else if (shape === "rectangle") {
        ctx.rect(x - size * 1.5, y - size, size * 3, size * 2);
    }
    else if (shape === "triangle") {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x - size, y + size);
    }

    ctx.fill();
    ctx.closePath();

    // Add a stylish outline
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 4;
    ctx.stroke();
}