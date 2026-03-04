function setFocus(level) {
  const result = document.getElementById("result");

  if (level === "low") {
    result.textContent =
      "😴 Low Focus: Take a short break, stretch, or drink water.";
  } else if (level === "medium") {
    result.textContent =
      "🙂 Medium Focus: Try the Pomodoro technique (25 min work, 5 min break).";
  } else if (level === "high") {
    result.textContent =
      "🚀 High Focus: Great time to work on complex or important tasks!";
  }
}