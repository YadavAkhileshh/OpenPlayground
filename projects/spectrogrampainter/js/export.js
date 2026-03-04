/**
 * Handles WAV file generation and download
 */
export class AudioExporter {
    /**
     * Convert AudioBuffer to WAV Blob
     * @param {AudioBuffer} buffer 
     * @returns {Blob}
     */
    static bufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const bufferOut = new ArrayBuffer(length);
        const view = new DataView(bufferOut);
        const channels = [];
        let i;
        let sample;
        let offset = 0;
        let pos = 0;

        // write value to dataview
        function setUint16(data) {
            view.setUint16(pos, data, true);
            pos += 2;
        }

        function setUint32(data) {
            view.setUint32(pos, data, true);
            pos += 4;
        }

        // Write WAV Header
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"

        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // length = 16
        setUint16(1); // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2); // block-align
        setUint16(16); // 16-bit (hardcoded)

        setUint32(0x61746164); // "data" - chunk
        setUint32(length - pos - 4); // chunk length

        // Interleave channels
        for (i = 0; i < buffer.numberOfChannels; i++)
            channels.push(buffer.getChannelData(i));

        while (pos < length) {
            for (i = 0; i < numOfChan; i++) {
                // clamp
                sample = Math.max(-1, Math.min(1, channels[i][offset]));
                // bit conversion
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        return new Blob([bufferOut], { type: "audio/wav" });
    }

    static downloadWav(buffer, filename = "spectrogram.wav") {
        const blob = this.bufferToWav(buffer);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        document.body.appendChild(anchor);
        anchor.style = "display: none";
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
    }
}
