/**
 * Renderer responsible for updating the DOM based on Physics State.
 * Also handles drawing debug lines/constraints on a canvas overlay.
 */
export class Renderer {
    constructor(world) {
        this.world = world;
        this.canvas = document.getElementById('physics-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Map to store Particle -> Element associations
        // We use a Map where key = Particle, value = HTMLElement
        this.elementMap = new Map();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    // Register a visual element to a physics particle
    bind(particle, element) {
        this.elementMap.set(particle, element);

        // Initialize element position
        this.updateElement(particle, element);
    }

    unbind(particle) {
        this.elementMap.delete(particle);
    }

    render() {
        // 1. Clear Canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 2. Render Constraints (Springs)
        for (const c of this.world.constraints) {
            if (c.draw) {
                c.draw(this.ctx);
            }
        }

        // 3. Update DOM Elements
        for (const [particle, element] of this.elementMap) {
            this.updateElement(particle, element);
        }
    }

    updateElement(particle, element) {
        // We use translate3d for GPU acceleration
        // We need to offset by half the element's size to center it on the particle
        // Or we can assume the particle is the top-left corner.
        // Let's assume particle is Center.

        // However, reading offsetWidth causes reflow. We should cache it or assume 
        // the particle position IS the top-left (easier for DOM).
        // Let's go with: Particle = Top-Left position of the element.

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        const x = particle.pos.x - width / 2;
        const y = particle.pos.y - height / 2;

        // Apply transform
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        // Optional: Squash/Stretch based on velocity?
        // const vel = particle.pos.dist(particle.oldPos);
        // if (vel > 1) { ... }
    }
}
