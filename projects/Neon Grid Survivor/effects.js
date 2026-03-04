let particles = [];
let shakeTime = 0;

function spawnParticles(x, y, color) {
  for (let i = 0; i < GAME_CONFIG.particles.count; i++) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      life: GAME_CONFIG.particles.life,
      color,
    });
  }
}

function updateParticles(ctx) {
  particles.forEach((p, i) => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;

    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 2, 2);

    if (p.life <= 0) particles.splice(i, 1);
  });
}

function screenShake() {
  shakeTime = 10;
}
