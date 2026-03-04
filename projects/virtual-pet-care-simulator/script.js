// Virtual Pet Care Simulator Game Logic

class VirtualPet {
    constructor(type) {
        this.type = type;
        this.name = this.getPetName(type);
        this.emoji = this.getPetEmoji(type);
        this.happiness = 100;
        this.health = 100;
        this.lastUpdate = Date.now();
    }

    getPetName(type) {
        const names = {
            cat: 'Whiskers',
            dog: 'Buddy',
            dragon: 'Spark'
        };
        return names[type] || 'Pet';
    }

    getPetEmoji(type) {
        const emojis = {
            cat: '🐱',
            dog: '🐶',
            dragon: '🐉'
        };
        return emojis[type] || '🐾';
    }

    updateStats() {
        const now = Date.now();
        const timeDiff = (now - this.lastUpdate) / 1000 / 60; // minutes
        this.lastUpdate = now;

        // Decay stats over time
        this.happiness = Math.max(0, this.happiness - timeDiff * 2);
        this.health = Math.max(0, this.health - timeDiff * 1);

        this.updateUI();
    }

    feed() {
        this.happiness = Math.min(100, this.happiness + 10);
        this.health = Math.min(100, this.health + 5);
        this.showMessage('Yummy! Your pet is happy!', 'success');
        this.playSound('feed');
        this.updateUI();
    }

    play() {
        this.happiness = Math.min(100, this.happiness + 15);
        this.health = Math.min(100, this.health + 3);
        this.showMessage('Fun time! Your pet loves playing!', 'success');
        this.animatePet('happy');
        this.playSound('play');
        this.updateUI();
    }

    clean() {
        this.health = Math.min(100, this.health + 10);
        this.happiness = Math.min(100, this.happiness + 5);
        this.showMessage('Clean and fresh! Your pet feels great!', 'success');
        this.playSound('clean');
        this.updateUI();
    }

    updateUI() {
        document.getElementById('happinessBar').style.width = this.happiness + '%';
        document.getElementById('healthBar').style.width = this.health + '%';
        document.getElementById('happinessValue').textContent = Math.round(this.happiness);
        document.getElementById('healthValue').textContent = Math.round(this.health);
        document.getElementById('petEmoji').textContent = this.emoji;
        document.getElementById('petName').textContent = this.name;

        // Update pet appearance based on happiness
        const petEmoji = document.getElementById('petEmoji');
        if (this.happiness > 70) {
            petEmoji.classList.add('happy');
            petEmoji.classList.remove('sad');
        } else if (this.happiness < 30) {
            petEmoji.classList.add('sad');
            petEmoji.classList.remove('happy');
        } else {
            petEmoji.classList.remove('happy', 'sad');
        }
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = 'message ' + type;
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }, 3000);
    }

    animatePet(animation) {
        const petEmoji = document.getElementById('petEmoji');
        petEmoji.classList.add(animation);
        setTimeout(() => {
            petEmoji.classList.remove(animation);
        }, 500);
    }

    playSound(action) {
        // Simple sound effects using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const frequencies = {
                feed: 800,
                play: 600,
                clean: 1000
            };

            oscillator.frequency.setValueAtTime(frequencies[action] || 440, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Fallback: no sound if Web Audio API is not supported
        }
    }

    save() {
        const data = {
            type: this.type,
            happiness: this.happiness,
            health: this.health,
            lastUpdate: this.lastUpdate
        };
        localStorage.setItem('virtualPet', JSON.stringify(data));
    }

    load() {
        const data = JSON.parse(localStorage.getItem('virtualPet'));
        if (data) {
            this.type = data.type;
            this.name = this.getPetName(data.type);
            this.emoji = this.getPetEmoji(data.type);
            this.happiness = data.happiness;
            this.health = data.health;
            this.lastUpdate = data.lastUpdate;
            this.updateStats();
        }
    }
}

