import { saveScore } from './leaderboard.js';
import { randomText } from './utils.js';

let time = 60;
let interval;
let text = "";

export function startGame() {
    const difficulty = document.getElementById("difficulty").value;
    text = randomText(difficulty);

    document.getElementById("textDisplay").textContent = text;
    document.getElementById("inputArea").value = "";
    document.getElementById("inputArea").disabled = false;
    document.getElementById("inputArea").focus();

    time = 60;
    interval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    time--;
    document.getElementById("time").textContent = time;

    if (time <= 0) {
        clearInterval(interval);
        finishGame();
    }
}

function finishGame() {
    const input = document.getElementById("inputArea").value;
    const words = input.trim().split(" ").length;
    const wpm = words;

    document.getElementById("wpm").textContent = wpm;

    saveScore(wpm);
}