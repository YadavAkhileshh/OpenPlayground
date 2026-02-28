const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d", { alpha: true });

const overlay = document.getElementById("overlay");
const overlayImg = document.getElementById("overlayImg");

const btnPlay = document.getElementById("btnPlay");
const playText = document.getElementById("playText");
const btnHow = document.getElementById("btnHow");
const btnPause = document.getElementById("btnPause");
const btnSound = document.getElementById("btnSound");
const btnFX = document.getElementById("btnFX");

const cutscene = document.getElementById("cutscene");
const cutText = document.getElementById("cutText");
const cutSub = document.getElementById("cutSub");

const sL = document.getElementById("sL");
const sR = document.getElementById("sR");

const INTRO_IMG =
	"https://mattcannon.games/codepen/press-start/codepong-title.png";
const END_IMG = "https://mattcannon.games/codepen/press-start/codepong26.png";

let W = 0,
	H = 0;
let DPR = 1;

function resize() {
	const rect = canvas.getBoundingClientRect();
	W = Math.floor(rect.width);
	H = Math.floor(rect.height);
	canvas.width = W * DPR;
	canvas.height = H * DPR;
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);

function rand(a, b) {
	return a + Math.random() * (b - a);
}
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}

const state = {
	running: false,
	paused: false,
	fx: true,
	sound: false,
	time: 0,
	shake: 0,
	cut: false,
	cutT: 0,
	slowmo: 1
};

const score = { L: 0, R: 0, toWin: 11 };
let rally = 0;

const paddle = { w: 14, h: 110, inset: 26, y: 0, targetY: 0 };
const ai = { w: 14, h: 110, inset: 26, y: 0, vy: 0, memoryY: 0 };
const ball = { r: 10, x: 0, y: 0, vx: 0, vy: 0, speed: 560 };

const trail = [];
const particles = [];
const sparks = [];

const PERF = {
	maxTrail: 16,
	maxParticles: 70,
	maxSparks: 40
};

function setPressed(el, on) {
	el.setAttribute("aria-pressed", on ? "true" : "false");
}
function setIntro(on) {
	overlay.classList.toggle("intro", !!on);
}

function showOverlay(title, bodyHtml) {
	setIntro(false);
	overlay.classList.remove("hidden");
	document.getElementById("panelTitle").textContent = title;
	document.getElementById("panelBody").innerHTML = bodyHtml;
}

function hideOverlay() {
	overlay.classList.add("hidden");
}

function setSoundIcon() {
	const i = btnSound.querySelector("i");
	if (i)
		i.className = state.sound
			? "fa-solid fa-volume-high"
			: "fa-solid fa-volume-xmark";
}

function setFXIcon() {
	const i = btnFX.querySelector("i");
	if (i)
		i.className = state.fx
			? "fa-solid fa-wand-magic-sparkles"
			: "fa-solid fa-wand-magic";
}

function setPauseIcon() {
	const i = btnPause.querySelector("i");
	if (i) i.className = state.paused ? "fa-solid fa-play" : "fa-solid fa-pause";
}

btnPlay.addEventListener("click", start);

if (btnHow) {
	btnHow.addEventListener("click", () => {
		const t = document.getElementById("tiny");
		if (t) t.textContent = "HOW: HIT EDGES FOR ANGLE. SPACE PAUSES. R RESTARTS.";
	});
}

btnPause.addEventListener("click", togglePause);
btnSound.addEventListener("click", toggleSound);
btnFX.addEventListener("click", toggleFX);

overlay.addEventListener("click", (e) => {
	if (e.target.closest("button")) return;
	if (!state.running) start();
});

function togglePause() {
	if (!state.running) return;

	state.paused = !state.paused;
	setPressed(btnPause, state.paused);

	if (state.paused) {
		overlayImg.src =
			"https://mattcannon.games/codepen/press-start/codepong26.png";
		showOverlay("PAUSED", "PRESS START OR SPACE TO CONTINUE");
	} else {
		overlayImg.src = INTRO_IMG;
		hideOverlay();
	}
}

function toggleSound() {
	state.sound = !state.sound;
	setPressed(btnSound, state.sound);
	setSoundIcon();
	if (state.sound) beep("start");
}

function toggleFX() {
	state.fx = !state.fx;
	setPressed(btnFX, state.fx);
	setFXIcon();
	if (!state.fx) {
		trail.length = 0;
		particles.length = 0;
		sparks.length = 0;
	}
}

let AC = null,
	master = null;
