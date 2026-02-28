// Accessibility Color Lab
class AccessibilityColorLab {
    constructor() {
        this.currentColors = {
            foreground: '#2D3047',
            background: '#F6F5F3'
        };
        
        this.currentFilter = 'normal';
        this.colorBlindnessFilters = {
            normal: { filter: 'none', prevalence: 'Normal vision' },
            protanopia: { filter: 'protanopia', prevalence: '1% of men' },
            deuteranopia: { filter: 'deuteranopia', prevalence: '1% of men' },
            tritanopia: { filter: 'tritanopia', prevalence: '0.01% of population' },
            achromatopsia: { filter: 'achromatopsia', prevalence: '0.00003% of population' }
        };
        
        this.initialize();
        this.updateWCAGCompliance();
        this.generateColorBlindnessPreviews();
        this.generatePalette();
        this.setupSVGFilters();
    }

    initialize() {
        // DOM Elements
        this.elements = {
            foregroundColor: document.getElementById('foregroundColor'),
            foregroundHex: document.getElementById('foregroundHex'),
            foregroundR: document.getElementById('foregroundR'),
            foregroundG: document.getElementById('foregroundG'),
            foregroundB: document.getElementById('foregroundB'),
            foregroundRValue: document.getElementById('foregroundRValue'),
            foregroundGValue: document.getElementById('foregroundGValue'),
            foregroundBValue: document.getElementById('foregroundBValue'),
            
            backgroundColor: document.getElementById('backgroundColor'),
            backgroundHex: document.getElementById('backgroundHex'),
            backgroundR: document.getElementById('backgroundR'),
            backgroundG: document.getElementById('backgroundG'),
            backgroundB: document.getElementById('backgroundB'),
            backgroundRValue: document.getElementById('backgroundRValue'),
            backgroundGValue: document.getElementById('backgroundGValue'),
            backgroundBValue: document.getElementById('backgroundBValue'),
            
            swapColors: document.getElementById('swapColors'),
            fontSize: document.getElementById('fontSize'),
            fontWeight: document.getElementById('fontWeight'),
            previewBox: document.getElementById('previewBox'),
            
            contrastValue: document.getElementById('contrastValue'),
            meterFill: document.getElementById('meterFill'),
            
            ratioAA: document.getElementById('ratioAA'),
            ratioAAA: document.getElementById('ratioAAA'),
            ratioLarge: document.getElementById('ratioLarge'),
            ratioUI: document.getElementById('ratioUI'),
            
            wcagAA: document.getElementById('wcagAA'),
            wcagAAA: document.getElementById('wcagAAA'),
            wcagLarge: document.getElementById('wcagLarge'),
            wcagUI: document.getElementById('wcagUI'),
            
            filterButtons: document.querySelectorAll('.filter-btn'),
            prevalenceText: document.getElementById('prevalenceText'),
            
            baseColorInput: document.getElementById('baseColorInput'),
            baseColorHex: document.getElementById('baseColorHex'),
            generatePalette: document.getElementById('generatePalette'),
            paletteType: document.getElementById('paletteType'),
            paletteDisplay: document.getElementById('paletteDisplay'),
            exportPalette: document.getElementById('exportPalette'),
            copyPalette: document.getElementById('copyPalette'),
            testAllCombinations: document.getElementById('testAllCombinations'),
            
            websiteUrl: document.getElementById('websiteUrl'),
            scanWebsite: document.getElementById('scanWebsite'),
            criticalCount: document.getElementById('criticalCount'),
            warningCount: document.getElementById('warningCount'),
            goodCount: document.getElementById('goodCount'),
            issuesList: document.getElementById('issuesList'),
            recommendationList: document.getElementById('recommendationList'),
            
            tutorialModal: document.getElementById('tutorialModal'),
            closeTutorial: document.getElementById('closeTutorial'),
            showTutorial: document.getElementById('showTutorial'),
            startTutorial: document.getElementById('startTutorial'),
            
            notificationToast: document.getElementById('notificationToast'),
            toastMessage: document.getElementById('toastMessage')
        };

        // Event Listeners
        this.setupEventListeners();
        
        // Initialize preview with current colors
        this.updatePreview();
    }

