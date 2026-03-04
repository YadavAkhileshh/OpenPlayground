const textSelect = document.getElementById("textSelect");
const bgSelect = document.getElementById("bgSelect");
const result = document.querySelector(".contrast-result");
const aaBadge = document.querySelector(".aa-badge");
const aaaBadge = document.querySelector(".aaa-badge");
const ratioDisplay = document.querySelector(".ratio-display");
const swatches = document.querySelectorAll(".swatch");
const toast = document.getElementById("toast");

const colorMap = {
	"color-1": "#E6E6FA",
	"color-2": "#C9C9F4",
	"color-3": "#9090E9",
	"color-4": "#3A3AD8",
	"color-5": "#111156",
	"color-6": "#06061D",
	"tint-1": "#F9F9FE",
	"tint-2": "#F2F2FD",
	"tint-3": "#EBEBFC",
	"tint-4": "#E6E6FA",
	"tint-5": "#DCDCF8",
	"tint-6": "#D3D3F6",
	white: "#FFFFFF",
	black: "#000000"
};

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

function getLuminance(r, g, b) {
	const [rs, gs, bs] = [r, g, b].map((c) => {
		c = c / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
	const rgb1 = hexToRgb(color1);
	const rgb2 = hexToRgb(color2);

	const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
	const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

	const lighter = Math.max(lum1, lum2);
	const darker = Math.min(lum1, lum2);

	return (lighter + 0.05) / (darker + 0.05);
}

function updateContrast() {
	const textColor = textSelect.value;
	const bgColor = bgSelect.value;

	const textHex = colorMap[textColor];
	const bgHex = colorMap[bgColor];

	const ratio = getContrastRatio(textHex, bgHex);

	result.style.backgroundColor = bgHex;
	result.style.color = textHex;
	result.setAttribute("data-bg", bgColor);
	result.setAttribute("data-text", textColor);

	ratioDisplay.textContent = `Contrast ratio: ${ratio.toFixed(2)}:1`;

	const aaPass = ratio >= 4.5;
	const aaaPass = ratio >= 7;

	aaBadge.classList.remove("pass", "fail");
	aaBadge.classList.add(aaPass ? "pass" : "fail");
	aaBadge.textContent = aaPass ? "WCAG AA Pass" : "WCAG AA Fail";

	aaaBadge.classList.remove("pass", "fail");
	aaaBadge.classList.add(aaaPass ? "pass" : "fail");
	aaaBadge.textContent = aaaPass ? "WCAG AAA Pass" : "WCAG AAA Fail";
}

textSelect.addEventListener("change", updateContrast);
bgSelect.addEventListener("change", updateContrast);

updateContrast();

swatches.forEach((swatch) => {
	swatch.addEventListener("click", async () => {
		const color = swatch.getAttribute("data-color");

		try {
			await navigator.clipboard.writeText(color);
			showToast();
		} catch (err) {
			const textArea = document.createElement("textarea");
			textArea.value = color;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			document.body.appendChild(textArea);
			textArea.select();

			try {
				document.execCommand("copy");
				showToast();
			} catch (err) {
				console.error("Failed to copy:", err);
			}

			document.body.removeChild(textArea);
		}
	});
});

function showToast() {
	toast.classList.add("show");

	setTimeout(() => {
		toast.classList.remove("show");
	}, 2000);
}

swatches.forEach((swatch) => {
	swatch.setAttribute("tabindex", "0");
	swatch.setAttribute("role", "button");
	swatch.setAttribute(
		"aria-label",
		`Copy ${swatch.getAttribute("data-color")} to clipboard`
	);

	swatch.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			swatch.click();
		}
	});
});
