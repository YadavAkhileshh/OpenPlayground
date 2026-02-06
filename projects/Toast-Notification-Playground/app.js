let selectedTheme = "arcade";
let selectedAnimation = "slide";

const themeIcons = {
	arcade: "fa-gamepad",
	professional: "fa-briefcase",
	brutalist: "fa-cube",
	glass: "fa-wine-glass",
	neon: "fa-bolt-lightning"
};

document.querySelectorAll("#theme-buttons .modern-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		selectedTheme = btn.getAttribute("data-theme");
		document
			.querySelectorAll("#theme-buttons .modern-btn")
			.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
	});
});

document.querySelectorAll("#animation-buttons .modern-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		selectedAnimation = btn.getAttribute("data-animation");
		document
			.querySelectorAll("#animation-buttons .modern-btn")
			.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
	});
});

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast() {
	const container = document.getElementById("toast-container");
	const toast = document.createElement("div");
	toast.className = `toast ${selectedTheme}`;

	const icon = document.createElement("i");
	icon.className = `fa-solid ${themeIcons[selectedTheme] || "fa-bread-slice"}`;

	const text = document.createElement("span");
	text.textContent = `This is a ${capitalize(
		selectedTheme
	)} toast in ${capitalize(selectedAnimation)} style.`;

	const glow = document.createElement("div");
	glow.className = "toast-glow";

	if (selectedTheme === "neon") {
		glow.style.background =
			"radial-gradient(circle, rgba(0,255,0,0.25), transparent 70%)";
	} else if (selectedTheme === "brutalist") {
		glow.style.background =
			"radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)";
	} else if (selectedTheme === "glass") {
		glow.style.background =
			"radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)";
	}

	toast.appendChild(icon);
	toast.appendChild(text);
	toast.appendChild(glow);
	container.appendChild(toast);

	const easing =
		selectedAnimation === "bounce"
			? "cubic-bezier(0.25, 1.5, 0.5, 1)"
			: "ease-out";

	if (selectedTheme === "glass" && selectedAnimation === "zoom") {
		toast.style.animationName = "zoom-glass";
	} else {
		toast.style.animationName = selectedAnimation;
	}

	toast.style.animationDuration = "0.6s";
	toast.style.animationTimingFunction = easing;
	toast.style.animationFillMode = "both";

	setTimeout(() => toast.remove(), 7000);
}
