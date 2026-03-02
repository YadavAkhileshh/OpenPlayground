class Node {
    constructor(id, x, y, text = "New Node", color = "rgb(100, 180, 255)") {
        this.id = id;
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.radius = 30;
        this.isDragging = false;
    }

    contains(x, y) {
        const dist = Math.hypot(x - this.x, y - this.y);
        return dist <= this.radius;
    }

    draw(ctx) {
        // Draw shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = "transparent";

        // Draw border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw text
        ctx.fillStyle = "#000";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Wrap text if necessary
        const words = this.text.split(" ");
        const lines = [];
        let currentLine = "";

        for (let word of words) {
            const testLine = currentLine + (currentLine ? " " : "") + word;
            if (ctx.measureText(testLine).width < this.radius * 2 - 10) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeight = 12;
        const startY = this.y - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
            ctx.fillText(line, this.x, startY + i * lineHeight);
        });
    }
}

class Connection {
    constructor(fromId, toId) {
        this.fromId = fromId;
        this.toId = toId;
    }

    draw(ctx, fromNode, toNode) {
        if (!fromNode || !toNode) return;

        // Calculate control point for curved line
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.hypot(dx, dy);

        // Get points on circle edges
        const startX = fromNode.x + (dx / distance) * fromNode.radius;
        const startY = fromNode.y + (dy / distance) * fromNode.radius;
        const endX = toNode.x - (dx / distance) * toNode.radius;
        const endY = toNode.y - (dy / distance) * toNode.radius;

        // Control point
        const ctrlX = (startX + endX) / 2 + dy * 0.2;
        const ctrlY = (startY + endY) / 2 - dx * 0.2;

        // Draw connection line with gradient
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, "rgba(102, 126, 234, 0.6)");
        gradient.addColorStop(1, "rgba(240, 147, 251, 0.6)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.stroke();

        // Draw arrow at end
        const angle = Math.atan2(endY - ctrlY, endX - ctrlX);
        const arrowSize = 8;

        ctx.fillStyle = "rgba(102, 126, 234, 0.8)";
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }

    isNear(x, y, fromNode, toNode) {
        if (!fromNode || !toNode) return false;

        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.hypot(dx, dy);

        const startX = fromNode.x + (dx / distance) * fromNode.radius;
        const startY = fromNode.y + (dy / distance) * fromNode.radius;
        const endX = toNode.x - (dx / distance) * toNode.radius;
        const endY = toNode.y - (dy / distance) * toNode.radius;

        const ctrlX = (startX + endX) / 2 + dy * 0.2;
        const ctrlY = (startY + endY) / 2 - dx * 0.2;

        // Check distance to quadratic curve
        for (let t = 0; t <= 1; t += 0.05) {
            const t2 = 1 - t;
            const px = t2 * t2 * startX + 2 * t2 * t * ctrlX + t * t * endX;
            const py = t2 * t2 * startY + 2 * t2 * t * ctrlY + t * t * endY;
            const dist = Math.hypot(x - px, y - py);
            if (dist < 8) return true;
        }
        return false;
    }
}

