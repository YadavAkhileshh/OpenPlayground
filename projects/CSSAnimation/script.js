const button = document.getElementById("animateBtn");
const cards = document.querySelectorAll(".card");

button.addEventListener("click", () => {
  cards.forEach(card => {
    card.style.animation = "none";
    card.offsetHeight; // trigger reflow
    card.style.animation = "";
  });
});
