const game = document.getElementById("game");
const restartBtn = document.getElementById("restart");
const winBox = document.getElementById("winBox");
const winOverlay = document.getElementById("winOverlay");
const moveCountElement = document.getElementById("moveCount");
const timerElement = document.getElementById("timer");
const winMovesElement = document.getElementById("winMoves");
const hintBtn = document.getElementById("hint");
const undoBtn = document.getElementById("undo");

// Game state
let tubes = [];
let selectedTube = null;
let moves = 0;
let startTime = null;
let timerInterval = null;
let gameHistory = [];
let hintsUsed = 0;
const maxBalls = 4;
const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan", "lavender", "mint", "coral", "peach"];

// Initialize game
function initGame() {
  // Create a solvable puzzle
  tubes = [
    ["red", "blue", "green", "yellow"],
    ["yellow", "green", "blue", "red"],
    [],
    []
  ];
  
  // For more levels, uncomment below and add more tubes/colors:
  // tubes = [
  //   ["red", "blue", "green", "yellow"],
  //   ["purple", "orange", "pink", "cyan"],
  //   ["yellow", "green", "blue", "red"],
  //   ["cyan", "pink", "orange", "purple"],
  //   [],
  //   []
  // ];
  
  selectedTube = null;
  moves = 0;
  hintsUsed = 0;
  gameHistory = [];
  startTime = Date.now();
  
  // Update UI
  moveCountElement.textContent = moves;
  timerElement.textContent = "00:00";
  
  // Clear previous timer
  if (timerInterval) clearInterval(timerInterval);
  
  // Start timer
  timerInterval = setInterval(updateTimer, 1000);
  
  // Save initial state to history
  saveState();
  
  render();
}

// Save current game state for undo
function saveState() {
  gameHistory.push({
    tubes: JSON.parse(JSON.stringify(tubes)),
    moves: moves,
    selectedTube: selectedTube
  });
  
  // Keep only last 20 moves in history
  if (gameHistory.length > 20) {
    gameHistory.shift();
  }
}

// Undo last move
function undoMove() {
  if (gameHistory.length > 1) {
    gameHistory.pop(); // Remove current state
    const prevState = gameHistory[gameHistory.length - 1];
    tubes = JSON.parse(JSON.stringify(prevState.tubes));
    moves = prevState.moves;
    selectedTube = prevState.selectedTube;
    
    moveCountElement.textContent = moves;
    render();
  }
}

// Get hint
function getHint() {
  // Find a valid move
  for (let from = 0; from < tubes.length; from++) {
    if (tubes[from].length === 0) continue;
    
    const topBall = tubes[from][tubes[from].length - 1];
    
    for (let to = 0; to < tubes.length; to++) {
      if (from === to) continue;
      
      if (isValidMove(from, to)) {
        // Highlight the suggested move
        hintTube(from);
        hintTube(to);
        
        hintsUsed++;
        return { from, to };
      }
    }
  }
  return null;
}

// Hint tube animation
function hintTube(index) {
  const tubeDivs = document.querySelectorAll('.tube');
  if (tubeDivs[index]) {
    tubeDivs[index].style.boxShadow = "0 10px 25px rgba(255, 215, 0, 0.8)";
    tubeDivs[index].style.borderColor = "#FFD700";
    
    setTimeout(() => {
      if (tubeDivs[index]) {
        tubeDivs[index].style.boxShadow = "";
        tubeDivs[index].style.borderColor = "";
      }
    }, 1500);
  }
}

// Check if move is valid
function isValidMove(from, to) {
  if (from === to) return false;
  if (tubes[to].length >= maxBalls) return false;
  
  const ball = tubes[from][tubes[from].length - 1];
  return tubes[to].length === 0 || tubes[to][tubes[to].length - 1] === ball;
}

