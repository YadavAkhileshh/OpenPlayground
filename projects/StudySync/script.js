function addPlan() {
  let subject = document.getElementById("subject").value;
  let hours = document.getElementById("hours").value;

  if (subject === "" || hours === "") {
    alert("Please fill all fields!");
    return;
  }

  plans.push({ subject, hours, completed: false });
  savePlans();
  displayPlans();
}

function toggleComplete(index) {
  plans[index].completed = !plans[index].completed;
  savePlans();
  displayPlans();
}

function displayPlans() {
  let list = document.getElementById("planList");
  if (!list) return;

  list.innerHTML = "";

  plans.forEach((plan, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <span>${plan.subject} - ${plan.hours} hrs</span>
      <button onclick="toggleComplete(${index})">
        ${plan.completed ? "✅ Done" : "Mark Complete"}
      </button>
    `;

    list.appendChild(li);
  });
}

function updateProgress() {
  let total = plans.length;
  let completed = plans.filter(p => p.completed).length;

  let totalEl = document.getElementById("totalPlans");
  let compEl = document.getElementById("completedPlans");

  if (totalEl) totalEl.innerText = total;
  if (compEl) compEl.innerText = completed;
}

displayPlans();
updateProgress();
