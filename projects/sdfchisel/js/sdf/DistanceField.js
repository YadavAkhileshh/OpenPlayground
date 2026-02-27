/**
 * DistanceField.js – Signed Distance Field computation using 2-pass EDT.
 */
const DistanceField = (() => {
    'use strict';
    const { Config, MathUtils } = window.SDFChisel;
    const INF = 1e9;

    function edt(binary, w, h) {
        const distSq = new Float32Array(w * h).fill(INF);
        for (let y = 0; y < h; y++) {
            const base = y * w;
            let prev = binary[base] ? 0 : INF;
            for (let x = 0; x < w; x++) {
                if (binary[base + x]) { distSq[base + x] = 0; prev = 0; }
                else { prev = prev < INF ? prev + 1 : INF; distSq[base + x] = prev * prev; }
            }
            prev = INF;
            for (let x = w - 1; x >= 0; x--) {
                if (binary[base + x]) prev = 0;
                else { prev = prev < INF ? prev + 1 : INF; }
                const v = prev * prev; if (v < distSq[base + x]) distSq[base + x] = v;
            }
        }
        const f = new Float32Array(h), z = new Float32Array(h + 1), v = new Int32Array(h);
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) f[y] = distSq[y * w + x];
            let k = 0, s; v[0] = 0; z[0] = -INF; z[1] = INF;
            for (let q = 1; q < h; q++) {
                do { const r = v[k]; s = (f[q] + q * q - f[r] - r * r) / (2 * (q - r)); k--; } while (s <= z[k + 1] && k >= 0);
                k++; v[k] = q; z[k] = s; z[k + 1] = INF;
            }
            k = 0;
            for (let y = 0; y < h; y++) {
                while (z[k + 1] < y) k++;
                const r = v[k], d = y - r; distSq[y * w + x] = d * d + f[r];
            }
        }
        return distSq;
    }

    function computeSDF(grid, w, h) {
        const sz = w * h, invGrid = new Uint8Array(sz);
        for (let i = 0; i < sz; i++) invGrid[i] = grid[i] ? 0 : 1;
        const dIn = edt(grid, w, h), dOut = edt(invGrid, w, h);
        const sdf = new Float32Array(sz);
        for (let i = 0; i < sz; i++) sdf[i] = grid[i] ? -Math.sqrt(dIn[i]) : Math.sqrt(dOut[i]);
        return sdf;
    }

    function smoothSDF(sdf, w, h, passes = 1) {
        const out = new Float32Array(sdf.length);
        for (let p = 0; p < passes; p++) {
            const src = p % 2 === 0 ? sdf : out, dst = p % 2 === 0 ? out : sdf;
            for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
                const i = y * w + x; dst[i] = (src[i] * 4 + src[i - 1] + src[i + 1] + src[i - w] + src[i + w]) / 8;
            }
            for (let x = 0; x < w; x++) { dst[x] = src[x]; dst[(h - 1) * w + x] = src[(h - 1) * w + x]; }
            for (let y = 0; y < h; y++) { dst[y * w] = src[y * w]; dst[y * w + w - 1] = src[y * w + w - 1]; }
        }
        return passes % 2 === 0 ? sdf : out;
    }

    function sdfRange(sdf) {
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < sdf.length; i++) { if (sdf[i] < min) min = sdf[i]; if (sdf[i] > max) max = sdf[i]; }
        return { min, max };
    }

    function sampleSDF(sdf, w, h, gx, gy) {
        const x0 = Math.max(0, Math.min(w - 1, Math.floor(gx))), y0 = Math.max(0, Math.min(h - 1, Math.floor(gy)));
        const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1), tx = gx - x0, ty = gy - y0;
        return MathUtils.bilinear(sdf[y0 * w + x0], sdf[y0 * w + x1], sdf[y1 * w + x0], sdf[y1 * w + x1], tx, ty);
    }

    function canvasToGrid(cx, cy, cW, cH, gW, gH) { return { gx: (cx / cW) * gW, gy: (cy / cH) * gH }; }
    function querySDF(sdf, gW, gH, cW, cH, cx, cy) { const { gx, gy } = canvasToGrid(cx, cy, cW, cH, gW, gH); return sampleSDF(sdf, gW, gH, gx, gy); }

    return { edt, computeSDF, smoothSDF, sdfRange, sampleSDF, canvasToGrid, querySDF };
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.DistanceField = DistanceField;
