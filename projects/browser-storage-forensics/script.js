const entriesBox = document.getElementById("entries");
const resultsBox = document.getElementById("results");

const totalKeysEl = document.getElementById("totalKeys");
const sensitiveKeysEl = document.getElementById("sensitiveKeys");
const totalSizeEl = document.getElementById("totalSize");
const riskLevelEl = document.getElementById("riskLevel");
const historyList = document.getElementById("historyList");

/* ---------- DATA SEEDING ---------- */

function seedPreferences() {
  localStorage.setItem("theme", "dark");
  localStorage.setItem("language", "en");
  alert("Preferences seeded");
}

function seedAuth() {
  localStorage.setItem("auth_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  sessionStorage.setItem("user_email", "user@example.com");
  alert("Auth data seeded");
}

function seedCorrupted() {
  localStorage.setItem("temp_data", "{broken_json:");
  alert("Corrupted data seeded");
}

/* ---------- SCAN LOGIC ---------- */

function runScan() {
  entriesBox.innerHTML = "";

  const entries = [];
  scanStorage(localStorage, "localStorage", entries);
  scanStorage(sessionStorage, "sessionStorage", entries);

  analyzeResults(entries);
  saveScan(entries);

  resultsBox.classList.remove("hidden");
}

function scanStorage(storage, label, list) {
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const value = storage.getItem(key);
    const size = key.length + value.length;

    const risk = detectRisk(key, value);

    list.push({
      storage: label,
      key,
      risk,
      size
    });
  }
}

/* ---------- RISK DETECTION ---------- */

function detectRisk(key, value) {
  const lowered = (key + value).toLowerCase();

  if (
    lowered.includes("token") ||
    lowered.includes("auth") ||
    lowered.includes("password")
  ) return "high";

  if (
    lowered.includes("email") ||
    lowered.includes("user")
  ) return "medium";

  return "low";
}

/* ---------- ANALYSIS ---------- */

function analyzeResults(entries) {
  let totalSize = 0;
  let sensitive = 0;
  let riskScore = 0;

  entries.forEach(e => {
    totalSize += e.size;
    if (e.risk === "high") {
      sensitive++;
      riskScore += 2;
    }
    if (e.risk === "medium") riskScore += 1;

    renderEntry(e);
  });

  totalKeysEl.textContent = entries.length;
  sensitiveKeysEl.textContent = sensitive;
  totalSizeEl.textContent = totalSize;
  riskLevelEl.textContent = calculateRiskLevel(riskScore);
}

function calculateRiskLevel(score) {
  if (score < 2) return "Low";
  if (score < 5) return "Medium";
  return "High";
}

/* ---------- UI ---------- */

function renderEntry(entry) {
  const row = document.createElement("div");
  row.className = "row";

  row.innerHTML = `
    <div>${entry.storage}</div>
    <div>${entry.key}</div>
    <div class="${entry.risk}">${entry.risk.toUpperCase()}</div>
    <div>${entry.size}</div>
    <div>
      <button onclick="removeKey('${entry.storage}','${entry.key}')">
        Delete
      </button>
    </div>
  `;

  entriesBox.appendChild(row);
}

function removeKey(type, key) {
  if (type === "localStorage") localStorage.removeItem(key);
  else sessionStorage.removeItem(key);
  runScan();
}

/* ---------- HISTORY ---------- */

function saveScan(entries) {
  const history = JSON.parse(localStorage.getItem("scanHistory")) || [];

  history.push({
    date: new Date().toISOString(),
    count: entries.length,
    risk: riskLevelEl.textContent
  });

  localStorage.setItem("scanHistory", JSON.stringify(history));
  renderHistory(history);
}

function renderHistory(history) {
  if (!history.length) {
    historyList.textContent = "No scans yet.";
    return;
  }

  historyList.innerHTML = history
    .map(h => `
      <div>
        ${new Date(h.date).toLocaleString()} –
        Keys: ${h.count},
        Risk: ${h.risk}
      </div>
    `)
    .join("");
}

renderHistory(JSON.parse(localStorage.getItem("scanHistory")) || []);