class MindMapCreator {
    constructor() {
        this.canvas = document.getElementById("mindmapCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.selectedColor = "rgb(100, 180, 255)";
        this.nodeIdCounter = 0;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDraggingCanvas = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.isCreatingConnection = false;
        this.connectionStartNode = null;

        this.resizeCanvas();
        this.setupEventListeners();
        this.loadSampleData();
        this.animate();
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener("mousedown", (e) => this.onCanvasMouseDown(e));
        this.canvas.addEventListener("mousemove", (e) => this.onCanvasMouseMove(e));
        this.canvas.addEventListener("mouseup", (e) => this.onCanvasMouseUp(e));
        this.canvas.addEventListener("dblclick", (e) => this.onCanvasDblClick(e));
        this.canvas.addEventListener("contextmenu", (e) => this.onCanvasContextMenu(e));
        this.canvas.addEventListener("wheel", (e) => this.onCanvasWheel(e));

        // Button events
        document.getElementById("addNodeBtn").addEventListener("click", () => this.addNewNode());
        document.getElementById("deleteNodeBtn").addEventListener("click", () => this.deleteSelectedNode());
        document.getElementById("zoomInBtn").addEventListener("click", () => this.zoomIn());
        document.getElementById("zoomOutBtn").addEventListener("click", () => this.zoomOut());
        document.getElementById("resetZoomBtn").addEventListener("click", () => this.resetZoom());
        document.getElementById("exportJsonBtn").addEventListener("click", () => this.exportJSON());
        document.getElementById("importJsonBtn").addEventListener("click", () => this.importJSON());
        document.getElementById("exportPngBtn").addEventListener("click", () => this.exportPNG());
        document.getElementById("clearAllBtn").addEventListener("click", () => this.clearAll());
        document.getElementById("helpBtn").addEventListener("click", () => this.showHelp());

        // Color buttons
        document.querySelectorAll(".color-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => this.selectColor(e.currentTarget.dataset.color));
        });

        // Template selection
        document.getElementById("templateSelect").addEventListener("change", (e) => {
            this.loadTemplate(e.target.value);
        });

        // Modal events
        document.getElementById("closeModalBtn").addEventListener("click", () => this.closeNodeEditor());
        document.getElementById("saveNodeBtn").addEventListener("click", () => this.saveNodeEdit());
        document.getElementById("cancelNodeBtn").addEventListener("click", () => this.closeNodeEditor());

        document.getElementById("closeHelpBtn").addEventListener("click", () => this.closeHelp());
        document.getElementById("closeHelpConfirmBtn").addEventListener("click", () => this.closeHelp());

        document.getElementById("fileInput").addEventListener("change", (e) => this.handleFileInput(e));

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => this.onKeyDown(e));

