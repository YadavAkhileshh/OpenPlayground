const outer = document.getElementById("outer");
const middle = document.getElementById("middle");
const inner = document.getElementById("inner");
const logList = document.getElementById("logList");

// Add log entry
function logEvent(text) {
  const li = document.createElement("li");
  li.textContent = text;
  logList.appendChild(li);
}

// Highlight element
function highlight(el) {
  el.classList.add("active");

  setTimeout(() => {
    el.classList.remove("active");
  }, 400);
}

// Capturing phase
outer.addEventListener("click", () => {
  logEvent("Outer - Capturing");
  highlight(outer);
}, true);

middle.addEventListener("click", () => {
  logEvent("Middle - Capturing");
  highlight(middle);
}, true);

inner.addEventListener("click", () => {
  logEvent("Inner - Capturing");
  highlight(inner);
}, true);

// Bubbling phase
outer.addEventListener("click", () => {
  logEvent("Outer - Bubbling");
  highlight(outer);
});

middle.addEventListener("click", () => {
  logEvent("Middle - Bubbling");
  highlight(middle);
});

inner.addEventListener("click", () => {
  logEvent("Inner - Target/Bubbling");
  highlight(inner);
});

// Clear log
function clearLog() {
  logList.innerHTML = "";
}
