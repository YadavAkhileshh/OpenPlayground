document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const regexInput = document.getElementById('regex-pattern');
    const testStringInput = document.getElementById('test-string');
    const matchDisplay = document.getElementById('match-display');
    const matchStats = document.getElementById('match-stats');
    const explanationContent = document.getElementById('explanation-content');
    const groupsContent = document.getElementById('groups-content');
    const errorMessage = document.getElementById('error-message');
    const flagBtns = document.querySelectorAll('.flag-btn');
    const patternCards = document.querySelectorAll('.pattern-card');

    // State
    let flags = 'g';
    let currentRegex = null;

    // Regex pattern explanations
    const patternExplanations = {
        '\\d': ' digit (0-9)',
        '\\D': ' non-digit',
        '\\w': ' word character (a-z, A-Z, 0-9, _)',
        '\\W': ' non-word character',
        '\\s': ' whitespace',
        '\\S': ' non-whitespace',
        '\\b': ' word boundary',
        '\\B': ' non-word boundary',
        '\\n': ' newline',
        '\\t': ' tab',
        '\\r': ' carriage return',
        '.': ' any character (except newline)',
        '^': ' start of string/line',
        '$': ' end of string/line',
        '*': ' zero or more',
        '+': ' one or more',
        '?': ' zero or one (optional)',
        '{n}': ' exactly n times',
        '{n,}': ' n or more times',
        '{n,m}': ' between n and m times',
        '|': ' OR (alternation)',
        '()': ' capturing group',
        '(?:)': ' non-capturing group',
        '(?=)': ' positive lookahead',
        '(?!)': ' negative lookahead',
        '(?<=)': ' positive lookbehind',
        '(?<!)': ' negative lookbehind',
        '[]': ' character class',
        '[^]': ' negated character class',
        '-': ' range (inside character class)',
    };

    // Flag buttons functionality
    flagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const flag = btn.dataset.flag;
            if (flags.includes(flag)) {
                flags = flags.replace(flag, '');
                btn.classList.remove('active');
            } else {
                flags += flag;
                btn.classList.add('active');
            }
            updateRegex();
        });
    });

    // Pattern card click handler
    patternCards.forEach(card => {
        card.addEventListener('click', () => {
            const pattern = card.dataset.pattern;
            regexInput.value = pattern;
            updateRegex();
        });
    });

    // Input event listeners
    regexInput.addEventListener('input', updateRegex);
    testStringInput.addEventListener('input', updateRegex);

    // Main function to update regex and display results
    function updateRegex() {
        const pattern = regexInput.value;
        const testString = testStringInput.value;

        // Clear previous state
        errorMessage.textContent = '';
        errorMessage.classList.remove('visible');

        if (!pattern) {
            clearResults();
            return;
        }

        try {
            currentRegex = new RegExp(pattern, flags);
            displayMatches(testString);
            explainPattern(pattern);
            extractGroups(testString);
        } catch (e) {
            showError(e.message);
        }
    }

    // Display matches with highlighting
    function displayMatches(testString) {
        if (!testString) {
            matchDisplay.innerHTML = '<span class="placeholder">Enter a test string to see matches</span>';
            matchStats.textContent = '';
            return;
        }

        let highlighted = '';
        let matchCount = 0;
        let lastIndex = 0;
        let match;
        
        // Create a temporary regex without global to get all matches info
        const tempRegex = new RegExp(regexInput.value, flags.includes('g') ? flags : flags + 'g');
        
        // Use replace to highlight matches
        const matches = [];
        while ((match = tempRegex.exec(testString)) !== null) {
            matches.push({
                match: match[0],
                index: match.index,
                groups: match.slice(1)
            });
            if (!flags.includes('g')) break;
            if (match[0].length === 0) tempRegex.lastIndex++;
        }

        if (matches.length === 0) {
            matchDisplay.innerHTML = `<span class="no-match">${escapeHtml(testString)}</span>`;
            matchStats.textContent = 'No matches found';
            return;
        }

        // Build highlighted HTML
        highlighted = '';
        let currentIndex = 0;

        matches.forEach((m, idx) => {
            // Add text before match
            highlighted += escapeHtml(testString.slice(currentIndex, m.index));
            // Add highlighted match
            highlighted += `<span class="match" data-group="${idx}">${escapeHtml(m.match)}</span>`;
            currentIndex = m.index + m.match.length;
            matchCount++;
        });

        // Add remaining text
        highlighted += escapeHtml(testString.slice(currentIndex));

        matchDisplay.innerHTML = highlighted;
        matchStats.textContent = `${matchCount} match${matchCount !== 1 ? 'es' : ''} found`;

        // Add click handlers to matches for showing group details
        document.querySelectorAll('.match').forEach(matchEl => {
            matchEl.addEventListener('click', (e) => {
                const groupIdx = e.target.dataset.group;
                showGroupDetails(groupIdx);
            });
        });
    }

    // Explain regex pattern
    function explainPattern(pattern) {
        if (!pattern) {
            explanationContent.innerHTML = '<p class="placeholder">Your regex pattern explanation will appear here</p>';
            return;
        }

        let explanation = '<ul class="explanation-list">';
        
        // Parse and explain each part of the pattern
        let i = 0;
        while (i < pattern.length) {
            let explained = false;
            
            // Check for escaped characters
            if (pattern[i] === '\\' && i + 1 < pattern.length) {
                const twoChar = pattern.slice(i, i + 2);
                if (patternExplanations[twoChar]) {
                    explanation += `<li><code>${escapeHtml(twoChar)}</code> - matches${patternExplanations[twoChar]}</li>`;
                    i += 2;
                    explained = true;
                }
            }
            
            // Check for character classes
            if (!explained && pattern[i] === '[') {
                const endBracket = pattern.indexOf(']', i);
                if (endBracket !== -1) {
                    const charClass = pattern.slice(i, endBracket + 1);
                    if (charClass[1] === '^') {
                        explanation += `<li><code>${escapeHtml(charClass)}</code> - matches any character NOT in: ${escapeHtml(charClass.slice(2, -1))}</li>`;
                    } else {
                        explanation += `<li><code>${escapeHtml(charClass)}</code> - matches any character in: ${escapeHtml(charClass.slice(1, -1))}</li>`;
                    }
                    i = endBracket + 1;
                    explained = true;
                }
            }
            
            // Check for groups
            if (!explained && pattern[i] === '(') {
                if (pattern[i + 1] === '?') {
                    if (pattern[i + 2] === ':') {
                        explanation += `<li><code>(?:...)</code> - non-capturing group</li>`;
                        i += 3;
                    } else if (pattern[i + 2] === '=') {
                        explanation += `<li><code>(?=...)</code> - positive lookahead</li>`;
                        i += 3;
                    } else if (pattern[i + 2] === '!') {
                        explanation += `<li><code>(?!...)</code> - negative lookahead</li>`;
                        i += 3;
                    } else if (pattern[i + 2] === '<' && pattern[i + 3] === '=') {
                        explanation += `<li><code>(?<=...)</code> - positive lookbehind</li>`;
                        i += 4;
                    } else if (pattern[i + 2] === '<' && pattern[i + 3] === '!') {
                        explanation += `<li><code>(?<!...)</code> - negative lookbehind</li>`;
                        i += 4;
                    }
                } else {
                    explanation += `<li><code>(...)</code> - capturing group</li>`;
                    i++;
                }
                explained = true;
            }
            
            // Check for quantifiers and anchors
            if (!explained) {
                const char = pattern[i];
                if (patternExplanations[char]) {
                    explanation += `<li><code>${escapeHtml(char)}</code> - ${patternExplanations[char]}</li>`;
                    i++;
                    explained = true;
                }
            }
            
            // Check for {n,m} quantifiers
            if (!explained && pattern[i] === '{') {
                const endBrace = pattern.indexOf('}', i);
                if (endBrace !== -1) {
                    const quantifier = pattern.slice(i, endBrace + 1);
                    explanation += `<li><code>${escapeHtml(quantifier)}</code> - repeat ${quantifier.slice(1, -1)} times</li>`;
                    i = endBrace + 1;
                    explained = true;
                }
            }
            
            if (!explained) {
                i++;
            }
        }
        
        explanation += '</ul>';
        explanationContent.innerHTML = explanation;
    }

    // Extract and display capture groups
    function extractGroups(testString) {
        if (!testString || !currentRegex) {
            groupsContent.innerHTML = '<p class="placeholder">Capture groups will appear here</p>';
            return;
        }

        const tempRegex = new RegExp(regexInput.value, flags.includes('g') ? flags : flags + 'g');
        const matches = [];
        let match;
        
        while ((match = tempRegex.exec(testString)) !== null) {
            matches.push(match);
            if (!flags.includes('g')) break;
            if (match[0].length === 0) tempRegex.lastIndex++;
        }

        if (matches.length === 0 || matches[0].length <= 1) {
            groupsContent.innerHTML = '<p class="placeholder">No capture groups found</p>';
            return;
        }

        let groupsHtml = '';
        
        matches.forEach((m, matchIdx) => {
            if (m.length > 1) {
                groupsHtml += `<div class="match-groups">
                    <h4>Match ${matchIdx + 1}: "${escapeHtml(m[0])}"</h4>`;
                
                for (let i = 1; i < m.length; i++) {
                    groupsHtml += `<div class="group-item">
                        <span class="group-number">Group ${i}:</span>
                        <span class="group-value">${escapeHtml(m[i] || '(empty)')}</span>
                    </div>`;
                }
                
                groupsHtml += '</div>';
            }
        });

        if (!groupsHtml) {
            groupsHtml = '<p class="placeholder">No capture groups found</p>';
        }

        groupsContent.innerHTML = groupsHtml;
    }

    // Show group details on match click
    function showGroupDetails(groupIdx) {
        const matches = document.querySelectorAll('.match');
        if (matches[groupIdx]) {
            matches.forEach(m => m.classList.remove('selected'));
            matches[groupIdx].classList.add('selected');
        }
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('visible');
        matchDisplay.innerHTML = '<span class="placeholder">Invalid regex pattern</span>';
        matchStats.textContent = '';
        explanationContent.innerHTML = '<p class="placeholder">Pattern explanation unavailable due to error</p>';
        groupsContent.innerHTML = '<p class="placeholder">Capture groups unavailable due to error</p>';
    }

    // Clear all results
    function clearResults() {
        matchDisplay.innerHTML = '<span class="placeholder">Enter a regex pattern and test string to see matches</span>';
        matchStats.textContent = '';
        explanationContent.innerHTML = '<p class="placeholder">Your regex pattern explanation will appear here</p>';
        groupsContent.innerHTML = '<p class="placeholder">Capture groups will appear here</p>';
    }

    // Utility: Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
