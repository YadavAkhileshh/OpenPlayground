// --- DOM Elements ---
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const onionSkin = document.getElementById('onionSkin');
const playbackScreen = document.getElementById('playbackScreen');
const framesContainer = document.getElementById('framesContainer');
const frameCountDisplay = document.getElementById('frameCount');

const btnAddFrame = document.getElementById('btnAddFrame');
const btnPlay = document.getElementById('btnPlay');
const btnStop = document.getElementById('btnStop');
const btnClear = document.getElementById('btnClear');
const btnEraser = document.getElementById('btnEraser');

const colorBtns = document.querySelectorAll('.color-btn');
const brushSizeSlider = document.getElementById('brushSize');
const fpsSlider = document.getElementById('fpsSlider');
const fpsValueDisplay = document.getElementById('fpsValue');
const onionSkinToggle = document.getElementById('onionSkinToggle');

// --- State ---
let frames = [];
let activeFrameIndex = -1;
let isDrawing = false;
let isPlaying = false;
let playInterval;

// Brush State
let brushColor = '#ffffff';
let brushSize = 5;
let isEraser = false;

// --- Canvas Drawing Logic ---
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function startDrawing(e) {
    if (isPlaying) return;
    isDrawing = true;
    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
}

function draw(e) {
    if (!isDrawing || isPlaying) return;
    const pos = getPointerPos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = isEraser ? '#111111' : brushColor; // Matches canvas bg color
    ctx.lineWidth = brushSize;
    ctx.stroke();
    e.preventDefault();
}

function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
}

// Events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, {passive: false});
canvas.addEventListener('touchmove', draw, {passive: false});
canvas.addEventListener('touchend', stopDrawing);

// --- Toolbar Logic ---
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        isEraser = false;
        btnEraser.classList.remove('active');
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        brushColor = btn.getAttribute('data-color');
    });
});

brushSizeSlider.addEventListener('input', (e) => brushSize = e.target.value);

btnEraser.addEventListener('click', () => {
    isEraser = true;
    colorBtns.forEach(b => b.classList.remove('active'));
    btnEraser.classList.add('active');
});

btnClear.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

onionSkinToggle.addEventListener('change', updateOnionSkin);

// --- Frame Management ---
btnAddFrame.addEventListener('click', () => {
    // 1. Save current canvas as Data URL
    const frameData = canvas.toDataURL('image/png');
    
    // 2. Push to array
    frames.push(frameData);
    activeFrameIndex = frames.length - 1;
    
    // 3. Clear canvas for next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    renderTimeline();
    updateOnionSkin();
});

function loadFrame(index) {
    if (index < 0 || index >= frames.length) return;
    activeFrameIndex = index;
    
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = frames[index];
    
    renderTimeline();
    updateOnionSkin();
}

function deleteFrame(index, e) {
    e.stopPropagation();
    frames.splice(index, 1);
    
    if (frames.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeFrameIndex = -1;
    } else {
        activeFrameIndex = Math.max(0, index - 1);
        loadFrame(activeFrameIndex);
    }
    
    renderTimeline();
    updateOnionSkin();
}

function updateOnionSkin() {
    if (onionSkinToggle.checked && frames.length > 0 && !isPlaying) {
        // Show the last saved frame as onion skin
        const targetIndex = frames.length - 1;
        onionSkin.style.backgroundImage = `url(${frames[targetIndex]})`;
    } else {
        onionSkin.style.backgroundImage = 'none';
    }
}

// --- Timeline UI ---
function renderTimeline() {
    frameCountDisplay.innerText = frames.length;
    framesContainer.innerHTML = '';
    
    frames.forEach((dataUrl, index) => {
        const thumb = document.createElement('div');
        thumb.className = `frame-thumb ${index === activeFrameIndex ? 'active' : ''}`;
        thumb.style.backgroundImage = `url(${dataUrl})`;
        thumb.onclick = () => loadFrame(index);
        
        thumb.innerHTML = `
            <span class="frame-number">${index + 1}</span>
            <button class="btn-delete" onclick="deleteFrame(${index}, event)">&times;</button>
        `;
        framesContainer.appendChild(thumb);
    });

    // Auto-scroll timeline to end
    framesContainer.scrollLeft = framesContainer.scrollWidth;
}

// --- Playback Engine ---
fpsSlider.addEventListener('input', (e) => fpsValueDisplay.innerText = e.target.value);

btnPlay.addEventListener('click', () => {
    if (frames.length === 0) return;
    
    isPlaying = true;
    btnPlay.classList.add('hidden');
    btnStop.classList.remove('hidden');
    
    canvas.classList.add('hidden');
    onionSkin.style.display = 'none';
    playbackScreen.classList.remove('hidden');
    
    let playIndex = 0;
    const fps = parseInt(fpsSlider.value);
    const intervalTime = 1000 / fps;
    
    playInterval = setInterval(() => {
        playbackScreen.src = frames[playIndex];
        playIndex = (playIndex + 1) % frames.length;
    }, intervalTime);
});

btnStop.addEventListener('click', () => {
    isPlaying = false;
    clearInterval(playInterval);
    
    btnStop.classList.add('hidden');
    btnPlay.classList.remove('hidden');
    
    playbackScreen.classList.add('hidden');
    canvas.classList.remove('hidden');
    onionSkin.style.display = 'block';
    updateOnionSkin();
    
    // Restore the canvas to the last active frame we were editing
    if (activeFrameIndex !== -1) {
        loadFrame(activeFrameIndex);
    } else {
        ctx.clearRect(0,0, canvas.width, canvas.height);
    }
});