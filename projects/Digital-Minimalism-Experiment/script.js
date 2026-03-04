
        class MinimalismExperiment {
            constructor() {
                this.state = {
                    running: false,
                    paused: false,
                    startTime: null,
                    elapsedTime: 0,
                    totalTime: 300, // 5 minutes default
                    distractionsShown: 0,
                    distractionsClicked: 0,
                    score: 100,
                    distractionInterval: null,
                    visualComplexity: 5
                };

                this.distractionTypes = [
                    {
                        name: 'notification',
                        title: 'New Notification',
                        content: 'You have 3 new messages',
                        icon: 'fas fa-bell'
                    },
                    {
                        name: 'social',
                        title: 'Social Update',
                        content: 'Your friend posted a new photo',
                        icon: 'fas fa-user-friends'
                    },
                    {
                        name: 'advertisement',
                        title: 'Special Offer',
                        content: 'Limited time discount! Click here!',
                        icon: 'fas fa-ad'
                    },
                    {
                        name: 'email',
                        title: 'New Email',
                        content: 'Important update requires attention',
                        icon: 'fas fa-envelope'
                    },
                    {
                        name: 'update',
                        title: 'System Update',
                        content: 'Restart required to install updates',
                        icon: 'fas fa-sync'
                    }
                ];

                this.init();
            }

            init() {
                this.bindElements();
                this.bindEvents();
                this.updateVisualComplexity();
            }

            bindElements() {
                this.elements = {
                    startBtn: document.getElementById('start-btn'),
                    pauseBtn: document.getElementById('pause-btn'),
                    resetBtn: document.getElementById('reset-btn'),
                    timer: document.getElementById('timer'),
                    score: document.getElementById('minimalism-score'),
                    distractionsShown: document.getElementById('distractions-shown'),
                    distractionsClicked: document.getElementById('distractions-clicked'),
                    resistanceRate: document.getElementById('resistance-rate'),
                    distractionLevel: document.getElementById('distraction-level'),
                    sessionTime: document.getElementById('session-time'),
                    visualComplexity: document.getElementById('visual-complexity'),
                    mainInterface: document.getElementById('main-interface'),
                    focusText: document.getElementById('focus-text'),
                    interactionHint: document.getElementById('interaction-hint'),
                    motionToggle: document.getElementById('motion-toggle'),
                    contrastToggle: document.getElementById('contrast-toggle'),
                    tipsContainer: document.getElementById('tips-container'),
                    accessibilityBadge: document.getElementById('accessibility-badge')
                };
            }

            bindEvents() {
                this.elements.startBtn.addEventListener('click', () => this.toggleExperiment());
                this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
                this.elements.resetBtn.addEventListener('click', () => this.resetExperiment());
                this.elements.distractionLevel.addEventListener('change', (e) => this.updateDistractionSettings());
                this.elements.sessionTime.addEventListener('change', (e) => {
                    this.state.totalTime = parseInt(e.target.value);
                    this.updateTimerDisplay();
                });
                this.elements.visualComplexity.addEventListener('input', (e) => {
                    this.state.visualComplexity = parseInt(e.target.value);
                    this.updateVisualComplexity();
                });
                this.elements.motionToggle.addEventListener('click', () => this.toggleMotion());
                this.elements.contrastToggle.addEventListener('click', () => this.toggleContrast());
            }

            toggleExperiment() {
                if (!this.state.running) {
                    this.startExperiment();
                } else {
                    this.stopExperiment();
                }
            }

            startExperiment() {
                this.state.running = true;
                this.state.startTime = Date.now() - this.state.elapsedTime * 1000;
                this.state.distractionsShown = 0;
                this.state.distractionsClicked = 0;
                this.state.score = 100;

                this.elements.startBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Experiment';
                this.elements.pauseBtn.disabled = false;
                this.elements.focusText.textContent = 'Maintain focus... Breathe deeply...';
                this.elements.interactionHint.textContent = 'Distractions appearing. Resist the urge to click.';

                this.updateStats();
                this.startTimer();
                this.startDistractions();
            }

            stopExperiment() {
                this.state.running = false;
                this.state.paused = false;
                
                this.elements.startBtn.innerHTML = '<i class="fas fa-play"></i> Start Experiment';
                this.elements.pauseBtn.disabled = true;
                this.elements.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                this.elements.focusText.textContent = 'Session Complete';
                this.elements.interactionHint.textContent = 'Review your minimalism score and reflection tips.';

                clearInterval(this.state.timerInterval);
                clearInterval(this.state.distractionInterval);
                
                this.showFinalResults();
            }

            togglePause() {
                if (!this.state.running) return;

                this.state.paused = !this.state.paused;
                
                if (this.state.paused) {
                    clearInterval(this.state.timerInterval);
                    clearInterval(this.state.distractionInterval);
                    this.elements.pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                    this.elements.focusText.textContent = 'Paused';
                } else {
                    this.startTimer();
                    this.startDistractions();
                    this.state.startTime = Date.now() - this.state.elapsedTime * 1000;
                    this.elements.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                    this.elements.focusText.textContent = 'Maintain focus... Breathe deeply...';
                }
            }

            startTimer() {
                clearInterval(this.state.timerInterval);
                
                this.state.timerInterval = setInterval(() => {
                    if (!this.state.paused) {
                        this.state.elapsedTime = Math.floor((Date.now() - this.state.startTime) / 1000);
                        
                        if (this.state.elapsedTime >= this.state.totalTime) {
                            this.stopExperiment();
                            return;
                        }
                        
                        this.updateTimerDisplay();
                    }
                }, 1000);
            }

            updateTimerDisplay() {
                const remaining = this.state.totalTime - this.state.elapsedTime;
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                this.elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            startDistractions() {
                clearInterval(this.state.distractionInterval);
                
                const level = this.elements.distractionLevel.value;
                let interval, intensity;
                
                switch(level) {
                    case 'low':
                        interval = 15000; // 15 seconds
                        intensity = 0.7;
                        break;
                    case 'high':
                        interval = 5000; // 5 seconds
                        intensity = 1.3;
                        break;
                    default:
                        interval = 10000; // 10 seconds
                        intensity = 1.0;
                }
                
                this.state.distractionInterval = setInterval(() => {
                    if (!this.state.paused && this.state.running) {
                        this.showDistraction(intensity);
                    }
                }, interval);
            }

            showDistraction(intensity) {
                const type = this.distractionTypes[Math.floor(Math.random() * this.distractionTypes.length)];
                const distraction = document.createElement('div');
                distraction.className = `distraction ${type.name}`;
                
                // Random position
                const x = Math.random() * (window.innerWidth - 200);
                const y = Math.random() * (window.innerHeight - 100);
                
                distraction.style.left = `${x}px`;
                distraction.style.top = `${y}px`;
                distraction.style.opacity = '0';
                distraction.style.transform = 'translateY(20px)';
                
                distraction.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="${type.icon}" style="font-size: 1.2rem;"></i>
                        <div>
                            <strong>${type.title}</strong>
                            <div style="font-size: 0.9rem;">${type.content}</div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(distraction);
                
                // Animate in
                setTimeout(() => {
                    distraction.style.opacity = '1';
                    distraction.style.transform = 'translateY(0)';
                }, 10);
                
                // Remove after timeout
                setTimeout(() => {
                    if (distraction.parentNode) {
                        distraction.style.opacity = '0';
                        distraction.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            if (distraction.parentNode) {
                                distraction.parentNode.removeChild(distraction);
                            }
                        }, 300);
                    }
                }, 5000 * intensity);
                
                // Click handler
                distraction.addEventListener('click', () => {
                    this.handleDistractionClick(distraction, intensity);
                });
                
                this.state.distractionsShown++;
                this.updateStats();
            }

            handleDistractionClick(distraction, intensity) {
                this.state.distractionsClicked++;
                
                // Calculate score penalty based on intensity
                const penalty = Math.floor(5 * intensity);
                this.state.score = Math.max(0, this.state.score - penalty);
                
                // Visual feedback
                distraction.style.borderColor = 'var(--accent)';
                distraction.style.boxShadow = '0 0 20px var(--accent)';
                
                // Update focus text temporarily
                const originalText = this.elements.focusText.textContent;
                this.elements.focusText.textContent = 'Distraction clicked! Return to focus...';
                this.elements.focusText.style.color = 'var(--accent)';
                
                setTimeout(() => {
                    this.elements.focusText.textContent = originalText;
                    this.elements.focusText.style.color = '';
                }, 2000);
                
                this.updateStats();
                
                // Remove distraction immediately
                setTimeout(() => {
                    if (distraction.parentNode) {
                        distraction.parentNode.removeChild(distraction);
                    }
                }, 1000);
            }

            updateStats() {
                this.elements.score.textContent = this.state.score;
                this.elements.distractionsShown.textContent = this.state.distractionsShown;
                this.elements.distractionsClicked.textContent = this.state.distractionsClicked;
                
                const resistanceRate = this.state.distractionsShown > 0 
                    ? Math.round((1 - this.state.distractionsClicked / this.state.distractionsShown) * 100)
                    : 100;
                this.elements.resistanceRate.textContent = `${resistanceRate}%`;
                
                // Update tips based on score
                this.updateTips();
            }

            updateTips() {
                let tips = [];
                
                if (this.state.score >= 80) {
                    tips.push({
                        icon: 'fas fa-medal',
                        color: 'var(--success)',
                        text: 'Excellent focus! You maintain strong digital discipline.'
                    });
                } else if (this.state.score >= 60) {
                    tips.push({
                        icon: 'fas fa-thumbs-up',
                        color: 'var(--warning)',
                        text: 'Good resistance. Consider longer focus sessions.'
                    });
                } else {
                    tips.push({
                        icon: 'fas fa-lightbulb',
                        color: 'var(--accent)',
                        text: 'Practice mindfulness to improve digital minimalism.'
                    });
                }
                
                if (this.state.distractionsClicked > 0) {
                    tips.push({
                        icon: 'fas fa-mouse-pointer',
                        color: 'var(--accent)',
                        text: `You clicked ${this.state.distractionsClicked} distraction(s). Try observing without interacting.`
                    });
                }
                
                tips.push({
                    icon: 'fas fa-hourglass-end',
                    color: 'var(--secondary)',
                    text: 'Regular practice improves digital dependency resistance.'
                });
                
                this.elements.tipsContainer.innerHTML = tips.map(tip => `
                    <div class="tip-item">
                        <i class="${tip.icon}" style="color: ${tip.color};"></i>
                        <span>${tip.text}</span>
                    </div>
                `).join('');
            }

            updateVisualComplexity() {
                const complexity = this.state.visualComplexity;
                const interfaceEl = this.elements.mainInterface;
                
                // Adjust visual elements based on complexity
                interfaceEl.style.background = complexity > 7 
                    ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                    : complexity > 4
                    ? 'white'
                    : '#f8f9fa';
                
                interfaceEl.style.boxShadow = complexity > 6
                    ? '0 10px 30px rgba(0,0,0,0.1)'
                    : '0 2px 10px rgba(0,0,0,0.05)';
                
                // Update complexity score display
                const complexityScore = 100 - (complexity - 1) * 10;
                document.querySelector('.stat-value').textContent = complexityScore;
            }

            toggleMotion() {
                document.body.classList.toggle('motion-reduced');
                const badge = this.elements.accessibilityBadge;
                if (document.body.classList.contains('motion-reduced')) {
                    badge.innerHTML = '<i class="fas fa-universal-access"></i><span>Reduced Motion Active</span>';
                } else {
                    badge.innerHTML = '<i class="fas fa-universal-access"></i><span>Accessibility Features Active</span>';
                }
            }

            toggleContrast() {
                document.body.classList.toggle('high-contrast');
                const badge = this.elements.accessibilityBadge;
                if (document.body.classList.contains('high-contrast')) {
                    badge.innerHTML = '<i class="fas fa-universal-access"></i><span>High Contrast Active</span>';
                } else {
                    badge.innerHTML = '<i class="fas fa-universal-access"></i><span>Accessibility Features Active</span>';
                }
            }

            showFinalResults() {
                const results = `
                    <div style="text-align: center; padding: 20px;">
                        <h3 style="color: var(--primary); margin-bottom: 20px;">Experiment Complete</h3>
                        <div style="font-size: 4rem; color: var(--secondary); margin: 20px 0;">
                            ${this.state.score}
                        </div>
                        <p style="margin-bottom: 20px; color: #7f8c8d;">
                            Final Minimalism Score
                        </p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: var(--border-radius); margin: 20px 0;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left;">
                                <div>Distractions Shown:</div>
                                <div style="text-align: right; font-weight: bold;">${this.state.distractionsShown}</div>
                                <div>Distractions Clicked:</div>
                                <div style="text-align: right; font-weight: bold; color: var(--accent);">${this.state.distractionsClicked}</div>
                                <div>Resistance Rate:</div>
                                <div style="text-align: right; font-weight: bold; color: var(--success);">
                                    ${this.state.distractionsShown > 0 ? Math.round((1 - this.state.distractionsClicked / this.state.distractionsShown) * 100) : 100}%
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                this.elements.mainInterface.innerHTML = results;
            }

            resetExperiment() {
                this.stopExperiment();
                this.state.elapsedTime = 0;
                this.state.distractionsShown = 0;
                this.state.distractionsClicked = 0;
                this.state.score = 100;
                
                this.elements.timer.textContent = '05:00';
                this.elements.focusText.textContent = 'Focus on your breath. Inhale... Exhale...';
                this.elements.interactionHint.textContent = 'Distractions will appear. Try to ignore them.';
                
                // Clear all distractions
                document.querySelectorAll('.distraction').forEach(d => d.remove());
                
                this.updateStats();
                this.updateTips();
            }

            updateDistractionSettings() {
                if (this.state.running && !this.state.paused) {
                    this.startDistractions();
                }
            }
        }

        // Initialize the experiment when page loads
        document.addEventListener('DOMContentLoaded', () => {
            window.experiment = new MinimalismExperiment();
            
            // Set initial timer display
            const sessionTime = document.getElementById('session-time');
            const totalSeconds = parseInt(sessionTime.value);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });
    