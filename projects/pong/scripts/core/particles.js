/**
 * @file particles.js
 * @description A specialized particle system designed to simulate arcade-style
 * visual feedback within the main terminal window, echoing events from the 
 * screen-space game world.
 */

const PongParticles = (function () {
    const particles = [];
    let canvas = null;
    let ctx = null;

    /**
     * Particle Class definition
     */
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = (Math.random() - 0.5) * 10;
            this.alpha = 1.0;
            this.life = 1.0;
            this.decay = 0.02 + Math.random() * 0.02;
            this.size = 2 + Math.random() * 3;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            this.alpha = Math.max(0, this.life);
        }

        draw(ctx) {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return {
        init: function () {
            canvas = document.createElement('canvas');
            canvas.id = 'particle-canvas';
            canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 500;
            `;
            document.body.appendChild(canvas);
            ctx = canvas.getContext('2d');

            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            this.loop();
        },

        spawn: function (x, y, color, count = 20) {
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(x, y, color));
            }
        },

        loop: function () {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                p.draw(ctx);
                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }
            requestAnimationFrame(() => this.loop());
        }
    };
})();
