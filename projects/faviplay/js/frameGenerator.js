/**
 * FaviPlay - Frame Generator
 * Generates SVG frames for various animation sequences
 */

class FrameGenerator {
    constructor() {
        this.iconSize = 32;
        this.customColor = '#6366f1'; // Default color
        this.sequences = {
            spinner: { frames: 24, name: 'Spinner', defaultColor: '#6366f1' },
            bouncingBall: { frames: 30, name: 'Bouncing Ball', defaultColor: '#8b5cf6' },
            progressBar: { frames: 40, name: 'Progress Bar', defaultColor: '#10b981' },
            pulse: { frames: 30, name: 'Pulse', defaultColor: '#ec4899' },
            wave: { frames: 40, name: 'Wave', defaultColor: '#06b6d4' },
            clock: { frames: 60, name: 'Clock', defaultColor: '#f59e0b' }
        };
    }

    /**
     * Set custom color for animations
     */
    setColor(color) {
        this.customColor = color;
    }

    /**
     * Get the number of frames for a sequence
     */
    getFrameCount(sequenceName) {
        return this.sequences[sequenceName]?.frames || 24;
    }

    /**
     * Generate a frame for the specified sequence
     */
    generateFrame(sequenceName, frameIndex) {
        const method = `generate${this.capitalize(sequenceName)}`;
        if (typeof this[method] === 'function') {
            return this[method](frameIndex);
        }
        return this.generateSpinner(frameIndex);
    }

