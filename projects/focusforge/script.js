let xp = parseInt(localStorage.getItem("xp")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;
let streak = parseInt(localStorage.getItem("streak")) || 0;

const xpDisplay = document.getElementById("xpDisplay");
const levelDisplay = document.getElementById("levelDisplay");
const xpFill = document.getElementById("xpFill");
const streakCount = document.getElementById("streakCount");
const aiFeedback = document.getElementById("aiFeedback");
const leaderboardList = document.getElementById("leaderboardList");

document.getElementById("studyForm").addEventListener("submit", function(e){
    e.preventDefault();

    let hours = parseInt(document.getElementById("hours").value);
    let difficulty = parseInt(document.getElementById("difficulty").value);

    let earnedXP = calculateXP(hours, difficulty);
    xp += earnedXP;

    updateLevel();
    updateStreak();
    saveData();
    updateUI();
    generateAIFeedback(hours, difficulty);
    updateLeaderboard();
});

function calculateXP(hours, difficulty){
    return hours * difficulty * 10;
}

function updateLevel(){
    level = Math.floor(xp / 200) + 1;
}

function updateStreak(){
    streak += 1;
}

function generateAIFeedback(hours, difficulty){
    if(hours >= 4 && difficulty >=4){
        aiFeedback.innerText = "🔥 High intensity session! You're in deep focus mode.";
    }
    else if(hours < 2){
        aiFeedback.innerText = "⚡ Try increasing your focus time tomorrow.";
    }
    else{
        aiFeedback.innerText = "✅ Consistent effort! Keep building momentum.";
    }
}

function updateUI(){
    xpDisplay.innerText = "XP: " + xp;
    levelDisplay.innerText = "Level: " + level;
    streakCount.innerText = streak + " Days 🔥";

    let percent = (xp % 200) / 200 * 100;
    xpFill.style.width = percent + "%";
}

function saveData(){
    localStorage.setItem("xp", xp);
    localStorage.setItem("level", level);
    localStorage.setItem("streak", streak);
}

function updateLeaderboard(){
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({xp: xp, level: level});
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    renderLeaderboard(leaderboard);
}

function renderLeaderboard(data){
    leaderboardList.innerHTML = "";
    data.slice(-5).reverse().forEach((entry)=>{
        let li = document.createElement("li");
        li.innerText = "Level " + entry.level + " - XP " + entry.xp;
        leaderboardList.appendChild(li);
    });
}

updateUI();
renderLeaderboard(JSON.parse(localStorage.getItem("leaderboard")) || []);