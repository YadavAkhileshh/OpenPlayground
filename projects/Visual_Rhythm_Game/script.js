
        // Game variables
        let score = 0;
        let combo = 0;
        let streak = 0;
        let missedCount = 0;
        let gameActive = false;
        let gameSpeed = 1.0;
        let beats = [];
        let beatId = 0;
        let highestCombo = 0;
        
        // DOM elements
        const playArea = document.getElementById('playArea');
        const targetZone = document.getElementById('targetZone');
        const scoreElement = document.getElementById('score');
        const comboElement = document.getElementById('combo');
        const streakElement = document.getElementById('streak');
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const accuracyDisplay = document.getElementById('accuracyDisplay');
        const gameOverScreen = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const finalComboElement = document.getElementById('finalCombo');
        const playAgainBtn = document.getElementById('playAgainBtn');
        
        // Game configuration
        const MAX_MISSES = 10;
        const PERFECT_THRESHOLD = 30; // pixels from center
        const GOOD_THRESHOLD = 70; // pixels from center
        const BEAT_SPAWN_INTERVAL_MIN = 600;
        const BEAT_SPAWN_INTERVAL_MAX = 1200;
        const BEAT_TRAVEL_TIME = 3000; // ms
        
        // Colors for different beat types
        const BEAT_COLORS = [
            {bg: '#FF6EC7', text: '#FFFFFF'}, // Pink
            {bg: '#7873F5', text: '#FFFFFF'}, // Purple
            {bg: '#7AE582', text: '#0A0A2A'}, // Green
            {bg: '#4CC9F0', text: '#0A0A2A'}, // Blue
            {bg: '#FFD166', text: '#0A0A2A'}  // Yellow
        ];
        
        // Initialize game
        function initGame() {
            score = 0;
            combo = 0;
            streak = 0;
            missedCount = 0;
            gameActive = false;
            gameSpeed = 1.0;
            beats = [];
            beatId = 0;
            highestCombo = 0;
            
            updateUI();
            clearPlayArea();
            gameOverScreen.classList.remove('active');
            
            // Reset target zone position (center bottom)
            const playAreaRect = playArea.getBoundingClientRect();
            targetZone.style.left = '50%';
            targetZone.style.bottom = '100px';
        }
        
        // Update UI elements
        function updateUI() {
            scoreElement.textContent = score;
            comboElement.textContent = combo;
            streakElement.textContent = streak;
            
            // Add glow effect for high combos
            if (combo >= 10) {
                comboElement.style.textShadow = '0 0 15px #ff6ec7';
            } else if (combo >= 5) {
                comboElement.style.textShadow = '0 0 10px #7ae582';
            } else {
                comboElement.style.textShadow = 'none';
            }
            
            // Add glow effect for high streaks
            if (streak >= 5) {
                streakElement.style.textShadow = '0 0 15px #ffd166';
            } else {
                streakElement.style.textShadow = 'none';
            }
        }
        
        // Clear all beats from play area
        function clearPlayArea() {
            const existingBeats = document.querySelectorAll('.beat');
            existingBeats.forEach(beat => beat.remove());
        }
        
        // Create a new beat
        function createBeat() {
            if (!gameActive) return;
            
            beatId++;
            
            // Randomly select beat color
            const colorIndex = Math.floor(Math.random() * BEAT_COLORS.length);
            const beatColor = BEAT_COLORS[colorIndex];
            
            // Create beat element
            const beat = document.createElement('div');
            beat.className = 'beat';
            beat.id = `beat-${beatId}`;
            
            // Set random position at top of play area
            const playAreaRect = playArea.getBoundingClientRect();
            const targetRect = targetZone.getBoundingClientRect();
            
            const maxX = playAreaRect.width - 60;
            const startX = Math.random() * maxX;
            
            beat.style.width = '60px';
            beat.style.height = '60px';
            beat.style.left = `${startX}px`;
            beat.style.top = '-60px';
            beat.style.backgroundColor = beatColor.bg;
            beat.style.color = beatColor.text;
            beat.style.fontSize = '1.2rem';
            
            // Add beat number (optional visual indicator)
            beat.textContent = beatId % 10 === 0 ? '!' : '●';
            
            // Store beat data
            const beatData = {
                id: beatId,
                element: beat,
                startX: startX,
                startY: -60,
                targetX: targetRect.left - playAreaRect.left + targetRect.width/2 - 30,
                targetY: targetRect.top - playAreaRect.top + targetRect.height/2 - 30,
                startTime: Date.now(),
                travelTime: BEAT_TRAVEL_TIME / gameSpeed,
                hit: false
            };
            
            beats.push(beatData);
            
            // Add to play area
            playArea.appendChild(beat);
            
            // Animate beat
            animateBeat(beatData);
            
            // Schedule next beat
            const nextSpawnTime = Math.random() * 
                (BEAT_SPAWN_INTERVAL_MAX - BEAT_SPAWN_INTERVAL_MIN) + 
                BEAT_SPAWN_INTERVAL_MIN;
            
            setTimeout(createBeat, nextSpawnTime / gameSpeed);
        }
        
        // Animate beat movement
        function animateBeat(beatData) {
            const beat = beatData.element;
            const startTime = beatData.startTime;
            const travelTime = beatData.travelTime;
            
            function updatePosition() {
                if (!gameActive || beatData.hit) return;
                
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / travelTime, 1);
                
                // Calculate current position
                const currentX = beatData.startX + (beatData.targetX - beatData.startX) * progress;
                const currentY = beatData.startY + (beatData.targetY - beatData.startY) * progress;
                
                // Update beat position
                beat.style.left = `${currentX}px`;
                beat.style.top = `${currentY}px`;
                
                // Make beat grow as it approaches target
                const scale = 0.8 + progress * 0.4;
                beat.style.transform = `scale(${scale})`;
                
                // Make beat pulse when close to target
                if (progress > 0.7) {
                    beat.classList.add('active');
                }
                
                // Check if beat passed target without being hit
                if (progress >= 1 && !beatData.hit) {
                    handleMiss(beatData);
                    return;
                }
                
                // Continue animation if not yet reached target
                if (progress < 1) {
                    requestAnimationFrame(updatePosition);
                }
            }
            
            requestAnimationFrame(updatePosition);
        }
        
        // Handle player tap/click
        function handleTap(event) {
            if (!gameActive) return;
            
            const tapX = event.clientX || event.touches[0].clientX;
            const tapY = event.clientY || event.touches[0].clientY;
            
            // Find the closest beat to tap location
            let closestBeat = null;
            let closestDistance = Infinity;
            
            beats.forEach(beatData => {
                if (beatData.hit) return;
                
                const beatRect = beatData.element.getBoundingClientRect();
                const beatCenterX = beatRect.left + beatRect.width/2;
                const beatCenterY = beatRect.top + beatRect.height/2;
                
                const distance = Math.sqrt(
                    Math.pow(tapX - beatCenterX, 2) + 
                    Math.pow(tapY - beatCenterY, 2)
                );
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestBeat = beatData;
                }
            });
            
            // If a beat was close enough, evaluate accuracy
            if (closestBeat) {
                evaluateAccuracy(closestBeat, closestDistance);
            } else {
                // No beat nearby counts as a miss
                handleMiss(null);
            }
            
            // Visual feedback for tap
            showTapEffect(tapX, tapY);
        }
        
        // Evaluate accuracy based on distance from target center
        function evaluateAccuracy(beatData, distance) {
            let accuracy = 'miss';
            let points = 0;
            
            if (distance <= PERFECT_THRESHOLD) {
                accuracy = 'perfect';
                points = 100;
                streak++;
            } else if (distance <= GOOD_THRESHOLD) {
                accuracy = 'good';
                points = 50;
                streak++;
            } else {
                accuracy = 'miss';
                points = 0;
                streak = 0;
                missedCount++;
            }
            
            // Update score and combo
            if (accuracy !== 'miss') {
                // Apply combo multiplier
                const comboMultiplier = 1 + combo * 0.1;
                points = Math.round(points * comboMultiplier);
                
                score += points;
                combo++;
                
                if (combo > highestCombo) {
                    highestCombo = combo;
                }
                
                // Increase game speed gradually
                if (combo % 5 === 0 && gameSpeed < 2.0) {
                    gameSpeed += 0.1;
                }
            } else {
                combo = 0;
            }
            
            // Mark beat as hit and remove it
            beatData.hit = true;
            beatData.element.style.opacity = '0.5';
            beatData.element.style.transform = 'scale(0.5)';
            
            setTimeout(() => {
                if (beatData.element.parentNode) {
                    beatData.element.remove();
                }
                
                // Remove beat from array
                const index = beats.indexOf(beatData);
                if (index > -1) {
                    beats.splice(index, 1);
                }
            }, 300);
            
            // Show accuracy feedback
            showAccuracyFeedback(accuracy);
            
            // Update UI
            updateUI();
            
            // Check if game should end
            if (missedCount >= MAX_MISSES) {
                endGame();
            }
        }
        
        // Handle missed beat
        function handleMiss(beatData) {
            if (beatData) {
                beatData.hit = true;
                beatData.element.style.opacity = '0.3';
                
                setTimeout(() => {
                    if (beatData.element.parentNode) {
                        beatData.element.remove();
                    }
                    
                    // Remove beat from array
                    const index = beats.indexOf(beatData);
                    if (index > -1) {
                        beats.splice(index, 1);
                    }
                }, 500);
            }
            
            combo = 0;
            streak = 0;
            missedCount++;
            
            showAccuracyFeedback('miss');
            updateUI();
            
            // Check if game should end
            if (missedCount >= MAX_MISSES) {
                endGame();
            }
        }
        
        // Show accuracy feedback
        function showAccuracyFeedback(accuracy) {
            accuracyDisplay.textContent = accuracy.toUpperCase();
            accuracyDisplay.className = `accuracy-display ${accuracy}`;
            accuracyDisplay.style.opacity = '1';
            
            setTimeout(() => {
                accuracyDisplay.style.opacity = '0';
            }, 500);
        }
        
        // Show visual effect for tap
        function showTapEffect(x, y) {
            const effect = document.createElement('div');
            effect.style.position = 'fixed';
            effect.style.left = `${x - 25}px`;
            effect.style.top = `${y - 25}px`;
            effect.style.width = '50px';
            effect.style.height = '50px';
            effect.style.borderRadius = '50%';
            effect.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            effect.style.pointerEvents = 'none';
            effect.style.zIndex = '10';
            
            document.body.appendChild(effect);
            
            // Animate effect
            effect.animate([
                { transform: 'scale(0.5)', opacity: 1 },
                { transform: 'scale(2)', opacity: 0 }
            ], {
                duration: 400,
                easing: 'ease-out'
            });
            
            setTimeout(() => {
                effect.remove();
            }, 400);
        }
        
        // Start the game
        function startGame() {
            if (gameActive) return;
            
            initGame();
            gameActive = true;
            
            // Start spawning beats
            setTimeout(createBeat, 1000);
            
            // Update button text
            startBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
            startBtn.onclick = pauseGame;
        }
        
        // Pause the game
        function pauseGame() {
            gameActive = false;
            
            // Update button text
            startBtn.innerHTML = '<i class="fas fa-play"></i> RESUME';
            startBtn.onclick = resumeGame;
        }
        
        // Resume the game
        function resumeGame() {
            gameActive = true;
            
            // Resume beat animations
            beats.forEach(beatData => {
                if (!beatData.hit) {
                    beatData.startTime = Date.now() - (Date.now() - beatData.startTime);
                    animateBeat(beatData);
                }
            });
            
            // Update button text
            startBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
            startBtn.onclick = pauseGame;
        }
        
        // End the game
        function endGame() {
            gameActive = false;
            
            // Show game over screen
            finalScoreElement.textContent = score;
            finalComboElement.textContent = highestCombo;
            gameOverScreen.classList.add('active');
        }
        
        // Event Listeners
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', initGame);
        playAgainBtn.addEventListener('click', initGame);
        
        // Tap/click listener for play area
        playArea.addEventListener('click', handleTap);
        
        // Touch support for mobile
        playArea.addEventListener('touchstart', function(event) {
            event.preventDefault();
            handleTap(event);
        });
        
        // Initialize game on load
        window.addEventListener('load', initGame);
        
        // Keyboard support for accessibility
        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space' || event.code === 'Enter') {
                event.preventDefault();
                
                if (!gameActive) {
                    startGame();
                } else {
                    // Simulate tap at target zone center
                    const targetRect = targetZone.getBoundingClientRect();
                    const fakeEvent = {
                        clientX: targetRect.left + targetRect.width/2,
                        clientY: targetRect.top + targetRect.height/2
                    };
                    handleTap(fakeEvent);
                }
            }
        });
