/**
 * ===================================
 * Accessibility Contrast Checker
 * WCAG 2.1 Compliance Tool
 * ===================================
 */

// ============================================
// SECTION 1: Color Utility Functions
// ============================================

/**
 * Parse HEX color to RGB object
 * @param {string} hex - HEX color string (with or without #)
 * @returns {object|null} RGB object or null if invalid
 */
function hexToRgb(hex) {
    const cleanHex = hex.replace(/^#/, '');

    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex) && !/^[0-9A-Fa-f]{3}$/.test(cleanHex)) {
        return null;
    }

    let fullHex = cleanHex;
    if (cleanHex.length === 3) {
        fullHex = cleanHex.split('').map(c => c + c).join('');
    }

    return {
        r: parseInt(fullHex.substring(0, 2), 16),
        g: parseInt(fullHex.substring(2, 4), 16),
        b: parseInt(fullHex.substring(4, 6), 16)
    };
}

/**
 * Convert RGB to HEX string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} HEX color string with #
 */
function rgbToHex(r, g, b) {
    const toHex = (c) => {
        const clamped = Math.max(0, Math.min(255, Math.round(c)));
        return clamped.toString(16).padStart(2, '0');
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {object} HSL object {h, s, l}
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {object} RGB object {r, g, b}
 */
function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// ============================================
// SECTION 2: WCAG Contrast Calculation
// ============================================

/**
 * Calculate relative luminance per WCAG 2.1
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {number} Relative luminance (0-1)
 */
function getRelativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param {object} rgb1 - First color {r, g, b}
 * @param {object} rgb2 - Second color {r, g, b}
 * @returns {number} Contrast ratio (1-21)
 */
function getContrastRatio(rgb1, rgb2) {
    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG compliance levels
 * @param {number} ratio - Contrast ratio
 * @returns {object} Compliance status for each level
 */
function checkWcagCompliance(ratio) {
    return {
        aaLargeText: ratio >= 3,      // AA Large Text: 3:1
        aaNormalText: ratio >= 4.5,   // AA Normal Text: 4.5:1
        aaaLargeText: ratio >= 4.5,   // AAA Large Text: 4.5:1
        aaaNormalText: ratio >= 7     // AAA Normal Text: 7:1
    };
}

// ============================================
// SECTION 3: State Management
// ============================================

const state = {
    foreground: { r: 0, g: 0, b: 0 },
    background: { r: 255, g: 255, b: 255 },
    theme: localStorage.getItem('contrastCheckerTheme') || 'light',
    history: JSON.parse(localStorage.getItem('contrastCheckerHistory') || '[]')
};

// WCAG-compliant accessible presets
const presets = [
    { fg: '#000000', bg: '#FFFFFF', name: 'Classic Black & White' },
    { fg: '#1A202C', bg: '#F7FAFC', name: 'Slate Gray' },
    { fg: '#2D3748', bg: '#EDF2F7', name: 'Cool Gray' },
    { fg: '#1E40AF', bg: '#DBEAFE', name: 'Blue Theme' },
    { fg: '#065F46', bg: '#D1FAE5', name: 'Green Theme' },
    { fg: '#92400E', bg: '#FEF3C7', name: 'Amber Theme' },
    { fg: '#7C3AED', bg: '#EDE9FE', name: 'Purple Theme' },
    { fg: '#DC2626', bg: '#FEE2E2', name: 'Red Theme' },
    { fg: '#0F766E', bg: '#CCFBF1', name: 'Teal Theme' },
    { fg: '#4338CA', bg: '#E0E7FF', name: 'Indigo Theme' },
    { fg: '#F8FAFC', bg: '#0F172A', name: 'Dark Mode' },
    { fg: '#E2E8F0', bg: '#1E293B', name: 'Dark Slate' }
];

// ============================================
// SECTION 4: DOM References
// ============================================

const dom = {
    // Color pickers
    fgColorPicker: document.getElementById('fgColorPicker'),
    bgColorPicker: document.getElementById('bgColorPicker'),

    // HEX inputs
    fgHex: document.getElementById('fgHex'),
    bgHex: document.getElementById('bgHex'),

    // RGB inputs
    fgRgbR: document.getElementById('fgRgbR'),
    fgRgbG: document.getElementById('fgRgbG'),
    fgRgbB: document.getElementById('fgRgbB'),
    bgRgbR: document.getElementById('bgRgbR'),
    bgRgbG: document.getElementById('bgRgbG'),
    bgRgbB: document.getElementById('bgRgbB'),

    // HSL inputs
    fgHslH: document.getElementById('fgHslH'),
    fgHslS: document.getElementById('fgHslS'),
    fgHslL: document.getElementById('fgHslL'),
    bgHslH: document.getElementById('bgHslH'),
    bgHslS: document.getElementById('bgHslS'),
    bgHslL: document.getElementById('bgHslL'),

    // Mini previews
    fgPreviewMini: document.getElementById('fgPreviewMini'),
    bgPreviewMini: document.getElementById('bgPreviewMini'),

    // Contrast display
    contrastRatio: document.getElementById('contrastRatio'),
    ratioMeterFill: document.getElementById('ratioMeterFill'),

    // WCAG cards
    wcagAALarge: document.getElementById('wcagAALarge'),
    wcagAANormal: document.getElementById('wcagAANormal'),
    wcagAAALarge: document.getElementById('wcagAAALarge'),
    wcagAAANormal: document.getElementById('wcagAAANormal'),

    // Preview
    previewCard: document.getElementById('previewCard'),

    // Grids
    suggestionsGrid: document.getElementById('suggestionsGrid'),
    presetsGrid: document.getElementById('presetsGrid'),
    historyGrid: document.getElementById('historyGrid'),
    historyEmpty: document.getElementById('historyEmpty'),

    // Buttons
    swapColorsBtn: document.getElementById('swapColorsBtn'),
    themeToggle: document.getElementById('themeToggle'),
    keyboardHintBtn: document.getElementById('keyboardHintBtn'),
    refreshSuggestionsBtn: document.getElementById('refreshSuggestionsBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    copyUrlBtn: document.getElementById('copyUrlBtn'),
    copyCssBtn: document.getElementById('copyCssBtn'),
    downloadReportBtn: document.getElementById('downloadReportBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),

    // Modal
    keyboardModal: document.getElementById('keyboardModal'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
};

// ============================================
// SECTION 5: UI Update Functions
// ============================================

/**
 * Update all color inputs for a given type (foreground/background)
 * @param {string} type - 'foreground' or 'background'
 */
function updateColorInputs(type) {
    const rgb = state[type];
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const prefix = type === 'foreground' ? 'fg' : 'bg';

    // Update color picker
    dom[`${prefix}ColorPicker`].value = hex;

    // Update HEX input
    dom[`${prefix}Hex`].value = hex.replace('#', '');

    // Update RGB inputs
    dom[`${prefix}RgbR`].value = rgb.r;
    dom[`${prefix}RgbG`].value = rgb.g;
    dom[`${prefix}RgbB`].value = rgb.b;

    // Update HSL inputs
    dom[`${prefix}HslH`].value = hsl.h;
    dom[`${prefix}HslS`].value = hsl.s;
    dom[`${prefix}HslL`].value = hsl.l;

    // Update mini preview
    dom[`${prefix}PreviewMini`].style.backgroundColor = hex;
}

/**
 * Update contrast display and WCAG compliance cards
 */
function updateContrastDisplay() {
    const ratio = getContrastRatio(state.foreground, state.background);
    const compliance = checkWcagCompliance(ratio);

    // Update ratio display
    dom.contrastRatio.textContent = ratio.toFixed(2);

    // Update meter fill (scale: 1-21 -> 0-100%)
    const percentage = Math.min(100, ((ratio - 1) / 20) * 100);
    dom.ratioMeterFill.style.width = `${percentage}%`;

    // Update WCAG cards
    updateComplianceCard(dom.wcagAALarge, compliance.aaLargeText);
    updateComplianceCard(dom.wcagAANormal, compliance.aaNormalText);
    updateComplianceCard(dom.wcagAAALarge, compliance.aaaLargeText);
    updateComplianceCard(dom.wcagAAANormal, compliance.aaaNormalText);
}

/**
 * Update a single compliance card
 * @param {HTMLElement} card - The compliance card element
 * @param {boolean} passes - Whether it passes the check
 */
function updateComplianceCard(card, passes) {
    card.classList.remove('pass', 'fail');
    card.classList.add(passes ? 'pass' : 'fail');
    card.querySelector('.status-text').textContent = passes ? 'PASS' : 'FAIL';
}

/**
 * Update live preview section
 */
function updatePreview() {
    const fgHex = rgbToHex(state.foreground.r, state.foreground.g, state.foreground.b);
    const bgHex = rgbToHex(state.background.r, state.background.g, state.background.b);

    dom.previewCard.style.backgroundColor = bgHex;
    dom.previewCard.style.color = fgHex;
}

/**
 * Generate accessible color suggestions
 */
function generateSuggestions() {
    const suggestions = [];
    const { foreground, background } = state;

    // Keep foreground, adjust background
    for (let l = 10; l <= 90; l += 20) {
        const fgHsl = rgbToHsl(foreground.r, foreground.g, foreground.b);
        const newBgRgb = hslToRgb(fgHsl.h, Math.min(30, fgHsl.s), l);
        const ratio = getContrastRatio(foreground, newBgRgb);

        if (ratio >= 4.5 && !isDuplicateColor(suggestions, foreground, newBgRgb)) {
            suggestions.push({
                fg: foreground,
                bg: newBgRgb,
                ratio
            });
        }
    }

    // Keep background, adjust foreground
    for (let l = 10; l <= 90; l += 20) {
        const bgHsl = rgbToHsl(background.r, background.g, background.b);
        const newFgRgb = hslToRgb(bgHsl.h, Math.min(50, bgHsl.s), l);
        const ratio = getContrastRatio(newFgRgb, background);

        if (ratio >= 4.5 && !isDuplicateColor(suggestions, newFgRgb, background)) {
            suggestions.push({
                fg: newFgRgb,
                bg: background,
                ratio
            });
        }
    }

    // Complementary color suggestions
    const fgHsl = rgbToHsl(foreground.r, foreground.g, foreground.b);
    for (let offset = 30; offset <= 180; offset += 30) {
        const newHue = (fgHsl.h + offset) % 360;
        const newFgRgb = hslToRgb(newHue, 70, 30);
        const newBgRgb = hslToRgb(newHue, 20, 95);
        const ratio = getContrastRatio(newFgRgb, newBgRgb);

        if (ratio >= 4.5) {
            suggestions.push({ fg: newFgRgb, bg: newBgRgb, ratio });
        }
    }

    renderSuggestions(suggestions.slice(0, 6).sort((a, b) => b.ratio - a.ratio));
}

/**
 * Check if a color combination already exists in suggestions
 */
function isDuplicateColor(suggestions, fg, bg) {
    const fgHex = rgbToHex(fg.r, fg.g, fg.b);
    const bgHex = rgbToHex(bg.r, bg.g, bg.b);

    return suggestions.some(s => {
        const sFgHex = rgbToHex(s.fg.r, s.fg.g, s.fg.b);
        const sBgHex = rgbToHex(s.bg.r, s.bg.g, s.bg.b);
        return sFgHex === fgHex && sBgHex === bgHex;
    });
}

/**
 * Render suggestion cards
 * @param {Array} suggestions - Array of suggestion objects
 */
function renderSuggestions(suggestions) {
    dom.suggestionsGrid.innerHTML = suggestions.map(s => {
        const fgHex = rgbToHex(s.fg.r, s.fg.g, s.fg.b);
        const bgHex = rgbToHex(s.bg.r, s.bg.g, s.bg.b);

        return `
      <div class="suggestion-card" data-fg="${fgHex}" data-bg="${bgHex}">
        <div class="suggestion-preview" style="background: ${bgHex}; color: ${fgHex};">
          Sample Text Aa
        </div>
        <div class="suggestion-info">
          <div class="suggestion-colors">
            <div class="suggestion-color-chip">
              <span class="suggestion-color-dot" style="background: ${fgHex};"></span>
              ${fgHex}
            </div>
            <div class="suggestion-color-chip">
              <span class="suggestion-color-dot" style="background: ${bgHex};"></span>
              ${bgHex}
            </div>
          </div>
          <span class="suggestion-ratio">${s.ratio.toFixed(1)}:1</span>
        </div>
      </div>
    `;
    }).join('');

    // Add click handlers
    dom.suggestionsGrid.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            const fg = hexToRgb(card.dataset.fg);
            const bg = hexToRgb(card.dataset.bg);
            if (fg && bg) {
                state.foreground = fg;
                state.background = bg;
                updateAll();
                addToHistory();
                showToast('Colors applied!');
            }
        });
    });
}

/**
 * Render color presets
 */
function renderPresets() {
    dom.presetsGrid.innerHTML = presets.map(preset => {
        return `
      <div class="preset-card" data-fg="${preset.fg}" data-bg="${preset.bg}" 
           style="background: ${preset.bg}; color: ${preset.fg};"
           title="${preset.name}">
        ${preset.name}
      </div>
    `;
    }).join('');

    // Add click handlers
    dom.presetsGrid.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', () => {
            const fg = hexToRgb(card.dataset.fg);
            const bg = hexToRgb(card.dataset.bg);
            if (fg && bg) {
                state.foreground = fg;
                state.background = bg;
                updateAll();
                addToHistory();
                showToast('Preset applied!');
            }
        });
    });
}

