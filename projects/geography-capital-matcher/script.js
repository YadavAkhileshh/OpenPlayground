const gameData = {
    europe: {
        countries: [
            { country: "France", capital: "Paris", fact: "Paris is known as the City of Light and has the Eiffel Tower." },
            { country: "Germany", capital: "Berlin", fact: "Berlin is home to the Brandenburg Gate and has a rich history." },
            { country: "Italy", capital: "Rome", fact: "Rome is the capital of Italy and was the center of the Roman Empire." },
            { country: "Spain", capital: "Madrid", fact: "Madrid is known for its art museums and vibrant culture." },
            { country: "United Kingdom", capital: "London", fact: "London has the Thames River and iconic landmarks like Big Ben." },
            { country: "Netherlands", capital: "Amsterdam", fact: "Amsterdam is famous for its canals and bicycle culture." },
            { country: "Sweden", capital: "Stockholm", fact: "Stockholm is built on 14 islands and has beautiful archipelagos." },
            { country: "Poland", capital: "Warsaw", fact: "Warsaw has a rich history and is known for its Old Town." }
        ]
    },
    asia: {
        countries: [
            { country: "Japan", capital: "Tokyo", fact: "Tokyo is the largest metropolitan area in the world." },
            { country: "China", capital: "Beijing", fact: "Beijing is home to the Forbidden City and Great Wall." },
            { country: "India", capital: "New Delhi", fact: "New Delhi is the capital of India and has the Red Fort." },
            { country: "South Korea", capital: "Seoul", fact: "Seoul is a modern city with ancient palaces." },
            { country: "Thailand", capital: "Bangkok", fact: "Bangkok is known for its temples and street food." },
            { country: "Vietnam", capital: "Hanoi", fact: "Hanoi has French colonial architecture and Ho Chi Minh Mausoleum." },
            { country: "Indonesia", capital: "Jakarta", fact: "Jakarta is the largest city in Southeast Asia." },
            { country: "Philippines", capital: "Manila", fact: "Manila has a mix of modern and historical sites." }
        ]
    },
    americas: {
        countries: [
            { country: "United States", capital: "Washington D.C.", fact: "Washington D.C. has the White House and Capitol Building." },
            { country: "Canada", capital: "Ottawa", fact: "Ottawa is located on the Ottawa River and has Parliament Hill." },
            { country: "Brazil", capital: "Brasília", fact: "Brasília was built in the 1960s and has modernist architecture." },
            { country: "Mexico", capital: "Mexico City", fact: "Mexico City is one of the largest cities in the world." },
            { country: "Argentina", capital: "Buenos Aires", fact: "Buenos Aires is known for tango and European-style architecture." },
            { country: "Chile", capital: "Santiago", fact: "Santiago is surrounded by the Andes Mountains." },
            { country: "Colombia", capital: "Bogotá", fact: "Bogotá is the highest capital city in the world." },
            { country: "Peru", capital: "Lima", fact: "Lima has colonial architecture and is near Machu Picchu." }
        ]
    },
    africa: {
        countries: [
            { country: "Egypt", capital: "Cairo", fact: "Cairo is home to the pyramids and Sphinx." },
            { country: "South Africa", capital: "Cape Town", fact: "Cape Town is known for Table Mountain and beautiful coastlines." },
            { country: "Nigeria", capital: "Abuja", fact: "Abuja became the capital in 1991 and has modern architecture." },
            { country: "Kenya", capital: "Nairobi", fact: "Nairobi is known for its wildlife and national parks." },
            { country: "Morocco", capital: "Rabat", fact: "Rabat has the Royal Palace and historic medina." },
            { country: "Ghana", capital: "Accra", fact: "Accra is a coastal city with vibrant markets." },
            { country: "Ethiopia", capital: "Addis Ababa", fact: "Addis Ababa is the diplomatic capital of Africa." },
            { country: "Tanzania", capital: "Dodoma", fact: "Dodoma became the capital in 1996 and is centrally located." }
        ]
    }
};

let currentRegion = 'europe';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let timer = 0;
let timerInterval;
let gameStarted = false;

const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const factDisplay = document.getElementById('fact-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const regionBtns = document.querySelectorAll('.region-btn');

function initializeGame() {
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    score = 0;
    timer = 0;
    gameStarted = false;
    updateScore();
    updateTimer();
    clearMessage();
    clearFact();

    const regionData = gameData[currentRegion].countries;
    const selectedCountries = regionData.slice(0, 8); // Use 8 pairs for 16 cards

    selectedCountries.forEach(item => {
        cards.push({ type: 'country', value: item.country, data: item });
        cards.push({ type: 'capital', value: item.capital, data: item });
    });

    shuffleArray(cards);
    renderBoard();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderBoard() {
    gameBoard.innerHTML = '';
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">${card.value}</div>
            </div>
        `;
        cardElement.addEventListener('click', () => flipCard(index));
        gameBoard.appendChild(cardElement);
    });
}

function flipCard(index) {
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    const cardElement = gameBoard.children[index];
    if (cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) {
        return;
    }

    cardElement.classList.add('flipped');
    flippedCards.push({ index, ...cards[index] });

    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 1000);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.data.country === card2.data.country && card1.type !== card2.type) {
        // Match found
        matchedPairs++;
        score += 10;
        updateScore();

        gameBoard.children[card1.index].classList.add('matched');
        gameBoard.children[card2.index].classList.add('matched');

        showFact(card1.data.fact);
        showMessage('Great match!', 'success');

        if (matchedPairs === 8) {
            endGame();
        }
    } else {
        // No match
        gameBoard.children[card1.index].classList.remove('flipped');
        gameBoard.children[card2.index].classList.remove('flipped');

        showMessage('Try again!', 'error');
    }

    flippedCards = [];
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateScore() {
    scoreElement.textContent = score;
}

function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    setTimeout(clearMessage, 2000);
}

function clearMessage() {
    messageElement.textContent = '';
    messageElement.className = 'message';
}

function showFact(fact) {
    factDisplay.textContent = `Fun fact: ${fact}`;
}

function clearFact() {
    factDisplay.textContent = '';
}

function endGame() {
    clearInterval(timerInterval);
    showMessage(`Congratulations! You completed the game in ${timerElement.textContent} with a score of ${score}!`, 'success');
}

function changeRegion(region) {
    currentRegion = region;
    regionBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-region="${region}"]`).classList.add('active');
    resetGame();
}

startBtn.addEventListener('click', () => {
    if (!gameStarted) {
        initializeGame();
        startBtn.textContent = 'Restart Game';
    } else {
        resetGame();
    }
});

resetBtn.addEventListener('click', resetGame);

function resetGame() {
    clearInterval(timerInterval);
    initializeGame();
    startBtn.textContent = 'Start Game';
}

regionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        changeRegion(btn.dataset.region);
    });
});

// Initialize the game
initializeGame();
