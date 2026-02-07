/**
 * VFX and Nerve System Module
 * Advanced visualization and biological feedback.
 */

class VFX {
    /**
     * Spawns a burst of particles at the specified coordinates.
     * 
     * @param {Number} x - Viewport X
     * @param {Number} y - Viewport Y
     * @param {String} color - Particle color (hex/rgb)
     */
    static spawnParticles(x, y, color) {
        const container = document.getElementById('vfx-container');
        if (!container) return;

        const count = CONFIG.VFX.PARTICLE_COUNT;

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'healing-particle';
            p.style.backgroundColor = color || '#fff';
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;

            const dx = (Math.random() - 0.5) * 150;
            const dy = (Math.random() - 0.5) * 150;
            const rotation = Math.random() * 360;
            const delay = Math.random() * 200;

            container.appendChild(p);

            p.animate([
                { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(0) rotate(${rotation}deg)`, opacity: 0 }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                delay: delay
            }).onfinish = () => p.remove();
        }
    }

    /**
     * Creates a glowing "nerve pulse" across the screen.
     */
    static pulseNerve(y) {
        const pulse = document.createElement('div');
        pulse.className = 'nerve-pulse';
        pulse.style.top = `${y}px`;
        document.body.appendChild(pulse);

        pulse.animate([
            { opacity: 0, scaleY: 0 },
            { opacity: 0.5, scaleY: 1, offset: 0.5 },
            { opacity: 0, scaleY: 0 }
        ], {
            duration: 1000,
            easing: 'ease'
        }).onfinish = () => pulse.remove();
    }
}

/**
 * Anatomy - Biological Descriptor Object
 * Used for calculating spatial relationships within the "body".
 */
const Anatomy = {
    /**
     * Gets absolute center of an element.
     */
    getCenter(el) {
        const r = el.getBoundingClientRect();
        return {
            x: r.left + r.width / 2 + window.scrollX,
            y: r.top + r.height / 2 + window.scrollY
        };
    },

    /**
     * Distance check utility.
     */
    isNear(p1, p2, threshold = 20) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y) < threshold;
    },

    /**
     * Identifies biological "type" of a section.
     */
    getOrganType(el) {
        return el.dataset.type || 'flesh';
    }
};

/**
 * NerveSystem - Subliminal Feedback System
 * Handles audio visualization (visual-only simulation) and tissue reactions.
 */
const NerveSystem = {
    state: 'RESTING',
    sensitivity: 0.8,

    init() {
        console.log("[NERVE] Synapses active. Ready for trauma input.");
        window.addEventListener('wound-path', (e) => this.handleSignal(e.detail));
    },

    handleSignal(point) {
        if (Math.random() > 0.95) {
            VFX.pulseNerve(point.y);
        }

        this.state = 'EXCITED';
        this.decay();
    },

    decay() {
        if (this.decayTimer) clearTimeout(this.decayTimer);
        this.decayTimer = setTimeout(() => {
            this.state = 'RESTING';
        }, 1000);
    }
};

// Auto-init Nerve System
NerveSystem.init();

window.VFX = VFX;
window.Anatomy = Anatomy;
window.NerveSystem = NerveSystem;

/**
 * STYLES FOR VFX SYSTEM (Injecting dynamically to save on CSS file clutter)
 */
const vfxStyles = `
.nerve-pulse {
    position: fixed;
    left: 0;
    width: 100%;
    height: 2px;
    background: rgba(255, 62, 62, 0.2);
    box-shadow: 0 0 20px var(--accent-red);
    pointer-events: none;
    z-index: 1000;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = vfxStyles;
document.head.appendChild(styleSheet);
