(() => {
    // ─── Canvas Setup ───────────────────────────────────────────────
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // ─── State ──────────────────────────────────────────────────────
    let state = 'idle'; // idle | playing | gameover
    let score = 0;
    let hiScore = parseInt(localStorage.getItem('mqHiScore') || '0');
    let escaped = 0;
    const MAX_ESCAPED = 20;
    let combo = 0;
    let comboTimer = 0;
    let sprayUnlocked = false;
    let sprayCooldown = 0;
    const SPRAY_COOLDOWN = 30;
    let difficultyLevel = 0;
    let difficultyTimer = 0;
    let spawnTimer = 0;
    let frameTime = 0;
    let lastTime = 0;
    let shakeTimer = 0;
    let shakeIntensity = 0;

    // ─── Mouse ──────────────────────────────────────────────────────
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, swinging: false };
    let swingTimer = 0;
    const SWING_DURATION = 0.18;

    canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    canvas.addEventListener('click', () => { if (state === 'playing') triggerSwing(); });

    function triggerSwing() {
        if (!mouse.swinging) {
            mouse.swinging = true;
            swingTimer = SWING_DURATION;
            checkHits();
        }
    }

    // ─── Entities ────────────────────────────────────────────────────
    let mosquitoes = [];
    let particles = [];
    let floatingTexts = [];

    // ─── Mosquito ────────────────────────────────────────────────────
    function spawnMosquito() {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const baseSpeed = 60 + difficultyLevel * 18;
        const speed = baseSpeed + Math.random() * 40;

        if (side === 0) { x = Math.random() * canvas.width; y = -20; }
        else if (side === 1) { x = canvas.width + 20; y = Math.random() * canvas.height; }
        else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 20; }
        else { x = -20; y = Math.random() * canvas.height; }

        const angle = Math.atan2(cy - y, cx - x) + (Math.random() - 0.5) * 1.2;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;

        mosquitoes.push({
            x, y, vx, vy,
            zigTimer: Math.random() * 2,
            zigInterval: 0.6 + Math.random() * 0.8,
            wingPhase: Math.random() * Math.PI * 2,
            size: 10 + Math.random() * 5,
            dead: false,
            alpha: 1
        });
    }

    function updateMosquito(m, dt) {
        m.zigTimer -= dt;
        if (m.zigTimer <= 0) {
            m.zigTimer = m.zigInterval;
            const turn = (Math.random() - 0.5) * Math.PI * 0.9;
            const spd = Math.hypot(m.vx, m.vy);
            const angle = Math.atan2(m.vy, m.vx) + turn;
            m.vx = Math.cos(angle) * spd;
            m.vy = Math.sin(angle) * spd;
        }
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.wingPhase += dt * 30;
    }

    function isOffScreen(m) {
        return m.x < -40 || m.x > canvas.width + 40 || m.y < -40 || m.y > canvas.height + 40;
    }

    // ─── Particles ───────────────────────────────────────────────────
    function spawnParticles(x, y) {
        for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 140;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.4,
                maxLife: 0.5 + Math.random() * 0.4,
                size: 2 + Math.random() * 4,
                color: ['#ff4444', '#ffaa00', '#ff6600', '#ffdd00'][Math.floor(Math.random() * 4)]
            });
        }
        // Blood splat dots
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 60;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + 40,
                life: 0.7 + Math.random() * 0.5,
                maxLife: 0.7 + Math.random() * 0.5,
                size: 3 + Math.random() * 6,
                color: '#cc0022'
            });
        }
    }

    function spawnFloatingText(x, y, text, color = '#ffdd00') {
        floatingTexts.push({ x, y, text, color, life: 1.2, vy: -60 });
    }

    // ─── Collision ────────────────────────────────────────────────────
    const RACKET_RADIUS = 45;

    function checkHits() {
        let killed = 0;
        mosquitoes.forEach(m => {
            if (m.dead) return;
            const dx = m.x - mouse.x, dy = m.y - mouse.y;
            if (Math.hypot(dx, dy) < RACKET_RADIUS + m.size) {
                killMosquito(m);
                killed++;
            }
        });
        if (killed > 1) {
            combo += killed;
            comboTimer = 2.5;
        } else if (killed === 1) {
            combo++;
            comboTimer = 2.5;
        }
        if (combo >= 2) showCombo();
    }

    function killMosquito(m) {
        m.dead = true;
        const pts = 10;
        score += pts;
        spawnParticles(m.x, m.y);
        spawnFloatingText(m.x, m.y - 20, `+${pts}`);
        updateUI();
        checkSprayUnlock();
        playBuzz(true);
    }

    function showCombo() {
        const el = document.getElementById('comboDisplay');
        document.getElementById('comboCount').textContent = combo;
        el.style.opacity = '1';
    }

    // ─── Audio ────────────────────────────────────────────────────────
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function getAudio() {
        if (!audioCtx) audioCtx = new AudioCtx();
        return audioCtx;
    }

    function playBuzz(kill = false) {
        try {
            const ac = getAudio();
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.connect(gain); gain.connect(ac.destination);
            if (kill) {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, ac.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 0.15);
                gain.gain.setValueAtTime(0.15, ac.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
                osc.start(); osc.stop(ac.currentTime + 0.15);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600 + Math.random() * 400, ac.currentTime);
                gain.gain.setValueAtTime(0.04, ac.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
                osc.start(); osc.stop(ac.currentTime + 0.1);
            }
        } catch (e) { }
    }

    function playSpraySound() {
        try {
            const ac = getAudio();
            const buf = ac.createBuffer(1, ac.sampleRate * 0.8, ac.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / data.length);
            const src = ac.createBufferSource();
            const gain = ac.createGain();
            const filter = ac.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 3000;
            src.buffer = buf;
            src.connect(filter); filter.connect(gain); gain.connect(ac.destination);
            gain.gain.setValueAtTime(0.3, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.8);
            src.start(); src.stop(ac.currentTime + 0.8);
        } catch (e) { }
    }

    // ─── Spray Power ─────────────────────────────────────────────────
    function checkSprayUnlock() {
        if (!sprayUnlocked && score >= 100) {
            sprayUnlocked = true;
            const btn = document.getElementById('sprayBtn');
            btn.style.display = 'block';
        }
    }

    function activateSpray() {
        if (sprayCooldown > 0 || !sprayUnlocked) return;
        sprayCooldown = SPRAY_COOLDOWN;
        shakeTimer = 0.5;
        shakeIntensity = 12;

        // Kill all mosquitoes
        let killed = 0;
        mosquitoes.forEach(m => {
            if (!m.dead) {
                m.dead = true;
                spawnParticles(m.x, m.y);
                score += 10;
                killed++;
            }
        });
        if (killed > 0) spawnFloatingText(canvas.width / 2, canvas.height / 2 - 40, `ALL OUT! +${killed * 10}`, '#00ccff');
        updateUI();
        playSpraySound();

        // Spray overlay flash
        const ov = document.getElementById('sprayOverlay');
        ov.style.opacity = '1';
        setTimeout(() => ov.style.opacity = '0', 300);

        const btn = document.getElementById('sprayBtn');
        btn.disabled = true;
    }

    document.getElementById('sprayBtn').addEventListener('click', activateSpray);

    // ─── Difficulty ───────────────────────────────────────────────────
    function increaseDifficulty() {
        difficultyLevel++;
        const notice = document.getElementById('difficultyNotice');
        notice.style.opacity = '1';
        setTimeout(() => notice.style.opacity = '0', 1800);
    }

    // ─── UI ───────────────────────────────────────────────────────────
    function updateUI() {
        document.getElementById('scoreDisplay').textContent = score;
        if (score > hiScore) {
            hiScore = score;
            localStorage.setItem('mqHiScore', hiScore);
        }
        document.getElementById('hiScoreDisplay').textContent = hiScore;
        document.getElementById('escapedDisplay').textContent = escaped;
        buildLivesBar();
    }

    function buildLivesBar() {
        const bar = document.getElementById('livesBar');
        bar.innerHTML = '';
        for (let i = 0; i < MAX_ESCAPED; i++) {
            // Show hearts in groups of 5
            if (i % 5 === 0) {
                const span = document.createElement('span');
                span.className = 'heart' + (i < escaped ? ' lost' : '');
                span.textContent = ['🦟', '🦟', '🦟', '🦟'][Math.floor(i / 5)] || '🦟';
                bar.appendChild(span);
            }
        }
        // Just show remaining indicator
        bar.innerHTML = '';
        const remaining = MAX_ESCAPED - escaped;
        const hearts = document.createElement('div');
        hearts.style.cssText = 'display:flex;gap:4px;';
        for (let i = 0; i < 5; i++) {
            const h = document.createElement('span');
            h.className = 'heart' + (i >= Math.ceil(remaining / 4) ? ' lost' : '');
            h.textContent = '❤️';
            hearts.appendChild(h);
        }
        bar.appendChild(hearts);
    }

    // ─── Draw Functions ───────────────────────────────────────────────
    function drawBackground() {
        ctx.fillStyle = '#050a14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Stars
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        for (let i = 0; i < 80; i++) {
            const x = (i * 137.5 * 3 + 50) % canvas.width;
            const y = (i * 97.3 * 2 + 30) % canvas.height;
            const s = (i % 3 === 0) ? 1.5 : 0.8;
            ctx.beginPath();
            ctx.arc(x, y, s, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawMosquito(m) {
        ctx.save();
        ctx.globalAlpha = m.alpha;
        ctx.translate(m.x, m.y);

        const angle = Math.atan2(m.vy, m.vx);
        ctx.rotate(angle + Math.PI / 2);

        const s = m.size / 10;

        // Wings
        const wingFlap = Math.sin(m.wingPhase) * 0.4;
        ctx.save();
        ctx.globalAlpha = m.alpha * 0.6;

        // Left wing
        ctx.beginPath();
        ctx.ellipse(-8 * s, -2 * s, 10 * s, 5 * s, -0.3 + wingFlap, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,220,255,0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(150,200,255,0.8)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.ellipse(8 * s, -2 * s, 10 * s, 5 * s, 0.3 - wingFlap, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 4 * s, 9 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.strokeStyle = '#444466';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(0, -10 * s, 4 * s, 0, Math.PI * 2);
        ctx.fillStyle = '#222244';
        ctx.fill();

        // Proboscis
        ctx.beginPath();
        ctx.moveTo(0, -13 * s);
        ctx.lineTo(0, -20 * s);
        ctx.strokeStyle = '#555577';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Legs
        ctx.strokeStyle = '#333355';
        ctx.lineWidth = 0.7;
        for (let i = -1; i <= 1; i += 1) {
            ctx.beginPath();
            ctx.moveTo(-4 * s, i * 3 * s);
            ctx.lineTo(-12 * s, (i * 3 + 6) * s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(4 * s, i * 3 * s);
            ctx.lineTo(12 * s, (i * 3 + 6) * s);
            ctx.stroke();
        }

        // Eyes glow
        ctx.beginPath();
        ctx.arc(-2 * s, -11 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fillStyle = '#ff3333';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(2 * s, -11 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawRacket() {
        const t = mouse.swinging ? 1 - (swingTimer / SWING_DURATION) : 0;
        const swingAngle = t * Math.PI * 0.4 - (mouse.swinging ? 0.2 : 0);

        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        ctx.rotate(swingAngle - Math.PI / 4);

        // Neon glow
        const glowR = mouse.swinging ? RACKET_RADIUS + 8 : RACKET_RADIUS;
        const grd = ctx.createRadialGradient(0, 0, glowR * 0.3, 0, 0, glowR + 15);
        grd.addColorStop(0, mouse.swinging ? 'rgba(100,255,180,0.25)' : 'rgba(0,255,120,0.12)');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(0, 0, glowR + 15, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Grid pattern inside racket
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, RACKET_RADIUS, 0, Math.PI * 2);
        ctx.clip();
        ctx.strokeStyle = mouse.swinging ? 'rgba(100,255,180,0.35)' : 'rgba(0,255,120,0.2)';
        ctx.lineWidth = 1;
        const spacing = 12;
        for (let x = -RACKET_RADIUS; x <= RACKET_RADIUS; x += spacing) {
            ctx.beginPath(); ctx.moveTo(x, -RACKET_RADIUS); ctx.lineTo(x, RACKET_RADIUS); ctx.stroke();
        }
        for (let y = -RACKET_RADIUS; y <= RACKET_RADIUS; y += spacing) {
            ctx.beginPath(); ctx.moveTo(-RACKET_RADIUS, y); ctx.lineTo(RACKET_RADIUS, y); ctx.stroke();
        }
        ctx.restore();

        // Outer ring
        ctx.beginPath();
        ctx.arc(0, 0, RACKET_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = mouse.swinging ? '#80ffcc' : '#00ff78';
        ctx.lineWidth = mouse.swinging ? 3.5 : 2.5;
        ctx.shadowColor = mouse.swinging ? '#00ffaa' : '#00ff78';
        ctx.shadowBlur = mouse.swinging ? 20 : 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Handle
        ctx.beginPath();
        ctx.moveTo(0, RACKET_RADIUS);
        ctx.lineTo(0, RACKET_RADIUS + 55);
        const handleGrd = ctx.createLinearGradient(0, RACKET_RADIUS, 0, RACKET_RADIUS + 55);
        handleGrd.addColorStop(0, '#00cc60');
        handleGrd.addColorStop(1, '#005530');
        ctx.strokeStyle = handleGrd;
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Handle grip marks
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const y = RACKET_RADIUS + 15 + i * 10;
            ctx.beginPath();
            ctx.moveTo(-4, y); ctx.lineTo(4, y); ctx.stroke();
        }

        ctx.restore();
    }

    function drawParticles() {
        particles.forEach(p => {
            const ratio = p.life / p.maxLife;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * ratio, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = ratio;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }

    function drawFloatingTexts() {
        floatingTexts.forEach(t => {
            ctx.font = `bold ${20 * (t.life / 1.2)}px Segoe UI`;
            ctx.fillStyle = t.color;
            ctx.globalAlpha = Math.min(1, t.life);
            ctx.textAlign = 'center';
            ctx.fillText(t.text, t.x, t.y);
            ctx.globalAlpha = 1;
        });
    }

    // ─── Game Loop ────────────────────────────────────────────────────
    function update(dt) {
        // Spawn
        const spawnInterval = Math.max(0.4, 1.4 - difficultyLevel * 0.12);
        spawnTimer += dt;
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0;
            spawnMosquito();
            if (Math.random() < 0.1 + difficultyLevel * 0.05) spawnMosquito(); // bonus spawn
        }

        // Difficulty ramp
        difficultyTimer += dt;
        if (difficultyTimer >= 20) {
            difficultyTimer = 0;
            increaseDifficulty();
        }

        // Update mosquitoes
        mosquitoes.forEach(m => {
            if (m.dead) {
                m.alpha -= dt * 5;
            } else {
                updateMosquito(m, dt);
                // Buzz sounds randomly
                if (Math.random() < 0.002) playBuzz(false);
            }
        });

        // Check escaped
        const before = mosquitoes.length;
        mosquitoes = mosquitoes.filter(m => {
            if (m.dead && m.alpha <= 0) return false;
            if (!m.dead && isOffScreen(m)) {
                escaped++;
                updateUI();
                if (escaped >= MAX_ESCAPED) endGame();
                return false;
            }
            return true;
        });

        // Particles
        particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 120 * dt; // gravity
            p.life -= dt;
        });
        particles = particles.filter(p => p.life > 0);

        // Floating texts
        floatingTexts.forEach(t => {
            t.y += t.vy * dt;
            t.life -= dt;
        });
        floatingTexts = floatingTexts.filter(t => t.life > 0);

        // Swing timer
        if (mouse.swinging) {
            swingTimer -= dt;
            if (swingTimer <= 0) { mouse.swinging = false; swingTimer = 0; }
        }

        // Combo
        if (combo > 0) {
            comboTimer -= dt;
            if (comboTimer <= 0) {
                combo = 0;
                document.getElementById('comboDisplay').style.opacity = '0';
            }
        }

        // Spray cooldown
        if (sprayCooldown > 0) {
            sprayCooldown -= dt;
            const btn = document.getElementById('sprayBtn');
            if (sprayCooldown <= 0) {
                sprayCooldown = 0;
                btn.disabled = false;
                document.getElementById('cooldownTimer').textContent = '';
            } else {
                document.getElementById('cooldownTimer').textContent = `${Math.ceil(sprayCooldown)}s`;
            }
        }

        // Screen shake
        if (shakeTimer > 0) {
            shakeTimer -= dt;
            shakeIntensity *= 0.92;
        }
    }

    function draw() {
        ctx.save();
        if (shakeTimer > 0) {
            ctx.translate(
                (Math.random() - 0.5) * shakeIntensity,
                (Math.random() - 0.5) * shakeIntensity
            );
        }

        drawBackground();
        drawParticles();
        mosquitoes.forEach(m => drawMosquito(m));
        drawFloatingTexts();
        drawRacket();

        ctx.restore();
    }

    function loop(ts) {
        if (state !== 'playing') return;
        const dt = Math.min((ts - lastTime) / 1000, 0.05);
        lastTime = ts;
        update(dt);
        draw();
        requestAnimationFrame(loop);
    }

    // ─── Game Control ─────────────────────────────────────────────────
    function startGame() {
        state = 'playing';
        score = 0;
        escaped = 0;
        combo = 0;
        comboTimer = 0;
        sprayUnlocked = false;
        sprayCooldown = 0;
        difficultyLevel = 0;
        difficultyTimer = 0;
        spawnTimer = 0;
        mosquitoes = [];
        particles = [];
        floatingTexts = [];
        mouse.swinging = false;

        document.getElementById('overlay').style.display = 'none';
        document.getElementById('sprayBtn').style.display = 'none';
        document.getElementById('sprayBtn').disabled = false;
        document.getElementById('comboDisplay').style.opacity = '0';
        document.getElementById('cooldownTimer').textContent = '';

        updateUI();
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }

    function endGame() {
        state = 'gameover';

        if (score > hiScore) {
            hiScore = score;
            localStorage.setItem('mqHiScore', hiScore);
        }

        const overlay = document.getElementById('overlay');
        overlay.querySelector('h1').textContent = 'GAME OVER';
        overlay.querySelector('.sub').textContent = 'THE MOSQUITOES WIN... THIS TIME';
        document.getElementById('finalScore').style.display = 'block';
        document.getElementById('finalScoreVal').textContent = score;
        document.getElementById('hiScoreLine').textContent = `BEST: ${hiScore}`;
        document.getElementById('startBtn').textContent = '▶ PLAY AGAIN';
        overlay.style.display = 'flex';
        document.getElementById('sprayBtn').style.display = 'none';
    }

    document.getElementById('startBtn').addEventListener('click', startGame);

    // Initial hi score
    document.getElementById('hiScoreDisplay').textContent = hiScore;

    // Idle draw loop
    function idleDraw(ts) {
        if (state !== 'idle') return;
        ctx.save();
        drawBackground();
        ctx.restore();
        requestAnimationFrame(idleDraw);
    }
    requestAnimationFrame(idleDraw);

})();