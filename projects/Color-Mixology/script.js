// --- Color Bottles Data ---
const BOTTLES = [
	{ name: "Crimson", color: "#DC143C" },
	{ name: "Tomato", color: "#FF6347" },
	{ name: "Orange", color: "#FF8C00" },
	{ name: "Gold", color: "#FFD700" },
	{ name: "Chartreuse", color: "#7FFF00" },
	{ name: "Emerald", color: "#50C878" },
	{ name: "Teal", color: "#008080" },
	{ name: "Cyan", color: "#00E5FF" },
	{ name: "Dodger Blue", color: "#1E90FF" },
	{ name: "Indigo", color: "#4B0082" },
	{ name: "Violet", color: "#8A2BE2" },
	{ name: "Magenta", color: "#FF00FF" },
	{ name: "Hot Pink", color: "#FF69B4" },
	{ name: "Coral", color: "#FF7F50" },
	{ name: "Lavender", color: "#B57EDC" },
	{ name: "White", color: "#FFFFFF" }
];

// --- Garnish Emojis ---
const GARNISHES = ["🍊", "🍋", "🍒", "🫒", "🍓", "🌿", "🍍", "🧊", "☂️", "⭐"];

// --- State ---
const state = {
	slot1Color: null,
	slot2Color: null,
	slot1Name: null,
	slot2Name: null,
	activeSlot: 1,
	proportion: 50,
	colorSpace: "srgb",
	recentMixes: []
};

// --- DOM Refs ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
	bottleRack: $("#bottle-rack"),
	slot1Glass: $("#slot1-glass"),
	slot1Liquid: $("#slot1-liquid"),
	slot1Name: $("#slot1-name"),
	slot1Picker: $("#slot1-picker"),
	slot2Glass: $("#slot2-glass"),
	slot2Liquid: $("#slot2-liquid"),
	slot2Name: $("#slot2-name"),
	slot2Picker: $("#slot2-picker"),
	proportionSlider: $("#proportion-slider"),
	proportionLeft: $("#proportion-left"),
	proportionRight: $("#proportion-right"),
	colorspaceOptions: $("#colorspace-options"),
	mixBtn: $("#mix-btn"),
	resultLiquid: $("#result-liquid"),
	resultBubbles: $("#result-bubbles"),
	resultSwatch: $("#result-swatch"),
	resultHex: $("#result-hex"),
	resultCode: $("#result-code"),
	copyBtn: $("#copy-btn"),
	copiedToast: $("#copied-toast"),
	resultGradient: $("#result-gradient"),
	gradientCode: $("#gradient-code"),
	gradientWrap: $("#gradient-wrap"),
	galleryGrid: $("#gallery-grid"),
	garnish: $("#garnish"),
	shakerOverlay: $("#shaker-overlay"),
	shakerLiquid: $("#shaker-liquid"),
	shakerParticles: $("#shaker-particles"),
	resultSection: $("#result"),
	glassWrap: $("#result-glass-wrap")
};

// ============================================
// BOTTLE RENDERING
// ============================================

function createBottle(data, index) {
	const bottle = document.createElement("div");
	bottle.className = "bottle no-select";
	bottle.style.setProperty("--bottle-color", data.color);
	bottle.dataset.color = data.color;
	bottle.dataset.name = data.name;
	bottle.dataset.index = index;
	bottle.title = `${data.name} — Click to pour`;

	bottle.innerHTML = `
    <div class="bottle__glow"></div>
    <div class="bottle__cap"></div>
    <div class="bottle__neck"></div>
    <div class="bottle__body">
      <div class="bottle__liquid" style="background: ${data.color};"></div>
      <div class="bottle__shine"></div>
    </div>
    <div class="bottle__label">${data.name}</div>
  `;

	bottle.addEventListener("click", () =>
		pourBottle(data.color, data.name, bottle)
	);
	return bottle;
}

function renderBottles() {
	BOTTLES.forEach((b, i) => {
		dom.bottleRack.appendChild(createBottle(b, i));
	});
}

// ============================================
// POUR LOGIC
// ============================================

function pourBottle(color, name, bottleEl) {
	// Deselect all bottles first
	$$(".bottle--selected").forEach((b) => b.classList.remove("bottle--selected"));

	// Select this bottle
	bottleEl.classList.add("bottle--selected");

	if (state.activeSlot === 1) {
		setSlotColor(1, color, name);
		state.activeSlot = 2;
	} else {
		setSlotColor(2, color, name);
		state.activeSlot = 1;
	}
}

