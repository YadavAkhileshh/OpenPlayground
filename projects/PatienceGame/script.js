        // DOM Elements
        const timerElement = document.getElementById('timer');
        const progressText = document.getElementById('progressText');
        const progressFill = document.querySelector('.progress-circle-fill');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const resultElement = document.getElementById('result');
        const warningElement = document.getElementById('warning');
        const gameArea = document.getElementById('gameArea');
        
        // Game variables
        let timeLeft = 120; // 2 minutes in seconds
        let timerInterval = null;
        let gameStarted = false;
        let gameCompleted = false;
        let mouseTouched = false;
        const totalTime = 120;
        const circumference = 2 * Math.PI * 90; // For progress circle
        
        // Initialize progress circle
        progressFill.style.strokeDasharray = circumference;
        progressFill.style.strokeDashoffset = circumference;
        
        // Create floating background elements
        function createFloatingElements() {
            const colors = [
                'rgba(233, 224, 245, 0.2)',
                'rgba(201, 182, 228, 0.15)',
                'rgba(212, 193, 240, 0.1)'
            ];
            
            for (let i = 0; i < 8; i++) {
                const element = document.createElement('div');
                element.className = 'floating-element';
                
                // Random size and position
                const size = Math.random() * 80 + 20;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                element.style.width = `${size}px`;
                element.style.height = `${size}px`;
                element.style.background = color;
                element.style.left = `${Math.random() * 100}%`;
                element.style.top = `${Math.random() * 100}%`;
                
                // Animation
                const duration = Math.random() * 30 + 20;
                const delay = Math.random() * 5;
                element.style.animation = `gentleBreathing ${duration}s ease-in-out ${delay}s infinite alternate`;
                
                document.body.appendChild(element);
            }
        }
        
        // Format time as MM:SS
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Update progress circle
        function updateProgress() {
            const progress = ((totalTime - timeLeft) / totalTime) * 100;
            const offset = circumference - (progress / 100) * circumference;
            progressFill.style.strokeDashoffset = offset;
            progressText.textContent = `${Math.round(progress)}%`;
        }
        
        // Update timer display
        function updateTimer() {
            timerElement.textContent = formatTime(timeLeft);
            updateProgress();
            
            // Change color as time decreases
            if (timeLeft <= 30) {
                timerElement.style.color = '#e8b7d4';
            } else if (timeLeft <= 60) {
                timerElement.style.color = '#d4c1f0';
            }
        }
        
        // Check for mouse movement
        function checkMouseMovement() {
            if (gameStarted && !gameCompleted) {
                mouseTouched = true;
                warningElement.textContent = "Mouse moved! Be still...";
                warningElement.style.opacity = 1;
                
                // Clear warning after 2 seconds
                setTimeout(() => {
                    warningElement.style.opacity = 0;
                }, 2000);
            }
        }
        
        // Start the game
        function startGame() {
            if (gameStarted) return;
            
            gameStarted = true;
            gameCompleted = false;
            mouseTouched = false;
            timeLeft = totalTime;
            
            startBtn.disabled = true;
            startBtn.textContent = "Waiting...";
            resultElement.textContent = "";
            warningElement.textContent = "";
            gameArea.classList.remove('idle');
            
            // Start timer
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimer();
                
                if (timeLeft <= 0) {
                    completeGame();
                }
            }, 1000);
            
            updateTimer();
        }
        
        // Complete the game successfully
        function completeGame() {
            clearInterval(timerInterval);
            gameCompleted = true;
            gameStarted = false;
            
            // Check if player won
            if (!mouseTouched) {
                resultElement.textContent = "🎉 You Win! 🎉";
                resultElement.className = "result success";
                createConfetti();
            } else {
                resultElement.textContent = "Not quite... You moved the mouse";
                resultElement.className = "result fail";
            }
            
            startBtn.disabled = false;
            startBtn.textContent = "Start Again";
        }
        
        // Reset the game
        function resetGame() {
            clearInterval(timerInterval);
            gameStarted = false;
            gameCompleted = false;
            mouseTouched = false;
            timeLeft = totalTime;
            
            startBtn.disabled = false;
            startBtn.textContent = "Start Waiting";
            resultElement.textContent = "";
            warningElement.textContent = "";
            timerElement.style.color = "#d4c1f0";
            gameArea.classList.add('idle');
            
            updateTimer();
        }
        
        // Create celebration confetti
        function createConfetti() {
            const colors = ['#c9b6e4', '#d4c1f0', '#a8d8b9', '#e8b7d4'];
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                
                // Random properties
                const color = colors[Math.floor(Math.random() * colors.length)];
                const left = Math.random() * 100;
                const size = Math.random() * 10 + 5;
                const animationDuration = Math.random() * 3 + 2;
                const animationDelay = Math.random() * 1;
                
                confetti.style.left = `${left}%`;
                confetti.style.width = `${size}px`;
                confetti.style.height = `${size}px`;
                confetti.style.backgroundColor = color;
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                
                // Add to container
                document.querySelector('.container').appendChild(confetti);
                
                // Animate
                setTimeout(() => {
                    confetti.style.opacity = 1;
                    confetti.style.transform = `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`;
                    confetti.style.transition = `transform ${animationDuration}s ease-out ${animationDelay}s, opacity ${animationDuration}s ease-out ${animationDelay}s`;
                }, 10);
                
                // Remove after animation
                setTimeout(() => {
                    confetti.remove();
                }, (animationDuration + animationDelay) * 1000 + 1000);
            }
        }
        
        // Event Listeners
        startBtn.addEventListener('click', startGame);
        resetBtn.addEventListener('click', resetGame);
        
        // Mouse movement detection
        document.addEventListener('mousemove', checkMouseMovement);
        document.addEventListener('mousedown', checkMouseMovement);
        document.addEventListener('mouseup', checkMouseMovement);
        document.addEventListener('click', checkMouseMovement);
        document.addEventListener('contextmenu', checkMouseMovement);
        
        // Prevent accidental clicks on buttons from counting as movement
        startBtn.addEventListener('click', (e) => e.stopPropagation());
        resetBtn.addEventListener('click', (e) => e.stopPropagation());
        
        // Initialize
        createFloatingElements();
        updateTimer();
        
        // Add keyboard shortcut for accessibility (Space to start, R to reset)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !startBtn.disabled) {
                e.preventDefault();
                startGame();
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                resetGame();
            }
        });
        
        // Add instructions for keyboard controls
        setTimeout(() => {
            if (!gameStarted) {
                warningElement.textContent = "Tip: Press Space to start, R to reset";
                setTimeout(() => {
                    if (warningElement.textContent.includes("Tip")) {
                        warningElement.style.opacity = 0;
                    }
                }, 4000);
            }
        }, 2000);