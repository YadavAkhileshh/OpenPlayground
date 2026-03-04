
        const creditContainer = document.getElementById("credit-container");
if (creditContainer) {
	const creditDiv = document.createElement("div");
	creditDiv.className = "credit-text";
	creditDiv.innerText = "( CODE BY HL )";
	creditContainer.appendChild(creditDiv);
}

const AudioSys = {
	ctx: null,
	init: function () {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.ctx = new AudioContext();
	},
	playTone: function (freq, type, duration, vol = 0.1) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
		gain.gain.setValueAtTime(vol, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
		osc.connect(gain);
		gain.connect(this.ctx.destination);
		osc.start();
		osc.stop(this.ctx.currentTime + duration);
	},
	playShoot: function () {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "square";
		osc.frequency.setValueAtTime(150, this.ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
		gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
		osc.connect(gain);
		gain.connect(this.ctx.destination);
		osc.start();
		osc.stop(this.ctx.currentTime + 0.3);
	},
	playExplosion: function () {
		if (!this.ctx) return;
		const bufferSize = this.ctx.sampleRate * 0.5;
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;
		const gain = this.ctx.createGain();
		gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
		noise.connect(gain);
		gain.connect(this.ctx.destination);
		noise.start();
	}
};

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const uiP1 = document.getElementById("p1-health");
const uiP1Angle = document.getElementById("p1-angle");
const uiP1Weapon = document.getElementById("p1-weapon");
const uiP1Power = document.getElementById("p1-power-bar");
const uiP2 = document.getElementById("p2-health");
const uiP2Angle = document.getElementById("p2-angle");
const uiP2Power = document.getElementById("p2-power-bar");
const uiWindText = document.getElementById("wind-text");
const uiWindArrow = document.getElementById("wind-arrow");
const uiTurn = document.getElementById("turn-indicator");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const winnerText = document.getElementById("winnerText");
const godAlert = document.getElementById("god-alert");
const btnVsCpu = document.getElementById("btn-vs-cpu");
const btnVsP2 = document.getElementById("btn-vs-p2");

const C64 = {
	BLACK: "#000000",
	WHITE: "#FFFFFF",
	RED: "#880000",
	CYAN: "#AAFFEE",
	PURPLE: "#CC44CC",
	GREEN: "#00CC55",
	BLUE: "#0000AA",
	YELLOW: "#EEEE77",
	ORANGE: "#DD8855",
	BROWN: "#664400",
	LIGHTRED: "#FF7777",
	DARKGREY: "#333333",
	GREY: "#777777",
	LIGHTGREEN: "#AAFF66",
	LIGHTBLUE: "#0088FF",
	LIGHTGREY: "#BBBBBB"
};

let width, height;
let gameState = "START";
let gameMode = "1P";
let terrain = [];
let particles = [];
let dustParticles = [];
let projectile = null;
let turn = "PLAYER";
let wind = 0;
let explosionRadius = 40;
let godMode = false;
let screenShake = 0;
let turnLocked = false;

const cheatSequence = ["KeyC", "KeyO", "KeyD", "KeyE", "KeyH", "KeyL"];
let cheatIndex = 0;

const player = {
	x: 100,
	y: 0,
	angle: 45,
	power: 50,
	health: 100,
	color: C64.LIGHTBLUE,
	weapon: 1,
	shakeTimer: 0
};

const enemy = {
	x: 0,
	y: 0,
	angle: 135,
	power: 50,
	health: 100,
	color: C64.LIGHTRED,
	aiTimer: 0,
	aiState: "IDLE",
	targetAngle: 135,
	weapon: 1,
	shakeTimer: 0
};

const keys = {};
const p2Keys = {};

window.addEventListener("keydown", (e) => {
	keys[e.code] = true;
	p2Keys[e.code] = true;

	if (e.code === cheatSequence[cheatIndex]) {
		cheatIndex++;
		if (cheatIndex === cheatSequence.length) {
			toggleGodMode();
			cheatIndex = 0;
		}
	} else {
		if (e.code !== cheatSequence[0]) cheatIndex = 0;
	}

	if (gameState === "START") {
		if (e.code === "Digit1") {
			gameMode = "1P";
			startGame();
		}
		if (e.code === "Digit2") {
			gameMode = "2P";
			startGame();
		}
	}

	if (gameState === "END" && e.code === "Enter") startGame();

	if (gameState === "PLAY") {
		if (turn === "PLAYER" && !projectile && !turnLocked) {
			if (e.code === "Space") fireProjectile(player);
			if (e.code === "Digit1") setPlayerWeapon(1);
			if (e.code === "Digit2") setPlayerWeapon(2);
			if (e.code === "Digit3") setPlayerWeapon(3);
		}
		if (turn === "ENEMY" && !projectile && !turnLocked && gameMode === "2P") {
			if (e.code === "ShiftLeft") fireProjectile(enemy);
			if (e.code === "KeyQ") setEnemyWeapon(1);
			if (e.code === "KeyR") setEnemyWeapon(2);
			if (e.code === "KeyF") setEnemyWeapon(3);
		}
	}
});

window.addEventListener("keyup", (e) => {
	keys[e.code] = false;
	p2Keys[e.code] = false;
});

window.addEventListener("fullscreenchange", () => {
	if (!document.fullscreenElement) {
		document.body.style.cursor = "auto";
	} else {
		if (gameState === "PLAY") {
			document.body.style.cursor = "none";
		}
	}
});

window.addEventListener("orientationchange", () => {
	setTimeout(resize, 100);
});

function setPlayerWeapon(id) {
	player.weapon = id;
	updateMobileWeaponUI();
}

function setEnemyWeapon(id) {
	enemy.weapon = id;
}

function updateMobileWeaponUI() {
	const b1 = document.getElementById("btn-1");
	const b2 = document.getElementById("btn-2");
	const b3 = document.getElementById("btn-3");
	if (b1) b1.classList.toggle("active", player.weapon === 1);
	if (b2) b2.classList.toggle("active", player.weapon === 2);
	if (b3) b3.classList.toggle("active", player.weapon === 3);
}

function toggleGodMode() {
	godMode = !godMode;
	godAlert.innerText = godMode ? "GOD MODE: ON" : "GOD MODE: OFF";
	godAlert.style.color = godMode ? "#FFD700" : "#AAA";
	godAlert.style.display = "block";
	godAlert.style.animation = "none";
	godAlert.offsetHeight;
	godAlert.style.animation = "godPop 2s ease-out forwards";

	if (godMode) AudioSys.playTone(600, "square", 0.1, 0.1);
	else AudioSys.playTone(300, "square", 0.1, 0.1);
}

function resize() {
	width = window.innerWidth;
	height = window.innerHeight;
	canvas.width = width;
	canvas.height = height;
	if (terrain.length === 0) generateTerrain();
}
window.addEventListener("resize", resize);
resize();

function generateTerrain() {
	terrain = new Float32Array(width);
	let y = height * 0.75;
	let slope = 0;
	for (let x = 0; x < width; x++) {
		slope += (Math.random() - 0.5) * 1.5;
		if (slope > 2) slope = 2;
		if (slope < -2) slope = -2;
		y += slope;
		if (y > height - 40) {
			y = height - 40;
			slope = -Math.abs(slope);
		}
		if (y < height * 0.45) {
			y = height * 0.45;
			slope = Math.abs(slope);
		}
		terrain[x] = y;
	}
	placeTanks();
}

function placeTanks() {
	player.x = Math.floor(width * 0.15);
	player.y = getTerrainHeight(player.x);
	player.angle = 45;
	player.health = 100;
	player.weapon = 1;
	player.shakeTimer = 0;

	enemy.x = Math.floor(width * 0.85);
	enemy.y = getTerrainHeight(enemy.x);
	enemy.angle = 135;
	enemy.health = 100;
	enemy.weapon = 1;
	enemy.aiState = "IDLE";
	enemy.shakeTimer = 0;

	updateMobileWeaponUI();
}

function getTerrainHeight(x) {
	if (x < 0) return terrain[0];
	if (x >= width) return terrain[width - 1];
	return terrain[Math.floor(x)];
}

function startGame() {
	AudioSys.init();

	gameState = "PLAY";
	startScreen.style.display = "none";
	gameOverScreen.style.display = "none";

	document.body.style.cursor = "none";

	generateTerrain();
	turn = "PLAYER";
	wind = (Math.random() - 0.5) * 5;
	particles = [];
	dustParticles = [];
	projectile = null;
	screenShake = 0;
	turnLocked = false;
	updateHUD();
}

function spawnBigExplosion(x, y, color) {
	AudioSys.playExplosion();
	screenShake = 15;

	for (let k = 0; k < 250; k++) {
		let angle = Math.random() * Math.PI * 2;
		let speed = Math.random() * 14 + 2;
		particles.push({
			x: x,
			y: y,
			life: 70 + Math.random() * 30,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			color:
				Math.random() > 0.6 ? color : Math.random() > 0.5 ? C64.YELLOW : C64.WHITE,
			size: Math.random() * 6 + 2
		});
	}
}

function update() {
	if (gameState !== "PLAY") return;

	if (turn === "PLAYER" && !projectile && !turnLocked) {
		if (keys["ArrowUp"]) player.power = Math.min(100, player.power + 0.5);
		if (keys["ArrowDown"]) player.power = Math.max(0, player.power - 0.5);
		if (keys["ArrowLeft"])
			player.angle = Math.min(175, Math.max(5, player.angle + 1));
		if (keys["ArrowRight"])
			player.angle = Math.min(175, Math.max(5, player.angle - 1));
	}

	if (turn === "ENEMY" && !projectile && !turnLocked && gameMode === "2P") {
		if (p2Keys["KeyW"]) enemy.power = Math.min(100, enemy.power + 0.5);
		if (p2Keys["KeyS"]) enemy.power = Math.max(0, enemy.power - 0.5);
		if (p2Keys["KeyA"]) enemy.angle = Math.min(175, Math.max(5, enemy.angle + 1));
		if (p2Keys["KeyD"]) enemy.angle = Math.min(175, Math.max(5, enemy.angle - 1));
	}

	if (projectile) {
		const steps = 4;
		let hit = false;

		for (let s = 0; s < steps; s++) {
			if (hit) break;

			projectile.x += projectile.vx / steps;
			projectile.y += projectile.vy / steps;
			projectile.vy += projectile.gravity / steps;
			projectile.vx += (wind * 0.003) / steps;

			if (Math.random() > 0.8)
				particles.push({
					x: projectile.x,
					y: projectile.y,
					life: 10,
					color: C64.GREY,
					vx: 0,
					vy: 0,
					size: 2
				});

			if (
				projectile.x < -50 ||
				projectile.x > width + 50 ||
				projectile.y > height + 50
			) {
				handleImpact();
				hit = true;
				break;
			} else if (projectile.y >= getTerrainHeight(projectile.x)) {
				explode(projectile.x, projectile.y);
				handleImpact();
				hit = true;
				break;
			}
		}
	}

	applyTankPhysics(player);
	applyTankPhysics(enemy);

	for (let i = particles.length - 1; i >= 0; i--) {
		let p = particles[i];
		p.life--;
		p.x += p.vx;
		p.y += p.vy;
		if (p.size > 2) p.vy += 0.25;
		if (p.life <= 0) particles.splice(i, 1);
	}

	if (turn === "ENEMY" && !projectile && !turnLocked && gameMode === "1P") {
		if (enemy.aiState === "IDLE") {
			enemy.aiState = "THINKING";
			enemy.aiTimer = 50;

			const weapons = {
				1: { radius: 40, powerMult: 1.0, grav: 0.18, speedMult: 1.0, step: 2 },
				2: { radius: 120, powerMult: 0.8, grav: 0.22, speedMult: 0.8, step: 2 },
				3: { radius: 20, powerMult: 1.8, grav: 0.14, speedMult: 1.8, step: 1 }
			};

			let globalBestScore = -Infinity;
			let globalBestWeapon = 1;
			let globalBestAngle = 135;
			let globalBestPower = 50;

			for (let w in weapons) {
				const cfg = weapons[w];
				let bestAngleForWeapon = enemy.angle;
				let minDistForWeapon = Infinity;

				let targetPower = 50 + Math.random() * 30;

				for (let a = 15; a < 165; a += cfg.step) {
					let simX = enemy.x;
					let simY = enemy.y - 10;
					let rad = (a * Math.PI) / 180;

					let vel = targetPower * 0.28;
					let vx = Math.cos(-rad) * vel * cfg.speedMult;
					let vy = Math.sin(-rad) * vel * cfg.speedMult;

					let hit = false;
					for (let s = 0; s < 250; s++) {
						simX += vx;
						simY += vy;
						vy += cfg.grav;
						vx += wind * 0.003;
						if (simY >= getTerrainHeight(simX)) {
							hit = true;
							break;
						}
						if (simX < 0 || simX > width) break;
					}

					if (hit) {
						let dist = Math.abs(simX - player.x);
						if (dist < minDistForWeapon) {
							minDistForWeapon = dist;
							bestAngleForWeapon = a;
						}
					}
				}

				let score = cfg.radius - minDistForWeapon;

				if (minDistForWeapon < 20) {
					if (w == 3) score *= 3.0;
					if (w == 1) score *= 1.0;
					if (w == 2) score *= 0.5;
				} else if (minDistForWeapon > 60) {
					if (w == 2) score *= 2.0;
					if (w == 1) score *= 1.5;
					if (w == 3) score *= 0.2;
				}

				if (score > globalBestScore) {
					globalBestScore = score;
					globalBestWeapon = parseInt(w);
					globalBestAngle = bestAngleForWeapon;
					globalBestPower = targetPower;
				}
			}

			enemy.weapon = globalBestWeapon;
			enemy.targetAngle = globalBestAngle + (Math.random() * 4 - 2);
			enemy.power = globalBestPower;

			enemy.targetAngle = Math.min(175, Math.max(5, enemy.targetAngle));

			uiTurn.innerText = "ENEMY CALCULATING...";
			uiTurn.style.color = C64.LIGHTRED;
		} else if (enemy.aiState === "THINKING") {
			enemy.aiTimer--;
			if (enemy.aiTimer <= 0) {
				enemy.aiState = "AIMING";
				uiTurn.innerText = "ENEMY AIMING...";
			}
		} else if (enemy.aiState === "AIMING") {
			let diff = enemy.targetAngle - enemy.angle;
			if (Math.abs(diff) < 0.5) {
				enemy.angle = enemy.targetAngle;
				fireProjectile(enemy);
				enemy.aiState = "DONE";
			} else {
				let rotationSpeed = Math.max(0.5, Math.min(3, Math.abs(diff) * 0.05));
				if (diff > 0) enemy.angle += rotationSpeed;
				else enemy.angle -= rotationSpeed;
			}
		}
	}

	if (screenShake > 0) screenShake *= 0.9;
	if (screenShake < 0.5) screenShake = 0;

	updateHUD();
}

function updateTerrain() {
	let changed = false;
	for (let x = 1; x < width - 1; x++) {
		let slope =
			(terrain[x - 1] - terrain[x]) * 0.3 + (terrain[x + 1] - terrain[x]) * 0.3;
		if (Math.abs(slope) > 0.5) {
			terrain[x] += slope;
			changed = true;
		}
	}
	if (changed) {
		applyTankPhysics(player);
		applyTankPhysics(enemy);
	}
}

function applyTankPhysics(tank) {
	let groundY = getTerrainHeight(tank.x);

	if (tank.y > height + 20) {
		if (tank.health > 0) {
			tank.health = 0;
			spawnBigExplosion(tank.x, tank.y, tank.color);
			endGame(tank === player ? "ENEMY" : "PLAYER");
		}
		return;
	}

	if (tank.y < groundY - 10) tank.y += 8;
	else tank.y = groundY;
}

function fireProjectile(actor) {
	AudioSys.playShoot();
	const rad = (actor.angle * Math.PI) / 180;
	const vel = actor.power * 0.28;

	let weaponMult = 1.0;
	let weaponGrav = 0.18;
	let radius = 40;

	if (actor.weapon === 2) {
		weaponMult = 0.8;
		weaponGrav = 0.22;
		radius = 120;
	} else if (actor.weapon === 3) {
		weaponMult = 1.8;
		weaponGrav = 0.14;
		radius = 20;
	}

	projectile = {
		x: actor.x,
		y: actor.y - 12,
		vx: Math.cos(-rad) * vel * weaponMult,
		vy: Math.sin(-rad) * vel * weaponMult,
		owner: actor,
		gravity: weaponGrav,
		radius: radius,
		weapon: actor.weapon
	};
}

function handleImpact() {
	projectile = null;
	turnLocked = true;
	setTimeout(nextTurn, 1000);
}

function explode(x, y) {
	AudioSys.playExplosion();
	screenShake = 10;
	x = Math.floor(x);
	const r = projectile.radius;

	for (let i = -r; i <= r; i++) {
		let tx = x + i;
		if (tx >= 0 && tx < width) {
			let dy = Math.sqrt(r * r - i * i);
			terrain[tx] += dy;
		}
	}

	let debrisCount = 50;
	if (projectile.weapon === 2) debrisCount = 100;
	if (projectile.weapon === 3) debrisCount = 20;

	for (let k = 0; k < debrisCount; k++) {
		particles.push({
			x: x,
			y: y,
			life: 40 + Math.random() * 20,
			vx: (Math.random() - 0.5) * 8,
			vy: (Math.random() - 0.5) * 8,
			color: Math.random() > 0.5 ? C64.YELLOW : C64.RED,
			size: 4
		});
	}
	checkDamage(player, x, y);
	checkDamage(enemy, x, y);
}

function checkDamage(tank, ex, ey) {
	if (godMode && tank === player) return;
	const dx = tank.x - ex;
	const dy = tank.y - ey;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist < projectile.radius + 10) {
		let dmg = Math.floor((1 - dist / (projectile.radius + 20)) * 80);
		if (projectile.weapon === 3) dmg *= 0.8;
		tank.health -= dmg;

		tank.shakeTimer = 15;

		if (tank.health <= 0) {
			tank.health = 0;
			spawnBigExplosion(tank.x, tank.y, tank.color);
			endGame(tank === player ? "ENEMY" : "PLAYER");
		}
	}
}

