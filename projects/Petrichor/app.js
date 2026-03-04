// ---- COPY HEX TO CLIPBOARD ----
function copyHex(el, hex) {
	navigator.clipboard.writeText(hex).catch(() => {});
	el.classList.add("copied");
	setTimeout(() => el.classList.remove("copied"), 1200);
}

// ---- STAGGERED SWATCH ENTRANCE ----
document.querySelectorAll(".swatch").forEach((swatch, i) => {
	swatch.style.opacity = "0";
	swatch.style.transform = "translateY(20px)";
	swatch.style.transition =
		"opacity 0.5s ease, transform 0.5s ease, box-shadow 0.4s ease";

	setTimeout(() => {
		swatch.style.opacity = "1";
		swatch.style.transform = "translateY(0)";
	}, 400 + i * 60);
});
