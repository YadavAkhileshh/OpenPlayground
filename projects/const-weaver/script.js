
class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    dist(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
}

class DisjointSet {
    constructor(size) {
        this.parent = new Array(size).fill(0).map((_, i) => i);
        this.rank = new Array(size).fill(0);
        this.components = size;
    }
    find(i) {
        if (this.parent[i] === i) return i;
        // Path compression
        return this.parent[i] = this.find(this.parent[i]);
    }
    union(i, j) {
        let rootI = this.find(i);
        let rootJ = this.find(j);
        if (rootI !== rootJ) {
            // Union by rank
            if (this.rank[rootI] < this.rank[rootJ]) {
                this.parent[rootI] = rootJ;
            } else if (this.rank[rootI] > this.rank[rootJ]) {
                this.parent[rootJ] = rootI;
            } else {
                this.parent[rootJ] = rootI;
                this.rank[rootI]++;
            }
            this.components--;
            return true; 
        }
        return false; 
    }
}


function pointToLineDist(p, a, b) {
    let l2 = Math.pow(a.dist(b), 2);
    if (l2 === 0) return p.dist(a);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    let projection = new Vector(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
    return p.dist(projection);
}

class Star {
    constructor(id, x, y) {
        this.id = id;
        this.pos = new Vector(x, y);
        this.radius = 6;
        this.pulse = Math.random() * Math.PI * 2;
    }
    draw(ctx) {
        this.pulse += 0.05;
        let glow = 10 + Math.sin(this.pulse) * 5;
        
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = glow;
        ctx.shadowColor = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

class BlackHole {
    constructor(x, y, r) {
        this.pos = new Vector(x, y);
        this.radius = r;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#a855f7';
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

class WeaverEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.stars = [];
        this.blackHoles = [];
        this.edges = []; // Drawn lines
        
        this.totalStardust = 0;
        this.optimalTarget = 0;
        this.ds = null; 
        this.isDragging = false;
        this.startStar = null;
        this.mousePos = new Vector(0,0);
        this.validatingLine = true; 
        this.autoWeaving = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setupEvents();
        
        this.generateGalaxy();
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateGalaxy() {
        document.getElementById('win-modal').classList.add('hidden');
        this.stars = [];
        this.blackHoles = [];
        this.edges = [];
        this.totalStardust = 0;
        this.autoWeaving = false;
        
        let pad = 100;
        let numStars = 15;
        let numHoles = 5;

        // Spawn Stars
        for (let i = 0; i < numStars; i++) {
            let valid = false;
            while (!valid) {
                let x = pad + Math.random() * (this.canvas.width - pad * 2);
                let y = pad + Math.random() * (this.canvas.height - pad * 2);
                let testStar = new Star(i, x, y);
                
                valid = true;
                for (let s of this.stars) {
                    if (testStar.pos.dist(s.pos) < 80) valid = false;
                }
                if (valid) this.stars.push(testStar);
            }
        }

        for (let i = 0; i < numHoles; i++) {
            let valid = false;
            while (!valid) {
                let x = pad + Math.random() * (this.canvas.width - pad * 2);
                let y = pad + Math.random() * (this.canvas.height - pad * 2);
                let r = 30 + Math.random() * 40;
                let testHole = new BlackHole(x, y, r);
                
                valid = true;
                for (let s of this.stars) {
                    if (testHole.pos.dist(s.pos) < r + 30) valid = false;
                }
                if (valid) this.blackHoles.push(testHole);
            }
        }

        this.ds = new DisjointSet(this.stars.length);
        this.calculateOptimalMST();
        this.updateUI();
    }

    
    calculateOptimalMST() {
        let allPossibleEdges = [];
        
        for (let i = 0; i < this.stars.length; i++) {
            for (let j = i + 1; j < this.stars.length; j++) {
                let s1 = this.stars[i];
                let s2 = this.stars[j];
                let dist = s1.pos.dist(s2.pos);
                
                let hitsHole = false;
                for (let bh of this.blackHoles) {
                    if (pointToLineDist(bh.pos, s1.pos, s2.pos) < bh.radius + 2) {
                        hitsHole = true; break;
                    }
                }
                
                if (!hitsHole) {
                    allPossibleEdges.push({ u: s1, v: s2, weight: dist });
                }
            }
        }

        // Sort by weight (Ascending)
        allPossibleEdges.sort((a, b) => a.weight - b.weight);

        let tempDS = new DisjointSet(this.stars.length);
        this.optimalTarget = 0;
        this.allPossibleEdges = allPossibleEdges; // Save for auto-weave

        for (let edge of allPossibleEdges) {
            if (tempDS.union(edge.u.id, edge.v.id)) {
                this.optimalTarget += edge.weight;
            }
        }
    }

    autoWeave() {
        if (this.autoWeaving) return;
        this.autoWeaving = true;
        this.edges = [];
        this.totalStardust = 0;
        this.ds = new DisjointSet(this.stars.length);
        
        let edgeIndex = 0;
        
        let step = () => {
            if (edgeIndex >= this.allPossibleEdges.length || this.ds.components === 1) {
                this.checkWin();
                return;
            }
            
            let edge = this.allPossibleEdges[edgeIndex];
            if (this.ds.union(edge.u.id, edge.v.id)) {
                this.edges.push(edge);
                this.totalStardust += edge.weight;
                this.updateUI();
            }
            edgeIndex++;
            setTimeout(step, 100); // Animate next edge after 100ms
        };
        step();
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.autoWeaving) return;
            let clickPos = new Vector(e.clientX, e.clientY);
            
            for (let s of this.stars) {
                if (clickPos.dist(s.pos) < s.radius + 15) {
                    this.isDragging = true;
                    this.startStar = s;
                    this.mousePos = clickPos;
                    break;
                }
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.mousePos = new Vector(e.clientX, e.clientY);
            
            // Validate real-time line against black holes
            this.validatingLine = true;
            for (let bh of this.blackHoles) {
                if (pointToLineDist(bh.pos, this.startStar.pos, this.mousePos) < bh.radius + 2) {
                    this.validatingLine = false; break;
                }
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            let releasePos = new Vector(e.clientX, e.clientY);
            let endStar = null;

            for (let s of this.stars) {
                if (s !== this.startStar && releasePos.dist(s.pos) < s.radius + 15) {
                    endStar = s; break;
                }
            }

            if (endStar && this.validatingLine) {
                let dist = this.startStar.pos.dist(endStar.pos);
                
                if (this.ds.union(this.startStar.id, endStar.id)) {
                    this.edges.push({ u: this.startStar, v: endStar, weight: dist });
                    this.totalStardust += dist;
                    this.updateUI();
                    this.checkWin();
                } else {
                   
                    document.getElementById('status-msg').innerText = "⚠️ Cycle Detected! That edge is redundant.";
                    document.getElementById('status-msg').style.color = "#ef4444";
                    setTimeout(() => {
                        document.getElementById('status-msg').innerText = "Drag from star to star to build the constellation. Avoid Black Holes!";
                        document.getElementById('status-msg').style.color = "#94a3b8";
                    }, 2000);
                }
            }
        });
    }

    updateUI() {
        document.getElementById('stardust-display').innerText = Math.floor(this.totalStardust);
        document.getElementById('target-display').innerText = Math.floor(this.optimalTarget);
        document.getElementById('linked-display').innerText = `${this.stars.length - this.ds.components + 1} / ${this.stars.length}`;
    }

    checkWin() {
        if (this.ds.components === 1) { // 1 Component = Fully connected graph
            let msg = "";
            let diff = this.totalStardust - this.optimalTarget;
            
            if (diff <= 1) msg = "Perfect Efficiency! You matched Kruskal's Algorithm.";
            else if (diff < 500) msg = "Great job! Very close to mathematical perfection.";
            else msg = "Constellation formed, but it was highly inefficient. Try to optimize!";
            
            document.getElementById('efficiency-msg').innerText = msg;
            setTimeout(() => document.getElementById('win-modal').classList.remove('hidden'), 500);
        }
    }

    toggleGuide() { document.getElementById('guide-modal').classList.toggle('hidden'); }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Black Holes
        for (let bh of this.blackHoles) bh.draw(this.ctx);

        // Draw Committed Edges
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)'; // Yellow stardust
        for (let edge of this.edges) {
            this.ctx.beginPath();
            this.ctx.moveTo(edge.u.pos.x, edge.u.pos.y);
            this.ctx.lineTo(edge.v.pos.x, edge.v.pos.y);
            this.ctx.stroke();
        }

        // Draw Active Drag Line
        if (this.isDragging) {
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = this.validatingLine ? 'rgba(168, 85, 247, 0.8)' : 'rgba(239, 68, 68, 0.8)';
            this.ctx.setLineDash([10, 10]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.startStar.pos.x, this.startStar.pos.y);
            this.ctx.lineTo(this.mousePos.x, this.mousePos.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw Stars
        for (let s of this.stars) s.draw(this.ctx);

        requestAnimationFrame(() => this.loop());
    }
}

const game = new WeaverEngine();