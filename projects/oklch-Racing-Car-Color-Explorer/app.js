const RING_CX = 70,
	RING_CY = 70,
	RING_R = 52,
	RING_W = 14,
	SEGS = 72;
const CAR_W = 26,
	CAR_H = 37;
const MAX_TRAIL = 900;
const SPEED = 1.4; // px per frame
const MAX_FIRE = 220;

// fire particle pool
const fire = [];

const HUE_FACTS = [
	{
		range: [0, 60],
		head: "RED ZONE",
		body:
			"oklch reds stay vivid without the brightness drop HSL shows at full saturation."
	},
	{
		range: [60, 120],
		head: "GOLDEN APEX",
		body:
			"Yellows stay controlled. HSL blows out here — oklch keeps them perceptually even."
	},
	{
		range: [120, 180],
		head: "GREEN SECTOR",
		body:
			"Perceptually the brightest zone — same chroma value looks most vivid in greens."
	},
	{
		range: [180, 240],
		head: "CYAN STRAIGHT",
		body:
			"Clean cyans at low chroma become the most refined neutrals for UI work."
	},
	{
		range: [240, 300],
		head: "BLUE CORNER",
		body:
			"Blues that match your reds in perceived brightness. That's the oklch magic."
	},
	{
		range: [300, 360],
		head: "PURPLE CHICANE",
		body:
			"Where HSL falls apart. oklch keeps purples perfectly balanced and usable."
	}
];

// ── State ─────────────────────────────────────────
const state = { l: 0.6, c: 0.2 };
let lastFactH = -1;
let t = 0;
const trail = [];

// canvas
const canvas = document.getElementById("wave-canvas");
const ctx = canvas.getContext("2d");

