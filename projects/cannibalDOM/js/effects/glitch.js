/* js/effects/glitch.js */
export class GlitchEffect {
    constructor() {
        this.active = false;
        this.timer = 0;
    }

    trigger(duration) {
        this.active = true;
        this.timer = duration;
        document.body.classList.add('glitch-active');
    }

    update(deltaTime) {
        if (!this.active) return;

        this.timer -= deltaTime;
        if (this.timer <= 0) {
            this.active = false;
            document.body.classList.remove('glitch-active');
            document.body.style.filter = 'none';
            return;
        }

        // Random RGB shift
        if (Math.random() > 0.5) {
            const shiftX = (Math.random() - 0.5) * 10;
            const shiftY = (Math.random() - 0.5) * 10;
            document.body.style.filter = `drop-shadow(${shiftX}px ${shiftY}px 0px rgba(255,0,0,0.5)) drop-shadow(${-shiftX}px ${-shiftY}px 0px rgba(0,0,255,0.5))`;
        } else {
            document.body.style.filter = 'none';
        }
    }
}
