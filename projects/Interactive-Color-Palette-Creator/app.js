const cursorDot = document.getElementById("cursor-dot");
const cursorOutline = document.getElementById("cursor-outline");

window.addEventListener("mousemove", (e) => {
	const posX = e.clientX;
	const posY = e.clientY;
	cursorDot.style.left = `${posX}px`;
	cursorDot.style.top = `${posY}px`;
	cursorOutline.animate(
		{
			left: `${posX}px`,
			top: `${posY}px`
		},
		{ duration: 500, fill: "forwards" }
	);
});

const stage = document.getElementById("stage");
const tiltCard = document.getElementById("tilt-card");

stage.addEventListener("mousemove", (e) => {
	const rect = stage.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;
	const centerX = rect.width / 2;
	const centerY = rect.height / 2;
	const rotateX = ((y - centerY) / centerY) * -5;
	const rotateY = ((x - centerX) / centerX) * 5;
	tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

stage.addEventListener("mouseleave", () => {
	tiltCard.style.transform = `rotateX(0deg) rotateY(0deg)`;
});

const aestheticNames = [
	{ hex: "#2B2E33", name: "Charcoal" },
	{ hex: "#9C968F", name: "Concrete" },
	{ hex: "#C45B3E", name: "Burnt Clay" },
	{ hex: "#E3DCD2", name: "Plaster" },
	{ hex: "#9FA8A3", name: "Sage Mist" },
	{ hex: "#F0F0EB", name: "Off White" },
	{ hex: "#1A1A1A", name: "Obsidian" },
	{ hex: "#FFFFFF", name: "Pure White" },
	{ hex: "#FF5733", name: "Vermilion" },
	{ hex: "#3357FF", name: "Azure" },
	{ hex: "#33FF57", name: "Jade" },
	{ hex: "#F39C12", name: "Ochre" },
	{ hex: "#8E44AD", name: "Mauve" },
	{ hex: "#34495E", name: "Slate" },
	{ hex: "#16A085", name: "Seafoam" },
	{ hex: "#C0392B", name: "Crimson" },
	{ hex: "#D35400", name: "Pumpkin" },
	{ hex: "#27AE60", name: "Emerald" },
	{ hex: "#2980B9", name: "Ocean" },
	{ hex: "#2C3E50", name: "Midnight" },
	{ hex: "#95A5A6", name: "Silver" },
	{ hex: "#7F8C8D", name: "Asphalt" },
	{ hex: "#E0E0E0", name: "Fog" },
	{ hex: "#F5B7B1", name: "Blush" },
	{ hex: "#D2B4DE", name: "Lavender" },
	{ hex: "#AED6F1", name: "Sky" },
	{ hex: "#A9DFBF", name: "Mint" },
	{ hex: "#F9E79F", name: "Cream" },
	{ hex: "#F5CBA7", name: "Peach" },
	{ hex: "#E59866", name: "Bronze" }
];

function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
		  }
		: null;
}

function getColorName(hex) {
	let minDist = Infinity;
	let closestName = "Custom";
	const rgb1 = hexToRgb(hex);

	if (!rgb1) return "Custom";

	aestheticNames.forEach((c) => {
		const rgb2 = hexToRgb(c.hex);
		const dist = Math.sqrt(
			Math.pow(rgb2.r - rgb1.r, 2) +
				Math.pow(rgb2.g - rgb1.g, 2) +
				Math.pow(rgb2.b - rgb1.b, 2)
		);
		if (dist < minDist) {
			minDist = dist;
			closestName = c.name;
		}
	});
	return closestName;
}

function getLuminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
	const rgb1 = hexToRgb(hex1);
	const rgb2 = hexToRgb(hex2);
	if (!rgb1 || !rgb2) return 1;
	const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
	const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
	const brightest = Math.max(lum1, lum2);
	const darkest = Math.min(lum1, lum2);
	return (brightest + 0.05) / (darkest + 0.05);
}

