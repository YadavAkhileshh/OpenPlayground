const sendBtn = document.getElementById("sendBtn");
const list = document.getElementById("notificationList");

const fatigueEl = document.getElementById("fatigueScore");
const totalSentEl = document.getElementById("totalSent");
const suppressedEl = document.getElementById("suppressed");

let fatigue = 0;
let totalSent = 0;
let suppressed = 0;

let history = JSON.parse(localStorage.getItem("notifHistory")) || [];

sendBtn.addEventListener("click", sendNotification);

function sendNotification() {
  const type = document.getElementById("type").value;
  const urgency = document.getElementById("urgency").value;
  const busy = document.getElementById("busy").checked;
  const focus = document.getElementById("focus").checked;

  const decision = decide(type, urgency, busy, focus);

  if (decision === "suppress") {
    suppressed++;
    saveHistory(type, urgency, decision);
    updateStats();
    return;
  }

  renderNotification(type, urgency, decision);
  totalSent++;
  fatigue += urgency === "high" ? 3 : urgency === "medium" ? 2 : 1;

  saveHistory(type, urgency, decision);
  updateStats();
}

function decide(type, urgency, busy, focus) {
  if (focus && urgency !== "high") return "suppress";
  if (busy && fatigue > 10 && urgency === "low") return "suppress";
  if (fatigue > 20 && urgency !== "high") return "suppress";
  return "deliver";
}

function renderNotification(type, urgency, decision) {
  const div = document.createElement("div");
  div.className = `notification ${type}`;

  div.innerHTML = `
    <strong>${type.toUpperCase()}</strong> (${urgency})
    <p>Decision: ${decision}</p>
    <button onclick="interact('open')">Open</button>
    <button onclick="interact('dismiss')">Dismiss</button>
  `;

  list.prepend(div);
}

function interact(action) {
  if (action === "dismiss") fatigue += 1;
  if (action === "open") fatigue -= 1;
  fatigue = Math.max(0, fatigue);
  updateStats();
}

function updateStats() {
  fatigueEl.textContent = fatigue;
  totalSentEl.textContent = totalSent;
  suppressedEl.textContent = suppressed;
}

function saveHistory(type, urgency, decision) {
  history.push({
    date: new Date().toISOString(),
    type,
    urgency,
    decision,
    fatigue
  });
  localStorage.setItem("notifHistory", JSON.stringify(history));
}