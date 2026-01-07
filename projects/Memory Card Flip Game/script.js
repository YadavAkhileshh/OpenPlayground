const gameBoard = document.getElementById("gameBoard");
const resetBtn = document.getElementById("resetBtn");

const symbols = ["🍎", "🍌", "🍇", "🍒", "🍉", "🥝", "🍍", "🥑"];
let cards = [...symbols, ...symbols]; // duplicate symbols

let firstCard = null;
let secondCard = null;
let lockBoard = false;

// Shuffle cards
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Create cards
function createBoard() {
    gameBoard.innerHTML = "";
    shuffle(cards);

    cards.forEach(symbol => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <div class="card-face front"></div>
            <div class="card-face back">${symbol}</div>
        `;

        card.addEventListener("click", () => flipCard(card));
        gameBoard.appendChild(card);
    });
}

// Flip card
function flipCard(card) {
    if (lockBoard || card === firstCard || card.classList.contains("matched")) return;

    card.classList.add("flip");

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    checkMatch();
}

// Check match
function checkMatch() {
    const isMatch =
        firstCard.querySelector(".back").textContent ===
        secondCard.querySelector(".back").textContent;

    isMatch ? disableCards() : unflipCards();
}

// Disable matched cards
function disableCards() {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    resetTurn();
}

// Unflip cards
function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove("flip");
        secondCard.classList.remove("flip");
        resetTurn();
    }, 1000);
}

// Reset selection
function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// Restart game
resetBtn.addEventListener("click", createBoard);

// Start game
createBoard();
