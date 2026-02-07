import NoteNode from './note-node.js';

export default class ConstellationManager {
    constructor(canvas, viewport) {
        this.canvas = canvas;
        this.viewport = viewport;
        this.svg = document.getElementById('constellation-svg');

        this.notes = [];
        this.connections = [];

        this.linkingSource = null;
        this.mousePos = { x: 0, y: 0 };
        this.storageKey = 'zenith_constellations';

        this.init();
    }

    init() {
        this.load();

        // Context Events
        this.viewport.container.addEventListener('dblclick', (e) => {
            if (e.target === this.viewport.container || e.target === this.canvas) {
                const worldPos = this.viewport.toWorld(e.clientX, e.clientY);
                this.addNote(worldPos.x, worldPos.y);
            }
        });

        this.canvas.addEventListener('node:request-link', (e) => this.handleLinkRequest(e.detail.id));
        this.canvas.addEventListener('node:click', (e) => this.handleNodeClick(e.detail.id));

        this.viewport.container.addEventListener('click', (e) => {
            if (this.linkingSource && (e.target === this.viewport.container || e.target === this.canvas)) {
                this.cancelLinking();
            }
        });

        this.linkingStatus = document.getElementById('linking-status');

        window.addEventListener('mousemove', (e) => {
            if (this.linkingSource) {
                const worldPos = this.viewport.toWorld(e.clientX, e.clientY);
                this.mousePos = worldPos;
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.linkingSource) {
                this.cancelLinking();
            }
        });

        this.updateLoop();
    }

    handleLinkRequest(id) {
        if (!this.linkingSource) {
            this.linkingSource = id;
            const node = this.notes.find(n => n.id === id);
            node.element.classList.add('linking-source');
            document.body.classList.add('is-linking'); // Added for CSS selection
            if (this.linkingStatus) this.linkingStatus.style.display = 'block';
        } else {
            if (this.linkingSource !== id) {
                this.createConnection(this.linkingSource, id);
            }
            this.cancelLinking();
        }
    }

    handleNodeClick(id) {
        if (this.linkingSource && this.linkingSource !== id) {
            this.createConnection(this.linkingSource, id);
            this.cancelLinking();
        }
    }

    cancelLinking() {
        if (this.linkingSource) {
            const node = this.notes.find(n => n.id === this.linkingSource);
            if (node) node.element.classList.remove('linking-source');
            this.linkingSource = null;
            document.body.classList.remove('is-linking');
            if (this.linkingStatus) this.linkingStatus.style.display = 'none';
        }
    }

    createConnection(id1, id2) {
        const exists = this.connections.some(c =>
            (c[0] === id1 && c[1] === id2) || (c[0] === id2 && c[1] === id1)
        );
        if (exists) return;
        this.connections.push([id1, id2]);
        this.save();
    }

    addNote(x, y, text = '', file = null) {
        const note = new NoteNode(null, { x, y, text, file }, (isDelete, id) => {
            if (isDelete) {
                this.notes = this.notes.filter(n => n.id !== id);
                this.connections = this.connections.filter(c => c[0] !== id && c[1] !== id);
            }
            this.save();
        }, this.viewport);

        this.notes.push(note);
        note.render(this.canvas);
        this.save();
    }

    updateLoop() {
        this.renderConnections();
        requestAnimationFrame(() => this.updateLoop());
    }

    renderConnections() {
        this.svg.innerHTML = '';

        // Permanent Links
        this.connections.forEach(([id1, id2]) => {
            const n1 = this.notes.find(n => n.id === id1);
            const n2 = this.notes.find(n => n.id === id2);

            if (n1 && n2) {
                const line = this.createLine(
                    n1.data.x + n1.element.offsetWidth / 2,
                    n1.data.y + n1.element.offsetHeight / 2,
                    n2.data.x + n2.element.offsetWidth / 2,
                    n2.data.y + n2.element.offsetHeight / 2,
                    "star-line"
                );
                this.svg.appendChild(line);
            }
        });

        // Linking Ghost Line
        if (this.linkingSource) {
            const node = this.notes.find(n => n.id === this.linkingSource);
            if (node) {
                const line = this.createLine(
                    node.data.x + node.element.offsetWidth / 2,
                    node.data.y + node.element.offsetHeight / 2,
                    this.mousePos.x,
                    this.mousePos.y,
                    "ghost-line"
                );
                this.svg.appendChild(line);
            }
        }
    }

    createLine(x1, y1, x2, y2, className) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("class", className);
        return line;
    }

    centerOnContent() {
        if (this.notes.length === 0) {
            this.viewport.reset();
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.notes.forEach(n => {
            minX = Math.min(minX, n.data.x);
            minY = Math.min(minY, n.data.y);
            maxX = Math.max(maxX, n.data.x + 200);
            maxY = Math.max(maxY, n.data.y + 100);
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        this.viewport.offset.x = window.innerWidth / 2 - centerX * this.viewport.scale;
        this.viewport.offset.y = window.innerHeight / 2 - centerY * this.viewport.scale;
        this.viewport.applyTransform();
    }

    save() {
        const data = {
            notes: this.notes.map(n => ({ id: n.id, data: n.data })),
            connections: this.connections
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    load() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            const data = JSON.parse(saved);
            const noteData = data.notes || [];
            this.connections = data.connections || [];

            noteData.forEach(item => {
                const note = new NoteNode(item.id, item.data, (isDelete, id) => {
                    if (isDelete) {
                        this.notes = this.notes.filter(n => n.id !== id);
                        this.connections = this.connections.filter(c => c[0] !== id && c[1] !== id);
                    }
                    this.save();
                }, this.viewport);
                this.notes.push(note);
                note.render(this.canvas);
            });
        }
    }
}
