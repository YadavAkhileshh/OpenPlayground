// Achievement System for Neon Dodge
class AchievementSystem {
  constructor() {
    this.achievements = new Map();
    this.unlocked = new Set();
    this.progress = new Map();
    this.setupAchievements();
    this.loadProgress();
  }

  setupAchievements() {
    // Define achievements
    this.addAchievement("first_blood", {
      name: "First Blood",
      description: "Take your first damage",
      icon: "🩸",
      check: (game) => game.entities.player.health < 100,
    });

    this.addAchievement("rich", {
      name: "Data Baron",
      description: "Collect 1000 credits",
      icon: "💰",
      check: (game) => game.credits >= 1000,
    });

    this.addAchievement("survivor", {
      name: "Cyberspace Survivor",
      description: "Survive for 5 minutes",
      icon: "⏱️",
      check: (game) => game.score >= 300000, // 5 min * 60 sec * 1000 score/sec
    });

    this.addAchievement("pacifist", {
      name: "Pacifist Run",
      description: "Reach wave 5 without shooting",
      icon: "☮️",
      check: (game) => game.wave >= 5 && game.entities.projectiles.length === 0,
    });

    this.addAchievement("dash_master", {
      name: "Dash Master",
      description: "Perform 50 dashes",
      icon: "💨",
      check: (game) => game.dashCount >= 50,
    });

    this.addAchievement("collector", {
      name: "Data Collector",
      description: "Collect all powerup types in one run",
      icon: "🎮",
      check: (game) => game.collectedPowerups.size >= 4,
    });

    this.addAchievement("perfect", {
      name: "Perfect Run",
      description: "Complete wave 10 without taking damage",
      icon: "⭐",
      check: (game) => game.wave >= 10 && game.entities.player.health === 100,
    });
  }

  addAchievement(id, config) {
    this.achievements.set(id, {
      id,
      unlocked: false,
      progress: 0,
      ...config,
    });
  }

  update(game) {
    for (const [id, achievement] of this.achievements) {
      if (!achievement.unlocked) {
        if (achievement.check(game)) {
          this.unlock(id);
        }
      }
    }
  }

  unlock(id) {
    const achievement = this.achievements.get(id);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    this.unlocked.add(id);
    this.showNotification(achievement);
    this.saveProgress();
  }

  showNotification(achievement) {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;

    // Add styles if not already present
    if (!document.querySelector("#achievement-styles")) {
      const style = document.createElement("style");
      style.id = "achievement-styles";
      style.textContent = `
                .achievement-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 15, 30, 0.95);
                    border: 2px solid #00f3ff;
                    border-radius: 8px;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    z-index: 1000;
                    animation: slideIn 0.5s ease, slideOut 0.5s ease 4.5s forwards;
                    max-width: 350px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    to { transform: translateX(100%); opacity: 0; }
                }
                .achievement-icon {
                    font-size: 2.5rem;
                    filter: drop-shadow(0 0 10px currentColor);
                }
                .achievement-text {
                    color: #fff;
                }
                .achievement-name {
                    font-family: 'Orbitron', monospace;
                    font-weight: bold;
                    color: #00f3ff;
                    margin-bottom: 5px;
                }
                .achievement-desc {
                    font-size: 0.9rem;
                    color: #8be9fd;
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  }

  saveProgress() {
    const data = {
      unlocked: Array.from(this.unlocked),
      progress: Object.fromEntries(this.progress),
    };
    localStorage.setItem("neon-dodge-achievements", JSON.stringify(data));
  }

  loadProgress() {
    const saved = localStorage.getItem("neon-dodge-achievements");
    if (saved) {
      const data = JSON.parse(saved);
      this.unlocked = new Set(data.unlocked);
      this.progress = new Map(Object.entries(data.progress));

      // Update achievements state
      for (const id of this.unlocked) {
        const achievement = this.achievements.get(id);
        if (achievement) {
          achievement.unlocked = true;
        }
      }
    }
  }

  getUnlockedCount() {
    return this.unlocked.size;
  }

  getTotalCount() {
    return this.achievements.size;
  }

  // Add to GameEngine in script.js:
  // constructor() {
  //     this.achievements = new AchievementSystem();
  //     this.dashCount = 0;
  //     this.collectedPowerups = new Set();
  // }

  // In activateDash():
  // this.dashCount++;

  // In applyPowerup():
  // this.collectedPowerups.add(powerup.type);

  // In game loop:
  // this.achievements.update(this);
}
