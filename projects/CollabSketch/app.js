// CollabSketch - Collaborative Sketchpad
// ...existing code...
const canvas = document.getElementById('sketch-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let tool = 'pen';
let color = '#ffd166';
let size = 3;
let startX, startY;
let layers = [];
let currentLayer = null;

// Tool selection
const penTool = document.getElementById('pen-tool');
const rectTool = document.getElementById('rect-tool');
const circleTool = document.getElementById('circle-tool');
const textTool = document.getElementById('text-tool');
const colorPicker = document.getElementById('color-picker');
const sizePicker = document.getElementById('size-picker');
const imageUpload = document.getElementById('image-upload');
const exportBtn = document.getElementById('export-btn');
const layersList = document.getElementById('layers-list');

penTool.onclick = () => tool = 'pen';
rectTool.onclick = () => tool = 'rect';
circleTool.onclick = () => tool = 'circle';
textTool.onclick = () => tool = 'text';
colorPicker.oninput = e => color = e.target.value;
sizePicker.oninput = e => size = +e.target.value;

canvas.onmousedown = function(e) {
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    if (tool === 'text') {
        const text = prompt('Enter text:');
        if (text) {
            ctx.font = `${size * 6 + 10}px Segoe UI, Arial`;
            ctx.fillStyle = color;
            ctx.fillText(text, startX, startY);
            layers.push({ type: 'text', text, x: startX, y: startY, color, size });
            renderLayers();
        }
        drawing = false;
    }
};
canvas.onmouseup = function(e) {
    if (!drawing) return;
    drawing = false;
    const endX = e.offsetX, endY = e.offsetY;
    if (tool === 'pen') {
        // Pen handled in mousemove
    } else if (tool === 'rect') {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
        layers.push({ type: 'rect', x: startX, y: startY, w: endX - startX, h: endY - startY, color, size });
        renderLayers();
    } else if (tool === 'circle') {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.beginPath();
        const r = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        ctx.arc(startX, startY, r, 0, 2 * Math.PI);
        ctx.stroke();
        layers.push({ type: 'circle', x: startX, y: startY, r, color, size });
        renderLayers();
    }
};
canvas.onmousemove = function(e) {
    if (!drawing || tool !== 'pen') return;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    layers.push({ type: 'pen', x: e.offsetX, y: e.offsetY, color, size });
    renderLayers();
};
canvas.onmouseleave = () => { drawing = false; ctx.beginPath(); };

imageUpload.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0, img.width, img.height);
        layers.push({ type: 'image', img, x: 0, y: 0, w: img.width, h: img.height });
        renderLayers();
    };
    img.src = URL.createObjectURL(file);
};

exportBtn.onclick = function() {
    const link = document.createElement('a');
    link.download = 'collabsketch.png';
    link.href = canvas.toDataURL();
    link.click();
};

function renderLayers() {
    layersList.innerHTML = '';
    layers.forEach((layer, idx) => {
        const li = document.createElement('li');
        li.textContent = `${layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} Layer`;
        layersList.appendChild(li);
    });
}
// Real-Time Sync Placeholder
// To implement real-time sync, backend integration (e.g., WebSocket) is required.
// ...existing code...
