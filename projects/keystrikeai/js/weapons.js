export default class WeaponSystem {
    constructor(game) {
        this.game = game;
        this.currentWeapon = 'plasma'; // plasma, scatter, railgun, seeker
        this.cooldowns = {
            railgun: 0,
            seeker: 0
        };
    }

    update(dt) {
        // Cooldown management
        if (this.cooldowns.railgun > 0) this.cooldowns.railgun -= dt;
        if (this.cooldowns.seeker > 0) this.cooldowns.seeker -= dt;
    }

    fire(target, char) {
        const type = this.currentWeapon;

        switch (type) {
            case 'plasma':
                this.firePlasma(target, char);
                break;
            case 'scatter':
                this.fireScatter(target, char);
                break;
            case 'railgun':
                if (this.cooldowns.railgun <= 0) {
                    this.fireRailgun(target, char);
                    this.cooldowns.railgun = 2.0; // 2s cooldown
                } else {
                    // Fallback if cooldown
                    this.firePlasma(target, char);
                }
                break;
            case 'seeker':
                this.fireSeeker(target, char);
                break;
        }
    }

    firePlasma(target, char) {
        const startX = this.game.width / 2;
        const startY = this.game.height / 2;
        const angle = Math.atan2(target.y - startY, target.x - startX);

        this.game.spawnProjectile({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * 1200,
            vy: Math.sin(angle) * 1200,
            char: char,
            color: '#00f3ff',
            type: 'plasma',
            damage: 1
        });
    }

    fireScatter(target, char) {
        const startX = this.game.width / 2;
        const startY = this.game.height / 2;
        const baseAngle = Math.atan2(target.y - startY, target.x - startX);

        for (let i = -1; i <= 1; i++) {
            const angle = baseAngle + (i * 0.15); // Spread
            this.game.spawnProjectile({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * 1000,
                vy: Math.sin(angle) * 1000,
                char: char,
                color: '#ff0055',
                type: 'scatter',
                damage: 0.5 // Lower damage per shot
            });
        }
    }

    fireRailgun(target, char) {
        // Instant hit visual, no projectile travel
        const startX = this.game.width / 2;
        const startY = this.game.height / 2;

        // Pierce logic handled in game? 
        // For now, let's just make a super fast projectile
        const angle = Math.atan2(target.y - startY, target.x - startX);

        this.game.spawnProjectile({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * 4000, // Super fast
            vy: Math.sin(angle) * 4000,
            char: char,
            color: '#ffea00',
            type: 'railgun',
            damage: 5,
            pierce: 99
        });

        // Screen shake for power
        this.game.state.shake += 5;
    }

    fireSeeker(target, char) {
        const startX = this.game.width / 2;
        const startY = this.game.height / 2;
        // Spawns drones that curve
        this.game.spawnProjectile({
            x: startX,
            y: startY,
            vx: (Math.random() - 0.5) * 500, // Random start velocity
            vy: (Math.random() - 0.5) * 500,
            char: char,
            color: '#9d00ff',
            type: 'seeker',
            damage: 0.8,
            targetId: target // Homing logic needs to know target
        });
    }
}
