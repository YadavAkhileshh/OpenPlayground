/**
 * SlimeNet - Main Entry Point
 * 
 * Orchestrates the simulation loop and initialization.
 */

class SlimeNet {
    constructor() {
        this.initialized = false;

        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        Logger.info('Main', 'Booting SlimeNet...');

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // 1. Initialize Core Systems
        // Note: Ordering is handled by script tags in HTML, but dependencies exist.
        this.grid = new Grid(this.width, this.height);
        this.agents = new AgentSystem(Config.agents.count, this.width, this.height);
        this.predators = new PredatorSystem(Config.predators.count, this.width, this.height);
        this.food = new FoodSystem(this.grid); // New Food System

        // 2. Initialize Renderer
        this.renderer = new Renderer('sim-canvas');

        // 3. Initialize Input & UI
        this.input = new InputManager('sim-canvas', this.grid);
        // Delay UI slightly to ensure window.app is ready for binding
        setTimeout(() => this.ui = new UIControls(), 100);

        // 3b. Graph
        this.graph = new StatsGraph('stats-panel');

        // 4. Bind Global Actions for UI
        window.resetGrid = () => {
            this.grid.clear();
            this.food.clear();
        };
        window.respawnAgents = () => this.agents.initRandom();

        // 5. Setup Stats
        this.stats = {
            fps: document.getElementById('fps-counter'),
            agentCount: document.getElementById('agent-count'),
            steps: document.getElementById('step-count'),
            frameCount: 0,
            lastTime: performance.now(),
            fpsTime: performance.now()
        };

        // 6. Handle Resizing
        window.addEventListener('resize', () => this.handleResize());

        // 7. Start Loop
        this.initialized = true;
        this.loop();
    }

    handleResize() {
        // Renderer handles canvas resize already. 
        // We need to re-init grid and agents or scale them.
        // For simplicity, we just reset them to match new dims.
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Re-create Grid
        this.grid = new Grid(this.width, this.height);

        // Re-spawn Agents 
        // We reuse the existing AgentSystem instance but re-init random positions within new bounds
        this.agents.width = this.width;
        this.agents.height = this.height;
        this.agents.initRandom();
        // Predators resize
        this.predators.width = this.width;
        this.predators.height = this.height;
        // Food persists but maps might drift if we don't scale positions. 
        // For now, clearing food is safer or just leave it (it uses absolute coords so it might clip)
        this.food.grid = this.grid; // Update ref

        Logger.info('Main', 'Resized simulation');
    }

    loop(currentTime = performance.now()) {
        requestAnimationFrame((t) => this.loop(t));

        if (Config.system.paused) return;

        // Calculate Delta Time
        const dt = (currentTime - this.stats.lastTime) / 1000;
        this.stats.lastTime = currentTime;

        // --- SIMULATION STEP ---

        // 1. Update Agents
        // They sense grid, move, and deposit pheromones
        this.food.update(dt); // Update food sources
        this.agents.update(this.grid, dt);
        this.predators.update(this.agents, dt);

        // 2. Update Grid
        // Apply diffusion and decay
        this.grid.update(Config.grid.decayRate, Config.grid.diffuseRate, Config.grid.flowX, Config.grid.flowY);

        // --- RENDER STEP ---
        this.renderer.render(this.grid, this.agents);

        // Render Predators On Top
        this.predators.render(this.renderer.ctx);

        // --- STATS UPDATE ---
        this.stats.frameCount++;
        if (currentTime - this.stats.fpsTime >= 1000) {
            const fps = Math.round(this.stats.frameCount * 1000 / (currentTime - this.stats.fpsTime));
            this.stats.fps.textContent = `${fps} FPS`;
            this.stats.agentCount.textContent = this.agents.count;
            this.stats.steps.textContent = this.stats.frameCount; // Just using frame count as steps

            // Update Graph
            if (this.graph) this.graph.update(fps);

            this.stats.frameCount = 0;
            this.stats.fpsTime = currentTime;
        }
    }
}

// Start Application
const app = new SlimeNet();
window.app = app;