function setSlotColor(slot, color, name) {
	const glass = slot === 1 ? dom.slot1Glass : dom.slot2Glass;
	const liquid = slot === 1 ? dom.slot1Liquid : dom.slot2Liquid;
	const nameEl = slot === 1 ? dom.slot1Name : dom.slot2Name;
	const picker = slot === 1 ? dom.slot1Picker : dom.slot2Picker;

	if (slot === 1) {
		state.slot1Color = color;
		state.slot1Name = name;
	} else {
		state.slot2Color = color;
		state.slot2Name = name;
	}

	// Animate glass
	glass.classList.add("pour-slot__glass--filled", "pour-slot__glass--pouring");
	setTimeout(() => glass.classList.remove("pour-slot__glass--pouring"), 600);

	// Set liquid
	liquid.style.background = color;
	liquid.classList.add("pour-slot__liquid--visible");

	// Update name and picker
	nameEl.textContent = name || color;
	picker.value = color;

	// Update ambient glow on glass
	glass.style.boxShadow = `0 0 25px ${color}40, inset 0 0 20px ${color}20`;
}

// ============================================
// PROPORTION SLIDER
// ============================================

dom.proportionSlider.addEventListener("input", (e) => {
	state.proportion = parseInt(e.target.value);
	dom.proportionLeft.textContent = `${state.proportion}%`;
	dom.proportionRight.textContent = `${100 - state.proportion}%`;
});

// ============================================
// COLOR PICKERS
// ============================================

dom.slot1Picker.addEventListener("input", (e) => {
	setSlotColor(1, e.target.value, e.target.value);
});

dom.slot2Picker.addEventListener("input", (e) => {
	setSlotColor(2, e.target.value, e.target.value);
});

// ============================================
// CLICK ON GLASS TO SELECT SLOT
// ============================================

$("#slot1").addEventListener("click", (e) => {
	if (e.target.closest(".pour-slot__picker")) return;
	state.activeSlot = 1;
	highlightActiveSlot();
});

$("#slot2").addEventListener("click", (e) => {
	if (e.target.closest(".pour-slot__picker")) return;
	state.activeSlot = 2;
	highlightActiveSlot();
});

function highlightActiveSlot() {
	$("#slot1").querySelector(".pour-slot__label").style.color =
		state.activeSlot === 1 ? "var(--accent-3)" : "var(--text-secondary)";
	$("#slot2").querySelector(".pour-slot__label").style.color =
		state.activeSlot === 2 ? "var(--accent-3)" : "var(--text-secondary)";
}

// ============================================
// COLOR SPACE SELECTOR
// ============================================

dom.colorspaceOptions.addEventListener("click", (e) => {
	const btn = e.target.closest(".colorspace__btn");
	if (!btn) return;

	$$(".colorspace__btn").forEach((b) =>
		b.classList.remove("colorspace__btn--active")
	);
	btn.classList.add("colorspace__btn--active");
	state.colorSpace = btn.dataset.space;
});

// ============================================
// MIX BUTTON
// ============================================

dom.mixBtn.addEventListener("click", () => {
	if (!state.slot1Color || !state.slot2Color) {
		shakeElement(dom.mixBtn);
		return;
	}
	performMix();
});

function shakeElement(el) {
	el.style.animation = "none";
	el.offsetHeight; // trigger reflow
	el.style.animation = "shakerShake 0.3s ease 2";
	setTimeout(() => {
		el.style.animation = "";
	}, 700);
}

// ============================================
// PERFORM MIX
// ============================================

async function performMix() {
	const { slot1Color, slot2Color, proportion, colorSpace } = state;

	// Show shaker overlay
	showShaker(slot1Color, slot2Color);

	// Wait for shaker animation
	await delay(1800);

	// Generate CSS color-mix code
	const cssCode = `color-mix(in ${colorSpace}, ${slot1Color} ${proportion}%, ${slot2Color} ${
		100 - proportion
	}%)`;

	// Compute the actual mixed color
	const mixedColor = computeColorMix(
		slot1Color,
		slot2Color,
		proportion,
		colorSpace
	);
	const mixedHex = mixedColor;

	// Hide shaker
	hideShaker();

	// Wait a beat
	await delay(300);

	// Reveal result
	revealResult(mixedHex, cssCode, slot1Color, slot2Color);

	// Add to gallery
	addToGallery(mixedHex, cssCode);
}

// ============================================
// SHAKER ANIMATION
// ============================================

function showShaker(c1, c2) {
	// Mix shaker liquid color visually
	dom.shakerLiquid.style.background = `linear-gradient(180deg, ${c1}, ${c2})`;
	dom.shakerOverlay.classList.add("shaker-overlay--active");

	// Spawn particles
	spawnShakerParticles(c1, c2);
}

