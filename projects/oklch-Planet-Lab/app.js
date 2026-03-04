// ╔══════════════════════════════════════════════════════╗
// ║  1. CONSTANTS                                        ║
// ╚══════════════════════════════════════════════════════╝

/** Runtime tuning values — never mutated after init */
const CONFIG = Object.freeze({
	STAR_DENSITY: 2800, // px² per star
	SHOOT_INTERVAL: 3200, // ms between meteor spawn checks
	SHOOT_CHANCE: 0.28, // probability per interval
	MOON_BASE_PERIOD: 12000, // ms for one full orbit at speed = 100
	HISTORY_LIMIT: 10, // max undo steps
	TOAST_DURATION: 1800, // ms toast stays visible
	CONST_LINE_OPACITY: 0.045, // max constellation line alpha
	CONST_STAR_MIN_BRIGHT: 0.7, // baseAlpha threshold to qualify for constellations
	MW_OPACITY: 0.055 // Milky Way band peak alpha
});

/**
 * Harvard OBAFGKM spectral sequence.
 * Each class: display rgb, IMF population weight, pixel-radius range, base-alpha range.
 * Weights sum to 1 and are heavily M/K biased (matching real stellar IMF).
 */
const SPECTRAL = Object.freeze([
	{
		name: "O",
		rgb: [180, 190, 255],
		weight: 0.001,
		rMin: 1.2,
		rMax: 2.2,
		aMin: 0.8,
		aMax: 1.0
	},
	{
		name: "B",
		rgb: [195, 210, 255],
		weight: 0.006,
		rMin: 1.0,
		rMax: 1.8,
		aMin: 0.65,
		aMax: 0.95
	},
	{
		name: "A",
		rgb: [220, 230, 255],
		weight: 0.02,
		rMin: 0.8,
		rMax: 1.4,
		aMin: 0.55,
		aMax: 0.85
	},
	{
		name: "F",
		rgb: [248, 244, 255],
		weight: 0.04,
		rMin: 0.6,
		rMax: 1.1,
		aMin: 0.4,
		aMax: 0.75
	},
	{
		name: "G",
		rgb: [255, 248, 220],
		weight: 0.09,
		rMin: 0.4,
		rMax: 0.9,
		aMin: 0.3,
		aMax: 0.65
	},
	{
		name: "K",
		rgb: [255, 220, 160],
		weight: 0.2,
		rMin: 0.3,
		rMax: 0.7,
		aMin: 0.18,
		aMax: 0.5
	},
	{
		name: "M",
		rgb: [255, 190, 140],
		weight: 0.643,
		rMin: 0.2,
		rMax: 0.55,
		aMin: 0.1,
		aMax: 0.38
	}
]);

/** CSS properties applied to both ring wrapper elements */
const RING_TRANSFORM = Object.freeze({
	width: "532px",
	height: "130px",
	transform: "translate(-50%,-50%) rotateX(74deg)"
});

/** Named planet presets */
const PALETTES = Object.freeze([
	Object.freeze({
		name: "Ocean",
		A: "#87ceeb",
		B: "#0000ff",
		C: "#000820",
		atm: "#66aaff",
		ring: "#7088bb"
	}),
	Object.freeze({
		name: "Inferno",
		A: "#ffbb66",
		B: "#cc1100",
		C: "#1a0000",
		atm: "#ff8844",
		ring: "#cc4400"
	}),
	Object.freeze({
		name: "Verdant",
		A: "#aaff88",
		B: "#007730",
		C: "#001208",
		atm: "#88ffaa",
		ring: "#44aa55"
	}),
	Object.freeze({
		name: "Amethyst",
		A: "#ddaaff",
		B: "#5500cc",
		C: "#0d0022",
		atm: "#cc88ff",
		ring: "#9955cc"
	}),
	Object.freeze({
		name: "Arctic",
		A: "#eef8ff",
		B: "#3399cc",
		C: "#002244",
		atm: "#aaddff",
		ring: "#88bbdd"
	}),
	Object.freeze({
		name: "Ember",
		A: "#ffddaa",
		B: "#991100",
		C: "#1f0600",
		atm: "#ffaa66",
		ring: "#bb5522"
	}),
	Object.freeze({
		name: "Toxic",
		A: "#ddff44",
		B: "#336600",
		C: "#050d00",
		atm: "#aaff22",
		ring: "#558800"
	}),
	Object.freeze({
		name: "Vexor",
		A: "#88ccff",
		B: "#110033",
		C: "#000008",
		atm: "#4466cc",
		ring: "#334488"
	})
]);

/** Hue anchors used when generating random planets */
const RANDOM_HUES = Object.freeze([
	0,
	30,
	60,
	120,
	180,
	210,
	240,
	270,
	300,
	330
]);

// ╔══════════════════════════════════════════════════════╗
// ║  2. UTILITIES                                        ║
// ╚══════════════════════════════════════════════════════╝

/** getElementById shorthand */
const $ = (id) => document.getElementById(id);

