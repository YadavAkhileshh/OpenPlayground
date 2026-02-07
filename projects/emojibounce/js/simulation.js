import { Emoji } from './emoji.js';
import { Physics } from './physics.js';
import { AudioController } from './audio.js';
import { ParticleSystem } from './particles.js';
import { Interaction } from './interaction.js';
import { Portals } from './portals.js';
import { Zones } from './zones.js';

export class Simulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.width = canvas.width;
        this.height = canvas.height;

        this.emojis = [];
        this.walls = []; // Array of {start: {x,y}, end: {x,y}}
        this.emojiList = ['😀', '😂', '🥰', '😎', '🤔', '😴', '🥶', '🤯', '🥳', '👻', '👽', '🤖', '💩', '🦄', '🔥', '✨', '🌈', '⚽', '🏀', '🍕', '🚀', '🎈', '🎉', '💎', '💣', '🗿', '🎈'];

        this.config = {
            gravity: 0.5,
            bounciness: 0.7,
            timeScale: 1.0
        };

        this.audio = new AudioController();
        this.particles = new ParticleSystem();
        this.portals = new Portals(this.audio);
        this.zones = new Zones();

        // Add default fun stuff
        this.zones.addZone(100, window.innerHeight - 200, 300, 150, 'water');

        this.physics = new Physics(this.config, this.audio, this.particles);
        this.interaction = new Interaction(this);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.lastTime = 0;
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
    }

    spawnEmoji(x, y) {
        let char = this.emojiList[Math.floor(Math.random() * this.emojiList.length)];

        if (this.overrideChar) {
            char = this.overrideChar;
        }

        const size = 30 + Math.random() * 50;
        this.emojis.push(new Emoji(x, y, char, size));
        this.audio.playSpawn();
        this.updateStats();
    }

    findEmojiAt(x, y) {
        // Reverse search to grab top-most
        for (let i = this.emojis.length - 1; i >= 0; i--) {
            const e = this.emojis[i];
            const dx = e.x - x;
            const dy = e.y - y;
            if (dx * dx + dy * dy < e.radius * e.radius) {
                return e;
            }
        }
        return null;
    }

    addWallPoint(x, y, startNew = false) {
        if (startNew || this.walls.length === 0) {
            // Just a marker, logic handles segments
            // We need to store path points to create segments?
            // Actually, interaction sends segments? 
            // Let's just track the last point in interaction, but store segments here.
            // Wait, Interaction handles the drawing logic (dragging).
            // It calls addWallPoint(x,y). We need to connect to previous point if not startNew.

            // Actually simpler: Interaction tracks the path. Simulation just renders static walls?
            // No, Interaction needs to tell simulation "here is a new permanent wall segment".
            // But while drawing, we want to see it.
        }
        // Let's refine: Interaction maintains "current drawing path".
        // When user releases (handleEnd), we finalize it into walls?
        // Or live update? Live update is better.

        // Let's implement simpler: `walls` is array of lines.
        // Interaction calls `addWallSegment(p1, p2)`?
        // Let's stick to what Interaction was doing: `addWallPoint`.
        // Let's change Interaction to just push to `this.walls`.
    }

    // Better: Helper to add a permanent segment
    addWallSegment(p1, p2) {
        this.walls.push({ start: { ...p1 }, end: { ...p2 } });
    }

    clear() {
        this.emojis = [];
        this.walls = [];
        this.updateStats();
    }

    updateStats() {
        // Dispatch event for UI to pick up? Or direct DOM?
        // Let's keep direct DOM for simplicity or use UI class callback if we had one.
        // UI class polls or listens events? UI reference?
        // Sim interacts with UI? No, separation of concerns.
        // Just emit event
        window.dispatchEvent(new CustomEvent('stats-update', { detail: { count: this.emojis.length } }));
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000 * this.config.timeScale;
        this.lastTime = timestamp;

        const safeDt = Math.min(dt, 0.1);

        this.update(safeDt);
        this.draw();

        requestAnimationFrame(this.loop);
    }

    update(dt) {
        this.interaction.update(dt);
        this.particles.update(dt);

        const subSteps = 2;
        const stepDt = dt / subSteps;

        for (let s = 0; s < subSteps; s++) {
            for (let emoji of this.emojis) {
                // Apply Zones (Water/Wind)
                this.zones.apply(emoji, stepDt);

                emoji.update(stepDt, this.config.gravity);

                // Portals
                this.portals.checkTeleport(emoji);

                this.physics.resolveWallCollision(emoji, this.width, this.height);

                // Drawn Walls
                for (const wall of this.walls) {
                    this.physics.resolveLineCollision(emoji, wall.start, wall.end);
                }
            }

            for (let i = 0; i < this.emojis.length; i++) {
                for (let j = i + 1; j < this.emojis.length; j++) {
                    this.physics.resolveCollision(this.emojis[i], this.emojis[j]);
                }
            }
        }
    }

    draw() {
        this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-color');
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Walls
        this.ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--text-color');
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        for (const wall of this.walls) {
            this.ctx.moveTo(wall.start.x, wall.start.y);
            this.ctx.lineTo(wall.end.x, wall.end.y);
        }
        this.ctx.stroke();

        // Draw active drawing path (ghost)
        if (this.interaction.mode === 'draw' && this.interaction.drawnPath.length > 1) {
            this.ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
            this.ctx.beginPath();
            for (let i = 0; i < this.interaction.drawnPath.length; i++) {
                const p = this.interaction.drawnPath[i];
                if (i === 0) this.ctx.moveTo(p.x, p.y);
                else this.ctx.lineTo(p.x, p.y);
            }
            this.ctx.stroke();
        }

        this.particles.draw(this.ctx);
        this.zones.draw(this.ctx);
        this.portals.draw(this.ctx);

        for (let emoji of this.emojis) {
            emoji.draw(this.ctx);
        }

        this.interaction.draw(this.ctx);
    }
}
