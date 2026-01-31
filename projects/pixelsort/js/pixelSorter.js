/**
 * PixelSort - Pixel Sorter Module
 * Core pixel sorting algorithms and effects
 */

class PixelSorter {
    constructor(imageProcessor) {
        this.imageProcessor = imageProcessor;
        this.sortMode = 'brightness';
        this.direction = 'horizontal';
        this.threshold = 128;
        this.intensity = 50;
        this.sortLength = 100;
        this.sortOrder = 'ascending';
        this.reverseSort = false;
        this.randomIntervals = false;
        this.edgeDetect = false;
    }

    /**
     * Update sorting parameters
     * @param {Object} params - Parameters to update
     */
    updateParameters(params) {
        if (params.sortMode !== undefined) this.sortMode = params.sortMode;
        if (params.direction !== undefined) this.direction = params.direction;
        if (params.threshold !== undefined) this.threshold = params.threshold;
        if (params.intensity !== undefined) this.intensity = params.intensity;
        if (params.sortLength !== undefined) this.sortLength = params.sortLength;
        if (params.sortOrder !== undefined) this.sortOrder = params.sortOrder;
        if (params.reverseSort !== undefined) this.reverseSort = params.reverseSort;
        if (params.randomIntervals !== undefined) this.randomIntervals = params.randomIntervals;
        if (params.edgeDetect !== undefined) this.edgeDetect = params.edgeDetect;
    }

    /**
     * Main sort function
     * @returns {ImageData} Sorted image data
     */
    sort() {
        const imageData = this.imageProcessor.copyImageData(
            this.imageProcessor.getImageData()
        );

        if (this.direction === 'horizontal') {
            this.sortHorizontal(imageData);
        } else if (this.direction === 'vertical') {
            this.sortVertical(imageData);
        } else if (this.direction === 'diagonal') {
            this.sortDiagonal(imageData);
        }

        return imageData;
    }

    /**
     * Sort pixels horizontally (row by row)
     * @param {ImageData} imageData - Image data to sort
     */
    sortHorizontal(imageData) {
        const width = imageData.width;
        const height = imageData.height;

        for (let y = 0; y < height; y++) {
            const row = [];

            // Extract row pixels
            for (let x = 0; x < width; x++) {
                row.push(this.imageProcessor.getPixel(imageData, x, y));
            }

            // Sort row
            const sortedRow = this.sortPixelArray(row);

            // Write back sorted pixels
            for (let x = 0; x < width; x++) {
                this.imageProcessor.setPixel(imageData, x, y, sortedRow[x]);
            }
        }
    }

    /**
     * Sort pixels vertically (column by column)
     * @param {ImageData} imageData - Image data to sort
     */
    sortVertical(imageData) {
        const width = imageData.width;
        const height = imageData.height;

        for (let x = 0; x < width; x++) {
            const column = [];

            // Extract column pixels
            for (let y = 0; y < height; y++) {
                column.push(this.imageProcessor.getPixel(imageData, x, y));
            }

            // Sort column
            const sortedColumn = this.sortPixelArray(column);

            // Write back sorted pixels
            for (let y = 0; y < height; y++) {
                this.imageProcessor.setPixel(imageData, x, y, sortedColumn[y]);
            }
        }
    }

    /**
     * Sort pixels diagonally
     * @param {ImageData} imageData - Image data to sort
     */
    sortDiagonal(imageData) {
        const width = imageData.width;
        const height = imageData.height;

        // Sort from top-left to bottom-right diagonals
        for (let startY = 0; startY < height; startY++) {
            const diagonal = [];
            const positions = [];

            let x = 0;
            let y = startY;

            while (x < width && y < height) {
                diagonal.push(this.imageProcessor.getPixel(imageData, x, y));
                positions.push({ x, y });
                x++;
                y++;
            }

            const sortedDiagonal = this.sortPixelArray(diagonal);

            for (let i = 0; i < positions.length; i++) {
                this.imageProcessor.setPixel(
                    imageData,
                    positions[i].x,
                    positions[i].y,
                    sortedDiagonal[i]
                );
            }
        }

        // Sort from top to bottom-right diagonals (starting from x > 0)
        for (let startX = 1; startX < width; startX++) {
            const diagonal = [];
            const positions = [];

            let x = startX;
            let y = 0;

            while (x < width && y < height) {
                diagonal.push(this.imageProcessor.getPixel(imageData, x, y));
                positions.push({ x, y });
                x++;
                y++;
            }

            const sortedDiagonal = this.sortPixelArray(diagonal);

            for (let i = 0; i < positions.length; i++) {
                this.imageProcessor.setPixel(
                    imageData,
                    positions[i].x,
                    positions[i].y,
                    sortedDiagonal[i]
                );
            }
        }
    }

    /**
     * Sort an array of pixels based on current mode
     * @param {Array} pixels - Array of pixel objects
     * @returns {Array} Sorted pixel array
     */
    sortPixelArray(pixels) {
        if (pixels.length === 0) return pixels;

        // Find intervals to sort
        const intervals = this.findSortIntervals(pixels);

        // Sort each interval
        for (const interval of intervals) {
            const segment = pixels.slice(interval.start, interval.end + 1);
            const sorted = this.sortSegment(segment);

            // Replace original segment with sorted segment
            for (let i = 0; i < sorted.length; i++) {
                pixels[interval.start + i] = sorted[i];
            }
        }

        return pixels;
    }