function nextTurn() {
	if (gameState === "END") return;

	turnLocked = false;

	wind += (Math.random() - 0.5) * 3;
	wind = Math.max(-8, Math.min(8, wind));

	turn = turn === "PLAYER" ? "ENEMY" : "PLAYER";

	if (gameMode === "1P") {
		if (turn === "ENEMY") {
			enemy.aiState = "IDLE";
		} else {
			uiTurn.innerText = "YOUR TURN";
			uiTurn.style.color = C64.LIGHTGREEN;
		}
	} else {
		uiTurn.innerText = turn === "PLAYER" ? "PLAYER 1 TURN" : "PLAYER 2 TURN";
		uiTurn.style.color = C64.LIGHTGREEN;
	}
}

function endGame(winner) {
	gameState = "END";
	gameOverScreen.style.display = "flex";

	let winnerName = winner === "PLAYER" ? "PLAYER 1" : "PLAYER 2";
	winnerText.innerText = winnerName + " WINS!";
	winnerText.style.color = winner === "PLAYER" ? C64.LIGHTGREEN : C64.LIGHTRED;

	document.body.style.cursor = "auto";
}

function updateHUD() {
	uiP1.innerText = `HEALTH: ${player.health}%`;
	uiP1.style.color = godMode && player.health > 0 ? "#FFD700" : "#5ce1e6";

	uiP1Angle.innerText = `ANGLE: ${Math.floor(player.angle)}°`;
	uiP1Power.style.width = `${player.power}%`;
	uiP1Power.style.backgroundColor = player.power > 80 ? C64.RED : C64.LIGHTBLUE;

	let wName = "STANDARD";
	if (player.weapon === 2) wName = "NUKE";
	if (player.weapon === 3) wName = "SNIPER";
	uiP1Weapon.innerText = `WEAPON: ${player.weapon} (${wName})`;

	uiP2.innerText = `HEALTH: ${enemy.health}%`;
	uiP2Angle.innerText = `ANGLE: ${Math.floor(enemy.angle)}°`;
	uiP2Power.style.width = `${enemy.power}%`;

	uiWindText.innerText = `WIND ${Math.abs(wind).toFixed(1)}`;
	uiWindArrow.style.transform = wind > 0 ? "rotate(0deg)" : "rotate(180deg)";
	uiWindArrow.style.color = Math.abs(wind) > 6 ? C64.RED : C64.GREY;
}

