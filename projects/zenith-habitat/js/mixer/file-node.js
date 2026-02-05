/**
 * Handles standard audio files (mp3/wav) using HTML5 Audio element feeding into Web Audio API.
 * This is simpler for long samples (rain, cafe) than decoding huge buffers.
 */
export default class FileNode {
    constructor(ctx, url) {
        this.ctx = ctx;
        this.url = url;
        this.element = new Audio(url);
        this.element.loop = true;
        this.element.crossOrigin = "anonymous";

        // Web Audio Nodes
        this.sourceNode = null;
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0;

        this.isInitialized = false;
    }

    setup() {
        if (this.isInitialized) return;

        this.sourceNode = this.ctx.createMediaElementSource(this.element);
        this.sourceNode.connect(this.gainNode);

        this.element.play().then(() => {
            console.log(`Playing ${this.url}`);
        }).catch(e => {
            // Autoplay might block until interaction, which is handled by master resume
            console.log("Waiting for interaction...", e);
        });

        this.isInitialized = true;
    }

    connect(destination) {
        this.gainNode.connect(destination);
    }

    setVolume(value) {
        // Init on first audible volume interaction to save bandwidth
        if (!this.isInitialized && value > 0) {
            this.setup();
        }

        this.gainNode.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);

        // Also manage element playing state
        if (value > 0 && this.element.paused && this.isInitialized) {
            this.element.play();
        } else if (value === 0 && !this.element.paused) {
            // Optional: Pause element if volume 0 to save CPU? 
            // Better to keep running for instant fade-in, unless 0 for long time.
        }
    }
}
