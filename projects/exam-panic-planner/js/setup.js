const form = document.getElementById("setupForm");
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const hours = Number(document.getElementById("hours").value);
  const examDate = document.getElementById("examDate").value;
  const today = new Date().toISOString().split('T')[0];
if (examDate < today) {
  alert("Exam date cannot be in the past");
  return;
}

  if (hours <= 0) {
    alert("Daily hours must be greater than 0");
    return;
  }

  const user = {
    name,
    dailyHours: hours,
    examDate
  };

  localStorage.setItem("user", JSON.stringify(user));
  generatePlan();
  window.location.href = "planner.html";
});

const savedUser = localStorage.getItem("user");

if (savedUser) {
  const user = JSON.parse(savedUser);

  document.getElementById("name").value = user.name;
  document.getElementById("hours").value = user.dailyHours;
  document.getElementById("examDate").value = user.examDate;
}