import { initGame } from './gameEngine.js';
import { saveGame, loadGame, resetGame } from './storage.js';

initGame();

document.getElementById("saveGame")
    .addEventListener("click", saveGame);

document.getElementById("loadGame")
    .addEventListener("click", loadGame);

document.getElementById("resetGame")
    .addEventListener("click", resetGame);