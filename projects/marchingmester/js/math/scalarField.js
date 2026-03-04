/**
 * ScalarField — Manages a 3D density grid driven by metaball physics.
 *
 * Features:
 *  - Physics: bouncing, damped velocity, inter-ball repulsion
 *  - Pulsing radii (breathing effect)
 *  - Wyvill cubic falloff for smoother surface blending
 *  - Gravitational attractor (optional)
 *  - Supports pause
 */
class ScalarField {
    /**
     * @param {number} gridSize  Number of grid cells per axis
     * @param {number} worldSize World-space extent per axis (cube)
     */
    constructor(gridSize, worldSize) {
        this.gridSize = gridSize;        // number of vertices per axis
        this.worldSize = worldSize;       // world-space range [-half, half]
        this.half = worldSize / 2;

        // Total vertices = gridSize^3
        const N = gridSize;
        this.N = N;

        // Step between grid points in world space
        this.step = worldSize / (N - 1);

        // Flat arrays: values and positions
        const total = N * N * N;
        this.values = new Float32Array(total);
        this.posX = new Float32Array(total);
        this.posY = new Float32Array(total);
        this.posZ = new Float32Array(total);

        // Pre-compute grid positions once
        let idx = 0;
        for (let zi = 0; zi < N; zi++) {
            for (let yi = 0; yi < N; yi++) {
                for (let xi = 0; xi < N; xi++) {
                    this.posX[idx] = -this.half + xi * this.step;
                    this.posY[idx] = -this.half + yi * this.step;
                    this.posZ[idx] = -this.half + zi * this.step;
                    idx++;
                }
            }
        }

        /** @type {Metaball[]} */
        this.metaballs = [];
        this.time = 0;

        // Attractor feature (Feature 4 — Gravity Well)
        this.useAttractor = false;
        this.attractorPos = new Vector3(0, 0, 0);
        this.attractorStr = 0.3;
    }

    // ---- Metaball management ----

