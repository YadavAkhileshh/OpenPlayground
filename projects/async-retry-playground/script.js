/* =========================================================
   Async Retry Strategy Playground
   ========================================================= */

/* ================= DOM ================= */

const failureRateInput = document.getElementById("failureRate");
const maxRetriesInput = document.getElementById("maxRetries");
const strategySelect = document.getElementById("strategy");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const statusText = document.getElementById("statusText");
const logContainer = document.getElementById("logContainer");

/* ================= EVENT LISTENERS ================= */

startBtn.addEventListener("click", startSimulation);
resetBtn.addEventListener("click", resetSimulation);

/* ================= CORE ================= */

async function startSimulation() {
  resetSimulation();

  const failureRate = Number(failureRateInput.value);
  const maxRetries = Number(maxRetriesInput.value);
  const strategy = strategySelect.value;

  statusText.innerText = "Running...";

  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    attempt++;
    log(`Attempt ${attempt}`);

    try {
      await fakeRequest(failureRate);
      success = true;
      statusText.innerText = "✅ Request succeeded";
      log("Request succeeded");
    } catch (err) {
      log("Request failed");

      if (strategy === "circuit" && attempt >= 3) {
        statusText.innerText = "⛔ Circuit breaker opened";
        log("Circuit breaker triggered");
        break;
      }

      const delay = calculateDelay(strategy, attempt);
      log(`Waiting ${delay} ms before retry`);
      await wait(delay);
    }
  }

  if (!success && strategy !== "circuit") {
    statusText.innerText = "❌ All retries exhausted";
  }
}

/* ================= STRATEGIES ================= */

function calculateDelay(strategy, attempt) {
  if (strategy === "fixed") {
    return 1000;
  }

  if (strategy === "exponential") {
    return Math.pow(2, attempt) * 300;
  }

  if (strategy === "jitter") {
    const base = Math.pow(2, attempt) * 300;
    return base + Math.random() * 500;
  }

  return 0;
}

/* ================= HELPERS ================= */

function fakeRequest(failureRate) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() < failureRate ? reject() : resolve();
    }, 600);
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ================= LOG ================= */

function log(message) {
  const div = document.createElement("div");
  div.className = "log-entry";
  div.innerText = message;
  logContainer.appendChild(div);
  logContainer.scrollTop = logContainer.scrollHeight;
}

/* ================= RESET ================= */

function resetSimulation() {
  logContainer.innerHTML = "";
  statusText.innerText = "Idle";
}