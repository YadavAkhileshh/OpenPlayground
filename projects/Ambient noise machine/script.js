let ctx, analyser, dataArray, animId;
let running = false;
let nodes = {};

const canvas = document.getElementById("scope");
const canvasCtx = canvas.getContext("2d");
const btn = document.getElementById("masterBtn");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createNoise(audioCtx, type) {
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  if (type === "rain") {
    const bpf = audioCtx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.value = 1200;
    bpf.Q.value = 0.5;
    source.connect(bpf);
    return { source, output: bpf };
  }
  if (type === "static") {
    const hpf = audioCtx.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 3000;
    source.connect(hpf);
    return { source, output: hpf };
  }
  if (type === "forest") {
    const lpf = audioCtx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 400;
    source.connect(lpf);
    return { source, output: lpf };
  }
  if (type === "ocean") {
    const lpf = audioCtx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 150;
    lpf.Q.value = 8;
    source.connect(lpf);
    return { source, output: lpf };
  }
  if (type === "hum") {
    const osc = audioCtx.createOscillator();
    osc.frequency.value = 60;
    osc.type = "sine";
    return { source: osc, output: osc };
  }
  return { source, output: source };
}

function startAudio() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  dataArray = new Uint8Array(analyser.fftSize);
  analyser.connect(ctx.destination);

  const types = ["rain", "static", "forest", "ocean", "hum"];
  types.forEach((type) => {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const { source, output } = createNoise(ctx, type);
    output.connect(gain);
    gain.connect(analyser);
    source.start();
    nodes[type] = { gain, source };
  });

  draw();
}

function stopAudio() {
  Object.values(nodes).forEach((n) => {
    try {
      n.source.stop();
    } catch (e) {}
  });
  nodes = {};
  ctx.close();
  cancelAnimationFrame(animId);
  clearCanvas();
}

function clearCanvas() {
  canvasCtx.fillStyle =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--panel")
      .trim() || "#0f0f1a";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  animId = requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);
  canvasCtx.fillStyle = "rgba(10,10,15,0.3)";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  canvasCtx.lineWidth = 1.5;
  canvasCtx.strokeStyle = "#00ff9f";
  canvasCtx.shadowColor = "#00ff9f";
  canvasCtx.shadowBlur = 6;
  canvasCtx.beginPath();
  const sliceWidth = canvas.width / dataArray.length;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;
    i === 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
    x += sliceWidth;
  }
  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

btn.addEventListener("click", async () => {
  if (!running) {
    running = true;
    btn.textContent = "⏹ DISENGAGE";
    btn.classList.add("running");
    statusDot.classList.add("active");
    statusText.textContent = "ACTIVE";
    startAudio();
  } else {
    running = false;
    btn.textContent = "▶ ENGAGE";
    btn.classList.remove("running");
    statusDot.classList.remove("active");
    statusText.textContent = "STANDBY";
    stopAudio();
  }
});

const faderMap = {
  rainFader: "rain",
  staticFader: "static",
  forestFader: "forest",
  oceanFader: "ocean",
  humFader: "hum",
};

Object.entries(faderMap).forEach(([faderId, type]) => {
  const fader = document.getElementById(faderId);
  const levelEl = document.getElementById(type + "Level");
  const channel = document.querySelector(`.channel[data-type="${type}"]`);
  fader.addEventListener("input", () => {
    const val = parseFloat(fader.value);
    levelEl.textContent = Math.round(val * 100) + "%";
    document.getElementById("masterVol").textContent =
      "MASTER: " +
      Math.round(
        Math.max(
          ...Object.keys(faderMap).map((id) =>
            parseFloat(document.getElementById(id).value),
          ),
        ) * 100,
      ) +
      "%";
    if (nodes[type])
      nodes[type].gain.gain.setTargetAtTime(val, ctx.currentTime, 0.05);
    channel.classList.toggle("active", val > 0);
  });
});
