/**
 * RegEx-Viz Logic
 * Handles regex compilation, text processing, and highlighting updates.
 */

// DOM Elements
const regexInput = document.getElementById('regex-input');
const testStringInput = document.getElementById('test-string');
const outputDisplay = document.getElementById('output-display');
const errorMsg = document.getElementById('error-msg');
const matchCountEl = document.getElementById('match-count');

const flagG = document.getElementById('flag-g');
const flagI = document.getElementById('flag-i');
const flagM = document.getElementById('flag-m');

const cheatBtns = document.querySelectorAll('.token-btn');

// --- Initialization ---

function init() {
    // Input Listeners
    regexInput.addEventListener('input', updateResult);
    testStringInput.addEventListener('input', updateResult);
    
    // Flag Listeners
    [flagG, flagI, flagM].forEach(flag => {
        flag.addEventListener('change', updateResult);
    });

    // Cheat Sheet
    cheatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            insertToken(btn.dataset.token);
        });
    });

    // Initial Run
    updateResult();
}

// --- Logic ---

function updateResult() {
    const pattern = regexInput.value;
    const text = testStringInput.value;
    
    // 1. Build Flags
    let flags = '';
    if (flagG.checked) flags += 'g';
    if (flagI.checked) flags += 'i';
    if (flagM.checked) flags += 'm';

    // 2. Clear Error
    errorMsg.classList.remove('visible');
    regexInput.parentElement.style.borderColor = 'transparent';

    // 3. Handle Empty Case
    if (!pattern) {
        outputDisplay.innerHTML = escapeHTML(text);
        matchCountEl.innerText = '0 matches';
        return;
    }

    try {
        // 4. Compile Regex
        const regex = new RegExp(pattern, flags);
        
        // 5. Calculate Matches & Highlight
        const matches = text.match(regex);
        const count = matches ? matches.length : 0;
        matchCountEl.innerText = `${count} matches`;

        // Highlight Logic
        // Use replace with a callback to wrap matches in spans
        // We must be careful to escape HTML first, BUT replacing complicates that.
        // Strategy: 
        // 1. Find all matches and their indices.
        // 2. Rebuild string piece by piece with spans.
        
        const highlightedHTML = highlightText(text, regex);
        outputDisplay.innerHTML = highlightedHTML;

    } catch (e) {
        // Handle Invalid Regex
        errorMsg.classList.add('visible');
        regexInput.parentElement.style.borderColor = '#ff4757';
        outputDisplay.innerHTML = escapeHTML(text);
        matchCountEl.innerText = '-';
    }
}

/**
 * Highlights matches in the text string based on the regex.
 * Handles HTML escaping to prevent injection.
 */
function highlightText(text, regex) {
    // If global flag is not set, match() only returns first.
    // For visualization, if user didn't select 'g', we usually highlight just the first one
    // or we force 'g' for the visualization logic but match count reflects reality.
    // Let's adhere strictly to the regex provided.

    let html = '';
    let lastIndex = 0;
    
    // We use exec() in a loop to get indices
    // Note: exec() requires 'g' to loop. If 'g' is missing, it always returns index of first match.
    // To solve this: create a clone of the regex with 'g' ONLY IF we want to show all matches
    // But the tool should show what the USER's regex does.
    // So if 'g' is off, we only highlight the first match.

    let match;
    
    // To allow multiple matches without infinite loop on zero-length matches (like ^),
    // we need careful handling.
    
    if (!regex.global) {
        // Single match mode
        match = regex.exec(text);
        if (match) {
            const before = text.slice(0, match.index);
            const matchedText = match[0];
            const after = text.slice(match.index + matchedText.length);
            
            return `${escapeHTML(before)}<span class="match">${escapeHTML(matchedText)}</span>${escapeHTML(after)}`;
        } else {
            return escapeHTML(text);
        }
    } else {
        // Global mode
        // Reset lastIndex just in case
        regex.lastIndex = 0;
        
        while ((match = regex.exec(text)) !== null) {
            // Append text before the match
            html += escapeHTML(text.slice(lastIndex, match.index));
            
            // Append the match
            // Handle zero-width matches (like ^ or $)
            if (match[0].length === 0) {
                 html += `<span class="match match-zero"></span>`; // Styling for zero-width?
                 // Usually regex testers visualize zero-width with a thin bar or ignore visual width
            } else {
                html += `<span class="match">${escapeHTML(match[0])}</span>`;
            }
            
            lastIndex = regex.lastIndex;
            
            // Avoid infinite loop if zero-width match
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }
        }
        
        // Append remaining text
        html += escapeHTML(text.slice(lastIndex));
    }

    return html;
}

function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function insertToken(token) {
    const start = regexInput.selectionStart;
    const end = regexInput.selectionEnd;
    const val = regexInput.value;
    
    regexInput.value = val.substring(0, start) + token + val.substring(end);
    
    // Move cursor after insertion
    regexInput.selectionStart = regexInput.selectionEnd = start + token.length;
    regexInput.focus();
    
    updateResult();
}

// Start
init();