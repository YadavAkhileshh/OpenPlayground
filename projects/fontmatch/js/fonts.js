/**
 * FontMatch - Font Database and Management
 * Handles font metadata, classification, and dynamic loading
 */

const FontManager = (() => {
    // Font Database with detailed metadata
    const fontDatabase = {
        // SERIF FONTS
        'Playfair Display': {
            family: 'Playfair Display',
            category: 'serif',
            weight: 700,
            xHeight: 0.48,
            personality: 'elegant',
            contrast: 'high',
            mood: ['sophisticated', 'editorial', 'luxury']
        },
        'Merriweather': {
            family: 'Merriweather',
            category: 'serif',
            weight: 400,
            xHeight: 0.52,
            personality: 'readable',
            contrast: 'medium',
            mood: ['warm', 'friendly', 'traditional']
        },
        'Lora': {
            family: 'Lora',
            category: 'serif',
            weight: 400,
            xHeight: 0.50,
            personality: 'balanced',
            contrast: 'medium',
            mood: ['classic', 'refined', 'literary']
        },
        'Crimson Text': {
            family: 'Crimson Text',
            category: 'serif',
            weight: 400,
            xHeight: 0.49,
            personality: 'scholarly',
            contrast: 'medium',
            mood: ['academic', 'serious', 'traditional']
        },
        'Libre Baskerville': {
            family: 'Libre Baskerville',
            category: 'serif',
            weight: 400,
            xHeight: 0.51,
            personality: 'classic',
            contrast: 'high',
            mood: ['timeless', 'elegant', 'formal']
        },
        'Cormorant Garamond': {
            family: 'Cormorant Garamond',
            category: 'serif',
            weight: 400,
            xHeight: 0.47,
            personality: 'delicate',
            contrast: 'high',
            mood: ['graceful', 'artistic', 'refined']
        },
        'EB Garamond': {
            family: 'EB Garamond',
            category: 'serif',
            weight: 400,
            xHeight: 0.48,
            personality: 'traditional',
            contrast: 'medium',
            mood: ['classic', 'bookish', 'elegant']
        },
        'Spectral': {
            family: 'Spectral',
            category: 'serif',
            weight: 400,
            xHeight: 0.51,
            personality: 'modern',
            contrast: 'medium',
            mood: ['contemporary', 'clean', 'professional']
        },
        'Cardo': {
            family: 'Cardo',
            category: 'serif',
            weight: 400,
            xHeight: 0.50,
            personality: 'scholarly',
            contrast: 'low',
            mood: ['academic', 'historical', 'serious']
        },
        'Vollkorn': {
            family: 'Vollkorn',
            category: 'serif',
            weight: 400,
            xHeight: 0.52,
            personality: 'sturdy',
            contrast: 'medium',
            mood: ['reliable', 'solid', 'readable']
        },

        // SANS-SERIF FONTS
        'Inter': {
            family: 'Inter',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.54,
            personality: 'neutral',
            contrast: 'low',
            mood: ['modern', 'clean', 'versatile']
        },
        'Roboto': {
            family: 'Roboto',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.53,
            personality: 'friendly',
            contrast: 'low',
            mood: ['approachable', 'modern', 'tech']
        },
        'Open Sans': {
            family: 'Open Sans',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.54,
            personality: 'humanist',
            contrast: 'low',
            mood: ['friendly', 'open', 'readable']
        },
        'Montserrat': {
            family: 'Montserrat',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.52,
            personality: 'geometric',
            contrast: 'low',
            mood: ['urban', 'modern', 'bold']
        },
        'Raleway': {
            family: 'Raleway',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.51,
            personality: 'elegant',
            contrast: 'low',
            mood: ['sophisticated', 'thin', 'airy']
        },
        'Poppins': {
            family: 'Poppins',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.55,
            personality: 'geometric',
            contrast: 'low',
            mood: ['playful', 'rounded', 'modern']
        },
        'Work Sans': {
            family: 'Work Sans',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.53,
            personality: 'industrial',
            contrast: 'low',
            mood: ['utilitarian', 'clean', 'professional']
        },
        'Nunito': {
            family: 'Nunito',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.54,
            personality: 'rounded',
            contrast: 'low',
            mood: ['friendly', 'soft', 'approachable']
        },
        'Source Sans 3': {
            family: 'Source Sans 3',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.53,
            personality: 'humanist',
            contrast: 'low',
            mood: ['professional', 'readable', 'neutral']
        },
        'Outfit': {
            family: 'Outfit',
            category: 'sans-serif',
            weight: 400,
            xHeight: 0.52,
            personality: 'geometric',
            contrast: 'low',
            mood: ['modern', 'trendy', 'bold']
        },

        // MONOSPACE FONTS
        'JetBrains Mono': {
            family: 'JetBrains Mono',
            category: 'monospace',
            weight: 400,
            xHeight: 0.52,
            personality: 'technical',
            contrast: 'low',
            mood: ['code', 'precise', 'modern']
        },
        'Fira Code': {
            family: 'Fira Code',
            category: 'monospace',
            weight: 400,
            xHeight: 0.51,
            personality: 'technical',
            contrast: 'low',
            mood: ['code', 'ligatures', 'clean']
        },
        'Source Code Pro': {
            family: 'Source Code Pro',
            category: 'monospace',
            weight: 400,
            xHeight: 0.50,
            personality: 'technical',
            contrast: 'low',
            mood: ['code', 'professional', 'readable']
        },
        'IBM Plex Mono': {
            family: 'IBM Plex Mono',
            category: 'monospace',
            weight: 400,
            xHeight: 0.52,
            personality: 'corporate',
            contrast: 'low',
            mood: ['technical', 'corporate', 'modern']
        },
        'Roboto Mono': {
            family: 'Roboto Mono',
            category: 'monospace',
            weight: 400,
            xHeight: 0.51,
            personality: 'technical',
            contrast: 'low',
            mood: ['code', 'clean', 'geometric']
        },
        'Space Mono': {
            family: 'Space Mono',
            category: 'monospace',
            weight: 400,
            xHeight: 0.53,
            personality: 'quirky',
            contrast: 'medium',
            mood: ['retro', 'unique', 'bold']
        },
        'Inconsolata': {
            family: 'Inconsolata',
            category: 'monospace',
            weight: 400,
            xHeight: 0.50,
            personality: 'technical',
            contrast: 'low',
            mood: ['code', 'compact', 'efficient']
        },
        'Courier Prime': {
            family: 'Courier Prime',
            category: 'monospace',
            weight: 400,
            xHeight: 0.49,
            personality: 'typewriter',
            contrast: 'medium',
            mood: ['vintage', 'screenplay', 'classic']
        },

        // DISPLAY FONTS
        'Bebas Neue': {
            family: 'Bebas Neue',
            category: 'display',
            weight: 400,
            xHeight: 0.70,
            personality: 'bold',
            contrast: 'low',
            mood: ['impact', 'condensed', 'strong']
        },
        'Oswald': {
            family: 'Oswald',
            category: 'display',
            weight: 400,
            xHeight: 0.68,
            personality: 'condensed',
            contrast: 'low',
            mood: ['compact', 'strong', 'modern']
        },
        'Archivo Black': {
            family: 'Archivo Black',
            category: 'display',
            weight: 400,
            xHeight: 0.52,
            personality: 'bold',
            contrast: 'low',
            mood: ['heavy', 'impactful', 'strong']
        },
        'Anton': {
            family: 'Anton',
            category: 'display',
            weight: 400,
            xHeight: 0.69,
            personality: 'bold',
            contrast: 'low',
            mood: ['impact', 'advertising', 'strong']
        }
    };

    /**
     * Get all fonts
     */
    function getAllFonts() {
        return Object.values(fontDatabase);
    }

    /**
     * Get fonts by category
     */
    function getFontsByCategory(category) {
        return Object.values(fontDatabase).filter(font => font.category === category);
    }

    /**
     * Get font metadata
     */
    function getFontMetadata(fontFamily) {
        return fontDatabase[fontFamily] || null;
    }

    /**
     * Get font category
     */
    function getFontCategory(fontFamily) {
        const font = fontDatabase[fontFamily];
        return font ? font.category : 'unknown';
    }

    /**
     * Check if font exists
     */
    function fontExists(fontFamily) {
        return fontFamily in fontDatabase;
    }

    /**
     * Get category display name
     */
    function getCategoryDisplayName(category) {
        const displayNames = {
            'serif': 'Serif',
            'sans-serif': 'Sans-Serif',
            'monospace': 'Monospace',
            'display': 'Display'
        };
        return displayNames[category] || category;
    }

    /**
     * Load font dynamically (fonts are already loaded via CSS imports)
     * This function checks if font is ready
     */
    async function loadFont(fontFamily) {
        if (!fontExists(fontFamily)) {
            console.warn(`Font "${fontFamily}" not found in database`);
            return false;
        }

        try {
            // Check if font is loaded using Font Loading API
            await document.fonts.load(`16px "${fontFamily}"`);
            return true;
        } catch (error) {
            console.error(`Error loading font "${fontFamily}":`, error);
            return false;
        }
    }

    /**
     * Preload all fonts
     */
    async function preloadAllFonts() {
        const fonts = getAllFonts();
        const loadPromises = fonts.map(font => loadFont(font.family));
        await Promise.all(loadPromises);
    }

    // Public API
    return {
        getAllFonts,
        getFontsByCategory,
        getFontMetadata,
        getFontCategory,
        fontExists,
        getCategoryDisplayName,
        loadFont,
        preloadAllFonts
    };
})();