/**
 * Render color history
 */
function renderHistory() {
    if (state.history.length === 0) {
        dom.historyEmpty.style.display = 'block';
        dom.historyGrid.innerHTML = '';
        dom.historyGrid.appendChild(dom.historyEmpty);
        return;
    }

    dom.historyEmpty.style.display = 'none';

    const historyHtml = state.history.map(item => {
        return `
      <div class="history-item" data-fg="${item.fg}" data-bg="${item.bg}">
        <div class="history-colors">
          <span class="history-color-dot" style="background: ${item.fg};"></span>
          <span class="history-color-dot" style="background: ${item.bg};"></span>
        </div>
        <span class="history-ratio">${item.ratio}:1</span>
      </div>
    `;
    }).join('');

    dom.historyGrid.innerHTML = historyHtml;

    // Add click handlers
    dom.historyGrid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const fg = hexToRgb(item.dataset.fg);
            const bg = hexToRgb(item.dataset.bg);
            if (fg && bg) {
                state.foreground = fg;
                state.background = bg;
                updateAll();
                showToast('Colors restored!');
            }
        });
    });
}

/**
 * Add current colors to history
 */
function addToHistory() {
    const fgHex = rgbToHex(state.foreground.r, state.foreground.g, state.foreground.b);
    const bgHex = rgbToHex(state.background.r, state.background.g, state.background.b);
    const ratio = getContrastRatio(state.foreground, state.background).toFixed(1);

    // Check for duplicates
    const exists = state.history.some(item => item.fg === fgHex && item.bg === bgHex);
    if (exists) return;

    // Add to beginning of array
    state.history.unshift({ fg: fgHex, bg: bgHex, ratio });

    // Keep only last 10 items
    if (state.history.length > 10) {
        state.history.pop();
    }

    // Save to localStorage
    localStorage.setItem('contrastCheckerHistory', JSON.stringify(state.history));

    renderHistory();
}

