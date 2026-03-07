
const bgCanvas = document.getElementById('bgCanvas');
const gc = document.getElementById('gameCanvas');
const fx = document.getElementById('fxCanvas');
const bgCtx = bgCanvas.getContext('2d');
const ctx = gc.getContext('2d');
const fxCtx = fx.getContext('2d');

let W, H, groundY;

function resize() {
    W = bgCanvas.width = gc.width = fx.width = window.innerWidth;
    H = bgCanvas.height = gc.height = fx.height = window.innerHeight;
    groundY = H * 0.55;
    drawBackground();
}
window.addEventListener('resize', resize);

// ===== GAME STATE =====
let gameRunning = false;
let score = 0, strikes = 0, timer = 60;
let timerInterval = null;
let mouse = { x: W / 2 || 400, y: H / 2 || 300 };
let cloud = { x: 400, y: 200, r: 70 };
let humans = [];
let particles = [];
let lightningBolts = [];
let rainDrops = [];
let tornadoes = [];
let stormZones = [];
let killNotifTimeout = null;

// Cooldowns (ms)
const COOLDOWNS = { lightning: 400, thunder: 2000, rain: 3500, tornado: 5000 };
let lastUsed = { lightning: 0, thunder: 0, rain: 0, tornado: 0 };

// ===== BACKGROUND =====
function drawBackground() {
    // Sky gradient
    const skyGrad = bgCtx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#040816');
    skyGrad.addColorStop(0.4, '#0b1a42');
    skyGrad.addColorStop(1, '#162d60');
    bgCtx.fillStyle = skyGrad;
    bgCtx.fillRect(0, 0, W, groundY);

    // Stars
    for (let i = 0; i < 120; i++) {
        const sx = Math.random() * W;
        const sy = Math.random() * groundY * 0.7;
        const sr = Math.random() * 1.2;
        bgCtx.beginPath();
        bgCtx.arc(sx, sy, sr, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
        bgCtx.fill();
    }

    // Ground
    const gGrad = bgCtx.createLinearGradient(0, groundY, 0, H);
    gGrad.addColorStop(0, '#1a2e0d');
    gGrad.addColorStop(0.3, '#162808');
    gGrad.addColorStop(1, '#0d1a05');
    bgCtx.fillStyle = gGrad;
    bgCtx.fillRect(0, groundY, W, H - groundY);

    // Ground texture lines
    for (let i = 0; i < 30; i++) {
        const gx = Math.random() * W;
        const gy = groundY + Math.random() * (H - groundY);
        bgCtx.beginPath();
        bgCtx.moveTo(gx, gy);
        bgCtx.lineTo(gx + 40 + Math.random() * 80, gy);
        bgCtx.strokeStyle = `rgba(40,70,20,${0.15 + Math.random() * 0.2})`;
        bgCtx.lineWidth = 1 + Math.random() * 2;
        bgCtx.stroke();
    }

    // Trees
    drawTrees();
}

function drawTrees() {
    for (let i = 0; i < 22; i++) {
        const tx = (W / 21) * i + Math.random() * 30 - 15;
        const th = 20 + Math.random() * 30;
        const tw = 14 + Math.random() * 20;
        bgCtx.beginPath();
        bgCtx.moveTo(tx, groundY - th);
        bgCtx.lineTo(tx - tw / 2, groundY);
        bgCtx.lineTo(tx + tw / 2, groundY);
        bgCtx.closePath();
        bgCtx.fillStyle = `rgba(${15 + Math.random() * 15},${45 + Math.random() * 25},${10 + Math.random() * 10},${0.6 + Math.random() * 0.3})`;
        bgCtx.fill();
    }
}

// ===== HUMANS =====
function spawnHuman() {
    const side = Math.random() < 0.5 ? -1 : 1;
    humans.push({
        x: side === -1 ? -20 : W + 20,
        y: groundY + 15 + Math.random() * (H - groundY - 50),
        vx: (0.4 + Math.random() * 0.8) * -side,
        vy: 0,
        speed: 0.5 + Math.random() * 1.0,
        hp: 1,
        slowed: 0,
        fear: 0,
        fearTimer: 0,
        phase: Math.random() * Math.PI * 2,
        size: 8 + Math.random() * 5,
        color: `hsl(${15 + Math.random() * 30},${70 + Math.random() * 20}%,${55 + Math.random() * 20}%)`,
        dead: false,
        deathAnim: 0
    });
}

function updateHumans(dt) {
    humans.forEach(h => {
        if (h.dead) { h.deathAnim += dt * 3; return; }
        h.phase += dt * 2;

        // Fear from cloud proximity
        const dx = h.x - cloud.x;
        const dy = h.y - cloud.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            h.fear = Math.min(1, h.fear + dt * 0.5);
            h.fearTimer = 1.5;
        } else {
            h.fearTimer = Math.max(0, h.fearTimer - dt);
            if (h.fearTimer <= 0) h.fear = Math.max(0, h.fear - dt * 0.3);
        }

        const speedMult = h.slowed > 0 ? 0.25 : 1;
        h.slowed = Math.max(0, h.slowed - dt);

        if (h.fear > 0.3) {
            // Run from cloud
            const ang = Math.atan2(dy, dx);
            h.vx += Math.cos(ang) * h.speed * 0.15 * h.fear;
            h.vy += Math.sin(ang) * h.speed * 0.08 * h.fear;
        } else {
            // Random walk
            h.vx += (Math.random() - 0.5) * 0.1;
            h.vy += (Math.random() - 0.5) * 0.04;
        }

        const maxSpd = h.speed * speedMult;
        const spd = Math.sqrt(h.vx * h.vx + h.vy * h.vy);
        if (spd > maxSpd) { h.vx = (h.vx / spd) * maxSpd; h.vy = (h.vy / spd) * maxSpd; }

        h.x += h.vx;
        h.y += h.vy;

        // Keep on ground plane
        h.y = Math.max(groundY + 10, Math.min(H - 20, h.y));

        // Bounce at edges
        if (h.x < -30) h.x = W + 20;
        if (h.x > W + 30) h.x = -20;
    });

    // Remove finished death anims
    humans = humans.filter(h => !h.dead || h.deathAnim < 1.5);
}