/** Hex color string → "r,g,b" for use in rgba() templates */
const rgb = (hex) =>
	`${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(
		hex.slice(5, 7),
		16
	)}`;

/** Linear interpolation */
const lerp = (a, b, t) => a + (b - a) * t;

/** Uniform random integer in [min, max] inclusive */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Resolve a CSS color-mix() expression to an actual rgb() string.
 * Uses a hidden 1×1 div so the browser does the oklch math for us.
 */
const _mixer = (() => {
	const el = document.createElement("div");
	el.style.cssText =
		"position:fixed;width:1px;height:1px;top:-20px;left:-20px;pointer-events:none;opacity:0;";
	document.body.appendChild(el);
	return el;
})();

const computeMix = (a, b, pct) => {
	_mixer.style.background = `color-mix(in oklch, ${a}, ${b} ${pct}%)`;
	return getComputedStyle(_mixer).backgroundColor;
};

/**
 * Sample a vivid color from oklch space and return a hex string.
 * Works by rendering one pixel on a hidden canvas and reading it back.
 */
function randomOklchHex(L, C, H) {
	const c2 = document.createElement("canvas");
	c2.width = c2.height = 1;
	const ctx2 = c2.getContext("2d");
	ctx2.fillStyle = `oklch(${L} ${C} ${H})`;
	ctx2.fillRect(0, 0, 1, 1);
	const d = ctx2.getImageData(0, 0, 1, 1).data;
	return (
		"#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("")
	);
}

// ╔══════════════════════════════════════════════════════╗
// ║  3. STATE                                            ║
// ╚══════════════════════════════════════════════════════╝

/** Single mutable state object — mutate via direct assignment then call render() */
const S = {
	// base colors
	colorA: "#87ceeb",
	colorB: "#0000ff",
	colorC: "#000820",
	colorAtm: "#66aaff",
	colorRing: "#7088bb",
	// color-mix B% per stop
	p1: 80,
	p2: 10,
	p3: 20,
	p4: 80,
	p5: 50,
	// radial-gradient stop positions
	s1: 19,
	s3: 55,
	s4: 70,
	// atmosphere & glow strengths (0–100)
	atmO: 55,
	glowO: 45,
	// rings
	rings: true,
	rO: 50,
	// moon
	moon: true,
	moonSize: 18,
	moonR: 210,
	moonSpd: 100,
	// auto-cycle
	cycle: false,
	cycleInt: 6,
	// ui
	activePal: 0
};

// ╔══════════════════════════════════════════════════════╗
// ║  4. HISTORY (UNDO)                                   ║
// ╚══════════════════════════════════════════════════════╝

const history = [];
let historyIndex = -1;

function snapshotState() {
	return Object.assign({}, S);
}

function pushHistory() {
	if (historyIndex < history.length - 1) {
		history.splice(historyIndex + 1); // drop any redo states
	}
	history.push(snapshotState());
	if (history.length > CONFIG.HISTORY_LIMIT) history.shift();
	historyIndex = history.length - 1;
	updateUndoDots();
}

function undoHistory() {
	if (historyIndex <= 0) {
		showToast("Nothing to undo");
		return;
	}
	historyIndex--;
	Object.assign(S, history[historyIndex]);
	syncInputsFromState();
	render();
	updateUndoDots();
	showToast("↩ Undone");
}

function updateUndoDots() {
	const el = $("undoDots");
	el.innerHTML = "";
	const n = Math.min(history.length, CONFIG.HISTORY_LIMIT);
	for (let i = 0; i < n; i++) {
		const d = document.createElement("div");
		d.className =
			"undo-dot" +
			(i < historyIndex ? " filled" : "") +
			(i === historyIndex ? " current" : "");
		el.appendChild(d);
	}
}

/** Push all state values back into the corresponding form controls */
function syncInputsFromState() {
	const pairs = [
		["pickA", S.colorA],
		["pickB", S.colorB],
		["pickC", S.colorC],
		["pickAtm", S.colorAtm],
		["pickRing", S.colorRing],
		["sl1", S.p1],
		["sl2", S.p2],
		["sl3", S.p3],
		["sl4", S.p4],
		["sl5", S.p5],
		["slS1", S.s1],
		["slS3", S.s3],
		["slS4", S.s4],
		["slAtmO", S.atmO],
		["slGlowO", S.glowO],
		["slRO", S.rO],
		["slMoonSize", S.moonSize],
		["slMoonR", S.moonR],
		["slMoonSpd", S.moonSpd],
		["slCycleInt", S.cycleInt]
	];
	pairs.forEach(([id, val]) => {
		const el = $(id);
		if (el) el.value = val;
	});

	$("tglRings").classList.toggle("on", S.rings);
	$("tglMoon").classList.toggle("on", S.moon);
	$("tglCycle").classList.toggle("on", S.cycle);
	document
		.querySelectorAll(".pal-btn")
		.forEach((b, j) => b.classList.toggle("active", j === S.activePal));
}

// ╔══════════════════════════════════════════════════════╗
// ║  5. STAR CANVAS                                      ║
// ╚══════════════════════════════════════════════════════╝

