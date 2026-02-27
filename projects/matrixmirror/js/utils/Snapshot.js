/**
 * @file Snapshot.js
 * @description Utilities to capture the current canvas state as an image.
 */

export class Snapshot {
    /**
     * Capture the canvas and download as PNG.
     * @param {HTMLCanvasElement} canvas - The canvas to capture.
     * @param {string} filename - Base filename.
     */
    static capture(canvas, filename = 'matrix_snapshot') {
        try {
            // Create a temporary link
            const link = document.createElement('a');

            // Get data URL
            const dataUrl = canvas.toDataURL('image/png');

            // Set download attributes
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = \`\${filename}_\${timestamp}.png\`;
            link.href = dataUrl;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Snapshot saved.');
            return true;
        } catch (error) {
            console.error('Snapshot failed:', error);
            return false;
        }
    }
}
