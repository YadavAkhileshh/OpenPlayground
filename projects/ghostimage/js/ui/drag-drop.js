/**
 * DragDropHandler
 * 
 * Manages drag-and-drop zones and file inputs.
 */
export class DragDropHandler {

    constructor() {
        // Track listeners to allow clearing later if needed
        this.listeners = [];
    }

    /**
     * Initializes a dropzone.
     * @param {string} dropzoneId - ID of the dropzone element.
     * @param {string} inputId - ID of the hidden file input.
     * @param {Function} onFileSelect - Callback when file is chosen (returns File).
     */
    init(dropzoneId, inputId, onFileSelect) {
        const dropzone = document.getElementById(dropzoneId);
        const input = document.getElementById(inputId);
        const button = dropzone.querySelector('button');

        if (!dropzone || !input) return;

        // 1. Click to browse
        if (button) {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling if needed
                input.click();
            });
        }

        // Also allow clicking the whole zone if it's empty
        dropzone.addEventListener('click', () => {
            if (dropzone.querySelector('.preview-container.hidden')) {
                input.click();
            }
        });

        // 2. Input Change
        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                onFileSelect(e.target.files[0]);
                input.value = ''; // Reset so same file can be selected again
            }
        });

        // 3. Drag Events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // Highlight effect
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('drag-over');
            }, false);
        });

        // Drop Action
        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files && files[0]) {
                onFileSelect(files[0]);
            }
        }, false);
    }
}
