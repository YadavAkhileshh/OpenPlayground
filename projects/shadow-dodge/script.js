
        // Game variables
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const timerElement = document.getElementById('timer');
        const bestTimeElement = document.getElementById('bestTime');
        const flareCountElement = document.getElementById('flareCount');
        const difficultyBar = document.getElementById('difficultyBar');
        const difficultyLevel = document.getElementById('difficultyLevel');
        const startButton = document.getElementById('startButton');
        const resetButton = document.getElementById('resetButton');
        const restartButton = document.getElementById('restartButton');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const finalTimeElement = document.getElementById('finalTime');
        const bestTimeDisplay = document.getElementById('bestTimeDisplay');
        
        // Mobile controls
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        // Game state
        let gameRunning = false;
        let gamePaused = false;
        let gameTime = 0;
        let bestTime = localStorage.getItem('solarFlareBestTime') || 0;
        let animationId;
        
        // Set best time on load
        bestTimeElement.textContent = `${bestTime}s`;
        
        // Player object
        const player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 15,
            color: '#00aaff',
            speed: 5,
            moveX: 0,
            moveY: 0,
            trail: []
        };
        
        // Sun (light source) object
        const sun = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 60,
            color: '#ffaa00',
            pulse: 0,
            pulseSpeed: 0.05,
            flares: []
        };
        
        // Solar flares (danger zones) array
        let flares = [];
        let flareSpawnInterval = 2000; // milliseconds
        let lastFlareSpawn = 0;
        let flareExpansionRate = 0.5;
        
        // Key states for movement
        const keys = {};
        
        // Initialize game
        function initGame() {
            gameRunning = true;
            gamePaused = false;
            gameTime = 0;
            player.x = canvas.width / 2;
            player.y = canvas.height / 2;
            player.trail = [];
            flares = [];
            sun.flares = [];
            flareSpawnInterval = 2000;
            flareExpansionRate = 0.5;
            lastFlareSpawn = 0;
            
            // Create initial flares
            for (let i = 0; i < 3; i++) {
                spawnFlare();
            }
            
            // Start game loop
            gameLoop();
        }
        
        // Spawn a new solar flare
        function spawnFlare() {
            // Random position away from the player
            let x, y;
            let attempts = 0;
            const minDistance = 150;
            
            do {
                x = Math.random() * (canvas.width - 100) + 50;
                y = Math.random() * (canvas.height - 100) + 50;
                attempts++;
            } while (Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2) < minDistance && attempts < 20);
            
            // Random flare color (orange/yellow/red spectrum)
            const colors = ['#ff5500', '#ffaa00', '#ff7700', '#ff3300'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            flares.push({
                x: x,
                y: y,
                radius: 10,
                maxRadius: Math.random() * 80 + 70,
                color: color,
                expansionRate: flareExpansionRate,
                pulse: Math.random() * Math.PI * 2
            });
            
            // Update flare count display
            flareCountElement.textContent = flares.length;
        }
        
        // Update game state
        function updateGame(timestamp) {
            if (gamePaused || !gameRunning) return;
            
            // Calculate delta time
            const deltaTime = 16; // Approximate for 60fps
            
            // Update game time
            gameTime += deltaTime / 1000;
            timerElement.textContent = `${gameTime.toFixed(1)}s`;
            
            // Update sun pulse
            sun.pulse += sun.pulseSpeed;
            
            // Update player movement based on keys
            if (keys['ArrowUp'] || keys['w'] || keys['W']) player.moveY = -player.speed;
            if (keys['ArrowDown'] || keys['s'] || keys['S']) player.moveY = player.speed;
            if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.moveX = -player.speed;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) player.moveX = player.speed;
            
            // Update player position
            player.x += player.moveX;
            player.y += player.moveY;
            
            // Keep player within bounds
            player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
            player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
            
            // Add position to trail
            player.trail.push({x: player.x, y: player.y});
            if (player.trail.length > 15) player.trail.shift();
            
            // Reset movement
            player.moveX = 0;
            player.moveY = 0;
            
            // Spawn new flares based on interval
            if (timestamp - lastFlareSpawn > flareSpawnInterval) {
                spawnFlare();
                lastFlareSpawn = timestamp;
                
                // Increase difficulty over time
                if (flareSpawnInterval > 500) {
                    flareSpawnInterval -= 50;
                    flareExpansionRate += 0.02;
                }
            }
            
            // Update flares
            for (let i = flares.length - 1; i >= 0; i--) {
                const flare = flares[i];
                
                // Expand flare
                flare.radius += flare.expansionRate;
                flare.pulse += 0.05;
                
                // Remove flare if it reaches max size
                if (flare.radius >= flare.maxRadius) {
                    flares.splice(i, 1);
                    flareCountElement.textContent = flares.length;
                    continue;
                }
                
                // Check collision with player
                const distance = Math.sqrt(
                    Math.pow(player.x - flare.x, 2) + 
                    Math.pow(player.y - flare.y, 2)
                );
                
                if (distance < player.radius + flare.radius) {
                    gameOver();
                    return;
                }
            }
            
            // Update difficulty display
            const difficulty = Math.min(100, Math.floor(gameTime / 2));
            difficultyBar.style.width = `${difficulty}%`;
            difficultyLevel.textContent = Math.floor(difficulty / 20) + 1;
        }
        
        // Draw game elements
        function drawGame() {
            // Clear canvas with space background
            ctx.fillStyle = '#0c0c2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars
            drawStars();
            
            // Draw sun
            drawSun();
            
            // Draw flares
            for (const flare of flares) {
                drawFlare(flare);
            }
            
            // Draw player trail
            drawTrail();
            
            // Draw player
            drawPlayer();
            
            // Draw sun flares (visual effect)
            drawSunFlares();
        }
        
        // Draw stars in background
        function drawStars() {
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 100; i++) {
                const x = (i * 7) % canvas.width;
                const y = (i * 13) % canvas.height;
                const size = Math.random() * 1.5;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw the sun
        function drawSun() {
            // Sun glow
            const gradient = ctx.createRadialGradient(
                sun.x, sun.y, sun.radius,
                sun.x, sun.y, sun.radius * 2
            );
            gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(sun.x, sun.y, sun.radius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Sun body
            ctx.beginPath();
            ctx.fillStyle = sun.color;
            ctx.arc(sun.x, sun.y, sun.radius + Math.sin(sun.pulse) * 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Sun surface details
            ctx.fillStyle = '#ff7700';
            for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI) / 6;
                const x = sun.x + Math.cos(angle) * (sun.radius - 5);
                const y = sun.y + Math.sin(angle) * (sun.radius - 5);
                ctx.beginPath();
                ctx.arc(x, y, 3 + Math.sin(sun.pulse + i) * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw a solar flare
        function drawFlare(flare) {
            // Flare glow
            const gradient = ctx.createRadialGradient(
                flare.x, flare.y, flare.radius,
                flare.x, flare.y, flare.radius + 20
            );
            gradient.addColorStop(0, flare.color);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(flare.x, flare.y, flare.radius + 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Flare body
            ctx.beginPath();
            ctx.fillStyle = flare.color;
            ctx.arc(flare.x, flare.y, flare.radius + Math.sin(flare.pulse) * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Flare spikes
            ctx.strokeStyle = flare.color;
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4 + flare.pulse;
                const spikeLength = flare.radius * 0.7;
                const startX = flare.x + Math.cos(angle) * flare.radius;
                const startY = flare.y + Math.sin(angle) * flare.radius;
                const endX = flare.x + Math.cos(angle) * (flare.radius + spikeLength);
                const endY = flare.y + Math.sin(angle) * (flare.radius + spikeLength);
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        }
        
        // Draw player trail
        function drawTrail() {
            for (let i = 0; i < player.trail.length; i++) {
                const point = player.trail[i];
                const alpha = i / player.trail.length;
                const radius = player.radius * alpha;
                
                ctx.beginPath();
                ctx.fillStyle = `rgba(0, 170, 255, ${alpha * 0.5})`;
                ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw player spaceship
        function drawPlayer() {
            // Player glow
            const gradient = ctx.createRadialGradient(
                player.x, player.y, player.radius,
                player.x, player.y, player.radius * 2
            );
            gradient.addColorStop(0, 'rgba(0, 200, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
            
            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(player.x, player.y, player.radius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Player body
            ctx.beginPath();
            ctx.fillStyle = player.color;
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Player details
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Player direction indicator
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(player.x + player.radius * 0.7, player.y, player.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw sun flares (visual effect only)
        function drawSunFlares() {
            // Generate random flares occasionally
            if (Math.random() < 0.05 && sun.flares.length < 5) {
                const angle = Math.random() * Math.PI * 2;
                const distance = sun.radius + 10;
                sun.flares.push({
                    x: sun.x + Math.cos(angle) * distance,
                    y: sun.y + Math.sin(angle) * distance,
                    length: 0,
                    maxLength: Math.random() * 50 + 30,
                    speed: Math.random() * 3 + 2,
                    angle: angle
                });
            }
            
            // Draw and update flares
            for (let i = sun.flares.length - 1; i >= 0; i--) {
                const flare = sun.flares[i];
                
                ctx.strokeStyle = 'rgba(255, 100, 0, 0.7)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(sun.x + Math.cos(flare.angle) * sun.radius, 
                          sun.y + Math.sin(flare.angle) * sun.radius);
                ctx.lineTo(sun.x + Math.cos(flare.angle) * (sun.radius + flare.length),
                          sun.y + Math.sin(flare.angle) * (sun.radius + flare.length));
                ctx.stroke();
                
                flare.length += flare.speed;
                
                if (flare.length >= flare.maxLength) {
                    sun.flares.splice(i, 1);
                }
            }
        }
        
        // Game over function
        function gameOver() {
            gameRunning = false;
            
            // Update best time if current time is higher
            if (gameTime > bestTime) {
                bestTime = gameTime;
                localStorage.setItem('solarFlareBestTime', bestTime);
                bestTimeElement.textContent = `${bestTime.toFixed(1)}s`;
            }
            
            // Show game over screen
            finalTimeElement.textContent = gameTime.toFixed(1);
            bestTimeDisplay.textContent = bestTime.toFixed(1);
            gameOverScreen.style.display = 'flex';
            
            // Cancel animation frame
            cancelAnimationFrame(animationId);
        }
        
        // Game loop
        function gameLoop(timestamp) {
            updateGame(timestamp);
            drawGame();
            
            if (gameRunning) {
                animationId = requestAnimationFrame(gameLoop);
            }
        }
        
        // Event listeners for keyboard controls
        document.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            
            // Spacebar to pause/resume
            if (e.code === 'Space' && gameRunning) {
                e.preventDefault();
                gamePaused = !gamePaused;
                startButton.innerHTML = gamePaused ? 
                    '<i class="fas fa-play"></i> Resume' : 
                    '<i class="fas fa-pause"></i> Pause';
            }
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });
        
        // Mouse/touch controls
        canvas.addEventListener('click', (e) => {
            if (!gameRunning) return;
            
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            player.x = (e.clientX - rect.left) * scaleX;
            player.y = (e.clientY - rect.top) * scaleY;
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (!gameRunning) return;
            e.preventDefault();
            
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const touch = e.touches[0];
            
            player.x = (touch.clientX - rect.left) * scaleX;
            player.y = (touch.clientY - rect.top) * scaleY;
        }, { passive: false });
        
        // Mobile control buttons
        function setupMobileControls() {
            // Button press events
            upBtn.addEventListener('touchstart', () => keys['ArrowUp'] = true);
            upBtn.addEventListener('touchend', () => keys['ArrowUp'] = false);
            
            downBtn.addEventListener('touchstart', () => keys['ArrowDown'] = true);
            downBtn.addEventListener('touchend', () => keys['ArrowDown'] = false);
            
            leftBtn.addEventListener('touchstart', () => keys['ArrowLeft'] = true);
            leftBtn.addEventListener('touchend', () => keys['ArrowLeft'] = false);
            
            rightBtn.addEventListener('touchstart', () => keys['ArrowRight'] = true);
            rightBtn.addEventListener('touchend', () => keys['ArrowRight'] = false);
            
            // Mouse events for testing on desktop
            upBtn.addEventListener('mousedown', () => keys['ArrowUp'] = true);
            upBtn.addEventListener('mouseup', () => keys['ArrowUp'] = false);
            
            downBtn.addEventListener('mousedown', () => keys['ArrowDown'] = true);
            downBtn.addEventListener('mouseup', () => keys['ArrowDown'] = false);
            
            leftBtn.addEventListener('mousedown', () => keys['ArrowLeft'] = true);
            leftBtn.addEventListener('mouseup', () => keys['ArrowLeft'] = false);
            
            rightBtn.addEventListener('mousedown', () => keys['ArrowRight'] = true);
            rightBtn.addEventListener('mouseup', () => keys['ArrowRight'] = false);
        }
        
        // Button event listeners
        startButton.addEventListener('click', () => {
            if (!gameRunning) {
                initGame();
                startButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
                gameOverScreen.style.display = 'none';
            } else {
                gamePaused = !gamePaused;
                startButton.innerHTML = gamePaused ? 
                    '<i class="fas fa-play"></i> Resume' : 
                    '<i class="fas fa-pause"></i> Pause';
            }
        });
        
        resetButton.addEventListener('click', () => {
            bestTime = 0;
            localStorage.setItem('solarFlareBestTime', 0);
            bestTimeElement.textContent = '0.0s';
        });
        
        restartButton.addEventListener('click', () => {
            initGame();
            startButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
            gameOverScreen.style.display = 'none';
        });
        
        // Initialize mobile controls
        setupMobileControls();
        
        // Initial draw
        drawGame();
        
        // Instructions alert
        setTimeout(() => {
            if (!localStorage.getItem('solarFlareInstructionsShown')) {
                alert("SOLAR FLARE DODGE\n\nMission: Navigate your spaceship through the solar field while avoiding expanding radiation zones.\n\nControls: Use WASD or Arrow Keys to move, or click/tap to move directly.\n\nSurvive as long as possible as the sun becomes more active over time!");
                localStorage.setItem('solarFlareInstructionsShown', 'true');
            }
        }, 500);
