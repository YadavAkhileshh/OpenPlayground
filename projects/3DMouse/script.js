
        document.addEventListener('DOMContentLoaded', function() {
            const card = document.getElementById('card3d');
            const glowEffect = document.getElementById('glowEffect');
            const mousePosition = document.getElementById('mousePosition');
            const sensitivitySlider = document.getElementById('sensitivity');
            const glowSlider = document.getElementById('glow');
            const depthSlider = document.getElementById('depth');
            const flipToggle = document.getElementById('flipToggle');
            const glowToggle = document.getElementById('glowToggle');
            const resetBtn = document.getElementById('resetBtn');
            const sensitivityValue = document.getElementById('sensitivityValue');
            const glowValue = document.getElementById('glowValue');
            const depthValue = document.getElementById('depthValue');
            
            let mouseX = 0;
            let mouseY = 0;
            let cardX = 0;
            let cardY = 0;
            let isFlipped = false;
            let glowIntensity = 50;
            let sensitivity = 15;
            let perspectiveDepth = 1500;
            
            // Initialize card perspective
            document.querySelector('.card-container').style.perspective = `${perspectiveDepth}px`;
            
            // Update slider value displays
            sensitivitySlider.addEventListener('input', function() {
                sensitivity = parseInt(this.value);
                sensitivityValue.textContent = sensitivity;
            });
            
            glowSlider.addEventListener('input', function() {
                glowIntensity = parseInt(this.value);
                glowValue.textContent = glowIntensity;
                updateGlowEffect();
            });
            
            depthSlider.addEventListener('input', function() {
                perspectiveDepth = parseInt(this.value);
                depthValue.textContent = perspectiveDepth;
                document.querySelector('.card-container').style.perspective = `${perspectiveDepth}px`;
            });
            
            // Flip card toggle
            flipToggle.addEventListener('change', function() {
                isFlipped = this.checked;
                card.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                
                if (isFlipped) {
                    card.style.transform = 'rotateY(180deg)';
                } else {
                    card.style.transform = 'rotateY(0deg)';
                }
                
                // Remove transition after animation completes
                setTimeout(() => {
                    card.style.transition = 'transform 0.1s ease-out';
                }, 800);
            });
            
            // Glow effect toggle
            glowToggle.addEventListener('change', function() {
                if (this.checked) {
                    glowEffect.style.opacity = '1';
                } else {
                    glowEffect.style.opacity = '0';
                }
            });
            
            // Reset button
            resetBtn.addEventListener('click', function() {
                sensitivitySlider.value = 15;
                sensitivity = 15;
                sensitivityValue.textContent = '15';
                
                glowSlider.value = 50;
                glowIntensity = 50;
                glowValue.textContent = '50';
                
                depthSlider.value = 1500;
                perspectiveDepth = 1500;
                depthValue.textContent = '1500';
                document.querySelector('.card-container').style.perspective = `${perspectiveDepth}px`;
                
                flipToggle.checked = false;
                isFlipped = false;
                card.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                card.style.transform = 'rotateY(0deg)';
                
                glowToggle.checked = true;
                glowEffect.style.opacity = '1';
                
                // Remove transition after animation completes
                setTimeout(() => {
                    card.style.transition = 'transform 0.1s ease-out';
                }, 800);
            });
            
            // Mouse movement tracking
            document.addEventListener('mousemove', function(e) {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                // Update mouse position display
                mousePosition.textContent = `Mouse: (${mouseX}, ${mouseY})`;
                
                // Calculate card position relative to viewport
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top + cardRect.height / 2;
                
                // Calculate mouse position relative to card center
                const relativeX = mouseX - cardCenterX;
                const relativeY = mouseY - cardCenterY;
                
                // Update glow effect position
                const glowX = ((mouseX - cardRect.left) / cardRect.width) * 100;
                const glowY = ((mouseY - cardRect.top) / cardRect.height) * 100;
                glowEffect.style.setProperty('--mouse-x', `${glowX}%`);
                glowEffect.style.setProperty('--mouse-y', `${glowY}%`);
                
                // Calculate rotation based on mouse position and sensitivity
                // Reduce effect when card is flipped
                const flipFactor = isFlipped ? 0.5 : 1;
                const rotateY = (relativeX / (sensitivity * 10)) * flipFactor;
                const rotateX = -(relativeY / (sensitivity * 10)) * flipFactor;
                
                // Smooth the rotation values
                cardX += (rotateX - cardX) * 0.2;
                cardY += (rotateY - cardY) * 0.2;
                
                // Apply 3D transformation
                const transform = isFlipped 
                    ? `rotateY(180deg) rotateX(${cardX}deg) rotateY(${cardY}deg)`
                    : `rotateX(${cardX}deg) rotateY(${cardY}deg)`;
                
                card.style.transform = transform;
            });
            
            // Mouse leave card area - reset rotation
            card.addEventListener('mouseleave', function() {
                cardX = 0;
                cardY = 0;
                const transform = isFlipped 
                    ? 'rotateY(180deg) rotateX(0deg) rotateY(0deg)'
                    : 'rotateX(0deg) rotateY(0deg)';
                card.style.transform = transform;
                
                // Hide glow effect
                glowEffect.style.opacity = '0';
            });
            
            // Mouse enter card area - show glow effect
            card.addEventListener('mouseenter', function() {
                if (glowToggle.checked) {
                    glowEffect.style.opacity = '1';
                }
            });
            
            // Touch support for mobile devices
            let touchStartX = 0;
            let touchStartY = 0;
            
            card.addEventListener('touchstart', function(e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                e.preventDefault();
            });
            
            card.addEventListener('touchmove', function(e) {
                if (!e.touches.length) return;
                
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                
                const deltaX = touchX - touchStartX;
                const deltaY = touchY - touchStartY;
                
                // Calculate rotation based on touch movement
                const rotateY = deltaX / (sensitivity * 5);
                const rotateX = -deltaY / (sensitivity * 5);
                
                // Apply transformation
                const transform = isFlipped 
                    ? `rotateY(180deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
                    : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                
                card.style.transform = transform;
                e.preventDefault();
            });
            
            card.addEventListener('touchend', function() {
                // Smoothly return to original position
                cardX = 0;
                cardY = 0;
                const transform = isFlipped 
                    ? 'rotateY(180deg) rotateX(0deg) rotateY(0deg)'
                    : 'rotateX(0deg) rotateY(0deg)';
                card.style.transform = transform;
            });
            
            // Initialize glow effect
            function updateGlowEffect() {
                const opacity = glowIntensity / 100;
                glowEffect.style.opacity = opacity.toString();
            }
            
            // Initial setup
            updateGlowEffect();
        });
