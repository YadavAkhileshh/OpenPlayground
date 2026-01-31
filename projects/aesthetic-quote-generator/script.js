const quotes = [
  "Soft things are still strong.",
  "You are becoming what you need.",
  "Slow down. You’re doing fine.",
  "Peace begins with you.",
  "Let yourself bloom."
];

const quoteEl = document.getElementById("quote");
const btn = document.getElementById("newQuote");

function showQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.style.opacity = 0;

  setTimeout(() => {
    quoteEl.textContent = random;
    quoteEl.style.opacity = 1;
  }, 300);
}

btn.addEventListener("click", showQuote);