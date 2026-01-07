// Get DOM elements
const habitInput=document.getElementById("habitInput");
const addHabitBtn=document.getElementById("addHabitBtn");
const habitList=document.getElementById("habitList");

// Load habits from localStorage or empty array
let habits=JSON.parse(localStorage.getItem("habits")) || [];

// Utility function to get today's date (YYYY-MM-DD)
function getTodayDate(){
    return new Date().toISOString().split("T")[0];
}

// Save habits to localStorage
function saveHabits(){
    localStorage.setItem("habits",JSON.stringify(habits));
}

// Render all habits on UI
function renderHabits(){
    habitList.innerHTML="";

    habits.forEach((habit,index)=>{
        const li=document.createElement("li");
        li.className="habit-item";

        // Habit name
        const name=document.createElement("span");
        name.className="habit-name";
        name.textContent=habit.name;

        // Streak info
        const streak=document.createElement("span");
        streak.className="streak";
        streak.textContent=`🔥 ${habit.streak}`;

        // Complete button
        const btn=document.createElement("button");
        btn.className="complete-btn";
        btn.textContent="Done";

        btn.onclick=()=>{
            completeHabit(index);
        };

        li.appendChild(name);
        li.appendChild(streak);
        li.appendChild(btn);
        habitList.appendChild(li);
    });
}

// Add new habit
addHabitBtn.addEventListener("click",()=>{
    const habitName=habitInput.value.trim();
    if(habitName==="") return;

    habits.push({
        name:habitName,
        streak:0,
        lastCompleted:null
    });

    habitInput.value="";
    saveHabits();
    renderHabits();
});

// Mark habit as completed
function completeHabit(index){
    const today=getTodayDate();
    const habit=habits[index];

    // Prevent multiple completions in same day
    if(habit.lastCompleted===today) return;

    const yesterday=new Date();
    yesterday.setDate(yesterday.getDate()-1);
    const yesterdayStr=yesterday.toISOString().split("T")[0];

    // Streak logic
    if(habit.lastCompleted===yesterdayStr){
        habit.streak+=1;
    } else {
        habit.streak=1;
    }

    habit.lastCompleted=today;
    saveHabits();
    renderHabits();
}

// Initial render
renderHabits();
