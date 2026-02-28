// ==========================================
// INTERACTIVE ANIMATION HANDLERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initRippleEffect();
    initParticleExplosion();
    initMorphingShapes();
    initKeyboardWaves();
    initGravityBalls();
    initColorPalette();
});

// ==========================================
// RIPPLE EFFECT
// ==========================================
function initRippleEffect() {
    const rippleCanvas = document.getElementById('ripple-canvas');
    
    rippleCanvas.addEventListener('click', (e) => {
        createRipple(e, rippleCanvas);
        app.incrementAnimation();
        app.incrementInteraction();
    });
    
    // Multi-ripple on double click
    rippleCanvas.addEventListener('dblclick', (e) => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                createRipple(e, rippleCanvas, true);
            }, i * 100);
        }
    });
}

function createRipple(e, container, isMulti = false) {
    const pos = app.getCursorPosition(e, container);
    const ripple = document.createElement('div');
    ripple.className = isMulti ? 'ripple ripple-multi' : 'ripple';
    ripple.style.left = `${pos.x}px`;
    ripple.style.top = `${pos.y}px`;
    ripple.style.background = `radial-gradient(circle, ${app.getRandomColor()}66, transparent)`;
    
    container.appendChild(ripple);
    
    // Remove after animation
    setTimeout(() => {
        ripple.remove();
    }, 1500 / app.animationSpeed);
}

// ==========================================
// PARTICLE EXPLOSION
// ==========================================
function initParticleExplosion() {
    const particleCanvas = document.getElementById('particle-canvas');
    let isHolding = false;
    let burstInterval;
    
    particleCanvas.addEventListener('mousedown', (e) => {
        isHolding = true;
        createParticleExplosion(e, particleCanvas);
        app.incrementAnimation();
        app.incrementInteraction();
        
        // Continuous burst while holding
        burstInterval = setInterval(() => {
            if (isHolding) {
                createParticleExplosion(e, particleCanvas, true);
            }
        }, 200);
    });
    
    particleCanvas.addEventListener('mouseup', () => {
        isHolding = false;
        clearInterval(burstInterval);
    });
    
    particleCanvas.addEventListener('mouseleave', () => {
        isHolding = false;
        clearInterval(burstInterval);
    });
}

function createParticleExplosion(e, container, isTrail = false) {
    const pos = app.getCursorPosition(e, container);
    const particleCount = isTrail ? 15 : 30;
    const baseColor = app.getRandomColor();
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = isTrail ? 'particle particle-trail' : 'particle';
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = app.random(100, 300);
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.style.left = `${pos.x}px`;
        particle.style.top = `${pos.y}px`;
        particle.style.background = baseColor;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        container.appendChild(particle);
        
        // Remove after animation
        const duration = isTrail ? 1500 : 1000;
        setTimeout(() => {
            particle.remove();
        }, duration / app.animationSpeed);
    }
}

// ==========================================
// MORPHING SHAPES
// ==========================================
function initMorphingShapes() {
    const shapes = document.querySelectorAll('.morph-shape');
    
    shapes.forEach((shape, index) => {
        let morphState = 0;
        
        shape.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove all morph classes
            shape.classList.remove('morphed-1', 'morphed-2', 'morphed-3');
            
            // Cycle through morph states
            morphState = (morphState + 1) % 3;
            
            if (morphState > 0) {
                shape.classList.add(`morphed-${morphState}`);
            }
            
            // Add elastic animation
            shape.classList.add('elastic');
            setTimeout(() => {
                shape.classList.remove('elastic');
            }, 1000 / app.animationSpeed);
            
            app.incrementAnimation();
            app.incrementInteraction();
        });
        
        // Reverse morph on right-click
        shape.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            shape.classList.remove('morphed-1', 'morphed-2', 'morphed-3');
            
            morphState = (morphState - 1 + 3) % 3;
            
            if (morphState > 0) {
                shape.classList.add(`morphed-${morphState}`);
            }
            
            shape.classList.add('jello');
            setTimeout(() => {
                shape.classList.remove('jello');
            }, 900 / app.animationSpeed);
        });

        // Add hover effect
        shape.addEventListener('mouseenter', () => {
            shape.classList.add('glow-effect');
        });

        shape.addEventListener('mouseleave', () => {
            shape.classList.remove('glow-effect');
        });
    });
}

// ==========================================
// KEYBOARD WAVES
// ==========================================
function initKeyboardWaves() {
    const waveBars = document.querySelectorAll('.wave-bar');
    let currentIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        // Trigger wave animation
        triggerWave(waveBars, currentIndex);
        currentIndex = (currentIndex + 1) % waveBars.length;
    });
}

