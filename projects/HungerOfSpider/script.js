
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const lvlEl = document.getElementById('lvlD');
const scoreEl = document.getElementById('scoreD');
const ateEl = document.getElementById('ateD');
const W = canvas.width = Math.min(window.innerWidth - 24, 880);
const H = canvas.height = Math.min(window.innerHeight - 90, 600);
const RADII = [0, 14, 19, 25, 32, 40, 49, 60, 73, 88, 106];
const EXP_REQ = [0, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const MAX_LVL = 10, MAX_BOTS = 30;
const COLORS = [null, ['#cc88ff', '#7722aa'], ['#66ccff', '#1177bb'], ['#88ffcc', '#22aa66'], ['#ffee44', '#bb9900'], ['#ff9944', '#cc4400'], ['#ff5555', '#bb1111'], ['#ff44aa', '#990055'], ['#44ffee', '#008888'], ['#aaffaa', '#33aa33'], ['#ffffff', '#999999']];
const rnd = (a, b) => Math.random() * (b - a) + a;
const rndI = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

class Spider {
    constructor(x, y, lv, ip = false) {
        this.x = x; this.y = y; this.level = lv; this.isPlayer = ip;
        this.r = RADII[lv]; this.alive = true;
        this.exp = 0; this.expNeeded = EXP_REQ[Math.min(lv, EXP_REQ.length - 1)];
        this.legAngle = rnd(0, 6); this.tx = x; this.ty = y; this.aiTimer = 0;
    }
    get col() { return COLORS[Math.min(this.level, MAX_LVL)][0]; }
    get dark() { return COLORS[Math.min(this.level, MAX_LVL)][1]; }
    // SLOWER enemies: max speed 1.5, scales down with level
    get spd() { return this.isPlayer ? 0 : Math.max(0.4, 1.5 - this.level * 0.08); }
    gainExp() {
        this.exp++;
        if (this.level < MAX_LVL && this.exp >= this.expNeeded) {
            this.level++; this.r = RADII[this.level]; this.exp = 0;
            this.expNeeded = EXP_REQ[Math.min(this.level, EXP_REQ.length - 1)];
            return true;
        }
        return false;
    }
    updateAI(others) {
        this.aiTimer--; if (this.aiTimer > 0) return;
        // bots retarget less often = more sluggish
        this.aiTimer = rndI(40, 100);
        let mode = 'wander', best = null, bestD = Infinity, fleeSrc = null, fleeD = Infinity;
        for (const s of others) {
            if (s === this || !s.alive) continue;
            const dx = s.x - this.x, dy = s.y - this.y, d = Math.sqrt(dx * dx + dy * dy);
            // only flee if WAY bigger (2+ levels)
            if (s.level >= this.level + 2 && d < 180 && d < fleeD) { fleeSrc = s; fleeD = d; }
            if (s.level < this.level && d < 280 && d < bestD) { best = s; bestD = d; mode = 'hunt'; }
        }
        if (fleeSrc) {
            const dx = fleeSrc.x - this.x, dy = fleeSrc.y - this.y;
            this.tx = this.x - dx * 2; this.ty = this.y - dy * 2;
        } else if (mode === 'hunt' && best) {
            this.tx = best.x; this.ty = best.y;
        } else {
            this.tx = rnd(60, W - 60); this.ty = rnd(60, H - 60);
        }
        this.tx = clamp(this.tx, this.r + 5, W - this.r - 5);
        this.ty = clamp(this.ty, this.r + 5, H - this.r - 5);
    }
    moveBot() {
        const dx = this.tx - this.x, dy = this.ty - this.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d > 2) { this.x += dx / d * this.spd; this.y += dy / d * this.spd; }
        this.x = clamp(this.x, this.r + 2, W - this.r - 2);
        this.y = clamp(this.y, this.r + 2, H - this.r - 2);
        this.legAngle += 0.18;
    }
    draw() {
        const r = this.r, la = this.legAngle, col = this.col, dk = this.dark;
        ctx.save(); ctx.translate(this.x, this.y);
        if (this.isPlayer) { ctx.shadowBlur = 20; ctx.shadowColor = col; }
        ctx.strokeStyle = dk; ctx.lineWidth = Math.max(1.5, r * 0.09); ctx.lineCap = 'round';
        for (let i = 0; i < 8; i++) {
            const side = i < 4 ? -1 : 1, idx = i % 4;
            const a = side * (0.28 + idx * 0.22) * Math.PI + Math.sin(la + idx * 0.8) * 0.2;
            const ll = r * 1.3;
            const mx = Math.cos(a) * r * 0.7, my = Math.sin(a) * r * 0.5 + r * 0.1;
            const etx = Math.cos(a + side * 0.5) * ll, ety = Math.sin(a + side * 0.5) * ll * 0.85;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.4);
            ctx.quadraticCurveTo(mx, my, etx, ety); ctx.stroke();
        }
        const ag = ctx.createRadialGradient(-r * .2, -r * .2, 1, 0, 0, r * .72);
        ag.addColorStop(0, col); ag.addColorStop(1, dk); ctx.fillStyle = ag;
        ctx.beginPath(); ctx.ellipse(r * .15, r * .38, r * .65, r * .72, 0, 0, Math.PI * 2); ctx.fill();
        const cg = ctx.createRadialGradient(-r * .15, -r * .1, 1, 0, 0, r * .56);
        cg.addColorStop(0, col); cg.addColorStop(1, dk); ctx.fillStyle = cg;
        ctx.beginPath(); ctx.ellipse(-r * .04, 0, r * .55, r * .46, 0, 0, Math.PI * 2); ctx.fill();
        const er = Math.max(2, r * .1);
        for (const [ex, ey] of [[-r * .27, -r * .22], [-r * .1, -r * .3], [r * .1, -r * .3], [r * .27, -r * .22]]) {
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex + er * .2, ey + er * .2, er * .5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1, r * .07);
        ctx.beginPath(); ctx.moveTo(-r * .55, r * .1); ctx.lineTo(-r * .8, r * .32); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r * .42, r * .17); ctx.lineTo(-r * .64, r * .4); ctx.stroke();
        ctx.shadowBlur = 0;
        // danger indicator: red ring if 2+ levels above player
        if (!this.isPlayer && player && this.level >= player.level + 2) {
            ctx.strokeStyle = 'rgba(255,60,60,0.7)'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(0, 0, r + 5, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.beginPath(); ctx.arc(0, -r - 13, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.max(8, Math.min(11, r * .28))}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(this.level, 0, -r - 13);
        ctx.restore();
        if (this.isPlayer && this.level < MAX_LVL) {
            const bw = r * 2.2, bh = 5, bx = this.x - bw / 2, by = this.y + r + 8;
            ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = col; ctx.fillRect(bx, by, bw * (this.exp / this.expNeeded), bh);
        }
    }
}

