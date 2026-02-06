const messages = [
  "fix bug",
  "final final commit",
  "it works, don’t touch",
  "temporary fix (permanent)",
  "added stuff",
  "idk why this works",
  "pls work",
  "fixed typo",
  "refactor maybe",
  "update"
];

function generateMessage() {
  const randomIndex = Math.floor(Math.random() * messages.length);
  document.getElementById("message").innerText = messages[randomIndex];
}

function copyMessage() {
  const text = document.getElementById("message").innerText;
  if (!text) return;

  navigator.clipboard.writeText(text);
  alert("Commit message copied 😄");
}