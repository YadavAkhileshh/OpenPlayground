/**
 * ray-engine.js
 * Core ray casting, wall intersection and reflection logic.
 * Casts N rays from a source point, bounces them off walls,
 * and records hits (time, amplitude) at a listener position.
 */

'use strict';

/* ── Constants ──────────────────────────────────────────────── */
const RE_EPSILON   = 1e-9;   // Numerical guard for parallel lines
const RE_LISTENER_R = 18;   // Listener capture radius in pixels

/* ── Vector utilities ────────────────────────────────────────── */
const Vec = {
  /** @returns {{x,y}} */
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  scale: (v, s) => ({ x: v.x * s, y: v.y * s }),
  dot:   (a, b) => a.x * b.x + a.y * b.y,
  len:   (v)    => Math.sqrt(v.x * v.x + v.y * v.y),
  norm:  (v)    => {
    const l = Vec.len(v);
    return l < RE_EPSILON ? { x: 0, y: 0 } : { x: v.x / l, y: v.y / l };
  },
  /** Reflect direction d around surface normal n */
  reflect: (d, n) => {
    const dot2 = 2 * Vec.dot(d, n);
    return { x: d.x - dot2 * n.x, y: d.y - dot2 * n.y };
  },
};

/**
 * Segment–segment intersection test.
 * Returns t along ray [0,1] and u along wall [0,1], or null.
 * Ray: P + t * D   (t > 0)
 * Wall: A + u * (B - A)
 * @param {{x,y}} P  ray origin
 * @param {{x,y}} D  ray direction (normalised)
 * @param {{x,y}} A  wall start
 * @param {{x,y}} B  wall end
 * @param {number} maxLen  maximum ray length
 * @returns {{t:number, u:number, px:number, py:number, nx:number, ny:number}|null}
 */
function raySegmentIntersect(P, D, A, B, maxLen) {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const denom = D.x * dy - D.y * dx;

  if (Math.abs(denom) < RE_EPSILON) return null; // parallel

  const APx = A.x - P.x;
  const APy = A.y - P.y;

  const t = (APx * dy - APy * dx) / denom;
  const u = (APx * D.y - APy * D.x) / denom;

  if (t < RE_EPSILON || t > maxLen) return null;
  if (u < -RE_EPSILON || u > 1 + RE_EPSILON) return null;

  // Wall normal (perpendicular to wall segment, consistent pointing)
  let nx = -dy;
  let ny =  dx;
  const nLen = Math.sqrt(nx * nx + ny * ny);
  if (nLen < RE_EPSILON) return null;
  nx /= nLen;
  ny /= nLen;

  // Always flip normal to face incoming ray
  if (D.x * nx + D.y * ny > 0) { nx = -nx; ny = -ny; }

  return { t, u, px: P.x + D.x * t, py: P.y + D.y * t, nx, ny };
}

/**
 * Find the nearest wall intersection for a ray.
 * @param {{x,y}} origin
 * @param {{x,y}} dir  normalised direction
 * @param {Array}  walls  [{x1,y1,x2,y2}, ...]
 * @param {number} maxLen
 * @returns {object|null} nearest intersection with wallIndex
 */
function nearestIntersection(origin, dir, walls, maxLen) {
  let best = null;
  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    const hit = raySegmentIntersect(origin, dir, { x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }, maxLen);
    if (hit && (!best || hit.t < best.t)) {
      best = { ...hit, wallIndex: i };
    }
  }
  return best;
}

/**
 * Check if a ray segment passes near the listener.
 * Uses point-to-segment distance test within listener radius.
 * Returns parameter t along segment [0, segLen] where closest approach occurs,
 * or -1 if no intersection.
 * @param {{x,y}} P     segment start
 * @param {{x,y}} D     normalised direction
 * @param {number} segLen  total segment length
 * @param {{x,y}} L     listener position
 * @param {number} radius
 * @returns {number}  t or -1
 */
function segmentPassesListener(P, D, segLen, L, radius) {
  const toLx = L.x - P.x;
  const toLy = L.y - P.y;
  const tProj = Vec.dot({ x: toLx, y: toLy }, D);
  const tClamped = Math.max(0, Math.min(segLen, tProj));
  const closestX = P.x + D.x * tClamped;
  const closestY = P.y + D.y * tClamped;
  const dist = Math.sqrt((closestX - L.x) ** 2 + (closestY - L.y) ** 2);
  return dist <= radius ? tClamped : -1;
}