function hideShaker() {
	dom.shakerOverlay.classList.remove("shaker-overlay--active");
	dom.shakerParticles.innerHTML = "";
}

function spawnShakerParticles(c1, c2) {
	dom.shakerParticles.innerHTML = "";
	const colors = [c1, c2];
	for (let i = 0; i < 20; i++) {
		const p = document.createElement("div");
		p.className = "shaker-particle";
		p.style.background = colors[Math.floor(Math.random() * 2)];
		p.style.left = `${40 + Math.random() * 20}%`;
		p.style.top = `${40 + Math.random() * 20}%`;
		p.style.width = `${4 + Math.random() * 8}px`;
		p.style.height = p.style.width;
		p.style.setProperty("--tx", `${(Math.random() - 0.5) * 200}px`);
		p.style.setProperty("--ty", `${(Math.random() - 0.5) * 200}px`);
		p.style.animationDelay = `${0.5 + Math.random() * 1}s`;
		dom.shakerParticles.appendChild(p);
	}
}

// ============================================
// COMPUTE COLOR MIX
// ============================================

function computeColorMix(c1, c2, percent, space) {
	// Use an off-screen element with color-mix() to compute the actual color
	// IMPORTANT: don't use display:none — browsers skip computing styles for hidden elements
	const el = document.createElement("div");
	el.style.position = "absolute";
	el.style.top = "-9999px";
	el.style.left = "-9999px";
	el.style.width = "1px";
	el.style.height = "1px";
	el.style.visibility = "hidden";

	const mixExpr = `color-mix(in ${space}, ${c1} ${percent}%, ${c2} ${
		100 - percent
	}%)`;
	el.style.backgroundColor = mixExpr;
	document.body.appendChild(el);

	const computed = getComputedStyle(el).backgroundColor;
	document.body.removeChild(el);

	// If the browser couldn't compute color-mix, fall back to manual interpolation
	const hex = rgbStringToHex(computed);
	if (hex === "#000000" && c1 !== "#000000" && c2 !== "#000000") {
		return manualColorMix(c1, c2, percent / 100);
	}
	return hex;
}

