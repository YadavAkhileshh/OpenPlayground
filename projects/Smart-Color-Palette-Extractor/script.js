/* ================= CONFIG ================= */

const TARGET_COLORS = 5;
const MERGE_THRESHOLD = 12;
const MIN_DISTANCE = 30;

let currentPalette = [];
let selectedColor = null;
let complianceLevel = "AA";

/* ================= SETUP ================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const overlayContainer = document.getElementById("palette");
const preview = document.getElementById("preview");
const comparison = document.getElementById("comparison");

/* ================= RANDOM IMAGE ================= */

function getRandomImage() {
	const randomId = Math.floor(Math.random() * 1000);
	return `https://picsum.photos/1200/800`;
}

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {
	loadImage(getRandomImage());

	const toggle = document.getElementById("complianceToggle");
	const labels = toggle.querySelectorAll(".toggle-label");

	toggle.addEventListener("click", () => {
		complianceLevel = complianceLevel === "AA" ? "AAA" : "AA";
		toggle.classList.toggle("aaa", complianceLevel === "AAA");

		labels.forEach((label) => {
			label.classList.toggle("active", label.dataset.level === complianceLevel);
		});

		renderCards();
		generateCssVariables();
	});

	document.getElementById("refreshBtn").addEventListener("click", () => {
		loadImage(getRandomImage());
	});

	document.getElementById("imageUpload").addEventListener("change", (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (ev) => {
			const img = new Image();
			img.onload = () => {
				preview.src = ev.target.result;
				analyzeImage(img);
			};
			img.src = ev.target.result;
		};

		reader.readAsDataURL(file);
	});

	document.getElementById("copyCssBtn").addEventListener("click", () => {
		const text = document.getElementById("cssOutput").textContent;
		navigator.clipboard.writeText(text);

		const btn = document.getElementById("copyCssBtn");
		btn.textContent = "Copied!";
		setTimeout(() => (btn.textContent = "Copy"), 1200);
	});
});

/* ================= LOAD IMAGE ================= */

function loadImage(src) {
	const img = new Image();
	img.crossOrigin = "Anonymous";
	img.onload = () => {
		preview.src = src;
		analyzeImage(img);
	};
	img.src = src;
}

/* ================= ANALYZE IMAGE ================= */

function analyzeImage(img) {
	const size = 400;
	canvas.width = size;
	canvas.height = size;

	ctx.drawImage(img, 0, 0, size, size);
	const imageData = ctx.getImageData(0, 0, size, size);

	currentPalette = generateCuratedPalette(imageData.data);
	renderOverlaySwatches(currentPalette);
}

/* ================= PALETTE ENGINE ================= */

function generateCuratedPalette(data) {
	const map = {};
	const step = 8;

	for (let i = 0; i < data.length; i += step) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const key = `${r},${g},${b}`;
		map[key] = (map[key] || 0) + 1;
	}

	let colors = Object.entries(map).map(([rgb, count]) => {
		const [r, g, b] = rgb.split(",").map(Number);
		return {
			r,
			g,
			b,
			hex: rgbToHex(r, g, b),
			lab: rgbToLab(r, g, b),
			count
		};
	});

	colors = mergeSimilar(colors, MERGE_THRESHOLD);
	colors.sort((a, b) => b.count - a.count);

	const selected = [];

	function isFarEnough(candidate) {
		return selected.every((c) => deltaE(candidate.lab, c.lab) > MIN_DISTANCE);
	}

	selected.push(colors[0]);

	for (let i = 1; selected.length < TARGET_COLORS && i < colors.length; i++) {
		if (isFarEnough(colors[i])) {
			selected.push(colors[i]);
		}
	}

	for (let i = 1; selected.length < TARGET_COLORS && i < colors.length; i++) {
		if (!selected.includes(colors[i])) {
			selected.push(colors[i]);
		}
	}

	return selected.slice(0, TARGET_COLORS);
}

/* ================= RENDER SWATCHES ================= */

function renderOverlaySwatches(colors) {
	overlayContainer.innerHTML = "";
	selectedColor = colors[0];

	colors.forEach((c, index) => {
		const swatch = document.createElement("div");
		swatch.className = "swatch";
		swatch.style.background = c.hex;
		swatch.style.color = getAACompliantTextColor(c.hex);
		swatch.textContent = c.hex;

		if (index === 0) swatch.classList.add("selected");

		swatch.onclick = () => {
			document
				.querySelectorAll(".swatch")
				.forEach((s) => s.classList.remove("selected"));
			swatch.classList.add("selected");
			selectedColor = c;
			renderCards();
			generateCssVariables();
		};

		overlayContainer.appendChild(swatch);
	});

	renderCards();
	generateCssVariables();
}

/* ================= CARDS ================= */

// Function to create card with buttons and hover effects
function createCard(bg, textColor, ratio) {
	const card = document.createElement("div");
	card.className = "card";

	const inner = document.createElement("div");
	inner.className = "card-inner";
	inner.style.background = bg;
	inner.style.color = textColor;

	inner.innerHTML = `
    <div class="card-meta">${textColor}</div>
    <h3>Demo Heading</h3>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ligula quam, vestibulum sit amet tellus vitae, luctus condimentum orci.</p>
    <div class="card-ratio">${ratio.toFixed(2)}:1</div>
    <div style="display:flex;gap:12px;">
      <button class="btn btn-primary">Primary</button>
      <button class="btn btn-secondary">Secondary</button>
    </div>
  `;

	card.appendChild(inner);
	comparison.appendChild(card);

	const primary = inner.querySelector(".btn-primary");
	const secondary = inner.querySelector(".btn-secondary");

	// Set initial button styles dynamically
	primary.style.background = textColor;
	primary.style.color = bg;
	primary.style.border = `2px solid ${textColor}`;

	secondary.style.background = "transparent";
	secondary.style.color = textColor;
	secondary.style.border = `2px solid ${textColor}`;

	// Add hover effects in JavaScript
	addButtonHoverEffect(primary, bg, textColor, "primary");
	addButtonHoverEffect(secondary, bg, textColor, "secondary");
}

