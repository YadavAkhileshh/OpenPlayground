document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const cursor = document.getElementById('cursor');
    const playground = document.getElementById('playground');
    const cursorPos = document.getElementById('cursor-pos');
    
    // Control elements
    const massSlider = document.getElementById('mass');
    const frictionSlider = document.getElementById('friction');
    const gravitySlider = document.getElementById('gravity');
    const springSlider = document.getElementById('spring');
    const trailToggle = document.getElementById('trail-toggle');
    const resetBtn = document.getElementById('reset-btn');
    
    // Value displays
    const massValue = document.getElementById('mass-value');
    const frictionValue = document.getElementById('friction-value');
    const gravityValue = document.getElementById('gravity-value');
    const springValue = document.getElementById('spring-value');
    
    // Physics properties
    let physics = {
        mass: 1.0,
        friction: 0.15,
        gravity: 0.3,
        spring: 0.1,
        trail: false
    };
    
    // Cursor state
    let cursorState = {
        x: playground.offsetWidth / 2,
        y: playground.offsetHeight / 2,
        vx: 0,
        vy: 0,
        targetX: playground.offsetWidth / 2,
        targetY: playground.offsetHeight / 2,
        isMoving: false
    };
    
    // Trail particles
    let trailParticles = [];
    const maxTrailLength = 20;
    
    // Initialize cursor position
    cursor.style.left = cursorState.x + 'px';
    cursor.style.top = cursorState.y + 'px';
    
    // Update control displays
    function updateDisplays() {
        massValue.textContent = physics.mass.toFixed(1);
        frictionValue.textContent = physics.friction.toFixed(2);
        gravityValue.textContent = physics.gravity.toFixed(2);
        springValue.textContent = physics.spring.toFixed(2);
    }
    
    // Mouse move handler
    playground.addEventListener('mousemove', (e) => {
        const rect = playground.getBoundingClientRect();
        cursorState.targetX = e.clientX - rect.left;
        cursorState.targetY = e.clientY - rect.top;
        cursorState.isMoving = true;
        
        // Update position display
        cursorPos.textContent = `${Math.round(cursorState.targetX)}, ${Math.round(cursorState.targetY)}`;
        
        // Add trail if enabled
        if (physics.trail) {
            addTrailParticle(cursorState.x, cursorState.y);
        }
    });
    
    // Add trail particle
    function addTrailParticle(x, y) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        playground.appendChild(trail);
        
        trailParticles.push({
            element: trail,
            life: 1.0
        });
        
        // Limit trail length
        if (trailParticles.length > maxTrailLength) {
            const oldTrail = trailParticles.shift();
            if (oldTrail.element.parentNode) {
                playground.removeChild(oldTrail.element);
            }
        }
    }
    
    // Update trail particles
    function updateTrail() {
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            const particle = trailParticles[i];
            particle.life -= 0.05;
            
            if (particle.life <= 0) {
                if (particle.element.parentNode) {
                    playground.removeChild(particle.element);
                }
                trailParticles.splice(i, 1);
            } else {
                particle.element.style.opacity = particle.life;
                particle.element.style.transform = `scale(${particle.life})`;
            }
        }
    }
    
    // Clear trail
    function clearTrail() {
        trailParticles.forEach(particle => {
            if (particle.element.parentNode) {
                playground.removeChild(particle.element);
            }
        });
        trailParticles = [];
    }
    
    // Physics update function
    function updatePhysics() {
        // Calculate spring force towards target
        const dx = cursorState.targetX - cursorState.x;
        const dy = cursorState.targetY - cursorState.y;
        
        // Spring force (F = k * x)
        const fx = dx * physics.spring;
        const fy = dy * physics.spring;
        
        // Apply gravity
        const gy = physics.gravity;
        
        // Apply forces with mass
        const ax = fx / physics.mass;
        const ay = (fy + gy) / physics.mass;
        
        // Update velocity with forces and friction
        cursorState.vx += ax;
        cursorState.vy += ay;
        
        // Apply friction
        cursorState.vx *= (1 - physics.friction);
        cursorState.vy *= (1 - physics.friction);
        
        // Update position
        cursorState.x += cursorState.vx;
        cursorState.y += cursorState.vy;
        
        // Boundary collision
        const radius = 15;
        if (cursorState.x < radius) {
            cursorState.x = radius;
            cursorState.vx *= -0.8;
        }
        if (cursorState.x > playground.offsetWidth - radius) {
            cursorState.x = playground.offsetWidth - radius;
            cursorState.vx *= -0.8;
        }
        if (cursorState.y < radius) {
            cursorState.y = radius;
            cursorState.vy *= -0.8;
        }
        if (cursorState.y > playground.offsetHeight - radius) {
            cursorState.y = playground.offsetHeight - radius;
            cursorState.vy *= -0.8;
        }
        
        // Update cursor position
        cursor.style.left = cursorState.x + 'px';
        cursor.style.top = cursorState.y + 'px';
        
        // Update trail
        if (physics.trail) {
            updateTrail();
        }
        
        // Continue animation
        requestAnimationFrame(updatePhysics);
    }
    
    // Control event listeners
    massSlider.addEventListener('input', function() {
        physics.mass = parseFloat(this.value);
        updateDisplays();
    });
    
    frictionSlider.addEventListener('input', function() {
        physics.friction = parseFloat(this.value);
        updateDisplays();
    });
    
    gravitySlider.addEventListener('input', function() {
        physics.gravity = parseFloat(this.value);
        updateDisplays();
    });
    
    springSlider.addEventListener('input', function() {
        physics.spring = parseFloat(this.value);
        updateDisplays();
    });
    
    trailToggle.addEventListener('change', function() {
        physics.trail = this.checked;
        if (!physics.trail) {
            clearTrail();
        }
    });
    
    resetBtn.addEventListener('click', function() {
        // Reset cursor to center
        cursorState.x = playground.offsetWidth / 2;
        cursorState.y = playground.offsetHeight / 2;
        cursorState.vx = 0;
        cursorState.vy = 0;
        cursorState.targetX = cursorState.x;
        cursorState.targetY = cursorState.y;
        
        // Clear trail
        clearTrail();
        
        // Reset physics values to slider positions
        physics.mass = parseFloat(massSlider.value);
        physics.friction = parseFloat(frictionSlider.value);
        physics.gravity = parseFloat(gravitySlider.value);
        physics.spring = parseFloat(springSlider.value);
        
        // Update displays
        updateDisplays();
        
        // Reset trail toggle
        trailToggle.checked = false;
        physics.trail = false;
    });
    
    // Mouse leave playground
    playground.addEventListener('mouseleave', () => {
        cursorState.isMoving = false;
    });
    
    // Initialize displays
    updateDisplays();
    
    // Start physics loop
    updatePhysics();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Keep cursor in bounds if it's out
        const radius = 15;
        if (cursorState.x > playground.offsetWidth - radius) {
            cursorState.x = playground.offsetWidth - radius;
        }
        if (cursorState.y > playground.offsetHeight - radius) {
            cursorState.y = playground.offsetHeight - radius;
        }
    });
});