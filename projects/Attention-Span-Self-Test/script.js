
        // DOM Elements
        const startBtn = document.getElementById('startBtn');
        const visualIndicator = document.getElementById('visualIndicator');
        const timerElement = document.getElementById('timer');
        const reactionTimeElement = document.getElementById('reactionTime');
        const attemptCountElement = document.getElementById('attemptCount');
        const accuracyScoreElement = document.getElementById('accuracyScore');
        const resultSection = document.getElementById('resultSection');
        const finalScoreElement = document.getElementById('finalScore');
        const accuracyMeter = document.getElementById('accuracyMeter');
        const feedbackMessage = document.getElementById('feedbackMessage');
        const retryBtn = document.getElementById('retryBtn');
        const soundToggle = document.getElementById('soundToggle');
        const motionToggle = document.getElementById('motionToggle');
        const calmUIToggle = document.getElementById('calmUIToggle');
        
        // Test variables
        let testActive = false;
        let reactionStartTime = 0;
        let reactionEndTime = 0;
        let waitTimer = null;
        let maxWaitTime = 0;
        let attempts = 0;
        let prematureClicks = 0;
        let totalReactionTime = 0;
        let successfulAttempts = 0;
        
        // Sound effects
        const changeSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3');
        const successSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
        const errorSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3');
        
        // Set sound volume
        changeSound.volume = 0.3;
        successSound.volume = 0.3;
        errorSound.volume = 0.3;
        
        // Initialize
        function init() {
            updateStats();
            startBtn.addEventListener('click', startTest);
            visualIndicator.addEventListener('click', handleIndicatorClick);
            retryBtn.addEventListener('click', resetTest);
            
            // Settings event listeners
            soundToggle.addEventListener('change', toggleSound);
            motionToggle.addEventListener('change', toggleMotion);
            calmUIToggle.addEventListener('change', toggleCalmUI);
            
            // Apply initial calm UI setting
            if (calmUIToggle.checked) {
                document.body.style.backgroundColor = '#f8f9fa';
            }
        }
        
        // Start the test
        function startTest() {
            if (testActive) return;
            
            resetTestState();
            testActive = true;
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-hourglass-half"></i> Test Active - Wait for Change';
            startBtn.classList.remove('btn-primary');
            startBtn.classList.add('btn-secondary');
            
            // Random delay between 3 and 10 seconds
            const delay = Math.floor(Math.random() * 7000) + 3000;
            maxWaitTime = delay + 2000; // Give 2 seconds to react after change
            
            // Start countdown timer
            let seconds = Math.ceil(delay / 1000);
            timerElement.textContent = `Wait: ${seconds}s`;
            
            const countdown = setInterval(() => {
                seconds--;
                if (seconds > 0) {
                    timerElement.textContent = `Wait: ${seconds}s`;
                } else {
                    clearInterval(countdown);
                    timerElement.textContent = "Get ready...";
                }
            }, 1000);
            
            // Set timer for when the indicator will change
            waitTimer = setTimeout(() => {
                if (!testActive) return;
                
                // Change the indicator
                visualIndicator.classList.add('active');
                visualIndicator.querySelector('.indicator-text').textContent = 'CLICK NOW!';
                
                // Play sound if enabled
                if (soundToggle.checked) {
                    changeSound.currentTime = 0;
                    changeSound.play().catch(e => console.log("Audio play failed:", e));
                }
                
                // Start reaction time measurement
                reactionStartTime = Date.now();
                timerElement.textContent = "0.00s";
                
                // Start reaction timer
                let reactionSeconds = 0;
                const reactionTimer = setInterval(() => {
                    if (!testActive) {
                        clearInterval(reactionTimer);
                        return;
                    }
                    
                    reactionSeconds += 0.01;
                    timerElement.textContent = reactionSeconds.toFixed(2) + "s";
                    
                    // If user takes too long (more than 2 seconds), end attempt
                    if (reactionSeconds > 2) {
                        clearInterval(reactionTimer);
                        endAttempt(false, "Too slow! You took more than 2 seconds to react.");
                    }
                }, 10);
                
            }, delay);
        }
        
        // Handle indicator click
        function handleIndicatorClick() {
            if (!testActive) return;
            
            // If indicator is not active yet, it's a premature click
            if (!visualIndicator.classList.contains('active')) {
                prematureClicks++;
                endAttempt(false, "Too early! Wait for the color change.");
                return;
            }
            
            // Calculate reaction time
            reactionEndTime = Date.now();
            const reactionTime = reactionEndTime - reactionStartTime;
            
            // Check if reaction was reasonable (between 150ms and 2000ms)
            if (reactionTime < 150) {
                endAttempt(false, "Too fast! That might be a guess rather than a reaction.");
            } else if (reactionTime > 2000) {
                endAttempt(false, "Too slow! You took more than 2 seconds to react.");
            } else {
                // Successful attempt
                successfulAttempts++;
                totalReactionTime += reactionTime;
                endAttempt(true, `Good reaction! ${reactionTime}ms`);
            }
        }
        
        // End the current attempt
        function endAttempt(success, message) {
            clearTimeout(waitTimer);
            testActive = false;
            
            // Update attempts
            attempts++;
            
            // Reset indicator
            visualIndicator.classList.remove('active');
            visualIndicator.querySelector('.indicator-text').textContent = 'Wait for the change';
            
            // Update stats
            updateStats();
            
            // Show feedback
            timerElement.textContent = message;
            
            // Play sound if enabled
            if (soundToggle.checked) {
                if (success) {
                    successSound.currentTime = 0;
                    successSound.play().catch(e => console.log("Audio play failed:", e));
                } else {
                    errorSound.currentTime = 0;
                    errorSound.play().catch(e => console.log("Audio play failed:", e));
                }
            }
            
            // After 2 seconds, enable next test
            setTimeout(() => {
                startBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-play-circle"></i> Next Test';
                startBtn.classList.remove('btn-secondary');
                startBtn.classList.add('btn-primary');
                
                // After 5 attempts, show final results
                if (attempts >= 5) {
                    showFinalResults();
                } else {
                    timerElement.textContent = '--';
                }
            }, 2000);
        }
        
        // Update statistics display
        function updateStats() {
            attemptCountElement.textContent = attempts;
            
            if (successfulAttempts > 0) {
                const avgReactionTime = Math.round(totalReactionTime / successfulAttempts);
                reactionTimeElement.textContent = avgReactionTime;
                
                // Calculate accuracy score (lower reaction time = higher score, penalized by premature clicks)
                let accuracy = Math.max(0, 1000 - avgReactionTime);
                accuracy = accuracy * (successfulAttempts / attempts);
                accuracyScoreElement.textContent = Math.round(accuracy);
            } else {
                reactionTimeElement.textContent = '--';
                accuracyScoreElement.textContent = '--';
            }
        }
        
        // Show final results
        function showFinalResults() {
            // Calculate final score
            let score = 0;
            
            if (successfulAttempts > 0) {
                const avgReactionTime = Math.round(totalReactionTime / successfulAttempts);
                score = Math.max(0, 1000 - avgReactionTime);
                score = score * (successfulAttempts / attempts);
                score = Math.round(score * 10); // Scale up for display
            }
            
            // Determine feedback based on score
            let feedback = "";
            let meterPercentage = 0;
            
            if (score < 300) {
                feedback = "Your attention span results indicate difficulty with sustained focus. This is common in today's digital world with constant distractions. Try practicing mindfulness or reducing multitasking.";
                meterPercentage = 30;
            } else if (score < 600) {
                feedback = "You have an average attention span. Most people lose focus after 8-10 seconds on simple tasks. Consider taking regular breaks during long tasks to maintain focus.";
                meterPercentage = 60;
            } else if (score < 800) {
                feedback = "Good attention span! You're better than average at maintaining focus. Research shows the average attention span has decreased to about 8 seconds, but you're performing above that.";
                meterPercentage = 80;
            } else {
                feedback = "Excellent attention span! You have strong sustained focus abilities. This skill is valuable for deep work and complex tasks. Consider yourself in the top 20% for focused attention.";
                meterPercentage = 95;
            }
            
            // Update UI with results
            finalScoreElement.textContent = score;
            accuracyMeter.style.width = `${meterPercentage}%`;
            feedbackMessage.textContent = feedback;
            
            // Show result section
            resultSection.classList.add('active');
            
            // Scroll to results
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Reset the test
        function resetTest() {
            resetTestState();
            resultSection.classList.remove('active');
            timerElement.textContent = '--';
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play-circle"></i> Start Focus Test';
            startBtn.classList.remove('btn-secondary');
            startBtn.classList.add('btn-primary');
        }
        
        // Reset test state variables
        function resetTestState() {
            testActive = false;
            clearTimeout(waitTimer);
            reactionStartTime = 0;
            reactionEndTime = 0;
            attempts = 0;
            prematureClicks = 0;
            totalReactionTime = 0;
            successfulAttempts = 0;
            
            visualIndicator.classList.remove('active');
            visualIndicator.querySelector('.indicator-text').textContent = 'Wait for the change';
            
            updateStats();
        }
        
        // Toggle sound setting
        function toggleSound() {
            // Sound is already handled in the individual functions
            console.log("Sound setting changed:", soundToggle.checked);
        }
        
        // Toggle motion setting
        function toggleMotion() {
            if (motionToggle.checked) {
                document.documentElement.style.setProperty('--transition', 'none');
                // Remove pulse animation
                const pulseElement = document.querySelector('.pulse');
                if (pulseElement) {
                    pulseElement.style.animation = 'none';
                }
            } else {
                document.documentElement.style.setProperty('--transition', 'all 0.3s ease');
                // Restore pulse animation
                const pulseElement = document.querySelector('.pulse');
                if (pulseElement) {
                    pulseElement.style.animation = 'pulse 2s infinite';
                }
            }
        }
        
        // Toggle calm UI setting
        function toggleCalmUI() {
            if (calmUIToggle.checked) {
                document.body.style.backgroundColor = '#f8f9fa';
                document.querySelector('.indicator-container').style.backgroundColor = '#f1f3f5';
                document.querySelector('.control-panel').style.backgroundColor = '#f8f9fa';
            } else {
                document.body.style.backgroundColor = '#f0f5ff';
                document.querySelector('.indicator-container').style.backgroundColor = '#f8f9fa';
                document.querySelector('.control-panel').style.backgroundColor = '#f8f9fa';
            }
        }
        
        // Initialize the app
        window.addEventListener('DOMContentLoaded', init);