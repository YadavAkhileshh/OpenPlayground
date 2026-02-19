import { analyzeDream } from './analyzer.js';
import { typeEffect } from './typingEffect.js';
import { initStars } from './background.js';
import { saveHistory, loadHistory } from './historyManager.js';
import { exportAsImage } from './exportManager.js';

initStars();
loadHistory();

document.getElementById("analyzeBtn")
    .addEventListener("click", () => {
        const dream = document.getElementById("dreamInput").value;
        const result = analyzeDream(dream);

        const resultCard = document.getElementById("resultCard");
        resultCard.classList.remove("hidden");

        typeEffect("interpretationText", result);
        saveHistory(dream);
    });

document.getElementById("exportBtn")
    .addEventListener("click", exportAsImage);