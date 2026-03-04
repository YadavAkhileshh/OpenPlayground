export class UIManager {
    constructor() {
        this.levelDisplay = document.getElementById('level-display');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.controlsHint = document.querySelector('.controls-hint');
    }

    updateLevel(levelIndex) {
        this.levelDisplay.innerText = `Level ${levelIndex}`;
    }

    hideStartScreen() {
        this.startScreen.classList.add('hidden');
        this.startScreen.classList.remove('active');
    }

    showGameOver() {
        this.gameOverScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('active');
    }

    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('active');
    }

    showHint(text) {
        this.controlsHint.innerHTML = `<i class="ri-information-line"></i> ${text}`;
        this.controlsHint.style.opacity = 1;
    }

    hideHint() {
        this.controlsHint.style.opacity = 0;
    }
}
