/**
 * Body Class
 * Represents the main chassis of the robot.
 */
class Body {
    constructor() {
        this.position = new Vector2(0, -100);
        this.velocity = new Vector2(0, 0);
        this.width = 100;
        this.height = 60;

        // Configuration
        this.legCount = 6;
        this.legs = [];

        // Initialize Legs
        const spacing = this.width / (this.legCount / 2 - 1);
        for (let i = 0; i < this.legCount; i++) {
            const side = i % 2 === 0 ? 1 : -1; // Left or Right
            const idx = Math.floor(i / 2);
            // X offset relative to center
            const xOffset = (idx * spacing) - (this.width / 2);

            this.legs.push(new Leg(xOffset, 20, side === 1));
        }
    }

    update(terrain, solver) {
        // Physics / movement logic (simple drag for now)
        // Constraints: Keep body above average foot height?
        // For now, let's just let user drag it and let legs follow.

        // Update legs
        this.legs.forEach(leg => {
            // Update leg base position relative to body
            const basePos = Vector2.add(this.position, new Vector2(leg.offset.x, leg.offset.y));
            leg.joints[0] = basePos; // Force base to body

            // Check if we need to re-solve IK (always solve to keep joints correct)
            solver.solve(leg.joints, leg.lengths, leg.target);
        });
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }
}
