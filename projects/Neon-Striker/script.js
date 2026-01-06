class NeonStrikerGame {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.resizeCanvas();
                
                // Pre-calculate colors for better performance
                this.COLORS = {
                    CYAN: '#0ff',
                    GREEN: '#0f0',
                    PINK: '#f0f',
                    YELLOW: '#ff0',
                    RED: '#f00',
                    BLUE: '#0af',
                    ORANGE: '#f90'
                };
                
                // Game state
                this.gameRunning = false;
                this.score = 0;
                this.wave = 1;
                this.gameStartTime = 0;
                this.elapsedSeconds = 0;
                
                // Game objects
                this.enemies = [];
                this.bullets = [];
                this.particles = [];
                this.powerUps = [];
                
                // Game settings
                this.boss = null;
                this.screenShake = 0;
                this.screenShakeIntensity = 0;
                this.mouseX = this.canvas.width / 2;
                this.mouseY = this.canvas.height / 2;
                this.aimMode = 'mouse';
                this.keys = {};
                
                // Wave settings
                this.enemiesKilledThisWave = 0;
                this.enemiesNeededForWave = 5;
                
                // Performance tracking
                this.lastFrameTime = performance.now();
                this.deltaTime = 1;
                this.frameCount = 0;
                this.fps = 60;
                
                this.setupPlayer();
                this.setupEventListeners();
            }

            setupPlayer() {
                this.player = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height - 120,
                    width: 40,
                    height: 50,
                    speed: 6,
                    health: 100,
                    maxHealth: 100,
                    turretAngle: -Math.PI / 2,
                    weapon: 'cannon',
                    fireRate: 150,
                    lastShot: 0,
                    rotationSpeed: 0.12,
                    autoFireEnabled: true,
                    shield: 0,
                    maxShield: 50,
                    color: this.COLORS.CYAN
                };
            }

            setupEventListeners() {
                document.addEventListener('keydown', (e) => {
                    const key = e.key.toLowerCase();
                    if (key === 'r') {
                        this.toggleAimMode();
                    }
                    this.keys[key] = true;
                });
                
                document.addEventListener('keyup', (e) => {
                    this.keys[e.key.toLowerCase()] = false;
                });
                
                this.canvas.addEventListener('mousemove', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    this.mouseX = e.clientX - rect.left;
                    this.mouseY = e.clientY - rect.top;
                });
                
                // Prevent context menu
                this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
            }

            toggleAimMode() {
                this.aimMode = this.aimMode === 'mouse' ? 'rotate' : 'mouse';
                document.getElementById('aimMode').textContent = this.aimMode === 'mouse' ? 'MOUSE' : 'ROTATE';
            }

            startGame() {
                document.getElementById('startScreen').classList.add('hidden');
                document.getElementById('gameOverScreen').classList.add('hidden');
                
                // Clear any existing spawn interval
                if (this.spawnInterval) {
                    clearInterval(this.spawnInterval);
                }
                
                this.gameRunning = true;
                this.gameStartTime = Date.now();
                this.score = 0;
                this.wave = 1;
                this.enemiesKilledThisWave = 0;
                
                // Reset all arrays
                this.enemies = [];
                this.bullets = [];
                this.particles = [];
                this.powerUps = [];
                this.boss = null;
                
                this.setupPlayer();
                this.spawnWave();
                this.gameLoop();
            }

            update() {
                if (!this.gameRunning) return;

                // Calculate delta time
                const now = performance.now();
                this.deltaTime = Math.min((now - this.lastFrameTime) / 16.67, 2);
                this.lastFrameTime = now;
                
                this.elapsedSeconds = (Date.now() - this.gameStartTime) / 1000;
                
                // Update game objects
                this.updatePlayer();
                this.updateBullets();
                this.updateEnemies();
                this.updatePowerUps();
                this.updateParticles();
                
                // Check collisions
                this.checkPowerUpCollisions();
                this.checkEnemyCollisions();
                
                // Game progression
                this.screenShake *= 0.92;
                this.checkWaveCompletion();
                
                // Update UI
                this.updateUI();
            }

            updatePlayer() {
                const p = this.player;
                const moveSpeed = p.speed;
                
                // Movement with boundary checking
                if (this.keys['w'] && p.y > p.height / 2) p.y -= moveSpeed;
                if (this.keys['s'] && p.y < this.canvas.height - p.height / 2) p.y += moveSpeed;
                if (this.keys['a'] && p.x > p.width / 2) p.x -= moveSpeed;
                if (this.keys['d'] && p.x < this.canvas.width - p.width / 2) p.x += moveSpeed;

                // Aiming
                if (this.aimMode === 'mouse') {
                    p.turretAngle = Math.atan2(this.mouseY - p.y, this.mouseX - p.x);
                } else {
                    p.turretAngle += p.rotationSpeed;
                }

                // Auto-firing
                if (p.autoFireEnabled && Date.now() - p.lastShot > p.fireRate) {
                    this.shoot();
                    p.lastShot = Date.now();
                }

                // Update shield
                if (p.shield > 0) {
                    p.shield -= 0.3;
                    if (p.shield < 0) p.shield = 0;
                }
            }

            shoot() {
                const p = this.player;
                const angle = p.turretAngle;
                const startX = p.x + Math.cos(angle) * 30;
                const startY = p.y + Math.sin(angle) * 30;
                
                // Weapon stats
                let damage = 10, speed = 10, color = p.color;
                
                switch(p.weapon) {
                    case 'laser':
                        damage = 8; speed = 14; color = this.COLORS.GREEN; break;
                    case 'plasma':
                        damage = 15; speed = 8; color = this.COLORS.PINK; break;
                }

                this.bullets.push({
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    damage: damage,
                    color: color,
                    lifetime: 200,
                    radius: 4,
                    isEnemyBullet: false
                });
            }

            updateBullets() {
                for (let i = this.bullets.length - 1; i >= 0; i--) {
                    const b = this.bullets[i];
                    b.x += b.vx;
                    b.y += b.vy;
                    b.lifetime--;

                    // Boundary check and lifetime
                    if (b.lifetime <= 0 || 
                        b.x < -50 || b.x > this.canvas.width + 50 || 
                        b.y < -50 || b.y > this.canvas.height + 50) {
                        this.bullets.splice(i, 1);
                    }
                }
            }

            
