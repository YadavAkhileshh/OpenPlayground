// === STATE ===
let state = {
	h1: 0,
	s1: 90,
	l1: 55,
	h2: 195,
	s2: 85,
	l2: 50,
	r1: 50,
	r2: 50
};

// Hue → color name mapping
const hueNames = [
	[0, "Cadmium Red"],
	[15, "Vermillion"],
	[30, "Burnt Sienna"],
	[45, "Amber"],
	[60, "Naples Yellow"],
	[80, "Chartreuse"],
	[120, "Viridian"],
	[150, "Emerald"],
	[180, "Aquamarine"],
	[195, "Cerulean Blue"],
	[210, "Cobalt"],
	[240, "Ultramarine"],
	[270, "Violet Lake"],
	[285, "Dioxazine"],
	[300, "Quinacridone"],
	[320, "Crimson Lake"],
	[340, "Alizarin"],
	[355, "Carmine"]
];

function hueName(h) {
	h = ((h % 360) + 360) % 360;
	let best = hueNames[0],
		bestDist = 360;
	for (const [deg, name] of hueNames) {
		let d = Math.abs(h - deg);
		if (d > 180) d = 360 - d;
		if (d < bestDist) {
			bestDist = d;
			best = name;
		}
	}
	return best;
}

function mixedName(h1, h2, r1, r2) {
	const total = r1 + r2 || 1;
	const mh = ((h1 * r1 + h2 * r2) / total + 360) % 360;
	return hueName(mh);
}

// HSL → RGB → HEX
function hslToRgb(h, s, l) {
	h = ((h % 360) + 360) % 360;
	s /= 100;
	l /= 100;
	const k = (n) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n) =>
		l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [
		Math.round(f(0) * 255),
		Math.round(f(8) * 255),
		Math.round(f(4) * 255)
	];
}