// Render game
function render() {
  game.innerHTML = "";

  tubes.forEach((tube, i) => {
    const tubeDiv = document.createElement("div");
    tubeDiv.classList.add("tube");
    
    // Add tube number for accessibility
    tubeDiv.setAttribute("aria-label", `Tube ${i + 1} with ${tube.length} balls`);

    if (selectedTube === i) tubeDiv.classList.add("selected");

    tube.forEach(color => {
      const ball = document.createElement("div");
      ball.classList.add("ball", color);
      ball.setAttribute("aria-label", `${color} ball`);
      tubeDiv.appendChild(ball);
    });

    tubeDiv.addEventListener("click", () => selectTube(i));
    
    // Add tube number indicator
    const tubeNumber = document.createElement("div");
    tubeNumber.className = "tube-number";
    tubeNumber.textContent = i + 1;
    tubeNumber.style.cssText = `
      position: absolute;
      bottom: -25px;
      left: 0;
      right: 0;
      text-align: center;
      color: #666;
      font-weight: bold;
      font-size: 14px;
    `;
    tubeDiv.appendChild(tubeNumber);
    
    game.appendChild(tubeDiv);
  });

  checkWin();
}

// Select tube
function selectTube(index) {
  if (selectedTube === null) {
    if (tubes[index].length === 0) return;
    selectedTube = index;
  } else {
    if (isValidMove(selectedTube, index)) {
      moveBall(selectedTube, index);
      moves++;
      moveCountElement.textContent = moves;
      saveState();
    }
    selectedTube = null;
  }
  render();
}

// Move ball
function moveBall(from, to) {
  const ball = tubes[from][tubes[from].length - 1];
  tubes[from].pop();
  tubes[to].push(ball);
  
  // Add move animation
  const ballElements = document.querySelectorAll('.tube');
  if (ballElements[to]) {
    const lastBall = ballElements[to].lastChild;
    if (lastBall) {
      lastBall.style.animation = 'drop 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      setTimeout(() => {
        if (lastBall) lastBall.style.animation = '';
      }, 400);
    }
  }
}

// Update timer
function updateTimer() {
  if (!startTime) return;
  
  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  
  timerElement.textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Check win condition
function checkWin() {
  let win = tubes.every(tube =>
    tube.length === 0 ||
    (tube.every(color => color === tube[0]) && tube.length === maxBalls)
  );

  if (win) {
    clearInterval(timerInterval);
    
    // Calculate score
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    winMovesElement.textContent = moves;
    
    // Add confetti effect
    createConfetti();
    
    // Show win screen with delay
    setTimeout(() => {
      winBox.classList.add("show");
      winOverlay.classList.add("show");
    }, 500);
  }
}

// Create confetti effect
function createConfetti() {
  const colors = ['#FF9A9E', '#A0C4FF', '#CAFFBF', '#FDFFB6', '#D9BBFF', '#FFD6A5'];
  
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.cssText = `
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      position: fixed;
      top: -20px;
      left: ${Math.random() * 100}vw;
      opacity: 0.8;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      animation: fall ${Math.random() * 3 + 2}s linear forwards;
    `;
    
    // Create keyframes for fall animation
    if (!document.getElementById('confetti-animation')) {
      const style = document.createElement('style');
      style.id = 'confetti-animation';
      style.textContent = `
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(${Math.random() * 720}deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => confetti.remove(), 5000);
  }
}

// Restart game
function restartGame() {
  winBox.classList.remove("show");
  winOverlay.classList.remove("show");
  
  // Remove all confetti
  document.querySelectorAll('.confetti').forEach(c => c.remove());
  
  initGame();
}

// Event Listeners
restartBtn.addEventListener("click", restartGame);

if (hintBtn) {
  hintBtn.addEventListener("click", () => {
    const hint = getHint();
    if (hint) {
      // Optional: Auto-make the hinted move
      // moveBall(hint.from, hint.to);
      // moves++;
      // moveCountElement.textContent = moves;
      // saveState();
      // render();
    }
  });
}

if (undoBtn) {
  undoBtn.addEventListener("click", undoMove);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'r':
    case 'R':
      restartGame();
      break;
    case 'u':
    case 'U':
      undoMove();
      break;
    case 'h':
    case 'H':
      if (hintBtn) hintBtn.click();
      break;
    case 'Escape':
      selectedTube = null;
      render();
      break;
  }
});

// Touch device optimization
if ('ontouchstart' in window) {
  document.body.classList.add('touch-device');
}

// Initialize the game
initGame();