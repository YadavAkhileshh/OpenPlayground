/**
 * Math Utilities for 2D Vector Operations
 */
export const Vec2 = {
    create: (x = 0, y = 0) => ({ x, y }),
    
    add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
    
    sub: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
    
    scale: (v, s) => ({ x: v.x * s, y: v.y * s }),
    
    dot: (v1, v2) => v1.x * v2.x + v1.y * v2.y,
    
    mag: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
    
    normalize: (v) => {
        const m = Math.sqrt(v.x * v.x + v.y * v.y);
        return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
    },
    
    dist: (v1, v2) => Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)),
    
    rotate: (v, angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x * cos - v.y * sin,
            y: v.x * sin + v.y * cos
        };
    },
    
    angle: (v) => Math.atan2(v.y, v.x),

    // Reflect vector d around normal n
    reflect: (d, n) => {
        const dot = d.x * n.x + d.y * n.y;
        return {
            x: d.x - 2 * dot * n.x,
            y: d.y - 2 * dot * n.y
        };
    }
};

export const MathUtil = {
    degToRad: (deg) => deg * (Math.PI / 180),
    radToDeg: (rad) => rad * (180 / Math.PI),
    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
    snap: (val, step) => Math.round(val / step) * step,
    
    // Check intersection between two line segments p1-p2 and p3-p4
    intersect: (p1, p2, p3, p4) => {
        const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
        if (det === 0) return null; // Parallel lines

        const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
        const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

        if ((0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1)) {
            return {
                x: p1.x + lambda * (p2.x - p1.x),
                y: p1.y + lambda * (p2.y - p1.y),
                t: lambda // Time along ray
            };
        }
        return null;
    }
};
