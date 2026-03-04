const CSS_COLOR_DATA = {
	aliceblue: "#f0f8ff",
	antiquewhite: "#faebd7",
	aqua: "#00ffff",
	aquamarine: "#7fffd4",
	azure: "#f0ffff",
	beige: "#f5f5dc",
	bisque: "#ffe4c4",
	black: "#000000",
	blanchedalmond: "#ffebcd",
	blue: "#0000ff",
	blueviolet: "#8a2be2",
	brown: "#a52a2a",
	burlywood: "#deb887",
	cadetblue: "#5f9ea0",
	chartreuse: "#7fff00",
	chocolate: "#d2691e",
	coral: "#ff7f50",
	cornflowerblue: "#6495ed",
	cornsilk: "#fff8dc",
	crimson: "#dc143c",
	cyan: "#00ffff",
	darkblue: "#00008b",
	darkcyan: "#008b8b",
	darkgoldenrod: "#b8860b",
	darkgray: "#a9a9a9",
	darkgreen: "#006400",
	darkgrey: "#a9a9a9",
	darkkhaki: "#bdb76b",
	darkmagenta: "#8b008b",
	darkolivegreen: "#556b2f",
	darkorange: "#ff8c00",
	darkorchid: "#9932cc",
	darkred: "#8b0000",
	darksalmon: "#e9967a",
	darkseagreen: "#8fbc8f",
	darkslateblue: "#483d8b",
	darkslategray: "#2f4f4f",
	darkslategrey: "#2f4f4f",
	darkturquoise: "#00ced1",
	darkviolet: "#9400d3",
	deeppink: "#ff1493",
	deepskyblue: "#00bfff",
	dimgray: "#696969",
	dimgrey: "#696969",
	dodgerblue: "#1e90ff",
	firebrick: "#b22222",
	floralwhite: "#fffaf0",
	forestgreen: "#228b22",
	fuchsia: "#ff00ff",
	gainsboro: "#dcdcdc",
	ghostwhite: "#f8f8ff",
	gold: "#ffd700",
	goldenrod: "#daa520",
	gray: "#808080",
	green: "#008000",
	greenyellow: "#adff2f",
	grey: "#808080",
	honeydew: "#f0fff0",
	hotpink: "#ff69b4",
	indianred: "#cd5c5c",
	indigo: "#4b0082",
	ivory: "#fffff0",
	khaki: "#f0e68c",
	lavender: "#e6e6fa",
	lavenderblush: "#fff0f5",
	lawngreen: "#7cfc00",
	lemonchiffon: "#fffacd",
	lightblue: "#add8e6",
	lightcoral: "#f08080",
	lightcyan: "#e0ffff",
	lightgoldenrodyellow: "#fafad2",
	lightgray: "#d3d3d3",
	lightgreen: "#90ee90",
	lightgrey: "#d3d3d3",
	lightpink: "#ffb6c1",
	lightsalmon: "#ffa07a",
	lightseagreen: "#20b2aa",
	lightskyblue: "#87cefa",
	lightslategray: "#778899",
	lightslategrey: "#778899",
	lightsteelblue: "#b0c4de",
	lightyellow: "#ffffe0",
	lime: "#00ff00",
	limegreen: "#32cd32",
	linen: "#faf0e6",
	magenta: "#ff00ff",
	maroon: "#800000",
	mediumaquamarine: "#66cdaa",
	mediumblue: "#0000cd",
	mediumorchid: "#ba55d3",
	mediumpurple: "#9370db",
	mediumseagreen: "#3cb371",
	mediumslateblue: "#7b68ee",
	mediumspringgreen: "#00fa9a",
	mediumturquoise: "#48d1cc",
	mediumvioletred: "#c71585",
	midnightblue: "#191970",
	mintcream: "#f5fffa",
	mistyrose: "#ffe4e1",
	moccasin: "#ffe4b5",
	navajowhite: "#ffdead",
	navy: "#000080",
	oldlace: "#fdf5e6",
	olive: "#808000",
	olivedrab: "#6b8e23",
	orange: "#ffa500",
	orangered: "#ff4500",
	orchid: "#da70d6",
	palegoldenrod: "#eee8aa",
	palegreen: "#98fb98",
	paleturquoise: "#afeeee",
	palevioletred: "#db7093",
	papayawhip: "#ffefd5",
	peachpuff: "#ffdab9",
	peru: "#cd853f",
	pink: "#ffc0cb",
	plum: "#dda0dd",
	powderblue: "#b0e0e6",
	purple: "#800080",
	rebeccapurple: "#663399",
	red: "#ff0000",
	rosybrown: "#bc8f8f",
	royalblue: "#4169e1",
	saddlebrown: "#8b4513",
	salmon: "#fa8072",
	sandybrown: "#f4a460",
	seagreen: "#2e8b57",
	seashell: "#fff5ee",
	sienna: "#a0522d",
	silver: "#c0c0c0",
	skyblue: "#87ceeb",
	slateblue: "#6a5acd",
	slategray: "#708090",
	slategrey: "#708090",
	snow: "#fffafa",
	springgreen: "#00ff7f",
	steelblue: "#4682b4",
	tan: "#d2b48c",
	teal: "#008080",
	thistle: "#d8bfd8",
	tomato: "#ff6347",
	turquoise: "#40e0d0",
	violet: "#ee82ee",
	wheat: "#f5deb3",
	white: "#ffffff",
	whitesmoke: "#f5f5f5",
	yellow: "#ffff00",
	yellowgreen: "#9acd32"
};

