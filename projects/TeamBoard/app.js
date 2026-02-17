// TeamBoard - Real-Time Collaboration
// ...existing code...
// Whiteboard Drawing
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
let drawing = false;
canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);
canvas.addEventListener('mousemove', draw);
function draw(e) {
    if (!drawing) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#264653';
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}
document.getElementById('clear-board').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
});

// Sticky Notes
const stickyForm = document.getElementById('sticky-form');
const stickyNotes = document.getElementById('sticky-notes');
let notes = [];
stickyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const content = document.getElementById('sticky-content').value;
    notes.push(content);
    renderStickyNotes();
    stickyForm.reset();
});
function renderStickyNotes() {
    stickyNotes.innerHTML = '';
    notes.forEach((note, idx) => {
        const div = document.createElement('div');
        div.className = 'sticky';
        div.textContent = note;
        stickyNotes.appendChild(div);
    });
}

// File Uploads
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
fileInput.addEventListener('change', function() {
    fileList.innerHTML = '';
    Array.from(fileInput.files).forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.name;
        fileList.appendChild(li);
    });
});

// Live Chat
const chatForm = document.getElementById('chat-form');
const chatBox = document.getElementById('chat-box');
let messages = [];
chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const msg = document.getElementById('chat-message').value;
    messages.push(msg);
    renderChat();
    chatForm.reset();
});
function renderChat() {
    chatBox.innerHTML = '';
    messages.forEach(m => {
        const div = document.createElement('div');
        div.textContent = m;
        chatBox.appendChild(div);
    });
}
// Real-Time Sync Placeholder
// To implement real-time sync, backend integration (e.g., WebSocket) is required.
// ...existing code...
