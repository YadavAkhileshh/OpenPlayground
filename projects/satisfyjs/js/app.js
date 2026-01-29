// ==========================================
// APP INITIALIZATION & CONTROLS
// ==========================================

class SatisfyJS {
    constructor() {
        this.animationSpeed = 1;
        this.theme = 'light';
        this.favorites = new Set();
        this.animationCount = 0;
        this.interactionCount = 0;
        this.isFullscreen = false;
        this.autoPlayInterval = null;
        this.loadFavorites();
        this.init();
    }

    init() {
        this.setupControls();
        this.setupTheme();
        this.setupFAB();
        this.setupFavorites();
        this.setupCategoryFilters();
        this.addLoadAnimations();
        this.updateStats();
        console.log('✨ SatisfyJS Enhanced Edition initialized');
    }

    // Setup Control Handlers
    setupControls() {
        const speedSlider = document.getElementById('speed');
        const speedValue = document.getElementById('speed-value');
        const themeToggle = document.getElementById('theme-toggle');
        const resetAll = document.getElementById('reset-all');
        const presetSelect = document.getElementById('preset');
        const fullscreenToggle = document.getElementById('fullscreen-toggle');

        // Speed Control
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            speedValue.textContent = `${this.animationSpeed}x`;
            document.documentElement.style.setProperty('--animation-speed', this.animationSpeed);
            this.animateSpeedValue(speedValue);
        });

        // Preset Control
        presetSelect.addEventListener('change', (e) => {
            this.applyPreset(e.target.value);
        });

        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
            this.animateButton(themeToggle);
        });

        // Fullscreen Toggle
        fullscreenToggle.addEventListener('click', () => {
            this.toggleFullscreen();
            this.animateButton(fullscreenToggle);
        });

        // Reset All Animations
        resetAll.addEventListener('click', () => {
            this.resetAllAnimations();
            this.animateButton(resetAll);
        });
    }

    // Theme Management
    setupTheme() {
        const savedTheme = localStorage.getItem('satisfyjs-theme') || 'light';
        this.theme = savedTheme;
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.theme);
        localStorage.setItem('satisfyjs-theme', this.theme);
        
        // Animate theme transition
        document.body.style.transition = 'background 0.5s ease, color 0.5s ease';
    }

    // Apply Animation Presets
    applyPreset(preset) {
        const presets = {
            'default': { speed: 1, message: 'Default settings applied' },
            'fast': { speed: 2.5, message: 'Fast & Furious mode activated!' },
            'slow': { speed: 0.3, message: 'Slow motion mode activated' },
            'elastic': { speed: 1.5, message: 'Super elastic mode activated!' }
        };

        const selected = presets[preset];
        if (selected) {
            this.animationSpeed = selected.speed;
            document.getElementById('speed').value = selected.speed;
            document.getElementById('speed-value').textContent = `${selected.speed}x`;
            document.documentElement.style.setProperty('--animation-speed', selected.speed);
            this.showNotification(selected.message);
        }
    }

    // Toggle Fullscreen
    toggleFullscreen() {
        if (!this.isFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            this.isFullscreen = true;
            this.showNotification('Fullscreen mode activated');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            this.isFullscreen = false;
            this.showNotification('Fullscreen mode deactivated');
        }
    }

    // Reset All Animations
    resetAllAnimations() {
        // Clear ripples
        const rippleCanvas = document.getElementById('ripple-canvas');
        rippleCanvas.innerHTML = '';

        // Clear particles
        const particleCanvas = document.getElementById('particle-canvas');
        particleCanvas.innerHTML = '';

        // Clear balls
        const ballsCanvas = document.getElementById('balls-canvas');
        ballsCanvas.innerHTML = '';

        // Reset wave bars
        const waveBars = document.querySelectorAll('.wave-bar');
        waveBars.forEach(bar => bar.classList.remove('active'));

        // Reset morph shapes
        const morphShapes = document.querySelectorAll('.morph-shape');
        morphShapes.forEach(shape => {
            shape.classList.remove('morphed-1', 'morphed-2', 'morphed-3');
        });

        // Reset color orbs
        const colorOrbs = document.querySelectorAll('.color-orb');
        colorOrbs.forEach(orb => orb.classList.remove('active'));

        // Visual feedback
        this.showNotification('All animations reset!');
    }

    // Utility: Animate button press
    animateButton(button) {
        button.classList.add('scale-down');
        setTimeout(() => {
            button.classList.remove('scale-down');
            button.classList.add('scale-up');
            setTimeout(() => {
                button.classList.remove('scale-up');
            }, 400);
        }, 200);
    }

    // Utility: Animate speed value
    animateSpeedValue(element) {
        element.classList.add('elastic');
        setTimeout(() => {
            element.classList.remove('elastic');
        }, 1000);
    }

    // Add initial load animations
    addLoadAnimations() {
        const sections = document.querySelectorAll('.animation-section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Setup Category Filters
    setupCategoryFilters() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        const sectionGrids = document.querySelectorAll('.section-grid');
        
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                
                // Update active button
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter sections
                sectionGrids.forEach(grid => {
                    if (category === 'all') {
                        grid.classList.remove('hidden');
                    } else {
                        if (grid.dataset.category === category) {
                            grid.classList.remove('hidden');
                        } else {
                            grid.classList.add('hidden');
                        }
                    }
                });
                
                // Re-animate visible sections
                setTimeout(() => {
                    const visibleSections = document.querySelectorAll('.section-grid:not(.hidden) .animation-section');
                    visibleSections.forEach((section, index) => {
                        section.style.opacity = '0';
                        section.style.transform = 'translateY(30px)';
                        
                        setTimeout(() => {
                            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                            section.style.opacity = '1';
                            section.style.transform = 'translateY(0)';
                        }, index * 80);
                    });
                }, 100);
            });
        });
    }

    // Utility: Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideInRight 0.5s ease, fadeOut 0.5s ease 2.5s forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Setup FAB Menu
    setupFAB() {
        const fabOptions = document.querySelectorAll('.fab-option');
        
        fabOptions.forEach(option => {
            option.addEventListener('click', () => {
                const action = option.getAttribute('data-action');
                this.handleFABAction(action);
            });
        });
    }

    // Handle FAB Actions
    handleFABAction(action) {
        switch(action) {
            case 'random-animation':
                this.triggerRandomAnimation();
                break;
            case 'auto-play':
                this.toggleAutoPlay();
                break;
            case 'export-settings':
                this.exportSettings();
                break;
        }
    }

    // Trigger Random Animation
    triggerRandomAnimation() {
        const animations = ['ripple', 'particle', 'wave', 'shape', 'color'];
        const random = animations[Math.floor(Math.random() * animations.length)];
        this.showNotification(`Random animation: ${random}`);
        
        // Trigger a random effect on the page
        const event = new MouseEvent('click', {
            clientX: Math.random() * window.innerWidth,
            clientY: Math.random() * window.innerHeight
        });
        
        const canvas = document.querySelector(`#${random}-canvas, .${random}-container`);
        if (canvas) canvas.dispatchEvent(event);
    }

    // Toggle Auto Play
    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            this.showNotification('Auto-play stopped');
        } else {
            this.autoPlayInterval = setInterval(() => {
                this.triggerRandomAnimation();
            }, 2000);
            this.showNotification('Auto-play started!');
        }
    }

    // Export Settings
    exportSettings() {
        const settings = {
            speed: this.animationSpeed,
            theme: this.theme,
            favorites: Array.from(this.favorites)
        };
        
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'satisfyjs-settings.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Settings exported!');
    }

    // Setup Favorites
    setupFavorites() {
        const favoriteButtons = document.querySelectorAll('.section-favorite');
        
        favoriteButtons.forEach(btn => {
            const section = btn.getAttribute('data-section');
            if (this.favorites.has(section)) {
                btn.classList.add('active');
            }
            
            btn.addEventListener('click', () => {
                this.toggleFavorite(section, btn);
            });
        });
    }

    // Toggle Favorite
    toggleFavorite(section, button) {
        if (this.favorites.has(section)) {
            this.favorites.delete(section);
            button.classList.remove('active');
            this.showNotification(`Removed from favorites`);
        } else {
            this.favorites.add(section);
            button.classList.add('active');
            this.showNotification(`Added to favorites`);
        }
        
        this.saveFavorites();
    }

    // Save Favorites
    saveFavorites() {
        localStorage.setItem('satisfyjs-favorites', JSON.stringify(Array.from(this.favorites)));
    }

    // Load Favorites
    loadFavorites() {
        const saved = localStorage.getItem('satisfyjs-favorites');
        if (saved) {
            this.favorites = new Set(JSON.parse(saved));
        }
    }

    // Update Stats
    updateStats() {
        const animationCountEl = document.getElementById('animation-count');
        const interactionCountEl = document.getElementById('interaction-count');
        
        if (animationCountEl) animationCountEl.textContent = this.animationCount;
        if (interactionCountEl) interactionCountEl.textContent = this.interactionCount;
    }

    // Increment Animation Count
    incrementAnimation() {
        this.animationCount++;
        this.updateStats();
    }

    // Increment Interaction Count
    incrementInteraction() {
        this.interactionCount++;
        this.updateStats();
    }

    // Utility: Random number in range
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Utility: Random color from palette
    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#C7CEEA', '#FFDAB9', '#B19CD9',
            '#667eea', '#764ba2', '#f093fb', '#f5576c'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Utility: Get cursor position relative to element
    getCursorPosition(e, element) {
        const rect = element.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
}

// ==========================================
// INITIALIZE APP
// ==========================================

let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new SatisfyJS();
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Linear interpolation
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Easing functions
const Easing = {
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
};

// Map value from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
