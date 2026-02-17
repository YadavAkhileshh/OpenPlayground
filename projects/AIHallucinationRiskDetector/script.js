function analyze() {

  const text = document.getElementById("inputText").value.toLowerCase();
  const results = document.getElementById("results");
  const signalsList = document.getElementById("signals");

  if (!text.trim()) {
    alert("Please paste AI response.");
    return;
  }

  results.classList.remove("hidden");
  signalsList.innerHTML = "";

  let riskScore = 0;
  let signals = [];

  // 1️⃣ Overconfidence Detection
  const overconfidenceWords = ["always", "definitely", "guaranteed", "never", "proven"];
  if (overconfidenceWords.some(word => text.includes(word))) {
    riskScore += 20;
    signals.push("Overconfident language detected");
  }

  // 2️⃣ Vagueness Detection
  const vagueWords = ["many experts", "some studies", "it is believed", "widely known"];
  if (vagueWords.some(word => text.includes(word))) {
    riskScore += 20;
    signals.push("Vague authority references detected");
  }

  // 3️⃣ Lack of Data / Numbers
  if (!/\d/.test(text)) {
    riskScore += 15;
    signals.push("No supporting data or numbers found");
  }

  // 4️⃣ Speculative Language
  const speculativeWords = ["might", "could", "possibly", "may"];
  if (speculativeWords.filter(word => text.includes(word)).length > 3) {
    riskScore += 15;
    signals.push("High speculative phrasing detected");
  }

  // 5️⃣ Missing Citations
  if (!text.includes("http") && !text.includes("source") && !text.includes("according to")) {
    riskScore += 20;
    signals.push("No sources or citations mentioned");
  }

  // 6️⃣ Excessive Certainty Without Evidence
  if (riskScore > 50) {
    signals.push("High likelihood of unsupported claims");
  }

  // Cap at 100
  if (riskScore > 100) riskScore = 100;

  let confidenceLevel = "Low Risk";
  if (riskScore >= 60) confidenceLevel = "High Hallucination Risk";
  else if (riskScore >= 30) confidenceLevel = "Moderate Risk";

  document.getElementById("riskScore").textContent = riskScore + "/100";
  document.getElementById("confidenceLevel").textContent = confidenceLevel;

  if (signals.length === 0) {
    signals.push("No major hallucination signals detected");
  }

  signals.forEach(signal => {
    const li = document.createElement("li");
    li.textContent = signal;
    signalsList.appendChild(li);
  });
}
