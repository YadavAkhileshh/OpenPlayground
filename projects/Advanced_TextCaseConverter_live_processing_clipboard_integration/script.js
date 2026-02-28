
        // State management
        const state = {
            currentMode: null,
            originalText: '',
            convertedText: '',
            history: [],
            currentHistoryIndex: -1
        };

        // DOM elements
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');
        const charCount = document.getElementById('charCount').querySelector('span');
        const wordCount = document.getElementById('wordCount').querySelector('span');
        const sentenceCount = document.getElementById('sentenceCount').querySelector('span');
        const currentMode = document.getElementById('currentMode');
        const copyBtn = document.getElementById('copyBtn');
        const undoBtn = document.getElementById('undoBtn');
        const resetBtn = document.getElementById('resetBtn');
        const caseButtons = document.querySelectorAll('.case-buttons .btn');
        const historyList = document.getElementById('historyList');
        const notification = document.getElementById('notification');

        // Abbreviations to preserve in sentence case
        const abbreviations = ['dr.', 'mr.', 'mrs.', 'ms.', 'prof.', 'rev.', 'hon.', 'st.', 'ave.', 'blvd.', 'e.g.', 'i.e.', 'etc.', 'vs.', 'dept.', 'univ.', 'assn.', 'bldg.', 'co.', 'corp.', 'inc.', 'ltd.', 'jr.', 'sr.'];

        // Initialize
        function init() {
            setupEventListeners();
            updateStats();
            
            // Load from localStorage if available
            const savedText = localStorage.getItem('textCaseConverter_input');
            if (savedText) {
                inputText.value = savedText;
                state.originalText = savedText;
                processInput();
            }
        }

        // Set up event listeners
        function setupEventListeners() {
            // Input text event
            inputText.addEventListener('input', () => {
                state.originalText = inputText.value;
                localStorage.setItem('textCaseConverter_input', state.originalText);
                processInput();
                updateStats();
            });

            // Case buttons
            caseButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const mode = button.dataset.mode;
                    setActiveMode(mode);
                });
            });

            // Action buttons
            copyBtn.addEventListener('click', copyToClipboard);
            undoBtn.addEventListener('click', undo);
            resetBtn.addEventListener('click', reset);

            // Keyboard shortcuts
            document.addEventListener('keydown', handleKeyboardShortcuts);
        }

        // Handle keyboard shortcuts
        function handleKeyboardShortcuts(e) {
            // Check for Ctrl key (or Cmd on Mac)
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                
                switch(e.key) {
                    case '1':
                        setActiveMode('uppercase');
                        break;
                    case '2':
                        setActiveMode('lowercase');
                        break;
                    case '3':
                        setActiveMode('sentence');
                        break;
                    case '4':
                        setActiveMode('title');
                        break;
                    case 'c':
                        copyToClipboard();
                        break;
                    case 'z':
                        if (e.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                        break;
                }
            }
        }

        // Process input text based on current mode
        function processInput() {
            if (!state.currentMode || state.originalText.trim() === '') {
                outputText.value = state.originalText;
                state.convertedText = state.originalText;
                return;
            }

            let result = state.originalText;
            
            switch(state.currentMode) {
                case 'uppercase':
                    result = convertToUpperCase(state.originalText);
                    break;
                case 'lowercase':
                    result = convertToLowerCase(state.originalText);
                    break;
                case 'sentence':
                    result = convertToSentenceCase(state.originalText);
                    break;
                case 'title':
                    result = convertToTitleCase(state.originalText);
                    break;
                case 'toggle':
                    result = convertToToggleCase(state.originalText);
                    break;
            }
            
            outputText.value = result;
            state.convertedText = result;
            
            // Add to history
            addToHistory(state.currentMode, result);
        }

        // Set active mode and update UI
        function setActiveMode(mode) {
            // Remove active class from all buttons
            caseButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            // Add active class to clicked button
            const activeButton = document.querySelector(`[data-mode="${mode}"]`);
            activeButton.classList.add('active');
            activeButton.classList.add('pulse');
            setTimeout(() => activeButton.classList.remove('pulse'), 300);
            
            // Update state and UI
            state.currentMode = mode;
            currentMode.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
            
            // Process input with new mode
            processInput();
        }

        // Conversion functions
        function convertToUpperCase(text) {
            return text.toUpperCase();
        }

        function convertToLowerCase(text) {
            return text.toLowerCase();
        }

        function convertToSentenceCase(text) {
            // Split by sentence endings (. ! ?) but preserve abbreviations
            const sentences = text.split(/(?<=[.!?])\s+/);
            return sentences.map(sentence => {
                if (sentence.trim() === '') return sentence;
                
                // Check if this "sentence" is actually an abbreviation
                const lowerSentence = sentence.toLowerCase();
                const isAbbreviation = abbreviations.some(abbr => 
                    lowerSentence.includes(abbr) && 
                    (lowerSentence.endsWith(abbr) || lowerSentence.includes(abbr + ' '))
                );
                
                if (isAbbreviation && sentence.length < 50) {
                    // Don't capitalize abbreviations that might not be actual sentences
                    return sentence;
                }
                
                // Capitalize first letter of sentence
                return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
            }).join(' ');
        }

        function convertToTitleCase(text) {
            const stopWords = ['a', 'an', 'and', 'the', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in', 'with'];
            
            return text.split(' ').map((word, index) => {
                // Always capitalize first and last word
                if (index === 0 || index === text.split(' ').length - 1) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
                
                // Don't capitalize stop words
                if (stopWords.includes(word.toLowerCase())) {
                    return word.toLowerCase();
                }
                
                // Capitalize all other words
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');
        }

        function convertToToggleCase(text) {
            return text.split('').map(char => {
                if (char === char.toUpperCase()) {
                    return char.toLowerCase();
                } else {
                    return char.toUpperCase();
                }
            }).join('');
        }

        // Update statistics
        function updateStats() {
            const text = inputText.value;
            
            // Character count
            charCount.textContent = text.length;
            
            // Word count (handle multiple spaces and line breaks)
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            wordCount.textContent = words.length;
            
            // Sentence count (simplified)
            const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
            sentenceCount.textContent = sentences.length || 0;
        }

        // Copy to clipboard
        async function copyToClipboard() {
            if (!state.convertedText) {
                showNotification('No text to copy!', 'error');
                return;
            }
            
            try {
                await navigator.clipboard.writeText(state.convertedText);
                showNotification('Copied to clipboard!', 'success');
                copyBtn.classList.add('pulse');
                setTimeout(() => copyBtn.classList.remove('pulse'), 300);
            } catch (err) {
                console.error('Failed to copy: ', err);
                showNotification('Failed to copy to clipboard', 'error');
            }
        }

        // Undo functionality
        function undo() {
            if (state.currentHistoryIndex > 0) {
                state.currentHistoryIndex--;
                const historyItem = state.history[state.currentHistoryIndex];
                outputText.value = historyItem.text;
                state.convertedText = historyItem.text;
                setActiveMode(historyItem.mode);
                showNotification('Undo applied', 'info');
                
                // Pulse undo button
                undoBtn.classList.add('pulse');
                setTimeout(() => undoBtn.classList.remove('pulse'), 300);
            } else {
                showNotification('Nothing to undo', 'info');
            }
            
            updateHistoryDisplay();
        }

        // Redo functionality
        function redo() {
            if (state.currentHistoryIndex < state.history.length - 1) {
                state.currentHistoryIndex++;
                const historyItem = state.history[state.currentHistoryIndex];
                outputText.value = historyItem.text;
                state.convertedText = historyItem.text;
                setActiveMode(historyItem.mode);
                showNotification('Redo applied', 'info');
            } else {
                showNotification('Nothing to redo', 'info');
            }
            
            updateHistoryDisplay();
        }

        // Reset functionality
        function reset() {
            inputText.value = '';
            outputText.value = '';
            state.originalText = '';
            state.convertedText = '';
            state.currentMode = null;
            state.history = [];
            state.currentHistoryIndex = -1;
            
            // Remove active class from all buttons
            caseButtons.forEach(button => button.classList.remove('active'));
            
            // Update UI
            currentMode.textContent = 'None';
            updateStats();
            updateHistoryDisplay();
            localStorage.removeItem('textCaseConverter_input');
            
            showNotification('All text cleared', 'info');
            
            // Pulse reset button
            resetBtn.classList.add('pulse');
            setTimeout(() => resetBtn.classList.remove('pulse'), 300);
        }

        // Add conversion to history
        function addToHistory(mode, text) {
            // Only add if different from last history item
            if (state.history.length === 0 || 
                state.history[state.history.length - 1].text !== text) {
                
                state.history.push({
                    mode: mode,
                    text: text,
                    timestamp: new Date().toLocaleTimeString()
                });
                
                // Keep only last 10 items
                if (state.history.length > 10) {
                    state.history.shift();
                }
                
                state.currentHistoryIndex = state.history.length - 1;
                updateHistoryDisplay();
            }
        }

        // Update history display
        function updateHistoryDisplay() {
            historyList.innerHTML = '';
            
            state.history.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.textContent = `${item.mode}: ${item.text.substring(0, 30)}${item.text.length > 30 ? '...' : ''}`;
                
                // Highlight current history item
                if (index === state.currentHistoryIndex) {
                    historyItem.style.backgroundColor = 'var(--primary)';
                    historyItem.style.color = 'white';
                }
                
                historyItem.addEventListener('click', () => {
                    state.currentHistoryIndex = index;
                    outputText.value = item.text;
                    state.convertedText = item.text;
                    setActiveMode(item.mode);
                    updateHistoryDisplay();
                });
                
                historyList.appendChild(historyItem);
            });
        }

        // Show notification
        function showNotification(message, type) {
            notification.textContent = message;
            notification.className = `notification notification-${type}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Initialize the app
        window.addEventListener('DOMContentLoaded', init);
   