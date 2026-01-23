const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

document.getElementById("audioFile").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const audio = new Audio(URL.createObjectURL(file));
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  audio.play();

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / bufferLength;
    dataArray.forEach((value, i) => {
      const barHeight = value * 1.2;
      ctx.fillStyle = `hsl(${i * 3}, 100%, 60%)`;
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
    });
  }

  draw();
});