    /**
     * Find intervals in pixel array that should be sorted
     * @param {Array} pixels - Array of pixel objects
     * @returns {Array} Array of {start, end} intervals
     */
    findSortIntervals(pixels) {
        const intervals = [];
        let start = null;
        const intensityFactor = this.intensity / 100;

        for (let i = 0; i < pixels.length; i++) {
            const value = this.getPixelValue(pixels[i]);
            const shouldSort = this.shouldSortPixel(value);

            if (shouldSort && start === null) {
                start = i;
            } else if (!shouldSort && start !== null) {
                // Apply intensity - only sort a portion of the interval
                const intervalLength = i - start;
                const sortLength = Math.floor(intervalLength * intensityFactor);

                if (sortLength > 1) {
                    intervals.push({
                        start: start,
                        end: start + sortLength - 1
                    });
                }
                start = null;
            } else if (start !== null) {
                // Check if we've exceeded max sort length
                const currentLength = i - start;
                if (currentLength >= this.sortLength) {
                    intervals.push({
                        start: start,
                        end: i - 1
                    });
                    start = null;
                }
            }

            // Random intervals mode
            if (this.randomIntervals && start !== null && Math.random() < 0.1) {
                intervals.push({
                    start: start,
                    end: i
                });
                start = null;
            }
        }

        // Handle remaining interval
        if (start !== null) {
            const intervalLength = pixels.length - start;
            const sortLength = Math.floor(intervalLength * intensityFactor);

            if (sortLength > 1) {
                intervals.push({
                    start: start,
                    end: start + sortLength - 1
                });
            }
        }

        return intervals;
    }

    /**
     * Determine if a pixel should be sorted based on threshold
     * @param {number} value - Pixel value (brightness, hue, etc.)
     * @returns {boolean} True if pixel should be sorted
     */
    shouldSortPixel(value) {
        if (this.edgeDetect) {
            // In edge detection mode, sort pixels that differ from threshold
            return Math.abs(value - this.threshold) > 20;
        } else {
            // Normal mode - sort pixels above or below threshold
            return this.sortOrder === 'ascending'
                ? value > this.threshold
                : value < this.threshold;
        }
    }

    /**
     * Sort a segment of pixels
     * @param {Array} segment - Pixel segment to sort
     * @returns {Array} Sorted segment
     */
    sortSegment(segment) {
        const sorted = segment.slice();

        sorted.sort((a, b) => {
            const valueA = this.getPixelValue(a);
            const valueB = this.getPixelValue(b);

            let comparison = valueA - valueB;

            if (this.sortOrder === 'descending') {
                comparison = -comparison;
            }

            if (this.reverseSort) {
                comparison = -comparison;
            }

            return comparison;
        });

        return sorted;
    }

    /**
     * Get the sorting value for a pixel based on current mode
     * @param {Object} pixel - Pixel object {r, g, b, a}
     * @returns {number} Sorting value
     */
    getPixelValue(pixel) {
        switch (this.sortMode) {
            case 'brightness':
                return this.imageProcessor.getBrightness(pixel);
            case 'hue':
                return this.imageProcessor.getHue(pixel);
            case 'saturation':
                return this.imageProcessor.getSaturation(pixel);
            default:
                return this.imageProcessor.getBrightness(pixel);
        }
    }

    /**
     * Apply glitch effect with multiple passes
     * @param {number} passes - Number of sorting passes
     * @returns {ImageData} Glitched image data
     */
    applyGlitchEffect(passes = 3) {
        let imageData = this.imageProcessor.copyImageData(
            this.imageProcessor.getImageData()
        );

        for (let i = 0; i < passes; i++) {
            // Randomize parameters slightly for each pass
            const originalThreshold = this.threshold;
            const originalIntensity = this.intensity;

            this.threshold = originalThreshold + (Math.random() - 0.5) * 50;
            this.intensity = originalIntensity + (Math.random() - 0.5) * 20;

            // Apply sort
            this.imageProcessor.setImageData(imageData);
            imageData = this.sort();

            // Restore original parameters
            this.threshold = originalThreshold;
            this.intensity = originalIntensity;
        }

        return imageData;
    }

    /**
     * Create a preview with reduced processing for real-time feedback
     * @returns {ImageData} Preview image data
     */
    createPreview() {
        // For preview, we can reduce the sort length for faster processing
        const originalLength = this.sortLength;
        this.sortLength = Math.min(this.sortLength, 50);

        const preview = this.sort();

        this.sortLength = originalLength;
        return preview;
    }

    /**
     * Get current parameters as object
     * @returns {Object} Current parameters
     */
    getParameters() {
        return {
            sortMode: this.sortMode,
            direction: this.direction,
            threshold: this.threshold,
            intensity: this.intensity,
            sortLength: this.sortLength,
            sortOrder: this.sortOrder,
            reverseSort: this.reverseSort,
            randomIntervals: this.randomIntervals,
            edgeDetect: this.edgeDetect
        };
    }

    /**
     * Reset to default parameters
     */
    resetParameters() {
        this.sortMode = 'brightness';
        this.direction = 'horizontal';
        this.threshold = 128;
        this.intensity = 50;
        this.sortLength = 100;
        this.sortOrder = 'ascending';
        this.reverseSort = false;
        this.randomIntervals = false;
        this.edgeDetect = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PixelSorter;
}
