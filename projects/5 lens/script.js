
const GROQ_API_KEY = "YOUR_GROQ_API_KEY"; 
const MODEL = "llama-3.1-8b-instant";


const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.floor((window.innerWidth * window.innerHeight) / 18000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(124,92,252,${p.alpha})`;
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(drawParticles);
}

window.addEventListener("resize", () => { resizeCanvas(); createParticles(); });
resizeCanvas();
createParticles();
drawParticles();

// ── DOM REFS ─────────────────────────────────────────────
const problemText = document.getElementById("problemText");
const counter     = document.getElementById("counter");
const analyzeBtn  = document.getElementById("analyzeBtn");
const loading     = document.getElementById("loading");
const results     = document.getElementById("results");
const inputBox    = document.getElementById("inputBox");
const problemEcho = document.getElementById("problemEcho");
const copyBtn     = document.getElementById("copyBtn");
const resetBtn    = document.getElementById("resetBtn");

// ── CHAR COUNTER ─────────────────────────────────────────
problemText.addEventListener("input", () => {
  const len = problemText.value.length;
  counter.textContent = `${len} / 500`;
  counter.style.color = len > 450 ? "#fc5c7d" : "#5a5a7a";
});

// ── ANALYZE ──────────────────────────────────────────────
analyzeBtn.addEventListener("click", analyze);
problemText.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.ctrlKey) analyze();
});

async function analyze() {
  const problem = problemText.value.trim();
  if (!problem) {
    problemText.style.borderBottom = "2px solid #fc5c7d";
    problemText.placeholder = "Please describe your problem first...";
    setTimeout(() => { problemText.style.borderBottom = ""; }, 1500);
    return;
  }

  // Show loading
  inputBox.classList.add("hidden");
  results.classList.add("hidden");
  loading.classList.remove("hidden");
  analyzeBtn.disabled = true;

  const prompt = `
You are a world-class problem-solving coach. Analyze this problem and respond ONLY in valid JSON format.

Problem: "${problem}"

Respond with exactly this JSON structure:
{
  "rootCause": "A clear 2-3 sentence explanation of the real root cause behind this problem",
  "quickFix": "A practical immediate action they can take today to reduce the problem",
  "longTermSolution": "A strategic 2-3 sentence long-term approach to permanently solve this",
  "actionSteps": ["Step 1 description", "Step 2 description", "Step 3 description", "Step 4 description"],
  "mindsetShift": "A powerful reframe or perspective shift that will change how they see this problem"
}

Return ONLY the JSON object. No extra text, no markdown, no backticks.
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "API Error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Clean and parse JSON
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    showResults(problem, parsed);

  } catch (err) {
    loading.classList.add("hidden");
    inputBox.classList.remove("hidden");
    analyzeBtn.disabled = false;
    alert("⚠️ Error: " + err.message + "\n\nCheck your API key in script.js");
  }
}

// ── SHOW RESULTS ─────────────────────────────────────────
function showResults(problem, data) {
  loading.classList.add("hidden");

  // Echo
  problemEcho.innerHTML = `<strong>YOUR PROBLEM</strong>${problem}`;

  // Fill cards
  document.getElementById("rootContent").textContent    = data.rootCause || "—";
  document.getElementById("quickContent").textContent   = data.quickFix || "—";
  document.getElementById("longContent").textContent    = data.longTermSolution || "—";
  document.getElementById("mindsetContent").textContent = data.mindsetShift || "—";

  // Action steps as list
  const stepsEl = document.getElementById("stepsContent");
  if (Array.isArray(data.actionSteps) && data.actionSteps.length > 0) {
    stepsEl.innerHTML = "<ul>" + data.actionSteps.map(s => `<li>${s}</li>`).join("") + "</ul>";
  } else {
    stepsEl.textContent = data.actionSteps || "—";
  }

  results.classList.remove("hidden");

  // Scroll to results
  setTimeout(() => results.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
}

// ── COPY ALL ─────────────────────────────────────────────
copyBtn.addEventListener("click", () => {
  const root    = document.getElementById("rootContent").textContent;
  const quick   = document.getElementById("quickContent").textContent;
  const long    = document.getElementById("longContent").textContent;
  const steps   = document.getElementById("stepsContent").textContent;
  const mindset = document.getElementById("mindsetContent").textContent;

  const text = `CLARIFYIT — PROBLEM ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 ROOT CAUSE
${root}

⚡ QUICK FIX
${quick}

🎯 LONG-TERM SOLUTION
${long}

📋 ACTION STEPS
${steps}

🧠 MINDSET SHIFT
${mindset}
`;

  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => { copyBtn.textContent = "📋 Copy All"; }, 2000);
  });
});

// ── RESET ────────────────────────────────────────────────
resetBtn.addEventListener("click", () => {
  results.classList.add("hidden");
  inputBox.classList.remove("hidden");
  problemText.value = "";
  counter.textContent = "0 / 500";
  analyzeBtn.disabled = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
