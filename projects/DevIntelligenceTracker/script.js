function analyzeProfile() {
  const projects = parseInt(document.getElementById("projects").value) || 0;
  const dsa = parseInt(document.getElementById("dsa").value) || 0;
  const oss = parseInt(document.getElementById("oss").value) || 0;
  const skills = document.getElementById("skills").value.toLowerCase().split(",");

  const resultBox = document.getElementById("resultBox");

  // Scoring logic
  const projectScore = Math.min(projects * 10, 100);
  const dsaScore = Math.min(dsa / 3, 100);
  const ossScore = Math.min(oss * 4, 100);
  const skillScore = Math.min(skills.length * 10, 100);

  const finalScore = Math.round(
    (projectScore * 0.3) +
    (dsaScore * 0.3) +
    (ossScore * 0.2) +
    (skillScore * 0.2)
  );

  let readinessLevel = "Needs Improvement";
  if (finalScore > 80) readinessLevel = "Internship Ready";
  else if (finalScore > 60) readinessLevel = "Almost Ready";

  let suggestions = [];

  if (projects < 5)
    suggestions.push("Build more real-world projects.");
  if (dsa < 150)
    suggestions.push("Increase DSA practice for coding interviews.");
  if (oss < 10)
    suggestions.push("Contribute more to open source.");
  if (skills.length < 5)
    suggestions.push("Expand your technical skill set.");

  resultBox.innerHTML = `
    <div class="result-box">
      <p><strong>Project Score:</strong> ${projectScore}/100</p>
      <p><strong>DSA Score:</strong> ${dsaScore.toFixed(0)}/100</p>
      <p><strong>Open Source Score:</strong> ${ossScore}/100</p>
      <p><strong>Skill Diversity Score:</strong> ${skillScore}/100</p>

      <hr>

      <p><strong>Internship Readiness Score:</strong> 
        <span class="highlight">${finalScore}/100</span>
      </p>

      <p><strong>Status:</strong> ${readinessLevel}</p>

      <hr>

      <p><strong>Improvement Suggestions:</strong></p>
      <ul>
        ${suggestions.length ? suggestions.map(s => `<li>${s}</li>`).join("") : "<li>No major improvements needed.</li>"}
      </ul>
    </div>
  `;
}
