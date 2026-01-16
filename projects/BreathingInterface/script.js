document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const breathingCircle = document.getElementById('breathing-circle');
    const breathPhase = document.getElementById('breath-phase');
    const countdown = document.getElementById('countdown');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const patternButtons = document.querySelectorAll('.pattern-btn');
    const durationSelect = document.getElementById('duration');
    const soundToggle = document.getElementById('soundToggle');
    const themeToggle = document.getElementById('themeToggle');
    const indicators = document.querySelectorAll('.indicator');
    
    // Stats elements
    const totalBreaths = document.getElementById('totalBreaths');
    const sessionTime = document.getElementById('sessionTime');
    const currentPattern = document.getElementById('currentPattern');
    const completion = document.getElementById('completion');
    
    // Audio elements
    const inhaleSound = document.getElementById('inhaleSound');
    const exhaleSound = document.getElementById('exhaleSound');
    
    // Breathing patterns configuration
    const patterns = {
        '4-7-8': {
            name: '4-7-8 Method',
            inhale: 4,
            hold1: 7,
            exhale: 8,
            hold2: 0,
            color: '#4a6fa5'
        },
        'box': {
            name: 'Box Breathing',
            inhale: 4,
            hold1: 4,
            exhale: 4,
            hold2: 4,
            color: '#9bc1bc'
        },
        'deep': {
            name: 'Deep Breathing',
            inhale: 5,
            hold1: 2,
            exhale: 5,
            hold2: 0,
            color: '#f18f01'
        }
    };
    
    // Session state
    let session = {
        active: false,
        paused: false,
        currentPattern: '4-7-8',
        duration: 2, // minutes
        startTime: null,
        elapsedTime: 0,
        breathCount: 0,
        currentPhase: 'inhale',
        phaseTimeLeft: 0,
        timer: null,
        sessionTimer: null
    };
    
    // Initialize
    updateStats();
    setPattern('4-7-8');
    
    // Event Listeners
    startBtn.addEventListener('click', startSession);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetSession);
    
    patternButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pattern = this.dataset.pattern;
            setPattern(pattern);
            if (!session.active) {
                resetSession();
            }
        });
    });
    
    durationSelect.addEventListener('change', function() {
        session.duration = parseInt(this.value);
        updateStats();
    });
    
    soundToggle.addEventListener('change', function() {
        // Sound toggle handled in phase functions
    });
    
    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
        localStorage.setItem('darkMode', this.checked);
    });
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    themeToggle.checked = savedTheme;
    document.body.classList.toggle('dark-mode', savedTheme);
    
    // Functions
    function setPattern(pattern) {
        session.currentPattern = pattern;
        currentPattern.textContent = patterns[pattern].name;
        
        // Update active button
        patternButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pattern === pattern);
        });
        
        // Update circle color
        document.documentElement.style.setProperty('--primary', patterns[pattern].color);
        
        // Reset if session is not active
        if (!session.active) {
            resetPhase();
        }
    }
    
    function startSession() {
        if (session.active && !session.paused) return;
        
        if (!session.active) {
            session.active = true;
            session.startTime = Date.now();
            session.elapsedTime = 0;
            session.breathCount = 0;
            startBreathCycle();
            startSessionTimer();
        } else if (session.paused) {
            session.paused = false;
            startBreathCycle();
            startSessionTimer();
        }
        
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Session Active';
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
    
    function togglePause() {
        if (!session.active) return;
        
        session.paused = !session.paused;
        
        if (session.paused) {
            clearInterval(session.timer);
            clearInterval(session.sessionTimer);
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            breathingCircle.style.animationPlayState = 'paused';
        } else {
            startBreathCycle();
            startSessionTimer();
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            breathingCircle.style.animationPlayState = 'running';
        }
    }
    
    function resetSession() {
        clearInterval(session.timer);
        clearInterval(session.sessionTimer);
        
        session.active = false;
        session.paused = false;
        session.elapsedTime = 0;
        session.breathCount = 0;
        
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Session';
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        resetPhase();
        updateStats();
    }
    
    function resetPhase() {
        const pattern = patterns[session.currentPattern];
        breathPhase.textContent = 'Ready';
        countdown.textContent = pattern.inhale;
        indicators.forEach(indicator => indicator.classList.remove('active'));
        indicators[0].classList.add('active');
        breathingCircle.style.transform = 'scale(1)';
        breathingCircle.className = 'inner-circle';
    }
    
    function startBreathCycle() {
        const pattern = patterns[session.currentPattern];
        let phaseIndex = 0;
        const phases = [
            { name: 'inhale', duration: pattern.inhale, indicator: 0, sound: inhaleSound },
            { name: 'hold1', duration: pattern.hold1, indicator: 1 },
            { name: 'exhale', duration: pattern.exhale, indicator: 2, sound: exhaleSound },
            { name: 'hold2', duration: pattern.hold2, indicator: 3 }
        ];
        
        // Remove hold phases if duration is 0
        const activePhases = phases.filter(phase => phase.duration > 0);
        
        function executePhase(index) {
            const phase = activePhases[index];
            session.currentPhase = phase.name;
            session.phaseTimeLeft = phase.duration;
            
            // Update UI
            breathPhase.textContent = formatPhaseName(phase.name);
            countdown.textContent = phase.duration;
            
            // Update indicators
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === phase.indicator);
            });
            
            // Breathing animation
            breathingCircle.className = 'inner-circle';
            if (phase.name === 'inhale') {
                breathingCircle.classList.add('breathing-in');
                breathingCircle.style.animationDuration = `${phase.duration}s`;
            } else if (phase.name === 'exhale') {
                breathingCircle.classList.add('breathing-out');
                breathingCircle.style.animationDuration = `${phase.duration}s`;
            }
            
            // Play sound if enabled
            if (phase.sound && soundToggle.checked) {
                phase.sound.currentTime = 0;
                phase.sound.play();
            }
            
            // Countdown timer
            clearInterval(session.timer);
            session.timer = setInterval(() => {
                session.phaseTimeLeft--;
                countdown.textContent = session.phaseTimeLeft;
                
                if (session.phaseTimeLeft <= 0) {
                    clearInterval(session.timer);
                    
                    // Count breath
                    if (phase.name === 'exhale') {
                        session.breathCount++;
                        updateStats();
                    }
                    
                    // Check if session duration reached
                    if (session.elapsedTime >= session.duration * 60) {
                        endSession();
                        return;
                    }
                    
                    // Move to next phase
                    const nextIndex = (index + 1) % activePhases.length;
                    executePhase(nextIndex);
                }
            }, 1000);
        }
        
        executePhase(phaseIndex);
    }
    
    function startSessionTimer() {
        clearInterval(session.sessionTimer);
        session.sessionTimer = setInterval(() => {
            if (!session.paused) {
                session.elapsedTime++;
                updateStats();
                
                // Check if session duration reached
                if (session.elapsedTime >= session.duration * 60) {
                    endSession();
                }
            }
        }, 1000);
    }
    
    function endSession() {
        clearInterval(session.timer);
        clearInterval(session.sessionTimer);
        
        session.active = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-redo"></i> Start New Session';
        
        // Show completion message
        breathPhase.textContent = 'Session Complete!';
        countdown.textContent = '✓';
        
        // Play completion sound
        if (soundToggle.checked) {
            exhaleSound.currentTime = 0;
            exhaleSound.play();
        }
        
        alert('Great job! You completed your breathing session. Take a moment to notice how you feel.');
    }
    
    function formatPhaseName(phase) {
        const names = {
            inhale: 'Breathe In',
            exhale: 'Breathe Out',
            hold1: 'Hold',
            hold2: 'Hold'
        };
        return names[phase] || phase;
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function updateStats() {
        totalBreaths.textContent = session.breathCount;
        sessionTime.textContent = formatTime(session.elapsedTime);
        
        const totalSeconds = session.duration * 60;
        const percent = totalSeconds > 0 ? Math.min(100, Math.round((session.elapsedTime / totalSeconds) * 100)) : 0;
        completion.textContent = `${percent}%`;
    }
    
    // Add some sample statistics for demo
    setInterval(() => {
        if (session.active && !session.paused) {
            // Simulate some random breath counts for demo
            const randomChange = Math.random() > 0.7 ? 1 : 0;
            session.breathCount += randomChange;
            updateStats();
        }
    }, 3000);
});