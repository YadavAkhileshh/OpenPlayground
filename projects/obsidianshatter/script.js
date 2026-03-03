// --- DOM Elements ---
const canvas = document.getElementById('doodleCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const btnClear = document.getElementById('btnClear');
const strokeWidthSlider = document.getElementById('strokeWidth');
const predictionList = document.getElementById('predictionList');
const loadingOverlay = document.getElementById('loadingOverlay');

// --- State & Setup ---
let isDrawing = false;
let model = null;

// Initialize Canvas Background (Must be white for AI to read properly, not transparent)
function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
clearCanvas();

// --- Load TensorFlow MobileNet Model ---
async function initAI() {
    try {
        // Load the pre-trained MobileNet model
        model = await mobilenet.load({ version: 2, alpha: 0.5 });
        loadingOverlay.classList.add('hidden');
    } catch (error) {
        console.error("Error loading model:", error);
        alert("Failed to load AI model. Check your internet connection.");
    }
}
initAI();

// --- Drawing Engine ---
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    // Scale handles CSS resizing of the canvas vs actual pixel dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);

    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#000000'; // Black ink
    ctx.lineWidth = strokeWidthSlider.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    e.preventDefault();
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.closePath();

    // Trigger AI prediction every time the user lifts the pen
    predictCanvas();
}

// Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

btnClear.addEventListener('click', () => {
    clearCanvas();
    resetPredictions();
});

// --- AI Prediction Logic ---
async function predictCanvas() {
    if (!model) return;

    // MobileNet expects a 224x224 RGB image. 
    // The classify method automatically handles the tensor conversion and resizing.
    const predictions = await model.classify(canvas, 3);

    updateUI(predictions);
}

function updateUI(predictions) {
    predictionList.innerHTML = ''; // Clear current

    predictions.forEach((pred, index) => {
        // Convert probability (0 to 1) to percentage
        const percent = Math.round(pred.probability * 100);

        // Clean up the label name (e.g., "coffee mug, mug" -> "Coffee Mug")
        const label = pred.className.split(',')[0];

        const item = document.createElement('div');
        item.className = 'prediction-item';

        // Dynamic color based on confidence
        let barColor = 'var(--accent)';
        if (index === 0 && percent > 50) barColor = '#10b981'; // Green if confident

        item.innerHTML = `
            <div class="pred-info">
                <span class="pred-label">${label}</span>
                <span class="pred-percent" style="color: ${barColor}">${percent}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%; background: ${barColor};"></div>
            </div>
        `;
        predictionList.appendChild(item);
    });
}

function resetPredictions() {
    predictionList.innerHTML = `
        <div class="prediction-item">
            <div class="pred-info">
                <span class="pred-label">Waiting for input...</span>
                <span class="pred-percent">0%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width: 0%"></div></div>
        </div>
    `;
}