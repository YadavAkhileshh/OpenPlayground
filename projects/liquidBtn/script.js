        // Create background water droplets
        const waterBg = document.getElementById('waterBg');
        for (let i = 0; i < 25; i++) {
            const droplet = document.createElement('div');
            droplet.classList.add('droplet');
            
            // Random size and position
            const size = Math.random() * 40 + 10;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const delay = Math.random() * 20;
            
            droplet.style.width = `${size}px`;
            droplet.style.height = `${size}px`;
            droplet.style.left = `${left}%`;
            droplet.style.top = `${top}%`;
            droplet.style.animationDelay = `${delay}s`;
            
            waterBg.appendChild(droplet);
        }

        // Get DOM elements
        const liquidButton = document.getElementById('liquidButton');
        const waterSurface = document.getElementById('waterSurface');
        const liquidParticles = document.getElementById('liquidParticles');
        const variations = [
            document.getElementById('variation1'),
            document.getElementById('variation2'),
            document.getElementById('variation3'),
            document.getElementById('variation4')
        ];

        // Ripple effect on click
        function createRipple(event) {
            const ripple = document.createElement('div');
            ripple.classList.add('water-wave');
            
            // Position ripple at click point
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Random size for natural look
            const size = Math.random() * 100 + 50;
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            
            waterSurface.appendChild(ripple);
            
            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 1500);
        }

        // Create particles on mouse movement
        function createParticles(event) {
            const buttonRect = liquidButton.getBoundingClientRect();
            const x = event.clientX - buttonRect.left;
            const y = event.clientY - buttonRect.top;
            
            // Only create particles if mouse is inside button
            if (x >= 0 && x <= buttonRect.width && y >= 0 && y <= buttonRect.height) {
                // Create multiple particles for a denser effect
                for (let i = 0; i < 3; i++) {
                    const particle = document.createElement('div');
                    particle.classList.add('particle');
                    
                    // Randomize particle properties
                    const size = Math.random() * 8 + 2;
                    const offsetX = (Math.random() - 0.5) * 30;
                    const offsetY = (Math.random() - 0.5) * 30;
                    
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.left = `${x + offsetX}px`;
                    particle.style.top = `${y + offsetY}px`;
                    
                    // Random color with blue tint
                    const blueShade = Math.floor(Math.random() * 100 + 155);
                    particle.style.backgroundColor = `rgba(100, ${blueShade}, 255, ${Math.random() * 0.5 + 0.3})`;
                    
                    liquidParticles.appendChild(particle);
                    
                    // Animate particle
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 50 + 20;
                    const duration = Math.random() * 1000 + 500;
                    
                    particle.animate([
                        { 
                            transform: `translate(0, 0) scale(1)`, 
                            opacity: 1 
                        },
                        { 
                            transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, 
                            opacity: 0 
                        }
                    ], {
                        duration: duration,
                        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
                    });
                    
                    // Remove particle after animation
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.remove();
                        }
                    }, duration);
                }
            }
        }

        // Create wave effect on hover
        function createWave(event) {
            // Create a gentle wave effect when hovering
            const waves = 5;
            for (let i = 0; i < waves; i++) {
                setTimeout(() => {
                    const wave = document.createElement('div');
                    wave.classList.add('water-wave');
                    
                    // Position wave at center
                    const rect = liquidButton.getBoundingClientRect();
                    const x = rect.width / 2;
                    const y = rect.height / 2;
                    
                    wave.style.left = `${x}px`;
                    wave.style.top = `${y}px`;
                    
                    // Size increases with each wave
                    const size = 80 + i * 40;
                    wave.style.width = `${size}px`;
                    wave.style.height = `${size}px`;
                    
                    // Slower animation for hover effect
                    wave.style.animationDuration = '2s';
                    
                    waterSurface.appendChild(wave);
                    
                    // Remove wave after animation
                    setTimeout(() => {
                        if (wave.parentNode) {
                            wave.remove();
                        }
                    }, 2000);
                }, i * 200);
            }
        }

        // Button interaction events
        liquidButton.addEventListener('click', createRipple);
        liquidButton.addEventListener('mousemove', createParticles);
        liquidButton.addEventListener('mouseenter', createWave);

        // Add click effects to variation buttons
        variations.forEach(button => {
            button.addEventListener('click', function(event) {
                // Create a custom ripple for this button
                const ripple = document.createElement('div');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                ripple.style.transform = 'translate(-50%, -50%) scale(0)';
                
                // Position at click point
                const rect = button.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.width = '10px';
                ripple.style.height = '10px';
                
                button.appendChild(ripple);
                
                // Animate ripple
                ripple.animate([
                    { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.7 },
                    { transform: 'translate(-50%, -50%) scale(20)', opacity: 0 }
                ], {
                    duration: 800,
                    easing: 'cubic-bezier(0, 0, 0.2, 1)'
                });
                
                // Remove ripple after animation
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.remove();
                    }
                }, 800);
                
                // Create floating particles
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        const particle = document.createElement('div');
                        particle.style.position = 'absolute';
                        particle.style.borderRadius = '50%';
                        particle.style.width = '6px';
                        particle.style.height = '6px';
                        particle.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        particle.style.left = `${x}px`;
                        particle.style.top = `${y}px`;
                        particle.style.zIndex = '1';
                        
                        button.appendChild(particle);
                        
                        // Random direction and distance
                        const angle = Math.random() * Math.PI * 2;
                        const distance = Math.random() * 40 + 20;
                        
                        particle.animate([
                            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                            { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, opacity: 0 }
                        ], {
                            duration: 600,
                            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
                        });
                        
                        // Remove particle
                        setTimeout(() => {
                            if (particle.parentNode) {
                                particle.remove();
                            }
                        }, 600);
                    }, i * 50);
                }
            });
            
            // Add hover effect
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = `0 15px 35px ${getComputedStyle(this).boxShadow.split(' ')[2]}`;
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = `0 8px 25px ${getComputedStyle(this).boxShadow.split(' ')[2]}`;
            });
        });

        // Continuous ripples when holding the main button
        let holdInterval;
        liquidButton.addEventListener('mousedown', function() {
            // Create initial ripple
            const fakeEvent = {
                currentTarget: liquidButton,
                clientX: event.clientX,
                clientY: event.clientY
            };
            createRipple(fakeEvent);
            
            // Continue creating ripples while holding
            holdInterval = setInterval(() => {
                const rect = liquidButton.getBoundingClientRect();
                const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 80;
                const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 40;
                
                const fakeHoldEvent = {
                    currentTarget: liquidButton,
                    clientX: x,
                    clientY: y
                };
                createRipple(fakeHoldEvent);
            }, 200);
        });

        // Stop ripples when mouse is released
        document.addEventListener('mouseup', function() {
            if (holdInterval) {
                clearInterval(holdInterval);
                holdInterval = null;
            }
        });

        // Create occasional random ripples on the main button
        setInterval(() => {
            if (Math.random() > 0.7) {
                const rect = liquidButton.getBoundingClientRect();
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + Math.random() * rect.height;
                
                const fakeRandomEvent = {
                    currentTarget: liquidButton,
                    clientX: x,
                    clientY: y
                };
                createRipple(fakeRandomEvent);
            }
        }, 3000);