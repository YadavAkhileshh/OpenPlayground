/**
 * AtkinsonBW - Main Entry Point
 * 
 * Initializes all modules and wires up dependencies.
 */

import { state } from './state.js';
import { CanvasController } from './canvas-controller.js';
import { WebcamService } from './webcam-service.js';
import { ImageLoader } from './image-loader.js';
import { ImageProcessor } from './processor.js';
import { RenderLoop } from './render-loop.js';
import { UIManager } from './ui-manager.js';
import { BootSequence } from './boot-sequence.js';

// Initialize instances
const canvasController = new CanvasController('mainCanvas');
const webcamService = new WebcamService();
const imageLoader = new ImageLoader();
const processor = new ImageProcessor();
const uiManager = new UIManager();

// Setup Processor with Canvas Context
if (canvasController.getContext()) {
    processor.init(canvasController.getContext());
} else {
    uiManager.log("CRITICAL ERROR: CANVAS CONTEXT MISSING");
}

// Setup Render Loop
const renderLoop = new RenderLoop((time) => {
    const currentState = state.get();

    // Determine source
    let source = null;

    if (currentState.mode === 'webcam') {
        if (webcamService.isActive) {
            source = webcamService.getVideoElement();
        }
    } else if (currentState.mode === 'upload') {
        if (currentState.imageSource) {
            source = currentState.imageSource;
        }
    }

    // Render if source is available
    if (source) {
        processor.processFrame(source, currentState.settings);
    }
});

// --- Wire up UI Actions ---

// Mode Switching Handler
uiManager.onModeChange = async (mode, file = null) => {
    if (mode === 'webcam') {
        try {
            uiManager.log("INITIALIZING WEBCAM...");
            await webcamService.start();
            state.update({ mode: 'webcam', imageSource: null });
            uiManager.log("WEBCAM SIGNAL ACQUIRED");
        } catch (err) {
            uiManager.log(`ERROR: ${err.message}`);
            // Fallback?
        }
    } else if (mode === 'upload') {
        // Stop webcam to save resources
        webcamService.stop();

        if (file) {
            uiManager.log(`LOADING FILE: ${file.name}...`);
            imageLoader.loadFile(file);
            // State update will happen when image loads
        } else {
            // Just switching UI mode mostly
            state.update({ mode: 'upload' });
        }
    }
};

// Image Loader Callbacks
imageLoader.onImageReady = (img) => {
    state.update({
        mode: 'upload',
        imageSource: img
    });
    uiManager.log("IMAGE LOADED SUCCESSFULLY");

    // Optional: resize canvas to match image?
    // canvasController.setResolution(img.width, img.height);
};

imageLoader.onError = (err) => {
    uiManager.log(`LOAD ERROR: ${err.message}`);
};

// Handle Save
uiManager.onSave = () => {
    // Determine source info for logs
    uiManager.log("EXPORTING FRAME to PNG...");

    const link = document.createElement('a');
    link.download = `atkinson-bw-${Date.now()}.png`;
    link.href = canvasController.canvas.toDataURL();
    link.click();

    uiManager.log("EXPORT COMPLETE");
};

// Handle Drag and Drop on body
imageLoader.setupDragDrop(document.body);

// --- Initialization ---

async function init() {
    // Start Boot Sequence
    const boot = new BootSequence(uiManager, async () => {
        uiManager.log("SYSTEM BOOT COMPLETE");

        // Start loop
        renderLoop.start();
        uiManager.log("RENDER LOOP ACTIVATE");

        // Auto-start webcam
        try {
            await webcamService.start();
            state.update({ mode: 'webcam' });
            uiManager.log("DEFAULT INPUT: WEBCAM REMOTE");
        } catch (err) {
            uiManager.log("WEBCAM NOT DETECTED / PERMISSION DENIED");
            uiManager.log("SWITCHING TO IDLE MODE");
        }
    });

    boot.start();
}

// Start the application
window.addEventListener('DOMContentLoaded', init);
