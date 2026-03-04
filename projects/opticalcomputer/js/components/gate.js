import { Component } from './base.js';
import { Laser } from './laser.js';
import { Sensor } from './sensor.js';
import { Vec2 } from '../engine/math.js';

/**
 * Composite component representing a Logic Gate
 * Contains internal sensors and lasers
 */
export class LogicGate extends Component {
    constructor(x, y, op = 'AND') {
        super(x, y, 'gate');
        this.op = op; // AND, OR, NOT, NAND, etc.
        this.width = 60;
        this.height = 40;

        // Internal state
        this.inputs = []; // Sensors
        this.output = null; // Laser

        this.setup();
    }

    setup() {
        // Create inputs/outputs derived from position
        // This is non-trivial because sub-components need to move with the gate.
        // For simplicity, we won't use actual sub-components in the main scene list
        // but virtual ones that we delegate to.

        // Actually, let's just model the gate as a single block that has "ports".
        // Raycaster needs to know about the ports.

        // Alternative: The Gate adds its sub-components to the scene when created?
        // That creates management issues (moving the group).

        // Let's implement getting segments for the whole gate, 
        // and handling logic internally.

        this.inputState = [false, false]; // Up to 2 inputs
    }

    getSegments() {
        const w = this.width / 2;
        const h = this.height / 2;

        // Box outline
        const corners = [
            { x: -w, y: -h },
            { x: w, y: -h },
            { x: w, y: h },
            { x: -w, y: h }
        ];

        const worldCorners = corners.map(c => {
            const rot = Vec2.rotate(c, this.rotation);
            return Vec2.add(this.position, rot);
        });

        const segments = [];

        // Create "Input Ports" on the back side
        // These act as Sensors
        const backNormal = Vec2.rotate({ x: -1, y: 0 }, this.rotation);

        // Port 1 (Top-Back)
        const p1_top = Vec2.add(this.position, Vec2.rotate({ x: -w, y: -h / 2 }, this.rotation));
        const p1_bot = Vec2.add(this.position, Vec2.rotate({ x: -w, y: 0 }, this.rotation));

        segments.push({
            p1: p1_top,
            p2: p1_bot,
            type: 'sensor',
            component: this,
            portId: 0
        });

        if (this.op !== 'NOT') {
            // Port 2 (Bottom-Back)
            const p2_top = Vec2.add(this.position, Vec2.rotate({ x: -w, y: 0 }, this.rotation));
            const p2_bot = Vec2.add(this.position, Vec2.rotate({ x: -w, y: h / 2 }, this.rotation));
            segments.push({
                p1: p2_top,
                p2: p2_bot,
                type: 'sensor',
                component: this,
                portId: 1
            });
        }

        // Rest of the box serves as blocker
        // Top edge
        segments.push({ p1: worldCorners[0], p2: worldCorners[1], type: 'blocker' });
        // Front edge (Emitter side - technically open but the laser body is there)
        segments.push({ p1: worldCorners[1], p2: worldCorners[2], type: 'blocker' });
        // Bottom edge
        segments.push({ p1: worldCorners[2], p2: worldCorners[3], type: 'blocker' });
        // Back edge (parts not covered by sensors) are also blockers

        return segments;
    }

    onHit(intensity, portId) {
        // Called by raycaster when a specific segment is hit
        // We need to pass portId in the segment
        // Raycaster needs update to support custom data on segments

        // Hack: Store state for this frame
        if (portId !== undefined) {
            if (intensity > 0.1) this.inputState[portId] = true;
        }
    }

    reset() {
        this.inputState = [false, false];
    }

    getEmissionRay() {
        // Logic check
        let active = false;
        const [a, b] = this.inputState;

        switch (this.op) {
            case 'AND': active = a && b; break;
            case 'OR': active = a || b; break;
            case 'NOT': active = !a; break;
            case 'NAND': active = !(a && b); break;
        }

        if (!active) return null;

        // Emit from front
        const dir = Vec2.rotate(Vec2.create(1, 0), this.rotation);
        const origin = Vec2.add(this.position, Vec2.scale(dir, this.width / 2));

        return {
            origin: origin,
            direction: dir,
            intensity: 1.0,
            color: '#00ff00' // Green output for logic
        };
    }
}
