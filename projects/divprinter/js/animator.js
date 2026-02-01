/**
 * ================================================
 * Animator.js - Animation System
 * ================================================
 * 
 * Handles various animation modes for rendering pixels:
 * - Build In: Pixels appear sequentially
 * - Dissolve: Pixels fade in randomly
 * - Wave: Pixels appear in wave patterns
 * - Spiral: Pixels appear in spiral pattern
 * 
 * Provides smooth, elegant transitions for the div-based
 * rendering system.
 */

class Animator {
    constructor(renderer) {
        this.renderer = renderer;
        this.isAnimating = false;
        this.animationSpeed = 50; // 1-100 scale
        this.currentAnimation = null;
    }

    /**
     * Set animation speed
     * @param {number} speed - Speed value (10-100)
     */
    setSpeed(speed) {
        this.animationSpeed = Math.max(10, Math.min(100, speed));
    }

    /**
     * Animate pixel rendering based on mode
     * @param {Array} pixels - Array of pixel div elements
     * @param {string} mode - Animation mode
     * @returns {Promise} Resolves when animation completes
     */
    async animate(pixels, mode = 'instant') {
        // Cancel any ongoing animation
        this.cancelAnimation();

        if (pixels.length === 0) {
            return;
        }

        // Set all pixels initially invisible
        for (let i = 0; i < pixels.length; i++) {
            pixels[i].style.opacity = '0';
            pixels[i].style.transform = 'scale(0)';
        }

        this.isAnimating = true;

        switch (mode) {
            case 'instant':
                this.animateInstant(pixels);
                break;
            case 'buildIn':
                await this.animateBuildIn(pixels);
                break;
            case 'dissolve':
                await this.animateDissolve(pixels);
                break;
            case 'wave':
                await this.animateWave(pixels);
                break;
            case 'spiral':
                await this.animateSpiral(pixels);
                break;
            default:
                this.animateInstant(pixels);
        }

        this.isAnimating = false;
    }

    /**
     * Instant animation - show all pixels immediately
     * @param {Array} pixels - Pixel elements
     */
    animateInstant(pixels) {
        for (let i = 0; i < pixels.length; i++) {
            pixels[i].style.opacity = '1';
            pixels[i].style.transform = 'scale(1)';
        }
    }

    /**
     * Build In animation - pixels appear sequentially
     * @param {Array} pixels - Pixel elements
     * @returns {Promise} Animation promise
     */
    async animateBuildIn(pixels) {
        const totalPixels = pixels.length;
        const baseDelay = this.calculateBaseDelay(totalPixels);
        
        return new Promise((resolve) => {
            for (let i = 0; i < totalPixels; i++) {
                if (!this.isAnimating) {
                    resolve();
                    return;
                }

                const delay = i * baseDelay;
                
                setTimeout(() => {
                    if (pixels[i]) {
                        pixels[i].style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        pixels[i].style.opacity = '1';
                        pixels[i].style.transform = 'scale(1)';
                    }
                    
                    if (i === totalPixels - 1) {
                        setTimeout(resolve, 300);
                    }
                }, delay);
            }
        });
    }

    /**
     * Dissolve animation - pixels appear randomly
     * @param {Array} pixels - Pixel elements
     * @returns {Promise} Animation promise
     */
    async animateDissolve(pixels) {
        const totalPixels = pixels.length;
        const baseDelay = this.calculateBaseDelay(totalPixels);
        
        // Create shuffled indices
        const indices = this.shuffleArray([...Array(totalPixels).keys()]);
        
        return new Promise((resolve) => {
            for (let i = 0; i < totalPixels; i++) {
                if (!this.isAnimating) {
                    resolve();
                    return;
                }

                const delay = i * baseDelay;
                const pixelIndex = indices[i];
                
                setTimeout(() => {
                    if (pixels[pixelIndex]) {
                        pixels[pixelIndex].style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        pixels[pixelIndex].style.opacity = '1';
                        pixels[pixelIndex].style.transform = 'scale(1) rotate(360deg)';
                    }
                    
                    if (i === totalPixels - 1) {
                        setTimeout(resolve, 400);
                    }
                }, delay);
            }
        });
    }

    /**
     * Wave animation - pixels appear in wave pattern
     * @param {Array} pixels - Pixel elements
     * @returns {Promise} Animation promise
     */
    async animateWave(pixels) {
        const totalPixels = pixels.length;
        
        // Group pixels by X coordinate for wave effect
        const pixelsByX = this.groupPixelsByCoordinate(pixels, 'x');
        const xPositions = Object.keys(pixelsByX).map(Number).sort((a, b) => a - b);
        
        const baseDelay = this.calculateBaseDelay(xPositions.length * 2);
        
        return new Promise((resolve) => {
            let completedGroups = 0;
            
            for (let i = 0; i < xPositions.length; i++) {
                if (!this.isAnimating) {
                    resolve();
                    return;
                }

                const xPos = xPositions[i];
                const groupPixels = pixelsByX[xPos];
                const delay = i * baseDelay;
                
                setTimeout(() => {
                    for (let j = 0; j < groupPixels.length; j++) {
                        const pixel = groupPixels[j];
                        const yDelay = j * 5;
                        
                        setTimeout(() => {
                            if (pixel) {
                                pixel.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                                pixel.style.opacity = '1';
                                pixel.style.transform = 'scale(1) translateY(0)';
                            }
                        }, yDelay);
                    }
                    
                    completedGroups++;
                    if (completedGroups === xPositions.length) {
                        setTimeout(resolve, 300);
                    }
                }, delay);
            }
        });
    }

