/* ============================= */
/* 🌊 GLOBAL SAVED DATA */
/* ============================= */

let trash = parseInt(localStorage.getItem("trash")) || 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let draggedItem = null;


/* ============================= */
/* 🏠 HOME PAGE FUNCTIONS */
/* ============================= */

function startGame() {
  window.location.href = "game.html";
}

function showHowToPlay() {
  alert(
    "🌊 HOW TO PLAY:\n\n" +
      "🗑 Drag trash into the Dustbin\n" +
      "🐢 Drag sea animals into the Safe Bag\n" +
      "⏳ Score as much as possible before 2 minutes ends!"
  );
}

/* ============================= */
/* 🎮 GAME VARIABLES */
/* ============================= */

let score = 0;
let timeLeft = 120;
let timerInterval;
let gameRunning = false;

/* ITEMS */
const wasteItems = ["🧴", "🥤", "🍾", "🗑"];
const animalItems = ["🐢", "🐬", "🐠"];

/* ============================= */
/* 🎮 GAME FUNCTIONS */
/* ============================= */

function startMission() {
  if (gameRunning) return;

  gameRunning = true;
  spawnItem();

  timerInterval = setInterval(() => {
    timeLeft--;

    if (document.getElementById("timer")) {
      document.getElementById("timer").innerText = timeLeft;
    }

    if (timeLeft <= 0) {
      endMission();
    }
  }, 1000);
}

function pauseMission() {
  if (!gameRunning) return;

  clearInterval(timerInterval);
  gameRunning = false;
  alert("⏸ Game Paused! Press Start again to Resume.");
}

/* END GAME */
function endMission() {
  clearInterval(timerInterval);
  gameRunning = false;

  trash += score;

  /* Save High Score */
  if (trash > highScore) {
    highScore = trash;
    localStorage.setItem("highScore", highScore);
  }

  localStorage.setItem("trash", trash);

  alert("⏳ Mission Over!\nYour Score: " + score);

  window.location.href = "leaderboard.html";
}

/* SPAWN RANDOM ITEM */
function spawnItem() {
  if (!gameRunning) return;

  const ocean = document.getElementById("ocean");
  if (!ocean) return;

  const item = document.createElement("div");
  item.classList.add("item");

  let isWaste = Math.random() > 0.4;

  item.innerText = isWaste
    ? wasteItems[Math.floor(Math.random() * wasteItems.length)]
    : animalItems[Math.floor(Math.random() * animalItems.length)];

  item.dataset.type = isWaste ? "waste" : "animal";

  item.style.left = Math.random() * 80 + "%";
  item.style.top = Math.random() * 60 + "%";

  item.draggable = true;
  item.addEventListener("dragstart", dragStart);

  ocean.appendChild(item);

  setTimeout(spawnItem, 2000);
}

/* DRAG START */
function dragStart(e) {
  e.dataTransfer.setData("type", e.target.dataset.type);
  draggedItem = e.target;
}


/* DROP LOGIC */
function setupDropZones() {
  const dustbin = document.getElementById("dustbin");
  const bag = document.getElementById("bag");

  if (!dustbin || !bag) return;

  dustbin.addEventListener("dragover", (e) => e.preventDefault());
  bag.addEventListener("dragover", (e) => e.preventDefault());

  /* DROP INTO DUSTBIN */
  dustbin.addEventListener("drop", (e) => {
    e.preventDefault();

    const type = e.dataTransfer.getData("type");

    if (type === "waste") {
      score += 5;
      updateScore();
    } else {
      score -= 2;
      alert("❌ Wrong! Animals must go into Safe Bag!");
      updateScore();
    }
    if (draggedItem) draggedItem.remove();
  });

  /* DROP INTO SAFE BAG */
  bag.addEventListener("drop", (e) => {
    e.preventDefault();

    const type = e.dataTransfer.getData("type");

    if (type === "animal") {
      score += 10;
      updateScore();
    } else {
      score -= 1;
      alert("⚠ Trash should go into Dustbin!");
      updateScore();
    }
    if (draggedItem) draggedItem.remove();
  });

}

/* UPDATE SCORE DISPLAY */
function updateScore() {
  if (document.getElementById("score")) {
    document.getElementById("score").innerText = score;
  }
}

/* ============================= */
/* 📌 LOAD VALUES ON EVERY PAGE */
/* ============================= */

window.onload = function () {
  /* HOME PAGE */
  if (document.getElementById("highScore")) {
    document.getElementById("highScore").innerText = highScore;
    document.getElementById("trashCollected").innerText = trash;

    document.getElementById("rankName").innerText =
      highScore > 50 ? "Ocean Guardian 🌟" : "Beginner Saver 🌱";
  }

  /* PROFILE PAGE */
  if (document.getElementById("profileScore")) {
    document.getElementById("profileScore").innerText = highScore;
    document.getElementById("profileTrash").innerText = trash;

    document.getElementById("profileRank").innerText =
      highScore > 50 ? "Ocean Guardian 🌟" : "Beginner Saver 🌱";
  }

  /* LEADERBOARD PAGE */
  if (document.getElementById("leaderList")) {
    let list = document.getElementById("leaderList");

    list.innerHTML = `
      <li>🥇 You - ${highScore} pts</li>
      <li>🥈 Player2 - 80 pts</li>
      <li>🥉 Player3 - 65 pts</li>
    `;
  }

  /* GAME PAGE DROP SYSTEM */
  setupDropZones();
};
