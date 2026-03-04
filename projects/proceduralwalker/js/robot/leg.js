/**
 * Leg Class
 * Represents a single robotic leg with multi-joint IK.
 */
class Leg {
    /**
     * @param {number} x - Relative X offset from body center
     * @param {number} y - Relative Y offset from body center
     * @param {boolean} isRight - Side of the robot (visual flipping)
     */
    constructor(x, y, isRight) {
        this.offset = new Vector2(x, y);
        this.isRight = isRight;

        // IK Chain
        this.joints = [];
        this.lengths = [40, 60, 60]; // 3 segments

        // Initialize joints hanging down
        let currentY = 0;
        for (let i = 0; i <= this.lengths.length; i++) {
            this.joints.push(new Vector2(x, y + currentY));
            if (i < this.lengths.length) currentY += this.lengths[i];
        }

        // Targets
        this.target = new Vector2(x, y + 100); // Current effector target
        this.stepStart = new Vector2(0, 0); // Where step started
        this.stepEnd = new Vector2(0, 0);   // Where step is going

        // State
        this.isMoving = false;
        this.stepProgress = 0;
        this.stepSpeed = 0.1;
        this.liftHeight = 40;
    }

    /**
     * Updates leg position and IK.
     * @param {Vector2} bodyPos - World position of robot body
     * @param {IKSolver} solver - IK solver instance
     * @param {Terrain} terrain - Terrain instance for ground checks
     */
    update(bodyPos, solver, terrain) {
        // Calculate root position in world space
        const root = Vector2.add(bodyPos, this.offset);
        this.joints[0] = root;

        // Handle Stepping Animation
        if (this.isMoving) {
            this.stepProgress += this.stepSpeed;

            if (this.stepProgress >= 1) {
                this.stepProgress = 1;
                this.isMoving = false;
                this.target = this.stepEnd.copy();

                // Emit dust if particles system is available
                if (window.particles) {
                    window.particles.emitBurst(this.target, 'dust');
                }

                // Play Step Sound
                if (window.audio) {
                    window.audio.playStep('metal');
                }
            } else {
                // Interpolate target
                const t = MathUtils.smoothStep(this.stepProgress);

                // Linear Lerp for X/Y base
                const currentPos = Vector2.add(
                    Vector2.mult(this.stepStart, 1 - t),
                    Vector2.mult(this.stepEnd, t)
                );

                // Add lift (Parabola: 4 * t * (1-t) is 0 at 0, 1 at 0.5, 0 at 1)
                currentPos.y -= Math.sin(t * Math.PI) * this.liftHeight;

                this.target = currentPos;
            }
        }

        // Solve IK to reach target
        solver.solve(this.joints, this.lengths, this.target);
    }

    /**
     * commands the leg to step to a new world position.
     * @param {Vector2} newTarget 
     */
    stepTo(newTarget) {
        if (this.isMoving) return; // Already moving

        this.stepStart = this.target.copy();
        this.stepEnd = newTarget.copy();
        this.isMoving = true;
        this.stepProgress = 0;
    }
}
