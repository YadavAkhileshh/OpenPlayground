class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONSTANTS.PLAYER_SIZE / 2;
        this.speed = CONSTANTS.PLAYER_SPEED;
        this.color = CONSTANTS.PLAYER_COLOR;
        this.borderColor = CONSTANTS.PLAYER_BORDER_COLOR;
        
        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Shooting
        this.bullets = [];
        this.shootCooldown = 0;
        this.canShoot = true;
        
        // Health
        this.health = CONSTANTS.INITIAL_PLAYER_HEALTH;
        this.maxHealth = CONSTANTS.INITIAL_PLAYER_HEALTH;
        this.isAlive = true;
        
        // Position history for enemy learning (managed by enemy)
        this.positionHistory = [];
        this.lastPositionTime = 0;
    }
    
    update(deltaTime) {
        if (!this.isAlive) return;
        
        // Update velocity based on input
        this.velocityX = 0;
        this.velocityY = 0;
        
        if (this.input.up) this.velocityY -= 1;
        if (this.input.down) this.velocityY += 1;
        if (this.input.left) this.velocityX -= 1;
        if (this.input.right) this.velocityX += 1;
        
        // Normalize diagonal movement
        if (this.velocityX !== 0 && this.velocityY !== 0) {
            const length = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
            this.velocityX /= length;
            this.velocityY /= length;
        }
        
        // Apply movement
        this.x += this.velocityX * this.speed * deltaTime;
        this.y += this.velocityY * this.speed * deltaTime;
        
        // Keep player within bounds
        this.x = Utils.clamp(this.x, this.radius, CONSTANTS.CANVAS_WIDTH - this.radius);
        this.y = Utils.clamp(this.y, this.radius, CONSTANTS.CANVAS_HEIGHT - this.radius);
        
        // Update shoot cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
            this.canShoot = this.shootCooldown <= 0;
        }
        
        // Update bullets
        this.updateBullets(deltaTime);
    }
    
    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += Math.cos(bullet.angle) * CONSTANTS.BULLET_SPEED * deltaTime;
            bullet.y += Math.sin(bullet.angle) * CONSTANTS.BULLET_SPEED * deltaTime;
            
            // Remove bullets that are out of bounds
            if (bullet.x < -bullet.radius || 
                bullet.x > CONSTANTS.CANVAS_WIDTH + bullet.radius ||
                bullet.y < -bullet.radius || 
                bullet.y > CONSTANTS.CANVAS_HEIGHT + bullet.radius) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    shoot(mouseX, mouseY) {
        if (!this.canShoot || !this.isAlive) return;
        
        const angle = Utils.angleTo(this.x, this.y, mouseX, mouseY);
        
        this.bullets.push({
            x: this.x,
            y: this.y,
            angle: angle,
            radius: CONSTANTS.BULLET_RADIUS,
            color: CONSTANTS.PLAYER_BULLET_COLOR
        });
        
        this.shootCooldown = CONSTANTS.PLAYER_SHOOT_COOLDOWN;
        this.canShoot = false;
    }
    
    takeDamage(amount) {
        this.health = Utils.clamp(this.health - amount, 0, this.maxHealth);
        if (this.health <= 0) {
            this.isAlive = false;
        }
    }
    
    respawn() {
        this.x = CONSTANTS.CANVAS_WIDTH / 2;
        this.y = CONSTANTS.CANVAS_HEIGHT - 100;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.bullets = [];
    }
    
    draw(ctx) {
        if (!this.isAlive) return;
        
        // Draw player
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw direction indicator
        if (this.velocityX !== 0 || this.velocityY !== 0) {
            const angle = Math.atan2(this.velocityY, this.velocityX);
            const indicatorLength = this.radius * 0.7;
            
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x + Math.cos(angle) * indicatorLength,
                this.y + Math.sin(angle) * indicatorLength
            );
            ctx.stroke();
        }
        ctx.restore();
        
        // Draw bullets
        this.drawBullets(ctx);
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
}