function resize() {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// ── DOM ───────────────────────────────────────────
const root = document.documentElement;
const ringSvg = document.getElementById("ring-svg");
const ringHandle = document.getElementById("ring-handle");
const hueSegs = document.getElementById("hue-segs");
const rValue = document.getElementById("r-value");
const fHead = document.getElementById("f-head");
const fBody = document.getElementById("f-body");
const slL = document.getElementById("sl-l");
const slC = document.getElementById("sl-c");
const lblL = document.getElementById("lbl-l");
const lblC = document.getElementById("lbl-c");

// ── Build hue ring ────────────────────────────────
for (let i = 0; i < SEGS; i++) {
	const a0 = i * (360 / SEGS);
	const a1 = a0 + 360 / SEGS + 0.7;
	const r = RING_R;
	function pxy(cx, cy, r, deg) {
		const rd = ((deg - 90) * Math.PI) / 180;
		return { x: cx + r * Math.cos(rd), y: cy + r * Math.sin(rd) };
	}
	const s = pxy(RING_CX, RING_CY, r, a0 - 90);
	const e = pxy(RING_CX, RING_CY, r, a1 - 90);
	const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
	el.setAttribute("d", `M${s.x} ${s.y} A${r} ${r} 0 0 1 ${e.x} ${e.y}`);
	el.setAttribute("fill", "none");
	el.setAttribute("stroke", `oklch(0.65 0.20 ${a0})`);
	el.setAttribute("stroke-width", String(RING_W));
	el.setAttribute("stroke-linecap", "butt");
	hueSegs.appendChild(el);
}
function pxy(cx, cy, r, deg) {
	const rd = ((deg - 90) * Math.PI) / 180;
	return { x: cx + r * Math.cos(rd), y: cy + r * Math.sin(rd) };
}

// ── Hue from t ────────────────────────────────────
function hueFromT(t) {
	const W = canvas.width || innerWidth;
	return (((((t * SPEED) / W) * 360) % 360) + 360) % 360;
}

// ── Ring drag — scrubs car position forward/backward ─
let dragging = false;
let prevRingAngle = 0;
let dt = 1; // frames per frame; sign = direction (+1 fwd, -1 rev)
const W_PER_360 = () => (canvas.width || innerWidth) / SPEED; // frames per full revolution

function ringAngleFromPointer(e) {
	const rect = ringSvg.getBoundingClientRect();
	const sc = 140 / rect.width;
	const dx = (e.clientX - rect.left) * sc - RING_CX;
	const dy = (e.clientY - rect.top) * sc - RING_CY;
	return Math.atan2(dy, dx); // raw radians, −π..π
}

function angleDelta(a, b) {
	// shortest signed arc from a to b
	let d = b - a;
	while (d > Math.PI) d -= Math.PI * 2;
	while (d < -Math.PI) d += Math.PI * 2;
	return d;
}

ringSvg.addEventListener("mousedown", (e) => {
	dragging = true;
	prevRingAngle = ringAngleFromPointer(e);
	dt = 0;
});
window.addEventListener("mousemove", (e) => {
	if (!dragging) return;
	const angle = ringAngleFromPointer(e);
	const delta = angleDelta(prevRingAngle, angle);
	const dFrames = Math.max(0, (delta / (Math.PI * 2)) * W_PER_360()); // clamp: no reverse
	t += dFrames;
	dt = dFrames;
	prevRingAngle = angle;
});
window.addEventListener("mouseup", () => {
	if (dragging) {
		dragging = false;
		dt = 1;
	}
});
ringSvg.addEventListener(
	"touchstart",
	(e) => {
		dragging = true;
		prevRingAngle = ringAngleFromPointer(e.touches[0]);
		dt = 0;
		e.preventDefault();
	},
	{ passive: false }
);
window.addEventListener("touchmove", (e) => {
	if (!dragging) return;
	const angle = ringAngleFromPointer(e.touches[0]);
	const delta = angleDelta(prevRingAngle, angle);
	const dFrames = Math.max(0, (delta / (Math.PI * 2)) * W_PER_360());
	t += dFrames;
	dt = dFrames;
	prevRingAngle = angle;
});
window.addEventListener("touchend", () => {
	if (dragging) {
		dragging = false;
		dt = 1;
	}
});

slL.addEventListener("input", () => {
	state.l = slL.value / 100;
	lblL.textContent = state.l.toFixed(2);
});
slC.addEventListener("input", () => {
	state.c = slC.value / 100;
	lblC.textContent = state.c.toFixed(2);
});

// ── Car position on wave ──────────────────────────
function carPos(t) {
	const W = canvas.width || innerWidth;
	const H = canvas.height || innerHeight;
	const cx = canvas.width / 2;
	const cy = canvas.height / 2;

	// primary sine wave
	const freq = 2.2; // how many full waves across screen
	const amp = H * 0.22; // wave height
	// secondary wave for organic S-curve feel
	const amp2 = H * 0.07;
	const freq2 = freq * 2.3;

	const phase = ((t * SPEED) / W) * Math.PI * 2 * freq;
	const x = cx + (t * SPEED - W / 2);
	// wrap x within canvas
	const xw = ((x % W) + W) % W;
	const xn = (xw / W) * Math.PI * 2 * freq;
	const y = cy + amp * Math.sin(xn) + amp2 * Math.sin((xn * freq2) / freq + 0.8);
	const dy =
		amp * Math.cos(xn) * ((Math.PI * 2 * freq) / W) +
		amp2 * Math.cos((xn * freq2) / freq + 0.8) * ((Math.PI * 2 * freq2) / W);
	const heading = Math.atan2(dy, 1);
	return { x: xw, y, heading };
}

// ── Apply CSS vars ────────────────────────────────
function applyCSS(hue) {
	root.style.setProperty("--hue", String(Math.round(hue)));
	root.style.setProperty("--chroma", String(state.c));
	root.style.setProperty("--l", String(state.l));
	rValue.textContent = `oklch(${state.l.toFixed(2)} ${state.c.toFixed(
		2
	)} ${Math.round(hue)})`;
	// ring handle
	const p = pxy(RING_CX, RING_CY, RING_R, hue - 90);
	ringHandle.setAttribute("cx", String(p.x));
	ringHandle.setAttribute("cy", String(p.y));
	ringHandle.setAttribute("stroke", `oklch(0.62 0.22 ${hue})`);
}

// ── Facts ─────────────────────────────────────────
function updateFact(hue) {
	const n = ((hue % 360) + 360) % 360;
	const f =
		HUE_FACTS.find((f) => n >= f.range[0] && n < f.range[1]) || HUE_FACTS[0];
	if (f.head !== fHead.textContent) {
		fHead.textContent = f.head;
		fBody.textContent = f.body;
	}
}

// ── Draw car ──────────────────────────────────────
function drawCar(x, y, heading, hue) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(heading + Math.PI / 2);

	const lv = state.l;
	const cv = state.c;
	const body = `oklch(${lv.toFixed(2)} ${cv.toFixed(2)} ${Math.round(hue)})`;
	const roof = `oklch(${(lv * 0.42).toFixed(2)} ${(cv * 0.55).toFixed(
		3
	)} ${Math.round(hue)})`;
	const glass = `oklch(${(lv * 0.85 + 0.1).toFixed(2)} ${(cv * 0.28).toFixed(
		3
	)} ${Math.round(hue)})`;

	ctx.shadowColor = `oklch(0.42 ${cv.toFixed(2)} ${Math.round(hue)} / 0.45)`;
	ctx.shadowBlur = 18;
	ctx.shadowOffsetY = 4;
	ctx.fillStyle = body;
	ctx.beginPath();
	ctx.roundRect(-CAR_W / 2, -CAR_H / 2, CAR_W, CAR_H, 4);
	ctx.fill();
	ctx.shadowBlur = 0;
	ctx.shadowOffsetY = 0;

	ctx.fillStyle = roof;
	ctx.beginPath();
	ctx.roundRect(-CAR_W / 2 + 2, -CAR_H / 2 + 6, CAR_W - 4, CAR_H - 12, 2.5);
	ctx.fill();

	ctx.fillStyle = glass;
	ctx.globalAlpha = 0.6;
	ctx.beginPath();
	ctx.roundRect(-CAR_W / 2 + 3, -CAR_H / 2 + 5, CAR_W - 6, 7, 2);
	ctx.fill();
	ctx.globalAlpha = 1;

	// headlights
	ctx.fillStyle = `oklch(0.95 0.04 ${Math.round(hue)})`;
	ctx.beginPath();
	ctx.roundRect(-CAR_W / 2 + 1, -CAR_H / 2, 5, 4, 1);
	ctx.fill();
	ctx.beginPath();
	ctx.roundRect(CAR_W / 2 - 6, -CAR_H / 2, 5, 4, 1);
	ctx.fill();

	ctx.fillStyle = "#1e1e1e";
	[
		[-CAR_W / 2 - 2, -CAR_H / 2 + 2],
		[CAR_W / 2 - 2, -CAR_H / 2 + 2],
		[-CAR_W / 2 - 2, CAR_H / 2 - 7],
		[CAR_W / 2 - 2, CAR_H / 2 - 7]
	].forEach(([wx, wy]) => {
		ctx.beginPath();
		ctx.roundRect(wx, wy, 4.5, 7, 1);
		ctx.fill();
	});
	ctx.restore();
}

