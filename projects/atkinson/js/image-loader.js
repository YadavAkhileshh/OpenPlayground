/**
 * Image Loader Module
 * 
 * Handles loading images from:
 * 1. File Input (upload)
 * 2. Drag and Drop events
 * 
 * Returns an HTMLImageElement ready for canvas drawing.
 */

export class ImageLoader {
    constructor() {
        this.imageElement = new Image();
        this.imageElement.crossOrigin = "Anonymous"; // Enable CORS if needed for some inputs

        // Listeners
        this.onImageReady = null;
        this.onError = null;
    }

    /**
     * Loads an image from a File object.
     * @param {File} file - The file to load.
     */
    loadFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            if (this.onError) this.onError(new Error('Invalid file type. Please upload an image.'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            this.imageElement.src = e.target.result;
        };

        reader.onerror = (err) => {
            if (this.onError) this.onError(err);
        };

        // Hook up image load event
        this.imageElement.onload = () => {
            if (this.onImageReady) this.onImageReady(this.imageElement);
        };

        this.imageElement.onerror = () => {
            if (this.onError) this.onError(new Error('Failed to load image.'));
        };

        reader.readAsDataURL(file);
    }

    /**
     * Sets up drag and drop listeners on a target element.
     * @param {HTMLElement} dropZone - The element to accept drops.
     */
    setupDragDrop(dropZone) {
        if (!dropZone) return;

        // Prevent default behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('highlight'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('highlight'), false);
        });

        // Handle drop
        dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            this.loadFile(files[0]);
        }
    }
}
