/* js/systems/style-eater.js */
export class StyleEater {
    constructor() {
        this.inheritableProps = [
            'backgroundColor',
            'backgroundImage',
            'borderColor',
            'borderWidth',
            'borderStyle',
            'borderRadius',
            'boxShadow',
            'opacity'
        ];
        this.audio = null;
        this.particles = null;
    }

    setAudio(audioSystem) {
        this.audio = audioSystem;
    }

    setParticles(particleSystem) {
        this.particles = particleSystem;
    }

    consume(player, edibleObj) {
        const element = edibleObj.element;
        const computedStyle = window.getComputedStyle(element);

        // Audio Feedback
        if (this.audio) this.audio.playEatSound();

        // Visual Feedback
        if (this.particles) {
            this.particles.emit(player.x + player.size / 2, player.y + player.size / 2, computedStyle.backgroundColor, 8);
        }

        // Inherit Properties
        // We don't want to inherit EVERYTHING every time, maybe randomize or pick the most dominant trait?
        // For now, let's inherit background and border for sure.

        player.applyStyle('backgroundColor', computedStyle.backgroundColor);

        if (computedStyle.borderRadius !== '0px') {
            player.applyStyle('borderRadius', computedStyle.borderRadius);
        }

        if (computedStyle.borderWidth !== '0px' && computedStyle.borderStyle !== 'none') {
            player.applyStyle('border', computedStyle.border);
        }

        if (computedStyle.boxShadow !== 'none') {
            player.applyStyle('boxShadow', computedStyle.boxShadow);
        }

        // Add to player stats
        player.grow(1);
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.backgroundColor = color;
            p.style.left = (x + Math.random() * 30) + 'px';
            p.style.top = (y + Math.random() * 30) + 'px';

            document.body.appendChild(p);

            // Cleanup
            setTimeout(() => p.remove(), 600);
        }
    }
}
