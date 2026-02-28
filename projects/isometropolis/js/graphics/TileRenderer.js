/**
 * Draws the map tiles using Painter's algorithms, rendering back-to-front.
 */
export class TileRenderer {
    /**
     * @param {IsometricMath} isoMath
     * @param {SpriteSheet} sprites
     */
    constructor(isoMath, sprites) {
        this.isoMath = isoMath;
        this.sprites = sprites;
    }

    /**
     * Renders all visible tiles sorted by depth.
     * @param {CanvasRenderingContext2D} ctx
     * @param {CityMap} map
     * @param {Rect} viewBounds
     */
    render(ctx, map, viewBounds) {
        const renderList = [];

        // 1. Gather visible tiles
        for (let x = 0; x < map.width; x++) {
            for (let y = 0; y < map.height; y++) {
                const screenPos = this.isoMath.gridToScreen(x, y);

                // Culling: check if tile is within camera bounds roughly
                // Use a larger bound size to account for tall buildings
                if (screenPos.x >= viewBounds.x - 100 && screenPos.x <= viewBounds.x + viewBounds.w + 100 &&
                    screenPos.y >= viewBounds.y - 200 && screenPos.y <= viewBounds.y + viewBounds.h + 100) {

                    const tile = map.getTile(x, y);
                    renderList.push({
                        tile: tile,
                        x: screenPos.x,
                        y: screenPos.y,
                        depth: this.isoMath.getDepth(x, y)
                    });
                }
            }
        }

        // 2. Sort by Depth (Painter's Algorithm)
        renderList.sort((a, b) => a.depth - b.depth);

        // 3. Draw
        for (const item of renderList) {
            const t = item.tile;

            // Determine sprite to generate/pull
            let spriteObj;

            if (t.type === 'road') {
                spriteObj = this.sprites.getRoad(t.roadConnections);
            } else if (t.type === 'building' && t.buildingType !== 'none') {
                spriteObj = this.sprites.getBuilding(t.buildingType, t.developmentLevel);
            } else {
                spriteObj = this.sprites.getTerrain(); // base dirt/grass
            }

            // Draw at screen coordinates offset by canvas center
            ctx.drawImage(
                spriteObj.canvas,
                item.x - spriteObj.cx,
                item.y - spriteObj.cy
            );
        }
    }
}
