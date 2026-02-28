// Ambient Focus Room - Main JavaScript

// State management
const focusState = {
    focusLevel: 65, // 0-100
    distractionLevel: 'Low',
    environmentCalm: 'High',
    focusTime: 0, // in seconds
    roomState: 'Calm',
    focusStreak: 0, // in seconds
    isDeepFocus: false,
    lastInteraction: Date.now(),
    particles: [],
    focusRing: null
};

// DOM Elements
let focusMeterBar, focusFill, focusValue, distractionValue, environmentValue, timeValue;
let distractionIcon, environmentIcon, timeIcon;
let ambientLightSlider, soundLevelSlider, motionSpeedSlider;
let lightValue, soundValue, motionValue;
let roomStateEl, focusStreakEl;
let focusNotification, notificationText;
let activityCards, focusModeBtn, resetBtn;

// Initialize the application
function init() {
    // Get DOM elements
    focusMeterBar = document.getElementById('focus-meter-bar');
    focusFill = document.getElementById('focus-fill');
    focusValue = document.getElementById('focus-value');
    distractionValue = document.getElementById('distraction-value');
    environmentValue = document.getElementById('environment-value');
    timeValue = document.getElementById('time-value');
    
    distractionIcon = document.getElementById('distraction-icon');
    environmentIcon = document.getElementById('environment-icon');
    timeIcon = document.getElementById('time-icon');
    
    ambientLightSlider = document.getElementById('ambient-light');
    soundLevelSlider = document.getElementById('sound-level');
    motionSpeedSlider = document.getElementById('motion-speed');
    
    lightValue = document.getElementById('light-value');
    soundValue = document.getElementById('sound-value');
    motionValue = document.getElementById('motion-value');
    
    roomStateEl = document.getElementById('room-state');
    focusStreakEl = document.getElementById('focus-streak');
    
    focusNotification = document.getElementById('focus-notification');
    notificationText = document.getElementById('notification-text');
    
    activityCards = document.querySelectorAll('.activity-card');
    focusModeBtn = document.getElementById('btn-focus-mode');
    resetBtn = document.getElementById('btn-reset');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize background animations
    initParticles();
    initFocusRing();
    
    // Start focus timer
    startFocusTimer();
    
    // Initial update
    updateFocusDisplay();
    updateSliders();
    
    // Simulate some initial activity
    simulateInitialActivity();
}

// Set up event listeners
function setupEventListeners() {
    // Slider events
    ambientLightSlider.addEventListener('input', () => {
        lightValue.textContent = `${ambientLightSlider.value}%`;
        updateEnvironment();
    });
    
    soundLevelSlider.addEventListener('input', () => {
        soundValue.textContent = `${soundLevelSlider.value}%`;
        updateEnvironment();
    });
    
    motionSpeedSlider.addEventListener('input', () => {
        motionValue.textContent = `${motionSpeedSlider.value}%`;
        updateParticlesSpeed();
    });
    
    // Activity card events
    activityCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            activityCards.forEach(c => {
                c.querySelector('.status-indicator').classList.remove('active');
            });
            
            // Add active class to clicked card
            this.querySelector('.status-indicator').classList.add('active');
            
            // Adjust focus based on activity
            const focusLevel = this.dataset.focus;
            adjustFocusForActivity(focusLevel);
            
            // Show notification
            showNotification(`Switched to ${this.querySelector('h3').textContent} mode`);
        });
    });
    
    // Focus mode button
    focusModeBtn.addEventListener('click', toggleDeepFocus);
    
    // Reset button
    resetBtn.addEventListener('click', resetEnvironment);
    
    // Interaction tracking
    document.addEventListener('mousemove', trackInteraction);
    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);
    
    // Window focus tracking
    window.addEventListener('focus', () => {
        focusState.distractionLevel = 'Low';
        updateFocusDisplay();
        showNotification('Window focused - distraction level decreased');
    });
    
    window.addEventListener('blur', () => {
        focusState.distractionLevel = 'High';
        updateFocusDisplay();
        showNotification('Window lost focus - distraction level increased');
    });
}