function ensureAudio() {
	if (AC) return;
	AC = new (window.AudioContext || window.webkitAudioContext)();
	master = AC.createGain();
	master.gain.value = 0.12;
	master.connect(AC.destination);
}
function tone(freq, dur = 0.05, type = "sine", gain = 0.2) {
	if (!state.sound) return;
	ensureAudio();
	const t0 = AC.currentTime;
	const o = AC.createOscillator();
	const g = AC.createGain();
	o.type = type;
	o.frequency.setValueAtTime(freq, t0);
	g.gain.setValueAtTime(0.0001, t0);
	g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
	g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	o.connect(g);
	g.connect(master);
	o.start(t0);
	o.stop(t0 + dur + 0.02);
}
function beep(kind) {
	if (!state.sound) return;
	if (kind === "hit") tone(420, 0.025, "sine", 0.14);
	if (kind === "wall") tone(320, 0.03, "sine", 0.12);
	if (kind === "score") {
		tone(180, 0.06, "triangle", 0.16);
		tone(260, 0.06, "triangle", 0.12);
	}
	if (kind === "start") tone(520, 0.05, "sine", 0.12);
	if (kind === "win") {
		tone(330, 0.07, "triangle", 0.16);
		tone(660, 0.08, "sine", 0.12);
	}
}

let pointerActive = false;

function setTargetFromClientY(clientY) {
	const rect = canvas.getBoundingClientRect();
	const y = clientY - rect.top;
	paddle.targetY = clamp(y, paddle.h / 2 + 8, H - paddle.h / 2 - 8);
}

canvas.addEventListener("pointerdown", (e) => {
	pointerActive = true;
	try {
		canvas.setPointerCapture(e.pointerId);
	} catch {}
	setTargetFromClientY(e.clientY);
});
canvas.addEventListener("pointermove", (e) => {
	if (!pointerActive) return;
	setTargetFromClientY(e.clientY);
});
canvas.addEventListener("pointerup", () => {
	pointerActive = false;
});
canvas.addEventListener("mousemove", (e) => {
	if (pointerActive) return;
	setTargetFromClientY(e.clientY);
});
window.addEventListener("touchmove", (e) => e.preventDefault(), {
	passive: false
});

