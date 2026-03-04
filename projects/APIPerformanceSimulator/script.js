function analyzeAPI() {
  const rps = parseInt(document.getElementById("rps").value) || 0;
  const response = parseInt(document.getElementById("response").value) || 0;
  const error = parseFloat(document.getElementById("error").value) || 0;

  const result = document.getElementById("result");

  if (!rps || !response) {
    result.innerHTML = "<p>Please fill required fields.</p>";
    return;
  }

  // Load Score Logic
  const loadScore = Math.min((rps * response) / 1000, 100);

  // Failure Risk Logic
  const failureRisk = Math.min(error * 5 + (response > 500 ? 20 : 0), 100);

  let statusClass = "good";
  let statusText = "Stable";

  if (loadScore > 70 || failureRisk > 50) {
    statusClass = "medium";
    statusText = "Moderate Risk";
  }

  if (loadScore > 90 || failureRisk > 70) {
    statusClass = "bad";
    statusText = "High Risk";
  }

  result.innerHTML = `
    <h2>Performance Report</h2>

    <p><strong>System Load Score:</strong> ${loadScore.toFixed(0)}/100</p>
    <p><strong>Failure Risk Score:</strong> ${failureRisk.toFixed(0)}/100</p>

    <hr>

    <p><strong>Status:</strong> 
      <span class="${statusClass}">${statusText}</span>
    </p>

    <hr>

    <p><strong>Scaling Recommendation:</strong></p>
    <ul>
      ${loadScore > 70 ? "<li>Consider horizontal scaling (add servers).</li>" : ""}
      ${response > 400 ? "<li>Optimize backend response time.</li>" : ""}
      ${error > 5 ? "<li>Improve error handling and monitoring.</li>" : ""}
      ${loadScore <= 70 && error <= 5 ? "<li>System operating within safe limits.</li>" : ""}
    </ul>
  `;
}
