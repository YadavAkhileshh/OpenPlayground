/**
 * Canvas Recorder Module.
 * Allows recording the simulation canvas to a video file (WebM).
 * Useful for capturing the organic growth patterns.
 * @module Utils/Recorder
 */

export class CanvasRecorder {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas to record.
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.recorder = null;
        this.chunks = [];
        this.isRecording = false;

        this.stream = null;
    }

    /**
     * Starts recording the canvas stream.
     * @param {number} fps - Frames per second for the recording.
     */
    start(fps = 60) {
        if (this.isRecording) {
            console.warn("Already recording.");
            return;
        }

        try {
            this.stream = this.canvas.captureStream(fps);

            // Check for supported mime types
            const mimeTypes = [
                'video/webm;codecs=vp9',
                'video/webm;codecs=vp8',
                'video/webm'
            ];

            let selectedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

            if (!selectedType) {
                console.error("No supported MediaRecorder mime type found.");
                return;
            }

            console.log(`Starting recording with mimeType: ${selectedType}`);

            this.recorder = new MediaRecorder(this.stream, {
                mimeType: selectedType,
                videoBitsPerSecond: 5000000 // 5 Mbps
            });

            this.chunks = [];

            this.recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            this.recorder.onstop = () => {
                this.save();
            };

            this.recorder.start();
            this.isRecording = true;

        } catch (err) {
            console.error("Error starting recording:", err);
        }
    }

    /**
     * Stops the recording.
     */
    stop() {
        if (!this.isRecording || !this.recorder) return;

        this.recorder.stop();
        this.isRecording = false;
        this.stream.getTracks().forEach(track => track.stop());
    }

    /**
     * Saves the recorded chunks to a file.
     * Automatically triggered on stop().
     */
    save() {
        if (this.chunks.length === 0) return;

        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `turing-workshop-${timestamp}.webm`;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.chunks = [];
        }, 100);

        console.log("Recording saved.");
    }

    /**
     * Take a single screenshot.
     */
    screenshot() {
        const url = this.canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `turing-snapshot-${timestamp}.png`;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
    }
}
