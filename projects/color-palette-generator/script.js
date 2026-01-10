const palette = document.getElementById("palette");
const generateBtn = document.getElementById("generateBtn");
const checkAllBtn = document.getElementById("checkAllBtn");
const fgColor = document.getElementById("fgColor");
const bgColor = document.getElementById("bgColor");
const fgHex = document.getElementById("fgHex");
const bgHex = document.getElementById("bgHex");
const checkContrastBtn = document.getElementById("checkContrastBtn");
const contrastRatio = document.getElementById("contrastRatio");
const previewText = document.getElementById("previewText");
const wcagAA = document.getElementById("wcagAA");
const wcagAAA = document.getElementById("wcagAAA");
const wcagAALarge = document.getElementById("wcagAALarge");
const accessibilityScores = document.getElementById("accessibilityScores");

const COLOR_COUNT = 5;
let colors = Array(COLOR_COUNT).fill(null);
let locked = Array(COLOR_COUNT).fill(false);

// Generate a random hex color
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
    const sRGB = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function getContrastRatio(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const luminance1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const luminance2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

function checkWCAGCompliance(ratio) {
    return {
        aa: ratio >= 4.5,
        aaa: ratio >= 7,
        aaLarge: ratio >= 3
    };
}

function updateContrastChecker() {
    const fg = fgHex.value;
    const bg = bgHex.value;
    
    fgColor.value = fg;
    bgColor.value = bg;
    
    const ratio = getContrastRatio(fg, bg);
    const roundedRatio = ratio.toFixed(2);
    
    contrastRatio.textContent = `${roundedRatio}:1`;
    
    const compliance = checkWCAGCompliance(ratio);
    
    updateWCAGIndicator(wcagAA, compliance.aa, "AA");
    updateWCAGIndicator(wcagAAA, compliance.aaa, "AAA");
    updateWCAGIndicator(wcagAALarge, compliance.aaLarge, "AA Large");
    
    previewText.style.color = fg;
    previewText.style.backgroundColor = bg;
    previewText.textContent = `Text with ${roundedRatio}:1 contrast ratio`;
    
    if (compliance.aaa) {
        contrastRatio.style.color = "#28a745";
    } else if (compliance.aa) {
        contrastRatio.style.color = "#ffc107";
    } else {
        contrastRatio.style.color = "#dc3545";
    }
}

function updateWCAGIndicator(element, passes, level) {
    const icon = element.querySelector("i");
    const parent = element.parentElement;
    
    if (passes) {
        icon.className = "fas fa-check-circle";
        icon.style.color = "#28a745";
        parent.classList.add("pass");
        parent.classList.remove("fail");
    } else {
        icon.className = "fas fa-times-circle";
        icon.style.color = "#dc3545";
        parent.classList.add("fail");
        parent.classList.remove("pass");
    }
}

function checkPaletteAccessibility() {
    accessibilityScores.innerHTML = "";
    
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        let minContrast = 21; 
        let maxContrast = 1;
        let avgContrast = 0;
        let contrastCount = 0;
        
        for (let j = 0; j < colors.length; j++) {
            if (i !== j) {
                const ratio = getContrastRatio(color, colors[j]);
                minContrast = Math.min(minContrast, ratio);
                maxContrast = Math.max(maxContrast, ratio);
                avgContrast += ratio;
                contrastCount++;
            }
        }
        
        avgContrast = contrastCount > 0 ? avgContrast / contrastCount : 0;
        
        const scoreElement = document.createElement("div");
        scoreElement.className = "accessibility-score";
        
        let scoreClass = "poor";
        let scoreIcon = "fas fa-exclamation-triangle";
        
        if (minContrast >= 4.5) {
            scoreClass = "good";
            scoreIcon = "fas fa-check-circle";
        } else if (minContrast >= 3) {
            scoreClass = "average";
            scoreIcon = "fas fa-info-circle";
        }
        
        scoreElement.classList.add(scoreClass);
        
        scoreElement.innerHTML = `
            <div class="score-label">
                <i class="${scoreIcon}"></i>
                Color ${i + 1}
            </div>
            <div class="score-value">${minContrast.toFixed(1)}:1</div>
            <div class="score-details">Min contrast</div>
        `;
        
        scoreElement.addEventListener("click", () => {
            fgHex.value = "#000000";
            bgHex.value = color;
            updateContrastChecker();
        });
        
        accessibilityScores.appendChild(scoreElement);
    }
}

function generatePalette() {
    for (let i = 0; i < COLOR_COUNT; i++) {
        if (!locked[i]) {
            colors[i] = randomColor();
        }
    }
    renderPalette();
    checkPaletteAccessibility();
}

function renderPalette() {
    palette.innerHTML = "";

    for (let i = 0; i < COLOR_COUNT; i++) {
        const box = document.createElement("div");
        box.className = "color-box";
        box.style.background = colors[i];
        box.dataset.color = colors[i];

        if (locked[i]) box.classList.add("locked");

        const lockDot = document.createElement("div");
        lockDot.className = "lock-indicator";
        lockDot.innerHTML = locked[i] ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>';

        const hex = document.createElement("div");
        hex.className = "hex";
        hex.textContent = colors[i];

        // Single click to copy
        hex.addEventListener("click", (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(colors[i]);
            const originalText = hex.textContent;
            hex.textContent = "✓ Copied!";
            hex.style.background = "#28a745";
            hex.style.color = "white";
            
            setTimeout(() => {
                hex.textContent = originalText;
                hex.style.background = "";
                hex.style.color = "";
            }, 1000);
        });

        // Double click to lock/unlock
        box.addEventListener("dblclick", () => {
            locked[i] = !locked[i];
            box.classList.toggle("locked");
            lockDot.innerHTML = locked[i] ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>';
            checkPaletteAccessibility();
        });

        box.addEventListener("click", (e) => {
            if (!e.target.classList.contains("hex")) {
                bgHex.value = colors[i];
                updateContrastChecker();
            }
        });

        box.appendChild(lockDot);
        box.appendChild(hex);
        palette.appendChild(box);
    }
}

generateBtn.addEventListener("click", generatePalette);
checkAllBtn.addEventListener("click", checkPaletteAccessibility);

fgColor.addEventListener("input", () => {
    fgHex.value = fgColor.value.toUpperCase();
    updateContrastChecker();
});

bgColor.addEventListener("input", () => {
    bgHex.value = bgColor.value.toUpperCase();
    updateContrastChecker();
});

fgHex.addEventListener("input", () => {
    const hex = fgHex.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        fgColor.value = hex;
        updateContrastChecker();
    }
});

bgHex.addEventListener("input", () => {
    const hex = bgHex.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        bgColor.value = hex;
        updateContrastChecker();
    }
});

checkContrastBtn.addEventListener("click", updateContrastChecker);

generatePalette();
updateContrastChecker();

document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        e.preventDefault();
        generatePalette();
    }
    if (e.key === "c" && e.ctrlKey) {
        e.preventDefault();
        checkPaletteAccessibility();
    }
});

const instructions = [
    "Spacebar: Generate new palette",
    "Ctrl+C: Check accessibility",
    "Click color: Set as background",
    "Double-click: Lock/unlock color"
];

console.log("🎨 Color Palette Generator with WCAG Accessibility");
console.log("Keyboard shortcuts:");
instructions.forEach(instruction => console.log(`  ${instruction}`));