/**
 * AssetLoader.js
 * Manages loading of images and sounds.
 */

export class AssetLoader {
    constructor() {
        this.images = new Map();
        this.sounds = new Map();
        this.toLoad = {
            images: [],
            sounds: []
        };
    }

    addImage(key, src) {
        this.toLoad.images.push({ key, src });
    }

    addSound(key, src) {
        this.toLoad.sounds.push({ key, src });
    }

    async loadAll() {
        const imagePromises = this.toLoad.images.map(img => this.loadImage(img.key, img.src));
        // const soundPromises = this.toLoad.sounds.map(snd => this.loadSound(snd.key, snd.src));

        // For this prototype, we might not have real assets yet, so we handle failures gracefully
        // or just resolve immediately if empty.

        await Promise.all([...imagePromises]);

        return {
            images: this.images,
            sounds: this.sounds
        };
    }

    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(key, img);
                resolve(img);
            };
            img.onerror = (e) => {
                console.warn(`Failed to load image: ${src}`, e);
                // Resolve anyway to not block game start, maybe with a placeholder logic later
                resolve(null);
            };
            img.src = src;
        });
    }

    // Sound loading would span here
}
