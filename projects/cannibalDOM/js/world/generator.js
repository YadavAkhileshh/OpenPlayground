/* js/world/generator.js */
import { Blueprints, getRandomBlueprint } from './blueprints.js';
import { getRandomTheme } from './theme.js';

export class WorldGenerator {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.edibles = []; // Array of { element, rect }
        this.theme = getRandomTheme();
        this.shapes = ['0px', '50%', '10px'];
    }

    async generate(count) {
        this.container.innerHTML = ''; // Clear previous
        this.edibles = [];
        this.theme = getRandomTheme(); // Pick new theme on generate

        // Apply theme to world background?
        this.container.style.backgroundColor = this.theme.background;

        for (let i = 0; i < count; i++) {
            this.createComplexStructure(i);
        }

        // Wait for layout to settle
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                this.cacheRects();
                resolve();
            });
        });
    }

    createComplexStructure(index) {
        // Pick a random blueprint
        const blueprint = getRandomBlueprint();
        if (!blueprint) return; // Safety

        const structure = this.buildFromBlueprint(blueprint);

        // Random position
        // We want a large world.
        const x = Math.random() * 3000;
        const y = Math.random() * 3000;

        structure.style.position = 'absolute';
        structure.style.left = `${x}px`;
        structure.style.top = `${y}px`;

        this.container.appendChild(structure);
    }

    buildFromBlueprint(nodeDef) {
        const el = document.createElement(nodeDef.type || 'div');

        if (nodeDef.className) el.className = nodeDef.className;
        if (nodeDef.text) el.innerText = nodeDef.text;

        if (nodeDef.styles) {
            Object.assign(el.style, nodeDef.styles);
        }

        if (nodeDef.children) {
            nodeDef.children.forEach(childDef => {
                const child = this.buildFromBlueprint(childDef);
                el.appendChild(child);
            });
        }

        return el;
    }

    getRandomColor() {
        const palette = [this.theme.primary, this.theme.secondary, this.theme.text, '#ffffff'];
        return palette[Math.floor(Math.random() * palette.length)];
    }

    // Cache rects for performance
    cacheRects() {
        this.edibles = [];
        // Walk through all elements in the world container
        // We only care about leaf nodes or visible nodes?
        // Let's grab EVERYTHING that has a background color or border.

        const allElements = this.container.querySelectorAll('*');

        allElements.forEach(el => {
            // Filter out non-visual elements if any
            if (el.tagName === 'BR' || el.tagName === 'SCRIPT') return;

            // Check if it has visual presence? (optimization)
            const style = window.getComputedStyle(el);
            if (style.backgroundColor === 'rgba(0, 0, 0, 0)' && style.borderWidth === '0px') {
                // Ignore invisible containers? 
                // Mostly yes, unless they have text.
                // Text nodes are handled by parent.
                return;
            }

            const rect = el.getBoundingClientRect();

            // Add to edibles if it has size
            if (rect.width > 0 && rect.height > 0) {
                this.edibles.push({
                    element: el,
                    rect: {
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX,
                        bottom: rect.bottom + window.scrollY,
                        right: rect.right + window.scrollX,
                        width: rect.width,
                        height: rect.height
                    }
                });
            }
        });

        console.log(`World generated with ${this.edibles.length} edibles.`);
    }

    getEdibles() {
        return this.edibles;
    }

    remove(edibleObj) {
        if (edibleObj.element && edibleObj.element.parentNode) {
            edibleObj.element.parentNode.removeChild(edibleObj.element);
        }
        const index = this.edibles.indexOf(edibleObj);
        if (index > -1) {
            this.edibles.splice(index, 1);
        }
    }
}