// Deduplicate by hex value to avoid gray/grey type duplicates
const COLOR_NAMES = Object.entries(CSS_COLOR_DATA)
	.filter(([name, hex], i, arr) => arr.findIndex(([, h]) => h === hex) === i)
	.map(([name]) => name);

let score = 0;
let round = 1;
let currentTarget = "";

function hexToRgb(hex) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return { r, g, b };
}

function getColorDistance(c1, c2) {
	const r1 = hexToRgb(CSS_COLOR_DATA[c1]);
	const r2 = hexToRgb(CSS_COLOR_DATA[c2]);
	return Math.sqrt(
		Math.pow(r1.r - r2.r, 2) + Math.pow(r1.g - r2.g, 2) + Math.pow(r1.b - r2.b, 2)
	);
}

function closeTutorial() {
	document.getElementById("tutorial-overlay").classList.add("hidden");
	initRound();
}

function initRound() {
	if (round > 10) return showResults();

	const grid = document.getElementById("options-grid");
	grid.innerHTML = "";
	document.getElementById("round-display").textContent = `Round: ${round}/10`;

	currentTarget = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
	const nameDisplay = document.getElementById("target-name");
	nameDisplay.textContent = currentTarget;
	nameDisplay.style.color = "#333";

	const similar = COLOR_NAMES.filter((name) => name !== currentTarget)
		.map((name) => ({ name, d: getColorDistance(currentTarget, name) }))
		.sort((a, b) => a.d - b.d);

	const distractors = similar
		.slice(0, 8)
		.sort(() => Math.random() - 0.5)
		.slice(0, 3)
		.map((x) => x.name);

	const choices = [currentTarget, ...distractors].sort(
		() => Math.random() - 0.5
	);

	choices.forEach((color) => {
		const div = document.createElement("div");
		div.className = "color-option";
		div.style.backgroundColor = color;
		div.onclick = () => handleChoice(color, div);
		grid.appendChild(div);
	});
}

function handleChoice(selected, el) {
	const options = document.querySelectorAll(".color-option");
	options.forEach((o) => (o.style.pointerEvents = "none"));

	if (selected === currentTarget) {
		score++;
		document.getElementById("score-display").textContent = `Score: ${score}`;
		el.style.borderColor = "#27ae60";
	} else {
		el.classList.add("shake");
		el.style.borderColor = "#e74c3c";
		options.forEach((o) => {
			const computedBg = window.getComputedStyle(o).backgroundColor;
			if (isRgbMatch(computedBg, CSS_COLOR_DATA[currentTarget])) {
				o.style.borderColor = "#27ae60";
				o.style.transform = "scale(1.05)";
			}
		});
	}

	setTimeout(() => {
		round++;
		initRound();
	}, 1200);
}

function isRgbMatch(rgbStr, hexTarget) {
	const match = rgbStr.match(/\d+/g);
	if (!match) return false;
	const [r, g, b] = match.map(Number);
	const target = hexToRgb(hexTarget);
	return r === target.r && g === target.g && b === target.b;
}

function showResults() {
	document.getElementById(
		"final-score"
	).textContent = `You scored ${score} out of 10!`;
	document.getElementById("result-overlay").classList.remove("hidden");
}

function resetGame() {
	score = 0;
	round = 1;
	document.getElementById("score-display").textContent = `Score: 0`;
	document.getElementById("result-overlay").classList.add("hidden");
	initRound();
}