/**
 * Update all UI components
 */
function updateAll() {
    updateColorInputs('foreground');
    updateColorInputs('background');
    updateContrastDisplay();
    updatePreview();
    generateSuggestions();
}

// ============================================
// SECTION 6: Event Handlers
// ============================================

/**
 * Handle color picker change
 * @param {string} type - 'foreground' or 'background'
 * @param {Event} e - Input event
 */
function handleColorPickerChange(type, e) {
    const rgb = hexToRgb(e.target.value);
    if (rgb) {
        state[type] = rgb;
        updateAll();
        addToHistory();
    }
}

/**
 * Handle HEX input change
 * @param {string} type - 'foreground' or 'background'
 * @param {Event} e - Input event
 */
function handleHexChange(type, e) {
    const rgb = hexToRgb(e.target.value);
    if (rgb) {
        state[type] = rgb;
        updateAll();
    }
}

/**
 * Handle RGB input change
 * @param {string} type - 'foreground' or 'background'
 */
function handleRgbChange(type) {
    const prefix = type === 'foreground' ? 'fg' : 'bg';
    const r = parseInt(dom[`${prefix}RgbR`].value) || 0;
    const g = parseInt(dom[`${prefix}RgbG`].value) || 0;
    const b = parseInt(dom[`${prefix}RgbB`].value) || 0;

    state[type] = {
        r: Math.max(0, Math.min(255, r)),
        g: Math.max(0, Math.min(255, g)),
        b: Math.max(0, Math.min(255, b))
    };

    updateAll();
}

