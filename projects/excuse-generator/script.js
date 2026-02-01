const excuses = [
  "Works on my machine",
  "Internet was down (emotionally)",
  "Bug disappeared when I tried to debug",
  "I forgot to save the file",
  "It’s a feature, not a bug",
  "Someone pushed directly to main",
  "Cache issue (probably)",
  "Deadline scared the code",
  "The code was shy today",
  "Stack Overflow was offline (for me)"
];

function generateExcuse() {
  const randomIndex = Math.floor(Math.random() * excuses.length);
  document.getElementById("excuse").innerText = excuses[randomIndex];
}

function copyExcuse() {
  const text = document.getElementById("excuse").innerText;
  if (!text) return;

  navigator.clipboard.writeText(text);
  alert("Excuse copied 😄");
}