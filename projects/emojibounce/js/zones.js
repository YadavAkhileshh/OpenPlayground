export class Zones {
    constructor() {
        this.zones = []; // Array of { x, y, width, height, type: 'water'|'wind' }
    }

    addZone(x, y, width, height, type = 'water') {
        this.zones.push({ x, y, width, height, type });
    }

    apply(emoji, dt) {
        for (const zone of this.zones) {
            // AABB Check
            if (emoji.x > zone.x && emoji.x < zone.x + zone.width &&
                emoji.y > zone.y && emoji.y < zone.y + zone.height) {

                if (zone.type === 'water') {
                    // Drag
                    emoji.vx *= 0.9;
                    emoji.vy *= 0.9;

                    // Buoyancy (upwards force)
                    const buoyancy = 0.8;
                    emoji.vy -= buoyancy * dt * 60;
                }
            }
        }
    }

    draw(ctx) {
        for (const zone of this.zones) {
            ctx.save();
            if (zone.type === 'water') {
                ctx.fillStyle = 'rgba(0, 150, 255, 0.2)';
                ctx.strokeStyle = 'rgba(0, 150, 255, 0.4)';
            }

            ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
            ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

            // Label
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '12px sans-serif';
            ctx.fillText(zone.type === 'water' ? 'Water' : 'Zone', zone.x + zone.width / 2, zone.y + zone.height / 2);

            ctx.restore();
        }
    }
}
