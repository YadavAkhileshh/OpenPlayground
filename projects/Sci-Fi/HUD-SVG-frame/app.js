// Sci-Fi/HUD SVG frame generator
// Follow me on X for more: https://x.com/troshkin_pavel

const seedInput = document.getElementById("seedInput");

let seed = 898766;
function addCardWithFrame(seedVal) {
    const { svgMarkup: frameSvg, meta } = generateHudFrameSVG({
        w: 384,
        h: 150,
        seed: seedVal,
        pad: 22,
    });
    document.querySelector('#frame > span').innerHTML = frameSvg;
    return meta;
}

function regenerateSingle(newSeed) {
    document.querySelector('#frame > span').innerHTML = "";
    const m = addCardWithFrame(newSeed);
    seedInput.value = m.seed;
}

document.getElementById("btnRand").addEventListener("click", () => {
    seed = (seed + Math.floor(Math.random() * 9999) + 1) >>> 0;
    regenerateSingle(seed);
});

document.getElementById("btnSeed").addEventListener("click", () => {
    const v = Number(seedInput.value);
    if (Number.isFinite(v) && v >= 0) {
        seed = (v >>> 0);
        regenerateSingle(seed);
    }
});

document.getElementById('save-frame').addEventListener('click', function() {
    // 1. Get the SVG element's content as a string
    const svgElement = document.getElementById('generatedFrame');
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);

    // 2. Create a Blob object from the SVG string
    // This creates an in-memory representation of the file data
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

    // 3. Create a temporary URL for the Blob
    const url = URL.createObjectURL(svgBlob);

    // 4. Create a temporary anchor element to trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'frame.svg'; // Set the desired file name

    // 5. Append the link to the body, click it programmatically, and then remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // 6. Revoke the temporary URL to free up resources
    URL.revokeObjectURL(url);
});

regenerateSingle(seed);

// hudFrameGenerator.js
// Sci-Fi/HUD SVG frame generator
// Focus: corners, trapezoid features (inset/outset), nested trapezoid fill padding,
// inner/outer corner triangles with correct rules.