    /**
     * Capitalize first letter of string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Create base SVG structure
     */
    createSVG(content, backgroundColor = null) {
        const bgColor = backgroundColor || this.customColor;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.iconSize} ${this.iconSize}">
            <rect width="${this.iconSize}" height="${this.iconSize}" fill="${bgColor}" rx="6"/>
            ${content}
        </svg>`;
    }

    /**
     * Linear interpolation utility
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Easing function - ease in out
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    /**
     * Easing function - ease out bounce
     */
    easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    /**
     * Generate Spinner animation frame
     */
    generateSpinner(frameIndex) {
        const totalFrames = this.sequences.spinner.frames;
        const rotation = (frameIndex / totalFrames) * 360;
        const center = this.iconSize / 2;
        const radius = 10;

        // Create circular arc that rotates
        const startAngle = rotation;
        const endAngle = rotation + 270;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        const content = `
            <path d="M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}" 
                  stroke="#ffffff" 
                  stroke-width="3" 
                  fill="none" 
                  stroke-linecap="round"/>
        `;

        return this.createSVG(content);
    }

    /**
     * Generate Bouncing Ball animation frame
     */
    generateBouncingBall(frameIndex) {
        const totalFrames = this.sequences.bouncingBall.frames;
        const t = frameIndex / totalFrames;

        // Ball bounces from top to bottom
        const bounceT = this.easeOutBounce(t);
        const centerX = this.iconSize / 2;
        const topY = 8;
        const bottomY = this.iconSize - 8;
        const ballY = this.lerp(topY, bottomY, bounceT);
        const ballRadius = 6;

        // Squash and stretch effect
        const squashFactor = Math.abs(Math.sin(t * Math.PI * 2)) * 0.3;
        const scaleY = 1 - squashFactor;
        const scaleX = 1 + squashFactor;

        const content = `
            <ellipse cx="${centerX}" cy="${ballY}" 
                     rx="${ballRadius * scaleX}" 
                     ry="${ballRadius * scaleY}" 
                     fill="#ffffff"/>
            <line x1="6" y1="${bottomY + 2}" x2="${this.iconSize - 6}" y2="${bottomY + 2}" 
                  stroke="#ffffff" 
                  stroke-width="2" 
                  opacity="0.3" 
                  stroke-linecap="round"/>
        `;

        return this.createSVG(content, '#8b5cf6');
    }

    /**
     * Generate Progress Bar animation frame
     */
    generateProgressBar(frameIndex) {
        const totalFrames = this.sequences.progressBar.frames;
        const progress = frameIndex / totalFrames;

        const barWidth = this.iconSize - 12;
        const barHeight = 6;
        const barX = 6;
        const barY = (this.iconSize - barHeight) / 2;
        const fillWidth = barWidth * progress;

        // Percentage text
        const percentage = Math.round(progress * 100);

        const content = `
            <rect x="${barX}" y="${barY}" 
                  width="${barWidth}" 
                  height="${barHeight}" 
                  fill="rgba(255,255,255,0.2)" 
                  rx="3"/>
            <rect x="${barX}" y="${barY}" 
                  width="${fillWidth}" 
                  height="${barHeight}" 
                  fill="#ffffff" 
                  rx="3"/>
            <text x="${this.iconSize / 2}" y="${barY - 4}" 
                  text-anchor="middle" 
                  font-family="Arial, sans-serif" 
                  font-size="8" 
                  font-weight="bold" 
                  fill="#ffffff">${percentage}%</text>
        `;

        return this.createSVG(content, '#10b981');
    }

    /**
     * Generate Pulse animation frame
     */
    generatePulse(frameIndex) {
        const totalFrames = this.sequences.pulse.frames;
        const t = frameIndex / totalFrames;

        // Pulse in and out
        const pulseT = this.easeInOutQuad(Math.abs(Math.sin(t * Math.PI)));
        const minRadius = 6;
        const maxRadius = 12;
        const radius = this.lerp(minRadius, maxRadius, pulseT);
        const center = this.iconSize / 2;

        // Opacity also pulses
        const opacity = this.lerp(0.5, 1, pulseT);

        const content = `
            <circle cx="${center}" cy="${center}" r="${maxRadius}" 
                    fill="#ffffff" 
                    opacity="0.1"/>
            <circle cx="${center}" cy="${center}" r="${radius}" 
                    fill="#ffffff" 
                    opacity="${opacity}"/>
        `;

        return this.createSVG(content, '#ec4899');
    }

    /**
     * Generate Wave animation frame
     */
    generateWave(frameIndex) {
        const totalFrames = this.sequences.wave.frames;
        const t = frameIndex / totalFrames;

        // Create sine wave
        const points = [];
        const numPoints = 20;
        const amplitude = 8;
        const frequency = 2;
        const phase = t * Math.PI * 2;

        for (let i = 0; i <= numPoints; i++) {
            const x = (i / numPoints) * this.iconSize;
            const normalizedX = i / numPoints;
            const y = this.iconSize / 2 +
                Math.sin(normalizedX * Math.PI * frequency + phase) * amplitude;
            points.push(`${x},${y}`);
        }

        const pathData = `M ${points.join(' L ')}`;

        const content = `
            <path d="${pathData}" 
                  stroke="#ffffff" 
                  stroke-width="3" 
                  fill="none" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"/>
            <circle cx="${this.iconSize / 2}" cy="${this.iconSize / 2}" r="2" fill="#ffffff"/>
        `;

        return this.createSVG(content, '#06b6d4');
    }

    /**
     * Generate Clock animation frame
     */
    generateClock(frameIndex) {
        const totalFrames = this.sequences.clock.frames;
        const t = frameIndex / totalFrames;

        const center = this.iconSize / 2;
        const clockRadius = 12;

        // Hour hand (completes rotation in full cycle)
        const hourAngle = t * 360 - 90; // Start from top
        const hourLength = 6;
        const hourRad = (hourAngle * Math.PI) / 180;
        const hourX = center + hourLength * Math.cos(hourRad);
        const hourY = center + hourLength * Math.sin(hourRad);

        // Minute hand (rotates 12x faster)
        const minuteAngle = (t * 12 * 360) - 90;
        const minuteLength = 9;
        const minuteRad = (minuteAngle * Math.PI) / 180;
        const minuteX = center + minuteLength * Math.cos(minuteRad);
        const minuteY = center + minuteLength * Math.sin(minuteRad);

        // Clock face markers
        let markers = '';
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const markerRadius = clockRadius - 2;
            const markerX = center + markerRadius * Math.cos(angle);
            const markerY = center + markerRadius * Math.sin(angle);
            markers += `<circle cx="${markerX}" cy="${markerY}" r="0.8" fill="#ffffff" opacity="0.5"/>`;
        }

        const content = `
            <circle cx="${center}" cy="${center}" r="${clockRadius}" 
                    stroke="#ffffff" 
                    stroke-width="2" 
                    fill="none" 
                    opacity="0.3"/>
            ${markers}
            <line x1="${center}" y1="${center}" x2="${hourX}" y2="${hourY}" 
                  stroke="#ffffff" 
                  stroke-width="2.5" 
                  stroke-linecap="round"/>
            <line x1="${center}" y1="${center}" x2="${minuteX}" y2="${minuteY}" 
                  stroke="#ffffff" 
                  stroke-width="2" 
                  stroke-linecap="round"/>
            <circle cx="${center}" cy="${center}" r="2" fill="#ffffff"/>
        `;

        return this.createSVG(content, '#f59e0b');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrameGenerator;
}
