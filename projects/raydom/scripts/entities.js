/**
 * @fileoverview Entity and NPC System for RayDOM.
 * Manages non-player characters, their AI behavior, and billboarded rendering.
 * Billboarded rendering ensures sprites always face the player.
 */

import { MAP } from './map.js';

export class Entity {
    constructor(x, y, type = 'guard') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 12;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1.5;
        this.health = 100;
        this.state = 'patrol'; // patrol, chase, idle
        this.waitTimer = 0;

        // Sprite properties
        this.distance = 0;
        this.relativeAngle = 0;
        this.size = 0;
        this.screenX = 0;
        this.visible = false;
    }

    /**
     * Simple patrol AI logic. 
     * Moves until it hits a wall, then waits and turns.
     */
    update(player, deltaTime) {
        const timeScale = deltaTime / 16.6;

        if (this.state === 'patrol') {
            const nextX = this.x + Math.cos(this.angle) * this.speed * timeScale;
            const nextY = this.y + Math.sin(this.angle) * this.speed * timeScale;

            if (!MAP.isWall(nextX, nextY)) {
                this.x = nextX;
                this.y = nextY;
            } else {
                this.state = 'idle';
                this.waitTimer = Math.random() * 2000 + 1000;
            }
        } else if (this.state === 'idle') {
            this.waitTimer -= deltaTime;
            if (this.waitTimer <= 0) {
                this.angle = Math.random() * Math.PI * 2;
                this.state = 'patrol';
            }
        }

        // Calculate distance and visibility relative to player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx * dx + dy * dy);

        // Transformation into camera space
        let spriteAngle = Math.atan2(dy, dx) - player.angle;

        // Normalize angle
        while (spriteAngle <= -Math.PI) spriteAngle += 2 * Math.PI;
        while (spriteAngle > Math.PI) spriteAngle -= 2 * Math.PI;

        this.relativeAngle = spriteAngle;
        this.visible = Math.abs(this.relativeAngle) < Math.PI / 2; // Roughly within FOV
    }
}

export class EntitySystem {
    constructor() {
        this.entities = [];
        this.container = document.getElementById('strips-container');
        this.sprites = [];

        this.initEntities();
    }

    initEntities() {
        // Spawn a few NPCs in open areas
        const spawnPoints = [
            { x: 300, y: 300 },
            { x: 700, y: 200 },
            { x: 800, y: 800 },
            { x: 150, y: 850 }
        ];

        spawnPoints.forEach(pos => {
            const ent = new Entity(pos.x, pos.y);
            this.entities.push(ent);

            // Create DOM representation
            const el = document.createElement('div');
            el.className = 'entity-sprite';
            el.style.position = 'absolute';
            el.style.display = 'none';
            el.style.background = ent.type === 'guard' ? 'radial-gradient(circle, #f00 0%, transparent 70%)' : '#0f0';
            el.style.zIndex = '5';
            this.container.appendChild(el);
            this.sprites.push(el);
        });
    }

    /**
     * Updates and renders entities.
     */
    update(player, rays, deltaTime) {
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;
        const fov = Math.PI / 3;

        this.entities.forEach((ent, i) => {
            ent.update(player, deltaTime);
            const el = this.sprites[i];

            if (ent.visible && ent.distance > 20) {
                // Determine screen position
                const screenPosX = (0.5 * (ent.relativeAngle / (fov / 2)) + 0.5) * viewWidth;
                const spriteSize = (viewHeight / ent.distance) * 40;

                // Simple depth check against rays (crude but works for fake 3D)
                const rayIndex = Math.floor((screenPosX / viewWidth) * rays.length);
                const ray = rays[rayIndex];

                if (ray && ray.distance > ent.distance) {
                    el.style.display = 'block';
                    el.style.width = `${spriteSize}px`;
                    el.style.height = `${spriteSize}px`;
                    el.style.left = `${screenPosX - spriteSize / 2}px`;
                    el.style.top = `${viewHeight / 2 - spriteSize / 2 + player.eyeLevel}px`;
                    el.style.opacity = Math.max(0, 1 - ent.distance / 1000);
                } else {
                    el.style.display = 'none';
                }
            } else {
                el.style.display = 'none';
            }
        });
    }
}
