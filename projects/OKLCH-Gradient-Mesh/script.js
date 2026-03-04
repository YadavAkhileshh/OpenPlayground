const GRADIENT_POSITIONS = [
	"0% 0%",
	"0% 50%",
	"0% 100%",
	"50% 0%",
	"50% 50%",
	"50% 100%",
	"100% 0%",
	"100% 50%",
	"100% 100%"
];

const COPY_RESET_MS = 1500;

// ─── State ────────────────────────────────────────────────────────────────

const state = {
	hue: 0,
	lightness: 0.9,
	chroma: 0.3,
	turn: 40,
	speed: 4,
	animating: true,
	animStartTime: null
};

// ─── DOM references ───────────────────────────────────────────────────────

const html = document.documentElement;
const $ = (id) => document.getElementById(id);

const els = {
	hue: { slider: $("hue"), display: $("hueVal") },
	lightness: { slider: $("lightness"), display: $("lightnessVal") },
	chroma: { slider: $("chroma"), display: $("chromaVal") },
	turn: { slider: $("turn"), display: $("turnVal") },
	speed: { slider: $("speed"), display: $("speedVal") },
	animToggle: $("animToggle"),
	copyBtn: $("copyBtn"),
	formulaLines: $("formulaLines")
};

// ─── CSS custom property helpers ──────────────────────────────────────────

function setCSSVar(property, value) {
	html.style.setProperty(property, value);
}

function getLiveHue() {
	return state.hue;
}

// ─── Animation ────────────────────────────────────────────────────────────

function startAnimation() {
	state.animating = true;
	state.animStartTime = null; // reset so loop picks up from current hue
}

function stopAnimation() {
	state.animating = false;
	state.hue = state.hue % 360;
	els.hue.slider.value = Math.round(state.hue);
	els.hue.display.textContent = `${Math.round(state.hue)}°`;
	setCSSVar("--hue", state.hue);
}

// ─── oklch color helper ───────────────────────────────────────────────────

function resolveColor(hueOffset) {
	const hue = hueOffset % 360;
	return `oklch(${state.lightness.toFixed(2)} ${state.chroma.toFixed(
		2
	)} ${Math.round(hue)})`;
}

// ─── Render functions ─────────────────────────────────────────────────────

function renderSwatches(baseHue = state.hue) {
	for (let i = 1; i <= 9; i++) {
		$(`sw${i}`).style.background = resolveColor(baseHue + state.turn * (i - 1));
	}
}

function renderFormula(baseHue = state.hue) {
	els.formulaLines.innerHTML = "";

	GRADIENT_POSITIONS.forEach((pos, i) => {
		const color = resolveColor(baseHue + state.turn * i);

		const entry = document.createElement("div");
		entry.className = "formula-entry";
		entry.innerHTML = `
        <span class="formula-dot" style="background:${color}"></span>
        <span class="formula-pos">at ${pos}</span>
        <span class="formula-color">${color}</span>
      `;

		els.formulaLines.appendChild(entry);
	});
}

function renderAll(baseHue = state.hue) {
	renderSwatches(baseHue);
	renderFormula(baseHue);
}

// ─── Copy to clipboard ────────────────────────────────────────────────────

function buildCSSString(baseHue) {
	const stops = GRADIENT_POSITIONS.map((pos, i) => {
		const color = resolveColor(baseHue + state.turn * i);
		return `  radial-gradient(at ${pos}, ${color} 0px, transparent 50%)`;
	});
	return "background-image:\n" + stops.join(",\n") + ";";
}

function copyCSS() {
	const baseHue = state.animating ? getLiveHue() : state.hue;
	navigator.clipboard.writeText(buildCSSString(baseHue)).then(() => {
		els.copyBtn.textContent = "copied!";
		els.copyBtn.classList.add("copied");
		setTimeout(() => {
			els.copyBtn.textContent = "copy";
			els.copyBtn.classList.remove("copied");
		}, COPY_RESET_MS);
	});
}

// ─── Event listeners ──────────────────────────────────────────────────────

els.hue.slider.addEventListener("input", (e) => {
	state.hue = +e.target.value;
	els.hue.display.textContent = `${Math.round(state.hue)}°`;
	if (!state.animating) {
		setCSSVar("--hue", state.hue);
		renderAll();
	}
});

els.lightness.slider.addEventListener("input", (e) => {
	state.lightness = +e.target.value;
	els.lightness.display.textContent = `${Math.round(state.lightness * 100)}%`;
	setCSSVar("--lightness", state.lightness);
	renderAll();
});

els.chroma.slider.addEventListener("input", (e) => {
	state.chroma = +e.target.value;
	els.chroma.display.textContent = state.chroma.toFixed(2);
	setCSSVar("--chroma", state.chroma);
	renderAll();
});

els.turn.slider.addEventListener("input", (e) => {
	state.turn = +e.target.value;
	els.turn.display.textContent = `${state.turn}°`;
	setCSSVar("--turn", state.turn);
	renderAll();
});

els.speed.slider.addEventListener("input", (e) => {
	state.speed = +e.target.value;
	els.speed.display.textContent = `${state.speed}s`;
	// speed is read directly by the rAF loop via state.speed
});

els.animToggle.addEventListener("change", (e) => {
	if (e.target.checked) startAnimation();
	else stopAnimation();
});

els.copyBtn.addEventListener("click", copyCSS);

// ─── rAF render loop ──────────────────────────────────────────────────────

(function loop(timestamp) {
	if (state.animating) {
		if (state.animStartTime === null)
			state.animStartTime = timestamp - (state.hue / 360) * state.speed * 1000;
		const elapsed = timestamp - state.animStartTime;
		state.hue = ((elapsed / (state.speed * 1000)) * 360) % 360;
		setCSSVar("--hue", state.hue);
		renderAll(state.hue);
	}
	requestAnimationFrame(loop);
})(0);

// ─── Init ─────────────────────────────────────────────────────────────────

setCSSVar("--lightness", state.lightness);
setCSSVar("--chroma", state.chroma);
setCSSVar("--turn", state.turn);
renderAll();
