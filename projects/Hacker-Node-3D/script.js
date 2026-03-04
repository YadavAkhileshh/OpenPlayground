/**
 * Hacker Node 3D Engine
 * Implements a custom lightweight 3D projection engine and graph traversal logic.
 */

const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const FOV = 400;
const VIEWER_DIST = 600;
const NODE_RADIUS = 8;
const HIT_RADIUS = 20;

// --- State ---
let width, height;
let nodes = [];
let edges = [];
let path = []; // Array of visited node IDs

let rotX = -0.5;
let rotY = 0.5;
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let mouse2D = { x: 0, y: 0 }; // Current mouse for hover effects

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    generateGraph();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function generateGraph() {
    nodes = [];
    edges = [];
    path = [];
    updateUI();

    // Generate a 3D Cube (8 Vertices)
    const s = 150; // Size/Scale
    const coords = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s, s],  [s, -s, s],  [s, s, s],  [-s, s, s]
    ];

    coords.forEach((c, i) => {
        nodes.push({ id: i, x: c[0], y: c[1], z: c[2] });
    });

    // Define edges for a cube (connect nodes that share 2 dimensions)
    const edgePairs = [
        [0,1], [1,2], [2,3], [3,0], // Front face
        [4,5], [5,6], [6,7], [7,4], // Back face
        [0,4], [1,5], [2,6], [3,7]  // Connectors
    ];

    edgePairs.forEach(pair => {
        edges.push({ n1: pair[0], n2: pair[1] });
    });
}

// --- 3D Engine & Math ---

function rotate3D(x, y, z, pitch, yaw) {
    // 1. Rotate around Y axis (Yaw)
    let cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    let x1 = x * cosY - z * sinY;
    let z1 = z * cosY + x * sinY;
    
    // 2. Rotate around X axis (Pitch)
    let cosX = Math.cos(pitch), sinX = Math.sin(pitch);
    let y2 = y * cosX - z1 * sinX;
    let z2 = z1 * cosX + y * sinX;
    
    return { x: x1, y: y2, z: z2 };
}

// 
function project3D(x, y, z) {
    let scale = FOV / (VIEWER_DIST + z);
    return {
        x: x * scale + width / 2,
        y: y * scale + height / 2,
        scale: scale,
        zDepth: z // Used for depth sorting (painter's algorithm)
    };
}

// --- Game Logic ---

function handleNodeClick(mouseX, mouseY) {
    if (document.getElementById('access-granted').classList.contains('hidden') === false) return;

    // Find clicked node in projected 2D space
    let clickedNode = null;
    let minZ = Infinity; // Find the closest node to the camera

    nodes.forEach(node => {
        let p = project3D(node.rotX, node.rotY, node.rotZ);
        let dist = Math.hypot(p.x - mouseX, p.y - mouseY);
        
        if (dist < HIT_RADIUS && p.zDepth < minZ) {
            minZ = p.zDepth;
            clickedNode = node;
        }
    });

    if (clickedNode) {
        processNodeSelection(clickedNode);
    }
}

function processNodeSelection(node) {
    // If path is empty, start here
    if (path.length === 0) {
        path.push(node.id);
        updateUI();
        return;
    }

    // Check if node is already visited
    if (path.includes(node.id)) return;

    // Check if node is connected to the last node in the path
    const lastNodeId = path[path.length - 1];
    const isConnected = edges.some(e => 
        (e.n1 === lastNodeId && e.n2 === node.id) || 
        (e.n2 === lastNodeId && e.n1 === node.id)
    );

    if (isConnected) {
        path.push(node.id);
        updateUI();
        checkWinCondition();
    }
}

function checkWinCondition() {
    if (path.length === nodes.length) {
        document.getElementById('access-granted').classList.remove('hidden');
    }
}

function resetPath() {
    path = [];
    updateUI();
}

function nextLevel() {
    document.getElementById('access-granted').classList.add('hidden');
    resetPath();
    // For a full game, generate a more complex graph here (e.g., Dodecahedron)
    // For this prototype, we just scramble rotation and reset
    rotX = (Math.random() - 0.5) * Math.PI;
    rotY = (Math.random() - 0.5) * Math.PI;
}

