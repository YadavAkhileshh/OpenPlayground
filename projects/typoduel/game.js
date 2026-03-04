// Typo Duel - Game Logic

class TypoDuel {
    constructor() {
        // Game state
        this.state = 'menu'; // menu, playing, gameOver
        this.round = 1;
        this.score = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.totalAttempts = 0;
        this.correctAttempts = 0;
        this.roundsWon = 0;
        
        // Health
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        this.enemyHealth = 100;
        this.enemyMaxHealth = 100;
        
        // Difficulty
        this.difficulty = 1;
        this.targetType = 'letter'; // letter, word
        this.currentTarget = '';
        
        // Enemy AI
        this.enemyAttackTimer = null;
        this.enemyAttackInterval = 3000; // milliseconds
        
        // Letter and word pools
        this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.words = [
            'TYPE', 'CODE', 'FAST', 'JUMP', 'FIRE', 'HERO',
            'POWER', 'SPEED', 'FIGHT', 'SCORE', 'LEVEL', 'START',
            'VICTORY', 'COMBO', 'ATTACK', 'DEFEND', 'STRIKE', 'BATTLE'
        ];
        
        // DOM elements
        this.screens = {
            start: document.getElementById('startScreen'),
            game: document.getElementById('gameScreen'),
            gameOver: document.getElementById('gameOverScreen')
        };
        
        this.elements = {
            // Buttons
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn'),
            menuBtn: document.getElementById('menuBtn'),
            
            // HUD
            roundDisplay: document.getElementById('roundDisplay'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            comboDisplay: document.getElementById('comboDisplay'),
            accuracyDisplay: document.getElementById('accuracyDisplay'),
            
            // Characters
            playerCharacter: document.getElementById('playerCharacter'),
            enemyCharacter: document.getElementById('enemyCharacter'),
            playerHealth: document.getElementById('playerHealth'),
            enemyHealth: document.getElementById('enemyHealth'),
            playerHealthText: document.getElementById('playerHealthText'),
            enemyHealthText: document.getElementById('enemyHealthText'),
            
            // Battle
            targetDisplay: document.getElementById('targetDisplay'),
            difficultyIndicator: document.getElementById('difficultyIndicator'),
            comboIndicator: document.getElementById('comboIndicator'),
            damageNumbers: document.getElementById('damageNumbers'),
            
            // Game Over
            resultTitle: document.getElementById('resultTitle'),
            finalScore: document.getElementById('finalScore'),
            roundsWon: document.getElementById('roundsWon'),
            bestCombo: document.getElementById('bestCombo'),
            finalAccuracy: document.getElementById('finalAccuracy')
        };
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.startGame());
        this.elements.menuBtn.addEventListener('click', () => this.showScreen('start'));
        
        // Keyboard listener
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Initial screen
        this.showScreen('start');
    }
    
