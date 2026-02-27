
    (function () {
	const root = document.documentElement;
	const paletteKeys = ["teal", "clay", "sun", "sand", "sage", "ink"];
	const swatchInputs = Array.from(document.querySelectorAll(".swatch-input"));
	const swatchValues = Array.from(
		document.querySelectorAll("[data-color-value]")
	);
	const swatchCards = Array.from(document.querySelectorAll(".swatch-card"));
	const swatchBlocks = Array.from(document.querySelectorAll(".color-swatch"));
	const nameLabels = Array.from(document.querySelectorAll("[data-color-name]"));
	const harmonyChips = Array.from(
		document.querySelectorAll("[data-harmony-key]")
	);
	const contrastNameSpans = Array.from(
		document.querySelectorAll(
			"[data-contrast-foreground], [data-contrast-background]"
		)
	);
	const contrastRows = Array.from(document.querySelectorAll("[data-contrast]"));
	const baseColorInput = document.getElementById("baseColor");
	const paletteMode = document.getElementById("paletteMode");
	const generateButton = document.getElementById("generatePalette");
	const randomButton = document.getElementById("randomPalette");
	const exportButton = document.getElementById("exportPalette");
	const contrastButton = document.getElementById("checkContrast");

	const inputByKey = {};
	swatchInputs.forEach((input) => {
		inputByKey[input.dataset.colorKey] = input;
	});

	const valueByKey = {};
	swatchValues.forEach((value) => {
		valueByKey[value.dataset.colorValue] = value;
	});

	const nameByKey = {};
	nameLabels.forEach((label) => {
		nameByKey[label.dataset.colorName] = label;
	});

	const cardByKey = {};
	swatchCards.forEach((card) => {
		cardByKey[card.dataset.colorKey] = card;
	});

	const currentNames = {};

	const colorNameLibrary = [
		{ name: "Ink", hex: "#1F2B2D" },
		{ name: "Slate", hex: "#3C4B4E" },
		{ name: "Deep Teal", hex: "#1F6F78" },
		{ name: "Lagoon", hex: "#2A8791" },
		{ name: "Sage", hex: "#9DB59E" },
		{ name: "Moss", hex: "#7A8F7A" },
		{ name: "Sand", hex: "#F6E7CF" },
		{ name: "Oat", hex: "#F2E2C8" },
		{ name: "Sun", hex: "#F2C14E" },
		{ name: "Amber", hex: "#EBA741" },
		{ name: "Clay", hex: "#D86B4B" },
		{ name: "Terracotta", hex: "#C75D40" },
		{ name: "Rose", hex: "#D05D7B" },
		{ name: "Plum", hex: "#6E3B5F" },
		{ name: "Indigo", hex: "#2C3A6A" },
		{ name: "Cobalt", hex: "#2C65C8" },
		{ name: "Mint", hex: "#7EC6B2" },
		{ name: "Pearl", hex: "#F8F6F0" }
	];

	function normalizeHex(hex) {
		if (!hex) return "#000000";
		let value = hex.trim().replace("#", "");
		if (value.length === 3) {
			value = value
				.split("")
				.map((c) => c + c)
				.join("");
		}
		value = value.padStart(6, "0").slice(0, 6);
		return `#${value.toUpperCase()}`;
	}

	function rgbToHex(r, g, b) {
		const toHex = (value) => Math.round(value).toString(16).padStart(2, "0");
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
	}

	function parseColorValue(value) {
		if (!value) return "#000000";
		const trimmed = value.trim();
		if (trimmed.startsWith("rgb")) {
			const parts = trimmed.match(/[\d.]+/g) || ["0", "0", "0"];
			return rgbToHex(parts[0], parts[1], parts[2]);
		}
		return normalizeHex(trimmed);
	}

	function hexToRgb(hex) {
		const value = normalizeHex(hex).replace("#", "");
		return {
			r: parseInt(value.slice(0, 2), 16),
			g: parseInt(value.slice(2, 4), 16),
			b: parseInt(value.slice(4, 6), 16)
		};
	}

	function setShadowVariable(name, hex, alpha) {
		const rgb = hexToRgb(hex);
		root.style.setProperty(name, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
	}

	function getNearestColorName(hex) {
		const target = hexToRgb(hex);
		let closest = colorNameLibrary[0].name;
		let bestDistance = Number.POSITIVE_INFINITY;

		colorNameLibrary.forEach((entry) => {
			const rgb = hexToRgb(entry.hex);
			const distance =
				Math.pow(target.r - rgb.r, 2) +
				Math.pow(target.g - rgb.g, 2) +
				Math.pow(target.b - rgb.b, 2);

			if (distance < bestDistance) {
				bestDistance = distance;
				closest = entry.name;
			}
		});

		return closest;
	}

	function getReadableTextColor(hex) {
		const white = "#FFFFFF";
		const dark = "#1F2B2D";
		return contrastRatio(hex, white) >= contrastRatio(hex, dark) ? white : dark;
	}

	function updateSwatchCard(key, hex) {
		const card = cardByKey[key];
		if (!card) return;
		card.style.setProperty("--swatch-text", getReadableTextColor(hex));
	}

	function updateColorName(key, hex) {
		const label = nameByKey[key];
		const name = getNearestColorName(hex);
		currentNames[key] = name;
		if (label) {
			label.textContent = name;
		}
	}

	function getNameForKey(key) {
		return (
			currentNames[key] || getNearestColorName(getPalette()[key] || "#000000")
		);
	}

	function updateContrastLabels() {
		contrastNameSpans.forEach((span) => {
			const key =
				span.dataset.contrastForeground || span.dataset.contrastBackground;
			span.textContent = getNameForKey(key);
		});
	}

	function updateHarmonyChips() {
		harmonyChips.forEach((chip) => {
			const key = chip.dataset.harmonyKey;
			const role = chip.dataset.harmonyRole || "Tone";
			chip.textContent = `${role}: ${getNameForKey(key)}`;
		});
	}

	function updateButtonShadows() {
		const palette = getPalette();
		if (palette.clay) {
			setShadowVariable("--clay-shadow", palette.clay, 0.28);
		}
		if (palette.teal) {
			setShadowVariable("--teal-shadow", palette.teal, 0.24);
		}
	}

	function updateHeroStyling() {
		const palette = getPalette();
		if (palette.teal) {
			setShadowVariable("--hero-cool", palette.teal, 0.14);
		}
		if (palette.sun) {
			setShadowVariable("--hero-warm", palette.sun, 0.2);
		}
		if (palette.clay) {
			setShadowVariable("--hero-glow", palette.clay, 0.35);
		}
	}

	function setColor(key, hex) {
		const value = normalizeHex(hex);
		root.style.setProperty(`--${key}`, value);
		if (inputByKey[key]) {
			inputByKey[key].value = value;
		}
		if (valueByKey[key]) {
			valueByKey[key].textContent = value;
		}
		updateColorName(key, value);
		updateSwatchCard(key, value);
		updateHarmonyChips();
		updateButtonShadows();
		updateHeroStyling();
		refreshContrast();
	}

	function getPalette() {
		const styles = getComputedStyle(root);
		return paletteKeys.reduce((acc, key) => {
			const raw = styles.getPropertyValue(`--${key}`) || inputByKey[key]?.value;
			acc[key] = parseColorValue(raw || "#000000");
			return acc;
		}, {});
	}

	function hexToHsl(hex) {
		const value = normalizeHex(hex).replace("#", "");
		const r = parseInt(value.slice(0, 2), 16) / 255;
		const g = parseInt(value.slice(2, 4), 16) / 255;
		const b = parseInt(value.slice(4, 6), 16) / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0;
		let s = 0;
		const l = (max + min) / 2;

		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h *= 60;
		}

		return {
			h: Math.round(h),
			s: Math.round(s * 100),
			l: Math.round(l * 100)
		};
	}

	function hslToHex(h, s, l) {
		const sat = s / 100;
		const light = l / 100;
		const c = (1 - Math.abs(2 * light - 1)) * sat;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = light - c / 2;
		let r = 0;
		let g = 0;
		let b = 0;

		if (h >= 0 && h < 60) {
			r = c;
			g = x;
		} else if (h >= 60 && h < 120) {
			r = x;
			g = c;
		} else if (h >= 120 && h < 180) {
			g = c;
			b = x;
		} else if (h >= 180 && h < 240) {
			g = x;
			b = c;
		} else if (h >= 240 && h < 300) {
			r = x;
			b = c;
		} else {
			r = c;
			b = x;
		}

		const toHex = (value) => {
			const v = Math.round((value + m) * 255);
			return v.toString(16).padStart(2, "0");
		};

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
	}

	function shiftHue(h, offset) {
		return (h + offset + 360) % 360;
	}

	function buildPalette(baseHex, mode) {
		const base = normalizeHex(baseHex);
		const { h } = hexToHsl(base);

		const offsets = {
			analogous: { warm: 30, accent: 60 },
			complementary: { warm: 180, accent: 210 },
			triadic: { warm: 120, accent: 240 }
		};

		const selected = offsets[mode] || offsets.analogous;

		return {
			teal: base,
			clay: hslToHex(shiftHue(h, selected.warm), 64, 52),
			sun: hslToHex(shiftHue(h, selected.accent), 82, 60),
			sand: hslToHex(shiftHue(h, 18), 55, 92),
			sage: hslToHex(shiftHue(h, -22), 24, 66),
			ink: hslToHex(shiftHue(h, 200), 22, 18)
		};
	}

	function randomHex() {
		const hex = Math.floor(Math.random() * 0xffffff)
			.toString(16)
			.padStart(6, "0");
		return `#${hex.toUpperCase()}`;
	}

	function relativeLuminance(hex) {
		const { r, g, b } = hexToRgb(hex);
		const transform = (value) => {
			const v = value / 255;
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
		};
		const rL = transform(r);
		const gL = transform(g);
		const bL = transform(b);
		return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
	}

	function contrastRatio(hexA, hexB) {
		const lumA = relativeLuminance(hexA);
		const lumB = relativeLuminance(hexB);
		const lighter = Math.max(lumA, lumB);
		const darker = Math.min(lumA, lumB);
		return (lighter + 0.05) / (darker + 0.05);
	}

	function getContrastGrade(ratio) {
		if (ratio >= 7) {
			return "AAA";
		}
		if (ratio >= 4.5) {
			return "AA";
		}
		if (ratio >= 3) {
			return "AA Large";
		}
		return "Fail";
	}

	function refreshContrast() {
		const palette = getPalette();
		updateContrastLabels();

		contrastRows.forEach((row) => {
			const [foregroundKey, backgroundKey] = row.dataset.contrast.split(":");
			const ratio = contrastRatio(palette[foregroundKey], palette[backgroundKey]);
			const value = row.querySelector("[data-contrast-value]");
			const grade = row.querySelector("[data-contrast-grade]");
			if (value) {
				value.textContent = ratio.toFixed(1);
			}
			if (grade) {
				grade.textContent = getContrastGrade(ratio);
			}
			row.classList.toggle("contrast-pass", ratio >= 4.5);
			row.classList.toggle("contrast-warn", ratio < 4.5);
		});
	}

	function flashButton(button, message) {
		if (!button) return;
		const original = button.textContent;
		button.textContent = message;
		button.disabled = true;
		setTimeout(() => {
			button.textContent = original;
			button.disabled = false;
		}, 1200);
	}

	function copyToClipboard(text) {
		if (navigator.clipboard && window.isSecureContext) {
			return navigator.clipboard.writeText(text);
		}

		return new Promise((resolve, reject) => {
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();

			try {
				const success = document.execCommand("copy");
				document.body.removeChild(textarea);
				success ? resolve() : reject();
			} catch (error) {
				document.body.removeChild(textarea);
				reject(error);
			}
		});
	}

	function downloadText(filename, text) {
		const blob = new Blob([text], { type: "text/plain" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	}

	function exportPalette() {
		const palette = getPalette();
		const cssLines = paletteKeys.map((key) => `  --${key}: ${palette[key]};`);
		const cssBlock = `:root {\n${cssLines.join("\n")}\n}`;
		const output = `${cssBlock}\n\n${JSON.stringify(palette, null, 2)}\n`;

		copyToClipboard(output)
			.then(() => flashButton(exportButton, "Copied"))
			.catch(() => {
				downloadText("palette.txt", output);
				flashButton(exportButton, "Downloaded");
			});
	}

	function applyPalette(palette) {
		Object.entries(palette).forEach(([key, value]) => setColor(key, value));
	}

	function generateFromBase(baseHex) {
		const palette = buildPalette(baseHex, paletteMode.value);
		applyPalette(palette);
		baseColorInput.value = palette.teal;
	}

	function randomizePalette() {
		generateFromBase(randomHex());
	}

	swatchInputs.forEach((input) => {
		input.addEventListener("input", () => {
			const key = input.dataset.colorKey;
			setColor(key, input.value);
			if (key === "teal") {
				baseColorInput.value = normalizeHex(input.value);
			}
		});
	});

	swatchBlocks.forEach((block) => {
		block.addEventListener("click", () => {
			const key = block.dataset.colorKey;
			if (inputByKey[key]) {
				inputByKey[key].click();
			}
		});
	});

	baseColorInput.addEventListener("input", () => {
		setColor("teal", baseColorInput.value);
	});

	generateButton.addEventListener("click", () => {
		generateFromBase(baseColorInput.value);
	});

	randomButton.addEventListener("click", () => {
		randomizePalette();
	});

	if (exportButton) {
		exportButton.addEventListener("click", exportPalette);
	}

	if (contrastButton) {
		contrastButton.addEventListener("click", () => {
			refreshContrast();
			flashButton(contrastButton, "Updated");
		});
	}

	swatchInputs.forEach((input) => {
		setColor(input.dataset.colorKey, input.value);
	});

	// Auto-randomize briefly unless the user interacts.
	const autoRandomDurationMs = 2200;
	const autoRandomIntervalMs = 450;
	let autoRandomTimer = null;
	let autoRandomTimeout = null;
	let autoRandomStopped = false;

	function stopAutoRandomize() {
		if (autoRandomStopped) return;
		autoRandomStopped = true;
		if (autoRandomTimer) {
			clearInterval(autoRandomTimer);
		}
		if (autoRandomTimeout) {
			clearTimeout(autoRandomTimeout);
		}
	}

	function startAutoRandomize() {
		if (!baseColorInput || !generateButton || !randomButton) return;
		autoRandomTimer = setInterval(() => {
			if (!autoRandomStopped) {
				randomizePalette();
			}
		}, autoRandomIntervalMs);
		autoRandomTimeout = setTimeout(stopAutoRandomize, autoRandomDurationMs);
	}

	["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
		window.addEventListener(eventName, stopAutoRandomize, {
			once: true,
			passive: true
		});
	});

	startAutoRandomize();
})();

