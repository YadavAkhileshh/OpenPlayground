/**
 * @file weather.js
 * @description Manages global weather state and effects.
 */

import { randomRange } from '../utils/math.js';

export class WeatherSystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.type = 'SUNNY'; // SUNNY, RAIN
        this.intensity = 0;
        this.drops = [];
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    setWeather(type) {
        this.type = type;
        if (type === 'RAIN') {
            this.intensity = 1.0;
            // Init drops
            this.drops = [];
            for (let i = 0; i < 500; i++) {
                this.drops.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    speed: randomRange(10, 20),
                    length: randomRange(10, 20)
                });
            }
        } else {
            this.intensity = 0;
            this.drops = [];
        }
    }

    update(dt) {
        if (this.type === 'RAIN') {
            this.drops.forEach(d => {
                d.y += d.speed;
                if (d.y > this.height) {
                    d.y = -d.length;
                    d.x = Math.random() * this.width;
                }
            });
        }
    }

    draw(ctx) {
        if (this.type === 'RAIN') {
            ctx.save();
            ctx.resetTransform(); // Rain is screen-space
            ctx.strokeStyle = 'rgba(150, 200, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            this.drops.forEach(d => {
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x, d.y + d.length);
            });
            ctx.stroke();
            ctx.restore();
        }
    }

    // Physics modifiers
    getFrictionDetails() {
        if (this.type === 'RAIN') {
            return {
                accelMod: 0.7, // Slower acceleration
                brakeMod: 0.6, // Slippery braking
                gapMod: 1.5    // Cautious drivers increase gap
            };
        }
        return { accelMod: 1, brakeMod: 1, gapMod: 1 };
    }
}
