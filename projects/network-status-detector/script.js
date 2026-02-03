const statusIndicator = document.getElementById("statusIndicator");
const logList = document.getElementById("logList");

function updateStatus(isOnline) {
  const time = new Date().toLocaleTimeString();

  if (isOnline) {
    statusIndicator.textContent = "Online";
    statusIndicator.classList.remove("offline");
    statusIndicator.classList.add("online");
    addLog(`🟢 Online at ${time}`);
  } else {
    statusIndicator.textContent = "Offline";
    statusIndicator.classList.remove("online");
    statusIndicator.classList.add("offline");
    addLog(`🔴 Offline at ${time}`);
  }
}

function addLog(message) {
  const li = document.createElement("li");
  li.textContent = message;
  logList.prepend(li);
}

window.addEventListener("online", () => updateStatus(true));
window.addEventListener("offline", () => updateStatus(false));

// Initial status
updateStatus(navigator.onLine);