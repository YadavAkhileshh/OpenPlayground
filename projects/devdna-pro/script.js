const traits = {
    logic: 0,
    creativity: 0,
    risk: 0,
    speed: 0,
    structure: 0,
    debugging: 0,
    optimization: 0
};

let xp = 0;
let level = 1;
let achievements = [];
let currentQuestion = 0;

const questions = generateQuestions();

function generateQuestions() {
    const baseQuestions = [
        ["Bug appears in production.", "Investigate logs carefully", "logic"],
        ["New project assigned.", "Design architecture first", "structure"],
        ["Tight deadline.", "Code rapidly and refine later", "speed"],
        ["Performance issue.", "Optimize algorithm complexity", "optimization"],
        ["Strange edge case.", "Debug step-by-step", "debugging"],
        ["Creative feature request.", "Innovate boldly", "creativity"],
        ["Uncertain outcome.", "Take calculated risk", "risk"]
    ];

    let generated = [];

    for (let i = 0; i < 15; i++) {
        let base = baseQuestions[i % baseQuestions.length];
        generated.push({
            text: base[0],
            options: [
                { text: base[1], trait: base[2], value: 2 },
                { text: "Try alternative approach", trait: "creativity", value: 1 },
                { text: "Speed through it", trait: "speed", value: 1 }
            ]
        });
    }

    return generated;
}

function loadQuestion() {
    const q = questions[currentQuestion];
    document.getElementById("question").innerText = q.text;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    q.options.forEach(option => {
        const btn = document.createElement("button");
        btn.innerText = option.text;
        btn.onclick = () => selectOption(option);
        optionsDiv.appendChild(btn);
    });
}

function selectOption(option) {
    traits[option.trait] += option.value;
    xp += 10;

    checkAchievements();
    updateXP();

    currentQuestion++;

    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        finalizeAssessment();
    }
}

function updateXP() {
    const xpNeeded = level * 100;
    if (xp >= xpNeeded) {
        xp = 0;
        level++;
    }

    document.getElementById("xpFill").style.width = (xp / xpNeeded) * 100 + "%";
    document.getElementById("levelText").innerText = `Level ${level} | XP: ${xp}`;
}

function checkAchievements() {
    if (traits.logic >= 6 && !achievements.includes("Master Logician")) {
        achievements.push("Master Logician 🧠");
    }

    if (traits.creativity >= 6 && !achievements.includes("Creative Hacker")) {
        achievements.push("Creative Hacker 🎨");
    }

    if (level >= 3 && !achievements.includes("Level Up Pro")) {
        achievements.push("Level Up Pro 🚀");
    }
}

function finalizeAssessment() {
    drawRadar();
    showResults();
    saveData();
}

function showResults() {
    const maxTrait = Object.keys(traits).reduce((a,b) => 
        traits[a] > traits[b] ? a : b
    );

    document.getElementById("resultText").innerText =
        "Dominant Coding Trait: " + maxTrait.toUpperCase();

    const achDiv = document.getElementById("achievements");
    achDiv.innerHTML = "<h4>Achievements:</h4>" + achievements.join("<br>");
}

function drawRadar() {
    const canvas = document.getElementById("radarChart");
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 400;

    const centerX = 300;
    const centerY = 200;
    const radius = 120;
    const keys = Object.keys(traits);

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.beginPath();

    keys.forEach((trait, index) => {
        const angle = (Math.PI * 2 / keys.length) * index;
        const value = traits[trait] * 15;

        const x = centerX + Math.cos(angle) * value;
        const y = centerY + Math.sin(angle) * value;

        if (index === 0) {
            ctx.moveTo(x,y);
        } else {
            ctx.lineTo(x,y);
        }
    });

    ctx.closePath();
    ctx.fillStyle = "rgba(0,255,255,0.4)";
    ctx.fill();
    ctx.strokeStyle = "#00ffff";
    ctx.stroke();
}

function saveData() {
    localStorage.setItem("devdna", JSON.stringify({
        traits,
        xp,
        level,
        achievements
    }));
}

function exportResults() {
    const data = localStorage.getItem("devdna");
    const blob = new Blob([data], {type:"application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "devdna_results.json";
    a.click();
}

function toggleTheme() {
    document.body.classList.toggle("light");
}

function resetAll() {
    localStorage.clear();
    location.reload();
}

loadQuestion();