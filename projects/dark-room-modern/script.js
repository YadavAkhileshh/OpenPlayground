const SAVE_KEY = "embers_save_v1";

let state = {
  fire: 0,
  wood: 0,
  people: 0,
  stage: 0
};

// DOM
const story = document.getElementById("story");
const fireEl = document.getElementById("fire");
const woodEl = document.getElementById("wood");
const peopleEl = document.getElementById("people");

const resourcesPanel = document.getElementById("resources");
const actionsPanel = document.getElementById("actions");

const gatherWoodBtn = document.getElementById("gatherWood");
const stokeFireBtn = document.getElementById("stokeFire");
const recruitBtn = document.getElementById("recruit");

const peopleRow = document.getElementById("peopleRow");
const resetBtn = document.getElementById("resetBtn");

// ---------- STORY ----------
function updateStory(text) {
  story.textContent = text;
}

function progressStory() {
  if (state.stage === 0 && state.fire >= 1) {
    state.stage = 1;
    updateStory("The fire flickers. Shadows retreat. You are not alone.");
    resourcesPanel.classList.remove("hidden");
    actionsPanel.classList.remove("hidden");
    stokeFireBtn.classList.remove("hidden");
  }

  if (state.stage === 1 && state.fire >= 5) {
    state.stage = 2;
    updateStory("The fire burns strong. Smoke rises into the sky.");
    recruitBtn.classList.remove("hidden");
    peopleRow.classList.remove("hidden");
  }
}

// ---------- ACTIONS ----------
gatherWoodBtn.onclick = () => {
  state.wood += 1;
  updateStory("You gather splintered wood from the ruins.");
  render();
};

stokeFireBtn.onclick = () => {
  if (state.wood <= 0) {
    updateStory("No wood left. The cold creeps closer.");
    return;
  }
  state.wood -= 1;
  state.fire += 1;
  updateStory("You feed the fire. Warmth spreads.");
  progressStory();
  render();
};

recruitBtn.onclick = () => {
  if (state.fire < 5) {
    updateStory("The signal is too weak.");
    return;
  }
  state.people += 1;
  state.fire -= 2;
  updateStory("A survivor emerges from the darkness.");
  render();
};

// ---------- SAVE / LOAD ----------
function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function load() {
  const data = localStorage.getItem(SAVE_KEY);
  if (data) {
    state = JSON.parse(data);
  }
  progressStory(); // 🔥 THIS WAS MISSING
}

resetBtn.onclick = () => {
  if (!confirm("Restart the world?")) return;
  localStorage.removeItem(SAVE_KEY);
  location.reload();
};

// ---------- RENDER ----------
function render() {
  fireEl.textContent = state.fire;
  woodEl.textContent = state.wood;
  peopleEl.textContent = state.people;
  save();
}

// ---------- INIT ----------
load();
updateStory("You awaken in the dark. The cold bites.");
render();