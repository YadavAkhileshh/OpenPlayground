class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONSTANTS.ENEMY_SIZE / 2;
        this.color = CONSTANTS.ENEMY_BASE_COLOR;
        this.turretColor = CONSTANTS.ENEMY_TURRET_COLOR;

        // Turret rotation
        this.turretAngle = 0;
        this.targetAngle = 0;

        // Shooting
        this.bullets = [];
        this.fireCooldown = 0;
        this.canFire = false;

        // Health
        this.health = CONSTANTS.INITIAL_ENEMY_HEALTH;
        this.maxHealth = CONSTANTS.INITIAL_ENEMY_HEALTH;
        this.isAlive = true;

        // --- ADAPTIVE LEARNING SYSTEM ---

        // 1. Strategies Definition
        this.strategies = {
            'DIRECT': { score: 10, hits: 0, uses: 0, description: "Shoots directly at player" },
            'LINEAR': { score: 10, hits: 0, uses: 0, description: "Predicts based on current velocity" },
            'DAMPENED': { score: 10, hits: 0, uses: 0, description: "Predicts with 50% lead (anti-dodge)" },
            'ACCELERATED': { score: 10, hits: 0, uses: 0, description: "Predicts based on acceleration" }
        };

        // 2. History Tracking
        this.playerHistory = Utils.createCircularBuffer(30); // Store last ~0.5s of player movement
        this.virtualBullets = []; // "Ghost" bullets to test strategies
        this.currentBestStrategy = 'LINEAR';

        // 3. Performance Stats
        this.adaptationRate = 0.1; // How fast we switch strategies
        this.shotsFired = 0;
        this.shotsHit = 0;
    }

    update(deltaTime, player) {
        if (!this.isAlive) return;

        // 1. Record Player State
        this.recordPlayerState(player);

        // 2. Update Virtual Bullets (The "Thinking" Phase)
        // Check which strategies would have hit the player
        this.updateVirtualBullets(deltaTime, player);

        // 3. Select Best Strategy
        this.evaluateStrategies();

        // 4. Standard Game Logic
        this.updateTurret(player);

        if (this.fireCooldown > 0) {
            this.fireCooldown -= deltaTime;
        }

        // Always check if we're ready to fire
        this.canFire = this.fireCooldown <= 0;

        if (this.canFire && player.isAlive) {
            this.shootAtPlayer(player);
        }

        // Dodge incoming bullets
        this.avoidBullets(player.bullets, deltaTime);

        this.updateBullets(deltaTime, player);
    }

    avoidBullets(bullets, deltaTime) {
        if (!bullets || bullets.length === 0) return;

        // Find closest threatening bullet
        let closestBullet = null;
        let minDist = CONSTANTS.ENEMY_DODGE_RANGE;

        for (const bullet of bullets) {
            const dist = Utils.distance(this.x, this.y, bullet.x, bullet.y);

            // Only care about bullets within range
            if (dist < minDist) {
                // Check if bullet is roughly moving towards us
                // Vector from bullet to enemy
                const toEnemyX = this.x - bullet.x;
                const toEnemyY = this.y - bullet.y;

                // Bullet velocity vector
                const bulletVx = Math.cos(bullet.angle);
                const bulletVy = Math.sin(bullet.angle);

                // Dot product to check direction (positive means moving in same direction)
                const dot = toEnemyX * bulletVx + toEnemyY * bulletVy;

                if (dot > 0) {
                    closestBullet = bullet;
                    minDist = dist;
                }
            }
        }

        if (closestBullet) {
            // Dodge perpendicular to bullet direction
            // Bullet angle + 90 degrees
            const dodgeAngle = closestBullet.angle + Math.PI / 2;

            // Determine which way to dodge (left or right) based on position
            // Simple heuristic: Move away from canvas center if near edge, else random/alternate?
            // Determine side based on cross product or just move towards larger open space

            let moveX = Math.cos(dodgeAngle) * CONSTANTS.ENEMY_MOVE_SPEED * deltaTime;
            let moveY = Math.sin(dodgeAngle) * CONSTANTS.ENEMY_MOVE_SPEED * deltaTime;

            // Apply movement
            this.x += moveX;
            this.y += moveY;

            // Constraint: Stay in top half of screen (don't rush player)
            this.y = Utils.clamp(this.y, this.radius, CONSTANTS.CANVAS_HEIGHT * 0.6);
            this.x = Utils.clamp(this.x, this.radius, CONSTANTS.CANVAS_WIDTH - this.radius);
        }
    }

    recordPlayerState(player) {
        if (!player.isAlive) return;

        const now = performance.now();

        // Calculate velocity/acceleration if we have history
        let vx = 0, vy = 0, ax = 0, ay = 0;
        const last = this.playerHistory.getLatest();

        if (last) {
            const dt = (now - last.time) / 1000;
            if (dt > 0) {
                vx = (player.x - last.x) / dt;
                vy = (player.y - last.y) / dt;

                ax = (vx - last.vx) / dt;
                ay = (vy - last.vy) / dt;
            }
        }

        this.playerHistory.push({
            x: player.x,
            y: player.y,
            vx: vx,
            vy: vy,
            ax: ax,
            ay: ay,
            time: now
        });

        // Spawn "Virtual Bullets" for EVERY strategy periodically
        // This lets us test "What if I had shot using Strategy X right now?"
        if (Math.random() < 0.1) { // 10% chance per frame to simulation-test
            this.fireVirtualBullets(player);
        }
    }

    fireVirtualBullets(player) {
        for (const [name, data] of Object.entries(this.strategies)) {
            const aimPos = this.getAimPointForStrategy(name, player);

            // Calculate travel time to that point
            const dist = Utils.distance(this.x, this.y, aimPos.x, aimPos.y);
            const travelTime = dist / CONSTANTS.BULLET_SPEED;

            this.virtualBullets.push({
                strategy: name,
                targetX: aimPos.x,
                targetY: aimPos.y,
                fireTime: performance.now(),
                impactTime: performance.now() + (travelTime * 1000),
                startPlayerX: player.x, // Debug info
                startPlayerY: player.y
            });
        }
    }

    updateVirtualBullets(deltaTime, player) {
        const now = performance.now();

        for (let i = this.virtualBullets.length - 1; i >= 0; i--) {
            const vb = this.virtualBullets[i];

            // If the bullet has "landed" (time-wise)
            if (now >= vb.impactTime) {
                // Check if it was a "hit" (is the player near the target point?)
                const distError = Utils.distance(vb.targetX, vb.targetY, player.x, player.y);

                // Scoring Logic:
                // Closer = Higher Score. 
                // Hit (within radius) = Large Bonus.
                // Miss = Decay score.

                const scoreChange = (CONSTANTS.PLAYER_SIZE * 2) - distError;
                // If error < player size, positive score. If far, negative.

                // Update Strategy Score (Moving Average)
                this.strategies[vb.strategy].score = Utils.lerp(
                    this.strategies[vb.strategy].score,
                    Math.max(0, this.strategies[vb.strategy].score + scoreChange),
                    this.adaptationRate
                );

                this.virtualBullets.splice(i, 1);
            }
        }
    }

    evaluateStrategies() {
        // Find strategy with highest score
        let best = 'LINEAR'; // Default
        let maxScore = -Infinity;

        for (const [name, data] of Object.entries(this.strategies)) {
            // Decay scores slightly over time to allow for switching back if habits change
            data.score *= 0.999;

            if (data.score > maxScore) {
                maxScore = data.score;
                best = name;
            }
        }

        this.currentBestStrategy = best;
    }

    getAimPointForStrategy(strategyName, player) {
        const leadTime = CONSTANTS.BASE_LEAD_TIME;
        const last = this.playerHistory.getLatest() || { vx: 0, vy: 0, ax: 0, ay: 0 };

        let predictedX = player.x;
        let predictedY = player.y;

        switch (strategyName) {
            case 'DIRECT':
                // No modification
                break;

            case 'LINEAR':
                // Classic lead: p + v*t
                predictedX += last.vx * leadTime;
                predictedY += last.vy * leadTime;
                break;

            case 'DAMPENED':
                // Half lead: p + 0.5 * v * t
                // Catches players who turn back halfway
                predictedX += last.vx * leadTime * 0.5;
                predictedY += last.vy * leadTime * 0.5;
                break;

            case 'ACCELERATED':
                // Quadratic lead: p + v*t + 0.5*a*t^2
                // Predicting curves/turns
                predictedX += (last.vx * leadTime) + (0.5 * last.ax * leadTime * leadTime);
                predictedY += (last.vy * leadTime) + (0.5 * last.ay * leadTime * leadTime);
                break;
        }

        // Clamp to screen
        predictedX = Utils.clamp(predictedX, 0, CONSTANTS.CANVAS_WIDTH);
        predictedY = Utils.clamp(predictedY, 0, CONSTANTS.CANVAS_HEIGHT);

        return { x: predictedX, y: predictedY };
    }

    // --- STANDARD METHODS MODIFIED ---

    updateTurret(player) {
        if (!player.isAlive) {
            this.targetAngle += 0.02;
            this.turretAngle = Utils.rotateTowards(this.turretAngle, this.targetAngle, CONSTANTS.ENEMY_ROTATION_SPEED);
            return;
        }

        // Use BEST strategy
        const aimPos = this.getAimPointForStrategy(this.currentBestStrategy, player);

        this.targetAngle = Utils.angleTo(this.x, this.y, aimPos.x, aimPos.y);
        this.turretAngle = Utils.rotateTowards(this.turretAngle, this.targetAngle, CONSTANTS.ENEMY_ROTATION_SPEED);
    }

    shootAtPlayer(player) {
        if (!player.isAlive) return;

        // 1. Get Aim Point using current best strategy
        const aimPos = this.getAimPointForStrategy(this.currentBestStrategy, player);

        // 2. Add some human-like error (Noise) purely for visual variety/fairness
        // The *strategy* is perfect, but the *gun* might jitter
        const noise = CONSTANTS.AIM_NOISE_RANGE;
        aimPos.x += Utils.randomRange(-noise, noise);
        aimPos.y += Utils.randomRange(-noise, noise);

        const angle = Utils.angleTo(this.x, this.y, aimPos.x, aimPos.y);

        this.bullets.push({
            x: this.x,
            y: this.y,
            angle: angle,
            radius: CONSTANTS.BULLET_RADIUS,
            color: CONSTANTS.ENEMY_BULLET_COLOR,
            strategyUsed: this.currentBestStrategy // For debug if needed
        });

        this.fireCooldown = CONSTANTS.ENEMY_FIRE_RATE;
        this.canFire = false;
        this.shotsFired++;
        this.strategies[this.currentBestStrategy].uses++;
    }

    updateBullets(deltaTime, player) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += Math.cos(bullet.angle) * CONSTANTS.BULLET_SPEED * deltaTime;
            bullet.y += Math.sin(bullet.angle) * CONSTANTS.BULLET_SPEED * deltaTime;

            // Player Collision or Out of Bounds
            if (player.isAlive && Utils.circleCollision(bullet.x, bullet.y, bullet.radius, player.x, player.y, player.radius)) {
                player.takeDamage(1);
                this.shotsHit++;

                // Reward the strategy that fired this (big bonus for real hit)
                if (bullet.strategyUsed) {
                    this.strategies[bullet.strategyUsed].score += 50;
                    this.strategies[bullet.strategyUsed].hits++;
                }

                this.bullets.splice(i, 1);
                continue;
            }

            if (bullet.x < -bullet.radius || bullet.x > CONSTANTS.CANVAS_WIDTH + bullet.radius ||
                bullet.y < -bullet.radius || bullet.y > CONSTANTS.CANVAS_HEIGHT + bullet.radius) {
                this.bullets.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (!this.isAlive) return;

        // Enemy Base
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#CC2A2A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Debug Indicator: Show which strategy is active (colored dot)
        ctx.fillStyle = this.getStrategyColor(this.currentBestStrategy);
        ctx.beginPath();
        ctx.arc(this.x, this.y - 15, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Turret
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = this.turretColor;
        ctx.fillRect(-5, -5, CONSTANTS.ENEMY_TURRET_LENGTH, 10);
        ctx.fillStyle = '#FF6A6A';
        ctx.fillRect(CONSTANTS.ENEMY_TURRET_LENGTH - 10, -8, 10, 16);
        ctx.restore();

        this.drawBullets(ctx);

        // Optional Debug Text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px monospace';
        ctx.fillText(this.currentBestStrategy, this.x - 20, this.y + 40);
    }

    getStrategyColor(strategy) {
        switch (strategy) {
            case 'DIRECT': return '#FFFF00'; // Yellow
            case 'LINEAR': return '#FF0000'; // Red
            case 'DAMPENED': return '#00FF00'; // Green
            case 'ACCELERATED': return '#00FFFF'; // Cyan
            default: return '#FFFFFF';
        }
    }

    drawBullets(ctx) {
        this.bullets.forEach(bullet => {
            ctx.save();
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    takeDamage(amount) {
        this.health = Utils.clamp(this.health - amount, 0, this.maxHealth);
        if (this.health <= 0) this.isAlive = false;
    }

    resetLearning() {
        this.currentBestStrategy = 'LINEAR';
        this.playerHistory.clear();
        this.virtualBullets = [];
        this.shotsFired = 0;
        this.shotsHit = 0;
        // Reset strategy scores
        for (const key in this.strategies) {
            this.strategies[key].score = 10;
            this.strategies[key].hits = 0;
            this.strategies[key].uses = 0;
        }
    }

    getAccuracy() {
        if (this.shotsFired === 0) return 0;
        return this.shotsHit / this.shotsFired;
    }

    getLearningLevel() {
        // Return a normalized "intelligence" value (0 to 1)
        const bestScore = this.strategies[this.currentBestStrategy].score;
        return Utils.clamp((bestScore - 10) / 40, 0, 1);
    }
}