function triggerWave(bars, startIndex) {
    bars.forEach((bar, index) => {
        const delay = Math.abs(index - startIndex) * 50;
        
        setTimeout(() => {
            bar.classList.add('active');
            
            setTimeout(() => {
                bar.classList.remove('active');
            }, 800 / app.animationSpeed);
        }, delay / app.animationSpeed);
    });
}

// ==========================================
// GRAVITY BALLS WITH PHYSICS
// ==========================================
function initGravityBalls() {
    const ballsCanvas = document.getElementById('balls-canvas');
    
    ballsCanvas.addEventListener('click', (e) => {
        createBouncingBall(e, ballsCanvas);
    });
}

function createBouncingBall(e, container) {
    const pos = app.getCursorPosition(e, container);
    const ball = document.createElement('div');
    ball.className = 'ball';
    
    const containerHeight = container.offsetHeight;
    const ballSize = 40;
    const endY = containerHeight - ballSize;
    
    ball.style.left = `${pos.x}px`;
    ball.style.setProperty('--start-y', `${pos.y}px`);
    ball.style.setProperty('--end-y', `${endY}px`);
    ball.style.background = `linear-gradient(135deg, ${app.getRandomColor()}, ${app.getRandomColor()})`;
    
    container.appendChild(ball);
    
    // After falling, start bouncing
    setTimeout(() => {
        ball.style.top = `${endY}px`;
        ball.classList.remove('ball');
        ball.classList.add('ball', 'bouncing');
        
        // Remove after a while
        setTimeout(() => {
            ball.classList.add('fade-out');
            setTimeout(() => {
                ball.remove();
            }, 500 / app.animationSpeed);
        }, 3000 / app.animationSpeed);
    }, 1000 / app.animationSpeed);
}

// ==========================================
// COLOR PALETTE INTERACTIONS
// ==========================================
function initColorPalette() {
    const colorOrbs = document.querySelectorAll('.color-orb');
    
    colorOrbs.forEach(orb => {
        const color = orb.getAttribute('data-color');
        orb.style.background = color;
        
        orb.addEventListener('click', (e) => {
            activateColorOrb(orb, color, e);
        });

        orb.addEventListener('mouseenter', () => {
            orb.classList.add('floating');
        });

        orb.addEventListener('mouseleave', () => {
            orb.classList.remove('floating');
        });
    });
}

function activateColorOrb(orb, color, e) {
    // Pulse animation
    orb.classList.add('active');
    
    // Create color wave
    const wave = document.createElement('div');
    wave.className = 'color-wave';
    wave.style.width = '80px';
    wave.style.height = '80px';
    wave.style.background = color;
    wave.style.left = orb.offsetLeft + 'px';
    wave.style.top = orb.offsetTop + 'px';
    
    orb.parentElement.appendChild(wave);
    
    // Apply color to background temporarily
    const originalBg = orb.parentElement.style.background;
    orb.parentElement.style.transition = 'background 0.5s ease';
    orb.parentElement.style.background = `radial-gradient(circle at ${e.offsetX}px ${e.offsetY}px, ${color}22, transparent)`;
    
    setTimeout(() => {
        orb.classList.remove('active');
        wave.remove();
        orb.parentElement.style.background = originalBg;
    }, 1200 / app.animationSpeed);
}

// ==========================================
// HOVER CARD INTERACTIONS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const hoverCards = document.querySelectorAll('.hover-card');
    
    hoverCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.add('wobble');
            
            setTimeout(() => {
                card.classList.remove('wobble');
            }, 800 / app.animationSpeed);
        });

        // 3D tilt effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
});

// ==========================================
// SECTION INTERACTIONS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.animation-section');
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-in-up');
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Initialize Liquid Simulation
    initLiquidSimulation();
});

// ==========================================
// LIQUID SIMULATION
// ==========================================
function initLiquidSimulation() {
    const liquidCanvas = document.getElementById('liquid-canvas');
    if (!liquidCanvas) return;
    
    const blobs = [];
    const blobCount = 5;
    
    // Create blobs
    for (let i = 0; i < blobCount; i++) {
        const blob = document.createElement('div');
        blob.className = 'liquid-blob';
        blob.style.width = `${app.random(60, 120)}px`;
        blob.style.height = blob.style.width;
        blob.style.left = `${app.random(0, 100)}%`;
        blob.style.top = `${app.random(0, 100)}%`;
        
        const hue = app.random(200, 280);
        blob.style.background = `radial-gradient(circle, hsl(${hue}, 70%, 60%), hsl(${hue + 30}, 70%, 50%))`;
        
        liquidCanvas.appendChild(blob);
        blobs.push({ element: blob, x: parseFloat(blob.style.left), y: parseFloat(blob.style.top) });
    }
    
    // Mouse tracking
    liquidCanvas.addEventListener('mousemove', throttle((e) => {
        const rect = liquidCanvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
        
        blobs.forEach((blob, index) => {
            const dx = mouseX - blob.x;
            const dy = mouseY - blob.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 30) {
                // Repel blobs
                blob.x -= dx * 0.5;
                blob.y -= dy * 0.5;
            } else {
                // Slowly move towards mouse
                blob.x += dx * 0.01;
                blob.y += dy * 0.01;
            }
            
            // Keep within bounds
            blob.x = clamp(blob.x, 0, 100);
            blob.y = clamp(blob.y, 0, 100);
            
            blob.element.style.left = `${blob.x}%`;
            blob.element.style.top = `${blob.y}%`;
        });
        
        app.incrementInteraction();
    }, 50));
}

