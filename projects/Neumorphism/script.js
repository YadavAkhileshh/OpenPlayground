const toggle = document.getElementById("toggle");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("active");
});

// Button press animation toggle
const buttons = document.querySelectorAll(".btn");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
  });
});
