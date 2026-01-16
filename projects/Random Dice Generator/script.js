const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const dice1 = document.getElementById("dice1");
const dice2 = document.getElementById("dice2");
const p1Btn = document.getElementById("p1Btn");
const p2Btn = document.getElementById("p2Btn");
const resetBtn = document.getElementById("resetBtn");
const result = document.getElementById("result");

let player1Roll = null;
let player2Roll = null;

function rollDice() {
  return Math.floor(Math.random() * 6);
}

p1Btn.addEventListener("click", () => {
  player1Roll = rollDice();
  dice1.textContent = diceEmojis[player1Roll];
  result.textContent = "Player 2's turn";
  p1Btn.disabled = true;
  p2Btn.disabled = false;
});

p2Btn.addEventListener("click", () => {
  player2Roll = rollDice();
  dice2.textContent = diceEmojis[player2Roll];

  if (player1Roll > player2Roll) {
    result.textContent = "🏆 Player 1 Wins!";
  } else if (player2Roll > player1Roll) {
    result.textContent = "🏆 Player 2 Wins!";
  } else {
    result.textContent = "🤝 It's a Draw!";
  }

  p2Btn.disabled = true;
});

resetBtn.addEventListener("click", () => {
  player1Roll = null;
  player2Roll = null;
  dice1.textContent = "🎲";
  dice2.textContent = "🎲";
  result.textContent = "Player 1 starts";
  p1Btn.disabled = false;
  p2Btn.disabled = true;
});
