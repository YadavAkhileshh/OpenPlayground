// Reality Check Simulator
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const setupPhase = document.getElementById('setupPhase');
    const taskPhase = document.getElementById('taskPhase');
    const resultsPhase = document.getElementById('resultsPhase');
    
    // Setup Phase Elements
    const expectedMinutesInput = document.getElementById('expectedMinutes');
    const expectedSecondsInput = document.getElementById('expectedSeconds');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const taskOptions = document.querySelectorAll('.task-option');
    const startTaskBtn = document.getElementById('startTaskBtn');
    
    // Task Phase Elements
    const taskTitleEl = document.getElementById('taskTitle');
    const taskDescriptionEl = document.getElementById('taskDescription');
    const taskDisplayEl = document.getElementById('taskDisplay');
    const textInput = document.getElementById('textInput');
    const wordCountEl = document.getElementById('wordCount');
    const progressFillEl = document.getElementById('progressFill');
    const estimatedTimeDisplayEl = document.getElementById('estimatedTimeDisplay');
    const completeTaskBtn = document.getElementById('completeTaskBtn');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    
    // Results Phase Elements
    const expectedTimeResultEl = document.getElementById('expectedTimeResult');
    const actualTimeResultEl = document.getElementById('actualTimeResult');
    const accuracyPercentageEl = document.getElementById('accuracyPercentage');
    const meterFillEl = document.getElementById('meterFill');
    const timeDifferenceEl = document.getElementById('timeDifference');
    const differenceTypeEl = document.getElementById('differenceType');
    const feedbackIconEl = document.getElementById('feedbackIcon');
    const feedbackTitleEl = document.getElementById('feedbackTitle');
    const feedbackTextEl = document.getElementById('feedbackText');
    const newSessionBtn = document.getElementById('newSessionBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    
    // History Elements
    const historyModal = document.getElementById('historyModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyListEl = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // Stats Elements
    const sessionCountEl = document.getElementById('sessionCount');
    const avgAccuracyEl = document.getElementById('avgAccuracy');
    const totalSessionsEl = document.getElementById('totalSessions');
    const avgDifferenceEl = document.getElementById('avgDifference');
    const bestAccuracyEl = document.getElementById('bestAccuracy');
    const consistencyScoreEl = document.getElementById('consistencyScore');
    
    // Footer Elements
    const currentYearEl = document.getElementById('currentYear');
    const howItWorksBtn = document.getElementById('howItWorksBtn');
    const tipsBtn = document.getElementById('tipsBtn');
    
    // App State
    let sessionHistory = [];
    let currentSession = {
        expectedTime: 0, // in seconds
        actualTime: 0,   // in seconds
        taskType: 'typing',
        startTime: null,
        accuracy: 0,
        difference: 0
    };
    
    let timerInterval = null;
    let elapsedSeconds = 0;
    let isTaskActive = false;
    
    // Task Data
    const tasks = {
        typing: {
            title: 'Typing Test',
            description: 'Type the following paragraph as quickly and accurately as possible:',
            content: `The quick brown fox jumps over the lazy dog. This classic pangram contains every letter in the English alphabet. Typing practice helps improve speed and accuracy while developing muscle memory for efficient keyboard use. Regular practice can significantly boost your productivity in any computer-based work.`,
            instruction: 'Copy the text above into the input box below.'
        },
        math: {
            title: 'Math Problems',
            description: 'Solve the following arithmetic problems:',
            content: `1. 24 × 18 = ?
2. 156 ÷ 12 = ?
3. 47 + 89 = ?
4. 205 - 97 = ?
5. √144 = ?
6. 15% of 200 = ?
7. 3² × 4³ = ?
8. 7 × 8 + 15 ÷ 3 = ?
9. If x = 5, what is 3x² + 2x - 7?
10. Convert 0.75 to a fraction.`,
            instruction: 'Solve each problem and type your answers separated by commas.'
        },
        reading: {
            title: 'Reading Comprehension',
            description: 'Read the following passage carefully:',
            content: `The concept of time management is often misunderstood. It's not about squeezing more tasks into your day, but about aligning your time with your priorities. Effective time management involves identifying what's truly important and allocating your limited time accordingly. Research shows that people who practice intentional time management experience less stress and higher productivity. The key is to focus on effectiveness rather than mere efficiency.`,
            instruction: 'Read the passage above, then summarize it in 2-3 sentences below.'
        }
    };
    
    // Initialize App
    function init() {
        loadHistory();
        updateStats();
        setCurrentYear();
        setupEventListeners();
        updateTaskDisplay();
    }
    
    // Load session history from localStorage
    function loadHistory() {
        const savedHistory = localStorage.getItem('realityCheckHistory');
        if (savedHistory) {
            sessionHistory = JSON.parse(savedHistory);
        }
    }
    
    // Save session history to localStorage
    function saveHistory() {
        localStorage.setItem('realityCheckHistory', JSON.stringify(sessionHistory));
        updateStats();
    }
    
    // Update statistics display
    function updateStats() {
        const totalSessions = sessionHistory.length;
        
        sessionCountEl.textContent = `${totalSessions} ${totalSessions === 1 ? 'session' : 'sessions'}`;
        totalSessionsEl.textContent = totalSessions;
        
        if (totalSessions > 0) {
            const totalAccuracy = sessionHistory.reduce((sum, session) => sum + session.accuracy, 0);
            const avgAccuracy = Math.round(totalAccuracy / totalSessions);
            
            const totalDifference = sessionHistory.reduce((sum, session) => sum + Math.abs(session.difference), 0);
            const avgDifference = Math.round(totalDifference / totalSessions);
            
            const bestAccuracy = Math.max(...sessionHistory.map(s => s.accuracy));
            
            // Calculate consistency (lower variance is better)
            const accuracyScores = sessionHistory.map(s => s.accuracy);
            const variance = calculateVariance(accuracyScores);
            const consistency = Math.max(0, 100 - Math.round(variance / 10));
            
            avgAccuracyEl.textContent = `${avgAccuracy}% accuracy`;
            avgDifferenceEl.textContent = `${avgDifference}s`;
            bestAccuracyEl.textContent = `${bestAccuracy}%`;
            consistencyScoreEl.textContent = consistency;
        } else {
            avgAccuracyEl.textContent = '0% accuracy';
            avgDifferenceEl.textContent = '0s';
            bestAccuracyEl.textContent = '0%';
            consistencyScoreEl.textContent = '0';
        }
    }
    
    // Calculate variance of an array
    function calculateVariance(array) {
        if (array.length < 2) return 0;
        const mean = array.reduce((a, b) => a + b) / array.length;
        return array.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / array.length;
    }
    
    // Set current year in footer
    function setCurrentYear() {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Setup Phase Events
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.dataset.minutes);
                const seconds = parseInt(btn.dataset.seconds) || 0;
                expectedMinutesInput.value = minutes;
                expectedSecondsInput.value = seconds;
                updateEstimatedTimeDisplay();
            });
        });
        
        taskOptions.forEach(option => {
            option.addEventListener('click', () => {
                taskOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                currentSession.taskType = option.dataset.task;
                updateTaskDisplay();
            });
        });
        
        expectedMinutesInput.addEventListener('change', updateEstimatedTimeDisplay);
        expectedSecondsInput.addEventListener('change', updateEstimatedTimeDisplay);
        
        // Number input buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const target = document.getElementById(this.dataset.target);
                const action = this.dataset.action;
                let value = parseInt(target.value) || 0;
                
                if (action === 'increase') {
                    const max = target.id === 'expectedMinutes' ? 120 : 59;
                    value = Math.min(value + 1, max);
                } else {
                    const min = target.id === 'expectedMinutes' ? 1 : 0;
                    value = Math.max(value - 1, min);
                }
                
                target.value = value;
                updateEstimatedTimeDisplay();
            });
        });
        
        startTaskBtn.addEventListener('click', startTask);
        
        // Task Phase Events
        textInput.addEventListener('input', updateWordCount);
        completeTaskBtn.addEventListener('click', completeTask);
        cancelTaskBtn.addEventListener('click', cancelTask);
        
        // Results Phase Events
        newSessionBtn.addEventListener('click', startNewSession);
        viewHistoryBtn.addEventListener('click', showHistory);
        
        // Modal Events
        closeModalBtn.addEventListener('click', closeModal);
        closeHistoryBtn.addEventListener('click', closeModal);
        clearHistoryBtn.addEventListener('click', clearHistory);
        
        // Footer Events
        howItWorksBtn.addEventListener('click', showHowItWorks);
        tipsBtn.addEventListener('click', showTips);
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === historyModal) {
                closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isTaskActive) {
                cancelTask();
            }
        });
    }
    
    // Update estimated time display
    function updateEstimatedTimeDisplay() {
        const minutes = parseInt(expectedMinutesInput.value) || 0;
        const seconds = parseInt(expectedSecondsInput.value) || 0;
        estimatedTimeDisplayEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update task display based on selected task
    function updateTaskDisplay() {
        const task = tasks[currentSession.taskType];
        taskTitleEl.textContent = task.title;
        taskDescriptionEl.textContent = task.description;
        
        // Update task display content
        const typingText = taskDisplayEl.querySelector('#typingText');
        if (typingText) {
            typingText.textContent = task.content;
        }
        
        // Update input placeholder based on task
        if (currentSession.taskType === 'typing') {
            textInput.placeholder = 'Type the text above here...';
        } else if (currentSession.taskType === 'math') {
            textInput.placeholder = 'Enter your answers separated by commas...';
        } else {
            textInput.placeholder = 'Write your summary here...';
        }
        
        // Clear input and word count
        textInput.value = '';
        wordCountEl.textContent = '0';
    }
    
    // Update word count
    function updateWordCount() {
        const text = textInput.value.trim();
        const wordCount = text === '' ? 0 : text.split(/\s+/).length;
        wordCountEl.textContent = wordCount;
    }
    
    // Start a new task session
    function startTask() {
        const minutes = parseInt(expectedMinutesInput.value) || 0;
        const seconds = parseInt(expectedSecondsInput.value) || 0;
        
        if (minutes === 0 && seconds === 0) {
            alert('Please set a time estimate before starting');
            return;
        }
        
        // Set current session data
        currentSession.expectedTime = (minutes * 60) + seconds;
        currentSession.startTime = Date.now();
        currentSession.actualTime = 0;
        
        // Switch to task phase
        setupPhase.classList.remove('active');
        taskPhase.classList.add('active');
        
        // Reset progress bar
        progressFillEl.style.width = '0%';
        
        // Start timer
        isTaskActive = true;
        elapsedSeconds = 0;
        
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            
            // Update progress bar based on expected time
            const progressPercent = Math.min((elapsedSeconds / currentSession.expectedTime) * 100, 100);
            progressFillEl.style.width = `${progressPercent}%`;
            
            // Change progress bar color based on time
            if (progressPercent > 100) {
                progressFillEl.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
            } else if (progressPercent > 80) {
                progressFillEl.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            }
            
        }, 1000);
        
        // Focus on text input
        setTimeout(() => {
            textInput.focus();
        }, 500);
    }
    
    // Complete the task
    function completeTask() {
        if (!isTaskActive) return;
        
        // Stop timer
        clearInterval(timerInterval);
        isTaskActive = false;
        
        // Calculate actual time
        currentSession.actualTime = elapsedSeconds;
        
        // Calculate accuracy and difference
        const difference = currentSession.actualTime - currentSession.expectedTime;
        const absoluteDifference = Math.abs(difference);
        
        // Calculate accuracy percentage (100% when perfect, decreases with difference)
        let accuracy;
        if (difference === 0) {
            accuracy = 100;
        } else {
            // Scale accuracy based on percentage difference
            const percentageDiff = (absoluteDifference / currentSession.expectedTime) * 100;
            accuracy = Math.max(0, 100 - percentageDiff);
        }
        
        currentSession.difference = difference;
        currentSession.accuracy = Math.round(accuracy);
        
        // Save to history
        sessionHistory.unshift({
            ...currentSession,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        });
        
        // Keep only last 50 sessions
        if (sessionHistory.length > 50) {
            sessionHistory = sessionHistory.slice(0, 50);
        }
        
        saveHistory();
        showResults();
    }
    
    // Cancel task and return to setup
    function cancelTask() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        isTaskActive = false;
        taskPhase.classList.remove('active');
        setupPhase.classList.add('active');
        
        // Reset input
        textInput.value = '';
        wordCountEl.textContent = '0';
    }
    
    // Show results phase
    function showResults() {
        taskPhase.classList.remove('active');
        resultsPhase.classList.add('active');
        
        // Format times for display
        const expectedMinutes = Math.floor(currentSession.expectedTime / 60);
        const expectedSeconds = currentSession.expectedTime % 60;
        const actualMinutes = Math.floor(currentSession.actualTime / 60);
        const actualSeconds = currentSession.actualTime % 60;
        
        expectedTimeResultEl.textContent = `${expectedMinutes}:${expectedSeconds.toString().padStart(2, '0')}`;
        actualTimeResultEl.textContent = `${actualMinutes}:${actualSeconds.toString().padStart(2, '0')}`;
        
        // Calculate and display difference
        const difference = currentSession.difference;
        const absoluteDifference = Math.abs(difference);
        
        if (difference > 0) {
            timeDifferenceEl.textContent = `+${absoluteDifference} second${absoluteDifference !== 1 ? 's' : ''}`;
            differenceTypeEl.textContent = 'You underestimated';
            timeDifferenceEl.style.color = '#ef4444'; // Red for underestimation
        } else if (difference < 0) {
            timeDifferenceEl.textContent = `-${absoluteDifference} second${absoluteDifference !== 1 ? 's' : ''}`;
            differenceTypeEl.textContent = 'You overestimated';
            timeDifferenceEl.style.color = '#10b981'; // Green for overestimation
        } else {
            timeDifferenceEl.textContent = 'Perfect!';
            differenceTypeEl.textContent = 'Spot on estimation';
            timeDifferenceEl.style.color = '#10b981';
        }
        
        // Update accuracy display
        const accuracy = currentSession.accuracy;
        accuracyPercentageEl.textContent = `${accuracy}%`;
        
        // Update meter fill (position based on accuracy)
        meterFillEl.style.width = `${accuracy}%`;
        
        // Set meter fill color based on accuracy
        if (accuracy >= 90) {
            meterFillEl.style.background = 'rgba(16, 185, 129, 0.3)'; // Green
        } else if (accuracy >= 70) {
            meterFillEl.style.background = 'rgba(245, 158, 11, 0.3)'; // Orange
        } else {
            meterFillEl.style.background = 'rgba(239, 68, 68, 0.3)'; // Red
        }
        
        // Set feedback based on accuracy
        let feedback = {};
        
        if (accuracy === 100) {
            feedback = {
                icon: 'fas fa-crown',
                title: 'Perfect Estimation!',
                text: 'Your time estimation was exactly right! This shows excellent time awareness and planning skills.'
            };
        } else if (accuracy >= 90) {
            feedback = {
                icon: 'fas fa-star',
                title: 'Excellent Estimation!',
                text: 'You were very close to your estimate. This shows great time awareness for this type of task.'
            };
        } else if (accuracy >= 75) {
            feedback = {
                icon: 'fas fa-thumbs-up',
                title: 'Good Estimation',
                text: 'Your estimate was reasonably close to reality. With a bit more practice, you can improve even further.'
            };
        } else if (accuracy >= 60) {
            feedback = {
                icon: 'fas fa-clock',
                title: 'Room for Improvement',
                text: 'There was a noticeable difference between your estimate and actual time. Try to break tasks down into smaller parts for better estimation.'
            };
        } else {
            feedback = {
                icon: 'fas fa-hourglass-end',
                title: 'Time Perception Challenge',
                text: 'Your estimate was quite different from reality. This is common! Practice estimating smaller tasks first to build your time awareness.'
            };
        }
        
        // Apply feedback
        feedbackIconEl.innerHTML = `<i class="${feedback.icon}"></i>`;
        feedbackTitleEl.textContent = feedback.title;
        feedbackTextEl.textContent = feedback.text;
        
        // Update insight tip based on performance
        const insightTip = document.querySelector('.insight-tip p');
        if (insightTip) {
            if (difference > 0) {
                insightTip.textContent = 'People often underestimate tasks by 20-30%. Breaking tasks into smaller steps can improve estimation accuracy.';
            } else if (difference < 0) {
                insightTip.textContent = 'Overestimation is common when we\'re unfamiliar with a task. As you practice similar tasks, your estimates will become more accurate.';
            } else {
                insightTip.textContent = 'Perfect estimation is rare! Celebrate this achievement and try to understand what helped you estimate so accurately.';
            }
        }
    }
    
    // Start a new session
    function startNewSession() {
        resultsPhase.classList.remove('active');
        setupPhase.classList.add('active');
        
        // Reset inputs
        expectedMinutesInput.value = '5';
        expectedSecondsInput.value = '0';
        updateEstimatedTimeDisplay();
        
        // Reset task display
        updateTaskDisplay();
    }
    
    // Show history modal
    function showHistory() {
        updateHistoryList();
        historyModal.style.display = 'flex';
    }
    
    // Close modal
    function closeModal() {
        historyModal.style.display = 'none';
    }
    
    // Update history list display
    function updateHistoryList() {
        historyListEl.innerHTML = '';
        
        if (sessionHistory.length === 0) {
            historyListEl.innerHTML = '<p class="no-history">No sessions recorded yet. Complete your first task to see history here.</p>';
            return;
        }
        
        sessionHistory.forEach((session, index) => {
            const expectedMinutes = Math.floor(session.expectedTime / 60);
            const expectedSeconds = session.expectedTime % 60;
            const actualMinutes = Math.floor(session.actualTime / 60);
            const actualSeconds = session.actualTime % 60;
            const difference = session.difference;
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            let differenceText = '';
            let differenceClass = '';
            
            if (difference > 0) {
                differenceText = `+${Math.abs(difference)}s`;
                differenceClass = 'underestimated';
            } else if (difference < 0) {
                differenceText = `-${Math.abs(difference)}s`;
                differenceClass = 'overestimated';
            } else {
                differenceText = 'Perfect';
                differenceClass = 'perfect';
            }
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-date">${session.date || 'Today'}</div>
                    <div class="history-task">${session.taskType === 'typing' ? 'Typing' : session.taskType === 'math' ? 'Math' : 'Reading'}</div>
                </div>
                <div class="history-times">
                    <span class="expected">${expectedMinutes}:${expectedSeconds.toString().padStart(2, '0')}</span>
                    <span class="arrow">→</span>
                    <span class="actual">${actualMinutes}:${actualSeconds.toString().padStart(2, '0')}</span>
                </div>
                <div class="history-accuracy ${differenceClass}">
                    <span class="accuracy">${session.accuracy}%</span>
                    <span class="difference">${differenceText}</span>
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
            updateHistoryList();
            closeModal();
        }
    }
    
    // Show how it works
    function showHowItWorks(e) {
        e.preventDefault();
        alert('Reality Check Simulator helps you improve time estimation skills:\n\n1. Estimate how long a task will take\n2. Complete the task naturally\n3. Compare your estimate with actual time\n4. Learn from the difference to improve future estimates\n\nNo pressure, no judgment—just valuable insights!');
    }
    
    // Show tips
    function showTips(e) {
        e.preventDefault();
        alert('Tips for better time estimation:\n\n1. Break tasks into smaller steps\n2. Track actual times for common tasks\n3. Add 20% buffer for unexpected delays\n4. Review your estimation accuracy regularly\n5. Practice with different types of tasks\n\nRemember: Perfect estimation is rare. The goal is improvement, not perfection!');
    }
    
    // Initialize the app
    init();
});