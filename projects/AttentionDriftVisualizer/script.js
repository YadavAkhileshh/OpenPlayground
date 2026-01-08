// Attention Drift Visualizer
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const startSessionBtn = document.getElementById('startSessionBtn');
    const pauseSessionBtn = document.getElementById('pauseSessionBtn');
    const endSessionBtn = document.getElementById('endSessionBtn');
    const durationButtons = document.querySelectorAll('.duration-btn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const showHistoryBtn = document.getElementById('showHistoryBtn');
    const historyModal = document.getElementById('historyModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const aboutBtn = document.getElementById('aboutBtn');
    const privacyBtn = document.getElementById('privacyBtn');
    const currentYearEl = document.getElementById('currentYear');
    
    // Stats Elements
    const currentFocusEl = document.getElementById('currentFocus');
    const sessionTimeEl = document.getElementById('sessionTime');
    const idleStatusEl = document.getElementById('idleStatus');
    const tabStatusEl = document.getElementById('tabStatus');
    const rhythmStatusEl = document.getElementById('rhythmStatus');
    const focusPercentageEl = document.getElementById('focusPercentage');
    const driftCountEl = document.getElementById('driftCount');
    const longestFocusEl = document.getElementById('longestFocus');
    const rhythmScoreEl = document.getElementById('rhythmScore');
    
    // Visualization Elements
    const focusTimelineEl = document.getElementById('focusTimeline');
    const meterFillEl = document.getElementById('meterFill');
    const meterIndicatorEl = document.getElementById('meterIndicator');
    const idleIndicatorEl = document.getElementById('idleIndicator');
    const tabIndicatorEl = document.getElementById('tabIndicator');
    const rhythmIndicatorEl = document.getElementById('rhythmIndicator');
    
    // Reflection Elements
    const reflectionStatusEl = document.getElementById('reflectionStatus');
    const reflectionMessageEl = document.getElementById('reflectionMessage');
    const actionSuggestionsEl = document.getElementById('actionSuggestions');
    
    // History Elements
    const historyListEl = document.getElementById('historyList');
    
    // App State
    let sessionState = {
        active: false,
        paused: false,
        startTime: null,
        elapsedSeconds: 0,
        duration: 5 * 60, // 5 minutes in seconds
        mode: 'normal'
    };
    
    let attentionData = {
        segments: [], // Array of focus segments
        currentSegment: null,
        driftEvents: 0,
        lastInteraction: Date.now(),
        lastTabChange: Date.now(),
        isPageVisible: true,
        focusScores: [], // Array of focus scores over time
        longestFocusStreak: 0,
        currentFocusStreak: 0,
        tabSwitches: 0
    };
    
    let sessionHistory = [];
    let timerInterval = null;
    let idleTimer = null;
    let segmentUpdateInterval = null;
    
    // Focus state definitions
    const FOCUS_STATES = {
        FOCUSED: { label: 'Focused', color: '#10b981', threshold: 10 },
        DRIFTING: { label: 'Drifting', color: '#f59e0b', threshold: 30 },
        DISTRACTED: { label: 'Distracted', color: '#ef4444', threshold: 60 }
    };
    
    // Initialize App
    function init() {
        loadHistory();
        setCurrentYear();
        setupEventListeners();
        setupInteractionTracking();
        setupVisibilityTracking();
        updateReflectionMessage();
    }
    
    // Load session history from localStorage
    function loadHistory() {
        const savedHistory = localStorage.getItem('attentionDriftHistory');
        if (savedHistory) {
            sessionHistory = JSON.parse(savedHistory);
        }
    }
    
    // Save session history to localStorage
    function saveHistory() {
        localStorage.setItem('attentionDriftHistory', JSON.stringify(sessionHistory));
    }
    
    // Set current year in footer
    function setCurrentYear() {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Session Controls
        startSessionBtn.addEventListener('click', startSession);
        pauseSessionBtn.addEventListener('click', togglePause);
        endSessionBtn.addEventListener('click', endSession);
        
        // Duration and Mode Selection
        durationButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                durationButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (!sessionState.active) {
                    sessionState.duration = parseInt(btn.dataset.minutes) * 60;
                    updateReflectionMessage();
                }
            });
        });
        
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                sessionState.mode = btn.dataset.mode;
            });
        });
        
        // History Modal
        showHistoryBtn.addEventListener('click', showHistory);
        closeModalBtn.addEventListener('click', closeModal);
        closeHistoryBtn.addEventListener('click', closeModal);
        clearHistoryBtn.addEventListener('click', clearHistory);
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateHistoryList(btn.dataset.filter);
            });
        });
        
        // Footer Buttons
        aboutBtn.addEventListener('click', showAbout);
        privacyBtn.addEventListener('click', showPrivacy);
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === historyModal) {
                closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sessionState.active) {
                endSession();
            }
            if (e.key === ' ' && e.target === document.body) {
                e.preventDefault();
                if (sessionState.active) {
                    togglePause();
                } else {
                    startSession();
                }
            }
        });
    }
    
    // Setup interaction tracking
    function setupInteractionTracking() {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                attentionData.lastInteraction = Date.now();
                updateIdleStatus();
            }, { passive: true });
        });
    }
    
    // Setup Page Visibility API tracking
    function setupVisibilityTracking() {
        document.addEventListener('visibilitychange', () => {
            attentionData.isPageVisible = !document.hidden;
            
            if (!attentionData.isPageVisible) {
                attentionData.lastTabChange = Date.now();
                attentionData.tabSwitches++;
                updateTabStatus();
                recordDriftEvent('tab_switch');
            }
            
            updateTabIndicator();
        });
    }
    
    // Start a new session
    function startSession() {
        if (sessionState.active) return;
        
        // Reset state
        resetSessionState();
        
        // Update UI
        sessionState.active = true;
        sessionState.startTime = Date.now();
        startSessionBtn.disabled = true;
        pauseSessionBtn.disabled = false;
        endSessionBtn.disabled = false;
        currentFocusEl.textContent = 'Calm';
        reflectionStatusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Session in progress';
        
        // Start timers
        timerInterval = setInterval(updateTimer, 1000);
        segmentUpdateInterval = setInterval(updateFocusSegment, 1000);
        
        // Start idle monitoring
        startIdleMonitoring();
        
        // Initialize first focus segment
        startNewFocusSegment();
        
        // Update visualization
        updateVisualization();
        updateIndicators();
        
        console.log('Session started');
    }
    
    // Toggle pause state
    function togglePause() {
        if (!sessionState.active) return;
        
        sessionState.paused = !sessionState.paused;
        
        if (sessionState.paused) {
            clearInterval(timerInterval);
            clearInterval(segmentUpdateInterval);
            pauseSessionBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            reflectionStatusEl.innerHTML = '<i class="fas fa-pause"></i> Session paused';
        } else {
            timerInterval = setInterval(updateTimer, 1000);
            segmentUpdateInterval = setInterval(updateFocusSegment, 1000);
            pauseSessionBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            reflectionStatusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Session in progress';
        }
    }
    
    // End current session
    function endSession() {
        if (!sessionState.active) return;
        
        // Stop timers
        clearInterval(timerInterval);
        clearInterval(segmentUpdateInterval);
        stopIdleMonitoring();
        
        // Complete current segment
        if (attentionData.currentSegment) {
            attentionData.currentSegment.endTime = Date.now();
            attentionData.currentSegment.duration = Math.floor((attentionData.currentSegment.endTime - attentionData.currentSegment.startTime) / 1000);
            attentionData.segments.push(attentionData.currentSegment);
        }
        
        // Calculate session metrics
        const sessionMetrics = calculateSessionMetrics();
        
        // Save to history
        const sessionRecord = {
            id: Date.now(),
            date: new Date().toISOString(),
            duration: sessionState.elapsedSeconds,
            mode: sessionState.mode,
            metrics: sessionMetrics,
            segments: attentionData.segments
        };
        
        sessionHistory.unshift(sessionRecord);
        if (sessionHistory.length > 50) {
            sessionHistory = sessionHistory.slice(0, 50);
        }
        saveHistory();
        
        // Reset state
        sessionState.active = false;
        sessionState.paused = false;
        startSessionBtn.disabled = false;
        pauseSessionBtn.disabled = true;
        endSessionBtn.disabled = true;
        
        // Show results
        showSessionResults(sessionMetrics);
        
        console.log('Session ended', sessionMetrics);
    }
    
    // Reset session state
    function resetSessionState() {
        sessionState.elapsedSeconds = 0;
        
        attentionData = {
            segments: [],
            currentSegment: null,
            driftEvents: 0,
            lastInteraction: Date.now(),
            lastTabChange: Date.now(),
            isPageVisible: true,
            focusScores: [],
            longestFocusStreak: 0,
            currentFocusStreak: 0,
            tabSwitches: 0
        };
        
        focusTimelineEl.innerHTML = '';
        updateSessionTimeDisplay();
    }
    
    // Update timer
    function updateTimer() {
        if (!sessionState.active || sessionState.paused) return;
        
        sessionState.elapsedSeconds++;
        
        // Check if session duration reached
        if (sessionState.elapsedSeconds >= sessionState.duration) {
            endSession();
            return;
        }
        
        updateSessionTimeDisplay();
        updateIdleStatus();
        updateFocusAnalysis();
    }
    
    // Update session time display
    function updateSessionTimeDisplay() {
        const minutes = Math.floor(sessionState.elapsedSeconds / 60);
        const seconds = sessionState.elapsedSeconds % 60;
        sessionTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Start idle monitoring
    function startIdleMonitoring() {
        idleTimer = setInterval(() => {
            const idleTime = Math.floor((Date.now() - attentionData.lastInteraction) / 1000);
            
            if (idleTime > 10 && attentionData.currentSegment?.state !== FOCUS_STATES.DRIFTING.label) {
                recordDriftEvent('idle');
            }
            
            if (idleTime > 30 && attentionData.currentSegment?.state !== FOCUS_STATES.DISTRACTED.label) {
                recordDriftEvent('idle_extended');
            }
        }, 1000);
    }
    
    // Stop idle monitoring
    function stopIdleMonitoring() {
        if (idleTimer) {
            clearInterval(idleTimer);
        }
    }
    
    // Update idle status display
    function updateIdleStatus() {
        const idleTime = Math.floor((Date.now() - attentionData.lastInteraction) / 1000);
        
        if (idleTime < 5) {
            idleStatusEl.textContent = 'Active now';
            idleIndicatorEl.classList.add('active');
        } else if (idleTime < 15) {
            idleStatusEl.textContent = 'Brief pause';
            idleIndicatorEl.classList.remove('active');
        } else {
            idleStatusEl.textContent = 'Idle for ' + idleTime + 's';
            idleIndicatorEl.classList.remove('active');
        }
    }
    
    // Update tab status display
    function updateTabStatus() {
        if (attentionData.isPageVisible) {
            tabStatusEl.textContent = 'On this page';
            tabIndicatorEl.classList.add('active');
        } else {
            const timeAway = Math.floor((Date.now() - attentionData.lastTabChange) / 1000);
            tabStatusEl.textContent = 'Away for ' + timeAway + 's';
            tabIndicatorEl.classList.remove('active');
        }
    }
    
    // Update tab indicator
    function updateTabIndicator() {
        updateTabStatus();
    }
    
    // Record a drift event
    function recordDriftEvent(type) {
        attentionData.driftEvents++;
        driftCountEl.textContent = attentionData.driftEvents;
        
        // Update current focus segment state based on drift
        if (attentionData.currentSegment) {
            const idleTime = Math.floor((Date.now() - attentionData.lastInteraction) / 1000);
            
            if (idleTime > FOCUS_STATES.DISTRACTED.threshold) {
                updateFocusSegmentState(FOCUS_STATES.DISTRACTED);
            } else if (idleTime > FOCUS_STATES.DRIFTING.threshold) {
                updateFocusSegmentState(FOCUS_STATES.DRIFTING);
            }
        }
        
        // Update indicators
        updateIndicators();
    }
    
    // Start a new focus segment
    function startNewFocusSegment() {
        if (attentionData.currentSegment) {
            attentionData.currentSegment.endTime = Date.now();
            attentionData.currentSegment.duration = Math.floor((attentionData.currentSegment.endTime - attentionData.currentSegment.startTime) / 1000);
            attentionData.segments.push(attentionData.currentSegment);
        }
        
        const idleTime = Math.floor((Date.now() - attentionData.lastInteraction) / 1000);
        let initialState = FOCUS_STATES.FOCUSED;
        
        if (idleTime > FOCUS_STATES.DISTRACTED.threshold) {
            initialState = FOCUS_STATES.DISTRACTED;
        } else if (idleTime > FOCUS_STATES.DRIFTING.threshold) {
            initialState = FOCUS_STATES.DRIFTING;
        }
        
        attentionData.currentSegment = {
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            state: initialState.label,
            color: initialState.color
        };
    }
    
    // Update current focus segment
    function updateFocusSegment() {
        if (!sessionState.active || sessionState.paused || !attentionData.currentSegment) return;
        
        const idleTime = Math.floor((Date.now() - attentionData.lastInteraction) / 1000);
        const segmentDuration = Math.floor((Date.now() - attentionData.currentSegment.startTime) / 1000);
        
        // Update segment duration
        attentionData.currentSegment.duration = segmentDuration;
        
        // Update segment state based on idle time
        let newState = FOCUS_STATES.FOCUSED;
        if (idleTime > FOCUS_STATES.DISTRACTED.threshold) {
            newState = FOCUS_STATES.DISTRACTED;
        } else if (idleTime > FOCUS_STATES.DRIFTING.threshold) {
            newState = FOCUS_STATES.DRIFTING;
        }
        
        // If state changed, start new segment
        if (newState.label !== attentionData.currentSegment.state && segmentDuration > 2) {
            updateFocusSegmentState(newState);
        }
        
        // Update focus streak
        if (newState.label === FOCUS_STATES.FOCUSED.label) {
            attentionData.currentFocusStreak++;
            if (attentionData.currentFocusStreak > attentionData.longestFocusStreak) {
                attentionData.longestFocusStreak = attentionData.currentFocusStreak;
                longestFocusEl.textContent = attentionData.longestFocusStreak + 's';
            }
        } else {
            attentionData.currentFocusStreak = 0;
        }
        
        // Record focus score (0-100)
        const focusScore = calculateFocusScore(idleTime, attentionData.isPageVisible);
        attentionData.focusScores.push({
            timestamp: Date.now(),
            score: focusScore
        });
        
        // Update visualization
        updateVisualization();
        updateIndicators();
    }
    
    // Update focus segment state
    function updateFocusSegmentState(newState) {
        // End current segment
        if (attentionData.currentSegment) {
            attentionData.currentSegment.endTime = Date.now();
            attentionData.currentSegment.duration = Math.floor((attentionData.currentSegment.endTime - attentionData.currentSegment.startTime) / 1000);
            attentionData.segments.push(attentionData.currentSegment);
        }
        
        // Start new segment with new state
        attentionData.currentSegment = {
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            state: newState.label,
            color: newState.color
        };
    }
    
    // Calculate focus score (0-100)
    function calculateFocusScore(idleTime, isPageVisible) {
        if (!isPageVisible) return 0;
        
        if (idleTime <= 5) return 100;
        if (idleTime <= 15) return 70;
        if (idleTime <= 30) return 40;
        return 10;
    }
    
    // Update focus analysis
    function updateFocusAnalysis() {
        if (attentionData.focusScores.length === 0) return;
        
        // Calculate average focus score
        const recentScores = attentionData.focusScores.slice(-10);
        const avgScore = recentScores.reduce((sum, item) => sum + item.score, 0) / recentScores.length;
        
        // Update focus percentage
        const focusPercentage = Math.round(avgScore);
        focusPercentageEl.textContent = focusPercentage + '%';
        
        // Update meter
        updateFocusMeter(focusPercentage);
        
        // Update current focus label
        if (focusPercentage >= 80) {
            currentFocusEl.textContent = 'Deep Focus';
        } else if (focusPercentage >= 50) {
            currentFocusEl.textContent = 'Focused';
        } else if (focusPercentage >= 20) {
            currentFocusEl.textContent = 'Drifting';
        } else {
            currentFocusEl.textContent = 'Distracted';
        }
        
        // Update rhythm status
        updateRhythmStatus();
    }
    
    // Update focus meter
    function updateFocusMeter(percentage) {
        // Position indicator
        const position = percentage / 100;
        meterIndicatorEl.style.left = `${position * 100}%`;
        
        // Update fill width
        meterFillEl.style.width = `${100 - percentage}%`;
        
        // Update fill color based on focus
        if (percentage >= 80) {
            meterFillEl.style.background = 'rgba(16, 185, 129, 0.3)';
        } else if (percentage >= 50) {
            meterFillEl.style.background = 'rgba(245, 158, 11, 0.3)';
        } else {
            meterFillEl.style.background = 'rgba(239, 68, 68, 0.3)';
        }
    }
    
    // Update rhythm status
    function updateRhythmStatus() {
        if (attentionData.focusScores.length < 5) {
            rhythmStatusEl.textContent = 'Establishing...';
            rhythmIndicatorEl.classList.remove('active');
            return;
        }
        
        const recentScores = attentionData.focusScores.slice(-10).map(s => s.score);
        const variance = calculateVariance(recentScores);
        
        if (variance < 100) {
            rhythmStatusEl.textContent = 'Steady';
            rhythmIndicatorEl.classList.add('active');
        } else if (variance < 400) {
            rhythmStatusEl.textContent = 'Variable';
            rhythmIndicatorEl.classList.remove('active');
        } else {
            rhythmStatusEl.textContent = 'Erratic';
            rhythmIndicatorEl.classList.remove('active');
        }
        
        // Update rhythm score
        const rhythmScore = Math.max(0, 100 - Math.round(variance / 10));
        rhythmScoreEl.textContent = rhythmScore;
    }
    
    // Calculate variance of an array
    function calculateVariance(array) {
        if (array.length < 2) return 0;
        const mean = array.reduce((a, b) => a + b) / array.length;
        return array.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / array.length;
    }
    
    // Update visualization
    function updateVisualization() {
        if (!attentionData.currentSegment) return;
        
        // Clear timeline
        focusTimelineEl.innerHTML = '';
        
        // Calculate total duration of segments
        const totalDuration = attentionData.segments.reduce((sum, seg) => sum + seg.duration, 0) + 
                             attentionData.currentSegment.duration;
        
        // Calculate pixels per second
        const containerWidth = focusTimelineEl.clientWidth - 40;
        const pixelsPerSecond = containerWidth / Math.max(30, totalDuration);
        
        let currentX = 20;
        
        // Render past segments
        attentionData.segments.forEach(segment => {
            const width = segment.duration * pixelsPerSecond;
            if (width > 1) {
                const segmentEl = document.createElement('div');
                segmentEl.className = 'timeline-segment';
                segmentEl.style.left = `${currentX}px`;
                segmentEl.style.width = `${width}px`;
                segmentEl.style.backgroundColor = segment.color;
                segmentEl.title = `${segment.state}: ${segment.duration}s`;
                focusTimelineEl.appendChild(segmentEl);
                currentX += width;
            }
        });
        
        // Render current segment
        const currentWidth = attentionData.currentSegment.duration * pixelsPerSecond;
        if (currentWidth > 1) {
            const currentSegmentEl = document.createElement('div');
            currentSegmentEl.className = 'timeline-segment pulse';
            currentSegmentEl.style.left = `${currentX}px`;
            currentSegmentEl.style.width = `${currentWidth}px`;
            currentSegmentEl.style.backgroundColor = attentionData.currentSegment.color;
            currentSegmentEl.title = `${attentionData.currentSegment.state}: ${attentionData.currentSegment.duration}s`;
            focusTimelineEl.appendChild(currentSegmentEl);
        }
    }
    
    // Update indicators
    function updateIndicators() {
        updateIdleStatus();
        updateTabStatus();
    }
    
    // Calculate session metrics
    function calculateSessionMetrics() {
        const totalSegments = attentionData.segments.length + (attentionData.currentSegment ? 1 : 0);
        const focusedSegments = attentionData.segments.filter(s => s.state === FOCUS_STATES.FOCUSED.label).length;
        const focusedTime = attentionData.segments.filter(s => s.state === FOCUS_STATES.FOCUSED.label)
            .reduce((sum, seg) => sum + seg.duration, 0);
        
        return {
            focusPercentage: Math.round((focusedTime / sessionState.elapsedSeconds) * 100),
            driftEvents: attentionData.driftEvents,
            longestFocus: attentionData.longestFocusStreak,
            avgFocusScore: attentionData.focusScores.length > 0 ? 
                Math.round(attentionData.focusScores.reduce((sum, s) => sum + s.score, 0) / attentionData.focusScores.length) : 0,
            tabSwitches: attentionData.tabSwitches,
            totalSegments: totalSegments,
            focusedSegments: focusedSegments
        };
    }
    
    // Show session results
    function showSessionResults(metrics) {
        // Update insight cards
        focusPercentageEl.textContent = metrics.focusPercentage + '%';
        driftCountEl.textContent = metrics.driftEvents;
        longestFocusEl.textContent = metrics.longestFocus + 's';
        rhythmScoreEl.textContent = metrics.avgFocusScore;
        
        // Update reflection message
        reflectionStatusEl.innerHTML = '<i class="fas fa-check-circle"></i> Session complete';
        
        // Generate personalized reflection
        let reflection = {};
        
        if (metrics.focusPercentage >= 80) {
            reflection = {
                icon: 'fas fa-mountain',
                title: 'Deep Focus Achieved',
                text: 'You maintained strong focus throughout the session. Your attention was steady and consistent.',
                tip: 'Notice what environment or mindset helped you maintain this focus.'
            };
        } else if (metrics.focusPercentage >= 60) {
            reflection = {
                icon: 'fas fa-chart-line',
                title: 'Balanced Attention',
                text: 'Your focus ebbed and flowed naturally. This is a healthy, sustainable attention pattern.',
                tip: 'The natural rhythm of focus and rest can enhance creativity and problem-solving.'
            };
        } else if (metrics.focusPercentage >= 40) {
            reflection = {
                icon: 'fas fa-water',
                title: 'Gentle Drift Pattern',
                text: 'Your attention drifted occasionally. This is normal—our brains are designed to scan and refocus.',
                tip: 'When you notice drift, gently acknowledge it and return to your task without judgment.'
            };
        } else {
            reflection = {
                icon: 'fas fa-cloud',
                title: 'Scattered Attention',
                text: 'Your attention was frequently scattered. This happens to everyone, especially with digital distractions.',
                tip: 'Consider taking a short break or changing your environment if distraction persists.'
            };
        }
        
        // Update reflection message
        reflectionMessageEl.innerHTML = `
            <div class="message-icon">
                <i class="${reflection.icon}"></i>
            </div>
            <div class="message-content">
                <h3>${reflection.title}</h3>
                <p>${reflection.text}</p>
                <p class="tip">
                    <i class="fas fa-lightbulb"></i>
                    ${reflection.tip}
                </p>
            </div>
        `;
        
        // Update suggestions based on metrics
        let suggestions = [];
        
        if (metrics.tabSwitches > 5) {
            suggestions.push('Consider closing unused browser tabs');
        }
        
        if (metrics.longestFocus < 60) {
            suggestions.push('Try a 5-minute timer for focused bursts');
        }
        
        if (metrics.driftEvents > 10) {
            suggestions.push('Place your phone out of sight during focus sessions');
        }
        
        // Update suggestions if we have specific ones
        if (suggestions.length > 0) {
            actionSuggestionsEl.innerHTML = `
                <h3><i class="fas fa-hands-helping"></i> Gentle Suggestions</h3>
                <div class="suggestions-list">
                    ${suggestions.map(s => `
                        <div class="suggestion">
                            <i class="fas fa-lightbulb"></i>
                            <p>${s}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    
    // Update reflection message for idle state
    function updateReflectionMessage() {
        if (sessionState.active) return;
        
        const minutes = sessionState.duration / 60;
        reflectionMessageEl.innerHTML = `
            <div class="message-icon">
                <i class="fas fa-seedling"></i>
            </div>
            <div class="message-content">
                <h3>Begin Your Awareness Journey</h3>
                <p>Start a ${minutes}-minute session to observe your natural attention patterns. This isn't about productivity—it's about awareness.</p>
                <p class="tip">
                    <i class="fas fa-lightbulb"></i>
                    Notice when your focus naturally ebbs and flows without judgment.
                </p>
            </div>
        `;
    }
    
    // Show history modal
    function showHistory() {
        updateHistoryList('all');
        historyModal.style.display = 'flex';
    }
    
    // Close modal
    function closeModal() {
        historyModal.style.display = 'none';
    }
    
    // Update history list
    function updateHistoryList(filter) {
        historyListEl.innerHTML = '';
        
        let filteredHistory = sessionHistory;
        const now = new Date();
        
        if (filter === 'today') {
            const today = now.toISOString().split('T')[0];
            filteredHistory = sessionHistory.filter(s => s.date.split('T')[0] === today);
        } else if (filter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredHistory = sessionHistory.filter(s => new Date(s.date) > weekAgo);
        }
        
        if (filteredHistory.length === 0) {
            historyListEl.innerHTML = '<p class="no-history">No sessions found for this filter.</p>';
            return;
        }
        
        filteredHistory.forEach(session => {
            const date = new Date(session.date);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const durationMinutes = Math.floor(session.duration / 60);
            const durationSeconds = session.duration % 60;
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            let focusLevel = '';
            if (session.metrics.focusPercentage >= 80) focusLevel = 'Deep';
            else if (session.metrics.focusPercentage >= 60) focusLevel = 'Focused';
            else if (session.metrics.focusPercentage >= 40) focusLevel = 'Drifting';
            else focusLevel = 'Scattered';
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-date">${date.toLocaleDateString()} ${timeString}</div>
                    <div class="history-mode">${session.mode === 'deep' ? 'Deep Work' : 'Normal'}</div>
                </div>
                <div class="history-stats">
                    <span class="focus-level ${focusLevel.toLowerCase()}">${focusLevel}</span>
                    <span class="duration">${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}</span>
                </div>
                <div class="history-metrics">
                    <span class="focus-percentage">${session.metrics.focusPercentage}%</span>
                    <span class="drift-count">${session.metrics.driftEvents} drifts</span>
                </div>
            `;
            
            historyListEl.appendChild(historyItem);
        });
    }
    
    // Clear history
    function clearHistory() {
        if (confirm('Are you sure you want to clear all session history? This cannot be undone.')) {
            sessionHistory = [];
            saveHistory();
            updateHistoryList('all');
        }
    }
    
    // Show about information
    function showAbout(e) {
        e.preventDefault();
        alert('Attention Drift Visualizer\n\nThis tool helps you observe your natural attention patterns without judgment or pressure. It visualizes when your focus drifts based on interaction patterns and tab switches.\n\nNo data is sent to servers. All information stays in your browser.');
    }
    
    // Show privacy information
    function showPrivacy(e) {
        e.preventDefault();
        alert('Privacy Information\n\n• All data is stored locally in your browser\n• No information is sent to any server\n• You can clear your history at any time\n• No tracking or analytics\n• This is purely a self-awareness tool');
    }
    
    // Initialize the app
    init();
});