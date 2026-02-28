class PongGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 500;
    this.player1 = { y: 200, height: 100, score: 0 };
    this.player2 = { y: 200, height: 100, score: 0 };
    this.ball = { x: 400, y: 250, radius: 10, dx: 5, dy: 5 };
    this.paddleWidth = 15;
    this.paddleSpeed = 8;
    this.keys = {};
    this.gameRunning = false;
    this.winScore = 5;
    this.setupControls();
  }
  setupControls() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
      if (e.key === " ") {
        e.preventDefault();
        if (!this.gameRunning) this.start();
      }
    });
    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }
  start() {
    this.gameRunning = true;
    this.ball.dx = 5;
    this.ball.dy = 5;
  }
  reset() {
    this.player1.score = 0;
    this.player2.score = 0;
    this.resetBall();
    this.gameRunning = false;
  }
  resetBall() {
    this.ball.x = 400;
    this.ball.y = 250;
    this.ball.dx *= -1;
    this.ball.dy = (Math.random() - 0.5) * 10;
    this.gameRunning = false;
  }
  update() {
    if (!this.gameRunning) return;
    if ((this.keys["w"] || this.keys["ArrowUp"]) && this.player1.y > 0)
      this.player1.y -= this.paddleSpeed;
    if (
      (this.keys["s"] || this.keys["ArrowDown"]) &&
      this.player1.y < this.canvas.height - this.player1.height
    )
      this.player1.y += this.paddleSpeed;
    const ballCenter = this.ball.y;
    const targetY = ballCenter - this.player2.height / 2;
    const aiSpeed = 4;
    if (
      this.player2.y < targetY &&
      this.player2.y < this.canvas.height - this.player2.height
    )
      this.player2.y += aiSpeed;
    if (this.player2.y > targetY && this.player2.y > 0)
      this.player2.y -= aiSpeed;
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    if (
      this.ball.y + this.ball.radius > this.canvas.height ||
      this.ball.y - this.ball.radius < 0
    )
      this.ball.dy *= -1;
    if (
      this.ball.x - this.ball.radius < this.paddleWidth &&
      this.ball.y > this.player1.y &&
      this.ball.y < this.player1.y + this.player1.height
    ) {
      this.ball.dx = Math.abs(this.ball.dx);
      this.ball.dy +=
        (this.ball.y - (this.player1.y + this.player1.height / 2)) * 0.1;
    }
    if (
      this.ball.x + this.ball.radius > this.canvas.width - this.paddleWidth &&
      this.ball.y > this.player2.y &&
      this.ball.y < this.player2.y + this.player2.height
    ) {
      this.ball.dx = -Math.abs(this.ball.dx);
      this.ball.dy +=
        (this.ball.y - (this.player2.y + this.player2.height / 2)) * 0.1;
    }
    if (this.ball.x < 0) {
      this.player2.score++;
      this.resetBall();
      if (this.onScoreUpdate) this.onScoreUpdate();
      if (this.player2.score >= this.winScore && this.onWin) this.onWin("CPU");
    }
    if (this.ball.x > this.canvas.width) {
      this.player1.score++;
      this.resetBall();
      if (this.onScoreUpdate) this.onScoreUpdate();
      if (this.player1.score >= this.winScore && this.onWin)
        this.onWin("PLAYER");
    }
  }
  render() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.canvas.height; i += 30) {
      this.ctx.fillStyle = "#003300";
      this.ctx.fillRect(this.canvas.width / 2 - 2, i, 4, 15);
    }
    this.ctx.fillStyle = "#00FF00";
    this.ctx.fillRect(0, this.player1.y, this.paddleWidth, this.player1.height);
    this.ctx.fillRect(
      this.canvas.width - this.paddleWidth,
      this.player2.y,
      this.paddleWidth,
      this.player2.height,
    );
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#00FF00";
    this.ctx.fill();
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = "#00FF00";
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }
}
