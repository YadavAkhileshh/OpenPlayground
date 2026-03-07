
const N = 100; 
const iter = 4; 
const SCALE = window.innerHeight / N; 

// Maps 2D (x,y) coordinates to our highly optimized 1D Float32Array
function IX(x, y) {
    x = Math.max(0, Math.min(x, N - 1));
    y = Math.max(0, Math.min(y, N - 1));
    return x + y * N;
}


class FluidCube {
    constructor(dt, diff, visc) {
        this.dt = dt;     
        this.diff = diff; 
        this.visc = visc; 

        this.s = new Float32Array(N * N);
        this.density = new Float32Array(N * N);
        this.colorHue = new Float32Array(N * N);

        this.Vx = new Float32Array(N * N);
        this.Vy = new Float32Array(N * N);
        this.Vx0 = new Float32Array(N * N);
        this.Vy0 = new Float32Array(N * N);
        
        this.obstacles = new Uint8Array(N * N); // 1 = Wall, 0 = Open
    }

    addDensity(x, y, amount, hue) {
        let index = IX(x, y);
        if (this.obstacles[index] === 0) {
            this.density[index] += amount;
            this.colorHue[index] = hue; // Track dye color
        }
    }

    addVelocity(x, y, amountX, amountY) {
        let index = IX(x, y);
        if (this.obstacles[index] === 0) {
            this.Vx[index] += amountX;
            this.Vy[index] += amountY;
        }
    }

    addObstacle(x, y) {
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                this.obstacles[IX(x + i, y + j)] = 1;
                
                this.density[IX(x + i, y + j)] = 0;
                this.Vx[IX(x + i, y + j)] = 0;
                this.Vy[IX(x + i, y + j)] = 0;
            }
        }
    }

   
    lin_solve(b, x, x0, a, c) {
        let cRecip = 1.0 / c;
        for (let k = 0; k < iter; k++) {
            for (let j = 1; j < N - 1; j++) {
                for (let i = 1; i < N - 1; i++) {
                    if (this.obstacles[IX(i, j)] === 1) continue;
                    
                    x[IX(i, j)] = (x0[IX(i, j)] + a * (
                        x[IX(i + 1, j)] + x[IX(i - 1, j)] + 
                        x[IX(i, j + 1)] + x[IX(i, j - 1)]
                    )) * cRecip;
                }
            }
            this.set_bnd(b, x);
        }
    }


    // Step 2: Boundary Conditions (Bounce off edges & walls)
    set_bnd(b, x) {
        for (let i = 1; i < N - 1; i++) {
            x[IX(0, i)]     = b === 1 ? -x[IX(1, i)] : x[IX(1, i)];
            x[IX(N - 1, i)] = b === 1 ? -x[IX(N - 2, i)] : x[IX(N - 2, i)];
            x[IX(i, 0)]     = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
            x[IX(i, N - 1)] = b === 2 ? -x[IX(i, N - 2)] : x[IX(i, N - 2)];
        }
        x[IX(0, 0)]         = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
        x[IX(0, N - 1)]     = 0.5 * (x[IX(1, N - 1)] + x[IX(0, N - 2)]);
        x[IX(N - 1, 0)]     = 0.5 * (x[IX(N - 2, 0)] + x[IX(N - 1, 1)]);
        x[IX(N - 1, N - 1)] = 0.5 * (x[IX(N - 2, N - 1)] + x[IX(N - 1, N - 2)]);
        
        // Solid Obstacle Boundary Reflection
        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                if (this.obstacles[IX(i, j)] === 1) {
                    x[IX(i, j)] = 0; // Zero velocity inside wall
                }
            }
        }
    }


    // Step 3: Projection (Mass Conservation / Incompressibility)
    project(velocX, velocY, p, div) {
        let h = 1.0 / N;
        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                if (this.obstacles[IX(i, j)] === 1) continue;
                div[IX(i, j)] = -0.5 * h * (
                    velocX[IX(i + 1, j)] - velocX[IX(i - 1, j)] +
                    velocY[IX(i, j + 1)] - velocY[IX(i, j - 1)]
                );
                p[IX(i, j)] = 0;
            }
        }
        this.set_bnd(0, div); this.set_bnd(0, p);
        this.lin_solve(0, p, div, 1, 4);

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                if (this.obstacles[IX(i, j)] === 1) continue;
                velocX[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) / h;
                velocY[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) / h;
            }
        }
        this.set_bnd(1, velocX); this.set_bnd(2, velocY);
    }


    // Step 4: Advection (Moving fluid along velocity field)
    advect(b, d, d0, velocX, velocY, dt) {
        let i0, j0, i1, j1, x, y, s0, t0, s1, t1, dt0;
        dt0 = dt * N;

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                if (this.obstacles[IX(i, j)] === 1) continue;
                
                x = i - dt0 * velocX[IX(i, j)];
                y = j - dt0 * velocY[IX(i, j)];

                if (x < 0.5) x = 0.5; if (x > N + 0.5) x = N + 0.5;
                i0 = Math.floor(x); i1 = i0 + 1;
                if (y < 0.5) y = 0.5; if (y > N + 0.5) y = N + 0.5;
                j0 = Math.floor(y); j1 = j0 + 1;

                s1 = x - i0; s0 = 1.0 - s1;
                t1 = y - j0; t0 = 1.0 - t1;

                d[IX(i, j)] =
                    s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
                    s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
            }
        }
        this.set_bnd(b, d);
    }


    // Core Loop: Process velocity and density matrices
    step() {
        // Diffuse & Advect Velocity
        this.lin_solve(1, this.Vx0, this.Vx, this.visc * this.dt, 1 + 4 * this.visc * this.dt);
        this.lin_solve(2, this.Vy0, this.Vy, this.visc * this.dt, 1 + 4 * this.visc * this.dt);
        this.project(this.Vx0, this.Vy0, this.Vx, this.Vy);
        this.advect(1, this.Vx, this.Vx0, this.Vx0, this.Vy0, this.dt);
        this.advect(2, this.Vy, this.Vy0, this.Vx0, this.Vy0, this.dt);
        this.project(this.Vx, this.Vy, this.Vx0, this.Vy0);

        // Diffuse & Advect Density (Dye)
        this.lin_solve(0, this.s, this.density, this.diff * this.dt, 1 + 4 * this.diff * this.dt);
        this.advect(0, this.density, this.s, this.Vx, this.Vy, this.dt);
        
        // Decay density slightly over time so the screen doesn't fill entirely
        for (let i = 0; i < this.density.length; i++) {
            this.density[i] = Math.max(0, this.density[i] - 0.5); 
        }
    }
}


