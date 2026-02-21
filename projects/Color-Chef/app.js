const BASE_COLORS = [
	{ name: "Red", css: "red", rgb: [255, 0, 0] },
	{ name: "Yellow", css: "yellow", rgb: [255, 255, 0] },
	{ name: "Blue", css: "blue", rgb: [0, 0, 255] },
	{ name: "White", css: "white", rgb: [255, 255, 255] },
	{ name: "Black", css: "black", rgb: [0, 0, 0] },
	{ name: "Green", css: "green", rgb: [0, 128, 0] },
	{ name: "Crimson", css: "crimson", rgb: [220, 20, 60] },
	{ name: "Orange", css: "orange", rgb: [255, 165, 0] },
	{ name: "Cyan", css: "cyan", rgb: [0, 255, 255] },
	{ name: "Magenta", css: "magenta", rgb: [255, 0, 255] },
	{ name: "Coral", css: "coral", rgb: [255, 127, 80] },
	{ name: "Teal", css: "teal", rgb: [0, 128, 128] }
];

function computeTarget(recipe) {
	let r = 0,
		g = 0,
		b = 0,
		total = 0;
	recipe.forEach(({ name, count }) => {
		const c = BASE_COLORS.find((x) => x.name === name);
		r += c.rgb[0] * count;
		g += c.rgb[1] * count;
		b += c.rgb[2] * count;
		total += count;
	});
	return [Math.round(r / total), Math.round(g / total), Math.round(b / total)];
}

const ORDERS = [
	// Easy — 2 colors
	{
		name: "Sunrise Orange",
		hint: "Red and Yellow in equal parts",
		level: "Easy",
		recipe: [
			{ name: "Red", count: 1 },
			{ name: "Yellow", count: 1 }
		]
	},
	{
		name: "Cotton Candy",
		hint: "White with a kiss of Magenta",
		level: "Easy",
		recipe: [
			{ name: "White", count: 3 },
			{ name: "Magenta", count: 1 }
		]
	},
	{
		name: "Icy Blue",
		hint: "Cyan heavily lightened with White",
		level: "Easy",
		recipe: [
			{ name: "Cyan", count: 1 },
			{ name: "White", count: 3 }
		]
	},
	{
		name: "Lime Sorbet",
		hint: "Yellow and Green, brightened with White",
		level: "Easy",
		recipe: [
			{ name: "Yellow", count: 2 },
			{ name: "Green", count: 1 },
			{ name: "White", count: 1 }
		]
	},
	{
		name: "Rose Blush",
		hint: "Coral softened with White",
		level: "Easy",
		recipe: [
			{ name: "Coral", count: 1 },
			{ name: "White", count: 2 }
		]
	},
	// Medium — 3 colors
	{
		name: "Dusty Mauve",
		hint: "Magenta, White, and a touch of Black",
		level: "Medium",
		recipe: [
			{ name: "Magenta", count: 1 },
			{ name: "White", count: 3 },
			{ name: "Black", count: 1 }
		]
	},
	{
		name: "Army Green",
		hint: "Green, Yellow, and Black",
		level: "Medium",
		recipe: [
			{ name: "Green", count: 2 },
			{ name: "Yellow", count: 1 },
			{ name: "Black", count: 1 }
		]
	},
	{
		name: "Storm Cloud",
		hint: "Black, White, and Blue",
		level: "Medium",
		recipe: [
			{ name: "Black", count: 1 },
			{ name: "White", count: 3 },
			{ name: "Blue", count: 1 }
		]
	},
	{
		name: "Burnt Amber",
		hint: "Orange, Crimson, and a pinch of Black",
		level: "Medium",
		recipe: [
			{ name: "Orange", count: 2 },
			{ name: "Crimson", count: 1 },
			{ name: "Black", count: 1 }
		]
	},
	{
		name: "Sea Glass",
		hint: "Teal, White, and Cyan",
		level: "Medium",
		recipe: [
			{ name: "Teal", count: 1 },
			{ name: "White", count: 2 },
			{ name: "Cyan", count: 1 }
		]
	},
	// Hard — 4 colors
	{
		name: "Aged Parchment",
		hint: "White, Orange, Yellow, and just a drop of Black",
		level: "Hard",
		recipe: [
			{ name: "White", count: 4 },
			{ name: "Orange", count: 1 },
			{ name: "Yellow", count: 1 },
			{ name: "Black", count: 1 }
		]
	},
	{
		name: "Deep Plum",
		hint: "Magenta, Blue, Black, and a little Red",
		level: "Hard",
		recipe: [
			{ name: "Magenta", count: 2 },
			{ name: "Blue", count: 2 },
			{ name: "Black", count: 2 },
			{ name: "Red", count: 1 }
		]
	},
	{
		name: "Jungle Canopy",
		hint: "Green, Teal, Yellow, and Black",
		level: "Hard",
		recipe: [
			{ name: "Green", count: 2 },
			{ name: "Teal", count: 1 },
			{ name: "Yellow", count: 1 },
			{ name: "Black", count: 2 }
		]
	},
	{
		name: "Dusty Terracotta",
		hint: "Coral, Orange, White, and Black",
		level: "Hard",
		recipe: [
			{ name: "Coral", count: 2 },
			{ name: "Orange", count: 1 },
			{ name: "White", count: 1 },
			{ name: "Black", count: 1 }
		]
	},
	{
		name: "Slate Indigo",
		hint: "Blue, Magenta, Black, and White",
		level: "Hard",
		recipe: [
			{ name: "Blue", count: 2 },
			{ name: "Magenta", count: 1 },
			{ name: "Black", count: 2 },
			{ name: "White", count: 1 }
		]
	}
].map((o) => ({ ...o, target: computeTarget(o.recipe) }));