    /**
     * Spiral animation - pixels appear in spiral pattern
     * @param {Array} pixels - Pixel elements
     * @returns {Promise} Animation promise
     */
    async animateSpiral(pixels) {
        const totalPixels = pixels.length;
        
        // Calculate distance from center for each pixel
        const center = this.calculateCenter(pixels);
        const pixelsWithDistance = pixels.map((pixel, index) => {
            const x = parseFloat(pixel.dataset.x);
            const y = parseFloat(pixel.dataset.y);
            const dx = x - center.x;
            const dy = y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            return { pixel, index, distance, angle };
        });
        
        // Sort by spiral order (combination of distance and angle)
        pixelsWithDistance.sort((a, b) => {
            const spiralA = a.distance * 0.1 + a.angle;
            const spiralB = b.distance * 0.1 + b.angle;
            return spiralA - spiralB;
        });
        
        const baseDelay = this.calculateBaseDelay(totalPixels);
        
        return new Promise((resolve) => {
            for (let i = 0; i < totalPixels; i++) {
                if (!this.isAnimating) {
                    resolve();
                    return;
                }

                const delay = i * baseDelay;
                const { pixel } = pixelsWithDistance[i];
                
                setTimeout(() => {
                    if (pixel) {
                        pixel.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                        pixel.style.opacity = '1';
                        pixel.style.transform = 'scale(1) rotate(720deg)';
                    }
                    
                    if (i === totalPixels - 1) {
                        setTimeout(resolve, 350);
                    }
                }, delay);
            }
        });
    }

    /**
     * Calculate base delay between pixel animations
     * @param {number} totalPixels - Total number of pixels
     * @returns {number} Base delay in milliseconds
     */
    calculateBaseDelay(totalPixels) {
        // Speed mapping: 10 = slow (20ms), 100 = fast (0.5ms)
        const maxDelay = 20;
        const minDelay = 0.5;
        
        const speedFactor = (this.animationSpeed - 10) / 90; // 0 to 1
        const baseDelay = maxDelay - (speedFactor * (maxDelay - minDelay));
        
        // Adjust for total pixels to prevent overly long animations
        const scaleFactor = Math.min(1, 2000 / totalPixels);
        
        return baseDelay * scaleFactor;
    }

    /**
     * Group pixels by coordinate
     * @param {Array} pixels - Pixel elements
     * @param {string} coord - Coordinate to group by ('x' or 'y')
     * @returns {Object} Grouped pixels
     */
    groupPixelsByCoordinate(pixels, coord) {
        const grouped = {};
        
        for (let i = 0; i < pixels.length; i++) {
            const pixel = pixels[i];
            const value = Math.round(parseFloat(pixel.dataset[coord]));
            
            if (!grouped[value]) {
                grouped[value] = [];
            }
            grouped[value].push(pixel);
        }
        
        return grouped;
    }

    /**
     * Calculate center point of all pixels
     * @param {Array} pixels - Pixel elements
     * @returns {Object} Center point {x, y}
     */
    calculateCenter(pixels) {
        if (pixels.length === 0) {
            return { x: 0, y: 0 };
        }

        let sumX = 0;
        let sumY = 0;
        
        for (let i = 0; i < pixels.length; i++) {
            sumX += parseFloat(pixels[i].dataset.x);
            sumY += parseFloat(pixels[i].dataset.y);
        }
        
        return {
            x: sumX / pixels.length,
            y: sumY / pixels.length
        };
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    }

    /**
     * Cancel current animation
     */
    cancelAnimation() {
        this.isAnimating = false;
        
        if (this.currentAnimation) {
            this.currentAnimation = null;
        }
    }

    /**
     * Fade out animation for clearing
     * @param {Array} pixels - Pixel elements
     * @returns {Promise} Animation promise
     */
    async fadeOut(pixels) {
        if (pixels.length === 0) {
            return;
        }

        const baseDelay = this.calculateBaseDelay(pixels.length) * 0.5;
        
        return new Promise((resolve) => {
            for (let i = 0; i < pixels.length; i++) {
                const delay = i * baseDelay;
                
                setTimeout(() => {
                    if (pixels[i]) {
                        pixels[i].style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        pixels[i].style.opacity = '0';
                        pixels[i].style.transform = 'scale(0)';
                    }
                    
                    if (i === pixels.length - 1) {
                        setTimeout(resolve, 300);
                    }
                }, delay);
            }
        });
    }

    /**
     * Explode animation - pixels scatter randomly
     * @param {Array} pixels - Pixel elements
     * @returns {Promise} Animation promise
     */
    async explode(pixels) {
        if (pixels.length === 0) {
            return;
        }

        return new Promise((resolve) => {
            for (let i = 0; i < pixels.length; i++) {
                const pixel = pixels[i];
                const angle = Math.random() * Math.PI * 2;
                const distance = 200 + Math.random() * 300;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance;
                const rotation = Math.random() * 720 - 360;
                
                pixel.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                pixel.style.opacity = '0';
                pixel.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg) scale(0)`;
            }
            
            setTimeout(resolve, 800);
        });
    }

    /**
     * Check if animation is in progress
     * @returns {boolean} True if animating
     */
    isInProgress() {
        return this.isAnimating;
    }
}

// Make Animator available globally
window.Animator = Animator;
