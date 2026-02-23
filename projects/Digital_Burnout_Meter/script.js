
        // Session Configuration
        const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
        const IDLE_THRESHOLD = 5000; // 5 seconds of inactivity
        
        // State variables
        let sessionStartTime = null;
        let sessionTimer = null;
        let lastInteractionTime = null;
        let activeTime = 0;
        let idleTime = 0;
        let isSessionActive = false;
        let isTabActive = true;
        
        // Interaction counters
        let clickCount = 0;
        let scrollCount = 0;
        let tabSwitchCount = 0;
        
        // DOM Elements
        const startBtn = document.getElementById('start-btn');
        const resetBtn = document.getElementById('reset-btn');
        const sessionTimeEl = document.getElementById('session-time');
        const sessionProgressEl = document.getElementById('session-progress');
        const activeProgressEl = document.getElementById('active-progress');
        const activePercentageEl = document.getElementById('active-percentage');
        const clicksCountEl = document.getElementById('clicks-count');
        const scrollsCountEl = document.getElementById('scrolls-count');
        const tabSwitchesCountEl = document.getElementById('tab-switches-count');
        const burnoutScoreEl = document.getElementById('burnout-score');
        const burnoutLevelEl = document.getElementById('burnout-level');
        const burnoutDescriptionEl = document.getElementById('burnout-description');
        const sessionStatusEl = document.getElementById('session-status');
        const loadingMessageEl = document.getElementById('loading-message');
        const finalMessageEl = document.getElementById('final-message');
        const reflectionMessageEl = document.getElementById('reflection-message');
        
        // Burnout messages based on score
        const burnoutMessages = [
            { threshold: 20, level: "Minimal", description: "Your digital activity is calm and balanced.", message: "You're maintaining a healthy digital balance. Keep up the mindful interaction." },
            { threshold: 40, level: "Low", description: "You're engaging moderately with digital content.", message: "You're engaging with digital content at a moderate pace. Consider taking brief breaks to stretch or look away from the screen." },
            { threshold: 60, level: "Moderate", description: "You're showing signs of heightened digital activity.", message: "You were fairly active during this session. A short walk or some deep breathing could help reset your focus." },
            { threshold: 80, level: "High", description: "You're interacting intensely with digital content.", message: "You were highly active during this session. Consider taking a 5-10 minute break away from screens to recharge." },
            { threshold: 100, level: "Intense", description: "You're experiencing intense digital interaction patterns.", message: "Your interaction patterns suggest digital fatigue. A longer break or engaging in a non-screen activity would be beneficial." }
        ];
        
        // Initialize event listeners
        function init() {
            // Start session button
            startBtn.addEventListener('click', startSession);
            
            // Reset button
            resetBtn.addEventListener('click', resetSession);
            
            // Track clicks
            document.addEventListener('click', trackClick);
            
            // Track scrolls (with debouncing to avoid too many events)
            let scrollTimeout;
            document.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(trackScroll, 200);
            });
            
            // Track tab visibility changes
            document.addEventListener('visibilitychange', trackTabVisibility);
            
            // Update UI initially
            updateUI();
        }
        
        // Start a new session
        function startSession() {
            if (isSessionActive) return;
            
            // Reset all counters
            resetCounters();
            
            // Set session start time
            sessionStartTime = Date.now();
            lastInteractionTime = sessionStartTime;
            
            // Start session timer
            sessionTimer = setInterval(updateSession, 1000);
            
            // Update state
            isSessionActive = true;
            startBtn.disabled = true;
            resetBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-pause"></i> Session Active';
            
            // Show loading message
            loadingMessageEl.classList.remove('hidden');
            finalMessageEl.classList.add('hidden');
            
            // Set initial status
            sessionStatusEl.textContent = "Session active - tracking interactions...";
            
            // Update UI
            updateUI();
        }
        
        // Reset the session
        function resetSession() {
            // Clear timer
            clearInterval(sessionTimer);
            
            // Reset state
            isSessionActive = false;
            startBtn.disabled = false;
            resetBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Session';
            
            // Update status
            sessionStatusEl.textContent = "Session reset. Click 'Start Session' to begin.";
            
            // Show final message
            loadingMessageEl.classList.add('hidden');
            finalMessageEl.classList.remove('hidden');
            
            // Reset counters
            resetCounters();
            updateUI();
        }
        
        // Reset all counters and state
        function resetCounters() {
            clickCount = 0;
            scrollCount = 0;
            tabSwitchCount = 0;
            activeTime = 0;
            idleTime = 0;
            sessionStartTime = null;
            lastInteractionTime = null;
        }
        
        // Update session progress and calculations
        function updateSession() {
            if (!isSessionActive || !sessionStartTime) return;
            
            const currentTime = Date.now();
            const elapsedTime = currentTime - sessionStartTime;
            const sessionProgress = Math.min(elapsedTime / SESSION_DURATION * 100, 100);
            
            // Check if user is active (interacted within idle threshold)
            const timeSinceLastInteraction = currentTime - lastInteractionTime;
            const isCurrentlyActive = timeSinceLastInteraction < IDLE_THRESHOLD && isTabActive;
            
            // Update active and idle time
            if (isCurrentlyActive) {
                activeTime += 1000; // Add 1 second (update interval)
            } else {
                idleTime += 1000; // Add 1 second (update interval)
            }
            
            // Calculate active percentage
            const totalTime = activeTime + idleTime;
            const activePercentage = totalTime > 0 ? (activeTime / totalTime) * 100 : 0;
            
            // Update session time display
            const elapsedMinutes = Math.floor(elapsedTime / 60000);
            const elapsedSeconds = Math.floor((elapsedTime % 60000) / 1000);
            const totalMinutes = Math.floor(SESSION_DURATION / 60000);
            const totalSeconds = Math.floor((SESSION_DURATION % 60000) / 1000);
            
            sessionTimeEl.textContent = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
            
            // Update progress bars
            sessionProgressEl.style.width = `${sessionProgress}%`;
            activeProgressEl.style.width = `${activePercentage}%`;
            activePercentageEl.textContent = `${Math.round(activePercentage)}% Active`;
            
            // Update status message
            if (!isTabActive) {
                sessionStatusEl.textContent = "Tab inactive - session paused";
            } else if (!isCurrentlyActive) {
                sessionStatusEl.textContent = "Idle - no recent interactions";
            } else {
                sessionStatusEl.textContent = "Active - tracking interactions";
            }
            
            // Calculate and update burnout score
            updateBurnoutScore();
            
            // Check if session is complete
            if (elapsedTime >= SESSION_DURATION) {
                endSession();
            }
            
            updateUI();
        }
        
        // Calculate and update burnout score
        function updateBurnoutScore() {
            if (!isSessionActive || activeTime + idleTime === 0) {
                burnoutScoreEl.textContent = "0";
                burnoutLevelEl.textContent = "Minimal";
                burnoutDescriptionEl.textContent = "Your digital activity is calm and balanced.";
                return;
            }
            
            // Calculate score based on:
            // 1. Active time percentage (higher = more burnout potential)
            // 2. Interaction frequency (clicks, scrolls, tab switches per minute)
            const totalTimeMinutes = (activeTime + idleTime) / 60000;
            const activePercentage = activeTime / (activeTime + idleTime);
            
            // Calculate interaction rate (per minute)
            const interactionRate = (clickCount + scrollCount + tabSwitchCount) / Math.max(totalTimeMinutes, 0.1);
            
            // Normalize interaction rate (0-1 scale, assuming >10 per minute is high)
            const normalizedInteractionRate = Math.min(interactionRate / 10, 1);
            
            // Calculate final score (0-100)
            // Weight: 60% active percentage, 40% interaction rate
            const burnoutScore = Math.min(
                Math.round((activePercentage * 60) + (normalizedInteractionRate * 40)),
                100
            );
            
            // Update burnout score display
            burnoutScoreEl.textContent = burnoutScore;
            
            // Find matching burnout level and description
            let matchedLevel = burnoutMessages[0];
            for (const level of burnoutMessages) {
                if (burnoutScore <= level.threshold) {
                    matchedLevel = level;
                    break;
                }
            }
            
            // Update burnout level and description
            burnoutLevelEl.textContent = matchedLevel.level;
            burnoutDescriptionEl.textContent = matchedLevel.description;
            
            // Update reflection message if session is complete
            if (!isSessionActive && finalMessageEl.classList.contains('hidden') === false) {
                finalMessageEl.textContent = matchedLevel.message;
            }
        }
        
        // End the current session
        function endSession() {
            clearInterval(sessionTimer);
            isSessionActive = false;
            startBtn.disabled = false;
            resetBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-redo"></i> Restart Session';
            
            // Update final message with reflection
            loadingMessageEl.classList.add('hidden');
            finalMessageEl.classList.remove('hidden');
            
            // Get appropriate message based on final burnout score
            const burnoutScore = parseInt(burnoutScoreEl.textContent) || 0;
            let matchedMessage = burnoutMessages[0].message;
            
            for (const level of burnoutMessages) {
                if (burnoutScore <= level.threshold) {
                    matchedMessage = level.message;
                    break;
                }
            }
            
            finalMessageEl.textContent = matchedMessage;
            sessionStatusEl.textContent = "Session complete. Review your results above.";
        }
        
        // Track click events
        function trackClick() {
            if (!isSessionActive || !isTabActive) return;
            
            clickCount++;
            lastInteractionTime = Date.now();
            updateUI();
        }
        
        // Track scroll events
        function trackScroll() {
            if (!isSessionActive || !isTabActive) return;
            
            scrollCount++;
            lastInteractionTime = Date.now();
            updateUI();
        }
        
        // Track tab visibility changes
        function trackTabVisibility() {
            if (document.hidden) {
                // Tab became inactive
                isTabActive = false;
                tabSwitchCount++;
            } else {
                // Tab became active
                isTabActive = true;
                lastInteractionTime = Date.now();
            }
            updateUI();
        }
        
        // Update UI elements with current state
        function updateUI() {
            clicksCountEl.textContent = clickCount;
            scrollsCountEl.textContent = scrollCount;
            tabSwitchesCountEl.textContent = tabSwitchCount;
            
            // Update burnout score in real-time
            if (isSessionActive) {
                updateBurnoutScore();
            }
        }
        
        // Initialize the application
        window.addEventListener('DOMContentLoaded', init);
