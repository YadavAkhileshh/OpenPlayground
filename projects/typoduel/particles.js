// Particle System for Visual Effects

class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particleContainer');
        this.particles = [];
        this.init();
    }

    init() {
        // Create ambient floating particles
        this.createAmbientParticles(30);
        setInterval(() => this.updateAmbientParticles(), 100);
    }

    createAmbientParticles(count) {
        for (let i = 0; i < count; i++) {
            this.createAmbientParticle();
        }
    }

    createAmbientParticle() {
        const particle = document.createElement('div');
        particle.className = 'ambient-particle';
        
        const size = Math.random() * 3 + 1;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(0, 217, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            animation: ambientFloat ${duration}s ease-in-out ${delay}s infinite;
            box-shadow: 0 0 ${size * 2}px rgba(0, 217, 255, 0.5);
        `;

        this.container.appendChild(particle);
        this.particles.push(particle);

        // Add keyframe animation dynamically
        if (!document.getElementById('ambient-float-style')) {
            const style = document.createElement('style');
            style.id = 'ambient-float-style';
            style.innerHTML = `
                @keyframes ambientFloat {
                    0%, 100% {
                        transform: translate(0, 0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    50% {
                        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateAmbientParticles() {
        // Randomly add new ambient particles
        if (Math.random() < 0.1 && this.particles.length < 50) {
            this.createAmbientParticle();
        }
    }

    createBurst(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            this.createBurstParticle(x, y, color);
        }
    }

    createBurstParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.className = `particle ${color}`;
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            --tx: ${tx}px;
            --ty: ${ty}px;
        `;
        
        this.container.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    createHitEffect(element, type) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const color = type === 'success' ? 'success' : 'damage';
        this.createBurst(centerX, centerY, color, 15);
    }

    createComboEffect(comboCount) {
        const colors = ['success', 'success', 'damage'];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (let i = 0; i < Math.min(comboCount * 3, 30); i++) {
            setTimeout(() => {
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.createBurstParticle(
                    centerX + (Math.random() - 0.5) * 200,
                    centerY + (Math.random() - 0.5) * 200,
                    color
                );
            }, i * 20);
        }
    }

    createRoundTransitionEffect() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const angle = (i / 50) * Math.PI * 2;
                const radius = 200;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                this.createBurstParticle(x, y, 'success');
            }, i * 10);
        }
    }

    clearAll() {
        this.particles.forEach(p => p.remove());
        this.particles = [];
    }
}

// Initialize particle system when DOM is ready
let particleSystem;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        particleSystem = new ParticleSystem();
    });
} else {
    particleSystem = new ParticleSystem();
}
