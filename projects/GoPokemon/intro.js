const startBtn = document.getElementById("start-btn");

// Function to go to the game page
function startGame() {
    window.location.href = "game.html"; // redirect to game
}

// Click start button
startBtn.addEventListener("click", startGame);

// Press any key to start
window.addEventListener("keydown", startGame);

// Auto-start after 10 seconds
setTimeout(startGame, 10000);