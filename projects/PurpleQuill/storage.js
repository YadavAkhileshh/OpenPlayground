function savePrompt(prompt) {
  localStorage.setItem("lastPrompt", prompt);
}

function loadPrompt() {
  return localStorage.getItem("lastPrompt") || "";
}
