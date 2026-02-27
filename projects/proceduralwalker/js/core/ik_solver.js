/**
 * IKSolver - FABRIK Implementation
 * (Forward And Backward Reaching Inverse Kinematics)
 */
class IKSolver {
    constructor() {
        this.tolerance = 0.1; // Distance tolerance for target
        this.maxIterations = 15; // Iterations per frame
    }

    /**
     * Solves the IK chain for a given target.
     * @param {Array<Vector2>} joints - Array of joint positions (modified in place)
     * @param {Array<number>} lengths - Array of segment lengths between joints
     * @param {Vector2} target - Target position to reach
     * @return {boolean} - True if target reached, false otherwise
     */
    solve(joints, lengths, target) {
        if (!joints || joints.length < 2 || !target) return false;

        const root = joints[0].copy(); // Store base position
        const totalLength = lengths.reduce((a, b) => a + b, 0);

        // Check if target is unreachable
        const distToTarget = joints[0].dist(target);
        if (distToTarget > totalLength) {
            // Target is out of reach
            for (let i = 0; i < joints.length - 1; i++) {
                const r = Vector2.sub(target, joints[i]);
                const len = lengths[i];
                const lambda = len / r.mag();

                joints[i + 1] = Vector2.add(joints[i], r.mult(lambda));
            }
            return false;
        } else {
            // Target is reachable; solve using FABRIK
            let b = joints[0].copy();

            // Initial check
            let diff = joints[joints.length - 1].dist(target);
            let iter = 0;

            while (diff > this.tolerance && iter < this.maxIterations) {
                // STAGE 1: FORWARD REACHING (Target -> Base)
                // Set end effector to target
                joints[joints.length - 1] = target.copy();

                for (let i = joints.length - 2; i >= 0; i--) {
                    const r = Vector2.sub(joints[i + 1], joints[i]);
                    const lambda = lengths[i] / r.mag();

                    // Find new joint position
                    joints[i] = Vector2.add(joints[i + 1], r.mult(lambda).mult(-1)); // -1 to reverse direction
                }

                // STAGE 2: BACKWARD REACHING (Base -> Target)
                // Set root back to original position
                joints[0] = root.copy();

                for (let i = 0; i < joints.length - 1; i++) {
                    const r = Vector2.sub(joints[i + 1], joints[i]);
                    const lambda = lengths[i] / r.mag();

                    joints[i + 1] = Vector2.add(joints[i], r.mult(lambda));
                }

                diff = joints[joints.length - 1].dist(target);
                iter++;
            }
            return true;
        }
    }

    /**
     * Constrains angle between 3 points. Not fully implemented for basic FABRIK, 
     * but useful for organic movement limits.
     * @param {Vector2} p0 - Previous joint
     * @param {Vector2} p1 - Current joint
     * @param {Vector2} p2 - Next joint
     */
    constrainAngle(p0, p1, p2) {
        // Placeholder for future extension
    }
}