// Initialize particle system
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random properties
    const size = Math.random() * 10 + 5;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    
    // Apply styles
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background-color: rgba(74, 111, 165, 0.1);
        border-radius: 50%;
        left: ${posX}%;
        top: ${posY}%;
        animation: float ${duration}s infinite ease-in-out ${delay}s;
        pointer-events: none;
    `;
    
    container.appendChild(particle);
    
    // Store particle reference
    focusState.particles.push({
        element: particle,
        speed: duration,
        originalSpeed: duration
    });
}

// Initialize focus ring
function initFocusRing() {
    focusState.focusRing = document.getElementById('focus-ring');
}

// Start focus timer
function startFocusTimer() {
    setInterval(() => {
        focusState.focusTime++;
        focusState.focusStreak++;
        
        // Update time display
        const minutes = Math.floor(focusState.focusTime / 60);
        const seconds = focusState.focusTime % 60;
        timeValue.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update focus streak
        const streakMinutes = Math.floor(focusState.focusStreak / 60);
        focusStreakEl.textContent = `${streakMinutes} min`;
        
        // Gradually increase focus if no distractions
        if (focusState.distractionLevel === 'Low' && focusState.focusLevel < 100) {
            focusState.focusLevel += 0.5;
            updateFocusDisplay();
        }
        
        // Update room state based on focus level
        updateRoomState();
        
        // Occasionally add small distractions
        if (Math.random() < 0.01) {
            simulateDistraction();
        }
        
    }, 1000);
}

// Update focus display
function updateFocusDisplay() {
    // Update focus meter
    focusFill.style.width = `${focusState.focusLevel}%`;
    focusValue.textContent = `${Math.round(focusState.focusLevel)}%`;
    
    // Update focus level color
    updateFocusLevelColor();
    
    // Update other values
    distractionValue.textContent = focusState.distractionLevel;
    environmentValue.textContent = focusState.environmentCalm;
    
    // Update icon colors based on values
    updateIconColors();
    
    // Update room state
    roomStateEl.textContent = focusState.roomState;
}

// Update focus level color
function updateFocusLevelColor() {
    const focusLevel = focusState.focusLevel;
    
    // Remove existing focus classes
    document.body.classList.remove('focus-low', 'focus-medium', 'focus-high', 'focus-peak');
    
    // Add appropriate class
    if (focusLevel < 30) {
        document.body.classList.add('focus-low');
        focusFill.style.background = 'linear-gradient(90deg, var(--low-focus-color), #ffcc80)';
    } else if (focusLevel < 60) {
        document.body.classList.add('focus-medium');
        focusFill.style.background = 'linear-gradient(90deg, var(--low-focus-color), var(--medium-focus-color))';
    } else if (focusLevel < 85) {
        document.body.classList.add('focus-high');
        focusFill.style.background = 'linear-gradient(90deg, var(--medium-focus-color), var(--high-focus-color))';
    } else {
        document.body.classList.add('focus-peak');
        focusFill.style.background = 'linear-gradient(90deg, var(--high-focus-color), var(--peak-focus-color))';
    }
}

// Update icon colors
function updateIconColors() {
    // Distraction icon
    if (focusState.distractionLevel === 'Low') {
        distractionIcon.style.backgroundColor = 'var(--success-color)';
    } else if (focusState.distractionLevel === 'Medium') {
        distractionIcon.style.backgroundColor = 'var(--warning-color)';
    } else {
        distractionIcon.style.backgroundColor = '#f44336';
    }
    
    // Environment icon
    if (focusState.environmentCalm === 'High') {
        environmentIcon.style.backgroundColor = 'var(--success-color)';
    } else if (focusState.environmentCalm === 'Medium') {
        environmentIcon.style.backgroundColor = 'var(--warning-color)';
    } else {
        environmentIcon.style.backgroundColor = '#f44336';
    }
    
    // Time icon - color based on focus streak
    if (focusState.focusStreak > 300) { // 5 minutes
        timeIcon.style.backgroundColor = 'var(--peak-focus-color)';
    } else if (focusState.focusStreak > 120) { // 2 minutes
        timeIcon.style.backgroundColor = 'var(--high-focus-color)';
    } else {
        timeIcon.style.backgroundColor = 'var(--medium-focus-color)';
    }
}

// Update sliders display
function updateSliders() {
    lightValue.textContent = `${ambientLightSlider.value}%`;
    soundValue.textContent = `${soundLevelSlider.value}%`;
    motionValue.textContent = `${motionSpeedSlider.value}%`;
}

// Update environment based on slider values
function updateEnvironment() {
    const lightLevel = parseInt(ambientLightSlider.value);
    const soundLevel = parseInt(soundLevelSlider.value);
    
    // Update light beam opacity
    const lightBeam = document.getElementById('light-beam');
    lightBeam.style.opacity = lightLevel / 200 + 0.3;
    
    // Update environment calm level based on sound
    if (soundLevel < 30) {
        focusState.environmentCalm = 'High';
    } else if (soundLevel < 70) {
        focusState.environmentCalm = 'Medium';
    } else {
        focusState.environmentCalm = 'Low';
    }
    
    updateFocusDisplay();
}

// Update particles speed based on motion slider
function updateParticlesSpeed() {
    const motionLevel = parseInt(motionSpeedSlider.value);
    const speedFactor = motionLevel / 50; // 0.0 to 2.0
    
    focusState.particles.forEach(particle => {
        const newSpeed = particle.originalSpeed / speedFactor;
        particle.element.style.animationDuration = `${newSpeed}s`;
    });
}

// Adjust focus for selected activity
function adjustFocusForActivity(focusLevel) {
    let targetFocus;
    
    switch(focusLevel) {
        case 'low':
            targetFocus = 40;
            focusState.environmentCalm = 'High';
            break;
        case 'medium':
            targetFocus = 65;
            focusState.environmentCalm = 'Medium';
            break;
        case 'high':
            targetFocus = 85;
            focusState.environmentCalm = 'Low';
            break;
    }
    
    // Animate focus change
    animateFocusChange(targetFocus);
}

// Animate focus change
function animateFocusChange(targetFocus) {
    const startFocus = focusState.focusLevel;
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        focusState.focusLevel = startFocus + (targetFocus - startFocus) * easeProgress;
        updateFocusDisplay();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Toggle deep focus mode
function toggleDeepFocus() {
    focusState.isDeepFocus = !focusState.isDeepFocus;
    
    if (focusState.isDeepFocus) {
        // Enter deep focus
        focusModeBtn.innerHTML = '<i class="fas fa-times"></i> Exit Deep Focus';
        focusModeBtn.style.backgroundColor = '#2e7d32';
        
        // Set environment for deep focus
        ambientLightSlider.value = 40;
        soundLevelSlider.value = 20;
        motionSpeedSlider.value = 30;
        
        updateSliders();
        updateEnvironment();
        updateParticlesSpeed();
        
        // Adjust focus
        animateFocusChange(90);
        focusState.distractionLevel = 'Low';
        
        showNotification('Entered deep focus mode');
    } else {
        // Exit deep focus
        focusModeBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Enter Deep Focus';
        focusModeBtn.style.backgroundColor = '';
        
        // Reset to medium settings
        ambientLightSlider.value = 70;
        soundLevelSlider.value = 40;
        motionSpeedSlider.value = 50;
        
        updateSliders();
        updateEnvironment();
        updateParticlesSpeed();
        
        // Adjust focus
        animateFocusChange(65);
        
        showNotification('Exited deep focus mode');
    }
    
    updateFocusDisplay();
}

// Reset environment to default
function resetEnvironment() {
    // Reset sliders
    ambientLightSlider.value = 70;
    soundLevelSlider.value = 40;
    motionSpeedSlider.value = 50;
    
    updateSliders();
    updateEnvironment();
    updateParticlesSpeed();
    
    // Reset focus state
    focusState.focusLevel = 65;
    focusState.distractionLevel = 'Low';
    focusState.environmentCalm = 'High';
    focusState.isDeepFocus = false;
    
    // Update UI
    focusModeBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Enter Deep Focus';
    focusModeBtn.style.backgroundColor = '';
    
    // Reset activity cards
    activityCards.forEach((card, index) => {
        const indicator = card.querySelector('.status-indicator');
        indicator.classList.toggle('active', index === 0);
    });
    
    updateFocusDisplay();
    showNotification('Environment reset to default');
}

// Track user interaction
function trackInteraction() {
    focusState.lastInteraction = Date.now();
    
    // Small focus boost on interaction
    if (focusState.focusLevel < 95) {
        focusState.focusLevel += 0.5;
        updateFocusDisplay();
    }
    
    // Show focus ring at cursor position
    showFocusRing(event.clientX, event.clientY);
}

// Show focus ring at position
function showFocusRing(x, y) {
    const ring = focusState.focusRing;
    
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.style.width = '50px';
    ring.style.height = '50px';
    ring.style.opacity = '1';
    ring.style.borderColor = 'rgba(74, 111, 165, 0.3)';
    
    // Animate ring
    ring.style.transition = 'all 0.3s ease';
    
    // Expand and fade out
    setTimeout(() => {
        ring.style.width = '100px';
        ring.style.height = '100px';
        ring.style.opacity = '0';
    }, 10);
    
    // Reset after animation
    setTimeout(() => {
        ring.style.transition = 'none';
        ring.style.opacity = '0';
    }, 500);
}

// Update room state based on focus level
function updateRoomState() {
    const focusLevel = focusState.focusLevel;
    
    if (focusLevel < 30) {
        focusState.roomState = 'Distracted';
    } else if (focusLevel < 60) {
        focusState.roomState = 'Calm';
    } else if (focusLevel < 85) {
        focusState.roomState = 'Focused';
    } else {
        focusState.roomState = 'Flow State';
    }
    
    roomStateEl.textContent = focusState.roomState;
}

// Show notification
function showNotification(message) {
    notificationText.textContent = message;
    focusNotification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        focusNotification.classList.remove('show');
    }, 3000);
}

// Simulate initial activity
function simulateInitialActivity() {
    // Set first activity as active
    activityCards[0].querySelector('.status-indicator').classList.add('active');
    
    // Show welcome notification after a delay
    setTimeout(() => {
        showNotification('Welcome to the Ambient Focus Room. Adjust settings to match your focus needs.');
    }, 1000);
    
    // Simulate some initial focus changes
    setTimeout(() => {
        animateFocusChange(70);
        showNotification('Focus level adjusting to your activity');
    }, 2000);
}

// Simulate occasional distractions
function simulateDistraction() {
    if (focusState.isDeepFocus) return; // No distractions in deep focus mode
    
    const distractions = [
        { level: 'Medium', message: 'Minor distraction detected' },
        { level: 'High', message: 'Significant distraction detected' }
    ];
    
    const distraction = distractions[Math.floor(Math.random() * distractions.length)];
    
    focusState.distractionLevel = distraction.level;
    focusState.focusLevel = Math.max(0, focusState.focusLevel - 10);
    
    updateFocusDisplay();
    showNotification(distraction.message);
    
    // Return to low distraction after a while
    setTimeout(() => {
        if (focusState.distractionLevel === distraction.level) {
            focusState.distractionLevel = 'Low';
            updateFocusDisplay();
            showNotification('Distraction cleared');
        }
    }, 5000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);