// ── State ──
let currentOrder = null;
let pours = {};
let totalPours = 0;
let score = 0;
let bestScore = 0;
let orderNum = 1;

function init() {
	renderBottles();
	loadOrder();
	updateRatios();
	updateBowl();
}

function renderBottles() {
	const container = document.getElementById("bottles");
	container.innerHTML = "";
	BASE_COLORS.forEach((c) => {
		const btn = document.createElement("button");
		btn.className = "bottle-btn";
		btn.style.backgroundColor = c.css;
		btn.innerHTML = `<span class="bottle-icon">🫙</span><span class="bottle-name">${c.name}</span>`;
		const isDark = c.rgb[0] * 0.299 + c.rgb[1] * 0.587 + c.rgb[2] * 0.114 < 140;
		btn.style.color = isDark ? "white" : "#06061d";
		btn.style.textShadow = isDark
			? "0 1px 2px rgba(0,0,0,0.3)"
			: "0 1px 2px rgba(255,255,255,0.4)";
		btn.onclick = () => pour(c.name);
		container.appendChild(btn);
	});
}

function loadOrder() {
	const shuffled = [...ORDERS].sort(() => Math.random() - 0.5);
	const idx = orderNum % ORDERS.length;
	currentOrder = shuffled[idx] || ORDERS[idx];

	document.getElementById("ticket").dataset.order = orderNum;
	document.getElementById("target-name").textContent = currentOrder.name;
	document.getElementById(
		"target-hint"
	).textContent = `Hint: ${currentOrder.hint}`;
	document.getElementById("target-swatch").style.backgroundColor = rgbToHex(
		currentOrder.target
	);
	document.getElementById("target-hex-label").textContent = rgbToHex(
		currentOrder.target
	);
	document.getElementById("level-badge").textContent = currentOrder.level;
	document.getElementById("order-display").textContent = orderNum;

	const levelColors = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };
	document.getElementById("level-badge").style.backgroundColor =
		levelColors[currentOrder.level] || "#ccc";
	document.getElementById("level-badge").style.color =
		currentOrder.level === "Hard" ? "white" : "var(--ink)";
}

function pour(colorName) {
	pours[colorName] = (pours[colorName] || 0) + 1;
	totalPours++;
	updateBowl();
	updateRatios();
	showToast(`+1 drop of ${colorName}`);
}

