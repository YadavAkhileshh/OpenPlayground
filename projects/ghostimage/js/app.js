import { APP_CONFIG, EVENTS, UI, ERRORS, NOTIFY } from './core/constants.js';
import { ImageProcessor } from './core/image-processor.js';
import { LSBEncoder } from './core/lsb-encoder.js';
import { LSBDecoder } from './core/lsb-decoder.js';
import { NotificationManager } from './ui/notifications.js';
import { DragDropHandler } from './ui/drag-drop.js';
import { PreviewManager } from './ui/preview-manager.js';
import { TestRunner } from '../tests/test-runner.js';

/**
 * GhostImageApp
 * 
 * Main controller for the application.
 */
class GhostImageApp {
    constructor() {
        // Services
        this.notify = new NotificationManager();
        this.dragDrop = new DragDropHandler();
        this.preview = new PreviewManager();
        this.encoder = new LSBEncoder();
        this.decoder = new LSBDecoder();

        // State
        this.state = {
            coverImage: null,
            coverFile: null,
            secretImage: null,
            secretFile: null,
            decodeImage: null, // Image to be decoded
            decodeFile: null,
            encodedResultData: null // ImageData result
        };

        this.init();
    }

    init() {
        console.log(\`Initializing \${APP_CONFIG.NAME} v\${APP_CONFIG.VERSION}\`);
        
        this.bindNavigation();
        this.bindUploads();
        this.bindActions();
    }

    // --- Navigation ---
    bindNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn[data-view]');
        const views = document.querySelectorAll('.view-panel');

        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update Buttons
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Switch View
                const targetId = \`view-\${btn.dataset.view}\`;
                views.forEach(v => {
                    v.classList.remove('active');
                    if (v.id === targetId) {
                        setTimeout(() => v.classList.add('active'), 50); // slight delay for animation
                    }
                });
            });
        });

        // Reset Button
        document.getElementById('reset-app').addEventListener('click', () => this.resetAll());
    }

    // --- File Uploads ---
    bindUploads() {
        // 1. Cover Image
        this.dragDrop.init(UI.DROPZONES.COVER, UI.INPUTS.COVER, async (file) => {
            try {
                const img = await ImageProcessor.loadImage(file);
                this.state.coverImage = img;
                this.state.coverFile = file;
                
                this.preview.updatePreview('preview-cover-container', UI.CANVAS.COVER, 'meta-cover', img, file);
                this.updateEncodeButton();
                this.notify.show("Cover image loaded", NOTIFY.SUCCESS);
            } catch (err) {
                this.notify.show(err.message, NOTIFY.ERROR);
            }
        });

        // 2. Secret Image
        this.dragDrop.init(UI.DROPZONES.SECRET, UI.INPUTS.SECRET, async (file) => {
            try {
                const img = await ImageProcessor.loadImage(file);
                this.state.secretImage = img;
                this.state.secretFile = file;

                this.preview.updatePreview('preview-secret-container', UI.CANVAS.SECRET, 'meta-secret', img, file);
                this.updateEncodeButton();
                this.notify.show("Secret image loaded", NOTIFY.SUCCESS);
            } catch (err) {
                this.notify.show(err.message, NOTIFY.ERROR);
            }
        });

        // 3. Decode Image (Source)
        this.dragDrop.init(UI.DROPZONES.DECODE, UI.INPUTS.DECODE, async (file) => {
            try {
                // For decoding, we need strict integrity, so we use similar loading
                const img = await ImageProcessor.loadImage(file);
                this.state.decodeImage = img;
                this.state.decodeFile = file;

                this.preview.updatePreview('preview-decode-container', UI.CANVAS.DECODE_SOURCE, 'meta-decode', img, file);
                
                // Enable decode button
                const btn = document.getElementById('btn-decode');
                btn.disabled = false;
                
                this.notify.show("Encoded image loaded", NOTIFY.SUCCESS);
            } catch (err) {
                this.notify.show(err.message, NOTIFY.ERROR);
            }
        });

        // Remove Buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.remove-btn').dataset.target;
                this.clearState(target);
            });
        });
    }

    // --- Actions ---
    bindActions() {
        // 1. Bit Depth Toggles (Segmented Control)
        document.querySelectorAll('.seg-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.encoder.setStrength(parseInt(btn.dataset.bits));
                
                // Update UI mode
                document.getElementById('mode-indicator').textContent = \`LSB-\${btn.dataset.bits}\`;
            });
        });

        // 2. Encode Button
        const btnEncode = document.getElementById('btn-encode');
        btnEncode.addEventListener('click', async () => {
            await this.performEncode();
        });

        // 3. Decode Button
        const btnDecode = document.getElementById('btn-decode');
        btnDecode.addEventListener('click', async () => {
            await this.performDecode();
        });
        
        // 4. Download Secret
        document.getElementById('btn-download-secret').addEventListener('click', () => {
             // implemented inside performDecode usually, but here we can just target the canvas
             const canvas = document.getElementById(UI.CANVAS.DECODE_RESULT);
             const link = document.createElement('a');
             link.download = 'decoded-secret.png';
             link.href = canvas.toDataURL();
             link.click();
        });
    }

    updateEncodeButton() {
        const btn = document.getElementById('btn-encode');
        if (this.state.coverImage && this.state.secretImage) {
            btn.disabled = false;
        } else {
            btn.disabled = true;
        }
    }

    clearState(target) {
        if (target === 'cover') {
            this.state.coverImage = null;
            this.state.coverFile = null;
            this.preview.clearPreview('preview-cover-container', UI.INPUTS.COVER);
        } else if (target === 'secret') {
            this.state.secretImage = null;
            this.state.secretFile = null;
            this.preview.clearPreview('preview-secret-container', UI.INPUTS.SECRET);
        } else if (target === 'decode') {
            this.state.decodeImage = null;
            this.state.decodeFile = null;
            this.preview.clearPreview('preview-decode-container', UI.INPUTS.DECODE);
            document.getElementById('btn-decode').disabled = true;
            document.getElementById('result-decode-area').classList.add('hidden');
        }
        this.updateEncodeButton();
    }

    resetAll() {
        this.clearState('cover');
        this.clearState('secret');
        this.clearState('decode');
        this.notify.show("Application reset", NOTIFY.INFO);
    }

    // --- Logic Implementation ---

    async performEncode() {
        const btn = document.getElementById('btn-encode');
        const progress = document.getElementById('encoding-progress');

        // Validation
        if (!ImageProcessor.canFit(this.state.coverImage, this.state.secretImage, this.encoder.bitsPerChannel)) {
            this.notify.show(ERRORS.SECRET_TOO_BIG, NOTIFY.ERROR);
            return;
        }

        // Lock UI
        btn.disabled = true;
        progress.classList.remove('hidden');

        try {
            // Give UI a moment to update
            await new Promise(r => setTimeout(r, 100));

            // 1. Get Cover ImageData
            const canvasCover = document.getElementById(UI.CANVAS.COVER);
            const coverData = ImageProcessor.getImageData(canvasCover);
            
            // 2. Get Secret ImageData
            const canvasSecret = document.getElementById(UI.CANVAS.SECRET);
            const secretData = ImageProcessor.getImageData(canvasSecret);

            // 3. Encode
            const resultData = this.encoder.encode(coverData, secretData);
            this.state.encodedResultData = resultData;

            // 4. Trigger Download
            // We put the result into a temporary canvas to get the URL
            const url = ImageProcessor.imageDataToURL(resultData);
            
            const link = document.createElement('a');
            link.download = \`ghost-encoded-\${Date.now()}.png\`;
            link.href = url;
            link.click();

            this.notify.show("Image encoded successfully! Download started.", NOTIFY.SUCCESS);

        } catch (error) {
            console.error(error);
            this.notify.show(ERRORS.ENCODE_FAILED, NOTIFY.ERROR);
        } finally {
            btn.disabled = false;
            progress.classList.add('hidden');
        }
    }

    async performDecode() {
        const btn = document.getElementById('btn-decode');
        const resultArea = document.getElementById('result-decode-area');
        
        btn.disabled = true;

        try {
            // Give UI a moment
            await new Promise(r => setTimeout(r, 100));

            // 1. Get Source Data
            const canvasSource = document.getElementById(UI.CANVAS.DECODE_SOURCE);
            const sourceData = ImageProcessor.getImageData(canvasSource);

            // 2. Decode
            // Note: We need to make sure we use the same bit depth!
            // In a real app, we might auto-detect or store this in metadata.
            // For now, we rely on the user setting.
            // But actually, the decoder class defaults to 1.
            // We should sync the decoder with the UI?
            // Since the decode view doesn't have the toggle visible in the same way,
            // let's assume we might need to expose it or try multiple?
            // For strictness, let's use the same encoder setting (App keeps one instance).
            
            this.decoder.bitsPerChannel = this.encoder.bitsPerChannel; // Sync settings

            const secretData = this.decoder.decode(sourceData);

            // 3. Show Result
            resultArea.classList.remove('hidden');
            const resultCanvas = document.getElementById(UI.CANVAS.DECODE_RESULT);
            
            // Resize canvas to secret dimensions
            resultCanvas.width = secretData.width;
            resultCanvas.height = secretData.height;
            
            const ctx = resultCanvas.getContext('2d');
            ctx.putImageData(secretData, 0, 0);

            this.notify.show("Hidden image found and revealed!", NOTIFY.SUCCESS);

            // Scroll to result
            resultArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            this.notify.show(error.message || ERRORS.DECODE_FAILED, NOTIFY.ERROR);
        } finally {
            btn.disabled = false;
        }
    }
}

// Start App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GhostImageApp();
    
    // Expose TestRunner for verification
    window.TestRunner = new TestRunner();
    console.log("GhostImage Environment Ready.");
    console.log("Run 'window.TestRunner.runAllTests()' to verify LSB logic.");
});
