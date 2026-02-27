    (function() {
        // ---------- SPACE SHOOTER GAME ----------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const healthFill = document.getElementById('healthFill');
        const waveDisplay = document.getElementById('waveDisplay');
        const killsDisplay = document.getElementById('killsDisplay');
        const enemiesDisplay = document.getElementById('enemiesDisplay');
        const weaponDisplay = document.getElementById('weaponDisplay');
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        // Powerup icons
        const rapidIcon = document.getElementById('rapidIcon');
        const shieldIcon = document.getElementById('shieldIcon');
        const spreadIcon = document.getElementById('spreadIcon');

        // Game constants
        const PLAYER_WIDTH = 40;
        const PLAYER_HEIGHT = 40;
        const PLAYER_SPEED = 8;

        // Game state
        let gameActive = false;
        let gameLoop = null;
        let score = 0;
        let kills = 0;
        let wave = 1;
        let playerHealth = 3;
        
        // Player
        let player = {
            x: canvas.width / 2,
            y: canvas.height - 80,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT
        };

        // Powerups
        let powerups = {
            rapidFire: false,
            shield: false,
            spreadShot: false
        };

        let powerupTimers = {
            rapidFire: 0,
            shield: 0,
            spreadShot: 0
        };

        // Bullets
        let bullets = [];
        const BULLET_SPEED = 8;
        const BULLET_SIZE = 5;

        // Enemies
        let enemies = [];
        let enemyBullets = [];

        // Mouse position
        let mouseX = player.x;
        
        // Shooting cooldown
        let shootCooldown = 0;
        const BASE_SHOOT_DELAY = 15;

        // Initialize game
        function initGame() {
            player = {
                x: canvas.width / 2,
                y: canvas.height - 80,
                width: PLAYER_WIDTH,
                height: PLAYER_HEIGHT
            };
            
            bullets = [];
            enemies = [];
            enemyBullets = [];
            
            score = 0;
            kills = 0;
            wave = 1;
            playerHealth = 3;
            
            powerups.rapidFire = false;
            powerups.shield = false;
            powerups.spreadShot = false;
            
            powerupTimers = {
                rapidFire: 0,
                shield: 0,
                spreadShot: 0
            };
            
            spawnWave();
            updateUI();
        }

        // Spawn enemy wave
        function spawnWave() {
            const enemyCount = 5 + wave * 2;
            for (let i = 0; i < enemyCount; i++) {
                enemies.push({
                    x: Math.random() * (canvas.width - 50) + 25,
                    y: Math.random() * 200 + 50,
                    width: 35,
                    height: 35,
                    speed: 1 + wave * 0.2,
                    health: 1,
                    type: Math.random() > 0.7 ? 'strong' : 'normal'
                });
            }
        }

        // Shoot bullet
        function shoot() {
            if (!gameActive) return;
            if (playerHealth <= 0) return;
            
            if (powerups.spreadShot) {
                // Spread shot (3 bullets)
                bullets.push({ x: player.x, y: player.y - 20, dx: 0, dy: -BULLET_SPEED, size: BULLET_SIZE });
                bullets.push({ x: player.x - 15, y: player.y - 10, dx: -2, dy: -BULLET_SPEED, size: BULLET_SIZE });
                bullets.push({ x: player.x + 15, y: player.y - 10, dx: 2, dy: -BULLET_SPEED, size: BULLET_SIZE });
            } else {
                // Single shot
                bullets.push({ x: player.x, y: player.y - 20, dx: 0, dy: -BULLET_SPEED, size: BULLET_SIZE });
            }
        }

        // Update game
        function update() {
            if (!gameActive || playerHealth <= 0) {
                if (playerHealth <= 0 && gameActive) {
                    gameActive = false;
                }
                return;
            }

            // Update player position (mouse follow)
            player.x = Math.max(PLAYER_WIDTH/2, Math.min(canvas.width - PLAYER_WIDTH/2, mouseX));

            // Update powerup timers
            for (let [key, value] of Object.entries(powerupTimers)) {
                if (value > 0) {
                    powerupTimers[key]--;
                    if (powerupTimers[key] <= 0) {
                        powerups[key] = false;
                    }
                }
            }

            // Shooting cooldown
            if (shootCooldown > 0) {
                shootCooldown--;
            }

            // Update bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                bullet.x += bullet.dx || 0;
                bullet.y += bullet.dy || -BULLET_SPEED;

                // Remove if off screen
                if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
                    bullets.splice(i, 1);
                    continue;
                }

                // Check collision with enemies
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const enemy = enemies[j];
                    if (bullet.x > enemy.x - enemy.width/2 && 
                        bullet.x < enemy.x + enemy.width/2 &&
                        bullet.y > enemy.y - enemy.height/2 && 
                        bullet.y < enemy.y + enemy.height/2) {
                        
                        // Hit enemy
                        enemies.splice(j, 1);
                        bullets.splice(i, 1);
                        score += 10;
                        kills++;
                        
                        // Chance to drop powerup
                        if (Math.random() < 0.1) {
                            activateRandomPowerup();
                        }
                        break;
                    }
                }
            }

            // Update enemies
            enemies.forEach(enemy => {
                // Move toward player
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0) {
                    enemy.x += (dx / dist) * enemy.speed;
                    enemy.y += (dy / dist) * enemy.speed * 0.5;
                }

                // Enemy shooting
                if (Math.random() < 0.02) {
                    enemyBullets.push({
                        x: enemy.x,
                        y: enemy.y,
                        dx: (player.x - enemy.x) / 30,
                        dy: (player.y - enemy.y) / 30,
                        size: 4
                    });
                }
            });

            // Update enemy bullets
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const bullet = enemyBullets[i];
                bullet.x += bullet.dx;
                bullet.y += bullet.dy;

                // Remove if off screen
                if (bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
                    enemyBullets.splice(i, 1);
                    continue;
                }

                // Check collision with player
                if (!powerups.shield && 
                    bullet.x > player.x - PLAYER_WIDTH/2 && 
                    bullet.x < player.x + PLAYER_WIDTH/2 &&
                    bullet.y > player.y - PLAYER_HEIGHT/2 && 
                    bullet.y < player.y + PLAYER_HEIGHT/2) {
                    
                    playerHealth--;
                    enemyBullets.splice(i, 1);
                    
                    if (playerHealth <= 0) {
                        gameActive = false;
                    }
                }
            }

            // Check if wave cleared
            if (enemies.length === 0) {
                wave++;
                spawnWave();
            }

            // Update UI
            updateUI();
        }

        // Activate random powerup
        function activateRandomPowerup() {
            const powerupTypes = ['rapidFire', 'shield', 'spreadShot'];
            const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            
            powerups[type] = true;
            powerupTimers[type] = 300; // ~5 seconds at 60fps
            
            // Visual feedback
            switch(type) {
                case 'rapidFire':
                    rapidIcon.classList.add('active');
                    setTimeout(() => rapidIcon.classList.remove('active'), 5000);
                    break;
                case 'shield':
                    shieldIcon.classList.add('active');
                    setTimeout(() => shieldIcon.classList.remove('active'), 5000);
                    break;
                case 'spreadShot':
                    spreadIcon.classList.add('active');
                    setTimeout(() => spreadIcon.classList.remove('active'), 5000);
                    break;
            }
        }

        // Update UI
        function updateUI() {
            scoreDisplay.textContent = score;
            healthFill.style.width = (playerHealth / 3) * 100 + '%';
            waveDisplay.textContent = `🌊 WAVE ${wave}`;
            killsDisplay.textContent = kills;
            enemiesDisplay.textContent = enemies.length;
            
            const weaponLevel = powerups.spreadShot ? 3 : (powerups.rapidFire ? 2 : 1);
            weaponDisplay.textContent = `🔫 CANNON LVL ${weaponLevel}`;
        }

        // Draw everything
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw stars (background)
            for (let i = 0; i < 50; i++) {
                if (i % 2 === 0) continue; // lazy random
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc((i * 37) % canvas.width, (Date.now() * 0.01 + i * 23) % canvas.height, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw player
            ctx.shadowColor = '#88aaff';
            ctx.shadowBlur = 20;
            
            // Shield effect
            if (powerups.shield) {
                ctx.beginPath();
                ctx.arc(player.x, player.y, 35, 0, Math.PI * 2);
                ctx.strokeStyle = '#88ffff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Player ship
            ctx.fillStyle = '#88ccff';
            ctx.beginPath();
            ctx.moveTo(player.x, player.y - 25);
            ctx.lineTo(player.x + 20, player.y + 15);
            ctx.lineTo(player.x - 20, player.y + 15);
            ctx.closePath();
            ctx.fill();

            // Engine glow
            ctx.fillStyle = '#ffaa44';
            ctx.beginPath();
            ctx.moveTo(player.x - 10, player.y + 15);
            ctx.lineTo(player.x, player.y + 25);
            ctx.lineTo(player.x + 10, player.y + 15);
            ctx.fill();

            // Draw bullets
            ctx.fillStyle = '#ffff88';
            ctx.shadowBlur = 15;
            bullets.forEach(bullet => {
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw enemies
            enemies.forEach(enemy => {
                ctx.fillStyle = enemy.type === 'strong' ? '#ff6666' : '#ff4444';
                ctx.shadowBlur = 15;
                
                // Enemy ship
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y - 15);
                ctx.lineTo(enemy.x + 15, enemy.y + 10);
                ctx.lineTo(enemy.x - 15, enemy.y + 10);
                ctx.closePath();
                ctx.fill();
                
                // Enemy eyes
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(enemy.x - 5, enemy.y - 5, 3, 0, Math.PI * 2);
                ctx.arc(enemy.x + 5, enemy.y - 5, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw enemy bullets
            ctx.fillStyle = '#ff8888';
            enemyBullets.forEach(bullet => {
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Game over message
            if (playerHealth <= 0) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000000b0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#ff8888';
                ctx.font = 'bold 40px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 30);
                ctx.font = '24px Segoe UI';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 20);
            }

            ctx.shadowBlur = 0;
        }

        // Animation loop
        function gameTick() {
            update();
            draw();
            gameLoop = requestAnimationFrame(gameTick);
        }

        // Start game
        function startGame() {
            if (gameActive) return;
            gameActive = true;
            initGame();
            startBtn.disabled = true;
            restartBtn.disabled = false;
        }

        // Restart game
        function restartGame() {
            gameActive = true;
            initGame();
            startBtn.disabled = true;
            restartBtn.disabled = false;
        }

        // Event listeners
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
        });

        canvas.addEventListener('click', () => {
            if (!gameActive || playerHealth <= 0) return;
            
            if (shootCooldown <= 0) {
                shoot();
                shootCooldown = powerups.rapidFire ? 5 : BASE_SHOOT_DELAY;
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!gameActive || playerHealth <= 0) return;
                
                if (shootCooldown <= 0) {
                    shoot();
                    shootCooldown = powerups.rapidFire ? 5 : BASE_SHOOT_DELAY;
                }
            }
        });

        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', restartGame);

        // Initial draw
        initGame();
        draw();
        gameTick();
    })();