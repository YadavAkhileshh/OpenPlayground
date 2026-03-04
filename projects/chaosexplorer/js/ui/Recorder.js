/**
 * Recorder.js
 * Handles canvas recording and snapshots.
 */

export class Recorder {
    constructor(canvas) {
        this.canvas = canvas;
        this.mediaRecorder = null;
        this.chunks = [];
        this.isRecording = false;

        this.statusElement = document.getElementById('recording-status');
    }

    takeSnapshot() {
        const link = document.createElement('a');
        link.download = `chaos-explorer-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
            return false;
        } else {
            this.startRecording();
            return true;
        }
    }

    startRecording() {
        const stream = this.canvas.captureStream(30); // 30 FPS
        const options = { mimeType: 'video/webm; codecs=vp9' };

        try {
            this.mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
            console.warn('VP9 not supported, trying default.');
            this.mediaRecorder = new MediaRecorder(stream);
        }

        this.chunks = [];
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.chunks.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chaos-recording-${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        if (this.statusElement) this.statusElement.style.display = 'inline';
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            if (this.statusElement) this.statusElement.style.display = 'none';
        }
    }
}
