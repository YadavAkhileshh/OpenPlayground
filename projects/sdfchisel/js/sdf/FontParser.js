/**
 * FontParser.js – Extracts glyph outline data from canvas-rendered characters.
 */
const FontParser = (() => {
    'use strict';
    const { Config } = window.SDFChisel;

    function renderGlyphsToCanvas(text, fontSize, cW, cH) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = cW; offCanvas.height = cH;
        const ctx = offCanvas.getContext('2d');
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cW, cH);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `${Config.SDF.FONT_WEIGHT} ${fontSize}px ${Config.SDF.FONT_FAMILY}`;
        const m = ctx.measureText(text);
        let tgtSize = fontSize;
        if (m.width > cW * 0.90) { tgtSize = Math.floor(fontSize * (cW * 0.90) / m.width); ctx.font = `${Config.SDF.FONT_WEIGHT} ${tgtSize}px ${Config.SDF.FONT_FAMILY}`; }
        ctx.fillText(text, cW / 2, cH / 2);
        return { ctx, canvas: offCanvas, imageData: ctx.getImageData(0, 0, cW, cH), fontSize: tgtSize, textWidth: m.width };
    }

    function sampleAlpha(imageData, x, y) {
        const { width, height, data } = imageData;
        if (x < 0 || y < 0 || x >= width || y >= height) return 0;
        return data[(Math.round(y) * width + Math.round(x)) * 4] > 127 ? 1 : 0;
    }

    function buildOccupancyGrid(imageData, gW, gH, cW, cH) {
        const grid = new Float32Array(gW * gH), sX = cW / gW, sY = cH / gH;
        for (let gy = 0; gy < gH; gy++) for (let gx = 0; gx < gW; gx++) {
            const cx = (gx + .5) * sX, cy = (gy + .5) * sY;
            let s = sampleAlpha(imageData, cx - .5, cy - .5) + sampleAlpha(imageData, cx + .5, cy - .5)
                + sampleAlpha(imageData, cx - .5, cy + .5) + sampleAlpha(imageData, cx + .5, cy + .5);
            grid[gy * gW + gx] = s > 1 ? 1 : 0;
        }
        return grid;
    }

    function computeGlyphBounds(grid, gW, gH) {
        let minX = gW, minY = gH, maxX = 0, maxY = 0;
        for (let gy = 0; gy < gH; gy++) for (let gx = 0; gx < gW; gx++)
            if (grid[gy * gW + gx] > 0) { if (gx < minX) minX = gx; if (gx > maxX) maxX = gx; if (gy < minY) minY = gy; if (gy > maxY) maxY = gy; }
        return { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
    }

    function traceEdgePixels(grid, gW, gH) {
        const edges = [];
        for (let gy = 1; gy < gH - 1; gy++) for (let gx = 1; gx < gW - 1; gx++) {
            if (!grid[gy * gW + gx]) continue;
            if (!grid[(gy - 1) * gW + gx] || !grid[(gy + 1) * gW + gx] || !grid[gy * gW + (gx + 1)] || !grid[gy * gW + (gx - 1)])
                edges.push({ x: gx, y: gy });
        }
        return edges;
    }

    function parseGlyph(text, cW, cH) {
        const fontSize = Config.SDF.FONT_SIZE;
        const parsed = renderGlyphsToCanvas(text, fontSize, cW, cH);
        const gW = Config.SDF.GRID_CELLS, gH = Math.round(gW * (cH / cW));
        const occupancyGrid = buildOccupancyGrid(parsed.imageData, gW, gH, cW, cH);
        const edgePixels = traceEdgePixels(occupancyGrid, gW, gH);
        const bounds = computeGlyphBounds(occupancyGrid, gW, gH);
        return { occupancyGrid, edgePixels, bounds, gridW: gW, gridH: gH, canvasWidth: cW, canvasHeight: cH, scaleX: cW / gW, scaleY: cH / gH, rawCanvas: parsed.canvas };
    }

    return { renderGlyphsToCanvas, buildOccupancyGrid, computeGlyphBounds, traceEdgePixels, sampleAlpha, parseGlyph };
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.FontParser = FontParser;