function updateUI() {
    document.getElementById('node-count').innerText = `${path.length}/${nodes.length}`;
}

// --- Input Handling ---

function setupInput() {
    // Mouse Drag (Rotation)
    canvas.addEventListener('mousedown', e => {
        isDragging = true;
        lastMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse2D = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        if (isDragging) {
            let deltaX = e.clientX - lastMouse.x;
            let deltaY = e.clientY - lastMouse.y;
            
            rotY += deltaX * 0.01;
            rotX -= deltaY * 0.01;
            
            lastMouse = { x: e.clientX, y: e.clientY };
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Click (Node Selection)
    canvas.addEventListener('click', e => {
        if (!isDragging) {
            const rect = canvas.getBoundingClientRect();
            handleNodeClick(e.clientX - rect.left, e.clientY - rect.top);
        }
    });
    
    // Touch Support
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        isDragging = true;
        lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    window.addEventListener('touchmove', e => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        mouse2D = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        
        if (isDragging) {
            let deltaX = e.touches[0].clientX - lastMouse.x;
            let deltaY = e.touches[0].clientY - lastMouse.y;
            rotY += deltaX * 0.01;
            rotX -= deltaY * 0.01;
            lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    });
    window.addEventListener('touchend', e => {
        isDragging = false;
        // Simple touch click detection could go here, but omitted for brevity
    });
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Calculate 3D rotations for all nodes
    nodes.forEach(n => {
        let rotated = rotate3D(n.x, n.y, n.z, rotX, rotY);
        n.rotX = rotated.x;
        n.rotY = rotated.y;
        n.rotZ = rotated.z;
    });

    // 2. Draw Edges
    ctx.lineWidth = 2;
    edges.forEach(e => {
        let n1 = nodes.find(n => n.id === e.n1);
        let n2 = nodes.find(n => n.id === e.n2);
        
        let p1 = project3D(n1.rotX, n1.rotY, n1.rotZ);
        let p2 = project3D(n2.rotX, n2.rotY, n2.rotZ);

        // Determine if edge is part of the player's path
        let isPath = false;
        for (let i = 0; i < path.length - 1; i++) {
            if ((path[i] === e.n1 && path[i+1] === e.n2) || 
                (path[i] === e.n2 && path[i+1] === e.n1)) {
                isPath = true;
                break;
            }
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        
        if (isPath) {
            ctx.strokeStyle = '#0ff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#0ff';
        } else {
            // Faint grid lines, depth fade
            const depthAlpha = Math.max(0.1, 1 - (n1.rotZ + n2.rotZ + 300) / 600);
            ctx.strokeStyle = `rgba(0, 255, 0, ${depthAlpha * 0.5})`;
            ctx.shadowBlur = 0;
        }
        ctx.stroke();
    });

    // 3. Draw Nodes (Depth Sorted)
    let projectedNodes = nodes.map(n => {
        let p = project3D(n.rotX, n.rotY, n.rotZ);
        p.id = n.id;
        return p;
    });
    
    // Sort so closest nodes (lower Z) are drawn last (on top)
    projectedNodes.sort((a, b) => b.zDepth - a.zDepth);

    projectedNodes.forEach(p => {
        const isVisited = path.includes(p.id);
        const isCurrent = path.length > 0 && path[path.length - 1] === p.id;
        const isHovered = Math.hypot(p.x - mouse2D.x, p.y - mouse2D.y) < HIT_RADIUS;

        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_RADIUS * p.scale, 0, Math.PI * 2);
        
        if (isCurrent) {
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#0ff';
        } else if (isVisited) {
            ctx.fillStyle = '#0ff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#0ff';
        } else if (isHovered) {
            ctx.fillStyle = '#0f0';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#0f0';
        } else {
            const depthAlpha = Math.max(0.2, 1 - (p.zDepth + 150) / 300);
            ctx.fillStyle = `rgba(0, 150, 0, ${depthAlpha})`;
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
    });
    ctx.shadowBlur = 0; // Reset
}

function loop() {
    draw();
    requestAnimationFrame(loop);
}

// Start
init();