// UI Controller - Main application logic and event handling

// Global app state
window.appState = {
    currentChars: 'detailed',
    charSets: {
        detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
        balanced: '@%#*+=-:. ',
        blocks: '█▓▒░ ',
        minimal: '@# ',
        custom: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '
    },
    currentImage: null,
    asciiOutput: '',
    isDarkMode: false,
    processingOptions: {
        dithering: true,
        invert: false,
        preserveAspect: true,
        edgeDetection: false
    }
};

/**
 * Initialize the application
 */
function initApp() {
    // Load saved theme preference
    const savedTheme = storageManager.loadThemePreference();
    if (savedTheme) {
        appState.isDarkMode = savedTheme;
        document.body.classList.toggle('dark-mode', savedTheme);
        updateThemeToggle();
    }
    
    // Set initial slider values
    updateSliderValues();
    
    // Setup event listeners
    setupEventListeners();
    
    // Generate sample ASCII on load
    setTimeout(() => {
        generateSampleAscii();
    }, 500);
    
    // Load saved settings if available
    loadSavedSettings();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Text input
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', debounce(() => {
            generateTextAscii();
        }, 300));
    }
    
    // Image upload
    const imageUpload = document.getElementById('imageUpload');
    const fileInput = document.getElementById('fileInput');
    
    if (imageUpload && fileInput) {
        imageUpload.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileInputChange);
        
        // Drag and drop
        setupDragAndDrop(imageUpload);
    }
    
    // Sliders
    setupSliderListeners();
    
    // Character set selection
    setupCharSetListeners();
    
    // Processing options
    setupProcessingOptionsListeners();
    
    // Action buttons
    setupActionButtonListeners();
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Footer links
    setupFooterLinkListeners();
}

/**
 * Setup drag and drop for image upload
 */
function setupDragAndDrop(uploadElement) {
    uploadElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadElement.style.borderColor = 'var(--primary)';
        uploadElement.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
    });
    
    uploadElement.addEventListener('dragleave', () => {
        uploadElement.style.borderColor = '';
        uploadElement.style.backgroundColor = '';
    });
    
    uploadElement.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadElement.style.borderColor = '';
        uploadElement.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length) {
            const fileInput = document.getElementById('fileInput');
            fileInput.files = e.dataTransfer.files;
            handleFileInputChange();
        }
    });
}

/**
 * Handle file input change
 */
function handleFileInputChange() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) return;
    
    const file = fileInput.files[0];
    imageProcessor.handleImageUpload(file, (dataUrl) => {
        // Update UI
        const imagePreview = document.getElementById('imagePreview');
        const originalImage = document.getElementById('originalImage');
        
        if (imagePreview) {
            imagePreview.src = dataUrl;
            imagePreview.style.display = 'block';
        }
        
        if (originalImage) {
            originalImage.src = dataUrl;
        }
        
        // Clear text input
        const textInput = document.getElementById('textInput');
        if (textInput) textInput.value = '';
        
        // Update app state
        appState.currentImage = dataUrl;
        
        // Save to recent images
        storageManager.saveRecentImage(dataUrl);
        
        // Generate ASCII from image
        generateImageAscii();
    });
}

/**
 * Setup slider event listeners
 */
function setupSliderListeners() {
    const sliders = [
        'widthSlider',
        'contrastSlider',
        'brightnessSlider',
        'fontSizeSlider'
    ];
    
    sliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
            // Update value display on input
            slider.addEventListener('input', updateSliderValues);
            
            // Regenerate on change (debounced)
            const debouncedGenerate = debounce(generateAscii, 300);
            slider.addEventListener('change', () => {
                updateSliderValues();
                debouncedGenerate();
            });
        }
    });
    
    // Font size slider doesn't need to regenerate ASCII
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('change', updateAsciiDisplay);
    }
}

/**
 * Setup character set listeners
 */
function setupCharSetListeners() {
    const charOptions = document.querySelectorAll('.char-option');
    const customChars = document.getElementById('customChars');
    
    charOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Update active state
            charOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Update app state
            const charset = option.dataset.chars;
            appState.currentChars = charset;
            
            // Show/hide custom chars input
            if (customChars) {
                customChars.style.display = charset === 'custom' ? 'block' : 'none';
                if (charset === 'custom') {
                    customChars.focus();
                }
            }
            
            // Regenerate ASCII
            generateAscii();
        });
    });
    
    // Custom chars input
    if (customChars) {
        customChars.addEventListener('input', debounce(() => {
            appState.charSets.custom = customChars.value;
            if (appState.currentChars === 'custom') {
                generateAscii();
            }
        }, 300));
    }
}