// ── Fading trail ──────────────────────────────────
function drawTrail() {
	if (trail.length < 2) return;
	ctx.save();
	ctx.lineCap = "round";
	for (let i = 1; i < trail.length; i++) {
		const p = trail[i - 1];
		const q = trail[i];
		if (Math.abs(q.x - p.x) > 40) continue; // skip wrap seam
		const age = i / trail.length; // 0=oldest → 1=newest
		const a = age * age * 0.72;
		const w = (1 - age) * 13 + 2;
		ctx.beginPath();
		ctx.moveTo(p.x, p.y);
		ctx.lineTo(q.x, q.y);
		ctx.strokeStyle = `oklch(${p.l.toFixed(2)} ${(p.c * 1.05).toFixed(
			3
		)} ${Math.round(p.hue)} / ${a.toFixed(3)})`;
		ctx.lineWidth = w;
		ctx.stroke();
	}
	ctx.restore();
}

// ── Fire particles ────────────────────────────────
// dir: +1 = moving forward (fire from rear), -1 = reversing (fire from front)
function emitFire(x, y, heading, hue, dir) {
	if (dir === 0) return; // stationary → no fire
	const EXHAUST_OFFSET = CAR_H / 2 + 3;
	// when reversing, flip to emit from the front of the car
	const exhaustX = x - Math.cos(heading) * EXHAUST_OFFSET * dir;
	const exhaustY = y - Math.sin(heading) * EXHAUST_OFFSET * dir;

	for (let i = 0; i < 4; i++) {
		const spread = (Math.random() - 0.5) * 0.35;
		const speed = 1.2 + Math.random() * 2.0;
		// shoot opposite to travel direction
		const vx = -Math.cos(heading + spread) * speed * dir;
		const vy = -Math.sin(heading + spread) * speed * dir;

		const isCore = i < 2;
		fire.push({
			x: exhaustX + (Math.random() - 0.5) * 3,
			y: exhaustY + (Math.random() - 0.5) * 3,
			vx,
			vy,
			r: isCore ? 2.5 + Math.random() * 3 : 4 + Math.random() * 5,
			l: isCore ? Math.min(state.l + 0.18, 0.88) : Math.min(state.l + 0.08, 0.78),
			c: isCore ? state.c * 1.4 : state.c * 0.9,
			hue: (hue + (isCore ? 0 : 15) + 360) % 360,
			alpha: isCore ? 0.92 : 0.65,
			life: 0,
			maxLife: isCore ? 12 + Math.random() * 10 : 18 + Math.random() * 14
		});
	}
	if (fire.length > MAX_FIRE) fire.splice(0, fire.length - MAX_FIRE);
}

