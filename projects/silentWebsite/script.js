        // DOM Elements
        const introScreen = document.querySelector('.intro-screen');
        const challengeScreen = document.getElementById('challengeScreen');
        const failureScreen = document.getElementById('failureScreen');
        const successScreen = document.getElementById('successScreen');
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const backToIntroBtn = document.getElementById('backToIntroBtn');
        const successRestartBtn = document.getElementById('successRestartBtn');
        const successBackBtn = document.getElementById('successBackBtn');
        const timerElement = document.getElementById('timer');
        const progressBar = document.getElementById('progressBar');
        const failureTimeElement = document.getElementById('failureTime');
        const successTimeElement = document.getElementById('successTime');
        const warningFlash = document.getElementById('warningFlash');
        const sensitivitySlider = document.getElementById('sensitivitySlider');
        const statsPanel = document.getElementById('statsPanel');
        const particlesContainer = document.getElementById('particles');
        const goalTimeDisplay = document.getElementById('goalTimeDisplay');
        const decreaseTimeBtn = document.getElementById('decreaseTime');
        const increaseTimeBtn = document.getElementById('increaseTime');
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        
        // Game state
        let isChallengeActive = false;
        let startTime = 0;
        let currentTime = 0;
        let timerInterval = null;
        let goalTime = 3 * 60; // 3 minutes in seconds
        let difficulty = 'medium';
        let sensitivity = 5;
        let mousePosition = { x: 0, y: 0 };
        let mouseMoveCount = 0;
        let lastInteractionTime = 0;
        let distractionInterval = null;
        
        // Statistics
        let stats = {
            attempts: 0,
            successes: 0,
            bestStreak: 0,
            currentStreak: 0,
            totalTime: 0
        };
        
        // Load stats from localStorage
        function loadStats() {
            const savedStats = localStorage.getItem('silenceChallengeStats');
            if (savedStats) {
                stats = JSON.parse(savedStats);
            }
        }
        
        // Save stats to localStorage
        function saveStats() {
            localStorage.setItem('silenceChallengeStats', JSON.stringify(stats));
        }
        
        // Initialize
        loadStats();
        updateStatsDisplay();
        createParticles();
        
        // Update goal time
        decreaseTimeBtn.addEventListener('click', () => {
            let currentTime = parseInt(goalTimeDisplay.textContent);
            if (currentTime > 1) {
                goalTimeDisplay.textContent = currentTime - 1;
                goalTime = (currentTime - 1) * 60;
            }
        });
        
        increaseTimeBtn.addEventListener('click', () => {
            let currentTime = parseInt(goalTimeDisplay.textContent);
            if (currentTime < 30) {
                goalTimeDisplay.textContent = currentTime + 1;
                goalTime = (currentTime + 1) * 60;
            }
        });
        
        // Difficulty selection
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                difficultyButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                difficulty = button.dataset.difficulty;
                
                // Adjust sensitivity based on difficulty
                switch(difficulty) {
                    case 'easy':
                        sensitivitySlider.value = 3;
                        sensitivity = 3;
                        break;
                    case 'medium':
                        sensitivitySlider.value = 5;
                        sensitivity = 5;
                        break;
                    case 'hard':
                        sensitivitySlider.value = 8;
                        sensitivity = 8;
                        break;
                }
            });
        });
        
        // Sensitivity slider
        sensitivitySlider.addEventListener('input', () => {
            sensitivity = parseInt(sensitivitySlider.value);
        });
        
        // Start challenge
        startBtn.addEventListener('click', () => {
            startChallenge();
        });
        
        // Restart challenge
        restartBtn.addEventListener('click', () => {
            startChallenge();
        });
        
        successRestartBtn.addEventListener('click', () => {
            startChallenge();
        });
        
        // Back to intro
        backToIntroBtn.addEventListener('click', () => {
            showScreen('intro');
        });
        
        successBackBtn.addEventListener('click', () => {
            showScreen('intro');
        });
        
        // Show specific screen
        function showScreen(screen) {
            introScreen.style.display = 'none';
            challengeScreen.style.display = 'none';
            failureScreen.style.display = 'none';
            successScreen.style.display = 'none';
            
            isChallengeActive = false;
            
            if (screen === 'intro') {
                introScreen.style.display = 'block';
                document.body.style.background = '#000';
                statsPanel.classList.remove('show');
            } else if (screen === 'challenge') {
                challengeScreen.style.display = 'flex';
                statsPanel.classList.add('show');
            } else if (screen === 'failure') {
                failureScreen.style.display = 'flex';
                statsPanel.classList.remove('show');
            } else if (screen === 'success') {
                successScreen.style.display = 'flex';
                statsPanel.classList.remove('show');
            }
        }
        
        // Start the challenge
        function startChallenge() {
            showScreen('challenge');
            isChallengeActive = true;
            startTime = Date.now();
            currentTime = 0;
            mouseMoveCount = 0;
            lastInteractionTime = Date.now();
            stats.attempts++;
            
            // Reset progress bar
            progressBar.style.width = '0%';
            
            // Start timer
            clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 100);
            
            // Start distraction interval based on difficulty
            clearInterval(distractionInterval);
            
            let distractionDelay;
            switch(difficulty) {
                case 'easy': distractionDelay = 15000; break;
                case 'medium': distractionDelay = 10000; break;
                case 'hard': distractionDelay = 5000; break;
            }
            
            distractionInterval = setInterval(() => {
                if (isChallengeActive) {
                    createDistraction();
                }
            }, distractionDelay);
            
            // Update background based on time
            updateBackground();
            
            // Save stats
            saveStats();
            updateStatsDisplay();
        }
        
        // Update timer
        function updateTimer() {
            if (!isChallengeActive) return;
            
            const now = Date.now();
            currentTime = Math.floor((now - startTime) / 1000);
            
            // Update timer display
            const minutes = Math.floor(currentTime / 60);
            const seconds = currentTime % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update progress bar
            const progressPercent = Math.min((currentTime / goalTime) * 100, 100);
            progressBar.style.width = `${progressPercent}%`;
            
            // Update current streak in stats
            stats.currentStreak = currentTime;
            if (currentTime > stats.bestStreak) {
                stats.bestStreak = currentTime;
            }
            
            // Update stats display
            updateStatsDisplay();
            
            // Check if challenge is completed
            if (currentTime >= goalTime) {
                completeChallenge();
            }
            
            // Update background based on time
            updateBackground();
        }
        
        // Update background color based on time
        function updateBackground() {
            if (!isChallengeActive) return;
            
            // Gradually change background as time passes
            const intensity = Math.min(currentTime / goalTime, 1);
            const darkValue = Math.floor(255 * (1 - intensity * 0.7));
            document.body.style.background = `rgb(${darkValue}, ${darkValue}, ${darkValue})`;
            
            // Make challenge screen background match
            challengeScreen.style.background = document.body.style.background;
        }
        
        // Complete challenge successfully
        function completeChallenge() {
            isChallengeActive = false;
            clearInterval(timerInterval);
            clearInterval(distractionInterval);
            
            // Update stats
            stats.successes++;
            stats.totalTime += currentTime;
            
            // Show success screen
            successTimeElement.textContent = timerElement.textContent;
            showScreen('success');
            
            // Remove all distractions
            document.querySelectorAll('.distraction').forEach(el => el.remove());
            
            // Save stats
            saveStats();
        }
        
        // Fail challenge (silence broken)
        function failChallenge(reason = "interaction") {
            if (!isChallengeActive) return;
            
            isChallengeActive = false;
            clearInterval(timerInterval);
            clearInterval(distractionInterval);
            
            // Show failure screen
            failureTimeElement.textContent = timerElement.textContent;
            showScreen('failure');
            
            // Flash warning
            warningFlash.style.opacity = '1';
            setTimeout(() => {
                warningFlash.style.opacity = '0';
            }, 500);
            
            // Remove all distractions
            document.querySelectorAll('.distraction').forEach(el => el.remove());
            
            // Save stats
            saveStats();
        }
        
        // Update stats display
        function updateStatsDisplay() {
            document.getElementById('currentStreak').textContent = formatTime(stats.currentStreak);
            document.getElementById('bestStreak').textContent = formatTime(stats.bestStreak);
            document.getElementById('attemptCount').textContent = stats.attempts;
            
            const successRate = stats.attempts > 0 ? Math.round((stats.successes / stats.attempts) * 100) : 0;
            document.getElementById('successRate').textContent = `${successRate}%`;
        }
        
        // Format time as MM:SS
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Create background particles
        function createParticles() {
            for (let i = 0; i < 100; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.animation = `float ${3 + Math.random() * 7}s infinite ease-in-out`;
                particle.style.animationDelay = `${Math.random() * 5}s`;
                particlesContainer.appendChild(particle);
            }
        }
        
        // Create distractions
        function createDistraction() {
            if (!isChallengeActive) return;
            
            const distraction = document.createElement('div');
            distraction.className = 'distraction';
            
            // Random distraction type
            const types = ['text', 'circle', 'square', 'triangle'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            // Random position
            const x = Math.random() * 90 + 5;
            const y = Math.random() * 90 + 5;
            
            distraction.style.left = `${x}%`;
            distraction.style.top = `${y}%`;
            
            // Create based on type
            if (type === 'text') {
                const texts = ['Click me!', 'Touch here', 'Press any key', 'Move mouse', 'Break silence', 'Give up'];
                const text = texts[Math.floor(Math.random() * texts.length)];
                distraction.textContent = text;
                distraction.style.fontSize = `${1 + Math.random() * 1.5}rem`;
                distraction.style.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
                distraction.style.fontWeight = 'bold';
                distraction.style.cursor = 'pointer';
                distraction.style.pointerEvents = 'auto';
                
                // Make text distractions clickable (will fail challenge)
                distraction.addEventListener('click', () => {
                    if (isChallengeActive) {
                        failChallenge('distraction click');
                    }
                });
            } else {
                // Shape distractions
                const size = 30 + Math.random() * 70;
                distraction.style.width = `${size}px`;
                distraction.style.height = `${size}px`;
                
                if (type === 'circle') {
                    distraction.style.borderRadius = '50%';
                    distraction.style.background = `radial-gradient(circle, 
                        hsl(${Math.random() * 360}, 80%, 60%), 
                        hsl(${Math.random() * 360}, 80%, 40%))`;
                } else if (type === 'square') {
                    distraction.style.background = `linear-gradient(45deg, 
                        hsl(${Math.random() * 360}, 80%, 60%), 
                        hsl(${Math.random() * 360}, 80%, 40%))`;
                    distraction.style.borderRadius = '10px';
                } else if (type === 'triangle') {
                    distraction.style.width = '0';
                    distraction.style.height = '0';
                    distraction.style.borderLeft = `${size/2}px solid transparent`;
                    distraction.style.borderRight = `${size/2}px solid transparent`;
                    distraction.style.borderBottom = `${size}px solid hsl(${Math.random() * 360}, 80%, 60%)`;
                    distraction.style.background = 'none';
                }
                
                // Animate shape distractions
                distraction.style.animation = `pulse ${2 + Math.random() * 3}s infinite ease-in-out`;
            }
            
            document.body.appendChild(distraction);
            
            // Show the distraction
            setTimeout(() => {
                distraction.classList.add('show');
            }, 10);
            
            // Remove after some time
            setTimeout(() => {
                if (distraction.parentNode) {
                    distraction.classList.remove('show');
                    setTimeout(() => {
                        if (distraction.parentNode) {
                            distraction.remove();
                        }
                    }, 500);
                }
            }, 3000 + Math.random() * 4000);
        }
        
        // Interaction detection
        // Mouse movement detection
        let lastMouseX = 0;
        let lastMouseY = 0;
        let mouseMoveTimer = null;
        
        document.addEventListener('mousemove', (e) => {
            if (!isChallengeActive) return;
            
            const now = Date.now();
            const timeSinceLastInteraction = now - lastInteractionTime;
            
            // Only count significant mouse movements
            const deltaX = Math.abs(e.clientX - lastMouseX);
            const deltaY = Math.abs(e.clientY - lastMouseY);
            
            if ((deltaX > sensitivity || deltaY > sensitivity) && timeSinceLastInteraction > 500) {
                mouseMoveCount++;
                
                // Too many mouse movements will fail the challenge
                if (mouseMoveCount > 10) {
                    failChallenge('excessive mouse movement');
                } else {
                    // Show warning for minor movements
                    warningFlash.style.opacity = '0.3';
                    setTimeout(() => {
                        warningFlash.style.opacity = '0';
                    }, 300);
                    
                    lastInteractionTime = now;
                }
            }
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            
            // Reset mouse move count if user stops moving for a while
            clearTimeout(mouseMoveTimer);
            mouseMoveTimer = setTimeout(() => {
                mouseMoveCount = Math.max(0, mouseMoveCount - 1);
            }, 2000);
        });
        
        // Keyboard detection
        document.addEventListener('keydown', (e) => {
            if (!isChallengeActive) return;
            
            // Allow F5 for refresh (but still counts as failure)
            if (e.key === 'F5') {
                // Don't prevent default for F5
            } else {
                e.preventDefault();
            }
            
            failChallenge('key press');
        });
        
        // Touch detection
        document.addEventListener('touchstart', (e) => {
            if (!isChallengeActive) return;
            e.preventDefault();
            failChallenge('touch');
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isChallengeActive) return;
            e.preventDefault();
            failChallenge('touch movement');
        });
        
        // Click detection (for clicks outside of distractions)
        document.addEventListener('click', (e) => {
            if (!isChallengeActive) return;
            
            // Only fail if not clicking on a distraction (those have their own handlers)
            if (!e.target.classList.contains('distraction')) {
                failChallenge('click');
            }
        });
        
        // Context menu prevention
        document.addEventListener('contextmenu', (e) => {
            if (isChallengeActive) {
                e.preventDefault();
                failChallenge('right click');
            }
        });
        
        // Prevent scrolling
        document.addEventListener('wheel', (e) => {
            if (isChallengeActive) {
                e.preventDefault();
                failChallenge('scroll');
            }
        }, { passive: false });
        
        // Initialize
        showScreen('intro');
        
        // Easter egg: If user manages to stay still for a long time without starting challenge
        setTimeout(() => {
            if (!isChallengeActive) {
                // Add a subtle encouragement message
                const encouragement = document.createElement('div');
                encouragement.innerHTML = `
                    <div style="position: fixed; bottom: 80px; right: 20px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem; color: #aaa; max-width: 200px;">
                        <i class="fas fa-info-circle"></i> Ready to test your stillness? Click START to begin the silence challenge.
                    </div>
                `;
                document.body.appendChild(encouragement);
                
                setTimeout(() => {
                    if (encouragement.parentNode) {
                        encouragement.remove();
                    }
                }, 10000);
            }
        }, 30000);