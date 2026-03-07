
class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vector(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vector(this.x * n, this.y * n); }
    mag() { return Math.hypot(this.x, this.y); }
    normalize() { let m = this.mag(); return m === 0 ? new Vector(0,0) : new Vector(this.x/m, this.y/m); }
    dist(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
}

const SHAPES = ['CIRCLE', 'SQUARE', 'TRIANGLE'];
const LINE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b']; 


class Passenger {
    constructor(destinationShape) {
        this.dest = destinationShape;
    }
    draw(ctx, x, y) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        if (this.dest === 'CIRCLE') ctx.arc(x, y, 4, 0, Math.PI * 2);
        else if (this.dest === 'SQUARE') ctx.rect(x - 4, y - 4, 8, 8);
        else if (this.dest === 'TRIANGLE') {
            ctx.moveTo(x, y - 5); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x - 5, y + 4);
        }
        ctx.fill();
    }
}

class Station {
    constructor(id, x, y, shape) {
        this.id = id;
        this.pos = new Vector(x, y);
        this.shape = shape;
        this.passengers = [];
        this.radius = 15;
        this.overloadTimer = 0;
    }

    addPassenger() {
        if (this.passengers.length > 8) return; // Prevent infinite stacking
        let possibleDests = SHAPES.filter(s => s !== this.shape);
        let dest = possibleDests[Math.floor(Math.random() * possibleDests.length)];
        this.passengers.push(new Passenger(dest));
    }

