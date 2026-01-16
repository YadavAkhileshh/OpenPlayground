const status = document.querySelector("#status");
const btns = document.querySelectorAll(".btn");
const startBtn = document.querySelector("#startBtn");
const levelDisplay = document.querySelector("#level");
const highScoreDisplay = document.querySelector("#highScore");
const body = document.querySelector("body");

const btnList = ["red", "green", "blue", "yellow"];
const frequencies = {
    red: 261.63,    
    green: 329.63,  
    blue: 392.00,  
    yellow: 523.25  
};

let gameSeq = [];
let userSeq = [];
let started = false;
let level = 0;
let highScore = parseInt(localStorage.getItem('simonHighScore')) || 0;
let isPlayingSequence = false;

highScoreDisplay.textContent = highScore;

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

function playTone(frequency, duration = 400) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.15, now + duration / 1000 * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
}

function playErrorSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 100;
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

startBtn.addEventListener("click", () => {
    if (!started) {
        audioContext.resume();
        started = true;
        startBtn.classList.add('hidden');
        body.classList.remove('game-over');
        levelUp();
    }
});

async function levelUp() {
    userSeq = [];
    level++;
    levelDisplay.textContent = level;
    status.textContent = `Level ${level}`;

    const randColor = btnList[Math.floor(Math.random() * btnList.length)];
    gameSeq.push(randColor);

    await new Promise(resolve => setTimeout(resolve, 500));
    await playSequence();
}

async function playSequence() {
    isPlayingSequence = true;
    btns.forEach(btn => btn.classList.add('disabled'));

    for (let color of gameSeq) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const btn = document.querySelector(`#${color}`);
        gameFlash(btn);
        playTone(frequencies[color]);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    btns.forEach(btn => btn.classList.remove('disabled'));
    isPlayingSequence = false;
    status.textContent = "Your turn!";
}

function gameFlash(btn) {
    btn.classList.add("flash");
    setTimeout(() => {
        btn.classList.remove("flash");
    }, 400);
}

function userFlash(btn) {
    btn.classList.add("userFlash");
    setTimeout(() => {
        btn.classList.remove("userFlash");
    }, 150);
}

function btnPress() {
    if (!started || isPlayingSequence) return;

    const btn = this;
    userFlash(btn);

    const userColor = btn.getAttribute("id");
    playTone(frequencies[userColor], 200);
    userSeq.push(userColor);

    checkAns(userSeq.length - 1);
}

btns.forEach(btn => {
    btn.addEventListener("click", btnPress);
});

function checkAns(idx) {
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length === gameSeq.length) {
            status.textContent = "Correct! Next level...";
            setTimeout(levelUp, 1000);
        }
    } else {
        gameOver();
    }
}

function gameOver() {
    playErrorSound();
    body.classList.add('game-over');

    const finalScore = level - 1;
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('simonHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        status.innerHTML = `🎉 New High Score: ${finalScore}!<br>Click Start to play again`;
    } else {
        status.innerHTML = `Game Over! Score: ${finalScore}<br>Click Start to play again`;
    }

    startBtn.classList.remove('hidden');
    startBtn.textContent = "Play Again";

    resetGame();
}

function resetGame() {
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
    levelDisplay.textContent = 0;
}