function draw() {
	ctx.save();
	if (screenShake > 0) {
		let dx = (Math.random() - 0.5) * screenShake;
		let dy = (Math.random() - 0.5) * screenShake;
		ctx.translate(dx, dy);
	}

	let grad = ctx.createLinearGradient(0, 0, 0, height);
	grad.addColorStop(0, C64.BLACK);
	grad.addColorStop(0.4, C64.BLUE);
	grad.addColorStop(1, "#000022");
	ctx.fillStyle = grad;
	ctx.fillRect(-10, -10, width + 20, height + 20);

	ctx.fillStyle = C64.GREEN;
	ctx.beginPath();
	ctx.moveTo(0, height);
	for (let x = 0; x < width; x++) ctx.lineTo(x, terrain[x]);
	ctx.lineTo(width, height);
	ctx.fill();
	ctx.lineWidth = 3;
	ctx.strokeStyle = C64.LIGHTGREEN;
	ctx.stroke();

	if (player.health > 0) drawTank(player, C64.LIGHTBLUE);
	if (enemy.health > 0) drawTank(enemy, C64.LIGHTRED);

	if (projectile) {
		ctx.fillStyle = C64.WHITE;
		ctx.beginPath();
		ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 10;
		ctx.shadowColor = C64.WHITE;
		ctx.fill();
		ctx.shadowBlur = 0;
	}

	if (gameState === "PLAY" && turn === "PLAYER" && player.health > 0) {
		ctx.fillStyle = C64.GREY;
		let rad = (player.angle * Math.PI) / 180;
		let tipX = player.x + Math.cos(-rad) * 30;
		let tipY = player.y - 16 + Math.sin(-rad) * 30;

		ctx.beginPath();
		ctx.setLineDash([2, 4]);
		ctx.lineWidth = 2;
		ctx.strokeStyle = C64.GREY;
		ctx.moveTo(player.x, player.y - 16);
		ctx.lineTo(tipX, tipY);
		ctx.stroke();
		ctx.setLineDash([]);
	}

	if (
		gameState === "PLAY" &&
		turn === "ENEMY" &&
		enemy.health > 0 &&
		gameMode === "2P"
	) {
		ctx.fillStyle = C64.GREY;
		let rad = (enemy.angle * Math.PI) / 180;
		let tipX = enemy.x + Math.cos(-rad) * 30;
		let tipY = enemy.y - 16 + Math.sin(-rad) * 30;

		ctx.beginPath();
		ctx.setLineDash([2, 4]);
		ctx.lineWidth = 2;
		ctx.strokeStyle = C64.GREY;
		ctx.moveTo(enemy.x, enemy.y - 16);
		ctx.lineTo(tipX, tipY);
		ctx.stroke();
		ctx.setLineDash([]);
	}

	particles.forEach((p) => {
		ctx.fillStyle = p.color;
		let s = p.size || 3;
		ctx.fillRect(p.x, p.y, s, s);
	});

	if (gameState === "PLAY" && !projectile) {
		let activeTank = turn === "PLAYER" ? player : enemy;
		if (activeTank.health > 0) {
			ctx.fillStyle = C64.YELLOW;
			ctx.beginPath();
			let tipY = activeTank.y - 35;
			if (Math.floor(Date.now() / 200) % 2 === 0) {
				ctx.moveTo(activeTank.x, tipY);
				ctx.lineTo(activeTank.x - 5, tipY - 5);
				ctx.lineTo(activeTank.x + 5, tipY - 5);
				ctx.fill();
			}
		}
	}

	ctx.restore();
	requestAnimationFrame(draw);
}

