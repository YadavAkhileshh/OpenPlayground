let allowed = 0;
let blocked = 0;

let capacity = 10;
let tokens = capacity;
let windowRequests = 0;
let slidingWindow = [];
let interval;

const allowedEl = document.getElementById("allowed");
const blockedEl = document.getElementById("blocked");
const fillEl = document.getElementById("fill");

function updateUI() {
  allowedEl.textContent = allowed;
  blockedEl.textContent = blocked;
  fillEl.style.height = (tokens / capacity) * 100 + "%";
}

function sendRequest() {

  const algo = document.getElementById("algorithm").value;
  let success = false;

  if (algo === "fixed") {
    if (windowRequests < capacity) {
      windowRequests++;
      success = true;
    }
  }

  if (algo === "sliding") {
    const now = Date.now();
    slidingWindow = slidingWindow.filter(t => now - t < 10000);
    if (slidingWindow.length < capacity) {
      slidingWindow.push(now);
      success = true;
    }
  }

  if (algo === "token") {
    if (tokens > 0) {
      tokens--;
      success = true;
    }
  }

  if (algo === "leaky") {
    if (tokens < capacity) {
      tokens++;
      success = true;
    }
  }

  if (success) allowed++;
  else blocked++;

  updateUI();
}

function startAuto() {
  clearInterval(interval);
  interval = setInterval(() => {
    sendRequest();
  }, 500);
}

function reset() {
  allowed = 0;
  blocked = 0;
  tokens = capacity;
  windowRequests = 0;
  slidingWindow = [];
  clearInterval(interval);
  updateUI();
}

setInterval(() => {
  if (tokens < capacity) tokens++;
  windowRequests = 0;
}, 10000);

updateUI();