class FluidApp {
    constructor() {
        this.canvas = document.getElementById('fluidCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Init Math Engine: dt = 0.2, diffusion = 0, viscosity = 0.0000001
        this.fluid = new FluidCube(0.2, 0, 0.0000001);
        
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
        this.mode = 'dye'; // 'dye' or 'wall'
        this.currentHue = Math.random() * 360;
        this.isRainbow = true;

        this.setupEvents();
        this.loop();
    }

    setMode(mode) {
        this.mode = mode;
        document.getElementById('mode-display').innerText = mode === 'dye' ? "Drop Dye" : "Draw Walls";
        document.getElementById('mode-display').className = mode === 'dye' ? "highlight-green" : "highlight";
    }

    reset() {
        this.fluid = new FluidCube(0.2, 0, 0.0000001);
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        // NEW: Color Picker Event
        document.getElementById('dye-color').addEventListener('input', (e) => {
            this.currentHue = hexToHue(e.target.value);
            this.isRainbow = false; // Turn off rainbow mode
            document.getElementById('rainbow-btn').style.opacity = '0.5'; // Dim the rainbow button
        });

        // NEW: Rainbow Toggle Event
        document.getElementById('rainbow-btn').addEventListener('click', () => {
            this.isRainbow = true;
            document.getElementById('rainbow-btn').style.opacity = '1';
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouse = { x: e.clientX, y: e.clientY };
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            let gridX = Math.floor(e.clientX / SCALE);
            let gridY = Math.floor(e.clientY / SCALE);

            if (this.mode === 'dye') {
                let amtX = e.clientX - this.lastMouse.x;
                let amtY = e.clientY - this.lastMouse.y;

                for(let i = -1; i <= 1; i++) {
                    for(let j = -1; j <= 1; j++) {
                        this.fluid.addDensity(gridX + i, gridY + j, 200, this.currentHue);
                        this.fluid.addVelocity(gridX + i, gridY + j, amtX * 0.2, amtY * 0.2);
                    }
                }
                
                // NEW: Only shift the hue if Rainbow mode is active!
                if (this.isRainbow) {
                    this.currentHue = (this.currentHue + 1) % 360; 
                }
                
            } else if (this.mode === 'wall') {
                this.fluid.addObstacle(gridX, gridY);
            }

            this.lastMouse = { x: e.clientX, y: e.clientY };
        });

        this.canvas.addEventListener('mouseup', () => this.isDragging = false);
    }


    toggleGuide() { document.getElementById('guide-modal').classList.toggle('hidden'); }

    loop() {
        // Step the physics engine
        this.fluid.step();

        // Render Logic
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                let index = IX(i, j);
                let x = i * SCALE;
                let y = j * SCALE;

                // Draw Walls
                if (this.fluid.obstacles[index] === 1) {
                    this.ctx.fillStyle = '#ef4444';
                    this.ctx.fillRect(x, y, SCALE, SCALE);
                    continue;
                }

                // Draw Fluid Density
                let d = this.fluid.density[index];
                if (d > 0) {
                    // Cap alpha at 1.0 for rendering
                    let alpha = Math.min(d / 255.0, 1.0);
                    let hue = this.fluid.colorHue[index];
                    this.ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
                    this.ctx.fillRect(x, y, SCALE, SCALE);
                }
            }
        }

        requestAnimationFrame(() => this.loop());
    }
}

const app = new FluidApp();