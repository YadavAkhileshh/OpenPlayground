let actionLog = [];

function logAction(action) {
  actionLog.push({
    action,
    time: new Date().toISOString()
  });

  if (actionLog.length > 10) {
    actionLog.shift();
  }
}

function triggerError(type) {
  logAction(`Triggered ${type}`);

  const error = {
    type,
    message: getErrorMessage(type),
    timestamp: new Date().toISOString(),
    actions: [...actionLog]
  };

  saveError(error);
  alert(`${type} captured!`);
}

function getErrorMessage(type) {
  if (type === "TypeError") return "Cannot read property 'x' of undefined";
  if (type === "ReferenceError") return "variable is not defined";
  return "Failed to fetch resource";
}

function saveError(error) {
  const history = JSON.parse(localStorage.getItem("errorLogs")) || [];
  history.push(error);
  localStorage.setItem("errorLogs", JSON.stringify(history));
}

function showLastReport() {
  const history = JSON.parse(localStorage.getItem("errorLogs")) || [];
  const reportBox = document.getElementById("report");

  if (!history.length) {
    reportBox.innerHTML = "No error reports found.";
    reportBox.classList.remove("hidden");
    return;
  }

  const last = history[history.length - 1];

  reportBox.innerHTML = `
    <strong>Error Type:</strong> ${last.type}<br/>
    <strong>Message:</strong> ${last.message}<br/>
    <strong>Timestamp:</strong> ${last.timestamp}<br/>
    <strong>User Actions Before Error:</strong>
    <ul>
      ${last.actions.map(a => `<li>${a.time} – ${a.action}</li>`).join("")}
    </ul>
  `;
  reportBox.classList.remove("hidden");
}