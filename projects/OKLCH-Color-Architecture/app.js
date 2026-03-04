(function () {
	const root = document.documentElement;
	const hueSlider = document.getElementById("hue-slider");
	const chromaSlider = document.getElementById("chroma-slider");
	const hueVal = document.getElementById("hue-val");
	const themeButtons = Array.from(document.querySelectorAll(".theme-btn"));

	if (!hueSlider || !chromaSlider || !hueVal) {
		return;
	}

	const CONFIG = {
		THEME_KEY: "theme",
		HUE_KEY: "hue",
		CHROMA_KEY: "chroma",
		THEME_DEFAULT: "light",
		HUE_MIN: 0,
		HUE_MAX: 360,
		CHROMA_MIN: 0,
		CHROMA_MAX: 0.37
	};

	function clamp(value, min, max) {
		const n = parseFloat(value);
		if (Number.isNaN(n)) return min;
		return Math.max(min, Math.min(max, n));
	}

	function safeGet(key, fallback) {
		try {
			const value = localStorage.getItem(key);
			return value === null ? fallback : value;
		} catch (error) {
			return fallback;
		}
	}

	function safeSet(key, value) {
		try {
			localStorage.setItem(key, String(value));
		} catch (error) {
			/* ignore storage errors */
		}
	}

	function sanitizeTheme(value) {
		return value === "dark" ? "dark" : "light";
	}

	function setTheme(theme) {
		const safeTheme = sanitizeTheme(theme);
		root.style.colorScheme = safeTheme;
		root.dataset.theme = safeTheme;

		themeButtons.forEach((btn) => {
			const isActive = btn.dataset.theme === safeTheme;
			btn.classList.toggle("active", isActive);
			btn.setAttribute("aria-pressed", isActive ? "true" : "false");
		});

		safeSet(CONFIG.THEME_KEY, safeTheme);
	}

	function applyColorState() {
		const hue = clamp(hueSlider.value, CONFIG.HUE_MIN, CONFIG.HUE_MAX);
		const chroma = clamp(
			chromaSlider.value,
			CONFIG.CHROMA_MIN,
			CONFIG.CHROMA_MAX
		);

		hueSlider.value = String(hue);
		chromaSlider.value = String(chroma);

		root.style.setProperty("--hue", String(hue));
		root.style.setProperty("--chroma", chroma.toFixed(2));
		hueVal.textContent = String(Math.round(hue));

		safeSet(CONFIG.HUE_KEY, Math.round(hue));
		safeSet(CONFIG.CHROMA_KEY, chroma.toFixed(2));
	}

	const initialTheme = sanitizeTheme(
		safeGet(CONFIG.THEME_KEY, CONFIG.THEME_DEFAULT)
	);
	const initialHue = clamp(
		safeGet(CONFIG.HUE_KEY, hueSlider.value),
		CONFIG.HUE_MIN,
		CONFIG.HUE_MAX
	);
	const initialChroma = clamp(
		safeGet(CONFIG.CHROMA_KEY, chromaSlider.value),
		CONFIG.CHROMA_MIN,
		CONFIG.CHROMA_MAX
	);

	hueSlider.value = String(initialHue);
	chromaSlider.value = String(initialChroma);
	setTheme(initialTheme);
	applyColorState();

	hueSlider.addEventListener("input", applyColorState);
	chromaSlider.addEventListener("input", applyColorState);

	themeButtons.forEach((btn) => {
		btn.addEventListener("click", function (event) {
			event.preventDefault();
			setTheme(btn.dataset.theme);
		});
	});
})();