let particles = [], player, bots, mouse = { x: W / 2, y: H / 2 }, score, ateCount, running, raf;
function burst(x, y, col, n = 10) {
    for (let i = 0; i < n; i++) {
        const a = rnd(0, Math.PI * 2), sp = rnd(1.5, 5);
        particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(3, 8), a: 1, col });
    }
}
function edgeSpawn() {
    const s = rndI(0, 3);
    if (s === 0) return { x: rnd(0, W), y: -70 };
    if (s === 1) return { x: W + 70, y: rnd(0, H) };
    if (s === 2) return { x: rnd(0, W), y: H + 70 };
    return { x: -70, y: rnd(0, H) };
}
function spawnBot() {
    const p = edgeSpawn();
    // 70% chance same level ±1, 20% one level below, 10% two+ levels above
    const roll = Math.random();
    let lv;
    if (roll < 0.45) lv = player.level;                          // 45% exact same
    else if (roll < 0.70) lv = Math.max(1, player.level - 1);       // 25% one below (easy prey)
    else if (roll < 0.88) lv = Math.min(MAX_LVL, player.level + 1); // 18% one above (slightly dangerous)
    else lv = Math.min(MAX_LVL, player.level + 2);               // 12% two above (real danger)
    bots.push(new Spider(p.x, p.y, lv));
}

