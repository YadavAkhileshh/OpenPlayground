    (function() {
        // ---------- COLOR MATCH GAME ----------
        const colorBox = document.getElementById('colorBox');
        const optionsGrid = document.getElementById('optionsGrid');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const roundDisplay = document.getElementById('roundDisplay');
        const highScoreDisplay = document.getElementById('highScoreDisplay');
        const timerFill = document.getElementById('timerFill');
        const messageBox = document.getElementById('messageBox');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');

        // Game state
        let score = 0;
        let round = 1;
        let highScore = localStorage.getItem('colorMatchHighScore') || 0;
        let gameActive = false;
        let timeLeft = 3.0; // seconds per round
        let timerInterval = null;
        let currentColor = '';
        let currentOptions = [];
        
        // Color palette
        const colors = [
            { name: 'RED', code: '#ff4444' },
            { name: 'BLUE', code: '#4444ff' },
            { name: 'GREEN', code: '#44aa44' },
            { name: 'YELLOW', code: '#ffff44' },
            { name: 'PURPLE', code: '#aa44ff' },
            { name: 'ORANGE', code: '#ff8844' },
            { name: 'PINK', code: '#ff88aa' },
            { name: 'CYAN', code: '#44ffff' }
        ];

        highScoreDisplay.textContent = highScore;

        // Generate random colors for options
        function getRandomColors(excludeColor, count = 4) {
            let available = colors.filter(c => c.code !== excludeColor.code);
            let selected = [];
            
            // Shuffle and pick
            for (let i = 0; i < count - 1; i++) {
                if (available.length === 0) break;
                const randomIndex = Math.floor(Math.random() * available.length);
                selected.push(available[randomIndex]);
                available.splice(randomIndex, 1);
            }
            
            // Add the correct color
            selected.push(excludeColor);
            
            // Shuffle final array
            for (let i = selected.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [selected[i], selected[j]] = [selected[j], selected[i]];
            }
            
            return selected;
        }

        // New round
        function newRound() {
            if (!gameActive) return;
            
            // Stop previous timer
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            
            // Pick random color for box
            const randomIndex = Math.floor(Math.random() * colors.length);
            currentColor = colors[randomIndex];
            colorBox.style.backgroundColor = currentColor.code;
            
            // Generate options (including correct color)
            currentOptions = getRandomColors(currentColor, 4);
            
            // Render option buttons
            renderOptions();
            
            // Reset timer
            timeLeft = Math.max(2.0, 3.0 - round * 0.1); // Gets faster each round
            updateTimerBar();
            
            // Start timer countdown
            timerInterval = setInterval(() => {
                timeLeft -= 0.1;
                updateTimerBar();
                
                if (timeLeft <= 0) {
                    // Time's up - game over
                    gameOver('⏰ TIME\'S UP!');
                }
            }, 100);
        }

        // Render color options
        function renderOptions() {
            let html = '';
            currentOptions.forEach((color, index) => {
                html += `<button class="color-option" style="background-color: ${color.code};" data-color="${color.code}" data-index="${index}">${color.name}</button>`;
            });
            optionsGrid.innerHTML = html;
        }

        // Update timer bar
        function updateTimerBar() {
            if (!gameActive) return;
            
            const percent = (timeLeft / 3.0) * 100;
            timerFill.style.width = Math.max(0, percent) + '%';
            
            // Add warning class
            if (percent < 30) {
                timerFill.classList.add('warning');
            } else {
                timerFill.classList.remove('warning');
            }
            
            if (timeLeft <= 0) {
                timerFill.style.width = '0%';
            }
        }

        // Handle option click
        function handleOptionClick(e) {
            if (!e.target.classList.contains('color-option')) return;
            if (!gameActive) return;
            
            const selectedColor = e.target.dataset.color;
            
            // Check if correct
            if (selectedColor === currentColor.code) {
                // Correct!
                score += Math.floor(timeLeft * 10) + 5; // Bonus for faster clicks
                round++;
                
                scoreDisplay.textContent = score;
                roundDisplay.textContent = round;
                
                messageBox.textContent = '✅ CORRECT! +' + (Math.floor(timeLeft * 10) + 5);
                messageBox.style.color = '#a5ffa5';
                
                // New round
                newRound();
            } else {
                // Wrong color - game over
                gameOver('❌ WRONG COLOR!');
            }
        }

        // Game over
        function gameOver(message) {
            gameActive = false;
            
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            // Update high score
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('colorMatchHighScore', highScore);
                highScoreDisplay.textContent = highScore;
                message += ' 🏆 NEW HIGH SCORE!';
            }
            
            messageBox.textContent = message;
            messageBox.style.color = '#ffaa5c';
            
            // Disable options
            document.querySelectorAll('.color-option').forEach(btn => {
                btn.disabled = true;
            });
            
            startBtn.disabled = false;
        }

        // Start game
        function startGame() {
            // Reset state
            score = 0;
            round = 1;
            gameActive = true;
            
            scoreDisplay.textContent = score;
            roundDisplay.textContent = round;
            messageBox.textContent = '🎯 GO!';
            messageBox.style.color = '#ffbe5c';
            
            // Enable buttons
            document.querySelectorAll('.color-option').forEach(btn => {
                btn.disabled = false;
            });
            
            startBtn.disabled = true;
            
            // Start first round
            newRound();
        }

        // Reset game
        function resetGame() {
            gameActive = false;
            
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            score = 0;
            round = 1;
            scoreDisplay.textContent = score;
            roundDisplay.textContent = round;
            
            // Reset timer bar
            timeLeft = 3.0;
            timerFill.style.width = '100%';
            timerFill.classList.remove('warning');
            
            // Random static display
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            colorBox.style.backgroundColor = randomColor.code;
            
            // Show options
            currentOptions = getRandomColors(randomColor, 4);
            renderOptions();
            
            document.querySelectorAll('.color-option').forEach(btn => {
                btn.disabled = true;
            });
            
            messageBox.textContent = '👇 PRESS START';
            messageBox.style.color = '#ffbe5c';
            startBtn.disabled = false;
        }

        // Event listeners
        optionsGrid.addEventListener('click', handleOptionClick);
        
        startBtn.addEventListener('click', startGame);
        
        resetBtn.addEventListener('click', resetGame);

        // Initial setup
        resetGame();

        // Keyboard support (number keys 1-4)
        document.addEventListener('keydown', (e) => {
            if (!gameActive) return;
            
            const key = e.key;
            if (key >= '1' && key <= '4') {
                const index = parseInt(key) - 1;
                const buttons = document.querySelectorAll('.color-option');
                if (buttons[index]) {
                    buttons[index].click();
                }
            }
        });

        // Prevent button double-click issues
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mousedown', (e) => e.preventDefault());
        });
    })();