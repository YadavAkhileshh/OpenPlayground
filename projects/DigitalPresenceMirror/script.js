// Digital Presence Mirror
// Main script for interactive visualization

document.addEventListener('DOMContentLoaded', function() {
    // Get canvas and context
    const canvas = document.getElementById('mirrorCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    // Initialize canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Sound effect
    const soundEffect = document.getElementById('soundEffect');
    const soundToggle = document.getElementById('soundToggle');
    
    // Control elements
    const resetBtn = document.getElementById('resetBtn');
    const modeBtn = document.getElementById('modeBtn');
    const particlesToggle = document.getElementById('particlesToggle');
    
    // Stats elements
    const activityBar = document.getElementById('activityBar');
    const activityValue = document.getElementById('activityValue');
    const colorBar = document.getElementById('colorBar');
    const colorValue = document.getElementById('colorValue');
    const speedBar = document.getElementById('speedBar');
    const speedValue = document.getElementById('speedValue');
    
    // Visualization state
    let state = {
        mode: 0, // 0: fluid, 1: geometric, 2: particle
        particlesEnabled: true,
        interactionLevel: 75,
        colorIntensity: 60,
        motionSpeed: 85,
        lastInteraction: Date.now(),
        idleTimer: 0
    };
    
    // Interaction tracking
    let mouse = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        isDown: false
    };
    
    // Visual elements
    let waves = [];
    let shapes = [];
    let particles = [];
    let trails = [];
    
    // Color palette
    const colorPalettes = [
        ['#6a11cb', '#2575fc', '#00b4db', '#a8edea'], // Cool colors
        ['#ff416c', '#ff4b2b', '#ff9966', '#ff5e62'], // Warm colors
        ['#00b09b', '#96c93d', '#f9ff00', '#ffef00'], // Natural colors
        ['#834d9b', '#d04ed6', '#f271b2', '#f5af19']  // Vibrant colors
    ];
    
    let currentPalette = 0;
    
    // Initialize visual elements
    function init() {
        waves = [];
        shapes = [];
        particles = [];
        trails = [];
        
        // Create initial waves
        for (let i = 0; i < 5; i++) {
            waves.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 10 + Math.random() * 50,
                maxRadius: 100 + Math.random() * 200,
                speed: 0.5 + Math.random() * 1,
                thickness: 1 + Math.random() * 3,
                color: getRandomColor(),
                life: 1
            });
        }
        
        // Create initial shapes
        for (let i = 0; i < 8; i++) {
            createRandomShape();
        }
        
        // Update stats display
        updateStats();
    }
    
    // Get a random color from current palette
    function getRandomColor() {
        const palette = colorPalettes[currentPalette];
        return palette[Math.floor(Math.random() * palette.length)];
    }
    
    // Create a random shape
    function createRandomShape(x, y) {
        const shapeTypes = ['circle', 'triangle', 'square', 'pentagon', 'hexagon'];
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        shapes.push({
            x: x || Math.random() * canvas.width,
            y: y || Math.random() * canvas.height,
            size: 20 + Math.random() * 60,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: -0.02 + Math.random() * 0.04,
            color: getRandomColor(),
            type: type,
            life: 1,
            pulse: 0,
            pulseSpeed: 0.05 + Math.random() * 0.1
        });
    }
    
    // Create particle burst
    function createParticleBurst(x, y, count = 30) {
        if (!state.particlesEnabled) return;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 6,
                color: getRandomColor(),
                life: 1,
                decay: 0.005 + Math.random() * 0.01
            });
        }
    }
    
    // Create a wave at position
    function createWave(x, y) {
        waves.push({
            x: x,
            y: y,
            radius: 10,
            maxRadius: 150 + Math.random() * 200,
            speed: 1 + Math.random() * 2,
            thickness: 1 + Math.random() * 4,
            color: getRandomColor(),
            life: 1
        });
        
        // Play sound if enabled
        if (soundToggle.checked) {
            soundEffect.currentTime = 0;
            soundEffect.play().catch(e => console.log("Audio play failed:", e));
        }
    }
    
    // Add mouse trail point
    function addTrailPoint(x, y) {
        trails.push({
            x: x,
            y: y,
            life: 1,
            size: 10 + Math.random() * 15
        });
        
        // Limit trail length
        if (trails.length > 20) {
            trails.shift();
        }
    }
    
    // Update stats based on activity
    function updateStats() {
        // Update interaction level based on idle time
        const idleTime = Date.now() - state.lastInteraction;
        state.interactionLevel = Math.max(20, 100 - (idleTime / 10000) * 80);
        
        // Update color intensity based on mouse movement
        state.colorIntensity = 40 + (state.interactionLevel / 100) * 60;
        
        // Update motion speed based on idle time
        state.motionSpeed = Math.max(30, 100 - (idleTime / 20000) * 70);
        
        // Update visual indicators
        activityBar.style.width = `${state.interactionLevel}%`;
        activityValue.textContent = `${Math.round(state.interactionLevel)}%`;
        
        colorBar.style.width = `${state.colorIntensity}%`;
        colorValue.textContent = `${Math.round(state.colorIntensity)}%`;
        
        speedBar.style.width = `${state.motionSpeed}%`;
        speedValue.textContent = `${Math.round(state.motionSpeed)}%`;
    }
    
    // Draw wave
    function drawWave(wave) {
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.thickness;
        ctx.globalAlpha = wave.life;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    // Draw shape
    function drawShape(shape) {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        ctx.fillStyle = shape.color;
        ctx.globalAlpha = shape.life;
        
        // Add pulsing effect
        const pulseEffect = Math.sin(shape.pulse) * 5;
        
        switch(shape.type) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, shape.size / 2 + pulseEffect, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -shape.size / 2 - pulseEffect);
                ctx.lineTo(shape.size / 2 + pulseEffect, shape.size / 3);
                ctx.lineTo(-shape.size / 2 - pulseEffect, shape.size / 3);
                ctx.closePath();
                ctx.fill();
                break;
            case 'square':
                ctx.fillRect(-shape.size / 2 - pulseEffect/2, -shape.size / 2 - pulseEffect/2, 
                           shape.size + pulseEffect, shape.size + pulseEffect);
                break;
            case 'pentagon':
                drawPolygon(0, 0, shape.size / 2 + pulseEffect, 5);
                break;
            case 'hexagon':
                drawPolygon(0, 0, shape.size / 2 + pulseEffect, 6);
                break;
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
    
    // Draw polygon helper
    function drawPolygon(x, y, radius, sides) {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw particle
    function drawParticle(particle) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    // Draw trail
    function drawTrail(trail) {
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
        ctx.fillStyle = getRandomColor();
        ctx.globalAlpha = trail.life * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    // Update all elements
    function update() {
        // Update idle timer
        state.idleTimer++;
        
        // Update waves
        for (let i = waves.length - 1; i >= 0; i--) {
            const wave = waves[i];
            wave.radius += wave.speed * (state.motionSpeed / 100);
            wave.life = 1 - (wave.radius / wave.maxRadius);
            
            // Remove dead waves
            if (wave.radius > wave.maxRadius) {
                waves.splice(i, 1);
            }
        }
        
        // Update shapes
        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            shape.rotation += shape.rotationSpeed * (state.motionSpeed / 100);
            shape.pulse += shape.pulseSpeed;
            
            // Slowly fade out shapes
            shape.life -= 0.0005;
            
            // Remove dead shapes
            if (shape.life <= 0) {
                shapes.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.x += particle.vx * (state.motionSpeed / 100);
            particle.y += particle.vy * (state.motionSpeed / 100);
            particle.life -= particle.decay;
            
            // Apply gravity
            particle.vy += 0.05;
            
            // Remove dead particles
            if (particle.life <= 0 || 
                particle.x < 0 || particle.x > canvas.width || 
                particle.y < 0 || particle.y > canvas.height) {
                particles.splice(i, 1);
            }
        }
        
        // Update trails
        for (let i = trails.length - 1; i >= 0; i--) {
            const trail = trails[i];
            trail.life -= 0.03;
            trail.size *= 0.95;
            
            // Remove dead trails
            if (trail.life <= 0) {
                trails.splice(i, 1);
            }
        }
        
        // Update stats
        updateStats();
    }
    
    // Draw everything
    function draw() {
        // Clear canvas with a subtle fade effect
        ctx.fillStyle = 'rgba(10, 10, 21, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a background grid
        drawGrid();
        
        // Draw all elements
        trails.forEach(drawTrail);
        waves.forEach(drawWave);
        shapes.forEach(drawShape);
        particles.forEach(drawParticle);
        
        // Draw mouse interaction effect if mouse is down
        if (mouse.isDown) {
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
            ctx.fillStyle = getRandomColor();
            ctx.globalAlpha = 0.3;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Draw central point
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
    
    // Draw a subtle grid in the background
    function drawGrid() {
        const gridSize = 40;
        const gridOpacity = 0.05;
        
        ctx.strokeStyle = `rgba(100, 100, 255, ${gridOpacity})`;
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    // Main animation loop
    function animate() {
        update();
        draw();
        requestAnimationFrame(animate);
    }
    
    // Event listeners
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        
        // Update last interaction time
        state.lastInteraction = Date.now();
        
        // Add trail point
        addTrailPoint(mouse.x, mouse.y);
        
        // Occasionally create waves on mouse movement
        if (Math.random() < 0.1) {
            createWave(mouse.x + (Math.random() * 40 - 20), mouse.y + (Math.random() * 40 - 20));
        }
    });
    
    canvas.addEventListener('mousedown', function() {
        mouse.isDown = true;
        state.lastInteraction = Date.now();
        
        // Create wave at click position
        createWave(mouse.x, mouse.y);
        
        // Create particle burst
        createParticleBurst(mouse.x, mouse.y, 50);
        
        // Create new shape
        createRandomShape(mouse.x, mouse.y);
    });
    
    canvas.addEventListener('mouseup', function() {
        mouse.isDown = false;
        state.lastInteraction = Date.now();
    });
    
    canvas.addEventListener('click', function() {
        state.lastInteraction = Date.now();
    });
    
    // Keyboard interaction
    document.addEventListener('keydown', function() {
        state.lastInteraction = Date.now();
        
        // Create particle burst at random position
        createParticleBurst(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            40
        );
        
        // Create multiple waves
        for (let i = 0; i < 3; i++) {
            createWave(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            );
        }
    });
    
    // Reset button
    resetBtn.addEventListener('click', function() {
        init();
        state.lastInteraction = Date.now();
    });
    
    // Mode button
    modeBtn.addEventListener('click', function() {
        currentPalette = (currentPalette + 1) % colorPalettes.length;
        state.mode = (state.mode + 1) % 3;
        
        // Update button text based on mode
        const modeText = ['Fluid Mode', 'Geometric Mode', 'Particle Mode'];
        modeBtn.innerHTML = `<i class="fas fa-palette"></i> ${modeText[state.mode]}`;
        
        state.lastInteraction = Date.now();
    });
    
    // Particles toggle
    particlesToggle.addEventListener('change', function() {
        state.particlesEnabled = particlesToggle.checked;
        state.lastInteraction = Date.now();
    });
    
    // Initialize and start animation
    init();
    animate();
    
    // Update stats every second
    setInterval(updateStats, 1000);
});