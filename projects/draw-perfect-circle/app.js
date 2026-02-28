/********************************************/
/********************************************/
/* Please ❤ this if you like it! */
/* Follow Me https://codepen.io/designfenix */
/********************************************/
/********************************************/
/**/
/**/
/**/
/**/
/**/
/**/
/**/
(() => {
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    const legend = document.getElementById("legend");
    const scoreEl = document.getElementById("scoreVal");
    const bigScoreEl = document.getElementById("bigScore");
    const guideToggle = document.getElementById("guideToggle");
    const clearBtn = document.getElementById("clearBtn");

    let pts = [],
        drawing = false,
        fitted = null,
        lastScore = 0,
        needFit = false,
        raf;

    function fitCanvas() {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        canvas.width = Math.floor(r.width * dpr);
        canvas.height = Math.floor(r.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawAll(true);
    }

    function getPos(evt) {
        const rect = canvas.getBoundingClientRect();
        const t = evt.touches && evt.touches[0];
        const x = (t ? t.clientX : evt.clientX) - rect.left;
        const y = (t ? t.clientY : evt.clientY) - rect.top;
        return { x, y };
    }

    function fitCircle(points) {
        const n = points.length;
        if (n < 10) return null;
        let Sx = 0,
            Sy = 0,
            Sz = 0,
            Sxx = 0,
            Syy = 0,
            Sxy = 0,
            Sxz = 0,
            Syz = 0;
        for (let p of points) {
            const { x, y } = p,
                z = x * x + y * y;
            Sx += x;
            Sy += y;
            Sz += z;
            Sxx += x * x;
            Syy += y * y;
            Sxy += x * y;
            Sxz += x * z;
            Syz += y * z;
        }
        const M = [
            [Sxx, Sxy, Sx],
            [Sxy, Syy, Sy],
            [Sx, Sy, n],
        ];
        const v = [-Sxz, -Syz, -Sz];
        const abc = solve3x3(M, v);
        if (!abc) return null;
        const [a, b, c] = abc,
            cx = -a / 2,
            cy = -b / 2,
            R2 = cx * cx + cy * cy - c;
        if (R2 <= 0 || !isFinite(R2)) return null;
        const R = Math.sqrt(R2);

        let sumSq = 0;
        const angs = [];
        for (let p of points) {
            const dx = p.x - cx,
                dy = p.y - cy;
            const ri = Math.hypot(dx, dy);
            sumSq += (ri - R) * (ri - R);
            angs.push(Math.atan2(dy, dx));
        }
        const radialRMS = Math.sqrt(sumSq / points.length) / Math.max(1, R);

        angs.sort((a, b) => a - b);
        let maxGap = 0;
        for (let i = 1; i < angs.length; i++)
            maxGap = Math.max(maxGap, angs[i] - angs[i - 1]);
        maxGap = Math.max(maxGap, angs[0] + Math.PI * 2 - angs[angs.length - 1]);
        const coverageFrac = Math.max(0, Math.min(1, 1 - maxGap / (Math.PI * 2)));

        const endGap = Math.hypot(
            points[0].x - points[n - 1].x,
            points[0].y - points[n - 1].y,
        );
        const closed = endGap < Math.max(8, R * 0.15);
        return { cx, cy, R, radialRMS, coverageFrac, closed };
    }
    function solve3x3(M, v) {
        const [[a, b, c], [d, e, f], [g, h, i]] = M;
        const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
        if (Math.abs(det) < 1e-9 || !isFinite(det)) return null;
        const inv = [
            [(e * i - f * h) / det, -(b * i - c * h) / det, (b * f - c * e) / det],
            [-(d * i - f * g) / det, (a * i - c * g) / det, -(a * f - c * d) / det],
            [(d * h - e * g) / det, -(a * h - b * g) / det, (a * e - b * d) / det],
        ];
        return [
            inv[0][0] * v[0] + inv[0][1] * v[1] + inv[0][2] * v[2],
            inv[1][0] * v[0] + inv[1][1] * v[1] + inv[1][2] * v[2],
            inv[2][0] * v[0] + inv[2][1] * v[1] + inv[2][2] * v[2],
        ];
    }

    function scoreFromFit(f) {
        if (!f) return 0;
        const { radialRMS, coverageFrac, closed } = f;
        const radialScore = clamp(1 - radialRMS / 0.15, 0, 1);
        const covScore = clamp(coverageFrac / 0.95, 0, 1);
        const s = (0.65 * radialScore + 0.35 * covScore) * (closed ? 1 : 0.92);
        return Math.round(clamp(s, 0, 1) * 100);
    }
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

    function drawGuides() {
        if (!guideToggle.checked) return;
        const w = canvas.clientWidth,
            h = canvas.clientHeight;
        const cx = w / 2,
            cy = h / 2;
        ctx.save();
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(180,200,255,.15)";
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.stroke();
        ctx.setLineDash([4, 6]);
        for (const r of [80, 160, 240]) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
    function drawStroke() {
        if (pts.length < 2) return;
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(134,168,255,.9)";
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.restore();
    }
    function drawFit() {
        if (!fitted) return;
        const { cx, cy, R } = fitted;
        const s = lastScore;
        const col =
            s > 85 ? getCSS("--ok") : s > 65 ? getCSS("--warn") : getCSS("--bad");
        ctx.save();
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 6]);
        ctx.strokeStyle = col.trim();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    function drawAll(skipFit) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGuides();
        drawStroke();
        if (!skipFit) drawFit();
    }
    const getCSS = (v) =>
        getComputedStyle(document.documentElement).getPropertyValue(v);

    function loop() {
        if (needFit && pts.length >= 10) {
            fitted = fitCircle(pts);
            lastScore = scoreFromFit(fitted);
            updateHUD();
            needFit = false;
        }
        drawAll();
        raf = requestAnimationFrame(loop);
    }
    function updateHUD() {
        scoreEl.textContent = `${lastScore}%`;
        bigScoreEl.textContent = `${lastScore}%`;
        if (fitted) {
            const { R, radialRMS, coverageFrac } = fitted;
            legend.textContent = `R≈${R.toFixed(1)}px · RMS=${(radialRMS * 100).toFixed(1)}% · Coverage=${Math.round(coverageFrac * 100)}%`;
        } else {
            legend.textContent = "";
        }
    }

    function startDraw(e) {
        drawing = true;
        pts = [];
        fitted = null;
        lastScore = 0;
        updateHUD();
        addPoint(e);
    }
    function addPoint(e) {
        if (!drawing) return;
        pts.push(getPos(e));
        if (pts.length % 2 === 0) needFit = true;
    }
    function endDraw() {
        drawing = false;
        fitted = fitCircle(pts);
        lastScore = scoreFromFit(fitted);
        updateHUD();
    }

    canvas.addEventListener("pointerdown", (e) => {
        canvas.setPointerCapture(e.pointerId);
        startDraw(e);
    });
    canvas.addEventListener("pointermove", addPoint);
    canvas.addEventListener("pointerup", endDraw);
    canvas.addEventListener("pointercancel", endDraw);
    canvas.addEventListener("pointerleave", (e) => {
        if (drawing) endDraw(e);
    });

    clearBtn.addEventListener("click", () => {
        pts = [];
        fitted = null;
        lastScore = 0;
        updateHUD();
        drawAll(true);
    });
    guideToggle.addEventListener("change", () => drawAll());

    window.addEventListener("resize", fitCanvas, { passive: true });
    fitCanvas();
    loop();
    window.addEventListener("beforeunload", () => cancelAnimationFrame(raf));
})();
