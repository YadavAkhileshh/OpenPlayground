export default class ProgressionManager {
    constructor(game) {
        this.game = game;
        this.data = {
            totalXp: 0,
            level: 1,
            currency: 0, // Data Shards
            upgrades: {
                overclockDuration: 0, // Level 0-5
                shielding: 0, // Level 0-1
                comboKeeper: 0, // Level 0-3
                weapon_scatter: false,
                weapon_railgun: false,
                weapon_seeker: false
            }
        };
        this.load();
    }

    save() {
        localStorage.setItem('keystrike_save_v5', JSON.stringify(this.data));
    }

    load() {
        const saved = localStorage.getItem('keystrike_save_v5');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.data = { ...this.data, ...parsed };
            } catch (e) {
                console.error("Save file corrupted, resetting.");
            }
        }
    }

    addXp(amount) {
        this.data.totalXp += amount;
        this.data.currency += Math.floor(amount / 10); // 1 shard per 10 score

        // Simple level curve: Level * 1000
        const xpForNext = this.data.level * 1000;
        if (this.data.totalXp >= xpForNext) {
            this.levelUp();
        }
        this.save();
    }

    levelUp() {
        this.data.level++;
        this.game.audio.playPowerUp();
        // Show notification? Handled by game/UI
        console.log("Level Up!", this.data.level);
    }

    unlockUpgrade(id) {
        const cost = this.getUpgradeCost(id);
        if (this.data.currency >= cost) {
            this.data.currency -= cost;

            if (typeof this.data.upgrades[id] === 'boolean') {
                this.data.upgrades[id] = true;
            } else {
                this.data.upgrades[id]++;
            }
            this.save();
            return true;
        }
        return false;
    }

    getUpgradeCost(id) {
        // Simplified pricing
        if (id.startsWith('weapon')) return 500;

        const current = this.data.upgrades[id];
        switch (id) {
            case 'overclockDuration': return (current + 1) * 100;
            case 'shielding': return 1000;
            case 'comboKeeper': return (current + 1) * 250;
        }
        return 9999;
    }
}