function drawTank(tank, color) {
	let x = tank.x;
	let y = tank.y;

	ctx.save();

	if (tank.shakeTimer > 0) {
		let sx = (Math.random() - 0.5) * 6;
		let sy = (Math.random() - 0.5) * 6;
		ctx.translate(sx, sy);
		tank.shakeTimer--;
	}

	ctx.fillStyle = "rgba(0,0,0,0.5)";
	ctx.fillRect(x - 12, y - 4, 24, 4);

	ctx.fillStyle = C64.DARKGREY;
	ctx.fillRect(x - 12, y - 8, 24, 6);
	ctx.fillStyle = C64.GREY;
	for (let i = -10; i < 12; i += 4) ctx.fillRect(x + i, y - 8, 2, 6);

	ctx.fillStyle = color;
	ctx.fillRect(x - 8, y - 14, 16, 8);
	ctx.fillStyle = "rgba(0,0,0,0.2)";
	ctx.fillRect(x - 8, y - 10, 16, 2);

	ctx.fillStyle = color;
	ctx.fillRect(x - 4, y - 18, 8, 6);

	ctx.save();
	ctx.translate(x, y - 16);
	ctx.rotate((-tank.angle * Math.PI) / 180);
	ctx.fillStyle = C64.GREY;
	ctx.fillRect(0, -2, 14, 4);

	if (turn === tank.color) {
		let pwrW = (tank.power / 100) * 4;
		ctx.fillStyle = tank.power > 80 ? C64.RED : C64.LIGHTGREEN;
		ctx.fillRect(14, -1, pwrW, 2);
	}
	ctx.restore();

	ctx.restore();
}

