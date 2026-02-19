let timer;
let totalSeconds = 300; // 10 Minutes

// Next Question
function nextQuestion() {
  let answer = document.getElementById("answerBox").value.trim();

  if (answer.length === 0) {
    alert("Please answer before moving to the next question.");
    return;
  }

  answers.push(answer);
  document.getElementById("answerBox").value = "";

  currentIndex++;

  if (currentIndex < questions.length) {
    document.getElementById("questionText").innerText =
      questions[currentIndex];
  } else {
    finishTest();
  }
}

// Start Timer
function startTimer() {
  totalSeconds = 600;

  timer = setInterval(() => {
    totalSeconds--;

    let mins = Math.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;

    document.getElementById("timeLeft").innerText =
      `${mins}:${secs < 10 ? "0" : ""}${secs}`;

    if (totalSeconds <= 0) {
      finishTest();
    }
  }, 1000);
}

// Finish Interview + Feedback
function finishTest() {
  clearInterval(timer);

  let score = 0;
  let feedback = [];

  answers.forEach(ans => {
    let text = ans.toLowerCase();

    // Length Score
    if (ans.length > 120) score += 15;
    else if (ans.length > 70) score += 10;
    else score += 5;

    // Bonus Keywords
    if (text.includes("because")) score += 5;
    if (text.includes("project")) score += 5;
    if (text.includes("learned")) score += 5;
  });

  if (score > 100) score = 100;

  // Feedback Based on Score
  if (score >= 80) {
    feedback.push("✅ Excellent answers with strong clarity.");
    feedback.push("⭐ Very confident and detailed responses.");
  } 
  else if (score >= 50) {
    feedback.push("👍 Good attempt, but answers need more depth.");
    feedback.push("🔹 Add examples from projects and internships.");
  } 
  else {
    feedback.push("⚠ Answers were too short or unclear.");
    feedback.push("🔹 Practice structured answers (STAR method).");
  }

  // Skill-Based Suggestions
  if (resumeText.includes("react"))
    feedback.push("💡 Prepare deeper React interview questions.");

  if (resumeText.includes("mongodb"))
    feedback.push("💡 Revise MongoDB queries and database concepts.");

  // Display Result
  document.getElementById("resultBox").innerHTML = `
    🎉 Interview Completed Successfully! <br><br>
    ⭐ Final Score: <b>${score}/100</b><br><br>
    <b>Dynamic Feedback:</b><br><br>
    ${feedback.map(f => "• " + f).join("<br>")}
  `;

  document.getElementById("resultBox").classList.remove("hidden");
}