// Function to add hover effects to buttons dynamically
function addButtonHoverEffect(button, bg, textColor, type) {
	button.addEventListener("mouseenter", () => {
		if (type === "primary") {
			// Primary button hover (transparent background, text color and border)
			button.style.backgroundColor = "transparent";
			button.style.color = textColor; // Text color becomes the card text color
			button.style.borderColor = textColor; // Border color matches text color
		} else {
			// Secondary button hover (background and text color reversed)
			button.style.backgroundColor = textColor; // On hover, background becomes the card bg
			button.style.color = bg; // Text color becomes the card text color
			button.style.borderColor = textColor; // Border color matches the text color
		}
	});

	button.addEventListener("mouseleave", () => {
		if (type === "primary") {
			// Primary button default state (background with text color and border)
			button.style.backgroundColor = textColor;
			button.style.color = bg;
			button.style.borderColor = textColor;
		} else {
			// Secondary button default state (transparent background and text color)
			button.style.backgroundColor = "transparent";
			button.style.color = textColor;
			button.style.borderColor = textColor;
		}
	});
}

function renderCards() {
	comparison.innerHTML = "";
	if (!selectedColor) return;

	const bg = selectedColor.hex;
	const threshold = complianceLevel === "AAA" ? 7 : 4.5;

	let rendered = 0;

	currentPalette.forEach((c) => {
		if (c.hex === bg) return;
		const ratio = contrast(bg, c.hex);
		if (ratio >= threshold) {
			createCard(bg, c.hex, ratio);
			rendered++;
		}
	});

	if (rendered === 0) {
		const blackRatio = contrast(bg, "#000000");
		const whiteRatio = contrast(bg, "#ffffff");

		if (blackRatio >= threshold) {
			createCard(bg, "#000000", blackRatio);
			rendered++;
		}

		if (whiteRatio >= threshold) {
			createCard(bg, "#ffffff", whiteRatio);
			rendered++;
		}
	}

	if (rendered === 0) {
		comparison.innerHTML = `
      <div style="
        padding:40px;
        border-radius:20px;
        background:rgba(255,255,255,0.05);
        opacity:.7;
      ">
        No ${complianceLevel} compliant combinations found for small text.
      </div>
    `;
	}
}

/* ================= CSS OUTPUT ================= */

function generateCssVariables() {
	if (!currentPalette.length) return;

	const threshold = complianceLevel === "AAA" ? 7 : 4.5;

	let css = `:root {\n`;

	currentPalette.forEach((bg, index) => {
		let compliant = [];

		currentPalette.forEach((fg) => {
			if (fg.hex === bg.hex) return;
			if (contrast(bg.hex, fg.hex) >= threshold) {
				compliant.push(fg.hex);
			}
		});

		if (compliant.length === 0) {
			const blackRatio = contrast(bg.hex, "#000000");
			const whiteRatio = contrast(bg.hex, "#ffffff");

			if (blackRatio >= threshold) compliant.push("#000000");
			if (whiteRatio >= threshold) compliant.push("#ffffff");
		}

		let comment = compliant.length
			? ` /* Compliant with: ${compliant.join(", ")} */`
			: ` /* No compliant text colors */`;

		css += `  --color-${index + 1}: ${bg.hex};${comment}\n`;
	});

	css += `}`;

	document.getElementById("cssOutput").textContent = css;
}

/* ================= HELPERS ================= */

function rgbToHex(r, g, b) {
	return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function rgbToLab(r, g, b) {
	const [x, y, z] = rgbToXyz(r, g, b);
	return xyzToLab(x, y, z);
}

function rgbToXyz(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
	g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
	b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
	return [
		r * 0.4124 + g * 0.3576 + b * 0.1805,
		r * 0.2126 + g * 0.7152 + b * 0.0722,
		r * 0.0193 + g * 0.1192 + b * 0.9505
	];
}

function xyzToLab(x, y, z) {
	const refX = 0.95047,
		refY = 1.0,
		refZ = 1.08883;
	x /= refX;
	y /= refY;
	z /= refZ;
	x = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
	y = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
	z = z > 0.008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
	return { l: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

function deltaE(labA, labB) {
	return Math.sqrt(
		(labA.l - labB.l) ** 2 + (labA.a - labB.a) ** 2 + (labA.b - labB.b) ** 2
	);
}

function mergeSimilar(colors, threshold) {
	const merged = [];
	colors.forEach((c) => {
		let found = false;
		for (let m of merged) {
			if (deltaE(c.lab, m.lab) < threshold) {
				m.count += c.count;
				found = true;
				break;
			}
		}
		if (!found) merged.push({ ...c });
	});
	return merged;
}

function luminance(hex) {
	const rgb = hex
		.match(/\w\w/g)
		.map((x) => parseInt(x, 16) / 255)
		.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(a, b) {
	const l1 = luminance(a),
		l2 = luminance(b);
	return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function getAACompliantTextColor(hex) {
	const blackRatio = contrast(hex, "#000000");
	const whiteRatio = contrast(hex, "#ffffff");
	if (blackRatio >= 4.5) return "#000000";
	if (whiteRatio >= 4.5) return "#ffffff";
	return blackRatio > whiteRatio ? "#000000" : "#ffffff";
}
