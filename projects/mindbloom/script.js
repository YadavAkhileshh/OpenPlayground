let habits = JSON.parse(localStorage.getItem("habits")) || [];
let moodHistory = JSON.parse(localStorage.getItem("moods")) || [];
let streak = parseInt(localStorage.getItem("streak")) || 0;

const habitList = document.getElementById("habitList");
const heatmap = document.getElementById("heatmap");
const aiInsights = document.getElementById("aiInsights");
const streakDisplay = document.getElementById("streakDisplay");
const badgesContainer = document.getElementById("badges");

document.getElementById("habitForm").addEventListener("submit", function(e){
    e.preventDefault();
    let habitName = document.getElementById("habitName").value;

    habits.push({name: habitName, completed: false});
    localStorage.setItem("habits", JSON.stringify(habits));

    renderHabits();
});

function renderHabits(){
    habitList.innerHTML = "";
    habits.forEach((habit, index)=>{
        let li = document.createElement("li");
        li.innerHTML = `
            ${habit.name}
            <button onclick="completeHabit(${index})">Done</button>
        `;
        habitList.appendChild(li);
    });
}

function completeHabit(index){
    habits[index].completed = true;
    streak += 1;
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("streak", streak);

    updateStreak();
    unlockBadges();
    generateInsights();
}

document.getElementById("logMood").addEventListener("click", function(){
    let mood = parseInt(document.getElementById("moodSelect").value);
    moodHistory.push(mood);
    localStorage.setItem("moods", JSON.stringify(moodHistory));

    renderHeatmap();
    generateInsights();
});

function renderHeatmap(){
    heatmap.innerHTML = "";
    moodHistory.slice(-28).forEach(mood=>{
        let cell = document.createElement("div");
        cell.classList.add("heat-cell");

        let color = `rgba(123,44,191,${mood/5})`;
        cell.style.background = color;

        heatmap.appendChild(cell);
    });
}

function updateStreak(){
    streakDisplay.innerText = "Streak: " + streak + " Days 🔥";
}

function unlockBadges(){
    badgesContainer.innerHTML = "";

    if(streak >= 5) addBadge("🏅 5-Day Warrior");
    if(streak >= 10) addBadge("🏆 10-Day Master");
    if(streak >= 20) addBadge("👑 Habit Legend");
}

function addBadge(text){
    let badge = document.createElement("div");
    badge.innerText = text;
    badgesContainer.appendChild(badge);
}

function generateInsights(){
    if(moodHistory.length === 0){
        aiInsights.innerText = "Track more moods to generate insights.";
        return;
    }

    let avgMood = moodHistory.reduce((a,b)=>a+b,0) / moodHistory.length;

    if(avgMood >=4){
        aiInsights.innerText = "🌸 Your habits positively impact your mood!";
    }
    else if(avgMood <=2){
        aiInsights.innerText = "⚠ Try adjusting your habits for better emotional balance.";
    }
    else{
        aiInsights.innerText = "✨ Moderate mood stability. Stay consistent!";
    }
}

window.onload = function(){
    renderHabits();
    renderHeatmap();
    updateStreak();
    unlockBadges();
    generateInsights();
}