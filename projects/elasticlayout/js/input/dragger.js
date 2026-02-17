import { Vector } from '../math/vector.js';

export class Dragger {
    constructor(world, renderer) {
        this.world = world;
        this.renderer = renderer; // To maybe highlight selected
        this.dragNode = null;
        this.isDragging = false;

        this.mouse = new Vector(0, 0);
        this.prevMouse = new Vector(0, 0);

        // Attach event listeners
        const app = document.getElementById('app');

        // Mouse Events
        app.addEventListener('mousedown', (e) => this.onStart(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => this.onMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', () => this.onEnd());

        // Touch Events
        app.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.onStart(touch.clientX, touch.clientY);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.onMove(touch.clientX, touch.clientY);
        }, { passive: false }); // passive: false to allow preventDefault if needed

        window.addEventListener('touchend', () => this.onEnd());
    }

    onStart(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.prevMouse.x = x;
        this.prevMouse.y = y;

        // Find particle under mouse
        // We look for particles that have DOM elements attached usually
        const particle = this.world.findParticleNear(x, y, 50); // 50px radius

        if (particle) {
            this.dragNode = particle;
            this.isDragging = true;

            // Interaction visual cue
            if (particle.userData && particle.userData.element) {
                particle.userData.element.style.cursor = 'grabbing';
                particle.userData.element.classList.add('grabbing');
            }

            // Stop movement while dragging to give full control
            // particle.oldPos = particle.pos.copy();

            // We temporarily increase user control by resetting velocity
        }
    }

    onMove(x, y) {
        this.prevMouse.x = this.mouse.x;
        this.prevMouse.y = this.mouse.y;
        this.mouse.x = x;
        this.mouse.y = y;

        if (this.isDragging && this.dragNode) {
            // Directly set position for 1:1 control
            this.dragNode.pos.x = x;
            this.dragNode.pos.y = y;

            // Also update oldPos to simulate velocity when released ("throw")
            // Velocity = pos - oldPos
            // If we drag fast, pos changes fast.
            // We want the particle to have velocity = mouseVelocity
            this.dragNode.oldPos.x = x - (x - this.prevMouse.x);
            this.dragNode.oldPos.y = y - (y - this.prevMouse.y);

            // Pin it so physics doesn't fight the mouse
            // But we already setting pos directly.
        }
    }

    onEnd() {
        if (this.dragNode) {
            if (this.dragNode.userData && this.dragNode.userData.element) {
                this.dragNode.userData.element.style.cursor = 'grab';
                this.dragNode.userData.element.classList.remove('grabbing');
            }
            this.dragNode = null;
            this.isDragging = false;
        }
    }
}