        window.addEventListener("resize", () => this.resizeCanvas());
    }

    canvasToWorld(x, y) {
        return {
            x: (x - this.canvas.width / 2) / this.zoom - this.panX,
            y: (y - this.canvas.height / 2) / this.zoom - this.panY,
        };
    }

    worldToCanvas(x, y) {
        return {
            x: (x + this.panX) * this.zoom + this.canvas.width / 2,
            y: (y + this.panY) * this.zoom + this.canvas.height / 2,
        };
    }

    onCanvasMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const world = this.canvasToWorld(x, y);

        if (e.button === 0) {
            // Left click
            for (const node of this.nodes) {
                if (node.contains(world.x, world.y)) {
                    this.selectedNode = node;
                    node.isDragging = true;
                    return;
                }
            }

            // Check if clicking on connection
            for (const conn of this.connections) {
                const fromNode = this.nodes.find((n) => n.id === conn.fromId);
                const toNode = this.nodes.find((n) => n.id === conn.toId);
                if (conn.isNear(world.x, world.y, fromNode, toNode)) {
                    this.connections.splice(this.connections.indexOf(conn), 1);
                    return;
                }
            }

            this.selectedNode = null;
        } else if (e.button === 2) {
            // Right click for panning
            this.isDraggingCanvas = true;
            this.dragStartX = x;
            this.dragStartY = y;
        }
    }

    onCanvasMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const world = this.canvasToWorld(x, y);

        if (this.selectedNode && this.selectedNode.isDragging) {
            this.selectedNode.x = world.x;
            this.selectedNode.y = world.y;
        } else if (this.isDraggingCanvas) {
            const deltaX = x - this.dragStartX;
            const deltaY = y - this.dragStartY;
            this.panX -= deltaX / this.zoom;
            this.panY -= deltaY / this.zoom;
            this.dragStartX = x;
            this.dragStartY = y;
        }

        // Update cursor
        let hovering = false;
        for (const node of this.nodes) {
            if (node.contains(world.x, world.y)) {
                hovering = true;
                break;
            }
        }
        this.canvas.style.cursor = hovering ? "grab" : "default";
    }

    onCanvasMouseUp(e) {
        if (this.selectedNode) {
            this.selectedNode.isDragging = false;
        }
        this.isDraggingCanvas = false;
    }

    onCanvasDblClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const world = this.canvasToWorld(x, y);

        // Check if double-clicking a node
        for (const node of this.nodes) {
            if (node.contains(world.x, world.y)) {
                this.editNode(node);
                return;
            }
        }

        // Add new node at location
        this.addNodeAt(world.x, world.y);
    }

    onCanvasContextMenu(e) {
        e.preventDefault();
    }

    onCanvasWheel(e) {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const oldZoom = this.zoom;

        if (e.deltaY < 0) {
            this.zoom += zoomSpeed;
        } else {
            this.zoom -= zoomSpeed;
        }

        this.zoom = Math.max(0.1, Math.min(this.zoom, 3));

        // Adjust pan to zoom towards mouse
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.updateZoomDisplay();
    }

    onKeyDown(e) {
        if (e.key === "Delete" && this.selectedNode) {
            this.deleteSelectedNode();
        } else if (e.key === "Escape") {
            this.selectedNode = null;
        } else if (e.ctrlKey && e.key === "+") {
            e.preventDefault();
            this.zoomIn();
        } else if (e.ctrlKey && e.key === "-") {
            e.preventDefault();
            this.zoomOut();
        }
    }

    addNewNode() {
        const x = this.canvas.width / 2 / this.zoom - this.panX;
        const y = this.canvas.height / 2 / this.zoom - this.panY;
        this.addNodeAt(x, y);
    }

    addNodeAt(x, y) {
        const node = new Node(this.nodeIdCounter++, x, y, "New Idea", this.selectedColor);
        this.nodes.push(node);
        this.selectedNode = node;
        this.updateStats();
    }

    deleteSelectedNode() {
        if (!this.selectedNode) return;
        const index = this.nodes.indexOf(this.selectedNode);
        this.nodes.splice(index, 1);
        this.connections = this.connections.filter(
            (c) => c.fromId !== this.selectedNode.id && c.toId !== this.selectedNode.id
        );
        this.selectedNode = null;
        this.updateStats();
    }

    editNode(node) {
        this.selectedNode = node;
        document.getElementById("nodeTextField").value = node.text;
        document.getElementById("nodeColorInput").value = this.rgbToHex(node.color);
        document.getElementById("nodeEditorModal").classList.add("active");
    }

    saveNodeEdit() {
        if (!this.selectedNode) return;
        this.selectedNode.text = document.getElementById("nodeTextField").value;
        this.selectedNode.color = this.hexToRgb(document.getElementById("nodeColorInput").value);
        this.closeNodeEditor();
    }

    closeNodeEditor() {
        document.getElementById("nodeEditorModal").classList.remove("active");
    }

    selectColor(color) {
        this.selectedColor = color;
        document.querySelectorAll(".color-btn").forEach((btn) => {
            btn.classList.remove("active");
        });
        event.target.classList.add("active");
    }

    zoomIn() {
        this.zoom = Math.min(this.zoom + 0.2, 3);
        this.updateZoomDisplay();
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom - 0.2, 0.1);
        this.updateZoomDisplay();
    }

    resetZoom() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateZoomDisplay();
    }

    updateZoomDisplay() {
        document.getElementById("zoomLevel").textContent = Math.round(this.zoom * 100);
    }

    showHelp() {
        document.getElementById("helpModal").classList.add("active");
    }

    closeHelp() {
        document.getElementById("helpModal").classList.remove("active");
    }

    exportJSON() {
        const data = {
            nodes: this.nodes.map((n) => ({
                id: n.id,
                text: n.text,
                x: n.x,
                y: n.y,
                color: n.color,
            })),
            connections: this.connections.map((c) => ({
                fromId: c.fromId,
                toId: c.toId,
            })),
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mindmap-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importJSON() {
        document.getElementById("fileInput").click();
    }

    handleFileInput(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.nodes = data.nodes.map(
                    (n) => new Node(n.id, n.x, n.y, n.text, n.color)
                );
                this.connections = data.connections.map(
                    (c) => new Connection(c.fromId, c.toId)
                );
                this.nodeIdCounter = Math.max(...this.nodes.map((n) => n.id)) + 1;
                this.selectedNode = null;
                this.updateStats();
            } catch (error) {
                alert("Error loading file: " + error.message);
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    exportPNG() {
        // Create a new canvas with padding
        const padding = 50;
        const exportCanvas = document.createElement("canvas");
        const exportCtx = exportCanvas.getContext("2d");

        // Find bounds
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.nodes.forEach((n) => {
            minX = Math.min(minX, n.x - n.radius);
            maxX = Math.max(maxX, n.x + n.radius);
            minY = Math.min(minY, n.y - n.radius);
            maxY = Math.max(maxY, n.y + n.radius);
        });

        exportCanvas.width = maxX - minX + padding * 2;
        exportCanvas.height = maxY - minY + padding * 2;

        // Fill background
        exportCtx.fillStyle = "#1a1a2e";
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Draw connections
        this.connections.forEach((conn) => {
            const fromNode = this.nodes.find((n) => n.id === conn.fromId);
            const toNode = this.nodes.find((n) => n.id === conn.toId);

            if (fromNode && toNode) {
                const f = {
                    x: fromNode.x - minX + padding,
                    y: fromNode.y - minY + padding,
                };
                const t = {
                    x: toNode.x - minX + padding,
                    y: toNode.y - minY + padding,
                };

                conn.draw(exportCtx, 
                    { ...fromNode, x: f.x, y: f.y },
                    { ...toNode, x: t.x, y: t.y }
                );
            }
        });

        // Draw nodes
        this.nodes.forEach((node) => {
            const n = new Node(
                node.id,
                node.x - minX + padding,
                node.y - minY + padding,
                node.text,
                node.color
            );
            n.draw(exportCtx);
        });

        // Download
        const link = document.createElement("a");
        link.href = exportCanvas.toDataURL();
        link.download = `mindmap-${Date.now()}.png`;
        link.click();
    }

    clearAll() {
        if (confirm("Are you sure you want to clear the entire mind map?")) {
            this.nodes = [];
            this.connections = [];
            this.selectedNode = null;
            this.updateStats();
        }
    }

    loadTemplate(templateName) {
        if (!templateName) return;

        this.nodes = [];
        this.connections = [];

        const templates = {
            brainstorm: [
                { text: "Main Topic", color: "rgb(100, 180, 255)" },
                { text: "Idea 1", color: "rgb(120, 255, 100)" },
                { text: "Idea 2", color: "rgb(255, 180, 100)" },
                { text: "Idea 3", color: "rgb(255, 100, 100)" },
            ],
            planning: [
                { text: "Project", color: "rgb(100, 180, 255)" },
                { text: "Planning", color: "rgb(120, 255, 100)" },
                { text: "Execution", color: "rgb(255, 180, 100)" },
                { text: "Review", color: "rgb(200, 150, 255)" },
            ],
            learning: [
                { text: "Subject", color: "rgb(100, 180, 255)" },
                { text: "Fundamentals", color: "rgb(120, 255, 100)" },
                { text: "Advanced", color: "rgb(255, 180, 100)" },
                { text: "Practice", color: "rgb(200, 150, 255)" },
            ],
            problem: [
                { text: "Problem", color: "rgb(255, 100, 100)" },
                { text: "Root Causes", color: "rgb(255, 180, 100)" },
                { text: "Solutions", color: "rgb(120, 255, 100)" },
                { text: "Implementation", color: "rgb(100, 180, 255)" },
            ],
        };

        const template = templates[templateName];
        if (!template) return;

        const centerX = 0;
        const centerY = 0;
        const radius = 200;

        template.forEach((item, index) => {
            const angle = (index / template.length) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const node = new Node(this.nodeIdCounter++, x, y, item.text, item.color);
            this.nodes.push(node);
        });

        this.updateStats();
    }

    updateStats() {
        // Calculate stats
        const nodeCount = this.nodes.length;
        const connectionCount = this.connections.length;

        // Calculate max depth (simplified)
        let maxDepth = 0;
        if (this.nodes.length > 0) {
            const visited = new Set();
            const dfs = (nodeId, depth) => {
                visited.add(nodeId);
                maxDepth = Math.max(maxDepth, depth);
                const outgoing = this.connections.filter((c) => c.fromId === nodeId);
                outgoing.forEach((c) => {
                    if (!visited.has(c.toId)) {
                        dfs(c.toId, depth + 1);
                    }
                });
            };
            dfs(this.nodes[0].id, 1);
        }

        document.getElementById("statsNodes").textContent = nodeCount;
        document.getElementById("statsConnections").textContent = connectionCount;
        document.getElementById("statsDepth").textContent = maxDepth;
    }

    loadSampleData() {
        // Load a sample mind map
        const sampleData = {
            nodes: [
                { id: 0, text: "Learning", x: 0, y: 0, color: "rgb(100, 180, 255)" },
                { id: 1, text: "Frontend", x: -200, y: -100, color: "rgb(120, 255, 100)" },
                { id: 2, text: "Backend", x: -200, y: 100, color: "rgb(255, 180, 100)" },
                { id: 3, text: "JavaScript", x: -400, y: -150, color: "rgb(200, 150, 255)" },
                { id: 4, text: "CSS", x: -400, y: -50, color: "rgb(200, 150, 255)" },
                { id: 5, text: "Node.js", x: -400, y: 50, color: "rgb(255, 100, 100)" },
            ],
            connections: [
                { fromId: 0, toId: 1 },
                { fromId: 0, toId: 2 },
                { fromId: 1, toId: 3 },
                { fromId: 1, toId: 4 },
                { fromId: 2, toId: 5 },
            ],
        };

        this.nodes = sampleData.nodes.map(
            (n) => new Node(n.id, n.x, n.y, n.text, n.color)
        );
        this.connections = sampleData.connections.map(
            (c) => new Connection(c.fromId, c.toId)
        );
        this.nodeIdCounter = 6;
        this.updateStats();
    }

    rgbToHex(rgb) {
        const match = rgb.match(/\d+/g);
        if (!match || match.length !== 3) return "#000000";
        return (
            "#" +
            match
                .map((x) => {
                    const hex = parseInt(x).toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")
                .toUpperCase()
        );
    }

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    animate() {
        // Clear canvas
        this.ctx.fillStyle = "#1a1a2e";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context state
        this.ctx.save();

        // Apply transformations
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(this.panX, this.panY);

        // Draw grid (optional)
        this.drawGrid();

        // Draw connections
        this.connections.forEach((conn) => {
            const fromNode = this.nodes.find((n) => n.id === conn.fromId);
            const toNode = this.nodes.find((n) => n.id === conn.toId);
            if (fromNode && toNode) {
                conn.draw(this.ctx, fromNode, toNode);
            }
        });

        // Draw nodes
        this.nodes.forEach((node) => {
            const isSelected = node === this.selectedNode;
            if (isSelected) {
                // Draw selection indicator
                this.ctx.strokeStyle = "rgba(240, 147, 251, 0.8)";
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            node.draw(this.ctx);
        });

        // Restore context state
        this.ctx.restore();

        requestAnimationFrame(() => this.animate());
    }

    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = "rgba(102, 126, 234, 0.1)";
        this.ctx.lineWidth = 0.5;

        const startX = Math.floor((-this.canvas.width / 2 / this.zoom - this.panX) / gridSize) * gridSize;
        const endX = Math.ceil((this.canvas.width / 2 / this.zoom - this.panX) / gridSize) * gridSize;
        const startY = Math.floor((-this.canvas.height / 2 / this.zoom - this.panY) / gridSize) * gridSize;
        const endY = Math.ceil((this.canvas.height / 2 / this.zoom - this.panY) / gridSize) * gridSize;

        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }

        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
    }
}

// Initialize the mind map creator
window.addEventListener("load", () => {
    new MindMapCreator();
});