    setupEventListeners() {
        // Foreground color controls
        this.elements.foregroundColor.addEventListener('input', (e) => {
            this.updateColorFromPicker('foreground', e.target.value);
        });
        
        this.elements.foregroundHex.addEventListener('change', (e) => {
            this.updateColorFromHex('foreground', e.target.value);
        });
        
        ['R', 'G', 'B'].forEach(channel => {
            this.elements[`foreground${channel}`].addEventListener('input', (e) => {
                this.updateColorFromRGB('foreground', channel.toLowerCase(), parseInt(e.target.value));
            });
        });

        // Background color controls
        this.elements.backgroundColor.addEventListener('input', (e) => {
            this.updateColorFromPicker('background', e.target.value);
        });
        
        this.elements.backgroundHex.addEventListener('change', (e) => {
            this.updateColorFromHex('background', e.target.value);
        });
        
        ['R', 'G', 'B'].forEach(channel => {
            this.elements[`background${channel}`].addEventListener('input', (e) => {
                this.updateColorFromRGB('background', channel.toLowerCase(), parseInt(e.target.value));
            });
        });

        // Swap colors
        this.elements.swapColors.addEventListener('click', () => {
            this.swapColors();
        });

        // Font controls
        this.elements.fontSize.addEventListener('change', () => {
            this.updatePreview();
        });
        
        this.elements.fontWeight.addEventListener('change', () => {
            this.updatePreview();
        });

        // Color blindness filters
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.applyColorBlindnessFilter(filter);
            });
        });

        // Palette generator
        this.elements.baseColorInput.addEventListener('input', (e) => {
            this.elements.baseColorHex.value = e.target.value;
            this.generatePalette();
        });
        
        this.elements.baseColorHex.addEventListener('change', (e) => {
            this.elements.baseColorInput.value = e.target.value;
            this.generatePalette();
        });
        
        this.elements.generatePalette.addEventListener('click', () => {
            this.generatePalette();
        });
        
        this.elements.paletteType.addEventListener('change', () => {
            this.generatePalette();
        });
        
        this.elements.exportPalette.addEventListener('click', () => {
            this.exportPalette();
        });
        
        this.elements.copyPalette.addEventListener('click', () => {
            this.copyPaletteToClipboard();
        });
        
        this.elements.testAllCombinations.addEventListener('click', () => {
            this.testAllPaletteCombinations();
        });

        // Website scanner
        this.elements.scanWebsite.addEventListener('click', () => {
            this.scanWebsite();
        });

        // Tutorial modal
        this.elements.closeTutorial.addEventListener('click', () => {
            this.hideModal();
        });
        
        this.elements.showTutorial.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal();
        });
        
        this.elements.startTutorial.addEventListener('click', () => {
            this.startInteractiveTutorial();
        });

        // Close modal when clicking outside
        this.elements.tutorialModal.addEventListener('click', (e) => {
            if (e.target === this.elements.tutorialModal) {
                this.hideModal();
            }
        });
    }

    setupSVGFilters() {
        // Create SVG filters for color blindness simulation
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        
        // Protanopia filter
        const protanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        protanopia.id = 'protanopia';
        
        const feColorMatrixProtanopia = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrixProtanopia.setAttribute('type', 'matrix');
        feColorMatrixProtanopia.setAttribute('values', '0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0');
        
        protanopia.appendChild(feColorMatrixProtanopia);
        svg.appendChild(protanopia);
        
        // Deuteranopia filter
        const deuteranopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        deuteranopia.id = 'deuteranopia';
        
        const feColorMatrixDeuteranopia = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrixDeuteranopia.setAttribute('type', 'matrix');
        feColorMatrixDeuteranopia.setAttribute('values', '0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0');
        
        deuteranopia.appendChild(feColorMatrixDeuteranopia);
        svg.appendChild(deuteranopia);
        
        // Tritanopia filter
        const tritanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        tritanopia.id = 'tritanopia';
        
        const feColorMatrixTritanopia = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrixTritanopia.setAttribute('type', 'matrix');
        feColorMatrixTritanopia.setAttribute('values', '0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0');
        
        tritanopia.appendChild(feColorMatrixTritanopia);
        svg.appendChild(tritanopia);
        
        document.body.appendChild(svg);
    }

    // Color Management Methods
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    updateColorFromPicker(type, hexValue) {
        this.currentColors[type] = hexValue;
        const rgb = this.hexToRgb(hexValue);
        
        // Update hex input
        this.elements[`${type}Hex`].value = hexValue;
        
        // Update RGB sliders
        if (rgb) {
            this.elements[`${type}R`].value = rgb.r;
            this.elements[`${type}G`].value = rgb.g;
            this.elements[`${type}B`].value = rgb.b;
            
            this.elements[`${type}RValue`].textContent = rgb.r;
            this.elements[`${type}GValue`].textContent = rgb.g;
            this.elements[`${type}BValue`].textContent = rgb.b;
        }
        
        this.updatePreview();
        this.updateWCAGCompliance();
        this.generateColorBlindnessPreviews();
    }

    updateColorFromHex(type, hexValue) {
        if (!/^#[0-9A-F]{6}$/i.test(hexValue)) {
            hexValue = '#000000';
        }
        
        this.elements[`${type}Color`].value = hexValue;
        this.updateColorFromPicker(type, hexValue);
    }

    updateColorFromRGB(type, channel, value) {
        const currentRgb = this.hexToRgb(this.currentColors[type]);
        if (!currentRgb) return;
        
        currentRgb[channel] = value;
        const newHex = this.rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);
        
        this.currentColors[type] = newHex;
        this.elements[`${type}Color`].value = newHex;
        this.elements[`${type}Hex`].value = newHex;
        this.elements[`${type}${channel.toUpperCase()}Value`].textContent = value;
        
        this.updatePreview();
        this.updateWCAGCompliance();
        this.generateColorBlindnessPreviews();
    }

    swapColors() {
        const temp = this.currentColors.foreground;
        this.currentColors.foreground = this.currentColors.background;
        this.currentColors.background = temp;
        
        // Update all controls
        this.updateColorFromPicker('foreground', this.currentColors.foreground);
        this.updateColorFromPicker('background', this.currentColors.background);
    }

    // Color Contrast Calculation
    calculateLuminance(r, g, b) {
        const sRGB = [r, g, b].map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    }

    calculateContrastRatio(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return 1;
        
        const l1 = this.calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
        const l2 = this.calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    updateWCAGCompliance() {
        const ratio = this.calculateContrastRatio(
            this.currentColors.foreground,
            this.currentColors.background
        );
        
        // Update contrast value
        this.elements.contrastValue.textContent = ratio.toFixed(2) + ':1';
        
        // Update meter
        const percentage = Math.min((ratio / 21) * 100, 100);
        this.elements.meterFill.style.width = `${percentage}%`;
        
        // Update ratio displays
        this.elements.ratioAA.textContent = ratio.toFixed(2) + ':1';
        this.elements.ratioAAA.textContent = ratio.toFixed(2) + ':1';
        this.elements.ratioLarge.textContent = ratio.toFixed(2) + ':1';
        this.elements.ratioUI.textContent = ratio.toFixed(2) + ':1';
        
        // Check compliance
        const isAACompliant = ratio >= 4.5;
        const isAAACompliant = ratio >= 7;
        const isLargeTextCompliant = ratio >= 3;
        const isUICompliant = ratio >= 3;
        
        // Update compliance cards
        this.updateComplianceCard('AA', isAACompliant, ratio);
        this.updateComplianceCard('AAA', isAAACompliant, ratio);
        this.updateComplianceCard('Large', isLargeTextCompliant, ratio);
        this.updateComplianceCard('UI', isUICompliant, ratio);
    }

    updateComplianceCard(type, isCompliant, ratio) {
        const card = this.elements[`wcag${type}`];
        const statusElement = card.querySelector('.compliance-status');
        const statusText = card.querySelector('.status-text');
        const icon = statusElement.querySelector('i');
        
        if (isCompliant) {
            card.classList.remove('fail');
            card.classList.add('pass');
            icon.className = 'fas fa-check-circle pass';
            statusText.textContent = 'Pass';
        } else {
            card.classList.remove('pass');
            card.classList.add('fail');
            icon.className = 'fas fa-times-circle fail';
            statusText.textContent = 'Fail';
        }
    }

    // Preview Methods
    updatePreview() {
        const previewBox = this.elements.previewBox;
        
        // Apply colors
        previewBox.style.color = this.currentColors.foreground;
        previewBox.style.backgroundColor = this.currentColors.background;
        
        // Apply font settings
        const fontSize = this.elements.fontSize.value;
        const fontWeight = this.elements.fontWeight.value;
        
        previewBox.style.fontSize = `${fontSize}px`;
        previewBox.style.fontWeight = fontWeight;
        
        // Update buttons and inputs
        const buttons = previewBox.querySelectorAll('.preview-btn');
        buttons.forEach((btn, index) => {
            if (index === 0) {
                btn.style.backgroundColor = this.currentColors.foreground;
                btn.style.color = this.currentColors.background;
            }
        });
        
        const inputs = previewBox.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.style.borderColor = this.currentColors.foreground;
            input.style.color = this.currentColors.foreground;
            input.style.backgroundColor = this.currentColors.background;
        });
    }

    // Color Blindness Methods
    applyColorBlindnessFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        this.elements.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        // Update prevalence info
        this.elements.prevalenceText.textContent = 
            this.colorBlindnessFilters[filter].prevalence;
        
        // Apply filter to preview
        this.elements.previewBox.className = 'preview-box color-blindness-filter';
        if (filter !== 'normal') {
            this.elements.previewBox.classList.add(filter);
        }
    }

    generateColorBlindnessPreviews() {
        const previews = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];
        
        previews.forEach(filter => {
            const previewElement = document.getElementById(`${filter}Preview`);
            if (previewElement) {
                // Set background color
                previewElement.style.backgroundColor = this.currentColors.background;
                
                // Set text color
                const content = previewElement.querySelector('.simulation-content');
                if (content) {
                    content.style.color = this.currentColors.foreground;
                }
                
                // Apply filter
                previewElement.className = 'simulation-preview color-blindness-filter';
                if (filter !== 'normal') {
                    previewElement.classList.add(filter);
                }
            }
        });
    }

    // Palette Generation Methods
    generatePalette() {
        const baseColor = this.elements.baseColorInput.value;
        const paletteType = this.elements.paletteType.value;
        const rgb = this.hexToRgb(baseColor);
        
        if (!rgb) return;
        
        let colors = [];
        
        switch(paletteType) {
            case 'monochromatic':
                colors = this.generateMonochromaticPalette(rgb);
                break;
            case 'analogous':
                colors = this.generateAnalogousPalette(rgb);
                break;
            case 'complementary':
                colors = this.generateComplementaryPalette(rgb);
                break;
            case 'triadic':
                colors = this.generateTriadicPalette(rgb);
                break;
            case 'tetradic':
                colors = this.generateTetradicPalette(rgb);
                break;
        }
        
        this.displayPalette(colors);
    }

    generateMonochromaticPalette(rgb) {
        const colors = [];
        
        // Generate 5 shades/tints
        for (let i = 0; i < 5; i++) {
            const factor = i / 4; // 0 to 1
            const r = Math.round(rgb.r * (1 - factor) + 255 * factor);
            const g = Math.round(rgb.g * (1 - factor) + 255 * factor);
            const b = Math.round(rgb.b * (1 - factor) + 255 * factor);
            colors.push(this.rgbToHex(r, g, b));
        }
        
        return colors;
    }

    generateAnalogousPalette(rgb) {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const colors = [];
        
        // Generate 5 colors with similar hue
        for (let i = -2; i <= 2; i++) {
            const newHue = (hsl.h + i * 30) % 360;
            const newColor = this.hslToRgb(newHue, hsl.s, hsl.l);
            colors.push(this.rgbToHex(newColor.r, newColor.g, newColor.b));
        }
        
        return colors;
    }

    generateComplementaryPalette(rgb) {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const complementaryHue = (hsl.h + 180) % 360;
        
        const colors = [
            this.rgbToHex(rgb.r, rgb.g, rgb.b),
            this.hslToHex(complementaryHue, hsl.s, hsl.l)
        ];
        
        // Add some variations
        for (let i = 1; i <= 3; i++) {
            const lightness = hsl.l * (0.2 * i + 0.6);
            colors.push(this.hslToHex(hsl.h, hsl.s, lightness));
            colors.push(this.hslToHex(complementaryHue, hsl.s, lightness));
        }
        
        return colors.slice(0, 6);
    }

    generateTriadicPalette(rgb) {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const colors = [];
        
        // Generate triadic colors
        for (let i = 0; i < 3; i++) {
            const hue = (hsl.h + i * 120) % 360;
            colors.push(this.hslToHex(hue, hsl.s, hsl.l));
        }
        
        // Add variations
        colors.forEach(color => {
            const colorRgb = this.hexToRgb(color);
            const colorHsl = this.rgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b);
            
            // Lighter version
            colors.push(this.hslToHex(colorHsl.h, colorHsl.s, Math.min(colorHsl.l + 0.2, 1)));
            
            // Darker version
            colors.push(this.hslToHex(colorHsl.h, colorHsl.s, Math.max(colorHsl.l - 0.2, 0)));
        });
        
        return colors.slice(0, 6);
    }

    generateTetradicPalette(rgb) {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const colors = [];
        
        // Generate tetradic colors (rectangle)
        const hues = [hsl.h, (hsl.h + 90) % 360, (hsl.h + 180) % 360, (hsl.h + 270) % 360];
        
        hues.forEach(hue => {
            colors.push(this.hslToHex(hue, hsl.s, hsl.l));
        });
        
        // Add some variations
        colors.push(this.hslToHex(hsl.h, Math.min(hsl.s + 0.2, 1), hsl.l));
        colors.push(this.hslToHex((hsl.h + 180) % 360, Math.min(hsl.s + 0.2, 1), hsl.l));
        
        return colors;
    }

    // HSL Conversion Methods
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100) / 100,
            l: Math.round(l * 100) / 100
        };
    }

    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    hslToHex(h, s, l) {
        const rgb = this.hslToRgb(h, s * 100, l * 100);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    displayPalette(colors) {
        this.elements.paletteDisplay.innerHTML = '';
        
        colors.forEach((color, index) => {
            const rgb = this.hexToRgb(color);
            if (!rgb) return;
            
            const card = document.createElement('div');
            card.className = 'color-card';
            card.style.backgroundColor = color;
            card.dataset.color = color;
            
            card.addEventListener('click', () => {
                this.copyToClipboard(color);
                this.showNotification(`Copied ${color} to clipboard!`);
            });
            
            const info = document.createElement('div');
            info.className = 'color-info';
            
            const hex = document.createElement('div');
            hex.className = 'color-hex';
            hex.textContent = color;
            
            const rgbText = document.createElement('div');
            rgbText.className = 'color-rgb';
            rgbText.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            
            info.appendChild(hex);
            info.appendChild(rgbText);
            card.appendChild(info);
            
            this.elements.paletteDisplay.appendChild(card);
        });
    }

    exportPalette() {
        const colors = Array.from(this.elements.paletteDisplay.querySelectorAll('.color-card'))
            .map(card => card.dataset.color);
        
        const paletteData = {
            name: 'Generated Palette',
            type: this.elements.paletteType.value,
            baseColor: this.elements.baseColorInput.value,
            colors: colors,
            generated: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(paletteData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'accessible-palette.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Palette exported as JSON!');
    }

    copyPaletteToClipboard() {
        const colors = Array.from(this.elements.paletteDisplay.querySelectorAll('.color-card'))
            .map(card => card.dataset.color);
        
        let cssVars = ':root {\n';
        colors.forEach((color, index) => {
            cssVars += `  --color-${index + 1}: ${color};\n`;
        });
        cssVars += '}';
        
        this.copyToClipboard(cssVars);
        this.showNotification('CSS variables copied to clipboard!');
    }

    testAllPaletteCombinations() {
        const colors = Array.from(this.elements.paletteDisplay.querySelectorAll('.color-card'))
            .map(card => card.dataset.color);
        
        let results = [];
        let accessiblePairs = 0;
        
        // Test all combinations
        for (let i = 0; i < colors.length; i++) {
            for (let j = 0; j < colors.length; j++) {
                if (i !== j) {
                    const ratio = this.calculateContrastRatio(colors[i], colors[j]);
                    const isAccessible = ratio >= 4.5;
                    
                    if (isAccessible) accessiblePairs++;
                    
                    results.push({
                        foreground: colors[i],
                        background: colors[j],
                        ratio: ratio.toFixed(2),
                        accessible: isAccessible
                    });
                }
            }
        }
        
        const percentage = ((accessiblePairs / results.length) * 100).toFixed(1);
        this.showNotification(`Palette accessibility: ${percentage}% of combinations pass WCAG AA`);
    }

    // Website Scanner Methods
    async scanWebsite() {
        const url = this.elements.websiteUrl.value;
        
        if (!url || !url.startsWith('http')) {
            this.showNotification('Please enter a valid URL starting with http:// or https://');
            return;
        }
        
        // Show loading state
        this.elements.scanWebsite.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
        this.elements.scanWebsite.disabled = true;
        
        // Simulate scanning (in a real implementation, this would use a backend API)
        setTimeout(() => {
            this.simulateWebsiteScan(url);
            
            // Reset button
            this.elements.scanWebsite.innerHTML = '<i class="fas fa-search"></i> Scan Website';
            this.elements.scanWebsite.disabled = false;
        }, 2000);
    }

    simulateWebsiteScan(url) {
        // Generate simulated issues for demo purposes
        const issues = this.generateSimulatedIssues();
        
        // Update counters
        const critical = issues.filter(i => i.severity === 'critical').length;
        const warning = issues.filter(i => i.severity === 'warning').length;
        const good = issues.filter(i => i.severity === 'good').length;
        
        this.elements.criticalCount.textContent = critical;
        this.elements.warningCount.textContent = warning;
        this.elements.goodCount.textContent = good;
        
        // Display issues
        this.displayIssues(issues);
        
        // Generate recommendations
        this.generateRecommendations(issues);
        
        this.showNotification(`Scan complete! Found ${critical} critical issues.`);
    }

    generateSimulatedIssues() {
        const issues = [
            {
                id: 1,
                title: 'Insufficient Color Contrast',
                description: 'Some text elements have contrast ratios below WCAG AA standards.',
                severity: 'critical',
                element: '.main-heading, .subtitle',
                suggestion: 'Increase contrast by using darker text or lighter backgrounds.'
            },
            {
                id: 2,
                title: 'Color-Only Indicators',
                description: 'Form validation uses only color to indicate errors.',
                severity: 'warning',
                element: '.error-message',
                suggestion: 'Add text labels or icons alongside color indicators.'
            },
            {
                id: 3,
                title: 'Link Color Distinction',
                description: 'Links don\'t have sufficient contrast from surrounding text.',
                severity: 'critical',
                element: 'a:not(.btn)',
                suggestion: 'Ensure link color has at least 3:1 contrast with surrounding text.'
            },
            {
                id: 4,
                title: 'Focus Indicators',
                description: 'Focus states for interactive elements are missing or unclear.',
                severity: 'warning',
                element: 'button, input, a',
                suggestion: 'Add visible focus indicators with good contrast.'
            },
            {
                id: 5,
                title: 'Color Blindness Issues',
                description: 'Some color combinations may be indistinguishable for users with color vision deficiencies.',
                severity: 'warning',
                element: '.status-indicator, .chart-colors',
                suggestion: 'Use patterns, textures, or labels in addition to color.'
            },
            {
                id: 6,
                title: 'Good Contrast on Buttons',
                description: 'Primary buttons have excellent contrast ratios.',
                severity: 'good',
                element: '.btn-primary',
                suggestion: 'Maintain these standards throughout the site.'
            }
        ];
        
        return issues;
    }

    displayIssues(issues) {
        this.elements.issuesList.innerHTML = '';
        
        issues.forEach(issue => {
            const issueElement = document.createElement('div');
            issueElement.className = `issue-item ${issue.severity}`;
            
            issueElement.innerHTML = `
                <div class="issue-header">
                    <div class="issue-title">
                        <i class="fas fa-${issue.severity === 'critical' ? 'exclamation-circle' : 
                                          issue.severity === 'warning' ? 'exclamation-triangle' : 
                                          'check-circle'}"></i>
                        <span>${issue.title}</span>
                    </div>
                    <span class="issue-severity ${issue.severity}">
                        ${issue.severity.toUpperCase()}
                    </span>
                </div>
                <div class="issue-content">
                    <p>${issue.description}</p>
                    <p><strong>Affected elements:</strong> ${issue.element}</p>
                </div>
                <div class="issue-suggestion">
                    <strong>Suggestion:</strong> ${issue.suggestion}
                </div>
            `;
            
            this.elements.issuesList.appendChild(issueElement);
        });
    }

    generateRecommendations(issues) {
        const recommendations = [
            'Use the color lab to test all your color combinations',
            'Ensure text has a minimum contrast ratio of 4.5:1',
            'Don\'t rely on color alone to convey information',
            'Test your design with color blindness filters',
            'Provide sufficient focus indicators for keyboard navigation',
            'Consider using an accessibility-focused design system'
        ];
        
        this.elements.recommendationList.innerHTML = '';
        
        recommendations.forEach(rec => {
            const recElement = document.createElement('div');
            recElement.className = 'recommendation';
            
            recElement.innerHTML = `
                <i class="fas fa-lightbulb"></i>
                <span>${rec}</span>
            `;
            
            this.elements.recommendationList.appendChild(recElement);
        });
    }

    // UI Methods
    showModal() {
        this.elements.tutorialModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.elements.tutorialModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    startInteractiveTutorial() {
        this.hideModal();
        this.showNotification('Starting interactive tutorial...');
        
        // Guide user through features
        setTimeout(() => {
            this.showNotification('Try adjusting the text color using the color picker!');
        }, 1000);
    }

    showNotification(message) {
        this.elements.toastMessage.textContent = message;
        this.elements.notificationToast.classList.add('active');
        
        setTimeout(() => {
            this.elements.notificationToast.classList.remove('active');
        }, 3000);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const colorLab = new AccessibilityColorLab();
    
    // Make available globally for debugging
    window.colorLab = colorLab;
});