const keys = new Set();
window.addEventListener("keydown", (e) => {
	keys.add(e.key.toLowerCase());
	if (e.key === " ") {
		e.preventDefault();
		if (!state.running) start();
		else togglePause();
	}
	if (e.key.toLowerCase() === "r") hardRestart();
	if (e.key.toLowerCase() === "m") {
		if (state.sound) toggleSound();
	}
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

function burst(x, y, n) {
	for (let i = 0; i < n; i++) {
		particles.push({
			x,
			y,
			vx: rand(-240, 240),
			vy: rand(-240, 240),
			life: rand(0.25, 0.7),
			t: 0
		});
	}
	while (particles.length > PERF.maxParticles) particles.shift();
}

function sparkLine(x, y, vx, vy, n) {
	for (let i = 0; i < n; i++) {
		sparks.push({
			x,
			y,
			vx: vx * rand(0.2, 0.7) + rand(-60, 60),
			vy: vy * rand(0.2, 0.7) + rand(-60, 60),
			life: rand(0.12, 0.28),
			t: 0
		});
	}
	while (sparks.length > PERF.maxSparks) sparks.shift();
}

function shock(a) {
	state.shake = Math.min(10, state.shake + a);
}

function levelFromProgress() {
	const total = score.L + score.R;
	const maxScore = Math.max(score.L, score.R);
	let lvl = 0;
	if (total >= 3) lvl = 1;
	if (total >= 7) lvl = 2;
	if (maxScore >= 6) lvl = 3;
	if (maxScore >= 9) lvl = 4;
	return lvl;
}

function maybeMatchPointCutscene() {
	if (!state.fx) return;
	const mp =
		(score.L === score.toWin - 1 && score.R <= score.toWin - 2) ||
		(score.R === score.toWin - 1 && score.L <= score.toWin - 2) ||
		(score.L === score.toWin - 1 && score.R === score.toWin - 1);

	if (!mp) return;

	state.cut = true;
	state.cutT = 0;
	state.slowmo = 0.45;

	cutText.textContent =
		score.L === score.toWin - 1 && score.R === score.toWin - 1
			? "FINAL POINT"
			: "MATCH POINT";
	cutSub.textContent = "SLOW MO";
	cutscene.classList.add("on");
	cutscene.setAttribute("aria-hidden", "false");
}

function updateCutscene(dt) {
	if (!state.cut) return;
	state.cutT += dt;

	if (state.cutT > 0.9) {
		state.slowmo = lerp(state.slowmo, 1, 1 - Math.pow(0.0009, dt));
	}
	if (state.cutT > 1.35) {
		state.cut = false;
		state.slowmo = 1;
		cutscene.classList.remove("on");
		cutscene.setAttribute("aria-hidden", "true");
	}
}

function resetRound(direction = Math.random() < 0.5 ? -1 : 1) {
	ball.x = W / 2;
	ball.y = H / 2;

	const angle = rand(-0.28, 0.28);
	const base = ball.speed;

	ball.vx = Math.cos(angle) * base * direction;
	ball.vy = Math.sin(angle) * base;

	if (state.fx) {
		burst(ball.x, ball.y, 8);
		shock(3);
	}
	beep("start");

	maybeMatchPointCutscene();
}

function resetGame() {
	score.L = 0;
	score.R = 0;
	sL.textContent = "0";
	sR.textContent = "0";

	rally = 0;
	ball.speed = 560;
	paddle.h = 110;
	ai.h = 110;

	paddle.y = H / 2;
	paddle.targetY = H / 2;

	ai.y = H / 2;
	ai.memoryY = H / 2;

	trail.length = 0;
	particles.length = 0;
	sparks.length = 0;

	resetRound();
}

function start() {
	state.running = true;
	state.paused = false;
	setPressed(btnPause, false);
	setPauseIcon();
	setIntro(false);
	hideOverlay();
	if (playText) playText.textContent = "START";
	resetGame();
}

function hardRestart() {
	state.running = true;
	state.paused = false;
	setPressed(btnPause, false);
	setPauseIcon();
	setIntro(false);
	hideOverlay();
	if (playText) playText.textContent = "START";
	resetGame();
}

function aiUpdate(dt) {
	const lvl = levelFromProgress();

	const reaction = [0.24, 0.2, 0.16, 0.13, 0.12][lvl];
	const maxSpeed = [520, 600, 700, 820, 920][lvl];
	const jitter = [42, 32, 22, 14, 10][lvl];

	ai.h = clamp(118 - lvl * 6, 88, 118);

	const coming = ball.vx > 0;
	let target = H / 2;

	if (coming) {
		const lookAhead = [0.1, 0.12, 0.14, 0.16, 0.17][lvl];
		target = ball.y + ball.vy * lookAhead + rand(-jitter, jitter);
	}

	target = clamp(target, ai.h / 2 + 8, H - ai.h / 2 - 8);

	ai.memoryY = lerp(ai.memoryY, target, 1 - Math.pow(0.0006, dt / reaction));

	const dy = ai.memoryY - ai.y;
	ai.vy = clamp(dy / reaction, -maxSpeed, maxSpeed);
	ai.y += ai.vy * dt;
}

function updateParticles(dt) {
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.t += dt;
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		p.vx *= Math.pow(0.14, dt);
		p.vy *= Math.pow(0.14, dt);
		if (p.t >= p.life) particles.splice(i, 1);
	}
	for (let i = sparks.length - 1; i >= 0; i--) {
		const p = sparks[i];
		p.t += dt;
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		p.vx *= Math.pow(0.06, dt);
		p.vy *= Math.pow(0.06, dt);
		if (p.t >= p.life) sparks.splice(i, 1);
	}
}

function roundRect(x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.arcTo(x + w, y, x + w, y + h, rr);
	ctx.arcTo(x + w, y + h, x, y + h, rr);
	ctx.arcTo(x, y + h, x, y, rr);
	ctx.arcTo(x, y, x + w, y, rr);
	ctx.closePath();
}

function draw() {
	ctx.clearRect(0, 0, W, H);

	const sh = state.fx ? state.shake : 0;
	const sx = sh ? rand(-sh, sh) : 0;
	const sy = sh ? rand(-sh, sh) : 0;

	ctx.save();
	ctx.translate(sx, sy);

	const t = state.time;
	const glow = (x, y, a, clr) => {
		const g = ctx.createRadialGradient(x, y, 10, x, y, Math.max(W, H));
		g.addColorStop(0, `rgba(${clr},${a})`);
		g.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);
	};
	glow(W * 0.22, H * 0.28, 0.1 + 0.02 * Math.sin(t * 0.7), "255,79,216");
	glow(W * 0.8, H * 0.34, 0.09 + 0.02 * Math.sin(t * 0.8 + 1.2), "0,229,255");
	glow(W * 0.55, H * 0.86, 0.07 + 0.02 * Math.sin(t * 0.65 + 2.0), "124,92,255");

	ctx.globalAlpha = 0.26;
	ctx.fillStyle = "rgba(255,255,255,0.22)";
	for (let y = 12; y < H; y += 22) ctx.fillRect(W / 2 - 1, y, 2, 12);
	ctx.globalAlpha = 1;

	if (state.fx && trail.length > 1) {
		for (let i = 0; i < trail.length - 1; i++) {
			const a = trail[i],
				b = trail[i + 1];
			const age = (state.time - a.t) / 0.2;
			const alpha = (1 - age) * 0.22;
			ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
			ctx.lineWidth = 5 * (1 - age);
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(a.x, a.y);
			ctx.lineTo(b.x, b.y);
			ctx.stroke();
		}
	}

	drawPaddle(paddle.inset, paddle.y, paddle.w, paddle.h, true);
	drawPaddle(W - ai.inset, ai.y, ai.w, ai.h, false);
	drawBall(ball.x, ball.y, ball.r);

	if (state.fx) {
		drawParticles();
	}

	ctx.restore();
}

