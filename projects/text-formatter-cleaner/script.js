// Get textarea and stats elements
const textInput = document.getElementById("textInput");
const wordCountEl = document.getElementById("wordCount");
const charCountEl = document.getElementById("charCount");

/**
 * Update word and character count
 */
function updateStats() {
    const text = textInput.value.trim();

    // Character count (including spaces)
    charCountEl.textContent = textInput.value.length;

    // Word count
    if (text === "") {
        wordCountEl.textContent = 0;
    } else {
        const words = text.split(/\s+/);
        wordCountEl.textContent = words.length;
    }
}

/**
 * Convert text to UPPERCASE
 */
function toUpperCaseText() {
    textInput.value = textInput.value.toUpperCase();
    updateStats();
}

/**
 * Convert text to lowercase
 */
function toLowerCaseText() {
    textInput.value = textInput.value.toLowerCase();
    updateStats();
}

/**
 * Convert text to Title Case
 */
function toTitleCase() {
    const text = textInput.value.toLowerCase();
    const words = text.split(" ");

    const titleCased = words.map(word => {
        if (word.length === 0) return "";
        return word.charAt(0).toUpperCase() + word.slice(1);
    });

    textInput.value = titleCased.join(" ");
    updateStats();
}

/**
 * Convert text to Sentence Case
 */
function toSentenceCase() {
    const text = textInput.value.toLowerCase();
    const sentences = text.split(". ");

    const sentenceCased = sentences.map(sentence => {
        if (sentence.length === 0) return "";
        return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    });

    textInput.value = sentenceCased.join(". ");
    updateStats();
}

/**
 * Remove extra spaces from text
 */
function removeExtraSpaces() {
    const text = textInput.value;
    textInput.value = text.replace(/\s+/g, " ").trim();
    updateStats();
}

/**
 * Clear all text
 */
function clearText() {
    textInput.value = "";
    updateStats();
}

// Update stats while typing
textInput.addEventListener("input", updateStats);
