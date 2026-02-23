// world.js
import { Vec2 } from '../math/vec2.js';
import { globalEvents } from '../core/eventBus.js';

export class World {
    constructor() {
        this.gravity = new Vec2(0, -9.81 * 10); // Scale up gravity for snappier feel
        this.bodies = [];
        this.constraints = [];
        this.particles = [];

        // Sub-systems will be injected
        this.broadphase = null;
        this.detector = null;
        this.solver = null;
        this.integrator = null;
        this.positionSolver = null;
        this.slicingAlgorithm = null;
        this.tearingLogic = null;

        this.iterations = {
            velocity: 10,
            position: 5
        };

        this.contacts = [];
    }

    clear() {
        this.bodies = [];
        this.constraints = [];
        this.contacts = [];
        if (this.broadphase) this.broadphase.clear();
    }

    addBody(body) {
        this.bodies.push(body);
        if (this.broadphase) this.broadphase.insert(body);
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
            if (this.broadphase) this.broadphase.remove(body);
        }
    }

    addConstraint(constraint) {
        this.constraints.push(constraint);
    }

    removeConstraint(constraint) {
        const index = this.constraints.indexOf(constraint);
        if (index !== -1) {
            this.constraints.splice(index, 1);
        }
    }

    updateFixed(dt) {
        if (dt <= 0) return;

        // 1. Integrator: Apply forces and advance velocity/position
        if (this.integrator) {
            this.integrator.integrate(this.bodies, this.gravity, dt);
        }

        // 2. Broadphase: Find potential collisions
        let pairs = [];
        if (this.broadphase) {
            this.broadphase.update(this.bodies);
            pairs = this.broadphase.getPairs();
        }

        // 3. Narrowphase: Exact collision detection
        this.contacts = [];
        if (this.detector) {
            this.contacts = this.detector.evaluate(pairs);
        }

        // 4. Dynamics: Solve velocity constraints (Contacts + Springs/Joints)
        if (this.solver) {
            this.solver.initVelocityConstraints(this.contacts, dt);
            for (let c of this.constraints) c.preStep(dt);

            for (let i = 0; i < this.iterations.velocity; i++) {
                this.solver.solveVelocityConstraints(this.contacts);
                for (let c of this.constraints) c.solveVelocity(dt);
            }
        }

        // 5. Integrator: Finalize positions
        if (this.integrator) {
            this.integrator.integrateForces(this.bodies, dt);
        }

        // 6. Position Solver: Fix penetration
        if (this.positionSolver) {
            for (let i = 0; i < this.iterations.position; i++) {
                let positionSolved = this.positionSolver.solvePositionConstraints(this.contacts);
                // Also solve pos constraints for joints
                for (let c of this.constraints) c.solvePosition();
            }
        }

        // 7. Check constraint tearing (Soft bodies tearing under stress)
        if (this.tearingLogic) {
            this.tearingLogic.update(this.constraints, this);
        }

        // Sync broadphase trees after movement
        for (const b of this.bodies) {
            b.synchronize();
        }
        if (this.broadphase) this.broadphase.update(this.bodies);
    }
}
