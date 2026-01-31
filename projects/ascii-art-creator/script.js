document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const fontSelector = document.getElementById('fontSelector');
    const colorSelector = document.getElementById('colorSelector');
    const densitySlider = document.getElementById('densitySlider');
    const densityValue = document.getElementById('densityValue');
    const generateBtn = document.getElementById('generateBtn');
    const randomBtn = document.getElementById('randomBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const asciiOutput = document.getElementById('asciiOutput');
    const charOutput = document.getElementById('charOutput');
    const lineOutput = document.getElementById('lineOutput');
    const densityOutput = document.getElementById('densityOutput');
    const historyList = document.getElementById('historyList');
    const logCount = document.getElementById('logCount');
    const timeDisplay = document.getElementById('timeDisplay');
    const memoryUsage = document.getElementById('memoryUsage');
    const bufferStatus = document.getElementById('bufferStatus');
    const exportModal = document.getElementById('exportModal');
    const closeModal = document.getElementById('closeModal');
    const exportPreview = document.getElementById('exportPreview');
    
    // Audio
    const clickSound = document.getElementById('clickSound');
    const generateSound = document.getElementById('generateSound');
    
    // State
    let state = {
        currentFont: 'block',
        currentColor: 1,
        currentDensity: 5,
        asciiHistory: [],
        lastGenerated: null,
        isGenerating: false
    };
    
    // ASCII Font Definitions
    const asciiFonts = [
        {
            id: 'block',
            name: 'BLOCK',
            chars: ['█', '▓', '▒', '░', ' '],
            preview: '█▓▒░'
        },
        {
            id: 'simple',
            name: 'SIMPLE',
            chars: ['#', '*', '+', '-', ' '],
            preview: '#*+-'
        },
        {
            id: 'matrix',
            name: 'MATRIX',
            chars: ['0', '1', '░', '▒', '▓'],
            preview: '01░▒▓'
        },
        {
            id: 'dots',
            name: 'DOTS',
            chars: ['●', '○', '•', '·', ' '],
            preview: '●○•·'
        },
        {
            id: 'tech',
            name: 'TECH',
            chars: ['┃', '━', '╋', '┏', '┓', '┗', '┛'],
            preview: '┃━╋┏┓'
        },
        {
            id: 'gradient',
            name: 'GRADIENT',
            chars: ['▓', '▒', '░', '·', ' '],
            preview: '▓▒░·'
        }
    ];
    
    // Color Schemes
    const colorSchemes = [
        { id: 1, name: 'CYBER GREEN', color: '#00ff9d', preview: '#00ff9d' },
        { id: 2, name: 'CYBER BLUE', color: '#00ccff', preview: '#00ccff' },
        { id: 3, name: 'NEON ORANGE', color: '#ff9900', preview: '#ff9900' },
        { id: 4, name: 'PINK MATRIX', color: '#ff66cc', preview: '#ff66cc' },
        { id: 5, name: 'PURPLE HAZE', color: '#9966ff', preview: '#9966ff' },
        { id: 6, name: 'YELLOW PULSE', color: '#ffff66', preview: '#ffff66' }
    ];
    
    // Initialize
    init();
    
    // Event Listeners
    textInput.addEventListener('input', updateCharCount);
    textInput.addEventListener('keydown', handleKeydown);
    
    densitySlider.addEventListener('input', updateDensityValue);
    
    generateBtn.addEventListener('click', generateASCII);
    randomBtn.addEventListener('click', randomizeSettings);
    clearBtn.addEventListener('click', clearAll);
    
    copyBtn.addEventListener('click', copyASCII);
    downloadBtn.addEventListener('click', showExportModal);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    closeModal.addEventListener('click', () => exportModal.style.display = 'none');
    
    // Export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.dataset.format;
            if (!this.disabled) {
                handleExport(format);
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl + Enter: Generate
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            generateASCII();
            playSound(clickSound);
        }
        
        // Ctrl + C: Copy
        if (e.ctrlKey && e.key === 'c') {
            const active = document.activeElement;
            if (active !== textInput) {
                e.preventDefault();
                copyASCII();
            }
        }
        
        // Ctrl + D: Download
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            showExportModal();
        }
    });
    
    // Functions
    function init() {
        // Initialize font selector
        renderFontOptions();
        
        // Initialize color selector
        renderColorOptions();
        
        // Update time display
        updateTime();
        setInterval(updateTime, 1000);
        
        // Update memory usage (mock)
        setInterval(updateMemoryUsage, 3000);
        
        // Update buffer status
        setInterval(updateBufferStatus, 5000);
        
        // Load from localStorage
        loadState();
        
        // Generate initial ASCII
        generateASCII();
    }
    
    function renderFontOptions() {
        fontSelector.innerHTML = '';
        asciiFonts.forEach(font => {
            const option = document.createElement('div');
            option.className = `font-option ${font.id === state.currentFont ? 'active' : ''}`;
            option.dataset.font = font.id;
            
            option.innerHTML = `
                <div class="font-preview">${font.preview}</div>
                <div class="font-name">${font.name}</div>
            `;
            
            option.addEventListener('click', function() {
                document.querySelectorAll('.font-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                state.currentFont = font.id;
                saveState();
                playSound(clickSound);
            });
            
            fontSelector.appendChild(option);
        });
    }
    
    function renderColorOptions() {
        colorSelector.innerHTML = '';
        colorSchemes.forEach(scheme => {
            const option = document.createElement('div');
            option.className = `color-option ${scheme.id === state.currentColor ? 'active' : ''}`;
            option.dataset.color = scheme.id;
            
            option.innerHTML = `
                <div class="color-preview" style="background-color: ${scheme.preview}"></div>
                <div class="font-name">${scheme.name}</div>
            `;
            
            option.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                state.currentColor = scheme.id;
                saveState();
                playSound(clickSound);
            });
            
            colorSelector.appendChild(option);
        });
    }
    
    function updateCharCount() {
        const count = textInput.value.length;
        charCount.textContent = count;
        bufferStatus.textContent = count > 0 ? `${count} CHARS` : 'CLEAR';
    }
    
    function updateDensityValue() {
        state.currentDensity = parseInt(densitySlider.value);
        densityValue.textContent = state.currentDensity;
        saveState();
    }
    
    function updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timeDisplay.textContent = timeStr;
    }
    
    function updateMemoryUsage() {
        // Mock memory usage (between 20-80%)
        const usage = Math.floor(Math.random() * 60) + 20;
        memoryUsage.textContent = `${usage}%`;
    }
    
    function updateBufferStatus() {
        // Random buffer status messages
        const messages = ['CLEAR', 'IDLE', 'STANDBY', 'READY', 'ACTIVE'];
        if (textInput.value.length === 0) {
            bufferStatus.textContent = messages[Math.floor(Math.random() * messages.length)];
        }
    }
    
    function handleKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
            e.preventDefault();
            generateASCII();
        }
    }
    
    function generateASCII() {
        if (state.isGenerating) return;
        
        state.isGenerating = true;
        playSound(generateSound);
        
        const text = textInput.value.trim() || 'ASCII';
        const font = asciiFonts.find(f => f.id === state.currentFont);
        const density = state.currentDensity;
        
        // Show generating animation
        asciiOutput.innerHTML = `
            <div class="ascii-placeholder">
                <div class="placeholder-text">
                    <span class="blink-cursor">▌</span> GENERATING ASCII MATRIX...
                </div>
            </div>
        `;
        
        // Simulate processing delay
        setTimeout(() => {
            const asciiArt = createASCIIArt(text, font, density);
            displayASCII(asciiArt, font, density);
            addToHistory(text, asciiArt);
            state.isGenerating = false;
        }, 300);
    }
    
    function createASCIIArt(text, font, density) {
        const lines = [];
        const chars = font.chars;
        const charCount = chars.length;
        
        // For each character in text
        for (let lineNum = 0; lineNum < 7; lineNum++) {
            let line = '';
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i].toUpperCase();
                const asciiPattern = getCharPattern(char, lineNum);
                
                // Convert pattern to ASCII characters based on density
                for (let j = 0; j < asciiPattern.length; j++) {
                    const pixel = asciiPattern[j];
                    if (pixel === '1') {
                        // Use density to determine which character to use
                        const charIndex = Math.min(
                            Math.floor(density / (10 / charCount)),
                            charCount - 1
                        );
                        line += chars[charIndex];
                    } else {
                        line += ' ';
                    }
                }
                line += '  '; // Spacing between characters
            }
            
            lines.push(line);
        }
        
        return lines;
    }
    
    function getCharPattern(char, line) {
        // Simplified ASCII patterns for A-Z, 0-9
        const patterns = {
            'A': [
                '  ███  ',
                ' ██ ██ ',
                '██   ██',
                '███████',
                '██   ██',
                '██   ██',
                '██   ██'
            ],
            'S': [
                ' █████ ',
                '██   ██',
                '██     ',
                ' █████ ',
                '     ██',
                '██   ██',
                ' █████ '
            ],
            'C': [
                ' █████ ',
                '██   ██',
                '██     ',
                '██     ',
                '██     ',
                '██   ██',
                ' █████ '
            ],
            'I': [
                '███████',
                '   █   ',
                '   █   ',
                '   █   ',
                '   █   ',
                '   █   ',
                '███████'
            ],
            ' ': [
                '       ',
                '       ',
                '       ',
                '       ',
                '       ',
                '       ',
                '       '
            ]
        };
        
        // Default pattern if char not found
        const defaultPattern = patterns[char] || patterns[' '];
        return defaultPattern[line] || '       ';
    }
    
    function displayASCII(asciiLines, font, density) {
        const colorScheme = colorSchemes.find(c => c.id === state.currentColor);
        
        // Create ASCII art element
        const asciiElement = document.createElement('pre');
        asciiElement.className = `ascii-art color-scheme-${state.currentColor}`;
        asciiElement.style.color = colorScheme.color;
        asciiElement.textContent = asciiLines.join('\n');
        
        // Update output display
        asciiOutput.innerHTML = '';
        asciiOutput.appendChild(asciiElement);
        
        // Update stats
        const totalChars = asciiLines.join('').length;
        const nonSpaceChars = asciiLines.join('').replace(/\s/g, '').length;
        const densityPercent = Math.round((nonSpaceChars / totalChars) * 100);
        
        charOutput.textContent = totalChars;
        lineOutput.textContent = asciiLines.length;
        densityOutput.textContent = `${densityPercent}%`;
        
        // Store last generated
        state.lastGenerated = {
            text: textInput.value.trim() || 'ASCII',
            ascii: asciiLines.join('\n'),
            font: font.name,
            color: colorScheme.name,
            density: density
        };
        
        // Update export preview
        exportPreview.innerHTML = `<pre>${asciiLines.slice(0, 3).join('\n')}\n...</pre>`;
    }
    
    function addToHistory(text, asciiLines) {
        if (!text || text.trim() === '') return;
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const shortText = text.length > 20 ? text.substring(0, 20) + '...' : text;
        const shortAscii = asciiLines[3] ? asciiLines[3].substring(0, 30) + '...' : '';
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        historyItem.innerHTML = `
            <div class="history-text">${shortText}</div>
            <div class="history-meta">
                <span>${timestamp}</span>
                <span>${asciiLines.length} lines</span>
            </div>
        `;
        
        historyItem.addEventListener('click', function() {
            // Load this ASCII art
            textInput.value = text;
            updateCharCount();
            generateASCII();
            playSound(clickSound);
        });
        
        // Remove empty state if present
        const emptyState = historyList.querySelector('.history-empty');
        if (emptyState) {
            emptyState.remove();
        }
        
        // Add to top of list
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // Limit history to 10 items
        if (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
        
        // Update count
        state.asciiHistory.push({ text, time: timestamp });
        logCount.textContent = state.asciiHistory.length;
        
        saveState();
    }
    
    function randomizeSettings() {
        playSound(clickSound);
        
        // Random font
        const randomFont = asciiFonts[Math.floor(Math.random() * asciiFonts.length)];
        state.currentFont = randomFont.id;
        
        // Random color (1-6)
        state.currentColor = Math.floor(Math.random() * 6) + 1;
        
        // Random density (1-10)
        state.currentDensity = Math.floor(Math.random() * 10) + 1;
        densitySlider.value = state.currentDensity;
        
        // Random text from a small dictionary
        const words = ['CYBER', 'MATRIX', 'TERMINAL', 'ASCII', 'NEON', 'PULSE', 'SYSTEM', 'DATA', 'CODE', 'BINARY'];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        textInput.value = randomWord;
        
        // Update UI
        updateCharCount();
        updateDensityValue();
        renderFontOptions();
        renderColorOptions();
        
        // Generate with new settings
        generateASCII();
    }
    
    function clearAll() {
        if (confirm('Clear all input and history?')) {
            playSound(clickSound);
            
            textInput.value = '';
            updateCharCount();
            
            state.asciiHistory = [];
            historyList.innerHTML = `
                <div class="history-empty">
                    <div class="empty-icon">∅</div>
                    <div class="empty-text">NO CONVERSIONS YET</div>
                    <div class="empty-subtext">Generate ASCII to populate log</div>
                </div>
            `;
            
            logCount.textContent = '0';
            
            // Reset to default settings
            state.currentFont = 'block';
            state.currentColor = 1;
            state.currentDensity = 5;
            densitySlider.value = 5;
            
            updateDensityValue();
            renderFontOptions();
            renderColorOptions();
            
            // Show placeholder
            asciiOutput.innerHTML = `
                <div class="ascii-placeholder">
                    <div class="placeholder-grid">
                        <pre class="ascii-preview">
   _____   _____   _____   _____ 
  / ____| / ____| / ____| / ____|
 | (___  | (___  | (___  | (___  
  \___ \  \___ \  \___ \  \___ \ 
  ____) | ____) | ____) | ____) |
 |_____/ |_____/ |_____/ |_____/ 
                                 
 ██████╗ ██████╗ ██████╗ ██████╗ 
██╔════╝██╔═══██╗██╔══██╗██╔══██╗
██║     ██║   ██║██████╔╝██████╔╝
██║     ██║   ██║██╔══██╗██╔══██╗
╚██████╗╚██████╔╝██║  ██║██║  ██║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
                        </pre>
                    </div>
                    <div class="placeholder-text">
                        <span class="blink-cursor">▌</span> READY FOR INPUT
                    </div>
                </div>
            `;
            
            // Reset stats
            charOutput.textContent = '0';
            lineOutput.textContent = '0';
            densityOutput.textContent = '0%';
            
            saveState();
        }
    }
    
    function copyASCII() {
        if (!state.lastGenerated) return;
        
        navigator.clipboard.writeText(state.lastGenerated.ascii)
            .then(() => {
                // Visual feedback
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.style.color = '#00ff9d';
                
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    copyBtn.style.color = '';
                }, 2000);
                
                playSound(clickSound);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy to clipboard');
            });
    }
    
    function showExportModal() {
        if (!state.lastGenerated) {
            alert('Generate some ASCII art first!');
            return;
        }
        
        exportModal.style.display = 'flex';
        playSound(clickSound);
    }
    
    function handleExport(format) {
        if (!state.lastGenerated) return;
        
        playSound(clickSound);
        
        switch(format) {
            case 'txt':
                downloadTextFile(state.lastGenerated.ascii, 'ascii-art.txt');
                break;
            case 'html':
                const html = `<pre style="font-family: 'Source Code Pro', monospace; color: ${colorSchemes.find(c => c.id === state.currentColor).color}">${state.lastGenerated.ascii}</pre>`;
                navigator.clipboard.writeText(html)
                    .then(() => {
                        alert('HTML copied to clipboard!');
                    });
                break;
        }
        
        exportModal.style.display = 'none';
    }
    
    function downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            asciiOutput.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
        playSound(clickSound);
    }
    
    function playSound(audio) {
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    }
    
    function saveState() {
        localStorage.setItem('asciiTerminalState', JSON.stringify({
            currentFont: state.currentFont,
            currentColor: state.currentColor,
            currentDensity: state.currentDensity,
            asciiHistory: state.asciiHistory.slice(-10) // Keep last 10
        }));
    }
    
    function loadState() {
        const saved = localStorage.getItem('asciiTerminalState');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                state.currentFont = data.currentFont || 'block';
                state.currentColor = data.currentColor || 1;
                state.currentDensity = data.currentDensity || 5;
                state.asciiHistory = data.asciiHistory || [];
                
                // Update UI
                densitySlider.value = state.currentDensity;
                updateDensityValue();
                
                // Restore history
                if (state.asciiHistory.length > 0) {
                    logCount.textContent = state.asciiHistory.length;
                }
                
            } catch (e) {
                console.error('Error loading state:', e);
            }
        }
    }
});