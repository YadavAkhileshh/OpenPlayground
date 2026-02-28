let score = 0;
let round = 1;
const maxRounds = 10;

let riskyAttempts = 0;
let riskySuccess = 0;

const roundEl = document.getElementById("round");
const scoreEl = document.getElementById("score");
const logEl = document.getElementById("log");
const summaryEl = document.getElementById("summary");

document.getElementById("safe").onclick = () => playSafe();
document.getElementById("risk").onclick = () => playRisk();

function playSafe() {
    score += 5;
    logEl.innerText = "Safe choice! +5 points.";
    update();
}

function playRisk() {
    riskyAttempts++;
    
    const multiplier = Math.floor(Math.random() * 4) + 2; // x2 to x5
    const success = Math.random() < 0.5; // 50% chance
    
    if (success) {
        riskySuccess++;
        const gained = 5 * multiplier;
        score += gained;
        logEl.innerText = `Risk success! Multiplier x${multiplier}, +${gained} points!`;
    } else {
        logEl.innerText = `Risk failed! No points gained.`;
    }
    
    update();
}

function update() {
    round++;
    scoreEl.innerText = `Score: ${score}`;
    if (round <= maxRounds) {
        roundEl.innerText = `Round: ${round} / ${maxRounds}`;
    } else {
        endGame();
    }
}

function endGame() {
    // hide buttons
    document.getElementById("safe").style.display = "none";
    document.getElementById("risk").style.display = "none";
    logEl.innerText = "";
    summaryEl.classList.remove("hidden");

    const rate = riskyAttempts ? Math.round((riskySuccess / riskyAttempts) * 100) : 0;

    document.getElementById("finalScore").innerText = `Final Score: ${score}`;
    document.getElementById("riskStats").innerText =
        `Risk Success: ${riskySuccess}/${riskyAttempts} (${rate}%)`;
}

function restartGame() {
    score = 0;
    round = 1;
    riskyAttempts = 0;
    riskySuccess = 0;

    document.getElementById("safe").style.display = "inline-block";
    document.getElementById("risk").style.display = "inline-block";

    summaryEl.classList.add("hidden");
    roundEl.innerText = `Round: 1 / ${maxRounds}`;
    scoreEl.innerText = `Score: 0`;
    logEl.innerText = ``;
}
