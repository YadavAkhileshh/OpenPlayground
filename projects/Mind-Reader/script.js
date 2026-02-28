// --- Initial Base Database (The Decision Tree) ---
let database = {
    question: "Is the character real?",
    yes: {
        question: "Is the character a tech billionaire?",
        yes: { answer: "Elon Musk" },
        no: { answer: "Albert Einstein" }
    },
    no: {
        question: "Does the character have superpowers?",
        yes: { answer: "Spider-Man" },
        no: { answer: "Batman" }
    }
};

// --- Game State ---
let currentNode = null;
let parentNode = null;
let lastDirection = null; // 'yes' or 'no'
let currentGuess = "";

// --- DOM Elements ---
const gameUI = document.getElementById('gameUI');
const learnUI = document.getElementById('learnUI');
const restartUI = document.getElementById('restartUI');

const promptText = document.getElementById('promptText');
const playButtons = document.getElementById('playButtons');
const answerButtons = document.getElementById('answerButtons');

const newCharInput = document.getElementById('newCharacter');
const newQInput = document.getElementById('newQuestion');
const newAnsSelect = document.getElementById('newAnswer');
const wrongGuessNameSpan = document.getElementById('wrongGuessName');
const resultText = document.getElementById('resultText');

// --- Core Logic ---

document.getElementById('btnStart').addEventListener('click', startGame);

function startGame() {
    currentNode = database;
    parentNode = null;
    lastDirection = null;
    
    playButtons.classList.add('hidden');
    answerButtons.classList.remove('hidden');
    restartUI.classList.add('hidden');
    learnUI.classList.add('hidden');
    gameUI.classList.remove('hidden');
    
    nextTurn();
}

function nextTurn() {
    if (currentNode.question) {
        // It's a question node
        promptText.innerText = currentNode.question;
    } else if (currentNode.answer) {
        // It's an answer (leaf) node
        currentGuess = currentNode.answer;
        promptText.innerText = `Are you thinking of... ${currentGuess}?`;
    }
}

function handleAnswer(isYes) {
    if (currentNode.question) {
        // Traversing the tree
        parentNode = currentNode;
        lastDirection = isYes ? 'yes' : 'no';
        currentNode = currentNode[lastDirection];
        nextTurn();
    } else if (currentNode.answer) {
        // Handling the final guess
        if (isYes) {
            winGame();
        } else {
            triggerLearnMode();
        }
    }
}

document.getElementById('btnYes').addEventListener('click', () => handleAnswer(true));
document.getElementById('btnNo').addEventListener('click', () => handleAnswer(false));

// --- State Transitions ---

function winGame() {
    gameUI.classList.add('hidden');
    restartUI.classList.remove('hidden');
    resultText.innerText = `I knew it! ${currentGuess} was too easy.`;
}

function triggerLearnMode() {
    gameUI.classList.add('hidden');
    learnUI.classList.remove('hidden');
    wrongGuessNameSpan.innerText = currentGuess;
    
    // Clear old inputs
    newCharInput.value = "";
    newQInput.value = "";
    newAnsSelect.value = "yes";
}

document.getElementById('btnTrain').addEventListener('click', () => {
    const newChar = newCharInput.value.trim();
    const newQ = newQInput.value.trim();
    const newAnsForNewChar = newAnsSelect.value; // 'yes' or 'no'
    
    if (!newChar || !newQ) {
        alert("Please fill out both the character name and the question.");
        return;
    }

    // Ensure question has a question mark
    const finalQ = newQ.endsWith('?') ? newQ : newQ + '?';

    // Learn: Mutate the tree
    const oldAnswerNode = { answer: currentGuess };
    const newAnswerNode = { answer: newChar };

    const newNode = {
        question: finalQ,
        yes: newAnsForNewChar === 'yes' ? newAnswerNode : oldAnswerNode,
        no: newAnsForNewChar === 'no' ? newAnswerNode : oldAnswerNode
    };

    // Replace the old leaf node with the new question node
    if (parentNode === null) {
        // Edge case: tree only had 1 item total
        database = newNode;
    } else {
        parentNode[lastDirection] = newNode;
    }

    learnUI.classList.add('hidden');
    restartUI.classList.remove('hidden');
    resultText.innerText = "Database updated. I am getting smarter.";
});

document.getElementById('btnRestart').addEventListener('click', startGame);