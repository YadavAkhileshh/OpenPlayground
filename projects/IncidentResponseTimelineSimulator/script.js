const severity = document.getElementById("severity");
const detectionDelay = document.getElementById("detectionDelay");

const severityValue = document.getElementById("severityValue");
const delayValue = document.getElementById("delayValue");

severity.oninput = () => severityValue.textContent = severity.value;
detectionDelay.oninput = () => delayValue.textContent = detectionDelay.value + "m";

function startSimulation() {

  const sev = parseInt(severity.value);
  const delay = parseInt(detectionDelay.value);

  const timeline = document.getElementById("timeline");
  const report = document.getElementById("report");

  timeline.innerHTML = "";
  timeline.classList.remove("hidden");
  report.classList.add("hidden");

  const events = [
    "🚨 Incident Detected",
    "📢 Alert Triggered",
    "👨‍💻 On-call Engineer Engaged",
    "🔍 Root Cause Identified",
    "🛠 Mitigation Applied",
    "✅ System Restored"
  ];

  let timeElapsed = delay;
  let index = 0;

  const interval = setInterval(() => {

    const eventDiv = document.createElement("div");
    eventDiv.className = "event";
    eventDiv.textContent = `T+${timeElapsed} min — ${events[index]}`;
    timeline.appendChild(eventDiv);

    timeElapsed += Math.floor(Math.random() * 10) + 5;
    index++;

    if (index === events.length) {
      clearInterval(interval);
      generateReport(sev, timeElapsed);
    }

  }, 800);
}

function generateReport(severity, downtime) {

  const report = document.getElementById("report");
  report.classList.remove("hidden");

  const revenuePerMinute = 200;
  const revenueImpact = downtime * revenuePerMinute * (severity / 2);

  const customerImpact = severity * 20;

  const riskScore = (severity * downtime).toFixed(0);

  document.getElementById("downtime").textContent = downtime + " minutes";
  document.getElementById("revenueImpact").textContent = "$" + revenueImpact.toFixed(0);
  document.getElementById("customerImpact").textContent = customerImpact + "% users affected";
  document.getElementById("riskScore").textContent = riskScore;
}
