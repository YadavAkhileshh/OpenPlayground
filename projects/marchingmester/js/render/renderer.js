/**
 * Renderer — CPU rasteriser using HTML5 Canvas 2D.
 *
 * New features:
 *  - 3 render modes: shaded, wireframe, xray
 *  - 4 color themes: liquid-metal, lava, plasma, ghost
 *  - Rim lighting (Fresnel)
 *  - Specular highlight
 *  - Backface culling
 *  - Painter's algorithm depth sort
 *  - Reference grid floor
 *  - Metaball sphere markers (debug)
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });

        this.W = canvas.width;
        this.H = canvas.height;
        this.halfW = this.W / 2;
        this.halfH = this.H / 2;

        // Render settings
        this.mode = 'shaded';     // 'shaded' | 'wireframe' | 'xray'
        this.theme = 'liquid-metal';
        this.showFloor = true;
        this.showBalls = false;

        // Lighting
        this.lightDir = new Vector3(0.6, 1.2, 0.5).normalize();
        this.ambient = 0.15;
        this.specPower = 1.0;
        this.rimPower = 3.0;

        // Triangle pool to avoid garbage per frame
        this._triPool = [];
    }

    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.W = w; this.H = h;
        this.halfW = w / 2; this.halfH = h / 2;
    }

    // =============================================
    //  Main render entry
    // =============================================

    render(mesh, field, camera) {
        const ctx = this.ctx;

        // Background
        ctx.fillStyle = '#030508';
        ctx.fillRect(0, 0, this.W, this.H);

        // Draw floor grid
        if (this.showFloor) this._drawFloor(camera);

        // Draw debug balls
        if (this.showBalls) this._drawBalls(field, camera);

        // Project and shade triangles
        const verts = mesh.vertices;
        const normals = mesh.normals;
        const numTris = mesh.triangleCount;

        if (numTris === 0) {
            this._drawNoMeshHint(ctx);
            return { triCount: 0, vertCount: 0 };
        }

        const camPos = camera.position;

        // Reuse pool
        let pool = this._triPool;
        let poolLen = 0;

        for (let i = 0; i < numTris; i++) {
            const b = i * 9;

            // World positions
            const p1w = { x: verts[b], y: verts[b + 1], z: verts[b + 2] };
            const p2w = { x: verts[b + 3], y: verts[b + 4], z: verts[b + 5] };
            const p3w = { x: verts[b + 6], y: verts[b + 7], z: verts[b + 8] };

            // Camera space
            const c1 = camera.worldToCamera(p1w);
            const c2 = camera.worldToCamera(p2w);
            const c3 = camera.worldToCamera(p3w);

            // Near-plane clip — discard if any vertex is behind camera
            if (c1.z < camera.near || c2.z < camera.near || c3.z < camera.near) continue;

            // Screen projection
            const s1 = camera.project(c1, this.halfW, this.halfH);
            const s2 = camera.project(c2, this.halfW, this.halfH);
            const s3 = camera.project(c3, this.halfW, this.halfH);

            // Backface culling (signed screen area)
            // Positive area = front-facing in our coordinate convention
            const area = (s2.x - s1.x) * (s3.y - s1.y) - (s3.x - s1.x) * (s2.y - s1.y);
            if (area > 0) continue;

            // === Lighting ===
            // Use average normal of the 3 vertices for flat-like shading
            const nx = (normals[b] + normals[b + 3] + normals[b + 6]) / 3;
            const ny = (normals[b + 1] + normals[b + 4] + normals[b + 7]) / 3;
            const nz = (normals[b + 2] + normals[b + 5] + normals[b + 8]) / 3;

            // Diffuse
            const diff = Math.max(0, nx * this.lightDir.x + ny * this.lightDir.y + nz * this.lightDir.z);

            // Centroid world pos (for view vector)
            const cx = (p1w.x + p2w.x + p3w.x) / 3;
            const cy = (p1w.y + p2w.y + p3w.y) / 3;
            const cz = (p1w.z + p2w.z + p3w.z) / 3;
            let vx = camPos.x - cx, vy = camPos.y - cy, vz = camPos.z - cz;
            const vl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
            vx /= vl; vy /= vl; vz /= vl;

            // Specular (Blinn-Phong half vector)
            const hx = (vx + this.lightDir.x) / 2;
            const hy = (vy + this.lightDir.y) / 2;
            const hz = (vz + this.lightDir.z) / 2;
            const hl = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1;
            const spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hl), 32) * this.specPower;

            // Rim
            const dotV = nx * vx + ny * vy + nz * vz;
            const rim = Math.pow(Math.max(0, 1 - dotV), this.rimPower);

            const zDepth = (c1.z + c2.z + c3.z) / 3;

            // Write into pool
            if (poolLen >= pool.length) {
                pool.push({ s1, s2, s3, diff, spec, rim, z: zDepth });
            } else {
                const t = pool[poolLen];
                t.s1 = s1; t.s2 = s2; t.s3 = s3;
                t.diff = diff; t.spec = spec; t.rim = rim;
                t.z = zDepth;
            }
            poolLen++;
        }

        // Depth sort (back to front)
        pool.length = poolLen;
        pool.sort((a, b) => b.z - a.z);

        // Rasterise
        this._drawTriangles(pool, ctx);

        return { triCount: numTris, vertCount: numTris * 3 };
    }

    // =============================================
    //  Triangle drawing
    // =============================================

    _drawTriangles(tris, ctx) {
        const mode = this.mode;

        ctx.lineJoin = 'round';

        for (const t of tris) {
            const { s1, s2, s3, diff, spec, rim } = t;

            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.lineTo(s3.x, s3.y);
            ctx.closePath();

            if (mode === 'wireframe') {
                ctx.strokeStyle = this._wireColor(diff, rim);
                ctx.lineWidth = 0.6;
                ctx.stroke();
            } else if (mode === 'xray') {
                ctx.strokeStyle = `rgba(0, 220, 255, ${0.15 + rim * 0.6})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            } else {
                // Shaded
                const fill = this._shadeColor(diff, spec, rim);
                ctx.fillStyle = fill;
                ctx.strokeStyle = fill;
                ctx.lineWidth = 0.5;
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    _wireColor(diff, rim) {
        const theme = this.theme;
        if (theme === 'lava') {
            const r = Math.floor(220 + rim * 35);
            const g = Math.floor(40 + diff * 80);
            return `rgba(${r},${g},0,${0.5 + rim * 0.5})`;
        } else if (theme === 'plasma') {
            const r = Math.floor(150 + rim * 105);
            const b = Math.floor(220 + rim * 35);
            return `rgba(${r},0,${b},${0.5 + rim * 0.5})`;
        } else if (theme === 'ghost') {
            return `rgba(220,240,255,${0.08 + rim * 0.4})`;
        }
        // liquid-metal default
        const b = Math.floor(180 + rim * 75);
        return `rgba(0,${Math.floor(diff * 180)},${b},${0.5 + rim * 0.5})`;
    }

    _shadeColor(diff, spec, rim) {
        const amb = this.ambient;
        const lum = amb + diff * (1 - amb);

        if (this.theme === 'liquid-metal') {
            // Steel blue-cyan with white specular
            const r = Math.floor(0 + spec * 200 + rim * 80);
            const g = Math.floor(40 + lum * 160 + spec * 200 + rim * 60);
            const b = Math.floor(80 + lum * 175 + spec * 200 + rim * 30);
            return `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`;
        } else if (this.theme === 'lava') {
            const r = Math.floor(80 + lum * 175 + spec * 200);
            const g = Math.floor(0 + lum * 60 + spec * 100);
            return `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.floor(rim * 40)})`;
        } else if (this.theme === 'plasma') {
            const r = Math.floor(60 + lum * 150 + spec * 180 + rim * 80);
            const b = Math.floor(120 + lum * 135 + spec * 200 + rim * 40);
            return `rgb(${Math.min(255, r)},${Math.floor(rim * 30)},${Math.min(255, b)})`;
        } else if (this.theme === 'ghost') {
            const v = Math.floor(10 + lum * 30);
            const a = (0.08 + diff * 0.3 + rim * 0.4).toFixed(2);
            return `rgba(${200 + Math.floor(rim * 55)},${220 + Math.floor(rim * 35)},255,${a})`;
        }
        return `rgb(0,255,255)`;
    }

    // =============================================
    //  Grid floor (Feature 1)
    // =============================================

    _drawFloor(camera) {
        const ctx = this.ctx;
        const size = 50, step = 10;

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 180, 220, 0.06)';
        ctx.lineWidth = 1;

        for (let x = -size; x <= size; x += step) {
            const a = camera.worldToCamera({ x, y: -22, z: -size });
            const b = camera.worldToCamera({ x, y: -22, z: size });
            if (a.z > camera.near && b.z > camera.near) {
                const sa = camera.project(a, this.halfW, this.halfH);
                const sb = camera.project(b, this.halfW, this.halfH);
                ctx.moveTo(sa.x, sa.y);
                ctx.lineTo(sb.x, sb.y);
            }
        }
        for (let z = -size; z <= size; z += step) {
            const a = camera.worldToCamera({ x: -size, y: -22, z });
            const b = camera.worldToCamera({ x: size, y: -22, z });
            if (a.z > camera.near && b.z > camera.near) {
                const sa = camera.project(a, this.halfW, this.halfH);
                const sb = camera.project(b, this.halfW, this.halfH);
                ctx.moveTo(sa.x, sa.y);
                ctx.lineTo(sb.x, sb.y);
            }
        }
        ctx.stroke();
    }

    // =============================================
    //  Debug: metaball centers (Feature 5)
    // =============================================

    _drawBalls(field, camera) {
        const ctx = this.ctx;
        for (const ball of field.metaballs) {
            if (!ball.alive) continue;
            const c = camera.worldToCamera(ball.pos);
            if (c.z < camera.near) continue;
            const s = camera.project(c, this.halfW, this.halfH);
            const r = (ball.radius / c.z) * camera.focalLen * 0.6;

            ctx.beginPath();
            ctx.arc(s.x, s.y, Math.max(2, r), 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 220, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Cross
            ctx.beginPath();
            ctx.moveTo(s.x - 4, s.y); ctx.lineTo(s.x + 4, s.y);
            ctx.moveTo(s.x, s.y - 4); ctx.lineTo(s.x, s.y + 4);
            ctx.strokeStyle = 'rgba(0, 220, 255, 0.6)';
            ctx.stroke();
        }
    }

    _drawNoMeshHint(ctx) {
        ctx.fillStyle = 'rgba(0,220,255,0.15)';
        ctx.font = '12px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('No surface detected. Try raising ISO LEVEL.', this.halfW, this.halfH);
        ctx.textAlign = 'left';
    }
}