    draw(ctx) {
        // Draw Overload Warning
        if (this.passengers.length >= 6) {
            this.overloadTimer += 0.1;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius + 10 + Math.sin(this.overloadTimer) * 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        
        if (this.shape === 'CIRCLE') ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        else if (this.shape === 'SQUARE') ctx.rect(this.pos.x - 12, this.pos.y - 12, 24, 24);
        else if (this.shape === 'TRIANGLE') {
            ctx.moveTo(this.pos.x, this.pos.y - 15);
            ctx.lineTo(this.pos.x + 15, this.pos.y + 12);
            ctx.lineTo(this.pos.x - 15, this.pos.y + 12);
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        // Draw waiting passengers
        this.passengers.forEach((p, i) => {
            let px = this.pos.x + 25 + (i % 3) * 12;
            let py = this.pos.y - 10 + Math.floor(i / 3) * 12;
            p.draw(ctx, px, py);
        });
    }
}


class Train {
    constructor(line) {
        this.line = line; // Reference to the parent Line object
        this.currentNodeIndex = 0;
        this.targetNodeIndex = 1;
        this.pos = line.stations[0].pos.add(new Vector(0,0));
        this.speed = 2;
        this.passengers = [];
        this.capacity = 4;
        this.movingForward = true;
    }

    update(engine) {
        if (this.line.stations.length < 2) return;

        let targetStation = this.line.stations[this.targetNodeIndex];
        let dir = targetStation.pos.sub(this.pos);
        let dist = dir.mag();

        if (dist < this.speed) {
            this.pos = targetStation.pos.add(new Vector(0,0));
            this.handleStationLogic(targetStation, engine);

            // Path routing: Reverse if at end of line
            if (this.movingForward) {
                this.targetNodeIndex++;
                if (this.targetNodeIndex >= this.line.stations.length) {
                    this.targetNodeIndex = this.line.stations.length - 2;
                    this.movingForward = false;
                }
            } else {
                this.targetNodeIndex--;
                if (this.targetNodeIndex < 0) {
                    this.targetNodeIndex = 1;
                    this.movingForward = true;
                }
            }
        } else {
            let moveVec = dir.normalize().mult(this.speed);
            this.pos = this.pos.add(moveVec);
        }
    }

    handleStationLogic(station, engine) {
    
        for (let i = this.passengers.length - 1; i >= 0; i--) {
            if (this.passengers[i].dest === station.shape) {
                this.passengers.splice(i, 1);
                engine.score++;
                engine.updateUI();
            }
        }

        while (this.passengers.length < this.capacity && station.passengers.length > 0) {
            this.passengers.push(station.passengers.shift());
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.line.color;
        ctx.fillRect(this.pos.x - 10, this.pos.y - 6, 20, 12);
        
        // Draw passenger pips on train
        ctx.fillStyle = '#ffffff';
        for(let i=0; i < this.passengers.length; i++) {
            ctx.beginPath();
            ctx.arc(this.pos.x - 6 + (i * 4), this.pos.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class TransitLine {
    constructor(color) {
        this.color = color;
        this.stations = [];
        this.trains = [];
    }

    addStation(station) {
        this.stations.push(station);
        if (this.stations.length === 2 && this.trains.length === 0) {
            this.trains.push(new Train(this)); // Spawn a train when line is valid
        }
    }

    draw(ctx) {
        if (this.stations.length < 2) return;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 8;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(this.stations[0].pos.x, this.stations[0].pos.y);
        for (let i = 1; i < this.stations.length; i++) {
            ctx.lineTo(this.stations[i].pos.x, this.stations[i].pos.y);
        }
        ctx.stroke();
    }
}


class TransitEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.stations = [];
        this.lines = [];
        this.score = 0;
        this.frameCount = 0;
        this.state = 'PLAYING';
        
        // Dragging state
        this.isDragging = false;
        this.dragStartStation = null;
        this.mousePos = new Vector(0,0);

        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.setupEvents();
        
        // Initial Spawns
        this.spawnStation('CIRCLE');
        this.spawnStation('SQUARE');
        this.spawnStation('TRIANGLE');
        
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Force-Directed Spawning Algorithm
    spawnStation(forceShape = null) {
        let maxAttempts = 50;
        let validPos = null;
        let padding = 100;

        for (let i = 0; i < maxAttempts; i++) {
            let testPos = new Vector(
                padding + Math.random() * (this.canvas.width - padding * 2),
                padding + Math.random() * (this.canvas.height - padding * 2)
            );

            let tooClose = false;
            for (let s of this.stations) {
                if (testPos.dist(s.pos) < 150) { tooClose = true; break; }
            }

            if (!tooClose) { validPos = testPos; break; }
        }

        if (validPos) {
            let shape = forceShape || SHAPES[Math.floor(Math.random() * SHAPES.length)];
            let id = this.stations.length;
            this.stations.push(new Station(id, validPos.x, validPos.y, shape));
        }
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.state !== 'PLAYING') return;
            let clickPos = new Vector(e.clientX, e.clientY);
            
            for (let s of this.stations) {
                if (clickPos.dist(s.pos) < s.radius + 10) {
                    this.isDragging = true;
                    this.dragStartStation = s;
                    this.mousePos = clickPos;
                    break;
                }
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) this.mousePos = new Vector(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            let releasePos = new Vector(e.clientX, e.clientY);
            let targetStation = null;

            for (let s of this.stations) {
                if (s !== this.dragStartStation && releasePos.dist(s.pos) < s.radius + 10) {
                    targetStation = s;
                    break;
                }
            }

            if (targetStation) {
               
                let added = false;
                
                
                for (let line of this.lines) {
                    let endStation = line.stations[line.stations.length - 1];
                    if (endStation === this.dragStartStation && !line.stations.includes(targetStation)) {
                        line.addStation(targetStation);
                        added = true;
                        break;
                    }
                }

                
                if (!added && this.lines.length < LINE_COLORS.length) {
                    let newLine = new TransitLine(LINE_COLORS[this.lines.length]);
                    newLine.addStation(this.dragStartStation);
                    newLine.addStation(targetStation);
                    this.lines.push(newLine);
                    this.updateUI();
                }
            }
        });
    }

    updateUI() {
        document.getElementById('score-display').innerText = this.score;
        document.getElementById('lines-display').innerText = `${this.lines.length} / ${LINE_COLORS.length}`;
    }

    toggleGuide() { document.getElementById('guide-modal').classList.toggle('hidden'); }

    loop() {
        if (this.state !== 'PLAYING') return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.frameCount++;

        // Procedural Generation Over Time
        if (this.frameCount % 400 === 0) this.spawnStation();
        if (this.frameCount % 120 === 0) {
            let randomStation = this.stations[Math.floor(Math.random() * this.stations.length)];
            randomStation.addPassenger();
        }

        // Draw active drag line
        if (this.isDragging) {
            this.ctx.strokeStyle = '#cbd5e1';
            this.ctx.lineWidth = 6;
            this.ctx.setLineDash([10, 10]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.dragStartStation.pos.x, this.dragStartStation.pos.y);
            this.ctx.lineTo(this.mousePos.x, this.mousePos.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]); // Reset
        }

        // Update and Draw Networks
        this.lines.forEach(line => line.draw(this.ctx));
        
        this.lines.forEach(line => {
            line.trains.forEach(train => {
                train.update(this);
                train.draw(this.ctx);
            });
        });

        // Update and Draw Stations & Check Lose Condition
        for (let s of this.stations) {
            s.draw(this.ctx);
            if (s.passengers.length >= 8) {
                this.state = 'GAMEOVER';
                document.getElementById('game-over-modal').classList.remove('hidden');
            }
        }

        requestAnimationFrame(() => this.loop());
    }
}

const engine = new TransitEngine();