setInterval(update, 1000 / 60);
requestAnimationFrame(draw);

const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnFire = document.getElementById("btn-fire");
const btn1 = document.getElementById("btn-1");
const btn2 = document.getElementById("btn-2");
const btn3 = document.getElementById("btn-3");

if (btnVsCpu && btnVsP2) {
	btnVsCpu.addEventListener("click", () => {
		gameMode = "1P";
		startGame();
	});

	btnVsP2.addEventListener("click", () => {
		gameMode = "2P";
		startGame();
	});
}

if (btnLeft && btnRight && btnFire) {
	const handleLeftDown = (e) => {
		e.preventDefault();
		keys["ArrowLeft"] = true;
	};
	const handleLeftUp = (e) => {
		e.preventDefault();
		keys["ArrowLeft"] = false;
	};
	btnLeft.addEventListener("touchstart", handleLeftDown, { passive: false });
	btnLeft.addEventListener("touchend", handleLeftUp);
	btnLeft.addEventListener("mousedown", handleLeftDown);
	btnLeft.addEventListener("mouseup", handleLeftUp);

	const handleRightDown = (e) => {
		e.preventDefault();
		keys["ArrowRight"] = true;
	};
	const handleRightUp = (e) => {
		e.preventDefault();
		keys["ArrowRight"] = false;
	};
	btnRight.addEventListener("touchstart", handleRightDown, { passive: false });
	btnRight.addEventListener("touchend", handleRightUp);
	btnRight.addEventListener("mousedown", handleRightDown);
	btnRight.addEventListener("mouseup", handleRightUp);

	const handleFireDown = (e) => {
		e.preventDefault();
		if (gameState === "PLAY" && turn === "PLAYER" && !projectile && !turnLocked) {
			fireProjectile(player);
		}
	};
	btnFire.addEventListener("touchstart", handleFireDown, { passive: false });
	btnFire.addEventListener("mousedown", handleFireDown);

	const handleWeapon1 = (e) => {
		e.preventDefault();
		setPlayerWeapon(1);
	};
	const handleWeapon2 = (e) => {
		e.preventDefault();
		setPlayerWeapon(2);
	};
	const handleWeapon3 = (e) => {
		e.preventDefault();
		setPlayerWeapon(3);
	};

	btn1.addEventListener("touchstart", handleWeapon1, { passive: false });
	btn1.addEventListener("mousedown", handleWeapon1);

	btn2.addEventListener("touchstart", handleWeapon2, { passive: false });
	btn2.addEventListener("mousedown", handleWeapon2);

	btn3.addEventListener("touchstart", handleWeapon3, { passive: false });
	btn3.addEventListener("mousedown", handleWeapon3);
}
