let time = 300; // 5 minutes
let interval;

function startBreak() {
  clearInterval(interval);
  time = 300;
  document.getElementById("message").innerText = "";

  interval = setInterval(() => {
    time--;

    const minutes = Math.floor(time / 60);
    const seconds = String(time % 60).padStart(2, "0");

    document.getElementById("timer").innerText =
      `${minutes}:${seconds}`;

    if (time === 0) {
      clearInterval(interval);
      document.getElementById("message").innerText =
        "🧠 Time to take a break!";
    }
  }, 1000);
}