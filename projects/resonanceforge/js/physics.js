export class PhysicsWorld {
    constructor() {
        this.bodies = [];
        this.gravity = { x: 0, y: 800 }; // Stronger gravity for punchy feel
        this.bounds = { width: window.innerWidth, height: window.innerHeight };
        this.drag = 0.99; // Air resistance
    }

    addBody(config) {
        // PERFORMANCE: Hard limit on dynamic bodies
        const dynamicCount = this.bodies.filter(b => !b.isStatic).length;
        if (!config.isStatic && dynamicCount > 50) {
            // Remove the oldest dynamic body to make room
            const oldestIdx = this.bodies.findIndex(b => !b.isStatic);
            if (oldestIdx !== -1) this.bodies.splice(oldestIdx, 1);
        }

        const body = {
            id: Math.random().toString(36).substr(2, 9),
            x: config.x || 0,
            y: config.y || 0,
            vx: (Math.random() - 0.5) * 50,
            vy: (Math.random() - 0.5) * 50,
            mass: config.radius ? config.radius * 0.5 : 10,
            radius: config.radius || 20,
            type: config.type || 'circle',
            width: config.width || 40,
            height: config.height || 40,
            isStatic: config.isStatic || false,
            restitution: 0.6,
            color: config.color || '#fff'
        };
        this.bodies.push(body);
        return body;
    }

    applyGlobalForces(soundForces) {
        // soundForces = { bass: 0.0-1.0, treble: 0.0-1.0 }

        // BASS: Horizontal Wind force pushing Right
        // TREBLE: Anti-Gravity Lift force pushing Up

        // Scale forces to be significant against gravity (800)
        const windForceX = soundForces.bass * 20000;
        const liftForceY = soundForces.treble * -35000;

        // Apply to all dynamic bodies
        for (let body of this.bodies) {
            if (body.isStatic) continue;

            const invMass = 1 / body.mass;

            // F = ma -> a = F/m
            // Add acceleration to velocity: v += a * dt
            // We'll use a fixed dt approximation in loop or assume update(dt) handles it.
            // Here we just add to a 'force accumulator' or modify velocity directly if called per frame.
            // Let's modify 'acceleration' behavior by pre-calculating impulse for this frame.

            // We rely on update(dt) to multiply by dt, so here we just store current frame force?
            // Simpler: Just modify velocity here assumes this is called once per frame.
            // But ideally we should add to an acceleration vector.
            // Let's stick to modifying velocity for simplicity in this prototype, 
            // assuming applyGlobalForces is called once before update(dt).

            // NOTE: To make it frame-rate independent, we should pass DT here or handle it in update.
            // For now, let's treat these as "Instantaneous Forces" per frame (Impulses scaled by dt implicitly in main loop?)
            // No, main loop calls applyGlobalForces then update(dt).
            // So we need to store these forces and apply them in update(dt).

            body.forceX = windForceX;
            body.forceY = liftForceY;
        }
    }

    update(dt) {
        this.bounds.width = window.innerWidth;
        this.bounds.height = window.innerHeight;

        for (let body of this.bodies) {
            if (body.isStatic) continue;

            // 1. Forces Integration using Semi-Implicit Euler
            // Acceleration
            const ax = (body.forceX || 0) / body.mass;
            const ay = (this.gravity.y + (body.forceY || 0)) / body.mass; // Gravity + Lift

            // Update Velocity
            body.vx += ax * dt;
            body.vy += ay * dt;

            // Drag/Friction
            body.vx *= this.drag;
            body.vy *= this.drag;

            // jitter for visual effect if force is high
            // if (body.forceY < -100) body.x += (Math.random() - 0.5) * 2;

            // Update Position
            body.x += body.vx * dt;
            body.y += body.vy * dt;

            // Reset per-frame forces
            body.forceX = 0;
            body.forceY = 0;

            // 2. Collision with Bounds
            // Floor
            if (body.y + body.radius > this.bounds.height) {
                body.y = this.bounds.height - body.radius;
                body.vy *= -body.restitution;
                // Friction against floor
                body.vx *= 0.9;
            }
            // Ceiling
            if (body.y - body.radius < 0) {
                body.y = body.radius;
                body.vy *= -body.restitution;
            }
            // Walls
            if (body.x - body.radius < 0) {
                body.x = body.radius;
                body.vx *= -body.restitution;
            }
            if (body.x + body.radius > this.bounds.width) {
                body.x = this.bounds.width - body.radius;
                body.vx *= -body.restitution;
            }

            // Simple specific check meant for game logic (e.g. destroy if too far right?)
        }

        // 3. Body-to-Body Collision (Naive O(N^2))
        // Only doing Circle-Circle for now
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                this.resolveCollision(this.bodies[i], this.bodies[j]);
            }
        }
    }

    resolveCollision(b1, b2) {
        if (b1.isStatic && b2.isStatic) return;

        // Circle-Circle only logic for prototype speed
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distSq = dx * dx + dy * dy;
        const radSum = b1.radius + b2.radius;

        if (distSq < radSum * radSum && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const overlap = radSum - dist;

            // Normalize impact vector
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate bodies (position correction)
            const percent = 0.8; // Separation slop
            const k = overlap * percent / (b1.isStatic || b2.isStatic ? 1 : 2);

            if (!b1.isStatic) {
                b1.x -= nx * k;
                b1.y -= ny * k;
            }
            if (!b2.isStatic) {
                b2.x += nx * k;
                b2.y += ny * k;
            }

            // Relative velocity
            const rvx = b2.vx - b1.vx;
            const rvy = b2.vy - b1.vy;

            // Velocity along normal
            const velAlongNormal = rvx * nx + rvy * ny;

            // Do not resolve if velocities are separating
            if (velAlongNormal > 0) return;

            // Elasticity
            const e = Math.min(b1.restitution, b2.restitution);

            // Impulse scalar
            let j = -(1 + e) * velAlongNormal;
            j /= (1 / b1.mass + 1 / b2.mass);

            // Apply impulse
            const impulseX = j * nx;
            const impulseY = j * ny;

            if (!b1.isStatic) {
                b1.vx -= impulseX / b1.mass;
                b1.vy -= impulseY / b1.mass;
            }
            if (!b2.isStatic) {
                b2.vx += impulseX / b2.mass;
                b2.vy += impulseY / b2.mass;
            }
        }
    }
}
