function analyzeBurnout() {
  const study = parseInt(document.getElementById("study").value) || 0;
  const work = parseInt(document.getElementById("work").value) || 0;
  const sleep = parseInt(document.getElementById("sleep").value) || 0;
  const stress = parseInt(document.getElementById("stress").value) || 0;

  const result = document.getElementById("result");

  if (!study || !work || !sleep || !stress) {
    result.innerHTML = "<p>Please fill all fields.</p>";
    return;
  }

  // Burnout Score Logic
  let burnoutScore = 
    (study * 3) +
    (work * 4) +
    ((10 - sleep) * 5) +
    (stress * 6);

  burnoutScore = Math.min(burnoutScore, 100);

  let riskLevel = "Low Risk";
  let barClass = "low";

  if (burnoutScore > 50) {
    riskLevel = "Moderate Risk";
    barClass = "medium";
  }

  if (burnoutScore > 75) {
    riskLevel = "High Risk";
    barClass = "high";
  }

  let suggestions = [];

  if (sleep < 7)
    suggestions.push("Increase sleep to at least 7–8 hours.");
  if (stress > 6)
    suggestions.push("Introduce stress management techniques.");
  if (work + study > 12)
    suggestions.push("Reduce workload or schedule breaks.");
  if (suggestions.length === 0)
    suggestions.push("Your routine looks balanced. Maintain consistency.");

  result.innerHTML = `
    <h2>Burnout Analysis</h2>

    <p><strong>Burnout Score:</strong> ${burnoutScore}/100</p>

    <div class="progress">
      <div class="progress-bar ${barClass}" style="width:${burnoutScore}%"></div>
    </div>

    <p><strong>Risk Level:</strong> ${riskLevel}</p>

    <hr>

    <p><strong>Recommendations:</strong></p>
    <ul>
      ${suggestions.map(s => `<li>${s}</li>`).join("")}
    </ul>
  `;
}
