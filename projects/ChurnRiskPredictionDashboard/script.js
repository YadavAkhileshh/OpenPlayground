function predictChurn() {
  const tenure = parseInt(document.getElementById("tenure").value);
  const usage = parseInt(document.getElementById("usage").value);
  const support = parseInt(document.getElementById("support").value);
  const paymentDelay = parseInt(document.getElementById("paymentDelay").value);

  if (isNaN(tenure) || isNaN(usage) || isNaN(support) || isNaN(paymentDelay)) {
    alert("Please fill all fields");
    return;
  }

  // Simple rule-based risk scoring
  let riskScore = 0;

  riskScore += (support * 15);
  riskScore += (paymentDelay * 20);

  if (usage < 10) riskScore += 25;
  if (tenure < 6) riskScore += 20;

  riskScore = Math.min(riskScore, 100);

  const resultDiv = document.getElementById("riskResult");
  const riskFill = document.getElementById("riskFill");

  let riskLevel;

  if (riskScore < 35) {
    riskLevel = "LOW RISK";
    riskFill.className = "low";
  } else if (riskScore < 70) {
    riskLevel = "MEDIUM RISK";
    riskFill.className = "medium";
  } else {
    riskLevel = "HIGH RISK";
    riskFill.className = "high";
  }

  resultDiv.innerText = `Risk Score: ${riskScore}% (${riskLevel})`;
  riskFill.style.width = riskScore + "%";

  addCustomerToList(riskScore, riskLevel);
}

function addCustomerToList(score, level) {
  const list = document.getElementById("customerList");

  const div = document.createElement("div");
  div.className = "customer-item";
  div.innerText = `Score: ${score}% | ${level}`;

  list.prepend(div);
}
