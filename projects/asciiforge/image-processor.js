// Image Processor - Handles image loading, processing, and conversion

/**
 * Handle image file upload
 * @param {File} file - Image file
 * @param {Function} callback - Callback function with image data URL
 */
function handleImageUpload(file, callback) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
        showNotification(validation.message, 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        callback(e.target.result);
    };
    
    reader.onerror = function() {
        showNotification('Error reading image file', 'error');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Process image and generate ASCII art
 * @param {string} imageDataUrl - Image data URL
 * @param {Object} options - Processing options
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<Object>} ASCII result with stats
 */
async function processImageToAscii(imageDataUrl, options, progressCallback = null) {
    return new Promise((resolve, reject) => {
        const startTime = performance.now();
        
        if (progressCallback) progressCallback(10);
        
        const img = new Image();
        img.src = imageDataUrl;
        
        img.onload = function() {
            if (progressCallback) progressCallback(30);
            
            const {
                width: targetWidth = 100,
                contrast = 1.0,
                brightness = 1.0,
                charsetName = 'detailed',
                customChars = '',
                preserveAspect = true,
                dithering = true,
                invert = false,
                edgeDetection = false
            } = options;
            
            // Get character set
            const charset = getCurrentCharset(charsetName, customChars);
            
            // Calculate dimensions with aspect ratio preservation
            let width, height;
            if (preserveAspect) {
                const aspectRatio = img.height / img.width;
                width = Math.min(targetWidth, 200); // Limit for performance
                height = Math.floor(width * aspectRatio * 0.5); // 0.5 for character aspect ratio
            } else {
                width = Math.min(targetWidth, 200);
                height = Math.floor(width * 0.5); // Default 2:1 aspect ratio
            }
            
            // Limit dimensions for reasonable processing time
            width = Math.min(width, 200);
            height = Math.min(height, 200);
            
            if (progressCallback) progressCallback(50);
            
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, width, height);
            
            // Apply contrast and brightness
            applyContrastBrightness(imageData.data, contrast, brightness);
            
            if (progressCallback) progressCallback(70);
            
            // Apply edge detection if enabled
            if (edgeDetection) {
                applyEdgeDetection(imageData, ctx);
            }
            
            // Apply dithering if enabled
            if (dithering) {
                applyFloydSteinbergDithering(imageData.data, width, height, invert);
            }
            
            if (progressCallback) progressCallback(90);
            
            // Generate ASCII art
            const asciiArt = convertToAscii(imageData.data, width, height, charset, invert);
            
            if (progressCallback) progressCallback(100);
            
            // Calculate processing time
            const endTime = performance.now();
            const processingTime = (endTime - startTime).toFixed(0);
            
            resolve({
                ascii: asciiArt,
                stats: {
                    width,
                    height,
                    chars: asciiArt.length,
                    time: processingTime
                },
                grayscaleData: imageData
            });
        };
        
        img.onerror = function() {
            reject(new Error('Error loading image'));
        };
    });
}

/**
 * Show grayscale preview of processed image
 * @param {ImageData} imageData - Processed image data
 */
function showGrayscalePreview(imageData) {
    const grayscaleCanvas = document.getElementById('grayscaleCanvas');
    if (!grayscaleCanvas) return;
    
    const ctx = grayscaleCanvas.getContext('2d');
    grayscaleCanvas.width = imageData.width;
    grayscaleCanvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Calculate image dimensions for ASCII conversion
 * @param {HTMLImageElement} img - Image element
 * @param {number} targetWidth - Target width in characters
 * @param {boolean} preserveAspect - Whether to preserve aspect ratio
 * @returns {Object} Calculated width and height
 */
function calculateAsciiDimensions(img, targetWidth, preserveAspect) {
    if (preserveAspect) {
        const aspectRatio = img.height / img.width;
        const width = Math.min(targetWidth, 200);
        const height = Math.floor(width * aspectRatio * 0.5);
        return { width, height };
    } else {
        const width = Math.min(targetWidth, 200);
        const height = Math.floor(width * 0.5);
        return { width, height };
    }
}

/**
 * Create image data URL from canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} format - Image format (default: 'image/png')
 * @param {number} quality - Image quality (0-1)
 * @returns {string} Data URL
 */
function canvasToDataUrl(canvas, format = 'image/png', quality = 0.8) {
    return canvas.toDataURL(format, quality);
}

/**
 * Create downloadable image from ASCII art
 * @param {string} ascii - ASCII art
 * @param {number} fontSize - Font size in pixels
 * @returns {string} Data URL of generated image
 */
function createAsciiImage(ascii, fontSize = 12) {
    const lines = ascii.split('\n');
    const lineHeight = fontSize * 1.2;
    
    // Create offscreen canvas to measure text
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = `${fontSize}px 'JetBrains Mono', monospace`;
    
    // Find maximum line width
    let maxWidth = 0;
    for (let line of lines) {
        const width = measureCtx.measureText(line).width;
        maxWidth = Math.max(maxWidth, width);
    }
    
    // Create final canvas
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth + 40; // Add padding
    canvas.height = lines.length * lineHeight + 40;
    
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ASCII text
    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#1e293b';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 20, 20 + i * lineHeight);
    }
    
    return canvas.toDataURL('image/png');
}

// Export image processor functions
window.imageProcessor = {
    handleImageUpload,
    processImageToAscii,
    showGrayscalePreview,
    calculateAsciiDimensions,
    canvasToDataUrl,
    createAsciiImage
};