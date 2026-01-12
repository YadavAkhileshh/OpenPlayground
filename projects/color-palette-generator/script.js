const palette = document.getElementById("palette");
const generateBtn = document.getElementById("generateBtn");
const checkAccessibilityBtn = document.getElementById("checkAccessibility");
const suggestAlternativesBtn = document.getElementById("suggestAlternatives");
const exportCssBtn = document.getElementById("exportCss");
const togglePanelBtn = document.getElementById("togglePanel");
const copyCssBtn = document.getElementById("copyCss");
const closeModalBtn = document.getElementById("closeModal");
const cssModal = document.getElementById("cssModal");
const suggestionsContainer = document.getElementById("suggestionsContainer");
const suggestionsList = document.getElementById("suggestionsList");
const contrastInfo = document.getElementById("contrastInfo");
const wcagStatus = document.getElementById("wcagStatus");
const cssVariablesTextarea = document.getElementById("cssVariables");

const COLOR_COUNT = 5;
let colors = Array(COLOR_COUNT).fill(null);
let locked = Array(COLOR_COUNT).fill(false);
let panelExpanded = true;

window.replaceColor = function(index, newColor) {
    colors[index] = newColor;
    renderPalette();
    checkWCAGCompliance();
    suggestionsContainer.classList.add('hidden');
};