    showScreen(screen) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        this.screens[screen].classList.remove('hidden');
    }
    
    startGame() {
        // Reset game state
        this.round = 1;
        this.score = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.totalAttempts = 0;
        this.correctAttempts = 0;
        this.roundsWon = 0;
        this.difficulty = 1;
        
        this.playerHealth = this.playerMaxHealth;
        this.enemyHealth = this.enemyMaxHealth;
        
        this.state = 'playing';
        this.showScreen('game');
        
        this.updateUI();
        this.generateTarget();
        this.startEnemyAttacks();
    }
    
    generateTarget() {
        if (this.difficulty <= 2) {
            // Letters only for easy mode
            this.targetType = 'letter';
            this.currentTarget = this.letters[Math.floor(Math.random() * this.letters.length)];
        } else if (this.difficulty <= 5) {
            // Mix of letters and short words
            if (Math.random() < 0.7) {
                this.targetType = 'letter';
                this.currentTarget = this.letters[Math.floor(Math.random() * this.letters.length)];
            } else {
                this.targetType = 'word';
                const shortWords = this.words.filter(w => w.length <= 4);
                this.currentTarget = shortWords[Math.floor(Math.random() * shortWords.length)];
            }
        } else {
            // More words for harder mode
            if (Math.random() < 0.5) {
                this.targetType = 'letter';
                this.currentTarget = this.letters[Math.floor(Math.random() * this.letters.length)];
            } else {
                this.targetType = 'word';
                this.currentTarget = this.words[Math.floor(Math.random() * this.words.length)];
            }
        }
        
        this.elements.targetDisplay.textContent = this.currentTarget;
        this.elements.targetDisplay.classList.remove('correct', 'wrong');
        
        // Update difficulty indicator
        const dots = this.elements.difficultyIndicator.querySelectorAll('.difficulty-dot');
        dots.forEach((dot, index) => {
            if (index < this.difficulty) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    handleKeyPress(e) {
        if (this.state !== 'playing') return;
        
        const key = e.key.toUpperCase();
        
        // Check if it matches the target
        if (this.targetType === 'letter') {
            if (key === this.currentTarget) {
                this.handleCorrect();
            } else if (key.length === 1 && /[A-Z]/.test(key)) {
                this.handleWrong();
            }
        } else {
            // For words, we'll accept the first letter for simplicity in this version
            // In a full implementation, you'd track partial input
            if (key === this.currentTarget[0]) {
                this.handleCorrect();
            } else if (key.length === 1 && /[A-Z]/.test(key)) {
                this.handleWrong();
            }
        }
    }
    
    handleCorrect() {
        this.totalAttempts++;
        this.correctAttempts++;
        this.combo++;
        
        if (this.combo > this.bestCombo) {
            this.bestCombo = this.combo;
        }
        
        // Calculate damage (increases with combo)
        const baseDamage = 10 + this.difficulty;
        const comboDamage = Math.floor(this.combo / 3) * 5;
        const totalDamage = baseDamage + comboDamage;
        
        // Deal damage to enemy
        this.enemyHealth = Math.max(0, this.enemyHealth - totalDamage);
        
        // Update score
        const points = totalDamage * (1 + Math.floor(this.combo / 5));
        this.score += points;
        
        // Visual feedback
        this.elements.targetDisplay.classList.add('correct');
        this.elements.enemyCharacter.classList.add('hit', 'shake');
        
        // Damage number
        this.showDamageNumber(this.elements.enemyCharacter, totalDamage, 'enemy-damage');
        
        // Particle effect
        if (window.particleSystem) {
            particleSystem.createHitEffect(this.elements.enemyCharacter, 'success');
        }
        
        // Combo indicator
        if (this.combo >= 3) {
            this.elements.comboIndicator.classList.add('active');
            this.elements.comboIndicator.querySelector('.combo-text').textContent = 
                `${this.combo}x COMBO!`;
            
            if (this.combo % 5 === 0 && window.particleSystem) {
                particleSystem.createComboEffect(this.combo);
            }
        }
        
        setTimeout(() => {
            this.elements.targetDisplay.classList.remove('correct');
            this.elements.enemyCharacter.classList.remove('hit', 'shake');
        }, 300);
        
        // Check for round victory
        if (this.enemyHealth <= 0) {
            this.handleRoundVictory();
        } else {
            this.generateTarget();
            this.updateUI();
        }
    }
    
    handleWrong() {
        this.totalAttempts++;
        this.combo = 0;
        
        // Calculate damage to player
        const damage = 15 + this.difficulty * 2;
        this.playerHealth = Math.max(0, this.playerHealth - damage);
        
        // Visual feedback
        this.elements.targetDisplay.classList.add('wrong');
        this.elements.playerCharacter.classList.add('hit', 'shake');
        
        // Damage number
        this.showDamageNumber(this.elements.playerCharacter, damage, 'player-damage');
        
        // Particle effect
        if (window.particleSystem) {
            particleSystem.createHitEffect(this.elements.playerCharacter, 'damage');
        }
        
        // Hide combo indicator
        this.elements.comboIndicator.classList.remove('active');
        
        setTimeout(() => {
            this.elements.targetDisplay.classList.remove('wrong');
            this.elements.playerCharacter.classList.remove('hit', 'shake');
        }, 300);
        
        // Check for game over
        if (this.playerHealth <= 0) {
            this.handleDefeat();
        } else {
            this.generateTarget();
            this.updateUI();
        }
    }
    
    handleRoundVictory() {
        this.roundsWon++;
        this.round++;
        
        // Stop enemy attacks during transition
        this.stopEnemyAttacks();
        
        // Show round banner
        this.showRoundBanner(`ROUND ${this.round}`);
        
        // Particle effect
        if (window.particleSystem) {
            particleSystem.createRoundTransitionEffect();
        }
        
        setTimeout(() => {
            // Increase difficulty
            this.difficulty = Math.min(10, Math.floor(this.round / 2) + 1);
            
            // Reset health with slight bonus for player
            this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 30);
            this.enemyHealth = this.enemyMaxHealth + (this.round - 1) * 10;
            this.enemyMaxHealth = this.enemyHealth;
            
            this.generateTarget();
            this.updateUI();
            this.startEnemyAttacks();
        }, 2000);
    }
    
    handleDefeat() {
        this.state = 'gameOver';
        this.stopEnemyAttacks();
        
        setTimeout(() => {
            this.showGameOver(false);
        }, 1000);
    }
    
    startEnemyAttacks() {
        this.stopEnemyAttacks();
        
        // Attack interval decreases with difficulty (faster attacks)
        this.enemyAttackInterval = Math.max(1200, 3000 - (this.difficulty * 150));
        
        this.enemyAttackTimer = setInterval(() => {
            this.enemyAttack();
        }, this.enemyAttackInterval);
    }
    
    stopEnemyAttacks() {
        if (this.enemyAttackTimer) {
            clearInterval(this.enemyAttackTimer);
            this.enemyAttackTimer = null;
        }
    }
    
    enemyAttack() {
        if (this.state !== 'playing') {
            this.stopEnemyAttacks();
            return;
        }
        
        // Enemy deals damage based on difficulty
        const baseDamage = 8 + this.difficulty;
        const randomVariation = Math.floor(Math.random() * 5) - 2;
        const damage = Math.max(5, baseDamage + randomVariation);
        
        this.playerHealth = Math.max(0, this.playerHealth - damage);
        
        // Visual feedback
        this.elements.playerCharacter.classList.add('hit', 'shake');
        this.elements.enemyCharacter.classList.add('attacking');
        
        // Damage number
        this.showDamageNumber(this.elements.playerCharacter, damage, 'player-damage');
        
        // Particle effect
        if (window.particleSystem) {
            particleSystem.createHitEffect(this.elements.playerCharacter, 'damage');
        }
        
        // Visual flash on target display to show enemy is attacking
        this.elements.targetDisplay.style.borderColor = 'var(--color-danger)';
        
        setTimeout(() => {
            this.elements.playerCharacter.classList.remove('hit', 'shake');
            this.elements.enemyCharacter.classList.remove('attacking');
            this.elements.targetDisplay.style.borderColor = '';
        }, 400);
        
        // Check for game over
        if (this.playerHealth <= 0) {
            this.handleDefeat();
        } else {
            this.updateUI();
        }
    }
    
    showGameOver(victory) {
        const accuracy = this.totalAttempts > 0 
            ? Math.round((this.correctAttempts / this.totalAttempts) * 100) 
            : 0;
        
        this.elements.resultTitle.textContent = victory ? 'VICTORY!' : 'DEFEAT';
        this.elements.resultTitle.className = victory ? 'result-title victory' : 'result-title defeat';
        
        this.elements.finalScore.textContent = this.score.toLocaleString();
        this.elements.roundsWon.textContent = this.roundsWon;
        this.elements.bestCombo.textContent = this.bestCombo;
        this.elements.finalAccuracy.textContent = accuracy + '%';
        
        const gameOverContent = document.querySelector('.game-over-content');
        gameOverContent.className = victory ? 'game-over-content victory' : 'game-over-content defeat';
        
        this.showScreen('gameOver');
    }
    
    updateUI() {
        // HUD
        this.elements.roundDisplay.textContent = this.round;
        this.elements.scoreDisplay.textContent = this.score.toLocaleString();
        this.elements.comboDisplay.textContent = 'x' + this.combo;
        
        const accuracy = this.totalAttempts > 0 
            ? Math.round((this.correctAttempts / this.totalAttempts) * 100) 
            : 100;
        this.elements.accuracyDisplay.textContent = accuracy + '%';
        
        // Health bars
        const playerHealthPercent = (this.playerHealth / this.playerMaxHealth) * 100;
        const enemyHealthPercent = (this.enemyHealth / this.enemyMaxHealth) * 100;
        
        this.elements.playerHealth.style.width = playerHealthPercent + '%';
        this.elements.enemyHealth.style.width = enemyHealthPercent + '%';
        
        this.elements.playerHealthText.textContent = 
            `${Math.round(this.playerHealth)} / ${this.playerMaxHealth}`;
        this.elements.enemyHealthText.textContent = 
            `${Math.round(this.enemyHealth)} / ${this.enemyMaxHealth}`;
        
        // Low health warning
        if (playerHealthPercent < 30) {
            this.elements.playerHealth.classList.add('low-health');
            this.elements.playerCharacter.classList.add('critical');
        } else {
            this.elements.playerHealth.classList.remove('low-health');
            this.elements.playerCharacter.classList.remove('critical');
        }
        
        // Combo streak effects
        const hudSection = document.querySelector('.hud-section');
        if (this.combo >= 10) {
            hudSection?.classList.add('combo-streak-10');
        } else if (this.combo >= 5) {
            hudSection?.classList.add('combo-streak-5');
        } else if (this.combo >= 3) {
            hudSection?.classList.add('combo-streak-3');
        }
    }
    
    showDamageNumber(element, damage, className) {
        const rect = element.getBoundingClientRect();
        const damageEl = document.createElement('div');
        damageEl.className = `damage-number ${className}`;
        damageEl.textContent = `-${damage}`;
        damageEl.style.left = (rect.left + rect.width / 2) + 'px';
        damageEl.style.top = rect.top + 'px';
        
        this.elements.damageNumbers.appendChild(damageEl);
        
        setTimeout(() => {
            damageEl.remove();
        }, 1000);
    }
    
    showRoundBanner(text) {
        const banner = document.createElement('div');
        banner.className = 'round-banner';
        banner.textContent = text;
        document.body.appendChild(banner);
        
        setTimeout(() => {
            banner.remove();
        }, 2000);
    }
}

// Initialize game when DOM is ready
let game;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        game = new TypoDuel();
    });
} else {
    game = new TypoDuel();
}
