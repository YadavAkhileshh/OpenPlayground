// ===========================
// LagIsTheEnemy - Game Engine
// ===========================

class LagIsTheEnemy {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.perfCanvas = document.getElementById('performanceGraph');
        this.perfCtx = this.perfCanvas.getContext('2d');
        this.lagCanvas = document.getElementById('lagTimeline');
        this.lagCtx = this.lagCanvas.getContext('2d');
        
        this.setupCanvas();
        
        // Game State
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.mode = 'training';
        this.lagProfile = 'constant';
        
        // Lag Configuration
        this.lagProfiles = {
            constant: { baseDelay: 200, type: 'constant' },
            spike: { baseDelay: 100, spikeDelay: 500, spikeProbability: 0.2, type: 'spike' },
            jitter: { minDelay: 50, maxDelay: 300, type: 'jitter' },
            packetLoss: { baseDelay: 150, dropRate: 0.15, type: 'packetLoss' },
            progressive: { startDelay: 50, increment: 10, currentDelay: 50, type: 'progressive' }
        };
        
        this.currentLag = 0;
        this.inputQueue = [];
        
        // Game Objects
        this.targets = [];
        this.particles = [];
        this.ghostClicks = []; // Visual feedback for delayed inputs
        
        // Scoring & Stats
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.predictionScore = 0;
        this.wave = 1;
        this.gameTime = 0;
        this.startTime = 0;
        
        // Performance Tracking
        this.performanceData = [];
        this.lagHistory = [];
        this.accuracyHistory = [];
        this.sessionHistory = [];
        
        // Adaptive Difficulty
        this.adaptiveSettings = {
            targetAccuracy: 0.7,
            adjustmentRate: 0.1,
            minLag: 50,
            maxLag: 1000
        };
        
        // Challenge Mode Settings
        this.challengeMode = {
            perfect: { allowedMisses: 0, targetCount: 20 },
            endurance: { lagIncrease: 5, waveInterval: 10 }
        };
        
        // Achievements
        this.achievements = {
            firstBlood: false,
            comboKing: false,
            predictor: false,
            speedDemon: false,
            lagMaster: false
        };
        
        // Animation Frame
        this.animationId = null;
        this.lastUpdate = 0;
        
