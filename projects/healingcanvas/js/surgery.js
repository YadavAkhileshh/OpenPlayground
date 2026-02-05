/**
 * Surgery Management Module - Version 2.0 (Expanded)
 * Handles the traumatic splitting of DOM elements with biological simulation.
 * 
 * DESIGN PRINCIPLES:
 * 1. Trauma must be persistent until healing is complete.
 * 2. The Document Object Model (DOM) is treated as a cellular structure.
 * 3. Incisions are recorded and archived to simulate memory.
 */

class Surgery {
    /**
     * Initializes the Surgical System.
     * Sets up listeners for wound events and manages the active wound stack.
     */
    constructor() {
        /** @type {Array} stack of active wound data objects */
        this.activeWounds = [];

        /** @type {Number} count of total incisions made in this session */
        this.totalIncisions = 0;

        this.init();
    }

    /**
     * Attaches global event listeners for surgical triggers.
     */
    init() {
        window.addEventListener('wound-complete', (e) => {
            console.log("[SURGERY] Incision path received. Analyzing intersections...");
            this.performSurgery(e.detail.path);
        });

        window.addEventListener('wound-start', (e) => {
            this.handleDrawingStart(e.detail);
        });
    }

    /**
     * Primitive haptic feedback simulation.
     */
    handleDrawingStart(point) {
        document.body.classList.add('trauma-active');
        setTimeout(() => document.body.classList.remove('trauma-active'), 100);
    }

    /**
     * Core routine to identify affected DOM nodes and apply trauma.
     * 
     * @param {Array<Object>} path - Collection of {x, y, time} points
     */
    performSurgery(path) {
        const affectedElements = this.findAffectedElements(path);

        if (affectedElements.length === 0) {
            console.warn("[SURGERY] No tissue affected by this incision.");
            return;
        }

        affectedElements.forEach(el => {
            if (el.classList.contains('healing-section')) {
                this.splitElement(el, path);
            }
        });

        this.totalIncisions++;
    }

