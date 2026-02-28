/**
 * File: js/audio/recorder.js
 * MouseTone Module
 * Copyright (c) 2026
 * 
 * Handles recording the visual canvas and audio stream into a downloadable video file.
 * Uses the MediaRecorder API with VP9 codec if available.
 */
export class AudioRecorder {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element to capture.
     * @param {AudioContext} audioCtx - The Web Audio context.
     * @param {MediaStreamAudioDestinationNode} destinationNode - The audio node to capture stream from.
     */
    constructor(canvas, audioCtx, destinationNode) {
        this.canvas = canvas;
        this.audioCtx = audioCtx;
        this.audioSource = destinationNode;
        this.mediaRecorder = null;
        this.chunks = [];
        this.isRecording = false;
    }

    /**
     * Starts the recording process.
     * Captures a 60FPS stream from the canvas and mixes it with the audio destination.
     */
    start() {
        if (this.isRecording) return;

        console.log('Starting recording...');
        const canvasStream = this.canvas.captureStream(60); // 60 FPS
        const audioStream = this.audioSource.stream; // Should be MediaStreamAudioDestinationNode

        // Combine video and audio tracks into a single stream
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // Prefer VP9 for better quality/size, fallback to default (usually VP8)
        const options = { mimeType: 'video/webm; codecs=vp9' };
        try {
            this.mediaRecorder = new MediaRecorder(combinedStream, options);
        } catch (e) {
            console.warn('VP9 not supported, falling back to default codecs.');
            this.mediaRecorder = new MediaRecorder(combinedStream);
        }

        this.chunks = [];

        // Collect data chunks as they become available
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.chunks.push(e.data);
            }
        };

        // When stopped, trigger export logic
        this.mediaRecorder.onstop = () => this.export();

        this.mediaRecorder.start();
        this.isRecording = true;
    }

    /**
     * Stops the recording.
     * This will trigger the 'stop' event which calls export();
     */
    stop() {
        if (!this.isRecording) return;
        console.log('Stopping recording...');
        this.mediaRecorder.stop();
        this.isRecording = false;
    }

    /**
     * Exports the recorded chunks to a .webm file.
     * Automatically triggers a browser download.
     */
    export() {
        console.log('Exporting video...');
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        // Create invisible link to simulate click
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;

        // Timestamped filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `mousetone-recording-${timestamp}.webm`;

        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}