function rgbToHex(r, g, b) {
	return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// Mix two HSL colors (rough pigment-style)
function mixColors(h1, s1, l1, h2, s2, l2, r1, r2) {
	const t = r1 + r2 || 1;
	const w1 = r1 / t,
		w2 = r2 / t;

	// Angle interpolation (shortest path)
	let dh = h2 - h1;
	if (dh > 180) dh -= 360;
	if (dh < -180) dh += 360;
	const mh = (h1 + dh * w2 + 360) % 360;
	const ms = s1 * w1 + s2 * w2;
	const ml = l1 * w1 + l2 * w2;
	return [mh, ms, ml];
}

// === RENDER ===
function render() {
	const root = document.documentElement;
	const { h1, s1, l1, h2, s2, l2, r1, r2 } = state;

	// CSS vars for blobs
	root.style.setProperty("--h1", h1);
	root.style.setProperty("--s1", s1 + "%");
	root.style.setProperty("--l1", l1 + "%");
	root.style.setProperty("--h2", h2);
	root.style.setProperty("--s2", s2 + "%");
	root.style.setProperty("--l2", l2 + "%");

	const c1 = `hsl(${h1},${s1}%,${l1}%)`;
	const c2 = `hsl(${h2},${s2}%,${l2}%)`;
	root.style.setProperty("--c1", c1);
	root.style.setProperty("--c2", c2);

	// Mixed result
	const [mh, ms, ml] = mixColors(h1, s1, l1, h2, s2, l2, r1, r2);
	const cm = `hsl(${mh.toFixed(1)},${ms.toFixed(1)}%,${ml.toFixed(1)}%)`;
	root.style.setProperty("--c3", cm);

	const [rr, rg, rb] = hslToRgb(mh, ms, ml);
	const hexStr = rgbToHex(rr, rg, rb);

	document.getElementById(
		"result-core"
	).style.background = `radial-gradient(ellipse at 35% 30%, hsl(${
		mh + 15
	},100%,${ml + 10}%), ${cm} 60%, hsl(${mh - 10},${ms - 10}%,${ml - 15}%))`;

	document.getElementById("result-name").textContent = mixedName(h1, h2, r1, r2);
	document.getElementById("hex-text").textContent = hexStr;
	document.getElementById("hex-swatch").style.background = hexStr;
	document.getElementById("hsl-text").textContent = `hsl(${Math.round(
		mh
	)}, ${Math.round(ms)}%, ${Math.round(ml)}%)`;

	// Slider tracks
	document.getElementById(
		"slider1"
	).style.background = `linear-gradient(to right, ${c1} 0%, rgba(255,255,255,0.1) 100%)`;
	document.getElementById(
		"slider2"
	).style.background = `linear-gradient(to right, ${c2} 0%, rgba(255,255,255,0.1) 100%)`;

	// Names
	const n1 = hueName(h1),
		n2 = hueName(h2);
	document.getElementById("name1").textContent = n1;
	document.getElementById("name2").textContent = n2;
	document.getElementById("sname1").textContent = n1.split(" ")[0];
	document.getElementById("sname2").textContent = n2.split(" ")[0];

	// Pcts
	document.getElementById("spct1").textContent = r1 + "%";
	document.getElementById("spct2").textContent = r2 + "%";
	document.getElementById("hue-val1").textContent = Math.round(h1) + "°";
	document.getElementById("hue-val2").textContent = Math.round(h2) + "°";

	// Dial dots
	updateDot("dot1", h1);
	updateDot("dot2", h2);
}

function updateDot(id, hue) {
	const dot = document.getElementById(id);
	const angle = ((hue - 90) * Math.PI) / 180;
	const r = 26;
	const cx = 30,
		cy = 30;
	const x = cx + r * Math.cos(angle);
	const y = cy + r * Math.sin(angle);
	const px = (x / 60) * 100;
	const py = (y / 60) * 100;
	dot.style.left = px + "%";
	dot.style.top = py + "%";
	dot.style.transform = "translate(-50%, -50%)";
}

// === DIAL DRAG ===
function makeDraggableDial(ringId, targetNum) {
	const ring = document.getElementById(ringId);
	let dragging = false;

	function getAngle(e) {
		const rect = ring.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const clientY = e.touches ? e.touches[0].clientY : e.clientY;
		const angle = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
		return (angle + 90 + 360) % 360;
	}

	ring.addEventListener("mousedown", (e) => {
		dragging = true;
		e.preventDefault();
	});
	ring.addEventListener(
		"touchstart",
		(e) => {
			dragging = true;
			e.preventDefault();
		},
		{ passive: false }
	);

	window.addEventListener("mousemove", (e) => {
		if (!dragging) return;
		state[`h${targetNum}`] = getAngle(e);
		render();
	});
	window.addEventListener(
		"touchmove",
		(e) => {
			if (!dragging) return;
			state[`h${targetNum}`] = getAngle(e);
			render();
		},
		{ passive: false }
	);

	window.addEventListener("mouseup", () => {
		dragging = false;
	});
	window.addEventListener("touchend", () => {
		dragging = false;
	});
}

makeDraggableDial("ring1", 1);
makeDraggableDial("ring2", 2);

// === SLIDERS ===
document.getElementById("slider1").addEventListener("input", function () {
	state.r1 = +this.value;
	render();
});
document.getElementById("slider2").addEventListener("input", function () {
	state.r2 = +this.value;
	render();
});

// === COPY HEX ===
document.getElementById("copy-btn").addEventListener("click", function () {
	const hex = document.getElementById("hex-text").textContent;
	navigator.clipboard?.writeText(hex);
	this.textContent = "Copied!";
	this.classList.add("copied");
	setTimeout(() => {
		this.textContent = "Copy hex";
		this.classList.remove("copied");
	}, 1800);
});

// === PRESETS ===
function loadPreset(h1, h2, r1, r2) {
	state.h1 = h1;
	state.h2 = h2;
	state.r1 = r1;
	state.r2 = r2;
	document.getElementById("slider1").value = r1;
	document.getElementById("slider2").value = r2;
	render();
}

// === INIT ===
render();
