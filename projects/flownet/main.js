// main.js
class FlowNet3D {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.scene = new Scene3D(this.canvas);

        this.nodes = [];
        this.links = [];
        this.packets = [];
        this.activePackets = new Set();

        this.isRunning = true;
        this.lastTime = 0;
        this.simulationSpeed = 1.0;

        this.packetSpawnTimer = 0;
        this.packetSpawnInterval = 300;

        this.failureEnabled = false;
        this.congestionEnabled = true;

        this.stats = {
            totalPackets: 0,
            deliveredPackets: 0,
            droppedPackets: 0,
            activePackets: 0
        };

        this.initNetwork();
        this.setupUI();
        this.animate();
    }

    initNetwork() {
        const nodeCount = 8;
        const radius = 300;

        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.5;
            const z = Math.sin(angle * 2) * 300 + (Math.random() - 0.5) * 100;

            const node = new NetworkNode(x, y, z);
            this.nodes.push(node);
            console.log(`Node ${i}: x=${x.toFixed(1)}, y=${y.toFixed(1)}, z=${z.toFixed(1)}`);
        }

        for (let i = 0; i < nodeCount; i++) {
            const node1 = this.nodes[i];
            const node2 = this.nodes[(i + 1) % nodeCount];
            const node3 = this.nodes[(i + 2) % nodeCount];

            const link1 = new NetworkLink(node1, node2);
            const link2 = new NetworkLink(node1, node3);

            this.links.push(link1, link2);
            node1.connectTo(node2, link1);
            node1.connectTo(node3, link2);
        }

        this.nodes.forEach(node => {
            node.connections = [...new Set(node.connections)];
        });
    }

    setupUI() {
        document.getElementById('playPause').addEventListener('click', () => {
            this.isRunning = !this.isRunning;
            const btn = document.getElementById('playPause');
            btn.innerHTML = this.isRunning ?
                '<span class="icon">⏸</span> Pause' :
                '<span class="icon">▶</span> Resume';
            btn.classList.toggle('primary', !this.isRunning);
        });

        document.getElementById('reset').addEventListener('click', () => this.reset());
        document.getElementById('addNode').addEventListener('click', () => this.addRandomNode());
        document.getElementById('removeNode').addEventListener('click', () => this.removeRandomNode());

        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        speedSlider.addEventListener('input', (e) => {
            this.simulationSpeed = parseFloat(e.target.value);
            speedValue.textContent = this.simulationSpeed.toFixed(1) + 'x';
        });

        document.getElementById('congestionToggle').addEventListener('change', (e) => {
            this.congestionEnabled = e.target.checked;
        });

        document.getElementById('failureToggle').addEventListener('change', (e) => {
            this.failureEnabled = e.target.checked;
            if (!this.failureEnabled) {
                this.nodes.forEach(node => node.recover());
                this.links.forEach(link => link.recover());
            }
        });

        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let clickedNode = null;
        let maxZ = -Infinity; // Find closest node (actually closest has SMALLEST depth, wait. Scale logic...)
        // Scene project returns 'depth' as Z distance. Smaller depth = Closer.
        // We want the node with smallest depth that is under mouse.
        // But let's check projection sort.
        // If sorting descending depth (furthest first), the last one drawn (closest) wins.
        // So we can just iterate all and whoever matches last overwrites (if they overlap).

        // Actually best to re-use the sorted render list, but for now simple loop is fine.
        let closestDepth = Infinity;

        for (const node of this.nodes) {
            const projected = this.scene.project(node.x, node.y, node.z);
            if (projected.visible && this.scene.isPointInNode({ ...projected, screenRadius: node.radius * projected.scale * this.scene.zoom }, mouseX, mouseY)) {
                if (projected.depth < closestDepth) {
                    closestDepth = projected.depth;
                    clickedNode = node;
                }
            }
        }

        if (clickedNode) {
            this.scene.selectedNode = clickedNode;
            clickedNode.selected = true;

            this.nodes.forEach(n => {
                if (n !== clickedNode) n.selected = false;
            });
        } else {
            this.scene.selectedNode = null;
            this.nodes.forEach(n => n.selected = false);
        }
    }

    handleCanvasHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let hoveredNode = null;
        let closestDepth = Infinity;

        for (const node of this.nodes) {
            const projected = this.scene.project(node.x, node.y, node.z);
            projected.screenRadius = node.radius * projected.scale * this.scene.zoom;

            if (projected.visible && this.scene.isPointInNode(projected, mouseX, mouseY)) {
                if (projected.depth < closestDepth) {
                    closestDepth = projected.depth;
                    hoveredNode = node;
                }
            }
        }

        this.scene.hoveredNode = hoveredNode;
        this.nodes.forEach(n => n.hovered = (n === hoveredNode));
    }

    addRandomNode() {
        const angle = Math.random() * Math.PI * 2;
        const radius = 200 + Math.random() * 300;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.6;
        const z = (Math.random() - 0.5) * 800;

        const newNode = new NetworkNode(x, y, z);
        this.nodes.push(newNode);

        if (this.nodes.length > 1) {
            const connections = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < connections; i++) {
                const targetNode = this.nodes[Math.floor(Math.random() * (this.nodes.length - 1))];
                if (targetNode && targetNode !== newNode) {
                    const link = new NetworkLink(newNode, targetNode);
                    this.links.push(link);
                    newNode.connectTo(targetNode, link);
                }
            }
        }

        this.updateStats();
    }

    removeRandomNode() {
        if (this.nodes.length <= 0) return;

        const index = Math.floor(Math.random() * this.nodes.length);
        const nodeToRemove = this.nodes[index];

        this.links = this.links.filter(link =>
            link.source !== nodeToRemove && link.target !== nodeToRemove
        );

        this.nodes.splice(index, 1);

        this.nodes.forEach(node => {
            node.connections = node.connections.filter(link =>
                link.source !== nodeToRemove && link.target !== nodeToRemove
            );
        });

        this.packets = this.packets.filter(packet =>
            packet.source !== nodeToRemove && packet.target !== nodeToRemove
        );

        this.updateStats();
    }

    spawnPacket() {
        if (this.nodes.length < 2) return;

        let source, target;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            source = this.nodes[Math.floor(Math.random() * this.nodes.length)];
            target = this.nodes[Math.floor(Math.random() * this.nodes.length)];
            attempts++;
        } while ((source === target || source.failed || target.failed) && attempts < maxAttempts);

        if (source && target && source !== target && !source.failed && !target.failed) {
            const packet = new NetworkPacket(source, target);
            if (source.addToQueue(packet)) {
                this.packets.push(packet);
                this.activePackets.add(packet);
                this.stats.totalPackets++;
            }
        }
    }

    update(deltaTime) {
        if (!this.isRunning) return;

        const scaledDelta = deltaTime * this.simulationSpeed;

        this.packetSpawnTimer += scaledDelta;
        if (this.packetSpawnTimer >= this.packetSpawnInterval) {
            this.spawnPacket();
            this.packetSpawnTimer = 0;
        }

        this.nodes.forEach(node => {
            node.processPackets(scaledDelta);

            if (this.failureEnabled && !node.failed && Math.random() < 0.0001 * this.simulationSpeed) {
                node.fail(3000 + Math.random() * 7000);
            }

            if (this.scene.mouse.isDragging && this.scene.mouse.draggedNode === node) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = this.scene.mouse.x - rect.left;
                const mouseY = this.scene.mouse.y - rect.top;
                
                const unprojected = this.scene.unproject(mouseX, mouseY, node.z);
                node.x = unprojected.x;
                node.y = unprojected.y;
            }
        });

        this.links.forEach(link => {
            link.update(scaledDelta);

            if (this.failureEnabled && !link.failed && Math.random() < 0.0002 * this.simulationSpeed) {
                link.fail(2000 + Math.random() * 5000);
            }
        });

        this.packets.forEach((packet, index) => {
            packet.update(scaledDelta);

            if (packet.delivered) {
                this.stats.deliveredPackets++;
                this.activePackets.delete(packet);
            } else if (packet.dropped) {
                this.stats.droppedPackets++;
                this.activePackets.delete(packet);
            }
        });

        this.packets = this.packets.filter(packet => !packet.delivered && !packet.dropped);
        this.stats.activePackets = this.activePackets.size;

        this.updateStats();
    }

    updateStats() {
        document.getElementById('nodeCount').textContent = this.nodes.length;
        document.getElementById('packetCount').textContent = this.stats.activePackets;

        const total = this.stats.deliveredPackets + this.stats.droppedPackets;
        const dropRate = total > 0 ? (this.stats.droppedPackets / total * 100) : 0;
        document.getElementById('dropRate').textContent = dropRate.toFixed(1) + '%';
    }

    render() {
        this.scene.beginFrame();

        const renderList = [];

        this.links.forEach(link => {
            const projFrom = this.scene.project(link.source.x, link.source.y, link.source.z);
            const projTo = this.scene.project(link.target.x, link.target.y, link.target.z);

            if (projFrom.visible && projTo.visible) {
                const avgDepth = (projFrom.depth + projTo.depth) / 2;

                renderList.push({
                    type: 'link',
                    depth: avgDepth,
                    draw: () => {
                        const isHovered = (
                            this.scene.hoveredNode &&
                            (link.source === this.scene.hoveredNode || link.target === this.scene.hoveredNode)
                        );
                        this.scene.drawConnectionProjected(projFrom, projTo, link.color, link.width, isHovered, link.congestion);
                    }
                });
            }
        });

        this.nodes.forEach(node => {
            const proj = this.scene.project(node.x, node.y, node.z);
            if (proj.visible) {
                proj.screenRadius = node.radius * proj.scale * this.scene.zoom;
                renderList.push({
                    type: 'node',
                    depth: proj.depth,
                    draw: () => {
                        this.scene.drawNodeProjected(
                            proj,
                            node.radius,
                            node.color,
                            `N${node.id}`,
                            node.state,
                            node.selected,
                            node.hovered,
                            node.queue.length
                        );
                    }
                });
            }
        });

        this.packets.forEach(packet => {
            const pos = packet.getPosition();
            if (pos) {
                const proj = this.scene.project(pos.x, pos.y, pos.z);
                if (proj.visible) {
                    renderList.push({
                        type: 'packet',
                        depth: proj.depth,
                        draw: () => {
                            this.scene.drawPacketProjected(
                                proj,
                                8,
                                packet.color
                            );
                        }
                    });
                }
            }
        });

        renderList.sort((a, b) => b.depth - a.depth);

        renderList.forEach(item => item.draw());
    }

    animate(timestamp = 0) {
        const deltaTime = timestamp - this.lastTime || 0;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((t) => this.animate(t));
    }

    reset() {
        this.nodes.forEach(node => node.reset());
        this.links.forEach(link => link.reset());
        this.packets = [];
        this.activePackets.clear();

        this.stats = {
            totalPackets: 0,
            deliveredPackets: 0,
            droppedPackets: 0,
            activePackets: 0
        };

        this.packetSpawnTimer = 0;
        this.updateStats();

        this.scene.selectedNode = null;
        this.scene.hoveredNode = null;
    }
}

window.addEventListener('load', () => {
    console.log('FlowNet3D initializing...');
    const app = new FlowNet3D();
    console.log('Nodes created:', app.nodes.length);
    console.log('Links created:', app.links.length);
});