/*
Thank you to Niall - (https://codepen.io/niallains/pen/ExEOmdJ)
This Tartan Plaid Generator is based on the original work by Niall. Thank you for sharing your creative code and inspiring this project!
*/

const BASE_COLORS = [
	"#000000",
	"#d3d3d3",
	"#5f9ea0",
	"#000080",
	"#008080",
	"#6495ed",
	"#40e0d0",
	"#808000",
	"#ffd700",
	"#800000",
	"#ff8c00",
	"#dc143c",
	"#a52a2a",
	"#006400",
	"#228b22",
	"#20b2aa",
	"#800080",
	"#c71585",
	"#d8bfd8"
];
let selectedColors = [...BASE_COLORS.slice(0, 6)];
let currentLines = [];
let currentBgColor = selectedColors[0];
let paletteCollapsed = !1;
let currentSeed = Math.floor(Math.random() * 10000);
let dragSrcEl = null;
let isDragging = !1;
const patternTiles = [];
const PATTERN_WIDTH = 25;
let BASE = 6;
let currentColor = {
	h: 0,
	s: 100,
	b: 100
};
let isMouseDown = !1;
let activeElement = null;

function togglePalette() {
	const controls = document.getElementById("controls");
	const toggleBtn = document.getElementById("toggleBtn");
	paletteCollapsed = !paletteCollapsed;
	controls.classList.toggle("collapsed", paletteCollapsed);
	toggleBtn.textContent = paletteCollapsed ? "▶" : "◀";
	updateHelpButtonPosition();
}

function updateHelpButtonPosition() {
	const helpBtn = document.getElementById("helpBtn");
	const controls = document.getElementById("controls");
	const controlsRect = controls.getBoundingClientRect();
	if (paletteCollapsed) {
		helpBtn.style.left =
			controlsRect.left + controlsRect.width * 0.15 + 20 + "px";
	} else {
		helpBtn.style.left = controlsRect.right + 20 + "px";
	}
}

function openHelpModal() {
	const modal = document.getElementById("helpModal");
	modal.classList.add("active");
}

function closeHelpModal() {
	const modal = document.getElementById("helpModal");
	modal.classList.remove("active");
}

function scrollToLanguage(lang) {
	const element = document.getElementById("lang-" + lang);
	if (element) {
		const content = document.getElementById("helpContent");
		content.scrollTo({
			top: element.offsetTop - content.offsetTop - 20,
			behavior: "smooth"
		});
		document.querySelectorAll(".flag-btn").forEach((btn) => {
			btn.classList.remove("active");
		});
		event.target.classList.add("active");
	}
}

function initColorPalette() {
	const palette = document.getElementById("colorPalette");
	const selectedContainer = document.getElementById("selectedColors");
	palette.innerHTML = "";
	selectedContainer.innerHTML = "";
	selectedColors.forEach((color) => {
		const colorOption = createColorOption(color, !0);
		selectedContainer.appendChild(colorOption);
	});
	BASE_COLORS.forEach((color) => {
		if (!selectedColors.includes(color)) {
			const colorOption = createColorOption(color, !1);
			palette.appendChild(colorOption);
		}
	});
}

function createColorOption(color, isSelected) {
	const colorOption = document.createElement("div");
	colorOption.className = "color-option";
	colorOption.style.backgroundColor = color;
	colorOption.dataset.color = color;
	colorOption.draggable = isSelected;
	if (isSelected) {
		colorOption.classList.add("selected");
		colorOption.addEventListener("dragstart", handleDragStart);
		colorOption.addEventListener("dragover", handleDragOver);
		colorOption.addEventListener("dragenter", handleDragEnter);
		colorOption.addEventListener("dragleave", handleDragLeave);
		colorOption.addEventListener("drop", handleDrop);
		colorOption.addEventListener("dragend", handleDragEnd);
	}
	colorOption.onclick = (e) => {
		if (isDragging) {
			isDragging = !1;
			return;
		}
		if (isSelected) {
			const index = selectedColors.indexOf(color);
			if (index > -1) {
				selectedColors.splice(index, 1);
			}
		} else {
			selectedColors.push(color);
		}
		initColorPalette();
		generatePatternWithCurrentSeed();
	};
	return colorOption;
}

