/**
 * @file DigitalRain.js
 * @description Advanced Digital Rain effect with persistent streams and fading trails.
 * Coordinates with the main renderer grid.
 */

import { MathUtils } from '../utils/MathUtils.js';

class Stream {
    constructor(x, y, speed, length, fontSize, canvasHeight) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.length = length;
        this.fontSize = fontSize;
        this.canvasHeight = canvasHeight;
        this.chars = [];
        this.firstChar = '';

        this.generateChars();
    }

    generateChars() {
        // Generate random katakana or binary
        const charset = 'abcdefghijklmnopqrstuvwxyz0123456789アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        this.chars = [];
        for (let i = 0; i < this.length; i++) {
            this.chars.push(charset.charAt(Math.floor(Math.random() * charset.length)));
        }
        this.firstChar = this.chars[0]; // The glowing lead character
    }

    update() {
        this.y += this.speed;

        // Randomly change characters in the stream to simulate "data processing"
        if (Math.random() > 0.95) {
            const idx = Math.floor(Math.random() * this.length);
            const charset = '01'; // Flip bits occasionally
            this.chars[idx] = charset.charAt(Math.floor(Math.random() * charset.length));
        }

        // Reset if off screen
        if (this.y - (this.length * this.fontSize) > this.canvasHeight) {
            this.y = -Math.random() * 500; // Delay reset
            this.speed = MathUtils.randomRange(2, 5); // Randomize speed
            this.generateChars(); // New data
        }
    }

    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.font = \`\${this.fontSize}px monospace\`;

        for (let i = 0; i < this.length; i++) {
            // Calculate position of this character in the stream
            const charY = this.y - (i * this.fontSize);
            
            // Don't draw if off screen
            if (charY < 0 || charY > this.canvasHeight) continue;

            const char = this.chars[i];

            // Color logic
            if (i === 0) {
                // Leading character is bright white/green
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#0f0';
            } else { // Trailing characters fade out
                // Opacity based on position in tail
                const opacity = 1 - (i / this.length);
                ctx.fillStyle = \`rgba(0, 255, 0, \${opacity})\`;
                ctx.shadowBlur = 0;
            }

            // Draw
            ctx.fillText(char, this.x, charY);
        }
    }
}

export class DigitalRain {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config || { density: 14 }; // Default if not provided
        this.streams = [];
        this.initialized = false;
        
        window.addEventListener('resize', () => this.resize());
    }

    initialize() {
        this.resize();
        this.initialized = true;
    }

    resize() {
        if (!this.ctx.canvas) return;
        
        const width = this.ctx.canvas.width;
        const height = this.ctx.canvas.height;
        const fontSize = this.config.density;
        const columns = Math.floor(width / fontSize);
        
        this.streams = [];
        
        // Create a stream for each column, but randomize start times
        for (let i = 0; i < columns; i++) {
            const x = i * fontSize + (fontSize / 2); // Center in column
            const y = Math.random() * -1000; // Start above screen
            const speed = MathUtils.randomRange(2, 8);
            const length = MathUtils.randomRange(5, 25); // Tail length
            
            this.streams.push(new Stream(x, y, speed, length, fontSize, height));
        }
    }

    update(deltaTime) {
        if (!this.initialized) this.initialize();
        
        this.streams.forEach(stream => stream.update());
    }

    draw() {
        this.ctx.save();
        // Since this is an overlay, we might want to use a specific composite operation
        // But for "Matrix" look, additive or just standard alpha blending works
        
        this.streams.forEach(stream => stream.draw(this.ctx));
        
        this.ctx.restore();
    }
}
