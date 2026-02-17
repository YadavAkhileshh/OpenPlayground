const SIZE = 7;
const maze = document.getElementById("maze");
const statusText = document.getElementById("status");

let mazeData = [];
let playerPos = { x: 0, y: 0 };
const goalPos = { x: SIZE - 1, y: SIZE - 1 };

function generateMaze() {
    mazeData = Array.from({ length: SIZE }, () =>
        Array(SIZE).fill(1)
    );

    function carve(x, y) {
        const directions = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0]
        ].sort(() => Math.random() - 0.5);

        mazeData[y][x] = 0;

        for (let [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (
                nx >= 0 && nx < SIZE &&
                ny >= 0 && ny < SIZE &&
                mazeData[ny][nx] === 1
            ) {
                mazeData[y + dy][x + dx] = 0;
                carve(nx, ny);
            }
        }
    }

    carve(0, 0);

    mazeData[0][0] = 0;
    mazeData[goalPos.y][goalPos.x] = 0;

    playerPos = { x: 0, y: 0 };
    renderMaze();

    statusText.innerText = "🎮 New maze generated! Say UP, DOWN, LEFT, RIGHT";
}

function renderMaze() {
    maze.innerHTML = "";

    mazeData.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement("div");
            div.classList.add("cell");

            if (cell === 1) div.classList.add("wall");
            if (x === playerPos.x && y === playerPos.y) div.classList.add("player");
            if (x === goalPos.x && y === goalPos.y) div.classList.add("goal");

            maze.appendChild(div);
        });
    });
}

function move(dx, dy) {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (
        newX >= 0 && newX < SIZE &&
        newY >= 0 && newY < SIZE &&
        mazeData[newY][newX] === 0
    ) {
        playerPos = { x: newX, y: newY };
        renderMaze();
        checkWin();
    }
}

function checkWin() {
    if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
        statusText.innerText = "🎉 You escaped the maze! New maze loading...";
        recognition.stop();

        setTimeout(() => {
            generateMaze();
            recognition.start();
        }, 1500);
    }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.lang = "en-US";

recognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
    statusText.innerText = "🎧 Heard: " + command;

    if (command.includes("up")) move(0, -1);
    if (command.includes("down")) move(0, 1);
    if (command.includes("left")) move(-1, 0);
    if (command.includes("right")) move(1, 0);
};

recognition.onerror = () => {
    statusText.innerText = "⚠️ Voice recognition error";
};

function startListening() {
    recognition.start();
    statusText.innerText = "🎧 Listening for commands...";
}

generateMaze();
