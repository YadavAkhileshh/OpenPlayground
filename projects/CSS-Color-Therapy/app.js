const data = {
	tomato: {
		name: "Tomato",
		notes: `<h2>Presenting Issue</h2><p>Feels falsely associated with food accuracy and emotional aggression.</p>`
	},
	hotpink: {
		name: "HotPink",
		notes: `<h2>Presenting Issue</h2><p>Feels typecast as loud despite a rich emotional range.</p>`
	},
	cornflowerblue: {
		name: "CornflowerBlue",
		notes: `<h2>Presenting Issue</h2><p>Feels overqualified for corporate trust palettes.</p>`
	},
	chartreuse: {
		name: "Chartreuse",
		notes: `<h2>Presenting Issue</h2><p>Persistent identity mismatch between name, hue, and expectation.</p>`
	},
	mediumorchid: {
		name: "MediumOrchid",
		notes: `<h2>Presenting Issue</h2><p>Feels mysterious and slightly dramatic, but vibrant enough to shine in therapy.</p>`
	},
	salmon: {
		name: "Salmon",
		notes: `<h2>Presenting Issue</h2><p>Constantly asked why it does not resemble actual salmon.</p>`
	},
	mintcream: {
		name: "MintCream",
		notes: `<h2>Presenting Issue</h2><p>Reports existential discomfort with being neither mint nor cream.</p>`
	},
	darkgoldenrod: {
		name: "DarkGoldenrod",
		notes: `<h2>Presenting Issue</h2><p>Severe confusion regarding darkness, value, and rod-based identity.</p>`
	},
	sienna: {
		name: "Sienna",
		notes: `<h2>Presenting Issue</h2><p>A grounded, earthy presence with a hint of mystery. Sometimes overlooked but always reliable.</p>`
	},
	peachpuff: {
		name: "PeachPuff",
		notes: `<h2>Presenting Issue</h2><p>Soft and warm, often underestimated, but brings subtle cheerfulness to therapy sessions.</p>`
	}
};

const display = document.getElementById("display");
const notes = document.getElementById("notes");
const sliders = document.querySelectorAll("input[type='range']");
const identitySlider = document.getElementById("identity");
const traumaSlider = document.getElementById("trauma");
const legacySlider = document.getElementById("legacy");
const idVal = document.getElementById("idVal");
const traumaVal = document.getElementById("traumaVal");
const legacyVal = document.getElementById("legacyVal");
let currentColor = null;

function selectPatient(p) {
	document
		.querySelectorAll(".patient")
		.forEach((x) => x.classList.remove("selected"));
	currentColor = p.dataset.color;
	document
		.querySelectorAll(`.patient[data-color="${currentColor}"]`)
		.forEach((x) => x.classList.add("selected"));
	display.textContent = data[currentColor].name;
	display.style.background = currentColor;
	notes.innerHTML = data[currentColor].notes;
	display.classList.toggle("rebecca", currentColor === "rebeccapurple");
	sliders.forEach((s) => (s.value = 0));
	updateEffects();
}

function updateEffects() {
	if (!currentColor) return;
	const i = parseInt(identitySlider.value);
	const t = parseInt(traumaSlider.value);
	const l = parseInt(legacySlider.value);
	idVal.textContent = i;
	traumaVal.textContent = t;
	legacyVal.textContent = l;
	if (currentColor === "rebeccapurple") return;

	display.style.filter = `hue-rotate(${i * 1.5}deg) contrast(${
		100 + t * 2
	}%) saturate(${100 + l}%) blur(${t / 50}px)`;
	const shakeX = t / 20 - t / 40;
	const shakeY = t / 20 - t / 40;
	display.style.transform = `scale(${1 + l / 500}) rotate(${
		i / 50
	}deg) translate(${shakeX}px,${shakeY}px)`;

	const bg = window.getComputedStyle(display).backgroundColor;
	const rgb = bg.match(/\d+/g).map(Number);
	const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
	if (luminance > 0.7) {
		display.style.color = "#0f111a";
	} else if (luminance < 0.3) {
		display.style.color = "#ffffff";
	} else {
		display.style.color = "";
	}
}

document
	.querySelectorAll(".patient")
	.forEach((p) => p.addEventListener("click", () => selectPatient(p)));
sliders.forEach((s) => s.addEventListener("input", updateEffects));

window.addEventListener("DOMContentLoaded", () => {
	const tomatoPatient = document.querySelector('.patient[data-color="tomato"]');
	if (tomatoPatient) selectPatient(tomatoPatient);
});