/* -----------------------------
   Seeded RNG
-------------------------------- */
export function mulberry32(seed) {
    let t = seed >>> 0;
    return function rng() {
        t += 0x6D2B79F5;
        let x = t;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}

function rInt(rng, a, b) {
    return Math.floor(a + rng() * (b - a + 1));
}

function rFloat(rng, a, b) {
    return a + rng() * (b - a);
}

function rPick(rng, arr) {
    return arr[rInt(rng, 0, arr.length - 1)];
}

function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

/* -----------------------------
   Formatting
-------------------------------- */
function fmt(n) {
    return Number(n.toFixed(2)).toString();
}

/* -----------------------------
   Nested polygon inset helper
   Move polygon vertices toward centroid by a factor based on inset.
-------------------------------- */
function insetPolygonTowardCentroid(points) {
    const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

    // normalize factor: bigger polygons => smaller effect per same inset
    const maxDist = Math.max(
        1,
        ...points.map(p => Math.hypot(p.x - cx, p.y - cy))
    );

    return points.map(p => ({
        x: p.x,
        y: p.y,
    }));
}

/* -----------------------------
   Trapezoid Feature
   Edge: top/bottom/left/right
   mode: inset/outset
-------------------------------- */
function buildTrapezoidFeature({
                                   edge,
                                   start,
                                   end,
                                   depth,
                                   mode,           // "inset" | "outset"
                                   nestedFill,     // boolean
                                   nestedInset,    // padding inside feature
                               }) {
    const isInset = mode === "inset";
    const d = Math.max(0.1, depth);

    // base polygon points in local edge-space
    // We will return a segment replacement polygon "step" for outline,
    // and optional nested fill polygon.
    let p1, p2, p3, p4;

    if (edge === "top") {
        const y0 = 0;
        const y1 = isInset ? d : -d;
        p1 = {x: start, y: y0};
        p2 = {x: end, y: y0};
        p3 = {x: end - d, y: y1};
        p4 = {x: start + d, y: y1};
    } else if (edge === "bottom") {
        const y0 = 0;
        const y1 = isInset ? -d : d;
        p1 = {x: start, y: y0};
        p2 = {x: end, y: y0};
        p3 = {x: end - d, y: y1};
        p4 = {x: start + d, y: y1};
    } else if (edge === "left") {
        const x0 = 0;
        const x1 = isInset ? d : -d;
        p1 = {x: x0, y: start};
        p2 = {x: x0, y: end};
        p3 = {x: x1, y: end - d};
        p4 = {x: x1, y: start + d};
    } else if (edge === "right") {
        const x0 = 0;
        const x1 = isInset ? -d : d;
        p1 = {x: x0, y: start};
        p2 = {x: x0, y: end};
        p3 = {x: x1, y: end - d};
        p4 = {x: x1, y: start + d};
    } else {
        throw new Error("Unknown edge: " + edge);
    }

    // For outline replacement:
    // point order for "step" insertion is: p1 -> p4 -> p3 -> p2 (along edge)
    const pathSegs = [p1, p4, p3, p2];

    // Nested fill path (smaller trapezoid inside the feature),
    // now computed via centroid inset (proper margins on all sides).
    let fillD = null;
    if (nestedFill && mode === "inset") {
        const poly = [p1, p4, p3, p2];
        const q = insetPolygonTowardCentroid(poly);

        const gap = isInset ? nestedInset : 0;
        const outerGap = isInset ? gap + (gap / 2) : 0;
        const innerGap = isInset ? gap - (gap / 2) : 0;
        if (edge === "bottom") {
            fillD =
                `M ${fmt(q[0].x + outerGap)} ${fmt(q[0].y)} ` +
                `L ${fmt(q[1].x + innerGap)} ${fmt(q[1].y + gap)} ` +
                `L ${fmt(q[2].x - innerGap)} ${fmt(q[2].y + gap)} ` +
                `L ${fmt(q[3].x - outerGap)} ${fmt(q[3].y)} Z`;
        } else if (edge === "top") {
            fillD =
                `M ${fmt(q[0].x + outerGap)} ${fmt(q[0].y)} ` +
                `L ${fmt(q[1].x + innerGap)} ${fmt(q[1].y - gap)} ` +
                `L ${fmt(q[2].x - innerGap)} ${fmt(q[2].y - gap)} ` +
                `L ${fmt(q[3].x - outerGap)} ${fmt(q[3].y)} Z`;
        } else if (edge === "right") {
            fillD =
                `M ${fmt(q[0].x)} ${fmt(q[0].y + outerGap)} ` +
                `L ${fmt(q[1].x + gap)} ${fmt(q[1].y + innerGap)} ` +
                `L ${fmt(q[2].x + gap)} ${fmt(q[2].y - innerGap)} ` +
                `L ${fmt(q[3].x)} ${fmt(q[3].y - outerGap)} Z`;
        } else if (edge === "left") {
            fillD =
                `M ${fmt(q[0].x)} ${fmt(q[0].y + outerGap)} ` +
                `L ${fmt(q[1].x - gap)} ${fmt(q[1].y + innerGap)} ` +
                `L ${fmt(q[2].x - gap)} ${fmt(q[2].y - innerGap)} ` +
                `L ${fmt(q[3].x)} ${fmt(q[3].y - outerGap)} Z`;
        } else {
            fillD =
                `M ${fmt(q[0].x)} ${fmt(q[0].y)} ` +
                `L ${fmt(q[1].x)} ${fmt(q[1].y)} ` +
                `L ${fmt(q[2].x)} ${fmt(q[2].y)} ` +
                `L ${fmt(q[3].x)} ${fmt(q[3].y)} Z`;
        }
    }

    return {pathSegs, fillD};
}

/* -----------------------------
   Corner Triangles
   Rules:
   - inner triangle only when corner is 90° (chamfer == 0)
   - outer triangle only when corner is chamfered (chamfer > 0)

   FIX:
   Outer triangle must be oriented so that its hypotenuse "faces" the chamfer.
   That means the right angle should be away from the frame corner.
-------------------------------- */

// Inner triangle (stays INSIDE), local at origin corner, pointing inward.
function buildInnerCornerTriangle(corner, size) {
    const s = Math.max(6, size);

    // In SVG, y grows downward.
    // We'll create a small triangle hugging inside, but actual placement will use gap offset.
    if (corner === "tl") return `M 0 ${fmt(s)} L 0 0 L ${fmt(s)} 0 Z`;
    if (corner === "tr") return `M 0 0 L ${fmt(-s)} 0 L 0 ${fmt(s)} Z`;
    if (corner === "br") return `M 0 0 L 0 ${fmt(-s)} L ${fmt(-s)} 0 Z`;
    // bl
    return `M 0 0 L ${fmt(s)} 0 L 0 ${fmt(-s)} Z`;
}

// Outer triangle (stays OUTSIDE), local at origin corner,
// oriented so hypotenuse "faces" the chamfer.
// Right angle is away from corner.
function buildOuterCornerTriangle(corner, size, gap) {
    const s = Math.max(10, size);
    const negativeGap = -1 * gap;
    // TL outside quadrant (-x,-y):
    // vertices: (-s,0), (0,-s), (-s,-s) => right angle at (-s,-s)
    if (corner === "tl") return `M ${fmt(-s)} ${negativeGap} L ${negativeGap} ${fmt(-s)} L ${fmt(-s)} ${fmt(-s)} Z`;

    // TR outside quadrant (+x,-y):
    // vertices: (s,0), (0,-s), (s,-s)
    if (corner === "tr") return `M ${fmt(s)} ${negativeGap} L ${gap} ${fmt(-s)} L ${fmt(s)} ${fmt(-s)} Z`;

    // BR outside quadrant (+x,+y):
    // vertices: (s,0), (0,s), (s,s)
    if (corner === "br") return `M ${fmt(s)} ${gap} L ${gap} ${fmt(s)} L ${fmt(s)} ${fmt(s)} Z`;

    // BL outside quadrant (-x,+y):
    // vertices: (-s,0), (0,s), (-s,s)
    return `M ${fmt(-s)} ${gap} L ${negativeGap} ${fmt(s)} L ${fmt(-s)} ${fmt(s)} Z`;
}

/* -----------------------------
   Main generator
-------------------------------- */
export function generateHudFrameSVG({
                                        w = 920,
                                        h = 160,
                                        seed = 1,

                                        pad = 18, // viewBox expansion for outset + outer triangles

                                        strokeOuter = "rgba(18,168,255,0.95)",
                                        strokeInner = "rgba(18,168,255,0.32)",
                                        strokeOuterW = 1,
                                        strokeInnerW = 3,

                                        panelFill = "rgba(4,22,34,0.72)",
                                        texDotFill = "rgba(18,168,255,0.10)",
                                        accentFill = "rgba(18,168,255,0.55)",
                                        accentStroke = "rgba(18,168,255,0.78)",
                                        accentStrokeW = 1,

                                        glow = true,

                                        // NEW: spacing controls
                                        featureFillInsetMin = 4,
                                        featureFillInsetMax = 4,
                                        triangleGapMin = 4,
                                        triangleGapMax = 4,
                                    } = {}) {
    const rng = mulberry32(seed);

    /* -----------------------------
       1) Corners: 0 or chamfer
       chamfer can be deep up to 50%
    -------------------------------- */
    const maxChamfer = Math.floor(Math.min(w, h) * 0.5);

    function genChamfer() {
        const squareChance = 0.25;
        if (rng() < squareChance) return 0;

        const deepChance = 0.28;
        if (rng() < deepChance) {
            return rInt(rng, Math.floor(maxChamfer * deepChance), Math.floor(maxChamfer * 0.5));
        }

        return rInt(rng, 14, Math.floor(maxChamfer * deepChance));
    }

    const corners = {
        tl: genChamfer(),
        tr: genChamfer(),
        br: genChamfer(),
        bl: genChamfer(),
    };

    /* -----------------------------
       2) Trapezoid features: 1..2
    -------------------------------- */
    const featureCount = rPick(rng, [1, 1, 1, 2]);
    const edgesPool = ["top", "bottom", "top", "bottom", "left", "right"];

    const features = [];
    const featureByEdge = new Map();

    function edgeLength(edge) {
        return (edge === "top" || edge === "bottom") ? w : h;
    }

    function edgeCornerMargins(edge) {
        if (edge === "top") return [corners.tl, corners.tr];
        if (edge === "bottom") return [corners.bl, corners.br];
        if (edge === "left") return [corners.tl, corners.bl];
        return [corners.tr, corners.br];
    }

    for (let i = 0; i < featureCount; i++) {
        const edge = rPick(rng, edgesPool);
        if (featureByEdge.has(edge)) continue; // max 1 per edge for stability

        const mode = (rng() < 0.55) ? "inset" : "outset";

        const L = edgeLength(edge);
        const [mA, mB] = edgeCornerMargins(edge);

        const margin = 16;
        const minStart = (mA || 0) + margin;
        const maxEnd = L - (mB || 0) - margin;

        const maxLen = Math.max(40, (maxEnd - minStart) * 0.8);
        const minLen = Math.max(52, Math.min(160, maxLen * 0.35));
        let segLen = rInt(rng, Math.floor(minLen), Math.floor(maxLen));

        const placement = rPick(rng, ["center", "center", "edgeA", "edgeB"]);
        let start;

        if (placement === "center") {
            const center = rFloat(rng, minStart + segLen / 2, maxEnd - segLen / 2);
            start = center - segLen / 2;
        } else if (placement === "edgeA") {
            start = minStart;
            segLen = rInt(
                rng,
                Math.floor((maxEnd - minStart) * 0.35),
                Math.floor((maxEnd - minStart) * 0.8)
            );
        } else {
            segLen = rInt(
                rng,
                Math.floor((maxEnd - minStart) * 0.35),
                Math.floor((maxEnd - minStart) * 0.8)
            );
            start = maxEnd - segLen;
        }

        const end = start + segLen;

        // const depthMax = Math.min(34, Math.floor(segLen * 0.24));
        // const depth = rInt(rng, 10, Math.max(10, depthMax));
        const depth = rInt(rng, 5, 15);

        const nestedFill = rng() < 0.62;
        const nestedInset = rFloat(rng, featureFillInsetMin, featureFillInsetMax);

        const {pathSegs, fillD} = buildTrapezoidFeature({
            edge,
            start,
            end,
            depth,
            mode,
            nestedFill,
            nestedInset,
        });

        const f = {edge, mode, start, end, depth, nestedFill, nestedInset, pathSegs, fillD};
        features.push(f);
        featureByEdge.set(edge, f);
    }

    /* -----------------------------
       3) Build outline points (clockwise)
       with edge replacement segments
    -------------------------------- */
    function buildTopEdge() {
        const f = featureByEdge.get("top");
        const xL = corners.tl;
        const xR = w - corners.tr;

        if (!f) return [{x: xL, y: 0}, {x: xR, y: 0}];

        const start = clamp(f.start, xL + 4, xR - 4);
        const end = clamp(f.end, start + 20, xR - 4);
        const seg = f.pathSegs.map(p => ({x: p.x, y: p.y}));

        return [
            {x: xL, y: 0},
            {x: start, y: 0},
            ...seg.slice(1, 3), // p4,p3
            {x: end, y: 0},
            {x: xR, y: 0},
        ];
    }

    function buildRightEdge() {
        const f = featureByEdge.get("right");
        const yT = corners.tr;
        const yB = h - corners.br;
        const x = w;

        if (!f) return [{x, y: yT}, {x, y: yB}];

        const start = clamp(f.start, yT + 4, yB - 4);
        const end = clamp(f.end, start + 20, yB - 4);

        const seg = f.pathSegs.map(p => ({x: x + p.x, y: p.y}));

        return [
            {x, y: yT},
            {x, y: start},
            ...seg.slice(1, 3),
            {x, y: end},
            {x, y: yB},
        ];
    }

    function buildBottomEdge() {
        const f = featureByEdge.get("bottom");
        const xL = corners.bl;
        const xR = w - corners.br;
        const y = h;

        if (!f) return [{x: xR, y}, {x: xL, y}];

        const start = clamp(f.start, xL + 4, xR - 4);
        const end = clamp(f.end, start + 20, xR - 4);

        const seg = f.pathSegs.map(p => ({x: p.x, y: y + p.y}));
        const p3 = seg[2];
        const p4 = seg[1];

        return [
            {x: xR, y},
            {x: end, y},
            p3,
            p4,
            {x: start, y},
            {x: xL, y},
        ];
    }

    function buildLeftEdge() {
        const f = featureByEdge.get("left");
        const yT = corners.tl;
        const yB = h - corners.bl;
        const x = 0;

        if (!f) return [{x, y: yB}, {x, y: yT}];

        const start = clamp(f.start, yT + 4, yB - 4);
        const end = clamp(f.end, start + 20, yB - 4);

        const seg = f.pathSegs.map(p => ({x: x + p.x, y: p.y}));
        const p3 = seg[2];
        const p4 = seg[1];

        return [
            {x, y: yB},
            {x, y: end},
            p3,
            p4,
            {x, y: start},
            {x, y: yT},
        ];
    }

    const topPts = buildTopEdge();
    const rightPts = buildRightEdge();
    const bottomPts = buildBottomEdge();
    const leftPts = buildLeftEdge();

    const outlinePts = [];

    for (const p of topPts) outlinePts.push(p);

    if (corners.tr > 0) outlinePts.push({x: w, y: corners.tr});

    for (let i = 1; i < rightPts.length; i++) outlinePts.push(rightPts[i]);

    if (corners.br > 0) outlinePts.push({x: w - corners.br, y: h});

    for (let i = 1; i < bottomPts.length; i++) outlinePts.push(bottomPts[i]);

    if (corners.bl > 0) outlinePts.push({x: 0, y: h - corners.bl});

    for (let i = 1; i < leftPts.length; i++) outlinePts.push(leftPts[i]);

    let outlineD = "";
    for (let i = 0; i < outlinePts.length; i++) {
        const p = outlinePts[i];
        outlineD += (i === 0)
            ? `M ${fmt(p.x)} ${fmt(p.y)} `
            : `L ${fmt(p.x)} ${fmt(p.y)} `;
    }
    outlineD += "Z";

    /* -----------------------------
       4) Triangles with spacing gap
    -------------------------------- */
    const triangles = [];

    function triangleGap() {
        return rInt(rng, triangleGapMin, triangleGapMax);
    }

    function maybeCornerTriangle(cornerKey) {
        const chamfer = corners[cornerKey];
        const pTri = 0.55;

        const gap = triangleGap();

        if (chamfer === 0) {
            // square => inner only
            if (rng() < pTri) {
                const size = rInt(rng, 10, 22);
                const d = buildInnerCornerTriangle(cornerKey, size);

                let tx = 0, ty = 0;

                // move INSIDE with gap
                if (cornerKey === "tl") {
                    tx = gap;
                    ty = gap;
                }
                if (cornerKey === "tr") {
                    tx = w - gap;
                    ty = gap;
                }
                if (cornerKey === "br") {
                    tx = w - gap;
                    ty = h - gap;
                }
                if (cornerKey === "bl") {
                    tx = gap;
                    ty = h - gap;
                }

                triangles.push({
                    type: "inner",
                    corner: cornerKey,
                    withFill: rng() < 0.8,
                    d,
                    transform: `translate(${fmt(tx)} ${fmt(ty)})`,
                });
            }
        } else {
            // chamfer => outer only
            if (rng() < pTri * 0.8) {
                const d = buildOuterCornerTriangle(cornerKey, chamfer, gap + strokeOuterW);

                let tx = 0, ty = 0;

                // move OUTSIDE with gap (opposite directions)
                if (cornerKey === "tl") {
                    tx = chamfer;
                    ty = chamfer
                }

                if (cornerKey === "tr") {
                    tx = w - chamfer;
                    ty = chamfer;
                }
                if (cornerKey === "br") {
                    tx = w - chamfer;
                    ty = h - chamfer;
                }
                if (cornerKey === "bl") {
                    tx = chamfer;
                    ty = h - chamfer;
                }


                triangles.push({
                    type: "outer",
                    corner: cornerKey,
                    withFill: rng() < 0.5,
                    d,
                    transform: `translate(${fmt(tx)} ${fmt(ty)})`,
                });
            }
        }
    }

    maybeCornerTriangle("tl");
    maybeCornerTriangle("tr");
    maybeCornerTriangle("br");
    maybeCornerTriangle("bl");

    /* -----------------------------
       5) Feature nested fills -> global transforms
    -------------------------------- */
    const trapezoidFills = [];

    for (const f of features) {
        if (!f.fillD) continue;

        let transform = "";
        if (f.edge === "bottom") transform = `translate(0 ${fmt(h)})`;
        if (f.edge === "right") transform = `translate(${fmt(w)} 0)`;

        trapezoidFills.push({
            edge: f.edge,
            mode: f.mode,
            d: f.fillD,
            transform,
        });
    }

    /* -----------------------------
       6) SVG viewBox + defs
    -------------------------------- */
    const vbX = -pad;
    const vbY = -pad;
    const vbW = w + pad * 2;
    const vbH = h + pad * 2;

    const dotsId = `dots_${seed}`;
    const glowId = `glow_${seed}`;

    const defs = `
    <defs>
      <pattern id="${dotsId}" width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="2.2" cy="2.2" r="1" fill="${texDotFill}" />
      </pattern>
      ${
        glow
            ? `<filter id="${glowId}" x="-30%" y="-30%" width="160%" height="160%">
               <feDropShadow dx="0" dy="0" stdDeviation="3.6"
                 flood-color="rgba(18,168,255,0.55)" flood-opacity="0.70" />
             </filter>`
            : ``
    }
    </defs>
  `;

    const panel = `
        <path d="${outlineD}" fill="${panelFill}" stroke="none" />
        <path d="${outlineD}" fill="url(#${dotsId})" opacity="0.65" />
      `;

    const nestedTrapFills = trapezoidFills
        .map(t => `
      <path d="${t.d}"
            ${t.transform ? `transform="${t.transform}"` : ""}
            fill="${accentFill}"
            stroke="${accentStroke}"
            stroke-width="${accentStrokeW}"
            vector-effect="non-scaling-stroke"
            opacity="0.95" />
    `)
        .join("");

    const strokes = `
    <path d="${outlineD}"
          fill="none"
          stroke="${strokeOuter}"
          stroke-width="${strokeOuterW}"
          vector-effect="non-scaling-stroke"
          ${glow ? `filter="url(#${glowId})"` : ""} />

    <path d="${outlineD}"
          fill="none"
          stroke="${strokeInner}"
          stroke-width="${strokeInnerW}"
          vector-effect="non-scaling-stroke"
          opacity="0.95" />
  `;

    const triPaths = triangles
        .map(t =>
            `<path d="${t.d}"
                transform="${t.transform}"
                fill="${t.withFill ? 'rgba(18,168,255,1)' : 'transparent'}"
                stroke="rgba(18,168,255,0.55)"
                stroke-width="${strokeOuterW}"
                vector-effect="non-scaling-stroke"
                opacity="1" />`
        )
        .join("");

    const svgMarkup = `
<svg
    id="generatedFrame" 
    xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0"
     width="${fmt(w)}" height="${fmt(h)}"
     fill="none">
  ${defs}
  <g>
    ${panel}
    ${nestedTrapFills}
    ${strokes}
    ${triPaths}
  </g>
</svg>`.trim();

    return {
        svgMarkup,
        outlineD,
        meta: {
            seed,
            w,
            h,
            pad,
            corners,
            features: features.map(f => ({
                edge: f.edge,
                mode: f.mode,
                start: Number(f.start.toFixed(2)),
                end: Number(f.end.toFixed(2)),
                depth: f.depth,
                nestedFill: f.nestedFill,
                nestedInset: Number(f.nestedInset.toFixed(2)),
            })),
            triangles: triangles.map(t => ({
                type: t.type,
                corner: t.corner,
            })),
        }
    };
}
