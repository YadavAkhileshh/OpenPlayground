/**
 * PixelSort - Main Application Controller
 * Manages UI interactions and coordinates between modules
 */

// Initialize modules
const imageProcessor = new ImageProcessor();
const pixelSorter = new PixelSorter(imageProcessor);

// DOM Elements
const uploadSection = document.getElementById('uploadSection');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const canvasSection = document.getElementById('canvasSection');
const mainCanvas = document.getElementById('mainCanvas');
const controlPanel = document.getElementById('controlPanel');
const processingOverlay = document.getElementById('processingOverlay');

// Control Elements
const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdValue = document.getElementById('thresholdValue');
const intensitySlider = document.getElementById('intensitySlider');
const intensityValue = document.getElementById('intensityValue');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');

const reverseCheck = document.getElementById('reverseCheck');
const randomCheck = document.getElementById('randomCheck');
const edgeDetectCheck = document.getElementById('edgeDetectCheck');

const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const newImageBtn = document.getElementById('newImageBtn');

const imageInfo = document.getElementById('imageInfo');
const processingTime = document.getElementById('processingTime');

// Mode and direction toggles
const modeToggles = document.querySelectorAll('[data-mode]');
const directionToggles = document.querySelectorAll('[data-direction]');
const orderToggles = document.querySelectorAll('[data-order]');

// Application State
let currentImageInfo = null;
let isProcessing = false;

/**
 * Initialize the application
 */
function init() {
    imageProcessor.initialize(mainCanvas);
    setupEventListeners();
    updateUI();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Upload area events
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Slider events
    thresholdSlider.addEventListener('input', handleThresholdChange);
    intensitySlider.addEventListener('input', handleIntensityChange);
    lengthSlider.addEventListener('input', handleLengthChange);

    // Checkbox events
    reverseCheck.addEventListener('change', handleReverseChange);
    randomCheck.addEventListener('change', handleRandomChange);
    edgeDetectCheck.addEventListener('change', handleEdgeDetectChange);

    // Button events
    applyBtn.addEventListener('click', handleApplySort);
    resetBtn.addEventListener('click', handleReset);
    exportBtn.addEventListener('click', handleExport);
    newImageBtn.addEventListener('click', handleNewImage);

    // Toggle button events
    modeToggles.forEach(btn => {
        btn.addEventListener('click', () => handleModeToggle(btn));
    });

    directionToggles.forEach(btn => {
        btn.addEventListener('click', () => handleDirectionToggle(btn));
    });

    orderToggles.forEach(btn => {
        btn.addEventListener('click', () => handleOrderToggle(btn));
    });
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        loadImage(file);
    }
}

/**
 * Handle drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('drag-over');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');
}

/**
 * Handle drop event
 */
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
        loadImage(file);
    }
}

/**
 * Load an image file
 */
async function loadImage(file) {
    showProcessing(true);

    try {
        const info = await imageProcessor.loadImage(file);
        currentImageInfo = info;

        // Update UI
        uploadSection.style.display = 'none';
        canvasSection.style.display = 'block';
        controlPanel.style.display = 'block';

        // Enable buttons
        resetBtn.disabled = false;
        exportBtn.disabled = false;

        // Update info
        updateImageInfo();

        // Add animation
        canvasSection.classList.add('fade-in');
        controlPanel.classList.add('slide-in');

    } catch (error) {
        console.error('Error loading image:', error);
        alert(error.message);
    } finally {
        showProcessing(false);
    }
}

/**
 * Handle threshold slider change
 */
function handleThresholdChange(event) {
    const value = parseInt(event.target.value);
    thresholdValue.textContent = value;
    pixelSorter.updateParameters({ threshold: value });
    updateSliderTrack(thresholdSlider);
}

/**
 * Handle intensity slider change
 */
function handleIntensityChange(event) {
    const value = parseInt(event.target.value);
    intensityValue.textContent = value;
    pixelSorter.updateParameters({ intensity: value });
    updateSliderTrack(intensitySlider);
}

/**
 * Handle length slider change
 */
function handleLengthChange(event) {
    const value = parseInt(event.target.value);
    lengthValue.textContent = value;
    pixelSorter.updateParameters({ sortLength: value });
    updateSliderTrack(lengthSlider);
}

/**
 * Handle reverse checkbox change
 */
function handleReverseChange(event) {
    pixelSorter.updateParameters({ reverseSort: event.target.checked });
}

/**
 * Handle random checkbox change
 */
function handleRandomChange(event) {
    pixelSorter.updateParameters({ randomIntervals: event.target.checked });
}

/**
 * Handle edge detect checkbox change
 */
function handleEdgeDetectChange(event) {
    pixelSorter.updateParameters({ edgeDetect: event.target.checked });
}

/**
 * Handle mode toggle
 */
function handleModeToggle(button) {
    const mode = button.dataset.mode;

    // Update active state
    modeToggles.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update sorter
    pixelSorter.updateParameters({ sortMode: mode });
}

/**
 * Handle direction toggle
 */
function handleDirectionToggle(button) {
    const direction = button.dataset.direction;

    // Update active state
    directionToggles.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update sorter
    pixelSorter.updateParameters({ direction: direction });
}

