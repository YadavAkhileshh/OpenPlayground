function extractKeywords(text) {
  const commonSkills = [
    "javascript", "html", "css", "react", "node",
    "python", "sql", "mongodb", "api", "git",
    "communication", "teamwork", "problem solving",
    "data structures", "algorithms"
  ];

  const lowerText = text.toLowerCase();
  return commonSkills.filter(skill => lowerText.includes(skill));
}

function analyzeMatch() {
  const resume = document.getElementById("resumeText").value;
  const job = document.getElementById("jobText").value;
  const resultBox = document.getElementById("resultBox");

  if (!resume || !job) {
    resultBox.innerHTML = "<p>Please fill both fields.</p>";
    return;
  }

  const resumeKeywords = extractKeywords(resume);
  const jobKeywords = extractKeywords(job);

  const matched = jobKeywords.filter(skill =>
    resumeKeywords.includes(skill)
  );

  const missing = jobKeywords.filter(skill =>
    !resumeKeywords.includes(skill)
  );

  const score = jobKeywords.length
    ? Math.round((matched.length / jobKeywords.length) * 100)
    : 0;

  let rating = "Low Match";
  if (score > 70) rating = "Excellent Match";
  else if (score > 40) rating = "Moderate Match";

  resultBox.innerHTML = `
    <div class="result-box">
      <p><strong>Match Score:</strong> ${score}%</p>
      <p><strong>Rating:</strong> ${rating}</p>

      <p><strong>Matched Skills:</strong> 
        ${matched.length ? matched.map(s => `<span class="highlight">${s}</span>`).join(", ") : "None"}
      </p>

      <p><strong>Missing Skills:</strong> 
        ${missing.length ? missing.map(s => `<span class="missing">${s}</span>`).join(", ") : "None"}
      </p>

      <p><strong>AI Suggestion:</strong> 
        ${missing.length 
          ? "Consider adding missing skills or related projects to improve ATS compatibility."
          : "Your resume is well aligned with the job description."}
      </p>
    </div>
  `;
}
