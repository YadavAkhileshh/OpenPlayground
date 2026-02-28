let puzzles = [];
let currentPuzzle = 0;
let attempts = 3;

async function loadPuzzles() {
  const res = await fetch("puzzles.json");
  puzzles = await res.json();
  showPuzzle();
}

function showPuzzle() {
  document.getElementById("puzzleText").innerText =
    puzzles[currentPuzzle].question;
  document.getElementById("level").innerText = currentPuzzle + 1;
  document.getElementById("attempts").innerText = attempts;
}

function checkAnswer() {
  const userAnswer = document
    .getElementById("answer")
    .value.toLowerCase()
    .trim();

  if (userAnswer === puzzles[currentPuzzle].answer) {
    document.getElementById("message").innerText = "✅ Correct! Door unlocked.";
    currentPuzzle++;
    document.getElementById("answer").value = "";

    if (currentPuzzle < puzzles.length) {
      setTimeout(showPuzzle, 1000);
    } else {
      document.getElementById("puzzleText").innerText =
        "🎉 You escaped the room!";
      document.querySelector("button").disabled = true;
    }
  } else {
    attempts--;
    document.getElementById("message").innerText = "❌ Wrong answer!";
    document.getElementById("attempts").innerText = attempts;

    if (attempts === 0) {
      document.getElementById("puzzleText").innerText =
        "💀 Game Over! You are trapped forever.";
      document.querySelector("button").disabled = true;
    }
  }
}

loadPuzzles();
