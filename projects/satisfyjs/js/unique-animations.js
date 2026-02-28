// ==========================================
// UNIQUE ANIMATIONS - Advanced Features
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initParticleNetwork();
    initFireworks();
    initTextScrambler();
    initKaleidoscope();
    initGravitySandbox();
    initConstellationDrawer();
    initPaintSplatter();
});

// ==========================================
// PARTICLE NETWORK
// ==========================================
function initParticleNetwork() {
    const canvas = document.getElementById('network-canvas-element');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    const particleCount = 50;
    const maxDistance = 150;
    let mouse = { x: -1000, y: -1000 };
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.radius = Math.random() * 3 + 2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            // Mouse attraction
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 100) {
                this.vx += dx * 0.0001;
                this.vy += dy * 0.0001;
            }
            
            // Limit velocity
            const maxSpeed = 2;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#667eea';
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Mouse tracking
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });
    
    // Animation loop
    function animate() {
        ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < maxDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(102, 126, 234, ${1 - dist / maxDistance})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ==========================================
// FIREWORKS DISPLAY
// ==========================================
function initFireworks() {
    const canvas = document.getElementById('fireworks-canvas-element');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const fireworks = [];
    const particles = [];
    let isLaunching = false;
    let launchInterval;
    
    class Firework {
        constructor(x, targetY) {
            this.x = x;
            this.y = canvas.height;
            this.targetY = targetY;
            this.speed = 5;
            this.exploded = false;
            this.hue = Math.random() * 360;
        }
        
        update() {
            if (!this.exploded) {
                this.y -= this.speed;
                
                if (this.y <= this.targetY) {
                    this.explode();
                }
            }
        }
        
        draw() {
            if (!this.exploded) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
                ctx.fill();
            }
        }
        
        explode() {
            this.exploded = true;
            const particleCount = 100;
            
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(this.x, this.y, this.hue));
            }
            
            app.incrementAnimation();
        }
    }
    
    class Particle {
        constructor(x, y, hue) {
            this.x = x;
            this.y = y;
            this.hue = hue + Math.random() * 50 - 25;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.01;
        }
        
        update() {
            this.vx *= 0.98;
            this.vy *= 0.98;
            this.vy += 0.1; // Gravity
            
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
            ctx.fill();
        }
    }
    
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const targetY = Math.random() * canvas.height * 0.4 + 50;
        
        fireworks.push(new Firework(x, targetY));
        isLaunching = true;
        app.incrementInteraction();
        
        // Continuous launch while holding
        launchInterval = setInterval(() => {
            const x = Math.random() * canvas.width;
            const targetY = Math.random() * canvas.height * 0.4 + 50;
            fireworks.push(new Firework(x, targetY));
        }, 300);
    });
    
    canvas.addEventListener('mouseup', () => {
        isLaunching = false;
        clearInterval(launchInterval);
    });
    
    function animate() {
        ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            fireworks[i].draw();
            
            if (fireworks[i].exploded) {
                fireworks.splice(i, 1);
            }
        }
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ==========================================
// TEXT SCRAMBLER (Matrix Effect)
// ==========================================
function initTextScrambler() {
    const input = document.getElementById('scrambler-input');
    const output = document.getElementById('scrambler-output');
    if (!input || !output) return;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    let targetText = 'SATISFYJS';
    
    function scrambleText(target) {
        const duration = 2000;
        const startTime = Date.now();
        
        output.classList.add('scrambling');
        
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            let result = '';
            
            for (let i = 0; i < target.length; i++) {
                if (progress * target.length > i) {
                    result += target[i];
                } else {
                    result += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            
            output.textContent = result;
            
            if (progress === 1) {
                clearInterval(interval);
                output.classList.remove('scrambling');
                output.textContent = target;
            }
        }, 50);
    }
    
    input.addEventListener('input', (e) => {
        targetText = e.target.value.toUpperCase() || 'SATISFYJS';
        scrambleText(targetText);
        app.incrementInteraction();
    });
    
    // Initial scramble
    scrambleText(targetText);
}

// ==========================================
// KALEIDOSCOPE MIRROR
// ==========================================
function initKaleidoscope() {
    const canvas = document.getElementById('kaleidoscope-canvas-element');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const slices = 12;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    function drawMirror(x, y, prevX, prevY) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for (let i = 0; i < slices; i++) {
            const angle = (Math.PI * 2 / slices) * i;
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.moveTo(prevX - centerX, prevY - centerY);
            ctx.lineTo(x - centerX, y - centerY);
            ctx.strokeStyle = `hsl(${(angle * 180 / Math.PI + Date.now() * 0.1) % 360}, 100%, 50%)`;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();
            
            // Mirror flip
            ctx.scale(1, -1);
            ctx.beginPath();
            ctx.moveTo(prevX - centerX, -(prevY - centerY));
            ctx.lineTo(x - centerX, -(y - centerY));
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        app.incrementInteraction();
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        drawMirror(x, y, lastX, lastY);
        
        lastX = x;
        lastY = y;
        app.incrementAnimation();
    });
    
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
    
    // Clear on double click
    canvas.addEventListener('dblclick', () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
}

