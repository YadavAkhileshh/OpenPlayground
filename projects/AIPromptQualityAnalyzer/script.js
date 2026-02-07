function analyzePrompt() {
  const text = document.getElementById("promptInput").value.trim();
  const resultDiv = document.getElementById("result");

  if (!text) {
    alert("Please enter a prompt.");
    return;
  }

  let score = 0;
  let suggestions = [];

  const wordCount = text.split(/\s+/).length;

  // 1️⃣ Length Analysis
  if (wordCount >= 50) {
    score += 20;
  } else {
    suggestions.push("Increase detail. Good prompts are usually 50+ words.");
  }

  // 2️⃣ Specificity Check
  const specificWords = ["exactly", "step-by-step", "detailed", "format", "bullet", "table", "examples"];
  const specificityCount = specificWords.filter(word => text.toLowerCase().includes(word)).length;

  if (specificityCount >= 2) {
    score += 15;
  } else {
    suggestions.push("Add formatting instructions (e.g., bullet points, step-by-step, table).");
  }

  // 3️⃣ Constraints
  const constraintWords = ["limit", "only", "avoid", "must", "strictly"];
  if (constraintWords.some(word => text.toLowerCase().includes(word))) {
    score += 15;
  } else {
    suggestions.push("Add constraints (e.g., word limit, tone restriction).");
  }

  // 4️⃣ Action Verbs
  const actionVerbs = ["create", "generate", "analyze", "explain", "design", "build"];
  if (actionVerbs.some(word => text.toLowerCase().includes(word))) {
    score += 15;
  } else {
    suggestions.push("Use clearer action verbs (e.g., generate, explain, design).");
  }

  // 5️⃣ Example Inclusion
  if (text.toLowerCase().includes("example")) {
    score += 15;
  } else {
    suggestions.push("Add an example to clarify expectations.");
  }

  // 6️⃣ Structure
  if (text.includes("\n")) {
    score += 10;
  } else {
    suggestions.push("Use line breaks to improve structure.");
  }

  // 7️⃣ Tone/Role Definition
  if (text.toLowerCase().includes("act as")) {
    score += 10;
  } else {
    suggestions.push("Define a role (e.g., 'Act as a professional copywriter').");
  }

  if (score > 100) score = 100;

  let qualityClass = "bad";
  let qualityText = "Weak Prompt";

  if (score >= 75) {
    qualityClass = "good";
    qualityText = "Strong Prompt";
  } else if (score >= 50) {
    qualityClass = "medium";
    qualityText = "Moderate Prompt";
  }

  resultDiv.classList.remove("hidden");

  resultDiv.innerHTML = `
    <div class="score ${qualityClass}">${score}/100 - ${qualityText}</div>
    <p><strong>Word Count:</strong> ${wordCount}</p>
    <p><strong>Improvement Suggestions:</strong></p>
    <ul>
      ${suggestions.length ? suggestions.map(s => `<li>${s}</li>`).join("") : "<li>No major improvements needed.</li>"}
    </ul>
  `;
}
