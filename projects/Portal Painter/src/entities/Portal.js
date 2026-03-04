import { Entity } from './Entity.js';
import { CircleCollider } from '../physics/Collider.js';

export class Portal extends Entity {
    constructor(x, y, radius = 30) {
        super(x, y, 'portal');
        this.radius = radius;

        this.body.mass = 0;
        this.body.invMass = 0;
        this.body.isStatic = true;
        this.body.collider = new CircleCollider(this.body, radius);
        this.body.collider.isTrigger = true; // Portals don't push back

        this.linkedPortal = null;
        this.color = '#00f2ff'; // Cyan
        this.active = true;
    }

    link(otherPortal) {
        this.linkedPortal = otherPortal;
        otherPortal.linkedPortal = this;
        this.active = true;
        otherPortal.active = true;

        // Color code pairs differently if multiple pairs exist (future proofing)
        this.color = '#00f2ff';
        otherPortal.color = '#ffa502'; // Orange for the other one? Or same?
        // Let's keep distinct colors for now
    }

    render(renderer) {
        // Draw portal ring
        renderer.drawCircle(this.body.position.x, this.body.position.y, this.radius, this.color, false);
        // Draw inner glow
        renderer.drawCircle(this.body.position.x, this.body.position.y, this.radius * 0.8, this.color + '44', true); // Hex alpha
    }

    onCollision(other) {
        if (!this.active || !this.linkedPortal) return;

        // Teleport logic would essentially move the entity to the linked portal
        // We need to be careful not to infinite loop teleport
        // Cooldown or offset is needed

        if (other.type === 'player' && !other.teleportCooldown) {
            other.body.position.set(this.linkedPortal.body.position.x, this.linkedPortal.body.position.y);
            other.teleportCooldown = 10; // Frames or time
            // Preserve velocity? Or maybe rotate it?
            // For now, simple position transfer
        }
    }
}