function rgbStringToHex(colorStr) {
	if (!colorStr || colorStr === "transparent" || colorStr === "rgba(0, 0, 0, 0)")
		return "#000000";

	// Try rgb/rgba with commas: rgb(128, 0, 255) or rgba(128, 0, 255, 1)
	let match = colorStr.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
	if (match) {
		return toHex(
			Math.round(parseFloat(match[1])),
			Math.round(parseFloat(match[2])),
			Math.round(parseFloat(match[3]))
		);
	}

	// Try rgb/rgba without commas (modern syntax): rgb(128 0 255) or rgb(128 0 255 / 1)
	match = colorStr.match(/rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
	if (match) {
		return toHex(
			Math.round(parseFloat(match[1])),
			Math.round(parseFloat(match[2])),
			Math.round(parseFloat(match[3]))
		);
	}

	// Try color() function: color(srgb 0.5 0.3 0.8) — values are 0-1
	match = colorStr.match(/color\(\s*[\w-]+\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
	if (match) {
		return toHex(
			Math.round(clamp01(parseFloat(match[1])) * 255),
			Math.round(clamp01(parseFloat(match[2])) * 255),
			Math.round(clamp01(parseFloat(match[3])) * 255)
		);
	}

	// Try oklch/lch/lab — the browser should still resolve to rgb, but just in case
	// fall back to manual black
	return "#000000";
}

function toHex(r, g, b) {
	r = Math.max(0, Math.min(255, r));
	g = Math.max(0, Math.min(255, g));
	b = Math.max(0, Math.min(255, b));
	return `#${((1 << 24) + (r << 16) + (g << 8) + b)
		.toString(16)
		.slice(1)
		.toUpperCase()}`;
}

function clamp01(v) {
	return Math.max(0, Math.min(1, v));
}

// Manual fallback for browsers that don't support color-mix()
function manualColorMix(hex1, hex2, t) {
	const r1 = parseInt(hex1.slice(1, 3), 16);
	const g1 = parseInt(hex1.slice(3, 5), 16);
	const b1 = parseInt(hex1.slice(5, 7), 16);
	const r2 = parseInt(hex2.slice(1, 3), 16);
	const g2 = parseInt(hex2.slice(3, 5), 16);
	const b2 = parseInt(hex2.slice(5, 7), 16);

	const r = Math.round(r1 + (r2 - r1) * (1 - t));
	const g = Math.round(g1 + (g2 - g1) * (1 - t));
	const b = Math.round(b1 + (b2 - b1) * (1 - t));

	return toHex(r, g, b);
}

// ============================================
// REVEAL RESULT
// ============================================

function revealResult(mixedHex, cssCode, c1, c2) {
	// Animate the result section
	dom.resultSection.classList.add("result--revealed");
	setTimeout(() => dom.resultSection.classList.remove("result--revealed"), 1000);

	// Fill cocktail glass
	dom.resultLiquid.style.backgroundColor = mixedHex;
	dom.resultLiquid.classList.add("cocktail-glass__liquid--filled");

	// Add bubbles
	spawnBubbles(mixedHex);

	// Show garnish
	dom.garnish.textContent =
		GARNISHES[Math.floor(Math.random() * GARNISHES.length)];
	dom.garnish.classList.add("cocktail-glass__garnish--visible");

	// Update swatch and info
	dom.resultSwatch.style.backgroundColor = mixedHex;
	dom.resultSwatch.style.boxShadow = `0 4px 25px ${mixedHex}60`;
	dom.resultHex.textContent = mixedHex;
	dom.resultCode.textContent = cssCode;

	// Gradient preview
	const gradientCSS = `linear-gradient(90deg, ${c1}, ${mixedHex}, ${c2})`;
	dom.resultGradient.style.background = gradientCSS;
	dom.gradientCode.textContent = gradientCSS;
	dom.gradientWrap.classList.add("result__gradient-wrap--visible");

	// Scroll to result
	dom.resultSection.scrollIntoView({ behavior: "smooth", block: "center" });
}

function spawnBubbles(color) {
	dom.resultBubbles.innerHTML = "";
	for (let i = 0; i < 8; i++) {
		const b = document.createElement("div");
		b.className = "bubble";
		const size = 3 + Math.random() * 6;
		b.style.width = `${size}px`;
		b.style.height = `${size}px`;
		b.style.left = `${20 + Math.random() * 60}%`;
		b.style.bottom = `${Math.random() * 30}%`;
		b.style.animationDuration = `${1.5 + Math.random() * 2}s`;
		b.style.animationDelay = `${Math.random() * 2}s`;
		dom.resultBubbles.appendChild(b);
	}
}

// ============================================
// COPY TO CLIPBOARD
// ============================================

dom.copyBtn.addEventListener("click", () => {
	const code = dom.resultCode.textContent;
	if (!code || code.includes("Mix two colors")) return;

	navigator.clipboard
		.writeText(code)
		.then(() => {
			dom.copiedToast.classList.add("result__copied--show");
			setTimeout(
				() => dom.copiedToast.classList.remove("result__copied--show"),
				1500
			);
		})
		.catch(() => {
			// Fallback
			const ta = document.createElement("textarea");
			ta.value = code;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand("copy");
			document.body.removeChild(ta);
			dom.copiedToast.classList.add("result__copied--show");
			setTimeout(
				() => dom.copiedToast.classList.remove("result__copied--show"),
				1500
			);
		});
});

// ============================================
// GALLERY
// ============================================

function addToGallery(hex, cssCode) {
	// Don't exceed 20 items
	if (state.recentMixes.length >= 20) {
		state.recentMixes.pop();
		const last = dom.galleryGrid.lastElementChild;
		if (last) last.remove();
	}

	state.recentMixes.unshift({ hex, cssCode });

	const item = document.createElement("div");
	item.className = "gallery__item";
	item.style.backgroundColor = hex;
	item.title = cssCode;

	item.innerHTML = `<div class="gallery__item-label">${hex}</div>`;

	item.addEventListener("click", () => {
		navigator.clipboard.writeText(cssCode).catch(() => {});
		item.querySelector(".gallery__item-label").textContent = "Copied!";
		setTimeout(() => {
			item.querySelector(".gallery__item-label").textContent = hex;
		}, 1000);
	});

	dom.galleryGrid.insertBefore(item, dom.galleryGrid.firstChild);
}

// ============================================
// UTILITIES
// ============================================

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// INIT
// ============================================

function init() {
	renderBottles();
	highlightActiveSlot();

	// Pre-select two default colors for a nice demo
	setTimeout(() => {
		const bottles = $$(".bottle");
		if (bottles.length >= 2) {
			pourBottle(BOTTLES[0].color, BOTTLES[0].name, bottles[0]);
			setTimeout(() => {
				pourBottle(BOTTLES[3].color, BOTTLES[3].name, bottles[3]);
			}, 300);
		}
	}, 500);
}

// --- Start ---
document.addEventListener("DOMContentLoaded", init);
