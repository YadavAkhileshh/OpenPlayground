
export default class Renderer {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.game.width = this.canvas.width;
        this.game.height = this.canvas.height;
    }

    clear() {
        this.ctx.fillStyle = 'rgba(5, 5, 16, 0.3)'; // Trail effect
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(gameState) {
        this.clear();

        this.ctx.save();

        // Apply Screen Shake
        const shakeX = (Math.random() - 0.5) * gameState.shake;
        const shakeY = (Math.random() - 0.5) * gameState.shake;
        this.ctx.translate(shakeX, shakeY);

        this.drawGrid(gameState.time);

        // Draw Targets (Array in V5)
        // Check if targets exists (it should in V5), fallback for safety
        if (gameState.targets && Array.isArray(gameState.targets)) {
            gameState.targets.forEach(t => this.drawTarget(t));
        } else if (gameState.target) {
            // Legacy/Transition fallback
            this.drawTarget(gameState.target);
        }

        // Draw Player/Weapon (Center)
        this.drawPlayer();

        // Draw Projectiles
        gameState.projectiles.forEach(p => this.drawProjectile(p));

        // Draw Particles
        gameState.particles.forEach(p => this.drawParticle(p));

        this.ctx.restore();
    }

    drawTarget(target) {
        this.ctx.save();
        this.ctx.translate(target.x, target.y);

        // Glow effect
        this.ctx.shadowBlur = target.isBoss ? 40 : 20;
        this.ctx.shadowColor = target.color;

        // Boss Shield Ring
        if (target.isBoss && this.game.state.bossPhase === 1) {
            this.ctx.strokeStyle = '#00f3ff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            const ringRadius = 120;
            this.ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Draw Nodes
            this.drawBossNodes(target, this.game.state.nodes); // Need to pass stats?
            // Actually nodes are in gameState, but they move relative?
            // Wait, nodes have offsetAngle. We can draw them here relative to 0,0 (target center)
        }

        // Main Body
        this.ctx.beginPath();
        const pulse = Math.sin(Date.now() / 100) * 2;
        this.ctx.arc(0, 0, target.radius + pulse, 0, Math.PI * 2);
        this.ctx.fillStyle = target.color;
        this.ctx.fill();

        // Inner detail
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, target.radius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        // Text (Word or Character)
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const fullText = (target.word || target.char || "?").toUpperCase();

        if (target.word) {
            const matched = fullText.substring(0, target.matchedIndex);

            // If shielded, dim text
            if (target.isBoss && this.game.state.bossPhase === 1) {
                this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
                this.ctx.font = 'bold 24px "Space Mono"';
                this.ctx.fillText("SHIELD ACTIVE", 0, -target.radius - 20);

                this.ctx.font = 'bold 30px "Space Mono"';
            } else {
                this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
                this.ctx.font = 'bold 16px "Space Mono"';
            }

            this.ctx.fillText(fullText, 0, 0);

            if (target.matchedIndex > 0) {
                this.ctx.fillStyle = '#00f3ff';
                this.ctx.fillRect(-20, 25, 40 * (target.matchedIndex / target.word.length), 4);
            }

        } else {
            this.ctx.fillStyle = '#050510';
            this.ctx.font = 'bold 24px "Space Mono"';
            this.ctx.fillText(fullText, 0, 0);
        }

        this.ctx.restore();
    }

    drawBossNodes(target, nodes) {
        // Draw nodes relative to target
        // We are already translated to target.x, target.y
        nodes.forEach(node => {
            const angle = target.angle + node.offsetAngle;
            const dist = 120;
            const nx = Math.cos(angle) * dist;
            const ny = Math.sin(angle) * dist;

            this.ctx.save();
            this.ctx.translate(nx, ny);
            // Glow
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = node.color;
            this.ctx.fillStyle = node.color;

            this.ctx.beginPath();
            this.ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Text
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 12px "Space Mono"';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.word, 0, 0);

            // Progress
            if (node.matchedIndex > 0) {
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(-10, 15, 20 * (node.matchedIndex / node.word.length), 3);
            }

            this.ctx.restore();
        });
    }

    drawPlayer() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        this.ctx.save();
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f3ff';
        this.ctx.fillStyle = '#00f3ff';

        // Simple triangular ship or turret
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - 20);
        this.ctx.lineTo(cx - 15, cy + 15);
        this.ctx.lineTo(cx + 15, cy + 15);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    drawProjectile(p) {
        this.ctx.save();
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.fillStyle = p.color;

        this.ctx.font = '20px Space Mono';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.char, p.x, p.y);

        this.ctx.restore();
    }

    drawParticle(p) {
        this.ctx.save();
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
}