function drawHumans() {
    humans.forEach(h => {
        if (h.dead) {
            const a = 1 - h.deathAnim / 1.5;
            ctx.save();
            ctx.globalAlpha = a;
            ctx.translate(h.x, h.y);
            ctx.rotate(h.deathAnim * 3);
            ctx.scale(1 + h.deathAnim, 1 + h.deathAnim);
            drawHumanShape(h, 0);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(h.x, h.y);
        if (h.slowed > 0) {
            ctx.shadowColor = '#89c4e1';
            ctx.shadowBlur = 10;
        }
        if (h.fear > 0.5) {
            ctx.shadowColor = '#ff8060';
            ctx.shadowBlur = 8;
        }
        drawHumanShape(h, h.phase);
        ctx.restore();
    });
}

function drawHumanShape(h, phase) {
    const s = h.size;
    const legSwing = Math.sin(phase) * 5 * (h.slowed > 0 ? 0.3 : 1);

    ctx.fillStyle = h.color;

    // Head
    ctx.beginPath();
    ctx.arc(0, -s * 1.7, s * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillRect(-s * 0.35, -s * 1.1, s * 0.7, s * 1.1);

    // Legs
    ctx.save();
    ctx.rotate(legSwing * 0.08);
    ctx.fillRect(-s * 0.3, 0, s * 0.28, s * 0.9);
    ctx.restore();
    ctx.save();
    ctx.rotate(-legSwing * 0.08);
    ctx.fillRect(s * 0.02, 0, s * 0.28, s * 0.9);
    ctx.restore();

    // Arms
    ctx.save();
    ctx.rotate(-legSwing * 0.1);
    ctx.fillRect(-s * 0.85, -s * 0.9, s * 0.5, s * 0.22);
    ctx.restore();
    ctx.save();
    ctx.rotate(legSwing * 0.1);
    ctx.fillRect(s * 0.35, -s * 0.9, s * 0.5, s * 0.22);
    ctx.restore();
}

// ===== CLOUD =====
let cloudPuffs = [];
function initCloud() {
    cloudPuffs = [
        { ox: 0, oy: 0, r: 52 },
        { ox: -55, oy: 18, r: 38 },
        { ox: 55, oy: 18, r: 40 },
        { ox: -30, oy: -20, r: 42 },
        { ox: 32, oy: -16, r: 38 },
        { ox: -80, oy: 28, r: 28 },
        { ox: 80, oy: 28, r: 28 },
    ];
}

function drawCloud(x, y, t) {
    cloudPuffs.forEach((p, i) => {
        const wobble = Math.sin(t * 0.8 + i) * 2;
        const grad = ctx.createRadialGradient(
            x + p.ox, y + p.oy - p.r * 0.3,
            p.r * 0.1,
            x + p.ox, y + p.oy + wobble,
            p.r
        );
        grad.addColorStop(0, 'rgba(230,245,255,0.98)');
        grad.addColorStop(0.5, 'rgba(180,210,255,0.9)');
        grad.addColorStop(1, 'rgba(100,140,220,0.5)');
        ctx.beginPath();
        ctx.arc(x + p.ox, y + p.oy + wobble, p.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    });

    // Glow underneath
    const glowGrad = ctx.createRadialGradient(x, y + 40, 0, x, y + 40, 100);
    glowGrad.addColorStop(0, 'rgba(80,120,255,0.15)');
    glowGrad.addColorStop(1, 'rgba(80,120,255,0)');
    ctx.beginPath();
    ctx.arc(x, y + 40, 100, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();
}

// ===== LIGHTNING =====
function spawnLightning(tx, ty, chainTargets) {
    const bolt = {
        sx: cloud.x + (Math.random() - 0.5) * 40,
        sy: cloud.y + 30,
        tx, ty,
        age: 0,
        life: 0.35,
        segments: generateBoltSegments(cloud.x, cloud.y + 30, tx, ty),
        chain: chainTargets || []
    };
    lightningBolts.push(bolt);

    // Flash
    flashScreen(0.7);

    // Thunder rumble (visual)
    doThunderShake();

    // Check hit
    checkLightningHit(tx, ty, 40);
    bolt.chain.forEach(ct => {
        setTimeout(() => {
            const chainBolt = {
                sx: tx, sy: ty,
                tx: ct.x, ty: ct.y,
                age: 0, life: 0.3,
                segments: generateBoltSegments(tx, ty, ct.x, ct.y),
                chain: []
            };
            lightningBolts.push(chainBolt);
            checkLightningHit(ct.x, ct.y, 40);
            spawnStrikeParticles(ct.x, ct.y);
        }, 80 + Math.random() * 80);
    });

    spawnStrikeParticles(tx, ty);
}

function generateBoltSegments(sx, sy, ex, ey) {
    const segs = [];
    const steps = 10 + Math.floor(Math.random() * 8);
    let cx = sx, cy = sy;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const bx = sx + (ex - sx) * t;
        const by = sy + (ey - sy) * t;
        const jitter = (1 - t) * 30;
        segs.push({ x: bx + (Math.random() - 0.5) * jitter, y: by + (Math.random() - 0.5) * jitter });
    }
    segs[segs.length - 1] = { x: ex, y: ey };
    return segs;
}

function checkLightningHit(tx, ty, radius) {
    humans.forEach(h => {
        if (h.dead) return;
        const dx = h.x - tx, dy = h.y - ty;
        if (Math.sqrt(dx * dx + dy * dy) < radius + h.size) {
            killHuman(h);
        }
    });
}

function updateLightning(dt) {
    lightningBolts = lightningBolts.filter(b => {
        b.age += dt;
        return b.age < b.life;
    });
}

function drawLightning() {
    lightningBolts.forEach(b => {
        const a = 1 - (b.age / b.life);
        const segs = b.segments;

        // Outer glow
        fxCtx.save();
        fxCtx.shadowBlur = 20;
        fxCtx.shadowColor = `rgba(180,220,255,${a * 0.8})`;
        fxCtx.strokeStyle = `rgba(160,200,255,${a * 0.4})`;
        fxCtx.lineWidth = 6;
        fxCtx.lineCap = 'round';
        fxCtx.beginPath();
        segs.forEach((s, i) => i === 0 ? fxCtx.moveTo(s.x, s.y) : fxCtx.lineTo(s.x, s.y));
        fxCtx.stroke();

        // Core bolt
        fxCtx.shadowBlur = 10;
        fxCtx.shadowColor = `rgba(255,255,220,${a})`;
        fxCtx.strokeStyle = `rgba(255,255,230,${a})`;
        fxCtx.lineWidth = 2;
        fxCtx.beginPath();
        segs.forEach((s, i) => i === 0 ? fxCtx.moveTo(s.x, s.y) : fxCtx.lineTo(s.x, s.y));
        fxCtx.stroke();
        fxCtx.restore();
    });
}

// ===== RAIN =====
function spawnStorm(x, y) {
    stormZones.push({ x, y, r: 120, age: 0, life: 4.0 });
    for (let i = 0; i < 80; i++) {
        spawnRainDrop(x + (Math.random() - 0.5) * 240, y - Math.random() * 100);
    }
}

function spawnRainDrop(x, y) {
    rainDrops.push({
        x, y,
        vx: -1 + Math.random() * 2,
        vy: 8 + Math.random() * 6,
        len: 8 + Math.random() * 12,
        life: 0.6 + Math.random() * 0.6,
        age: 0
    });
}

function updateRain(dt) {
    stormZones = stormZones.filter(s => {
        s.age += dt;
        // Drip more rain
        if (Math.random() < 0.6) spawnRainDrop(s.x + (Math.random() - 0.5) * s.r * 2, s.y);

        // Slow humans in zone
        humans.forEach(h => {
            if (h.dead) return;
            const dx = h.x - s.x, dy = h.y - s.y;
            if (Math.sqrt(dx * dx + dy * dy) < s.r * 1.5) {
                h.slowed = Math.max(h.slowed, 1.5);
            }
        });
        return s.age < s.life;
    });

    rainDrops = rainDrops.filter(r => {
        r.age += dt;
        r.x += r.vx;
        r.y += r.vy;
        return r.age < r.life && r.y < H;
    });
}

function drawRain() {
    stormZones.forEach(s => {
        const a = (1 - s.age / s.life) * 0.4;
        const grad = fxCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 1.5);
        grad.addColorStop(0, `rgba(80,140,220,${a})`);
        grad.addColorStop(1, `rgba(80,140,220,0)`);
        fxCtx.beginPath();
        fxCtx.arc(s.x, s.y, s.r * 1.5, 0, Math.PI * 2);
        fxCtx.fillStyle = grad;
        fxCtx.fill();
    });

    rainDrops.forEach(r => {
        const a = (1 - r.age / r.life) * 0.7;
        fxCtx.beginPath();
        fxCtx.moveTo(r.x, r.y);
        fxCtx.lineTo(r.x + r.vx * 0.5, r.y + r.len);
        fxCtx.strokeStyle = `rgba(137,196,225,${a})`;
        fxCtx.lineWidth = 1.5;
        fxCtx.stroke();
    });
}

// ===== TORNADO =====
function spawnTornado(x, y) {
    tornadoes.push({ x, y, age: 0, life: 3.5, r: 30, spin: 0 });
}

function updateTornadoes(dt) {
    tornadoes = tornadoes.filter(t => {
        t.age += dt;
        t.spin += dt * 8;
        t.r = 30 + Math.sin(t.age * 2) * 10;

        // Pull humans
        humans.forEach(h => {
            if (h.dead) return;
            const dx = h.x - t.x, dy = h.y - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const pullR = 150;
            if (dist < pullR && dist > 1) {
                const force = (1 - dist / pullR) * 3;
                h.x -= (dx / dist) * force;
                h.y -= (dy / dist) * force * 0.3;
                h.x += dy / dist * force * 0.5;
                if (dist < t.r + h.size) {
                    killHuman(h);
                }
            }
        });

        return t.age < t.life;
    });
}

function drawTornadoes() {
    tornadoes.forEach(t => {
        const a = Math.min(1, t.age * 3) * (1 - Math.max(0, t.age - t.life + 0.5) * 2);
        const layers = 18;
        for (let i = 0; i < layers; i++) {
            const pct = i / layers;
            const w = t.r * (0.2 + pct * 0.8) + (1 - pct) * 20;
            const yOff = pct * 120;
            const rot = t.spin * (1 - pct * 0.5) + pct * Math.PI;

            fxCtx.save();
            fxCtx.translate(t.x + Math.cos(rot) * w * 0.3, t.y + yOff);
            fxCtx.beginPath();
            fxCtx.ellipse(0, 0, w, w * 0.2, 0, 0, Math.PI * 2);
            fxCtx.strokeStyle = `rgba(180,160,220,${a * (0.4 - pct * 0.3)})`;
            fxCtx.lineWidth = 2;
            fxCtx.stroke();
            fxCtx.restore();
        }

        // Debris
        for (let i = 0; i < 8; i++) {
            const ang = t.spin * 2 + (i / 8) * Math.PI * 2;
            const r2 = t.r * (0.5 + Math.sin(t.age * 3 + i) * 0.3);
            fxCtx.beginPath();
            fxCtx.arc(t.x + Math.cos(ang) * r2, t.y + 20 + Math.sin(ang) * r2 * 0.3, 3, 0, Math.PI * 2);
            fxCtx.fillStyle = `rgba(200,180,140,${a * 0.7})`;
            fxCtx.fill();
        }
    });
}

// ===== PARTICLES =====
function spawnStrikeParticles(x, y) {
    for (let i = 0; i < 25; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 6;
        particles.push({
            x, y,
            vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 3,
            r: 2 + Math.random() * 4,
            life: 0.4 + Math.random() * 0.4,
            age: 0,
            col: Math.random() < 0.6 ? '#fffde0' : '#f5c842'
        });
    }
}

function updateParticles(dt) {
    particles = particles.filter(p => {
        p.age += dt;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.r *= 0.95;
        return p.age < p.life;
    });
}

function drawParticles() {
    particles.forEach(p => {
        const a = 1 - p.age / p.life;
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        fxCtx.fillStyle = p.col.replace(')', `,${a})`).replace('rgb', 'rgba').replace('#', '');

        // Simpler approach
        fxCtx.globalAlpha = a;
        fxCtx.fillStyle = p.col;
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        fxCtx.fill();
        fxCtx.globalAlpha = 1;
    });
}

// ===== CURSOR =====
function drawCursor(x, y, t) {
    fxCtx.save();
    fxCtx.translate(x, y);

    // Rotating target rings
    fxCtx.rotate(t * 1.2);
    fxCtx.strokeStyle = 'rgba(255,200,50,0.8)';
    fxCtx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        fxCtx.beginPath();
        fxCtx.moveTo(Math.cos(ang) * 10, Math.sin(ang) * 10);
        fxCtx.lineTo(Math.cos(ang) * 18, Math.sin(ang) * 18);
        fxCtx.stroke();
    }

    fxCtx.rotate(-t * 1.2);
    fxCtx.strokeStyle = 'rgba(255,220,100,0.5)';
    fxCtx.lineWidth = 1;
    fxCtx.beginPath();
    fxCtx.arc(0, 0, 20, 0, Math.PI * 2);
    fxCtx.stroke();

    // Center dot
    fxCtx.fillStyle = 'rgba(255,220,80,0.9)';
    fxCtx.beginPath();
    fxCtx.arc(0, 0, 2.5, 0, Math.PI * 2);
    fxCtx.fill();

    fxCtx.restore();
}

// ===== KILL =====
function killHuman(h) {
    if (h.dead) return;
    h.dead = true;
    score += 100;
    strikes++;
    updateHUD();
    showKillNotif();
}

function showKillNotif() {
    const el = document.getElementById('killNotif');
    const msgs = ['⚡ SMITED!', '⚡ STRUCK!', '🌩 OBLITERATED!', '⚡ DIRECT HIT!', '💀 MORTALIZED!'];
    el.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    el.style.opacity = 1;
    clearTimeout(killNotifTimeout);
    killNotifTimeout = setTimeout(() => el.style.opacity = 0, 900);
}

// ===== EFFECTS =====
let flashAlpha = 0;
function flashScreen(a) {
    flashAlpha = a;
    document.getElementById('flash').style.opacity = a;
    setTimeout(() => {
        document.getElementById('flash').style.opacity = 0;
        flashAlpha = 0;
    }, 60);
}

let shakeX = 0, shakeY = 0;
function doThunderShake() {
    shakeX = (Math.random() - 0.5) * 12;
    shakeY = (Math.random() - 0.5) * 6;
    setTimeout(() => { shakeX = 0; shakeY = 0; }, 80);
}

// ===== HUD UPDATE =====
function updateHUD() {
    document.getElementById('scoreVal').textContent = score;
    document.getElementById('strikesVal').textContent = strikes;
    const tv = document.getElementById('timerVal');
    tv.textContent = timer;
    tv.classList.toggle('urgent', timer <= 10);
}

function updateCooldownUI() {
    const now = Date.now();
    const icons = ['lightning', 'thunder', 'rain', 'tornado'];
    const uiIds = { lightning: 'pLightning', thunder: 'pThunder', rain: 'pRain', tornado: 'pTornado' };
    const cdIds = { lightning: 'cdLightning', thunder: 'cdThunder', rain: 'cdRain', tornado: 'cdTornado' };

    icons.forEach(k => {
        const elapsed = now - lastUsed[k];
        const cd = COOLDOWNS[k];
        const icon = document.getElementById(uiIds[k]);
        const cdEl = document.getElementById(cdIds[k]);
        if (elapsed < cd) {
            const pct = 100 * (1 - elapsed / cd);
            cdEl.style.height = pct + '%';
            icon.className = 'powerIcon cooling';
        } else {
            cdEl.style.height = '0%';
            icon.className = 'powerIcon ready';
        }
    });
}

// ===== AMBIENT BACKGROUND FLICKER =====
let ambientBolt = 0;
function maybeAmbientLightning(dt) {
    ambientBolt -= dt;
    if (ambientBolt <= 0) {
        ambientBolt = 3 + Math.random() * 5;
        const abx = Math.random() * W;
        const aby = Math.random() * groundY * 0.8;
        // Brief sky flash
        fxCtx.save();
        fxCtx.globalAlpha = 0.04 + Math.random() * 0.08;
        fxCtx.fillStyle = '#d0e0ff';
        fxCtx.fillRect(0, 0, W, groundY);
        fxCtx.restore();
    }
}

// ===== MAIN LOOP =====
let last = 0;
let elapsed = 0;
function loop(ts) {
    if (!gameRunning) return;
    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    elapsed += dt;

    // Move cloud toward mouse smoothly
    cloud.x += (mouse.x - cloud.x) * 0.06;
    cloud.y += (mouse.y - cloud.y) * 0.06;
    cloud.y = Math.min(groundY - 60, Math.max(30, cloud.y));

    // Clear
    ctx.save();
    ctx.translate(shakeX, shakeY);
    ctx.clearRect(-10, -10, W + 20, H + 20);

    fxCtx.clearRect(0, 0, W, H);

    // Spawn humans
    if (Math.random() < dt * 0.7 && humans.filter(h => !h.dead).length < 12) spawnHuman();

    // Update
    updateHumans(dt);
    updateLightning(dt);
    updateRain(dt);
    updateTornadoes(dt);
    updateParticles(dt);

    // Draw order: ground elements, humans, cloud, FX
    drawHumans();
    drawCloud(cloud.x, cloud.y, elapsed);

    ctx.restore();

    // FX layer
    drawRain();
    drawLightning();
    drawTornadoes();
    drawParticles();
    maybeAmbientLightning(dt);

    // Cursor
    drawCursor(mouse.x, mouse.y, elapsed);

    // Cooldown UI
    updateCooldownUI();

    requestAnimationFrame(loop);
}

// ===== CONTROLS =====
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('click', e => {
    if (!gameRunning) return;
    useLightning(e.clientX, e.clientY);
});

window.addEventListener('keydown', e => {
    if (!gameRunning) return;
    const k = e.key.toLowerCase();
    if (k === 'q') useLightning(mouse.x, mouse.y);
    if (k === 'e') useChainLightning(mouse.x, mouse.y);
    if (k === 'r') useRain(mouse.x, mouse.y);
    if (k === 'f') useTornado(mouse.x, mouse.y);
});

function canUse(k) {
    return Date.now() - lastUsed[k] >= COOLDOWNS[k];
}

function useLightning(x, y) {
    if (!canUse('lightning')) return;
    lastUsed.lightning = Date.now();
    document.getElementById('pLightning').className = 'powerIcon active';
    setTimeout(() => document.getElementById('pLightning').className = 'powerIcon cooling', 150);
    spawnLightning(x, y);
}

function useChainLightning(x, y) {
    if (!canUse('thunder')) return;
    lastUsed.thunder = Date.now();

    // Find nearby humans to chain to
    const alive = humans.filter(h => !h.dead);
    alive.sort((a, b) => {
        const da = Math.hypot(a.x - x, a.y - y);
        const db = Math.hypot(b.x - x, b.y - y);
        return da - db;
    });
    const chain = alive.slice(1, 3);
    spawnLightning(x, y, chain);
}

function useRain(x, y) {
    if (!canUse('rain')) return;
    lastUsed.rain = Date.now();
    spawnStorm(x, y);
}

function useTornado(x, y) {
    if (!canUse('tornado')) return;
    lastUsed.tornado = Date.now();
    spawnTornado(x, y);
    flashScreen(0.3);
}

// ===== GAME START / END =====
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';
    gameRunning = true;
    score = 0; strikes = 0; timer = 60;
    humans = []; particles = []; lightningBolts = [];
    rainDrops = []; tornadoes = []; stormZones = [];
    lastUsed = { lightning: 0, thunder: 0, rain: 0, tornado: 0 };
    updateHUD();
    initCloud();

    // Spawn initial humans
    for (let i = 0; i < 6; i++) spawnHuman();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        updateHUD();
        if (timer <= 0) endGame();
    }, 1000);

    last = performance.now();
    requestAnimationFrame(loop);
}

function endGame() {
    clearInterval(timerInterval);
    gameRunning = false;

    document.getElementById('scoreDisplay').textContent = score;

    let rank = 'Apprentice Storm';
    if (score >= 2000) rank = '☁ CLOUD KING ☁';
    else if (score >= 1200) rank = 'Thunder Lord';
    else if (score >= 700) rank = 'Storm Bringer';
    else if (score >= 350) rank = 'Rain Caller';
    document.getElementById('rankLabel').textContent = rank;

    setTimeout(() => {
        document.getElementById('endScreen').style.display = 'flex';
    }, 500);
}

// ===== INIT =====
resize();
