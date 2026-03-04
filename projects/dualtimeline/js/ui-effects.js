/**
 * DualTimeline - UI Effects Engine
 * Purpose: High-performance micro-animations and visual feedback.
 */

import { logger } from './utils.js';

class UIEffects {
    constructor() {
        this.ctx = null;
        this.activeEnthusiasm = 0;
    }

    /**
     * Create a ripple effect on a button or container
     */
    createRipple(event, element) {
        const ripple = document.createElement('span');
        ripple.classList.add('dt-ripple');

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

        element.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    /**
     * Flash an element (e.g., on sync update)
     */
    flash(element, color = 'rgba(59, 130, 246, 0.4)') {
        if (!element) return;

        const originalTransition = element.style.transition;
        const originalShadow = element.style.boxShadow;

        element.style.transition = 'box-shadow 0.2s ease';
        element.style.boxShadow = `0 0 20px ${color}`;

        setTimeout(() => {
            element.style.boxShadow = originalShadow;
            setTimeout(() => {
                element.style.transition = originalTransition;
            }, 200);
        }, 300);
    }

    /**
     * Particle burst for achievement/milestone
     */
    particleBurst(x, y, container = document.body) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const part = document.createElement('div');
            part.className = 'dt-particle';

            const angle = (i / count) * Math.PI * 2;
            const velocity = 2 + Math.random() * 3;
            const tx = Math.cos(angle) * 100 * velocity;
            const ty = Math.sin(angle) * 100 * velocity;

            part.style.left = `${x}px`;
            part.style.top = `${y}px`;
            part.style.setProperty('--tx', `${tx}px`);
            part.style.setProperty('--ty', `${ty}px`);

            container.appendChild(part);
            part.addEventListener('animationend', () => part.remove());
        }
    }

    /**
     * "Glitch" effect for connection loss
     */
    triggerGlitch(element) {
        if (!element) return;
        element.classList.add('dt-glitch');
        setTimeout(() => element.classList.remove('dt-glitch'), 500);
    }

    /**
     * Smooth number counter for time displays
     */
    animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.innerText = Math.floor(progress * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }
}

// Global CSS for effects (injected for simplicity in this module)
const injectSystemStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .dt-ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-anim 0.6s linear;
            pointer-events: none;
        }
        @keyframes ripple-anim {
            to { transform: scale(4); opacity: 0; }
        }
        .dt-particle {
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--accent-color, #3b82f6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: particle-fly 0.8s ease-out forwards;
        }
        @keyframes particle-fly {
            to { transform: translate(var(--tx), var(--ty)); opacity: 0; }
        }
        .dt-glitch {
            animation: glitch-anim 0.2s ease-in-out infinite;
        }
        @keyframes glitch-anim {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }
    `;
    document.head.appendChild(style);
};

injectSystemStyles();
export const uiEffects = new UIEffects();
