let timeLeft = 10;

const timerText = document.getElementById("timer");
const lockedSection = document.getElementById("locked-section");
const button = document.querySelector("button");

const countdown = setInterval(() => {
  timeLeft--;
  timerText.textContent = `Unlocks in ${timeLeft} seconds`;

  if (timeLeft === 0) {
    clearInterval(countdown);
    lockedSection.classList.add("unlocked");
    lockedSection.textContent = "🔓 Unlocked Content";
    timerText.textContent = "Content Unlocked!";
    button.textContent = "Unlocked";
    button.classList.add("active");
    button.disabled = false;
  }
}, 1000);