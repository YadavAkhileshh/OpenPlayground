import { randomInt, randomRange, generateRandomId } from './math-utils.js';
import { CONSTANTS } from './constants.js';

/**
 * Procedural Generator
 * Creates complex, DOM-based visuals for the fractal cells.
 * Uses string concatenation for performance instead of document.createElement where possible for inner content.
 */

// Expanded Logic: distinct styles for "sectors" of the infinite universe
const THEMES = [
    'CYBER_GRID',
    'BIO_LAB',
    'ARCHIVE',
    'VOID'
];

export class ProceduralGenerator {
    constructor() {
        this.cache = new Map();
        this.currentTheme = 'CYBER_GRID';
    }

    setTheme(index) {
        this.currentTheme = THEMES[index % THEMES.length];
    }

    generateContent(level, cellIndex) {
        const wrapper = document.createElement('div');
        wrapper.className = 'generated-content';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'hidden';

        // Randomly choose a generator based on coordinates
        // We want determinism based on level+index ideally, but persistent random is okay for now.
        const seed = (level * 9) + cellIndex;
        const type = randomInt(0, 5); // 0-5 types

        let innerHTML = '';

        switch (type) {
            case 0:
                innerHTML = this.genDataStream(seed);
                break;
            case 1:
                innerHTML = this.genGeometricOverlay(seed);
                break;
            case 2:
                innerHTML = this.genRadarScan(seed);
                break;
            case 3:
                innerHTML = this.genTextBlock(seed, level);
                break;
            case 4:
                innerHTML = this.genCircuitPath(seed);
                break;
            default:
                innerHTML = this.genMinimalGrid(seed);
        }

        wrapper.innerHTML = innerHTML;
        return wrapper;
    }

    genDataStream(seed) {
        const lines = randomInt(5, 12);
        let html = `<div class="gen-data-stream" style="padding: 10px; font-family: monospace; opacity: 0.7;">`;
        for (let i = 0; i < lines; i++) {
            const width = randomInt(20, 100);
            const color = Math.random() > 0.8 ? 'var(--accent-secondary)' : 'var(--text-dim)';
            html += `<div style="
                height: 2px; 
                width: ${width}%; 
                background: ${color}; 
                margin-bottom: 4px;
                box-shadow: 0 0 2px ${color};
            "></div>`;
        }
        html += `<div style="margin-top: 5px; font-size: 8px;">ID: ${generateRandomId()}</div>`;
        html += `</div>`;
        return html;
    }

    genGeometricOverlay(seed) {
        const shapeType = randomInt(0, 2);
        const color = 'rgba(0, 240, 255, 0.1)';
        const border = '1px solid var(--accent-color)';

        if (shapeType === 0) {
            // Concentric circles
            return `
                <div class="gen-geo-circle" style="
                    position: absolute; top: 50%; left: 50%; width: 60%; height: 60%;
                    transform: translate(-50%, -50%);
                    border: ${border}; border-radius: 50%;
                    background: ${color};
                    display: flex; align-items: center; justify-content: center;
                ">
                    <div style="width: 60%; height: 60%; border: 1px dashed var(--text-dim); border-radius: 50%;"></div>
                </div>
            `;
        } else {
            // Rotated squares
            return `
                <div class="gen-geo-square" style="
                    position: absolute; top: 50%; left: 50%; width: 50%; height: 50%;
                    transform: translate(-50%, -50%) rotate(45deg);
                    border: ${border}; 
                    background: linear-gradient(45deg, transparent 40%, ${color} 40%, ${color} 60%, transparent 60%);
                "></div>
            `;
        }
    }

    genRadarScan(seed) {
        return `
            <div class="gen-radar" style="
                position: absolute; inset: 10px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 50%;
                overflow: hidden;
            ">
                <div style="
                    position: absolute; top: 50%; left: 50%; width: 50%; height: 2px;
                    background: var(--accent-color);
                    transform-origin: 0 0;
                    animation: radar-spin 4s infinite linear;
                    box-shadow: 0 0 10px var(--accent-color);
                "></div>
            </div>
        `;
    }

    genTextBlock(seed, level) {
        // Futuristic gibberish
        const words = ['SECTOR', 'NODE', 'LINK', 'PROXY', 'HASH', 'NULL', 'VOID', 'ROOT', 'KERNEL'];
        let text = '';
        for (let i = 0; i < 4; i++) {
            text += words[randomInt(0, words.length - 1)] + '-' + randomInt(10, 99) + ' ';
            if (i === 1) text += '<br>';
        }

        return `
            <div class="gen-text" style="
                position: absolute; bottom: 10px; left: 10px;
                font-size: 9px; line-height: 1.4;
                color: var(--accent-color);
                border-left: 2px solid var(--accent-color);
                padding-left: 5px;
            ">
                LEVEL_INDX: ${level}<br>
                ${text}
            </div>
        `;
    }

    genCircuitPath(seed) {
        // SVG circuit-like path
        const points = [];
        for (let i = 0; i < 5; i++) {
            points.push(`${randomInt(0, 100)},${randomInt(0, 100)}`);
        }

        return `
            <svg width="100%" height="100%" style="position: absolute; opacity: 0.3;">
                <polyline points="${points.join(' ')}" 
                    fill="none" stroke="var(--accent-secondary)" stroke-width="2" vector-effect="non-scaling-stroke" />
                <circle cx="${points[0].split(',')[0]}%" cy="${points[0].split(',')[1]}%" r="3" fill="var(--accent-secondary)" />
            </svg>
        `;
    }

    genMinimalGrid(seed) {
        return `
            <div style="
                width: 100%; height: 100%;
                background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 20px 20px;
            "></div>
        `;
    }
}

export const Generator = new ProceduralGenerator();
