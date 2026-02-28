/**
 * QuadCompress UI Controls
 * 
 * Manages the sliders, buttons, and file inputs.
 * Dispatches events when parameters change.
 * 
 * @module Controls
 */

import { Logger } from '../utils/logger.js';

export class Controls {
    constructor(animator, imageLoader) {
        this.animator = animator;
        this.imageLoader = imageLoader;

        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.fileInput = document.getElementById('file-input');
        this.dropZone = document.getElementById('drop-zone');

        this.sliderThreshold = document.getElementById('threshold-slider');
        this.textThreshold = document.getElementById('threshold-value');

        this.sliderDepth = document.getElementById('depth-limit');
        this.textDepth = document.getElementById('depth-value');

        this.checkBoundaries = document.getElementById('show-boundaries');
        this.checkAnimate = document.getElementById('animate-process'); // currently unused logic-wise but good for future

        this.btnReset = document.getElementById('btn-reset');
        this.btnExport = document.getElementById('btn-export');
    }

    bindEvents() {
        // File Input
        this.fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));

        // Drag & Drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-active');
        });
        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-active');
        });
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-active');
            if (e.dataTransfer.files.length) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });

        // Sliders
        this.sliderThreshold.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.textThreshold.textContent = val;
            this.animator.setThreshold(val);
        });

        this.sliderDepth.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.textDepth.textContent = val;
            this.animator.setMaxDepth(val);
        });

        // Toggles
        this.checkBoundaries.addEventListener('change', (e) => {
            this.animator.renderer.setBoundaries(e.target.checked);
            // Force redraw if stopped
            if (!this.animator.isRunning) {
                this.animator.renderer.draw(this.animator.tree.getRenderableNodes());
            }
        });

        // Buttons
        this.btnReset.addEventListener('click', () => {
            // Reload current image effectively
            if (this.imageLoader.imageData) {
                this.animator.start(
                    this.imageLoader.imageData,
                    this.imageLoader.width,
                    this.imageLoader.height
                );
            }
        });

        this.btnExport.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'quad_compress_output.png';
            link.href = this.animator.renderer.canvas.toDataURL();
            link.click();
        });
    }

    async handleFile(file) {
        if (!file) return;

        try {
            Logger.info('Controls', `Loading file: ${file.name}`);
            const data = await this.imageLoader.loadFromFile(file);

            // Notify other systems
            // We dispatch a custom event or just call directly since we have refs
            this.animator.start(data.imageData, data.width, data.height);
            // Update stats logic
            // ...
        } catch (err) {
            Logger.error('Controls', err.message);
            alert('Error loading image. See console.');
        }
    }
}
