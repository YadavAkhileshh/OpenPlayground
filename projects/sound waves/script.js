const game = new SoundWave(document.getElementById("waveCanvas"));
const freqMeter = document.getElementById("freqMeter");
const ampFill = document.getElementById("ampFill");
const scoreDisplay = document.getElementById("score");
const freqSlider = document.getElementById("freqSlider");
const noteBtns = document.querySelectorAll(".note-btn");
const targetFreq = document.getElementById("targetFreq");
const checkBtn = document.getElementById("checkBtn");
freqSlider.addEventListener("input", (e) => {
  game.setFrequency(parseInt(e.target.value));
  freqMeter.textContent = e.target.value + " Hz";
});
noteBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const freq = parseFloat(btn.dataset.freq);
    game.setFrequency(freq);
    freqSlider.value = freq;
    freqMeter.textContent = freq.toFixed(2) + " Hz";
    game.playSound();
    setTimeout(() => game.stopSound(), 500);
  });
});
checkBtn.addEventListener("click", () => {
  if (game.checkMatch()) {
    checkBtn.textContent = "✓ MATCH!";
    checkBtn.style.background = "#10B981";
    setTimeout(() => {
      checkBtn.textContent = "Check Match";
      checkBtn.style.background = "#06B6D4";
      targetFreq.textContent = "Target: " + game.targetFreq + " Hz";
    }, 1000);
  } else {
    checkBtn.textContent = "✗ Try Again";
    checkBtn.style.background = "#EF4444";
    setTimeout(() => {
      checkBtn.textContent = "Check Match";
      checkBtn.style.background = "#06B6D4";
    }, 1000);
  }
});
function gameLoop() {
  game.update();
  game.render();
  scoreDisplay.textContent = game.score;
  ampFill.style.width = game.amplitude * 100 + "%";
  requestAnimationFrame(gameLoop);
}
targetFreq.textContent = "Target: " + game.targetFreq + " Hz";
gameLoop();
