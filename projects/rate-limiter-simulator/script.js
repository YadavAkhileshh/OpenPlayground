const requestBtn = document.getElementById("requestBtn");
const statusBox = document.getElementById("status");

let requests = [];
let tokens = 0;
let lastRefill = Date.now();

requestBtn.addEventListener("click", handleRequest);

function handleRequest() {
  const limit = Number(document.getElementById("limit").value);
  const windowSec = Number(document.getElementById("window").value);
  const strategy = document.getElementById("strategy").value;
  const burst = document.getElementById("burst").checked;

  let allowed = false;

  if (strategy === "fixed") {
    allowed = fixedWindow(limit, windowSec);
  } else if (strategy === "sliding") {
    allowed = slidingWindow(limit, windowSec);
  } else {
    allowed = tokenBucket(limit, windowSec, burst);
  }

  showStatus(allowed, limit);
}

function fixedWindow(limit, windowSec) {
  const now = Date.now();
  requests = requests.filter(r => now - r < windowSec * 1000);

  if (requests.length < limit) {
    requests.push(now);
    return true;
  }
  return false;
}

function slidingWindow(limit, windowSec) {
  return fixedWindow(limit, windowSec);
}

function tokenBucket(limit, windowSec, burst) {
  const now = Date.now();
  const refillRate = limit / windowSec;
  const elapsed = (now - lastRefill) / 1000;

  tokens += elapsed * refillRate;
  tokens = Math.min(tokens, burst ? limit * 2 : limit);

  lastRefill = now;

  if (tokens >= 1) {
    tokens -= 1;
    return true;
  }
  return false;
}

function showStatus(allowed, limit) {
  statusBox.innerHTML = allowed
    ? `✅ Request allowed<br/>Remaining quota available`
    : `❌ Rate limit exceeded<br/>Try again later`;

  statusBox.classList.remove("hidden");
}