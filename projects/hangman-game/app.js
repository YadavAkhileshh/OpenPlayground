const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const hangmanImage = document.querySelector(".hangman-box img");
const gameModal = document.querySelector(".game-modal");
const difficultyModal = document.querySelector(".difficulty-modal");
const playAgainBtn = gameModal.querySelector("button");

// Initializing game variables
let currentWord, correctLetters, wrongGuessCount;
let maxGuesses = 6;
let currentDifficulty = "medium";
let currentWordDefinition;

const difficultySettings = {
    easy: {
        maxGuesses: 6,
        wordLengthRange: [3, 5]
    },
    medium: {
        maxGuesses: 6,
        wordLengthRange: [6, 8]
    },
    hard: {
        maxGuesses: 6,
        wordLengthRange: [9, 15]
    }
};

const resetGame = () => {
    // Ressetting game variables and UI elements
    correctLetters = [];
    wrongGuessCount = 0;
    hangmanImage.src = "images/hangman-0.svg";
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
    wordDisplay.innerHTML = currentWord.split("").map(() => `<li class="letter"></li>`).join("");
    keyboardDiv.querySelectorAll("button").forEach(btn => btn.disabled = false);
    gameModal.classList.remove("show");
}

const getRandomWord = () => {
    // Filter words based on difficulty
    const { wordLengthRange } = difficultySettings[currentDifficulty];
    const filteredWords = wordList.filter(item => 
        item.word.length >= wordLengthRange[0] && 
        item.word.length <= wordLengthRange[1]
    );
    
    // Selecting a random word and hint from the filtered wordList
    const randomWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    currentWord = randomWord.word; // Making currentWord as random word
    document.querySelector(".hint-text b").innerText = randomWord.hint;
    // Store the definition for later use
    currentWordDefinition = randomWord.definition;
    resetGame();
}

const gameOver = (isVictory) => {
    // After game complete.. showing modal with relevant details
    const modalText = isVictory ? `You found the word:` : 'The correct word was:';
    gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
    gameModal.querySelector("h4").innerText = isVictory ? 'Congrats!' : 'Game Over!';
    gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;
    gameModal.querySelector(".word-definition b").innerText = currentWordDefinition;
    gameModal.classList.add("show");
}

const initGame = (button, clickedLetter) => {
    // Checking if clickedLetter is exist on the currentWord
    if(currentWord.includes(clickedLetter)) {
        // Showing all correct letters on the word display
        [...currentWord].forEach((letter, index) => {
            if(letter === clickedLetter) {
                correctLetters.push(letter);
                wordDisplay.querySelectorAll("li")[index].innerText = letter;
                wordDisplay.querySelectorAll("li")[index].classList.add("guessed");
            }
        });
    } else {
        // If clicked letter doesn't exist then update the wrongGuessCount and hangman image
        wrongGuessCount++;
        hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
    }
    button.disabled = true; // Disabling the clicked button so user can't click again
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;

    // Calling gameOver function if any of these condition meets
    if(wrongGuessCount === maxGuesses) return gameOver(false);
    if(correctLetters.length === currentWord.length) return gameOver(true);
}

// Creating keyboard buttons and adding event listeners
for (let i = 97; i <= 122; i++) {
    const button = document.createElement("button");
    button.innerText = String.fromCharCode(i);
    keyboardDiv.appendChild(button);
    button.addEventListener("click", (e) => initGame(e.target, String.fromCharCode(i)));
}

// Setting up difficulty buttons
document.querySelectorAll(".difficulty-buttons button").forEach(button => {
    button.addEventListener("click", () => {
        currentDifficulty = button.className;
        maxGuesses = difficultySettings[currentDifficulty].maxGuesses;
        difficultyModal.style.display = "none";
        document.querySelector(".container").style.display = "flex";
        getRandomWord();
    });
});

// Hide game container initially
document.querySelector(".container").style.display = "none";

// Show difficulty modal on load
window.addEventListener("load", () => {
    document.querySelector(".container").style.display = "none";
    difficultyModal.style.display = "flex";
});

playAgainBtn.addEventListener("click", () => {
    getRandomWord();
});