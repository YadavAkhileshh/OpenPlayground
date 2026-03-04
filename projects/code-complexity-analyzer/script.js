const analyzeBtn = document.getElementById("analyzeBtn");
const codeInput = document.getElementById("codeInput");
const results = document.getElementById("results");

analyzeBtn.addEventListener("click", () => {
  const code = codeInput.value.trim();

  if (!code) {
    showResults("Please paste some code first.");
    return;
  }

  const lines = code.split("\n").filter(l => l.trim() !== "");
  const loopCount = countLoops(code);
  const nestingDepth = calculateNesting(code);
  const variableScore = analyzeVariableNames(code);

  const complexityLevel = determineComplexity(
    lines.length,
    loopCount,
    nestingDepth,
    variableScore
  );

  saveAnalysis(lines.length, loopCount, nestingDepth, complexityLevel);

  showResults(`
    <div class="metric">📏 Lines of Code: ${lines.length}</div>
    <div class="metric">🔁 Loops Detected: ${loopCount}</div>
    <div class="metric">🧱 Max Nesting Depth: ${nestingDepth}</div>
    <div class="metric">🏷️ Variable Quality: ${variableScore}</div>
    <div class="level">😈 Complexity Level: ${complexityLevel}</div>
  `);
});

function countLoops(code) {
  const matches = code.match(/\b(for|while|do)\b/g);
  return matches ? matches.length : 0;
}

function calculateNesting(code) {
  let maxDepth = 0;
  let currentDepth = 0;

  for (let char of code) {
    if (char === "{") {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
    if (char === "}") {
      currentDepth--;
    }
  }
  return maxDepth;
}

function analyzeVariableNames(code) {
  const matches = code.match(/\b(let|var|const)\s+([a-zA-Z_$][\w$]*)/g);
  if (!matches) return "Good";

  let badNames = 0;
  matches.forEach(v => {
    const name = v.split(" ").pop();
    if (name.length <= 2) badNames++;
  });

  return badNames > 2 ? "Poor" : "Acceptable";
}

function determineComplexity(lines, loops, nesting, vars) {
  let score = 0;

  if (lines > 50) score++;
  if (loops > 3) score++;
  if (nesting > 4) score++;
  if (vars === "Poor") score++;

  if (score <= 1) return "Safe";
  if (score === 2) return "Risky";
  return "Dangerous";
}

function showResults(content) {
  results.innerHTML = content;
  results.classList.remove("hidden");
}

function saveAnalysis(lines, loops, nesting, level) {
  const history = JSON.parse(localStorage.getItem("analysisHistory")) || [];
  history.push({ lines, loops, nesting, level, date: new Date().toISOString() });
  localStorage.setItem("analysisHistory", JSON.stringify(history));
}