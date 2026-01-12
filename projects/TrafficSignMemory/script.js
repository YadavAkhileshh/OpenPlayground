document.addEventListener('DOMContentLoaded', function () {
    // Game state variables
    let gameState = {
        difficulty: 'easy',
        category: 'all',
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        totalPairs: 8,
        moves: 0,
        score: 0,
        timer: 0,
        timerInterval: null,
        gameStarted: false,
        gameCompleted: false
    };

    // Traffic signs data
    const trafficSigns = {
        warning: [
            { id: 1, name: "Sharp Turn Ahead", icon: "fa-triangle-exclamation", description: "Warning sign indicating a sharp turn in the road ahead." },
            { id: 2, name: "Pedestrian Crossing", icon: "fa-person-walking", description: "Warning sign indicating a pedestrian crossing ahead." },
            { id: 3, name: "Slippery Road", icon: "fa-snowflake", description: "Warning sign indicating potentially slippery road conditions." },
            { id: 4, name: "Falling Rocks", icon: "fa-hill-rockslide", description: "Warning sign indicating potential falling rocks in the area." },
            { id: 5, name: "Crossroads Ahead", icon: "fa-road", description: "Warning sign indicating crossroads ahead." },
            { id: 6, name: "Road Work Ahead", icon: "fa-person-digging", description: "Warning sign indicating road work ahead." },
            { id: 19, name: "Traffic Light Ahead", icon: "fa-traffic-light", description: "Warning sign indicating a traffic signal ahead." },
            { id: 20, name: "Cycling", icon: "fa-bicycle", description: "Warning sign indicating cyclists may be present." },
            { id: 21, name: "Cattle Crossing", icon: "fa-cow", description: "Warning sign indicating cattle crossing." },
            { id: 22, name: "Strong Crosswind", icon: "fa-wind", description: "Warning sign indicating strong side winds." }
        ],
        regulatory: [
            { id: 7, name: "Stop Sign", icon: "fa-hand", description: "Regulatory sign requiring a complete stop." },
            { id: 8, name: "Yield Sign", icon: "fa-play", description: "Regulatory sign requiring drivers to yield." },
            { id: 9, name: "No Entry", icon: "fa-ban", description: "Regulatory sign prohibiting entry." },
            { id: 10, name: "Speed Limit", icon: "fa-gauge-high", description: "Regulatory sign indicating maximum speed limit." },
            { id: 11, name: "No Parking", icon: "fa-square-xmark", description: "Regulatory sign indicating no parking zone." },
            { id: 12, name: "One Way", icon: "fa-arrow-right-long", description: "Regulatory sign indicating one-way traffic." },
            { id: 23, name: "No U-Turn", icon: "fa-arrow-rotate-left", description: "Regulatory sign prohibiting U-turns." },
            { id: 24, name: "Keep Right", icon: "fa-arrow-right", description: "Regulatory sign to keep to the right." },
            { id: 25, name: "No Horn", icon: "fa-bullhorn", description: "Regulatory sign prohibiting use of horn." },
            { id: 26, name: "No Trucks", icon: "fa-truck-ban", description: "Regulatory sign prohibiting trucks." }
        ],
        informational: [
            { id: 13, name: "Hospital Ahead", icon: "fa-hospital", description: "Informational sign indicating hospital ahead." },
            { id: 14, name: "Restaurant Ahead", icon: "fa-utensils", description: "Informational sign indicating restaurant ahead." },
            { id: 15, name: "Gas Station Ahead", icon: "fa-gas-pump", description: "Informational sign indicating gas station ahead." },
            { id: 16, name: "Parking Available", icon: "fa-square-parking", description: "Informational sign indicating parking available." },
            { id: 17, name: "Hotel Ahead", icon: "fa-bed", description: "Informational sign indicating hotel ahead." },
            { id: 18, name: "Rest Area Ahead", icon: "fa-tree", description: "Informational sign indicating rest area ahead." },
            { id: 27, name: "Airport", icon: "fa-plane", description: "Informational sign indicating airport direction." },
            { id: 28, name: "Train Station", icon: "fa-train", description: "Informational sign indicating train station." },
            { id: 29, name: "Bus Stop", icon: "fa-bus", description: "Informational sign indicating bus stop." },
            { id: 30, name: "Wheelchair Accessible", icon: "fa-wheelchair", description: "Informational sign indicating accessible facilities." },
            { id: 31, name: "Charging Station", icon: "fa-charging-station", description: "Informational sign indicating EV charging station." },
            { id: 32, name: "Trash Disposal", icon: "fa-trash-can", description: "Informational sign indicating trash disposal." }
        ]
    };

    // DOM elements
    const gameBoard = document.getElementById('gameBoard');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const scoreElement = document.getElementById('score');
    const accuracyElement = document.getElementById('accuracy');
    const matchesCountElement = document.getElementById('matchesCount');
    const totalPairsElement = document.getElementById('totalPairs');
    const progressFillElement = document.getElementById('progressFill');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const matchInfoElement = document.getElementById('matchInfo');
    const matchedSignNameElement = document.getElementById('matchedSignName');
    const matchedSignDescElement = document.getElementById('matchedSignDesc');
    const matchedSignIconElement = document.getElementById('matchedSignIcon');
    const winModal = document.getElementById('winModal');
    const finalTimeElement = document.getElementById('finalTime');
    const finalMovesElement = document.getElementById('finalMoves');
    const finalScoreElement = document.getElementById('finalScore');
    const finalAccuracyElement = document.getElementById('finalAccuracy');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Initialize game
    initGame();

    // Event listeners
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', playAgain);
    closeModalBtn.addEventListener('click', () => winModal.classList.add('hidden'));

    difficultyButtons.forEach(button => {
        button.addEventListener('click', function () {
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            gameState.difficulty = this.dataset.level;
            resetGame();
        });
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            gameState.category = this.dataset.category;
            resetGame();
        });
    });

    // Initialize game function
    function initGame() {
        updateTotalPairs();
        createCards();
        renderCards();
        updateStats();
    }

    // Update total pairs based on difficulty
    function updateTotalPairs() {
        switch (gameState.difficulty) {
            case 'easy':
                gameState.totalPairs = 8;
                gameBoard.className = 'game-board easy';
                break;
            case 'medium':
                gameState.totalPairs = 18;
                gameBoard.className = 'game-board medium';
                break;
            case 'hard':
                gameState.totalPairs = 32;
                gameBoard.className = 'game-board hard';
                break;
        }
        totalPairsElement.textContent = gameState.totalPairs;
    }

    // Get signs based on selected category
    function getSignsForCategory() {
        let signs = [];

        if (gameState.category === 'all') {
            signs = [
                ...trafficSigns.warning,
                ...trafficSigns.regulatory,
                ...trafficSigns.informational
            ];
        } else {
            signs = [...trafficSigns[gameState.category]];
        }

        // Shuffle signs to get random selection each time
        shuffleArray(signs);

        return signs;
    }

    // Create cards for the game
    function createCards() {
        gameState.cards = [];
        const availableSigns = getSignsForCategory();

        // Adjust total pairs if not enough signs available
        if (availableSigns.length < gameState.totalPairs) {
            gameState.totalPairs = availableSigns.length;
            totalPairsElement.textContent = gameState.totalPairs;
        }

        const signs = availableSigns.slice(0, gameState.totalPairs);

        // Create pairs for each sign
        signs.forEach(sign => {
            gameState.cards.push({
                id: sign.id,
                name: sign.name,
                icon: sign.icon,
                description: sign.description,
                category: gameState.category === 'all' ?
                    (trafficSigns.warning.includes(sign) ? 'warning' :
                        trafficSigns.regulatory.includes(sign) ? 'regulatory' : 'informational') :
                    gameState.category,
                flipped: false,
                matched: false
            });

            // Add the pair
            gameState.cards.push({
                id: sign.id,
                name: sign.name,
                icon: sign.icon,
                description: sign.description,
                category: gameState.category === 'all' ?
                    (trafficSigns.warning.includes(sign) ? 'warning' :
                        trafficSigns.regulatory.includes(sign) ? 'regulatory' : 'informational') :
                    gameState.category,
                flipped: false,
                matched: false
            });
        });

        // Shuffle the cards
        shuffleArray(gameState.cards);
    }

    // Render cards to the game board
    function renderCards() {
        gameBoard.innerHTML = '';

        gameState.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;

            if (card.matched) {
                cardElement.classList.add('matched');
            } else if (card.flipped) {
                cardElement.classList.add('flipped');
            }

            cardElement.innerHTML = `
                <div class="card-front">
                    <i class="fas fa-question"></i>
                </div>
                <div class="card-back">
                    <i class="fas ${card.icon}"></i>
                </div>
            `;

            if (!card.matched) {
                cardElement.addEventListener('click', () => flipCard(index));
            }

            gameBoard.appendChild(cardElement);
        });
    }

    // Flip a card
    function flipCard(index) {
        if (!gameState.gameStarted) {
            startGame();
        }

        const card = gameState.cards[index];

        // Don't allow flipping if card is already flipped, matched, or if two cards are already flipped
        if (card.flipped || card.matched || gameState.flippedCards.length >= 2) {
            return;
        }

        // Flip the card
        card.flipped = true;
        gameState.flippedCards.push(index);

        // Update the display
        renderCards();

        // Check for match if two cards are flipped
        if (gameState.flippedCards.length === 2) {
            gameState.moves++;
            updateStats();

            const card1 = gameState.cards[gameState.flippedCards[0]];
            const card2 = gameState.cards[gameState.flippedCards[1]];

            if (card1.id === card2.id) {
                // Match found
                card1.matched = true;
                card2.matched = true;
                gameState.matchedPairs++;
                gameState.score += 100;

                // Show sign information
                showSignInfo(card1);

                // Check if game is complete
                if (gameState.matchedPairs === gameState.totalPairs) {
                    endGame();
                }

                // Reset flipped cards after delay
                setTimeout(() => {
                    gameState.flippedCards = [];
                    renderCards();
                    updateStats();
                }, 1000);
            } else {
                // No match
                gameState.score = Math.max(0, gameState.score - 10);

                // Flip cards back after delay
                setTimeout(() => {
                    card1.flipped = false;
                    card2.flipped = false;
                    gameState.flippedCards = [];
                    renderCards();
                    updateStats();
                }, 1500);
            }
        }
    }

    // Show information about the matched sign
    function showSignInfo(card) {
        matchInfoElement.classList.remove('hidden');
        matchedSignNameElement.textContent = card.name;
        matchedSignDescElement.textContent = card.description;
        matchedSignIconElement.innerHTML = `<i class="fas ${card.icon}"></i>`;

        // Color code based on category
        let color = '#1a2980';
        if (card.category === 'warning') color = '#ffc107';
        if (card.category === 'regulatory') color = '#dc3545';
        if (card.category === 'informational') color = '#28a745';

        matchedSignIconElement.style.backgroundColor = color;
    }

    // Start the game
    function startGame() {
        if (gameState.gameStarted && !gameState.gameCompleted) return;

        gameState.gameStarted = true;
        gameState.gameCompleted = false;
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Game Started';
        startBtn.style.backgroundColor = '#6c757d';

        // Start timer
        gameState.timer = 0;
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = setInterval(() => {
            gameState.timer++;
            updateTimerDisplay();
        }, 1000);

        // Reset match info
        matchInfoElement.classList.add('hidden');
    }

    // Reset the game
    function resetGame() {
        // Clear timer
        clearInterval(gameState.timerInterval);

        // Reset game state
        gameState.flippedCards = [];
        gameState.matchedPairs = 0;
        gameState.moves = 0;
        gameState.score = 0;
        gameState.timer = 0;
        gameState.gameStarted = false;
        gameState.gameCompleted = false;

        // Update UI
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        startBtn.style.backgroundColor = '#28a745';
        matchInfoElement.classList.add('hidden');
        winModal.classList.add('hidden');

        // Reinitialize game
        updateTotalPairs();
        createCards();
        renderCards();
        updateStats();
        updateTimerDisplay();
    }

    // End the game
    function endGame() {
        gameState.gameCompleted = true;
        clearInterval(gameState.timerInterval);

        // Calculate accuracy
        const totalPossibleMatches = gameState.moves * 2;
        const accuracy = totalPossibleMatches > 0 ?
            Math.round((gameState.matchedPairs * 2 / totalPossibleMatches) * 100) : 100;

        // Update final stats
        finalTimeElement.textContent = formatTime(gameState.timer);
        finalMovesElement.textContent = gameState.moves;
        finalScoreElement.textContent = gameState.score;
        finalAccuracyElement.textContent = `${accuracy}%`;

        // Show win modal
        setTimeout(() => {
            winModal.classList.remove('hidden');
        }, 1000);

        // Save progress to localStorage
        saveProgress();
    }

    // Play again
    function playAgain() {
        winModal.classList.add('hidden');
        resetGame();
        startGame();
    }

    // Update game statistics
    function updateStats() {
        movesElement.textContent = gameState.moves;
        scoreElement.textContent = gameState.score;

        // Calculate accuracy
        const totalPossibleMatches = gameState.moves * 2;
        const accuracy = totalPossibleMatches > 0 ?
            Math.round((gameState.matchedPairs * 2 / totalPossibleMatches) * 100) : 0;
        accuracyElement.textContent = `${accuracy}%`;

        // Update matches count and progress bar
        matchesCountElement.textContent = gameState.matchedPairs;
        const progressPercent = (gameState.matchedPairs / gameState.totalPairs) * 100;
        progressFillElement.style.width = `${progressPercent}%`;
    }

    // Update timer display
    function updateTimerDisplay() {
        timerElement.textContent = formatTime(gameState.timer);
    }

    // Format time as MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Save progress to localStorage
    function saveProgress() {
        const progress = {
            difficulty: gameState.difficulty,
            category: gameState.category,
            bestScore: gameState.score,
            bestTime: gameState.timer,
            lastPlayed: new Date().toISOString()
        };

        // Get existing progress or create new object
        const allProgress = JSON.parse(localStorage.getItem('trafficSignMemoryGameProgress')) || {};

        // Update progress for current difficulty and category
        const key = `${gameState.difficulty}_${gameState.category}`;
        const currentBest = allProgress[key];

        if (!currentBest || gameState.score > currentBest.bestScore ||
            (gameState.score === currentBest.bestScore && gameState.timer < currentBest.bestTime)) {
            allProgress[key] = progress;
            localStorage.setItem('trafficSignMemoryGameProgress', JSON.stringify(allProgress));
        }
    }

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});