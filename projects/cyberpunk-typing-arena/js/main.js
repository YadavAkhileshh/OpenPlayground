import { startGame } from './typing.js';
import { loadLeaderboard } from './leaderboard.js';
import { toggleTheme } from './theme.js';

window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("loader").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");
    }, 2000);
});

document.getElementById("startBtn")
    .addEventListener("click", startGame);

document.getElementById("themeToggle")
    .addEventListener("click", toggleTheme);

loadLeaderboard();