/**
 * Setup processing options listeners
 */
function setupProcessingOptionsListeners() {
    const toggles = {
        ditherToggle: 'dithering',
        invertToggle: 'invert',
        preserveToggle: 'preserveAspect',
        edgeToggle: 'edgeDetection'
    };
    
    Object.entries(toggles).forEach(([toggleId, optionKey]) => {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                appState.processingOptions[optionKey] = toggle.classList.contains('active');
                generateAscii();
            });
        }
    });
}

/**
 * Setup action button listeners
 */
function setupActionButtonListeners() {
    // Generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateAscii);
    }
    
    // Copy button
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyAsciiToClipboard);
    }
    
    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAscii);
    }
    
    // Compare button
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
        compareBtn.addEventListener('click', toggleComparisonView);
    }
    
    // Clear button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearOutput);
    }
}

/**
 * Setup footer link listeners
 */
function setupFooterLinkListeners() {
    const links = {
        githubLink: () => showNotification('GitHub repository would open here', 'info'),
        documentationLink: () => showNotification('Documentation for algorithms would open here', 'info'),
        aboutLink: () => showNotification('Uses advanced grayscale conversion, Floyd-Steinberg dithering, and edge detection', 'info')
    };
    
    Object.entries(links).forEach(([linkId, handler]) => {
        const link = document.getElementById(linkId);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                handler();
            });
        }
    });
}

/**
 * Update theme toggle button
 */
function updateThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = appState.isDarkMode ? 
            '<i class="fas fa-sun"></i>' : 
            '<i class="fas fa-moon"></i>';
    }
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    appState.isDarkMode = !appState.isDarkMode;
    document.body.classList.toggle('dark-mode', appState.isDarkMode);
    
    // Update toggle button
    updateThemeToggle();
    
    // Save preference
    storageManager.saveThemePreference(appState.isDarkMode);
    
    showNotification(`Switched to ${appState.isDarkMode ? 'dark' : 'light'} mode`, 'success');
}

/**
 * Main ASCII generation function
 */
function generateAscii() {
    if (appState.currentImage) {
        generateImageAscii();
    } else {
        generateTextAscii();
    }
}

/**
 * Generate ASCII from text input
 */
function generateTextAscii() {
    const textInput = document.getElementById('textInput');
    const widthSlider = document.getElementById('widthSlider');
    
    if (!textInput || !widthSlider) return;
    
    const text = textInput.value.trim();
    if (!text) {
        generateSampleAscii();
        return;
    }
    
    const width = parseInt(widthSlider.value);
    const charset = asciiEngine.getCurrentCharset(appState.currentChars, appState.charSets.custom);
    
    const asciiArt = asciiEngine.generateTextAsciiArt(text, width, charset);
    displayAsciiOutput(asciiArt);
    
    // Save to history
    storageManager.saveToOutputHistory(asciiArt, {
        type: 'text',
        source: text.substring(0, 50),
        width,
        height: asciiArt.split('\n').length
    });
}

/**
 * Generate ASCII from image
 */
async function generateImageAscii() {
    if (!appState.currentImage) {
        showNotification('Please upload an image first', 'warning');
        return;
    }
    
    // Show progress
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    
    if (progressContainer && progressBar) {
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
    }
    
    try {
        // Get processing options
        const width = parseInt(document.getElementById('widthSlider').value);
        const contrast = parseFloat(document.getElementById('contrastSlider').value);
        const brightness = parseFloat(document.getElementById('brightnessSlider').value);
        const charsetName = appState.currentChars;
        const customChars = document.getElementById('customChars')?.value || '';
        
        const options = {
            width,
            contrast,
            brightness,
            charsetName,
            customChars,
            preserveAspect: appState.processingOptions.preserveAspect,
            dithering: appState.processingOptions.dithering,
            invert: appState.processingOptions.invert,
            edgeDetection: appState.processingOptions.edgeDetection
        };
        
        // Process image
        const result = await imageProcessor.processImageToAscii(
            appState.currentImage,
            options,
            (progress) => {
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }
        );
        
        // Display result
        displayAsciiOutput(result.ascii, false, result.stats);
        
        // Show grayscale preview
        imageProcessor.showGrayscalePreview(result.grayscaleData);
        
        // Save to history
        storageManager.saveToOutputHistory(result.ascii, {
            type: 'image',
            ...result.stats,
            options: options
        });
        
    } catch (error) {
        console.error('Error generating ASCII:', error);
        showNotification('Error generating ASCII art', 'error');
    } finally {
        // Hide progress bar
        if (progressContainer && progressBar) {
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
            }, 500);
        }
    }
}

