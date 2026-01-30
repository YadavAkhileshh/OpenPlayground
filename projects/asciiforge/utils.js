// Utility Functions for AsciiForge

/**
 * Show notification toast
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;
    
    notificationText.textContent = message;
    
    // Set notification type
    notification.classList.remove('error', 'warning', 'success');
    if (type === 'error') {
        notification.classList.add('error');
    } else if (type === 'warning') {
        notification.classList.add('warning');
    } else {
        notification.classList.add('success');
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Split text into lines that fit within maxWidth
 * @param {string} text - Text to split
 * @param {number} maxWidth - Maximum line width
 * @returns {string[]} Array of lines
 */
function splitTextIntoLines(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let word of words) {
        // If a single word is longer than maxWidth, we need to split it
        if (word.length > maxWidth) {
            // If we have a current line, push it first
            if (currentLine) {
                lines.push(currentLine);
                currentLine = '';
            }
            
            // Split the long word into chunks
            for (let i = 0; i < word.length; i += maxWidth) {
                const chunk = word.slice(i, i + maxWidth);
                if (chunk.length === maxWidth) {
                    lines.push(chunk);
                } else {
                    currentLine = chunk;
                }
            }
            continue;
        }

        if (currentLine.length + word.length + 1 <= maxWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
}

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} Validation result {valid: boolean, message: string}
 */
function validateImageFile(file) {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return {
            valid: false,
            message: `Image size (${formatFileSize(file.size)}) exceeds maximum limit of 10MB`
        };
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
        return {
            valid: false,
            message: 'Please select a valid image file (JPG, PNG, GIF, WebP)'
        };
    }
    
    return { valid: true, message: 'Valid image file' };
}

/**
 * Update slider display values
 */
function updateSliderValues() {
    const widthValue = document.getElementById('widthValue');
    const contrastValue = document.getElementById('contrastValue');
    const brightnessValue = document.getElementById('brightnessValue');
    const fontSizeValue = document.getElementById('fontSizeValue');
    
    const widthSlider = document.getElementById('widthSlider');
    const contrastSlider = document.getElementById('contrastSlider');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    
    if (widthValue && widthSlider) widthValue.textContent = widthSlider.value;
    if (contrastValue && contrastSlider) contrastValue.textContent = contrastSlider.value;
    if (brightnessValue && brightnessSlider) brightnessValue.textContent = brightnessSlider.value;
    if (fontSizeValue && fontSizeSlider) fontSizeValue.textContent = fontSizeSlider.value;
}

/**
 * Update ASCII display (font size, etc.)
 */
function updateAsciiDisplay() {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const outputBox = document.getElementById('outputBox');
    
    if (!fontSizeSlider || !outputBox) return;
    
    const fontSize = parseInt(fontSizeSlider.value);
    
    // Remove existing font size classes
    outputBox.classList.remove('ascii-small', 'ascii-medium', 'ascii-large', 'ascii-xlarge');
    
    // Add appropriate class based on font size
    if (fontSize <= 8) {
        outputBox.classList.add('ascii-small');
    } else if (fontSize <= 10) {
        outputBox.classList.add('ascii-medium');
    } else if (fontSize <= 12) {
        outputBox.classList.add('ascii-large');
    } else {
        outputBox.classList.add('ascii-xlarge');
    }
    
    // Apply inline font size as well
    outputBox.style.fontSize = `${fontSize}px`;
    
    // Update the output if we have ASCII to display
    const appState = window.appState;
    if (appState && appState.asciiOutput) {
        outputBox.textContent = appState.asciiOutput;
        outputBox.classList.remove('output-placeholder');
    }
}

/**
 * Generate sample ASCII art for initial display
 */
function generateSampleAscii() {
    const sampleAscii = `
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║                  ASCIIFORGE v2.0                         ║
║         High-Accuracy ASCII Art Generator                ║
║                                                          ║
║  • Upload images for detailed conversion                 ║
║  • Adjust contrast, brightness & dithering               ║
║  • Multiple character sets for different styles          ║
║  • Real-time preview and comparison                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `.trim();
    
    if (window.appState) {
        window.appState.asciiOutput = sampleAscii;
    }
    
    displayAsciiOutput(sampleAscii, true);
}

/**
 * Display ASCII output with statistics
 * @param {string} ascii - ASCII art to display
 * @param {boolean} isSample - Whether this is a sample display
 * @param {Object} stats - Statistics object
 */
function displayAsciiOutput(ascii, isSample = false, stats = null) {
    const outputBox = document.getElementById('outputBox');
    const dimensionsStat = document.getElementById('dimensionsStat');
    const charsStat = document.getElementById('charsStat');
    const timeStat = document.getElementById('timeStat');
    
    if (!outputBox) return;
    
    outputBox.textContent = ascii;
    outputBox.classList.remove('output-placeholder');
    
    if (window.appState) {
        window.appState.asciiOutput = ascii;
    }
    
    // Update font size display
    updateAsciiDisplay();
    
    // Update statistics
    if (stats && dimensionsStat && charsStat && timeStat) {
        dimensionsStat.innerHTML = `<i class="fas fa-expand-alt"></i><span>${stats.width}×${stats.height}</span>`;
        charsStat.innerHTML = `<i class="fas fa-font"></i><span>${stats.chars.toLocaleString()} chars</span>`;
        timeStat.innerHTML = `<i class="fas fa-clock"></i><span>${stats.time}ms</span>`;
    } else if (!isSample && dimensionsStat && charsStat) {
        const lines = ascii.split('\n');
        const width = lines[0] ? lines[0].length : 0;
        const height = lines.length;
        const charCount = ascii.length;
        
        dimensionsStat.innerHTML = `<i class="fas fa-expand-alt"></i><span>${width}×${height}</span>`;
        charsStat.innerHTML = `<i class="fas fa-font"></i><span>${charCount.toLocaleString()} chars</span>`;
        if (timeStat) {
            timeStat.innerHTML = `<i class="fas fa-clock"></i><span>-</span>`;
        }
    }
    
    if (!isSample) {
        showNotification('High-accuracy ASCII art generated!', 'success');
    }
}

// Export functions for use in other modules
window.utils = {
    showNotification,
    splitTextIntoLines,
    formatFileSize,
    debounce,
    throttle,
    validateImageFile,
    updateSliderValues,
    updateAsciiDisplay,
    generateSampleAscii,
    displayAsciiOutput
};