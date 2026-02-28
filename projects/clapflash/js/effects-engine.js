import { Utils, CONSTANTS } from './utils.js';
import { UI } from './ui-manager.js';

class EffectsEngine {
    constructor() {
        this.lastStrike = 0;
        this.count = 0;
        this.isFlickering = false;
    }

    trigger(data) {
        const now = Date.now();
        if (now - this.lastStrike < CONSTANTS.COOLDOWN_MS) return;

        this.lastStrike = now;
        this.count++;

        // Visual Impact
        UI.triggerFlash();
        this.generateStrike(data.intensity);

        // Intensity-based screen shake
        const intensity = Utils.clamp(data.intensity * 2.0, 0.5, 3.0);
        document.documentElement.style.setProperty('--shake-scale', intensity);
        document.body.classList.add('shake-effect');

        setTimeout(() => {
            document.body.classList.remove('shake-effect');
        }, 600);
    }

    generateStrike(intensity) {
        const startX = Math.random() * window.innerWidth;
        const startY = 0;
        const endX = startX + (Math.random() - 0.5) * 400;
        const endY = window.innerHeight;

        const segments = this.createBolt(startX, startY, endX, endY, 6, intensity);

        // Procedural flicker sequence
        let frames = 0;
        const totalFrames = 15;

        const flicker = () => {
            if (frames >= totalFrames) {
                UI.clearLightning();
                return;
            }

            const opacity = Math.random() > 0.5 ? 1 : 0.2;
            UI.drawLightning(segments, opacity * (1 - frames / totalFrames));

            frames++;
            requestAnimationFrame(flicker);
        };

        flicker();
    }

    createBolt(x1, y1, x2, y2, iterations, intensity) {
        let segments = [{ x1, y1, x2, y2 }];
        const offsetAmount = 80 * intensity;

        for (let i = 0; i < iterations; i++) {
            let nextSegments = [];
            segments.forEach(seg => {
                const midX = (seg.x1 + seg.x2) / 2;
                const midY = (seg.y1 + seg.y2) / 2;

                const offsetX = (Math.random() - 0.5) * offsetAmount / (i + 1);
                const offsetY = (Math.random() - 0.5) * offsetAmount / (i + 1);

                nextSegments.push({ x1: seg.x1, y1: seg.y1, x2: midX + offsetX, y2: midY + offsetY });
                nextSegments.push({ x1: midX + offsetX, y2: midY + offsetY, x2: seg.x2, y2: seg.y2 });

                // Potential branching
                if (Math.random() > 0.8 && i < 3) {
                    const branchX = seg.x2 + (Math.random() - 0.5) * 200;
                    const branchY = seg.y2 + Math.random() * 200;
                    nextSegments.push({ x1: midX + offsetX, y2: midY + offsetY, x2: branchX, y2: branchY });
                }
            });
            segments = nextSegments;
        }
        return segments;
    }
}

export const Effects = new EffectsEngine();
