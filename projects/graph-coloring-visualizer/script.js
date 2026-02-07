class Graph {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        this.isAnimating = false;
    }

    addNode(x, y) {
        const node = {
            id: this.nodes.length,
            x: x,
            y: y,
            color: null,
            neighbors: []
        };
        this.nodes.push(node);
        return node;
    }

    addEdge(node1, node2) {
        if (node1 !== node2 && !this.hasEdge(node1, node2)) {
            this.edges.push({ from: node1, to: node2 });
            node1.neighbors.push(node2);
            node2.neighbors.push(node1);
        }
    }

    hasEdge(node1, node2) {
        return this.edges.some(edge =>
            (edge.from === node1 && edge.to === node2) ||
            (edge.from === node2 && edge.to === node1)
        );
    }

    clear() {
        this.nodes = [];
        this.edges = [];
    }

    resetColors() {
        this.nodes.forEach(node => node.color = null);
    }

    getChromaticNumber() {
        // Simple approximation - in practice, this is NP-hard
        return Math.max(...this.nodes.map(node => node.neighbors.length + 1));
    }

    async greedyColoring(delay = 500) {
        this.isAnimating = true;
        this.resetColors();

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const usedColors = new Set();

            // Check colors of neighbors
            node.neighbors.forEach(neighbor => {
                if (neighbor.color !== null) {
                    usedColors.add(neighbor.color);
                }
            });

            // Find first unused color
            let colorIndex = 0;
            while (usedColors.has(this.colors[colorIndex])) {
                colorIndex++;
            }

            node.color = this.colors[colorIndex];
            updateGraphInfo();
            await this.sleep(delay);
        }

        this.isAnimating = false;
    }

    async backtrackingColoring(delay = 500) {
        this.isAnimating = true;
        this.resetColors();

        const result = await this.backtrack(0, delay);
        if (!result) {
            alert('No valid coloring found with available colors!');
        }

        this.isAnimating = false;
        return result;
    }

    async backtrack(nodeIndex, delay) {
        if (nodeIndex === this.nodes.length) {
            return true; // All nodes colored
        }

        const node = this.nodes[nodeIndex];

        for (let colorIndex = 0; colorIndex < this.colors.length; colorIndex++) {
            const color = this.colors[colorIndex];

            if (this.isValidColor(node, color)) {
                node.color = color;
                updateGraphInfo();

                // Highlight current node
                highlightNode(node, true);
                await this.sleep(delay);

                if (await this.backtrack(nodeIndex + 1, delay)) {
                    highlightNode(node, false);
                    return true;
                }

                // Backtrack
                node.color = null;
                highlightNode(node, false);
                await this.sleep(delay / 2);
            }
        }

        return false;
    }

    isValidColor(node, color) {
        return !node.neighbors.some(neighbor => neighbor.color === color);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    loadPreset(preset) {
        this.clear();

        switch (preset) {
            case 1: // Triangle
                const n1 = this.addNode(200, 200);
                const n2 = this.addNode(400, 200);
                const n3 = this.addNode(300, 350);
                this.addEdge(n1, n2);
                this.addEdge(n2, n3);
                this.addEdge(n3, n1);
                break;
            case 2: // Square
                const s1 = this.addNode(200, 200);
                const s2 = this.addNode(400, 200);
                const s3 = this.addNode(400, 400);
                const s4 = this.addNode(200, 400);
                this.addEdge(s1, s2);
                this.addEdge(s2, s3);
                this.addEdge(s3, s4);
                this.addEdge(s4, s1);
                break;
            case 3: // Complete Graph K4
                const k1 = this.addNode(250, 200);
                const k2 = this.addNode(450, 200);
                const k3 = this.addNode(350, 350);
                const k4 = this.addNode(350, 100);
                [k1, k2, k3, k4].forEach((node, i) => {
                    [k1, k2, k3, k4].forEach((other, j) => {
                        if (i !== j) this.addEdge(node, other);
                    });
                });
                break;
            case 4: // Bipartite Graph
                const b1 = this.addNode(200, 200);
                const b2 = this.addNode(200, 300);
                const b3 = this.addNode(400, 200);
                const b4 = this.addNode(400, 300);
                const b5 = this.addNode(300, 150);
                this.addEdge(b1, b3);
                this.addEdge(b1, b4);
                this.addEdge(b2, b3);
                this.addEdge(b2, b4);
                this.addEdge(b3, b5);
                this.addEdge(b4, b5);
                break;
            case 5: // Planar Graph
                const p1 = this.addNode(300, 150);
                const p2 = this.addNode(200, 250);
                const p3 = this.addNode(400, 250);
                const p4 = this.addNode(150, 350);
                const p5 = this.addNode(250, 350);
                const p6 = this.addNode(350, 350);
                const p7 = this.addNode(450, 350);
                this.addEdge(p1, p2);
                this.addEdge(p1, p3);
                this.addEdge(p2, p3);
                this.addEdge(p2, p4);
                this.addEdge(p2, p5);
                this.addEdge(p3, p5);
                this.addEdge(p3, p6);
                this.addEdge(p3, p7);
                this.addEdge(p4, p5);
                this.addEdge(p5, p6);
                this.addEdge(p6, p7);
                break;
        }

        updateGraphInfo();
    }
}

