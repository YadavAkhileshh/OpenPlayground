const keyDisplay = document.getElementById("keyDisplay");

const keyValue = document.getElementById("keyValue");
const codeValue = document.getElementById("codeValue");
const keyCodeValue = document.getElementById("keyCodeValue");

const ctrlValue = document.getElementById("ctrlValue");
const altValue = document.getElementById("altValue");
const shiftValue = document.getElementById("shiftValue");
const metaValue = document.getElementById("metaValue");

window.addEventListener("keydown", event => {
  event.preventDefault();

  keyDisplay.textContent = event.key === " " ? "Space" : event.key;

  keyValue.textContent = event.key;
  codeValue.textContent = event.code;
  keyCodeValue.textContent = event.keyCode;

  ctrlValue.textContent = event.ctrlKey ? "Yes" : "No";
  altValue.textContent = event.altKey ? "Yes" : "No";
  shiftValue.textContent = event.shiftKey ? "Yes" : "No";
  metaValue.textContent = event.metaKey ? "Yes" : "No";
});