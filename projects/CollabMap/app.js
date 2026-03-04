// CollabMap - Collaborative Mind Map
// ...existing code...
const mindmapCanvas = document.getElementById('mindmap-canvas');
const addNodeBtn = document.getElementById('add-node');
const exportBtn = document.getElementById('export-map');
let nodes = [];
let nodeId = 0;

addNodeBtn.addEventListener('click', function() {
    const node = {
        id: nodeId++,
        x: 50 + Math.random() * 300,
        y: 50 + Math.random() * 200,
        text: 'New Node'
    };
    nodes.push(node);
    renderNodes();
});

function renderNodes() {
    mindmapCanvas.innerHTML = '';
    nodes.forEach((node, idx) => {
        const div = document.createElement('div');
        div.className = 'mindmap-node';
        div.style.left = node.x + 'px';
        div.style.top = node.y + 'px';
        div.textContent = node.text;
        div.draggable = true;
        div.addEventListener('dragstart', e => {
            e.dataTransfer.setData('id', node.id);
            e.dataTransfer.setData('offsetX', e.offsetX);
            e.dataTransfer.setData('offsetY', e.offsetY);
        });
        div.addEventListener('dblclick', () => {
            const newText = prompt('Edit node text:', node.text);
            if (newText !== null) {
                node.text = newText;
                renderNodes();
            }
        });
        mindmapCanvas.appendChild(div);
    });
}

mindmapCanvas.addEventListener('dragover', e => e.preventDefault());
mindmapCanvas.addEventListener('drop', function(e) {
    const id = +e.dataTransfer.getData('id');
    const offsetX = +e.dataTransfer.getData('offsetX');
    const offsetY = +e.dataTransfer.getData('offsetY');
    const node = nodes.find(n => n.id === id);
    if (node) {
        node.x = e.offsetX - offsetX;
        node.y = e.offsetY - offsetY;
        renderNodes();
    }
});



exportBtn.addEventListener('click', function() {
    alert('Export as image/PDF feature requires backend or canvas rendering.');
});

// Team Chat
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
