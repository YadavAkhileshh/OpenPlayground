/**
 * Wormhole Component
 * Teleports rays.
 */
import { Target } from './target.js'; // Use circular shape

export class Wormhole extends Target {
    constructor(x, y, id, linkId) {
        super(x, y, 25);
        this.type = 'wormhole';
        this.wormholeId = id;
        this.linkId = linkId;
        this.color = '#a0a';
        this.rotationSpeed = 2;
    }

    // Override update to rotate visual
    update(dt) {
        this.angle += this.rotationSpeed * dt;
    }

    opticalResponse(incident, normal, intersection) {
        // Find link
        // We need access to the scene to find the partner.
        // But Entity doesn't have scene reference by default?
        // Let's rely on the Scene updating this, or static lookup?
        // Better: Raycaster sets a 'scene' context on entities or we pass scene to opticalResponse?
        // Currently `opticalResponse` is pure math.

        // Quick hack: Store link reference if found, or simple ID match in `Game`?
        // Feature constraint: "Refactoring might be needed".
        // Let's return a special "Teleport" ray object that the Raycaster handles?

        return [{
            isTeleport: true,
            linkId: this.linkId,
            incident: incident,
            intensity: 1.0,
            color: intersection.color
        }];
    }
}
