let buttonColors = ["red", "blue", "green", "yellow"];
let gamePattern = [];
let userClickedPattern = [];
let started = false;
let level = 0;

// Detect first keypress to start
document.addEventListener("keydown", () => {
    if (!started) {
        nextSequence();
        started = true;
    }
});

// Handle button clicks
document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", function() {
        let userChosenColor = this.getAttribute("id");
        userClickedPattern.push(userChosenColor);
        
        animatePress(userChosenColor);
        checkAnswer(userClickedPattern.length - 1);
    });
});

function nextSequence() {
    userClickedPattern = [];
    level++;
    document.getElementById("level-title").innerText = "Level " + level;

    let randomNumber = Math.floor(Math.random() * 4);
    let randomChosenColor = buttonColors[randomNumber];
    gamePattern.push(randomChosenColor);

    // Flash the button
    setTimeout(() => {
        animatePress(randomChosenColor);
    }, 500);
}

function checkAnswer(currentLevel) {
    if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
        if (userClickedPattern.length === gamePattern.length) {
            setTimeout(() => { nextSequence(); }, 1000);
        }
    } else {
        document.getElementById("level-title").innerText = "Game Over, Press Any Key to Restart";
        document.body.classList.add("game-over");
        setTimeout(() => { document.body.classList.remove("game-over"); }, 200);
        startOver();
    }
}

function animatePress(currentColor) {
    document.getElementById(currentColor).classList.add("pressed");
    setTimeout(() => {
        document.getElementById(currentColor).classList.remove("pressed");
    }, 100);
}

function startOver() {
    level = 0;
    gamePattern = [];
    started = false;
}