const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

// Canvas-level mutable state — only modified by init/resize
let W, H;
let stars = [];
let shooters = [];
let constellations = [];
let mwCanvas = null; // offscreen Milky Way — declared here to avoid TDZ

// ── Spectral class CDF (built once from SPECTRAL weights) ──────────────────
const SPECTRAL_CDF = (() => {
	let cum = 0;
	return SPECTRAL.map((s) => ({ ...s, cdf: (cum += s.weight) }));
})();

/** Draw a spectral class from the IMF-weighted distribution */
function pickSpectral() {
	const r = Math.random();
	return SPECTRAL_CDF.find((s) => r <= s.cdf) ?? SPECTRAL_CDF.at(-1);
}

// ── Canvas resize ──────────────────────────────────────────────────────────
const resizeCanvas = () => {
	W = canvas.width = window.innerWidth;
	H = canvas.height = window.innerHeight;
	initStars();
	buildMilkyWay();
};
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // initial call

// ── Star field generation ──────────────────────────────────────────────────
function initStars() {
	const count = Math.floor((W * H) / CONFIG.STAR_DENSITY);

	// Milky Way membership test — diagonal band across the sky
	const mwAngle = Math.PI * 0.18;
	const mwSin = Math.sin(mwAngle);
	const mwCos = Math.cos(mwAngle);
	const mwWidth = Math.max(W, H) * 0.28;
	const mwCx = W * 0.3;
	const mwCy = H * 0.4;

	const inMilkyWay = (x, y) =>
		Math.abs((x - mwCx) * mwSin - (y - mwCy) * mwCos) < mwWidth;

	stars = [];

	// Base field
	for (let i = 0; i < count; i++) {
		const sp = pickSpectral();
		const t = Math.random();
		stars.push(
			makeStar(
				Math.random() * W,
				Math.random() * H,
				sp,
				lerp(sp.rMin, sp.rMax, t),
				lerp(sp.aMin, sp.aMax, Math.pow(Math.random(), 1.6)) // bias toward dim end
			)
		);
	}

	// Extra Milky Way stars — smaller and fainter, rejected outside the band
	const mwCount = Math.floor(count * 0.35);
	for (let i = 0; i < mwCount; i++) {
		const x = Math.random() * W;
		const y = Math.random() * H;
		if (!inMilkyWay(x, y)) continue;
		const sp = pickSpectral();
		stars.push(
			makeStar(
				x,
				y,
				sp,
				lerp(sp.rMin, sp.rMin * 1.3, Math.random()),
				lerp(sp.aMin * 0.5, sp.aMin * 1.4, Math.random())
			)
		);
	}

	buildConstellations();
}

/**
 * Create a single star object.
 * Twinkle uses three independent oscillators at irrational frequency ratios
 * so the combined waveform is never periodic — produces natural irregularity.
 */
function makeStar(x, y, sp, r, baseAlpha) {
	const f1 = 0.003 + Math.random() * 0.012;
	return {
		x,
		y,
		r,
		sp,
		baseAlpha,
		alpha: baseAlpha,
		// Three-oscillator twinkle (ratios ≈ 1 : φ : √5+1)
		f1,
		f2: f1 * 1.618 + Math.random() * 0.004,
		f3: f1 * 2.414 + Math.random() * 0.003,
		ph1: Math.random() * Math.PI * 2,
		ph2: Math.random() * Math.PI * 2,
		ph3: Math.random() * Math.PI * 2,
		// Twinkle depth scales with radius (faint stars barely vary)
		tw: lerp(0.06, 0.28, Math.min(1, r / 1.4)),
		// Scintillation jitter (atmospheric shimmer) for bright stars only
		scint: r > 1.1 ? 0.4 + Math.random() * 0.5 : 0,
		jx: 0,
		jy: 0
	};
}

// ── Constellation lines ────────────────────────────────────────────────────
function buildConstellations() {
	const bright = stars.filter(
		(s) => s.baseAlpha > CONFIG.CONST_STAR_MIN_BRIGHT && s.r > 0.75
	);
	constellations = [];
	const used = new Set();

	bright.forEach((s, i) => {
		if (used.has(i)) return;
		const neighbors = bright
			.map((t, j) => ({ j, d: Math.hypot(t.x - s.x, t.y - s.y) }))
			.filter(({ j, d }) => j !== i && !used.has(j) && d > 50 && d < 180)
			.sort((a, b) => a.d - b.d)
			.slice(0, Math.random() < 0.28 ? 2 : 1);

		neighbors.forEach(({ j }) => {
			constellations.push([s, bright[j]]);
			used.add(j);
		});
	});
}

