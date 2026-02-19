const sd = new StellarDodge(document.getElementById("gameCanvas"));
const $ = (id) => document.getElementById(id);
const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
};
const getHi = () => +localStorage.getItem("sdHi") || 0;
const setHi = (s) => {
  if (s > getHi()) localStorage.setItem("sdHi", s);
};

// star field builder
function buildStars(containerId) {
  const el = $(containerId);
  if (!el) return;
  for (let i = 0; i < 80; i++) {
    const d = document.createElement("div");
    const sz = Math.random() * 2 + 0.5;
    d.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(180,200,220,${Math.random() * 0.7 + 0.2});left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation:twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s;`;
    el.appendChild(d);
  }
}
buildStars("starField");
buildStars("starField2");

const style = document.createElement("style");
style.textContent = "@keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}";
document.head.appendChild(style);

$("startHi").textContent = getHi().toLocaleString();

function startGame() {
  show("gameScreen");
  sd.init();
  let lastShot = 0;
  function loop() {
    sd.update();
    sd.draw();
    if (sd.keys[" "] || sd.keys["z"]) {
      const now = Date.now();
      if (now - lastShot > 180) {
        sd.shoot();
        lastShot = now;
      }
    }
    $("hudScore").textContent = sd.score.toString().padStart(6, "0");
    $("hudWave").textContent = sd.wave.toString().padStart(2, "0");
    $("shieldFill").style.width = Math.max(0, sd.ship.shield) + "%";
    $("fuelFill").style.width = sd.ship.boost + "%";
    if (sd.running) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

sd.onDead = () => {
  setHi(sd.score);
  $("ovScore").textContent = sd.score.toLocaleString();
  $("ovWave").textContent = sd.wave;
  $("ovHi").textContent = getHi().toLocaleString();
  setTimeout(() => show("overScreen"), 700);
};

$("btnPlay").onclick = startGame;
$("btnRetry").onclick = startGame;
$("btnBack").onclick = () => {
  $("startHi").textContent = getHi().toLocaleString();
  show("startScreen");
};
document.addEventListener("keydown", (e) => {
  sd.keys[e.key] = true;
  if (e.key === " ") e.preventDefault();
});
document.addEventListener("keyup", (e) => {
  sd.keys[e.key] = false;
});
