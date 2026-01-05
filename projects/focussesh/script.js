const siteInput = document.getElementById("siteInput");
const addSiteBtn = document.getElementById("addSite");
const siteList = document.getElementById("siteList");

const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");

const overlay = document.getElementById("overlay");
const motivation = document.getElementById("motivation");

let sites = JSON.parse(localStorage.getItem("blockedSites")) || [];
let time = 25 * 60;
let timer;
let running = false;

const messages = [
  "Stay focused. Your future self will thank you.",
  "Deep work = big results.",
  "Discipline beats motivation.",
  "Just 25 minutes. You got this.",
  "Progress over perfection."
];

function renderSites() {
  siteList.innerHTML = "";
  sites.forEach(site => {
    const li = document.createElement("li");
    li.textContent = site;
    siteList.appendChild(li);
  });
}

addSiteBtn.onclick = () => {
  if (siteInput.value.trim()) {
    sites.push(siteInput.value.trim());
    localStorage.setItem("blockedSites", JSON.stringify(sites));
    siteInput.value = "";
    renderSites();
  }
};

function updateTime() {
  const min = String(Math.floor(time / 60)).padStart(2, "0");
  const sec = String(time % 60).padStart(2, "0");
  timeDisplay.textContent = `${min}:${sec}`;
}

startBtn.onclick = () => {
  if (running) return;

  running = true;
  overlay.style.display = "flex";
  motivation.textContent = messages[Math.floor(Math.random() * messages.length)];

  timer = setInterval(() => {
    time--;
    updateTime();

    if (time <= 0) {
      clearInterval(timer);
      overlay.style.display = "none";
      alert("🎉 Focus session complete!");
      running = false;
    }
  }, 1000);
};

resetBtn.onclick = () => {
  clearInterval(timer);
  time = 25 * 60;
  running = false;
  overlay.style.display = "none";
  updateTime();
};

renderSites();
updateTime();
