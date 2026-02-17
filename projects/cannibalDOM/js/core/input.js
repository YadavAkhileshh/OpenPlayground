/* js/core/input.js */
export class InputHandler {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            a: false,
            s: false,
            d: false
        };

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = true;
        }
    }

    onKeyUp(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = false;
        }
    }

    getAxis() {
        const x = (this.keys.ArrowRight || this.keys.d ? 1 : 0) - (this.keys.ArrowLeft || this.keys.a ? 1 : 0);
        const y = (this.keys.ArrowDown || this.keys.s ? 1 : 0) - (this.keys.ArrowUp || this.keys.w ? 1 : 0);

        // Normalize vector if moving diagonally
        if (x !== 0 && y !== 0) {
            const mag = Math.sqrt(x * x + y * y);
            return { x: x / mag, y: y / mag };
        }

        return { x, y };
    }
}