    /**
     * Analyzes the viewport to find which sections intersect the drawing path.
     * 
     * @param {Array} path 
     * @returns {Array<HTMLElement>}
     */
    findAffectedElements(path) {
        const sections = document.querySelectorAll('.healing-section');
        const affected = [];

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();

            // Optimization: Skip if path is nowhere near the section
            if (this.isPathNearSection(path, rect)) {
                for (let i = 0; i < path.length - 1; i++) {
                    if (this.lineRectIntersect(path[i], path[i + 1], rect)) {
                        affected.push(section);
                        break;
                    }
                }
            }
        });

        return affected;
    }

    /**
     * Broad-phase collision check.
     * 
     * @param {Array} path 
     * @param {DOMRect} rect 
     */
    isPathNearSection(path, rect) {
        // Find path bounding box
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        path.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });

        return !(maxX < rect.left || minX > rect.right || maxY < rect.top || minY > rect.bottom);
    }

    /**
     * Precise line-rectangle intersection.
     * Uses segment-to-edge checks for surgical accuracy.
     */
    lineRectIntersect(p1, p2, rect) {
        const left = rect.left;
        const right = rect.right;
        const top = rect.top;
        const bottom = rect.bottom;

        // Bounding box check (redundant but safe)
        if (Math.max(p1.x, p2.x) < left || Math.min(p1.x, p2.x) > right ||
            Math.max(p1.y, p2.y) < top || Math.min(p1.y, p2.y) > bottom) {
            return false;
        }

        // Segment vs Edges
        return this.lineLineIntersect(p1, p2, { x: left, y: top }, { x: right, y: top }) ||
            this.lineLineIntersect(p1, p2, { x: right, y: top }, { x: right, y: bottom }) ||
            this.lineLineIntersect(p1, p2, { x: right, y: bottom }, { x: left, y: bottom }) ||
            this.lineLineIntersect(p1, p2, { x: left, y: bottom }, { x: left, y: top });
    }

    /**
     * Mathematical line intersection algorithm.
     */
    lineLineIntersect(a1, a2, b1, b2) {
        const denom = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
        if (denom === 0) return false;

        const ua = ((b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x)) / denom;
        const ub = ((a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x)) / denom;

        return (ua >= 0 && ua <= 1) && (ub >= 0 && ub <= 1);
    }

    /**
     * Splitting Routine.
     * Clones the target element and applies inverse clip-paths to simulate a cut.
     */
    splitElement(el, path) {
        // Prevent recursive trauma on already wounded sections
        if (el.classList.contains('wounded')) return;

        const rect = el.getBoundingClientRect();
        const originalParent = el.parentElement;

        this.logIncision(el);

        // Transition original to hidden state
        el.classList.add('wounded');
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';

        // Synthesis of fragments
        const fragA = this.createFragment(el, rect, path, 'A');
        const fragB = this.createFragment(el, rect, path, 'B');

        // The Wound Group acts as the temporary host for fragments
        const woundGroup = document.createElement('div');
        woundGroup.className = 'wound-group separation-gap';
        woundGroup.style.position = 'relative';
        woundGroup.style.height = `${rect.height}px`;
        woundGroup.style.width = `${rect.width}px`;
        woundGroup.style.margin = getComputedStyle(el).margin;

        woundGroup.appendChild(fragA);
        woundGroup.appendChild(fragB);

        originalParent.insertBefore(woundGroup, el);

        const woundData = {
            id: `wound-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            group: woundGroup,
            original: el,
            frags: [fragA, fragB],
            startTime: Date.now()
        };

        this.activeWounds.push(woundData);

        // Execute physical separation
        requestAnimationFrame(() => this.separate(fragA, fragB));

        // Dispatch to Recovery System
        window.dispatchEvent(new CustomEvent('surgery-done', { detail: woundData }));
    }

    /**
     * Records the incision in the persistent log.
     */
    logIncision(el) {
        const history = document.getElementById('incision-history');
        if (!history) return;

        const emptyMsg = history.querySelector('.empty');
        if (emptyMsg) emptyMsg.remove();

        const li = document.createElement('li');
        li.className = 'history-item';
        const area = el.dataset.id || 'Unknown Tissue';
        li.textContent = `[${new Date().toLocaleTimeString()}] Critical breach in ${area.toUpperCase()}`;

        history.prepend(li);
        if (history.children.length > 5) {
            history.lastElementChild.remove();
        }
    }

    /**
     * Fragment Factory.
     * Uses CSS clip-paths to isolate sections of the element.
     */
    createFragment(el, rect, path, side) {
        const frag = el.cloneNode(true);
        frag.classList.remove('wounded');
        frag.classList.add('flesh-fragment');
        frag.style.opacity = '1';
        frag.style.position = 'absolute';
        frag.style.top = '0';
        frag.style.left = '0';
        frag.style.width = '100%';
        frag.style.height = '100%';
        frag.style.margin = '0';
        frag.id = ''; // Remove duplicate IDs to maintain DOM sanity

        // Calculate organic vertices for the clip-path
        const clip = this.calculateOrganicClip(rect, path, side);
        frag.style.clipPath = clip;

        return frag;
    }

    /**
     * Generates a complex polygon for the clip-path.
     * Over time, we can make this more detailed to follow the cursor exactly.
     */
    calculateOrganicClip(rect, path, side) {
        // Simplified organic cut for MVP stability
        // Produces a "serrated" edge feel
        const midY = 50;
        const jitter = 2;

        if (side === 'A') {
            return `polygon(
                0% 0%, 100% 0%, 
                100% ${midY - jitter}%, 
                75% ${midY + jitter}%, 
                50% ${midY - jitter}%, 
                25% ${midY + jitter}%, 
                0% ${midY - jitter}%
            )`;
        } else {
            return `polygon(
                0% ${midY - jitter}%, 
                25% ${midY + jitter}%, 
                50% ${midY - jitter}%, 
                75% ${midY + jitter}%, 
                100% ${midY - jitter}%, 
                100% 100%, 0% 100%
            )`;
        }
    }

    /**
     * Applies physical transformation to fragments.
     */
    separate(a, b) {
        const offset = CONFIG.SURGERY.SPLIT_OFFSET;
        a.style.transform = `translateY(-${offset}px) rotate(${(Math.random() - 0.5) * 2}deg)`;
        b.style.transform = `translateY(${offset}px) rotate(${(Math.random() - 0.5) * 2}deg)`;

        // Spawn biological debris
        this.addBleed(a, 'bottom');
        this.addBleed(b, 'top');
    }

    /**
     * Particle effect for wound edges.
     */
    addBleed(frag, edge) {
        const dripCount = 8;
        for (let i = 0; i < dripCount; i++) {
            const drip = document.createElement('div');
            drip.className = 'drip';
            drip.style.left = `${Math.random() * 100}%`;
            drip.style.top = edge === 'top' ? '0' : 'auto';
            drip.style.bottom = edge === 'bottom' ? '0' : 'auto';
            drip.style.animationDelay = `${Math.random() * 2}s`;
            drip.style.height = `${10 + Math.random() * 20}px`;
            frag.appendChild(drip);
        }
    }
}

// Global exposure
window.SurgerySystem = new Surgery();

/**
 * ARCHITECTURAL NOTES - SURGERY SYSTEM
 * ------------------------------------
 * The Surgery system is designed to handle the complex problem of splitting 
 * interactive DOM elements. Traditional canvas-based solutions lose accessibility 
 * and searchability. By cloning the DOM nodes, we maintain the "flesh" of the 
 * website while allowing it to be visually torn apart.
 * 
 * Future iterations may include:
 * - Multi-layer cutting (Z-index traversal)
 * - Material-aware cutting (different effects for text vs images)
 * - Fluid vertex deformation using SVG filters
 */
