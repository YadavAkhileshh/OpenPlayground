// SilenceAsInput - Where doing nothing is the primary input
class SilenceAsInput {
    constructor() {
        this.stillnessProgress = 0;
        this.stillnessScore = 0;
        this.impulseResistance = 0;
        this.sessionStartTime = Date.now();
        this.currentStreakStart = Date.now();
        this.lastInteractionTime = Date.now();
        this.noiseEvents = [];
        this.patternData = [];
        this.isStill = true;
        this.resetCount = 0;
        this.bestStreak = this.loadBestStreak();
        this.soundEnabled = true;
        this.sensitivity = 'normal';
        this.zenModeActive = false;
        this.particles = [];
        this.achievements = this.initializeAchievements();
        this.unlockedAchievements = this.loadUnlockedAchievements();
        
        this.initializeElements();
        this.attachEventListeners();
        this.startMonitoring();
        this.initializeVisualization();
        this.initializeParticles();
        this.renderAchievements();
        this.initializeAudio();
    }

    initializeElements() {
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.progressValue = document.querySelector('.progress-value');
        this.statusText = document.getElementById('statusText');
        this.stillnessScoreEl = document.getElementById('stillnessScore');
        this.impulseResistanceEl = document.getElementById('impulseResistance');
        this.sessionTimeEl = document.getElementById('sessionTime');
        this.currentStreakEl = document.getElementById('currentStreak');
        this.bestStreakEl = document.getElementById('bestStreak');
        this.achievementCountEl = document.getElementById('achievementCount');
        this.noiseBars = document.getElementById('noiseBars');
        this.noiseLog = document.getElementById('noiseLog');
        this.patternCanvas = document.getElementById('patternCanvas');
        this.ctx = this.patternCanvas.getContext('2d');
        this.particleCanvas = document.getElementById('particleCanvas');
        this.particleCtx = this.particleCanvas.getContext('2d');
        this.breathingGuide = document.getElementById('breathingGuide');
        this.achievementsGrid = document.getElementById('achievementsGrid');
        this.zenMode = document.getElementById('zenMode');
        this.zenParticles = document.getElementById('zenParticles');
        this.zenParticleCtx = this.zenParticles.getContext('2d');
        this.zenValue = document.getElementById('zenValue');
        this.zenStreak = document.getElementById('zenStreak');
        
        // Set canvas sizes
        this.resizeCanvases();
        window.addEventListener('resize', () => this.resizeCanvases());
        
        // Initialize noise bars
        for (let i = 0; i < 30; i++) {
            const bar = document.createElement('div');
            bar.className = 'noise-bar';
            bar.style.height = '0px';
            this.noiseBars.appendChild(bar);
        }
    }

