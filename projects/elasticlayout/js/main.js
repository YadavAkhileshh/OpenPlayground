import { PhysicsWorld } from './physics/world.js';
import { Renderer } from './view/renderer.js';
import { Dragger } from './input/dragger.js';
import { Vector } from './math/vector.js';
import { Composite } from './physics/composite.js';
import { Collision } from './physics/collision.js';
import { ForceLayout } from './core/layout_engine.js';
import { DebugUI } from './ui/debug.js';
import { Noise } from './math/noise.js';
import { randomRange } from './utils.js';

// Main Application Logic
class ElasticApp {
    constructor() {
        this.world = new PhysicsWorld();
        this.renderer = new Renderer(this.world);
        this.dragger = new Dragger(this.world, this.renderer);
        this.layoutEngine = new ForceLayout(this.world);
        this.debug = new DebugUI(this.world);
        this.noise = new Noise();

        this.time = 0;

        this.init();
        this.loop();
    }

    init() {
        // 1. Setup Header
        const header = document.getElementById('header-main');
        const headerP = this.world.addParticle(window.innerWidth / 2, 40, 10, false);
        this.renderer.bind(headerP, header);

        const ha1 = this.world.addParticle(window.innerWidth * 0.2, 0, 1, true);
        const ha2 = this.world.addParticle(window.innerWidth * 0.8, 0, 1, true);

        this.world.addConstraint(ha1, headerP, null, 0.05);
        this.world.addConstraint(ha2, headerP, null, 0.05);


        // 2. Setup Sidebar
        const sidebar = document.getElementById('sidebar-main');
        const sidebarP = this.world.addParticle(150, window.innerHeight / 2, 5, false);
        this.renderer.bind(sidebarP, sidebar);

        const sa1 = this.world.addParticle(0, window.innerHeight * 0.2, 1, true);
        const sa2 = this.world.addParticle(0, window.innerHeight * 0.8, 1, true);

        this.world.addConstraint(sa1, sidebarP, 200, 0.05);
        this.world.addConstraint(sa2, sidebarP, 200, 0.05);

        this.world.addConstraint(headerP, sidebarP, 400, 0.01);


        // 3. Setup Cards
        const card1 = document.getElementById('card-1');
        const card2 = document.getElementById('card-2');
        const card3 = document.getElementById('card-3');

        const p1 = this.world.addParticle(window.innerWidth * 0.4, window.innerHeight * 0.4, 3, false);
        const p2 = this.world.addParticle(window.innerWidth * 0.6, window.innerHeight * 0.5, 3, false);
        const p3 = this.world.addParticle(window.innerWidth * 0.5, window.innerHeight * 0.7, 3, false);

        this.renderer.bind(p1, card1);
        this.renderer.bind(p2, card2);
        this.renderer.bind(p3, card3);

        this.world.addConstraint(p1, p2, 250, 0.03);
        this.world.addConstraint(p2, p3, 250, 0.03);
        this.world.addConstraint(p3, p1, 250, 0.03);

        this.world.addConstraint(sidebarP, p1, 300, 0.01);
        this.world.addConstraint(headerP, p2, 300, 0.01);


        // 4. Floating Button
        const btn = document.getElementById('floating-btn');
        const btnP = this.world.addParticle(window.innerWidth - 100, window.innerHeight - 100, 2, false);
        this.renderer.bind(btnP, btn);

        const btnAnchor = this.world.addParticle(window.innerWidth, window.innerHeight, 1, true);
        this.world.addConstraint(btnAnchor, btnP, 150, 0.1);

        // Store interactive data
        p1.userData = { element: card1 };
        p2.userData = { element: card2 };
        p3.userData = { element: card3 };
        headerP.userData = { element: header };
        sidebarP.userData = { element: sidebar };
        btnP.userData = { element: btn };

        // 5. Create a soft-body background decoration
        // A net that waves in the wind
        const cols = 12;
        const rows = 8;
        const startX = window.innerWidth * 0.2;
        const startY = window.innerHeight * 0.1;
        const gap = 60;

        const net = Composite.createCloth(this.world, startX, startY, cols, rows, gap, 0.3);
        this.netParticles = net.particles; // Reference for wind application

        // Pin the top row
        for (let i = 0; i < cols; i++) {
            net.particles[i].isPinned = true;
        }

        // Add net constraints draw logic
        for (const c of net.constraints) {
            c.draw = (ctx) => {
                ctx.beginPath();
                ctx.moveTo(c.p1.pos.x, c.p1.pos.y);
                ctx.lineTo(c.p2.pos.x, c.p2.pos.y);
                ctx.strokeStyle = 'rgba(88, 166, 255, 0.05)'; // Very subtle
                ctx.lineWidth = 1;
                ctx.stroke();
            };
            // Note: createCloth already added them to the world, NO PUSH needed.
        }
    }

    loop() {
        this.time += 0.01;

        // Apply Wind Force via Perlin Noise
        const windStrength = 0.5;
        this.netParticles.forEach((p, index) => {
            if (!p.isPinned) {
                // Noise based on position and time
                const n = this.noise.noise(p.pos.x * 0.01, p.pos.y * 0.01, this.time);
                p.applyForce(new Vector(n * windStrength, 0));
            }
        });

        // Apply Force Layout (Repulsion between UI elements to keep them clean)
        // this.layoutEngine.apply(); // Optional: Enable if things get too cluttered

        // Step Physics
        this.world.update();

        // Solve Collisions (e.g. between cards)
        // Ideally we'd loop through all pairs, but for performance let's just do UI elements
        const uiParticles = this.world.particles.filter(p => p.userData && p.userData.element);
        for (let i = 0; i < uiParticles.length; i++) {
            for (let j = i + 1; j < uiParticles.length; j++) {
                Collision.resolve(uiParticles[i], uiParticles[j]); // Requires changing collision.js to static if it is static
            }
        }

        // Render
        this.renderer.render();

        // Debug
        this.debug.update();

        requestAnimationFrame(() => this.loop());
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    new ElasticApp();
});