function handleDragStart(e) {
	if (e.target.className.includes("color-option")) {
		dragSrcEl = e.target;
		isDragging = !0;
		e.target.classList.add("dragging");
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/html", e.target.outerHTML);
	}
}

function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
	e.dataTransfer.dropEffect = "move";
	return !1;
}

function handleDragEnter(e) {
	if (e.target.className.includes("color-option") && e.target !== dragSrcEl) {
		e.target.classList.add("drop-target");
	}
}

function handleDragLeave(e) {
	if (e.target.className.includes("color-option")) {
		e.target.classList.remove("drop-target");
	}
}

function handleDrop(e) {
	e.stopPropagation();
	e.preventDefault();
	if (
		dragSrcEl &&
		dragSrcEl !== e.target &&
		e.target.className.includes("color-option")
	) {
		e.target.classList.remove("drop-target");
		const draggedColor = dragSrcEl.dataset.color;
		const targetColor = e.target.dataset.color;
		const draggedIndex = selectedColors.indexOf(draggedColor);
		const targetIndex = selectedColors.indexOf(targetColor);
		if (draggedIndex > -1 && targetIndex > -1) {
			[selectedColors[draggedIndex], selectedColors[targetIndex]] = [
				selectedColors[targetIndex],
				selectedColors[draggedIndex]
			];
			initColorPalette();
			generatePatternWithCurrentSeed();
		}
	}
	return !1;
}

function handleDragEnd(e) {
	if (dragSrcEl) {
		dragSrcEl.classList.remove("dragging");
		document.querySelectorAll(".color-option.drop-target").forEach((el) => {
			el.classList.remove("drop-target");
		});
		dragSrcEl = null;
	}
}

function initColorPicker() {
	const pickerButton = document.getElementById("picker-button");
	const colorPicker = document.getElementById("colorPicker");
	const colorSquare = document.querySelector(".color-square");
	const hueBar = document.querySelector(".hue-bar");
	const colorSelector = document.querySelector(".color-selector-outer");
	const hueSelector = document.querySelector(".hue-selector");
	const addColorBtn = document.getElementById("addColorBtn");
	pickerButton.style.backgroundColor = hsbToHex(currentColor);
	pickerButton.addEventListener("click", function (e) {
		const rect = this.getBoundingClientRect();
		colorPicker.style.left = rect.left + window.scrollX + "px";
		colorPicker.style.top = rect.top + rect.height + 10 + window.scrollY + "px";
		colorPicker.style.display = "block";
		e.stopPropagation();
	});
	document.addEventListener("click", function (e) {
		if (!colorPicker.contains(e.target) && e.target !== pickerButton) {
			colorPicker.style.display = "none";
		}
	});
	colorPicker.addEventListener("click", function (e) {
		e.stopPropagation();
	});
	colorSquare.addEventListener("mousedown", function (e) {
		isMouseDown = !0;
		activeElement = "color";
		updateColorFromSquare(e);
	});
	hueBar.addEventListener("mousedown", function (e) {
		isMouseDown = !0;
		activeElement = "hue";
		updateHue(e);
	});
	document.addEventListener("mousemove", function (e) {
		if (!isMouseDown) return;
		if (activeElement === "color") {
			updateColorFromSquare(e);
		} else if (activeElement === "hue") {
			updateHue(e);
		}
	});
	document.addEventListener("mouseup", function () {
		isMouseDown = !1;
		activeElement = null;
	});
	addColorBtn.addEventListener("click", function () {
		const hexColor = hsbToHex(currentColor);
		addColorFromPicker(hexColor);
	});

	function updateColorFromSquare(e) {
		const rect = colorSquare.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const x = Math.max(0, Math.min(e.clientX - rect.left, width));
		const y = Math.max(0, Math.min(e.clientY - rect.top, height));
		currentColor.s = Math.round((x / width) * 100);
		currentColor.b = 100 - Math.round((y / height) * 100);
		updateUI();
	}

	function updateHue(e) {
		const rect = hueBar.getBoundingClientRect();
		const height = rect.height;
		const y = Math.max(0, Math.min(e.clientY - rect.top, height));
		currentColor.h = Math.round((1 - y / height) * 360);
		updateUI();
	}

	function updateUI() {
		const squareRect = colorSquare.getBoundingClientRect();
		const squareWidth = squareRect.width;
		const squareHeight = squareRect.height;
		const selectorX = (currentColor.s / 100) * squareWidth;
		const selectorY = ((100 - currentColor.b) / 100) * squareHeight;
		colorSelector.style.left = selectorX + "px";
		colorSelector.style.top = selectorY + "px";
		const hueRect = hueBar.getBoundingClientRect();
		const hueHeight = hueRect.height;
		const hueY = ((360 - currentColor.h) / 360) * hueHeight;
		hueSelector.style.top = hueY + "px";
		const hueColor = hsbToHex({
			h: currentColor.h,
			s: 100,
			b: 100
		});
		colorSquare.style.backgroundColor = hueColor;
		const hexColor = hsbToHex(currentColor);
		pickerButton.style.backgroundColor = hexColor;
	}
}