// ── Milky Way (offscreen, rebuilt on resize) ───────────────────────────────
function buildMilkyWay() {
	mwCanvas = document.createElement("canvas");
	mwCanvas.width = W;
	mwCanvas.height = H;
	const mc = mwCanvas.getContext("2d");
	const cx = W * 0.3;
	const cy = H * 0.4;
	const len = Math.sqrt(W * W + H * H);

	mc.save();
	mc.translate(cx, cy);
	mc.rotate(Math.PI * 0.18);

	// Three overlapping gaussian-profile strips from narrow bright core to wide dim halo
	const strips = [
		{ w: len * 0.25, alpha: CONFIG.MW_OPACITY * 0.8 },
		{ w: len * 0.12, alpha: CONFIG.MW_OPACITY * 1.0 },
		{ w: len * 0.05, alpha: CONFIG.MW_OPACITY * 0.5 }
	];
	strips.forEach(({ w, alpha }) => {
		const grad = mc.createLinearGradient(0, -w, 0, w);
		grad.addColorStop(0, `rgba(180,195,230,0)`);
		grad.addColorStop(0.3, `rgba(180,195,230,${alpha * 0.4})`);
		grad.addColorStop(0.5, `rgba(200,210,240,${alpha})`);
		grad.addColorStop(0.7, `rgba(180,195,230,${alpha * 0.4})`);
		grad.addColorStop(1, `rgba(180,195,230,0)`);
		mc.fillStyle = grad;
		mc.fillRect(-len, -w, len * 2, w * 2);
	});
	mc.restore();
}

// ── Meteor spawner ─────────────────────────────────────────────────────────
function spawnShooter() {
	const angle = (Math.random() * 0.5 + 0.1) * Math.PI; // ~18°–90° from horizontal
	const speed = Math.random() * 3.5 + 2.5;
	// Tint: occasional orange bolide or green ablation, mostly neutral blue-white
	const tint =
		Math.random() < 0.12
			? [255, 200, 120]
			: Math.random() < 0.06
			? [180, 255, 200]
			: [220, 235, 255];
	shooters.push({
		x: Math.random() * W,
		y: Math.random() * H * 0.45,
		vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1),
		vy: Math.sin(angle) * speed * 0.55,
		len: Math.random() * 100 + 70,
		life: 1,
		decay: Math.random() * 0.01 + 0.007,
		tint,
		width: Math.random() * 0.8 + 0.8
	});
}

setInterval(() => {
	if (Math.random() < CONFIG.SHOOT_CHANCE) spawnShooter();
}, CONFIG.SHOOT_INTERVAL);