/**
 * Handle order toggle
 */
function handleOrderToggle(button) {
    const order = button.dataset.order;

    // Update active state
    orderToggles.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update sorter
    pixelSorter.updateParameters({ sortOrder: order });
}

/**
 * Handle apply sort button
 */
async function handleApplySort() {
    if (isProcessing || !imageProcessor.isLoaded()) return;

    isProcessing = true;
    showProcessing(true);
    applyBtn.classList.add('loading');

    // Use setTimeout to allow UI to update
    setTimeout(() => {
        const startTime = performance.now();

        try {
            // Perform the sort
            const sortedImageData = pixelSorter.sort();
            imageProcessor.setImageData(sortedImageData);

            // Calculate processing time
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            processingTime.textContent = `${duration}ms`;

            // Show success state
            applyBtn.classList.remove('loading');
            applyBtn.classList.add('success');

            setTimeout(() => {
                applyBtn.classList.remove('success');
            }, 1000);

        } catch (error) {
            console.error('Error sorting pixels:', error);
            applyBtn.classList.remove('loading');
            applyBtn.classList.add('error');

            setTimeout(() => {
                applyBtn.classList.remove('error');
            }, 1000);
        } finally {
            isProcessing = false;
            showProcessing(false);
        }
    }, 50);
}

/**
 * Handle reset button
 */
function handleReset() {
    if (isProcessing) return;

    imageProcessor.reset();
    processingTime.textContent = '0ms';
}

/**
 * Handle export button
 */
function handleExport() {
    if (!imageProcessor.isLoaded()) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `pixelsort-${timestamp}.png`;

    imageProcessor.downloadImage(filename);

    // Show success feedback
    exportBtn.classList.add('success');
    setTimeout(() => {
        exportBtn.classList.remove('success');
    }, 1000);
}

/**
 * Handle new image button
 */
function handleNewImage() {
    // Reset everything
    imageProcessor.clear();
    currentImageInfo = null;

    // Reset UI
    uploadSection.style.display = 'flex';
    canvasSection.style.display = 'none';
    controlPanel.style.display = 'none';

    // Disable buttons
    resetBtn.disabled = true;
    exportBtn.disabled = true;

    // Reset file input
    fileInput.value = '';

    // Reset info
    imageInfo.textContent = 'No image loaded';
    processingTime.textContent = '0ms';
}

/**
 * Show/hide processing overlay
 */
function showProcessing(show) {
    if (show) {
        processingOverlay.classList.add('active');
    } else {
        processingOverlay.classList.remove('active');
    }
}

/**
 * Update slider track fill
 */
function updateSliderTrack(slider) {
    const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    const track = slider.parentElement.querySelector('.slider-track');
    if (track) {
        track.style.width = `${percent}%`;
    }
}

/**
 * Update image info display
 */
function updateImageInfo() {
    if (currentImageInfo) {
        const sizeKB = Math.round(currentImageInfo.size / 1024);
        imageInfo.textContent = `${currentImageInfo.name} (${currentImageInfo.width}×${currentImageInfo.height}, ${sizeKB}KB)`;
    }
}

/**
 * Update UI state
 */
function updateUI() {
    // Initialize slider tracks
    updateSliderTrack(thresholdSlider);
    updateSliderTrack(intensitySlider);
    updateSliderTrack(lengthSlider);
}

/**
 * Debounce function for performance
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
 * Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Prevent accidental page unload when image is loaded
window.addEventListener('beforeunload', (event) => {
    if (imageProcessor.isLoaded()) {
        event.preventDefault();
        event.returnValue = '';
    }
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    if (imageProcessor.isLoaded()) {
        // Could add responsive canvas resizing here if needed
    }
}, 250));

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + S to export
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (imageProcessor.isLoaded()) {
            handleExport();
        }
    }

    // Ctrl/Cmd + Z to reset
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        if (imageProcessor.isLoaded()) {
            handleReset();
        }
    }

    // Space to apply sort
    if (event.code === 'Space' && !event.target.matches('input, button')) {
        event.preventDefault();
        if (imageProcessor.isLoaded() && !isProcessing) {
            handleApplySort();
        }
    }

    // Escape to load new image
    if (event.key === 'Escape') {
        if (imageProcessor.isLoaded()) {
            const confirm = window.confirm('Load a new image? Current progress will be lost.');
            if (confirm) {
                handleNewImage();
            }
        }
    }
});

// Add visual feedback for keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !event.target.matches('input, button')) {
        applyBtn.style.transform = 'scale(0.98)';
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && !event.target.matches('input, button')) {
        applyBtn.style.transform = '';
    }
});

// Performance monitoring
let frameCount = 0;
let lastTime = performance.now();

function monitorPerformance() {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;

        // Could display FPS if needed
        // console.log('FPS:', fps);
    }

    requestAnimationFrame(monitorPerformance);
}

// Start performance monitoring
requestAnimationFrame(monitorPerformance);

// Export for debugging
window.pixelSortApp = {
    imageProcessor,
    pixelSorter,
    handleApplySort,
    handleReset,
    handleExport
};
