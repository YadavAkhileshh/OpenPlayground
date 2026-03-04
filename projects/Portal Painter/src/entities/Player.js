import { Entity } from './Entity.js';
import { BoxCollider } from '../physics/Collider.js';
import { Vector2 } from '../physics/Vector2.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 'player');
        this.width = 30;
        this.height = 50;

        this.body.mass = 1;
        this.body.invMass = 1;
        this.body.friction = 0.05; // Reduced from 0.2
        this.body.collider = new BoxCollider(this.body, this.width, this.height);

        this.speed = 600; // Increased from 200
        this.jumpForce = 900; // Increased from 600
        this.isGrounded = false;

        // Visual
        this.color = '#ff9a9e';
    }

    update(dt, input) {
        this.isGrounded = false; // Reset, collision will set true if hitting floor

        // Movement
        if (input.keys['ArrowLeft'] || input.keys['KeyA']) {
            this.body.applyForce(new Vector2(-this.speed, 0));
        }
        if (input.keys['ArrowRight'] || input.keys['KeyD']) {
            this.body.applyForce(new Vector2(this.speed, 0));
        }

        // Jump
        console.log(input.keys); // Debug input
        if ((input.keys['ArrowUp'] || input.keys['Space'] || input.keys['KeyW'])) {
            if (this.canJump) { // Logic to be handled in collision or simple check
                this.body.applyImpulse(new Vector2(0, -this.jumpForce));
                this.canJump = false;
            }
        }

        super.update(dt);

        // Simple damping for horizontal movement to stop sliding forever
        // With lower friction in Body, we might need a bit more manual control damping 
        // when input is released, or rely on Body friction.
        // Let's rely on body friction more, but apply a "stopping" force if no input.

        if (!input.keys['ArrowLeft'] && !input.keys['KeyA'] &&
            !input.keys['ArrowRight'] && !input.keys['KeyD']) {
            this.body.velocity.x *= 0.9;
        }
    }

    render(renderer) {
        renderer.drawRect(
            this.body.position.x - this.width / 2,
            this.body.position.y - this.height / 2,
            this.width,
            this.height,
            this.color
        );
    }

    onCollision(other, normal) {
        // Detect ground
        // Normal points FROM other TO player. So if floor is below, normal is UP (0, -1) in screen space?
        // Wait, screen space Y is down.
        // If floor is at Y=500, Player at Y=400.
        // Wall normal should point UP -> (0, -1).
        // My check was normal.y < -0.7. This matches (0, -1).
        if (normal && normal.y < -0.7) {
            this.isGrounded = true;
            this.canJump = true;
        }
    }
}
