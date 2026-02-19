/**
 * ASCII Art Converter - Main JavaScript
 * Handles image processing, webcam integration, and ASCII art generation
 */

// Character sets for ASCII art conversion
const CHAR_SETS = {
    standard: '@%#*+=-:. ',
    detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:, "^`\'. ',
    simple: '#@%+=- ',
    blocks: '█▓▒░ ',
    binary: '10 '
};

// DOM Elements
const elements = {
    imageInput: document.getElementById('imageInput'),
    webcamBtn: document.getElementById('webcamBtn'),
    resolution: document.getElementById('resolution'),
    resolutionValue: document.getElementById('resolutionValue'),
    contrast: document.getElementById('contrast'),
    contrastValue: document.getElementById('contrastValue'),
    charSet: document.getElementById('charSet'),
    invertBtn: document.getElementById('invertBtn'),
    exportBtn: document.getElementById('exportBtn'),
    copyBtn: document.getElementById('copyBtn'),
    previewCanvas: document.getElementById('previewCanvas'),
    asciiOutput: document.getElementById('asciiOutput'),
    statusText: document.getElementById('statusText'),
    webcam: document.getElementById('webcam')
};

// State
let state = {
    currentImage: null,
    webcamStream: null,
    isWebcamActive: false,
    isInverted: false,
    animationFrameId: null
};

// Initialize
function init() {
    setupEventListeners();
    updateStatus('Ready - Upload an image or enable webcam');
}

function setupEventListeners() {
    // Image upload
    elements.imageInput.addEventListener('change', handleImageUpload);
    
    // Webcam toggle
    elements.webcamBtn.addEventListener('click', toggleWebcam);
    
    // Resolution control
    elements.resolution.addEventListener('input', (e) => {
        elements.resolutionValue.textContent = e.target.value;
        if (state.currentImage || state.isWebcamActive) {
            processImage();
        }
    });
    
    // Contrast control
    elements.contrast.addEventListener('input', (e) => {
        elements.contrastValue.textContent = parseFloat(e.target.value).toFixed(1);
        if (state.currentImage || state.isWebcamActive) {
            processImage();
        }
    });
    
    // Character set change
    elements.charSet.addEventListener('change', () => {
        if (state.currentImage || state.isWebcamActive) {
            processImage();
        }
    });
    
    // Invert colors
    elements.invertBtn.addEventListener('click', () => {
        state.isInverted = !state.isInverted;
        elements.invertBtn.style.background = state.isInverted ? 'var(--accent-green)' : '';
        elements.invertBtn.style.color = state.isInverted ? 'var(--bg-primary)' : '';
        if (state.currentImage || state.isWebcamActive) {
            processImage();
        }
    });
    
    // Export ASCII art
    elements.exportBtn.addEventListener('click', exportAsciiArt);
    
    // Copy to clipboard
    elements.copyBtn.addEventListener('click', copyToClipboard);
}

function updateStatus(message) {
    elements.statusText.innerHTML = `<i class="ri-information-line"></i> ${message}`;
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Stop webcam if active
    if (state.isWebcamActive) {
        stopWebcam();
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            state.currentImage = img;
            processImage();
            updateStatus('Image loaded - Processing ASCII art...');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Toggle webcam
async function toggleWebcam() {
    if (state.isWebcamActive) {
        stopWebcam();
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            elements.webcam.srcObject = stream;
            state.webcamStream = stream;
            state.isWebcamActive = true;
            elements.webcamBtn.innerHTML = '<i class="ri-camera-off-line"></i> Stop Webcam';
            elements.webcamBtn.style.background = 'var(--accent-green)';
            elements.webcamBtn.style.color = 'var(--bg-primary)';
            updateStatus('Webcam active - Real-time ASCII conversion');
            
            // Start processing frames
            elements.webcam.onloadedmetadata = () => {
                processWebcamFrame();
            };
        } catch (err) {
            updateStatus('Error: Could not access webcam');
            console.error('Webcam error:', err);
        }
    }
}

function stopWebcam() {
    if (state.webcamStream) {
        state.webcamStream.getTracks().forEach(track => track.stop());
        state.webcamStream = null;
    }
    state.isWebcamActive = false;
    elements.webcamBtn.innerHTML = '<i class="ri-camera-line"></i> Toggle Webcam';
    elements.webcamBtn.style.background = '';
    elements.webcamBtn.style.color = '';
    
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
    }
    
    updateStatus('Webcam stopped');
}

function processWebcamFrame() {
    if (!state.isWebcamActive) return;
    
    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext('2d');
    
    canvas.width = elements.webcam.videoWidth;
    canvas.height = elements.webcam.videoHeight;
    
    ctx.drawImage(elements.webcam, 0, 0);
    
    // Create an image from canvas for processing
    const img = new Image();
    img.onload = () => {
        state.currentImage = img;
        processImage();
    };
    img.src = canvas.toDataURL();
    
    state.animationFrameId = requestAnimationFrame(processWebcamFrame);
}

// Process image and convert to ASCII
function processImage() {
    if (!state.currentImage) return;
    
    const resolution = parseInt(elements.resolution.value);
    const contrast = parseFloat(elements.contrast.value);
    const charSetKey = elements.charSet.value;
    const charSet = CHAR_SETS[charSetKey];
    
    // Calculate dimensions
    const aspectRatio = state.currentImage.height / state.currentImage.width;
    const width = resolution;
    const height = Math.floor(resolution * aspectRatio * 0.5); // 0.5 for character aspect ratio
    
    // Create canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Draw image scaled
    ctx.drawImage(state.currentImage, 0, 0, width, height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    // Apply contrast and convert to ASCII
    let asciiArt = '';
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            
            // Convert to grayscale
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Apply contrast
            gray = ((gray - 128) * contrast) + 128;
            gray = Math.max(0, Math.min(255, gray));
            
            // Invert if needed
            if (state.isInverted) {
                gray = 255 - gray;
            }
            
            // Map to character
            const charIndex = Math.floor((gray / 255) * (charSet.length - 1));
            const char = charSet[charIndex];
            
            asciiArt += char;
        }
        asciiArt += '\n';
    }
    
    // Update output
    elements.asciiOutput.textContent = asciiArt;
    elements.previewCanvas.width = width;
    elements.previewCanvas.height = height;
    const previewCtx = elements.previewCanvas.getContext('2d');
    previewCtx.drawImage(state.currentImage, 0, 0, width, height);
    
    updateStatus(`ASCII art generated - ${width}x${height} characters`);
}

// Export ASCII art as text file
function exportAsciiArt() {
    const asciiArt = elements.asciiOutput.textContent;
    if (!asciiArt || asciiArt.includes('Upload an image')) {
        updateStatus('No ASCII art to export');
        return;
    }
    
    const blob = new Blob([asciiArt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateStatus('ASCII art exported successfully');
}

// Copy to clipboard
async function copyToClipboard() {
    const asciiArt = elements.asciiOutput.textContent;
    if (!asciiArt || asciiArt.includes('Upload an image')) {
        updateStatus('No ASCII art to copy');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(asciiArt);
        updateStatus('Copied to clipboard!');
    } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = asciiArt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        updateStatus('Copied to clipboard!');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
