// js/ui/ParticleSystem.js
import { Vector2D } from '../core/Vector2D.js';
import { ColorUtils } from '../core/ColorUtils.js';

class Particle {
    constructor(x, y, color) {
        this.position = new Vector2D(x, y);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.velocity = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 4 + 2;
        this.color = color;

        // DOM Element
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.backgroundColor = this.color;
        this.element.style.borderRadius = '50%';
        this.element.style.pointerEvents = 'none';
        this.element.style.zIndex = '90'; // Behind floating UI but above background
        this.element.style.boxShadow = `0 0 ${this.size * 2}px ${this.color}`;

        document.getElementById('physics-container').appendChild(this.element);
    }

    update() {
        this.position.add(this.velocity);
        this.life -= this.decay;

        // Apply upward drift (anti-gravity dust)
        this.velocity.y -= 0.05;
        this.velocity.mult(0.95); // Drag

        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px) scale(${this.life})`;
        this.element.style.opacity = this.life;
    }

    destroy() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.active = true;
    }

    emit(x, y, count = 10, colorStr = null) {
        if (!this.active) return;

        const c = colorStr || ColorUtils.randomCosmicColor();
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, c));
        }
    }

    update() {
        if (!this.active) return;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();

            if (p.life <= 0) {
                p.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
}
