import { CONFIG } from '../utils/constants.js';

/**
 * @fileoverview High-fidelity renderer for Newton's Cradle.
 * Combines DOM elements for balls and SVG for strings to achieve
 * a realistic metallic aesthetic with smooth motion.
 */
export class Renderer {
    /**
     * @param {HTMLElement} container - The main cradle container.
     * @param {Pendulum[]} balls - Balls to render.
     */
    constructor(container, balls) {
        this.container = container;
        this.balls = balls;

        // SVG overlay for strings
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("class", "cradle-svg");
        this.container.appendChild(this.svg);

        // DOM elements for balls (better for CSS shadows/gradients)
        this.ballElements = [];
        this.stringElements = [];

        this.initElements();
    }

    /**
     * Create the visual elements for balls and strings.
     */
    initElements() {
        this.balls.forEach((ball, i) => {
            // Create String (SVG Line)
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("stroke", CONFIG.COLORS.STRING);
            line.setAttribute("stroke-width", "1");
            this.svg.appendChild(line);
            this.stringElements.push(line);

            // Create Ball (HTML Div)
            const ballEl = document.createElement("div");
            ballEl.className = "ball";
            ballEl.style.width = `${ball.radius * 2}px`;
            ballEl.style.height = `${ball.radius * 2}px`;

            // Add a highlight overlay for extra metallic feel
            const highlight = document.createElement("div");
            highlight.className = "ball-highlight";
            ballEl.appendChild(highlight);

            this.container.appendChild(ballEl);
            this.ballElements.push(ballEl);
        });
    }

    /**
     * Update visual positions of all elements.
     * Called every frame in the animation loop.
     */
    render() {
        this.balls.forEach((ball, i) => {
            const ballEl = this.ballElements[i];
            const stringEl = this.stringElements[i];

            // Update Ball position (CSS transform for performance)
            // Center the ball at (ballX, ballY)
            const tx = ball.ballX - ball.radius;
            const ty = ball.ballY - ball.radius;
            ballEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

            // Update String positions
            stringEl.setAttribute("x1", ball.anchorX);
            stringEl.setAttribute("y1", ball.anchorY);
            stringEl.setAttribute("x2", ball.ballX);
            stringEl.setAttribute("y2", ball.ballY);
        });
    }

    /**
     * Resize the SVG to match container.
     */
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.svg.setAttribute("width", rect.width);
        this.svg.setAttribute("height", rect.height);
    }
}
