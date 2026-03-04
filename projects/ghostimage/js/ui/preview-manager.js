import { ImageProcessor } from '../core/image-processor.js';

/**
 * PreviewManager
 * 
 * Controls the display of images on the UI canvases.
 */
export class PreviewManager {

    /**
     * Updates a specific preview canvas with an image.
     * @param {string} containerId - ID of preview container (to show/hide).
     * @param {string} canvasId - ID of canvas element.
     * @param {string} metaId - ID of metadata text element.
     * @param {HTMLImageElement|ImageData} source - Image source.
     * @param {File} file - Original file object (optional, for name/size).
     */
    updatePreview(containerId, canvasId, metaId, source, file = null) {
        const container = document.getElementById(containerId);
        const canvas = document.getElementById(canvasId);
        const meta = document.getElementById(metaId);

        if (!container || !canvas) return;

        // Show container
        container.classList.remove('hidden');

        // Draw content
        if (source instanceof HTMLImageElement) {
            ImageProcessor.videoImageToCanvas(canvas, source);
            if (meta && file) {
                meta.textContent = \`\${file.name} (\${source.width}x\${source.height})\`;
            }
        } else if (source instanceof ImageData) {
            canvas.width = source.width;
            canvas.height = source.height;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(source, 0, 0);
            
            if (meta) {
                 meta.textContent = \`Decoded Image (\${source.width}x\${source.height})\`;
            }
        }
    }

    /**
     * Hides a preview.
     * @param {string} containerId 
     * @param {string} inputId - Optional: clear underlying input
     */
    clearPreview(containerId, inputId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.classList.add('hidden');
        }

        if (inputId) {
            const input = document.getElementById(inputId);
            if (input) input.value = '';
        }
    }
}
