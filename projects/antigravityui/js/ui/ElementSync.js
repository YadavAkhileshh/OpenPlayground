// js/ui/ElementSync.js
import { Body } from '../physics/Body.js';
import { Vector2D } from '../core/Vector2D.js';
import { UI_CLASSES } from '../config/theme.js';

export class ElementSync {
    constructor(engine) {
        this.engine = engine;
        this.elementMap = new Map(); // Map DOM Element -> Body
        this.bodyMap = new Map();    // Map Body -> DOM Element
    }

    /**
     * Parse all DOM elements with the specified class and add them to the physics world
     * @param {string} className 
     */
    initFromDOM(className = UI_CLASSES.BODY) {
        const elements = document.querySelectorAll(`.${className}`);
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;

        elements.forEach((el, index) => {
            // Get dimensions
            const rect = el.getBoundingClientRect();

            // Generate distinct starting points if position is (0,0) due to absolute positioning
            // For a cooler effect, scatter them at the bottom so they float up
            const startX = (viewWidth * 0.1) + (Math.random() * (viewWidth * 0.8));
            const startY = viewHeight - (Math.random() * 200) - rect.height;

            // Extract mass from data attribute if exists
            const massAttr = el.getAttribute('data-mass');
            const mass = massAttr ? parseFloat(massAttr) : 1.0;

            const body = new Body(startX, startY, rect.width, rect.height, mass);

            // Add some initial random velocity
            body.velocity.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * -2);

            this.engine.addBody(body);

            // Store mapping
            this.elementMap.set(el, body);
            this.bodyMap.set(body, el);

            // Mark as synced so CSS fades them in
            el.classList.add(UI_CLASSES.SYNCED);
        });

        // Setup dragging events
        this.setupDragEvents();
    }

    setupDragEvents() {
        this.elementMap.forEach((body, el) => {
            let isDragging = false;
            let offset = new Vector2D();

            const onPointerDown = (e) => {
                isDragging = true;
                body.isDragged = true;
                body.velocity.set(0, 0); // Stop movement immediately
                el.classList.add(UI_CLASSES.INTERACTING);

                // Calculate grab offset relative to body origin
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                offset.set(clientX - body.position.x, clientY - body.position.y);

                // Bring to front by moving in DOM (or z-index, but DOM append works)
                el.parentNode.appendChild(el);
            };

            const onPointerMove = (e) => {
                if (!isDragging) return;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                body.setPosition(clientX - offset.x, clientY - offset.y);
                // We keep velocity 0 while dragging
            };

            const onPointerUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                body.isDragged = false;
                el.classList.remove(UI_CLASSES.INTERACTING);

                // Impart throw velocity based on recent mouse move could go here
                // For simplicity, we just release them and let gravity take over
            };

            el.addEventListener('mousedown', onPointerDown);
            window.addEventListener('mousemove', onPointerMove);
            window.addEventListener('mouseup', onPointerUp);

            // Basic touch support
            el.addEventListener('touchstart', onPointerDown, { passive: true });
            window.addEventListener('touchmove', onPointerMove, { passive: false });
            window.addEventListener('touchend', onPointerUp);
        });
    }

    /**
     * Should be called every frame after physics update
     */
    updateDOM() {
        this.elementMap.forEach((body, el) => {
            // Use CSS transform for performant rendering
            el.style.transform = `translate(${body.position.x}px, ${body.position.y}px)`;

            // Add visual cue for collision (needs engine support to track active collisions, kept simple for now)
        });
    }
}
