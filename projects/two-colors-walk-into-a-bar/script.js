const PALETTES = [
	{ na: "Terracotta", nb: "Sea Glass", a: "#d4845a", b: "#6b9e8f" },
	{ na: "Blush", nb: "Dusk", a: "#e8a5a5", b: "#7b6fa0" },
	{ na: "Butter", nb: "Forest", a: "#f0d070", b: "#3d7a5a" },
	{ na: "Coral", nb: "Sky", a: "#f07860", b: "#78b8e0" },
	{ na: "Sand", nb: "Slate", a: "#d8c090", b: "#607890" },
	{ na: "Rose", nb: "Olive", a: "#d87890", b: "#8a9060" },
	{ na: "Marigold", nb: "Plum", a: "#e8a040", b: "#805878" },
	{ na: "Mint", nb: "Clay", a: "#98d0b0", b: "#b87060" },
	{ na: "Lavender", nb: "Peach", a: "#b8a8d8", b: "#f4a87a" },
	{ na: "Sage", nb: "Blush Rose", a: "#7aaa80", b: "#e090a0" },
	{ na: "Cerulean", nb: "Amber", a: "#4a90c0", b: "#d4903a" },
	{ na: "Moss", nb: "Rust", a: "#7a9050", b: "#c8603a" },
	{ na: "Periwinkle", nb: "Melon", a: "#8890d8", b: "#f09878" },
	{ na: "Chartreuse", nb: "Violet", a: "#c0d840", b: "#7848b0" },
	{ na: "Dusty Teal", nb: "Sienna", a: "#5a9898", b: "#c07848" },
	{ na: "Powder Blue", nb: "Blush", a: "#90c0d8", b: "#e8a0b0" }
];

/* ── State ────────────────────────────────────────────────────────────────── */
let currentPalette = 0;
let pct = 50; // percentage of color A (left side)

const root = document.documentElement;
const slider = document.getElementById("slider");
const track = document.getElementById("track");
const swA = document.getElementById("sw-a");
const swB = document.getElementById("sw-b");
const nameA = document.getElementById("nameA");
const nameB = document.getElementById("nameB");
const endA = document.getElementById("endA");
const endB = document.getElementById("endB");
const codeBox = document.getElementById("codeBox");
const presetsEl = document.getElementById("presets");

function applyPalette(i) {
	currentPalette = i;
	const p = PALETTES[i];

	root.style.setProperty("--a", p.a);
	root.style.setProperty("--b", p.b);

	swA.style.background = p.a;
	swA.style.boxShadow = `0 6px 20px color-mix(in oklch, ${p.a} 35%, transparent)`;
	swB.style.background = p.b;
	swB.style.boxShadow = `0 6px 20px color-mix(in oklch, ${p.b} 35%, transparent)`;

	nameA.textContent = p.na;
	nameB.textContent = p.nb;
	endA.textContent = p.na;
	endB.textContent = p.nb;

	document.querySelectorAll(".preset-btn").forEach((btn, j) => {
		btn.classList.toggle("active", j === i);
	});

	updateMix();
}

function updateMix() {
	const p = PALETTES[currentPalette];

	root.style.setProperty("--pct", pct);
	track.style.background = `linear-gradient(to right, ${p.a}, ${p.b})`;
	codeBox.innerHTML =
		`<span class="kw">color-mix</span>(in <span class="sp">oklch</span>, ` +
		`${p.a} <span class="num">${pct}%</span>, ${p.b})`;
}

slider.addEventListener("input", () => {
	pct = 100 - parseInt(slider.value);
	updateMix();
});

PALETTES.forEach((p, i) => {
	const btn = document.createElement("button");
	btn.className = "preset-btn" + (i === 0 ? " active" : "");
	btn.innerHTML = `
    <div class="dots">
      <div class="dot" style="background:${p.a}"></div>
      <div class="dot" style="background:${p.b}"></div>
    </div>
    ${p.na} + ${p.nb}`;
	btn.addEventListener("click", () => applyPalette(i));
	presetsEl.appendChild(btn);
});

applyPalette(0);
