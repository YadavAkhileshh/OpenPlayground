// Color Palette Generator JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const baseColorInput = document.getElementById('base-color');
    const schemeSelect = document.getElementById('scheme');
    const generateRandomBtn = document.getElementById('generate-random');
    const paletteDiv = document.getElementById('palette');
    const exportBtn = document.getElementById('export');

    let lockedColors = new Set();

    // Generate initial palette
    generatePalette();

    // Event listeners
    baseColorInput.addEventListener('input', generatePalette);
    schemeSelect.addEventListener('change', generatePalette);
    generateRandomBtn.addEventListener('click', generateRandomPalette);
    exportBtn.addEventListener('click', exportPalette);

    function generatePalette() {
        const baseColor = baseColorInput.value;
        const scheme = schemeSelect.value;
        const colors = getPaletteColors(baseColor, scheme);
        displayPalette(colors);
    }

    function generateRandomPalette() {
        const randomColor = getRandomColor();
        baseColorInput.value = randomColor;
        generatePalette();
    }

    function getPaletteColors(baseHex, scheme) {
        const baseHsl = hexToHsl(baseHex);
        let colors = [];

        switch (scheme) {
            case 'complementary':
                colors = [
                    baseHsl,
                    { h: (baseHsl.h + 180) % 360, s: baseHsl.s, l: baseHsl.l }
                ];
                break;
            case 'analogous':
                colors = [
                    { h: (baseHsl.h - 30 + 360) % 360, s: baseHsl.s, l: baseHsl.l },
                    baseHsl,
                    { h: (baseHsl.h + 30) % 360, s: baseHsl.s, l: baseHsl.l }
                ];
                break;
            case 'monochromatic':
                colors = [
                    { h: baseHsl.h, s: baseHsl.s, l: Math.max(baseHsl.l - 20, 10) },
                    baseHsl,
                    { h: baseHsl.h, s: baseHsl.s, l: Math.min(baseHsl.l + 20, 90) }
                ];
                break;
        }

        return colors.map(hsl => hslToHex(hsl.h, hsl.s, hsl.l));
    }

    function displayPalette(colors) {
        paletteDiv.innerHTML = '';
        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.style.backgroundColor = color;
            swatch.textContent = color.toUpperCase();
            if (lockedColors.has(index)) {
                swatch.classList.add('locked');
            }
            swatch.addEventListener('click', () => toggleLock(index));
            paletteDiv.appendChild(swatch);
        });
    }

    function toggleLock(index) {
        if (lockedColors.has(index)) {
            lockedColors.delete(index);
        } else {
            lockedColors.add(index);
        }
        generatePalette();
    }

    function exportPalette() {
        const swatches = paletteDiv.querySelectorAll('.swatch');
        const hexCodes = Array.from(swatches).map(swatch => swatch.textContent).join(', ');
        navigator.clipboard.writeText(hexCodes).then(() => {
            alert('Hex codes copied to clipboard!');
        });
    }

    function getRandomColor() {
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 50) + 50; // 50-100
        const l = Math.floor(Math.random() * 50) + 25; // 25-75
        return hslToHex(h, s, l);
    }

    // Utility functions
    function hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    function hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        const toHex = c => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
});
