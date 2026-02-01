// Nexus Typography - Interactive Scripts
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const modeToggle = document.getElementById('modeToggle');
    const modeIcon = modeToggle.querySelector('.mode-icon');
    
    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            modeIcon.textContent = '☾';
        } else {
            modeIcon.textContent = '☀';
        }
    });

    // Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    
    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
        
        cursorRing.style.left = `${e.clientX}px`;
        cursorRing.style.top = `${e.clientY}px`;
    });

    // Interactive Elements
    document.querySelectorAll('.interactive-card').forEach(card => {
        const hoverStat = card.querySelector('[data-stat^="hover"]');
        const touchStat = card.querySelector('[data-stat^="touch"]');
        const readStat = card.querySelector('[data-stat^="read"]');
        
        let hoverStartTime = 0;
        let touchStartTime = 0;
        let totalHoverTime = 0;
        let totalTouchTime = 0;
        
        if (hoverStat) {
            card.addEventListener('mouseenter', () => {
                hoverStartTime = Date.now();
                card.classList.add('hover-active');
            });
            
            card.addEventListener('mouseleave', () => {
                const hoverDuration = (Date.now() - hoverStartTime) / 1000;
                totalHoverTime += hoverDuration;
                hoverStat.textContent = `${totalHoverTime.toFixed(1)}s`;
                card.classList.remove('hover-active');
            });
        }
        
        if (touchStat) {
            card.addEventListener('mousedown', () => {
                touchStartTime = Date.now();
                card.classList.add('touch-active');
            });
            
            card.addEventListener('mouseup', () => {
                const touchDuration = (Date.now() - touchStartTime) / 1000;
                totalTouchTime += touchDuration;
                touchStat.textContent = `${totalTouchTime.toFixed(1)}s`;
                card.classList.remove('touch-active');
            });
            
            card.addEventListener('mouseleave', () => {
                if (card.classList.contains('touch-active')) {
                    const touchDuration = (Date.now() - touchStartTime) / 1000;
                    totalTouchTime += touchDuration;
                    touchStat.textContent = `${totalTouchTime.toFixed(1)}s`;
                    card.classList.remove('touch-active');
                }
            });
        }
        
        if (readStat) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const startTime = Date.now();
                        const interval = setInterval(() => {
                            const readTime = (Date.now() - startTime) / 1000;
                            readStat.textContent = `${readTime.toFixed(1)}s`;
                        }, 100);
                        
                        // Stop tracking when card leaves viewport
                        const stopObserver = new IntersectionObserver((stopEntries) => {
                            stopEntries.forEach(stopEntry => {
                                if (!stopEntry.isIntersecting) {
                                    clearInterval(interval);
                                    stopObserver.unobserve(card);
                                }
                            });
                        }, { threshold: 0 });
                        
                        stopObserver.observe(card);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(card);
        }
    });

    // Responsive Words
    document.querySelectorAll('.responsive-word').forEach(word => {
        word.addEventListener('mouseenter', () => {
            word.style.animation = 'wordPulse 0.5s ease-in-out';
            setTimeout(() => {
                word.style.animation = '';
            }, 500);
            
            // Update interaction count
            const interactionCount = document.getElementById('interactionCount');
            let count = parseInt(interactionCount.textContent);
            interactionCount.textContent = count + 1;
        });
    });

    // Scroll Tracking
    let lastScrollTop = 0;
    let scrollSpeed = 0;
    const scrollSpeedElement = document.getElementById('scrollSpeed');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const currentTime = Date.now();
        
        // Calculate scroll speed
        scrollSpeed = Math.abs(scrollTop - lastScrollTop);
        scrollSpeedElement.textContent = Math.min(scrollSpeed, 99);
        lastScrollTop = scrollTop;
        
        // Update activity graph
        updateActivityGraph(scrollSpeed);
        
        // Update pace indicator
        updatePaceIndicator(scrollSpeed);
    });

    // Reading Time Tracking
    let readingStartTime = Date.now();
    const readingTimeElement = document.getElementById('readingTime');
    const timeOnPageElement = document.getElementById('timeOnPage');
    
    setInterval(() => {
        const totalTime = (Date.now() - readingStartTime) / 1000;
        readingTimeElement.textContent = `${Math.floor(totalTime)}s`;
        
        // Format time on page as MM:SS
        const minutes = Math.floor(totalTime / 60);
        const seconds = Math.floor(totalTime % 60);
        timeOnPageElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);

    // Update Words Engaged
    let wordsEngaged = 0;
    const wordsEngagedElement = document.getElementById('wordsEngaged');
    
    document.querySelectorAll('.highlight-word, .responsive-word').forEach(word => {
        word.addEventListener('mouseenter', () => {
            wordsEngaged++;
            wordsEngagedElement.textContent = wordsEngaged;
        });
    });

    // Control Sliders
    const responsivenessSlider = document.getElementById('responsivenessSlider');
    const responsivenessValue = document.getElementById('responsivenessValue');
    const motionSlider = document.getElementById('motionSlider');
    const motionValue = document.getElementById('motionValue');
    
    const responsivenessLevels = {
        1: 'MINIMAL', 2: 'LOW', 3: 'LOW', 4: 'MEDIUM', 
        5: 'MEDIUM', 6: 'MEDIUM', 7: 'HIGH', 8: 'HIGH', 
        9: 'EXTREME', 10: 'EXTREME'
    };
    
    const motionLevels = {
        1: 'STILL', 2: 'VERY SUBTLE', 3: 'SUBTLY', 4: 'GENTLE',
        5: 'GENTLE', 6: 'MODERATE', 7: 'MODERATE', 8: 'ENERGETIC',
        9: 'ENERGETIC', 10: 'INTENSE'
    };
    
    responsivenessSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        responsivenessValue.textContent = responsivenessLevels[value];
        updateResponsiveness(value);
    });
    
    motionSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        motionValue.textContent = motionLevels[value];
        updateMotionIntensity(value);
    });

    // Reset Button
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => {
        readingStartTime = Date.now();
        wordsEngaged = 0;
        wordsEngagedElement.textContent = '0';
        
        // Reset all interactive card stats
        document.querySelectorAll('[data-stat]').forEach(stat => {
            stat.textContent = '0s';
        });
        
        // Reset sliders
        responsivenessSlider.value = 5;
        motionSlider.value = 3;
        responsivenessValue.textContent = 'MEDIUM';
        motionValue.textContent = 'SUBTLY';
        
        // Show reset animation
        document.body.style.animation = 'resetFlash 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    });

    // Example Cards Interactive
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const card = e.target.closest('.example-card');
            const exampleType = card.dataset.example;
            
            e.stopPropagation();
            
            if (action === 'start') {
                startExampleAnimation(exampleType, card);
            } else {
                stopExampleAnimation(exampleType, card);
            }
        });
    });

    // Breathing Grid Animation
    const breathingGrid = document.querySelector('.breathing-grid');
    let gridAnimation = null;
    
    function animateBreathingGrid() {
        const now = Date.now();
        const scale = 1 + Math.sin(now / 2000) * 0.1;
        const opacity = 0.3 + Math.sin(now / 3000) * 0.2;
        
        breathingGrid.style.transform = `scale(${scale})`;
        breathingGrid.style.opacity = opacity;
        
        gridAnimation = requestAnimationFrame(animateBreathingGrid);
    }
    
    animateBreathingGrid();

    // Helper Functions
    function updateActivityGraph(scrollSpeed) {
        const graph = document.getElementById('activityGraph');
        const bars = graph.querySelectorAll('.graph-bar');
        
        // Remove first bar and add new one
        graph.removeChild(bars[0]);
        
        const newBar = document.createElement('div');
        newBar.className = 'graph-bar';
        const height = Math.min(scrollSpeed * 2, 100);
        newBar.style.height = `${height}%`;
        graph.appendChild(newBar);
    }

    function updatePaceIndicator(speed) {
        const paceBar = document.querySelector('.pace-bar');
        const paceText = document.getElementById('paceText');
        
        if (speed < 5) {
            paceText.textContent = 'SLOW';
            paceBar.style.width = '20%';
            paceBar.style.background = 'linear-gradient(90deg, var(--accent-secondary), #36d1dc)';
        } else if (speed < 20) {
            paceText.textContent = 'STEADY';
            paceBar.style.width = '50%';
            paceBar.style.background = 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))';
        } else {
            paceText.textContent = 'FAST';
            paceBar.style.width = '80%';
            paceBar.style.background = 'linear-gradient(90deg, var(--accent-primary), var(--accent-tertiary))';
        }
    }

    function updateResponsiveness(level) {
        const factor = level / 5;
        document.documentElement.style.setProperty('--speed-fast', `${0.2 / factor}s`);
        document.documentElement.style.setProperty('--speed-medium', `${0.5 / factor}s`);
        document.documentElement.style.setProperty('--speed-slow', `${1 / factor}s`);
        
        // Update breathing animation speed
        document.querySelectorAll('.breathing-text').forEach(text => {
            text.style.animationDuration = `${8 / factor}s`;
        });
    }

    function updateMotionIntensity(level) {
        const intensity = level / 10;
        
        // Update cursor ring size based on intensity
        cursorRing.style.width = `${32 + (level * 4)}px`;
        cursorRing.style.height = `${32 + (level * 4)}px`;
        
        // Update hover effects
        document.querySelectorAll('.grid-item').forEach(item => {
            item.style.transitionDuration = `${0.3 / intensity}s`;
        });
        
        document.querySelectorAll('.interactive-card').forEach(card => {
            card.style.transitionDuration = `${0.3 / intensity}s`;
        });
    }

    function startExampleAnimation(type, card) {
        const visual = card.querySelector('.example-visual > div');
        
        switch(type) {
            case 'breathing':
                visual.style.animation = 'textBreath 3s infinite ease-in-out';
                break;
            case 'following':
                card.addEventListener('mousemove', followCursor);
                function followCursor(e) {
                    const rect = card.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
                    visual.style.transform = `translate(${x}px, ${y}px)`;
                }
                card._followCursor = followCursor;
                break;
            case 'unfolding':
                const letters = visual.textContent.split('');
                visual.innerHTML = '';
                letters.forEach((letter, i) => {
                    const span = document.createElement('span');
                    span.textContent = letter;
                    span.style.opacity = '0';
                    span.style.transform = 'translateY(20px)';
                    span.style.display = 'inline-block';
                    span.style.transition = `all 0.5s ease ${i * 0.1}s`;
                    visual.appendChild(span);
                });
                
                setTimeout(() => {
                    visual.querySelectorAll('span').forEach(span => {
                        span.style.opacity = '1';
                        span.style.transform = 'translateY(0)';
                    });
                }, 100);
                break;
        }
    }

    function stopExampleAnimation(type, card) {
        const visual = card.querySelector('.example-visual > div');
        
        switch(type) {
            case 'breathing':
                visual.style.animation = '';
                break;
            case 'following':
                if (card._followCursor) {
                    card.removeEventListener('mousemove', card._followCursor);
                    visual.style.transform = '';
                }
                break;
            case 'unfolding':
                visual.querySelectorAll('span').forEach(span => {
                    span.style.opacity = '1';
                    span.style.transform = '';
                });
                setTimeout(() => {
                    visual.innerHTML = visual.textContent;
                }, 500);
                break;
        }
    }

    // Sound Effects
    const hoverSound = document.getElementById('hoverSound');
    const typeSound = document.getElementById('typeSound');
    
    // Play sound on hover for certain elements
    document.querySelectorAll('.grid-item, .interactive-card, .nav-link').forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (motionSlider.value > 5) {
                hoverSound.currentTime = 0;
                hoverSound.play();
            }
        });
    });

    // Initialize with medium responsiveness
    updateResponsiveness(5);
    updateMotionIntensity(3);

    // Add CSS for animations
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes wordPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        @keyframes resetFlash {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .hover-active {
            border-color: var(--accent-primary) !important;
            box-shadow: 0 0 20px var(--accent-primary) !important;
        }
        
        .touch-active {
            transform: scale(0.95) !important;
            border-color: var(--accent-tertiary) !important;
        }
    `;
    document.head.appendChild(styleSheet);
});