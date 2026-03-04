const races = {
  Human: { strength: 2, agility: 2, intelligence: 2, hp: 10 },
  Elf: { strength: 1, agility: 4, intelligence: 3, hp: 8 },
  Orc: { strength: 5, agility: 1, intelligence: 1, hp: 15 }
};

const classes = {
  Warrior: { strength: 4, hp: 10, mana: 0 },
  Mage: { intelligence: 5, mana: 20, hp: 5 },
  Rogue: { agility: 5, strength: 2, hp: 7 }
};

const raceSelect = document.getElementById("race");
const classSelect = document.getElementById("class");
const statsList = document.getElementById("stats");

function loadOptions() {
  for (let race in races) {
    raceSelect.innerHTML += `<option value="${race}">${race}</option>`;
  }
  for (let cls in classes) {
    classSelect.innerHTML += `<option value="${cls}">${cls}</option>`;
  }
}

function buildCharacter() {
  const race = races[raceSelect.value];
  const cls = classes[classSelect.value];

  const finalStats = {};

  for (let stat in race) {
    finalStats[stat] = race[stat];
  }

  for (let stat in cls) {
    finalStats[stat] = (finalStats[stat] || 0) + cls[stat];
  }

  statsList.innerHTML = "";
  for (let stat in finalStats) {
    statsList.innerHTML += `<li><strong>${stat.toUpperCase()}</strong>: ${finalStats[stat]}</li>`;
  }
}

function resetBuilder() {
  statsList.innerHTML = "";
}

document.getElementById("buildBtn").addEventListener("click", buildCharacter);
document.getElementById("resetBtn").addEventListener("click", resetBuilder);

loadOptions();
