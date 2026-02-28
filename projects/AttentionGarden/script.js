// Interactive Attention Garden
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const gardenElements = document.querySelectorAll('.garden-element');
    const focusEffect = document.getElementById('focusEffect');
    const particlesContainer = document.getElementById('particles');
    const totalAttentionEl = document.getElementById('totalAttention');
    const gardenHealthEl = document.getElementById('gardenHealth');
    const sessionTimeEl = document.getElementById('sessionTime');
    const focusElementEl = document.getElementById('focusElement');
    const focusMeterEl = document.getElementById('focusMeter');
    const focusLevelEl = document.getElementById('focusLevel');
    const focusTimeEl = document.getElementById('focusTime');
    const resetBtn = document.getElementById('resetGarden');
    const autoWaterBtn = document.getElementById('autoWater');
    const growthBars = document.querySelectorAll('.growth-fill');
    const growthLevels = document.querySelectorAll('.growth-level');

    // Garden State
    const gardenState = {
        totalAttention: 0,
        sessionStart: Date.now(),
        currentFocus: null,
        focusStart: null,
        focusTimer: null,
        elementGrowth: {
            flower: { level: 1, attention: 0, maxAttention: 100 },
            tree: { level: 1, attention: 0, maxAttention: 100 },
            mushroom: { level: 1, attention: 0, maxAttention: 100 },
            pond: { level: 1, attention: 0, maxAttention: 100 },
            butterfly: { level: 1, attention: 0, maxAttention: 100 }
        },
        autoWaterActive: false
    };

    // Initialize the garden
    function initGarden() {
        // Reset all state
        gardenState.totalAttention = 0;
        gardenState.currentFocus = null;
        gardenState.focusStart = null;
        gardenState.sessionStart = Date.now();
        
        Object.keys(gardenState.elementGrowth).forEach(key => {
            gardenState.elementGrowth[key] = {
                level: 1,
                attention: 0,
                maxAttention: 100
            };
        });
        
        // Reset UI
        updateUI();
        updateGrowthBars();
        
        // Reset element sizes
        gardenElements.forEach(element => {
            element.classList.remove('level-2', 'level-3', 'level-4', 'level-5', 'growing');
            element.style.transform = 'scale(1)';
            element.dataset.growth = '1';
        });
        
        // Clear particles
        particlesContainer.innerHTML = '';
        
        // Stop any ongoing focus
        if (gardenState.focusTimer) {
            clearInterval(gardenState.focusTimer);
            gardenState.focusTimer = null;
        }
        
        // Stop auto-water
        gardenState.autoWaterActive = false;
        autoWaterBtn.innerHTML = '<i class="fas fa-tint"></i> Auto-Water (30s)';
        autoWaterBtn.classList.remove('active');
        
        console.log('Garden initialized!');
    }

    // Update all UI elements
    function updateUI() {
        // Update session time
        const sessionSeconds = Math.floor((Date.now() - gardenState.sessionStart) / 1000);
        const minutes = Math.floor(sessionSeconds / 60);
        const seconds = sessionSeconds % 60;
        sessionTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update total attention
        totalAttentionEl.textContent = gardenState.totalAttention;
        
        // Calculate garden health
        let totalGrowth = 0;
        Object.values(gardenState.elementGrowth).forEach(element => {
            totalGrowth += element.level;
        });
        const avgGrowth = totalGrowth / Object.keys(gardenState.elementGrowth).length;
        const health = Math.min(100, Math.round((avgGrowth / 5) * 100));
        gardenHealthEl.textContent = `${health}%`;
        
        // Update garden health color
        if (health >= 80) {
            gardenHealthEl.style.color = '#32CD32';
        } else if (health >= 60) {
            gardenHealthEl.style.color = '#FFA500';
        } else {
            gardenHealthEl.style.color = '#FF6B6B';
        }
    }

    // Update growth progress bars
    function updateGrowthBars() {
        Object.keys(gardenState.elementGrowth).forEach(elementId => {
            const element = gardenState.elementGrowth[elementId];
            const percentage = (element.attention / element.maxAttention) * 100;
            
            // Update progress bar
            const growthBar = document.querySelector(`.growth-fill[data-element="${elementId}"]`);
            if (growthBar) {
                growthBar.style.width = `${percentage}%`;
            }
            
            // Update level text
            const levelText = document.querySelectorAll('.growth-level');
            levelText.forEach(el => {
                const parentElement = el.closest('.element-stat');
                if (parentElement && parentElement.dataset.element === elementId) {
                    el.textContent = `Level ${element.level}`;
                    
                    // Add color based on level
                    if (element.level >= 5) {
                        el.style.color = '#32CD32';
                    } else if (element.level >= 3) {
                        el.style.color = '#FFA500';
                    } else {
                        el.style.color = '#666';
                    }
                }
            });
        });
    }

    // Start focusing on an element
    function startFocus(element) {
        if (gardenState.currentFocus === element.id) return;
        
        // Stop previous focus
        stopFocus();
        
        // Set new focus
        gardenState.currentFocus = element.id;
        gardenState.focusStart = Date.now();
        
        // Update UI
        focusElementEl.textContent = element.querySelector('.element-label').textContent;
        focusElementEl.style.color = '#FF6B6B';
        
        // Add visual feedback
        element.classList.add('growing');
        
        // Start focus timer
        gardenState.focusTimer = setInterval(updateFocus, 100);
        
        // Create focus effect
        showFocusEffect(element);
        
        console.log(`Started focusing on ${element.id}`);
    }

    // Stop focusing on current element
    function stopFocus() {
        if (!gardenState.currentFocus) return;
        
        const element = document.getElementById(gardenState.currentFocus);
        if (element) {
            element.classList.remove('growing');
        }
        
        // Clear timer
        if (gardenState.focusTimer) {
            clearInterval(gardenState.focusTimer);
            gardenState.focusTimer = null;
        }
        
        // Hide focus effect
        hideFocusEffect();
        
        console.log(`Stopped focusing on ${gardenState.currentFocus}`);
        
        // Reset current focus
        gardenState.currentFocus = null;
        gardenState.focusStart = null;
        
        // Reset focus meter
        focusMeterEl.style.width = '0%';
        focusLevelEl.textContent = '0%';
        focusTimeEl.textContent = '0s';
    }

    // Update focus progress
    function updateFocus() {
        if (!gardenState.focusStart || !gardenState.currentFocus) return;
        
        const focusDuration = Date.now() - gardenState.focusStart;
        const focusSeconds = focusDuration / 1000;
        const element = gardenState.elementGrowth[gardenState.currentFocus];
        
        // Calculate focus percentage (max 100%)
        const focusPercent = Math.min(100, Math.floor((focusSeconds / 10) * 100));
        
        // Update UI
        focusMeterEl.style.width = `${focusPercent}%`;
        focusLevelEl.textContent = `${focusPercent}%`;
        focusTimeEl.textContent = `${focusSeconds.toFixed(1)}s`;
        
        // Add attention every second
        if (focusSeconds % 1 < 0.1) {
            addAttention(gardenState.currentFocus, 5);
        }
        
        // Create particles
        if (Math.random() > 0.7) {
            createParticle(gardenState.currentFocus);
        }
    }

    // Add attention to an element
    function addAttention(elementId, amount) {
        const element = gardenState.elementGrowth[elementId];
        if (!element) return;
        
        // Add attention
        element.attention = Math.min(element.maxAttention, element.attention + amount);
        gardenState.totalAttention += amount;
        
        // Check for level up
        if (element.attention >= element.maxAttention) {
            levelUpElement(elementId);
        }
        
        // Update UI
        updateUI();
        updateGrowthBars();
        
        // Visual feedback
        const domElement = document.getElementById(elementId);
        if (domElement) {
            domElement.style.animation = 'none';
            setTimeout(() => {
                domElement.style.animation = '';
            }, 10);
        }
    }

    // Level up an element
    function levelUpElement(elementId) {
        const element = gardenState.elementGrowth[elementId];
        if (element.level >= 5) return; // Max level
        
        // Level up
        element.level++;
        element.attention = 0;
        element.maxAttention = Math.round(element.maxAttention * 1.5);
        
        // Update DOM element
        const domElement = document.getElementById(elementId);
        if (domElement) {
            // Remove old level classes
            domElement.classList.remove('level-2', 'level-3', 'level-4', 'level-5');
            
            // Add new level class
            domElement.classList.add(`level-${element.level}`);
            domElement.dataset.growth = element.level;
            
            // Scale element
            const scale = 1 + (element.level - 1) * 0.2;
            domElement.style.transform = `scale(${scale})`;
            
            // Celebration effect
            createCelebrationParticles(elementId);
            
            console.log(`${elementId} leveled up to level ${element.level}!`);
        }
    }

    // Create celebration particles
    function createCelebrationParticles(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            createParticleAt(centerX, centerY, true);
        }
        
        // Play level up sound (simulated)
        playLevelUpSound();
    }

    // Create a particle
    function createParticle(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        
        createParticleAt(x, y);
    }

    // Create particle at specific position
    function createParticleAt(x, y, isCelebration = false) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = isCelebration ? 
            Math.random() * 10 + 5 : 
            Math.random() * 5 + 2;
        
        const colors = isCelebration ? 
            ['#FFD700', '#FF6B6B', '#32CD32', '#1E90FF'] :
            ['#FFD700', '#FFA500', '#FF69B4', '#32CD32'];
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Set particle style
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 50;
            opacity: ${isCelebration ? 0.8 : 0.6};
        `;
        
        particlesContainer.appendChild(particle);
        
        // Animate particle
        const duration = isCelebration ? 1000 : 500;
        const angle = Math.random() * Math.PI * 2;
        const distance = isCelebration ? 
            Math.random() * 100 + 50 : 
            Math.random() * 50 + 20;
        
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        const animation = particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: isCelebration ? 0.8 : 0.6
            },
            {
                transform: `translate(${endX - x}px, ${endY - y}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        // Remove particle after animation
        animation.onfinish = () => {
            particle.remove();
        };
    }

    // Show focus effect
    function showFocusEffect(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        focusEffect.style.left = `${centerX - 50}px`;
        focusEffect.style.top = `${centerY - 50}px`;
        focusEffect.style.opacity = '1';
        
        // Pulsing animation
        focusEffect.animate([
            { transform: 'scale(1)', opacity: 0.3 },
            { transform: 'scale(1.2)', opacity: 0.5 },
            { transform: 'scale(1)', opacity: 0.3 }
        ], {
            duration: 1000,
            iterations: Infinity
        });
    }

    // Hide focus effect
    function hideFocusEffect() {
        focusEffect.style.opacity = '0';
        focusEffect.getAnimations().forEach(anim => anim.cancel());
    }

    // Auto-water function
    function startAutoWater() {
        if (gardenState.autoWaterActive) {
            // Stop auto-water
            gardenState.autoWaterActive = false;
            autoWaterBtn.innerHTML = '<i class="fas fa-tint"></i> Auto-Water (30s)';
            autoWaterBtn.classList.remove('active');
            return;
        }
        
        // Start auto-water
        gardenState.autoWaterActive = true;
        autoWaterBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Watering';
        autoWaterBtn.classList.add('active');
        
        let seconds = 30;
        const interval = setInterval(() => {
            if (!gardenState.autoWaterActive || seconds <= 0) {
                clearInterval(interval);
                gardenState.autoWaterActive = false;
                autoWaterBtn.innerHTML = '<i class="fas fa-tint"></i> Auto-Water (30s)';
                autoWaterBtn.classList.remove('active');
                return;
            }
            
            seconds--;
            autoWaterBtn.innerHTML = `<i class="fas fa-tint"></i> Watering... ${seconds}s`;
            
            // Add attention to random element
            const elements = Object.keys(gardenState.elementGrowth);
            const randomElement = elements[Math.floor(Math.random() * elements.length)];
            addAttention(randomElement, 2);
            
        }, 1000);
    }

    // Simulated level up sound
    function playLevelUpSound() {
        // In a real implementation, this would play an actual sound
        console.log('🎵 Level up sound played!');
        
        // Visual feedback for sound
        const audioIndicator = document.createElement('div');
        audioIndicator.textContent = '🎵';
        audioIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            font-size: 24px;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(audioIndicator);
        
        // Animate and remove
        audioIndicator.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-20px)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => {
            audioIndicator.remove();
        };
    }

    // Event Listeners
    gardenElements.forEach(element => {
        element.addEventListener('mousedown', () => startFocus(element));
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startFocus(element);
        });
        
        element.addEventListener('mouseup', stopFocus);
        element.addEventListener('touchend', stopFocus);
        element.addEventListener('mouseleave', stopFocus);
    });

    // Reset button
    resetBtn.addEventListener('click', initGarden);

    // Auto-water button
    autoWaterBtn.addEventListener('click', startAutoWater);

    // Auto-move butterfly
    function moveButterfly() {
        const butterfly = document.getElementById('butterfly');
        if (!butterfly) return;
        
        // Random movement
        const groundRect = document.querySelector('.ground').getBoundingClientRect();
        const maxX = groundRect.width - 100;
        const maxY = groundRect.height / 2;
        
        const randomX = Math.random() * maxX;
        const randomY = 50 + Math.random() * maxY;
        
        butterfly.style.left = `${randomX}px`;
        butterfly.style.bottom = `${randomY}px`;
        
        // Randomize animation duration
        const duration = Math.random() * 5 + 5;
        butterfly.style.animationDuration = `${duration}s`;
    }

    // Periodically move butterfly
    setInterval(moveButterfly, 8000);

    // Update UI periodically
    setInterval(updateUI, 1000);

    // Initialize the garden
    initGarden();
    
    // Initial butterfly position
    setTimeout(moveButterfly, 1000);

    // Easter egg: Double click for special effect
    let clickCount = 0;
    let lastClick = 0;
    
    document.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - lastClick < 300) {
            clickCount++;
            if (clickCount === 3) {
                // Triple click easter egg
                createCelebrationParticles('flower');
                createCelebrationParticles('tree');
                createCelebrationParticles('mushroom');
                createCelebrationParticles('pond');
                createCelebrationParticles('butterfly');
                clickCount = 0;
            }
        } else {
            clickCount = 1;
        }
        lastClick = now;
    });

    console.log('Attention Garden loaded! Click and hold on garden elements to grow them.');
});