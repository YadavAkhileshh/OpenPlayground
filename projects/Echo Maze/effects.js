class Effects {
  constructor() {
    this.echoes = [];
    this.shake = 0;
  }
  createEcho(x, y) {
    this.echoes.push({ x, y, r: 0, alpha: 1 });
    this.shake = 10;
  }
  update() {
    this.shake *= 0.9;
    this.echoes.forEach((e, i) => {
      e.r += 8;
      e.alpha -= 0.008;
      if (e.alpha <= 0) this.echoes.splice(i, 1);
    });
  }
  draw(ctx, maze, player, cellSize, count) {
    ctx.save();
    if (this.shake > 0.5)
      ctx.translate(Math.random() * this.shake, Math.random() * this.shake);

    this.echoes.forEach((e) => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 65, ${e.alpha})`;
      ctx.stroke();

      maze.grid.forEach((cell, idx) => {
        let cx = (idx % maze.cols) * cellSize + cellSize / 2;
        let cy = Math.floor(idx / maze.cols) * cellSize + cellSize / 2;
        let dist = Math.sqrt((cx - e.x) ** 2 + (cy - e.y) ** 2);
        if (Math.abs(dist - e.r) < 40)
          this.drawCell(
            ctx,
            cell,
            idx % maze.cols,
            Math.floor(idx / maze.cols),
            cellSize,
            e.alpha,
          );
      });
    });

    const grd = ctx.createRadialGradient(
      player.x * cellSize + cellSize / 2,
      player.y * cellSize + cellSize / 2,
      20,
      player.x * cellSize + cellSize / 2,
      player.y * cellSize + cellSize / 2,
      150 + count * 50,
    );
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, `rgba(2, 11, 2, ${0.95 - count * 0.05})`);
    ctx.fillStyle = grd;
    ctx.fillRect(-1000, -1000, 3000, 3000);
    ctx.restore();
  }
  drawCell(ctx, walls, col, row, size, a) {
    ctx.strokeStyle = `rgba(0, 255, 65, ${a})`;
    const x = col * size,
      y = row * size;
    ctx.beginPath();
    if (walls & 1) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
    }
    if (walls & 2) {
      ctx.moveTo(x + size, y);
      ctx.lineTo(x + size, y + size);
    }
    if (walls & 4) {
      ctx.moveTo(x, y + size);
      ctx.lineTo(x + size, y + size);
    }
    if (walls & 8) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + size);
    }
    ctx.stroke();
  }
}
