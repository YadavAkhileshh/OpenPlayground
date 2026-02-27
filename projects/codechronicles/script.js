let role = "Student";
let skill = 10;
let xp = 0;
let burnout = 0;
let progress = 0;
let stage = 0;

const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const choices = document.querySelectorAll(".choice");
const logList = document.getElementById("logList");
const progressFill = document.getElementById("progressFill");

const roleEl = document.getElementById("role");
const skillEl = document.getElementById("skill");
const xpEl = document.getElementById("xp");
const burnoutEl = document.getElementById("burnout");

const stages = [
    {
        title: "College Phase",
        text: "You are a CS student deciding how to spend your free time.",
        options: [
            { text: "Practice DSA daily", skill: +5, xp: +10, burnout: +5 },
            { text: "Build side projects", skill: +3, xp: +15, burnout: +3 },
            { text: "Chill & procrastinate", skill: -2, xp: 0, burnout: -5 }
        ]
    },
    {
        title: "First Internship",
        text: "You got an internship opportunity.",
        options: [
            { text: "Work overtime", skill: +5, xp: +20, burnout: +10 },
            { text: "Balanced work", skill: +3, xp: +15, burnout: +5 },
            { text: "Minimal effort", skill: 0, xp: +5, burnout: -2 }
        ]
    },
    {
        title: "Job Phase",
        text: "You are now a full-time developer.",
        options: [
            { text: "Learn new tech", skill: +5, xp: +20, burnout: +8 },
            { text: "Maintain systems", skill: +2, xp: +10, burnout: +4 },
            { text: "Ignore growth", skill: -3, xp: 0, burnout: -5 }
        ]
    }
];

function loadStage() {
    const s = stages[stage];
    if (!s) {
        storyTitle.textContent = "🏆 Career Complete!";
        storyText.textContent = "You shaped your developer journey.";
        return;
    }

    storyTitle.textContent = s.title;
    storyText.textContent = s.text;

    choices.forEach((btn, i) => {
        btn.textContent = s.options[i].text;
        btn.onclick = () => choose(i);
    });
}

function choose(index) {
    const option = stages[stage].options[index];

    skill += option.skill;
    xp += option.xp;
    burnout += option.burnout;
    progress += 33;

    log(`Chose: ${option.text}`);
    updateUI();

    stage++;
    loadStage();
}

function updateUI() {
    roleEl.textContent = role;
    skillEl.textContent = skill;
    xpEl.textContent = xp;
    burnoutEl.textContent = burnout + "%";
    progressFill.style.width = Math.min(progress, 100) + "%";
}

function log(msg) {
    const li = document.createElement("li");
    li.textContent = msg;
    logList.prepend(li);
}

loadStage();
updateUI();