// ── Main animation loop ────────────────────────────────────────────────────
let t = 0;
function animateStars() {
	ctx.clearRect(0, 0, W, H);
	t += 0.016;

	if (mwCanvas) ctx.drawImage(mwCanvas, 0, 0);

	// Constellation lines — alpha pulses gently with the brighter endpoint
	constellations.forEach(([a, b]) => {
		const fade =
			0.3 + 0.7 * Math.max(a.alpha / a.baseAlpha, b.alpha / b.baseAlpha);
		ctx.beginPath();
		ctx.moveTo(a.x + a.jx, a.y + a.jy);
		ctx.lineTo(b.x + b.jx, b.y + b.jy);
		ctx.strokeStyle = `rgba(180,200,255,${CONFIG.CONST_LINE_OPACITY * fade})`;
		ctx.lineWidth = 0.5;
		ctx.stroke();
	});

	stars.forEach((s) => {
		// Beat between three oscillators → aperiodic flicker
		const tw =
			s.tw *
			(0.45 * Math.sin(t * s.f1 * 60 + s.ph1) +
				0.35 * Math.sin(t * s.f2 * 60 + s.ph2) +
				0.2 * Math.sin(t * s.f3 * 60 + s.ph3));
		s.alpha = Math.max(0.02, s.baseAlpha * (1 + tw));

		if (s.scint > 0) {
			s.jx = (Math.random() - 0.5) * s.scint;
			s.jy = (Math.random() - 0.5) * s.scint;
		}

		const px = s.x + s.jx,
			py = s.y + s.jy;
		const [r, g, b2] = s.sp.rgb;

		// Core disc
		ctx.beginPath();
		ctx.arc(px, py, s.r, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(${r},${g},${b2},${s.alpha})`;
		ctx.fill();

		// Soft glow (all stars above 0.65 px)
		if (s.r > 0.65) {
			const glowR = s.r * (4 + s.r * 2);
			const glowA = s.alpha * s.r * 0.18;
			const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
			glow.addColorStop(0, `rgba(${r},${g},${b2},${glowA})`);
			glow.addColorStop(1, `rgba(${r},${g},${b2},0)`);
			ctx.beginPath();
			ctx.arc(px, py, glowR, 0, Math.PI * 2);
			ctx.fillStyle = glow;
			ctx.fill();
		}

		// 4-point diffraction spikes (bright stars only, fade in smoothly)
		if (s.r > 1.1) {
			const spikeStrength = Math.max(
				0,
				(s.alpha - s.baseAlpha * 0.7) / (s.baseAlpha * 0.3)
			);
			if (spikeStrength > 0.01) {
				const spikeLen = s.r * 5 * spikeStrength;
				const spikeA = spikeStrength * s.alpha * 0.35;
				[
					[1, 0],
					[0, 1],
					[-1, 0],
					[0, -1]
				].forEach(([dx, dy]) => {
					const sg = ctx.createLinearGradient(
						px,
						py,
						px + dx * spikeLen,
						py + dy * spikeLen
					);
					sg.addColorStop(0, `rgba(${r},${g},${b2},${spikeA})`);
					sg.addColorStop(0.5, `rgba(${r},${g},${b2},${spikeA * 0.3})`);
					sg.addColorStop(1, `rgba(${r},${g},${b2},0)`);
					ctx.beginPath();
					ctx.moveTo(px, py);
					ctx.lineTo(px + dx * spikeLen, py + dy * spikeLen);
					ctx.strokeStyle = sg;
					ctx.lineWidth = 0.7;
					ctx.stroke();
				});
			}
		}
	});

	// Meteors
	shooters = shooters.filter((s) => s.life > 0);
	shooters.forEach((s) => {
		s.vx *= 0.997;
		s.vy *= 0.997; // deceleration (ionisation drag)
		s.x += s.vx;
		s.y += s.vy;
		s.life -= s.decay;

		const spd = Math.hypot(s.vx, s.vy);
		const nx = s.vx / spd,
			ny = s.vy / spd;
		const [tr, tg, tb] = s.tint;

		const tail = ctx.createLinearGradient(
			s.x,
			s.y,
			s.x - nx * s.len,
			s.y - ny * s.len
		);
		tail.addColorStop(0, `rgba(${tr},${tg},${tb},${s.life * 0.85})`);
		tail.addColorStop(0.15, `rgba(220,235,255,${s.life * 0.55})`);
		tail.addColorStop(0.45, `rgba(180,210,255,${s.life * 0.2})`);
		tail.addColorStop(1, `rgba(180,210,255,0)`);
		ctx.beginPath();
		ctx.moveTo(s.x, s.y);
		ctx.lineTo(s.x - nx * s.len, s.y - ny * s.len);
		ctx.strokeStyle = tail;
		ctx.lineWidth = s.width;
		ctx.stroke();

		// Head: tight white core + tinted bloom
		const hBloom = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 6);
		hBloom.addColorStop(0, `rgba(255,255,255,${s.life * 0.9})`);
		hBloom.addColorStop(0.4, `rgba(${tr},${tg},${tb},${s.life * 0.4})`);
		hBloom.addColorStop(1, "rgba(180,210,255,0)");
		ctx.beginPath();
		ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
		ctx.fillStyle = hBloom;
		ctx.fill();
	});

	requestAnimationFrame(animateStars);
}

animateStars();

// ╔══════════════════════════════════════════════════════╗
// ║  6. MOON ANIMATION                                   ║
// ╚══════════════════════════════════════════════════════╝

const moonEl = $("moon");
const moonOrbitEl = $("moonOrbit");
let moonAngle = 0;
let moonLastTime = performance.now();

function animateMoon(now) {
	const dt = now - moonLastTime;
	moonLastTime = now;

	if (S.moon) {
		moonAngle +=
			(dt / (CONFIG.MOON_BASE_PERIOD / (S.moonSpd / 100))) * Math.PI * 2;

		// Elliptical orbit projected onto 2D plane
		const cx = S.moonR * Math.cos(moonAngle);
		const cy = S.moonR * 0.35 * Math.sin(moonAngle);
		const size = S.moonSize;

		moonEl.style.width = size + "px";
		moonEl.style.height = size + "px";
		moonEl.style.left = S.moonR + cx - size / 2 + "px";
		moonEl.style.top = S.moonR + cy - size / 2 + "px";

		// Tint moon body from colorA
		const [mr, mg, mb2] = [1, 3, 5].map((o) =>
			parseInt(S.colorA.slice(o, o + 2), 16)
		);
		const mc = `rgb(${Math.round(mr * 0.6 + 120)},${Math.round(
			mg * 0.6 + 120
		)},${Math.round(mb2 * 0.6 + 120)})`;
		moonEl.style.background = `radial-gradient(circle at 35% 30%, ${mc}, rgba(80,90,110,0.9))`;
		moonEl.style.boxShadow = `0 0 ${Math.round(size * 0.6)}px rgba(${rgb(
			S.colorA
		)},0.3)`;

		// z-index: passes behind planet on top half of orbit (sin > 0 = front)
		moonEl.style.zIndex = Math.sin(moonAngle) > 0 ? "2" : "6";

		const orbitDiam = S.moonR * 2;
		moonOrbitEl.style.width = orbitDiam + "px";
		moonOrbitEl.style.height = Math.round(orbitDiam * 0.35) + "px";
		moonOrbitEl.style.margin = `-${S.moonR}px -${S.moonR}px`;
		moonOrbitEl.classList.remove("hidden");
	} else {
		moonOrbitEl.classList.add("hidden");
	}

	requestAnimationFrame(animateMoon);
}
requestAnimationFrame(animateMoon);

// ╔══════════════════════════════════════════════════════╗
// ║  7. AUTO-CYCLE                                       ║
// ╚══════════════════════════════════════════════════════╝

let cycleTimer = null;

function startCycle() {
	stopCycle();
	cycleTimer = setInterval(() => {
		const next = (S.activePal + 1) % PALETTES.length;
		applyPalette(next);
		render();
	}, S.cycleInt * 1000);
}

function stopCycle() {
	if (cycleTimer) {
		clearInterval(cycleTimer);
		cycleTimer = null;
	}
}

// ╔══════════════════════════════════════════════════════╗
// ║  8. RENDER                                           ║
// ╚══════════════════════════════════════════════════════╝

function render() {
	const {
		colorA: A,
		colorB: B,
		colorC: C,
		colorAtm: ATM,
		colorRing: RNG,
		p1,
		p2,
		p3,
		p4,
		p5,
		s1,
		s3,
		s4,
		atmO,
		glowO,
		rings,
		rO
	} = S;

	const s2 = Math.min(s1 + 1, s1 + 2);

	// Planet surface gradient
	$("planetSurface").style.background = `radial-gradient(at 50% 50% in oklch,
    color-mix(in oklch,${A},${B} ${p1}%),
    color-mix(in oklch,${A},${B} ${p2}%) ${s1}%,
    color-mix(in oklch,${A},${B} ${p3}%) ${s2}%,
    color-mix(in oklch,${A},${B} ${p4}%),
    color-mix(in oklch,${B},${C} ${p5}%) ${s3}%,
    transparent ${s4}%)`;

	// Drop shadow
	$("planet").style.filter = `drop-shadow(0 0 40px rgba(${rgb(
		A
	)},0.55)) drop-shadow(0 0 80px rgba(${rgb(A)},0.18))`;

	// Atmosphere rim
	const rim = $("atmRim");
	rim.style.inset = "-14px";
	rim.style.background = `radial-gradient(circle,
    transparent 44%,
    rgba(${rgb(ATM)},${(atmO / 100) * 0.75}) 50%,
    transparent 60%)`;

	// Outer glow bloom
	const ga = (glowO / 100) * 0.22;
	$(
		"glowOuter"
	).style.cssText += `width:540px;height:540px;background:radial-gradient(circle,
    rgba(${rgb(A)},${ga}),
    rgba(${rgb(B)},${ga * 0.45}) 45%,
    transparent 70%)`;

	// Nebula background tint
	$("nebula").style.background = `radial-gradient(circle, rgba(${rgb(
		B
	)},0.18) 0%, transparent 65%)`;

	// Rings
	["ringsBack", "ringsFront"].forEach((id) => {
		const rw = $(id);
		rw.style.display = rings ? "block" : "none";
		Object.assign(rw.style, RING_TRANSFORM);
	});
	["r1b", "r1f"].forEach(
		(id) => ($(id).style.borderColor = `rgba(${rgb(RNG)},${(rO / 100) * 0.9})`)
	);
	["r2b", "r2f"].forEach(
		(id) => ($(id).style.borderColor = `rgba(${rgb(RNG)},${(rO / 100) * 0.45})`)
	);
	["r3b", "r3f"].forEach(
		(id) => ($(id).style.borderColor = `rgba(${rgb(RNG)},${(rO / 100) * 0.18})`)
	);

	// Panel color swatches
	$("swA").style.background = A;
	$("swB").style.background = B;
	$("swC").style.background = C;
	$("swAtm").style.background = ATM;
	$("swRing").style.background = RNG;

	// A→B oklch mix strip
	$("mixStrip").style.background = `linear-gradient(to right,
    ${computeMix(A, B, 0)}, ${computeMix(A, B, 25)},
    ${computeMix(A, B, 50)}, ${computeMix(A, B, 75)},
    ${computeMix(A, B, 100)})`;

	// Per-stop colour swatches
	$("sw1").style.background = computeMix(A, B, p1);
	$("sw2").style.background = computeMix(A, B, p2);
	$("sw3").style.background = computeMix(A, B, p3);
	$("sw4").style.background = computeMix(A, B, p4);
	$("sw5").style.background = computeMix(B, C, p5);

	// Numeric value labels
	const labels = {
		v1: `${p1}%`,
		v2: `${p2}%`,
		v3: `${p3}%`,
		v4: `${p4}%`,
		v5: `${p5}%`,
		vS1: `${s1}%`,
		vS3: `${s3}%`,
		vS4: `${s4}%`,
		vAtmO: `${atmO}%`,
		vGlowO: `${glowO}%`,
		vRO: `${rO}%`,
		vMoonSize: `${S.moonSize}`,
		vMoonR: `${S.moonR}`,
		vMoonSpd: `${(S.moonSpd / 100).toFixed(1)}×`,
		vCycleInt: `${S.cycleInt}s`
	};
	Object.entries(labels).forEach(([id, val]) => {
		const e = $(id);
		if (e) e.textContent = val;
	});

	// Live code pill tokens
	["cA", "cA2", "cA3", "cA4"].forEach((id) => ($(id).textContent = A));
	["cB", "cB2", "cB3", "cB4", "cB5"].forEach((id) => ($(id).textContent = B));
	$("cC").textContent = C;
	$("cp1").textContent = p1 + "%";
	$("cp2").textContent = p2 + "%";
	$("cp3").textContent = p3 + "%";
	$("cp4").textContent = p4 + "%";
	$("cp5").textContent = p5 + "%";
	$("cs1").textContent = s1 + "%";
	$("cs2").textContent = s2 + "%";
	$("cs3").textContent = s3 + "%";
	$("cs4").textContent = s4 + "%";
}

// ╔══════════════════════════════════════════════════════╗
// ║  9. ACTIONS (export / randomize / toast)             ║
// ╚══════════════════════════════════════════════════════╝

function exportCSS() {
	const { colorA: A, colorB: B, colorC: C, p1, p2, p3, p4, p5, s1, s3, s4 } = S;
	const s2 = Math.min(s1 + 1, s1 + 2);
	const css = `/* Terraform · oklch Planet Lab export */
background: radial-gradient(at 50% 50% in oklch,
  color-mix(in oklch, ${A}, ${B} ${p1}%),
  color-mix(in oklch, ${A}, ${B} ${p2}%) ${s1}%,
  color-mix(in oklch, ${A}, ${B} ${p3}%) ${s2}%,
  color-mix(in oklch, ${A}, ${B} ${p4}%),
  color-mix(in oklch, ${B}, ${C} ${p5}%) ${s3}%,
  transparent ${s4}%
);`;
	navigator.clipboard
		.writeText(css)
		.then(() => {
			showToast('<span class="t-hi">CSS</span> copied to clipboard');
			const btn = $("pillCopy");
			btn.textContent = "✓ copied";
			btn.classList.add("copied");
			setTimeout(() => {
				btn.textContent = "copy";
				btn.classList.remove("copied");
			}, 2000);
		})
		.catch(() => showToast("Copy failed — try Ctrl+C"));
}

function randomize() {
	pushHistory();

	const hA = RANDOM_HUES[randInt(0, RANDOM_HUES.length - 1)];
	const hB = (hA + randInt(60, 200)) % 360;
	const hC = (hB + randInt(20, 80)) % 360;

	S.colorA = randomOklchHex(
		0.75 + Math.random() * 0.2,
		0.18 + Math.random() * 0.12,
		hA
	);
	S.colorB = randomOklchHex(
		0.25 + Math.random() * 0.2,
		0.2 + Math.random() * 0.15,
		hB
	);
	S.colorC = randomOklchHex(
		0.05 + Math.random() * 0.1,
		0.05 + Math.random() * 0.06,
		hC
	);
	S.colorAtm = randomOklchHex(
		0.65 + Math.random() * 0.2,
		0.18 + Math.random() * 0.1,
		hA
	);
	S.colorRing = randomOklchHex(
		0.45 + Math.random() * 0.2,
		0.1 + Math.random() * 0.1,
		hB
	);

	S.p1 = randInt(55, 95);
	S.p2 = randInt(5, 25);
	S.p3 = randInt(15, 35);
	S.p4 = randInt(55, 95);
	S.p5 = randInt(30, 70);
	S.s1 = randInt(10, 35);
	S.s3 = randInt(40, 72);
	S.s4 = randInt(62, 88);
	S.activePal = -1;

	syncInputsFromState();
	document
		.querySelectorAll(".pal-btn")
		.forEach((b) => b.classList.remove("active"));
	render();
	showToast("✦ New world generated");
}

let toastTimer = null;
function showToast(msg) {
	const el = $("toast");
	el.innerHTML = msg;
	el.classList.add("show");
	if (toastTimer) clearTimeout(toastTimer);
	toastTimer = setTimeout(
		() => el.classList.remove("show"),
		CONFIG.TOAST_DURATION
	);
}

// ╔══════════════════════════════════════════════════════╗
// ║  10. PALETTE UI                                      ║
// ╚══════════════════════════════════════════════════════╝

function applyPalette(i) {
	const p = PALETTES[i];
	S.colorA = p.A;
	S.colorB = p.B;
	S.colorC = p.C;
	S.colorAtm = p.atm;
	S.colorRing = p.ring;
	S.activePal = i;
	["pickA", "pickB", "pickC", "pickAtm", "pickRing"].forEach(
		(id, k) => ($(id).value = [p.A, p.B, p.C, p.atm, p.ring][k])
	);
	document
		.querySelectorAll(".pal-btn")
		.forEach((b, j) => b.classList.toggle("active", j === i));
}

// Build palette button grid
const grid = $("paletteGrid");
PALETTES.forEach((p, i) => {
	const btn = document.createElement("button");
	btn.className = "pal-btn" + (i === 0 ? " active" : "");
	btn.dataset.i = i;

	const dot = document.createElement("span");
	dot.className = "pal-dot";
	dot.style.background = `radial-gradient(circle at 35% 30% in oklch,
      ${p.A}, ${p.B} 60%, color-mix(in oklch,${p.B},${p.C} 60%))`;

	btn.appendChild(dot);
	btn.appendChild(document.createTextNode(p.name));
	btn.addEventListener("click", () => {
		pushHistory();
		applyPalette(i);
		render();
	});
	grid.appendChild(btn);
});

// ╔══════════════════════════════════════════════════════╗
// ║  11. CONTROL WIRING                                  ║
// ╚══════════════════════════════════════════════════════╝

const COLOR_KEYS = new Set([
	"colorA",
	"colorB",
	"colorC",
	"colorAtm",
	"colorRing"
]);

/**
 * Bind a form input to a state key.
 * @param {string}   id      - element id
 * @param {string}   key     - key in S
 * @param {Function} coerce  - value transform (default: identity)
 */
function wire(id, key, coerce = (v) => v) {
	const el = $(id);
	if (!el) return;
	el.addEventListener("input", () => {
		S[key] = coerce(el.value);
		if (COLOR_KEYS.has(key))
			document
				.querySelectorAll(".pal-btn")
				.forEach((b) => b.classList.remove("active"));
		render();
	});
	el.addEventListener("change", pushHistory); // snapshot on commit, not on every tick
}

// Colors
wire("pickA", "colorA");
wire("pickB", "colorB");
wire("pickC", "colorC");
wire("pickAtm", "colorAtm");
wire("pickRing", "colorRing");

// Gradient mix percentages
wire("sl1", "p1", Number);
wire("sl2", "p2", Number);
wire("sl3", "p3", Number);
wire("sl4", "p4", Number);
wire("sl5", "p5", Number);

// Stop positions
wire("slS1", "s1", Number);
wire("slS3", "s3", Number);
wire("slS4", "s4", Number);

// Atmosphere & glow
wire("slAtmO", "atmO", Number);
wire("slGlowO", "glowO", Number);
wire("slRO", "rO", Number);

// Moon
wire("slMoonSize", "moonSize", Number);
wire("slMoonR", "moonR", Number);
wire("slMoonSpd", "moonSpd", Number);

// Cycle interval (also restarts the timer if active)
wire("slCycleInt", "cycleInt", (v) => {
	const n = Number(v);
	if (S.cycle) startCycle();
	return n;
});

// Toggles
const tglRings = $("tglRings");
tglRings.addEventListener("click", () => {
	S.rings = !S.rings;
	tglRings.classList.toggle("on", S.rings);
	pushHistory();
	render();
});

const tglMoon = $("tglMoon");
tglMoon.addEventListener("click", () => {
	S.moon = !S.moon;
	tglMoon.classList.toggle("on", S.moon);
	render();
});

const tglCycle = $("tglCycle");
tglCycle.addEventListener("click", () => {
	S.cycle = !S.cycle;
	tglCycle.classList.toggle("on", S.cycle);
	if (S.cycle) {
		startCycle();
		showToast("▶ Auto-cycle on");
	} else {
		stopCycle();
		showToast("■ Auto-cycle off");
	}
});

// Toolbar & pill
$("btnRandom").addEventListener("click", randomize);
$("btnUndo").addEventListener("click", undoHistory);
$("btnExport").addEventListener("click", exportCSS);
$("pillCopy").addEventListener("click", exportCSS);

// Planet click wobble
$("planet").addEventListener("click", () => {
	const p = $("planet");
	p.classList.remove("wobble");
	void p.offsetWidth; // force reflow to restart animation
	p.classList.add("wobble");
	setTimeout(() => p.classList.remove("wobble"), 520);
});

// ╔══════════════════════════════════════════════════════╗
// ║  12. KEYBOARD SHORTCUTS                              ║
// ╚══════════════════════════════════════════════════════╝

// Defined after all handlers so every reference is in scope
const SHORTCUTS = Object.freeze({
	r: randomize,
	e: exportCSS,
	t: () => tglRings.click(),
	m: () => tglMoon.click(),
	ArrowRight: () => {
		const next = ((S.activePal >= 0 ? S.activePal : 0) + 1) % PALETTES.length;
		pushHistory();
		applyPalette(next);
		render();
		showToast(`◀▶ ${PALETTES[next].name}`);
	},
	ArrowLeft: () => {
		const prev =
			((S.activePal >= 0 ? S.activePal : 0) - 1 + PALETTES.length) %
			PALETTES.length;
		pushHistory();
		applyPalette(prev);
		render();
		showToast(`◀▶ ${PALETTES[prev].name}`);
	}
});

document.addEventListener("keydown", (e) => {
	if (e.target.tagName === "INPUT") return;

	if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
		e.preventDefault();
		undoHistory();
		return;
	}

	const handler = SHORTCUTS[e.key] ?? SHORTCUTS[e.key.toLowerCase()];
	if (handler) handler();
});

// ╔══════════════════════════════════════════════════════╗
// ║  13. BOOT                                            ║
// ╚══════════════════════════════════════════════════════╝

pushHistory(); // capture initial state as first undo snapshot
render();