// Also update the spawnWave method to ensure enemies keep coming:
            spawnWave() {
                this.enemiesKilledThisWave = 0;
                this.enemiesNeededForWave = 5 + this.wave * 2; // Scale with waves
                
                // Spawn initial enemies
                const initialEnemyCount = 3 + Math.floor(this.wave / 2);
                
                for (let i = 0; i < initialEnemyCount; i++) {
                    const type = this.getEnemyTypeForWave();
                    this.spawnEnemy(type, Math.random() * this.canvas.width, -50 - i * 40);
                }

                // Set up continuous spawning during the wave
                this.setupContinuousSpawning();
                
                // Spawn boss every 5 waves
                if (this.wave % 5 === 0) {
                    setTimeout(() => this.spawnBoss(), 5000);
                }
            }

            setupContinuousSpawning() {
                if (this.spawnInterval) {
                    clearInterval(this.spawnInterval);
                }
                
                this.spawnInterval = setInterval(() => {
                    if (this.gameRunning && this.enemies.length < 15 && !this.boss) {
                        const type = this.getEnemyTypeForWave();
                        this.spawnEnemy(type, Math.random() * this.canvas.width, -50);
                    }
                }, 2000 + Math.random() * 3000); // Spawn every 2-5 seconds
            }

            // Add this method to determine enemy type based on wave:
            getEnemyTypeForWave() {
                const rand = Math.random();
                
                if (this.wave >= 8 && rand < 0.4) {
                    return 'heavy';
                } else if (this.wave >= 4 && rand < 0.6) {
                    return 'fast';
                } else {
                    return 'normal';
                }
            }

            spawnEnemy(type, x, y) {
                const enemy = {
                    x: x,
                    y: y,
                    type: type,
                    vx: (Math.random() - 0.5) * 2,
                    vy: 1 + Math.random() * 2,
                    health: 20,
                    maxHealth: 20,
                    radius: 16,
                    shootTimer: Math.random() * 100,
                    color: this.COLORS.PINK,
                    angle: Math.random() * Math.PI * 2
                };

                switch(type) {
                    case 'fast':
                        enemy.vy = 3 + Math.random() * 2;
                        enemy.health = 15;
                        enemy.maxHealth = 15;
                        enemy.radius = 12;
                        enemy.color = this.COLORS.GREEN;
                        break;
                    case 'heavy':
                        enemy.health = 40;
                        enemy.maxHealth = 40;
                        enemy.radius = 22;
                        enemy.vy = 0.5 + Math.random();
                        enemy.color = this.COLORS.YELLOW;
                        break;
                }
                
                // Scale with wave
                enemy.health += this.wave * 5;
                enemy.maxHealth = enemy.health;

                this.enemies.push(enemy);
            }

            spawnBoss() {
                this.boss = {
                    x: this.canvas.width / 2,
                    y: -100,
                    health: 150 + this.wave * 50,
                    maxHealth: 150 + this.wave * 50,
                    radius: 40,
                    color: this.COLORS.PINK,
                    shootTimer: 0,
                    patternPhase: 0,
                    vy: 1,
                    targetY: 150
                };
            }

            updateEnemies() {
                // Update boss
                if (this.boss) {
                    this.updateBoss();
                    if (this.boss.health <= 0) {
                        this.createExplosion(this.boss.x, this.boss.y, 50, 30);
                        this.score += 5000;
                        this.boss = null;
                        this.enemiesKilledThisWave += 10; // Count boss as multiple kills
                    }
                }

                // Update regular enemies
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const e = this.enemies[i];
                    
                    // Update position
                    e.x += e.vx;
                    e.y += e.vy;
                    e.angle += 0.05;

                    // Make enemies more aggressive - move toward player sometimes
                    if (Math.random() < 0.02) { // 2% chance each frame
                        const angleToPlayer = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                        e.vx += Math.cos(angleToPlayer) * 0.3;
                        e.vy += Math.sin(angleToPlayer) * 0.3;
                    }

                    // Boundary check - bounce off walls
                    if (e.x < e.radius) {
                        e.x = e.radius;
                        e.vx = Math.abs(e.vx);
                    }
                    if (e.x > this.canvas.width - e.radius) {
                        e.x = this.canvas.width - e.radius;
                        e.vx = -Math.abs(e.vx);
                    }
                    
                    // Remove if off bottom of screen
                    if (e.y > this.canvas.height + 100) {
                        this.enemies.splice(i, 1);
                        continue;
                    }

                    // Limit speed
                    const speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
                    const maxSpeed = e.type === 'fast' ? 4 : (e.type === 'heavy' ? 2 : 3);
                    if (speed > maxSpeed) {
                        e.vx = (e.vx / speed) * maxSpeed;
                        e.vy = (e.vy / speed) * maxSpeed;
                    }

                    // Enemy shooting - more frequent as waves increase
                    e.shootTimer--;
                    if (e.shootTimer <= 0 && e.y > 50) {
                        this.enemyShoot(e);
                        e.shootTimer = 60 + Math.random() * 60 - (this.wave * 2); // Faster shooting in later waves
                        e.shootTimer = Math.max(30, e.shootTimer); // Minimum 30 frames between shots
                    }
                }
            }

            updateBoss() {
                const boss = this.boss;
                
                // Move into position
                if (boss.y < boss.targetY) {
                    boss.y += boss.vy;
                    boss.vy += 0.1;
                } else {
                    // Move in circular pattern
                    boss.patternPhase += 0.02;
                    boss.x = this.canvas.width / 2 + Math.cos(boss.patternPhase) * 200;
                }

                // Boss shooting
                boss.shootTimer--;
                if (boss.shootTimer <= 0 && boss.y > 50) {
                    // Multi-directional shot
                    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                        this.bossBulletShoot(boss.x, boss.y, angle);
                    }
                    boss.shootTimer = 60;
                }
            }

            enemyShoot(enemy) {
                // Only shoot if player is alive and enemy is on screen
                if (this.player.health <= 0 || enemy.y < 0 || enemy.y > this.canvas.height) {
                    return;
                }
                
                const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                const startX = enemy.x + Math.cos(angle) * enemy.radius;
                const startY = enemy.y + Math.sin(angle) * enemy.radius;
                
                // Add some randomness to shots
                const spread = (Math.random() - 0.5) * 0.3;
                
                this.bullets.push({
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle + spread) * (4 + this.wave * 0.2),
                    vy: Math.sin(angle + spread) * (4 + this.wave * 0.2),
                    damage: 5 + Math.floor(this.wave / 2),
                    color: this.COLORS.RED,
                    lifetime: 400,
                    radius: 3,
                    isEnemyBullet: true
                });
            }

            bossBulletShoot(x, y, angle) {
                this.bullets.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * 5,
                    vy: Math.sin(angle) * 5,
                    damage: 10 + this.wave,
                    color: this.COLORS.YELLOW,
                    lifetime: 400,
                    radius: 5,
                    isEnemyBullet: true
                });
            }

            checkEnemyCollisions() {
                // Check player bullets vs enemies
                for (let i = this.bullets.length - 1; i >= 0; i--) {
                    const b = this.bullets[i];
                    if (b.isEnemyBullet) continue;

                    // Check vs regular enemies
                    for (let j = this.enemies.length - 1; j >= 0; j--) {
                        const e = this.enemies[j];
                        const dx = b.x - e.x;
                        const dy = b.y - e.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < b.radius + e.radius) {
                            e.health -= b.damage;
                            this.createImpact(b.x, b.y, b.color);
                            this.bullets.splice(i, 1);

                            if (e.health <= 0) {
                                this.createExplosion(e.x, e.y, e.radius * 2, 15);
                                this.enemies.splice(j, 1);
                                this.score += 100 + (this.wave * 20);
                                this.enemiesKilledThisWave++;
                                
                                // Chance to spawn power-up
                                if (Math.random() < 0.3) {
                                    this.spawnPowerUp(e.x, e.y);
                                }
                            }
                            break;
                        }
                    }

                    // Check vs boss
                    if (this.boss && !b.isEnemyBullet) {
                        const dx = b.x - this.boss.x;
                        const dy = b.y - this.boss.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < b.radius + this.boss.radius) {
                            this.boss.health -= b.damage;
                            this.createImpact(b.x, b.y, b.color);
                            this.bullets.splice(i, 1);
                        }
                    }
                }

                // Check enemy bullets vs player
                for (let i = this.bullets.length - 1; i >= 0; i--) {
                    const b = this.bullets[i];
                    if (!b.isEnemyBullet) continue;

                    const dx = b.x - this.player.x;
                    const dy = b.y - this.player.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < b.radius + this.player.width / 2) {
                        if (this.player.shield > 0) {
                            this.player.shield = Math.max(0, this.player.shield - b.damage);
                            this.createShieldImpact(this.player.x, this.player.y);
                        } else {
                            this.player.health -= b.damage;
                            this.screenShake = 10;
                            this.screenShakeIntensity = 0.15;
                            this.createExplosion(this.player.x, this.player.y, 25, 10);
                        }
                        
                        this.bullets.splice(i, 1);

                        if (this.player.health <= 0) {
                            this.gameOver();
                        }
                    }
                }
            }

            checkPowerUpCollisions() {
                for (let i = this.powerUps.length - 1; i >= 0; i--) {
                    const p = this.powerUps[i];
                    const dx = p.x - this.player.x;
                    const dy = p.y - this.player.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < p.radius + this.player.width / 2) {
                        this.activatePowerUp(p);
                        this.createPowerUpCollect(p.x, p.y);
                        this.powerUps.splice(i, 1);
                    }
                }
            }

            spawnPowerUp(x, y) {
                const types = ['health', 'weapon', 'shield', 'rapidfire'];
                const type = types[Math.floor(Math.random() * types.length)];

                this.powerUps.push({
                    x: x,
                    y: y,
                    type: type,
                    radius: 12,
                    vx: (Math.random() - 0.5) * 2,
                    vy: 1,
                    rotation: 0,
                    lifetime: 600,
                    color: this.getPowerUpColor(type)
                });
            }

            getPowerUpColor(type) {
                switch(type) {
                    case 'health': return this.COLORS.RED;
                    case 'weapon': return this.COLORS.YELLOW;
                    case 'shield': return this.COLORS.BLUE;
                    case 'rapidfire': return this.COLORS.PINK;
                    default: return this.COLORS.GREEN;
                }
            }

            activatePowerUp(powerUp) {
                switch (powerUp.type) {
                    case 'health':
                        this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
                        this.score += 50;
                        break;
                    case 'weapon':
                        const weapons = ['cannon', 'laser', 'plasma'];
                        const currentIndex = weapons.indexOf(this.player.weapon);
                        this.player.weapon = weapons[(currentIndex + 1) % weapons.length];
                        document.getElementById('weapon').textContent = this.player.weapon.toUpperCase();
                        this.score += 200;
                        break;
                    case 'rapidfire':
                        this.player.fireRate = Math.max(50, this.player.fireRate - 30);
                        this.score += 150;
                        break;
                    case 'shield':
                        this.player.shield = this.player.maxShield;
                        this.score += 100;
                        break;
                }
            }

            updatePowerUps() {
                for (let i = this.powerUps.length - 1; i >= 0; i--) {
                    const p = this.powerUps[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.rotation += 0.1;
                    p.lifetime--;
                    p.vy += 0.05; // Gravity

                    if (p.lifetime <= 0 || p.y > this.canvas.height) {
                        this.powerUps.splice(i, 1);
                    }
                }
            }

            createExplosion(x, y, size, particleCount) {
                for (let i = 0; i < particleCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 2 + Math.random() * 4;
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        lifetime: 40 + Math.random() * 20,
                        maxLifetime: 60,
                        color: [this.COLORS.CYAN, this.COLORS.GREEN, this.COLORS.PINK, this.COLORS.YELLOW][Math.floor(Math.random() * 4)],
                        size: size / 6
                    });
                }
                this.screenShake = Math.max(this.screenShake, 8);
                this.screenShakeIntensity = 0.1;
            }

            createImpact(x, y, color) {
                for (let i = 0; i < 6; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 3;
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        lifetime: 20 + Math.random() * 10,
                        maxLifetime: 30,
                        color: color,
                        size: 3
                    });
                }
            }

            createShieldImpact(x, y) {
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 * i) / 12;
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * 3,
                        vy: Math.sin(angle) * 3,
                        lifetime: 25,
                        maxLifetime: 25,
                        color: this.COLORS.BLUE,
                        size: 2
                    });
                }
            }

            createPowerUpCollect(x, y) {
                for (let i = 0; i < 16; i++) {
                    const angle = (Math.PI * 2 * i) / 16;
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * 4,
                        vy: Math.sin(angle) * 4,
                        lifetime: 30,
                        maxLifetime: 30,
                        color: this.COLORS.GREEN,
                        size: 3
                    });
                }
            }

            updateParticles() {
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= 0.95;
                    p.vy *= 0.95;
                    p.lifetime--;

                    if (p.lifetime <= 0) {
                        this.particles.splice(i, 1);
                    }
                }
            }

            checkWaveCompletion() {
            // Check if all enemies are defeated and we've killed enough for this wave
            if (this.enemies.length === 0 && !this.boss && this.enemiesKilledThisWave >= this.enemiesNeededForWave) {
                setTimeout(() => {
                    if (this.gameRunning) {
                        this.wave++;
                        this.enemiesKilledThisWave = 0; // Reset for next wave
                        this.spawnWave();
                    }
                }, 1500);
            }
        }

            updateUI() {
                document.getElementById('score').textContent = this.score;
                document.getElementById('wave').textContent = this.wave;
                document.getElementById('gameTime').textContent = Math.floor(this.elapsedSeconds) + 's';
                
                const healthPercent = (this.player.health / this.player.maxHealth) * 100;
                document.getElementById('healthBar').style.width = healthPercent + '%';
            }

            gameOver() {
                this.gameRunning = false;
                if (this.spawnInterval) {
                    clearInterval(this.spawnInterval);
                }
                document.getElementById('finalScore').textContent = this.score;
                document.getElementById('wavesCompleted').textContent = this.wave - 1;
                document.getElementById('gameOverScreen').classList.remove('hidden');
            }

            draw() {
                // Clear canvas with slight fade
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // Draw game objects
                this.drawParticles();
                this.drawPowerUps();
                this.drawBullets();
                this.drawEnemies();
                this.drawBoss();
                this.drawPlayer();

                // Apply screen shake
                if (this.screenShake > 0.5) {
                    const offsetX = (Math.random() - 0.5) * this.screenShake;
                    const offsetY = (Math.random() - 0.5) * this.screenShake;
                    
                    // Draw screen shake border
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${this.screenShakeIntensity})`;
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(offsetX, offsetY, this.canvas.width, this.canvas.height);
                }
            }

            drawPlayer() {
                const p = this.player;
                const angle = p.turretAngle;

                // Draw shield if active
                if (p.shield > 0) {
                    const shieldAlpha = (p.shield / p.maxShield) * 0.5;
                    this.ctx.strokeStyle = `rgba(0, 175, 255, ${shieldAlpha})`;
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.width + 10, 0, Math.PI * 2);
                    this.ctx.stroke();
                }

                // Draw ship body
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                
                // Ship color based on weapon
                let shipColor = p.color;
                if (p.weapon === 'laser') shipColor = this.COLORS.GREEN;
                if (p.weapon === 'plasma') shipColor = this.COLORS.PINK;
                
                // Draw ship shape (triangle)
                this.ctx.fillStyle = shipColor;
                this.ctx.strokeStyle = shipColor;
                this.ctx.lineWidth = 2;
                
                this.ctx.beginPath();
                this.ctx.moveTo(0, -p.height / 2);  // Nose
                this.ctx.lineTo(-p.width / 2, p.height / 2);  // Left wing
                this.ctx.lineTo(p.width / 2, p.height / 2);   // Right wing
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                
                // Draw cockpit
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.width / 4, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw turret
                this.ctx.rotate(angle + Math.PI / 2);
                this.ctx.strokeStyle = p.weapon === 'laser' ? this.COLORS.GREEN : 
                                     p.weapon === 'plasma' ? this.COLORS.PINK : this.COLORS.CYAN;
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -5);
                this.ctx.lineTo(0, -25);
                this.ctx.stroke();

                this.ctx.restore();

                // Draw engine flame
                const time = Date.now() * 0.01;
                const flameSize = 10 + Math.sin(time) * 5;
                
                this.ctx.fillStyle = this.COLORS.ORANGE;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x - 6, p.y + p.height / 2);
                this.ctx.lineTo(p.x + 6, p.y + p.height / 2);
                this.ctx.lineTo(p.x, p.y + p.height / 2 + flameSize);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Inner flame
                this.ctx.fillStyle = this.COLORS.YELLOW;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x - 4, p.y + p.height / 2);
                this.ctx.lineTo(p.x + 4, p.y + p.height / 2);
                this.ctx.lineTo(p.x, p.y + p.height / 2 + flameSize * 0.7);
                this.ctx.closePath();
                this.ctx.fill();
            }

            drawEnemies() {
                for (const e of this.enemies) {
                    this.ctx.save();
                    this.ctx.translate(e.x, e.y);
                    this.ctx.rotate(e.angle);

                    // Draw enemy based on type
                    this.ctx.fillStyle = e.color;
                    this.ctx.strokeStyle = e.color;
                    this.ctx.lineWidth = 2;

                    if (e.type === 'normal') {
                        // Draw hexagon enemy
                        this.ctx.beginPath();
                        for (let i = 0; i < 6; i++) {
                            const angle = (Math.PI / 3) * i;
                            this.ctx.lineTo(
                                Math.cos(angle) * e.radius,
                                Math.sin(angle) * e.radius
                            );
                        }
                        this.ctx.closePath();
                    } else if (e.type === 'fast') {
                        // Draw triangle enemy
                        this.ctx.beginPath();
                        this.ctx.moveTo(0, -e.radius);
                        this.ctx.lineTo(-e.radius, e.radius);
                        this.ctx.lineTo(e.radius, e.radius);
                        this.ctx.closePath();
                    } else if (e.type === 'heavy') {
                        // Draw square enemy
                        this.ctx.fillRect(-e.radius / 2, -e.radius / 2, e.radius, e.radius);
                        this.ctx.strokeRect(-e.radius / 2, -e.radius / 2, e.radius, e.radius);
                        
                        // Draw heavy enemy detail
                        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                        this.ctx.fillRect(-e.radius / 4, -e.radius / 4, e.radius / 2, e.radius / 2);
                    }
                    
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    // Draw enemy health bar
                    const healthPercent = e.health / e.maxHealth;
                    if (healthPercent < 1) {
                        this.ctx.fillStyle = '#f00';
                        this.ctx.fillRect(-e.radius, e.radius + 8, e.radius * 2 * healthPercent, 4);
                        this.ctx.strokeStyle = '#f00';
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(-e.radius, e.radius + 8, e.radius * 2, 4);
                    }

                    this.ctx.restore();
                }
            }

            drawBoss() {
                if (!this.boss) return;

                const b = this.boss;
                this.ctx.save();
                this.ctx.translate(b.x, b.y);
                
                // Draw boss as rotating octagon
                this.ctx.fillStyle = b.color;
                this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const radius = i % 2 === 0 ? b.radius : b.radius * 0.7;
                    const angle = (Math.PI / 4) * i;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                }
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                
                // Draw boss core
                this.ctx.fillStyle = '#f00';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, b.radius / 3, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw boss health bar
                const healthPercent = b.health / b.maxHealth;
                this.ctx.fillStyle = '#f00';
                this.ctx.fillRect(-b.radius * 1.5, b.radius + 30, b.radius * 3 * healthPercent, 10);
                this.ctx.strokeStyle = '#f00';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(-b.radius * 1.5, b.radius + 30, b.radius * 3, 10);

                this.ctx.restore();

                // Draw boss label
                this.ctx.fillStyle = '#f0f';
                this.ctx.font = 'bold 20px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'bottom';
                this.ctx.fillText('BOSS', b.x, b.y - b.radius - 10);
            }

            drawBullets() {
                for (const b of this.bullets) {
                    this.ctx.fillStyle = b.color;
                    this.ctx.strokeStyle = b.color;
                    this.ctx.lineWidth = 1;
                    
                    // Draw bullet
                    this.ctx.beginPath();
                    this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Draw glow for player bullets
                    if (!b.isEnemyBullet) {
                        this.ctx.beginPath();
                        this.ctx.arc(b.x, b.y, b.radius + 2, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }
                }
            }

            drawPowerUps() {
                for (const p of this.powerUps) {
                    this.ctx.save();
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate(p.rotation);

                    // Draw diamond shape
                    this.ctx.fillStyle = p.color;
                    this.ctx.strokeStyle = p.color;
                    this.ctx.lineWidth = 2;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.radius, 0);
                    this.ctx.lineTo(0, p.radius);
                    this.ctx.lineTo(-p.radius, 0);
                    this.ctx.lineTo(0, -p.radius);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    // Draw plus sign for health, star for weapon, etc.
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.ctx.font = 'bold 16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    
                    let symbol = '?';
                    switch(p.type) {
                        case 'health': symbol = '+'; break;
                        case 'weapon': symbol = '⚡'; break;
                        case 'shield': symbol = '🛡'; break;
                        case 'rapidfire': symbol = '🔥'; break;
                    }
                    
                    this.ctx.fillText(symbol, 0, 0);

                    this.ctx.restore();
                }
            }

            drawParticles() {
                for (const p of this.particles) {
                    const alpha = p.lifetime / p.maxLifetime;
                    this.ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            gameLoop() {
                this.update();
                this.draw();

                if (this.gameRunning) {
                    requestAnimationFrame(() => this.gameLoop());
                }
            }

            resizeCanvas() {
                this.canvas.width = Math.min(window.innerWidth - 20, 1400);
                this.canvas.height = Math.min(window.innerHeight - 20, 900);
                
                // Update player position if game is running
                if (this.gameRunning && this.player) {
                    this.player.x = Math.min(this.player.x, this.canvas.width - this.player.width / 2);
                    this.player.y = Math.min(this.player.y, this.canvas.height - this.player.height / 2);
                }
            }
        }

        // Initialize game
        window.game = new NeonStrikerGame();
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => window.game.resizeCanvas(), 100);
        });
        
        // Auto-start the game after 2 seconds for demo purposes
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (!window.game.gameRunning) {
                    window.game.startGame();
                }
            }, 2000);
        });