document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const regexInput = document.getElementById('regex-input');
    const testText = document.getElementById('test-text');
    const testBtn = document.getElementById('test-btn');
    const clearBtn = document.getElementById('clear-btn');
    const exampleBtn = document.getElementById('example-btn');
    const flagI = document.getElementById('flag-i');
    const flagG = document.getElementById('flag-g');
    const flagM = document.getElementById('flag-m');
    const matchesContainer = document.getElementById('matches-container');
    const highlightedText = document.getElementById('highlighted-text');
    const explanation = document.getElementById('explanation');
    const matchCount = document.getElementById('match-count');

    // Predefined regex examples
    const examples = [
        {
            name: "Email Validation",
            regex: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
            text: "Contact us at: john.doe@example.com, support@company.co.uk, or info@test.org. Invalid emails: user@, @domain.com, user@domain",
            description: "Matches most common email formats"
        },
        {
            name: "URL Extraction",
            regex: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)",
            text: "Visit https://example.com or http://www.test.org/path?query=1. Also check ftp://files.com (not matched).",
            description: "Extracts HTTP/HTTPS URLs"
        },
        {
            name: "Phone Numbers (US)",
            regex: "\\b\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}\\b",
            text: "Call (123) 456-7890, 123-456-7890, 123.456.7890, or 1234567890. Not: 123-45-6789",
            description: "Matches various US phone number formats"
        },
        {
            name: "Credit Card (Simplified)",
            regex: "\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b",
            text: "Cards: 4111-1111-1111-1111, 4222 2222 2222 2222, 4333333333333333. Invalid: 4111-111-1111-1111",
            description: "Matches 16-digit credit card numbers"
        }
    ];

    // Initialize with example
    let currentExampleIndex = 0;

    // Test regex function
    function testRegex() {
        const regexPattern = regexInput.value;
        const text = testText.value;
        
        // Get selected flags
        let flags = '';
        if (flagI.checked) flags += 'i';
        if (flagG.checked) flags += 'g';
        if (flagM.checked) flags += 'm';
        
        // Clear previous results
        matchesContainer.innerHTML = '';
        explanation.innerHTML = '';
        
        try {
            // Create regex object
            const regex = new RegExp(regexPattern, flags);
            
            // Find all matches
            const matches = [];
            let match;
            while ((match = regex.exec(text)) !== null) {
                // Prevent infinite loop with zero-length matches
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                
                matches.push({
                    text: match[0],
                    index: match.index,
                    groups: match.slice(1)
                });
                
                // If not global flag, break after first match
                if (!flagG.checked) break;
            }
            
            // Update match count
            matchCount.textContent = matches.length;
            
            // Display matches
            if (matches.length > 0) {
                matches.forEach((match, idx) => {
                    const matchElement = document.createElement('div');
                    matchElement.className = 'match-item';
                    matchElement.innerHTML = `
                        <span>${match.text}</span>
                        <span class="match-index">Index: ${match.index}</span>
                    `;
                    matchesContainer.appendChild(matchElement);
                });
            } else {
                matchesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-times-circle"></i>
                        <p>No matches found with the current regex.</p>
                    </div>
                `;
            }
            
            // Display highlighted text
            let highlighted = text;
            if (matches.length > 0) {
                // Sort matches by index in descending order for proper replacement
                const sortedMatches = [...matches].sort((a, b) => b.index - a.index);
                
                sortedMatches.forEach(match => {
                    const before = highlighted.substring(0, match.index);
                    const after = highlighted.substring(match.index + match.text.length);
                    highlighted = `${before}<span class="highlight">${match.text}</span>${after}`;
                });
            }
            
            highlightedText.innerHTML = highlighted || '<p class="empty-text">No text to highlight.</p>';
            
            // Generate explanation
            generateExplanation(regexPattern);
            
        } catch (error) {
            // Display error
            matchesContainer.innerHTML = `
                <div class="empty-state" style="color: #dc3545;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Invalid Regex: ${error.message}</p>
                </div>
            `;
            
            highlightedText.innerHTML = `<p style="color: #dc3545;">Error in regex pattern: ${error.message}</p>`;
            explanation.innerHTML = `
                <div class="empty-state" style="color: #dc3545;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Cannot generate explanation due to invalid regex.</p>
                </div>
            `;
            matchCount.textContent = '0';
        }
    }

    // Generate regex explanation
    function generateExplanation(pattern) {
        const explanations = [];
        
        // Common regex patterns and their explanations
        const patternExplanations = [
            { pattern: /\\d/, explanation: "Matches any digit (0-9)" },
            { pattern: /\\w/, explanation: "Matches any word character (a-z, A-Z, 0-9, _)" },
            { pattern: /\\s/, explanation: "Matches any whitespace character" },
            { pattern: /\\b/, explanation: "Matches a word boundary" },
            { pattern: /\./, explanation: "Matches any character except newline" },
            { pattern: /\^/, explanation: "Matches the start of a string" },
            { pattern: /\$/, explanation: "Matches the end of a string" },
            { pattern: /\[.*\]/, explanation: "Character class - matches any one of the enclosed characters" },
            { pattern: /\[^.*\]/, explanation: "Negated character class - matches any character NOT in the brackets" },
            { pattern: /\*/, explanation: "Quantifier - matches 0 or more of the preceding element" },
            { pattern: /\+/, explanation: "Quantifier - matches 1 or more of the preceding element" },
            { pattern: /\?/, explanation: "Quantifier - matches 0 or 1 of the preceding element" },
            { pattern: /\{[0-9,]+\}/, explanation: "Quantifier - matches the specified quantity of the preceding element" },
            { pattern: /\(.*\)/, explanation: "Capturing group - groups multiple tokens together" },
            { pattern: /\|/, explanation: "Alternation - matches either the expression before or after the |" }
        ];
        
        // Check for flags explanation
        let flagsExplanation = "Flags: ";
        const flags = [];
        if (flagI.checked) flags.push("i (case-insensitive)");
        if (flagG.checked) flags.push("g (global search)");
        if (flagM.checked) flags.push("m (multiline mode)");
        
        if (flags.length > 0) {
            flagsExplanation += flags.join(", ");
        } else {
            flagsExplanation += "None";
        }
        
        explanations.push({
            part: "Flags",
            explanation: flagsExplanation
        });
        
        // Break down the regex pattern
        let i = 0;
        while (i < pattern.length) {
            let found = false;
            
            for (const {pattern: regexPattern, explanation: exp} of patternExplanations) {
                const match = pattern.substring(i).match(regexPattern);
                if (match && pattern.indexOf(match[0], i) === i) {
                    explanations.push({
                        part: match[0],
                        explanation: exp
                    });
                    i += match[0].length;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                // Check for literal characters
                if (pattern[i] === '\\' && i + 1 < pattern.length) {
                    explanations.push({
                        part: pattern.substring(i, i + 2),
                        explanation: `Escaped character: ${pattern[i + 1]}`
                    });
                    i += 2;
                } else {
                    explanations.push({
                        part: pattern[i],
                        explanation: `Literal character: ${pattern[i]}`
                    });
                    i++;
                }
            }
        }
        
        // Display explanations
        if (explanations.length > 0) {
            explanations.forEach(exp => {
                const expElement = document.createElement('div');
                expElement.className = 'explanation-item';
                expElement.innerHTML = `
                    <strong class="regex-part">${exp.part}</strong>: ${exp.explanation}
                `;
                explanation.appendChild(expElement);
            });
        } else {
            explanation.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p>Could not generate detailed explanation for this pattern.</p>
                </div>
            `;
        }
    }

    // Clear all inputs and results
    function clearAll() {
        regexInput.value = '';
        testText.value = '';
        matchesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No matches yet. Enter a regex and test text to see results.</p>
            </div>
        `;
        highlightedText.innerHTML = '<p>Your test text will appear here with matches highlighted.</p>';
        explanation.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>Explanation will appear here after testing.</p>
            </div>
        `;
        matchCount.textContent = '0';
        
        // Reset flags
        flagI.checked = true;
        flagG.checked = false;
        flagM.checked = false;
    }

    // Load example
    function loadExample() {
        const example = examples[currentExampleIndex];
        regexInput.value = example.regex;
        testText.value = example.text;
        
        // Cycle to next example
        currentExampleIndex = (currentExampleIndex + 1) % examples.length;
        
        // Test the example
        testRegex();
    }

    // Event listeners
    testBtn.addEventListener('click', testRegex);
    clearBtn.addEventListener('click', clearAll);
    exampleBtn.addEventListener('click', loadExample);

    // Auto-test when inputs change
    regexInput.addEventListener('input', testRegex);
    testText.addEventListener('input', testRegex);
    flagI.addEventListener('change', testRegex);
    flagG.addEventListener('change', testRegex);
    flagM.addEventListener('change', testRegex);

    // Initialize with first example
    loadExample();
});