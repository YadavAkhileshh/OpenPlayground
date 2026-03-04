const audio = {
	ctx: null,
	muted: false,
	init: function () {
		if (!this.ctx) {
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			this.ctx = new AudioContext();
		}
	},
	toggleMute: function () {
		this.muted = !this.muted;
		const btn = document.getElementById("audio-btn");
		if (btn) {
			if (this.muted) {
				btn.innerText = "AUDIO: OFF";
				btn.style.color = "#FF7777";
			} else {
				btn.innerText = "AUDIO: ON";
				btn.style.color = "#fff";
			}
		}
	},
	playTone: function (freq, type, duration, vol = 0.1) {
		if (this.muted || !this.ctx) return;
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
	playMove: function () {
		this.playTone(200, "square", 0.1, 0.05);
	},
	playPush: function () {
		this.playTone(100, "sawtooth", 0.15, 0.08);
	},
	playWin: function () {
		this.playTone(440, "square", 0.1);
		setTimeout(() => this.playTone(554, "square", 0.1), 100);
		setTimeout(() => this.playTone(659, "square", 0.2), 200);
	},
	playError: function () {
		this.playTone(60, "sawtooth", 0.2, 0.1);
	}
};

const levels = [
	[
		"########",
		"#      #",
		"#      #",
		"# $  $ #",
		"# .  . #",
		"#@     #",
		"########"
	],
	[
		"########",
		"###   ##",
		"#.$  ###",
		"## $  ##",
		"# #  ###",
		"# . .###",
		"## # ###",
		"#  $  ##",
		"##  @ ##",
		"########"
	],
	[
		"########",
		"#  #   #",
		"# $ #  #",
		"#  . $.#",
		"# $ # .#",
		"#. # $##",
		"## @   #",
		"########"
	],
	[
		"########",
		"###   ##",
		"# $ # ##",
		"# #  . #",
		"#    $ #",
		"## . # #",
		"#  $####",
		"#.@ ####",
		"########"
	],
	[
		"########",
		"###  ###",
		"# $  ###",
		"# .#  ##",
		"# $ # ##",
		"# .#  ##",
		"#  $ ###",
		"## @.###",
		"########"
	]
];

class Game {
	constructor() {
		this.currentLevelIdx = 0;
		this.grid = [];
		this.playerPos = { x: 0, y: 0 };
		this.moves = 0;
		this.history = [];
		this.gridElement = document.getElementById("grid");
		this.movesDisplay = document.getElementById("moves-display");
		this.levelDisplay = document.getElementById("level-display");
		this.screenContainer = document.getElementById("screen-container");
		this.lastInputTime = 0;
		this.INPUT_COOLDOWN = 200;
		this.decryptCredits();
		this.setupInputs();
	}

	decryptCredits() {
		const target = document.getElementById("credit-line");
		if (target) {
			const cipher = "KCCDT0RFIGJ5IEhMICk=";
			target.innerHTML = atob(cipher) + target.innerHTML;
		}
	}

	startFullScreen() {
		this.start();
		const docElm = document.documentElement;
		if (docElm.requestFullscreen) {
			docElm.requestFullscreen().catch(() => {});
		} else if (docElm.webkitRequestFullscreen) {
			docElm.webkitRequestFullscreen();
		} else if (docElm.msRequestFullscreen) {
			docElm.msRequestFullscreen();
		}
	}

	start() {
		audio.init();
		document.getElementById("start-screen").classList.remove("active");
		this.loadLevel(0);
	}

	loadLevel(index) {
		this.currentLevelIdx = index;
		if (index >= levels.length) {
			this.showEndScreen();
			return;
		}

		this.moves = 0;
		this.history = [];
		this.updateMoves();
		this.levelDisplay.innerText = index + 1;
		document.getElementById("win-screen").classList.remove("active");
		document.getElementById("end-screen").classList.remove("active");

		const rawMap = levels[index];
		this.height = rawMap.length;
		this.width = rawMap.reduce((max, row) => Math.max(max, row.length), 0);

		this.grid = [];
		this.gridElement.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`;

		for (let y = 0; y < this.height; y++) {
			let row = [];
			for (let x = 0; x < this.width; x++) {
				let char = rawMap[y][x] || " ";
				let type = "floor";
				let hasBox = false;
				let isTarget = false;
				let isPlayer = false;

				if (char === "#") type = "wall";
				if (char === ".") isTarget = true;
				if (char === "$") hasBox = true;
				if (char === "*") {
					hasBox = true;
					isTarget = true;
				}
				if (char === "@") isPlayer = true;
				if (char === "+") {
					isPlayer = true;
					isTarget = true;
				}

				let tile = {
					type: type,
					isTarget: isTarget,
					hasBox: hasBox,
					isPlayer: isPlayer
				};

				if (isPlayer) this.playerPos = { x, y };
				row.push(tile);
			}
			this.grid.push(row);
		}
		this.render();
	}

	render() {
		this.gridElement.innerHTML = "";
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const data = this.grid[y][x];
				const div = document.createElement("div");
				div.classList.add("tile");

				if (data.type === "wall") div.classList.add("wall");
				else div.classList.add("floor");

				if (data.isTarget) div.classList.add("target");
				if (data.hasBox) div.classList.add("box");
				if (data.hasBox && data.isTarget) div.classList.add("on-target");
				if (data.isPlayer) div.classList.add("player");

				this.gridElement.appendChild(div);
			}
		}
	}

	handleInput(key) {
		const now = Date.now();
		if (now - this.lastInputTime < this.INPUT_COOLDOWN) {
			return;
		}
		this.lastInputTime = now;

		let dx = 0,
			dy = 0;
		if (key === "ArrowUp" || key === "w") dy = -1;
		else if (key === "ArrowDown" || key === "s") dy = 1;
		else if (key === "ArrowLeft" || key === "a") dx = -1;
		else if (key === "ArrowRight" || key === "d") dx = 1;
		else return;

		this.tryMove(dx, dy);
	}

	setupInputs() {
		document.addEventListener("keydown", (e) => {
			const startScreen = document.getElementById("start-screen");
			const winScreen = document.getElementById("win-screen");
			const endScreen = document.getElementById("end-screen");

			if (e.key === "Enter" || e.key === " ") {
				if (startScreen.classList.contains("active")) {
					e.preventDefault();
					this.startFullScreen();
				} else if (winScreen.classList.contains("active")) {
					e.preventDefault();
					this.nextLevel();
				} else if (endScreen.classList.contains("active")) {
					e.preventDefault();
					this.restartFull();
				}
				return;
			}

			if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1)
				e.preventDefault();
			if (e.key === "z" || e.key === "Z") this.undo();
			if (e.key === "r" || e.key === "R") this.resetLevel();
			this.handleInput(e.key);
		});
	}

	tryMove(dx, dy) {
		const { x, y } = this.playerPos;
		const nx = x + dx,
			ny = y + dy;

		if (ny < 0 || ny >= this.height || nx < 0 || nx >= this.width) return;
		const targetTile = this.grid[ny][nx];

		if (targetTile.type === "wall") {
			audio.playError();
			this.triggerShake();
			return;
		}

		if (targetTile.hasBox) {
			const nnx = nx + dx,
				nny = ny + dy;
			if (
				nny < 0 ||
				nny >= this.height ||
				nnx < 0 ||
				nnx >= this.width ||
				this.grid[nny][nnx].type === "wall" ||
				this.grid[nny][nnx].hasBox
			) {
				audio.playError();
				this.triggerShake();
				return;
			}
			this.saveState();
			targetTile.hasBox = false;
			this.grid[nny][nnx].hasBox = true;
			audio.playPush();
		} else {
			this.saveState();
			audio.playMove();
		}

		this.grid[y][x].isPlayer = false;
		this.grid[ny][nx].isPlayer = true;
		this.playerPos = { x: nx, y: ny };
		this.moves++;
		this.updateMoves();
		this.render();
		this.checkWin();
	}

	triggerShake() {
		this.screenContainer.classList.remove("shake");
		void this.screenContainer.offsetWidth;
		this.screenContainer.classList.add("shake");
	}

	saveState() {
		const gridCopy = this.grid.map((row) => row.map((tile) => ({ ...tile })));
		const playerCopy = { ...this.playerPos };
		this.history.push({ grid: gridCopy, player: playerCopy, moves: this.moves });
		if (this.history.length > 50) this.history.shift();
	}

	undo() {
		if (this.history.length === 0) return;
		const lastState = this.history.pop();
		this.grid = lastState.grid;
		this.playerPos = lastState.player;
		this.moves = lastState.moves;
		this.updateMoves();
		this.render();
		audio.playMove();
	}

	resetLevel() {
		this.loadLevel(this.currentLevelIdx);
		audio.playError();
	}

	checkWin() {
		let allTargetsCovered = true;
		for (let row of this.grid) {
			for (let tile of row) {
				if (tile.isTarget && !tile.hasBox) allTargetsCovered = false;
			}
		}
		if (allTargetsCovered) {
			audio.playWin();
			setTimeout(() => {
				document.getElementById("final-moves").innerText = this.moves;
				document.getElementById("win-screen").classList.add("active");
			}, 300);
		}
	}

	nextLevel() {
		this.loadLevel(this.currentLevelIdx + 1);
	}

	restartFull() {
		this.currentLevelIdx = 0;
		this.moves = 0;
		this.history = [];
		this.loadLevel(0);
		audio.playWin();
	}

	showEndScreen() {
		document.getElementById("end-screen").classList.add("active");
	}
	updateMoves() {
		this.movesDisplay.innerText = this.moves;
	}
}

const game = new Game();
