
(() => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d', { alpha: false });
    let W, H;

    // --- GENETICS & ANCESTRY ---
    const SPECIES = {
        BUILDER: 0,
        SWIMMER: 1,
        DARTER: 2,
        MIMIC: 3
    };

    const BASE_GENOMES = {
        [SPECIES.BUILDER]: {
            name: "Builder", color: "#3b82f6",
            mass: 3.0, muscle: 0.05, lag: 0.0, bondDist: 50, stiffness: 0.1, align: 0.0, repulsion: 0.8
        },
        [SPECIES.SWIMMER]: {
            name: "Swimmer", color: "#10b981",
            mass: 1.0, muscle: 0.45, lag: 0.6, bondDist: 70, stiffness: 0.04, align: 0.15, repulsion: 0.5
        },
        [SPECIES.DARTER]: {
            name: "Darter", color: "#f43f5e",
            mass: 0.5, muscle: 0.8, lag: 1.5, bondDist: 90, stiffness: 0.01, align: 0.02, repulsion: 1.2
        },
        [SPECIES.MIMIC]: {
            name: "Mimic", color: "#e2e8f0",
            mass: 1.0, muscle: 0.1, lag: 0.1, bondDist: 60, stiffness: 0.05, align: 0.1, repulsion: 0.5
        }
    };

    // --- ECOSYSTEM STATE ---
    const State = {
        viscosity: 0.06,
        gravity: 0.001,
        brushSize: 50,
        selectedSpecies: SPECIES.SWIMMER,
        paused: false,
        drawLines: true,
        gridSize: 80,
        
        // Evolution Params
        foodRate: 8,
        metabolismScale: 1.0,
        mutationRate: 0.1,
        startEnergy: 800,
        reproThreshold: 1500,
        foodValue: 400
    };

    let particles = [];
    let food = [];
    let grid = new Map(); // Spatial hash for particles
    let mouse = { x: -1000, y: -1000, down: false };
    let animationId = null;
    let frameCount = 0, lastTime = 0;
    let maxGeneration = 0;

    // --- FOOD CLASS ---
    class Nutrient {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.2;
            this.vy = (Math.random() - 0.5) * 0.2;
            this.size = 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if(this.x < 0) this.x += W; else if(this.x > W) this.x -= W;
            if(this.y < 0) this.y += H; else if(this.y > H) this.y -= H;
        }
    }

    // --- PARTICLE (CREATURE) ---
    class Particle {
        constructor(x, y, genome, energy = State.startEnergy, generation = 0) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random()-0.5);
            this.vy = (Math.random()-0.5);
            
            // Genetics (Copy value to allow mutation without affecting preset)
            this.genome = { ...genome };
            
            // Physiology
            this.mass = this.genome.mass; 
            this.phase = Math.random() * Math.PI * 2;
            this.phaseRate = 0.1 + Math.random() * 0.1;
            
            // Life Stats
            this.energy = energy;
            this.generation = generation;
            if(generation > maxGeneration) maxGeneration = generation;
            this.age = 0;
            this.links = 0;
            this.id = Math.random();
        }

        integrate() {
            // Physics: Drag
            const v = 1 - State.viscosity / (this.mass || 1); 
            this.vx *= v;
            this.vy *= v;
            
            this.x += this.vx;
            this.y += this.vy;

            // Physics: Soft Gravity
            if (State.gravity > 0) {
                const dx = W/2 - this.x;
                const dy = H/2 - this.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d > 0) {
                    this.vx += (dx/d) * State.gravity;
                    this.vy += (dy/d) * State.gravity;
                }
            }

            // Physics: Bounds
            const pad = 20;
            if (this.x < pad) { this.x = pad; this.vx *= -0.8; }
            if (this.x > W-pad) { this.x = W-pad; this.vx *= -0.8; }
            if (this.y < pad) { this.y = pad; this.vy *= -0.8; }
            if (this.y > H-pad) { this.y = H-pad; this.vy *= -0.8; }

            // Biology: Clock
            this.phase += 0.1 * this.phaseRate; 
            if (this.phase > Math.PI * 2) this.phase -= Math.PI * 2;

            // Biology: Metabolism
            // Heavier and faster particles burn more energy
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            const cost = (0.5 + this.mass * 0.1 + speed * this.genome.muscle * 2) * State.metabolismScale;
            this.energy -= cost;
            this.age++;
        }

        mutate() {
            // Return a mutated genome based on current one
            const g = { ...this.genome };
            const rate = State.mutationRate;
            
            // Helper: random shift
            const shift = (val, mag) => val + (Math.random() - 0.5) * mag * rate;
            
            g.mass = Math.max(0.2, shift(g.mass, 1.0));
            g.muscle = Math.max(0, Math.min(1, shift(g.muscle, 0.5)));
            g.lag = Math.max(0, shift(g.lag, 0.5));
            g.bondDist = Math.max(20, shift(g.bondDist, 20));
            g.stiffness = Math.max(0.01, shift(g.stiffness, 0.05));
            g.align = Math.max(0, Math.min(0.5, shift(g.align, 0.1)));
            g.repulsion = Math.max(0.1, shift(g.repulsion, 0.5));
            
            // Color drift (Visualizing Evolution)
            // Parse HSL, shift Hue, reconstruct
            // Simplified: just shift hue slightly if we had a full color parser, 
            // but here we might just drift randomly if it differs from base.
            // For now, let's just leave color static to identify lineage, 
            // or maybe darken it for older generations.
            
            return g;
        }
    }

    // --- SYSTEMS ---
    let lineBuffer = [];

    const runEcosystem = () => {
        grid.clear();
        lineBuffer = [];
        
        // 1. Spatial Hash & Food Check
        // We put particles in grid. We check food against particles.
        for (const p of particles) {
            const k = (Math.floor(p.x / State.gridSize)) + ',' + (Math.floor(p.y / State.gridSize));
            if (!grid.has(k)) grid.set(k, []);
            grid.get(k).push(p);
        }

        // 2. Particle Interactions (Physics + Eating)
        // Check food collisions (Simplified: brute force against nearby grid or just checking food list)
        // Optimization: Food doesn't move much.
        for (let i = food.length - 1; i >= 0; i--) {
            const f = food[i];
            f.update();
            
            // Check if eaten
            const gx = Math.floor(f.x / State.gridSize);
            const gy = Math.floor(f.y / State.gridSize);
            let eaten = false;
            
            // Check surrounding cells
            for(let xx=-1; xx<=1; xx++){
                for(let yy=-1; yy<=1; yy++){
                    const cell = grid.get((gx+xx)+','+(gy+yy));
                    if(cell) {
                        for(const p of cell) {
                            const dx = p.x - f.x;
                            const dy = p.y - f.y;
                            // Eat distance
                            if(dx*dx + dy*dy < (p.genome.bondDist/2)**2) { 
                                p.energy += State.foodValue;
                                food.splice(i, 1);
                                eaten = true;
                                break; 
                            }
                        }
                    }
                }
                if(eaten) break;
            }
        }

        // 3. Particle-Particle Physics & Reproduction
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            // DEATH CHECK
            if (p.energy <= 0) {
                particles.splice(i, 1);
                continue;
            }

            // REPRODUCTION CHECK
            if (p.energy > State.reproThreshold) {
                p.energy -= 800; // Cost
                const offGenome = p.mutate();
                const offX = p.x + (Math.random()-0.5)*10;
                const offY = p.y + (Math.random()-0.5)*10;
                particles.push(new Particle(offX, offY, offGenome, 400, p.generation + 1));
            }

            // Physics Logic
            p.links = 0;
            const gx = Math.floor(p.x / State.gridSize);
            const gy = Math.floor(p.y / State.gridSize);
            const g1 = p.genome;

            let alignVx = 0, alignVy = 0;
            let neighbors = 0;

            for (let xx = -1; xx <= 1; xx++) {
                for (let yy = -1; yy <= 1; yy++) {
                    const cell = grid.get((gx + xx) + ',' + (gy + yy));
                    if (!cell) continue;

                    for (const n of cell) {
                        if (p === n) continue;

                        const dx = n.x - p.x;
                        const dy = n.y - p.y;
                        const d2 = dx*dx + dy*dy;
                        const maxDist = Math.max(g1.bondDist, n.genome.bondDist);
                        
                        if (d2 > maxDist * maxDist || d2 === 0) continue;

                        const dist = Math.sqrt(d2);
                        const nx = dx / dist;
                        const ny = dy / dist;

                        // Physics Forces (Repulsion/Attraction)
                        const skin = 20; 
                        if (dist < skin) {
                            const avgRepel = Math.max(g1.repulsion, n.genome.repulsion);
                            const repelForce = (1 - dist/skin) * avgRepel;
                            p.vx -= nx * repelForce;
                            p.vy -= ny * repelForce;
                        } else {
                            const avgStiff = (g1.stiffness + n.genome.stiffness) / 2;
                            const avgMusc = (g1.muscle + n.genome.muscle) / 2;
                            const activity = Math.sin(p.phase) * avgMusc;
                            const target = maxDist * (0.6 + activity * 0.3);
                            const force = (dist - target) * avgStiff;
                            
                            p.vx += nx * force / p.mass;
                            p.vy += ny * force / p.mass;
                            
                            if (Math.abs(force) > 0.01) {
                                p.links++;
                                if (State.drawLines && p.id < n.id) {
                                    lineBuffer.push({ x1: p.x, y1: p.y, x2: n.x, y2: n.y, str: Math.min(1, Math.abs(force)*10) });
                                }
                            }
                        }

                        // Alignment
                        if (g1.align > 0 && dist < maxDist * 0.8) {
                            alignVx += n.vx;
                            alignVy += n.vy;
                            neighbors++;
                        }
                        
                        // Phase Sync (Wave)
                        const avgLag = (g1.lag + n.genome.lag) / 2;
                        if (avgLag > 0) {
                            const dot = (p.vx * nx + p.vy * ny);
                            const lagDir = dot > 0 ? -avgLag : avgLag;
                            let targetPhase = n.phase + lagDir;
                            let pDiff = targetPhase - p.phase;
                            if (pDiff > Math.PI) pDiff -= Math.PI*2;
                            if (pDiff < -Math.PI) pDiff += Math.PI*2;
                            p.phase += pDiff * 0.05;
                        }
                    }
                }
            }

            if (neighbors > 0) {
                alignVx /= neighbors;
                alignVy /= neighbors;
                p.vx += (alignVx - p.vx) * g1.align;
                p.vy += (alignVy - p.vy) * g1.align;
            }
        }
    };

    // --- RENDER ---
    const draw = () => {
        ctx.fillStyle = "rgba(5, 5, 8, 0.3)";
        ctx.fillRect(0, 0, W, H);
        
        // Brush
        if (mouse.x > -100 && mouse.down) {
            ctx.strokeStyle = BASE_GENOMES[State.selectedSpecies].color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, State.brushSize, 0, Math.PI*2);
            ctx.stroke();
        }

        // Food
        ctx.fillStyle = "#4ade80"; // Bright Green
        for (const f of food) {
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Links
        if (State.drawLines) {
            ctx.lineWidth = 1;
            for (const l of lineBuffer) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${l.str * 0.15})`;
                ctx.beginPath();
                ctx.moveTo(l.x1, l.y1);
                ctx.lineTo(l.x2, l.y2);
                ctx.stroke();
            }
        }

        // Particles
        for (const p of particles) {
            ctx.fillStyle = p.genome.color;
            
            // Size based on mass
            let size = p.mass * 1.5; 
            if(size < 1.5) size = 1.5;
            if(size > 5) size = 5;
            
            size += Math.sin(p.phase) * 0.5;

            // Opacity based on Energy (Starvation Indicator)
            const health = Math.max(0.2, Math.min(1, p.energy / 800));
            ctx.globalAlpha = health;

            if (p.links > 3) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.genome.color;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0; 
            ctx.globalAlpha = 1.0;
        }
    };

    const loop = (now) => {
        if (!State.paused) {
            // Spawn Food
            if (food.length < 2000 && Math.random() < (State.foodRate / 10)) {
                // Batch spawn food for performance
                for(let i=0; i<Math.ceil(State.foodRate/2); i++) food.push(new Nutrient());
            }

            // Spawn Particles (Painting)
            if (mouse.down && mouse.x > -100) {
                if (Math.random() > 0.5) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * State.brushSize;
                    const genome = BASE_GENOMES[State.selectedSpecies];
                    particles.push(new Particle(mouse.x + Math.cos(angle)*r, mouse.y + Math.sin(angle)*r, genome));
                }
            }
            
            runEcosystem();
            for(const p of particles) p.integrate();
        }
        
        draw();
        
        // Stats
        if (now - lastTime >= 500) {
            document.getElementById('fps').innerText = Math.round(1000 / (now - lastTime) * frameCount);
            document.getElementById('stat-pop').innerText = particles.length;
            document.getElementById('stat-food').innerText = food.length;
            document.getElementById('stat-gen').innerText = maxGeneration;
            
            let totalEn = 0;
            for(const p of particles) totalEn += p.energy;
            document.getElementById('stat-nrg').innerText = particles.length ? Math.floor(totalEn/particles.length) : 0;

            frameCount = 0;
            lastTime = now;
        }
        frameCount++;
        
        animationId = requestAnimationFrame(loop);
    };

    // --- INIT ---
    const sim = {
        clear: () => particles = [],
        reset: () => {
            particles = [];
            food = [];
            maxGeneration = 0;
            // Seed a starter colony
            for(let i=0; i<50; i++) particles.push(new Particle(W/2 + (Math.random()-0.5)*100, H/2 + (Math.random()-0.5)*100, BASE_GENOMES[SPECIES.SWIMMER]));
            // Initial food dump
            for(let i=0; i<500; i++) food.push(new Nutrient());
        },
        extinct: () => {
            particles.forEach(p => p.energy = 0); // Mass death
        },
        togglePause: () => {
            State.paused = !State.paused;
            document.getElementById('btn-pause').innerText = State.paused ? "Resume" : "Pause";
        }
    };

    const clickSpecies = (val) => {
        State.selectedSpecies = val;
        document.querySelectorAll('.species-btn').forEach(b => b.classList.remove('active'));
        const buttons = document.querySelectorAll('.species-btn');
        if (buttons[val]) buttons[val].classList.add('active');
    };

    const init = () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        
        // UI
        const grid = document.getElementById('species-grid');
        grid.innerHTML = '';
        for (const [key, val] of Object.entries(SPECIES)) {
            const g = BASE_GENOMES[val];
            const btn = document.createElement('div');
            btn.className = 'species-btn';
            if (val === State.selectedSpecies) btn.classList.add('active');
            btn.innerHTML = `<span>${g.name}</span> <span class="dot" style="background:${g.color}; box-shadow: 0 0 5px ${g.color}"></span>`;
            btn.onclick = () => clickSpecies(val);
            grid.appendChild(btn);
        }

        // Inputs
        document.getElementById('brushSize').oninput = e => State.brushSize = +e.target.value;
        document.getElementById('foodRate').oninput = e => { State.foodRate = +e.target.value; document.getElementById('val_foodRate').innerText = State.foodRate; };
        document.getElementById('metabolism').oninput = e => { State.metabolismScale = +e.target.value; document.getElementById('val_metabolism').innerText = State.metabolismScale.toFixed(1); };
        document.getElementById('mutation').oninput = e => { State.mutationRate = +e.target.value; document.getElementById('val_mutation').innerText = State.mutationRate; };
        document.getElementById('viscosity').oninput = e => { State.viscosity = +e.target.value; document.getElementById('val_viscosity').innerText = State.viscosity.toFixed(2); };

        // Buttons
        document.getElementById('btn-extinct').onclick = sim.extinct;
        document.getElementById('btn-reset').onclick = sim.reset;
        document.getElementById('btn-pause').onclick = sim.togglePause;
        document.getElementById('toggle-btn').onclick = () => document.getElementById('controls').classList.toggle('collapsed');

        // Mouse
        const setMouse = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        canvas.onmousedown = e => { mouse.down = true; setMouse(e); };
        canvas.onmousemove = setMouse;
        canvas.onmouseup = () => { mouse.down = false; mouse.x = -1000; };
        
        canvas.ontouchstart = e => { e.preventDefault(); mouse.down = true; const t = e.touches[0]; mouse.x = t.clientX; mouse.y = t.clientY; };
        canvas.ontouchmove = e => { e.preventDefault(); const t = e.touches[0]; mouse.x = t.clientX; mouse.y = t.clientY; };
        canvas.ontouchend = () => { mouse.down = false; mouse.x = -1000; };

        window.onresize = () => { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; };

        sim.reset();
        if (animationId) cancelAnimationFrame(animationId);
        requestAnimationFrame(loop);
    };

    setTimeout(init, 50);
})();
