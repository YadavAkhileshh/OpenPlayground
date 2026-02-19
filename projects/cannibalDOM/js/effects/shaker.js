/* js/effects/shaker.js */
export class ScreenShake {
    constructor(elementSelector) {
        this.element = document.querySelector(elementSelector);
        this.intensity = 0;
        this.duration = 0;
        this.timer = 0;
        this.originalTransform = '';
        this.active = false;
    }

    shake(intensity, duration) {
        this.intensity = intensity;
        this.duration = duration;
        this.timer = duration;
        this.active = true;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.timer -= deltaTime;
        if (this.timer <= 0) {
            this.active = false;
            this.element.style.transform = this.element.style.transform.replace(/translate\([^)]+\)/, ''); // Use Camera's transform logic? 
            // Better: Apply shake as an OFFSET to the Camera?
            // Since Camera updates transform every frame, we should probably inject shake there.
            // Or apply shake to the BODY or GameContainer?
            // Applying to #game-container might work if nested correctly.
            this.element.style.transform = `translate(0px, 0px)`; // Reset local
            return;
        }

        const dx = (Math.random() - 0.5) * this.intensity * 2;
        const dy = (Math.random() - 0.5) * this.intensity * 2;

        // This overwrites other transforms if not careful.
        // Safer to use a wrapper div JUST for shake.
        this.element.style.transform = `translate(${dx}px, ${dy}px)`;
    }
}
