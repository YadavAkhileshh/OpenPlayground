const severity = document.getElementById("severity");
const users = document.getElementById("users");
const fixTime = document.getElementById("fixTime");

const severityValue = document.getElementById("severityValue");
const usersValue = document.getElementById("usersValue");
const fixValue = document.getElementById("fixValue");

severity.oninput = () => severityValue.textContent = severity.value;
users.oninput = () => usersValue.textContent = users.value + "%";
fixTime.oninput = () => fixValue.textContent = fixTime.value + "h";

function simulateImpact() {

  const sev = parseInt(severity.value);
  const userImpact = parseInt(users.value);
  const hours = parseInt(fixTime.value);

  const dashboard = document.getElementById("dashboard");
  dashboard.classList.remove("hidden");

  // Revenue Loss Formula
  const baseRevenuePerHour = 5000;
  const revenueLoss = (baseRevenuePerHour * (userImpact/100) * hours * (sev/5)).toFixed(0);

  // Stability Drop
  const stability = Math.max(0, 100 - (sev * 10) - (userImpact * 0.5));

  // SLA Risk
  let slaRisk = "Low";
  if (hours > 12 || sev >= 4) slaRisk = "High";
  else if (hours > 6) slaRisk = "Medium";

  // Overall Risk
  let riskLevel = "Minor";
  const riskScore = sev * userImpact * hours;

  if (riskScore > 5000) riskLevel = "Critical";
  else if (riskScore > 2000) riskLevel = "High";
  else if (riskScore > 800) riskLevel = "Moderate";

  document.getElementById("revenueLoss").textContent = "$" + revenueLoss;
  document.getElementById("stability").textContent = stability.toFixed(1) + "%";
  document.getElementById("slaRisk").textContent = slaRisk;
  document.getElementById("riskLevel").textContent = riskLevel;
}
