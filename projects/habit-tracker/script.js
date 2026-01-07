let habits = JSON.parse(localStorage.getItem("habits")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

const darkToggle = document.getElementById("darkToggle");

if(localStorage.getItem("dark")==="true"){
  document.body.classList.add("dark");
}

darkToggle.onclick=()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem("dark",document.body.classList.contains("dark"));
};

function openTab(id,btn){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  btn.classList.add("active");
}

function addHabit(){
  if(!habitName.value.trim()) return;

  habits.push({
    name:habitName.value,
    hours:habitHours.value,
    freq:habitFreq.value,
    category:habitCategory.value,
    streak:0,
    lastDone:null
  });

  habitName.value="";
  showToast();
  playSound();
  save();
}

function render(){
  habitList.innerHTML="";
  historyList.innerHTML="";

  habits.forEach((h,i)=>{
    habitList.innerHTML+=habitCard(h,i,false);
  });

  history.forEach(h=>{
    historyList.innerHTML+=habitCard(h,null,true);
  });

  const total=habits.length+history.length;
  const percent=total?Math.round(history.length/total*100):0;
  progressFill.style.width=percent+"%";
  progressText.textContent=percent+"%";

  badgeList.innerHTML="";
  if(history.length>=1) badge("Streak 1 🥉");
  if(history.length>=5) badge("Streak 5 🔥");
  if(history.length>=10) badge("Streak 10 🏆");
   if(history.length>=20) badge("Streak 20 🏆");
    if(history.length>=50) badge("Streak 50 🏆");
     if(history.length>=100) badge("Streak 100 🏆");
      if(history.length>=200) badge("Streak 200 🏆");
       if(history.length>=500) badge("Streak 500 🏆");
        if(history.length>=1000) badge("Streak 1k 🏆");
}

function habitCard(h,i,isHistory){
  return `
  <div class="habit">
    <strong>${h.name}</strong><br>
    ⏱ ${h.hours} hrs / ${h.freq}<br>
    🏷 ${h.category}<br>
    🔥 Streak: ${h.streak}
    <div class="actions">
      ${!isHistory?`<button onclick="completeHabit(${i})">✔</button>`:""}
      ${!isHistory?`<button onclick="removeHabit(${i})">🗑</button>`:""}
    </div>
  </div>`;
}

function completeHabit(i){
  const today=new Date().toDateString();
  if(habits[i].lastDone!==today){
    habits[i].streak++;
    habits[i].lastDone=today;
  }
  history.unshift(habits[i]);
  habits.splice(i,1);
  save();
}

function removeHabit(i){
  habits.splice(i,1);
  save();
}

function save(){
  localStorage.setItem("habits",JSON.stringify(habits));
  localStorage.setItem("history",JSON.stringify(history));
  render();
}

function badge(text){
  const b=document.createElement("span");
  b.className="badge";
  b.textContent=text;
  badgeList.appendChild(b);
}

function showToast(){
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2000);
}

function playSound(){
  successSound.currentTime=0;
  successSound.play().catch(()=>{});
}

render();

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
