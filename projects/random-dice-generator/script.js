const dice = document.getElementById("dice");
const rollBtn = document.getElementById("rollBtn");

rollBtn.addEventListener("click", () => {
  dice.style.transform = "rotate(20deg)";

  setTimeout(() => {
    const roll = Math.floor(Math.random() * 6) + 1;
    dice.textContent = roll;
    dice.style.transform = "rotate(0deg)";
  }, 150);
});
