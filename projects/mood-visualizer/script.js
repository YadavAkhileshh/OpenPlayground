const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let audioContext;
let analyser;
let source;
let dataArray;
let mood = "happy";

const moodThemes = {
    happy: ["#ffea00", "#ff9800"],
    sad: ["#2196f3", "#0d47a1"],
    focused: ["#4caf50", "#1b5e20"],
    party: ["#ff00ff", "#00ffff"]
};

document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        mood = btn.dataset.mood;
    });
});

document.getElementById("audioFile").addEventListener("change", function() {
    const file = this.files[0];
    const audio = new Audio(URL.createObjectURL(file));
    audio.play();

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audio);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    animate();
});

function animate() {
    requestAnimationFrame(animate);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i];

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, moodThemes[mood][0]);
        gradient.addColorStop(1, moodThemes[mood][1]);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}