/**
 * Cast a single ray from origin in direction angle θ.
 * Accumulates path segments and listener hits.
 *
 * @param {{x,y}} origin
 * @param {number} angleRad
 * @param {Array}  walls
 * @param {{x,y}} listener
 * @param {object} opts  { maxBounces, absorption, maxRayLen, speedPx }
 * @returns {{ segments: Array, hits: Array }}
 */
function castSingleRay(origin, angleRad, walls, listener, opts) {
  const { maxBounces, absorption, maxRayLen, speedPx } = opts;
  const segments = [];
  const hits     = [];

  let pos = { ...origin };
  let dir = { x: Math.cos(angleRad), y: Math.sin(angleRad) };
  let amplitude  = 1.0;
  let totalDist  = 0.0;

  for (let bounce = 0; bounce <= maxBounces; bounce++) {
    // Find nearest wall hit
    const hit = nearestIntersection(pos, dir, walls, maxRayLen);
    const segEnd   = hit ? hit.t : maxRayLen;
    const segEndPt = hit
      ? { x: hit.px, y: hit.py }
      : { x: pos.x + dir.x * maxRayLen, y: pos.y + dir.y * maxRayLen };

    // Check listener capture on this segment
    const tL = segmentPassesListener(pos, dir, segEnd, listener, RE_LISTENER_R);
    if (tL >= 0) {
      const distToListener = totalDist + tL;
      const timeSeconds    = distToListener / speedPx;
      // Distance attenuation: inverse square approximation
      const distAtten = Math.max(0.01, distToListener);
      const intens    = amplitude / (1 + distAtten * 0.001);
      if (isFinite(intens) && intens > 1e-6) {
        hits.push({ time: timeSeconds, amplitude: intens });
      }
    }

    segments.push({ x1: pos.x, y1: pos.y, x2: segEndPt.x, y2: segEndPt.y, bounce, amplitude });

    if (!hit) break;

    totalDist += hit.t;

    // Absorption attenuation per bounce
    amplitude *= (1.0 - absorption);
    if (amplitude < 1e-6) break;

    // Reflect direction
    const normal = { x: hit.nx, y: hit.ny };
    dir = Vec.normalize(Vec.reflect(dir, normal));

    // Nudge origin off wall to avoid self-intersection
    pos = {
      x: hit.px + hit.nx * 0.5,
      y: hit.py + hit.ny * 0.5,
    };
  }

  return { segments, hits };
}

// Normalize helper exposed on Vec for consistency
Vec.normalize = Vec.norm;

/**
 * Cast N rays from the source point.
 * Distributes angles evenly across full circle.
 *
 * @param {{x,y}} source
 * @param {{x,y}} listener
 * @param {Array}  walls
 * @param {object} opts  { rayCount, maxBounces, absorption, pixelsPerMeter, speedOfSound }
 * @returns {{ allSegments: Array, allHits: Array }}
 */
function castRays(source, listener, walls, opts = {}) {
  const {
    rayCount      = 1000,
    maxBounces    = 8,
    absorption    = 0.30,
    pixelsPerMeter = 100,
    speedOfSound   = 343,
  } = opts;

  // Speed in pixels/second
  const speedPx  = speedOfSound * pixelsPerMeter;
  // Max ray travel distance: 30 m in pixels
  const maxRayLen = 30 * pixelsPerMeter;

  const castOpts = { maxBounces, absorption, maxRayLen, speedPx };
  const allSegments = [];
  const allHits     = [];

  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Fibonacci spiral angles

  for (let i = 0; i < rayCount; i++) {
    // Use golden angle for uniform sphere-ish coverage in 2D
    const angle = i * goldenAngle;
    const { segments, hits } = castSingleRay(source, angle, walls, listener, castOpts);
    for (const s of segments) allSegments.push(s);
    for (const h of hits)     allHits.push(h);
  }

  return { allSegments, allHits };
}

/**
 * Compute RT60 (time for IR to decay 60 dB) from hits array.
 * Simple heuristic: find t where amplitude drops below 0.001x peak.
 * @param {Array} hits
 * @returns {number} seconds
 */
function computeRT60(hits) {
  if (!hits.length) return 0;
  const maxAmp = Math.max(...hits.map(h => h.amplitude));
  const threshold = maxAmp * 0.001;
  let rt60 = 0;
  for (const h of hits) {
    if (h.amplitude >= threshold && h.time > rt60) rt60 = h.time;
  }
  return rt60;
}