// ==========================================
// ADDITIONAL INTERACTIONS
// ==========================================

// Double-click anywhere for random effects
document.addEventListener('dblclick', (e) => {
    if (e.target === document.body || e.target.classList.contains('main-content')) {
        createRandomEffect(e);
    }
});

function createRandomEffect(e) {
    const effects = [
        () => createConfetti(e),
        () => createStarburst(e),
        () => createRingExpansion(e)
    ];
    
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    randomEffect();
}

function createConfetti(e) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8'];
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = app.random(100, 200);
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 100;
        
        confetti.style.setProperty('--tx', `${tx}px`);
        confetti.style.setProperty('--ty', `${ty}px`);
        confetti.classList.add('particle');
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 1000);
    }
}

function createStarburst(e) {
    for (let i = 0; i < 8; i++) {
        const line = document.createElement('div');
        line.style.cssText = `
            position: fixed;
            width: 3px;
            height: 100px;
            background: linear-gradient(to bottom, ${app.getRandomColor()}, transparent);
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            transform-origin: top center;
            transform: rotate(${i * 45}deg);
            pointer-events: none;
            z-index: 9999;
            animation: fadeOut 0.8s ease-out forwards;
        `;
        
        document.body.appendChild(line);
        
        setTimeout(() => line.remove(), 800);
    }
}

function createRingExpansion(e) {
    for (let i = 0; i < 3; i++) {
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 3px solid ${app.getRandomColor()};
            border-radius: 50%;
            left: ${e.clientX - 10}px;
            top: ${e.clientY - 10}px;
            pointer-events: none;
            z-index: 9999;
            animation: ripple ${1 + i * 0.3}s ease-out forwards;
        `;
        
        setTimeout(() => {
            document.body.appendChild(ring);
            setTimeout(() => ring.remove(), (1 + i * 0.3) * 1000);
        }, i * 200);
    }
}

// Mouse trail effect (optional, can be toggled)
let mouseTrailEnabled = false;

document.addEventListener('mousemove', throttle((e) => {
    if (mouseTrailEnabled) {
        const trail = document.createElement('div');
        trail.style.cssText = `
            position: fixed;
            width: 5px;
            height: 5px;
            background: ${app.getRandomColor()};
            border-radius: 50%;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            pointer-events: none;
            z-index: 9998;
            animation: fadeOut 0.5s ease-out forwards;
        `;
        
        document.body.appendChild(trail);
        
        setTimeout(() => trail.remove(), 500);
    }
}, 50));

// Toggle mouse trail with 'T' key
document.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') {
        mouseTrailEnabled = !mouseTrailEnabled;
        app.showNotification(mouseTrailEnabled ? 'Mouse trail enabled' : 'Mouse trail disabled');
    }
});

// ==========================================
// PERFORMANCE OPTIMIZATION
// ==========================================

// Limit number of active animations
const MAX_ACTIVE_ELEMENTS = 50;

function cleanupOldElements(container, className) {
    const elements = container.querySelectorAll(`.${className}`);
    if (elements.length > MAX_ACTIVE_ELEMENTS) {
        const excess = elements.length - MAX_ACTIVE_ELEMENTS;
        for (let i = 0; i < excess; i++) {
            elements[i].remove();
        }
    }
}

// Clean up periodically
setInterval(() => {
    const rippleCanvas = document.getElementById('ripple-canvas');
    const particleCanvas = document.getElementById('particle-canvas');
    const ballsCanvas = document.getElementById('balls-canvas');
    
    if (rippleCanvas) cleanupOldElements(rippleCanvas, 'ripple');
    if (particleCanvas) cleanupOldElements(particleCanvas, 'particle');
    if (ballsCanvas) cleanupOldElements(ballsCanvas, 'ball');
}, 5000);
