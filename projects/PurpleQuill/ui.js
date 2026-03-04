let selectedTone = "Professional";
let selectedPlatform = "Blog";

/* Tone Buttons */
document.querySelectorAll("#toneButtons button").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll("#toneButtons button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    selectedTone = btn.dataset.tone;
  });
});

/* Platform Buttons */
document.querySelectorAll("#platformButtons button").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll("#platformButtons button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    selectedPlatform = btn.dataset.platform;
  });
});
