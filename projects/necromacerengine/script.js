// --- DOM Elements ---
const sourceTextEl = document.getElementById('sourceText');
const btnGenerate = document.getElementById('btnGenerate');
const outputTextEl = document.getElementById('outputText');
const outputLengthEl = document.getElementById('outputLength');
const statusIndicator = document.getElementById('statusIndicator');
const nodeCountEl = document.getElementById('nodeCount');

// --- Markov Chain Logic ---
// We use an "Order 2" n-gram model (looks at the previous 2 words to predict the next)
const ORDER = 2;
let markovChain = {};
let ngramsCount = 0;
let isTyping = false;
let typeInterval;

function buildMarkovChain(text) {
    markovChain = {};
    ngramsCount = 0;

    // Clean text: remove excessive whitespace, keep basic punctuation attached to words
    const words = text.trim().split(/\s+/);

    if (words.length <= ORDER) {
        return false;
    }

    for (let i = 0; i <= words.length - ORDER; i++) {
        // Build the N-Gram key (e.g., "The quick")
        const gram = words.slice(i, i + ORDER).join(' ');
        const nextWord = words[i + ORDER];

        if (!markovChain[gram]) {
            markovChain[gram] = [];
            ngramsCount++;
        }

        // Push the next word into the array of possibilities for this n-gram
        if (nextWord) {
            markovChain[gram].push(nextWord);
        }
    }

    nodeCountEl.innerText = `N-Grams mapped: ${ngramsCount}`;
    return true;
}

function generateText(maxLength) {
    const keys = Object.keys(markovChain);

    // Pick a random starting n-gram (preferably one that starts with a capital letter)
    let startingKeys = keys.filter(k => /^[A-Z]/.test(k));
    if (startingKeys.length === 0) startingKeys = keys;

    let currentGram = startingKeys[Math.floor(Math.random() * startingKeys.length)];
    let result = currentGram;

    for (let i = 0; i < maxLength - ORDER; i++) {
        const possibilities = markovChain[currentGram];

        // If we hit a dead end, stop generating
        if (!possibilities || possibilities.length === 0) {
            break;
        }

        // Pick a random next word based on probability weight (duplicates in array = higher chance)
        const nextWord = possibilities[Math.floor(Math.random() * possibilities.length)];

        result += ' ' + nextWord;

        // Shift the current gram forward by 1 word
        const currentWords = currentGram.split(' ');
        currentWords.shift(); // remove first word
        currentWords.push(nextWord); // add new word
        currentGram = currentWords.join(' ');
    }

    return result;
}

// --- Typewriter UI Effect ---
function typeText(text) {
    if (isTyping) clearInterval(typeInterval);
    isTyping = true;
    outputTextEl.innerText = '';
    statusIndicator.innerText = 'GENERATING...';
    statusIndicator.className = 'status generating';

    let i = 0;
    // Speed varies slightly to simulate real typing/computing
    typeInterval = setInterval(() => {
        if (i < text.length) {
            outputTextEl.innerText += text.charAt(i);
            i++;

            // Auto scroll to bottom
            const terminalBody = document.getElementById('terminalBody');
            terminalBody.scrollTop = terminalBody.scrollHeight;
        } else {
            clearInterval(typeInterval);
            isTyping = false;
            statusIndicator.innerText = 'IDLE';
            statusIndicator.className = 'status idle';
        }
    }, 15); // typing speed in ms
}

// --- Event Listeners ---
btnGenerate.addEventListener('click', () => {
    if (isTyping) return; // Prevent spamming

    const rawText = sourceTextEl.value;
    const maxLength = parseInt(outputLengthEl.value) || 50;

    if (rawText.trim().length < 50) {
        typeText("ERROR: INSUFFICIENT DATASTREAM. PLEASE PROVIDE MORE SOURCE TEXT.");
        return;
    }

    // 1. Train Model
    statusIndicator.innerText = 'TRAINING...';
    const success = buildMarkovChain(rawText);

    if (!success) {
        typeText("ERROR: MAPPING FAILURE. DATA TOO SHORT.");
        return;
    }

    // 2. Generate Prediction
    const generated = generateText(maxLength);

    // 3. Print Output
    typeText(generated);
});