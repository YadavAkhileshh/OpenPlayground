/**
 * FontMatch - UI Controller
 * Manages all UI interactions and state updates
 */

const UIController = (() => {
    // State
    let state = {
        headingFont: 'Playfair Display',
        bodyFont: 'Open Sans',
        headingSize: 48,
        headingSpacing: 0,
        headingLineHeight: 1.2,
        bodySize: 16,
        bodySpacing: 0,
        bodyLineHeight: 1.6
    };

    // DOM Elements
    const elements = {
        // Font selects
        headingFontSelect: null,
        bodyFontSelect: null,
        headingCategory: null,
        bodyCategory: null,

        // Heading controls
        headingSizeSlider: null,
        headingSizeValue: null,
        headingSpacingSlider: null,
        headingSpacingValue: null,
        headingLineHeightSlider: null,
        headingLineHeightValue: null,

        // Body controls
        bodySizeSlider: null,
        bodySizeValue: null,
        bodySpacingSlider: null,
        bodySpacingValue: null,
        bodyLineHeightSlider: null,
        bodyLineHeightValue: null,

        // Preview elements
        headingPreview: null,
        bodyPreview: null,
        combinedHeading: null,
        combinedParagraph: null,

        // Other
        pairingSuggestions: null,
        exportButton: null,
        toast: null
    };

    /**
     * Initialize UI
     */
    function init() {
        cacheElements();
        populateFontSelects();
        attachEventListeners();
        updateAllPreviews();
        updatePairingSuggestions();
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.headingFontSelect = document.getElementById('heading-font');
        elements.bodyFontSelect = document.getElementById('body-font');
        elements.headingCategory = document.getElementById('heading-category');
        elements.bodyCategory = document.getElementById('body-category');

        elements.headingSizeSlider = document.getElementById('heading-size');
        elements.headingSizeValue = document.getElementById('heading-size-value');
        elements.headingSpacingSlider = document.getElementById('heading-spacing');
        elements.headingSpacingValue = document.getElementById('heading-spacing-value');
        elements.headingLineHeightSlider = document.getElementById('heading-line-height');
        elements.headingLineHeightValue = document.getElementById('heading-line-height-value');

        elements.bodySizeSlider = document.getElementById('body-size');
        elements.bodySizeValue = document.getElementById('body-size-value');
        elements.bodySpacingSlider = document.getElementById('body-spacing');
        elements.bodySpacingValue = document.getElementById('body-spacing-value');
        elements.bodyLineHeightSlider = document.getElementById('body-line-height');
        elements.bodyLineHeightValue = document.getElementById('body-line-height-value');

        elements.headingPreview = document.querySelector('.preview-heading');
        elements.bodyPreview = document.querySelector('.body-preview');
        elements.combinedHeading = document.querySelector('.combined-heading');
        elements.combinedParagraph = document.querySelector('.combined-paragraph');

        elements.pairingSuggestions = document.getElementById('pairing-suggestions');
        elements.exportButton = document.getElementById('export-css');
        elements.toast = document.getElementById('toast');
    }

    /**
     * Populate font select dropdowns
     */
    function populateFontSelects() {
        const fonts = FontManager.getAllFonts();

        // Sort fonts by category then name
        fonts.sort((a, b) => {
            if (a.category !== b.category) {
                const order = ['serif', 'sans-serif', 'monospace', 'display'];
                return order.indexOf(a.category) - order.indexOf(b.category);
            }
            return a.family.localeCompare(b.family);
        });

        // Clear existing options
        elements.headingFontSelect.innerHTML = '';
        elements.bodyFontSelect.innerHTML = '';

        // Group fonts by category
        let currentCategory = '';
        let headingOptgroup = null;
        let bodyOptgroup = null;

        fonts.forEach(font => {
            if (font.category !== currentCategory) {
                currentCategory = font.category;
                const categoryName = FontManager.getCategoryDisplayName(font.category);

                headingOptgroup = document.createElement('optgroup');
                headingOptgroup.label = categoryName;
                elements.headingFontSelect.appendChild(headingOptgroup);

                bodyOptgroup = document.createElement('optgroup');
                bodyOptgroup.label = categoryName;
                elements.bodyFontSelect.appendChild(bodyOptgroup);
            }

            const headingOption = document.createElement('option');
            headingOption.value = font.family;
            headingOption.textContent = font.family;
            headingOption.style.fontFamily = `"${font.family}"`;
            headingOptgroup.appendChild(headingOption);

            const bodyOption = document.createElement('option');
            bodyOption.value = font.family;
            bodyOption.textContent = font.family;
            bodyOption.style.fontFamily = `"${font.family}"`;
            bodyOptgroup.appendChild(bodyOption);
        });

        // Set default values
        elements.headingFontSelect.value = state.headingFont;
        elements.bodyFontSelect.value = state.bodyFont;

        updateCategoryBadges();
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        // Font selection
        elements.headingFontSelect.addEventListener('change', handleHeadingFontChange);
        elements.bodyFontSelect.addEventListener('change', handleBodyFontChange);

        // Heading controls
        elements.headingSizeSlider.addEventListener('input', handleHeadingSizeChange);
        elements.headingSpacingSlider.addEventListener('input', handleHeadingSpacingChange);
        elements.headingLineHeightSlider.addEventListener('input', handleHeadingLineHeightChange);

        // Body controls
        elements.bodySizeSlider.addEventListener('input', handleBodySizeChange);
        elements.bodySpacingSlider.addEventListener('input', handleBodySpacingChange);
        elements.bodyLineHeightSlider.addEventListener('input', handleBodyLineHeightChange);

        // Export button
        elements.exportButton.addEventListener('click', handleExportCSS);
    }

    /**
     * Event Handlers
     */
    function handleHeadingFontChange(e) {
        state.headingFont = e.target.value;
        updateCategoryBadges();
        updateHeadingPreview();
        updatePairingSuggestions();
    }

    function handleBodyFontChange(e) {
        state.bodyFont = e.target.value;
        updateCategoryBadges();
        updateBodyPreview();
        updatePairingSuggestions();
    }

    function handleHeadingSizeChange(e) {
        state.headingSize = parseInt(e.target.value);
        elements.headingSizeValue.textContent = `${state.headingSize}px`;
        updateHeadingPreview();
    }

    function handleHeadingSpacingChange(e) {
        state.headingSpacing = parseFloat(e.target.value);
        elements.headingSpacingValue.textContent = `${state.headingSpacing.toFixed(2)}em`;
        updateHeadingPreview();
    }

    function handleHeadingLineHeightChange(e) {
        state.headingLineHeight = parseFloat(e.target.value);
        elements.headingLineHeightValue.textContent = state.headingLineHeight.toFixed(2);
        updateHeadingPreview();
    }

    function handleBodySizeChange(e) {
        state.bodySize = parseInt(e.target.value);
        elements.bodySizeValue.textContent = `${state.bodySize}px`;
        updateBodyPreview();
    }

    function handleBodySpacingChange(e) {
        state.bodySpacing = parseFloat(e.target.value);
        elements.bodySpacingValue.textContent = `${state.bodySpacing.toFixed(3)}em`;
        updateBodyPreview();
    }

    function handleBodyLineHeightChange(e) {
        state.bodyLineHeight = parseFloat(e.target.value);
        elements.bodyLineHeightValue.textContent = state.bodyLineHeight.toFixed(2);
        updateBodyPreview();
    }

    function handleExportCSS() {
        const css = generateCSS();
        copyToClipboard(css);
        showToast('CSS copied to clipboard!', 'success');
    }

    /**
     * Update category badges
     */
    function updateCategoryBadges() {
        const headingCategory = FontManager.getFontCategory(state.headingFont);
        const bodyCategory = FontManager.getFontCategory(state.bodyFont);

        elements.headingCategory.textContent = FontManager.getCategoryDisplayName(headingCategory);
        elements.headingCategory.className = `label-category ${headingCategory}`;

        elements.bodyCategory.textContent = FontManager.getCategoryDisplayName(bodyCategory);
        elements.bodyCategory.className = `label-category ${bodyCategory}`;
    }

    /**
     * Update preview elements
     */
    function updateHeadingPreview() {
        elements.headingPreview.style.fontFamily = `"${state.headingFont}"`;
        elements.headingPreview.style.fontSize = `${state.headingSize}px`;
        elements.headingPreview.style.letterSpacing = `${state.headingSpacing}em`;
        elements.headingPreview.style.lineHeight = state.headingLineHeight;

        elements.combinedHeading.style.fontFamily = `"${state.headingFont}"`;
        elements.combinedHeading.style.fontSize = `${state.headingSize * 0.75}px`;
        elements.combinedHeading.style.letterSpacing = `${state.headingSpacing}em`;
        elements.combinedHeading.style.lineHeight = state.headingLineHeight;
    }

    function updateBodyPreview() {
        const paragraphs = elements.bodyPreview.querySelectorAll('.preview-paragraph');
        paragraphs.forEach(p => {
            p.style.fontFamily = `"${state.bodyFont}"`;
            p.style.fontSize = `${state.bodySize}px`;
            p.style.letterSpacing = `${state.bodySpacing}em`;
            p.style.lineHeight = state.bodyLineHeight;
        });

        elements.combinedParagraph.style.fontFamily = `"${state.bodyFont}"`;
        elements.combinedParagraph.style.fontSize = `${state.bodySize}px`;
        elements.combinedParagraph.style.letterSpacing = `${state.bodySpacing}em`;
        elements.combinedParagraph.style.lineHeight = state.bodyLineHeight;
    }

    function updateAllPreviews() {
        updateHeadingPreview();
        updateBodyPreview();
    }

    /**
     * Update pairing suggestions
     */
    function updatePairingSuggestions() {
        const suggestions = PairingEngine.getSuggestionsForHeading(state.headingFont, state.bodyFont, 4);

        elements.pairingSuggestions.innerHTML = '';

        suggestions.forEach(suggestion => {
            const card = createPairingCard(suggestion);
            elements.pairingSuggestions.appendChild(card);
        });
    }

    /**
     * Create pairing suggestion card
     */
    function createPairingCard(suggestion) {
        const card = document.createElement('div');
        card.className = 'pairing-card';
        card.innerHTML = `
            <div class="pairing-card-header">
                <div class="pairing-fonts">${suggestion.bodyFont}</div>
                <div class="pairing-score">${suggestion.score}%</div>
            </div>
            <div class="pairing-description">${suggestion.description}</div>
        `;

        card.addEventListener('click', () => {
            state.bodyFont = suggestion.bodyFont;
            elements.bodyFontSelect.value = suggestion.bodyFont;
            updateCategoryBadges();
            updateBodyPreview();
            updatePairingSuggestions();
            showToast(`Applied pairing: ${suggestion.bodyFont}`, 'success');
        });

        return card;
    }

    /**
     * Generate CSS code
     */
    function generateCSS() {
        return `/* FontMatch Export */

/* Heading Styles */
h1, h2, h3, h4, h5, h6 {
    font-family: "${state.headingFont}", ${FontManager.getFontCategory(state.headingFont)};
    font-size: ${state.headingSize}px;
    letter-spacing: ${state.headingSpacing}em;
    line-height: ${state.headingLineHeight};
}

/* Body Text Styles */
body, p {
    font-family: "${state.bodyFont}", ${FontManager.getFontCategory(state.bodyFont)};
    font-size: ${state.bodySize}px;
    letter-spacing: ${state.bodySpacing}em;
    line-height: ${state.bodyLineHeight};
}`;
    }

    /**
     * Copy text to clipboard
     */
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'success') {
        elements.toast.textContent = message;
        elements.toast.className = `toast ${type}`;

        // Trigger reflow
        void elements.toast.offsetWidth;

        elements.toast.classList.add('show');

        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Get current state
     */
    function getState() {
        return { ...state };
    }

    /**
     * Set state
     */
    function setState(newState) {
        state = { ...state, ...newState };

        // Update form controls to match state
        if (newState.headingFont !== undefined) {
            elements.headingFontSelect.value = state.headingFont;
        }
        if (newState.bodyFont !== undefined) {
            elements.bodyFontSelect.value = state.bodyFont;
        }
        if (newState.headingSize !== undefined) {
            elements.headingSizeSlider.value = state.headingSize;
            elements.headingSizeValue.textContent = `${state.headingSize}px`;
        }
        if (newState.headingSpacing !== undefined) {
            elements.headingSpacingSlider.value = state.headingSpacing;
            elements.headingSpacingValue.textContent = `${state.headingSpacing.toFixed(2)}em`;
        }
        if (newState.headingLineHeight !== undefined) {
            elements.headingLineHeightSlider.value = state.headingLineHeight;
            elements.headingLineHeightValue.textContent = state.headingLineHeight.toFixed(2);
        }
        if (newState.bodySize !== undefined) {
            elements.bodySizeSlider.value = state.bodySize;
            elements.bodySizeValue.textContent = `${state.bodySize}px`;
        }
        if (newState.bodySpacing !== undefined) {
            elements.bodySpacingSlider.value = state.bodySpacing;
            elements.bodySpacingValue.textContent = `${state.bodySpacing.toFixed(3)}em`;
        }
        if (newState.bodyLineHeight !== undefined) {
            elements.bodyLineHeightSlider.value = state.bodyLineHeight;
            elements.bodyLineHeightValue.textContent = state.bodyLineHeight.toFixed(2);
        }

        updateCategoryBadges();
        updateAllPreviews();
        updatePairingSuggestions();
    }

    // Public API
    return {
        init,
        getState,
        setState,
        showToast
    };
})();
