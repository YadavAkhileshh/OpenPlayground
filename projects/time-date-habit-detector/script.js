const promptCard = document.getElementById("prompt");
const detectorCard = document.getElementById("detector");

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const dayEl = document.getElementById("day");
const timezoneEl = document.getElementById("timezone");

function startDetector() {
  promptCard.classList.add("hidden");
  detectorCard.classList.remove("hidden");

  updateTime();
  setInterval(updateTime, 1000);
}

function updateTime() {
  const now = new Date();

  timeEl.textContent = now.toLocaleTimeString();
  dateEl.textContent = now.toLocaleDateString();
  dayEl.textContent = now.toLocaleDateString(undefined, { weekday: "long" });
  timezoneEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
}