// Global variables
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const graph = new Graph();

let mode = 'addNode';
let selectedNode = null;
let isDragging = false;

// Event listeners
document.getElementById('addNodeBtn').addEventListener('click', () => mode = 'addNode');
document.getElementById('addEdgeBtn').addEventListener('click', () => mode = 'addEdge');
document.getElementById('clearBtn').addEventListener('click', () => {
    graph.clear();
    updateGraphInfo();
    draw();
});
document.getElementById('resetBtn').addEventListener('click', () => {
    graph.resetColors();
    updateGraphInfo();
    draw();
});

document.getElementById('greedyBtn').addEventListener('click', async () => {
    if (!graph.isAnimating) {
        await graph.greedyColoring(parseInt(document.getElementById('speedSlider').value));
        draw();
    }
});

document.getElementById('backtrackingBtn').addEventListener('click', async () => {
    if (!graph.isAnimating) {
        await graph.backtrackingColoring(parseInt(document.getElementById('speedSlider').value));
        draw();
    }
});

// Preset buttons
document.getElementById('preset1Btn').addEventListener('click', () => {
    graph.loadPreset(1);
    draw();
});
document.getElementById('preset2Btn').addEventListener('click', () => {
    graph.loadPreset(2);
    draw();
});
document.getElementById('preset3Btn').addEventListener('click', () => {
    graph.loadPreset(3);
    draw();
});
document.getElementById('preset4Btn').addEventListener('click', () => {
    graph.loadPreset(4);
    draw();
});
document.getElementById('preset5Btn').addEventListener('click', () => {
    graph.loadPreset(5);
    draw();
});

// Speed slider
document.getElementById('speedSlider').addEventListener('input', (e) => {
    document.getElementById('speedValue').textContent = e.target.value + 'ms';
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Canvas event listeners
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('click', handleClick);

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = getNodeAtPosition(x, y);
    if (clickedNode) {
        isDragging = true;
        selectedNode = clickedNode;
    }
}

function handleMouseMove(e) {
    if (isDragging && selectedNode) {
        const rect = canvas.getBoundingClientRect();
        selectedNode.x = e.clientX - rect.left;
        selectedNode.y = e.clientY - rect.top;
        draw();
    }
}

function handleMouseUp() {
    isDragging = false;
    selectedNode = null;
}

function handleClick(e) {
    if (isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'addNode') {
        graph.addNode(x, y);
        updateGraphInfo();
        draw();
    } else if (mode === 'addEdge') {
        const clickedNode = getNodeAtPosition(x, y);
        if (clickedNode) {
            if (!selectedNode) {
                selectedNode = clickedNode;
            } else if (selectedNode !== clickedNode) {
                graph.addEdge(selectedNode, clickedNode);
                selectedNode = null;
                updateGraphInfo();
                draw();
            }
        } else {
            selectedNode = null;
        }
    }
}

function getNodeAtPosition(x, y) {
    return graph.nodes.find(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 20;
    });
}

function highlightNode(node, highlight) {
    // This will be handled in the draw function
    node.highlighted = highlight;
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    graph.edges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(edge.from.x, edge.from.y);
        ctx.lineTo(edge.to.x, edge.to.y);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw nodes
    graph.nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);

        if (node.color) {
            ctx.fillStyle = node.color;
            ctx.fill();
        } else {
            ctx.fillStyle = '#fff';
            ctx.fill();
        }

        ctx.strokeStyle = node.highlighted ? '#ff0000' : '#333';
        ctx.lineWidth = node.highlighted ? 3 : 2;
        ctx.stroke();

        // Draw node label
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.id.toString(), node.x, node.y + 5);
    });

    // Draw temporary edge when adding edges
    if (mode === 'addEdge' && selectedNode) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(selectedNode.x, selectedNode.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = '#999';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function updateGraphInfo() {
    document.getElementById('nodeCount').textContent = graph.nodes.length;
    document.getElementById('edgeCount').textContent = graph.edges.length;
    document.getElementById('chromaticNumber').textContent = graph.getChromaticNumber();
    document.getElementById('colorsUsed').textContent = new Set(graph.nodes.map(n => n.color).filter(c => c)).size;
}

// Initialize
draw();
updateGraphInfo();
