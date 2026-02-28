/**
 * GlyphRasterizer.js – High-resolution glyph rasterization pipeline.
 */
const GlyphRasterizer = (() => {
    'use strict';
    const { Config, MathUtils } = window.SDFChisel;
    const SDF_OVERSAMPLE = 2; // Anti-aliasing scale

    function rasterize(text, cW, cH) {
        const oW = cW * SDF_OVERSAMPLE, oH = cH * SDF_OVERSAMPLE;
        const canvas = document.createElement('canvas');
        canvas.width = oW; canvas.height = oH;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, oW, oH);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

        let fontSize = Config.SDF.FONT_SIZE * SDF_OVERSAMPLE;
        ctx.font = `${Config.SDF.FONT_WEIGHT} ${fontSize}px ${Config.SDF.FONT_FAMILY}`;
        const m = ctx.measureText(text);
        if (m.width > oW * 0.90) {
            fontSize = Math.floor(fontSize * (oW * 0.90) / m.width);
            ctx.font = `${Config.SDF.FONT_WEIGHT} ${fontSize}px ${Config.SDF.FONT_FAMILY}`;
        }

        ctx.fillText(text, oW / 2, oH / 2);

        const id = ctx.getImageData(0, 0, oW, oH);
        const gW = Config.SDF.GRID_CELLS, gH = Math.round(gW * (cH / cW));
        const grid = new Float32Array(gW * gH);
        const sX = oW / gW, sY = oH / gH;

        for (let gy = 0; gy < gH; gy++) {
            for (let gx = 0; gx < gW; gx++) {
                let sum = 0, count = 0;
                const sx0 = Math.floor(gx * sX), sy0 = Math.floor(gy * sY);
                const sx1 = Math.min(oW, Math.ceil((gx + 1) * sX)), sy1 = Math.min(oH, Math.ceil((gy + 1) * sY));
                for (let yy = sy0; yy < sy1; yy++) {
                    for (let xx = sx0; xx < sx1; xx++) {
                        sum += id.data[(yy * oW + xx) * 4] > 127 ? 1 : 0;
                        count++;
                    }
                }
                grid[gy * gW + gx] = (sum / count) >= 0.5 ? 1 : 0;
            }
        }

        return { grid, gridW: gW, gridH: gH, scaleX: cW / gW, scaleY: cH / gH };
    }

    return { rasterize };
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.GlyphRasterizer = GlyphRasterizer;
