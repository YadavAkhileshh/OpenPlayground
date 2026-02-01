/**
 * FontMatch - Pairing Algorithm
 * Intelligent font pairing recommendations based on typography principles
 */

const PairingEngine = (() => {
    /**
     * Calculate compatibility score between two fonts
     * Score ranges from 0-100
     */
    function calculateCompatibility(headingFont, bodyFont) {
        const headingMeta = FontManager.getFontMetadata(headingFont);
        const bodyMeta = FontManager.getFontMetadata(bodyFont);

        if (!headingMeta || !bodyMeta) return 0;

        let score = 0;

        // Rule 1: Contrast Principle (serif + sans-serif = high score)
        if (headingMeta.category === 'serif' && bodyMeta.category === 'sans-serif') {
            score += 30; // Classic pairing
        } else if (headingMeta.category === 'sans-serif' && bodyMeta.category === 'serif') {
            score += 25; // Reverse classic
        } else if (headingMeta.category === 'display' && bodyMeta.category === 'sans-serif') {
            score += 28; // Display + sans works well
        } else if (headingMeta.category === 'display' && bodyMeta.category === 'serif') {
            score += 26; // Display + serif can work
        } else if (headingMeta.category === bodyMeta.category) {
            // Same category pairing - needs careful consideration
            if (headingMeta.category === 'sans-serif') {
                score += 15; // Sans + sans can work
            } else if (headingMeta.category === 'serif') {
                score += 12; // Serif + serif is harder
            } else if (headingMeta.category === 'monospace') {
                score += 5; // Mono + mono rarely works
            }
        }

        // Rule 2: X-Height Harmony
        const xHeightDiff = Math.abs(headingMeta.xHeight - bodyMeta.xHeight);
        if (xHeightDiff < 0.03) {
            score += 20; // Very similar x-heights
        } else if (xHeightDiff < 0.06) {
            score += 15; // Moderately similar
        } else if (xHeightDiff < 0.10) {
            score += 10; // Acceptable difference
        } else {
            score += 5; // Large difference
        }

        // Rule 3: Contrast Level Harmony
        if (headingMeta.contrast === bodyMeta.contrast) {
            score += 15; // Same contrast level
        } else if (
            (headingMeta.contrast === 'high' && bodyMeta.contrast === 'medium') ||
            (headingMeta.contrast === 'medium' && bodyMeta.contrast === 'high')
        ) {
            score += 12; // Adjacent contrast levels
        } else {
            score += 8; // Different contrast levels
        }

        // Rule 4: Personality Compatibility
        const personalityPairs = {
            'elegant': ['readable', 'neutral', 'humanist'],
            'readable': ['elegant', 'neutral', 'friendly'],
            'neutral': ['elegant', 'readable', 'geometric'],
            'geometric': ['neutral', 'humanist', 'elegant'],
            'humanist': ['geometric', 'neutral', 'readable'],
            'bold': ['neutral', 'humanist', 'readable'],
            'technical': ['neutral', 'geometric', 'clean']
        };

        const compatiblePersonalities = personalityPairs[headingMeta.personality] || [];
        if (compatiblePersonalities.includes(bodyMeta.personality)) {
            score += 10;
        }

        // Rule 5: Avoid same font
        if (headingFont === bodyFont) {
            score -= 30; // Penalize using same font
        }

        // Rule 6: Weight consideration
        const weightDiff = Math.abs(headingMeta.weight - bodyMeta.weight);
        if (weightDiff >= 200) {
            score += 5; // Good weight contrast
        }

        // Normalize score to 0-100
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get pairing suggestions for a given heading font
     */
    function getSuggestionsForHeading(headingFont, currentBodyFont = null, limit = 5) {
        const allFonts = FontManager.getAllFonts();
        const suggestions = [];

        for (const font of allFonts) {
            if (font.family === headingFont) continue; // Skip same font

            const score = calculateCompatibility(headingFont, font.family);
            suggestions.push({
                headingFont,
                bodyFont: font.family,
                score,
                description: generatePairingDescription(headingFont, font.family, score)
            });
        }

        // Sort by score descending
        suggestions.sort((a, b) => b.score - a.score);

        // Return top suggestions
        return suggestions.slice(0, limit);
    }

    /**
     * Get pairing suggestions for a given body font
     */
    function getSuggestionsForBody(bodyFont, currentHeadingFont = null, limit = 5) {
        const allFonts = FontManager.getAllFonts();
        const suggestions = [];

        for (const font of allFonts) {
            if (font.family === bodyFont) continue; // Skip same font

            const score = calculateCompatibility(font.family, bodyFont);
            suggestions.push({
                headingFont: font.family,
                bodyFont,
                score,
                description: generatePairingDescription(font.family, bodyFont, score)
            });
        }

        // Sort by score descending
        suggestions.sort((a, b) => b.score - a.score);

        // Return top suggestions
        return suggestions.slice(0, limit);
    }

    /**
     * Generate human-readable description for a pairing
     */
    function generatePairingDescription(headingFont, bodyFont, score) {
        const headingMeta = FontManager.getFontMetadata(headingFont);
        const bodyMeta = FontManager.getFontMetadata(bodyFont);

        if (!headingMeta || !bodyMeta) return 'Unknown pairing';

        const descriptions = [];

        // Category-based descriptions
        if (headingMeta.category === 'serif' && bodyMeta.category === 'sans-serif') {
            descriptions.push('Classic serif-sans pairing');
        } else if (headingMeta.category === 'sans-serif' && bodyMeta.category === 'serif') {
            descriptions.push('Modern sans-serif pairing');
        } else if (headingMeta.category === 'display') {
            descriptions.push('Bold display heading');
        } else if (headingMeta.category === bodyMeta.category) {
            descriptions.push(`Harmonious ${headingMeta.category} pairing`);
        }

        // Mood-based descriptions
        const sharedMoods = headingMeta.mood.filter(m => bodyMeta.mood.includes(m));
        if (sharedMoods.length > 0) {
            descriptions.push(`${sharedMoods[0]} aesthetic`);
        }

        // Score-based quality
        if (score >= 80) {
            descriptions.push('excellent harmony');
        } else if (score >= 65) {
            descriptions.push('strong compatibility');
        } else if (score >= 50) {
            descriptions.push('good balance');
        }

        return descriptions.slice(0, 2).join(', ');
    }

    /**
     * Get preset pairings (curated combinations)
     */
    function getPresetPairings() {
        return [
            {
                name: 'Editorial Classic',
                headingFont: 'Playfair Display',
                bodyFont: 'Source Sans 3',
                description: 'Timeless elegance for editorial content'
            },
            {
                name: 'Modern Professional',
                headingFont: 'Montserrat',
                bodyFont: 'Merriweather',
                description: 'Clean and professional for business'
            },
            {
                name: 'Friendly & Approachable',
                headingFont: 'Poppins',
                bodyFont: 'Open Sans',
                description: 'Warm and inviting for user-facing content'
            },
            {
                name: 'Bold & Impactful',
                headingFont: 'Bebas Neue',
                bodyFont: 'Roboto',
                description: 'Strong headlines with readable body'
            },
            {
                name: 'Literary Elegance',
                headingFont: 'Lora',
                bodyFont: 'Inter',
                description: 'Perfect for long-form reading'
            },
            {
                name: 'Tech & Modern',
                headingFont: 'Work Sans',
                bodyFont: 'IBM Plex Mono',
                description: 'Contemporary tech aesthetic'
            },
            {
                name: 'Sophisticated Editorial',
                headingFont: 'Cormorant Garamond',
                bodyFont: 'Raleway',
                description: 'Refined and artistic'
            },
            {
                name: 'Clean Minimalist',
                headingFont: 'Inter',
                bodyFont: 'Inter',
                description: 'Unified minimalist design'
            }
        ];
    }

    /**
     * Evaluate current pairing
     */
    function evaluatePairing(headingFont, bodyFont) {
        const score = calculateCompatibility(headingFont, bodyFont);
        const description = generatePairingDescription(headingFont, bodyFont, score);

        let quality = 'Poor';
        let recommendation = 'Consider trying a different pairing';

        if (score >= 80) {
            quality = 'Excellent';
            recommendation = 'This is a fantastic pairing!';
        } else if (score >= 65) {
            quality = 'Very Good';
            recommendation = 'This pairing works very well';
        } else if (score >= 50) {
            quality = 'Good';
            recommendation = 'This is a solid pairing';
        } else if (score >= 35) {
            quality = 'Fair';
            recommendation = 'This pairing could be improved';
        }

        return {
            score,
            quality,
            description,
            recommendation
        };
    }

    // Public API
    return {
        calculateCompatibility,
        getSuggestionsForHeading,
        getSuggestionsForBody,
        generatePairingDescription,
        getPresetPairings,
        evaluatePairing
    };
})();