function drawPaddle(x, y, w, h, isPlayer) {
	const px = x - w / 2;
	const py = y - h / 2;

	const grad = ctx.createLinearGradient(x, py, x, py + h);
	if (isPlayer) {
		grad.addColorStop(0, "rgba(0,229,255,0.95)");
		grad.addColorStop(1, "rgba(124,92,255,0.85)");
	} else {
		grad.addColorStop(0, "rgba(255,79,216,0.85)");
		grad.addColorStop(1, "rgba(0,229,255,0.70)");
	}

	ctx.fillStyle = grad;
	roundRect(px, py, w, h, 10);
	ctx.fill();

	ctx.globalAlpha = 0.3;
	ctx.fillStyle = "rgba(255,255,255,0.34)";
	roundRect(px + 3, py + 6, w - 6, h * 0.18, 10);
	ctx.fill();
	ctx.globalAlpha = 1;
}

function drawBall(x, y, r) {
	ctx.globalAlpha = 0.18;
	ctx.fillStyle = "rgba(0,229,255,1)";
	ctx.beginPath();
	ctx.arc(x, y, r * 2.1, 0, Math.PI * 2);
	ctx.fill();
	ctx.globalAlpha = 1;

	const grad = ctx.createRadialGradient(
		x - r * 0.35,
		y - r * 0.35,
		2,
		x,
		y,
		r * 1.4
	);
	grad.addColorStop(0, "rgba(255,255,255,0.98)");
	grad.addColorStop(0.55, "rgba(0,229,255,0.86)");
	grad.addColorStop(1, "rgba(255,79,216,0.22)");

	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
}

function drawParticles() {
	ctx.fillStyle = "rgba(255,255,255,0.75)";
	for (const p of particles) {
		const k = 1 - p.t / p.life;
		ctx.globalAlpha = 0.7 * k;
		ctx.fillRect(p.x, p.y, 2, 2);
	}
	ctx.globalAlpha = 1;

	ctx.strokeStyle = "rgba(255,79,216,0.45)";
	ctx.lineWidth = 2;
	ctx.lineCap = "round";
	for (const p of sparks) {
		const k = 1 - p.t / p.life;
		ctx.globalAlpha = 0.6 * k;
		ctx.beginPath();
		ctx.moveTo(p.x, p.y);
		ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02);
		ctx.stroke();
	}
	ctx.globalAlpha = 1;
}

let last = 0;

