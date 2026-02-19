/* js/logic/scoring.js */
export class ScoringSystem {
    constructor() {
        this.score = 0;
        this.highScore = localStorage.getItem('cannibal_highscore') || 0;
    }

    add(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cannibal_highscore', this.highScore);
        }
    }

    getScore() {
        return Math.floor(this.score);
    }

    getHighScore() {
        return Math.floor(this.highScore);
    }

    reset() {
        this.score = 0;
    }
}
