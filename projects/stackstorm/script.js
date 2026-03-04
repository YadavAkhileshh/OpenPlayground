let structure = [];
let mode = "stack";
let score = 0;

const structureDiv = document.getElementById("structure");
const modeText = document.getElementById("modeText");
const scoreEl = document.getElementById("score");
const titleEl = document.getElementById("structureTitle");
const challengeText = document.getElementById("challengeText");
const logList = document.getElementById("logList");

document.getElementById("stackMode").onclick = () => switchMode("stack");
document.getElementById("queueMode").onclick = () => switchMode("queue");
document.getElementById("pushBtn").onclick = pushValue;
document.getElementById("popBtn").onclick = popValue;
document.getElementById("submitAnswer").onclick = checkAnswer;

let expectedAnswer = "";

function switchMode(newMode) {
    mode = newMode;
    structure = [];
    render();
    modeText.textContent = mode.toUpperCase();
    titleEl.textContent = `${mode === "stack" ? "Stack" : "Queue"} Visualization`;
    log(`Switched to ${mode}`);
}

function pushValue() {
    const value = document.getElementById("valueInput").value;
    if (!value) return;

    structure.push(value);
    log(`Pushed ${value}`);
    render();
    generateChallenge();
}

function popValue() {
    if (structure.length === 0) return;

    const removed = mode === "stack"
        ? structure.pop()
        : structure.shift();

    log(`Removed ${removed}`);
    render();
    generateChallenge();
}

function render() {
    structureDiv.innerHTML = "";
    structure.forEach(v => {
        const div = document.createElement("div");
        div.className = "element";
        div.textContent = v;
        structureDiv.appendChild(div);
    });
}

function generateChallenge() {
    if (structure.length === 0) {
        challengeText.textContent = "Structure is empty.";
        return;
    }

    if (mode === "stack") {
        expectedAnswer = structure[structure.length - 1];
        challengeText.textContent = "What will be popped next?";
    } else {
        expectedAnswer = structure[0];
        challengeText.textContent = "What will be dequeued next?";
    }
}

function checkAnswer() {
    const input = document.getElementById("answerInput").value;
    if (!input) return;

    if (input === expectedAnswer) {
        score += 10;
        log("✅ Correct prediction!");
    } else {
        log("❌ Wrong prediction");
    }

    scoreEl.textContent = score;
    document.getElementById("answerInput").value = "";
}

function log(msg) {
    const li = document.createElement("li");
    li.textContent = msg;
    logList.prepend(li);
}

render();