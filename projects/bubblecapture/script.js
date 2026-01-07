const boxes = document.querySelectorAll(".box");
const log = document.getElementById("eventLog");
const captureToggle = document.getElementById("captureToggle");

function clearLog() {
  log.innerHTML = "";
}

function logEvent(element, phase) {
  const li = document.createElement("li");
  li.textContent = `${phase}: ${element.dataset.name}`;
  log.appendChild(li);
}

function addListeners(useCapture) {
  boxes.forEach(box => {
    box.replaceWith(box.cloneNode(true));
  });

  const freshBoxes = document.querySelectorAll(".box");

  freshBoxes.forEach(box => {
    box.addEventListener(
      "click",
      (e) => {
        logEvent(box, useCapture ? "Capture" : "Bubble");
      },
      useCapture
    );
  });
}

captureToggle.addEventListener("change", () => {
  clearLog();
  addListeners(captureToggle.checked);
});

addListeners(false);
