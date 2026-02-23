export class Circuit {
    constructor(scene) {
        this.scene = scene;
        this.connections = []; // { sourceId, targetId }
    }

    /**
     * Connect a sensor (source) to a laser/component (target)
     */
    connect(source, target) {
        if (source.type !== 'sensor') return false;
        // Target can be a laser or another logic component

        this.connections.push({
            sourceId: source.id,
            targetId: target.id
        });
        return true;
    }

    update() {
        // Map of component IDs to components for quick lookup
        const compMap = new Map(this.scene.map(c => [c.id, c]));

        // Reset all controlled components to default state first? 
        // No, we should maintain state unless changed.

        // For simple "Sensor -> Laser" logic:
        // If Sensor is Lit, Laser turns ON.
        // If NOT Lit, Laser turns OFF.

        // We need to group connections by target to handle Logic Gates (AND/OR).
        // But for direct connections:

        const targets = new Set();
        this.connections.forEach(conn => targets.add(conn.targetId));

        targets.forEach(targetId => {
            const target = compMap.get(targetId);
            if (!target) return;

            // Find all sources for this target
            const sources = this.connections
                .filter(c => c.targetId === targetId)
                .map(c => compMap.get(c.sourceId))
                .filter(s => s); // Remove nulls

            if (sources.length === 0) return;

            // Logic: OR by default for multiple inputs?
            // If any source is active, turn on.
            const isActive = sources.some(s => s.isLit);

            if (target.type === 'laser') {
                target.isOn = isActive;
            }
        });
    }
}
