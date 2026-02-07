/**
 * Singleton wrapper for AudioContext to handle browser autoplay policies.
 */
export default class AudioContextManager {
    constructor() {
        // Support standard and webkit prefixes
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.isUnlocked = false;
    }

    static getInstance() {
        if (!AudioContextManager.instance) {
            AudioContextManager.instance = new AudioContextManager();
        }
        return AudioContextManager.instance;
    }

    get context() {
        return this.ctx;
    }

    /**
     * Resumes the context. Should be called on a user gesture (click/touch).
     */
    async resume() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        this.isUnlocked = true;
    }
}