// Mini Game Class
class MiniGame {
    constructor() {
        this.score = 0;
        this.gameActive = false;
        this.items = [];
        this.catcher = document.getElementById('catcher');
        this.canvas = document.getElementById('gameCanvas');
        this.scoreEl = document.getElementById('score');
    }

    start() {
        this.gameActive = true;
        this.score = 0;
        this.updateScore();
        this.spawnItem();
        this.gameLoop = setInterval(() => this.update(), 50);
    }

    stop() {
        this.gameActive = false;
        clearInterval(this.gameLoop);
        this.items.forEach(item => item.remove());
        this.items = [];
    }

    spawnItem() {
        if (!this.gameActive) return;

        const item = document.createElement('div');
        item.className = 'falling-item';
        item.textContent = '🍎';
        item.style.left = Math.random() * (this.canvas.offsetWidth - 30) + 'px';
        item.style.top = '-50px';
        this.canvas.appendChild(item);
        this.items.push(item);

        setTimeout(() => this.spawnItem(), 1000 + Math.random() * 2000);
    }

    update() {
        if (!this.gameActive) return;

        this.items.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const catcherRect = this.catcher.getBoundingClientRect();

            if (rect.bottom >= catcherRect.top && rect.left >= catcherRect.left && rect.right <= catcherRect.right) {
                this.score += 10;
                this.updateScore();
                item.remove();
                this.items.splice(index, 1);
            } else if (rect.top > this.canvas.offsetHeight) {
                item.remove();
                this.items.splice(index, 1);
            }
        });
    }

    moveCatcher(x) {
        const maxX = this.canvas.offsetWidth - this.catcher.offsetWidth;
        this.catcher.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    }

    updateScore() {
        this.scoreEl.textContent = 'Score: ' + this.score;
    }
}

// Main Game Logic
let pet = null;
let miniGame = new MiniGame();
let gameInterval;

function initGame() {
    // Pet selection
    document.querySelectorAll('.pet-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const petType = btn.dataset.pet;
            pet = new VirtualPet(petType);
            pet.updateUI();
            document.getElementById('petSelection').style.display = 'none';
            document.getElementById('gameArea').style.display = 'block';
            startGameLoop();
        });
    });

    // Action buttons
    document.getElementById('feedBtn').addEventListener('click', () => pet.feed());
    document.getElementById('playBtn').addEventListener('click', () => pet.play());
    document.getElementById('cleanBtn').addEventListener('click', () => pet.clean());

    // Mini game
    document.getElementById('miniGameBtn').addEventListener('click', () => {
        const miniGameEl = document.getElementById('miniGame');
        miniGameEl.style.display = miniGameEl.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('startMiniGameBtn').addEventListener('click', () => {
        if (miniGame.gameActive) {
            miniGame.stop();
            document.getElementById('startMiniGameBtn').textContent = 'Start Game';
        } else {
            miniGame.start();
            document.getElementById('startMiniGameBtn').textContent = 'Stop Game';
        }
    });

    // Mouse movement for mini game
    document.getElementById('gameCanvas').addEventListener('mousemove', (e) => {
        const rect = e.target.getBoundingClientRect();
        miniGame.moveCatcher(e.clientX - rect.left - miniGame.catcher.offsetWidth / 2);
    });

    // Save/Load
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (pet) {
            pet.save();
            pet.showMessage('Game saved!', 'success');
        }
    });

    document.getElementById('loadBtn').addEventListener('click', () => {
        if (pet) {
            pet.load();
            pet.showMessage('Game loaded!', 'success');
        } else {
            // Load pet if none exists
            const data = JSON.parse(localStorage.getItem('virtualPet'));
            if (data) {
                pet = new VirtualPet(data.type);
                pet.load();
                document.getElementById('petSelection').style.display = 'none';
                document.getElementById('gameArea').style.display = 'block';
                startGameLoop();
            }
        }
    });
}

function startGameLoop() {
    gameInterval = setInterval(() => {
        if (pet) {
            pet.updateStats();
        }
    }, 10000); // Update every 10 seconds
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
