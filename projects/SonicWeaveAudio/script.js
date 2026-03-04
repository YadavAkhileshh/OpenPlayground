const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioCtx, analyser, dataArray;

// Resize canvas
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Start microphone audio
startBtn.addEventListener("click", async () => {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(stream);

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  source.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  animate();
});

// Draw animation
function animate() {
  requestAnimationFrame(animate);

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bars = dataArray.length;
  const barWidth = canvas.width / bars;

  for (let i = 0; i < bars; i++) {
    const value = dataArray[i];
    const height = value * 2;

    const x = i * barWidth;
    const y = canvas.height - height;

    const hue = i * 3 + value;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

    ctx.fillRect(x, y, barWidth - 2, height);

    // Circle tapestry effect
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      value * 1.5,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = `hsla(${hue},100%,60%,0.2)`;
    ctx.stroke();
  }
}