const inputs = [
	document.getElementById("input-1"),
	document.getElementById("input-2"),
	document.getElementById("input-3"),
	document.getElementById("input-4"),
	document.getElementById("input-5")
];

function updateUI() {
	let colors = [];
	inputs.forEach((input, index) => {
		const color = input.value;
		colors.push(color);

		document.getElementById(`block-${index + 1}`).style.backgroundColor = color;
		document.getElementById(`hex-${index + 1}`).innerText = color.toUpperCase();

		const currentName = document.getElementById(`name-${index + 1}`).innerText;
		const newName = getColorName(color);
		if (currentName === "Custom" || currentName !== newName) {
			document.getElementById(`name-${index + 1}`).innerText = newName;
		}
	});

	const rgbBase = hexToRgb(colors[0]);
	if (rgbBase) {
		const lum = getLuminance(rgbBase.r, rgbBase.g, rgbBase.b);
		document.getElementById("lum-display").innerText = lum.toFixed(2);
	}

	let maxContrast = 0;
	for (let i = 1; i < colors.length; i++) {
		const currentContrast = getContrastRatio(colors[0], colors[i]);
		if (currentContrast > maxContrast) maxContrast = currentContrast;
	}

	let grade = "Low";
	if (maxContrast > 3) grade = "A";
	if (maxContrast > 4.5) grade = "AA";
	if (maxContrast > 7) grade = "AAA";

	document.getElementById("contrast-display").innerText = grade;
}

inputs.forEach((input) => {
	input.addEventListener("input", updateUI);
});

function hexToHsl(hex) {
	let { r, g, b } = hexToRgb(hex);
	(r /= 255), (g /= 255), (b /= 255);
	let max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;
	if (max == min) {
		h = s = 0;
	} else {
		let d = max - min;
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
		h /= 6;
	}
	return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
	l /= 100;
	const a = (s * Math.min(l, 1 - l)) / 100;
	const f = (n) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, "0");
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}

function generateHarmony() {
	const baseColor = inputs[0].value;
	const hsl = hexToHsl(baseColor);

	const c1 = baseColor;
	const c2 = hslToHex(hsl.h, Math.max(0, hsl.s - 20), Math.max(10, hsl.l - 15));
	const c3 = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
	const c4 = hslToHex(hsl.h, 10, 90);
	const c5 = hslToHex((hsl.h + 30) % 360, Math.max(0, hsl.s - 10), hsl.l);

	inputs[1].value = c2;
	inputs[2].value = c3;
	inputs[3].value = c4;
	inputs[4].value = c5;

	updateUI();
	document.getElementById("rule-display").innerText = "Split-Compl.";
}

function downloadImage() {
	const element = document.getElementById("infographic-container");
	cursorDot.style.display = "none";
	cursorOutline.style.display = "none";
	const originalTransform = tiltCard.style.transform;
	tiltCard.style.transform = "none";

	html2canvas(element, { scale: 2, useCORS: true, backgroundColor: null }).then(
		(canvas) => {
			const link = document.createElement("a");
			link.download = "CalculateQuick-Color-Board.png";
			link.href = canvas.toDataURL("image/png");
			link.click();
			tiltCard.style.transform = originalTransform;
			cursorDot.style.display = "block";
			cursorOutline.style.display = "block";
		}
	);
}

document.querySelectorAll("a, button, input").forEach((el) => {
	el.addEventListener("mouseenter", () => {
		cursorOutline.style.transform = "translate(-50%, -50%) scale(1.5)";
		cursorOutline.style.borderColor = "#C45B3E";
	});
	el.addEventListener("mouseleave", () => {
		cursorOutline.style.transform = "translate(-50%, -50%) scale(1)";
		cursorOutline.style.borderColor = "#1A1A1A";
	});
});

document.querySelectorAll("[contenteditable]").forEach((el) => {
	el.addEventListener("mouseenter", () => {
		cursorOutline.style.borderStyle = "dashed";
	});
	el.addEventListener("mouseleave", () => {
		cursorOutline.style.borderStyle = "solid";
	});
});

updateUI();
