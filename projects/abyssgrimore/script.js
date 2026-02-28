import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Force Transformers.js to download models from Hugging Face rather than local paths
env.allowLocalModels = false;

// --- DOM Elements ---
const loadingOverlay = document.getElementById('loadingOverlay');
const textInput = document.getElementById('textInput');
const sphere = document.getElementById('sphere');
const sentimentLabel = document.getElementById('sentimentLabel');
const confidenceScore = document.getElementById('confidenceScore');
const aiStatus = document.getElementById('aiStatus');

let classifier = null;

// --- Initialize Model ---
async function initAI() {
    try {
        // Loads the default Sentiment Analysis model (distilbert-base-uncased-finetuned-sst-2-english)
        classifier = await pipeline('sentiment-analysis');
        loadingOverlay.classList.add('hidden');
    } catch (error) {
        console.error("Error loading Transformers.js:", error);
        alert("Failed to load NLP model. Please check your connection.");
    }
}
initAI();

// --- Analyze Sentiment ---
async function analyzeText(text) {
    if (!classifier || !text.trim()) {
        resetUI();
        return;
    }

    // Set UI to thinking
    aiStatus.className = 'status thinking';
    aiStatus.innerText = 'AI Thinking...';

    try {
        // Run inference
        const result = await classifier(text);
        const output = result[0]; // Returns { label: "POSITIVE" | "NEGATIVE", score: 0.99... }

        updateUI(output);
    } catch (error) {
        console.error("Inference Error:", error);
    } finally {
        aiStatus.className = 'status idle';
        aiStatus.innerText = 'AI Idle';
    }
}

// --- UI Updates ---
function updateUI(data) {
    const label = data.label;
    const confidence = (data.score * 100).toFixed(2);

    confidenceScore.innerText = confidence;

    // If confidence is low, consider it neutral
    if (data.score < 0.6) {
        setSphereState('neutral', 'NEUTRAL', 'var(--neutral-color)');
        return;
    }

    if (label === 'POSITIVE') {
        setSphereState('positive', 'POSITIVE', 'var(--positive-color)');
    } else {
        setSphereState('negative', 'NEGATIVE', 'var(--negative-color)');
    }
}

function setSphereState(className, labelText, color) {
    sphere.className = `sphere ${className}`;
    sentimentLabel.innerText = labelText;
    sentimentLabel.style.color = color;
}

function resetUI() {
    confidenceScore.innerText = "0.00";
    setSphereState('neutral', 'NEUTRAL', 'var(--text-main)');
}

// --- Debounce Logic ---
// Wait for the user to stop typing for 500ms before running the heavy AI model
let debounceTimer;

textInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);

    // Show user we are waiting for them to finish
    if (e.target.value.trim().length > 0) {
        aiStatus.className = 'status thinking';
        aiStatus.innerText = 'Waiting...';
    } else {
        resetUI();
        aiStatus.className = 'status idle';
        aiStatus.innerText = 'AI Idle';
    }

    debounceTimer = setTimeout(() => {
        analyzeText(e.target.value);
    }, 500);
});