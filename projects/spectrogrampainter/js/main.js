/**
 * Main Application Entry Point
 */
import { Utils } from './utils.js';
import { DrawingCanvas } from './drawing.js';
import { AudioEngine } from './audio-engine.js';
import { Synthesizer } from './synthesis.js';
import { Visualizer } from './visualizer.js';
import { UIManager } from './ui.js';
import { AudioExporter } from './export.js';

class App {
    constructor() {
        this.drawing = new DrawingCanvas('drawing-canvas');
        this.audioEngine = new AudioEngine();
        this.synthesis = new Synthesizer(this.audioEngine);
        this.visualizer = new Visualizer('oscilloscope', this.audioEngine);
        this.ui = new UIManager(this);

        this.currentBuffer = null;
        this.startTime = 0;
        this.playbackRate = 1.0;
        this.isPlaying = false;

        // Loop for UI updates (scanline)
        this.frameId = null;

        console.log("SpectrogramPainter Loaded");
        this.ui.showStatus("SYSTEM ONLINE");
    }

    async play() {
        if (this.isPlaying) return;

        // 1. Generate Buffer
        this.ui.showStatus("SYNTHESIZING...");
        const imageData = this.drawing.getImageData();

        // Small delay to allow UI to render status
        setTimeout(async () => {
            this.currentBuffer = await this.synthesis.generateAudio(imageData);

            // 2. Play
            this.audioEngine.playBuffer(this.currentBuffer, () => this.onPlaybackEnd());

            // Apply speed if set
            if (this.audioEngine.sourceNode) {
                this.audioEngine.sourceNode.playbackRate.value = this.playbackRate;
            }

            this.isPlaying = true;
            this.ui.togglePlayState(true);
            this.visualizer.start();

            // 3. Start UI Loop
            this.startTime = this.audioEngine.ctx.currentTime;
            this.updateLoop();
        }, 10);
    }

    stop() {
        this.audioEngine.stop();
        this.onPlaybackEnd();
    }

    onPlaybackEnd() {
        this.isPlaying = false;
        if (this.frameId) cancelAnimationFrame(this.frameId);
        this.ui.togglePlayState(false);
        this.visualizer.stop();
        this.ui.updateScanLine(0);
    }

    updateLoop() {
        if (!this.isPlaying) return;

        const duration = this.currentBuffer.duration / this.playbackRate;
        const elapsed = this.audioEngine.ctx.currentTime - this.startTime;
        const progress = Math.min(elapsed / duration, 1.0);

        this.ui.updateScanLine(progress);

        if (progress < 1.0) {
            this.frameId = requestAnimationFrame(() => this.updateLoop());
        }
    }

    setPlaybackRate(rate) {
        this.playbackRate = rate;
        if (this.audioEngine.sourceNode) {
            this.audioEngine.sourceNode.playbackRate.value = rate;
        }
    }

    exportWav() {
        if (!this.currentBuffer) {
            this.ui.showStatus("GENERATE AUDIO FIRST");
            // Auto-generate if not ready
            const imageData = this.drawing.getImageData();
            this.synthesis.generateAudio(imageData).then(buffer => {
                this.currentBuffer = buffer;
                AudioExporter.downloadWav(buffer);
                this.ui.showStatus("EXPORT COMPLETE");
            });
            return;
        }
        AudioExporter.downloadWav(this.currentBuffer);
        this.ui.showStatus("EXPORT COMPLETE");
    }
}

// Initialize
window.SpectrogramPainter = new App();
