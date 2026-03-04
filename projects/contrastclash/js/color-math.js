/* ===================================
   ContrastClash - Color Math Module
   WCAG-Compliant Color Calculations
   =================================== */

/**
 * Color Math Utilities for WCAG Contrast Calculations
 * Implements WCAG 2.1 Level AA and AAA standards
 */

const ColorMath = {
    /**
     * Convert hex color to RGB object
     * @param {string} hex - Hex color code (e.g., "#FF5733")
     * @returns {Object} RGB object with r, g, b properties (0-255)
     */
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace(/^#/, '');

        // Handle 3-digit hex codes
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        // Parse hex to RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return { r, g, b };
    },

    /**
     * Convert RGB to hex color
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {string} Hex color code
     */
    rgbToHex(r, g, b) {
        const toHex = (value) => {
            const hex = Math.round(value).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    },

    /**
     * Apply sRGB gamma correction
     * @param {number} channel - Color channel value (0-255)
     * @returns {number} Linearized channel value (0-1)
     */
    linearizeChannel(channel) {
        // Normalize to 0-1 range
        const normalized = channel / 255;

        // Apply sRGB gamma correction formula
        if (normalized <= 0.03928) {
            return normalized / 12.92;
        } else {
            return Math.pow((normalized + 0.055) / 1.055, 2.4);
        }
    },

    /**
     * Calculate relative luminance per WCAG formula
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {number} Relative luminance (0-1)
     */
    getRelativeLuminance(r, g, b) {
        // Linearize each channel
        const rLinear = this.linearizeChannel(r);
        const gLinear = this.linearizeChannel(g);
        const bLinear = this.linearizeChannel(b);

        // Calculate relative luminance using WCAG formula
        // L = 0.2126 * R + 0.7152 * G + 0.0722 * B
        const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;

        return luminance;
    },

    /**
     * Calculate relative luminance from hex color
     * @param {string} hex - Hex color code
     * @returns {number} Relative luminance (0-1)
     */
    getLuminanceFromHex(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        return this.getRelativeLuminance(r, g, b);
    },

    /**
     * Calculate contrast ratio between two colors
     * @param {string} color1 - First hex color
     * @param {string} color2 - Second hex color
     * @returns {number} Contrast ratio (1-21)
     */
    getContrastRatio(color1, color2) {
        const lum1 = this.getLuminanceFromHex(color1);
        const lum2 = this.getLuminanceFromHex(color2);

        // Ensure L1 is the lighter color
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);

        // Calculate contrast ratio: (L1 + 0.05) / (L2 + 0.05)
        const ratio = (lighter + 0.05) / (darker + 0.05);

        return ratio;
    },

    /**
     * Format contrast ratio for display
     * @param {number} ratio - Contrast ratio
     * @returns {string} Formatted ratio (e.g., "4.5:1")
     */
    formatRatio(ratio) {
        return `${ratio.toFixed(1)}:1`;
    },

    /**
     * Check if contrast ratio meets WCAG AA standard for normal text
     * @param {number} ratio - Contrast ratio
     * @returns {boolean} True if meets AA standard (4.5:1)
     */
    meetsWCAG_AA(ratio) {
        return ratio >= 4.5;
    },

    /**
     * Check if contrast ratio meets WCAG AA standard for large text
     * @param {number} ratio - Contrast ratio
     * @returns {boolean} True if meets AA large text standard (3:1)
     */
    meetsWCAG_AA_Large(ratio) {
        return ratio >= 3.0;
    },

    /**
     * Check if contrast ratio meets WCAG AAA standard for normal text
     * @param {number} ratio - Contrast ratio
     * @returns {boolean} True if meets AAA standard (7:1)
     */
    meetsWCAG_AAA(ratio) {
        return ratio >= 7.0;
    },

    /**
     * Check if contrast ratio meets WCAG AAA standard for large text
     * @param {number} ratio - Contrast ratio
     * @returns {boolean} True if meets AAA large text standard (4.5:1)
     */
    meetsWCAG_AAA_Large(ratio) {
        return ratio >= 4.5;
    },

    /**
     * Get compliance level for a given ratio
     * @param {number} ratio - Contrast ratio
     * @returns {Object} Compliance status for all WCAG levels
     */
    getComplianceStatus(ratio) {
        return {
            aa: this.meetsWCAG_AA(ratio),
            aaLarge: this.meetsWCAG_AA_Large(ratio),
            aaa: this.meetsWCAG_AAA(ratio),
            aaaLarge: this.meetsWCAG_AAA_Large(ratio)
        };
    },

    /**
     * Generate a random hex color
     * @returns {string} Random hex color
     */
    generateRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return this.rgbToHex(r, g, b);
    },

    /**
     * Generate a color with specific luminance range
     * @param {number} minLum - Minimum luminance (0-1)
     * @param {number} maxLum - Maximum luminance (0-1)
     * @returns {string} Hex color within luminance range
     */
    generateColorInLuminanceRange(minLum, maxLum) {
        let color, luminance;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            color = this.generateRandomColor();
            luminance = this.getLuminanceFromHex(color);
            attempts++;
        } while ((luminance < minLum || luminance > maxLum) && attempts < maxAttempts);

        return color;
    },

    /**
     * Generate a deceptive color pair (looks similar but different contrast)
     * @param {string} baseColor - Base hex color
     * @returns {string} Deceptive hex color
     */
    generateDeceptiveColor(baseColor) {
        const { r, g, b } = this.hexToRgb(baseColor);

        // Slightly modify one channel to create visual similarity
        // but different luminance
        const variation = 20 + Math.floor(Math.random() * 30);
        const channel = Math.floor(Math.random() * 3);

        let newR = r, newG = g, newB = b;

        switch (channel) {
            case 0: // Modify red
                newR = Math.max(0, Math.min(255, r + (Math.random() > 0.5 ? variation : -variation)));
                break;
            case 1: // Modify green
                newG = Math.max(0, Math.min(255, g + (Math.random() > 0.5 ? variation : -variation)));
                break;
            case 2: // Modify blue
                newB = Math.max(0, Math.min(255, b + (Math.random() > 0.5 ? variation : -variation)));
                break;
        }

        return this.rgbToHex(newR, newG, newB);
    },

    /**
     * Generate a color pair with target contrast ratio
     * @param {number} targetRatio - Target contrast ratio
     * @param {number} tolerance - Acceptable tolerance
     * @returns {Object} Object with foreground and background colors
     */
    generateColorPairWithRatio(targetRatio, tolerance = 0.5) {
        let attempts = 0;
        const maxAttempts = 200;

        while (attempts < maxAttempts) {
            const bg = this.generateRandomColor();
            const fg = this.generateRandomColor();
            const ratio = this.getContrastRatio(fg, bg);

            if (Math.abs(ratio - targetRatio) <= tolerance) {
                return { foreground: fg, background: bg, actualRatio: ratio };
            }

            attempts++;
        }

        // Fallback: return black and white
        return {
            foreground: '#000000',
            background: '#FFFFFF',
            actualRatio: 21
        };
    },

    /**
     * Adjust color to meet target contrast ratio
     * @param {string} fixedColor - The color to keep fixed
     * @param {string} adjustColor - The color to adjust
     * @param {number} targetRatio - Target contrast ratio
     * @param {boolean} lighten - Whether to lighten or darken
     * @returns {string} Adjusted hex color
     */
    adjustColorForRatio(fixedColor, adjustColor, targetRatio, lighten = true) {
        let { r, g, b } = this.hexToRgb(adjustColor);
        let currentRatio = this.getContrastRatio(fixedColor, adjustColor);
        let attempts = 0;
        const maxAttempts = 50;
        const step = lighten ? 5 : -5;

        while (Math.abs(currentRatio - targetRatio) > 0.1 && attempts < maxAttempts) {
            r = Math.max(0, Math.min(255, r + step));
            g = Math.max(0, Math.min(255, g + step));
            b = Math.max(0, Math.min(255, b + step));

            const newColor = this.rgbToHex(r, g, b);
            currentRatio = this.getContrastRatio(fixedColor, newColor);
            attempts++;
        }

        return this.rgbToHex(r, g, b);
    },

    /**
     * Get a hint color that's closer to the target ratio
     * @param {string} bgColor - Background color
     * @param {string} fgColor - Current foreground color
     * @param {number} targetRatio - Target contrast ratio
     * @returns {string} Hint color
     */
    getHintColor(bgColor, fgColor, targetRatio) {
        const currentRatio = this.getContrastRatio(bgColor, fgColor);
        const bgLuminance = this.getLuminanceFromHex(bgColor);

        // Determine if we need to lighten or darken
        const needsHigherContrast = currentRatio < targetRatio;
        const shouldLighten = bgLuminance < 0.5 ? needsHigherContrast : !needsHigherContrast;

        return this.adjustColorForRatio(bgColor, fgColor, targetRatio, shouldLighten);
    },

    /**
     * Calculate color distance (perceptual difference)
     * @param {string} color1 - First hex color
     * @param {string} color2 - Second hex color
     * @returns {number} Color distance (0-765)
     */
    getColorDistance(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);

        const rDiff = rgb1.r - rgb2.r;
        const gDiff = rgb1.g - rgb2.g;
        const bDiff = rgb1.b - rgb2.b;

        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    },

    /**
     * Check if two colors are visually similar
     * @param {string} color1 - First hex color
     * @param {string} color2 - Second hex color
     * @param {number} threshold - Similarity threshold (0-765)
     * @returns {boolean} True if colors are similar
     */
    areColorsSimilar(color1, color2, threshold = 50) {
        return this.getColorDistance(color1, color2) < threshold;
    },

    /**
     * Get color name/description based on luminance
     * @param {string} hex - Hex color
     * @returns {string} Color description
     */
    getColorDescription(hex) {
        const luminance = this.getLuminanceFromHex(hex);

        if (luminance > 0.9) return 'Very Light';
        if (luminance > 0.7) return 'Light';
        if (luminance > 0.4) return 'Medium';
        if (luminance > 0.2) return 'Dark';
        return 'Very Dark';
    },

    /**
     * Validate hex color format
     * @param {string} hex - Hex color to validate
     * @returns {boolean} True if valid hex color
     */
    isValidHex(hex) {
        const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(hex);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorMath;
}