function randomColor() {
    return "#" + Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getLuminance(r, g, b) {
    const srgb = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function getContrastRatio(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

function checkWCAGCompliance() {
    if (colors.some(color => !color)) return;
    
    let allPassAA = true;
    let allPassAAA = true;
    let contrastResults = [];
    
    for (let i = 0; i < colors.length - 1; i++) {
        const ratio = getContrastRatio(colors[i], colors[i + 1]);
        contrastResults.push({
            color1: colors[i],
            color2: colors[i + 1],
            ratio: ratio.toFixed(2)
        });
        
        if (ratio < 4.5) allPassAA = false;
        if (ratio < 7) allPassAAA = false;
    }
    
    let contrastHtml = "";
    contrastResults.forEach((result, index) => {
        const level = result.ratio >= 7 ? "AAA" : result.ratio >= 4.5 ? "AA" : "Fail";
        const levelClass = result.ratio >= 4.5 ? "status-pass" : "status-fail";
        contrastHtml += `
            <div style="margin-bottom: 8px;">
                <span style="display: inline-block; width: 20px; height: 20px; border-radius: 4px; background: ${result.color1}; margin-right: 8px; vertical-align: middle;"></span>
                <span style="display: inline-block; width: 20px; height: 20px; border-radius: 4px; background: ${result.color2}; margin-right: 12px; vertical-align: middle;"></span>
                Ratio: <strong>${result.ratio}:1</strong> 
                <span class="${levelClass}">${level}</span>
            </div>
        `;
    });
    
    contrastInfo.innerHTML = contrastHtml;
    
    let wcagHtml = "";
    if (allPassAAA) {
        wcagHtml = `<span class="status-pass">✓ Passes WCAG AAA for normal text</span>`;
    } else if (allPassAA) {
        wcagHtml = `<span class="status-pass">✓ Passes WCAG AA for normal text</span>`;
    } else {
        wcagHtml = `<span class="status-fail">✗ Fails WCAG AA for normal text</span>`;
    }
    
    wcagStatus.innerHTML = wcagHtml;
    
    updateAccessibilityScores();
}

function updateAccessibilityScores() {
    document.querySelectorAll('.color-box').forEach((box, index) => {
        let score = 0;
        
        for (let i = 0; i < colors.length; i++) {
            if (i !== index) {
                score += getContrastRatio(colors[index], colors[i]);
            }
        }
        
        score = score / (colors.length - 1);
        
        const existingScore = box.querySelector('.accessibility-score');
        if (existingScore) existingScore.remove();
        
        const scoreEl = document.createElement('div');
        scoreEl.className = 'accessibility-score';
        
        if (score >= 7) {
            scoreEl.classList.add('score-high');
            scoreEl.textContent = 'AAA';
        } else if (score >= 4.5) {
            scoreEl.classList.add('score-medium');
            scoreEl.textContent = 'AA';
        } else {
            scoreEl.classList.add('score-low');
            scoreEl.textContent = 'Low';
        }
        
        box.appendChild(scoreEl);
    });
}

function suggestAlternatives() {
    if (colors.some(color => !color)) return;
    
    suggestionsList.innerHTML = "";
    
    colors.forEach((color, index) => {
        const rgb = hexToRgb(color);
        if (!rgb) return;
        
        const alternatives = [];
        
        alternatives.push({
            hex: adjustColor(color, 40),
            name: "Lighter"
        });
        
        alternatives.push({
            hex: adjustColor(color, -40),
            name: "Darker"
        });
        
        const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
        if (luminance > 0.5) {
            alternatives.push({
                hex: adjustColor(color, -60),
                name: "Higher Contrast"
            });
        } else {
            alternatives.push({
                hex: adjustColor(color, 60),
                name: "Higher Contrast"
            });
        }
        
        alternatives.push({
            hex: getComplementaryColor(color),
            name: "Complementary"
        });
        
        const colorSection = document.createElement('div');
        colorSection.className = 'color-section';
        colorSection.innerHTML = `
            <h4>Alternatives for <span style="color:${color}">${color}</span></h4>
            <div class="suggestions-grid" id="suggestions-${index}"></div>
        `;
        
        suggestionsList.appendChild(colorSection);
        
        const suggestionsGrid = document.getElementById(`suggestions-${index}`);
        alternatives.forEach(alt => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.style.background = alt.hex;
            suggestionItem.dataset.index = index;
            suggestionItem.dataset.color = alt.hex;
            
            const suggestionHex = document.createElement('div');
            suggestionHex.className = 'suggestion-hex';
            suggestionHex.textContent = alt.hex;
            
            suggestionItem.appendChild(suggestionHex);
            
            // Add click event listener directly
            suggestionItem.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                const newColor = this.dataset.color;
                replaceColor(idx, newColor);
            });
            
            suggestionsGrid.appendChild(suggestionItem);
        });
    });
    
    suggestionsContainer.classList.remove('hidden');
    suggestionsContainer.classList.add('fade-in');
    
    suggestionsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function adjustColor(hex, amount) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = Math.max(0, Math.min(255, rgb.r + amount));
    const g = Math.max(0, Math.min(255, rgb.g + amount));
    const b = Math.max(0, Math.min(255, rgb.b + amount));
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function getComplementaryColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = 255 - rgb.r;
    const g = 255 - rgb.g;
    const b = 255 - rgb.b;
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function exportAsCss() {
    let css = `/* Color Palette CSS Variables */\n`;
    css += `/* Generated by Color Palette Generator */\n\n`;
    
    css += `:root {\n`;
    colors.forEach((color, index) => {
        css += `  --color-${index + 1}: ${color};\n`;
    });
    css += `}\n\n`;
    
    css += `/* Utility Classes */\n`;
    colors.forEach((color, index) => {
        css += `.bg-color-${index + 1} { background-color: var(--color-${index + 1}); }\n`;
        css += `.text-color-${index + 1} { color: var(--color-${index + 1}); }\n`;
        css += `.border-color-${index + 1} { border-color: var(--color-${index + 1}); }\n`;
    });
    
    cssVariablesTextarea.value = css;
    cssModal.classList.remove('hidden');
}

function generatePalette() {
    for (let i = 0; i < COLOR_COUNT; i++) {
        if (!locked[i]) {
            colors[i] = randomColor();
        }
    }

    renderPalette();
    suggestionsContainer.classList.add('hidden');
    
    contrastInfo.innerHTML = "Select colors to check contrast";
    wcagStatus.innerHTML = '<span class="status-pending">No colors selected</span>';
}

function renderPalette() {
    palette.innerHTML = "";

    for (let i = 0; i < COLOR_COUNT; i++) {
        const box = document.createElement("div");
        box.className = "color-box";
        box.style.background = colors[i];
        box.dataset.color = colors[i];
        box.dataset.index = i;

        if (locked[i]) box.classList.add("locked");

        const lockDot = document.createElement("div");
        lockDot.className = "lock-indicator";
        lockDot.innerHTML = locked[i] ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>';

        const hex = document.createElement("div");
        hex.className = "hex";
        hex.textContent = colors[i];

        hex.addEventListener("click", (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(colors[i]);
            
            const originalText = hex.textContent;
            hex.textContent = "Copied!";
            hex.style.background = "#4CAF50";
            hex.style.color = "white";
            
            setTimeout(() => {
                hex.textContent = originalText;
                hex.style.background = "";
                hex.style.color = "";
            }, 700);
        });

        box.addEventListener("dblclick", () => {
            locked[i] = !locked[i];
            box.classList.toggle("locked");
            lockDot.innerHTML = locked[i] ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>';
        });

        box.appendChild(lockDot);
        box.appendChild(hex);
        palette.appendChild(box);
    }
    
    updateAccessibilityScores();
}

generateBtn.addEventListener("click", generatePalette);
checkAccessibilityBtn.addEventListener("click", checkWCAGCompliance);
suggestAlternativesBtn.addEventListener("click", suggestAlternatives);
exportCssBtn.addEventListener("click", exportAsCss);

togglePanelBtn.addEventListener("click", () => {
    panelExpanded = !panelExpanded;
    const panelContent = document.querySelector('.panel-content');
    const icon = togglePanelBtn.querySelector('i');
    
    if (panelExpanded) {
        panelContent.style.maxHeight = panelContent.scrollHeight + 'px';
        icon.className = 'fas fa-chevron-up';
    } else {
        panelContent.style.maxHeight = '0';
        icon.className = 'fas fa-chevron-down';
    }
});

copyCssBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(cssVariablesTextarea.value);
    
    const originalText = copyCssBtn.innerHTML;
    copyCssBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    
    setTimeout(() => {
        copyCssBtn.innerHTML = originalText;
    }, 2000);
});

closeModalBtn.addEventListener("click", () => {
    cssModal.classList.add('hidden');
});

cssModal.addEventListener("click", (e) => {
    if (e.target === cssModal) {
        cssModal.classList.add('hidden');
    }
});

generatePalette();

document.addEventListener('DOMContentLoaded', () => {
    const panelContent = document.querySelector('.panel-content');
    panelContent.style.maxHeight = panelContent.scrollHeight + 'px';
});