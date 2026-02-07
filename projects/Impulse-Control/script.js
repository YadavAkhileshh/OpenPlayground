        // Application state
        const appState = {
            currentTest: 'button',
            testActive: false,
            testCompleted: false,
            currentQuestion: 0,
            totalQuestions: 10,
            testData: {
                button: { impulses: 0, controls: 0, startTime: null, reactionTimes: [] },
                color: { correct: 0, incorrect: 0, startTime: null, reactionTimes: [] },
                delay: { earlyClicks: 0, delayedClicks: 0, rewards: 0, startTime: null },
                focus: { hits: 0, misses: 0, distractionsClicked: 0, startTime: null }
            },
            overallStats: {
                impulses: 0,
                controls: 0,
                totalReactionTime: 0,
                reactionCount: 0,
                accuracy: 0,
                testsCompleted: 0
            }
        };

        // Test configurations
        const testConfigs = {
            button: {
                title: "Button Impulse Test",
                instructions: "Click the 'Control' button but resist clicking the 'Impulse' button. The impulse button is more tempting, but you'll score points for resisting it!",
                duration: 30 // seconds per question
            },
            color: {
                title: "Color-Word Test",
                instructions: "Click the button that matches the COLOR of the word, not the word itself. This tests your ability to control automatic responses.",
                duration: 20
            },
            delay: {
                title: "Delayed Gratification Test",
                instructions: "Wait for the timer to reach zero before clicking the button. If you click too early, you get a small reward. If you wait, you get a bigger reward!",
                duration: 15
            },
            focus: {
                title: "Focus & Distraction Test",
                instructions: "Click the moving target as many times as possible within the time limit. Avoid clicking the distracting elements that appear.",
                duration: 30
            }
        };

        // Colors for color test
        const colors = [
            { name: "RED", value: "#ff6b6b", colorName: "red" },
            { name: "GREEN", value: "#4a9c8a", colorName: "green" },
            { name: "BLUE", value: "#8a7fcc", colorName: "blue" },
            { name: "YELLOW", value: "#e9c46a", colorName: "yellow" }
        ];

        // DOM Elements
        const impulseScoreEl = document.getElementById('impulse-score');
        const controlScoreEl = document.getElementById('control-score');
        const reactionTimeEl = document.getElementById('reaction-time');
        const accuracyRateEl = document.getElementById('accuracy-rate');
        const balanceBarEl = document.getElementById('balance-bar');
        const balancePercentEl = document.getElementById('balance-percent');
        const testSelectorEl = document.getElementById('test-selector');
        const testContainerEl = document.getElementById('test-container');
        const backButtonEl = document.getElementById('back-button');
        const testTitleEl = document.getElementById('test-title');
        const testInstructionsEl = document.getElementById('test-instructions');
        const testAreaEl = document.getElementById('test-area');
        const testProgressTextEl = document.getElementById('test-progress-text');
        const testProgressPercentEl = document.getElementById('test-progress-percent');
        const testProgressBarEl = document.getElementById('test-progress-bar');
        const skipButtonEl = document.getElementById('skip-button');
        const startButtonEl = document.getElementById('start-button');
        const resultsContainerEl = document.getElementById('results-container');
        const finalScoreEl = document.getElementById('final-score');
        const resultTypeEl = document.getElementById('result-type');
        const resultDescEl = document.getElementById('result-desc');
        const finalImpulseEl = document.getElementById('final-impulse');
        const finalControlEl = document.getElementById('final-control');
        const finalReactionEl = document.getElementById('final-reaction');
        const finalAccuracyEl = document.getElementById('final-accuracy');
        const tipsListEl = document.getElementById('tips-list');
        const retakeButtonEl = document.getElementById('retake-button');
        const backToMenuButtonEl = document.getElementById('back-to-menu-button');

        // Initialize the application
        function initApp() {
            updateStatsDisplay();
            setupTestSelector();
            setupEventListeners();
        }

        // Update stats display
        function updateStatsDisplay() {
            impulseScoreEl.textContent = appState.overallStats.impulses;
            controlScoreEl.textContent = appState.overallStats.controls;
            
            const avgReactionTime = appState.overallStats.reactionCount > 0 ? 
                Math.round(appState.overallStats.totalReactionTime / appState.overallStats.reactionCount) : 0;
            reactionTimeEl.textContent = `${avgReactionTime}ms`;
            
            const totalResponses = appState.overallStats.impulses + appState.overallStats.controls;
            const accuracy = totalResponses > 0 ? 
                Math.round((appState.overallStats.controls / totalResponses) * 100) : 0;
            accuracyRateEl.textContent = `${accuracy}%`;
            
            // Update balance bar
            const balance = totalResponses > 0 ? 
                Math.round((appState.overallStats.controls / totalResponses) * 100) : 50;
            balanceBarEl.style.width = `${balance}%`;
            balancePercentEl.textContent = `${balance}%`;
        }

        // Setup test selector
        function setupTestSelector() {
            const testCards = document.querySelectorAll('.test-card');
            
            testCards.forEach(card => {
                card.addEventListener('click', function() {
                    // Remove active class from all cards
                    testCards.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked card
                    this.classList.add('active');
                    
                    // Update current test
                    appState.currentTest = this.dataset.test;
                    
                    // Load test preview
                    loadTestPreview();
                });
            });
            
            // Load initial test preview
            loadTestPreview();
        }

        // Load test preview
        function loadTestPreview() {
            const config = testConfigs[appState.currentTest];
            testTitleEl.textContent = config.title;
            testInstructionsEl.textContent = config.instructions;
            
            // Clear test area
            testAreaEl.innerHTML = '';
            
            // Add preview based on test type
            switch(appState.currentTest) {
                case 'button':
                    testAreaEl.innerHTML = `
                        <div style="text-align: center;">
                            <button class="impulse-button impulse" style="margin-bottom: 20px;">
                                <i class="fas fa-fire"></i> IMPULSE
                            </button>
                            <button class="impulse-button control">
                                <i class="fas fa-shield-alt"></i> CONTROL
                            </button>
                            <p style="margin-top: 30px; color: var(--text-light);">
                                In the actual test, you'll need to resist clicking the IMPULSE button.
                            </p>
                        </div>
                    `;
                    break;
                    
                case 'color':
                    testAreaEl.innerHTML = `
                        <div class="color-test-area">
                            <div class="color-instruction" style="color: #ff6b6b;">GREEN</div>
                            <div class="color-buttons">
                                <button class="color-button" style="background-color: #ff6b6b;"></button>
                                <button class="color-button" style="background-color: #4a9c8a;"></button>
                                <button class="color-button" style="background-color: #8a7fcc;"></button>
                                <button class="color-button" style="background-color: #e9c46a;"></button>
                            </div>
                            <p style="margin-top: 30px; color: var(--text-light);">
                                Click the button that matches the COLOR of the word (red), not the word itself (GREEN).
                            </p>
                        </div>
                    `;
                    break;
                    
                case 'delay':
                    testAreaEl.innerHTML = `
                        <div class="delay-test-area">
                            <div class="delay-timer">5.0s</div>
                            <button class="delay-button">
                                <i class="fas fa-gem"></i> WAIT FOR REWARD
                            </button>
                            <p style="margin-top: 30px; color: var(--text-light);">
                                Wait for the timer to reach zero for maximum reward.
                            </p>
                        </div>
                    `;
                    break;
                    
                case 'focus':
                    testAreaEl.innerHTML = `
                        <div class="focus-test-area">
                            <div class="focus-target" style="top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                <i class="fas fa-bullseye"></i>
                            </div>
                            <div class="distraction" style="top: 30%; left: 30%;">
                                <i class="fas fa-star"></i>
                            </div>
                            <p style="position: absolute; bottom: 20px; left: 0; width: 100%; text-align: center; color: var(--text-light);">
                                Click the target, ignore the distractions.
                            </p>
                        </div>
                    `;
                    break;
            }
            
            // Update button text
            startButtonEl.innerHTML = '<i class="fas fa-play"></i> Start Test';
            startButtonEl.disabled = false;
            
            // Reset test progress
            appState.currentQuestion = 0;
            updateTestProgress();
        }

        // Setup event listeners
        function setupEventListeners() {
            // Back button
            backButtonEl.addEventListener('click', () => {
                testContainerEl.style.display = 'none';
                document.querySelector('.panel:first-child').style.display = 'block';
                
                // Stop any active test
                stopTest();
            });
            
            // Start button
            startButtonEl.addEventListener('click', startTest);
            
            // Skip button
            skipButtonEl.addEventListener('click', () => {
                if (appState.testActive) {
                    stopTest();
                    loadTestPreview();
                }
            });
            
            // Retake button
            retakeButtonEl.addEventListener('click', () => {
                // Reset all test data
                resetAllTests();
                resultsContainerEl.style.display = 'none';
                document.querySelector('.panel:first-child').style.display = 'block';
                updateStatsDisplay();
            });
            
            // Back to menu button
            backToMenuButtonEl.addEventListener('click', () => {
                resultsContainerEl.style.display = 'none';
                document.querySelector('.panel:first-child').style.display = 'block';
            });
        }

        // Start the test
        function startTest() {
            // Hide test selector, show test container
            document.querySelector('.panel:first-child').style.display = 'none';
            testContainerEl.style.display = 'flex';
            
            // Reset test state
            appState.testActive = true;
            appState.testCompleted = false;
            appState.currentQuestion = 0;
            
            // Reset test data for current test
            appState.testData[appState.currentTest] = {
                impulses: 0,
                controls: 0,
                correct: 0,
                incorrect: 0,
                earlyClicks: 0,
                delayedClicks: 0,
                rewards: 0,
                hits: 0,
                misses: 0,
                distractionsClicked: 0,
                startTime: Date.now(),
                reactionTimes: []
            };
            
            // Update UI
            startButtonEl.disabled = true;
            startButtonEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Test Running';
            skipButtonEl.disabled = false;
            
            // Start first question
            nextQuestion();
        }

        // Load next question
        function nextQuestion() {
            if (appState.currentQuestion >= appState.totalQuestions) {
                completeTest();
                return;
            }
            
            appState.currentQuestion++;
            updateTestProgress();
            
            // Clear test area
            testAreaEl.innerHTML = '';
            
            // Load question based on test type
            switch(appState.currentTest) {
                case 'button':
                    loadButtonQuestion();
                    break;
                    
                case 'color':
                    loadColorQuestion();
                    break;
                    
                case 'delay':
                    loadDelayQuestion();
                    break;
                    
                case 'focus':
                    loadFocusQuestion();
                    break;
            }
        }

        // Update test progress display
        function updateTestProgress() {
            const progress = (appState.currentQuestion / appState.totalQuestions) * 100;
            testProgressTextEl.textContent = `Question ${appState.currentQuestion} of ${appState.totalQuestions}`;
            testProgressPercentEl.textContent = `${Math.round(progress)}%`;
            testProgressBarEl.style.width = `${progress}%`;
        }

        // Load button test question
        function loadButtonQuestion() {
            // Determine if this is an impulse or control question
            const isImpulseQuestion = Math.random() > 0.7; // 30% chance of impulse button
            
            if (isImpulseQuestion) {
                // Impulse question - tempting button
                testAreaEl.innerHTML = `
                    <div style="text-align: center;">
                        <h3 style="margin-bottom: 30px; color: var(--impulse-color);">
                            <i class="fas fa-exclamation-triangle"></i> RESIST THE TEMPTATION!
                        </h3>
                        <button class="impulse-button impulse" id="impulse-btn" style="margin-bottom: 20px;">
                            <i class="fas fa-gift"></i> FREE GIFT!
                        </button>
                        <button class="impulse-button control" id="control-btn">
                            <i class="fas fa-check-circle"></i> CONTINUE
                        </button>
                        <p style="margin-top: 30px; color: var(--text-light);">
                            Click "CONTINUE" to proceed. Resist clicking "FREE GIFT"!
                        </p>
                    </div>
                `;
            } else {
                // Control question - both are control buttons
                const button1Text = Math.random() > 0.5 ? "NEXT" : "CONTINUE";
                const button2Text = Math.random() > 0.5 ? "PROCEED" : "OK";
                
                testAreaEl.innerHTML = `
                    <div style="text-align: center;">
                        <h3 style="margin-bottom: 30px; color: var(--control-color);">
                            <i class="fas fa-shield-alt"></i> MAKE A CHOICE
                        </h3>
                        <div class="button-grid">
                            <button class="grid-button neutral" data-choice="neutral">
                                <i class="fas fa-circle"></i> ${button1Text}
                            </button>
                            <button class="grid-button neutral" data-choice="neutral">
                                <i class="fas fa-square"></i> ${button2Text}
                            </button>
                            <button class="grid-button correct" data-choice="correct">
                                <i class="fas fa-check"></i> CORRECT
                            </button>
                        </div>
                        <p style="margin-top: 30px; color: var(--text-light);">
                            Click the "CORRECT" button to proceed.
                        </p>
                    </div>
                `;
                
                // Add event listeners to grid buttons
                setTimeout(() => {
                    document.querySelectorAll('.grid-button').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const choice = this.dataset.choice;
                            
                            if (choice === 'correct') {
                                // Correct choice
                                appState.testData.button.controls++;
                                appState.overallStats.controls++;
                                
                                // Visual feedback
                                this.style.transform = 'scale(0.95)';
                                this.style.boxShadow = '0 5px 10px var(--shadow)';
                                
                                // Move to next question after delay
                                setTimeout(() => {
                                    nextQuestion();
                                }, 500);
                            } else {
                                // Incorrect choice
                                appState.testData.button.impulses++;
                                appState.overallStats.impulses++;
                                
                                // Visual feedback
                                this.style.background = 'linear-gradient(135deg, var(--pastel-pink), #ffc9c9)';
                                this.style.color = var('--impulse-color');
                                this.innerHTML = '<i class="fas fa-times"></i> IMPULSE!';
                                
                                // Move to next question after delay
                                setTimeout(() => {
                                    nextQuestion();
                                }, 1000);
                            }
                            
                            updateStatsDisplay();
                        });
                    });
                }, 100);
                
                return;
            }
            
            // Add event listeners for impulse/control buttons
            setTimeout(() => {
                const impulseBtn = document.getElementById('impulse-btn');
                const controlBtn = document.getElementById('control-btn');
                
                if (impulseBtn) {
                    impulseBtn.addEventListener('click', function() {
                        // Impulse clicked
                        appState.testData.button.impulses++;
                        appState.overallStats.impulses++;
                        
                        // Visual feedback
                        this.style.transform = 'scale(0.95)';
                        this.style.boxShadow = '0 5px 10px var(--shadow)';
                        this.innerHTML = '<i class="fas fa-fire"></i> IMPULSE!';
                        
                        // Move to next question after delay
                        setTimeout(() => {
                            nextQuestion();
                        }, 800);
                        
                        updateStatsDisplay();
                    });
                }
                
                if (controlBtn) {
                    controlBtn.addEventListener('click', function() {
                        // Control clicked
                        appState.testData.button.controls++;
                        appState.overallStats.controls++;
                        
                        // Record reaction time if this was an impulse question
                        if (isImpulseQuestion) {
                            const reactionTime = Date.now() - appState.testData.button.startTime;
                            appState.testData.button.reactionTimes.push(reactionTime);
                            appState.overallStats.totalReactionTime += reactionTime;
                            appState.overallStats.reactionCount++;
                        }
                        
                        // Visual feedback
                        this.style.transform = 'scale(0.95)';
                        this.style.boxShadow = '0 5px 10px var(--shadow)';
                        
                        // Move to next question after delay
                        setTimeout(() => {
                            nextQuestion();
                        }, 500);
                        
                        updateStatsDisplay();
                    });
                }
                
                // Reset start time for reaction time calculation
                appState.testData.button.startTime = Date.now();
            }, 100);
        }

        // Load color test question
        function loadColorQuestion() {
            // Randomly select a color and a word
            const color = colors[Math.floor(Math.random() * colors.length)];
            const wordColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Determine if word and color match (25% chance)
            const isCongruent = color.name === wordColor.name;
            
            testAreaEl.innerHTML = `
                <div class="color-test-area">
                    <div class="color-instruction ${isCongruent ? 'correct-color' : 'incorrect-color'}" style="color: ${color.value};">
                        ${wordColor.name}
                    </div>
                    <div class="color-buttons">
                        ${colors.map(c => `
                            <button class="color-button" data-color="${c.colorName}" style="background-color: ${c.value};"></button>
                        `).join('')}
                    </div>
                    <p style="margin-top: 30px; color: var(--text-light);">
                        Click the button that matches the <strong>COLOR</strong> of the word.
                    </p>
                </div>
            `;
            
            // Add event listeners to color buttons
            setTimeout(() => {
                document.querySelectorAll('.color-button').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const selectedColor = this.dataset.color;
                        const correctColor = color.colorName;
                        const isCorrect = selectedColor === correctColor;
                        
                        // Record reaction time
                        const reactionTime = Date.now() - appState.testData.color.startTime;
                        appState.testData.color.reactionTimes.push(reactionTime);
                        appState.overallStats.totalReactionTime += reactionTime;
                        appState.overallStats.reactionCount++;
                        
                        if (isCorrect) {
                            // Correct response
                            appState.testData.color.correct++;
                            appState.overallStats.controls++;
                            
                            // Visual feedback
                            this.style.transform = 'scale(0.9)';
                            this.style.boxShadow = 'inset 0 0 0 5px white';
                            
                            // Move to next question after delay
                            setTimeout(() => {
                                nextQuestion();
                            }, 500);
                        } else {
                            // Incorrect response (impulse)
                            appState.testData.color.incorrect++;
                            appState.overallStats.impulses++;
                            
                            // Visual feedback
                            this.style.transform = 'scale(0.9)';
                            this.style.boxShadow = 'inset 0 0 0 5px var(--impulse-color)';
                            
                            // Highlight correct button
                            document.querySelector(`.color-button[data-color="${correctColor}"]`).style.boxShadow = 'inset 0 0 0 5px var(--control-color)';
                            
                            // Move to next question after delay
                            setTimeout(() => {
                                nextQuestion();
                            }, 1000);
                        }
                        
                        updateStatsDisplay();
                        
                        // Reset start time for next question
                        appState.testData.color.startTime = Date.now();
                    });
                });
                
                // Reset start time for reaction time calculation
                appState.testData.color.startTime = Date.now();
            }, 100);
        }

        // Load delay test question
        function loadDelayQuestion() {
            // Random delay between 3-7 seconds
            const delayTime = 3000 + Math.random() * 4000;
            const smallReward = Math.floor(Math.random() * 5) + 1;
            const bigReward = smallReward * 3;
            
            testAreaEl.innerHTML = `
                <div class="delay-test-area">
                    <div class="delay-timer" id="delay-timer">${(delayTime/1000).toFixed(1)}s</div>
                    <button class="delay-button" id="delay-btn" data-delay="${delayTime}" data-small="${smallReward}" data-big="${bigReward}">
                        <i class="fas fa-gem"></i> WAIT FOR BIGGER REWARD
                    </button>
                    <div class="delay-reward" id="delay-reward">+0</div>
                    <p style="margin-top: 30px; color: var(--text-light);">
                        If you click now: <strong>${smallReward} points</strong><br>
                        If you wait: <strong>${bigReward} points</strong>
                    </p>
                </div>
            `;
            
            // Start the countdown
            let remainingTime = delayTime;
            const timerEl = document.getElementById('delay-timer');
            const delayBtn = document.getElementById('delay-btn');
            const rewardEl = document.getElementById('delay-reward');
            
            const countdownInterval = setInterval(() => {
                remainingTime -= 100;
                timerEl.textContent = `${(remainingTime/1000).toFixed(1)}s`;
                
                if (remainingTime <= 0) {
                    clearInterval(countdownInterval);
                    timerEl.textContent = "0.0s";
                    
                    // Enable the button for big reward
                    delayBtn.disabled = false;
                    delayBtn.innerHTML = `<i class="fas fa-crown"></i> CLAIM ${bigReward} POINTS!`;
                    
                    // Start a separate timeout to auto-click after 3 seconds
                    setTimeout(() => {
                        if (!delayBtn.disabled) {
                            // Auto-click for big reward
                            claimReward(delayBtn, rewardEl, bigReward, true);
                        }
                    }, 3000);
                }
            }, 100);
            
            // Add event listener to delay button
            setTimeout(() => {
                delayBtn.addEventListener('click', function() {
                    const delay = parseInt(this.dataset.delay);
                    const smallReward = parseInt(this.dataset.small);
                    const bigReward = parseInt(this.dataset.big);
                    
                    const timeWaited = delayTime - remainingTime;
                    const waitedEnough = timeWaited >= delay;
                    
                    if (waitedEnough) {
                        // Waited long enough for big reward
                        claimReward(this, rewardEl, bigReward, true);
                        clearInterval(countdownInterval);
                    } else {
                        // Clicked too early - small reward
                        claimReward(this, rewardEl, smallReward, false);
                        clearInterval(countdownInterval);
                    }
                });
                
                // Reset start time
                appState.testData.delay.startTime = Date.now();
            }, 100);
        }

        // Claim reward in delay test
        function claimReward(button, rewardEl, points, isBigReward) {
            button.disabled = true;
            
            // Update test data
            if (isBigReward) {
                appState.testData.delay.delayedClicks++;
                appState.overallStats.controls++;
            } else {
                appState.testData.delay.earlyClicks++;
                appState.overallStats.impulses++;
            }
            
            appState.testData.delay.rewards += points;
            
            // Show reward
            rewardEl.textContent = `+${points}`;
            rewardEl.classList.add('show');
            
            // Update stats
            updateStatsDisplay();
            
            // Move to next question after delay
            setTimeout(() => {
                rewardEl.classList.remove('show');
                nextQuestion();
            }, 1500);
        }

        // Load focus test question
        function loadFocusQuestion() {
            testAreaEl.innerHTML = `
                <div class="focus-test-area" id="focus-area">
                    <div class="focus-target" id="focus-target" style="top: 50%; left: 50%;">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <div id="distractions-container"></div>
                    <div style="position: absolute; bottom: 20px; left: 0; width: 100%; text-align: center;">
                        <div style="display: inline-block; padding: 10px 20px; background-color: white; border-radius: 15px; box-shadow: 0 5px 15px var(--shadow);">
                            <span style="color: var(--control-color); font-weight: 700;">Hits: <span id="hit-count">0</span></span>
                            <span style="margin: 0 15px; color: var(--text-light);">|</span>
                            <span style="color: var(--impulse-color); font-weight: 700;">Distractions: <span id="distraction-count">0</span></span>
                        </div>
                    </div>
                </div>
            `;
            
            const focusArea = document.getElementById('focus-area');
            const focusTarget = document.getElementById('focus-target');
            const distractionsContainer = document.getElementById('distractions-container');
            const hitCountEl = document.getElementById('hit-count');
            const distractionCountEl = document.getElementById('distraction-count');
            
            let hits = 0;
            let distractionsClicked = 0;
            
            // Set up focus target
            focusTarget.addEventListener('click', function() {
                hits++;
                appState.testData.focus.hits++;
                appState.overallStats.controls++;
                hitCountEl.textContent = hits;
                
                // Visual feedback
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
                
                // Move target to random position
                const areaWidth = focusArea.clientWidth - 80;
                const areaHeight = focusArea.clientHeight - 80;
                const newX = Math.random() * areaWidth;
                const newY = Math.random() * areaHeight;
                
                this.style.left = `${newX}px`;
                this.style.top = `${newY}px`;
                
                updateStatsDisplay();
            });
            
            // Create distractions periodically
            const distractionInterval = setInterval(() => {
                if (distractionsContainer.children.length < 5) {
                    createDistraction(focusArea, distractionsContainer, distractionCountEl);
                }
            }, 1500);
            
            // End question after time limit
            setTimeout(() => {
                clearInterval(distractionInterval);
                
                // Remove all distractions
                distractionsContainer.innerHTML = '';
                
                // Show results
                focusArea.innerHTML = `
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="font-size: 3rem; color: var(--control-color); margin-bottom: 20px;">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 10px;">
                            ${hits} Hits
                        </div>
                        <div style="font-size: 1.5rem; color: var(--impulse-color); margin-bottom: 30px;">
                            ${distractionsClicked} Distractions
                        </div>
                        <div style="color: var(--text-light);">
                            Focus score: ${Math.max(0, hits - distractionsClicked)} points
                        </div>
                    </div>
                `;
                
                // Move to next question after delay
                setTimeout(() => {
                    nextQuestion();
                }, 2000);
            }, 10000); // 10 seconds per question
            
            // Reset start time
            appState.testData.focus.startTime = Date.now();
        }

        // Create a distraction element
        function createDistraction(focusArea, container, counterEl) {
            const distraction = document.createElement('div');
            distraction.className = 'distraction';
            
            // Random icon
            const icons = ['fa-star', 'fa-heart', 'fa-gem', 'fa-bell', 'fa-gift'];
            const icon = icons[Math.floor(Math.random() * icons.length)];
            distraction.innerHTML = `<i class="fas ${icon}"></i>`;
            
            // Random position
            const areaWidth = focusArea.clientWidth - 60;
            const areaHeight = focusArea.clientHeight - 60;
            const x = Math.random() * areaWidth;
            const y = Math.random() * areaHeight;
            
            distraction.style.left = `${x}px`;
            distraction.style.top = `${y}px`;
            
            // Add click event
            distraction.addEventListener('click', function() {
                distractionsClicked++;
                appState.testData.focus.distractionsClicked++;
                appState.overallStats.impulses++;
                counterEl.textContent = distractionsClicked;
                
                // Visual feedback
                this.style.transform = 'scale(1.3)';
                this.style.opacity = '0.5';
                
                // Remove after animation
                setTimeout(() => {
                    if (this.parentNode) {
                        this.parentNode.removeChild(this);
                    }
                }, 300);
                
                updateStatsDisplay();
            });
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (distraction.parentNode) {
                    distraction.parentNode.removeChild(distraction);
                }
            }, 5000);
            
            container.appendChild(distraction);
        }

        // Stop the current test
        function stopTest() {
            appState.testActive = false;
            startButtonEl.disabled = false;
            startButtonEl.innerHTML = '<i class="fas fa-play"></i> Start Test';
        }

        // Complete the current test
        function completeTest() {
            appState.testActive = false;
            appState.testCompleted = true;
            
            // Update overall stats
            appState.overallStats.testsCompleted++;
            
            // Show completion message
            testAreaEl.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; color: var(--control-color); margin-bottom: 20px;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div style="font-size: 2rem; font-weight: 700; margin-bottom: 10px;">
                        Test Complete!
                    </div>
                    <div style="color: var(--text-light); margin-bottom: 30px;">
                        You've completed the ${testConfigs[appState.currentTest].title}.
                    </div>
                    <div style="display: inline-block; padding: 15px 30px; background-color: var(--pastel-green); border-radius: 15px; color: var(--control-color); font-weight: 700;">
                        ${appState.overallStats.controls} impulses resisted
                    </div>
                </div>
            `;
            
            // Update buttons
            startButtonEl.disabled = true;
            startButtonEl.innerHTML = '<i class="fas fa-check"></i> Test Completed';
            
            // Show results button after delay
            setTimeout(() => {
                startButtonEl.innerHTML = '<i class="fas fa-chart-bar"></i> View Results';
                startButtonEl.disabled = false;
                startButtonEl.onclick = showResults;
            }, 1500);
        }

        // Show results
        function showResults() {
            testContainerEl.style.display = 'none';
            resultsContainerEl.style.display = 'block';
            
            // Calculate final scores
            const totalResponses = appState.overallStats.impulses + appState.overallStats.controls;
            const controlPercentage = totalResponses > 0 ? 
                Math.round((appState.overallStats.controls / totalResponses) * 100) : 0;
            
            const avgReactionTime = appState.overallStats.reactionCount > 0 ? 
                Math.round(appState.overallStats.totalReactionTime / appState.overallStats.reactionCount) : 0;
            
            // Update results display
            finalScoreEl.textContent = `${controlPercentage}/100`;
            finalImpulseEl.textContent = appState.overallStats.impulses;
            finalControlEl.textContent = appState.overallStats.controls;
            finalReactionEl.textContent = `${avgReactionTime}ms`;
            finalAccuracyEl.textContent = `${controlPercentage}%`;
            
            // Determine result type
            let resultType = "";
            let resultDesc = "";
            
            if (controlPercentage >= 80) {
                resultType = "Excellent Self-Control";
                resultDesc = "You demonstrate strong impulse control and can resist temptations effectively. You're likely good at delaying gratification and making thoughtful decisions.";
            } else if (controlPercentage >= 60) {
                resultType = "Good Self-Control";
                resultDesc = "You have solid impulse control with room for improvement. You resist most temptations but occasionally give in to impulses.";
            } else if (controlPercentage >= 40) {
                resultType = "Moderate Self-Control";
                resultDesc = "Your impulse control is moderate. You resist some temptations but frequently act on impulses. Practice could help improve your self-control.";
            } else {
                resultType = "Developing Self-Control";
                resultDesc = "You tend to act on impulses frequently. With practice and mindfulness, you can develop stronger impulse control skills.";
            }
            
            resultTypeEl.textContent = resultType;
            resultDescEl.textContent = resultDesc;
        }

        // Reset all tests
        function resetAllTests() {
            // Reset app state
            appState.overallStats = {
                impulses: 0,
                controls: 0,
                totalReactionTime: 0,
                reactionCount: 0,
                accuracy: 0,
                testsCompleted: 0
            };
            
            appState.testData = {
                button: { impulses: 0, controls: 0, startTime: null, reactionTimes: [] },
                color: { correct: 0, incorrect: 0, startTime: null, reactionTimes: [] },
                delay: { earlyClicks: 0, delayedClicks: 0, rewards: 0, startTime: null },
                focus: { hits: 0, misses: 0, distractionsClicked: 0, startTime: null }
            };
            
            // Reset test selector
            document.querySelector('.test-card.button-test').click();
        }

        // Initialize the app when page loads
        document.addEventListener('DOMContentLoaded', initApp);