/**
 * BezierExtractor.js – Extracts Bézier paths from glyph edge pixels using contour tracing.
 */
const BezierExtractor = (() => {
    'use strict';
    const { MathUtils } = window.SDFChisel;

    function extractContours(edgePixels, gridW, gridH) {
        if (!edgePixels.length) return [];
        const idx = new Set(edgePixels.map(p => p.y * gridW + p.x));
        const visited = new Uint8Array(gridW * gridH);
        const DIRS = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }];
        const contours = [];
        for (const start of edgePixels) {
            const si = start.y * gridW + start.x;
            if (visited[si]) continue;
            const chain = [start]; visited[si] = 1;
            let cur = start, found = true;
            while (found) {
                found = false;
                for (const d of DIRS) {
                    const nx = cur.x + d.dx, ny = cur.y + d.dy;
                    if (nx < 0 || ny < 0 || nx >= gridW || ny >= gridH) continue;
                    const ni = ny * gridW + nx;
                    if (!visited[ni] && idx.has(ni)) { visited[ni] = 1; chain.push({ x: nx, y: ny }); cur = { x: nx, y: ny }; found = true; break; }
                }
            }
            if (chain.length >= 4) contours.push(chain);
        }
        return contours;
    }

    function rdpSimplify(pts, eps) {
        if (pts.length <= 2) return pts;
        let maxD = 0, maxI = 0;
        const first = pts[0], last = pts[pts.length - 1];
        for (let i = 1; i < pts.length - 1; i++) {
            const d = MathUtils.distSqToSegment(pts[i].x, pts[i].y, first.x, first.y, last.x, last.y);
            if (d > maxD) { maxD = d; maxI = i; }
        }
        if (maxD > eps * eps) {
            const left = rdpSimplify(pts.slice(0, maxI + 1), eps);
            const right = rdpSimplify(pts.slice(maxI), eps);
            return [...left.slice(0, -1), ...right];
        }
        return [first, last];
    }

    function fitQuadBezier(pts) {
        const n = pts.length, p0 = pts[0], p2 = pts[n - 1];
        if (n < 2) return null;
        if (n === 2) return { x0: p0.x, y0: p0.y, x1: (p0.x + p2.x) / 2, y1: (p0.y + p2.y) / 2, x2: p2.x, y2: p2.y };
        const ts = new Float64Array(n);
        let total = 0;
        for (let i = 1; i < n; i++) { total += MathUtils.dist(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y); ts[i] = total; }
        if (total < 1e-10) total = 1;
        for (let i = 0; i < n; i++)ts[i] /= total;
        let numX = 0, numY = 0, denom = 0;
        for (let i = 1; i < n - 1; i++) {
            const t = ts[i], mt = 1 - t, b1 = 2 * t * mt, b0 = mt * mt, b2 = t * t;
            numX += b1 * (pts[i].x - b0 * p0.x - b2 * p2.x);
            numY += b1 * (pts[i].y - b0 * p0.y - b2 * p2.y);
            denom += b1 * b1;
        }
        if (denom < 1e-10) return { x0: p0.x, y0: p0.y, x1: (p0.x + p2.x) / 2, y1: (p0.y + p2.y) / 2, x2: p2.x, y2: p2.y };
        return { x0: p0.x, y0: p0.y, x1: numX / denom, y1: numY / denom, x2: p2.x, y2: p2.y };
    }

    function contourToBeziers(pts, chunk = 8, eps = 1.2) {
        const simplified = rdpSimplify(pts, eps), beziers = [];
        for (let i = 0; i < simplified.length - 1; i += chunk - 1) {
            const seg = simplified.slice(i, i + chunk);
            if (seg.length < 2) break;
            const b = fitQuadBezier(seg);
            if (b) beziers.push(b);
        }
        return beziers;
    }

    function extractBeziers(edgePixels, gridW, gridH) {
        const contours = extractContours(edgePixels, gridW, gridH), all = [];
        for (const c of contours) for (const b of contourToBeziers(c)) all.push(b);
        return all;
    }

    function extractLineSegments(edgePixels, step = 2) {
        const segs = [];
        for (let i = 0; i < edgePixels.length - step; i += step)
            segs.push({ ax: edgePixels[i].x, ay: edgePixels[i].y, bx: edgePixels[i + step].x, by: edgePixels[i + step].y });
        return segs;
    }

    return { extractContours, rdpSimplify, fitQuadBezier, contourToBeziers, extractBeziers, extractLineSegments };
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.BezierExtractor = BezierExtractor;
