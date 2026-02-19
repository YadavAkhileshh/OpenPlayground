// ==================== CANVAS ====================
const cvs = document.getElementById("main");
const ctx = cvs.getContext("2d", { willReadFrequently: true });
let W, H;

function resize() {
	W = window.innerWidth;
	H = window.innerHeight;
	cvs.width = W;
	cvs.height = H;
}
window.addEventListener("resize", () => {
	resize();
	if (srcImg) shatterImage(srcImg);
});
resize();

// ==================== STATE ====================
let particles = [];
let palette = [];
const PAL_SIZE = 6;
let mode = "blow"; // blow | magnet | freeze
let mx = W / 2,
	my = H / 2;
let isPointerDown = false;
let srcImg = null;
let frameCount = 0;
let lastFpsTime = performance.now();
let fps = 0;

// ==================== CURSOR ====================
const cursorEl = document.getElementById("cursor");

function updateCursor(x, y) {
	cursorEl.style.left = x + "px";
	cursorEl.style.top = y + "px";
}

// ==================== PARTICLE ====================
class Particle {
	constructor(x, y, originX, originY, r, g, b, size) {
		this.x = x;
		this.y = y;
		this.originX = originX;
		this.originY = originY;
		this.r = r;
		this.g = g;
		this.b = b;
		this.size = size;
		this.baseSize = size;
		this.vx = 0;
		this.vy = 0;
		this.friction = 0.92 + Math.random() * 0.04;
		this.springStrength = 0.008 + Math.random() * 0.008;
		this.wanderAngle = Math.random() * Math.PI * 2;
		this.wanderSpeed = 0.02 + Math.random() * 0.02;
		this.opacity = 0;
		this.targetOpacity = 1;
	}

	update() {
		// Opacity fade in
		this.opacity += (this.targetOpacity - this.opacity) * 0.05;

		if (mode === "freeze") {
			this.vx *= 0.95;
			this.vy *= 0.95;
			this.x += this.vx;
			this.y += this.vy;
			return;
		}

		// Spring back to origin
		const dx = this.originX - this.x;
		const dy = this.originY - this.y;
		this.vx += dx * this.springStrength;
		this.vy += dy * this.springStrength;

		// Gentle wander
		this.wanderAngle += this.wanderSpeed;
		this.vx += Math.cos(this.wanderAngle) * 0.05;
		this.vy += Math.sin(this.wanderAngle) * 0.05;

		// Mouse interaction
		if (isPointerDown || mode === "magnet") {
			const mdx = this.x - mx;
			const mdy = this.y - my;
			const dist = Math.sqrt(mdx * mdx + mdy * mdy);
			const radius = mode === "blow" ? 140 : mode === "magnet" ? 200 : 0;

			if (dist < radius && dist > 0) {
				const force = (radius - dist) / radius;
				const angle = Math.atan2(mdy, mdx);

				if (mode === "blow" && isPointerDown) {
					// Explode outward
					const power = force * force * 8;
					this.vx += Math.cos(angle) * power;
					this.vy += Math.sin(angle) * power;
					this.size = this.baseSize * (1 + force * 0.8);
				} else if (mode === "magnet") {
					// Pull inward (always active)
					const power = force * 2;
					this.vx -= Math.cos(angle) * power;
					this.vy -= Math.sin(angle) * power;
					this.size = this.baseSize * (1 - force * 0.3);
				}
			} else {
				this.size += (this.baseSize - this.size) * 0.1;
			}
		} else {
			this.size += (this.baseSize - this.size) * 0.1;
		}

		this.vx *= this.friction;
		this.vy *= this.friction;
		this.x += this.vx;
		this.y += this.vy;
	}

	draw() {
		ctx.globalAlpha = this.opacity;
		ctx.fillStyle = `rgb(${this.r},${this.g},${this.b})`;

		// Rounded rect for pixel art feel
		const s = Math.max(1, this.size);
		const half = s / 2;
		const rad = s > 4 ? 2 : 1;
		ctx.beginPath();
		ctx.moveTo(this.x - half + rad, this.y - half);
		ctx.lineTo(this.x + half - rad, this.y - half);
		ctx.quadraticCurveTo(
			this.x + half,
			this.y - half,
			this.x + half,
			this.y - half + rad
		);
		ctx.lineTo(this.x + half, this.y + half - rad);
		ctx.quadraticCurveTo(
			this.x + half,
			this.y + half,
			this.x + half - rad,
			this.y + half
		);
		ctx.lineTo(this.x - half + rad, this.y + half);
		ctx.quadraticCurveTo(
			this.x - half,
			this.y + half,
			this.x - half,
			this.y + half - rad
		);
		ctx.lineTo(this.x - half, this.y - half + rad);
		ctx.quadraticCurveTo(
			this.x - half,
			this.y - half,
			this.x - half + rad,
			this.y - half
		);
		ctx.fill();
		ctx.globalAlpha = 1;
	}
}

