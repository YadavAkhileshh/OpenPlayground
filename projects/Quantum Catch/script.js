const game = new QuantumCatch(document.getElementById("quantumCanvas"));
const scoreDisplay = document.getElementById("score");
const waveDisplay = document.getElementById("wave");
const stateDesc = document.getElementById("stateDesc");
const collapseBtn = document.getElementById("collapseBtn");
const entangleBtn = document.getElementById("entangleBtn");
const tunnelBtn = document.getElementById("tunnelBtn");
game.onWaveComplete = () => {
  waveDisplay.textContent = game.wave;
  stateDesc.textContent = `Wave ${game.wave} spawned! Quantum complexity increasing...`;
};
collapseBtn.addEventListener("click", () => game.collapseWave());
entangleBtn.addEventListener("click", () => {
  game.particles.forEach((p) => {
    p.vx = 0;
    p.vy = 0;
  });
});
tunnelBtn.addEventListener("click", () => {
  game.player.x = Math.random() * game.canvas.width;
  game.player.y = Math.random() * game.canvas.height;
});
function gameLoop() {
  game.update();
  game.render();
  scoreDisplay.textContent = game.score;
  waveDisplay.textContent = game.wave;
  requestAnimationFrame(gameLoop);
}
gameLoop();