function clearBowl() {
	pours = {};
	totalPours = 0;
	updateBowl();
	updateRatios();
}

function getMixedRGB() {
	if (totalPours === 0) return null;
	let r = 0,
		g = 0,
		b = 0;
	BASE_COLORS.forEach((c) => {
		const count = pours[c.name] || 0;
		if (count > 0) {
			r += c.rgb[0] * count;
			g += c.rgb[1] * count;
			b += c.rgb[2] * count;
		}
	});
	return [
		Math.round(r / totalPours),
		Math.round(g / totalPours),
		Math.round(b / totalPours)
	];
}

function updateBowl() {
	const mixed = getMixedRGB();
	const bowl = document.getElementById("bowl");
	const emptyMsg = document.getElementById("bowl-empty");
	const hexLabel = document.getElementById("bowl-hex");

	if (!mixed) {
		bowl.style.backgroundColor = "#f0f0f0";
		emptyMsg.style.display = "block";
		hexLabel.style.display = "none";
	} else {
		const hex = rgbToHex(mixed);
		bowl.style.backgroundColor = hex;
		emptyMsg.style.display = "none";
		hexLabel.style.display = "block";
		hexLabel.textContent = hex;
	}
}

function updateRatios() {
	const container = document.getElementById("ratios-display");
	container.innerHTML = "";
	Object.entries(pours).forEach(([name, count]) => {
		if (!count) return;
		const c = BASE_COLORS.find((x) => x.name === name);
		const pct = Math.round((count / totalPours) * 100);
		const row = document.createElement("div");
		row.className = "ratio-row";
		row.innerHTML = `
      <span class="ratio-label">${name}</span>
      <div class="ratio-track"><div class="ratio-fill" style="width:${pct}%; background:${c.css}"></div></div>
      <span class="ratio-pct">${pct}%</span>
    `;
		container.appendChild(row);
	});

	if (Object.keys(pours).filter((k) => pours[k] > 0).length === 0) {
		container.innerHTML = `<p style="font-size:0.8rem;opacity:0.4;font-style:italic">No colors poured yet</p>`;
	}
}

function serve() {
	if (totalPours === 0) {
		showToast("Pour something first!");
		return;
	}
	const mixed = getMixedRGB();
	const target = currentOrder.target;
	const accuracy = colorAccuracy(mixed, target);

	const earned = Math.round(accuracy * 100);
	score += earned;
	if (score > bestScore) bestScore = score;
	document.getElementById("score-display").textContent = score;
	document.getElementById("best-display").textContent = bestScore;

	const stars = accuracy >= 0.92 ? "⭐⭐⭐" : accuracy >= 0.75 ? "⭐⭐" : "⭐";
	const msg =
		accuracy >= 0.92
			? "Perfect blend!"
			: accuracy >= 0.75
			? "Pretty close!"
			: accuracy >= 0.5
			? "Needs work..."
			: "Way off, chef!";

	document.getElementById("result-stars").textContent = stars;
	document.getElementById("result-score").textContent =
		Math.round(accuracy * 100) + "%";
	document.getElementById("result-msg").textContent = msg;
	document.getElementById("res-target").style.backgroundColor = rgbToHex(target);
	document.getElementById("res-yours").style.backgroundColor = rgbToHex(mixed);
	document.getElementById("result-panel").classList.add("show");
}

function nextOrder() {
	document.getElementById("result-panel").classList.remove("show");
	orderNum++;
	clearBowl();
	loadOrder();
}

function colorAccuracy(a, b) {
	const dist = Math.sqrt(
		Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2)
	);
	const maxDist = Math.sqrt(3 * 255 * 255);
	return Math.max(0, 1 - dist / maxDist);
}

function rgbToHex([r, g, b]) {
	return (
		"#" +
		[r, g, b]
			.map((v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, "0"))
			.join("")
	);
}

let toastTimer;
function showToast(msg) {
	const t = document.getElementById("toast");
	t.textContent = msg;
	t.classList.add("show");
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => t.classList.remove("show"), 1500);
}

init();