// ==================== IMAGE → PARTICLES ====================
function shatterImage(img) {
	document.getElementById("loading").classList.add("active");

	// Small delay for UI
	setTimeout(() => {
		particles = [];

		// Scale image to fit canvas
		const scale = Math.min((W * 0.7) / img.width, (H * 0.65) / img.height, 1);
		const iw = Math.floor(img.width * scale);
		const ih = Math.floor(img.height * scale);
		const ox = Math.floor((W - iw) / 2);
		const oy = Math.floor((H - ih) / 2);

		// Draw to offscreen canvas to get pixel data
		const oc = document.createElement("canvas");
		oc.width = iw;
		oc.height = ih;
		const octx = oc.getContext("2d");
		octx.drawImage(img, 0, 0, iw, ih);
		const imgData = octx.getImageData(0, 0, iw, ih).data;

		// Determine particle density based on image size
		const targetParticles = Math.min(8000, Math.max(2000, (iw * ih) / 20));
		const gap = Math.max(2, Math.floor(Math.sqrt((iw * ih) / targetParticles)));
		const pSize = gap * 0.95;

		for (let y = 0; y < ih; y += gap) {
			for (let x = 0; x < iw; x += gap) {
				const i = (y * iw + x) * 4;
				const r = imgData[i];
				const g = imgData[i + 1];
				const b = imgData[i + 2];
				const a = imgData[i + 3];

				if (a < 128) continue; // Skip transparent

				const px = ox + x;
				const py = oy + y;

				// Spawn from random edge
				const edge = Math.random();
				let sx, sy;
				if (edge < 0.25) {
					sx = Math.random() * W;
					sy = -50;
				} else if (edge < 0.5) {
					sx = Math.random() * W;
					sy = H + 50;
				} else if (edge < 0.75) {
					sx = -50;
					sy = Math.random() * H;
				} else {
					sx = W + 50;
					sy = Math.random() * H;
				}

				const p = new Particle(sx, sy, px, py, r, g, b, pSize);
				p.vx = (px - sx) * 0.01 + (Math.random() - 0.5) * 2;
				p.vy = (py - sy) * 0.01 + (Math.random() - 0.5) * 2;
				particles.push(p);
			}
		}

		// Extract palette
		extractPalette(imgData, iw, ih);

		document.getElementById("loading").classList.remove("active");
		document.getElementById("particleCount").textContent =
			particles.length.toLocaleString() + " particles";
		showToast(`${particles.length.toLocaleString()} particles created`);
	}, 100);
}

// ==================== COLOR EXTRACTION (Median Cut) ====================
function extractPalette(imgData, w, h) {
	// Collect all colors
	const colors = [];
	const step = Math.max(1, Math.floor((w * h) / 10000));

	for (let i = 0; i < w * h; i += step) {
		const idx = i * 4;
		const r = imgData[idx];
		const g = imgData[idx + 1];
		const b = imgData[idx + 2];
		const a = imgData[idx + 3];
		if (a < 128) continue;
		// Skip near-gray
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		if (max - min < 8 && max < 240 && min > 15) continue;
		colors.push([r, g, b]);
	}

	// Median cut
	const buckets = medianCut(colors, PAL_SIZE);

	palette = buckets.map((bucket) => {
		let tr = 0,
			tg = 0,
			tb = 0;
		bucket.forEach((c) => {
			tr += c[0];
			tg += c[1];
			tb += c[2];
		});
		const len = bucket.length;
		const r = Math.round(tr / len);
		const g = Math.round(tg / len);
		const b = Math.round(tb / len);
		return {
			r,
			g,
			b,
			hex: rgbHex(r, g, b),
			pct: ((bucket.length / colors.length) * 100).toFixed(1)
		};
	});

	// Sort by luminance
	palette.sort((a, b) => luminance(b) - luminance(a));

	updatePaletteUI();
}

function medianCut(colors, depth) {
	if (depth <= 1 || colors.length === 0) return [colors];

	// Find channel with greatest range
	let rMin = 255,
		rMax = 0,
		gMin = 255,
		gMax = 0,
		bMin = 255,
		bMax = 0;
	colors.forEach((c) => {
		if (c[0] < rMin) rMin = c[0];
		if (c[0] > rMax) rMax = c[0];
		if (c[1] < gMin) gMin = c[1];
		if (c[1] > gMax) gMax = c[1];
		if (c[2] < bMin) bMin = c[2];
		if (c[2] > bMax) bMax = c[2];
	});

	const rRange = rMax - rMin;
	const gRange = gMax - gMin;
	const bRange = bMax - bMin;

	let channel = 0;
	if (gRange >= rRange && gRange >= bRange) channel = 1;
	else if (bRange >= rRange && bRange >= gRange) channel = 2;

	colors.sort((a, b) => a[channel] - b[channel]);
	const mid = Math.floor(colors.length / 2);

	const left = medianCut(colors.slice(0, mid), depth / 2);
	const right = medianCut(colors.slice(mid), depth / 2);
	return [...left, ...right];
}

