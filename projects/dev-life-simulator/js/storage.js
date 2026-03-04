import { stats } from './gameEngine.js';

export function saveGame() {
    localStorage.setItem("devGame", JSON.stringify(stats));
}

export function loadGame() {
    const saved = JSON.parse(localStorage.getItem("devGame"));
    if(saved) {
        Object.assign(stats, saved);
        location.reload();
    }
}

export function resetGame() {
    localStorage.removeItem("devGame");
    location.reload();
}