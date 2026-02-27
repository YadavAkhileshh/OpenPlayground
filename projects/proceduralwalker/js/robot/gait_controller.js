/**
 * GaitController Class
 * Manages walking logic and leg coordination.
 */
class GaitController {
    constructor(body) {
        this.body = body;
        this.stepThreshold = 60; // Distance before triggering step
        this.stepHeight = 40;
        this.stepDuration = 0.2; // Speed multiplier

        // Groups for tripod gait (e.g., legs 0, 2, 4 vs 1, 3, 5)
        this.tripodGroupA = [0, 2, 4];
        this.tripodGroupB = [1, 3, 5];

        this.lastStepTime = 0;
        this.stepCooldown = 100; // ms
    }

    update(terrain) {
        // Find ideal foot positions
        this.body.legs.forEach((leg, index) => {
            // Calculate where foot SHOULD be based on body position + leg offset
            // We project down to terrain
            const idealX = this.body.position.x + leg.offset.x;
            const idealY = terrain.getHeight(idealX);
            const idealPos = new Vector2(idealX, idealY);

            // Check distance from current target
            const dist = leg.target.dist(idealPos);

            // If too far and not moving, try to step
            if (dist > this.stepThreshold && !leg.isMoving) {
                // Check if we allow this leg to move
                if (this.canStep(index)) {
                    // Predict where to step based on body velocity
                    // Lead the target a bit
                    const lead = Vector2.mult(this.body.velocity, 10);
                    const targetX = idealX + lead.x;
                    const targetY = terrain.getHeight(targetX);

                    leg.stepTo(new Vector2(targetX, targetY));
                }
            }
        });
    }

    /**
     * Checks if a leg is allowed to step to maintain stability.
     * Simple logic: Don't lift neighbor legs.
     */
    canStep(index) {
        // Simplified check: If any neighbor is moving, don't move.
        // Neighbors: index-1, index+1 (and side logic if 3D, but here 1D array)
        // Actually, let's enforce Tripod Gait strictly.
        // Group A moves only if Group B is planted.

        const isGroupA = this.tripodGroupA.includes(index);
        const group = isGroupA ? this.tripodGroupA : this.tripodGroupB;
        const otherGroup = isGroupA ? this.tripodGroupB : this.tripodGroupA;

        // Check if anyone in other group is moving
        const othersMoving = otherGroup.some(i => this.body.legs[i].isMoving);
        if (othersMoving) return false;

        // Also check if anyone in MY group is *already* moving?
        // Actually, we want whole group to move together ideally, or ripple.
        // Let's allow individual movement if stability is fine.

        // For simple stability: Don't move if adjacent leg is moving.
        const prev = index > 0 ? this.body.legs[index - 1] : null;
        const next = index < this.body.legs.length - 1 ? this.body.legs[index + 1] : null;

        if (prev && prev.isMoving) return false;
        if (next && next.isMoving) return false;

        return true;
    }
}
