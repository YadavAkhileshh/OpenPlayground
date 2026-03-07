// Typing Speed Tester - Main Logic

// Sample texts for typing test
const sampleTexts = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once, making it useful for testing keyboards and fonts.",
    "JavaScript is a versatile programming language that powers web browsers and has become essential for modern web development. With frameworks like React, Vue, and Angular, developers can build complex applications.",
    "Typing speed is measured in words per minute, or WPM. Average typing speed is around 40 WPM, while professional typists can exceed 60-80 WPM with high accuracy.",
    "Cloud computing has revolutionized how businesses store and process data. Services like AWS, Google Cloud, and Azure provide scalable infrastructure for applications worldwide.",
    "Artificial intelligence and machine learning are transforming industries from healthcare to finance. These technologies enable computers to learn from data and make intelligent decisions.",
    "The internet connects billions of devices worldwide, facilitating instant communication and access to information. It continues to evolve with technologies like 5G and IoT.",
    "Writing clean code is essential for maintainability. By following best practices and design patterns, developers create software that is easier to understand and modify.",
    "Open source communities have created incredible tools and libraries that benefit developers everywhere. Contributing to open source helps developers grow and gives back to the community."
];

// State variables
let testData = {
    isActive: false,
    startTime: null,
    elapsedTime: 0,
    displayText: '',
    userInput: '',
    totalChars: 0,
    correctChars: 0,
    errorChars: 0,
    timer: null
};

// DOM elements
const displayTextEl = document.getElementById('displayText');
const inputFieldEl = document.getElementById('inputField');
const startBtnEl = document.getElementById('startBtn');
const resetBtnEl = document.getElementById('resetBtn');
const finishBtnEl = document.getElementById('finishBtn');
const retakeBtnEl = document.getElementById('retakeBtn');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const errorsEl = document.getElementById('errors');
const timerEl = document.getElementById('timer');
const instructionsEl = document.getElementById('instructions');
const resultsSection = document.getElementById('resultsSection');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    startBtnEl.addEventListener('click', startTest);
    resetBtnEl.addEventListener('click', resetTest);
    finishBtnEl.addEventListener('click', finishTest);
    if (retakeBtnEl) {
        retakeBtnEl.addEventListener('click', retakeTest);
    }
    inputFieldEl.addEventListener('input', handleInput);
    inputFieldEl.addEventListener('keydown', handleKeyDown);
});

// Start the typing test
function startTest() {
    // Select a random text
    testData.displayText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    testData.isActive = true;
    testData.startTime = Date.now();
    testData.elapsedTime = 0;
    testData.userInput = '';
    testData.totalChars = 0;
    testData.correctChars = 0;
    testData.errorChars = 0;

    // Update UI
    inputFieldEl.disabled = false;
    inputFieldEl.value = '';
    inputFieldEl.focus();
    startBtnEl.style.display = 'none';
    finishBtnEl.style.display = 'inline-block';
    instructionsEl.style.display = 'none';
    displayTextEl.classList.add('active');
    resultsSection.style.display = 'none';

    // Update display text
    updateDisplayText();

    // Start timer
    clearInterval(testData.timer);
    testData.timer = setInterval(updateTimer, 100);
}

// Reset the test
function resetTest() {
    clearInterval(testData.timer);
    testData.isActive = false;
    testData.userInput = '';
    testData.displayText = '';
    testData.totalChars = 0;
    testData.correctChars = 0;
    testData.errorChars = 0;
    testData.elapsedTime = 0;

    // Update UI
    inputFieldEl.disabled = true;
    inputFieldEl.value = '';
    startBtnEl.style.display = 'inline-block';
    finishBtnEl.style.display = 'none';
    instructionsEl.style.display = 'block';
    displayTextEl.classList.remove('active');
    resultsSection.style.display = 'none';

    // Reset display
    displayTextEl.innerHTML = '<span>Click "Start Test" to begin...</span>';
    wpmEl.textContent = '0';
    accuracyEl.textContent = '100%';
    errorsEl.textContent = '0';
    timerEl.textContent = '0s';
}

// Handle user input
function handleInput(e) {
    if (!testData.isActive) return;

    testData.userInput = e.target.value;
    updateStats();
    updateDisplayText();

    // Auto-finish when user completes the entire text
    if (testData.userInput.length === testData.displayText.length) {
        finishTest();
    }
}

// Handle key down for special keys if needed
function handleKeyDown(e) {
    if (!testData.isActive) return;

    // Allow normal typing and special keys
    if (e.key === 'Escape') {
        resetTest();
        e.preventDefault();
    }
}

// Update display text with color coding
function updateDisplayText() {
    const textArray = testData.displayText.split('');
    let html = '';

    textArray.forEach((char, index) => {
        const userChar = testData.userInput[index];

        if (index < testData.userInput.length) {
            if (userChar === char) {
                html += `<span class="correct">${escapeHtml(char)}</span>`;
            } else {
                html += `<span class="incorrect">${escapeHtml(char)}</span>`;
            }
        } else if (index === testData.userInput.length) {
            html += `<span class="current">${escapeHtml(char)}</span>`;
        } else {
            html += `<span>${escapeHtml(char)}</span>`;
        }
    });

    displayTextEl.innerHTML = html;
}

// Update statistics
function updateStats() {
    const inputLength = testData.userInput.length;
    testData.totalChars = inputLength;

    // Count correct characters
    let correctCount = 0;
    for (let i = 0; i < inputLength; i++) {
        if (testData.userInput[i] === testData.displayText[i]) {
            correctCount++;
        }
    }

    testData.correctChars = correctCount;
    testData.errorChars = inputLength - correctCount;

    // Calculate accuracy
    const accuracy = inputLength === 0 ? 100 : Math.round((correctCount / inputLength) * 100);
    accuracyEl.textContent = accuracy + '%';

    // Calculate WPM (words = characters / 5)
    const minutes = testData.elapsedTime / 60;
    const words = inputLength / 5;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    wpmEl.textContent = wpm;

    // Update errors
    errorsEl.textContent = testData.errorChars;
}

// Update timer
function updateTimer() {
    if (!testData.isActive) return;

    testData.elapsedTime = (Date.now() - testData.startTime) / 1000;
    timerEl.textContent = Math.floor(testData.elapsedTime) + 's';
}

// Finish the test
function finishTest() {
    clearInterval(testData.timer);
    testData.isActive = false;

    // Calculate final stats
    const inputLength = testData.userInput.length;
    const correctCount = testData.correctChars;
    const accuracy = inputLength === 0 ? 0 : Math.round((correctCount / inputLength) * 100);
    const minutes = testData.elapsedTime / 60;
    const words = inputLength / 5;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    const wordCount = testData.userInput.trim().split(/\s+/).filter(w => w.length > 0).length;

    // Update results section
    document.getElementById('finalWpm').textContent = wpm;
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    document.getElementById('finalErrors').textContent = testData.errorChars;
    document.getElementById('finalWords').textContent = wordCount;
    document.getElementById('finalChars').textContent = inputLength;
    document.getElementById('finalTime').textContent = Math.floor(testData.elapsedTime) + 's';

    // Update UI
    inputFieldEl.disabled = true;
    startBtnEl.style.display = 'none';
    finishBtnEl.style.display = 'none';
    resultsSection.style.display = 'block';
}

// Retake test
function retakeTest() {
    resetTest();
    startTest();
}

// Utility function to escape HTML special characters
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
