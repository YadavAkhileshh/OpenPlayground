import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";

window.shareTwitter = () => {
	const shareUrl = "https://codepen.io/Julibe/full/yyOmddj";
	const viaUser = "Julibe";
	const scores = JSON.parse(
		localStorage.getItem("emoji_survivors_scores") || "[]"
	);
	const highScore = scores.length > 0 ? scores[0].score : 0;
	const text = `I scored ${highScore} points in Emoji Survivors: Infinite Realms! Can you beat my high score? 🏆 #EmojiSurvivors`;
	const hashtagsList = [
		"IndieDev",
		"ThreeJS",
		"WebGame",
		"Roguelike",
		"BulletHeaven",
		"Julibe",
		"JavaScript",
		"GameDev"
	];
	let selectedTags = hashtagsList
		.sort(() => 0.5 - Math.random())
		.slice(0, 4)
		.map((tag) => tag.replace(/\s+/g, ""));
	const hashtags = selectedTags.join(",");
	const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
		text
	)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(
		hashtags
	)}&via=${encodeURIComponent(viaUser)}`;
	window.open(twitterUrl, "_blank");
};

const CONFIG = { base_hp: 100, chunk_size: 40 };

const BIOMES = [
	{
		id: "forest",
		name: "Forest",
		emoji: "🌲",
		ground: "#112211",
		grid: "#1a331a",
		fog: 0x112211,
		light: 0xffffee,
		decor: ["🌲", "🌳", "🪨", "🍄", "🌿"],
		theme: {
			accent: "#ffcc00",
			bg: "rgba(20, 15, 10, 0.95)",
			font: "Cinzel"
		},
		sfx: "sawtooth",
		enemies: ["slime", "bat", "skeleton", "goblin"]
	},
	{
		id: "sea",
		name: "Abyss",
		emoji: "🌊",
		ground: "#001122",
		grid: "#002233",
		fog: 0x001122,
		light: 0x00aaff,
		decor: ["🪸", ".。o", "🫧", "⚓"],
		theme: {
			accent: "#00ffff",
			bg: "rgba(0, 20, 40, 0.95)",
			font: "Bangers"
		},
		sfx: "sine",
		enemies: ["shark", "puffer", "squid", "ufo"]
	},
	{
		id: "volcano",
		name: "Inferno",
		emoji: "🌋",
		ground: "#2b1111",
		grid: "#3d1a1a",
		fog: 0x2b1111,
		light: 0xffaa00,
		decor: ["🌋", "🔥", "🪨"],
		theme: {
			accent: "#ff4400",
			bg: "rgba(40, 10, 5, 0.95)",
			font: "Creepster"
		},
		sfx: "square",
		enemies: ["bat", "demon", "ghost", "dragon"]
	},
	{
		id: "snow",
		name: "Tundra",
		emoji: "⛄",
		ground: "#e0e0f0",
		grid: "#c0c0d0",
		fog: 0xe0e0f0,
		light: 0xaaccff,
		decor: ["⛄", "🌲", "❄️", "🧊", "🎄"],
		theme: {
			accent: "#00ccff",
			bg: "rgba(20, 30, 40, 0.95)",
			font: "Share Tech Mono"
		},
		sfx: "sine",
		enemies: ["wolf", "yeti", "ghost", "titan"]
	},
	{
		id: "desert",
		name: "Dunes",
		emoji: "🏜️",
		ground: "#c2b280",
		grid: "#b0a070",
		fog: 0xc2b280,
		light: 0xffddaa,
		decor: ["🌵", "🪨"],
		theme: { accent: "#ffaa00", bg: "rgba(50, 40, 20, 0.95)", font: "Rye" },
		sfx: "triangle",
		enemies: ["scorpion", "snake", "mummy", "titan"]
	},
	{
		id: "city",
		name: "Metro",
		emoji: "🌃",
		ground: "#1a1a1a",
		grid: "#2a2a2a",
		fog: 0x101010,
		light: 0x88ccff,
		decor: ["🏢", "🛑", "🚧", "🗑️"],
		theme: {
			accent: "#ff00ff",
			bg: "rgba(10, 10, 20, 0.95)",
			font: "Orbitron"
		},
		sfx: "sawtooth",
		enemies: ["rat", "robot", "slime", "demon"]
	},
	{
		id: "space",
		name: "Cosmos",
		emoji: "🌌",
		ground: "#050510",
		grid: "#101020",
		fog: 0x000000,
		light: 0xaa88ff,
		decor: ["🪐", "✨", "☄️", "🌑"],
		theme: {
			accent: "#00ff88",
			bg: "rgba(0, 5, 20, 0.95)",
			font: "Orbitron"
		},
		sfx: "sine",
		enemies: ["alien", "ufo", "robot", "ghost"]
	},
	{
		id: "beach",
		name: "Coast",
		emoji: "🏖️",
		ground: "#e0d080",
		grid: "#d0c070",
		fog: 0x87ceeb,
		light: 0xffffee,
		decor: ["🌴", "🐚", "⛱️", "🏝️"],
		theme: {
			accent: "#00aaff",
			bg: "rgba(20, 40, 50, 0.95)",
			font: "Permanent Marker"
		},
		sfx: "triangle",
		enemies: ["crab", "squid", "snake", "slime"]
	}
];

const HEROES = [
	{
		id: "super",
		name: "Captain",
		weapon: "ice",
		hp_mod: 1.3,
		spd: 0.25,
		m: "🦸🏻‍♂️",
		f: "🦸🏼‍♀️"
	},
	{
		id: "mage",
		name: "Sorcerer",
		weapon: "wand",
		hp_mod: 0.8,
		spd: 0.24,
		m: "🧙🏻‍♂️",
		f: "🧙🏻‍♀️"
	},
	{
		id: "rogue",
		name: "Rogue",
		weapon: "knife",
		hp_mod: 0.9,
		spd: 0.28,
		m: "🕵️‍♂️",
		f: "🕵🏼‍♀️"
	},
	{
		id: "royal",
		name: "Monarch",
		weapon: "garlic",
		hp_mod: 1.5,
		spd: 0.2,
		m: "🤴🏻",
		f: "👸🏼"
	},
	{
		id: "elf",
		name: "Ranger",
		weapon: "axe",
		hp_mod: 1.0,
		spd: 0.26,
		m: "🧝🏼‍♂️",
		f: "🧝🏼‍♀️"
	},
	{
		id: "ninja",
		name: "Ninja",
		weapon: "shuriken",
		hp_mod: 0.85,
		spd: 0.3,
		m: "🥷",
		f: "🥷"
	},
	{
		id: "viking",
		name: "Viking",
		weapon: "hammer",
		hp_mod: 1.4,
		spd: 0.21,
		m: "🧔",
		f: "🛡️"
	},
	{
		id: "cyborg",
		name: "Robot",
		weapon: "laser",
		hp_mod: 1.1,
		spd: 0.25,
		m: "🤖",
		f: "🤖"
	}
];

const WEAPONS = {
	sword: {
		id: "sword",
		name: "Excalibur",
		emoji: "⚔️",
		cooldown: 0.8,
		damage: 30,
		area: 1,
		type: "slash",
		speed: 0,
		color: 0xffffff
	},
	wand: {
		id: "wand",
		name: "Fireball",
		emoji: "🔥",
		cooldown: 0.5,
		damage: 25,
		speed: 0.7,
		type: "missile",
		color: 0xff4400
	},
	dagger: {
		id: "dagger",
		name: "Dagger",
		emoji: "🗡️",
		cooldown: 0.6,
		damage: 15,
		speed: 0.7,
		type: "linear",
		color: 0xaaaaaa
	},

	knife: {
		id: "knife",
		name: "Knifes",
		emoji: "🔪",
		cooldown: 0.2,
		damage: 25,
		speed: 1.0,
		type: "slash",
		color: 0xaaaaaa
	},
	axe: {
		id: "axe",
		name: "Battle Axe",
		emoji: "🪓",
		cooldown: 1.0,
		damage: 60,
		speed: 0.4,
		type: "lob",
		area: 2.0,
		color: 0x880000
	},
	garlic: {
		id: "garlic",
		name: "Holy Bolt",
		emoji: "✨",
		cooldown: 0.4,
		damage: 18,
		speed: 0.9,
		type: "missile",
		color: 0xffffaa
	},
	shuriken: {
		id: "shuriken",
		name: "Star",
		emoji: "⭐",
		cooldown: 0.15,
		damage: 12,
		speed: 1.2,
		type: "linear",
		color: 0x8888ff
	},
	hammer: {
		id: "hammer",
		name: "Mjolnir",
		emoji: "🔨",
		cooldown: 1.2,
		damage: 80,
		area: 2.5,
		type: "lob",
		color: 0xffee00
	},
	laser: {
		id: "laser",
		name: "Blaster",
		emoji: "🔴",
		cooldown: 0.3,
		damage: 22,
		speed: 1.5,
		type: "missile",
		color: 0xff0000
	},
	pistol: {
		id: "pistol",
		name: "Pistol",
		emoji: "🔫",
		cooldown: 0.5,
		damage: 20,
		speed: 1.0,
		type: "linear",
		color: 0x888888
	},
	bow: {
		id: "bow",
		name: "Bow",
		emoji: "🏹",
		cooldown: 0.7,
		damage: 28,
		speed: 1.2,
		type: "linear",
		color: 0x8b4513 // SaddleBrown
	},
	spear: {
		id: "spear",
		name: "Spear",
		emoji: "🔱",
		cooldown: 0.9,
		damage: 35,
		speed: 1.0,
		type: "linear",
		color: 0xa9a9a9 // DarkGray
	},
	boomerang: {
		id: "boomerang",
		name: "Boomerang",
		emoji: "🪃",
		cooldown: 1.1,
		damage: 40,
		speed: 0.8,
		type: "lob", // Can be a lob that returns
		color: 0xcd853f // Peru
	},
	ice: {
		id: "ice",
		name: "Freeze Ray",
		emoji: "❄️",
		cooldown: 0.2,
		damage: 10,
		speed: 0.5,
		type: "missile", // Short-range continuous damage
		color: 0x286a85 // OrangeRed
	}
};

const PASSIVES = {
	might: {
		id: "might",
		name: "Titan Gauntlet",
		emoji: "🥊",
		desc: "Damage +20%"
	},
	haste: {
		id: "haste",
		name: "Chronos Sand",
		emoji: "⏳",
		desc: "Cooldown -15%"
	},
	speed: {
		id: "speed",
		name: "Hermes Boots",
		emoji: "👢",
		desc: "Speed +15%"
	},
	area: { id: "area", name: "Cursed Ring", emoji: "💍", desc: "Area +25%" },
	armor: { id: "armor", name: "Dragon Scale", emoji: "🛡️", desc: "Armor +2" }
};

const MONSTERS = {
	slime: {
		name: "Slime",
		emoji: "🦠",
		hp: 15,
		spd: 0.08,
		dmg: 5,
		xp: 1,
		color: 0x00ff00
	},
	bat: {
		name: "Bat",
		emoji: "🦇",
		hp: 10,
		spd: 0.13,
		dmg: 8,
		xp: 2,
		color: 0x444444
	},
	skeleton: {
		name: "Skeleton",
		emoji: "💀",
		hp: 35,
		spd: 0.1,
		dmg: 12,
		xp: 3,
		color: 0xdddddd
	},
	goblin: {
		name: "Goblin",
		emoji: "👺",
		hp: 60,
		spd: 0.11,
		dmg: 15,
		xp: 4,
		color: 0x006600
	},
	ghost: {
		name: "Ghost",
		emoji: "👻",
		hp: 90,
		spd: 0.09,
		dmg: 20,
		xp: 8,
		color: 0xaaddff
	},
	demon: {
		name: "Demon",
		emoji: "👿",
		hp: 200,
		spd: 0.14,
		dmg: 30,
		xp: 15,
		color: 0xff0000
	},
	titan: {
		name: "Titan",
		emoji: "🗿",
		hp: 600,
		spd: 0.06,
		dmg: 50,
		xp: 50,
		color: 0xaaaaaa
	},
	dragon: {
		name: "Dragon",
		emoji: "🐉",
		hp: 1000,
		spd: 0.08,
		dmg: 60,
		xp: 100,
		color: 0xffaa00
	},
	wolf: {
		name: "Wolf",
		emoji: "🐺",
		hp: 45,
		spd: 0.18,
		dmg: 14,
		xp: 5,
		color: 0x999999
	},
	yeti: {
		name: "Yeti",
		emoji: "🦍",
		hp: 300,
		spd: 0.07,
		dmg: 40,
		xp: 25,
		color: 0xffffff
	},
	scorpion: {
		name: "Scorpion",
		emoji: "🦂",
		hp: 50,
		spd: 0.15,
		dmg: 18,
		xp: 6,
		color: 0xccaa00
	},
	snake: {
		name: "Snake",
		emoji: "🐍",
		hp: 30,
		spd: 0.12,
		dmg: 10,
		xp: 3,
		color: 0x00cc00
	},
	mummy: {
		name: "Mummy",
		emoji: "🤕",
		hp: 120,
		spd: 0.05,
		dmg: 25,
		xp: 10,
		color: 0xeeddcc
	},
	alien: {
		name: "Alien",
		emoji: "👽",
		hp: 80,
		spd: 0.12,
		dmg: 20,
		xp: 12,
		color: 0x00ff00
	},
	ufo: {
		name: "UFO",
		emoji: "🛸",
		hp: 150,
		spd: 0.16,
		dmg: 35,
		xp: 20,
		color: 0x888888
	},
	robot: {
		name: "Bot",
		emoji: "🤖",
		hp: 100,
		spd: 0.09,
		dmg: 15,
		xp: 8,
		color: 0xcccccc
	},
	rat: {
		name: "Rat",
		emoji: "🐀",
		hp: 20,
		spd: 0.14,
		dmg: 6,
		xp: 2,
		color: 0x555555
	},
	crab: {
		name: "Crab",
		emoji: "🦀",
		hp: 40,
		spd: 0.1,
		dmg: 10,
		xp: 4,
		color: 0xff5500
	},
	squid: {
		name: "Squid",
		emoji: "🦑",
		hp: 60,
		spd: 0.11,
		dmg: 12,
		xp: 6,
		color: 0xff8888
	},
	shark: {
		name: "Shark",
		emoji: "🦈",
		hp: 150,
		spd: 0.17,
		dmg: 25,
		xp: 15,
		color: 0x8888ff
	},
	puffer: {
		name: "Puffer",
		emoji: "🐡",
		hp: 30,
		spd: 0.09,
		dmg: 20,
		xp: 4,
		color: 0xffff00
	}
};

let scene, camera, renderer, clock, sfx_sys;
let texture_map = new Map();
let active = false,
	paused = false;
let total_time = 0;
let hit_stop_frames = 0;
let shake_intensity = 0;
let sel_gender = "male";
let sel_biome_idx = 0;
let current_biome = BIOMES[0];
let is_looping = false;

let drag_input = { active: false, start_x: 0, start_y: 0, dx: 0, dy: 0 };
const keys = {
	w: false,
	a: false,
	s: false,
	d: false,
	up: false,
	left: false,
	down: false,
	right: false
};
let gp_index = null;
let gp_nav = {
	active: false,
	elements: [],
	index: 0,
	last_move: 0,
	screen_id: null
};

window.addEventListener("keydown", (e) => {
	const k = e.key.toLowerCase();
	if (keys.hasOwnProperty(k)) keys[k] = true;
	if (e.code === "ArrowUp") keys.up = true;
	if (e.code === "ArrowDown") keys.down = true;
	if (e.code === "ArrowLeft") keys.left = true;
	if (e.code === "ArrowRight") keys.right = true;
	if (e.code === "Escape") togglePause();
});

window.addEventListener("keyup", (e) => {
	const k = e.key.toLowerCase();
	if (keys.hasOwnProperty(k)) keys[k] = false;
	if (e.code === "ArrowUp") keys.up = false;
	if (e.code === "ArrowDown") keys.down = false;
	if (e.code === "ArrowLeft") keys.left = false;
	if (e.code === "ArrowRight") keys.right = false;
});

window.addEventListener("gamepadconnected", (e) => {
	gp_index = e.gamepad.index;
	if (!active) requestAnimationFrame(uiLoop);
});

function onPointerDown(e) {
	if (!active || paused) return;
	const cx = e.touches ? e.touches[0].clientX : e.clientX;
	const cy = e.touches ? e.touches[0].clientY : e.clientY;
	drag_input.active = true;
	drag_input.start_x = cx;
	drag_input.start_y = cy;

	const marker = document.getElementById("drag_marker");
	marker.style.left = `${cx}px`;
	marker.style.top = `${cy}px`;
	marker.style.opacity = "0.6";
}

function onPointerMove(e) {
	if (!drag_input.active) return;
	const cx = e.touches ? e.touches[0].clientX : e.clientX;
	const cy = e.touches ? e.touches[0].clientY : e.clientY;

	const rdx = cx - drag_input.start_x;
	const rdy = cy - drag_input.start_y;
	const dst = Math.sqrt(rdx * rdx + rdy * rdy);

	if (dst > 0) {
		const pwr = Math.min(dst / 50, 1.0);
		drag_input.dx = (rdx / dst) * pwr;
		drag_input.dy = (rdy / dst) * pwr;
	}
}

function onPointerUp() {
	drag_input.active = false;
	drag_input.dx = 0;
	drag_input.dy = 0;
	document.getElementById("drag_marker").style.opacity = "0";
}

window.addEventListener("mousedown", onPointerDown);
window.addEventListener("mousemove", onPointerMove);
window.addEventListener("mouseup", onPointerUp);
window.addEventListener("touchstart", onPointerDown);
window.addEventListener("touchmove", onPointerMove);
window.addEventListener("touchend", onPointerUp);

let player,
	enemies = [],
	projectiles = [],
	items = [],
	particles = [],
	bloods = [];
let chunks = new Map();
let decor_pool = [];
let ground_plane;
let stats = {
	lvl: 1,
	xp: 0,
	next: 20,
	kills: 0,
	wave: 0,
	weps: [],
	pass: [],
	score: 0,
	name: "Unknown"
};
let last_hero_conf = null;

class SimpleSynth {
	constructor() {
		try {
			this.ctx = new (window.AudioContext || window.webkitAudioContext)();
			this.master = this.ctx.createGain();
			this.master.gain.value = 0.25;
			this.master.connect(this.ctx.destination);
		} catch (e) {
			console.warn("AudioContext not supported or blocked", e);
			this.ctx = null;
		}
	}
	resume() {
		if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
	}
	playTone(freq, type, duration, vol = 1, slide = 0) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
		if (slide !== 0) {
			osc.frequency.exponentialRampToValueAtTime(
				Math.max(10, freq + slide),
				this.ctx.currentTime + duration
			);
		}
		gain.gain.setValueAtTime(vol, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
		osc.connect(gain);
		gain.connect(this.master);
		osc.start();
		osc.stop(this.ctx.currentTime + duration);
	}
	playNoise(duration, vol = 1) {
		if (!this.ctx) return;
		const bufferSize = this.ctx.sampleRate * duration;
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}
		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;
		const gain = this.ctx.createGain();
		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 1000;
		gain.gain.setValueAtTime(vol, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
		noise.connect(filter);
		filter.connect(gain);
		gain.connect(this.master);
		noise.start();
	}
}

class GameSounds {
	constructor() {
		this.synth = new SimpleSynth();
	}
	sfxShoot() {
		this.synth.playTone(400, "square", 0.1, 0.2, -100);
	}
	sfxHit() {
		this.synth.playTone(150, "sawtooth", 0.1, 0.3, -50);
	}
	sfxExp() {
		this.synth.playNoise(0.3, 0.5);
	}
	sfxGem() {
		this.synth.playTone(1200, "sine", 0.15, 0.1);
	}
	sfxHeal() {
		this.synth.playTone(600, "sine", 0.3, 0.2, 200);
	}
	sfxLvl() {
		[440, 554, 659, 880].forEach((f, i) =>
			setTimeout(() => this.synth.playTone(f, "triangle", 0.4, 0.2), i * 100)
		);
	}
}

function resetGame() {
	active = false;
	paused = false;
	total_time = 0;
	enemies = [];
	projectiles = [];
	items = [];
	particles = [];
	bloods = [];
	hit_stop_frames = 0;
	shake_intensity = 0;
	stats = {
		lvl: 1,
		xp: 0,
		next: 20,
		kills: 0,
		wave: 0,
		weps: [],
		pass: [],
		score: 0,
		name: "Unknown"
	};
	chunks.forEach((chunk) => chunk.forEach((obj) => scene.remove(obj)));
	chunks.clear();
	decor_pool = [];
	document.getElementById("xp_bar_fill").style.width = "0%";
	document.getElementById("hp_bar_fill").style.width = "100%";
	document.getElementById("timer_display").innerText = "00:00";
	document.getElementById("score_display").innerText = "Score: 0";
	document.getElementById("player_label").innerText = "";
	document.getElementById("inventory").innerHTML = "";
	document.getElementById("gameover_screen").classList.add("hidden");
	document.getElementById("levelup_screen").classList.add("hidden");
	document.getElementById("pause_screen").classList.add("hidden");
	document.getElementById("btn_pause").style.display = "none";
}

function init() {
	resetGame();
	const container = document.getElementById("game_container");
	camera = new THREE.PerspectiveCamera(
		40,
		window.innerWidth / window.innerHeight,
		0.1,
		500
	);
	camera.position.set(0, 35, 40);
	camera.lookAt(0, 0, 0);
	scene = new THREE.Scene();
	scene.background = new THREE.Color(current_biome.fog);
	scene.fog = new THREE.Fog(current_biome.fog, 30, 90);
	if (!renderer) {
		renderer = new THREE.WebGLRenderer({
			antialias: false,
			powerPreference: "high-performance"
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		renderer.shadowMap.enabled = true;
		container.appendChild(renderer.domElement);
	}
	while (scene.children.length > 0) scene.remove(scene.children[0]);
	const hemi = new THREE.HemisphereLight(current_biome.light, 0x111111, 0.5);
	scene.add(hemi);
	const dirLight = new THREE.DirectionalLight(current_biome.light, 0.5);
	dirLight.position.set(10, 20, 10);
	dirLight.castShadow = true;
	scene.add(dirLight);
	const cvs = document.createElement("canvas");
	cvs.width = 128;
	cvs.height = 128;
	const ctx = cvs.getContext("2d");
	ctx.fillStyle = current_biome.ground;
	ctx.fillRect(0, 0, 128, 128);
	ctx.strokeStyle = current_biome.grid;
	ctx.lineWidth = 4;
	ctx.strokeRect(0, 0, 128, 128);
	const tex = new THREE.CanvasTexture(cvs);
	tex.wrapS = THREE.RepeatWrapping;
	tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set(50, 50);
	tex.magFilter = THREE.NearestFilter;
	ground_plane = new THREE.Mesh(
		new THREE.PlaneGeometry(300, 300),
		new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
	);
	ground_plane.rotation.x = -Math.PI / 2;
	ground_plane.receiveShadow = true;
	scene.add(ground_plane);
	renderer.render(scene, camera);
	clock = new THREE.Clock();
	if (!sfx_sys) sfx_sys = new GameSounds();
}

function getTex(emoji, size = 64) {
	const k = emoji + size;
	if (texture_map.has(k)) return texture_map.get(k);
	const cvs = document.createElement("canvas");
	cvs.width = size;
	cvs.height = size;
	const ctx = cvs.getContext("2d");
	ctx.font = `bold ${size * 0.8}px "Segoe UI Emoji"`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.shadowColor = "black";
	ctx.shadowBlur = 4;
	ctx.fillText(emoji, size / 2, size / 2 + size * 0.05);
	const tex = new THREE.CanvasTexture(cvs);
	tex.magFilter = THREE.NearestFilter;
	texture_map.set(k, tex);
	return tex;
}

function updateChunks(px, pz) {
	const cx = Math.floor(px / CONFIG.chunk_size);
	const cz = Math.floor(pz / CONFIG.chunk_size);
	const range = 2;
	for (let x = cx - range; x <= cx + range; x++) {
		for (let z = cz - range; z <= cz + range; z++) {
			const k = `${x},${z}`;
			if (!chunks.has(k)) generateChunk(x, z);
		}
	}
	for (let [k, objs] of chunks) {
		const [chkX, chkZ] = k.split(",").map(Number);
		if (Math.abs(chkX - cx) > range || Math.abs(chkZ - cz) > range) {
			objs.forEach((o) => scene.remove(o));
			chunks.delete(k);
		}
	}
}

function generateChunk(cx, cz) {
	const objs = [];
	const seed = Math.sin(cx * 123.45 + cz * 678.9);
	const count = 5 + Math.floor(Math.abs(seed) * 10);
	for (let i = 0; i < count; i++) {
		const lx = (Math.random() - 0.5) * CONFIG.chunk_size;
		const lz = (Math.random() - 0.5) * CONFIG.chunk_size;
		const wx = cx * CONFIG.chunk_size + lx;
		const wz = cz * CONFIG.chunk_size + lz;
		const list = current_biome.decor;
		const emoji = list[Math.floor(Math.random() * list.length)];
		const map = getTex(emoji);
		const mat = new THREE.SpriteMaterial({ map: map });
		const s = new THREE.Sprite(mat);
		s.position.set(wx, 1.5, wz);
		s.scale.set(4, 4, 1);
		scene.add(s);
		objs.push(s);
	}
	chunks.set(`${cx},${cz}`, objs);
}

function flashScreen() {
	const f = document.getElementById("white_flash");
	f.style.opacity = "0.15";
	setTimeout(() => (f.style.opacity = "0"), 50);
}

function spawnParticle(pos, color, count = 1, type = "spark") {
	for (let i = 0; i < count; i++) {
		const mat = new THREE.MeshBasicMaterial({
			color: color,
			transparent: true,
			blending: THREE.AdditiveBlending
		});
		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), mat);
		mesh.position.copy(pos);
		mesh.position.y = 0.5 + Math.random();
		mesh.lookAt(camera.position);
		const angle = Math.random() * Math.PI * 2;
		const speed = 0.2 + Math.random() * 0.4;
		const vel = new THREE.Vector3(
			Math.cos(angle) * speed,
			Math.random() * 0.3,
			Math.sin(angle) * speed
		);
		particles.push({
			mesh,
			vel,
			life: 1.0,
			decay: 0.03 + Math.random() * 0.03,
			type
		});
		scene.add(mesh);
	}
}

function spawnBlood(pos) {
	const mat = new THREE.MeshBasicMaterial({
		color: 0x8a0b0b,
		transparent: true,
		opacity: 0.8
	});
	const mesh = new THREE.Mesh(
		new THREE.CircleGeometry(0.4 + Math.random() * 0.4, 6),
		mat
	);
	mesh.rotation.x = -Math.PI / 2;
	mesh.position.copy(pos);
	mesh.position.y = 0.02;
	scene.add(mesh);
	bloods.push({ mesh, life: 1000 });
	if (bloods.length > 50) {
		const old = bloods.shift();
		scene.remove(old.mesh);
	}
}

function showDmg(x, z, val, crit = false, color = "#fff") {
	const div = document.createElement("div");
	div.className = "dmg-popup";
	div.innerText =
		typeof val === "number" ? Math.floor(val) + (crit ? "!" : "") : val;
	if (crit) {
		div.style.color = "#ff3333";
		div.style.fontSize = "3.5rem";
	}
	if (color !== "#fff") div.style.color = color;
	const v = new THREE.Vector3(x, 2, z).project(camera);
	const sx = (v.x * 0.5 + 0.5) * window.innerWidth;
	const sy = (-(v.y * 0.5) + 0.5) * window.innerHeight;
	div.style.left = sx + "px";
	div.style.top = sy + "px";
	document.getElementById("damage_layer").appendChild(div);
	setTimeout(() => div.remove(), 600);
}

class Entity {
	constructor(emoji, x, z, scale = 2.5) {
		this.mesh = new THREE.Group();
		this.mesh.position.set(x, 0, z);
		const map = getTex(emoji);
		const mat = new THREE.SpriteMaterial({ map: map });
		this.sprite = new THREE.Sprite(mat);
		this.sprite.position.y = 1.25;
		this.sprite.scale.set(scale, scale, 1);
		this.mesh.add(this.sprite);
		const smat = new THREE.MeshBasicMaterial({
			color: 0x000000,
			transparent: true,
			opacity: 0.5
		});
		const shadow = new THREE.Mesh(
			new THREE.CircleGeometry(scale * 0.3, 16),
			smat
		);
		shadow.rotation.x = -Math.PI / 2;
		shadow.position.y = 0.05;
		this.mesh.add(shadow);
		scene.add(this.mesh);
		this.active = true;
		this.kb = new THREE.Vector3();
	}
	kill() {
		scene.remove(this.mesh);
		this.active = false;
	}
}

class Player extends Entity {
	constructor(conf) {
		const emo = sel_gender === "male" ? conf.m : conf.f;
		super(emo, 0, 0, 3);
		this.conf = conf;
		this.stats = {
			hp: CONFIG.base_hp * conf.hp_mod,
			max: CONFIG.base_hp * conf.hp_mod,
			spd: conf.spd,
			might: 1,
			cd: 1,
			area: 1,
			armor: 0
		};
		this.light = new THREE.PointLight(current_biome.light, 1.5, 25);
		this.light.position.y = 4;
		this.mesh.add(this.light);
		this.addWep(conf.weapon);
	}
	addWep(id) {
		const base = WEAPONS[id];
		const conf = { ...base };
		stats.weps.push({ id, conf, timer: 0, lvl: 1 });
		updateInv();
	}
	update(dt, dx, dy) {
		const mx = dx * this.stats.spd;
		const mz = dy * this.stats.spd;
		this.mesh.position.x += mx;
		this.mesh.position.z += mz;
		this.mesh.position.add(this.kb);
		this.kb.multiplyScalar(0.85);
		camera.position.x += (this.mesh.position.x - camera.position.x) * 0.1;
		camera.position.z += (this.mesh.position.z + 30 - camera.position.z) * 0.1;
		camera.lookAt(this.mesh.position.x, 0, this.mesh.position.z - 5);
		if (ground_plane) {
			ground_plane.position.x = this.mesh.position.x;
			ground_plane.position.z = this.mesh.position.z;
			ground_plane.material.map.offset.set(
				this.mesh.position.x / 6,
				-this.mesh.position.z / 6
			);
		}
		updateChunks(this.mesh.position.x, this.mesh.position.z);
		if (shake_intensity > 0) {
			camera.position.x += (Math.random() - 0.5) * shake_intensity;
			camera.position.y = 35 + (Math.random() - 0.5) * shake_intensity;
			shake_intensity *= 0.9;
			if (shake_intensity < 0.1) shake_intensity = 0;
		}
		if (dx !== 0) this.sprite.scale.x = dx > 0 ? -3 : 3;
		stats.weps.forEach((w) => {
			w.timer -= dt;
			if (w.timer <= 0) {
				this.fire(w, dx, dy);
				w.timer = w.conf.cooldown * this.stats.cd;
			}
		});
	}
	fire(w, dx, dy) {
		const c = w.conf;
		const dmg = c.damage * this.stats.might;
		const nearest = getNearest(this.mesh.position);
		let dir = new THREE.Vector3(1, 0, 0);
		if (nearest)
			dir.subVectors(nearest.mesh.position, this.mesh.position).normalize();
		else if (dx !== 0 || dy !== 0) dir.set(dx, 0, dy).normalize();
		else dir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
		sfx_sys.sfxShoot();
		if (c.type === "missile" || c.type === "linear") {
			spawnProj(
				this.mesh.position,
				c.emoji,
				dmg,
				dir.multiplyScalar(c.speed),
				c.type,
				c.color
			);
		} else if (c.type === "lob") {
			const target = nearest
				? nearest.mesh.position.clone()
				: this.mesh.position.clone().add(dir.multiplyScalar(12));
			target.x += (Math.random() - 0.5) * 4;
			target.z += (Math.random() - 0.5) * 4;
			spawnProj(this.mesh.position, c.emoji, dmg, null, "lob", c.color, target);
		} else if (c.type === "slash") {
			spawnProj(this.mesh.position, "💥", dmg, dir, "slash", c.color);
		} else if (c.type === "aura") {
			spawnProj(this.mesh.position, "⭕", dmg, null, "aura", c.color);
		}
	}
	hurt(amt, srcPos) {
		const dmg = Math.max(1, amt - this.stats.armor);
		this.stats.hp -= dmg;
		sfx_sys.sfxHit();
		showDmg(this.mesh.position.x, this.mesh.position.z, dmg);
		shake_intensity = 0.5;
		flashScreen();
		if (srcPos) {
			const k = new THREE.Vector3()
				.subVectors(this.mesh.position, srcPos)
				.normalize()
				.multiplyScalar(1.5);
			this.kb.add(k);
		}
		document.getElementById("hp_bar_fill").style.width =
			(this.stats.hp / this.stats.max) * 100 + "%";
		if (this.stats.hp <= 0) gameOver();
	}
	heal(amt) {
		this.stats.hp = Math.min(this.stats.hp + amt, this.stats.max);
		showDmg(
			this.mesh.position.x,
			this.mesh.position.z,
			`+${amt}`,
			false,
			"#00ff88"
		);
		document.getElementById("hp_bar_fill").style.width =
			(this.stats.hp / this.stats.max) * 100 + "%";
	}
}

class Enemy extends Entity {
	constructor(conf, x, z) {
		super(conf.emoji, x, z, 2.8);
		this.conf = conf;
		const scaler = 1 + total_time / 180;
		this.hp = conf.hp * scaler;
		this.spd = conf.spd;
	}
	update() {
		if (!player) return;
		const dist = this.mesh.position.distanceTo(player.mesh.position);
		const dir = new THREE.Vector3()
			.subVectors(player.mesh.position, this.mesh.position)
			.normalize();
		this.mesh.position.add(dir.multiplyScalar(this.spd));
		this.mesh.position.add(this.kb);
		this.kb.multiplyScalar(0.85);
		if (dir.x !== 0) this.sprite.scale.x = dir.x > 0 ? -2.8 : 2.8;
		if (dist < 1.5) {
			player.hurt(this.conf.dmg, this.mesh.position);
			this.kb.add(dir.clone().multiplyScalar(-2.0));
		}
	}
	hit(dmg, knock_dir) {
		this.hp -= dmg;
		const crit = Math.random() < 0.1;
		showDmg(
			this.mesh.position.x,
			this.mesh.position.z,
			crit ? dmg * 2 : dmg,
			crit
		);
		this.sprite.material.color.setHex(0xff0000);
		setTimeout(() => {
			if (this.active) this.sprite.material.color.setHex(0xffffff);
		}, 50);
		if (knock_dir) this.kb.add(knock_dir.multiplyScalar(1.2));
		spawnParticle(this.mesh.position, this.conf.color, 3, "spark");
		if (this.hp <= 0) {
			this.kill();
			stats.kills++;
			stats.score += 10;
			shake_intensity = 0.3;
			spawnParticle(this.mesh.position, this.conf.color, 12, "exp");
			spawnBlood(this.mesh.position);
			const heartChance = 0.05 + this.conf.xp * 0.002;
			if (Math.random() < heartChance) {
				spawnItem(this.mesh.position, 20 + Math.floor(this.conf.xp / 2), "hp");
			} else {
				spawnItem(this.mesh.position, this.conf.xp, "xp");
			}
			document.getElementById("score_display").innerText = `Score: ${stats.score}`;
		}
	}
}

function spawnProj(pos, emoji, dmg, vel, type, color, target) {
	const map = getTex(emoji, 64);
	const mat = new THREE.SpriteMaterial({ map: map });
	const mesh = new THREE.Sprite(mat);
	mesh.position.copy(pos);
	mesh.position.y = 2;
	mesh.scale.set(2, 2, 1);
	const trail = new THREE.Line(
		new THREE.BufferGeometry(),
		new THREE.LineBasicMaterial({ color: color })
	);
	scene.add(trail);
	const p = {
		mesh,
		dmg,
		type,
		life: 100,
		vel: vel || new THREE.Vector3(),
		color,
		trail,
		posHistory: []
	};
	if (type === "lob") {
		p.start = pos.clone();
		p.end = target;
		p.t = 0;
	} else if (type === "slash") {
		p.life = 6;
		mesh.position.add(vel.clone().multiplyScalar(4));
		mesh.scale.set(6, 6, 1);
		shake_intensity = 0.2;
		spawnParticle(mesh.position, color, 8);
		enemies.forEach((e) => {
			const dx = e.mesh.position.x - mesh.position.x;
			const dz = e.mesh.position.z - mesh.position.z;
			if (Math.sqrt(dx * dx + dz * dz) < 3.5) e.hit(dmg, vel.clone().normalize());
		});
	} else if (type === "aura") {
		p.life = 15;
		mesh.scale.set(9, 9, 1);
		mesh.material.opacity = 0.4;
		enemies.forEach((e) => {
			const dx = e.mesh.position.x - pos.x;
			const dz = e.mesh.position.z - pos.z;
			if (Math.sqrt(dx * dx + dz * dz) < 5)
				e.hit(dmg, e.mesh.position.clone().sub(pos).normalize());
		});
	}
	scene.add(mesh);
	projectiles.push(p);
}

function spawnItem(pos, val, type) {
	const emoji = type === "hp" ? "❤️" : "💎";
	const map = getTex(emoji, 48);
	const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: map }));
	s.position.copy(pos);
	s.position.y = 1.5;
	scene.add(s);
	items.push({ mesh: s, val, type });
}

function getNearest(pos) {
	let n = null,
		d = Infinity;
	enemies.forEach((e) => {
		const dst = e.mesh.position.distanceTo(pos);
		if (dst < d && dst < 25) {
			d = dst;
			n = e;
		}
	});
	return n;
}

function startLoop() {
	if (!is_looping) {
		is_looping = true;
		loop();
	}
}

function uiLoop() {
	if (active && !paused) {
		requestAnimationFrame(uiLoop);
		return;
	}

	if (gp_index !== null) {
		const g = navigator.getGamepads()[gp_index];
		if (g) {
			const now = performance.now();
			if (now - gp_nav.last_move > 150) {
				let screen = document.querySelector(".screen:not(.hidden)");
				if (screen && screen.id !== gp_nav.screen_id) {
					gp_nav.screen_id = screen.id;
					gp_nav.index = 0;
					gp_nav.elements = Array.from(
						screen.querySelectorAll("button, input, .hero-card, .upgrade-card")
					);
				}

				if (screen) {
					const currentEls = Array.from(
						screen.querySelectorAll("button, input, .hero-card, .upgrade-card")
					);
					if (currentEls.length !== gp_nav.elements.length) {
						gp_nav.elements = currentEls;
						gp_nav.index = 0;
					}
				}

				if (gp_nav.elements.length > 0) {
					let moved = false;
					const ay = g.axes[1];
					const ax = g.axes[0];
					if (Math.abs(ay) > 0.5) {
						gp_nav.index += ay > 0 ? 1 : -1;
						moved = true;
					} else if (Math.abs(ax) > 0.5) {
						gp_nav.index += ax > 0 ? 1 : -1;
						moved = true;
					}

					if (g.buttons[12].pressed) {
						gp_nav.index--;
						moved = true;
					}
					if (g.buttons[13].pressed) {
						gp_nav.index++;
						moved = true;
					}
					if (g.buttons[14].pressed) {
						gp_nav.index--;
						moved = true;
					}
					if (g.buttons[15].pressed) {
						gp_nav.index++;
						moved = true;
					}

					if (moved) {
						if (gp_nav.index < 0) gp_nav.index = gp_nav.elements.length - 1;
						if (gp_nav.index >= gp_nav.elements.length) gp_nav.index = 0;
						gp_nav.last_move = now;

						document
							.querySelectorAll(".gp-focus")
							.forEach((el) => el.classList.remove("gp-focus"));
						const target = gp_nav.elements[gp_nav.index];
						if (target) {
							target.classList.add("gp-focus");
							target.scrollIntoView({
								behavior: "smooth",
								block: "center"
							});
						}
					}

					if (g.buttons[0].pressed && now - gp_nav.last_move > 200) {
						gp_nav.elements[gp_nav.index].click();
						gp_nav.last_move = now + 200;
					}
				}
			}
		}
	}
	requestAnimationFrame(uiLoop);
}

function loop() {
	requestAnimationFrame(loop);
	if (!active || paused) return;
	if (hit_stop_frames > 0) {
		hit_stop_frames--;
		renderer.render(scene, camera);
		return;
	}
	const dt = clock.getDelta();
	total_time += dt;

	let dx = (keys.d || keys.right ? 1 : 0) - (keys.a || keys.left ? 1 : 0);
	let dy = (keys.s || keys.down ? 1 : 0) - (keys.w || keys.up ? 1 : 0);

	if (drag_input.active) {
		dx = drag_input.dx;
		dy = drag_input.dy;
	}

	if (gp_index !== null) {
		const g = navigator.getGamepads()[gp_index];
		if (g) {
			if (Math.abs(g.axes[0]) > 0.2) dx = g.axes[0];
			if (Math.abs(g.axes[1]) > 0.2) dy = g.axes[1];
		}
	}

	player.update(dt, dx, dy);

	for (let i = enemies.length - 1; i >= 0; i--) {
		enemies[i].update();
		if (!enemies[i].active) enemies.splice(i, 1);
	}

	for (let i = projectiles.length - 1; i >= 0; i--) {
		const p = projectiles[i];
		p.life--;
		p.posHistory.push(p.mesh.position.clone());
		if (p.posHistory.length > 5) p.posHistory.shift();
		if (p.trail) p.trail.geometry.setFromPoints(p.posHistory);

		if (p.type === "missile" || p.type === "linear") {
			p.mesh.position.add(p.vel);
			spawnParticle(p.mesh.position, 0xffffcc, 1);
			for (let e of enemies) {
				const dx = e.mesh.position.x - p.mesh.position.x;
				const dz = e.mesh.position.z - p.mesh.position.z;
				if (Math.sqrt(dx * dx + dz * dz) < 1.8) {
					e.hit(p.dmg, p.vel.clone().normalize());
					p.life = 0;
					sfx_sys.sfxHit();
					spawnParticle(p.mesh.position, p.color, 6, "exp");
					hit_stop_frames = 2;
					break;
				}
			}
		} else if (p.type === "lob") {
			p.t += dt * 1.5;
			p.mesh.position.lerpVectors(p.start, p.end, p.t);
			p.mesh.position.y = 2 + Math.sin(p.t * Math.PI) * 10;
			if (p.t >= 1) {
				p.life = 0;
				sfx_sys.sfxExp();
				shake_intensity = 0.5;
				spawnParticle(p.mesh.position, 0xff4400, 15, "exp");
				enemies.forEach((e) => {
					const dx = e.mesh.position.x - p.mesh.position.x;
					const dz = e.mesh.position.z - p.mesh.position.z;
					if (Math.sqrt(dx * dx + dz * dz) < 5) e.hit(p.dmg, null);
				});
			}
		}

		if (p.life <= 0) {
			scene.remove(p.mesh);
			if (p.trail) scene.remove(p.trail);
			projectiles.splice(i, 1);
		}
	}

	for (let i = particles.length - 1; i >= 0; i--) {
		const pt = particles[i];
		pt.life -= pt.decay;
		pt.mesh.position.add(pt.vel);
		pt.mesh.scale.setScalar(pt.life * (pt.type === "exp" ? 2 : 1));
		pt.mesh.material.opacity = pt.life;
		if (pt.life <= 0) {
			scene.remove(pt.mesh);
			particles.splice(i, 1);
		}
	}

	const grab = 5 * player.stats.area;
	for (let i = items.length - 1; i >= 0; i--) {
		const it = items[i];
		const d = it.mesh.position.distanceTo(player.mesh.position);
		if (d < grab) {
			it.mesh.position.lerp(player.mesh.position, 0.2);
			if (d < 1) {
				scene.remove(it.mesh);
				items.splice(i, 1);
				if (it.type === "hp") {
					player.heal(it.val);
					sfx_sys.sfxHeal();
				} else {
					stats.xp += it.val;
					sfx_sys.sfxGem();
					document.getElementById("xp_bar_fill").style.width =
						Math.min(100, (stats.xp / stats.next) * 100) + "%";
					if (stats.xp >= stats.next) levelUp();
				}
			}
		}
	}

	if (Math.floor(total_time * 10) % 20 === 0) {
		const available = current_biome.enemies;
		const id =
			available[Math.min(Math.floor(total_time / 30), available.length - 1)] ||
			available[available.length - 1];
		const template = MONSTERS[id] || MONSTERS["slime"];
		document.getElementById("wave_display").innerText = "ENEMY: " + template.name;

		let spawned = false;
		let attempts = 0;
		while (!spawned && attempts < 5) {
			const ang = Math.random() * Math.PI * 2;
			const rad = 45;
			const ex = player.mesh.position.x + Math.cos(ang) * rad;
			const ez = player.mesh.position.z + Math.sin(ang) * rad;
			let clean = true;
			const cx = Math.floor(ex / CONFIG.chunk_size);
			const cz = Math.floor(ez / CONFIG.chunk_size);
			const k = `${cx},${cz}`;
			if (chunks.has(k)) {
				const chunk_objs = chunks.get(k);
				for (let obj of chunk_objs) {
					const dx = obj.position.x - ex;
					const dz = obj.position.z - ez;
					if (dx * dx + dz * dz < 9) {
						clean = false;
						break;
					}
				}
			}
			if (clean) {
				enemies.push(new Enemy(template, ex, ez));
				spawned = true;
			}
			attempts++;
		}
	}

	const m = Math.floor(total_time / 60);
	const s = Math.floor(total_time % 60);
	document.getElementById("timer_display").innerText = `${m}:${
		s < 10 ? "0" + s : s
	}`;
	renderer.render(scene, camera);
}

function levelUp() {
	paused = true;
	sfx_sys.sfxLvl();
	stats.lvl++;
	stats.xp = 0;
	stats.next = Math.floor(stats.next * 1.4);
	document.getElementById("xp_bar_fill").style.width = "0%";
	const pool = [...Object.values(WEAPONS), ...Object.values(PASSIVES)];
	const opts = [];
	for (let i = 0; i < 3; i++)
		opts.push(pool[Math.floor(Math.random() * pool.length)]);
	const con = document.getElementById("upgrade_cards");
	con.innerHTML = "";
	opts.forEach((o) => {
		const c = document.createElement("div");
		c.className = "upgrade-card";
		c.innerHTML = `<div class="icon">${o.emoji}</div><div class="title">${
			o.name
		}</div><div class="desc">${o.desc || "Upgrade"}</div>`;
		c.onclick = () => {
			applyUpg(o);
			document.getElementById("levelup_screen").classList.add("hidden");
			paused = false;
		};
		con.appendChild(c);
	});
	document.getElementById("levelup_screen").classList.remove("hidden");
}

function applyUpg(u) {
	if (u.damage) {
		const ex = stats.weps.find((w) => w.id === u.id);
		if (ex) {
			ex.lvl++;
			ex.conf.damage *= 1.2;
		} else player.addWep(u.id);
	} else {
		stats.pass.push(u);
		if (u.id === "might") player.stats.might += 0.2;
		if (u.id === "haste") player.stats.cd -= 0.1;
		if (u.id === "speed") player.stats.spd += 0.05;
		if (u.id === "area") player.stats.area += 0.25;
		if (u.id === "armor") player.stats.armor += 2;
		updateInv();
	}
}

function updateInv() {
	const d = document.getElementById("inventory");
	d.innerHTML = "";
	stats.weps.forEach(
		(w) =>
			(d.innerHTML += `<div class="slot">${w.conf.emoji}<div class="lvl">${w.lvl}</div></div>`)
	);
	stats.pass.forEach(
		(p) => (d.innerHTML += `<div class="slot">${p.emoji}</div>`)
	);
}

function gameOver() {
	active = false;
	stats.score += Math.floor(total_time);
	document.getElementById("gameover_screen").classList.remove("hidden");
	document.getElementById("final_stats").innerText = `Score: ${
		stats.score
	} | Time: ${document.getElementById("timer_display").innerText}`;
}

window.saveAndMenu = () => {
	const name = stats.name || "Unknown";
	const entry = { name, score: stats.score, wave: stats.lvl };
	let scores = JSON.parse(
		localStorage.getItem("emoji_survivors_scores") || "[]"
	);
	scores.push(entry);
	scores.sort((a, b) => b.score - a.score);
	scores = scores.slice(0, 5);
	localStorage.setItem("emoji_survivors_scores", JSON.stringify(scores));
	returnToMenu();
};

function loadScores() {
	const d = document.getElementById("score_list");
	const scores = JSON.parse(
		localStorage.getItem("emoji_survivors_scores") || "[]"
	);
	d.innerHTML = scores.length
		? ""
		: '<div style="color:#666;text-align:center">No scores yet</div>';
	scores.forEach((s) => {
		d.innerHTML += `<div class="score-row"><span>${s.name}</span><span>${s.score}</span></div>`;
	});
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.setGender = (g) => {
	sel_gender = g;
	document.getElementById("btn_male").className = g === "male" ? "selected" : "";
	document.getElementById("btn_female").className =
		g === "female" ? "selected" : "";
	drawGrid();
};

window.changeBiome = (dir) => {
	sel_biome_idx = (sel_biome_idx + dir + BIOMES.length) % BIOMES.length;
	current_biome = BIOMES[sel_biome_idx];
	document.getElementById(
		"biome_label"
	).innerText = `${current_biome.name} ${current_biome.emoji}`;
	const root = document.documentElement;
	root.style.setProperty("--panel-bg", current_biome.theme.bg);
	root.style.setProperty("--accent", current_biome.theme.accent);
	root.style.setProperty(
		"--font-main",
		`"${current_biome.theme.font}", sans-serif`
	);
	if (!active) init();
};

window.resurrect = () => {
	if (last_hero_conf) {
		document.getElementById("gameover_screen").classList.add("hidden");
		init();
		player = new Player(last_hero_conf);
		active = true;
		startLoop();
	}
};

window.returnToMenu = () => {
	document.getElementById("gameover_screen").classList.add("hidden");
	document.getElementById("start_screen").classList.remove("hidden");
	document.getElementById("hud").style.display = "none";
	loadScores();
	active = false;
	resetGame();
};

window.togglePause = () => {
	if (!active && !paused) return;
	if (!active) return;
	paused = !paused;
	const screen = document.getElementById("pause_screen");
	if (paused) {
		screen.classList.remove("hidden");
	} else {
		screen.classList.add("hidden");
		loop();
	}
};

function drawGrid() {
	const h = document.getElementById("hero_selection");
	h.innerHTML = "";
	HEROES.forEach((hr) => {
		const d = document.createElement("div");
		d.className = "hero-card";
		const emo = sel_gender === "male" ? hr.m : hr.f;
		d.innerHTML = `<span class="emoji">${emo}</span><h3>${hr.name}</h3><p>${
			WEAPONS[hr.weapon].emoji
		}</p>`;
		d.onclick = () => {
			if (sfx_sys && sfx_sys.synth.ctx && sfx_sys.synth.ctx.state === "suspended")
				sfx_sys.synth.resume();
			let pName = document.getElementById("start_name").value.trim();
			if (!pName) pName = hr.name;
			stats.name = pName;
			document.getElementById(
				"player_label"
			).innerText = `${stats.name} - ${hr.name}`;
			last_hero_conf = hr;
			document.getElementById("start_screen").classList.add("hidden");
			document.getElementById("hud").style.display = "flex";
			document.getElementById("btn_pause").style.display = "block";
			init();
			player = new Player(hr);
			active = true;
			startLoop();
		};
		h.appendChild(d);
	});
}

window.onload = () => {
	if (!renderer) init();
	drawGrid();
	loadScores();
	sel_biome_idx = Math.floor(Math.random() * BIOMES.length);
	window.changeBiome(0);
	requestAnimationFrame(uiLoop);
};
