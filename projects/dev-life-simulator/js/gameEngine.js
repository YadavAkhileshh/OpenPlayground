import { updateStatsUI } from './uiController.js';
import { applyAction } from './statsManager.js';
import { randomEvent } from './eventSystem.js';

export let stats = {
    skill: 50,
    money: 50,
    burnout: 30,
    reputation: 40
};

export function initGame() {
    updateStatsUI(stats);

    document.querySelectorAll(".actions button")
        .forEach(btn => {
            btn.addEventListener("click", () => {
                const action = btn.dataset.action;
                applyAction(stats, action);
                randomEvent(stats);
                updateStatsUI(stats);
                checkGameOver();
            });
        });
}

function checkGameOver() {
    if(stats.burnout >= 100) {
        alert("Game Over! You burned out 😢");
    }
}