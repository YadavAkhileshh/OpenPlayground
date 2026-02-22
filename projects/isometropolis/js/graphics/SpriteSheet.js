/**
 * Generates and caches procedural isometric tile graphics to an offscreen canvas.
 * This prevents expensive path-drawing commands per frame.
 */
export class SpriteSheet {
    constructor(tileW = 64, tileH = 32) {
        this.tileW = tileW;
        this.tileH = tileH;
        this.halfW = tileW / 2;
        this.halfH = tileH / 2;

        this.cache = new Map();

        // Depth height for blocks
        this.blockDepth = 20;
    }

    /**
     * Wrapper to draw an isometric diamond shape.
     */
    _drawDiamond(ctx, offsetX, offsetY, fillStyle, strokeStyle) {
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY - this.halfH); // Top
        ctx.lineTo(offsetX + this.halfW, offsetY); // Right
        ctx.lineTo(offsetX, offsetY + this.halfH); // Bottom
        ctx.lineTo(offsetX - this.halfW, offsetY); // Left
        ctx.closePath();

        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        if (strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
        }
    }

    /**
     * Generate standard terrain tile.
     */
    getTerrain() {
        if (this.cache.has('terrain')) return this.cache.get('terrain');

        const canvas = document.createElement('canvas');
        canvas.width = this.tileW + 2;
        canvas.height = this.tileH + this.blockDepth + 2;
        const ctx = canvas.getContext('2d', { alpha: true });

        const cx = this.halfW + 1;
        const cy = this.halfH + 1;

        // Draw side walls for block thickness
        ctx.fillStyle = '#1e2b40'; // Left wall
        ctx.beginPath();
        ctx.moveTo(cx - this.halfW, cy);
        ctx.lineTo(cx, cy + this.halfH);
        ctx.lineTo(cx, cy + this.halfH + this.blockDepth);
        ctx.lineTo(cx - this.halfW, cy + this.blockDepth);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#111a26'; // Right wall
        ctx.beginPath();
        ctx.moveTo(cx, cy + this.halfH);
        ctx.lineTo(cx + this.halfW, cy);
        ctx.lineTo(cx + this.halfW, cy + this.blockDepth);
        ctx.lineTo(cx, cy + this.halfH + this.blockDepth);
        ctx.fill();
        ctx.stroke();

        // Top surface
        this._drawDiamond(ctx, cx, cy, '#273c59', 'rgba(255,255,255,0.05)');

        this.cache.set('terrain', { canvas, cx, cy });
        return this.cache.get('terrain');
    }

    /**
     * Procedural road drawing (requires connections context N, S, E, W).
     * @param {number} connections - Bitmask 1=N, 2=E, 4=S, 8=W
     */
    getRoad(connections) {
        const id = `road_${connections}`;
        if (this.cache.has(id)) return this.cache.get(id);

        const canvas = document.createElement('canvas');
        canvas.width = this.tileW + 2;
        canvas.height = this.tileH + this.blockDepth + 2;
        const ctx = canvas.getContext('2d', { alpha: true });

        const cx = this.halfW + 1;
        const cy = this.halfH + 1;

        // Base terrain first
        ctx.drawImage(this.getTerrain().canvas, 0, 0);

        // Draw asphalt base on top
        this._drawDiamond(ctx, cx, cy, '#4a5463', null);

        // Draw lane markings based on connections (Isometric center lines)
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const n = connections & 1;
        const e = connections & 2;
        const s = connections & 4;
        const w = connections & 8;

        // If no connections, draw an intersection square
        if (connections === 0) {
            ctx.rect(cx - 2, cy - 2, 4, 4);
            ctx.fill();
        } else {
            if (n || s) {
                // North (-halfW, -halfH/2 roughly)
                if (n) { ctx.moveTo(cx, cy); ctx.lineTo(cx + this.halfW / 2, cy - this.halfH / 2); }
                if (s) { ctx.moveTo(cx, cy); ctx.lineTo(cx - this.halfW / 2, cy + this.halfH / 2); }
            }
            if (e || w) {
                if (e) { ctx.moveTo(cx, cy); ctx.lineTo(cx + this.halfW / 2, cy + this.halfH / 2); }
                if (w) { ctx.moveTo(cx, cy); ctx.lineTo(cx - this.halfW / 2, cy - this.halfH / 2); }
            }
        }
        ctx.stroke();

        this.cache.set(id, { canvas, cx, cy });
        return this.cache.get(id);
    }

    /**
     * Generate building sprites based on type and density.
     */
    getBuilding(type, level) {
        const id = `building_${type}_${level}`;
        if (this.cache.has(id)) return this.cache.get(id);

        const canvas = document.createElement('canvas');
        // Height depends on level
        const hOffset = this.tileH + (level * 20);
        canvas.width = this.tileW + 2;
        canvas.height = hOffset + this.blockDepth + 2 + this.halfH; // extra height for tall buildings
        const ctx = canvas.getContext('2d', { alpha: true });

        const cx = this.halfW + 1;
        const cy = canvas.height - this.halfH - this.blockDepth - 1;

        // Terrain base
        ctx.drawImage(this.getTerrain().canvas, 0, canvas.height - this.getTerrain().canvas.height);

        let colorTop, colorLeft, colorRight;
        switch (type) {
            case 'R': colorTop = '#2ecc71'; colorLeft = '#27ae60'; colorRight = '#1e8449'; break; // Greenish
            case 'C': colorTop = '#3498db'; colorLeft = '#2980b9'; colorRight = '#1f618d'; break; // Bluish
            case 'I': colorTop = '#f1c40f'; colorLeft = '#f39c12'; colorRight = '#d68910'; break; // Yellowish
            default: colorTop = '#95a5a6'; colorLeft = '#7f8c8d'; colorRight = '#616a6b'; break;
        }

        // Box height
        const bh = 10 + (level * 15);

        const roofY = cy - bh;

        // Left wall
        ctx.fillStyle = colorLeft;
        ctx.beginPath();
        ctx.moveTo(cx - this.halfW + 4, cy - 2);
        ctx.lineTo(cx, cy + this.halfH - 2);
        ctx.lineTo(cx, roofY + this.halfH - 2);
        ctx.lineTo(cx - this.halfW + 4, roofY - 2);
        ctx.fill();

        // Right wall
        ctx.fillStyle = colorRight;
        ctx.beginPath();
        ctx.moveTo(cx, cy + this.halfH - 2);
        ctx.lineTo(cx + this.halfW - 4, cy - 2);
        ctx.lineTo(cx + this.halfW - 4, roofY - 2);
        ctx.lineTo(cx, roofY + this.halfH - 2);
        ctx.fill();

        // Roof
        ctx.fillStyle = colorTop;
        ctx.beginPath();
        ctx.moveTo(cx, roofY - this.halfH);
        ctx.lineTo(cx + this.halfW - 4, roofY - 2);
        ctx.lineTo(cx, roofY + this.halfH - 2);
        ctx.lineTo(cx - this.halfW + 4, roofY - 2);
        ctx.fill();

        // Windows logic could go here depending on level
        if (level > 0) {
            ctx.fillStyle = 'rgba(255, 255, 200, 0.4)'; // light
            ctx.beginPath();
            ctx.arc(cx - 5, cy - bh / 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        this.cache.set(id, { canvas, cx, cy });
        return this.cache.get(id);
    }
}