/**
 * Handle HSL input change
 * @param {string} type - 'foreground' or 'background'
 */
function handleHslChange(type) {
    const prefix = type === 'foreground' ? 'fg' : 'bg';
    const h = parseInt(dom[`${prefix}HslH`].value) || 0;
    const s = parseInt(dom[`${prefix}HslS`].value) || 0;
    const l = parseInt(dom[`${prefix}HslL`].value) || 0;

    const rgb = hslToRgb(
        Math.max(0, Math.min(360, h)),
        Math.max(0, Math.min(100, s)),
        Math.max(0, Math.min(100, l))
    );

    state[type] = rgb;
    updateAll();
}

/**
 * Swap foreground and background colors
 */
function swapColors() {
    const temp = { ...state.foreground };
    state.foreground = { ...state.background };
    state.background = temp;
    updateAll();
    addToHistory();

    // Add animation to button
    dom.swapColorsBtn.style.transform = 'scale(1.1) rotate(180deg)';
    setTimeout(() => {
        dom.swapColorsBtn.style.transform = '';
    }, 300);

    showToast('Colors swapped!');
}

/**
 * Toggle theme
 */
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('contrastCheckerTheme', state.theme);
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - 'success' or 'error'
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <i class="${type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'}"></i>
    <span>${message}</span>
  `;

    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Copy URL with color parameters
 */
function copyUrl() {
    const fgHex = rgbToHex(state.foreground.r, state.foreground.g, state.foreground.b);
    const bgHex = rgbToHex(state.background.r, state.background.g, state.background.b);
    const url = `${window.location.origin}${window.location.pathname}?fg=${fgHex.replace('#', '')}&bg=${bgHex.replace('#', '')}`;

    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy URL', 'error');
    });
}

/**
 * Copy CSS variables
 */
function copyCss() {
    const fgHex = rgbToHex(state.foreground.r, state.foreground.g, state.foreground.b);
    const bgHex = rgbToHex(state.background.r, state.background.g, state.background.b);
    const ratio = getContrastRatio(state.foreground, state.background).toFixed(2);

    const css = `:root {
  --text-color: ${fgHex};
  --background-color: ${bgHex};
  /* Contrast ratio: ${ratio}:1 */
}`;

    navigator.clipboard.writeText(css).then(() => {
        showToast('CSS copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy CSS', 'error');
    });
}

/**
 * Download accessibility report
 */
function downloadReport() {
    const fgHex = rgbToHex(state.foreground.r, state.foreground.g, state.foreground.b);
    const bgHex = rgbToHex(state.background.r, state.background.g, state.background.b);
    const ratio = getContrastRatio(state.foreground, state.background);
    const compliance = checkWcagCompliance(ratio);

    const report = `
