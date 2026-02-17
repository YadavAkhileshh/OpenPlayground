let petEmoji = "";
let growth = 0;

let hunger = 70,
    fun = 70,
    energy = 70;

function pick(emoji, el) {
  petEmoji = emoji;

  document.querySelectorAll(".pet-option")
    .forEach(p => p.classList.remove("selected"));

  el.classList.add("selected");
}

function start() {
  const name = document.getElementById("petName").value;

  if (!name || !petEmoji) {
    alert("Select pet & name");
    return;
  }

  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "flex";

  document.getElementById("pet").textContent = petEmoji;
  document.getElementById("title").textContent = name;

  updateUI();
}

function updateUI() {
  document.getElementById("hungerBar").style.width = hunger + "%";
  document.getElementById("funBar").style.width = fun + "%";
  document.getElementById("energyBar").style.width = energy + "%";
  document.getElementById("growthBar").style.width = growth * 10 + "%";
}

function feed() {
  hunger = Math.min(hunger + 10, 100);
  updateUI();
}

function play() {
  fun = Math.min(fun + 10, 100);
  energy = Math.max(energy - 10, 0);
  updateUI();
}

function sleepPet() {
  const petEl = document.getElementById("pet");
  const zzz = document.getElementById("sleepZzz");

  document.getElementById("feedBtn").disabled = true;
  document.getElementById("playBtn").disabled = true;
  document.getElementById("sleepBtn").disabled = true;

  petEl.classList.add("sleeping");
  zzz.style.opacity = 1;

  setTimeout(() => {
    energy = 100;

    if (growth < 10) growth++;

    petEl.style.fontSize = (80 + growth * 5) + "px";

    petEl.classList.remove("sleeping");
    zzz.style.opacity = 0;

    document.getElementById("feedBtn").disabled = false;
    document.getElementById("playBtn").disabled = false;
    document.getElementById("sleepBtn").disabled = false;

    updateUI();
  }, 5000); 
}

updateUI();