        this.initEventListeners();
        this.loadSessionHistory();
    }
    
    setupCanvas() {
        // Main game canvas
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Performance graph
        this.perfCanvas.width = 400;
        this.perfCanvas.height = 150;
        
        // Lag timeline
        this.lagCanvas.width = 400;
        this.lagCanvas.height = 100;
    }
    
    initEventListeners() {
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.mode = e.target.dataset.mode;
                
                // Show/hide custom config
                const customConfig = document.querySelector('.custom-config');
                customConfig.style.display = this.mode === 'custom' ? 'block' : 'none';
            });
        });
        
        // Lag profile selection
        document.querySelectorAll('.lag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.lag-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.lagProfile = e.target.dataset.lag;
            });
        });
        
        // Custom settings
        const baseDelaySlider = document.getElementById('baseDelay');
        const spikeSlider = document.getElementById('spikeProbability');
        const dropSlider = document.getElementById('dropRate');
        
        baseDelaySlider.addEventListener('input', (e) => {
            document.getElementById('delayValue').textContent = e.target.value;
            this.lagProfiles.constant.baseDelay = parseInt(e.target.value);
        });
        
        spikeSlider.addEventListener('input', (e) => {
            document.getElementById('spikeValue').textContent = e.target.value;
            this.lagProfiles.spike.spikeProbability = parseFloat(e.target.value);
        });
        
        dropSlider.addEventListener('input', (e) => {
            document.getElementById('dropValue').textContent = e.target.value;
            this.lagProfiles.packetLoss.dropRate = parseFloat(e.target.value);
        });
        
        // Game controls
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        
        // Canvas click with lag simulation
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState !== 'playing') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Add to input queue with lag
            this.queueInput(x, y);
            
            // Visual feedback for immediate click
            this.createGhostClick(x, y);
        });
    }
    
    queueInput(x, y) {
        const profile = this.lagProfiles[this.lagProfile];
        let delay = this.calculateLag(profile);
        
        // Check for packet loss
        if (profile.type === 'packetLoss' && Math.random() < profile.dropRate) {
            // Input dropped!
            this.createDroppedInputEffect(x, y);
            return;
        }
        
        this.currentLag = delay;
        this.lagHistory.push(delay);
        
        // Queue the input
        this.inputQueue.push({
            x: x,
            y: y,
            executeAt: Date.now() + delay
        });
        
        this.updateLagDisplay(delay);
    }
    
    calculateLag(profile) {
        switch (profile.type) {
            case 'constant':
                return profile.baseDelay;
            
            case 'spike':
                return Math.random() < profile.spikeProbability 
                    ? profile.spikeDelay 
                    : profile.baseDelay;
            
            case 'jitter':
                return profile.minDelay + Math.random() * (profile.maxDelay - profile.minDelay);
            
            case 'packetLoss':
                return profile.baseDelay;
            
            case 'progressive':
                const delay = profile.currentDelay;
                profile.currentDelay += profile.increment;
                return delay;
            
            default:
                return 0;
        }
    }
    
    processInputQueue() {
        const now = Date.now();
        
        // Process inputs that have waited long enough
        this.inputQueue = this.inputQueue.filter(input => {
            if (now >= input.executeAt) {
                this.handleClick(input.x, input.y);
                return false; // Remove from queue
            }
            return true; // Keep in queue
        });
    }
    
    handleClick(x, y) {
        let hitTarget = false;
        
        // Check if click hits any target
        this.targets = this.targets.filter(target => {
            if (!target.hit && this.checkCollision(x, y, target)) {
                hitTarget = true;
                target.hit = true;
                
                // Calculate prediction score
                const predictionBonus = this.calculatePredictionBonus(target);
                
                this.hits++;
                this.combo++;
                this.bestCombo = Math.max(this.bestCombo, this.combo);
                
                const points = 100 * (1 + this.combo * 0.1) * (1 + predictionBonus);
                this.score += Math.floor(points);
                this.predictionScore += predictionBonus * 100;
                
                // Create hit effect
                this.createHitEffect(target.x, target.y, points);
                
                // Check achievements
                this.checkAchievements();
                
                return false; // Remove target
            }
            return true;
        });
        
        if (!hitTarget) {
            this.misses++;
            this.combo = 0;
            this.createMissEffect(x, y);
        }
        
        this.updateStats();
    }
    
    calculatePredictionBonus(target) {
        // Bonus based on how well the player predicted the target movement
        const targetAge = (Date.now() - target.spawnTime) / 1000;
        const expectedPosition = {
            x: target.spawnX + target.vx * targetAge,
            y: target.spawnY + target.vy * targetAge
        };
        
        const distance = Math.sqrt(
            Math.pow(target.x - expectedPosition.x, 2) +
            Math.pow(target.y - expectedPosition.y, 2)
        );
        
        // Closer prediction = higher bonus
        const bonus = Math.max(0, 1 - distance / 100);
        return bonus;
    }
    
    checkCollision(x, y, target) {
        const distance = Math.sqrt(
            Math.pow(x - target.x, 2) +
            Math.pow(y - target.y, 2)
        );
        return distance < target.radius;
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.resetGameStats();
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('resetBtn').style.display = 'block';
        document.getElementById('instructions').style.display = 'none';
        
        // Reset progressive lag
        if (this.lagProfile === 'progressive') {
            this.lagProfiles.progressive.currentDelay = this.lagProfiles.progressive.startDelay;
        }
        
        this.spawnTarget();
        this.gameLoop();
    }
    
    resetGame() {
        this.gameState = 'menu';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.targets = [];
        this.particles = [];
        this.ghostClicks = [];
        this.inputQueue = [];
        this.resetGameStats();
        
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('resetBtn').style.display = 'none';
        document.getElementById('instructions').style.display = 'block';
        document.getElementById('gameOver').style.display = 'none';
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMenu();
    }
    
    resetGameStats() {
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.predictionScore = 0;
        this.wave = 1;
        this.gameTime = 0;
        this.performanceData = [];
        this.lagHistory = [];
        this.accuracyHistory = [];
        this.updateStats();
    }
    
    spawnTarget() {
        const padding = 50;
        const target = {
            x: padding + Math.random() * (this.canvas.width - padding * 2),
            y: padding + Math.random() * (this.canvas.height - padding * 2),
            radius: 20 + Math.random() * 20,
            spawnTime: Date.now(),
            spawnX: 0,
            spawnY: 0,
            vx: (Math.random() - 0.5) * 100, // pixels per second
            vy: (Math.random() - 0.5) * 100,
            lifetime: 3000 + Math.random() * 2000,
            hit: false,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };
        
        target.spawnX = target.x;
        target.spawnY = target.y;
        
        this.targets.push(target);
    }
    
    updateTargets(deltaTime) {
        const now = Date.now();
        
        this.targets = this.targets.filter(target => {
            // Update position
            target.x += target.vx * deltaTime / 1000;
            target.y += target.vy * deltaTime / 1000;
            
            // Bounce off walls
            if (target.x < target.radius || target.x > this.canvas.width - target.radius) {
                target.vx *= -1;
                target.x = Math.max(target.radius, Math.min(this.canvas.width - target.radius, target.x));
            }
            if (target.y < target.radius || target.y > this.canvas.height - target.radius) {
                target.vy *= -1;
                target.y = Math.max(target.radius, Math.min(this.canvas.height - target.radius, target.y));
            }
            
            // Check lifetime
            const age = now - target.spawnTime;
            if (age > target.lifetime && !target.hit) {
                this.misses++;
                this.combo = 0;
                this.createExpireEffect(target.x, target.y);
                return false;
            }
            
            return !target.hit;
        });
        
        // Spawn new targets based on mode
        this.spawnNewTargets();
    }
    
    spawnNewTargets() {
        const targetCount = Math.min(5, 1 + Math.floor(this.wave / 3));
        
        if (this.targets.length < targetCount) {
            this.spawnTarget();
        }
        
        // Wave progression
        if (this.hits > 0 && this.hits % 10 === 0 && this.targets.length === 0) {
            this.wave++;
            document.getElementById('wave').textContent = this.wave;
            
            // Endurance mode: increase lag
            if (this.mode === 'endurance') {
                const profile = this.lagProfiles[this.lagProfile];
                if (profile.baseDelay !== undefined) {
                    profile.baseDelay += this.challengeMode.endurance.lagIncrease;
                }
            }
        }
    }
    
    updateStats() {
        document.getElementById('currentScore').textContent = Math.floor(this.score);
        
        const accuracy = this.hits + this.misses > 0 
            ? (this.hits / (this.hits + this.misses) * 100).toFixed(1) 
            : 100;
        document.getElementById('accuracy').textContent = accuracy + '%';
        
        document.getElementById('predictionScore').textContent = Math.floor(this.predictionScore);
        document.getElementById('combo').textContent = this.combo;
        
        const avgLag = this.lagHistory.length > 0
            ? Math.floor(this.lagHistory.reduce((a, b) => a + b, 0) / this.lagHistory.length)
            : 0;
        document.getElementById('avgLag').textContent = avgLag + 'ms';
        
        // Record for adaptive difficulty
        this.accuracyHistory.push(parseFloat(accuracy));
        this.performanceData.push({
            time: this.gameTime,
            score: this.score,
            accuracy: parseFloat(accuracy),
            lag: this.currentLag
        });
        
        // Adaptive difficulty adjustment
        if (this.mode === 'adaptive' && this.accuracyHistory.length > 10) {
            this.adjustAdaptiveDifficulty();
        }
        
        // Check perfect play mode failure
        if (this.mode === 'perfect' && this.misses > this.challengeMode.perfect.allowedMisses) {
            this.gameOver();
        }
    }
    
    adjustAdaptiveDifficulty() {
        const recentAccuracy = this.accuracyHistory.slice(-10);
        const avgAccuracy = recentAccuracy.reduce((a, b) => a + b, 0) / recentAccuracy.length / 100;
        
        const profile = this.lagProfiles[this.lagProfile];
        
        if (avgAccuracy > this.adaptiveSettings.targetAccuracy + 0.1) {
            // Player is doing too well, increase lag
            if (profile.baseDelay !== undefined) {
                profile.baseDelay = Math.min(
                    this.adaptiveSettings.maxLag,
                    profile.baseDelay + 20
                );
            }
        } else if (avgAccuracy < this.adaptiveSettings.targetAccuracy - 0.1) {
            // Player is struggling, decrease lag
            if (profile.baseDelay !== undefined) {
                profile.baseDelay = Math.max(
                    this.adaptiveSettings.minLag,
                    profile.baseDelay - 20
                );
            }
        }
    }
    
    updateLagDisplay(lag) {
        document.getElementById('currentLag').textContent = Math.floor(lag) + 'ms';
        document.getElementById('lagDisplay').textContent = Math.floor(lag) + 'ms';
        
        // Update lag bar
        const lagBar = document.getElementById('lagBar');
        const percentage = Math.min(100, (lag / 1000) * 100);
        lagBar.style.width = percentage + '%';
        
        // Color based on severity
        if (lag < 200) {
            lagBar.style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
        } else if (lag < 400) {
            lagBar.style.background = 'linear-gradient(90deg, #fbbf24, #f59e0b)';
        } else {
            lagBar.style.background = 'linear-gradient(90deg, #f87171, #ef4444)';
        }
    }
    
    createGhostClick(x, y) {
        this.ghostClicks.push({
            x: x,
            y: y,
            alpha: 1,
            radius: 10,
            createdAt: Date.now()
        });
    }
    
    createHitEffect(x, y, points) {
        // Explosion particles
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * (100 + Math.random() * 100),
                vy: Math.sin(angle) * (100 + Math.random() * 100),
                life: 1,
                decay: 0.02,
                color: `hsl(${120 + Math.random() * 60}, 70%, 60%)`,
                size: 3 + Math.random() * 3
            });
        }
        
        // Score popup
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: -50,
            life: 1,
            decay: 0.015,
            text: `+${Math.floor(points)}`,
            size: 20,
            color: '#fff'
        });
    }
    
    createMissEffect(x, y) {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: -30,
            life: 1,
            decay: 0.02,
            text: 'MISS',
            size: 16,
            color: '#ef4444'
        });
    }
    
    createExpireEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 50,
                vy: Math.sin(angle) * 50,
                life: 1,
                decay: 0.03,
                color: '#94a3b8',
                size: 2
            });
        }
    }
    
    createDroppedInputEffect(x, y) {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: -40,
            life: 1,
            decay: 0.025,
            text: 'DROPPED',
            size: 14,
            color: '#f97316'
        });
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(p => {
            p.x += p.vx * deltaTime / 1000;
            p.y += p.vy * deltaTime / 1000;
            p.life -= p.decay;
            return p.life > 0;
        });
        
        this.ghostClicks = this.ghostClicks.filter(g => {
            const age = Date.now() - g.createdAt;
            g.alpha = 1 - (age / 500);
            g.radius += 0.5;
            return age < 500;
        });
    }
    
    checkAchievements() {
        if (this.hits >= 1 && !this.achievements.firstBlood) {
            this.achievements.firstBlood = true;
            this.unlockAchievement('achievement1');
        }
        
        if (this.combo >= 10 && !this.achievements.comboKing) {
            this.achievements.comboKing = true;
            this.unlockAchievement('achievement2');
        }
        
        const predictionRate = this.hits > 0 ? this.predictionScore / this.hits : 0;
        if (predictionRate >= 90 && !this.achievements.predictor) {
            this.achievements.predictor = true;
            this.unlockAchievement('achievement3');
        }
        
        const avgLag = this.lagHistory.length > 0
            ? this.lagHistory.reduce((a, b) => a + b, 0) / this.lagHistory.length
            : 0;
        if (this.score >= 500 && avgLag >= 500 && !this.achievements.speedDemon) {
            this.achievements.speedDemon = true;
            this.unlockAchievement('achievement4');
        }
        
        if (this.score >= 1000 && !this.achievements.lagMaster) {
            this.achievements.lagMaster = true;
            this.unlockAchievement('achievement5');
        }
    }
    
    unlockAchievement(id) {
        const achievement = document.getElementById(id);
        achievement.classList.add('unlocked');
        
        // Achievement popup animation
        achievement.style.animation = 'achievementPop 0.5s ease-out';
    }
    
    gameOver() {
        this.gameState = 'gameover';
        
        // Save session
        this.saveSession();
        
        // Display final stats
        document.getElementById('finalScore').textContent = Math.floor(this.score);
        const accuracy = this.hits + this.misses > 0 
            ? (this.hits / (this.hits + this.misses) * 100).toFixed(1) 
            : 100;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';
        document.getElementById('finalPrediction').textContent = Math.floor(this.predictionScore);
        document.getElementById('bestCombo').textContent = this.bestCombo;
        const avgLag = this.lagHistory.length > 0
            ? Math.floor(this.lagHistory.reduce((a, b) => a + b, 0) / this.lagHistory.length)
            : 0;
        document.getElementById('finalAvgLag').textContent = avgLag + 'ms';
        
        document.getElementById('gameOver').style.display = 'flex';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    saveSession() {
        const session = {
            timestamp: new Date().toLocaleString(),
            mode: this.mode,
            lagProfile: this.lagProfile,
            score: Math.floor(this.score),
            accuracy: this.hits + this.misses > 0 
                ? (this.hits / (this.hits + this.misses) * 100).toFixed(1) 
                : 100,
            wave: this.wave,
            avgLag: this.lagHistory.length > 0
                ? Math.floor(this.lagHistory.reduce((a, b) => a + b, 0) / this.lagHistory.length)
                : 0
        };
        
        this.sessionHistory.unshift(session);
        this.sessionHistory = this.sessionHistory.slice(0, 10); // Keep last 10
        
        localStorage.setItem('lagIsTheEnemy_sessions', JSON.stringify(this.sessionHistory));
        this.displaySessionHistory();
    }
    
    loadSessionHistory() {
        const saved = localStorage.getItem('lagIsTheEnemy_sessions');
        if (saved) {
            this.sessionHistory = JSON.parse(saved);
            this.displaySessionHistory();
        }
    }
    
    displaySessionHistory() {
        const container = document.getElementById('sessionHistory');
        
        if (this.sessionHistory.length === 0) {
            container.innerHTML = '<p class="empty-state">No sessions yet</p>';
            return;
        }
        
        container.innerHTML = this.sessionHistory.map(session => `
            <div class="history-item">
                <div class="history-header">
                    <strong>${session.mode.toUpperCase()}</strong>
                    <span>${session.lagProfile}</span>
                </div>
                <div class="history-stats">
                    Score: ${session.score} | Acc: ${session.accuracy}%
                </div>
                <div class="history-time">${session.timestamp}</div>
            </div>
        `).join('');
    }
    
    gameLoop(timestamp = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = timestamp - this.lastUpdate || 16;
        this.lastUpdate = timestamp;
        
        this.gameTime = (Date.now() - this.startTime) / 1000;
        document.getElementById('timer').textContent = this.gameTime.toFixed(1);
        
        // Process delayed inputs
        this.processInputQueue();
        
        // Update game objects
        this.updateTargets(deltaTime);
        this.updateParticles(deltaTime);
        
        // Render
        this.render();
        this.renderGraphs();
        
        // Check game end conditions
        if (this.mode === 'perfect' && this.hits >= this.challengeMode.perfect.targetCount) {
            this.gameOver();
            return;
        }
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Draw ghost clicks (immediate feedback)
        this.ghostClicks.forEach(g => {
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${g.alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        // Draw targets
        this.targets.forEach(target => {
            const age = Date.now() - target.spawnTime;
            const lifeRatio = 1 - (age / target.lifetime);
            
            // Outer ring (lifetime indicator)
            this.ctx.strokeStyle = lifeRatio > 0.5 ? '#22c55e' : lifeRatio > 0.25 ? '#f59e0b' : '#ef4444';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius + 5, 0, Math.PI * 2 * lifeRatio);
            this.ctx.stroke();
            
            // Target circle
            this.ctx.fillStyle = target.color;
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(target.x - target.radius / 3, target.y - target.radius / 3, target.radius / 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw particles
        this.particles.forEach(p => {
            if (p.text) {
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.life;
                this.ctx.font = `bold ${p.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(p.text, p.x, p.y);
                this.ctx.globalAlpha = 1;
            } else {
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.life;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        });
        
        // Draw input queue indicators
        this.inputQueue.forEach((input, i) => {
            const progress = (Date.now() - (input.executeAt - this.currentLag)) / this.currentLag;
            this.ctx.strokeStyle = `rgba(251, 191, 36, ${0.5 + progress * 0.5})`;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(input.x, input.y, 15 + progress * 10, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });
    }
    
    renderGraphs() {
        // Performance Graph
        this.perfCtx.fillStyle = '#1e293b';
        this.perfCtx.fillRect(0, 0, this.perfCanvas.width, this.perfCanvas.height);
        
        if (this.performanceData.length > 1) {
            const maxScore = Math.max(...this.performanceData.map(d => d.score), 100);
            
            // Score line
            this.perfCtx.strokeStyle = '#3b82f6';
            this.perfCtx.lineWidth = 2;
            this.perfCtx.beginPath();
            this.performanceData.forEach((d, i) => {
                const x = (i / this.performanceData.length) * this.perfCanvas.width;
                const y = this.perfCanvas.height - (d.score / maxScore) * this.perfCanvas.height;
                if (i === 0) this.perfCtx.moveTo(x, y);
                else this.perfCtx.lineTo(x, y);
            });
            this.perfCtx.stroke();
            
            // Accuracy line
            this.perfCtx.strokeStyle = '#10b981';
            this.perfCtx.lineWidth = 2;
            this.perfCtx.beginPath();
            this.performanceData.forEach((d, i) => {
                const x = (i / this.performanceData.length) * this.perfCanvas.width;
                const y = this.perfCanvas.height - (d.accuracy / 100) * this.perfCanvas.height;
                if (i === 0) this.perfCtx.moveTo(x, y);
                else this.perfCtx.lineTo(x, y);
            });
            this.perfCtx.stroke();
        }
        
        // Lag Timeline
        this.lagCtx.fillStyle = '#1e293b';
        this.lagCtx.fillRect(0, 0, this.lagCanvas.width, this.lagCanvas.height);
        
        if (this.lagHistory.length > 1) {
            const maxLag = Math.max(...this.lagHistory, 100);
            const pointsToShow = Math.min(this.lagHistory.length, 100);
            const startIndex = Math.max(0, this.lagHistory.length - pointsToShow);
            
            this.lagCtx.strokeStyle = '#f59e0b';
            this.lagCtx.lineWidth = 2;
            this.lagCtx.beginPath();
            
            for (let i = 0; i < pointsToShow; i++) {
                const lag = this.lagHistory[startIndex + i];
                const x = (i / pointsToShow) * this.lagCanvas.width;
                const y = this.lagCanvas.height - (lag / maxLag) * this.lagCanvas.height;
                
                if (i === 0) this.lagCtx.moveTo(x, y);
                else this.lagCtx.lineTo(x, y);
            }
            this.lagCtx.stroke();
        }
    }
    
    drawMenu() {
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LAG IS THE ENEMY', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.fillText('Select your settings and click START', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new LagIsTheEnemy();
    game.drawMenu();
});
