        // DOM Elements
        const container = document.getElementById('container');
        const raindrops = document.getElementById('raindrops');
        const clickDroplets = document.getElementById('clickDroplets');
        const distortions = document.getElementById('distortions');
        const lightsContainer = document.getElementById('lightsContainer');
        const glass = document.getElementById('glass');
        
        // Control elements
        const intensitySlider = document.getElementById('intensitySlider');
        const intensityValue = document.getElementById('intensityValue');
        const intensityFill = document.getElementById('intensityFill');
        const windSlider = document.getElementById('windSlider');
        const windValue = document.getElementById('windValue');
        const windFill = document.getElementById('windFill');
        const blurSlider = document.getElementById('blurSlider');
        const blurValue = document.getElementById('blurValue');
        const blurFill = document.getElementById('blurFill');
        
        // Preset buttons
        const lightRainBtn = document.getElementById('lightRainBtn');
        const mediumRainBtn = document.getElementById('mediumRainBtn');
        const heavyRainBtn = document.getElementById('heavyRainBtn');
        const stormBtn = document.getElementById('stormBtn');
        const fogBtn = document.getElementById('fogBtn');
        const clearBtn = document.getElementById('clearBtn');
        
        // Stats elements
        const dropCount = document.getElementById('dropCount');
        const streakCount = document.getElementById('streakCount');
        const totalDrops = document.getElementById('totalDrops');
        const fpsCounter = document.getElementById('fpsCounter');
        
        // Simulation state
        let simulationState = {
            intensity: 50, // 0-100
            wind: 20, // 0-100
            blur: 80, // 0-100
            activeDrops: [],
            activeStreaks: [],
            distortions: [],
            totalDropCount: 0,
            isMouseDown: false,
            mouseX: 0,
            mouseY: 0,
            windDirection: 0, // -1 to 1 (left to right)
            frameCount: 0,
            lastTime: 0,
            fps: 60
        };
        
        // Initialize the simulation
        function init() {
            // Create background lights
            createBackgroundLights();
            
            // Set up event listeners
            setupEventListeners();
            
            // Set initial slider values
            updateSliderValues();
            
            // Start the animation loop
            requestAnimationFrame(animate);
            
            // Start generating raindrops
            generateRaindrops();
        }
        
        // Create background lights in buildings
        function createBackgroundLights() {
            lightsContainer.innerHTML = '';
            
            // Create random lights in the buildings
            for (let i = 0; i < 50; i++) {
                const light = document.createElement('div');
                light.className = 'light';
                
                // Random position (mostly in lower part for buildings)
                const x = Math.random() * 100;
                const y = 40 + Math.random() * 60; // 40-100% from top
                
                light.style.left = `${x}%`;
                light.style.top = `${y}%`;
                
                // Random size and opacity
                const size = 2 + Math.random() * 4;
                light.style.width = `${size}px`;
                light.style.height = `${size}px`;
                light.style.opacity = 0.2 + Math.random() * 0.3;
                
                // Random animation delay
                light.style.animationDelay = `${Math.random() * 2}s`;
                
                lightsContainer.appendChild(light);
            }
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Slider events
            intensitySlider.addEventListener('input', updateIntensity);
            windSlider.addEventListener('input', updateWind);
            blurSlider.addEventListener('input', updateBlur);
            
            // Preset button events
            lightRainBtn.addEventListener('click', () => setPreset('light'));
            mediumRainBtn.addEventListener('click', () => setPreset('medium'));
            heavyRainBtn.addEventListener('click', () => setPreset('heavy'));
            stormBtn.addEventListener('click', () => setPreset('storm'));
            fogBtn.addEventListener('click', () => setPreset('fog'));
            clearBtn.addEventListener('click', () => setPreset('clear'));
            
            // Mouse events for interaction
            container.addEventListener('mousedown', handleMouseDown);
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseup', handleMouseUp);
            container.addEventListener('mouseleave', handleMouseUp);
            
            // Touch events for mobile
            container.addEventListener('touchstart', handleTouchStart);
            container.addEventListener('touchmove', handleTouchMove);
            container.addEventListener('touchend', handleTouchEnd);
            
            // Click to add droplets
            container.addEventListener('click', handleClick);
        }
        
        // Update slider values and UI
        function updateSliderValues() {
            // Intensity
            intensityFill.style.width = `${simulationState.intensity}%`;
            if (simulationState.intensity < 20) {
                intensityValue.textContent = 'Very Light';
            } else if (simulationState.intensity < 40) {
                intensityValue.textContent = 'Light';
            } else if (simulationState.intensity < 60) {
                intensityValue.textContent = 'Medium';
            } else if (simulationState.intensity < 80) {
                intensityValue.textContent = 'Heavy';
            } else {
                intensityValue.textContent = 'Torrential';
            }
            
            // Wind
            windFill.style.width = `${simulationState.wind}%`;
            if (simulationState.wind < 20) {
                windValue.textContent = 'Calm';
            } else if (simulationState.wind < 40) {
                windValue.textContent = 'Light Breeze';
            } else if (simulationState.wind < 60) {
                windValue.textContent = 'Moderate';
            } else if (simulationState.wind < 80) {
                windValue.textContent = 'Strong';
            } else {
                windValue.textContent = 'Gale';
            }
            
            // Blur
            blurFill.style.width = `${simulationState.blur}%`;
            if (simulationState.blur < 20) {
                blurValue.textContent = 'Off';
            } else if (simulationState.blur < 40) {
                blurValue.textContent = 'Light';
            } else if (simulationState.blur < 60) {
                blurValue.textContent = 'Medium';
            } else if (simulationState.blur < 80) {
                blurValue.textContent = 'Heavy';
            } else {
                blurValue.textContent = 'Maximum';
            }
            
            // Update glass blur
            glass.style.backdropFilter = `blur(${simulationState.blur * 0.1}px)`;
        }
        
        // Update intensity
        function updateIntensity() {
            simulationState.intensity = parseInt(intensitySlider.value);
            updateSliderValues();
        }
        
        // Update wind
        function updateWind() {
            simulationState.wind = parseInt(windSlider.value);
            updateSliderValues();
        }
        
        // Update blur
        function updateBlur() {
            simulationState.blur = parseInt(blurSlider.value);
            updateSliderValues();
        }
        
        // Set weather preset
        function setPreset(preset) {
            // Update active button
            [lightRainBtn, mediumRainBtn, heavyRainBtn, stormBtn, fogBtn, clearBtn].forEach(btn => {
                btn.classList.remove('active');
            });
            
            switch(preset) {
                case 'light':
                    lightRainBtn.classList.add('active');
                    simulationState.intensity = 25;
                    simulationState.wind = 15;
                    simulationState.blur = 30;
                    break;
                case 'medium':
                    mediumRainBtn.classList.add('active');
                    simulationState.intensity = 50;
                    simulationState.wind = 20;
                    simulationState.blur = 80;
                    break;
                case 'heavy':
                    heavyRainBtn.classList.add('active');
                    simulationState.intensity = 75;
                    simulationState.wind = 40;
                    simulationState.blur = 100;
                    break;
                case 'storm':
                    stormBtn.classList.add('active');
                    simulationState.intensity = 90;
                    simulationState.wind = 70;
                    simulationState.blur = 100;
                    break;
                case 'fog':
                    fogBtn.classList.add('active');
                    simulationState.intensity = 10;
                    simulationState.wind = 5;
                    simulationState.blur = 100;
                    break;
                case 'clear':
                    clearBtn.classList.add('active');
                    simulationState.intensity = 0;
                    simulationState.wind = 0;
                    simulationState.blur = 10;
                    break;
            }
            
            // Update sliders
            intensitySlider.value = simulationState.intensity;
            windSlider.value = simulationState.wind;
            blurSlider.value = simulationState.blur;
            
            updateSliderValues();
        }
        
        // Handle mouse down
        function handleMouseDown(e) {
            simulationState.isMouseDown = true;
            simulationState.mouseX = e.clientX;
            simulationState.mouseY = e.clientY;
        }
        
        // Handle mouse move
        function handleMouseMove(e) {
            if (simulationState.isMouseDown) {
                // Calculate wind direction based on mouse movement
                const deltaX = e.clientX - simulationState.mouseX;
                simulationState.windDirection = Math.max(-1, Math.min(1, deltaX / 100));
                
                // Update wind slider based on drag speed
                const speed = Math.abs(deltaX) / 10;
                simulationState.wind = Math.min(100, Math.max(0, speed * 10));
                windSlider.value = simulationState.wind;
                updateSliderValues();
                
                simulationState.mouseX = e.clientX;
                simulationState.mouseY = e.clientY;
            }
        }
        
        // Handle mouse up
        function handleMouseUp() {
            simulationState.isMouseDown = false;
            // Gradually reduce wind direction
            const reduceWind = () => {
                simulationState.windDirection *= 0.9;
                if (Math.abs(simulationState.windDirection) > 0.01) {
                    setTimeout(reduceWind, 100);
                } else {
                    simulationState.windDirection = 0;
                }
            };
            reduceWind();
        }
        
        // Handle touch start
        function handleTouchStart(e) {
            e.preventDefault();
            if (e.touches.length > 0) {
                simulationState.isMouseDown = true;
                simulationState.mouseX = e.touches[0].clientX;
                simulationState.mouseY = e.touches[0].clientY;
            }
        }
        
        // Handle touch move
        function handleTouchMove(e) {
            e.preventDefault();
            if (simulationState.isMouseDown && e.touches.length > 0) {
                const deltaX = e.touches[0].clientX - simulationState.mouseX;
                simulationState.windDirection = Math.max(-1, Math.min(1, deltaX / 100));
                
                const speed = Math.abs(deltaX) / 10;
                simulationState.wind = Math.min(100, Math.max(0, speed * 10));
                windSlider.value = simulationState.wind;
                updateSliderValues();
                
                simulationState.mouseX = e.touches[0].clientX;
                simulationState.mouseY = e.touches[0].clientY;
            }
        }
        
        // Handle touch end
        function handleTouchEnd() {
            simulationState.isMouseDown = false;
            const reduceWind = () => {
                simulationState.windDirection *= 0.9;
                if (Math.abs(simulationState.windDirection) > 0.01) {
                    setTimeout(reduceWind, 100);
                } else {
                    simulationState.windDirection = 0;
                }
            };
            reduceWind();
        }
        
        // Handle click to add droplets
        function handleClick(e) {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Add multiple droplets around click point
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const offsetX = (Math.random() - 0.5) * 50;
                    const offsetY = (Math.random() - 0.5) * 50;
                    createClickDroplet(x + offsetX, y + offsetY);
                }, i * 50);
            }
        }
        
        // Create a droplet from click
        function createClickDroplet(x, y) {
            const droplet = document.createElement('div');
            droplet.className = 'raindrop';
            
            // Random size
            const size = 3 + Math.random() * 7;
            droplet.style.width = `${size}px`;
            droplet.style.height = `${size * 1.2}px`;
            
            // Position
            droplet.style.left = `${x}px`;
            droplet.style.top = `${y}px`;
            
            // Random opacity
            const opacity = 0.7 + Math.random() * 0.3;
            droplet.style.opacity = opacity;
            
            // Animation
            droplet.style.animation = `dropForm 0.3s ease-out`;
            
            clickDroplets.appendChild(droplet);
            simulationState.totalDropCount++;
            
            // Create distortion effect
            createDistortion(x, y, size * 3);
            
            // Remove after animation
            setTimeout(() => {
                droplet.remove();
                
                // Create streak if droplet is in upper part of screen
                if (y < window.innerHeight * 0.7) {
                    createStreak(x, y, size);
                }
            }, 2000 + Math.random() * 1000);
        }
        
        // Generate raindrops based on intensity
        function generateRaindrops() {
            if (simulationState.intensity === 0) return;
            
            // Calculate number of drops to generate per frame
            const dropRate = simulationState.intensity * 0.05;
            const dropsToGenerate = Math.floor(dropRate) + (Math.random() < (dropRate % 1) ? 1 : 0);
            
            for (let i = 0; i < dropsToGenerate; i++) {
                createRaindrop();
            }
            
            // Schedule next generation
            setTimeout(generateRaindrops, 1000 / 30); // 30 times per second
        }
        
        // Create a new raindrop
        function createRaindrop() {
            const raindrop = {
                element: null,
                x: 0,
                y: 0,
                size: 0,
                speed: 0,
                life: 0,
                maxLife: 0,
                windEffect: 0,
                hasStreaked: false
            };
            
            // Create DOM element
            const dropElement = document.createElement('div');
            dropElement.className = 'raindrop';
            
            // Random size based on intensity
            const minSize = 1 + simulationState.intensity * 0.02;
            const maxSize = 3 + simulationState.intensity * 0.05;
            raindrop.size = minSize + Math.random() * (maxSize - minSize);
            
            dropElement.style.width = `${raindrop.size}px`;
            dropElement.style.height = `${raindrop.size * 1.2}px`;
            
            // Random starting position with wind effect
            const windOffset = simulationState.wind * 0.5 * (Math.random() - 0.5);
            raindrop.x = Math.random() * (window.innerWidth + 100) - 50 + windOffset;
            raindrop.y = -20; // Start above the window
            
            dropElement.style.left = `${raindrop.x}px`;
            dropElement.style.top = `${raindrop.y}px`;
            
            // Random opacity
            const opacity = 0.5 + Math.random() * 0.5;
            dropElement.style.opacity = opacity;
            
            // Animation
            dropElement.style.animation = `dropForm 0.5s ease-out`;
            
            // Add to DOM
            raindrops.appendChild(dropElement);
            raindrop.element = dropElement;
            
            // Set properties
            raindrop.speed = 1 + Math.random() * 2 + simulationState.intensity * 0.02;
            raindrop.maxLife = 3 + Math.random() * 5;
            raindrop.windEffect = simulationState.windDirection * simulationState.wind * 0.05;
            
            // Add to active drops
            simulationState.activeDrops.push(raindrop);
            simulationState.totalDropCount++;
            
            // Create distortion effect
            createDistortion(raindrop.x, raindrop.y, raindrop.size * 3);
        }
        
        // Create distortion effect at position
        function createDistortion(x, y, size) {
            const distortion = {
                element: null,
                x: x,
                y: y,
                size: size,
                life: 0,
                maxLife: 2
            };
            
            // Create DOM element
            const distortionElement = document.createElement('div');
            distortionElement.className = 'distortion';
            
            distortionElement.style.width = `${size}px`;
            distortionElement.style.height = `${size}px`;
            distortionElement.style.left = `${x - size/2}px`;
            distortionElement.style.top = `${y - size/2}px`;
            
            // Add to DOM
            distortions.appendChild(distortionElement);
            distortion.element = distortionElement;
            
            // Add to active distortions
            simulationState.distortions.push(distortion);
        }
        
        // Create streak from sliding raindrop
        function createStreak(x, y, size) {
            const streak = {
                element: null,
                x: x,
                y: y,
                length: 0,
                life: 0,
                maxLife: 1
            };
            
            // Create DOM element
            const streakElement = document.createElement('div');
            streakElement.className = 'streak';
            
            // Random width based on drop size
            const width = size * 0.8;
            streakElement.style.width = `${width}px`;
            streakElement.style.left = `${x - width/2}px`;
            streakElement.style.top = `${y}px`;
            
            // Animation
            streakElement.style.animation = `streakGrow 1s ease-out`;
            
            // Add to DOM
            raindrops.appendChild(streakElement);
            streak.element = streakElement;
            
            // Add to active streaks
            simulationState.activeStreaks.push(streak);
        }
        
        // Animation loop
        function animate(timestamp) {
            // Calculate FPS
            simulationState.frameCount++;
            if (timestamp - simulationState.lastTime >= 1000) {
                simulationState.fps = Math.round((simulationState.frameCount * 1000) / (timestamp - simulationState.lastTime));
                simulationState.frameCount = 0;
                simulationState.lastTime = timestamp;
                
                // Update FPS counter
                fpsCounter.textContent = simulationState.fps;
            }
            
            // Update active drops
            for (let i = simulationState.activeDrops.length - 1; i >= 0; i--) {
                const drop = simulationState.activeDrops[i];
                
                // Update position
                drop.y += drop.speed;
                drop.x += drop.windEffect + (simulationState.windDirection * simulationState.wind * 0.02);
                
                // Update element
                if (drop.element) {
                    drop.element.style.top = `${drop.y}px`;
                    drop.element.style.left = `${drop.x}px`;
                }
                
                // Update life
                drop.life += 1/60; // Assuming 60 FPS
                
                // Remove if out of bounds or too old
                if (drop.y > window.innerHeight + 50 || 
                    drop.x < -50 || 
                    drop.x > window.innerWidth + 50 || 
                    drop.life > drop.maxLife) {
                    
                    // Remove element
                    if (drop.element) {
                        drop.element.remove();
                    }
                    
                    // Create streak if needed
                    if (!drop.hasStreaked && drop.y < window.innerHeight * 0.8) {
                        createStreak(drop.x, drop.y, drop.size);
                        drop.hasStreaked = true;
                    }
                    
                    // Remove from array
                    simulationState.activeDrops.splice(i, 1);
                }
            }
            
            // Update active streaks
            for (let i = simulationState.activeStreaks.length - 1; i >= 0; i--) {
                const streak = simulationState.activeStreaks[i];
                
                // Update life
                streak.life += 1/60;
                
                // Remove if too old
                if (streak.life > streak.maxLife) {
                    if (streak.element) {
                        streak.element.remove();
                    }
                    simulationState.activeStreaks.splice(i, 1);
                }
            }
            
            // Update distortions
            for (let i = simulationState.distortions.length - 1; i >= 0; i--) {
                const distortion = simulationState.distortions[i];
                
                // Update life
                distortion.life += 1/60;
                
                // Update opacity based on life
                if (distortion.element) {
                    const opacity = 1 - (distortion.life / distortion.maxLife);
                    distortion.element.style.opacity = opacity;
                }
                
                // Remove if too old
                if (distortion.life > distortion.maxLife) {
                    if (distortion.element) {
                        distortion.element.remove();
                    }
                    simulationState.distortions.splice(i, 1);
                }
            }
            
            // Update stats
            dropCount.textContent = simulationState.activeDrops.length;
            streakCount.textContent = simulationState.activeStreaks.length;
            totalDrops.textContent = simulationState.totalDropCount;
            
            // Continue animation loop
            requestAnimationFrame(animate);
        }
        
        // Initialize the simulation
        init();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Recreate background lights
            createBackgroundLights();
        });