/**
 * Copy ASCII to clipboard
 */
function copyAsciiToClipboard() {
    if (!appState.asciiOutput) {
        showNotification('No ASCII art to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(appState.asciiOutput)
        .then(() => {
            showNotification('ASCII art copied to clipboard!', 'success');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = appState.asciiOutput;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            showNotification('ASCII art copied to clipboard!', 'success');
        });
}

/**
 * Download ASCII as text file
 */
function downloadAscii() {
    if (!appState.asciiOutput) {
        showNotification('No ASCII art to download', 'warning');
        return;
    }
    
    const blob = new Blob([appState.asciiOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `asciiforge-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('ASCII art downloaded!', 'success');
}

/**
 * Toggle comparison view
 */
function toggleComparisonView() {
    if (!appState.currentImage) {
        showNotification('Upload an image to see comparison', 'warning');
        return;
    }
    
    const comparisonContainer = document.getElementById('comparisonContainer');
    const compareBtn = document.getElementById('compareBtn');
    
    if (comparisonContainer && compareBtn) {
        const isVisible = comparisonContainer.style.display !== 'none';
        comparisonContainer.style.display = isVisible ? 'none' : 'grid';
        compareBtn.innerHTML = isVisible ? 
            '<i class="fas fa-eye btn-icon"></i> Show Preview' : 
            '<i class="fas fa-eye-slash btn-icon"></i> Hide Preview';
    }
}

/**
 * Clear output and reset
 */
function clearOutput() {
    const outputBox = document.getElementById('outputBox');
    const comparisonContainer = document.getElementById('comparisonContainer');
    const imagePreview = document.getElementById('imagePreview');
    const textInput = document.getElementById('textInput');
    const fileInput = document.getElementById('fileInput');
    
    // Reset output display
    if (outputBox) {
        outputBox.innerHTML = `
            <div class="output-placeholder">
                <i class="fas fa-code" style="font-size: 3rem; margin-bottom: 20px; display: block; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 10px;">High-Accuracy ASCII Art Generator</h3>
                <p style="max-width: 400px; margin-bottom: 20px;">
                    Upload an image or enter text, then click "Generate High-Accuracy ASCII" to create detailed ASCII art.
                </p>
                <div style="display: flex; gap: 15px; margin-top: 20px;">
                    <div style="text-align: center;">
                        <i class="fas fa-upload" style="font-size: 1.5rem; margin-bottom: 5px; display: block; color: var(--primary);"></i>
                        <span>Upload Image</span>
                    </div>
                    <div style="text-align: center;">
                        <i class="fas fa-sliders-h" style="font-size: 1.5rem; margin-bottom: 5px; display: block; color: var(--primary);"></i>
                        <span>Adjust Settings</span>
                    </div>
                    <div style="text-align: center;">
                        <i class="fas fa-code" style="font-size: 1.5rem; margin-bottom: 5px; display: block; color: var(--primary);"></i>
                        <span>Get ASCII</span>
                    </div>
                </div>
            </div>
        `;
        outputBox.classList.add('output-placeholder');
    }
    
    // Hide comparison
    if (comparisonContainer) {
        comparisonContainer.style.display = 'none';
    }
    
    // Reset inputs
    if (textInput) textInput.value = '';
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }
    if (fileInput) fileInput.value = '';
    
    // Update compare button
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
        compareBtn.innerHTML = '<i class="fas fa-eye btn-icon"></i> Toggle Preview';
    }
    
    // Reset stats
    const dimensionsStat = document.getElementById('dimensionsStat');
    const charsStat = document.getElementById('charsStat');
    const timeStat = document.getElementById('timeStat');
    
    if (dimensionsStat) dimensionsStat.innerHTML = '<i class="fas fa-expand-alt"></i><span>-</span>';
    if (charsStat) charsStat.innerHTML = '<i class="fas fa-font"></i><span>-</span>';
    if (timeStat) timeStat.innerHTML = '<i class="fas fa-clock"></i><span>-</span>';
    
    // Reset app state
    appState.currentImage = null;
    appState.asciiOutput = '';
    
    showNotification('Output cleared', 'info');
}

/**
 * Load saved settings from localStorage
 */
function loadSavedSettings() {
    const settings = storageManager.loadAppSettings();
    if (settings) {
        // Apply saved settings
        // (This would restore previous session settings)
    }
}

/**
 * Save current settings to localStorage
 */
function saveCurrentSettings() {
    const settings = {
        currentChars: appState.currentChars,
        processingOptions: appState.processingOptions,
        // Add more settings as needed
    };
    
    storageManager.saveAppSettings(settings);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);