WCAG Contrast Accessibility Report
===================================
Generated: ${new Date().toLocaleString()}

Colors
------
Foreground (Text): ${fgHex}
Background: ${bgHex}

Contrast Ratio: ${ratio.toFixed(2)}:1

WCAG 2.1 Compliance
-------------------
AA Large Text (≥3:1):     ${compliance.aaLargeText ? '✓ PASS' : '✗ FAIL'}
AA Normal Text (≥4.5:1):  ${compliance.aaNormalText ? '✓ PASS' : '✗ FAIL'}
AAA Large Text (≥4.5:1):  ${compliance.aaaLargeText ? '✓ PASS' : '✗ FAIL'}
AAA Normal Text (≥7:1):   ${compliance.aaaNormalText ? '✓ PASS' : '✗ FAIL'}

CSS Variables
-------------
:root {
  --text-color: ${fgHex};
  --background-color: ${bgHex};
}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contrast-accessibility-report.txt';
    a.click();
    URL.revokeObjectURL(url);

    showToast('Report downloaded!');
}

/**
 * Clear color history
 */
function clearHistory() {
    state.history = [];
    localStorage.removeItem('contrastCheckerHistory');
    renderHistory();
    showToast('History cleared!');
}

/**
 * Open keyboard shortcuts modal
 */
function openKeyboardModal() {
    dom.keyboardModal.classList.add('active');
    dom.keyboardModal.setAttribute('aria-hidden', 'false');
}

/**
 * Close keyboard shortcuts modal
 */
function closeKeyboardModal() {
    dom.keyboardModal.classList.remove('active');
    dom.keyboardModal.setAttribute('aria-hidden', 'true');
}

/**
 * Generate random accessible colors
 */