function rgbHex(r, g, b) {
	const h = (v) => {
		const s = v.toString(16);
		return s.length === 1 ? "0" + s : s;
	};
	return `#${h(r)}${h(g)}${h(b)}`;
}

function luminance(c) {
	return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

// ==================== PALETTE UI ====================
function updatePaletteUI() {
	const dock = document.getElementById("paletteDock");
	let html = "";

	for (let i = 0; i < PAL_SIZE; i++) {
		const c = palette[i];
		if (c) {
			html += `
        <div class="pal-color" data-i="${i}" onclick="copyColor(${i})">
          <div class="pal-swatch" style="background:${c.hex}"></div>
          <span class="pal-hex">${c.hex.toUpperCase()}</span>
          <span class="pal-pct">${c.pct}%</span>
        </div>`;
		} else {
			html += `
        <div class="pal-color pal-empty">
          <div class="pal-swatch"></div>
          <span class="pal-hex">—</span>
        </div>`;
		}
	}

	html += `
    <div class="dock-actions">
      <button class="dock-btn" onclick="copyCSS()" title="Copy CSS Variables">{ }</button>
      <button class="dock-btn" onclick="copySVG()" title="Copy SVG">◇</button>
      <button class="dock-btn" onclick="resetAll()" title="Reset">✕</button>
    </div>`;

	dock.innerHTML = html;

	// Animate in
	dock.querySelectorAll(".pal-color").forEach((el, i) => {
		el.style.opacity = "0";
		el.style.transform = "translateY(12px) scale(0.8)";
		setTimeout(() => {
			el.style.transition = "all .5s cubic-bezier(.34,1.56,.64,1)";
			el.style.opacity = "1";
			el.style.transform = "translateY(0) scale(1)";
		}, i * 80 + 50);
	});
}

// ==================== COPY ====================
function copyColor(i) {
	if (!palette[i]) return;
	navigator.clipboard.writeText(palette[i].hex.toUpperCase()).catch(() => {});
	showToast(`Copied ${palette[i].hex.toUpperCase()}`);
}

function copyCSS() {
	if (!palette.length) {
		showToast("Load an image first");
		return;
	}
	const css = `:root {\n${palette
		.map(
			(c, i) =>
				`  --color-${i + 1}: ${c.hex}; /* rgb(${c.r}, ${c.g}, ${c.b}) — ${
					c.pct
				}% */`
		)
		.join("\n")}\n}`;
	navigator.clipboard.writeText(css).catch(() => {});
	showToast("CSS variables copied");
}

function copySVG() {
	if (!palette.length) {
		showToast("Load an image first");
		return;
	}
	const sw = 100,
		sh = 120;
	const rects = palette
		.map(
			(c, i) =>
				`  <rect x="${i * sw}" y="0" width="${sw}" height="${sh}" fill="${c.hex}"/>`
		)
		.join("\n");
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
		palette.length * sw
	}" height="${sh}">\n${rects}\n</svg>`;
	navigator.clipboard.writeText(svg).catch(() => {});
	showToast("SVG palette copied");
}

function resetAll() {
	particles = [];
	palette = [];
	srcImg = null;
	updatePaletteUI();
	document.getElementById("particleCount").textContent = "0 particles";
}

// ==================== TOAST ====================
function showToast(msg) {
	const t = document.getElementById("toast");
	t.textContent = msg;
	t.classList.add("show");
	clearTimeout(t._to);
	t._to = setTimeout(() => t.classList.remove("show"), 2000);
}

// ==================== SAMPLE IMAGES ====================
const SAMPLES = {
	city: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80",
	nature:
		"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
	sunset:
		"https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600&q=80",
	abstract:
		"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80"
};

document.querySelectorAll("[data-sample]").forEach((btn) => {
	btn.addEventListener("click", () => {
		const key = btn.dataset.sample;
		loadImage(SAMPLES[key]);
	});
});

function loadImage(src) {
	document.getElementById("loading").classList.add("active");
	const img = new Image();
	img.crossOrigin = "anonymous";
	img.onload = () => {
		srcImg = img;
		shatterImage(img);
	};
	img.onerror = () => {
		document.getElementById("loading").classList.remove("active");
		showToast("Failed to load image");
	};
	img.src = src;
}