function drawFire() {
	for (let i = fire.length - 1; i >= 0; i--) {
		const p = fire[i];
		p.x += p.vx;
		p.y += p.vy;
		p.vx *= 0.94; // air resistance
		p.vy *= 0.94;
		p.life++;

		const prog = p.life / p.maxLife;
		const eased = 1 - Math.pow(1 - prog, 2); // ease-out fade
		const currentR = p.r * (1 + prog * 0.6); // expand slightly
		const a = p.alpha * (1 - eased);
		const l = Math.min(p.l + prog * 0.15, 0.96); // brighten as fades
		const c = p.c * (1 - prog * 0.6);

		// radial gradient: bright core → transparent edge
		const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentR);
		grad.addColorStop(
			0,
			`oklch(${Math.min(l + 0.1, 0.98).toFixed(2)} ${(c * 0.6).toFixed(
				3
			)} ${Math.round(p.hue)} / ${a.toFixed(3)})`
		);
		grad.addColorStop(
			0.35,
			`oklch(${l.toFixed(2)} ${c.toFixed(3)} ${Math.round(p.hue)} / ${(
				a * 0.8
			).toFixed(3)})`
		);
		grad.addColorStop(
			1,
			`oklch(${l.toFixed(2)} ${c.toFixed(3)} ${Math.round(p.hue)} / 0)`
		);

		ctx.beginPath();
		ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
		ctx.fillStyle = grad;
		ctx.fill();

		if (p.life >= p.maxLife) fire.splice(i, 1);
	}
}

// ── Main loop ─────────────────────────────────────
function frame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const hue = hueFromT(t);
	const pos = carPos(t);

	// push trail point
	trail.push({ x: pos.x, y: pos.y, hue, l: state.l, c: state.c });
	if (trail.length > MAX_TRAIL) trail.shift();

	// direction: +1 forward, -1 reversing, 0 stationary
	const dir = dt > 0.05 ? 1 : dt < -0.05 ? -1 : 0;

	drawTrail();
	emitFire(pos.x, pos.y, pos.heading, hue, dir);
	drawFire();
	drawCar(pos.x, pos.y, pos.heading, hue);

	applyCSS(hue);

	const hr = Math.round(hue / 5) * 5;
	if (hr !== lastFactH) {
		updateFact(hue);
		lastFactH = hr;
	}

	// only auto-advance when not scrubbing
	if (!dragging) t++;

	requestAnimationFrame(frame);
}

// ── Pre-fill trail so track is visible from start ─
// One full pass across the screen = W / SPEED frames
// We run a full lap of history so the whole rainbow wave is already painted
(function prefill() {
	const W = canvas.width || innerWidth;
	const fullLap = Math.ceil(W / SPEED);
	for (let i = -fullLap; i <= 0; i++) {
		const pos = carPos(i);
		const hue = hueFromT(i);
		trail.push({ x: pos.x, y: pos.y, hue, l: state.l, c: state.c });
	}
	applyCSS(hueFromT(0));
	requestAnimationFrame(frame);
})();
