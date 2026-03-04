/* js/entities/enemy.js */
export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.speed = 150;
        this.color = '#000'; // Will be set by theme usually

        this.element = document.createElement('div');
        this.element.className = 'enemy';
        this.element.style.position = 'absolute';
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.backgroundColor = this.color;
        this.element.style.borderRadius = '50%'; // Circle
        this.element.style.border = '2px solid red';
        this.element.style.zIndex = '600';

        // Add to world
        document.getElementById('world').appendChild(this.element);
        this.updateTransform();
    }

    updateTransform() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
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

    remove() {
        this.element.remove();
    }
}
