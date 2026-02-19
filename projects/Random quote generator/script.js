const quoteElement = document.getElementById("quote");
const authorElement = document.getElementById("author");
const newQuoteBtn = document.getElementById("newQuoteBtn");

let quotes = [];

// Load quotes from project.json
fetch("project.json")
  .then((response) => response.json())
  .then((data) => {
    quotes = data.quotes;
    displayRandomQuote(); // Display one immediately on load
  })
  .catch((error) => {
    console.error("Error loading quotes:", error);
    quoteElement.textContent = "Failed to load quotes.";
  });

function displayRandomQuote() {
  if (quotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteElement.textContent = `"${randomQuote.text}"`;
    authorElement.textContent = randomQuote.author;
  }
}

// Event listener for the button
newQuoteBtn.addEventListener("click", displayRandomQuote);
