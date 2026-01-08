const grid = document.getElementById('grid');
const message = document.getElementById('message');
const restart = document.getElementById('restart');

let currentNumber = 1;

// Generate numbers 1-100 and shuffle
function generateNumbers() {
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
  return numbers.sort(() => Math.random() - 0.5);
}

// Create the grid
function createGrid() {
  grid.innerHTML = '';
  const numbers = generateNumbers();
  numbers.forEach(num => {
    const cell = document.createElement('div');
    cell.textContent = num;
    cell.addEventListener('click', () => handleClick(cell, num));
    grid.appendChild(cell);
  });
  currentNumber = 1;
  message.textContent = '';
}

// Handle clicks
function handleClick(cell, num) {
  if (num === currentNumber) {
    cell.classList.add('correct');
    currentNumber++;
    if (currentNumber > 100) {
      message.textContent = '🎉 You found all numbers! 🎉';
    }
  } else {
    // Optional: indicate wrong click
    cell.style.backgroundColor = '#f44336';
    setTimeout(() => cell.style.backgroundColor = '', 300);
  }
}

restart.addEventListener('click', createGrid);

// Initialize game
createGrid();