function init() {
    player = new Spider(W / 2, H / 2, 1, true);
    bots = []; particles = []; score = 0; ateCount = 0; running = true;
    // seed with lots of same/lower level
    for (let i = 0; i < 20; i++)spawnBot();
}

function update() {
    if (!running) return;
    const dx = mouse.x - player.x, dy = mouse.y - player.y, d = Math.sqrt(dx * dx + dy * dy);
    const ps = Math.max(2.5, 5.5 - player.level * .15);
    if (d > 4) { player.x += dx / d * ps; player.y += dy / d * ps; }
    player.x = clamp(player.x, player.r + 2, W - player.r - 2);
    player.y = clamp(player.y, player.r + 2, H - player.r - 2);
    player.legAngle += 0.28;

    const all = [player, ...bots];
    for (const b of bots) { if (b.alive) { b.updateAI(all); b.moveBot(); } }

    // Player vs bots — only die if enemy is 2+ levels higher
    for (const b of bots) {
        if (!b.alive) continue;
        const dx = b.x - player.x, dy = b.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < player.r * .78 + b.r * .78) {
            if (player.level >= b.level) {
                // eat same level or lower
                b.alive = false; burst(b.x, b.y, b.col, 14); ateCount++;
                score += b.level * 10; player.gainExp();
            } else if (b.level >= player.level + 2) {
                // only dangerous if 2+ levels above
                running = false; burst(player.x, player.y, player.col, 22);
                setTimeout(showDead, 700); return;
            }
            // 1 level above = just bounce away (no death)
        }
    }

    // Bot vs bot
    for (let i = 0; i < bots.length; i++) {
        const a = bots[i]; if (!a.alive) continue;
        for (let j = i + 1; j < bots.length; j++) {
            const b = bots[j]; if (!b.alive) continue;
            const dx = b.x - a.x, dy = b.y - a.y;
            if (Math.sqrt(dx * dx + dy * dy) < a.r * .75 + b.r * .75) {
                if (a.level > b.level) { b.alive = false; burst(b.x, b.y, b.col); a.gainExp(); }
                else if (b.level > a.level) { a.alive = false; burst(a.x, a.y, a.col); b.gainExp(); }
            }
        }
    }

    bots = bots.filter(b => b.alive);
    while (bots.length < MAX_BOTS) spawnBot();

    for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.a -= 0.034; }
    particles = particles.filter(p => p.a > 0);

    lvlEl.textContent = player.level;
    scoreEl.textContent = score;
    ateEl.textContent = ateCount;
}

function drawBg() {
    ctx.fillStyle = '#0d0d18'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(100,50,180,0.07)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}
function draw() {
    drawBg();
    for (const p of particles) {
        ctx.save(); ctx.globalAlpha = p.a; ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    [...bots, player].sort((a, b) => a.level - b.level).forEach(s => { if (s.alive !== false) s.draw(); });

    // Legend hint
    ctx.fillStyle = 'rgba(255,80,80,0.7)';
    ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('🔴 Red ring = DANGER (2+ levels above you)', 10, H - 12);
}
function loop() { update(); draw(); raf = requestAnimationFrame(loop); }
function showDead() {
    cancelAnimationFrame(raf);
    overlay.innerHTML = '<div style="font-size:38px;color:#ff4466;text-shadow:0 0 20px #ff0044">💀 You Were Eaten!</div><p>Level reached: <b>' + player.level + '</b><br>Score: <b>' + score + '</b> | Spiders eaten: <b>' + ateCount + '</b></p><button class="btn red" onclick="startGame()">Play Again</button>';
    overlay.style.display = 'flex';
}
function startGame() { overlay.style.display = 'none'; cancelAnimationFrame(raf); init(); loop(); }
canvas.addEventListener('mousemove', e => {
    const rc = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rc.left; mouse.y = e.clientY - rc.top;
});
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rc = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rc.left; mouse.y = e.touches[0].clientY - rc.top;
}, { passive: false });
document.getElementById('startBtn').addEventListener('click', startGame);