function update(ts) {
	requestAnimationFrame(update);
	if (!W || !H) return;

	const now = ts * 0.001;
	let dt = now - last;
	last = now;

	dt = Math.min(0.02, Math.max(0.008, dt));
	dt *= state.slowmo;

	state.time += dt;
	state.shake = Math.max(0, state.shake - dt * 22);

	updateCutscene(dt);

	let keyDir = 0;
	if (keys.has("w") || keys.has("arrowup")) keyDir -= 1;
	if (keys.has("s") || keys.has("arrowdown")) keyDir += 1;
	if (keyDir) {
		paddle.targetY = clamp(
			paddle.targetY + keyDir * 780 * dt,
			paddle.h / 2 + 8,
			H - paddle.h / 2 - 8
		);
	}

	if (!state.running) {
		draw();
		return;
	}
	if (state.paused) {
		draw();
		return;
	}

	const ease = 1 - Math.pow(0.0009, dt);
	paddle.y = lerp(paddle.y, paddle.targetY, ease);

	aiUpdate(dt);

	ball.x += ball.vx * dt;
	ball.y += ball.vy * dt;

	if (state.fx) {
		trail.push({ x: ball.x, y: ball.y, t: state.time });
		if (trail.length > PERF.maxTrail) trail.shift();
	} else {
		trail.length = 0;
	}

	if (ball.y - ball.r <= 0) {
		ball.y = ball.r;
		ball.vy *= -1;
		if (state.fx) {
			sparkLine(ball.x, ball.y, ball.vx * 0.03, 200, 6);
		}
		beep("wall");
	}
	if (ball.y + ball.r >= H) {
		ball.y = H - ball.r;
		ball.vy *= -1;
		if (state.fx) {
			sparkLine(ball.x, ball.y, ball.vx * 0.03, -200, 6);
		}
		beep("wall");
	}

	const px = paddle.inset;
	const ax = W - ai.inset;

	if (ball.vx < 0 && ball.x - ball.r <= px + paddle.w / 2) {
		const top = paddle.y - paddle.h / 2;
		const bot = paddle.y + paddle.h / 2;
		if (ball.y >= top && ball.y <= bot) {
			ball.x = px + paddle.w / 2 + ball.r;
			rally++;

			const n = (ball.y - paddle.y) / (paddle.h / 2);
			const angle = n * 0.95;

			const lvl = levelFromProgress();
			const up = [1.02, 1.03, 1.035, 1.04, 1.045][lvl];
			const newSpeed = clamp(ball.speed * (up + rally * 0.0016), 560, 980);

			ball.vx = Math.abs(ball.vx);
			ball.vy = angle * newSpeed;

			const mag = Math.hypot(ball.vx, ball.vy) || 1;
			ball.vx = (ball.vx / mag) * newSpeed;
			ball.vy = (ball.vy / mag) * newSpeed;

			if (state.fx) {
				burst(ball.x, ball.y, 6);
				sparkLine(ball.x, ball.y, 220, ball.vy * 0.05, 6);
				shock(4);
			}
			beep("hit");
		}
	}

	if (ball.vx > 0 && ball.x + ball.r >= ax - ai.w / 2) {
		const top = ai.y - ai.h / 2;
		const bot = ai.y + ai.h / 2;
		if (ball.y >= top && ball.y <= bot) {
			ball.x = ax - ai.w / 2 - ball.r;
			rally++;

			const n = (ball.y - ai.y) / (ai.h / 2);
			const angle = n * 0.9;

			const lvl = levelFromProgress();
			const up = [1.015, 1.025, 1.03, 1.035, 1.04][lvl];
			const newSpeed = clamp(ball.speed * (up + rally * 0.0012), 560, 960);

			ball.vx = -Math.abs(ball.vx);
			ball.vy = angle * newSpeed;

			const mag = Math.hypot(ball.vx, ball.vy) || 1;
			ball.vx = (ball.vx / mag) * newSpeed;
			ball.vy = (ball.vy / mag) * newSpeed;

			if (state.fx) {
				burst(ball.x, ball.y, 6);
				sparkLine(ball.x, ball.y, -220, ball.vy * 0.05, 6);
				shock(4);
			}
			beep("hit");
		}
	}

	if (ball.x < -60) {
		score.R++;
		sR.textContent = score.R;
		rally = 0;
		if (state.fx) {
			burst(W / 2, H / 2, 10);
			shock(6);
		}
		beep("score");
		checkWinOrReset(-1);
	}
	if (ball.x > W + 60) {
		score.L++;
		sL.textContent = score.L;
		rally = 0;
		if (state.fx) {
			burst(W / 2, H / 2, 10);
			shock(6);
		}
		beep("score");
		checkWinOrReset(1);
	}

	updateParticles(dt);
	draw();
}

function checkWinOrReset(nextDir) {
	if (score.L >= score.toWin) {
		endGame(true);
		return;
	}
	if (score.R >= score.toWin) {
		endGame(false);
		return;
	}
	resetRound(nextDir);
}

function endGame(playerWon) {
	state.running = true;
	state.paused = true;
	setPressed(btnPause, true);
	setPauseIcon();

	overlayImg.src = END_IMG;

	const title = playerWon ? "YOU WIN" : "AI WINS";
	const stats = `FINAL SCORE: ${score.L} - ${score.R}`;
	const msg = playerWon
		? "NICE WORK. RUN IT BACK AND PUSH FOR A PERFECT GAME."
		: "CLOSE. YOU CAN BEAT IT. STAY CALM AND USE THE EDGES OF THE PADDLE.";

	showOverlay(title, `${stats}<br><br>${msg}`);

	if (playText) playText.textContent = "PLAY AGAIN";
	beep("win");
}

resize();
paddle.y = H / 2;
paddle.targetY = H / 2;
ai.y = H / 2;
ai.memoryY = H / 2;

setSoundIcon();
setFXIcon();
setPauseIcon();

overlayImg.src = INTRO_IMG;
setIntro(true);
overlay.classList.remove("hidden");
if (playText) playText.textContent = "START";

requestAnimationFrame(update);
