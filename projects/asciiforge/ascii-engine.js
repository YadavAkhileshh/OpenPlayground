// ASCII Engine - Core ASCII generation algorithms

// Character sets for different styles
const CHAR_SETS = {
    detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
    balanced: '@%#*+=-:. ',
    blocks: '█▓▒░ ',
    minimal: '@# ',
    custom: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '
};

/**
 * Get current character set based on user selection
 * @param {string} charsetName - Name of character set
 * @param {string} customChars - Custom characters if charset is 'custom'
 * @returns {string} Character set string
 */
function getCurrentCharset(charsetName = 'detailed', customChars = '') {
    if (charsetName === 'custom' && customChars) {
        return customChars || CHAR_SETS.custom;
    }
    return CHAR_SETS[charsetName] || CHAR_SETS.detailed;
}

/**
 * Generate ASCII art from text input
 * @param {string} text - Text to convert
 * @param {number} width - Desired width of ASCII output
 * @param {string} charset - Character set to use
 * @returns {string} ASCII art
 */
function generateTextAsciiArt(text, width = 100, charset = CHAR_SETS.detailed) {
    if (!text.trim()) return '';
    
    let asciiArt = '';
    const borderChar = '═';
    
    // Create top border
    asciiArt += '╔' + borderChar.repeat(width - 2) + '╗\n';
    
    // Create ASCII text with proper formatting
    const lines = splitTextIntoLines(text, width - 4);
    
    for (let line of lines) {
        // Center the line
        const padding = Math.max(0, Math.floor((width - 2 - line.length) / 2));
        asciiArt += '║' + ' '.repeat(padding) + line + ' '.repeat(width - 2 - line.length - padding) + '║\n';
    }
    
    // Create bottom border
    asciiArt += '╚' + borderChar.repeat(width - 2) + '╝';
    
    return asciiArt;
}

/**
 * Convert image data to ASCII using luminance mapping
 * @param {Uint8ClampedArray} data - Image pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} charset - Character set to use
 * @param {boolean} invert - Whether to invert colors
 * @returns {string} ASCII art
 */
function convertToAscii(data, width, height, charset, invert = false) {
    let asciiArt = '';
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Calculate brightness using luminance formula (matches human perception)
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Normalize brightness (0-1)
            const normalizedBrightness = brightness / 255;
            
            // Invert if option is enabled
            const finalBrightness = invert ? 1 - normalizedBrightness : normalizedBrightness;
            
            // Map brightness to character
            const charIndex = Math.floor(finalBrightness * (charset.length - 1));
            asciiArt += charset[charIndex] || ' ';
        }
        asciiArt += '\n';
    }
    
    return asciiArt;
}

/**
 * Apply contrast and brightness adjustments to image data
 * @param {Uint8ClampedArray} data - Image pixel data
 * @param {number} contrast - Contrast multiplier (0.1-3.0)
 * @param {number} brightness - Brightness multiplier (0.1-3.0)
 */
function applyContrastBrightness(data, contrast, brightness) {
    for (let i = 0; i < data.length; i += 4) {
        // Apply contrast
        let r = ((data[i] / 255 - 0.5) * contrast + 0.5) * 255;
        let g = ((data[i + 1] / 255 - 0.5) * contrast + 0.5) * 255;
        let b = ((data[i + 2] / 255 - 0.5) * contrast + 0.5) * 255;
        
        // Apply brightness
        r *= brightness;
        g *= brightness;
        b *= brightness;
        
        // Clamp values to 0-255 range
        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
    }
}

/**
 * Apply Floyd-Steinberg dithering for better grayscale representation
 * @param {Uint8ClampedArray} data - Image pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {boolean} invert - Whether to invert colors
 */
function applyFloydSteinbergDithering(data, width, height, invert = false) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Get old pixel value (convert to grayscale)
            const oldR = data[idx];
            const oldG = data[idx + 1];
            const oldB = data[idx + 2];
            const oldGray = 0.299 * oldR + 0.587 * oldG + 0.114 * oldB;
            
            // Find closest grayscale value (0 or 255 for dithering effect)
            const newGray = oldGray > 128 ? 255 : 0;
            
            // Calculate quantization error
            const error = oldGray - newGray;
            
            // Set new pixel value
            const grayValue = invert ? 255 - newGray : newGray;
            data[idx] = grayValue;
            data[idx + 1] = grayValue;
            data[idx + 2] = grayValue;
            
            // Distribute error to neighboring pixels (Floyd-Steinberg algorithm)
            if (x + 1 < width) {
                const rightIdx = idx + 4;
                data[rightIdx] += error * 7/16;
            }
            if (y + 1 < height) {
                if (x > 0) {
                    const downLeftIdx = idx + width * 4 - 4;
                    data[downLeftIdx] += error * 3/16;
                }
                
                const downIdx = idx + width * 4;
                data[downIdx] += error * 5/16;
                
                if (x + 1 < width) {
                    const downRightIdx = idx + width * 4 + 4;
                    data[downRightIdx] += error * 1/16;
                }
            }
        }
    }
}

/**
 * Apply Sobel edge detection to highlight image contours
 * @param {ImageData} imageData - Image data object
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function applyEdgeDetection(imageData, ctx) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    // Create a copy of the original data
    const originalData = new Uint8ClampedArray(data);
    
    // Sobel kernels for edge detection
    const kernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    
    const kernelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0, gy = 0;
            
            // Apply Sobel operator to 3x3 neighborhood
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const gray = 0.299 * originalData[idx] + 0.587 * originalData[idx + 1] + 0.114 * originalData[idx + 2];
                    
                    gx += gray * kernelX[ky + 1][kx + 1];
                    gy += gray * kernelY[ky + 1][kx + 1];
                }
            }
            
            // Calculate gradient magnitude
            const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
            
            // Set edge pixel (black edges on white background)
            const idx = (y * width + x) * 4;
            const edgeValue = magnitude > 50 ? 0 : 255;
            
            data[idx] = edgeValue;
            data[idx + 1] = edgeValue;
            data[idx + 2] = edgeValue;
        }
    }
    
    // Put the modified data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

// Export ASCII engine functions
window.asciiEngine = {
    CHAR_SETS,
    getCurrentCharset,
    generateTextAsciiArt,
    convertToAscii,
    applyContrastBrightness,
    applyFloydSteinbergDithering,
    applyEdgeDetection
};