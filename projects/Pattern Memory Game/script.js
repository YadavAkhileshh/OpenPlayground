const tiles = document.querySelectorAll(".tile");
const startBtn = document.getElementById("start");
const info = document.getElementById("info");

let pattern = [];
let userStep = 0;
let level = 0;
let acceptingInput = false;

startBtn.addEventListener("click", startGame);

function startGame() {
    pattern = [];
    level = 0;
    info.textContent = "Watch carefully...";
    nextLevel();
}

function nextLevel() {
    acceptingInput = false;
    userStep = 0;
    level++;

    info.textContent = `Level ${level}`;

    // 🔥 Generate a NEW pattern every level
    pattern = [];

    for (let i = 0; i < level; i++) {
        pattern.push(Math.floor(Math.random() * 9));
    }

    playPattern();
}


function playPattern() {
    let i = 0;
    const interval = setInterval(() => {
        flash(pattern[i]);
        i++;
        if (i >= pattern.length) {
            clearInterval(interval);
            acceptingInput = true;
        }
    }, 600);
}

function flash(index) {
    tiles[index].classList.add("active");
    setTimeout(() => {
        tiles[index].classList.remove("active");
    }, 300);
}

tiles.forEach((tile, index) => {
    tile.addEventListener("click", () => {
        if (!acceptingInput) return;

        flash(index);

        if (index !== pattern[userStep]) {
            info.textContent = "❌ Game Over! Press Start";
            acceptingInput = false;
            return;
        }

        userStep++;

        if (userStep === pattern.length) {
            setTimeout(nextLevel, 700);
        }
    });
});