function hsbToHex(hsb) {
	const rgb = hsbToRgb(hsb);
	return rgbToHex(rgb);
}

function hsbToRgb(hsb) {
	const h = hsb.h / 360;
	const s = hsb.s / 100;
	const b = hsb.b / 100;
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = b * (1 - s);
	const q = b * (1 - f * s);
	const t = b * (1 - (1 - f) * s);
	let r, g, bVal;
	switch (i % 6) {
		case 0:
			r = b;
			g = t;
			bVal = p;
			break;
		case 1:
			r = q;
			g = b;
			bVal = p;
			break;
		case 2:
			r = p;
			g = b;
			bVal = t;
			break;
		case 3:
			r = p;
			g = q;
			bVal = b;
			break;
		case 4:
			r = t;
			g = p;
			bVal = b;
			break;
		case 5:
			r = b;
			g = p;
			bVal = q;
			break;
		default:
			r = 0;
			g = 0;
			bVal = 0;
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(bVal * 255)
	};
}

function rgbToHex(rgb) {
	return (
		"#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b)
	);
}

function componentToHex(c) {
	const hex = c.toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

function addColorFromPicker(color) {
	if (!BASE_COLORS.includes(color) && !selectedColors.includes(color)) {
		BASE_COLORS.push(color);
		selectedColors.push(color);
		initColorPalette();
		generatePatternWithCurrentSeed();
	}
	document.getElementById("colorPicker").style.display = "none";
}

function getLine(vert, color, offset) {
	const OFF_X = vert ? offset * BASE : BASE / 2,
		OFF_Y = vert ? 0 : offset * BASE;
	return `linear-gradient(
          45deg,
          ${color} 0 ${BASE / 3}px,
          transparent ${BASE / 3}px ${BASE * (2 / 3)}px,
          ${color} ${BASE * (2 / 3)}px ${BASE}px,
          transparent ${BASE + 1}px
        ) ${OFF_X}px ${OFF_Y}px /
        ${BASE}px ${BASE}px repeat-${vert ? "y" : "x"}`;
}

function getPattern(lines, bg) {
	const WIDTH = (PATTERN_WIDTH - 1) * 2;
	let css = "";
	lines.forEach((l) => {
		for (let pos = l[1]; pos < l[1] + l[2]; pos++) {
			const mixedColor = `color-mix(in srgb, ${l[0]} 75%, ${bg} 25%)`;
			css +=
				getLine(!1, l[0], pos) +
				", " +
				getLine(!0, mixedColor, pos) +
				", " +
				getLine(!1, l[0], WIDTH - pos) +
				", " +
				getLine(!0, l[0], WIDTH - pos) +
				", ";
		}
	});
	return css + bg;
}

function generatePatternWithCurrentSeed() {
	stopAnimation();
	BASE = parseInt(document.getElementById("lineWidth").value);
	const patternDensity = parseInt(
		document.getElementById("patternDensity").value
	);
	const RNG = [0x80000000, 1103515245, 12345, currentSeed];
	const randInt = (max) => {
		RNG[3] = (RNG[1] * RNG[3] + RNG[2]) % RNG[0];
		return Math.floor((max * RNG[3]) / RNG[0]);
	};
	const randEl = (arr) => arr[randInt(arr.length)];
	let lines = [];
	let pos = 4 + randInt(6);
	while (pos < PATTERN_WIDTH) {
		let lineWidthActual = randInt(4);
		if (pos + lineWidthActual > PATTERN_WIDTH) {
			lineWidthActual = PATTERN_WIDTH - pos;
		}
		const shouldAddLine = randInt(10) < patternDensity;
		if (shouldAddLine) {
			lines.push([randEl(selectedColors), pos, lineWidthActual]);
		}
		pos += lineWidthActual;
	}
	currentLines = lines;
	currentBgColor = randEl(selectedColors);
	const pattern = getPattern(lines, currentBgColor);
	const EL_WIDTH = BASE * PATTERN_WIDTH * 2;
	patternTiles.forEach((tile) => {
		tile.style.width = EL_WIDTH + "px";
		tile.style.height = EL_WIDTH + "px";
		tile.style.background = pattern;
	});
	resizePatternContainer();
}

function generateRandomPattern() {
	stopAnimation();
	currentSeed = Math.floor(Math.random() * 10000);
	generatePatternWithCurrentSeed();
}

function resetPattern() {
	selectedColors = [...BASE_COLORS.slice(0, 6)];
	document.getElementById("lineWidth").value = 6;
	document.getElementById("lineWidthValue").textContent = "6";
	document.getElementById("patternDensity").value = 5;
	document.getElementById("densityValue").textContent = "5";
	currentColor = {
		h: 0,
		s: 100,
		b: 100
	};
	document.getElementById("picker-button").style.backgroundColor = hsbToHex(
		currentColor
	);
	currentSeed = Math.floor(Math.random() * 10000);
	initColorPalette();
	generatePatternWithCurrentSeed();
}
let ani;

function startAnimation() {
	clearInterval(ani);
	ani = setInterval(() => {
		generateRandomPattern();
	}, 400);
}

function stopAnimation() {
	clearInterval(ani);
}

function updateSliderValues() {
	document.getElementById(
		"lineWidthValue"
	).textContent = document.getElementById("lineWidth").value;
	document.getElementById("densityValue").textContent = document.getElementById(
		"patternDensity"
	).value;
	generatePatternWithCurrentSeed();
}

function resizePatternContainer() {
	const EL_WIDTH = BASE * PATTERN_WIDTH * 2;
	const container = document.getElementById("patternContainer");
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const tilesX = Math.ceil(viewportWidth / EL_WIDTH) + 2;
	const tilesY = Math.ceil(viewportHeight / EL_WIDTH) + 2;
	const neededTiles = tilesX * tilesY;
	if (patternTiles.length < neededTiles) {
		for (let i = patternTiles.length; i < neededTiles; i++) {
			const tile = document.createElement("div");
			tile.className = "pattern-tile";
			tile.style.width = EL_WIDTH + "px";
			tile.style.height = EL_WIDTH + "px";
			tile.style.background = getPattern(currentLines, currentBgColor);
			container.appendChild(tile);
			patternTiles.push(tile);
		}
	} else if (patternTiles.length > neededTiles) {
		while (patternTiles.length > neededTiles) {
			const tile = patternTiles.pop();
			if (tile && tile.parentNode) {
				tile.parentNode.removeChild(tile);
			}
		}
	}
	container.style.width = tilesX * EL_WIDTH + "px";
	container.style.height = tilesY * EL_WIDTH + "px";
}

function initPage() {
	document
		.getElementById("lineWidth")
		.addEventListener("input", updateSliderValues);
	document
		.getElementById("patternDensity")
		.addEventListener("input", updateSliderValues);
	document.getElementById("toggleBtn").addEventListener("click", togglePalette);
	document.getElementById("helpBtn").addEventListener("click", openHelpModal);
	window.addEventListener("resize", () => {
		resizePatternContainer();
		updateHelpButtonPosition();
	});
	initColorPicker();
	document.getElementById("helpModal").addEventListener("click", (e) => {
		if (e.target.id === "helpModal") {
			closeHelpModal();
		}
	});
	document.addEventListener("keydown", (e) => {
		if (
			e.key === "Escape" &&
			document.getElementById("helpModal").classList.contains("active")
		) {
			closeHelpModal();
		}
	});
	initColorPalette();
	generatePatternWithCurrentSeed();
	updateHelpButtonPosition();
}
initPage();
console.log("&Toc on codepen - https://codepen.io/ol-ivier");
