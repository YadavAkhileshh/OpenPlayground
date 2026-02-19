/**
 * HelixVisualizer
 * Renders a rotating DNA helix on canvas.
 */
import { getBaseColor, lerp } from './utils.js';

export class HelixVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;

        this.particles = [];
        this.rotation = 0;
        this.speed = 0.02;
        this.targetSpeed = 0.02;

        this.sequence = []; // Array of active nucleotides from playback
        this.activeCodonIndex = -1;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.loop();
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    updateSequence(sequenceData) {
        this.sequence = sequenceData;
    }

    setActiveIndex(index) {
        this.activeCodonIndex = index;
    }

    setActivityLevel(level) {
        // level 0 - 1 maps to rotation speed and amplitude
        this.targetSpeed = 0.02 + (level * 0.1);
    }

    loop() {
        requestAnimationFrame(() => this.loop());

        // Clear with trails
        this.ctx.fillStyle = 'rgba(20, 22, 31, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Update Rotation
        // Smooth lerp speed
        this.speed = lerp(this.speed, this.targetSpeed, 0.05);
        this.rotation += this.speed;

        this.drawHelix();
    }

    drawHelix() {
        const time = Date.now() * 0.001;
        const strandCount = 40; // Visible base pairs
        const spacing = this.height / (strandCount + 10);
        const amplitude = this.width * 0.15; // Width of helix

        // Center vertically but scroll based on active index (illusion of reading)
        // Actually, let's keep helix constant and highlight passing data using "Ghost" data overlay

        // Base Helix
        for (let i = 0; i < strandCount; i++) {
            const y = (i * spacing) + (this.height * 0.1);
            const offset = i * 0.5 + this.rotation;

            // 3D Projection X coordinates
            const x1 = (this.width / 2) + Math.sin(offset) * amplitude;
            const x2 = (this.width / 2) + Math.sin(offset + Math.PI) * amplitude;

            // Depth for size/opacity (simple Z-buffer fake)
            const z1 = Math.cos(offset); // 1 = front, -1 = back
            const z2 = Math.cos(offset + Math.PI);

            const scale1 = 1 + (z1 * 0.3);
            const scale2 = 1 + (z2 * 0.3);

            const alpha1 = 0.3 + ((z1 + 1) / 2) * 0.7; // 0.3 to 1.0
            const alpha2 = 0.3 + ((z2 + 1) / 2) * 0.7;

            // Draw Connector (Hydrogen Bond)
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * Math.min(alpha1, alpha2)})`;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y);
            this.ctx.lineTo(x2, y);
            this.ctx.stroke();

            // Determines Base Colors
            // If we have sequence data, map it to the visible strands
            // We want the helix to look like it's streaming sequence data
            let base1Color = '#3b82f6'; // Default A
            let base2Color = '#ef4444'; // Default T

            // Simulate visualization of "current codon" centered
            const centerIndex = Math.floor(strandCount / 2);
            const distFromCenter = Math.abs(i - centerIndex);

            // If active index is set, we can colorize specific strands to show "reading"
            if (this.activeCodonIndex !== -1 && distFromCenter < 2) {
                // Flash effect for active read head
                const intensity = (Math.sin(time * 10) + 1) / 2; // 0 to 1
                this.ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.2})`;
                this.ctx.fillRect(0, y - spacing / 2, this.width, spacing);
            }

            // Draw Nucleotides
            this.drawNucleotide(x1, y, scale1, base1Color, alpha1);
            this.drawNucleotide(x2, y, scale2, base2Color, alpha2);
        }
    }

    drawNucleotide(x, y, scale, color, alpha) {
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
    }
}
