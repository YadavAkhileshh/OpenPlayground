const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
let offset = 0;

function drawWave() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.strokeStyle = "#00f2ff";
  ctx.lineWidth = 2;
  for (let x = 0; x < canvas.width; x++) {
    const y = 75 + Math.sin(x * 0.05 + offset) * 20 + Math.random() * 5;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  offset += 0.1;
  requestAnimationFrame(drawWave);
}

setInterval(() => {
  const focus = Math.floor(Math.random() * 15) + 80;
  document.getElementById("focus-percent").innerText = focus + "%";
  document.getElementById("fatigue-bar").style.width = 100 - focus + "%";
}, 3000);

drawWave();
