
        // Game state
        const game = {
            isWaiting: false,
            isReady: false,
            startTime: 0,
            results: [],
            bestTime: null,
            averageTime: null,
            score: 0,
            attempts: 0
        };

        // DOM Elements
        const gameArea = document.getElementById('gameArea');
        const statusText = document.getElementById('statusText');
        const reactionTime = document.getElementById('reactionTime');
        const feedbackText = document.getElementById('feedbackText');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const bestTimeEl = document.getElementById('bestTime');
        const averageTimeEl = document.getElementById('averageTime');
        const attemptsEl = document.getElementById('attempts');
        const scoreEl = document.getElementById('score');
        const historyList = document.getElementById('historyList');

        // Start the game
        function startGame() {
            if (game.isWaiting || game.isReady) return;
            
            // Reset UI
            gameArea.classList.remove('ready', 'clicked');
            gameArea.classList.add('waiting');
            statusText.textContent = 'WAIT...';
            statusText.className = 'status-text waiting';
            reactionTime.textContent = '- ms';
            reactionTime.className = 'reaction-time';
            feedbackText.textContent = 'Wait for green, then click!';
            
            game.isWaiting = true;
            
            // Random delay between 2-5 seconds
            const delay = 2000 + Math.random() * 3000;
            
            setTimeout(() => {
                if (!game.isWaiting) return;
                
                game.isWaiting = false;
                game.isReady = true;
                game.startTime = Date.now();
                
                // Change to ready state
                gameArea.classList.remove('waiting');
                gameArea.classList.add('ready');
                statusText.textContent = 'CLICK NOW!';
                statusText.className = 'status-text ready';
                
                // Timeout if player doesn't click
                setTimeout(() => {
                    if (game.isReady) {
                        endGame(false, 'Too slow!');
                    }
                }, 1000);
                
            }, delay);
        }

        // Handle click on game area
        function handleClick() {
            if (!game.isReady && !game.isWaiting) {
                // Game not started, start it
                startGame();
                return;
            }
            
            if (game.isWaiting) {
                // Clicked too early
                endGame(false, 'Too early! Wait for green.');
                return;
            }
            
            if (game.isReady) {
                // Valid click
                const reaction = Date.now() - game.startTime;
                endGame(true, reaction);
            }
        }

        // End the game
        function endGame(success, result) {
            game.isWaiting = false;
            game.isReady = false;
            game.attempts++;
            
            gameArea.classList.remove('waiting', 'ready');
            gameArea.classList.add('clicked');
            
            if (success) {
                const time = result;
                
                // Update reaction time display
                reactionTime.textContent = time + ' ms';
                
                // Color code based on speed
                if (time < 200) {
                    reactionTime.className = 'reaction-time good';
                    feedbackText.textContent = '⚡ Superhuman! Amazing reflexes!';
                    game.score += 3;
                } else if (time < 250) {
                    reactionTime.className = 'reaction-time good';
                    feedbackText.textContent = '👍 Excellent reaction time!';
                    game.score += 2;
                } else if (time < 300) {
                    reactionTime.className = 'reaction-time average';
                    feedbackText.textContent = '👌 Good, keep practicing!';
                    game.score += 1;
                } else {
                    reactionTime.className = 'reaction-time slow';
                    feedbackText.textContent = '💪 Needs practice, try again!';
                }
                
                // Save result
                game.results.unshift({
                    time: time,
                    date: new Date(),
                    status: time < 250 ? 'good' : time < 300 ? 'average' : 'slow'
                });
                
                // Keep only last 10 results
                if (game.results.length > 10) {
                    game.results.pop();
                }
                
                // Update best time
                if (game.bestTime === null || time < game.bestTime) {
                    game.bestTime = time;
                }
                
                // Calculate average
                const total = game.results.reduce((sum, r) => sum + r.time, 0);
                game.averageTime = Math.round(total / game.results.length);
                
            } else {
                // Failed attempt
                reactionTime.textContent = 'FAIL';
                reactionTime.className = 'reaction-time slow';
                feedbackText.textContent = result;
            }
            
            statusText.textContent = success ? 'NICE!' : 'FAILED';
            statusText.className = 'status-text';
            
            updateStats();
            updateHistory();
        }

        // Update statistics display
        function updateStats() {
            bestTimeEl.textContent = game.bestTime ? game.bestTime + ' ms' : '-';
            averageTimeEl.textContent = game.averageTime ? game.averageTime + ' ms' : '-';
            attemptsEl.textContent = game.attempts;
            scoreEl.textContent = game.score;
        }

        // Update history list
        function updateHistory() {
            historyList.innerHTML = '';
            
            game.results.forEach((result, index) => {
                const item = document.createElement('div');
                item.className = 'history-item';
                
                const time = document.createElement('div');
                time.className = 'history-time';
                time.textContent = result.time + ' ms';
                
                const status = document.createElement('div');
                status.className = `history-status ${result.status}`;
                status.textContent = result.status.toUpperCase();
                
                const date = document.createElement('div');
                date.style.fontSize = '0.8rem';
                date.style.color = '#a0a0c0';
                date.textContent = result.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                item.appendChild(time);
                item.appendChild(status);
                item.appendChild(date);
                historyList.appendChild(item);
            });
            
            if (game.results.length === 0) {
                const empty = document.createElement('div');
                empty.textContent = 'No results yet. Play the game!';
                empty.style.textAlign = 'center';
                empty.style.color = '#a0a0c0';
                empty.style.padding = '20px';
                historyList.appendChild(empty);
            }
        }

        // Reset all statistics
        function resetStats() {
            if (!confirm('Are you sure you want to reset all statistics?')) return;
            
            game.results = [];
            game.bestTime = null;
            game.averageTime = null;
            game.score = 0;
            game.attempts = 0;
            
            reactionTime.textContent = '- ms';
            reactionTime.className = 'reaction-time';
            feedbackText.textContent = 'Your reaction time will appear here';
            statusText.textContent = 'Click START to begin';
            statusText.className = 'status-text';
            
            gameArea.classList.remove('waiting', 'ready', 'clicked');
            
            updateStats();
            updateHistory();
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleClick();
            } else if (e.code === 'Enter') {
                e.preventDefault();
                startGame();
            } else if (e.code === 'Escape') {
                resetStats();
            }
        });

        // Event listeners
        gameArea.addEventListener('click', handleClick);
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startGame();
        });
        resetBtn.addEventListener('click', resetStats);

        // Initialize
        updateStats();
        updateHistory();

        // Instructions tooltip
        gameArea.addEventListener('mouseenter', () => {
            if (!game.isWaiting && !game.isReady) {
                feedbackText.textContent = 'Click to start, then click when green appears';
            }
        });
    