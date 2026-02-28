const screens = document.querySelectorAll(".screen");

const startBtn = document.getElementById("start-btn");
const roomTitle = document.getElementById("room-title");
const itemIcon = document.getElementById("item-icon");
const nextRoomBtn = document.getElementById("next-room-btn");

const mathQ = document.getElementById("math-question");
const mathAns = document.getElementById("math-answer");

const recallQ = document.getElementById("recall-question");
const optionsDiv = document.getElementById("options");
const resultText = document.getElementById("result-text");

let index = 0;
let score = 0;


function show(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}


startBtn.onclick = () => {
  showRoom();
};

function showRoom() {
  show("room-screen");
  const room = rooms[index];
  roomTitle.textContent = room.place;
  itemIcon.textContent = room.item;
}

nextRoomBtn.onclick = () => {
  index++;
  if (index < rooms.length) {
    showRoom();
  } else {
    startDistraction();
  }
};


function startDistraction() {
  show("distraction");
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);
  mathQ.textContent = `${a} + ${b} = ?`;
  mathQ.dataset.answer = a + b;
}

document.getElementById("submit-math").onclick = () => {
  if (Number(mathAns.value) == mathQ.dataset.answer) {
    startRecall();
  } else {
    alert("Try again");
  }
};


let recallIndex = 0;

function startRecall() {
  show("recall");
  askQuestion();
}

function askQuestion() {
  const current = rooms[recallIndex];
  recallQ.textContent = `What item was in the ${current.place}?`;
  optionsDiv.innerHTML = "";

  shuffle([...rooms]).forEach(r => {
    const btn = document.createElement("button");
    btn.textContent = r.item;
    btn.onclick = () => checkAnswer(r.item);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(choice) {
  if (choice === rooms[recallIndex].item) {
    score++;
  }

  recallIndex++;
  if (recallIndex < rooms.length) {
    askQuestion();
  } else {
    showResult();
  }
}


function showResult() {
  show("result");
  resultText.textContent = `You recalled ${score} out of ${rooms.length} locations correctly.`;
}


function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