    /**
     * Creates and adds a metaball.
     * @param {number} radius    Base influence radius
     * @param {number} speed     Movement speed multiplier
     */
    addMetaball(radius, speed = 1.0) {
        const b = this.half * 0.4;
        this.metaballs.push({
            pos: new Vector3((Math.random() - 0.5) * b, (Math.random() - 0.5) * b, (Math.random() - 0.5) * b),
            vel: new Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2).normalize(),
            radius: radius,
            baseRadius: radius,
            speed: speed,
            pulseFreq: 0.5 + Math.random() * 1.5,
            pulsePhase: Math.random() * Math.PI * 2,
            alive: true
        });
    }

    clearMetaballs() {
        this.metaballs = [];
    }

    // ---- Physics update ----

    update(dt) {
        this.time += dt;
        const bound = this.half * 0.46;

        for (let i = 0; i < this.metaballs.length; i++) {
            const b = this.metaballs[i];
            if (!b.alive) continue;

            // Breathing
            b.radius = b.baseRadius * (1.0 + 0.1 * Math.sin(this.time * b.pulseFreq + b.pulsePhase));

            // Gravity attractor (Feature 4)
            if (this.useAttractor) {
                const dx = this.attractorPos.x - b.pos.x;
                const dy = this.attractorPos.y - b.pos.y;
                const dz = this.attractorPos.z - b.pos.z;
                const d2 = dx * dx + dy * dy + dz * dz + 0.5;
                const inv = this.attractorStr / d2;
                b.vel.x += dx * inv * dt * 30;
                b.vel.y += dy * inv * dt * 30;
                b.vel.z += dz * inv * dt * 30;
            }

            // Integrate
            b.pos.x += b.vel.x * b.speed * dt * 18;
            b.pos.y += b.vel.y * b.speed * dt * 18;
            b.pos.z += b.vel.z * b.speed * dt * 18;

            // Damped reflection on walls
            if (b.pos.x < -bound) { b.pos.x = -bound; b.vel.x = Math.abs(b.vel.x) * 0.85; }
            if (b.pos.x > bound) { b.pos.x = bound; b.vel.x = -Math.abs(b.vel.x) * 0.85; }
            if (b.pos.y < -bound) { b.pos.y = -bound; b.vel.y = Math.abs(b.vel.y) * 0.85; }
            if (b.pos.y > bound) { b.pos.y = bound; b.vel.y = -Math.abs(b.vel.y) * 0.85; }
            if (b.pos.z < -bound) { b.pos.z = -bound; b.vel.z = Math.abs(b.vel.z) * 0.85; }
            if (b.pos.z > bound) { b.pos.z = bound; b.vel.z = -Math.abs(b.vel.z) * 0.85; }

            // Inter-ball soft repulsion
            for (let j = i + 1; j < this.metaballs.length; j++) {
                const c = this.metaballs[j];
                if (!c.alive) continue;
                const ex = b.pos.x - c.pos.x;
                const ey = b.pos.y - c.pos.y;
                const ez = b.pos.z - c.pos.z;
                const d2 = ex * ex + ey * ey + ez * ez;
                const minD = b.radius + c.radius;

                if (d2 < minD * minD && d2 > 1e-4) {
                    const d = Math.sqrt(d2);
                    const ov = (minD - d) / d;
                    const fx = ex * ov * dt * 8;
                    const fy = ey * ov * dt * 8;
                    const fz = ez * ov * dt * 8;
                    b.vel.x += fx; b.vel.y += fy; b.vel.z += fz;
                    c.vel.x -= fx; c.vel.y -= fy; c.vel.z -= fz;
                }
            }

            // Speed cap
            const spd = b.vel.x * b.vel.x + b.vel.y * b.vel.y + b.vel.z * b.vel.z;
            if (spd > 9) {
                const inv = 3 / Math.sqrt(spd);
                b.vel.x *= inv; b.vel.y *= inv; b.vel.z *= inv;
            }
        }

        this.generateField();
    }

    // ---- Scalar field generation ----

    generateField() {
        const total = this.N * this.N * this.N;
        this.values.fill(0);

        for (let bi = 0; bi < this.metaballs.length; bi++) {
            const ball = this.metaballs[bi];
            if (!ball.alive) continue;

            const bx = ball.pos.x;
            const by = ball.pos.y;
            const bz = ball.pos.z;
            const r2 = ball.radius * ball.radius;

            for (let i = 0; i < total; i++) {
                const dx = this.posX[i] - bx;
                const dy = this.posY[i] - by;
                const dz = this.posZ[i] - bz;
                const d2 = dx * dx + dy * dy + dz * dz;

                // Wyvill smooth falloff: (1 - d²/R²)³  — zero beyond radius
                const t = d2 / r2;
                if (t < 1.0) {
                    const q = 1 - t;
                    this.values[i] += q * q * q;
                }
            }
        }
    }

    // ---- Grid accessors ----

    getFlatIndex(xi, yi, zi) {
        return xi + yi * this.N + zi * this.N * this.N;
    }

    getValue(xi, yi, zi) {
        if (xi < 0 || xi >= this.N || yi < 0 || yi >= this.N || zi < 0 || zi >= this.N) return 0;
        return this.values[this.getFlatIndex(xi, yi, zi)];
    }

    getWorldPos(xi, yi, zi) {
        const idx = this.getFlatIndex(xi, yi, zi);
        return {
            x: this.posX[idx],
            y: this.posY[idx],
            z: this.posZ[idx]
        };
    }

    /**
     * Analytical normal at a world-space point.
     * Uses the gradient of the density field.
     */
    getNormal(wx, wy, wz) {
        let gx = 0, gy = 0, gz = 0;
        for (const ball of this.metaballs) {
            if (!ball.alive) continue;
            const bx = wx - ball.pos.x;
            const by = wy - ball.pos.y;
            const bz = wz - ball.pos.z;
            const d2 = bx * bx + by * by + bz * bz;
            const r2 = ball.radius * ball.radius;

            if (d2 < r2) {
                // Gradient of Wyvill: dD/dx = -6x/R² (1 - d²/R²)²
                const t = d2 / r2;
                const q = (1 - t) * (1 - t);
                const scale = -6 * q / r2;
                gx += bx * scale;
                gy += by * scale;
                gz += bz * scale;
            }
        }
        const len = Math.sqrt(gx * gx + gy * gy + gz * gz);
        if (len < 1e-6) return { x: 0, y: 1, z: 0 };
        return { x: gx / len, y: gy / len, z: gz / len };
    }
}