// File upload
document.getElementById("fileInput").addEventListener("change", (e) => {
	const file = e.target.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = (ev) => {
		const img = new Image();
		img.onload = () => {
			srcImg = img;
			shatterImage(img);
		};
		img.src = ev.target.result;
	};
	reader.readAsDataURL(file);
});

// Drag & drop
const dropzone = document.getElementById("dropzone");

document.addEventListener("dragover", (e) => {
	e.preventDefault();
	dropzone.classList.add("active");
});

document.addEventListener("dragleave", (e) => {
	if (e.relatedTarget === null) dropzone.classList.remove("active");
});

document.addEventListener("drop", (e) => {
	e.preventDefault();
	dropzone.classList.remove("active");
	const file = e.dataTransfer.files[0];
	if (!file || !file.type.startsWith("image/")) return;
	const reader = new FileReader();
	reader.onload = (ev) => {
		const img = new Image();
		img.onload = () => {
			srcImg = img;
			shatterImage(img);
		};
		img.src = ev.target.result;
	};
	reader.readAsDataURL(file);
});

// ==================== MODE SWITCHING ====================
document.querySelectorAll("[data-mode]").forEach((btn) => {
	btn.addEventListener("click", () => {
		document
			.querySelectorAll("[data-mode]")
			.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		mode = btn.dataset.mode;
		cursorEl.className = "cursor" + (mode === "blow" ? "" : " " + mode);
	});
});

// ==================== MOUSE ====================
cvs.addEventListener("pointermove", (e) => {
	mx = e.clientX;
	my = e.clientY;
	updateCursor(mx, my);
});

cvs.addEventListener("pointerdown", (e) => {
	isPointerDown = true;
	mx = e.clientX;
	my = e.clientY;

	// Init audio context on first interaction (for potential future audio)
	cursorEl.classList.add(mode === "blow" ? "blow" : mode);
});

cvs.addEventListener("pointerup", () => {
	isPointerDown = false;
	cursorEl.className = "cursor" + (mode !== "blow" ? " " + mode : "");
});

cvs.addEventListener("pointerleave", () => {
	isPointerDown = false;
});

// Touch
cvs.addEventListener(
	"touchmove",
	(e) => {
		e.preventDefault();
		mx = e.touches[0].clientX;
		my = e.touches[0].clientY;
		updateCursor(mx, my);
	},
	{ passive: false }
);

cvs.addEventListener("touchstart", (e) => {
	isPointerDown = true;
	mx = e.touches[0].clientX;
	my = e.touches[0].clientY;
	updateCursor(mx, my);
});

cvs.addEventListener("touchend", () => {
	isPointerDown = false;
});

// ==================== KEYBOARD ====================
document.addEventListener("keydown", (e) => {
	if (e.code === "Space") {
		e.preventDefault();
		explodeAll();
	}
	if (e.key === "1") document.querySelector('[data-mode="blow"]').click();
	if (e.key === "2") document.querySelector('[data-mode="magnet"]').click();
	if (e.key === "3") document.querySelector('[data-mode="freeze"]').click();
	if (e.key === "c") copyCSS();
	if (e.key === "r") {
		reassemble();
	}
});

function explodeAll() {
	particles.forEach((p) => {
		const angle = Math.random() * Math.PI * 2;
		const power = 5 + Math.random() * 15;
		p.vx += Math.cos(angle) * power;
		p.vy += Math.sin(angle) * power;
	});
	showToast("💥 Boom!");
}

function reassemble() {
	particles.forEach((p) => {
		p.springStrength = 0.05;
		setTimeout(() => {
			p.springStrength = 0.008 + Math.random() * 0.008;
		}, 2000);
	});
	showToast("Reassembling...");
}

// ==================== RENDER LOOP ====================
function render() {
	ctx.fillStyle = "rgba(8, 8, 12, 0.25)";
	ctx.fillRect(0, 0, W, H);

	// Sort by size for depth
	particles.forEach((p) => {
		p.update();
		p.draw();
	});

	// FPS
	frameCount++;
	const now = performance.now();
	if (now - lastFpsTime >= 500) {
		fps = Math.round(frameCount / ((now - lastFpsTime) / 1000));
		document.getElementById("fpsDisplay").textContent = fps + " fps";
		frameCount = 0;
		lastFpsTime = now;
	}

	requestAnimationFrame(render);
}

// ==================== START ====================
// Show initial empty state
updatePaletteUI();
render();

// Auto-load a sample after a brief moment
setTimeout(() => {
	loadImage(SAMPLES.abstract);
}, 500);
