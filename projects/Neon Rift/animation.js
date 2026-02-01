let particles = [];

function drawPlayerCore(ctx, x, y) {
  const time = Date.now() * 0.005;

  // Outer glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00f2ff";

  // Pulsing core
  ctx.beginPath();
  ctx.arc(x, y, 15 + Math.sin(time) * 5, 0, Math.PI * 2);
  ctx.strokeStyle = "#00f2ff";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Orbitals
  for (let i = 0; i < 3; i++) {
    const angle = time + (i * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * 30,
      y + Math.sin(angle) * 30,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = "#ff007b";
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawEntity(ctx, ent) {
  ctx.save();
  ctx.translate(ent.x, ent.y);
  ctx.rotate(Date.now() * 0.002);
  ctx.strokeStyle = ent.type === "void" ? "#ff007b" : "#00f2ff";
  ctx.strokeRect(-ent.size / 2, -ent.size / 2, ent.size, ent.size);
  ctx.restore();
}

function createExplosion(x, y, color) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1.0,
      color,
    });
  }
}

function updateParticles(ctx) {
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fillRect(p.x, p.y, 3, 3);
    if (p.life <= 0) particles.splice(i, 1);
  });
  ctx.globalAlpha = 1.0;
}
