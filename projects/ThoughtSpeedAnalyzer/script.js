// Thought Speed Analyzer
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const thoughtInput = document.getElementById('thoughtInput');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const timeCount = document.getElementById('timeCount');
    const speedValue = document.getElementById('speedValue');
    const speedBar = document.getElementById('speedBar');
    const speedLabel = document.getElementById('speedLabel');
    const pauseValue = document.getElementById('pauseValue');
    const pauseBar = document.getElementById('pauseBar');
    const pauseLabel = document.getElementById('pauseLabel');
    const rhythmValue = document.getElementById('rhythmValue');
    const rhythmBar = document.getElementById('rhythmBar');
    const rhythmLabel = document.getElementById('rhythmLabel');
    const analysisSummary = document.getElementById('analysisSummary');
    const keystrokeRate = document.getElementById('keystrokeRate');
    const avgPause = document.getElementById('avgPause');
    const consistency = document.getElementById('consistency');
    const resetBtn = document.getElementById('resetBtn');

    // Analysis variables
    let startTime = null;
    let lastKeyTime = null;
    let pauseStartTime = null;
    let keystrokes = 0;
    let pauseDurations = [];
    let keystrokeIntervals = [];
    let isPaused = false;
    let timerInterval = null;
    let elapsedSeconds = 0;
    let lastWordCount = 0;

    // Initialize the analyzer
    function initAnalyzer() {
        // Reset all variables
        startTime = null;
        lastKeyTime = null;
        pauseStartTime = null;
        keystrokes = 0;
        pauseDurations = [];
        keystrokeIntervals = [];
        isPaused = false;
        elapsedSeconds = 0;
        lastWordCount = 0;
        
        // Reset UI
        charCount.textContent = '0';
        wordCount.textContent = '0';
        timeCount.textContent = '0s';
        speedValue.textContent = '--';
        speedBar.style.width = '0%';
        speedLabel.textContent = 'Not enough data';
        pauseValue.textContent = '--';
        pauseBar.style.width = '0%';
        pauseLabel.textContent = 'Not enough data';
        rhythmValue.textContent = '--';
        rhythmBar.style.width = '0%';
        rhythmLabel.textContent = 'Not enough data';
        analysisSummary.textContent = 'Start typing to see your thought speed analysis. The system will measure your typing patterns, pauses between words, and navigation behavior to estimate your cognitive tempo.';
        keystrokeRate.textContent = '--';
        avgPause.textContent = '--';
        consistency.textContent = '--';
        
        // Clear any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Reset textarea
        thoughtInput.value = '';
    }

    // Start the analysis timer
    function startTimer() {
        if (!timerInterval) {
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000);
        }
    }

    // Update the timer display
    function updateTimer() {
        elapsedSeconds++;
        timeCount.textContent = `${elapsedSeconds}s`;
        
        // Update analysis if enough data
        if (keystrokes > 10) {
            updateAnalysis();
        }
    }

    // Calculate words in text
    function countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    // Detect pause state
    function checkPauseState() {
        const currentTime = Date.now();
        
        if (lastKeyTime && (currentTime - lastKeyTime) > 1000) {
            // User is pausing (no keystroke for 1 second)
            if (!isPaused) {
                isPaused = true;
                pauseStartTime = currentTime;
            }
        } else {
            // User is typing
            if (isPaused && pauseStartTime) {
                // Pause just ended, record duration
                const pauseDuration = currentTime - pauseStartTime;
                if (pauseDuration > 1000) { // Only record pauses > 1 second
                    pauseDurations.push(pauseDuration);
                    
                    // Keep only last 10 pauses for analysis
                    if (pauseDurations.length > 10) {
                        pauseDurations.shift();
                    }
                }
                isPaused = false;
                pauseStartTime = null;
            }
        }
    }

    // Update all analysis metrics
    function updateAnalysis() {
        if (keystrokes < 5) return; // Not enough data
        
        const currentTime = Date.now();
        const timeElapsed = (currentTime - startTime) / 1000; // in seconds
        
        // Calculate typing speed (words per minute)
        const words = countWords(thoughtInput.value);
        const wpm = timeElapsed > 0 ? Math.round((words / timeElapsed) * 60) : 0;
        
        // Calculate keystroke rate (keystrokes per minute)
        const kpm = timeElapsed > 0 ? Math.round((keystrokes / timeElapsed) * 60) : 0;
        
        // Calculate average pause duration
        let avgPauseDuration = 0;
        if (pauseDurations.length > 0) {
            const totalPauseTime = pauseDurations.reduce((sum, duration) => sum + duration, 0);
            avgPauseDuration = Math.round(totalPauseTime / pauseDurations.length);
        }
        
        // Calculate rhythm consistency (standard deviation of keystroke intervals)
        let rhythmConsistency = 100;
        if (keystrokeIntervals.length > 2) {
            const mean = keystrokeIntervals.reduce((sum, interval) => sum + interval, 0) / keystrokeIntervals.length;
            const squaredDiffs = keystrokeIntervals.map(interval => Math.pow(interval - mean, 2));
            const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / keystrokeIntervals.length;
            const stdDev = Math.sqrt(variance);
            
            // Convert to a percentage (lower std dev = more consistent)
            rhythmConsistency = Math.max(0, 100 - Math.min(100, (stdDev / 500) * 100));
        }
        
        // Update speed metric
        let speedScore = 0;
        let speedCategory = '';
        
        if (wpm < 20) {
            speedScore = 25;
            speedCategory = 'Deliberate';
        } else if (wpm < 40) {
            speedScore = 50;
            speedCategory = 'Moderate';
        } else if (wpm < 60) {
            speedScore = 75;
            speedCategory = 'Quick';
        } else {
            speedScore = 100;
            speedCategory = 'Very Fast';
        }
        
        speedValue.textContent = `${wpm} WPM`;
        speedBar.style.width = `${speedScore}%`;
        speedLabel.textContent = speedCategory;
        
        // Update pause metric
        let pauseScore = 0;
        let pauseCategory = '';
        
        if (avgPauseDuration < 1000 || pauseDurations.length === 0) {
            pauseScore = 90;
            pauseCategory = 'Continuous';
        } else if (avgPauseDuration < 3000) {
            pauseScore = 60;
            pauseCategory = 'Brief Pauses';
        } else if (avgPauseDuration < 6000) {
            pauseScore = 30;
            pauseCategory = 'Frequent Pauses';
        } else {
            pauseScore = 10;
            pauseCategory = 'Pause-Heavy';
        }
        
        pauseValue.textContent = pauseDurations.length > 0 ? `${Math.round(avgPauseDuration/1000)}s avg` : 'Minimal';
        pauseBar.style.width = `${pauseScore}%`;
        pauseLabel.textContent = pauseCategory;
        
        // Update rhythm metric
        let rhythmScore = Math.round(rhythmConsistency);
        let rhythmCategory = '';
        
        if (rhythmScore > 80) {
            rhythmCategory = 'Very Steady';
        } else if (rhythmScore > 60) {
            rhythmCategory = 'Steady';
        } else if (rhythmScore > 40) {
            rhythmCategory = 'Variable';
        } else {
            rhythmCategory = 'Irregular';
        }
        
        rhythmValue.textContent = `${rhythmScore}%`;
        rhythmBar.style.width = `${rhythmScore}%`;
        rhythmLabel.textContent = rhythmCategory;
        
        // Update summary details
        keystrokeRate.textContent = `${kpm} kpm`;
        avgPause.textContent = pauseDurations.length > 0 ? `${Math.round(avgPauseDuration/1000)}s` : '< 1s';
        consistency.textContent = `${Math.round(rhythmConsistency)}%`;
        
        // Update analysis summary
        updateSummary(wpm, pauseCategory, rhythmCategory);
    }

    // Update the analysis summary text
    function updateSummary(wpm, pauseCategory, rhythmCategory) {
        let summary = '';
        
        // Determine thinking speed description
        if (wpm < 20) {
            summary += 'Your thinking appears deliberate and careful. ';
        } else if (wpm < 40) {
            summary += 'You show a balanced thinking pace. ';
        } else if (wpm < 60) {
            summary += 'Your thoughts flow quickly. ';
        } else {
            summary += 'You demonstrate very rapid thinking. ';
        }
        
        // Add pause pattern description
        if (pauseCategory === 'Continuous') {
            summary += 'You maintain continuous flow with minimal pauses, suggesting focused thought. ';
        } else if (pauseCategory === 'Brief Pauses') {
            summary += 'Brief pauses indicate moments of consideration between thoughts. ';
        } else if (pauseCategory === 'Frequent Pauses') {
            summary += 'Frequent pauses suggest careful deliberation or searching for words. ';
        } else {
            summary += 'Extended pauses may indicate deep contemplation or distraction. ';
        }
        
        // Add rhythm description
        if (rhythmCategory.includes('Steady')) {
            summary += 'Your consistent typing rhythm suggests a steady cognitive tempo.';
        } else if (rhythmCategory === 'Variable') {
            summary += 'Variable typing rhythm may indicate shifting focus or complex thought processes.';
        } else {
            summary += 'Irregular rhythm could suggest multitasking or creative brainstorming.';
        }
        
        analysisSummary.textContent = summary;
    }

    // Handle keyboard events
    thoughtInput.addEventListener('keydown', function(e) {
        // Start timer on first keypress
        if (!startTime) {
            startTimer();
        }
        
        const currentTime = Date.now();
        
        // Record keystroke interval if we have a previous keystroke time
        if (lastKeyTime) {
            const interval = currentTime - lastKeyTime;
            keystrokeIntervals.push(interval);
            
            // Keep only last 50 intervals for analysis
            if (keystrokeIntervals.length > 50) {
                keystrokeIntervals.shift();
            }
        }
        
        // Update last key time
        lastKeyTime = currentTime;
        
        // Increment keystroke count
        keystrokes++;
        
        // Update character and word counts
        charCount.textContent = thoughtInput.value.length + 1; // +1 for current key
        wordCount.textContent = countWords(thoughtInput.value + String.fromCharCode(e.keyCode));
    });

    // Handle input events (for backspace, delete, paste, etc.)
    thoughtInput.addEventListener('input', function() {
        // Update character and word counts
        charCount.textContent = thoughtInput.value.length;
        wordCount.textContent = countWords(thoughtInput.value);
        
        // Check for pause state
        checkPauseState();
        
        // Update analysis if we have enough data
        if (keystrokes > 10) {
            updateAnalysis();
        }
    });

    // Handle focus events (track when user focuses away and returns)
    thoughtInput.addEventListener('blur', function() {
        // User navigated away from textarea
        pauseStartTime = Date.now();
        isPaused = true;
    });

    thoughtInput.addEventListener('focus', function() {
        // User returned to textarea
        if (isPaused && pauseStartTime) {
            const pauseDuration = Date.now() - pauseStartTime;
            if (pauseDuration > 1000) {
                pauseDurations.push(pauseDuration);
                
                // Keep only last 10 pauses for analysis
                if (pauseDurations.length > 10) {
                    pauseDurations.shift();
                }
            }
            isPaused = false;
            pauseStartTime = null;
        }
    });

    // Reset button functionality
    resetBtn.addEventListener('click', initAnalyzer);

    // Initialize the analyzer on page load
    initAnalyzer();
});