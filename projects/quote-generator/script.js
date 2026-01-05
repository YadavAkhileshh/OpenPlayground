let selectedCategory = ""; // Variable to store the current selected category
const categoryDropdown = document.getElementById("category-dropdown");
const quoteElement = document.getElementById("quote");
const authorElement = document.getElementById("author");
const newQuoteButton = document.getElementById("new-quote-btn");
const randomButtonTop = document.getElementById("random-btn-top");
const randomButtonBottom = document.getElementById("random-btn-bottom");


const apiURL = "https://quoteslate.vercel.app/api/quotes/random";

// Fetch a random quote
async function getRandomQuote() {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    quoteElement.textContent = `"${data.quote}"`;
    authorElement.textContent = `- ${data.author}`;
  } catch (error) {
    console.error("Error fetching the quote:", error);
    quoteElement.textContent = "Sorry, something went wrong. Please try again later.";
    authorElement.textContent = "";
  }
}

// Fetch a quote from the local JSON by category
async function getCategoryQuote(category) {
  try {
    const response = await fetch("quotes.json");
    const data = await response.json();
    
    // Check if the category exists in the JSON and retrieve a random quote from it
    const quotesArray = data[category];

    if (quotesArray && quotesArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotesArray.length);
      const randomQuote = quotesArray[randomIndex];
      quoteElement.textContent = `"${randomQuote}"`;
      authorElement.textContent = "";
    } else {
      quoteElement.textContent = "No quotes found for this category.";
      authorElement.textContent = "";
    }
  } catch (error) {
    console.error("Local fetch error:", error);
    quoteElement.textContent = "Error loading local quotes.";
    authorElement.textContent = "";
  }
}

// Attach the same function to both random quote buttons
randomButtonTop.addEventListener("click", getRandomQuote);
randomButtonBottom.addEventListener("click", getRandomQuote);

// Event listener for category selection change
categoryDropdown.addEventListener("change", (event) => {
  selectedCategory = event.target.value;
  if (selectedCategory) {
    getCategoryQuote(selectedCategory); // Fetch quote from the selected category
  } else {
    quoteElement.textContent = "Please select a category.";
    authorElement.textContent = "";
  }
});
// Handle New Quote button click
newQuoteButton.addEventListener("click", () => {
  if (selectedCategory) {
    // If category is selected, fetch a new quote from that category
    getCategoryQuote(selectedCategory);
  } else {
    // Display a message to select a category if none is selected
    quoteElement.textContent = "Please select a category to get a quote.";
    authorElement.textContent = "";
  }
});

// Initial random quote on page load
window.onload = getRandomQuote;

function copyQuote() {
  const text = document.getElementById("quote").textContent + " — " + document.getElementById("author").textContent;
  navigator.clipboard.writeText(text)
    .then(() => alert("Quote copied to clipboard!"))
    .catch(() => alert("Failed to copy quote."));
}

function shareOnTwitter() {
  const quoteText = document.getElementById("quote").innerText;
  const authorText = document.getElementById("author").innerText;

  const tweet = `"${quoteText}" — ${authorText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;

  window.open(twitterUrl, "_blank");
}
function downloadQuoteAsImage() {
  const quoteDisplay = document.getElementById("quote-display");

  html2canvas(quoteDisplay).then(canvas => {
    const link = document.createElement("a");
    link.download = "quote.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}