// ==========================================
// GRAVITY SANDBOX
// ==========================================
function initGravitySandbox() {
    const canvas = document.getElementById('sandbox-canvas-element');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const bodies = [];
    const G = 0.5; // Gravitational constant
    
    class Body {
        constructor(x, y, mass) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.mass = mass;
            this.radius = Math.sqrt(mass) * 3;
            this.hue = Math.random() * 360;
        }
        
        update(bodies) {
            // Calculate gravitational forces
            for (let other of bodies) {
                if (other === this) continue;
                
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);
                
                if (dist > this.radius + other.radius) {
                    const force = (G * this.mass * other.mass) / distSq;
                    const fx = (force * dx) / dist;
                    const fy = (force * dy) / dist;
                    
                    this.vx += fx / this.mass;
                    this.vy += fy / this.mass;
                }
            }
            
            this.x += this.vx;
            this.y += this.vy;
            
            // Bounce off edges
            if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
                this.vx *= -0.8;
                this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            }
            if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
                this.vy *= -0.8;
                this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, `hsl(${this.hue}, 100%, 70%)`);
            gradient.addColorStop(1, `hsl(${this.hue}, 100%, 40%)`);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Glow effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const mass = Math.random() * 50 + 20;
        
        bodies.push(new Body(x, y, mass));
        app.incrementAnimation();
        app.incrementInteraction();
        
        // Limit number of bodies
        if (bodies.length > 15) {
            bodies.shift();
        }
    });
    
    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 17, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        bodies.forEach(body => {
            body.update(bodies);
            body.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ==========================================
// CONSTELLATION DRAWER
// ==========================================
function initConstellationDrawer() {
    const canvas = document.getElementById('constellation-canvas-element');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const stars = [];
    const maxConnectionDistance = 150;
    
    class Star {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = Math.random() * 3 + 2;
            this.twinkle = Math.random() * Math.PI * 2;
        }
        
        update() {
            this.twinkle += 0.05;
        }
        
        draw() {
            const brightness = (Math.sin(this.twinkle) + 1) / 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + brightness * 0.5})`;
            ctx.fill();
            
            // Star glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        stars.push(new Star(x, y));
        app.incrementAnimation();
        app.incrementInteraction();
    });
    
    // Clear on double click
    canvas.addEventListener('dblclick', () => {
        stars.length = 0;
    });
    
    function animate() {
        ctx.fillStyle = 'rgba(0, 4, 40, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < maxConnectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / maxConnectionDistance})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        
        // Update and draw stars
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ==========================================
// PAINT SPLATTER
// ==========================================
function initPaintSplatter() {
    const canvas = document.getElementById('splatter-canvas-element');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    
    function createSplatter(x, y, intensity = 1) {
        const droplets = 50 * intensity;
        const baseHue = Math.random() * 360;
        
        for (let i = 0; i < droplets; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 * intensity;
            const x2 = x + Math.cos(angle) * distance;
            const y2 = y + Math.sin(angle) * distance;
            const radius = Math.random() * 8 * intensity + 2;
            
            ctx.beginPath();
            ctx.arc(x2, y2, radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${baseHue + Math.random() * 30}, 70%, 50%, ${0.3 + Math.random() * 0.4})`;
            ctx.fill();
            
            // Paint drips
            if (Math.random() > 0.7) {
                ctx.beginPath();
                ctx.moveTo(x2, y2);
                ctx.lineTo(x2 + (Math.random() - 0.5) * 10, y2 + Math.random() * 30);
                ctx.strokeStyle = ctx.fillStyle;
                ctx.lineWidth = Math.random() * 3 + 1;
                ctx.stroke();
            }
        }
        
        app.incrementAnimation();
    }
    
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        dragStartX = e.clientX - rect.left;
        dragStartY = e.clientY - rect.top;
        
        createSplatter(dragStartX, dragStartY, 1);
        app.incrementInteraction();
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const dx = x - dragStartX;
        const dy = y - dragStartY;
        const intensity = Math.min(Math.sqrt(dx * dx + dy * dy) / 100, 3);
        
        createSplatter(x, y, intensity);
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    // Clear on double click
    canvas.addEventListener('dblclick', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}
