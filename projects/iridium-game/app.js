const AudioSynth = {
	ctx: null,
	init: function () {
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		this.ctx = new AudioContext();
		if (this.ctx.state === "suspended") this.ctx.resume();
	},
	playTone: function (freq, type, duration, vol = 0.1) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
		gain.gain.setValueAtTime(vol, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(
			0.001,
			this.ctx.currentTime + duration
		);
		osc.connect(gain);
		gain.connect(this.ctx.destination);
		osc.start();
		osc.stop(this.ctx.currentTime + duration);
	},
	playNoise: function (duration, vol = 0.2) {
		if (!this.ctx) return;
		const bufferSize = this.ctx.sampleRate * duration;
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;
		const gain = this.ctx.createGain();
		gain.gain.setValueAtTime(vol, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(
			0.001,
			this.ctx.currentTime + duration
		);
		noise.connect(gain);
		gain.connect(this.ctx.destination);
		noise.start();
	},
	sfxShoot: function () {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
		gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
		gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
		osc.connect(gain);
		gain.connect(this.ctx.destination);
		osc.start();
		osc.stop(this.ctx.currentTime + 0.15);
	},
	sfxExplosion: function () {
		this.playNoise(0.5, 0.3);
		this.playTone(40, "square", 0.5, 0.3);
	},
	sfxHit: function () {
		this.playTone(100, "square", 0.15, 0.2);
		this.playNoise(0.1, 0.2);
	},
	sfxDash: function () {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(800, this.ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);
		gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
		gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
		osc.connect(gain);
		gain.connect(this.ctx.destination);
		osc.start();
		osc.stop(this.ctx.currentTime + 0.25);
	},
	sfxGrazing: function () {
		this.playTone(2000, "sine", 0.05, 0.02);
	},
	sfxPowerUp: function () {
		this.playTone(440, "triangle", 0.1, 0.1);
		setTimeout(() => this.playTone(880, "triangle", 0.2, 0.1), 100);
	},
	sfxCombo: function (level) {
		const base = 440 + level * 150;
		if (base > 2000) return;
		this.playTone(base, "square", 0.1, 0.05);
	}
};

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

const C = {
	BLACK: 0x000000,
	WHITE: 0xffffff,
	RED: 0xff2222,
	CYAN: 0x00ffee,
	PURPLE: 0xcc44cc,
	BLUE: 0x0000aa,
	YELLOW: 0xffd700,
	ORANGE: 0xff8800,
	DARKGREY: 0x111111,
	GREY: 0x555555,
	METAL_LIGHT: 0xbbbbbb,
	METAL_MED: 0x888888,
	METAL_DARK: 0x444444,
	BOOST: 0xff00ff,
	COCKPIT: 0x000088
};

const WIDTH = 320;
const HEIGHT = 200;

const keys = {
	ArrowUp: false,
	ArrowDown: false,
	ArrowLeft: false,
	ArrowRight: false,
	Space: false,
	KeyP: false,
	ShiftLeft: false,
	KeyX: false
};

function updateKey(code, state) {
	if (keys.hasOwnProperty(code)) keys[code] = state;
}

window.addEventListener("keydown", (e) => {
	if (
		e.code === "Space" ||
		e.code === "ArrowUp" ||
		e.code === "ArrowDown" ||
		e.code === "ArrowLeft" ||
		e.code === "ArrowRight" ||
		e.code === "ShiftLeft"
	)
		e.preventDefault();
	if (e.code === "Space") keys.Space = true;
	if (e.code === "KeyP") game.togglePause();
	if (e.code === "ShiftLeft") keys.ShiftLeft = true;
	if (e.code === "KeyX") keys.KeyX = true;
	updateKey(e.code, true);
});
window.addEventListener("keyup", (e) => {
	if (e.code === "Space") keys.Space = false;
	if (e.code === "ShiftLeft") keys.ShiftLeft = false;
	if (e.code === "KeyX") keys.KeyX = false;
	updateKey(e.code, false);
});

const tUp = document.getElementById("t-up");
const tDown = document.getElementById("t-down");
const tLeft = document.getElementById("t-left");
const tRight = document.getElementById("t-right");
const tFire = document.getElementById("t-fire");
const tDash = document.getElementById("t-dash");

if (tUp)
	tUp.addEventListener("touchstart", (e) => {
		e.preventDefault();
		keys.ArrowUp = true;
	});
if (tUp)
	tUp.addEventListener("touchend", (e) => {
		e.preventDefault();
		keys.ArrowUp = false;
	});
if (tDown)
	tDown.addEventListener("touchstart", (e) => {
		e.preventDefault();
		keys.ArrowDown = true;
	});
if (tDown)
	tDown.addEventListener("touchend", (e) => {
		e.preventDefault();
		keys.ArrowDown = false;
	});
if (tLeft)
	tLeft.addEventListener("touchstart", (e) => {
		e.preventDefault();
		keys.ArrowLeft = true;
	});
if (tLeft)
	tLeft.addEventListener("touchend", (e) => {
		e.preventDefault();
		keys.ArrowLeft = false;
	});
if (tRight)
	tRight.addEventListener("touchstart", (e) => {
		e.preventDefault();
		keys.ArrowRight = true;
	});
if (tRight)
	tRight.addEventListener("touchend", (e) => {
		e.preventDefault();
		keys.ArrowRight = false;
	});
if (tFire)
	tFire.addEventListener("touchstart", (e) => {
		e.preventDefault();
		keys.Space = true;
	});
if (tFire)
	tFire.addEventListener("touchend", (e) => {
		e.preventDefault();
		keys.Space = false;
	});
if (tDash)
	tDash.addEventListener("touchstart", (e) => {
		e.preventDefault();
		keys.ShiftLeft = true;
		keys.KeyX = true;
	});
if (tDash)
	tDash.addEventListener("touchend", (e) => {
		e.preventDefault();
		keys.ShiftLeft = false;
		keys.KeyX = false;
	});

function fillRect(x, y, w, h, colorHex) {
	ctx.fillStyle = "#" + colorHex.toString(16).padStart(6, "0");
	ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

function rectIntersect(r1, r2) {
	return !(
		r2.x > r1.x + r1.w ||
		r2.x + r2.w < r1.x ||
		r2.y > r1.y + r1.h ||
		r2.y + r2.h < r1.y
	);
}

const Sprites = {
	drawPlayer: function (x, y, tilt, shield, moving, dashing) {
		ctx.save();
		ctx.translate(x, y);
		if (tilt) ctx.rotate((tilt * Math.PI) / 180);

		if (moving) {
			ctx.globalCompositeOperation = "lighter";
			const flicker = Math.random() * 4;
			fillRect(-6, 14, 12, 6 + flicker, C.ORANGE);
			fillRect(-2, 14, 4, 4 + flicker, C.WHITE);
			fillRect(-12, 12, 4, 4 + flicker, C.CYAN);
			fillRect(8, 12, 4, 4 + flicker, C.CYAN);
			ctx.globalCompositeOperation = "source-over";
		}

		if (dashing) {
			ctx.globalAlpha = 0.6;
			fillRect(-24, -16, 48, 40, C.BOOST);
			ctx.globalAlpha = 1.0;
		}

		fillRect(-4, -16, 8, 32, C.METAL_LIGHT);
		fillRect(-1, -14, 2, 28, C.METAL_DARK);
		fillRect(-20, 0, 8, 8, C.METAL_LIGHT);
		fillRect(-14, -4, 12, 12, C.METAL_MED);
		fillRect(-6, -8, 10, 20, C.METAL_LIGHT);
		fillRect(12, 0, 8, 8, C.METAL_LIGHT);
		fillRect(2, -4, 12, 12, C.METAL_MED);
		fillRect(-4, -8, 10, 20, C.METAL_LIGHT);
		fillRect(-20, 0, 2, 6, C.RED);
		fillRect(18, 0, 2, 6, C.RED);
		fillRect(-3, -12, 6, 8, C.COCKPIT);
		fillRect(-2, -10, 4, 4, 0x00aaaa);
		fillRect(-3, -6, 6, 1, C.METAL_MED);
		fillRect(-10, 6, 6, 6, C.GREY);
		fillRect(4, 6, 6, 6, C.GREY);
		fillRect(-8, 10, 4, 2, C.RED);
		fillRect(4, 10, 4, 2, C.RED);

		if (shield <= 20) {
			ctx.globalAlpha = 0.4;
			fillRect(-4, -12, 8, 24, C.RED);
			ctx.globalAlpha = 1.0;
		}

		ctx.restore();
	},
	drawInterceptor: function (x, y) {
		const cx = x + 10;
		const cy = y + 10;
		fillRect(cx - 1, cy - 8, 2, 16, C.METAL_DARK);
		fillRect(cx - 5, cy - 4, 10, 8, C.METAL_MED);
		fillRect(cx - 3, cy - 6, 6, 12, C.METAL_LIGHT);
		fillRect(cx - 2, cy - 6, 4, 6, C.RED);
		fillRect(cx - 2, cy + 6, 4, 2, C.ORANGE);
		fillRect(cx - 5, cy - 4, 2, 2, C.GREY);
		fillRect(cx + 3, cy - 4, 2, 2, C.GREY);
		if (Math.floor(performance.now() / 200) % 2 === 0) {
			fillRect(cx - 5, cy, 1, 2, C.RED);
			fillRect(cx + 4, cy, 1, 2, C.RED);
		}
	},
	drawChaser: function (x, y) {
		const cx = x + 10;
		const cy = y + 10;
		fillRect(cx - 8, cy - 8, 16, 16, 0x333333);
		fillRect(cx - 6, cy - 6, 12, 12, 0x222222);
		fillRect(cx - 6, cy - 6, 4, 12, 0x111111);
		fillRect(cx + 2, cy - 6, 4, 12, 0x111111);
		const eyePulse = Math.floor(performance.now() / 200) % 2 === 0;
		fillRect(cx - 4, cy - 4, 8, 8, 0x000000);
		fillRect(cx - 2, cy - 2, 4, 4, eyePulse ? C.RED : 0xaa0000);
		const angle = performance.now() / 150;
		fillRect(
			cx + Math.cos(angle) * 7 - 1,
			cy + Math.sin(angle) * 7 - 1,
			2,
			2,
			C.CYAN
		);
		fillRect(
			cx + Math.cos(angle + Math.PI) * 7 - 1,
			cy + Math.sin(angle + Math.PI) * 7 - 1,
			2,
			2,
			C.CYAN
		);
	},
	drawTurret: function (x, y, charging) {
		const cx = x + 12,
			cy = y + 12;
		fillRect(cx - 10, cy - 6, 20, 12, 0x222222);
		fillRect(cx - 8, cy - 4, 16, 8, 0x333333);
		fillRect(cx, cy + 6, 1, 4, 0x000000);
		if (charging) {
			ctx.globalCompositeOperation = "lighter";
			const pulse = Math.floor(performance.now() / 20) % 2 === 0;
			fillRect(cx - 4, cy - 14, 8, 14, pulse ? C.RED : 0xff0000);
			ctx.globalCompositeOperation = "source-over";
		} else {
			fillRect(cx - 4, cy - 12, 8, 12, 0x666666);
			fillRect(cx - 2, cy - 12, 4, 2, C.ORANGE);
		}
	},
	drawReactor: function (x, y) {
		fillRect(x, y, 24, 24, 0x111111);
		fillRect(x + 2, y + 2, 20, 20, 0x222222);
		fillRect(x + 4, y + 4, 4, 16, 0x111111);
		fillRect(x + 16, y + 4, 4, 16, 0x111111);
		const p = Math.floor(performance.now() / 80) % 2;
		if (p) {
			ctx.globalCompositeOperation = "lighter";
			fillRect(x + 8, y + 8, 8, 8, C.ORANGE);
			fillRect(x + 10, y + 10, 4, 4, C.WHITE);
			ctx.globalCompositeOperation = "source-over";
		} else {
			fillRect(x + 8, y + 8, 8, 8, 0xaa4400);
		}
	},
	drawDreadnoughtTile: function (x, y, type) {
		fillRect(x, y, 24, 24, 0x222222);
		fillRect(x + 1, y + 1, 22, 22, 0x333333);
		if (type === 1) {
			fillRect(x + 2, y + 10, 20, 4, 0x000066);
			fillRect(x + 2, y + 11, 20, 2, C.BLUE);
		} else {
			fillRect(x + 2, y + 2, 4, 4, 0x444444);
			fillRect(x + 18, y + 2, 4, 4, 0x444444);
			fillRect(x + 2, y + 18, 4, 4, 0x444444);
			fillRect(x + 18, y + 18, 4, 4, 0x444444);
		}
	}
};

class Star {
	constructor() {
		this.reset();
		this.y = Math.random() * HEIGHT;
	}
	reset() {
		this.x = Math.random() * WIDTH;
		this.y = -10;
		this.speed = 0.005 + Math.random() * 0.005;
		this.color = Math.random() > 0.9 ? C.WHITE : 0x555555;
	}
	update(mult) {
		this.y += this.speed * mult;
		if (this.y > HEIGHT) this.reset();
	}
	draw() {
		ctx.globalAlpha = 0.3;
		fillRect(this.x, this.y, 1, 1, this.color);
		ctx.globalAlpha = 1.0;
	}
}

class Particle {
	constructor(x, y, color, type = "spark") {
		this.x = x;
		this.y = y;
		const angle = Math.random() * Math.PI * 2;
		const speed =
			type === "debris" ? 1 + Math.random() * 2 : 2 + Math.random() * 3;
		this.vx = Math.cos(angle) * speed;
		this.vy = Math.sin(angle) * speed;
		this.life = 1.0;
		this.color = color;
		this.vyBase = type === "debris" ? 1 : 0;
		this.decay = type === "trail" ? 0.25 : 0.01 + Math.random() * 0.03;
		this.type = type;
	}
	update() {
		this.x += this.vx;
		this.y += this.vy;
		this.vy += 0.1 * this.vyBase;
		this.life -= this.decay;
	}
	draw() {
		if (this.life > 0) {
			ctx.globalAlpha = this.life;
			if (this.type === "debris") {
				const size = Math.floor(this.life * 3);
				fillRect(this.x, this.y, size, size, this.color);
			} else {
				const size = Math.floor(this.life * 2);
				ctx.globalCompositeOperation = "lighter";
				fillRect(this.x, this.y, size, size, this.color);
				ctx.globalCompositeOperation = "source-over";
			}
			ctx.globalAlpha = 1.0;
		}
	}
}

class Bullet {
	constructor(x, y, vx = 0, vy = 0) {
		this.x = x;
		this.y = y;
		this.w = 3;
		this.h = 12;
		this.speed = 15;
		this.vx = vx;
		this.vy = vy;
		this.active = true;
		this.getBounds = () => ({ x: this.x, y: this.y, w: this.w, h: this.h });
	}
	update() {
		this.x += this.vx;
		this.y -= this.speed + this.vy;
		if (this.y < -20) this.active = false;
	}
	draw() {
		ctx.globalCompositeOperation = "lighter";
		fillRect(this.x, this.y, this.w, this.h, C.CYAN);
		fillRect(this.x + 1, this.y + 2, 1, this.h - 4, C.WHITE);
		ctx.globalCompositeOperation = "source-over";
	}
}

class EnemyBullet {
	constructor(x, y, targetX, targetY) {
		this.x = x;
		this.y = y;
		this.w = 6;
		this.h = 6;
		this.active = true;
		const angle = Math.atan2(targetY - y, targetX - x);
		this.vx = Math.cos(angle) * 4.0;
		this.vy = Math.sin(angle) * 4.0;
		this.trail = [];
		this.getBounds = () => ({ x: this.x, y: this.y, w: this.w, h: this.h });
		this.grazed = false;
	}
	update() {
		this.trail.push({ x: this.x, y: this.y, life: 1.0 });
		this.x += this.vx;
		this.y += this.vy;
		if (this.y > HEIGHT || this.x < -10 || this.x > WIDTH + 10)
			this.active = false;
		for (let i = this.trail.length - 1; i >= 0; i--) {
			this.trail[i].life -= 0.15;
			if (this.trail[i].life <= 0) this.trail.splice(i, 1);
		}
	}
	draw() {
		ctx.globalCompositeOperation = "lighter";
		fillRect(this.x, this.y, this.w, this.h, C.RED);
		this.trail.forEach((t) => fillRect(t.x, t.y, 3, 3, 0x880000));
		ctx.globalCompositeOperation = "source-over";
	}
}

class SurfaceObject {
	constructor(type, gridX, gridY) {
		this.type = type;
		this.gridX = gridX;
		this.gridY = gridY;
		this.w = 24;
		this.h = 24;
		this.active = true;
		this.cooldown = 0;
		this.state = "idle";
		this.chargeTimer = 0;
		this.drawY = 0;
		if (type === "reactor") this.hp = 25;
		else this.hp = 8;
	}
	update(drawY, player) {
		this.drawY = drawY;
		if (this.type === "turret" && this.active) {
			if (this.cooldown > 0) this.cooldown--;
			const distY = Math.abs(player.y - (drawY + 12));
			const distX = Math.abs(player.x - this.gridX * 24);

			if (distY < 70 && distX < 130) {
				if (this.state === "idle" && this.cooldown <= 0) {
					this.state = "charging";
					this.chargeTimer = 40;
				}
			} else {
				if (this.state === "charging") this.state = "idle";
			}

			if (this.state === "charging") {
				this.chargeTimer--;
				if (this.chargeTimer <= 0) {
					game.spawnEnemyBullet(
						this.gridX * 24 + 12,
						drawY + 20,
						player.x,
						player.y
					);
					setTimeout(
						() =>
							game.spawnEnemyBullet(
								this.gridX * 24 + 12,
								drawY + 20,
								player.x,
								player.y
							),
						80
					);
					this.state = "idle";
					this.cooldown = 100;
				}
			}
		}
	}
	getBounds() {
		return { x: this.gridX * 24, y: this.drawY, w: 24, h: 24 };
	}
	hit() {
		this.hp--;
		if (this.hp <= 0) {
			this.active = false;
			game.addScreenShake(7);
			game.spawnDebris(this.gridX * 24 + 12, this.drawY + 12, C.METAL_MED);
			if (this.type === "reactor") {
				AudioSynth.sfxExplosion();
				game.spawnExplosion(this.gridX * 24 + 12, this.drawY + 12, C.ORANGE, 60);
				game.reactorsDestroyed++;
				game.addScore(2500);
			} else {
				AudioSynth.sfxExplosion();
				game.spawnExplosion(this.gridX * 24 + 12, this.drawY + 12, C.RED, 35);
				game.addScore(250);
			}
		} else {
			AudioSynth.sfxHit();
			game.spawnDebris(this.gridX * 24 + 12, this.drawY + 12, C.YELLOW, 3);
		}
	}
	draw() {
		if (!this.active) return;
		const x = this.gridX * 24;
		const y = this.drawY;
		if (this.type === "turret")
			Sprites.drawTurret(x, y, this.state === "charging");
		else if (this.type === "reactor") Sprites.drawReactor(x, y);
	}
}

class Enemy {
	constructor(type) {
		this.reset(type);
	}
	reset(type) {
		this.type = type;
		this.w = 20;
		this.h = 20;
		this.active = true;
		this.timer = 0;
		if (type === "interceptor") {
			this.x = Math.random() * (WIDTH - 20);
			this.y = HEIGHT + 20;
			this.speedY = 0.5 + Math.random();
			this.hp = 3;
		} else if (type === "chaser") {
			this.x = Math.random() > 0.5 ? -20 : WIDTH + 20;
			this.y = HEIGHT - 40;
			this.hp = 7;
		}
	}
	update(player) {
		this.timer++;
		if (this.type === "interceptor") {
			this.y -= this.speedY;
			this.x += Math.sin(this.timer * 0.15) * 4;
			if (this.y < -20) this.active = false;
		} else if (this.type === "chaser") {
			const dx = player.x - this.x;
			const dy = player.y - this.y;
			this.x += (dx > 0 ? 1 : -1) * 2.0;
			this.y -= 0.8;
			if (this.y < -20) this.active = false;
		}
	}
	getBounds() {
		return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 8 };
	}
	draw() {
		if (this.type === "interceptor") Sprites.drawInterceptor(this.x, this.y);
		else Sprites.drawChaser(this.x, this.y);
	}
}

class Player {
	constructor() {
		this.w = 32;
		this.h = 32;
		this.x = WIDTH / 2;
		this.y = 150;
		this.vx = 0;
		this.vy = 0;
		this.ax = 1.2;
		this.friction = 0.93;
		this.tilt = 0;
		this.cooldown = 0;
		this.invincible = 0;
		this.dead = false;
		this.weaponLevel = 1;
		this.maxShield = 100;
		this.shield = 100;
		this.maxBoost = 100;
		this.boost = 100;
		this.dashing = false;
		this.dashTime = 0;
		this.dashCd = 0;
		this.grazed = [];
	}
	update() {
		if (this.dead) return;

		if (keys.ArrowUp) this.vy -= this.ax;
		if (keys.ArrowDown) this.vy += this.ax;
		if (keys.ArrowLeft) {
			this.vx -= this.ax;
			this.tilt = -35;
		} else if (keys.ArrowRight) {
			this.vx += this.ax;
			this.tilt = 35;
		} else {
			this.tilt = 0;
		}

		if ((keys.ShiftLeft || keys.KeyX) && this.dashCd <= 0 && this.boost > 30) {
			this.startDash();
		}

		if (this.dashing) {
			this.x += this.vx * 2.5;
			this.y += this.vy * 2.5;
			this.dashTime--;
			if (this.dashTime <= 0) this.endDash();
		} else {
			this.vx *= this.friction;
			this.vy *= this.friction;
			this.x += this.vx;
			this.y += this.vy;
			if (this.dashCd > 0) this.dashCd--;
			if (this.dashCd <= 0 && this.boost < this.maxBoost) this.boost += 0.6;
		}

		if (this.x < -16) this.x = WIDTH;
		if (this.x > WIDTH) this.x = -16;
		if (this.y < 20) {
			this.y = 20;
			this.vy = 0;
		}
		if (this.y > HEIGHT - 20) {
			this.y = HEIGHT - 20;
			this.vy = 0;
		}

		if (Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5) {
			game.particles.push(new Particle(this.x, this.y + 16, C.CYAN, "trail"));
		}

		if (this.cooldown > 0) this.cooldown--;
		if (keys.Space && this.cooldown <= 0) {
			this.fire();
			this.cooldown = 4;
		}
		if (this.invincible > 0) this.invincible--;

		if (this.shield < this.maxShield && game.frameCount % 20 === 0) {
			this.shield += 1;
		}
	}
	startDash() {
		this.dashing = true;
		this.dashTime = 8;
		this.dashCd = 50;
		this.boost -= 30;
		this.invincible = 20;
		AudioSynth.sfxDash();
	}
	endDash() {
		this.dashing = false;
		this.vx *= 0.2;
		this.vy *= 0.2;
	}
	fire() {
		AudioSynth.sfxShoot();
		game.addScreenShake(2);
		this.y += 1.5;
		game.spawnBullet(this.x - 1.5, this.y - 10);
		if (this.weaponLevel >= 2) {
			game.spawnBullet(this.x - 10, this.y - 2, -0.8, 0);
			game.spawnBullet(this.x + 7, this.y - 2, 0.8, 0);
		}
		if (this.weaponLevel >= 3) {
			game.spawnBullet(this.x - 18, this.y + 4, -2, 2);
			game.spawnBullet(this.x + 15, this.y + 4, 2, 2);
		}
	}
	getBounds() {
		return { x: this.x - 4, y: this.y - 4, w: 8, h: 8 };
	}
	getVisualBounds() {
		return { x: this.x - 16, y: this.y - 16, w: 32, h: 32 };
	}
	draw() {
		if (this.dead) return;
		if (this.invincible > 0 && Math.floor(performance.now() / 30) % 2 === 0)
			return;
		const moving = Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5;
		Sprites.drawPlayer(
			this.x,
			this.y,
			this.tilt,
			this.shield,
			moving,
			this.dashing
		);
	}
	takeDamage() {
		if (this.invincible > 0) return;
		game.breakCombo();
		game.addScreenShake(10);
		AudioSynth.sfxHit();
		this.shield -= 20;
		this.invincible = 90;
		if (this.shield <= 0) {
			this.shield = 0;
			game.die();
		}
		this.vy = 3;
	}
}

class Dreadnought {
	constructor() {
		this.scrollY = 0;
		this.speed = 0.05;
		this.objects = [];
		this.generateLevel();
	}
	generateLevel() {
		this.objects = [];
		for (let i = 0; i < 3; i++) {
			const gx = 2 + Math.floor(Math.random() * 8);
			const gy = 10 + i * 12;
			this.objects.push(new SurfaceObject("reactor", gx, gy));
		}
		for (let i = 0; i < 10; i++) {
			const gx = Math.floor(Math.random() * 12);
			const gy = 5 + Math.floor(Math.random() * 60);
			this.objects.push(new SurfaceObject("turret", gx, gy));
		}
	}
	update() {
		let currentSpeed = this.speed;
		if (game.state === "win") currentSpeed = 12.0;
		this.scrollY += currentSpeed;
		if (this.scrollY >= 100) this.scrollY = 0;
	}
	draw() {
		const blockSize = 24;
		const yOffset = (this.scrollY % 1) * blockSize;
		const gridIndexOffset = Math.floor(this.scrollY);
		const viewDepth = 10;
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
		for (let y = 0; y < viewDepth; y++) {
			const worldY = y + gridIndexOffset;
			const drawY = HEIGHT - y * blockSize + yOffset - 20;
			if (drawY > HEIGHT || drawY < -blockSize) continue;
			for (let x = -1; x < 15; x++) {
				const drawX = x * blockSize;
				const isStrip = x === 7;
				const type = isStrip ? 1 : 0;
				Sprites.drawDreadnoughtTile(drawX, drawY, type);
			}
			this.objects.forEach((obj) => {
				if (obj.gridY === worldY) {
					obj.update(drawY, game.player);
					obj.draw();
				}
			});
		}
	}
}

const game = {
	state: "start",
	player: null,
	bullets: [],
	enemies: [],
	enemyBullets: [],
	particles: [],
	stars: [],
	dreadnought: null,
	score: 0,
	lives: 3,
	level: 1,
	frameCount: 0,
	reactorsDestroyed: 0,

	screenShake: 0,
	cameraOffset: { x: 0, y: 0, rot: 0 },
	combo: 0,
	comboTimer: 0,
	highScore: 0,
	ui: {},

	init() {
		try {
			const saved = localStorage.getItem("uridum_highscore");
			if (saved) this.highScore = parseInt(saved);
		} catch (e) {
			this.highScore = 0;
		}
		for (let i = 0; i < 80; i++) this.stars.push(new Star());
		this.dreadnought = new Dreadnought();
		requestAnimationFrame(() => this.loop());
	},
	start() {
		AudioSynth.init();
		document.body.style.cursor = "none";
		this.goFullScreen();
		this.ui.startScreen.classList.add("hidden");
		this.ui.gameOverScreen.classList.add("hidden");
		this.resetGameData();
		this.state = "playing";
	},
	goFullScreen() {
		try {
			const elem = document.documentElement;
			if (elem.requestFullscreen) elem.requestFullscreen();
			else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
			else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
			else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
			if (elem.webkitEnterFullscreen) elem.webkitEnterFullscreen();
		} catch (e) {}
	},
	reset() {
		document.body.style.cursor = "none";
		this.ui.gameOverScreen.classList.add("hidden");
		this.resetGameData();
		this.state = "playing";
	},
	resetGameData() {
		this.player = new Player();
		this.bullets = [];
		this.enemies = [];
		this.enemyBullets = [];
		this.particles = [];
		this.score = 0;
		this.lives = 3;
		this.reactorsDestroyed = 0;
		this.frameCount = 0;
		this.dreadnought = new Dreadnought();
		this.resetCombo();
		if (this.player) this.player.grazed = [];
		this.updateUI();
	},
	togglePause() {
		if (this.state === "playing") this.state = "paused";
		else if (this.state === "paused") this.state = "playing";
	},

	addScreenShake(amount) {
		this.screenShake = Math.min(this.screenShake + amount, 40);
	},

	addScore(baseScore) {
		this.combo++;
		this.comboTimer = 180;
		let multiplier = 1 + Math.floor(this.combo / 5);
		if (multiplier > 10) multiplier = 10;
		const finalScore = baseScore * multiplier;
		this.score += finalScore;

		if (this.score > this.highScore) {
			this.highScore = this.score;
			localStorage.setItem("uridum_highscore", this.highScore);
		}

		if (this.combo % 5 === 0) AudioSynth.sfxCombo(multiplier);
		this.updateUI();
	},
	addGrazeBonus() {
		this.score += 50;
		if (this.score > this.highScore) {
			this.highScore = this.score;
			localStorage.setItem("uridum_highscore", this.highScore);
		}
		AudioSynth.sfxGrazing();
		const spark = new Particle(this.player.x, this.player.y, C.YELLOW, "spark");
		spark.vx = 0;
		spark.vy = -2;
		this.particles.push(spark);
		this.updateUI();
	},
	resetCombo() {
		this.combo = 0;
		this.updateUI();
	},
	breakCombo() {
		if (this.combo > 5) this.resetCombo();
	},

	spawnBullet(x, y, vx = 0, vy = 0) {
		const b = new Bullet(x, y, vx, vy);
		b.active = true;
		this.bullets.push(b);
	},
	spawnEnemyBullet(x, y, tx, ty) {
		this.enemyBullets.push(new EnemyBullet(x, y, tx, ty));
	},
	spawnExplosion(x, y, c, n) {
		for (let i = 0; i < n; i++)
			this.particles.push(new Particle(x, y, c, "spark"));
	},
	spawnDebris(x, y, c, n = 10) {
		for (let i = 0; i < n; i++)
			this.particles.push(new Particle(x, y, c, "debris"));
	},

	update() {
		if (this.state !== "playing" && this.state !== "win") return;
		this.frameCount++;

		if (this.player) {
			const targetRot = -this.player.vx * 0.006;
			this.cameraOffset.rot += (targetRot - this.cameraOffset.rot) * 0.1;
		}

		if (this.comboTimer > 0) {
			this.comboTimer--;
			if (this.comboTimer <= 0) this.resetCombo();
		}

		if (this.state === "playing") {
			let spawnMod = Math.max(0.5, 1.0 - this.combo * 0.015);
			if (this.frameCount % Math.floor(140 * spawnMod) === 0)
				this.enemies.push(new Enemy("interceptor"));
			if (this.frameCount % Math.floor(300 * spawnMod) === 0)
				this.enemies.push(new Enemy("chaser"));
			if (this.score > 1000 && this.player.weaponLevel === 1) {
				this.player.weaponLevel = 2;
				AudioSynth.sfxPowerUp();
			}
			if (this.score > 3000 && this.player.weaponLevel === 2) {
				this.player.weaponLevel = 3;
				AudioSynth.sfxPowerUp();
			}
		}

		this.dreadnought.update();
		this.player.update();

		if (this.screenShake > 0) {
			this.screenShake *= 0.85;
			if (this.screenShake < 0.5) this.screenShake = 0;
		}

		for (let i = this.bullets.length - 1; i >= 0; i--) {
			let b = this.bullets[i];
			b.update();
			if (!b.active) {
				this.bullets.splice(i, 1);
				continue;
			}
			if (b.y > HEIGHT - 150) {
				for (let obj of this.dreadnought.objects) {
					if (!obj.active) continue;
					if (
						Math.abs(b.y - obj.drawY) < 25 &&
						Math.abs(b.x - obj.gridX * 24) < 25
					) {
						if (rectIntersect(b.getBounds(), obj.getBounds())) {
							b.active = false;
							obj.hit();
							break;
						}
					}
				}
			}
		}

		for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
			let b = this.enemyBullets[i];
			b.update();
			if (!b.active) {
				this.enemyBullets.splice(i, 1);
				continue;
			}

			const dx = this.player.x - (b.x + 3);
			const dy = this.player.y - (b.y + 3);

			if (dx * dx + dy * dy < 400 && !this.player.grazed.includes(i)) {
				this.player.grazed.push(i);
				this.addGrazeBonus();
			}

			if (rectIntersect(b.getBounds(), this.player.getBounds())) {
				b.active = false;
				this.player.takeDamage();
			}
		}

		for (let i = this.enemies.length - 1; i >= 0; i--) {
			let e = this.enemies[i];
			e.update(this.player);

			if (rectIntersect(e.getBounds(), this.player.getBounds())) {
				this.player.takeDamage();
				e.active = false;
				this.spawnExplosion(e.x, e.y, C.RED, 20);
			}

			for (let j = this.bullets.length - 1; j >= 0; j--) {
				let b = this.bullets[j];
				if (b.active && rectIntersect(b.getBounds(), e.getBounds())) {
					b.active = false;
					e.hp--;
					this.spawnExplosion(b.x, b.y, C.YELLOW, 5);
					if (e.hp <= 0) {
						e.active = false;
						this.addScore(150);
						this.spawnExplosion(e.x, e.y, C.RED, 30);
						this.spawnDebris(e.x, e.y, C.GREY, 8);

						AudioSynth.sfxExplosion();
					}
					break;
				}
			}
			if (!e.active) this.enemies.splice(i, 1);
		}

		for (let i = this.particles.length - 1; i >= 0; i--) {
			this.particles[i].update();
			if (this.particles[i].life <= 0) this.particles.splice(i, 1);
		}
		this.stars.forEach((s) => s.update(this.state === "win" ? 10 : 1));

		if (this.reactorsDestroyed >= 3 && this.state === "playing") {
			this.winLevel();
		}
		this.updateUI();
	},

	winLevel() {
		this.state = "win";
		this.player.invincible = 9999;
		this.ui.missionAlert.innerText = "SYSTEME SECURE";
		this.ui.missionAlert.style.display = "block";
		this.ui.missionAlert.style.color = "#00FF00";
		setTimeout(() => {
			this.level++;
			this.reset();
			this.ui.missionAlert.style.display = "none";
		}, 3000);
	},

	draw() {
		ctx.save();
		const rx = (Math.random() - 0.5) * this.screenShake;
		const ry = (Math.random() - 0.5) * this.screenShake;
		ctx.translate(WIDTH / 2 + rx, HEIGHT / 2 + ry);
		ctx.rotate(this.cameraOffset.rot);
		ctx.translate(-WIDTH / 2, -HEIGHT / 2);

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
		this.stars.forEach((s) => s.draw());
		if (this.state !== "start") this.dreadnought.draw();

		ctx.globalCompositeOperation = "lighter";
		this.bullets.forEach((b) => b.draw());
		this.enemyBullets.forEach((b) => b.draw());
		this.particles.forEach((p) => p.draw());
		ctx.globalCompositeOperation = "source-over";

		this.enemies.forEach((e) => e.draw());
		if (this.player) this.player.draw();

		ctx.restore();

		if (this.state === "paused") {
			ctx.fillStyle = "rgba(0,0,0,0.7)";
			ctx.fillRect(0, 0, WIDTH, HEIGHT);
			ctx.fillStyle = "#fff";
			ctx.font = '10px "Press Start 2P"';
			ctx.fillText("PAUSE", WIDTH / 2 - 20, HEIGHT / 2);
		}
	},
	loop() {
		this.update();
		this.draw();
		requestAnimationFrame(() => this.loop());
	},
	die() {
		this.addScreenShake(40);
		AudioSynth.sfxExplosion();
		this.spawnExplosion(this.player.x, this.player.y, C.WHITE, 80);
		this.spawnDebris(this.player.x, this.player.y, C.METAL_LIGHT, 30);
		this.lives--;
		this.updateUI();
		if (this.lives <= 0) {
			this.state = "gameover";
			let rank = "D";
			if (this.score > 10000) rank = "C";
			if (this.score > 30000) rank = "B";
			if (this.score > 60000) rank = "A";
			if (this.score > 100000) rank = "S";
			this.ui.goScore.innerText = "SCORE: " + this.score;
			this.ui.finalRank.innerText = "RANK: " + rank;
			this.ui.gameOverScreen.classList.remove("hidden");
		} else {
			this.player.dead = true;
			setTimeout(() => {
				this.player.dead = false;
				this.player.invincible = 180;
				this.player.shield = 100;
				this.player.x = WIDTH / 2;
				this.player.y = HEIGHT - 40;
				this.player.vx = 0;
				this.player.vy = 0;
				this.resetCombo();
			}, 1500);
		}
	},
	updateUI() {
		if (this.state === "start" || this.state === "gameover") {
			this.ui.uiLayer.classList.add("hidden");
		} else {
			this.ui.uiLayer.classList.remove("hidden");
			this.ui.scoreVal.innerText = this.score.toString().padStart(8, "0");
			this.ui.highscoreVal.innerText = this.highScore.toString().padStart(8, "0");
			this.ui.livesVal.innerText = this.lives;
			this.ui.reactorCount.innerText = 3 - this.reactorsDestroyed;
			this.ui.weaponLvl.innerText = this.player ? this.player.weaponLevel : 1;

			if (this.player) {
				this.ui.shieldBar.style.width = this.player.shield + "%";
				const sb = this.ui.shieldBar;
				sb.style.background = this.player.shield < 20 ? "#FF0000" : "#0088FF";

				this.ui.boostBar.style.width = this.player.boost + "%";
				const bb = this.ui.boostBar;
				bb.style.background = this.player.boost < 30 ? "#550055" : "#FF00FF";
			}

			const ce = this.ui.comboDisplay;
			if (this.combo > 4) {
				ce.innerText = "x" + (1 + Math.floor(this.combo / 5));
				ce.style.opacity = 1;
				ce.style.transform = "scale(1.3)";
				setTimeout(() => {
					if (this.combo > 4) ce.style.transform = "scale(1.0)";
				}, 100);
			} else {
				ce.style.opacity = 0;
			}
		}
	}
};

document.addEventListener("DOMContentLoaded", () => {
	game.ui.startScreen = document.getElementById("start-screen");
	game.ui.gameOverScreen = document.getElementById("game-over-screen");
	game.ui.missionAlert = document.getElementById("mission-alert");
	game.ui.comboDisplay = document.getElementById("combo-display");
	game.ui.scoreVal = document.getElementById("score-val");
	game.ui.highscoreVal = document.getElementById("highscore-val");
	game.ui.livesVal = document.getElementById("lives-val");
	game.ui.reactorCount = document.getElementById("reactor-count");
	game.ui.weaponLvl = document.getElementById("weapon-lvl");
	game.ui.shieldBar = document.getElementById("shield-bar");
	game.ui.boostBar = document.getElementById("boost-bar");
	game.ui.goScore = document.getElementById("go-score");
	game.ui.finalRank = document.getElementById("final-rank");
	game.ui.uiLayer = document.getElementById("ui-layer");

	game.init();
});
