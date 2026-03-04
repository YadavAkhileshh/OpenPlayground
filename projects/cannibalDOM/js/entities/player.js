/* js/entities/player.js */
import { CONSTANTS } from '../utils/constants.js';

export class Player {
    constructor(selector, input, hud) {
        this.element = document.querySelector(selector);
        this.input = input;
        this.hud = hud;

        this.x = 0;
        this.y = 0;
        this.speed = CONSTANTS.PLAYER_SPEED;
        this.size = CONSTANTS.PLAYER_START_SIZE;

        this.absorbedStyles = {
            backgroundColor: '#ff4757',
            borderRadius: '0px',
            boxShadow: 'none',
            border: 'none',
            opacity: '1'
        };

        // Stats
        this.mass = 10;
        this.consumedCount = 0;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.updateTransform();
    }

    update(deltaTime) {
        const axis = this.input.getAxis();

        this.x += axis.x * this.speed * deltaTime;
        this.y += axis.y * this.speed * deltaTime;

        // Boundary checks
        this.x = Math.max(0, Math.min(this.x, CONSTANTS.WORLD_WIDTH));
        this.y = Math.max(0, Math.min(this.y, CONSTANTS.WORLD_HEIGHT));

        this.updateTransform();
    }

    updateTransform() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    grow(amount) {
        this.mass += amount;
        if (this.mass < 5) this.mass = 5; // Min size

        // Diminishing returns on size growth
        const newSize = 30 + (Math.sqrt(this.mass) * 5);

        this.size = newSize;
        this.element.style.width = `${newSize}px`;
        this.element.style.height = `${newSize}px`;

        // Update stats
        if (this.hud) {
            this.hud.updateStats(this.mass, this.consumedCount); // Don't increment count here if it's shrinking
        }
    }

    applyStyle(styleProp, value) {
        if (!value) return;

        if (styleProp === 'width' || styleProp === 'height' || styleProp === 'position' || styleProp === 'transform') return;

        this.element.style[styleProp] = value;
        this.absorbedStyles[styleProp] = value;

        if (this.hud && styleProp === 'backgroundColor') {
            this.hud.addTrait('Color', value);
        }

        // Evolve?
        if (this.consumedCount > 10) {
            this.element.classList.add('player-circle');
        }
        if (this.consumedCount > 30) {
            this.element.classList.add('player-neon');
        }
    }

    getRect() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.size,
            bottom: this.y + this.size,
            width: this.size,
            height: this.size
        };
    }
}
