document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const currentKeyElement = document.getElementById('currentKey');
    const keyValueElement = document.getElementById('keyValue');
    const keyCodeElement = document.getElementById('keyCode');
    const keyNumberElement = document.getElementById('keyNumber');
    const eventTypeElement = document.getElementById('eventType');
    const keyCircle = document.getElementById('keyCircle');
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');
    const keyboardVisual = document.getElementById('keyboardVisual');
    const totalKeysElement = document.getElementById('totalKeys');
    const uniqueKeysElement = document.getElementById('uniqueKeys');
    const sessionKeysElement = document.getElementById('sessionKeys');
    
    // Audio element
    const keySound = document.getElementById('keySound');
    
    // State variables
    let keyHistory = [];
    let pressedKeys = new Set();
    let uniqueKeysSet = new Set();
    let sessionKeyCount = 0;
    let soundEnabled = true;
    let testMode = false;
    let testSequence = ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'];
    let currentTestIndex = 0;
    
    // Initialize
    createKeyboard();
    updateStatistics();
    
    // Event Listeners
    document.addEventListener('keydown', handleKeyEvent);
    document.addEventListener('keyup', handleKeyEvent);
    
    // Button Event Listeners
    document.getElementById('clearHistory').addEventListener('click', clearHistory);
    document.getElementById('toggleSound').addEventListener('click', toggleSound);
    document.getElementById('startTest').addEventListener('click', startKeyTest);
    document.getElementById('copyData').addEventListener('click', copyKeyData);
    
    // Handle key events
    function handleKeyEvent(event) {
        // Prevent default for certain keys to avoid page scrolling, etc.
        if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
        }
        
        // Update pressed keys set
        if (event.type === 'keydown') {
            pressedKeys.add(event.code);
        } else if (event.type === 'keyup') {
            pressedKeys.delete(event.code);
        }
        
        // Only process keydown events for display (avoid duplicates)
        if (event.type === 'keydown') {
            updateKeyDisplay(event);
            addToHistory(event);
            updateKeyboardVisual();
            updateStatistics();
            
            // Play sound if enabled
            if (soundEnabled) {
                playKeySound();
            }
            
            // If in test mode, check if correct key was pressed
            if (testMode) {
                checkTestKey(event.key);
            }
        } else {
            // Update keyboard visual on keyup
            updateKeyboardVisual();
        }
    }
    
    // Update the main key display
    function updateKeyDisplay(event) {
        const key = event.key === ' ' ? 'Space' : event.key;
        const code = event.code;
        const keyCode = event.keyCode || event.which;
        
        // Update display elements
        currentKeyElement.textContent = key.length > 1 ? key.charAt(0) : key;
        keyValueElement.textContent = key;
        keyCodeElement.textContent = code;
        keyNumberElement.textContent = keyCode;
        eventTypeElement.textContent = event.type;
        
        // Add press animation to circle
        keyCircle.classList.add('pressed');
        setTimeout(() => {
            keyCircle.classList.remove('pressed');
        }, 300);
        
        // Update unique keys set
        uniqueKeysSet.add(key.toUpperCase());
    }
    
    // Add key event to history
    function addToHistory(event) {
        // Remove empty state if it exists
        if (emptyHistory.style.display !== 'none') {
            emptyHistory.style.display = 'none';
        }
        
        const key = event.key === ' ' ? 'Space' : event.key;
        const code = event.code;
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'});
        
        // Create history item
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-key">${key}</div>
            <div class="history-code">${code}</div>
            <div class="history-time">${time}</div>
        `;
        
        // Add to beginning of history list
        historyList.prepend(historyItem);
        
        // Keep only last 10 items in history
        if (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
        
        // Update session key count
        sessionKeyCount++;
        
        // Add to history array
        keyHistory.unshift({
            key: key,
            code: code,
            keyCode: event.keyCode,
            time: time,
            type: event.type
        });
    }
    
    // Create visual keyboard
    function createKeyboard() {
        // Define keyboard layout
        const keyboardLayout = [
            ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
            ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
            ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
            ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
            ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
            ['ControlLeft', 'AltLeft', 'Space', 'AltRight', 'ControlRight']
        ];
        
        // Map for displaying key names
        const keyDisplayMap = {
            'Escape': 'Esc',
            'Backquote': '`',
            'Minus': '-',
            'Equal': '=',
            'Backspace': '←',
            'Tab': 'Tab',
            'BracketLeft': '[',
            'BracketRight': ']',
            'Backslash': '\\',
            'CapsLock': 'Caps',
            'Semicolon': ';',
            'Quote': "'",
            'Enter': 'Enter',
            'ShiftLeft': 'Shift',
            'ShiftRight': 'Shift',
            'ControlLeft': 'Ctrl',
            'AltLeft': 'Alt',
            'Space': 'Space',
            'AltRight': 'Alt',
            'ControlRight': 'Ctrl',
            'Comma': ',',
            'Period': '.',
            'Slash': '/'
        };
        
        // Clear existing keyboard
        keyboardVisual.innerHTML = '';
        
        // Create keyboard keys
        keyboardLayout.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            rowElement.style.display = 'flex';
            rowElement.style.gap = '10px';
            rowElement.style.marginBottom = '10px';
            rowElement.style.width = '100%';
            rowElement.style.justifyContent = 'center';
            
            row.forEach(keyCode => {
                const keyElement = document.createElement('div');
                keyElement.className = 'keyboard-key';
                keyElement.id = `key-${keyCode}`;
                keyElement.dataset.code = keyCode;
                
                // Set width based on key type
                if (keyCode.includes('Shift') || keyCode.includes('Control') || keyCode.includes('Alt')) {
                    keyElement.classList.add('wide');
                } else if (keyCode === 'Backspace' || keyCode === 'Enter' || keyCode === 'Tab' || keyCode === 'CapsLock') {
                    keyElement.classList.add('extra-wide');
                } else if (keyCode === 'Space') {
                    keyElement.classList.add('space');
                } else if (keyCode.includes('F')) {
                    keyElement.style.width = '50px';
                }
                
                // Set display text
                let displayText = keyDisplayMap[keyCode];
                if (!displayText) {
                    // Extract letter from code (e.g., "KeyA" -> "A")
                    if (keyCode.startsWith('Key')) {
                        displayText = keyCode.substring(3);
                    } else if (keyCode.startsWith('Digit')) {
                        displayText = keyCode.substring(5);
                    } else {
                        displayText = keyCode;
                    }
                }
                
                keyElement.textContent = displayText;
                rowElement.appendChild(keyElement);
            });
            
            keyboardVisual.appendChild(rowElement);
        });
    }
    
    // Update visual keyboard based on pressed keys
    function updateKeyboardVisual() {
        // Remove pressed class from all keys
        document.querySelectorAll('.keyboard-key').forEach(key => {
            key.classList.remove('pressed');
        });
        
        // Add pressed class to currently pressed keys
        pressedKeys.forEach(keyCode => {
            const keyElement = document.getElementById(`key-${keyCode}`);
            if (keyElement) {
                keyElement.classList.add('pressed');
            }
        });
    }
    
    // Update statistics
    function updateStatistics() {
        totalKeysElement.textContent = keyHistory.length;
        uniqueKeysElement.textContent = uniqueKeysSet.size;
        sessionKeysElement.textContent = sessionKeyCount;
    }
    
    // Play key sound
    function playKeySound() {
        // Reset audio to start
        keySound.currentTime = 0;
        
        // Adjust volume based on key type
        if (['Space', 'Enter', 'Backspace', 'Tab'].includes(event.code)) {
            keySound.volume = 0.3;
        } else {
            keySound.volume = 0.2;
        }
        
        // Play sound
        keySound.play().catch(e => {
            // Audio play failed, might be due to browser autoplay policy
            console.log("Audio play failed:", e);
        });
    }
    
    // Clear history
    function clearHistory() {
        keyHistory = [];
        uniqueKeysSet.clear();
        sessionKeyCount = 0;
        
        // Clear history list
        historyList.innerHTML = '';
        
        // Show empty state
        emptyHistory.style.display = 'block';
        
        // Update statistics
        updateStatistics();
        
        // Show confirmation
        showNotification('History cleared successfully!', 'success');
    }
    
    // Toggle sound
    function toggleSound() {
        soundEnabled = !soundEnabled;
        const button = document.getElementById('toggleSound');
        const icon = button.querySelector('i');
        
        if (soundEnabled) {
            icon.className = 'fas fa-volume-up';
            showNotification('Sound enabled', 'success');
        } else {
            icon.className = 'fas fa-volume-mute';
            showNotification('Sound disabled', 'info');
        }
    }
    
    // Start key test
    function startKeyTest() {
        testMode = !testMode;
        const button = document.getElementById('startTest');
        const icon = button.querySelector('i');
        
        if (testMode) {
            currentTestIndex = 0;
            icon.className = 'fas fa-stop';
            button.innerHTML = '<i class="fas fa-stop"></i> Stop Key Test';
            showNotification(`Key test started! Press ${testSequence[currentTestIndex]} to begin.`, 'info');
            
            // Highlight the first test key
            highlightTestKey();
        } else {
            icon.className = 'fas fa-play';
            button.innerHTML = '<i class="fas fa-play"></i> Start Key Test';
            showNotification('Key test stopped.', 'info');
            
            // Remove any test highlighting
            removeTestHighlighting();
        }
    }
    
    // Check if pressed key matches test sequence
    function checkTestKey(key) {
        if (!testMode) return;
        
        const expectedKey = testSequence[currentTestIndex];
        
        if (key.toUpperCase() === expectedKey.toUpperCase()) {
            // Correct key pressed
            showNotification(`Correct! Press ${testSequence[currentTestIndex + 1] || 'any key to finish'} next.`, 'success');
            
            // Move to next key in sequence
            currentTestIndex++;
            
            // Remove highlighting from previous key
            removeTestHighlighting();
            
            // If we've reached the end of the sequence
            if (currentTestIndex >= testSequence.length) {
                showNotification('Test completed! All keys pressed correctly.', 'success');
                testMode = false;
                document.getElementById('startTest').innerHTML = '<i class="fas fa-play"></i> Start Key Test';
                return;
            }
            
            // Highlight the next test key
            highlightTestKey();
        } else {
            // Wrong key pressed
            showNotification(`Wrong key! Press ${expectedKey}`, 'danger');
        }
    }
    
    // Highlight current test key on visual keyboard
    function highlightTestKey() {
        if (!testMode || currentTestIndex >= testSequence.length) return;
        
        const currentKey = testSequence[currentTestIndex];
        const keyElement = document.querySelector(`.keyboard-key:contains('${currentKey}')`);
        
        if (keyElement) {
            keyElement.style.backgroundColor = 'var(--success)';
            keyElement.style.color = 'white';
            keyElement.style.boxShadow = '0 0 15px var(--success)';
        }
    }
    
    // Remove test highlighting
    function removeTestHighlighting() {
        document.querySelectorAll('.keyboard-key').forEach(key => {
            key.style.backgroundColor = '';
            key.style.color = '';
            key.style.boxShadow = '';
        });
    }
    
    // Copy key data to clipboard
    function copyKeyData() {
        if (keyHistory.length === 0) {
            showNotification('No key data to copy!', 'danger');
            return;
        }
        
        // Create text to copy
        let textToCopy = 'Keyboard Detector - Key History\n';
        textToCopy += '=============================\n\n';
        
        keyHistory.slice(0, 5).forEach((item, index) => {
            textToCopy += `${index + 1}. Key: ${item.key} | Code: ${item.code} | Time: ${item.time}\n`;
        });
        
        textToCopy += `\nTotal Keys: ${keyHistory.length}\n`;
        textToCopy += `Unique Keys: ${uniqueKeysSet.size}\n`;
        textToCopy += `Session Keys: ${sessionKeyCount}\n`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showNotification('Key data copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showNotification('Failed to copy data', 'danger');
            });
    }
    
    // Show notification
    function showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: fadeInDown 0.3s ease-out;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        
        // Set background color based on type
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, var(--success), #22c55e)';
        } else if (type === 'danger') {
            notification.style.background = 'linear-gradient(135deg, var(--danger), #e11d48)';
        } else {
            notification.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Add fadeOut animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    // Helper function to check if element contains text (for keyboard highlighting)
    // This is needed because :contains selector is not standard
    Element.prototype.containsText = function(text) {
        return this.textContent.includes(text);
    };
    
    // Initial instruction
    showNotification('Press any key to start detecting!', 'info');
});