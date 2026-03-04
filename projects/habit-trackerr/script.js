let habitInput = document.getElementById("habitInput");
let habitList = document.getElementById("habitList");
let progressText = document.getElementById("progressText");
let progressBar = document.getElementById("progressBar");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

displayHabits();

function addHabit() {
  if(habitInput.value === "") return;

  let habit = {
    text: habitInput.value,
    done: false,
    streak: 0
  };

  habits.push(habit);
  localStorage.setItem("habits", JSON.stringify(habits));
  habitInput.value = "";
  displayHabits();
}

function displayHabits() {
  habitList.innerHTML = "";

  let doneCount = 0;

  habits.forEach((habit, index) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <span class="${habit.done ? "done" : ""}">
        ${habit.text} 🔥 ${habit.streak}
      </span>
      <button onclick="toggleHabit(${index})">✔</button>
    `;
    habitList.appendChild(li);

    if(habit.done) doneCount++;
  });

  let percent = habits.length === 0 ? 0 : (doneCount / habits.length) * 100;
  progressText.innerText = "Progress: " + Math.round(percent) + "%";
  progressBar.style.width = percent + "%";
}

function toggleHabit(index) {
  if(!habits[index].done) {
    habits[index].streak += 1;
  }
  habits[index].done = !habits[index].done;

  localStorage.setItem("habits", JSON.stringify(habits));
  displayHabits();
}