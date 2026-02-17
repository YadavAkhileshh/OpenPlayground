/**
 * ParticleSystem
 * Generates floating dust motes using DOM elements to enhance depth.
 * Strictly DOM-based, no canvas is used, adhering to project constraints.
 * Uses Vector3 for position and velocity calculations.
 */
class ParticleSystem {
    /**
     * Creates a new ParticleSystem instance.
     * Configures the maximum number of particles and storage arrays.
     */
    constructor() {
        this.stage = Utils.qs('.stage');
        this.particles = [];
        this.maxParticles = 50; // Kept low for DOM performance
        this.container = null;
    }

    /**
     * Initializes the particle system.
     * Creates the container element and spawns initial particles.
     */
    init() {
        if (!this.stage) return;

        // Create container for particles
        this.container = document.createElement('div');
        this.container.id = 'particle-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.transformStyle = 'preserve-3d';
        this.container.style.zIndex = '5'; // Positioned behind the text layer usually
        this.stage.appendChild(this.container);

        // Spawn particles
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }

        console.log('ParticleSystem: Initialized');
    }

    /**
     * Creates a single particle DOM element and initializes its physics state.
     */
    createParticle() {
        const p = document.createElement('div');
        p.className = 'particle';

        // Random visual properties
        const size = Utils.randomFloat(1, 3);
        const opacity = Utils.randomFloat(0.1, 0.5);

        // Initial Position (Percentage for X/Y, Pixels for Z)
        // We use Vector3, but map X/Y to 0-100 range conceptually for CSS
        const startX = Utils.randomInt(-50, 150);
        const startY = Utils.randomInt(-50, 150);
        const startZ = Utils.randomInt(-500, 500);

        // Style the particle
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.background = 'var(--color-primary)';
        p.style.position = 'absolute';
        p.style.borderRadius = '50%';
        p.style.left = '0'; // We use transform for positioning
        p.style.top = '0';
        p.style.opacity = opacity;
        p.style.boxShadow = `0 0 ${size * 2}px var(--color-primary)`;

        // We don't use CSS transitions for the loop, we update manually in update()
        // for smoother continuous flow, or we could use CSS.
        // Let's use manual update for "Engine" feel.

        this.container.appendChild(p);

        // Store particle state
        this.particles.push({
            el: p,
            position: new Vector3(startX, startY, startZ),
            velocity: new Vector3(
                Utils.randomFloat(-0.05, 0.05),
                Utils.randomFloat(-0.05, 0.05),
                Utils.randomFloat(-0.5, 0.5)
            ),
            bounds: {
                minX: -50, maxX: 150,
                minY: -50, maxY: 150,
                minZ: -600, maxZ: 600
            }
        });
    }

    /**
     * Updates the position of all particles.
     * Handles boundary wrapping.
     */
    update() {
        if (!this.container) return;

        this.particles.forEach(p => {
            // Update position
            p.position.add(p.velocity);

            // Boundary Checking (Wrap around)
            if (p.position.x > p.bounds.maxX) p.position.x = p.bounds.minX;
            if (p.position.x < p.bounds.minX) p.position.x = p.bounds.maxX;

            if (p.position.y > p.bounds.maxY) p.position.y = p.bounds.minY;
            if (p.position.y < p.bounds.minY) p.position.y = p.bounds.maxY;

            if (p.position.z > p.bounds.maxZ) p.position.z = p.bounds.minZ;
            if (p.position.z < p.bounds.minZ) p.position.z = p.bounds.maxZ;

            // Apply transform
            // Note: X/Y are treated as Viewport Units (vw/vh) roughly, Z is pixels
            p.el.style.transform = `translate3d(${p.position.x}vw, ${p.position.y}vh, ${p.position.z}px)`;
        });
    }
}
