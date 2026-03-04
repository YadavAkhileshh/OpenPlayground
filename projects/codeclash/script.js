/* QUESTIONS */
const QUESTIONS = [
    {
        q: "Time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
        a: 1
    },
    {
        q: "Which DS uses FIFO?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        a: 1
    },
    {
        q: "JS keyword for constant?",
        options: ["var", "let", "const", "static"],
        a: 2
    }
];

/* STATE */
let room = null;
let playerIndex = null;

/* ELEMENTS */
const lobby = document.getElementById("lobby");
const arena = document.getElementById("arena");
const logList = document.getElementById("logList");
const questionText = document.getElementById("questionText");
const optionBtns = document.querySelectorAll(".option");

/* CREATE ROOM */
document.getElementById("createRoom").onclick = () => {
    const name = playerName.value.trim();
    if (!name) return alert("Enter name");

    const code = Math.random().toString(36).substring(2, 7).toUpperCase();

    room = {
        code,
        players: [{ name, score: 0 }],
        turn: 0,
        qIndex: 0
    };

    localStorage.setItem(code, JSON.stringify(room));
    join(code, 0);
};

/* JOIN ROOM */
document.getElementById("joinRoom").onclick = () => {
    const name = playerName.value.trim();
    const code = roomCode.value.trim();

    const data = JSON.parse(localStorage.getItem(code));
    if (!data || data.players.length >= 2) {
        return alert("Room unavailable");
    }

    data.players.push({ name, score: 0 });
    localStorage.setItem(code, JSON.stringify(data));
    join(code, 1);
};

function join(code, index) {
    playerIndex = index;
    lobby.classList.add("hidden");
    arena.classList.remove("hidden");
    document.getElementById("roomDisplay").textContent = `Room: ${code}`;
    sync();
    setInterval(sync, 1000); // LIVE SYNC
}

/* SYNC */
function sync() {
    room = JSON.parse(localStorage.getItem(room.code));
    if (!room) return;

    updateUI();
    renderQuestion();
}

/* UI */
function updateUI() {
    document.getElementById("p1Name").textContent = room.players[0]?.name || "-";
    document.getElementById("p2Name").textContent = room.players[1]?.name || "-";
    document.getElementById("p1Score").textContent = room.players[0]?.score || 0;
    document.getElementById("p2Score").textContent = room.players[1]?.score || 0;

    document.getElementById("turnDisplay").textContent =
        room.turn === playerIndex ? "Your Turn" : "Opponent's Turn";
}

/* QUESTION */
function renderQuestion() {
    const q = QUESTIONS[room.qIndex];
    if (!q) {
        questionText.textContent = "Game Over";
        return;
    }

    questionText.textContent = q.q;

    optionBtns.forEach((btn, i) => {
        btn.textContent = q.options[i];
        btn.onclick = () => answer(i);
    });
}

/* ANSWER */
function answer(choice) {
    if (room.turn !== playerIndex) return;

    const q = QUESTIONS[room.qIndex];
    if (choice === q.a) {
        room.players[playerIndex].score += 10;
        log("✅ Correct answer");
    } else {
        log("❌ Wrong answer");
    }

    room.turn = (room.turn + 1) % 2;
    room.qIndex++;

    localStorage.setItem(room.code, JSON.stringify(room));
}

/* LOG */
function log(msg) {
    const li = document.createElement("li");
    li.textContent = msg;
    logList.prepend(li);
}