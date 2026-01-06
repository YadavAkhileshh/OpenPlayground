const currencies = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.79, symbol: '£' },
  INR: { rate: 83.1, symbol: '₹' },
  JPY: { rate: 144.7, symbol: '¥' },
  AUD: { rate: 1.52, symbol: 'A$' },
  CAD: { rate: 1.36, symbol: 'C$' },
  CHF: { rate: 0.88, symbol: 'Fr' },
  CNY: { rate: 7.23, symbol: '¥' },
  SGD: { rate: 1.35, symbol: 'S$' }
};

const fromSelect = document.getElementById("fromCurrency");
const toSelect = document.getElementById("toCurrency");
const amountInput = document.getElementById("amount");
const resultDiv = document.getElementById("result");
const convertBtn = document.getElementById("convertBtn");
const currencySymbols = document.getElementById("currencySymbols");

// Populate dropdowns
Object.keys(currencies).forEach(currency => {
  const option1 = new Option(`${currency} (${currencies[currency].symbol})`, currency);
  const option2 = new Option(`${currency} (${currencies[currency].symbol})`, currency);
  fromSelect.add(option1);
  toSelect.add(option2);
});

fromSelect.value = "USD";
toSelect.value = "INR";

// Create animated currency symbols in the background
function createCurrencySymbol() {
  const symbol = document.createElement('div');
  symbol.classList.add('currency-symbol');
  
  // Get a random currency
  const currencyKeys = Object.keys(currencies);
  const randomCurrency = currencyKeys[Math.floor(Math.random() * currencyKeys.length)];
  symbol.textContent = currencies[randomCurrency].symbol;
  
  // Random position
  symbol.style.left = `${Math.random() * 100}%`;
  
  // Random animation duration
  const duration = 15 + Math.random() * 10;
  symbol.style.animationDuration = `${duration}s`;
  
  // Random delay
  symbol.style.animationDelay = `${Math.random() * 5}s`;
  
  // Random size
  const size = 1.5 + Math.random() * 1.5;
  symbol.style.fontSize = `${size}rem`;
  
  // Add to container
  currencySymbols.appendChild(symbol);
  
  // Remove after animation completes
  setTimeout(() => {
    symbol.remove();
  }, (duration + 5) * 1000);
}

// Create initial symbols
for (let i = 0; i < 20; i++) {
  setTimeout(() => {
    createCurrencySymbol();
  }, i * 500);
}

// Continue creating symbols
setInterval(createCurrencySymbol, 2000);

// Random background color change
const backgroundColors = [
  '#0f172a', // Default
  '#1e1b4b', // Indigo
  '#18181b', // Zinc
  '#0c0a09', // Stone
  '#020617', // Slate
  '#111827', // Gray
  '#1e293b', // Slate
  '#0f172a', // Slate
  '#1e3a8a', // Blue
  '#14532d', // Green
  '#7c2d12', // Orange
  '#7f1d1d'  // Red
];

let currentColorIndex = 0;

function changeBackgroundColor() {
  currentColorIndex = (currentColorIndex + 1) % backgroundColors.length;
  document.body.style.backgroundColor = backgroundColors[currentColorIndex];
}

// Change background color every 5 seconds
setInterval(changeBackgroundColor, 5000);

// Function to convert currency with animation
function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount)) {
    resultDiv.textContent = "Please enter a valid amount";
    resultDiv.classList.add("updating");
    setTimeout(() => {
      resultDiv.classList.remove("updating");
    }, 500);
    return;
  }

  // Show loading animation
  resultDiv.innerHTML = '<div class="loading"></div>';
  
  // Simulate API call delay for better UX
  setTimeout(() => {
    const fromRate = currencies[fromSelect.value].rate;
    const toRate = currencies[toSelect.value].rate;
    
    const converted = (amount / fromRate) * toRate;
    
    // Add animation class
    resultDiv.classList.add("updating");
    
    // Update result text with currency symbols
    resultDiv.textContent = `${currencies[fromSelect.value].symbol}${amount} ${fromSelect.value} = ${currencies[toSelect.value].symbol}${converted.toFixed(2)} ${toSelect.value}`;
    
    // Remove animation class after animation completes
    setTimeout(() => {
      resultDiv.classList.remove("updating");
    }, 500);
  }, 500);
}

convertBtn.addEventListener("click", convertCurrency);

// Also convert on Enter key press
amountInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    convertCurrency();
  }
});

// Add hover effect to the converter card
const converter = document.querySelector('.converter');
converter.addEventListener('mousemove', (e) => {
  const rect = converter.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = (y - centerY) / 20;
  const rotateY = (centerX - x) / 20;
  
  converter.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

converter.addEventListener('mouseleave', () => {
  converter.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
});