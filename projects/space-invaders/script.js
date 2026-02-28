// ================= SPACE INVADERS FULL GAME =================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
// -------- GAME STATE --------
let state = "start";
let score = 0;
let lives = 3;
let wave = 1;
// -------- PLAYER --------
const player = {
 x: canvas.width / 2 - 20,
 y: canvas.height - 50,
 w: 40,
 h: 20,
 speed: 5
};
// -------- INPUT --------
const keys = {};
document.addEventListener("keydown", e => {
 keys[e.key] = true;
 if (state !== "play") startGame();
});
document.addEventListener("keyup", e => keys[e.key] = false);
// -------- BULLETS --------
const bullets = [];
const alienBullets = [];
// -------- ALIENS --------
let aliens = [];
let alienDir = 1;
let alienSpeed = 0.5;
// -------- SHIELDS --------
const shields = [];
function createShields() {
 shields.length = 0;
 for (let i = 0; i < 3; i++) {
 shields.push({
 x: 80 + i * 140,
 y: canvas.height - 150,
 w: 60,
 h: 40,
 hp: 6
 });
 }
}
// -------- CREATE ALIENS --------
function createAliens() {
 aliens = [];
 for (let r = 0; r < 5; r++) {
 for (let c = 0; c < 9; c++) {
 aliens.push({
 x: 40 + c * 45,
 y: 50 + r * 40,
 w: 32,
 h: 24,
 alive: true
 });
 }
 }
}
// -------- START / RESET --------
function startGame() {
 state = "play";
 score = 0;
 lives = 3;
 wave = 1;
 alienSpeed = 0.5;
 bullets.length = 0;
 alienBullets.length = 0;
 createAliens();
 createShields();
}
// -------- SHOOT --------
document.addEventListener("keydown", e => {
 if (e.code === "Space" && state === "play") {
 bullets.push({
 x: player.x + player.w / 2 - 2,
 y: player.y,
 w: 4,
 h: 10,
 speed: 7
 });
 }
});
// -------- DRAW --------
function drawPlayer() {
 ctx.fillStyle = "#4fc3f7";
 ctx.fillRect(player.x, player.y, player.w, player.h);
}
function drawAliens() {
 ctx.fillStyle = "#76ff03";
 aliens.forEach(a => a.alive && ctx.fillRect(a.x, a.y, a.w, a.h));
}
function drawBullets() {
 ctx.fillStyle = "#fff";
 bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
 ctx.fillStyle = "red";
 alienBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
}
function drawShields() {
 shields.forEach(s => {
 if (s.hp > 0) {
 ctx.fillStyle = `rgba(0,255,0,${s.hp / 6})`;
 ctx.fillRect(s.x, s.y, s.w, s.h);
 }
 });
}
function drawHUD() {
 ctx.fillStyle = "#fff";
 ctx.font = "16px Arial";
 ctx.fillText(`Score: ${score}`, 10, 20);
 ctx.fillText(`Lives: ${lives}`, 380, 20);
 ctx.fillText(`Wave: ${wave}`, 210, 20);
}
// -------- UPDATE --------
function updatePlayer() {
 if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
 if (keys["ArrowRight"] && player.x + player.w < canvas.width)
 player.x += player.speed;
}
function updateAliens() {
 let edge = false;
 aliens.forEach(a => {
 if (!a.alive) return;
 a.x += alienDir * alienSpeed;
 if (a.x <= 10 || a.x + a.w >= canvas.width - 10) edge = true;
 });
 if (edge) {
 alienDir *= -1;
 aliens.forEach(a => a.y += 20);
 }
 if (Math.random() < 0.02) {
 const shooters = aliens.filter(a => a.alive);
 if (shooters.length) {
 const s = shooters[Math.floor(Math.random() * shooters.length)];
 alienBullets.push({
 x: s.x + s.w / 2,
 y: s.y + s.h,
 w: 4,
 h: 10,
 speed: 4
 });
 }
 }
}
function updateBullets() {
 bullets.forEach(b => b.y -= b.speed);
 alienBullets.forEach(b => b.y += b.speed);
}
function collisions() {
 bullets.forEach(b => {
 aliens.forEach(a => {
 if (
 a.alive &&
 b.x < a.x + a.w &&
 b.x + b.w > a.x &&
 b.y < a.y + a.h &&
 b.y + b.h > a.y
 ) {
 a.alive = false;
 b.y = -100;
 score += 10;
 }
 });
 });
 alienBullets.forEach(b => {
 if (
 b.x < player.x + player.w &&
 b.x + b.w > player.x &&
 b.y < player.y + player.h
 ) {
 b.y = canvas.height + 10;
 lives--;
 if (lives <= 0) state = "gameover";
 }
 });
 if (aliens.every(a => !a.alive)) {
 wave++;
 alienSpeed += 0.3;
 createAliens();
 }
}
// -------- LOOP --------
function loop() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 drawPlayer();
 drawAliens();
 drawBullets();
 drawShields();
 drawHUD();
 if (state === "play") {
 updatePlayer();
 updateAliens();
 updateBullets();
 collisions();
 }
 if (state === "start") {
 ctx.fillStyle = "#fff";
 ctx.font = "32px Arial Black";
 ctx.textAlign = "center";
 ctx.fillText("PRESS ANY KEY", canvas.width / 2, canvas.height / 2);
 }
 if (state === "gameover") {
 ctx.fillStyle = "red";
 ctx.font = "36px Arial Black";
 ctx.textAlign = "center";
 ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
 }
 requestAnimationFrame(loop);
}
loop();