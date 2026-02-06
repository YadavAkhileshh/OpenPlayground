function calculateReadiness() {
  const projects = parseInt(document.getElementById("projects").value) || 0;
  const dsa = parseInt(document.getElementById("dsa").value) || 0;
  const oss = parseInt(document.getElementById("oss").value) || 0;
  const cgpa = parseFloat(document.getElementById("cgpa").value) || 0;
  const skills = document.getElementById("skills").value
    .toLowerCase()
    .split(",")
    .map(s => s.trim())
    .filter(s => s !== "");

  const resultBox = document.getElementById("resultBox");

  // Weighted scoring
  const projectScore = Math.min(projects * 10, 100);
  const dsaScore = Math.min(dsa / 3, 100);
  const ossScore = Math.min(oss * 5, 100);
  const cgpaScore = Math.min((cgpa / 10) * 100, 100);
  const skillScore = Math.min(skills.length * 10, 100);

  const finalScore = Math.round(
    projectScore * 0.25 +
    dsaScore * 0.25 +
    ossScore * 0.2 +
    cgpaScore * 0.15 +
    skillScore * 0.15
  );

  let statusClass = "bad";
  let statusText = "Not Ready";

  if (finalScore > 80) {
    statusClass = "good";
    statusText = "Internship Ready";
  } else if (finalScore > 60) {
    statusClass = "warning";
    statusText = "Almost Ready";
  }

  let suggestions = [];

  if (projects < 5)
    suggestions.push("Build more real-world projects.");
  if (dsa < 200)
    suggestions.push("Increase DSA practice for coding interviews.");
  if (oss < 10)
    suggestions.push("Contribute more to open source.");
  if (cgpa < 7)
    suggestions.push("Improve academic performance.");
  if (skills.length < 5)
    suggestions.push("Expand your technical skill set.");

  resultBox.innerHTML = `
    <div class="report-box">
      <p><strong>Final Internship Readiness Score:</strong> 
        <span class="${statusClass}">${finalScore}/100</span>
      </p>

      <p><strong>Status:</strong> 
        <span class="${statusClass}">${statusText}</span>
      </p>

      <hr>

      <p><strong>Score Breakdown:</strong></p>
      <ul>
        <li>Projects: ${projectScore}/100</li>
        <li>DSA: ${dsaScore.toFixed(0)}/100</li>
        <li>Open Source: ${ossScore}/100</li>
        <li>CGPA: ${cgpaScore.toFixed(0)}/100</li>
        <li>Skills: ${skillScore}/100</li>
      </ul>

      <hr>

      <p><strong>Improvement Suggestions:</strong></p>
      <ul>
        ${suggestions.length
          ? suggestions.map(s => `<li>${s}</li>`).join("")
          : "<li>No major improvements needed.</li>"}
      </ul>
    </div>
  `;
}
