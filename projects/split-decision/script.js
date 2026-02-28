        // Game data - scenarios with options and correct answers
        const scenarios = [
            {
                id: 1,
                text: "You're hiking in the mountains when you encounter a fork in the trail. The left path looks well-maintained but goes uphill. The right path is less clear but appears to be a shortcut downhill. Dark clouds are gathering overhead, and you need to find shelter before the storm hits.",
                options: [
                    { id: 1, text: "Take the left uphill path - it's better maintained and likely safer.", correct: true, icon: "fas fa-mountain" },
                    { id: 2, text: "Take the right downhill shortcut - it will save time as the storm approaches.", correct: false, icon: "fas fa-running" },
                    { id: 3, text: "Go back the way you came - better safe than sorry.", correct: false, icon: "fas fa-undo" },
                    { id: 4, text: "Wait at the fork to see if another hiker comes along who knows the area.", correct: false, icon: "fas fa-user-clock" }
                ],
                explanation: "The uphill path is better maintained and likely leads to higher ground, which is safer in a storm. Downhill paths can lead to flash flood areas."
            },
            {
                id: 2,
                text: "You're in a restaurant when you notice smoke coming from the kitchen. The staff doesn't seem to have noticed yet, and there are about 30 people in the dining area. What do you do?",
                options: [
                    { id: 1, text: "Quietly inform a staff member so as not to cause panic.", correct: false, icon: "fas fa-user-secret" },
                    { id: 2, text: "Shout 'FIRE!' and immediately head for the nearest exit.", correct: false, icon: "fas fa-fire-extinguisher" },
                    { id: 3, text: "Calmly but firmly announce there's a fire and direct people to exits.", correct: true, icon: "fas fa-bullhorn" },
                    { id: 4, text: "Try to find and use a fire extinguisher yourself.", correct: false, icon: "fas fa-fire" }
                ],
                explanation: "Calmly announcing the fire prevents panic while ensuring everyone is aware. Directing people to exits is crucial for orderly evacuation."
            },
            {
                id: 3,
                text: "You're driving on a remote road when your car gets a flat tire. It's getting dark, your phone has no signal, and the nearest town is 10 miles away. You have a spare tire but changing it will take time. What's your best course of action?",
                options: [
                    { id: 1, text: "Change the tire quickly and continue to the next town.", correct: true, icon: "fas fa-tools" },
                    { id: 2, text: "Start walking toward town to get help.", correct: false, icon: "fas fa-walking" },
                    { id: 3, text: "Stay in the car with hazards on and wait for another vehicle.", correct: false, icon: "fas fa-car" },
                    { id: 4, text: "Try to drive slowly on the flat tire to the nearest house.", correct: false, icon: "fas fa-home" }
                ],
                explanation: "Changing the tire yourself is the fastest solution. Walking puts you at risk, especially after dark, and driving on a flat can damage your car further."
            },
            {
                id: 4,
                text: "You're in an important meeting when you suddenly realize you have crucial information that contradicts what's being presented. Speaking up could embarrass your colleague, but staying silent could lead to a bad decision. What do you do?",
                options: [
                    { id: 1, text: "Wait until after the meeting to share your information privately.", correct: false, icon: "fas fa-comment-slash" },
                    { id: 2, text: "Raise your hand and politely present your contradictory information.", correct: true, icon: "fas fa-hand-paper" },
                    { id: 3, text: "Pass a note to the meeting leader discreetly.", correct: false, icon: "fas fa-sticky-note" },
                    { id: 4, text: "Say nothing to avoid conflict and hope it works out.", correct: false, icon: "fas fa-meh" }
                ],
                explanation: "In a business setting, correcting important information promptly is crucial, even if uncomfortable. Doing so politely minimizes embarrassment."
            },
            {
                id: 5,
                text: "You're babysitting when the child suddenly starts choking on a piece of candy. They're coughing but cannot breathe properly. You know basic first aid. What's your immediate action?",
                options: [
                    { id: 1, text: "Perform back blows between the shoulder blades.", correct: true, icon: "fas fa-hands-helping" },
                    { id: 2, text: "Try to remove the object with your fingers.", correct: false, icon: "fas fa-hand-point-up" },
                    { id: 3, text: "Wait to see if they can cough it out on their own.", correct: false, icon: "fas fa-clock" },
                    { id: 4, text: "Call emergency services immediately.", correct: false, icon: "fas fa-phone" }
                ],
                explanation: "For a choking child who is coughing but struggling to breathe, back blows are the recommended first action. Only call emergency services if the child becomes unconscious."
            }
        ];

        // Game state
        let gameState = {
            currentScenario: 0,
            score: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            totalTimeUsed: 0,
            gameActive: false,
            timer: null,
            timeRemaining: 10,
            scenarioStartTime: null,
            gameTimeLimit: 50 // Total seconds for all scenarios
        };

        // DOM elements
        const scenarioNumberEl = document.getElementById('scenario-number');
        const scenarioTextEl = document.getElementById('scenario-text');
        const timerEl = document.getElementById('timer');
        const optionsContainerEl = document.getElementById('options-container');
        const scoreEl = document.getElementById('score');
        const correctEl = document.getElementById('correct');
        const incorrectEl = document.getElementById('incorrect');
        const timeRemainingEl = document.getElementById('time-remaining');
        const avgTimeEl = document.getElementById('avg-time');
        const gameStatusEl = document.getElementById('game-status');
        const startBtn = document.getElementById('start-btn');
        const resetBtn = document.getElementById('reset-btn');
        const resultOverlay = document.getElementById('result-overlay');
        const finalScoreEl = document.getElementById('final-score');
        const finalCorrectEl = document.getElementById('final-correct');
        const finalAccuracyEl = document.getElementById('final-accuracy');
        const finalTimeEl = document.getElementById('final-time');
        const resultTitleEl = document.getElementById('result-title');
        const resultMessageEl = document.getElementById('result-message');
        const playAgainBtn = document.getElementById('play-again-btn');
        const levelDots = document.querySelectorAll('.level-dot');

        // Initialize game
        function initGame() {
            resetGameState();
            loadScenario(0);
            updateStats();
            updateLevelIndicator(0);
        }

        // Reset game state
        function resetGameState() {
            gameState = {
                currentScenario: 0,
                score: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                totalTimeUsed: 0,
                gameActive: false,
                timer: null,
                timeRemaining: 10,
                scenarioStartTime: null,
                gameTimeLimit: 50
            };
            
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
            gameStatusEl.textContent = 'Ready';
            clearInterval(gameState.timer);
        }

        // Load a scenario
        function loadScenario(index) {
            if (index >= scenarios.length) {
                endGame();
                return;
            }
            
            gameState.currentScenario = index;
            const scenario = scenarios[index];
            
            scenarioNumberEl.textContent = scenario.id;
            scenarioTextEl.textContent = scenario.text;
            
            // Clear options container
            optionsContainerEl.innerHTML = '';
            
            // Add options
            scenario.options.forEach(option => {
                const optionEl = document.createElement('div');
                optionEl.className = 'option';
                optionEl.dataset.id = option.id;
                optionEl.dataset.correct = option.correct;
                
                optionEl.innerHTML = `
                    <div class="option-icon"><i class="${option.icon}"></i></div>
                    <div class="option-text">${option.text}</div>
                `;
                
                optionEl.addEventListener('click', () => selectOption(optionEl));
                optionsContainerEl.appendChild(optionEl);
            });
            
            // Update level indicator
            updateLevelIndicator(index);
            
            // Reset timer
            gameState.timeRemaining = 10;
            timerEl.textContent = gameState.timeRemaining;
            timerEl.style.color = '#ff4b2b';
            
            // Record start time for this scenario
            if (gameState.gameActive) {
                gameState.scenarioStartTime = Date.now();
            }
        }

        // Update level indicator
        function updateLevelIndicator(index) {
            levelDots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else if (i < index) {
                    dot.classList.remove('active');
                    dot.style.background = '#2ecc71'; // Green for completed
                } else {
                    dot.classList.remove('active');
                    dot.style.background = 'rgba(255, 255, 255, 0.1)';
                }
            });
        }

        // Start the game
        function startGame() {
            if (gameState.gameActive) return;
            
            gameState.gameActive = true;
            gameState.scenarioStartTime = Date.now();
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-pause"></i> Game Active';
            gameStatusEl.textContent = 'In Progress';
            
            // Start the timer for the first scenario
            startTimer();
            
            // Update game time remaining
            updateGameTime();
        }

        // Start the timer for current scenario
        function startTimer() {
            clearInterval(gameState.timer);
            
            gameState.timer = setInterval(() => {
                gameState.timeRemaining--;
                timerEl.textContent = gameState.timeRemaining;
                
                // Change color when time is running low
                if (gameState.timeRemaining <= 3) {
                    timerEl.style.color = '#ff0000';
                    timerEl.style.animation = 'pulse 0.5s infinite alternate';
                }
                
                // Time's up - mark as incorrect
                if (gameState.timeRemaining <= 0) {
                    clearInterval(gameState.timer);
                    timeUp();
                }
            }, 1000);
        }

        // Handle time up
        function timeUp() {
            gameState.incorrectAnswers++;
            gameState.totalTimeUsed += 10; // Used all 10 seconds
            
            // Highlight correct answer
            const correctOption = document.querySelector('.option[data-correct="true"]');
            if (correctOption) {
                correctOption.classList.add('correct');
            }
            
            // Show timeout message
            gameStatusEl.textContent = 'Time Up!';
            gameStatusEl.style.color = '#ff0000';
            
            // Move to next scenario after delay
            setTimeout(() => {
                if (gameState.currentScenario < scenarios.length - 1) {
                    loadScenario(gameState.currentScenario + 1);
                    startTimer();
                    gameStatusEl.textContent = 'In Progress';
                    gameStatusEl.style.color = '';
                } else {
                    endGame();
                }
                updateStats();
            }, 2000);
        }

        // Handle option selection
        function selectOption(optionEl) {
            if (!gameState.gameActive) return;
            
            clearInterval(gameState.timer);
            
            // Calculate time used for this scenario
            const timeUsed = 10 - gameState.timeRemaining;
            gameState.totalTimeUsed += timeUsed;
            
            // Mark selected option
            optionEl.classList.add('selected');
            
            // Check if correct
            const isCorrect = optionEl.dataset.correct === 'true';
            
            if (isCorrect) {
                // Calculate score: more points for faster decisions
                const points = Math.max(1, Math.floor((10 - timeUsed) * 10));
                gameState.score += points;
                gameState.correctAnswers++;
                
                // Mark as correct
                optionEl.classList.add('correct');
                gameStatusEl.textContent = `Correct! +${points} points`;
                gameStatusEl.style.color = '#2ecc71';
            } else {
                gameState.incorrectAnswers++;
                
                // Mark as incorrect
                optionEl.classList.add('incorrect');
                gameStatusEl.textContent = 'Incorrect!';
                gameStatusEl.style.color = '#e74c3c';
                
                // Highlight correct answer
                const correctOption = document.querySelector('.option[data-correct="true"]');
                if (correctOption) {
                    correctOption.classList.add('correct');
                }
            }
            
            // Disable all options
            document.querySelectorAll('.option').forEach(opt => {
                opt.style.pointerEvents = 'none';
            });
            
            // Move to next scenario after delay
            setTimeout(() => {
                if (gameState.currentScenario < scenarios.length - 1) {
                    loadScenario(gameState.currentScenario + 1);
                    startTimer();
                    gameStatusEl.textContent = 'In Progress';
                    gameStatusEl.style.color = '';
                } else {
                    endGame();
                }
                updateStats();
            }, 2000);
        }

        // Update game statistics
        function updateStats() {
            scoreEl.textContent = gameState.score;
            correctEl.textContent = gameState.correctAnswers;
            incorrectEl.textContent = gameState.incorrectAnswers;
            
            // Update game time remaining
            updateGameTime();
            
            // Calculate average decision time
            const totalDecisions = gameState.correctAnswers + gameState.incorrectAnswers;
            if (totalDecisions > 0) {
                const avgTime = (gameState.totalTimeUsed / totalDecisions).toFixed(1);
                avgTimeEl.textContent = `${avgTime}s`;
            } else {
                avgTimeEl.textContent = '0.0s';
            }
        }

        // Update game time remaining
        function updateGameTime() {
            const timeUsed = gameState.totalTimeUsed;
            const timeLeft = Math.max(0, gameState.gameTimeLimit - timeUsed);
            timeRemainingEl.textContent = `${timeLeft}s`;
            
            // End game if time runs out
            if (timeLeft <= 0 && gameState.gameActive) {
                endGame();
            }
        }

        // End the game
        function endGame() {
            gameState.gameActive = false;
            clearInterval(gameState.timer);
            
            // Calculate final stats
            const totalQuestions = scenarios.length;
            const accuracy = totalQuestions > 0 ? Math.round((gameState.correctAnswers / totalQuestions) * 100) : 0;
            const avgTime = totalQuestions > 0 ? (gameState.totalTimeUsed / totalQuestions).toFixed(1) : 0;
            
            // Update final stats display
            finalScoreEl.textContent = gameState.score;
            finalCorrectEl.textContent = `${gameState.correctAnswers}/${totalQuestions}`;
            finalAccuracyEl.textContent = `${accuracy}%`;
            finalTimeEl.textContent = `${avgTime}s`;
            
            // Set result message based on performance
            if (accuracy >= 80) {
                resultTitleEl.textContent = "Excellent Instincts!";
                resultMessageEl.textContent = "You make great decisions under pressure. Your quick thinking served you well in these challenging scenarios.";
            } else if (accuracy >= 60) {
                resultTitleEl.textContent = "Good Decision-Making!";
                resultMessageEl.textContent = "You made solid choices in most scenarios. With a bit more practice, you'll be even better at split-second decisions.";
            } else {
                resultTitleEl.textContent = "Room for Improvement";
                resultMessageEl.textContent = "Split-second decisions can be tough. Consider taking a bit more time to evaluate options when possible.";
            }
            
            // Show result overlay
            resultOverlay.classList.add('active');
            
            // Update game status
            gameStatusEl.textContent = 'Game Complete';
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        }

        // Event listeners
        startBtn.addEventListener('click', startGame);
        
        resetBtn.addEventListener('click', () => {
            clearInterval(gameState.timer);
            initGame();
            resultOverlay.classList.remove('active');
        });
        
        playAgainBtn.addEventListener('click', () => {
            initGame();
            resultOverlay.classList.remove('active');
        });

        // Initialize game on load
        document.addEventListener('DOMContentLoaded', initGame);

        // Add CSS animation for timer pulse
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                from { opacity: 1; }
                to { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);