function generateRandomAccessible() {
    const bgLightness = Math.random() > 0.5 ? 90 + Math.random() * 10 : 5 + Math.random() * 10;
    const fgLightness = bgLightness > 50 ? 10 + Math.random() * 20 : 80 + Math.random() * 15;
    const hue = Math.floor(Math.random() * 360);

    state.background = hslToRgb(hue, 10 + Math.random() * 20, bgLightness);
    state.foreground = hslToRgb(hue, 40 + Math.random() * 40, fgLightness);

    // Ensure good contrast
    let ratio = getContrastRatio(state.foreground, state.background);
    let attempts = 0;

    while (ratio < 4.5 && attempts < 10) {
        if (bgLightness > 50) {
            state.foreground = hslToRgb(hue, 50, Math.max(5, fgLightness - 10 * attempts));
        } else {
            state.foreground = hslToRgb(hue, 30, Math.min(95, fgLightness + 10 * attempts));
        }
        ratio = getContrastRatio(state.foreground, state.background);
        attempts++;
    }

    updateAll();
    addToHistory();
    showToast('Random accessible colors generated!');
}

// ============================================
// SECTION 7: Event Listeners
// ============================================

function initEventListeners() {
    // Color pickers
    dom.fgColorPicker.addEventListener('input', (e) => handleColorPickerChange('foreground', e));
    dom.bgColorPicker.addEventListener('input', (e) => handleColorPickerChange('background', e));

    // HEX inputs
    dom.fgHex.addEventListener('input', (e) => handleHexChange('foreground', e));
    dom.bgHex.addEventListener('input', (e) => handleHexChange('background', e));
    dom.fgHex.addEventListener('blur', () => addToHistory());
    dom.bgHex.addEventListener('blur', () => addToHistory());

    // RGB inputs
    ['fgRgbR', 'fgRgbG', 'fgRgbB'].forEach(id => {
        dom[id].addEventListener('input', () => handleRgbChange('foreground'));
        dom[id].addEventListener('blur', () => addToHistory());
    });
    ['bgRgbR', 'bgRgbG', 'bgRgbB'].forEach(id => {
        dom[id].addEventListener('input', () => handleRgbChange('background'));
        dom[id].addEventListener('blur', () => addToHistory());
    });

    // HSL inputs
    ['fgHslH', 'fgHslS', 'fgHslL'].forEach(id => {
        dom[id].addEventListener('input', () => handleHslChange('foreground'));
        dom[id].addEventListener('blur', () => addToHistory());
    });
    ['bgHslH', 'bgHslS', 'bgHslL'].forEach(id => {
        dom[id].addEventListener('input', () => handleHslChange('background'));
        dom[id].addEventListener('blur', () => addToHistory());
    });

    // Buttons
    dom.swapColorsBtn.addEventListener('click', swapColors);
    dom.themeToggle.addEventListener('click', toggleTheme);
    dom.keyboardHintBtn.addEventListener('click', openKeyboardModal);
    dom.closeModalBtn.addEventListener('click', closeKeyboardModal);
    dom.refreshSuggestionsBtn.addEventListener('click', generateSuggestions);
    dom.clearHistoryBtn.addEventListener('click', clearHistory);
    dom.copyUrlBtn.addEventListener('click', copyUrl);
    dom.copyCssBtn.addEventListener('click', copyCss);
    dom.downloadReportBtn.addEventListener('click', downloadReport);

    // Modal backdrop click
    dom.keyboardModal.addEventListener('click', (e) => {
        if (e.target === dom.keyboardModal) {
            closeKeyboardModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in an input
        if (e.target.tagName === 'INPUT') return;

        switch (e.key.toLowerCase()) {
            case 't':
                toggleTheme();
                break;
            case 's':
                swapColors();
                break;
            case 'r':
                generateRandomAccessible();
                break;
            case 'c':
                copyCss();
                break;
            case '?':
                openKeyboardModal();
                break;
            case 'escape':
                closeKeyboardModal();
                break;
        }
    });
}

// ============================================
// SECTION 8: URL Parameter Handling
// ============================================

function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const fgParam = urlParams.get('fg');
    const bgParam = urlParams.get('bg');

    if (fgParam) {
        const fg = hexToRgb(fgParam);
        if (fg) state.foreground = fg;
    }

    if (bgParam) {
        const bg = hexToRgb(bgParam);
        if (bg) state.background = bg;
    }
}

// ============================================
// SECTION 9: Initialization
// ============================================

function init() {
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', state.theme);

    // Handle URL parameters
    handleUrlParams();

    // Initialize event listeners
    initEventListeners();

    // Render static content
    renderPresets();
    renderHistory();

    // Initial update
    updateAll();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
