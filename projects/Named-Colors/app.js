// 0 = Nailed It, 100 = Who Approved This
const curatedScores = {
	black: 0,
	white: 0,
	red: 0,
	blue: 0,
	green: 2,
	yellow: 4,
	cyan: 6,
	magenta: 8,
	gray: 20,
	grey: 22,
	silver: 18,
	gold: 10,

	navy: 6,
	skyblue: 8,
	dodgerblue: 12,
	steelblue: 18,
	powderblue: 35,
	lightblue: 38,
	deepskyblue: 10,
	cornflowerblue: 28,
	royalblue: 14,
	slateblue: 40,
	mediumslateblue: 97,
	midnightblue: 16,
	aliceblue: 55,
	ghostwhite: 82,

	forestgreen: 12,
	seagreen: 22,
	mediumseagreen: 45,
	darkseagreen: 67,
	palegreen: 52,
	springgreen: 67,
	mediumspringgreen: 70,
	lime: 8,
	limegreen: 14,
	lawngreen: 24,
	chartreuse: 60,
	olive: 18,
	olivedrab: 36,
	darkolivegreen: 42,
	darkgreen: 14,
	lightgreen: 44,
	yellowgreen: 50,
	mintcream: 78,
	honeydew: 72,

	tomato: 60,
	coral: 12,
	salmon: 18,
	darksalmon: 28,
	lightsalmon: 34,
	indianred: 88,
	crimson: 10,
	firebrick: 14,
	darkred: 12,
	pink: 13,
	deeppink: 22,
	hotpink: 32,
	lightpink: 46,
	palevioletred: 68,
	mediumvioletred: 48,
	mistyrose: 76,
	lavenderblush: 84,

	purple: 12,
	indigo: 18,
	violet: 26,
	darkviolet: 28,
	darkorchid: 36,
	orchid: 48,
	mediumorchid: 44,
	mediumpurple: 46,
	rebeccapurple: 83,
	plum: 52,
	thistle: 82,

	khaki: 32,
	darkkhaki: 62,
	lightyellow: 54,
	lemonchiffon: 88,
	papayawhip: 94,
	peachpuff: 74,
	moccasin: 86,
	navajowhite: 91,
	wheat: 30,
	cornsilk: 70,
	ivory: 22,
	beige: 26,
	bisque: 40,
	blanchedalmond: 76,
	oldlace: 60,
	linen: 40,
	floralwhite: 72,
	seashell: 50,
	snow: 36,
	lightgoldenrodyellow: 99,

	brown: 10,
	saddlebrown: 18,
	sienna: 40,
	sandybrown: 79,
	rosybrown: 66,
	chocolate: 14,
	burlywood: 75,
	tan: 36,

	aqua: 10,
	aquamarine: 18,
	turquoise: 22,
	mediumturquoise: 30,
	paleturquoise: 44,
	darkturquoise: 26,
	lightcyan: 52,
	darkcyan: 18,
	teal: 16,

	dimgray: 80,
	dimgrey: 80,
	darkgray: 75,
	darkgrey: 75,
	lightgray: 48,
	lightgrey: 50,
	slategray: 55,
	slategrey: 57,
	darkslategray: 60,
	darkslategrey: 62,
	// lightslategray: 58,
	// lightslategrey: 60,

	orange: 8,
	darkorange: 17,
	orangered: 10,

	gainsboro: 95,
	cadetblue: 48,
	mediumblue: 10,
	darkblue: 12,
	darkmagenta: 28,
	fuchsia: 12
};

const DEFAULT_SCORE = 50;
const START_COLOR = "moccasin";

const tiles = document.querySelectorAll("#color-list .color-tile");
const dotsWrap = document.getElementById("dots");
const scaleTrack = document.querySelector(".scale-track");

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const dotByColor = new Map();

tiles.forEach((tile, idx) => {
	const cssColor = tile.style.getPropertyValue("--c").trim().toLowerCase();
	const label = tile.querySelector(".label")?.textContent.trim() || cssColor;
	const score = clamp(curatedScores[cssColor] ?? DEFAULT_SCORE);

	tile.dataset.color = cssColor;
	tile.style.setProperty("--score", score);

	const dot = document.createElement("div");
	dot.className = "dot";
	dot.dataset.color = cssColor;
	dot.dataset.name = label;
	dot.style.setProperty("--c", cssColor);
	dot.style.setProperty("--x", score);

	const ROWS = 6;
	const ROW_GAP = 22;
	const BASE_TOP = 12;
	dot.style.top = `${BASE_TOP + (idx % ROWS) * ROW_GAP}px`;

	dotByColor.set(cssColor, dot);
	dotsWrap.appendChild(dot);
});

function setActive(cssColor) {
	const dot = dotByColor.get(cssColor);
	if (!dot) return;

	scaleTrack.style.setProperty(
		"--marker",
		clamp(curatedScores[cssColor] ?? DEFAULT_SCORE)
	);

	document
		.querySelectorAll(".dot.is-active")
		.forEach((d) => d.classList.remove("is-active"));

	dot.classList.add("is-active");
}

dotsWrap.addEventListener("mouseover", (e) => {
	const dot = e.target.closest(".dot");
	if (!dot) return;

	setActive(dot.dataset.color);
	clearHintOnce();
});

function showHint(color) {
	const dot = dotByColor.get(color);
	if (!dot) return;

	dot.classList.add("is-hint");
	setActive(color);
}

showHint(START_COLOR);

function clearHintOnce() {
	document
		.querySelectorAll(".dot.is-hint")
		.forEach((d) => d.classList.remove("is-hint"));
}

["pointerdown", "keydown"].forEach((evt) =>
	window.addEventListener(evt, clearHintOnce, { once: true })
);
