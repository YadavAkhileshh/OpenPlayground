        // Mood configurations with gradient colors, sun/moon position, and element properties
        const moodConfigs = {
            peaceful: {
                gradients: [
                    {time: "Dawn", colors: ["#ffafbd", "#ffc3a0"]},
                    {time: "Morning", colors: ["#87CEEB", "#E0F7FA"]},
                    {time: "Afternoon", colors: ["#1e90ff", "#87cefa"]},
                    {time: "Sunset", colors: ["#ff7e5f", "#feb47b"]},
                    {time: "Night", colors: ["#0f2027", "#203a43", "#2c5364"]}
                ],
                sunColor: "#FFD700",
                moonColor: "#F0F8FF",
                cloudColor: "rgba(255, 255, 255, 0.9)",
                starColor: "#FFFFFF",
                cloudDensity: 30,
                starIntensity: 30
            },
            energetic: {
                gradients: [
                    {time: "Dawn", colors: ["#FF512F", "#F09819"]},
                    {time: "Morning", colors: ["#FF8008", "#FFC837"]},
                    {time: "Afternoon", colors: ["#36D1DC", "#5B86E5"]},
                    {time: "Sunset", colors: ["#FF416C", "#FF4B2B"]},
                    {time: "Night", colors: ["#141E30", "#243B55"]}
                ],
                sunColor: "#FF4500",
                moonColor: "#FFA500",
                cloudColor: "rgba(255, 200, 100, 0.9)",
                starColor: "#FFFF00",
                cloudDensity: 20,
                starIntensity: 70
            },
            romantic: {
                gradients: [
                    {time: "Dawn", colors: ["#ec77ab", "#7873f5"]},
                    {time: "Morning", colors: ["#FFAFBD", "#ffc3a0"]},
                    {time: "Afternoon", colors: ["#fad0c4", "#ffd1ff"]},
                    {time: "Sunset", colors: ["#ff6b6b", "#c779d0", "#4bc0c8"]},
                    {time: "Night", colors: ["#654ea3", "#da98b4"]}
                ],
                sunColor: "#FF69B4",
                moonColor: "#FFB6C1",
                cloudColor: "rgba(255, 182, 193, 0.9)",
                starColor: "#FFB6C1",
                cloudDensity: 40,
                starIntensity: 60
            },
            dreamy: {
                gradients: [
                    {time: "Dawn", colors: ["#a8edea", "#fed6e3"]},
                    {time: "Morning", colors: ["#d4fc79", "#96e6a1"]},
                    {time: "Afternoon", colors: ["#84fab0", "#8fd3f4"]},
                    {time: "Sunset", colors: ["#a3bded", "#6991c7"]},
                    {time: "Night", colors: ["#5D4157", "#A8CABA"]}
                ],
                sunColor: "#9370DB",
                moonColor: "#DDA0DD",
                cloudColor: "rgba(220, 220, 255, 0.9)",
                starColor: "#E6E6FA",
                cloudDensity: 50,
                starIntensity: 80
            },
            melancholy: {
                gradients: [
                    {time: "Dawn", colors: ["#3a7bd5", "#00d2ff"]},
                    {time: "Morning", colors: ["#4b6cb7", "#182848"]},
                    {time: "Afternoon", colors: ["#232526", "#414345"]},
                    {time: "Sunset", colors: ["#2c3e50", "#bdc3c7"]},
                    {time: "Night", colors: ["#000000", "#434343"]}
                ],
                sunColor: "#778899",
                moonColor: "#B0C4DE",
                cloudColor: "rgba(128, 128, 128, 0.8)",
                starColor: "#B0C4DE",
                cloudDensity: 70,
                starIntensity: 40
            },
            hopeful: {
                gradients: [
                    {time: "Dawn", colors: ["#FFE000", "#799F0C"]},
                    {time: "Morning", colors: ["#FFEFBA", "#FFFFFF"]},
                    {time: "Afternoon", colors: ["#56CCF2", "#2F80ED"]},
                    {time: "Sunset", colors: ["#f46b45", "#eea849"]},
                    {time: "Night", colors: ["#0B486B", "#F56217"]}
                ],
                sunColor: "#FFD700",
                moonColor: "#FFEC8B",
                cloudColor: "rgba(255, 255, 255, 0.95)",
                starColor: "#FFFAF0",
                cloudDensity: 25,
                starIntensity: 90
            }
        };

        // DOM elements
        const sky = document.getElementById('sky');
        const moodButtons = document.querySelectorAll('.mood-btn');
        const cloudDensitySlider = document.getElementById('cloud-density');
        const starIntensitySlider = document.getElementById('star-intensity');
        const timeSlider = document.getElementById('time-slider');
        const timeDisplay = document.getElementById('time-display');
        const timeBackBtn = document.getElementById('time-back');
        const timeForwardBtn = document.getElementById('time-forward');

        // Current state
        let currentMood = 'peaceful';
        let currentTimeIndex = 2; // Default to "Sunset"
        let clouds = [];
        let stars = [];
        let sunMoon = null;

        // Initialize the sky
        function initSky() {
            generateSunMoon();
            generateClouds();
            generateStars();
            updateSky();
        }

        // Generate sun/moon element
        function generateSunMoon() {
            // Remove existing sun/moon
            if (sunMoon) {
                sunMoon.remove();
            }
            
            // Create new sun/moon
            sunMoon = document.createElement('div');
            sunMoon.className = 'sun-moon';
            sunMoon.id = 'sun-moon';
            sky.appendChild(sunMoon);
        }

        // Generate clouds
        function generateClouds() {
            // Clear existing clouds
            clouds.forEach(cloud => cloud.remove());
            clouds = [];
            
            const config = moodConfigs[currentMood];
            const cloudCount = Math.floor(config.cloudDensity / 10) * 5;
            
            for (let i = 0; i < cloudCount; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud';
                
                // Random size and position
                const size = Math.random() * 100 + 50;
                const x = Math.random() * 100;
                const y = Math.random() * 70;
                const opacity = Math.random() * 0.5 + 0.5;
                
                cloud.style.width = `${size}px`;
                cloud.style.height = `${size * 0.6}px`;
                cloud.style.left = `${x}%`;
                cloud.style.top = `${y}%`;
                cloud.style.opacity = opacity;
                cloud.style.background = config.cloudColor;
                
                // Add cloud parts to create fluffy appearance
                cloud.innerHTML = `
                    <div style="position: absolute; width: 60%; height: 60%; background: inherit; border-radius: 50%; top: -30%; left: 10%;"></div>
                    <div style="position: absolute; width: 70%; height: 70%; background: inherit; border-radius: 50%; top: -20%; right: 10%;"></div>
                `;
                
                sky.appendChild(cloud);
                clouds.push(cloud);
            }
        }

        // Generate stars
        function generateStars() {
            // Clear existing stars
            stars.forEach(star => star.remove());
            stars = [];
            
            const config = moodConfigs[currentMood];
            const starCount = Math.floor(config.starIntensity / 10) * 20;
            
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                
                // Random size and position
                const size = Math.random() * 4 + 1;
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.left = `${x}%`;
                star.style.top = `${y}%`;
                star.style.background = config.starColor;
                
                // Add twinkle animation
                const delay = Math.random() * 5;
                star.style.animation = `twinkle ${2 + Math.random() * 3}s infinite ${delay}s alternate`;
                
                sky.appendChild(star);
                stars.push(star);
            }
            
            // Add twinkle animation keyframes
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                @keyframes twinkle {
                    0% { opacity: 0.2; }
                    100% { opacity: ${Math.random() * 0.5 + 0.5}; }
                }
            `;
            document.head.appendChild(styleSheet);
        }

        // Update sky based on current mood and time
        function updateSky() {
            const config = moodConfigs[currentMood];
            const timeConfig = config.gradients[currentTimeIndex];
            
            // Update time display
            timeDisplay.textContent = timeConfig.time;
            timeSlider.value = currentTimeIndex;
            
            // Update sky gradient
            const gradientDirection = currentTimeIndex === 4 ? '180deg' : 'to bottom';
            const gradientColors = timeConfig.colors.join(', ');
            sky.style.background = `linear-gradient(${gradientDirection}, ${gradientColors})`;
            
            // Update sun/moon
            updateSunMoon();
            
            // Update sliders to reflect current mood
            cloudDensitySlider.value = config.cloudDensity;
            starIntensitySlider.value = config.starIntensity;
        }

        // Update sun/moon position and appearance
        function updateSunMoon() {
            if (!sunMoon) return;
            
            const config = moodConfigs[currentMood];
            const isNight = currentTimeIndex === 4;
            
            // Set color and size
            sunMoon.style.background = isNight ? config.moonColor : config.sunColor;
            sunMoon.style.width = isNight ? '80px' : '100px';
            sunMoon.style.height = isNight ? '80px' : '100px';
            
            // Add sun rays if it's not night
            if (!isNight) {
                sunMoon.style.boxShadow = `0 0 40px 20px ${config.sunColor}80`;
            } else {
                sunMoon.style.boxShadow = `0 0 30px 10px ${config.moonColor}40`;
                
                // Add moon craters
                sunMoon.innerHTML = `
                    <div style="position: absolute; width: 15px; height: 15px; background: rgba(0,0,0,0.1); border-radius: 50%; top: 20px; left: 20px;"></div>
                    <div style="position: absolute; width: 10px; height: 10px; background: rgba(0,0,0,0.1); border-radius: 50%; bottom: 25px; right: 25px;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; background: rgba(0,0,0,0.1); border-radius: 50%; top: 50px; left: 50px;"></div>
                `;
            }
            
            // Position based on time of day
            const positions = [
                {left: '10%', top: '10%'},   // Dawn
                {left: '30%', top: '15%'},   // Morning
                {left: '70%', top: '10%'},   // Afternoon
                {left: '90%', top: '20%'},   // Sunset
                {left: '20%', top: '80%'}    // Night
            ];
            
            sunMoon.style.left = positions[currentTimeIndex].left;
            sunMoon.style.top = positions[currentTimeIndex].top;
        }

        // Event listeners for mood buttons
        moodButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                moodButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update current mood
                currentMood = button.dataset.mood;
                
                // Update sky
                generateClouds();
                generateStars();
                updateSky();
            });
        });

        // Event listeners for sliders
        cloudDensitySlider.addEventListener('input', () => {
            const config = moodConfigs[currentMood];
            config.cloudDensity = parseInt(cloudDensitySlider.value);
            generateClouds();
        });

        starIntensitySlider.addEventListener('input', () => {
            const config = moodConfigs[currentMood];
            config.starIntensity = parseInt(starIntensitySlider.value);
            generateStars();
        });

        // Event listeners for time controls
        timeSlider.addEventListener('input', () => {
            currentTimeIndex = parseInt(timeSlider.value);
            updateSky();
        });

        timeBackBtn.addEventListener('click', () => {
            currentTimeIndex = Math.max(0, currentTimeIndex - 1);
            updateSky();
        });

        timeForwardBtn.addEventListener('click', () => {
            currentTimeIndex = Math.min(4, currentTimeIndex + 1);
            updateSky();
        });

        // Initialize the sky on load
        window.addEventListener('load', initSky);
        
        // Add some random movement to clouds
        setInterval(() => {
            clouds.forEach(cloud => {
                const currentLeft = parseFloat(cloud.style.left);
                let newLeft = currentLeft + Math.random() * 0.5;
                
                // Reset cloud position if it goes off screen
                if (newLeft > 100) {
                    newLeft = -20;
                    cloud.style.top = `${Math.random() * 70}%`;
                }
                
                cloud.style.left = `${newLeft}%`;
            });
        }, 100);