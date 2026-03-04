
        // Theme Engine Core
        class ThemeEngine {
            constructor() {
                this.state = {
                    energy: 50,      // Based on click speed
                    focus: 50,       // Based on typing patterns
                    calm: 50,        // Based on inactivity
                    contrast: 5,
                    saturation: 5,
                    currentTheme: 'adaptive'
                };

                this.metrics = {
                    clickTimes: [],
                    keystrokeTimes: [],
                    lastActivity: Date.now(),
                    clickCount: 0,
                    keystrokeCount: 0,
                    activeTime: 0
                };

                this.themes = {
                    calm: {
                        name: 'Calm Ocean',
                        description: 'Gentle blues for relaxed interactions',
                        colors: ['#4d96ff', '#6fcf97']
                    },
                    energetic: {
                        name: 'Energetic Fire',
                        description: 'Warm reds for rapid interactions',
                        colors: ['#ff6b6b', '#ffa726']
                    },
                    focused: {
                        name: 'Deep Focus',
                        description: 'Purples for concentrated typing',
                        colors: ['#9d4edd', '#5a189a']
                    },
                    relaxed: {
                        name: 'Relaxed Green',
                        description: 'Peaceful greens for steady pace',
                        colors: ['#38b2ac', '#319795']
                    },
                    dark: {
                        name: 'Night Mode',
                        description: 'Dark theme for low light',
                        colors: ['#805ad5', '#553c9a']
                    },
                    highContrast: {
                        name: 'High Contrast',
                        description: 'Maximum readability',
                        colors: ['#000000', '#ffffff']
                    }
                };

                this.init();
            }

            init() {
                this.setupEventListeners();
                this.updateUI();
                this.startActivityMonitor();
                this.applyTheme();
            }

            setupEventListeners() {
                // Interaction zone clicks
                const interactionZone = document.getElementById('interactionZone');
                interactionZone.addEventListener('click', (e) => {
                    this.handleClick();
                    this.pulseInteractionZone();
                });

                // Typing area
                const typingArea = document.getElementById('typingArea');
                typingArea.addEventListener('input', (e) => {
                    this.handleTyping();
                });

                typingArea.addEventListener('keydown', (e) => {
                    if (e.key.length === 1) { // Only count character keys
                        this.metrics.keystrokeCount++;
                        this.metrics.keystrokeTimes.push(Date.now());
                        document.getElementById('keystrokeCount').textContent = this.metrics.keystrokeCount;
                    }
                });

                // Sliders
                document.getElementById('contrastSlider').addEventListener('input', (e) => {
                    this.state.contrast = parseInt(e.target.value);
                    this.applyTheme();
                });

                document.getElementById('saturationSlider').addEventListener('input', (e) => {
                    this.state.saturation = parseInt(e.target.value);
                    this.applyTheme();
                });

                // Reset button
                document.getElementById('resetBtn').addEventListener('click', () => {
                    this.resetTheme();
                });

                // Track mouse movement for activity
                document.addEventListener('mousemove', () => {
                    this.metrics.lastActivity = Date.now();
                });

                // Track scroll for activity
                document.addEventListener('scroll', () => {
                    this.metrics.lastActivity = Date.now();
                });
            }

            handleClick() {
                const now = Date.now();
                this.metrics.clickTimes.push(now);
                this.metrics.clickCount++;
                
                // Keep only last 10 clicks for calculation
                if (this.metrics.clickTimes.length > 10) {
                    this.metrics.clickTimes.shift();
                }

                // Calculate click speed (clicks per second)
                if (this.metrics.clickTimes.length > 1) {
                    const timeDiff = (now - this.metrics.clickTimes[0]) / 1000;
                    const clickSpeed = this.metrics.clickTimes.length / timeDiff;
                    
                    // Update energy based on click speed
                    this.state.energy = Math.min(100, Math.max(0, clickSpeed * 20));
                    this.updateUI();
                }

                document.getElementById('clickCount').textContent = this.metrics.clickCount;
            }

            handleTyping() {
                const typingArea = document.getElementById('typingArea');
                const text = typingArea.value;
                const now = Date.now();

                // Calculate typing speed and patterns
                if (text.length > 0) {
                    const words = text.trim().split(/\s+/).length;
                    const chars = text.length;
                    
                    // Update focus based on typing
                    this.state.focus = Math.min(100, Math.max(0, words * 2 + chars * 0.1));
                    
                    // Change theme based on typing intensity
                    if (chars > 100) {
                        this.state.currentTheme = 'focused';
                    } else if (chars > 50) {
                        this.state.currentTheme = 'relaxed';
                    }
                    
                    this.updateUI();
                }
            }

            startActivityMonitor() {
                setInterval(() => {
                    const now = Date.now();
                    const inactiveTime = (now - this.metrics.lastActivity) / 1000;
                    
                    // Update calm based on inactivity
                    this.state.calm = Math.min(100, Math.max(0, inactiveTime * 2));
                    
                    // Switch to calm theme if inactive for a while
                    if (inactiveTime > 10 && this.state.currentTheme !== 'calm') {
                        this.state.currentTheme = 'calm';
                        this.applyTheme();
                    }
                    
                    // Update active time counter
                    if (inactiveTime < 2) {
                        this.metrics.activeTime++;
                        document.getElementById('activeTime').textContent = `${this.metrics.activeTime}s`;
                    }
                    
                    this.updateUI();
                }, 1000);
            }

            applyTheme() {
                const root = document.documentElement;
                const theme = this.themes[this.state.currentTheme] || this.themes.calm;
                
                // Apply theme class
                Object.keys(this.themes).forEach(themeName => {
                    document.body.classList.remove(`theme-${themeName}`);
                });
                document.body.classList.add(`theme-${this.state.currentTheme}`);
                
                // Update theme name display
                document.getElementById('currentThemeName').textContent = theme.name;
                
                // Calculate dynamic colors based on state
                const energyFactor = this.state.energy / 100;
                const focusFactor = this.state.focus / 100;
                const calmFactor = this.state.calm / 100;
                
                // Blend colors based on emotional state
                let primaryColor, secondaryColor;
                
                if (energyFactor > 0.7) {
                    // Energetic state
                    primaryColor = this.interpolateColor('#ff6b6b', '#ffa726', energyFactor);
                    secondaryColor = this.interpolateColor('#ffa726', '#ff6b6b', energyFactor);
                } else if (focusFactor > 0.7) {
                    // Focused state
                    primaryColor = this.interpolateColor('#9d4edd', '#5a189a', focusFactor);
                    secondaryColor = this.interpolateColor('#5a189a', '#9d4edd', focusFactor);
                } else if (calmFactor > 0.7) {
                    // Calm state
                    primaryColor = this.interpolateColor('#4d96ff', '#6fcf97', calmFactor);
                    secondaryColor = this.interpolateColor('#6fcf97', '#4d96ff', calmFactor);
                } else {
                    // Adaptive/balanced state
                    const avgFactor = (energyFactor + focusFactor + calmFactor) / 3;
                    primaryColor = this.interpolateColor('#667eea', '#764ba2', avgFactor);
                    secondaryColor = this.interpolateColor('#764ba2', '#667eea', avgFactor);
                }
                
                // Adjust contrast and saturation
                const contrast = 1 + (this.state.contrast - 5) * 0.1;
                const saturation = 1 + (this.state.saturation - 5) * 0.1;
                
                // Apply CSS custom properties
                root.style.setProperty('--primary-color', primaryColor);
                root.style.setProperty('--secondary-color', secondaryColor);
                root.style.setProperty('--primary-color-rgb', this.hexToRgb(primaryColor).join(','));
                
                // Update color preview
                document.getElementById('colorPreview').style.background = 
                    `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
                
                // Update interaction hint
                this.updateInteractionHint();
            }

            interpolateColor(color1, color2, factor) {
                const rgb1 = this.hexToRgb(color1);
                const rgb2 = this.hexToRgb(color2);
                
                const result = rgb1.map((channel, i) => {
                    return Math.round(channel + (rgb2[i] - channel) * factor);
                });
                
                return `rgb(${result.join(',')})`;
            }

            hexToRgb(hex) {
                if (hex.startsWith('rgb')) {
                    return hex.match(/\d+/g).map(Number);
                }
                
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? [
                    parseInt(result[1], 16),
                    parseInt(result[2], 16),
                    parseInt(result[3], 16)
                ] : [102, 126, 234]; // Default blue
            }

            updateInteractionHint() {
                const hint = document.getElementById('interactionHint');
                const icon = document.getElementById('interactionIcon');
                
                if (this.state.energy > 70) {
                    hint.textContent = "Energetic! Rapid clicks detected 🔥";
                    icon.innerHTML = '<i class="fas fa-bolt"></i>';
                } else if (this.state.focus > 70) {
                    hint.textContent = "Focused! Keep typing to maintain theme 🎯";
                    icon.innerHTML = '<i class="fas fa-keyboard"></i>';
                } else if (this.state.calm > 70) {
                    hint.textContent = "Calm detected. Enjoy the peaceful theme 🌊";
                    icon.innerHTML = '<i class="fas fa-spa"></i>';
                } else {
                    hint.textContent = "Click rapidly for energetic theme ⚡";
                    icon.innerHTML = '<i class="fas fa-hand-pointer"></i>';
                }
            }

            updateUI() {
                // Update emotion indicators
                document.getElementById('energyValue').textContent = `${Math.round(this.state.energy)}%`;
                document.getElementById('focusValue').textContent = `${Math.round(this.state.focus)}%`;
                document.getElementById('calmValue').textContent = `${Math.round(this.state.calm)}%`;
                
                // Auto-select theme based on dominant emotion
                if (this.state.energy > this.state.focus && this.state.energy > this.state.calm) {
                    this.state.currentTheme = 'energetic';
                } else if (this.state.focus > this.state.energy && this.state.focus > this.state.calm) {
                    this.state.currentTheme = 'focused';
                } else if (this.state.calm > this.state.energy && this.state.calm > this.state.focus) {
                    this.state.currentTheme = 'calm';
                }
                
                this.applyTheme();
            }

            pulseInteractionZone() {
                const zone = document.getElementById('interactionZone');
                zone.classList.add('click-active');
                setTimeout(() => {
                    zone.classList.remove('click-active');
                }, 300);
            }

            resetTheme() {
                this.state = {
                    energy: 50,
                    focus: 50,
                    calm: 50,
                    contrast: 5,
                    saturation: 5,
                    currentTheme: 'adaptive'
                };

                this.metrics = {
                    clickTimes: [],
                    keystrokeTimes: [],
                    lastActivity: Date.now(),
                    clickCount: 0,
                    keystrokeCount: 0,
                    activeTime: 0
                };

                document.getElementById('contrastSlider').value = 5;
                document.getElementById('saturationSlider').value = 5;
                document.getElementById('clickCount').textContent = '0';
                document.getElementById('keystrokeCount').textContent = '0';
                document.getElementById('activeTime').textContent = '0s';
                
                this.updateUI();
                this.applyTheme();
                
                // Show reset confirmation
                const resetBtn = document.getElementById('resetBtn');
                const originalText = resetBtn.innerHTML;
                resetBtn.innerHTML = '<i class="fas fa-check"></i> Reset!';
                setTimeout(() => {
                    resetBtn.innerHTML = originalText;
                }, 1000);
            }
        }

        // Initialize the theme engine
        const themeEngine = new ThemeEngine();

        // Add some additional visual effects
        document.addEventListener('DOMContentLoaded', () => {
            // Animate elements on load
            const cards = document.querySelectorAll('.theme-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('fade-in');
            });
        });