    attachEventListeners() {
        // Detect any interaction as "noise"
        const noiseEvents = ['mousemove', 'click', 'keydown', 'scroll', 'touchstart', 'wheel'];
        
        noiseEvents.forEach(eventType => {
            document.addEventListener(eventType, (e) => this.handleNoise(eventType, e));
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSession());

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportStats());

        // Zen mode
        document.getElementById('zenModeBtn').addEventListener('click', () => this.toggleZenMode());
        document.getElementById('exitZen').addEventListener('click', () => this.toggleZenMode());

        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', (e) => {
            this.soundEnabled = !this.soundEnabled;
            e.target.textContent = this.soundEnabled ? '🔊' : '🔇';
            e.target.classList.toggle('muted');
        });

        // Sensitivity mode
        document.getElementById('sensitivityMode').addEventListener('change', (e) => {
            this.sensitivity = e.target.value;
            this.playSound('click');
        });

        // Info modal
        const modal = document.getElementById('infoModal');
        const infoBtn = document.getElementById('infoBtn');
        const closeBtn = document.querySelector('.close');

        infoBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            this.handleNoise('modal_open');
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    handleNoise(type, event) {
        const now = Date.now();
        const timeSinceLastNoise = now - this.lastInteractionTime;
        
        // Sensitivity thresholds
        const thresholds = {
            strict: 50,
            normal: 100,
            relaxed: 200
        };
        
        // Ignore very rapid events based on sensitivity
        if (timeSinceLastNoise < thresholds[this.sensitivity]) return;

        this.lastInteractionTime = now;
        this.isStill = false;

        // Record noise event
        this.noiseEvents.push({
            type: type,
            timestamp: now,
            stillnessLost: this.stillnessProgress
        });

        // Update noise visualization
        this.updateNoiseVisualization(type);

        // Play noise sound
        this.playSound('noise');

        // Reset progress
        const lostProgress = this.stillnessProgress;
        this.stillnessProgress = 0;
        
        // Update best streak before reset
        const currentStreakSeconds = Math.floor((now - this.currentStreakStart) / 1000);
        if (currentStreakSeconds > this.bestStreak) {
            this.bestStreak = currentStreakSeconds;
            this.saveBestStreak();
            this.showNotification('🏆 New Best Streak!');
        }
        
        this.currentStreakStart = now;
        this.resetCount++;

        // Update impulse resistance (measures how many times user tried to interact)
        this.impulseResistance = Math.max(0, 100 - (this.resetCount * 5));

        // Check achievements
        this.checkAchievements();

        // Update status message
        this.statusText.textContent = `Movement detected! Progress lost: ${Math.round(lostProgress)}%`;
        this.statusText.classList.add('noise');
        
        // Create particle burst
        this.createParticleBurst();
        
        setTimeout(() => {
            this.statusText.classList.remove('noise');
            this.isStill = true;
            this.statusText.textContent = 'Be still. Do nothing. Just wait...';
        }, 2000);

        this.updateDisplay();
    }

    startMonitoring() {
        setInterval(() => {
            if (this.isStill) {
                // Build progress when still
                this.stillnessProgress = Math.min(100, this.stillnessProgress + 0.5);
                
                // Calculate stillness score (accumulated value)
                this.stillnessScore += Math.floor(this.stillnessProgress / 10);
                
                // Show breathing guide when making good progress
                if (this.stillnessProgress > 30) {
                    this.breathingGuide.classList.add('active');
                } else {
                    this.breathingGuide.classList.remove('active');
                }
                
                // Play ambient sound at milestones
                if (this.stillnessProgress === 25 || this.stillnessProgress === 50 || 
                    this.stillnessProgress === 75 || this.stillnessProgress === 100) {
                    this.playSound('milestone');
                }
                
                // Check achievements
                this.checkAchievements();
            }

            // Record pattern data
            this.patternData.push({
                timestamp: Date.now(),
                stillness: this.stillnessProgress,
                isStill: this.isStill
            });

            // Keep only last 100 data points
            if (this.patternData.length > 100) {
                this.patternData.shift();
            }

            this.updateDisplay();
            this.drawPattern();
            this.updateParticles();
        }, 100);

        // Update session time
        setInterval(() => {
            const sessionSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            this.sessionTimeEl.textContent = this.formatTime(sessionSeconds);

            const streakSeconds = Math.floor((Date.now() - this.currentStreakStart) / 1000);
            this.currentStreakEl.textContent = this.formatTime(streakSeconds);
            
            if (this.zenModeActive) {
                this.zenStreak.textContent = this.formatTime(streakSeconds);
            }
        }, 1000);
    }

    updateDisplay() {
        // Update progress circle
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (this.stillnessProgress / 100) * circumference;
        this.progressCircle.style.strokeDashoffset = offset;
        this.progressValue.textContent = `${Math.round(this.stillnessProgress)}%`;

        // Update metrics
        this.stillnessScoreEl.textContent = this.stillnessScore;
        this.impulseResistanceEl.textContent = Math.round(this.impulseResistance);
        this.bestStreakEl.textContent = this.formatTime(this.bestStreak);
        this.achievementCountEl.textContent = this.unlockedAchievements.length;
        
        // Update zen mode if active
        if (this.zenModeActive) {
            this.zenValue.textContent = `${Math.round(this.stillnessProgress)}%`;
        }
    }

    updateNoiseVisualization(type) {
        // Animate noise bars
        const bars = this.noiseBars.querySelectorAll('.noise-bar');
        bars.forEach((bar, index) => {
            const height = Math.random() * 80 + 20;
            bar.style.height = `${height}px`;
            
            setTimeout(() => {
                bar.style.height = '0px';
            }, 500);
        });

        // Add to noise log
        const logEntry = document.createElement('p');
        const time = new Date().toLocaleTimeString();
        logEntry.textContent = `${time} - ${type.toUpperCase()} detected - Progress reset`;
        this.noiseLog.insertBefore(logEntry, this.noiseLog.firstChild);

        // Keep only last 10 log entries
        while (this.noiseLog.children.length > 10) {
            this.noiseLog.removeChild(this.noiseLog.lastChild);
        }
    }

    initializeVisualization() {
        this.ctx.fillStyle = '#1e1e2e';
        this.ctx.fillRect(0, 0, this.patternCanvas.width, this.patternCanvas.height);
    }

    drawPattern() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(30, 30, 46, 0.1)';
        this.ctx.fillRect(0, 0, this.patternCanvas.width, this.patternCanvas.height);

        if (this.patternData.length < 2) return;

        const width = this.patternCanvas.width;
        const height = this.patternCanvas.height;
        const pointWidth = width / this.patternData.length;

        // Draw stillness line
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;

        this.patternData.forEach((data, index) => {
            const x = index * pointWidth;
            const y = height - (data.stillness / 100) * height;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();

        // Draw noise events as red dots
        this.ctx.fillStyle = '#ff6b6b';
        this.patternData.forEach((data, index) => {
            if (!data.isStill) {
                const x = index * pointWidth;
                const y = height - (data.stillness / 100) * height;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    resetSession() {
        this.stillnessProgress = 0;
        this.stillnessScore = 0;
        this.impulseResistance = 0;
        this.sessionStartTime = Date.now();
        this.currentStreakStart = Date.now();
        this.lastInteractionTime = Date.now();
        this.noiseEvents = [];
        this.patternData = [];
        this.resetCount = 0;
        this.isStill = true;
        this.particles = [];

        this.noiseLog.innerHTML = '';
        this.initializeVisualization();
        this.updateDisplay();
        
        this.statusText.textContent = 'Session reset. Be still...';
        this.playSound('reset');
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }

    // New methods for enhanced features
    initializeAchievements() {
        return [
            { id: 'first_moment', name: 'First Moment', desc: 'Reach 10% stillness', icon: '🌱', threshold: () => this.stillnessProgress >= 10 },
            { id: 'patience_grows', name: 'Patience Grows', desc: 'Reach 50% stillness', icon: '🌿', threshold: () => this.stillnessProgress >= 50 },
            { id: 'zen_master', name: 'Zen Master', desc: 'Reach 100% stillness', icon: '🧘', threshold: () => this.stillnessProgress >= 100 },
            { id: 'quiet_minute', name: 'Quiet Minute', desc: 'Stay still for 60s', icon: '⏱️', threshold: () => Math.floor((Date.now() - this.currentStreakStart) / 1000) >= 60 },
            { id: 'meditation', name: 'Meditation', desc: 'Stay still for 5 minutes', icon: '🕉️', threshold: () => Math.floor((Date.now() - this.currentStreakStart) / 1000) >= 300 },
            { id: 'monk_mode', name: 'Monk Mode', desc: 'Stay still for 10 minutes', icon: '🙏', threshold: () => Math.floor((Date.now() - this.currentStreakStart) / 1000) >= 600 },
            { id: 'resistance', name: 'Resistance', desc: 'Maintain 80+ impulse resistance', icon: '🛡️', threshold: () => this.impulseResistance >= 80 },
            { id: 'stillness_seeker', name: 'Stillness Seeker', desc: 'Earn 1000 stillness score', icon: '⭐', threshold: () => this.stillnessScore >= 1000 },
            { id: 'perfect_calm', name: 'Perfect Calm', desc: 'Earn 5000 stillness score', icon: '💎', threshold: () => this.stillnessScore >= 5000 },
            { id: 'first_reset', name: 'Impulse', desc: 'Experience your first reset', icon: '💥', threshold: () => this.resetCount >= 1 },
            { id: 'persistent', name: 'Persistent', desc: 'Get reset 10 times', icon: '🔄', threshold: () => this.resetCount >= 10 },
            { id: 'warrior', name: 'Warrior', desc: 'Get reset 50 times', icon: '⚔️', threshold: () => this.resetCount >= 50 }
        ];
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!this.unlockedAchievements.includes(achievement.id) && achievement.threshold()) {
                this.unlockAchievement(achievement.id);
            }
        });
    }

    unlockAchievement(achievementId) {
        this.unlockedAchievements.push(achievementId);
        this.saveUnlockedAchievements();
        this.renderAchievements();
        
        const achievement = this.achievements.find(a => a.id === achievementId);
        this.showNotification(`🎉 Achievement Unlocked: ${achievement.name}!`);
        this.playSound('achievement');
        
        // Highlight achievement count
        this.achievementCountEl.parentElement.classList.add('highlight');
        setTimeout(() => {
            this.achievementCountEl.parentElement.classList.remove('highlight');
        }, 500);
    }

    renderAchievements() {
        this.achievementsGrid.innerHTML = '';
        this.achievements.forEach(achievement => {
            const card = document.createElement('div');
            card.className = `achievement-card ${this.unlockedAchievements.includes(achievement.id) ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            `;
            card.title = achievement.desc;
            this.achievementsGrid.appendChild(card);
        });
    }

    initializeParticles() {
        // Particle system for visual feedback
        this.particleAnimationFrame = requestAnimationFrame(() => this.animateParticles());
    }

    createParticleBurst() {
        const centerX = this.particleCanvas.width / 2;
        const centerY = this.particleCanvas.height / 2;
        
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * (2 + Math.random() * 3),
                vy: Math.sin(angle) * (2 + Math.random() * 3),
                life: 1,
                color: `hsl(${Math.random() * 60 + 320}, 70%, 60%)`
            });
        }
    }

    updateParticles() {
        // Add gentle particles when still
        if (this.isStill && this.stillnessProgress > 20 && Math.random() < 0.1) {
            this.particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: this.particleCanvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -1 - Math.random(),
                life: 1,
                color: `hsla(${230 + Math.random() * 30}, 70%, 60%, 0.6)`
            });
        }
    }

    animateParticles() {
        const canvas = this.zenModeActive ? this.zenParticles : this.particleCanvas;
        const ctx = this.zenModeActive ? this.zenParticleCtx : this.particleCtx;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.01;
            
            if (particle.life > 0) {
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
                ctx.fill();
                return true;
            }
            return false;
        });
        
        ctx.globalAlpha = 1;
        this.particleAnimationFrame = requestAnimationFrame(() => this.animateParticles());
    }

    toggleZenMode() {
        this.zenModeActive = !this.zenModeActive;
        this.zenMode.classList.toggle('active');
        
        if (this.zenModeActive) {
            this.resizeCanvases();
            this.playSound('zen');
        }
    }

    resizeCanvases() {
        // Main particle canvas
        this.particleCanvas.width = this.particleCanvas.offsetWidth;
        this.particleCanvas.height = this.particleCanvas.offsetHeight;
        
        // Zen mode canvases
        if (this.zenModeActive) {
            this.zenParticles.width = window.innerWidth;
            this.zenParticles.height = window.innerHeight;
        }
    }

    initializeAudio() {
        // Create audio context for sound effects
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        switch(type) {
            case 'noise':
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;
            case 'milestone':
                oscillator.frequency.value = 523.25;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
                break;
            case 'achievement':
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
                    osc.start(ctx.currentTime + i * 0.1);
                    osc.stop(ctx.currentTime + i * 0.1 + 0.3);
                });
                break;
            case 'reset':
                oscillator.frequency.value = 440;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;
            case 'zen':
                oscillator.frequency.value = 396;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 1);
                break;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    exportStats() {
        const stats = {
            sessionTime: Math.floor((Date.now() - this.sessionStartTime) / 1000),
            currentStreak: Math.floor((Date.now() - this.currentStreakStart) / 1000),
            bestStreak: this.bestStreak,
            stillnessScore: this.stillnessScore,
            impulseResistance: this.impulseResistance,
            resetCount: this.resetCount,
            unlockedAchievements: this.unlockedAchievements.length,
            noiseEvents: this.noiseEvents.length,
            date: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `silence-session-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('📊 Stats exported!');
        this.playSound('click');
    }

    loadBestStreak() {
        return parseInt(localStorage.getItem('silenceAsInput_bestStreak')) || 0;
    }

    saveBestStreak() {
        localStorage.setItem('silenceAsInput_bestStreak', this.bestStreak.toString());
    }

    loadUnlockedAchievements() {
        const saved = localStorage.getItem('silenceAsInput_achievements');
        return saved ? JSON.parse(saved) : [];
    }

    saveUnlockedAchievements() {
        localStorage.setItem('silenceAsInput_achievements', JSON.stringify(this.unlockedAchievements));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new SilenceAsInput();
});