document.getElementById("analyzePersona").addEventListener("click", analyzePersona);

function analyzePersona() {
    const selects = document.querySelectorAll(".question select");

    let scores = {
        logic: 0,
        discipline: 0,
        curiosity: 0,
        structure: 0
    };

    selects.forEach(select => {
        const type = select.dataset.score;
        scores[type] += Number(select.value);
    });

    updateInsights(scores);
    determinePersona(scores);
}

function updateInsights(scores) {
    document.getElementById("logicScore").textContent = scores.logic;
    document.getElementById("disciplineScore").textContent = scores.discipline;
    document.getElementById("curiosityScore").textContent = scores.curiosity;
    document.getElementById("structureScore").textContent = scores.structure;
}

function determinePersona(scores) {
    const total =
        scores.logic +
        scores.discipline +
        scores.curiosity +
        scores.structure;

    let title = "";
    let desc = "";

    if (total >= 14) {
        title = "The Architect";
        desc = "You design clean, scalable systems and think long-term.";
    } else if (total >= 11) {
        title = "The Problem Solver";
        desc = "You enjoy challenges and logical problem solving.";
    } else if (total >= 8) {
        title = "The Explorer";
        desc = "You love learning and experimenting with new ideas.";
    } else {
        title = "The Hustler";
        desc = "You get things done fast and learn along the way.";
    }

    document.getElementById("personaTitle").textContent = title;
    document.getElementById("personaDesc").textContent = desc;
}