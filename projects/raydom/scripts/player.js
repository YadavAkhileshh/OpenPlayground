/**
 * @fileoverview Player controller for RayDOM.
 * Manages position, rotation, movement physics, interaction, and input processing.
 * Includes advanced features like jumping, crouching, and head bobbing.
 */

import { MAP } from './map.js';

/**
 * @class Player
 * @description State container and logic handler for the first-person controller.
 */
export class Player {
    /**
     * @constructor
     * @param {number} x - Initial X world coordinate.
     * @param {number} y - Initial Y world coordinate.
     * @param {number} angle - Initial rotation in radians.
     */
    constructor(x, y, angle) {
        // Spatial State
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.z = 0; // Altitude for jumping/falling

        // Physical Constants
        this.speed = 4.0;
        this.rotSpeed = 0.06;
        this.radius = 12; // Personal bubble radius for collision

        // Locomotion States
        this.isMoving = false;
        this.isCrouching = false;
        this.isJumping = false;
        this.jumpV = 0; // Vertical velocity
        this.gravity = 0.5;
        this.mass = 1.0;

        // Head Bobbing & Viewmodel
        this.bob = 0;
        this.bobSpeed = 0.18;
        this.bobAmount = 10;
        this.eyeLevel = 0;
        this.isFiring = false;
        this.fireCooldown = 0;

        // Interaction
        this.interactCooldown = 0;
    }

    /**
     * Translates the player in the current direction.
     * @param {number} dir - Direction factor (1 for forward, -1 for backward).
     * @param {number} deltaTime - Time step for frame-rate independence.
     */
    move(dir, deltaTime) {
        let currentSpeed = this.speed;

        // Apply multipliers for states
        if (this.isCrouching) currentSpeed *= 0.4;
        if (this.isJumping) currentSpeed *= 1.2;

        const moveStep = dir * currentSpeed * (deltaTime / 16.6);

        // Predict next position
        const nextX = this.x + Math.cos(this.angle) * moveStep;
        const nextY = this.y + Math.sin(this.angle) * moveStep;

        // Wall collision check
        if (!MAP.isWall(nextX, nextY)) {
            this.x = nextX;
            this.y = nextY;

            // Advance head bob animation
            this.bob += this.bobSpeed * (deltaTime / 16.6);
            this.isMoving = true;
        }
    }

    /**
     * Rotates the player's view direction.
     * @param {number} dir - Rotation direction (1 for right, -1 for left).
     * @param {number} deltaTime - Time step.
     */
    rotate(dir, deltaTime) {
        const rotStep = dir * this.rotSpeed * (deltaTime / 16.6);
        this.angle += rotStep;

        // Wrap angle between 0 and 2*PI
        this.angle = (this.angle + Math.PI * 2) % (Math.PI * 2);
    }

    /**
     * Main update loop for player logic.
     * @param {Object} keys - Current keyboard state.
     * @param {number} deltaTime - Delta time in ms.
     */
    update(keys, deltaTime) {
        this.isMoving = false;

        // 1. Vertical Physics (Jumping / Crouching)
        this.processVerticalState(keys, deltaTime);

        // 2. Linear Locomotion
        if (keys['w'] || keys['ArrowUp']) {
            this.move(1, deltaTime);
        } else if (keys['s'] || keys['ArrowDown']) {
            this.move(-1, deltaTime);
        } else {
            // Smoothly damp the bobbing when stationary
            this.bob *= 0.85;
        }

        // 3. Angular Locomotion
        if (keys['a'] || keys['ArrowLeft']) this.rotate(-1, deltaTime);
        if (keys['d'] || keys['ArrowRight']) this.rotate(1, deltaTime);

        // 4. Combat / Interaction States
        this.processAbilities(keys, deltaTime);

        // 5. Screen Space eyeLevel Calculation
        this.calculateEyeLevel();
    }

    /**
     * Handles jumping, gravity, and crouching states.
     */
    processVerticalState(keys, deltaTime) {
        const frameScale = deltaTime / 16.6;

        // Crouch state detection
        this.isCrouching = keys['Control'] || keys['c'];

        // Jump trigger
        if ((keys[' '] || keys['Shift']) && !this.isJumping && !this.isCrouching) {
            this.isJumping = true;
            this.jumpV = 8.5;
            if (window.RayDOM && window.RayDOM.audio) {
                window.RayDOM.audio.playBeep(220); // Low jump feedback
            }
        }

        // Apply jump velocity and gravity
        if (this.isJumping) {
            this.z += this.jumpV * frameScale;
            this.jumpV -= this.gravity * frameScale;

            // Landing check
            if (this.z <= 0) {
                this.z = 0;
                this.isJumping = false;
                this.jumpV = 0;
            }
        }
    }

    /**
     * Process weapon fire and environment interaction.
     */
    processAbilities(keys, deltaTime) {
        // Fire logic
        if (this.fireCooldown > 0) this.fireCooldown -= deltaTime;
        this.isFiring = keys['f'] || keys['Enter'];
        if (this.isFiring && this.fireCooldown <= 0) {
            this.fire();
            this.fireCooldown = 250;
        }

        // Interact logic
        if (this.interactCooldown > 0) this.interactCooldown -= deltaTime;
        if ((keys['e'] || keys['q']) && this.interactCooldown <= 0) {
            this.interact();
            this.interactCooldown = 500;
        }
    }

    /**
     * Calculates the eyeLevel offset for the renderer.
     */
    calculateEyeLevel() {
        const crouchOffset = this.isCrouching ? -25 : 0;
        const bobOffset = Math.sin(this.bob) * this.bobAmount;
        this.eyeLevel = crouchOffset + this.z + bobOffset;
    }

    /**
     * Triggers environment interaction (e.g., opening doors).
     */
    interact() {
        const interactReach = 45;
        const targetX = this.x + Math.cos(this.angle) * interactReach;
        const targetY = this.y + Math.sin(this.angle) * interactReach;

        const toggled = MAP.toggleDoor(targetX, targetY);
        if (toggled && window.RayDOM && window.RayDOM.audio) {
            window.RayDOM.audio.playDoorSound();
        }
    }

    /**
     * Triggers weapon fire logic and visual effects.
     */
    fire() {
        if (window.RayDOM) {
            if (window.RayDOM.audio) window.RayDOM.audio.playFire();
            if (window.RayDOM.particles) {
                const reach = 100;
                const impactX = this.x + Math.cos(this.angle) * reach;
                const impactY = this.y + Math.sin(this.angle) * reach;
                window.RayDOM.particles.emitExplosion(impactX, impactY, 15, '#00f2ff');
            }
        }
    }
}
