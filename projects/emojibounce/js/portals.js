export class Portals {
    constructor(audio) {
        this.audio = audio;
        this.portalPairs = []; // Array of { id, p1: {x,y,color}, p2: {x,y,color} }
    }

    addPair(x1, y1, x2, y2) {
        const id = Date.now();
        this.portalPairs.push({
            id,
            p1: { x: x1, y: y1, color: '#FF9F1C' }, // Orange
            p2: { x: x2, y: y2, color: '#2EC4B6' }, // Teal
            radius: 35
        });
    }

    checkTeleport(emoji) {
        for (const pair of this.portalPairs) {
            this.checkPortal(emoji, pair.p1, pair.p2);
            this.checkPortal(emoji, pair.p2, pair.p1);
        }
    }

    checkPortal(emoji, source, destination) {
        const dx = emoji.x - source.x;
        const dy = emoji.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If inside source portal
        if (dist < source.radius) {
            // But only if we are moving TOWARDS it basically? 
            // Or just cooldown to avoid infinite loops immediately.
            // Let's use a "teleportCooldown" on emoji.
            if (emoji.teleportCooldown > 0) return;

            // Teleport
            emoji.x = destination.x;
            emoji.y = destination.y;

            // Add slight push out to avoid getting stuck
            // We need to know velocity direction to eject properly?
            // For now, keep velocity same.

            emoji.teleportCooldown = 60; // Frames?

            if (this.audio) this.audio.playPop(10); // Teleport sound
        }
    }

    draw(ctx) {
        for (const pair of this.portalPairs) {
            this.drawSingle(ctx, pair.p1);
            this.drawSingle(ctx, pair.p2);

            // Draw connection line hint?
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(pair.p1.x, pair.p1.y);
            ctx.lineTo(pair.p2.x, pair.p2.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawSingle(ctx, p) {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Spin effect
        ctx.rotate(Date.now() / 500);

        ctx.beginPath();
        ctx.arc(0, 0, p.radius || 35, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = p.color + '33'; // transparent
        ctx.fill();

        // Inner swirl
        ctx.beginPath();
        ctx.arc(5, 0, 20, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }
}
