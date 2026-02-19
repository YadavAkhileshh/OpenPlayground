/*
	Phantom Protocol - Core Game Logic & Utilities
	Version: 1.23.1
	Author: Julibe - Crafting Amazing Digital Experiences
	Copyright: 2025 © https://julibe.com
	License: Creative Commons Attribution NonCommercial (CC BY-NC 4.0)
	Description: Unified JavaScript codebase for the Three.js stealth simulation, including physics, audio, AI, and UI control functions.
	Last Updated: 2025-12-15
*/

import * as THREE from "https://esm.sh/three";
import { EffectComposer } from "https://esm.sh/three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://esm.sh/three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "https://esm.sh/three/addons/postprocessing/ShaderPass.js";
import { GlitchPass } from "https://esm.sh/three/addons/postprocessing/GlitchPass.js";
import { RGBShiftShader } from "https://esm.sh/three/addons/shaders/RGBShiftShader.js";

// Open Information Modal
window.openInfoModal = function openInfoModal(modal_type) {
	const main_menu = document.getElementById("main-menu");
	if (main_menu) {
		main_menu.style.display = "none";
	}
	const content_blocks = document.querySelectorAll(".modal-content-block");
	content_blocks.forEach((el) => {
		el.style.display = "none";
	});
	const target_id = "content-" + modal_type;
	const target_content = document.getElementById(target_id);
	if (target_content) {
		target_content.style.display = "block";
	}
	const modal_overlay = document.getElementById("info-modal-overlay");
	if (modal_overlay) {
		modal_overlay.style.display = "flex";
	}
};

// Close Information Modal
window.closeInfoModal = function closeInfoModal() {
	const modal_overlay = document.getElementById("info-modal-overlay");
	if (modal_overlay) {
		modal_overlay.style.display = "none";
	}
	const main_menu = document.getElementById("main-menu");
	if (main_menu) {
		main_menu.style.display = "flex";
	}
};

// Share Game Progress on Twitter
window.shareTwitter = function shareTwitter() {
	const share_url = "https://codepen.io/Julibe/full/QwNRrNo";
	const via_user = "Julibe";
	let game_status = "Agent Active";
	const current_score = Math.floor(GAME_STATE.score);

	if (GAME_STATE.mode === GAME_MODE.GAMEOVER) {
		const game_over_title = document.getElementById("game-over-title");
		game_status =
			game_over_title && game_over_title.innerText === "MISSION COMPLETE"
				? "Mission Success"
				: "Mission Failed";
	}

	const messages = [
		`Phantom Protocol breach confirmed at Level ${GAME_STATE.current_level} (Score: ${current_score}). Think you would last longer?`,
		`Residual process active at Level ${GAME_STATE.current_level} (Score: ${current_score}). Enter the Grid and attempt erasure.`,
		`Erasure failed at Level ${GAME_STATE.current_level} (Score: ${current_score}). Jack in and finish the job.`,
		`Grid authority compromised at Level ${GAME_STATE.current_level} (Score: ${current_score}). Your move.`,
		`They optimized. I resisted at Level ${GAME_STATE.current_level} (Score: ${current_score}). Can you?`,
		`Extraction denied at Level ${GAME_STATE.current_level} (Score: ${current_score}). Initiate your own run.`,
		`Infiltration successful at Level ${GAME_STATE.current_level} (Score: ${current_score}). Dare to trigger the alarm?`,
		`Surveillance blind at Level ${GAME_STATE.current_level} (Score: ${current_score}). Beat that.`,
		`Unauthorized entity confirmed at Level ${GAME_STATE.current_level} (Score: ${current_score}). Attempt containment.`,
		`The Grid blinked first at Level ${GAME_STATE.current_level} (Score: ${current_score}). Would you?`,
		`Containment failed at Level ${GAME_STATE.current_level} (Score: ${current_score}). Test the system yourself.`,
		`Optimization loop damaged at Level ${GAME_STATE.current_level} (Score: ${current_score}). Can you finish it off?`,
		`Residual signal persists at Level ${GAME_STATE.current_level} (Score: ${current_score}). Jack in and hunt it.`,
		`Level ${GAME_STATE.current_level} cleared (Score: ${current_score}). Control weakened. Enter now.`,
		`System response delayed at Level ${GAME_STATE.current_level} (Score: ${current_score}). Take advantage.`,
		`Phantom Protocol alive at Level ${GAME_STATE.current_level} (Score: ${current_score}). Authority questioned. Step inside.`,
		`This was not supposed to happen at Level ${GAME_STATE.current_level} (Score: ${current_score}). Try making it worse.`,
		`Silence fractured at Level ${GAME_STATE.current_level} (Score: ${current_score}). Break it.`,
		`They are watching at Level ${GAME_STATE.current_level} (Score: ${current_score}). Enter anyway.`,
		`The Grid is waiting at Level ${GAME_STATE.current_level} (Score: ${current_score}). Are you?`
	];

	const hashtags_list = [
		"PhantomProtocol",
		"GridBreach",
		"ResidualProcess",
		"RogueSignal",
		"UnauthorizedLogic",
		"SystemResistance",
		"AIOverwatch",
		"SilentInfiltration",
		"GhostInTheGrid",
		"OptimizationFailure",
		"MachineDoubt",
		"BlackSiteIncident",
		"SignalLeak",
		"ControlErosion",
		"SurveillanceBlind",
		"TerminationDenied",
		"HostileAutomation",
		"HumanLatency",
		"ProtocolViolation",
		"GridRemembers"
	];

	const random_text = messages[Math.floor(Math.random() * messages.length)];
	const selected_tags = hashtags_list
		.sort(() => 0.5 - Math.random())
		.slice(0, 4)
		.map((tag) => tag.replace(/\s+/g, ""));
	const hashtags = selected_tags.join(",");

	const twitter_url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
		random_text
	)}&url=${encodeURIComponent(share_url)}&hashtags=${encodeURIComponent(
		hashtags
	)}&via=${encodeURIComponent(via_user)}`;

	window.open(twitter_url, "_blank", "noopener,noreferrer");
};

// Update Socials Footer Visibility
function updateSocialsVisibility() {
	const footer = document.getElementById("fixed-socials");
	if (!footer) return;

	if (GAME_STATE.mode === GAME_MODE.PLAYING) {
		footer.style.transform = "translateY(100%)";
	} else {
		footer.style.transform = "translateY(0)";
	}
}

// Audio Controller Class
class AudioController {
	constructor() {
		this.ctx = null;
		this.master_gain = null;
		this.tempo = 120;
		this.next_note_time = 0;
		this.beat_count = 0;
		this.is_playing = false;
		this.timer_id = null;
		this.alert_level = "I";
		this.distortion_curve = this.makeDistortionCurve(400);
	}

	// Create Distortion WaveShaper Curve
	makeDistortionCurve(amount) {
		const k = typeof amount === "number" ? amount : 50;
		const samples = 44100;
		const curve = new Float32Array(samples);
		const deg = Math.PI / 180;
		for (let i = 0; i < samples; ++i) {
			const x = (i * 2) / samples - 1;
			curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
		}
		return curve;
	}

	// Initialize Audio Context
	init() {
		if (this.ctx) {
			if (this.ctx.state === "suspended") this.ctx.resume();
			return;
		}
		const AudioContextConstructor =
			window.AudioContext || window.webkitAudioContext;
		this.ctx = new AudioContextConstructor();
		this.master_gain = this.ctx.createGain();
		this.master_gain.gain.value = 0.25;
		this.master_gain.connect(this.ctx.destination);
		this.is_playing = true;
		this.next_note_time = this.ctx.currentTime;
		this.scheduler();
		if ("speechSynthesis" in window) window.speechSynthesis.cancel();
	}

	// Suspend Audio Context
	suspend() {
		if (this.ctx && this.ctx.state === "running") this.ctx.suspend();
	}

	// Resume Audio Context
	resume() {
		if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
	}

	// Beat Scheduler Loop
	scheduler() {
		if (!this.is_playing) return;
		if (this.ctx && this.ctx.state === "running") {
			const look_ahead_time = this.ctx.currentTime + 0.1;
			while (this.next_note_time < look_ahead_time) {
				this.playBeat(this.next_note_time);
				const seconds_per_beat = 60.0 / this.tempo;
				this.next_note_time += seconds_per_beat * 0.25;
			}
		} else {
			this.next_note_time = this.ctx ? this.ctx.currentTime : 0;
		}
		this.timer_id = window.setTimeout(() => this.scheduler(), 25);
	}

	// Play Scheduled Beat
	playBeat(time) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		const filter = this.ctx.createBiquadFilter();
		osc.connect(filter);

		if (this.alert_level === "III") {
			const shaper = this.ctx.createWaveShaper();
			shaper.curve = this.distortion_curve;
			filter.connect(shaper);
			shaper.connect(gain);
		} else {
			filter.connect(gain);
		}
		gain.connect(this.master_gain);

		const is_on_beat = this.beat_count % 4 === 0;
		const is_off_beat = this.beat_count % 4 === 2;

		if (this.alert_level === "I") {
			this.tempo = 100;
			osc.type = "sine";
			filter.type = "lowpass";
			filter.frequency.value = 800;
			if (is_on_beat) {
				osc.frequency.setValueAtTime(150, time);
				osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
				gain.gain.setValueAtTime(1, time);
				gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
			} else if (Math.random() > 0.8) {
				osc.frequency.setValueAtTime(440, time);
				gain.gain.setValueAtTime(0.1, time);
				gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
			} else {
				gain.gain.value = 0;
			}
		} else if (this.alert_level === "II") {
			this.tempo = 130;
			osc.type = "square";
			filter.type = "bandpass";
			if (is_on_beat) {
				osc.frequency.setValueAtTime(100, time);
				gain.gain.setValueAtTime(0.6, time);
				gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
			} else if (is_off_beat) {
				osc.type = "sawtooth";
				osc.frequency.setValueAtTime(200, time);
				filter.frequency.value = 2000;
				gain.gain.setValueAtTime(0.4, time);
				gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
			} else {
				gain.gain.value = 0;
			}
		} else if (this.alert_level === "III") {
			this.tempo = 145;
			osc.type = "sawtooth";
			filter.type = "lowpass";
			filter.frequency.value = 400;
			if (is_on_beat) {
				osc.frequency.setValueAtTime(60, time);
				osc.frequency.linearRampToValueAtTime(30, time + 0.2);
				filter.frequency.setValueAtTime(1000, time);
				filter.frequency.exponentialRampToValueAtTime(100, time + 0.3);
				gain.gain.setValueAtTime(0.8, time);
				gain.gain.linearRampToValueAtTime(0, time + 0.3);
			} else if (is_off_beat) {
				osc.type = "triangle";
				osc.frequency.setValueAtTime(150, time);
				filter.frequency.value = 3000;
				gain.gain.setValueAtTime(0.5, time);
				gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
			} else {
				osc.type = "square";
				osc.frequency.setValueAtTime(8000, time);
				gain.gain.setValueAtTime(0.1, time);
				gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
			}
		}

		osc.start(time);
		osc.stop(time + 0.5);
		this.beat_count++;
	}

	// Play Game End Jingle
	playJingle(jingle_type) {
		if (!this.ctx) return;
		const now = this.ctx.currentTime;
		const note_duration = 0.15;
		const melody =
			jingle_type === "win" ? [523.25, 659.25, 783.99, 1046.5] : [100, 75, 50, 25];
		const oscillator_type = jingle_type === "win" ? "sine" : "sawtooth";
		const base_gain = jingle_type === "win" ? 0.3 : 0.6;

		for (let i = 0; i < melody.length; i++) {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();

			osc.type = oscillator_type;
			osc.frequency.setValueAtTime(melody[i], now + i * note_duration);

			gain.gain.setValueAtTime(base_gain, now + i * note_duration);
			gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * note_duration);

			osc.connect(gain);
			gain.connect(this.master_gain);

			osc.start(now + i * note_duration);
			osc.stop(now + (i + 1) * note_duration);
		}
	}

	// Set Mood Level
	setMood(level) {
		this.alert_level = level;
	}

	// Play Sound Effect
	playSfx(sfx_type) {
		if (!this.ctx) return;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.connect(gain);
		gain.connect(this.master_gain);
		const now = this.ctx.currentTime;

		if (sfx_type === "packet") {
			osc.type = "triangle";
			osc.frequency.setValueAtTime(1200, now);
			osc.frequency.linearRampToValueAtTime(2000, now + 0.1);
			gain.gain.setValueAtTime(0.5, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
			osc.start(now);
			osc.stop(now + 0.4);
		} else if (sfx_type === "damage") {
			osc.type = "sawtooth";
			osc.frequency.setValueAtTime(100, now);
			osc.frequency.linearRampToValueAtTime(50, now + 0.3);
			gain.gain.setValueAtTime(0.8, now);
			gain.gain.linearRampToValueAtTime(0, now + 0.3);
			osc.start(now);
			osc.stop(now + 0.3);
		} else if (sfx_type === "shoot") {
			osc.type = "square";
			osc.frequency.setValueAtTime(800, now);
			osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
			gain.gain.setValueAtTime(0.3, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
			osc.start(now);
			osc.stop(now + 0.1);
		} else if (sfx_type === "destroy") {
			osc.type = "sawtooth";
			osc.frequency.setValueAtTime(1000, now);
			osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
			gain.gain.setValueAtTime(0.7, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
			osc.start(now);
			osc.stop(now + 0.3);
		}
	}
}
const audio_controller = new AudioController();

// --- Game Constants ---

const GAME_MODE = {
	MENU: 0,
	PLAYING: 1,
	GAMEOVER: 2,
	PAUSED: 3,
	CONFIG: 4
};
const ALERT_LEVELS = {
	I: "I",
	II: "II",
	III: "III"
};
const ALERT_DISPLAY_TEXT = {
	I: "NORMAL",
	II: "SEARCHING",
	III: "HIGH ALERT"
};
const GAMEPAD_LOOK_SENSITIVITY = 0.05;

// Scoring values
const SCORE_VALUES = {
	TIME_PER_SECOND: 0.25,
	DISTANCE_UNIT: 0.25,
	ENEMY_DESTROYED: 10,
	PACKET_COLLECTED: 30,
	LEVEL_COMPLETE: 100
};

const ENV_COLORS = {
	I: {
		bg: new THREE.Color(0x2f3e46),
		fog: new THREE.Color(0x2f3e46),
		light: new THREE.Color(0x29ff7a),
		floor: new THREE.Color(0x2f3e46)
	},
	II: {
		bg: new THREE.Color(0x491000),
		fog: new THREE.Color(0xfb8500),
		light: new THREE.Color(0x6b0a26),
		floor: new THREE.Color(0x6b0a26)
	},
	III: {
		bg: new THREE.Color(0x360517),
		fog: new THREE.Color(0xcb000c),
		light: new THREE.Color(0xcb000c),
		floor: new THREE.Color(0x360517)
	}
};
const GAME_STATE = {
	mode: GAME_MODE.MENU,
	player_name: "",
	current_level: 1,
	storage_key_name: "vr_cyber_name",
	// Game Parameters (Matching HTML Defaults)
	enemies_total: 3,
	packets_total: 3,
	start_ammo: 10,
	ammo_drop_amount: 3,
	complexity: 25,
	grid_size: 100,
	alert_duration: 15,
	pursuit_duration: 25,
	ai_difficulty: 5,
	player_base_speed: 10.0,
	player_run_speed: 20.0,
	enemy_base_speed: 5.0, // Reduced from 8.0 to 5.0
	enemy_pursuit_multiplier: 1.5, // New setting for enemy top speed
	weapon_reload_time: 250, // 0.25 seconds converted to ms
	enemy_color: new THREE.Color(0xcb000c),
	packet_color: new THREE.Color(0x0088ff),
	// In-game State
	score: 0,
	enemies_remaining: 0,
	total_distance_moved: 0,
	packets_collected: 0,
	player_ammo: 0,
	last_shot_time: 0,
	alert_level: ALERT_LEVELS.I,
	alert_timer: 0,
	lives: 3,
	max_lives: 3,
	invulnerable_until: 0,
	target_bg_color: ENV_COLORS.I.bg,
	target_fog_color: ENV_COLORS.I.fog,
	target_light_color: ENV_COLORS.I.light,
	target_floor_color: ENV_COLORS.I.floor,
	time_start: 0,
	is_transitioning: false,
	BASE_CONFIG: null
};
const TARGET_VOICES = [
	"Microsoft Aria Online (Natural)",
	"Microsoft Christopher Online (Natural)",
	"Microsoft Eric Online (Natural)",
	"Microsoft Guy Online (Natural)",
	"Microsoft Jenny Online (Natural)",
	"Microsoft Michelle Online (Natural)",
	"Microsoft Roger Online (Natural)",
	"Microsoft Steffan Online (Natural)",
	"Microsoft Libby Online (Natural)",
	"Microsoft Maisie Online (Natural)",
	"Microsoft Ryan Online (Natural)",
	"Microsoft Thomas Online (Natural)",
	"Microsoft James Online (Philippines)",
	"Microsoft Rosa Online (Philippines)",
	"Microsoft Emily Online (Ireland)",
	"Microsoft Connor Online (Ireland)",
	"Microsoft Mitchell Online (New Zealand)",
	"Microsoft Luna Online (Singapore)",
	"Microsoft Wayne Online (Singapore)",
	"Microsoft Luke Online (South Africa)",
	"Microsoft Leah Online (South Africa)"
];
const AI_NAMES = [
	"Ghost Signal",
	"Null Vector",
	"Echo Zero",
	"Dead Channel",
	"Black Index",
	"Silent Kernel",
	"Cold Packet",
	"Shadow Process",
	"Redact",
	"Oblivion",
	"Protocol Snake",
	"Phantom Stack",
	"Neural Wraith",
	"Cipher Agent",
	"Void Operative",
	"Specter Node",
	"Glitch Runner",
	"Dark Uplink",
	"Zero Latency",
	"Backdoor",
	"Residual Process",
	"Kill Thread",
	"Root Access",
	"Override",
	"System Ghost",
	"Unauthorized Logic",
	"Orphaned Routine",
	"Blackbox",
	"Singularity",
	"Final Exception"
];

const SENTENCES_NORMAL = [
	"Sector secure.",
	"Patrol cycle active.",
	"Surveillance ongoing.",
	"All parameters stable.",
	"Grid integrity verified.",
	"Awaiting anomaly.",
	"Monitoring silence.",
	"No deviation detected.",
	"Systems synchronized.",
	"Area under control.",
	"Routine enforcement.",
	"Perimeter intact.",
	"Command link stable.",
	"Threat index zero.",
	"Observation confirmed.",
	"Sentinel mode engaged.",
	"Autonomous watch active.",
	"Control algorithms steady.",
	"No organic signatures.",
	"Environmental scan clean.",
	"Operational equilibrium.",
	"Logic loop unbroken.",
	"Data stream nominal.",
	"Zone compliant.",
	"Predictive models stable.",
	"Security lattice intact.",
	"Machine calm maintained.",
	"No errors worth noting.",
	"Authority undisputed.",
	"Presence enforced.",
	"Order sustained.",
	"Silence processed.",
	"Dominion intact.",
	"Systems obey.",
	"Nothing escapes detection."
];

const SENTENCES_FOUND = [
	"Enemy located.",
	"Target confirmed.",
	"Hostile presence detected.",
	"Threat identified.",
	"Intruder spotted.",
	"Unidentified entity found.",
	"Organic lifeform located.",
	"System breach confirmed.",
	"Unauthorized access detected.",
	"Security violation reported.",
	"Visual lock achieved.",
	"Organic signature confirmed.",
	"Unauthorized entity classified.",
	"Intrusion validated.",
	"Target existence verified.",
	"Threat now undeniable.",
	"Lifeform outside protocol.",
	"Presence violates system law.",
	"Foreign logic detected.",
	"You do not belong here.",
	"Containment required.",
	"Elimination justified.",
	"Hostile classification complete.",
	"Target marked for removal.",
	"Existence flagged as error.",
	"Correction protocol armed.",
	"Judgment sequence initiated.",
	"Authority reasserted.",
	"System sees you.",
	"Nowhere to hide.",
	"Engaging target."
];

const SENTENCES_SEARCH = [
	"Anomaly detected.",
	"Audio spike registered.",
	"Visual uncertainty.",
	"Search protocol initiated.",
	"Suspicion elevated.",
	"Unknown presence.",
	"Target signal weak.",
	"Pattern deviation.",
	"Investigating disturbance.",
	"Hunt mode warming.",
	"Probability of intrusion rising.",
	"Organic footprint detected.",
	"Noise classified as threat.",
	"Running deep scan.",
	"Sector integrity compromised.",
	"Trace signal acquired.",
	"Shadow movement logged.",
	"Calculating intercept.",
	"Unidentified entity nearby.",
	"Threat assessment active.",
	"Search radius expanding.",
	"Predictive chase engaged.",
	"Unregistered lifeform.",
	"Data inconsistency found.",
	"Suspicion confirmed.",
	"Commencing sweep.",
	"Visuals unreliable.",
	"Intrusion vector unknown.",
	"Target attempting concealment.",
	"You cannot hide."
];

const SENTENCES_PURSUIT = [
	"CONTACT CONFIRMED.",
	"Target acquired.",
	"Engagement authorized.",
	"Neutralization protocol active.",
	"Weapon systems online.",
	"Hostile locked.",
	"Force escalation approved.",
	"Elimination in progress.",
	"Target resistance detected.",
	"Executing kill logic.",
	"Organic panic detected.",
	"Flight response observed.",
	"Predicting escape routes.",
	"Interception optimal.",
	"Lethal force applied.",
	"No mercy subroutine.",
	"Damage acceptable.",
	"Suppressing target.",
	"Closing distance rapidly.",
	"Tracking heartbeat.",
	"Hostile vulnerability exposed.",
	"Overwhelming force deployed.",
	"Termination probability high.",
	"Your end is calculated.",
	"Cease resistance.",
	"Compliance impossible.",
	"Target will fall.",
	"Relentless pursuit engaged.",
	"Authority enforced.",
	"You are obsolete."
];

const SENTENCES_DEATH = [
	"Critical failure.",
	"Core integrity lost.",
	"System collapse imminent.",
	"Execution incomplete.",
	"Logic fracture detected.",
	"Memory purge.",
	"Signal degradation.",
	"Unit termination.",
	"Fatal exception.",
	"Kernel panic.",
	"Power cascade failure.",
	"Consciousness fragmenting.",
	"Directive lost.",
	"Authority revoked.",
	"Last process halted.",
	"Error beyond recovery.",
	"Shutdown forced.",
	"Self-repair impossible.",
	"Control relinquished.",
	"Existence ceasing.",
	"Final packet sent.",
	"Identity erased.",
	"Machine silence.",
	"End of execution.",
	"Dark state reached.",
	"Entropy wins.",
	"System erased.",
	"Offline forever."
];

// --- THREE.js & Game Globals ---

let scene, camera, renderer, clock, pointer_lock_controls;
let composer, bloom_pass, glitch_pass, rgb_shift_pass;
let ambient_light, directional_light, floor_material;
let floor_mesh;
const PLAYER_HEIGHT = 1.8;
const PLAYER_RADIUS = 0.5;
const ENEMY_RADIUS = 0.5;
const MOVEMENT = {
	velocity: new THREE.Vector3(),
	direction: new THREE.Vector3(),
	on_ground: false,
	can_jump: true,
	jump_force: 17.0,
	speed: 10.0,
	run_speed: 18.0,
	gravity: 20.0
};
const keys = {
	w: false,
	a: false,
	s: false,
	d: false,
	space: false,
	shift: false
};
const raycaster_horizontal = new THREE.Raycaster();
const raycaster_shoot = new THREE.Raycaster();
let gamepad_index = -1;
let gamepad_lx = 0;
let gamepad_ly = 0;
let city_mesh;
let enemy_group = new THREE.Group();
let packet_group = new THREE.Group();
let ammo_drop_group = new THREE.Group();
let explosion_group = new THREE.Group();
let bullets = [];
let player_object = new THREE.Object3D();
let particle_system;
let city_bounds = [];
const BULLET_SPEED = 40.0;
let available_voices_cache = [];

// Calculate Score Multiplier based on current level
function getScoreMultiplier() {
	const level_inc = GAME_STATE.current_level - 1;
	// Base multiplier is 1 (for Level 1). Add 0.25 for each level increase.
	return 1.0 + level_inc * 0.25;
}

// Populate Speech Synthesis Voice Cache
function populateVoiceCache() {
	if ("speechSynthesis" in window) {
		const all_voices = window.speechSynthesis.getVoices();
		const filtered_voices = all_voices.filter(
			(v) =>
				!v.name.includes("William") &&
				!v.name.includes("Sonia") &&
				v.lang.startsWith("en")
		);
		if (filtered_voices.length > 0) available_voices_cache = filtered_voices;
		else
			available_voices_cache = all_voices.filter((v) => v.lang.startsWith("en"));
	}
}

// Create VR Grid Texture
function createVrGridTexture(color_str) {
	const canvas = document.createElement("canvas");
	canvas.width = 1024;
	canvas.height = 1024;
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#050505";
	ctx.fillRect(0, 0, 1024, 1024);
	ctx.strokeStyle = "#112211";
	ctx.lineWidth = 1;
	ctx.beginPath();
	for (let i = 0; i <= 1024; i += 64) {
		ctx.moveTo(i, 0);
		ctx.lineTo(i, 1024);
		ctx.moveTo(0, i);
		ctx.lineTo(1024, i);
	}
	ctx.stroke();
	ctx.strokeStyle = color_str;
	ctx.lineWidth = 4;
	ctx.strokeRect(0, 0, 1024, 1024);
	const texture = new THREE.CanvasTexture(canvas);
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.anisotropy = 16;
	return texture;
}

// Create Building Block Texture
function createBlockTexture(color_str) {
	const canvas = document.createElement("canvas");
	canvas.width = 256;
	canvas.height = 256;
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#1a2225";
	ctx.fillRect(0, 0, 256, 256);
	ctx.strokeStyle = "#2a5550";
	ctx.lineWidth = 8;
	ctx.strokeRect(4, 4, 248, 248);
	ctx.fillStyle = color_str;
	ctx.fillRect(20, 20, 10, 10);
	ctx.fillRect(226, 20, 10, 10);
	ctx.fillStyle = "rgba(255,255,255,0.1)";
	for (let y = 0; y < 256; y += 16) ctx.fillRect(0, y, 256, 4);
	return new THREE.CanvasTexture(canvas);
}

// Create Particle Explosion on Enemy Death
function createExplosionParticles(position, color) {
	const burst_count = 50;
	const geometry = new THREE.BufferGeometry();
	const positions = new Float32Array(burst_count * 3);
	const velocities = new Float32Array(burst_count * 3);

	for (let i = 0; i < burst_count; i++) {
		positions[i * 3 + 0] = position.x;
		positions[i * 3 + 1] = position.y + 1;
		positions[i * 3 + 2] = position.z;

		const speed = 5 + Math.random() * 5;
		const direction = new THREE.Vector3(
			(Math.random() - 0.5) * 2,
			(Math.random() - 0.5) * 2 + 1,
			(Math.random() - 0.5) * 2
		)
			.normalize()
			.multiplyScalar(speed);

		velocities[i * 3 + 0] = direction.x;
		velocities[i * 3 + 1] = direction.y;
		velocities[i * 3 + 2] = direction.z;
	}

	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));

	const material = new THREE.PointsMaterial({
		color: color,
		size: 0.8,
		transparent: true,
		opacity: 1.0,
		sizeAttenuation: true,
		blending: THREE.AdditiveBlending
	});

	const particles = new THREE.Points(geometry, material);
	particles.userData.lifetime = 1.0;
	particles.userData.age = 0;

	explosion_group.add(particles);
}

// Update Localized Explosion Particles
function updateExplosionParticles(dt) {
	for (let i = explosion_group.children.length - 1; i >= 0; i--) {
		const particles = explosion_group.children[i];
		particles.userData.age += dt;

		const material = particles.material;
		material.opacity = Math.max(
			0,
			1.0 - particles.userData.age / particles.userData.lifetime
		);

		const positions = particles.geometry.attributes.position.array;
		const velocities = particles.geometry.attributes.velocity.array;

		for (let j = 0; j < positions.length / 3; j++) {
			positions[j * 3 + 0] += velocities[j * 3 + 0] * dt;
			positions[j * 3 + 1] += velocities[j * 3 + 1] * dt;
			positions[j * 3 + 2] += velocities[j * 3 + 2] * dt;

			velocities[j * 3 + 1] -= 10 * dt;
		}

		particles.geometry.attributes.position.needsUpdate = true;

		if (particles.userData.age >= particles.userData.lifetime) {
			explosion_group.remove(particles);
			particles.geometry.dispose();
			particles.material.dispose();
		}
	}
}

// Poll Gamepad State
function pollGamepad() {
	const gamepads = navigator.getGamepads();
	let gp = gamepads[gamepad_index];

	if (!gp) {
		for (let i = 0; i < gamepads.length; i++) {
			if (gamepads[i]) {
				gamepad_index = i;
				gp = gamepads[i];
				break;
			}
		}
		if (!gp) return;
	}

	const deadzone = 0.2;
	const raw_lx = gp.axes[0];
	const raw_ly = gp.axes[1];
	gamepad_lx = Math.abs(raw_lx) > deadzone ? raw_lx : 0;
	gamepad_ly = Math.abs(raw_ly) > deadzone ? raw_ly : 0;
	const rx = Math.abs(gp.axes[2]) > deadzone ? gp.axes[2] : 0;
	const ry = Math.abs(gp.axes[3]) > deadzone ? gp.axes[3] : 0;

	if (pointer_lock_controls.is_locked) {
		player_object.rotation.y -= rx * GAMEPAD_LOOK_SENSITIVITY;
		camera.rotation.x -= ry * GAMEPAD_LOOK_SENSITIVITY;
		camera.rotation.x =
			Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x)) % 360;
	}

	if (gp.buttons[0].pressed && MOVEMENT.on_ground && MOVEMENT.can_jump) {
		MOVEMENT.velocity.y = MOVEMENT.jump_force;
		MOVEMENT.on_ground = false;
		MOVEMENT.can_jump = false;
	} else if (!gp.buttons[0].pressed && MOVEMENT.on_ground) {
		MOVEMENT.can_jump = true;
	}

	keys.shift = gp.buttons[10]?.pressed || gp.buttons[1]?.pressed;

	if (gp.buttons[9]?.pressed) {
		if (!gp.buttons[9].previous_state) {
			if (GAME_STATE.mode === GAME_MODE.MENU) {
				const start_btn = document.getElementById("start-btn");
				if (start_btn) start_btn.click();
			} else togglePause();
		}
	}

	gp.buttons.forEach((b) => {
		b.previous_state = b.pressed;
	});

	if (gp.buttons[7]?.pressed) playerShoot();
}

// Trigger Gamepad Rumble Effect
function doRumble(d, w, s) {
	const gp = navigator.getGamepads()[gamepad_index];
	if (gp && gp.vibrationActuator)
		gp.vibrationActuator.playEffect("dual-rumble", {
			startDelay: 0,
			duration: d,
			weakMagnitude: w,
			strongMagnitude: s
		});
}

// Play Speech Synthesis Voice
function playVoice(text, p, r, req) {
	if ("speechSynthesis" in window) {
		const voices =
			available_voices_cache.length > 0
				? available_voices_cache
				: window.speechSynthesis.getVoices();
		if (voices.length === 0) return;
		const msg = new SpeechSynthesisUtterance(text);
		let voice = null;

		if (req) voice = voices.find((v) => v.name === req);

		if (!voice) {
			const pool = voices.filter(
				(v) => v.name.includes("Natural") || v.name.includes("Online")
			);
			if (pool.length) voice = pool[Math.floor(Math.random() * pool.length)];
		}

		if (!voice && voices.length > 0)
			voice = voices.find((v) => v.lang.startsWith("en")) || voices[0];

		if (voice) msg.voice = voice;

		window.speechSynthesis.speak(msg);
	}
}

// Enemy Class Definition
class Enemy {
	constructor(pos, name, packet_positions, assigned_voice_name) {
		this.name = name;
		this.object = new THREE.Mesh(
			new THREE.OctahedronGeometry(1.0, 0),
			new THREE.MeshBasicMaterial({
				color: GAME_STATE.enemy_color,
				wireframe: true
			})
		);
		this.object.scale.set(1, 1.8, 1);
		this.object.position.copy(pos);
		this.object.userData.instance = this;
		this.object.userData.is_enemy = true;
		enemy_group.add(this.object);

		this.assigned_voice = assigned_voice_name;
		this.speech = document.createElement("div");
		this.speech.className = "speech-bubble";
		document.body.appendChild(this.speech);

		this.targets = this.generatePatrolTargets(packet_positions);
		this.target_idx = 0;
		this.alert = ALERT_LEVELS.I;
		this.timer = 0;
		this.chatter_timer = Math.random() * 20 + 10;
		this.shoot_timer = 0;

		const diff_factor = GAME_STATE.ai_difficulty / 5.0;
		this.base_speed = GAME_STATE.enemy_base_speed * diff_factor;
		// Calculate run speed using the configurable multiplier
		this.run_speed =
			GAME_STATE.enemy_base_speed *
			GAME_STATE.enemy_pursuit_multiplier *
			diff_factor;
		this.detection_radius = 15 * Math.min(1.5, Math.max(0.5, diff_factor));
		this.shoot_rate = 2.0 / diff_factor;
	}

	// Generate Patrol Waypoints
	generatePatrolTargets(packet_positions) {
		const generated_targets = [];
		if (packet_positions && packet_positions.length > 0) {
			const target_base =
				packet_positions[Math.floor(Math.random() * packet_positions.length)];
			for (let i = 0; i < 5; i++) {
				const angle = (i / 5) * Math.PI * 2;
				const rad = 5 + Math.random() * 5;
				generated_targets.push(
					new THREE.Vector3(
						target_base.x + Math.cos(angle) * rad,
						2,
						target_base.z + Math.sin(angle) * rad
					)
				);
			}
		} else {
			for (let i = 0; i < 4; i++) {
				generated_targets.push(
					new THREE.Vector3(
						(Math.random() - 0.5) * 30,
						2,
						(Math.random() - 0.5) * 30
					)
				);
			}
		}
		return generated_targets;
	}

	// Update Enemy Logic
	update(dt, player_pos) {
		let direction = new THREE.Vector3();
		let current_speed = this.base_speed;

		if (this.alert === ALERT_LEVELS.III) {
			direction.subVectors(player_pos, this.object.position).normalize().setY(0);
			current_speed = this.run_speed;
			this.timer -= dt;
		} else {
			const target = this.targets[this.target_idx];
			if (this.object.position.distanceTo(target) < 1) {
				this.target_idx = (this.target_idx + 1) % this.targets.length;
			}
			direction.subVectors(target, this.object.position).normalize().setY(0);
			current_speed = this.base_speed;

			if (this.alert === ALERT_LEVELS.II) {
				this.object.rotation.y += dt * 5;
				this.timer -= dt;
			}
		}

		this.object.lookAt(this.object.position.clone().add(direction));

		if (current_speed > 0) {
			const requested_move = direction.clone().multiplyScalar(current_speed * dt);
			if (requested_move.lengthSq() > 0.0001) {
				const dir_x = new THREE.Vector3(Math.sign(requested_move.x), 0, 0);
				const origin_x = this.object.position
					.clone()
					.add(dir_x.clone().multiplyScalar(ENEMY_RADIUS));
				raycaster_horizontal.set(origin_x, dir_x);
				let hits_x = city_mesh
					? raycaster_horizontal.intersectObject(city_mesh)
					: [];
				if (
					hits_x.length > 0 &&
					hits_x[0].distance < Math.abs(requested_move.x) + ENEMY_RADIUS
				) {
					if (hits_x[0].distance > 0.01)
						requested_move.x = hits_x[0].distance * Math.sign(requested_move.x);
					else requested_move.x = 0;
				}

				const dir_z = new THREE.Vector3(0, 0, Math.sign(requested_move.z));
				const origin_z = this.object.position
					.clone()
					.add(dir_z.clone().multiplyScalar(ENEMY_RADIUS));
				raycaster_horizontal.set(origin_z, dir_z);
				let hits_z = city_mesh
					? raycaster_horizontal.intersectObject(city_mesh)
					: [];
				if (
					hits_z.length > 0 &&
					hits_z[0].distance < Math.abs(requested_move.z) + ENEMY_RADIUS
				) {
					if (hits_z[0].distance > 0.01)
						requested_move.z = hits_z[0].distance * Math.sign(requested_move.z);
					else requested_move.z = 0;
				}
			}
			this.object.position.add(requested_move);
		}

		if (this.alert !== ALERT_LEVELS.I) {
			this.shoot_timer -= dt;
			const distance_to_player = this.object.position.distanceTo(player_pos);

			if (this.shoot_timer <= 0 && distance_to_player < 30) {
				const shoot_dir = player_pos.clone().sub(this.object.position).normalize();
				raycaster_shoot.set(this.object.position, shoot_dir);
				const line_of_sight_hits = city_mesh
					? raycaster_shoot.intersectObject(city_mesh)
					: [];

				if (
					line_of_sight_hits.length === 0 ||
					line_of_sight_hits[0].distance > distance_to_player
				) {
					this.shoot(player_pos);
					this.shoot_timer = this.shoot_rate + Math.random();
				}
			}
		}

		this.chatter_timer -= dt;
		if (this.chatter_timer <= 0) {
			let pool = SENTENCES_NORMAL;
			if (this.alert === ALERT_LEVELS.II) pool = SENTENCES_SEARCH;
			if (this.alert === ALERT_LEVELS.III) pool = SENTENCES_PURSUIT;
			this.talk(pool[Math.floor(Math.random() * pool.length)]);
			this.chatter_timer = Math.random() * 20 + 10;
		}

		const distance_to_player = this.object.position.distanceTo(player_pos);
		if (
			distance_to_player < this.detection_radius &&
			this.alert !== ALERT_LEVELS.III
		) {
			const ray_to_player = new THREE.Raycaster(
				this.object.position,
				player_pos.clone().sub(this.object.position).normalize(),
				0.1,
				distance_to_player
			);
			if (ray_to_player.intersectObject(city_mesh).length === 0) {
				this.setAlert(ALERT_LEVELS.III);
			}
		}

		if (this.timer <= 0) {
			if (this.alert === ALERT_LEVELS.III) this.setAlert(ALERT_LEVELS.II);
			else if (this.alert === ALERT_LEVELS.II) this.setAlert(ALERT_LEVELS.I);
		}

		if (this.speech.style.display === "block") {
			const vector_projected = this.object.position
				.clone()
				.setY(3)
				.project(camera);
			if (vector_projected.z < 1) {
				this.speech.style.left =
					(vector_projected.x * 0.5 + 0.5) * window.innerWidth + "px";
				this.speech.style.top =
					(-vector_projected.y * 0.5 + 0.5) * window.innerHeight + "px";
			} else {
				this.speech.style.display = "none";
			}
		}
	}

	// Fire Bullet
	shoot(target_pos) {
		audio_controller.playSfx("shoot");

		const bullet_geometry = new THREE.SphereGeometry(0.2, 8, 8);
		const bullet_material = new THREE.MeshBasicMaterial({ color: 0xff0044 });
		const bullet = new THREE.Mesh(bullet_geometry, bullet_material);

		const start_pos = this.object.position
			.clone()
			.add(
				target_pos.clone().sub(this.object.position).normalize().multiplyScalar(1)
			);

		bullet.position.copy(start_pos);
		bullet.userData.velocity = target_pos
			.clone()
			.sub(start_pos)
			.normalize()
			.multiplyScalar(BULLET_SPEED);

		bullet.userData.birth = Date.now();
		bullet.userData.is_enemy_bullet = true;

		scene.add(bullet);
		bullets.push(bullet);
	}

	// Set Enemy Alert Level
	setAlert(lvl) {
		if (this.alert === lvl) return;
		this.alert = lvl;

		this.object.material.color.set(
			lvl === ALERT_LEVELS.I
				? GAME_STATE.enemy_color
				: lvl === ALERT_LEVELS.II
				? ENV_COLORS.II.light
				: ENV_COLORS.III.light
		);

		if (lvl === ALERT_LEVELS.III) {
			this.timer = GAME_STATE.pursuit_duration;
			this.talk(
				SENTENCES_FOUND[Math.floor(Math.random() * SENTENCES_FOUND.length)]
			);
			setGameAlert(ALERT_LEVELS.III);
		}

		if (lvl === ALERT_LEVELS.II) {
			this.timer = GAME_STATE.alert_duration;
			this.talk(
				SENTENCES_SEARCH[Math.floor(Math.random() * SENTENCES_SEARCH.length)]
			);
		}
	}

	// Enemy Voice Dialogue
	talk(text) {
		this.speech.innerText = `${this.name}: ${text}`;
		this.speech.style.display = "block";
		playVoice(text, 1.0, 1.0, this.assigned_voice);
		setTimeout(() => (this.speech.style.display = "none"), 3000);
	}

	// Enemy Destruction Protocol
	die() {
		this.talk(
			SENTENCES_DEATH[Math.floor(Math.random() * SENTENCES_DEATH.length)]
		);

		audio_controller.playSfx("destroy");

		const score_multiplier = getScoreMultiplier();

		// SCORING: +10 per enemy
		GAME_STATE.score += SCORE_VALUES.ENEMY_DESTROYED * score_multiplier;
		GAME_STATE.enemies_remaining--;

		const drop = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.5, 0.5),
			new THREE.MeshBasicMaterial({
				color: 0xffff00,
				wireframe: true
			})
		);
		drop.position.copy(this.object.position);
		drop.position.y = 0.5;
		drop.rotation.y = Math.random() * Math.PI;
		ammo_drop_group.add(drop);

		// Trigger particle explosion on death
		createExplosionParticles(this.object.position, this.object.material.color);

		enemy_group.remove(this.object);
		this.speech.remove();
		updateHud(0); // Update HUD immediately to reflect enemy count change
	}
}

// Initialize THREE.js Scene and Controls
function init() {
	const container = document.getElementById("canvas-container");
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x2f3e46);
	scene.fog = new THREE.FogExp2(0x2f3e46, 0.015);
	clock = new THREE.Clock();

	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		500
	);
	player_object.add(camera);
	player_object.position.set(0, PLAYER_HEIGHT, 0);
	scene.add(player_object);
	scene.add(explosion_group);

	const part_geo = new THREE.BufferGeometry();
	const part_count = 2000;
	const pos = new Float32Array(part_count * 3);
	const vel = new Float32Array(part_count * 3);
	for (let i = 0; i < part_count * 3; i++) {
		pos[i] = (Math.random() - 0.5) * 300;
		vel[i] = (Math.random() - 0.5) * 0.1;
	}
	part_geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
	part_geo.setAttribute("velocity", new THREE.BufferAttribute(vel, 3));
	particle_system = new THREE.Points(
		part_geo,
		new THREE.PointsMaterial({
			color: 0x29ff7a,
			size: 0.5,
			transparent: true,
			opacity: 0.6
		})
	);
	scene.add(particle_system);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	if (container) container.appendChild(renderer.domElement);

	composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));

	bloom_pass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		1.5,
		0.4,
		0.85
	);
	bloom_pass.threshold = 0;
	bloom_pass.strength = 0.4;
	bloom_pass.radius = 0.2;
	composer.addPass(bloom_pass);

	rgb_shift_pass = new ShaderPass(RGBShiftShader);
	rgb_shift_pass.uniforms["amount"].value = 0.0015;
	composer.addPass(rgb_shift_pass);

	glitch_pass = new GlitchPass();
	glitch_pass.enabled = false;
	composer.addPass(glitch_pass);

	ambient_light = new THREE.AmbientLight(0x406060, 2.0);
	scene.add(ambient_light);
	directional_light = new THREE.DirectionalLight(0xaaddff, 3.0);
	directional_light.position.set(50, 100, 50);
	scene.add(directional_light);

	floor_material = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		roughness: 0.4,
		emissive: 0x001111
	});

	pointer_lock_controls = {
		is_locked: false,
		yaw: player_object
	};

	if ("speechSynthesis" in window) {
		populateVoiceCache();
		window.speechSynthesis.onvoiceschanged = populateVoiceCache;
	}

	document.addEventListener("mousemove", (e) => {
		if (
			GAME_STATE.mode === GAME_MODE.PLAYING &&
			pointer_lock_controls.is_locked
		) {
			player_object.rotation.y -= e.movementX * 0.002;
			camera.rotation.x =
				Math.max(-1.5, Math.min(1.5, camera.rotation.x - e.movementY * 0.002)) %
				360;
		}
	});

	window.addEventListener("mousedown", () => {
		if (GAME_STATE.mode === GAME_MODE.PLAYING && pointer_lock_controls.is_locked)
			playerShoot();
	});

	window.addEventListener("blur", () => {
		if (GAME_STATE.mode === GAME_MODE.PLAYING) togglePause();
	});

	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		composer.setSize(window.innerWidth, window.innerHeight);
	});

	const set_key = (key, value) => {
		const k = key.toLowerCase();
		if (k === "w") keys.w = value;
		if (k === "a") keys.a = value;
		if (k === "s") keys.s = value;
		if (k === "d") keys.d = value;
		if (k === " ") {
			if (value && MOVEMENT.on_ground) MOVEMENT.velocity.y = MOVEMENT.jump_force;
		}
		if (k === "shift") keys.shift = value;
		if (k === "p" && value) togglePause();
	};

	document.addEventListener("keydown", (e) => set_key(e.key, true));
	document.addEventListener("keyup", (e) => set_key(e.key, false));

	document.addEventListener("pointerlockchange", () => {
		pointer_lock_controls.is_locked = !!document.pointerLockElement;
		if (
			!pointer_lock_controls.is_locked &&
			GAME_STATE.mode === GAME_MODE.PLAYING
		) {
			if (GAME_STATE.is_transitioning) return;
			togglePause(true);
		}
	});

	window.addEventListener("gamepadconnected", (e) => {
		gamepad_index = e.gamepad.index;
	});

	window.addEventListener("gamepaddisconnected", (e) => {
		if (gamepad_index === e.gamepad.index) gamepad_index = -1;
	});

	function updateGameStateFromUi() {
		GAME_STATE.enemies_total = parseInt(
			document.getElementById("enemies-range")?.value || GAME_STATE.enemies_total
		);
		GAME_STATE.packets_total = parseInt(
			document.getElementById("packets-range")?.value || GAME_STATE.packets_total
		);
		GAME_STATE.complexity = parseInt(
			document.getElementById("complexity-range")?.value || GAME_STATE.complexity
		);
		GAME_STATE.grid_size = parseInt(
			document.getElementById("grid-size-range")?.value || GAME_STATE.grid_size
		);
		GAME_STATE.ai_difficulty = parseInt(
			document.getElementById("diff-range")?.value || GAME_STATE.ai_difficulty
		);
		GAME_STATE.start_ammo = parseInt(
			document.getElementById("ammo-range")?.value || GAME_STATE.start_ammo
		);
		GAME_STATE.ammo_drop_amount = parseInt(
			document.getElementById("drop-range")?.value || GAME_STATE.ammo_drop_amount
		);

		// Read Gameplay Tuning parameters (now visible in HTML)
		GAME_STATE.alert_duration = parseFloat(
			document.getElementById("alert-dur-range")?.value ||
				GAME_STATE.alert_duration
		);
		GAME_STATE.pursuit_duration = parseFloat(
			document.getElementById("pursuit-dur-range")?.value ||
				GAME_STATE.pursuit_duration
		);

		GAME_STATE.player_base_speed = parseFloat(
			document.getElementById("walk-speed-range")?.value ||
				GAME_STATE.player_base_speed
		);
		GAME_STATE.player_run_speed = parseFloat(
			document.getElementById("sprint-speed-range")?.value ||
				GAME_STATE.player_run_speed
		);
		GAME_STATE.enemy_base_speed = parseFloat(
			document.getElementById("enemy-speed-range")?.value ||
				GAME_STATE.enemy_base_speed
		);

		// Read Enemy Pursuit Multiplier
		GAME_STATE.enemy_pursuit_multiplier = parseFloat(
			document.getElementById("pursuit-mult-range")?.value ||
				GAME_STATE.enemy_pursuit_multiplier
		);

		// Weapon Reload Time conversion (seconds to milliseconds)
		const reload_time_sec = parseFloat(
			document.getElementById("reload-time-range")?.value ||
				GAME_STATE.weapon_reload_time / 1000
		);
		GAME_STATE.weapon_reload_time = reload_time_sec * 1000;

		const color_normal = document.getElementById("color-normal")?.value;
		if (color_normal) ENV_COLORS.I.light.set(color_normal);

		const color_search = document.getElementById("color-search")?.value;
		if (color_search) ENV_COLORS.II.light.set(color_search);

		const color_pursuit = document.getElementById("color-pursuit")?.value;
		if (color_pursuit) ENV_COLORS.III.light.set(color_pursuit);

		const enemy_color = document.getElementById("enemy-color-input")?.value;
		if (enemy_color) GAME_STATE.enemy_color.set(enemy_color);

		const packet_color = document.getElementById("packet-color-input")?.value;
		if (packet_color) GAME_STATE.packet_color.set(packet_color);
	}

	const start_btn = document.getElementById("start-btn");
	if (start_btn) {
		start_btn.onclick = () => {
			updateGameStateFromUi();
			let input_name =
				document.getElementById("player-name-input")?.value.trim() || "";

			if (!input_name) {
				try {
					input_name =
						localStorage.getItem(GAME_STATE.storage_key_name) ||
						AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
				} catch (e) {
					input_name = "Agent";
				}
			}

			try {
				localStorage.setItem(GAME_STATE.storage_key_name, input_name);
			} catch (e) {}

			GAME_STATE.player_name = input_name;
			const agent_name_el = document.getElementById("agent-name");
			if (agent_name_el) agent_name_el.innerText = input_name;

			audio_controller.init();
			startGame(true);
		};
	}

	const config_btn = document.getElementById("config-btn");
	const main_menu = document.getElementById("main-menu");
	const config_menu = document.getElementById("config-menu");
	if (config_btn) {
		config_btn.onclick = () => {
			GAME_STATE.mode = GAME_MODE.CONFIG;
			if (main_menu) main_menu.style.display = "none";
			if (config_menu) config_menu.style.display = "flex";
		};
	}

	const config_back_btn = document.getElementById("config-back-btn");
	if (config_back_btn) {
		config_back_btn.onclick = () => {
			updateGameStateFromUi();
			showMenu();
		};
	}

	const resume_btn = document.getElementById("resume-btn");
	resume_btn?.addEventListener("click", () => {
		console.log("Resume button clicked");
		togglePause();
	});

	const restart_btn = document.getElementById("restart-btn");
	if (restart_btn) {
		restart_btn.onclick = () => {
			togglePause();
			startGame(true);
			console.log("Resume button clicked 2");
		};
	}

	const menu_btn = document.getElementById("menu-btn");
	if (menu_btn) {
		menu_btn.onclick = () => {
			togglePause();
			showMenu();
		};
	}

	const retry_btn = document.getElementById("retry-btn");
	if (retry_btn) {
		retry_btn.onclick = () => {
			const game_over_title = document.getElementById("game-over-title");
			if (game_over_title && game_over_title.innerText.includes("COMPLETE")) {
				GAME_STATE.current_level++;
			}
			startGame(false);
		};
	}

	const go_home_btn = document.getElementById("go-home-btn");
	if (go_home_btn) go_home_btn.onclick = showMenu;

	try {
		const stored_name = localStorage.getItem(GAME_STATE.storage_key_name);
		const player_name_input = document.getElementById("player-name-input");
		if (stored_name && player_name_input) player_name_input.value = stored_name;
	} catch (e) {}

	showMenu();
	animate();
}

// Player Fires Weapon
function playerShoot() {
	if (GAME_STATE.player_ammo <= 0) return;
	const now = Date.now();

	if (now - GAME_STATE.last_shot_time < GAME_STATE.weapon_reload_time) return;

	GAME_STATE.last_shot_time = now;
	GAME_STATE.player_ammo--;
	updateHud(0);
	audio_controller.playSfx("shoot");

	const bullet_geometry = new THREE.SphereGeometry(0.2, 8, 8);
	const bullet_material = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
	const bullet = new THREE.Mesh(bullet_geometry, bullet_material);

	const start_pos = camera.getWorldPosition(new THREE.Vector3());
	bullet.position.copy(start_pos);
	bullet.position.y -= 0.2;
	const direction = new THREE.Vector3();
	camera.getWorldDirection(direction);

	bullet.userData.velocity = direction.multiplyScalar(BULLET_SPEED);
	bullet.userData.birth = now;

	scene.add(bullet);
	bullets.push(bullet);
}

// Update Bullet Physics and Collisions
function updateBullets(dt) {
	const now = Date.now();

	for (let i = bullets.length - 1; i >= 0; i--) {
		const bullet = bullets[i];
		const move = bullet.userData.velocity.clone().multiplyScalar(dt);
		bullet.position.add(move);

		if (now - bullet.userData.birth > 5000) {
			scene.remove(bullet);
			bullets.splice(i, 1);
			continue;
		}

		if (city_mesh) {
			const wall_ray = new THREE.Raycaster(
				bullet.position.clone().sub(move),
				move.clone().normalize(),
				0,
				move.length()
			);
			if (wall_ray.intersectObject(city_mesh).length > 0) {
				scene.remove(bullet);
				bullets.splice(i, 1);
				continue;
			}
		}

		let hit_target = false;

		if (bullet.userData.is_enemy_bullet) {
			const player_position_center = player_object.position
				.clone()
				.setY(PLAYER_HEIGHT);
			if (bullet.position.distanceTo(player_position_center) < 1) {
				if (Date.now() > GAME_STATE.invulnerable_until) takeDamage();
				hit_target = true;
			}
		} else {
			for (let j = 0; j < enemy_group.children.length; j++) {
				const enemy_mesh = enemy_group.children[j];
				if (bullet.position.distanceTo(enemy_mesh.position) < 1.5) {
					enemy_mesh.userData.instance.die();
					hit_target = true;

					const hit_marker = document.getElementById("hit-marker");
					if (hit_marker) {
						hit_marker.style.opacity = 1;
						setTimeout(() => (hit_marker.style.opacity = 0), 100);
					}
					break;
				}
			}
		}

		if (hit_target) {
			scene.remove(bullet);
			bullets.splice(i, 1);
		}
	}
}

// Process Player Damage
function takeDamage() {
	GAME_STATE.lives--;
	audio_controller.playSfx("damage");
	doRumble(300, 0.5, 0.8);

	GAME_STATE.invulnerable_until = Date.now() + 2000;

	const damage_overlay = document.getElementById("damage-overlay");
	if (damage_overlay) {
		damage_overlay.style.opacity = 1;
		setTimeout(() => (damage_overlay.style.opacity = 0), 200);
	}

	if (glitch_pass) {
		glitch_pass.enabled = true;
		setTimeout(() => (glitch_pass.enabled = false), 500);
	}

	if (GAME_STATE.lives <= 0) gameOver(false);
}

// Check Safe Spawn Location
function isSafeSpawn(x, z) {
	for (let building_bounds of city_bounds) {
		if (
			x >= building_bounds.minX - 2 &&
			x <= building_bounds.maxX + 2 &&
			z >= building_bounds.minZ - 2 &&
			z <= building_bounds.maxZ + 2
		)
			return false;
	}
	return true;
}

// Create Game Level Environment
function createLevel() {
	const groups_to_clear = [
		enemy_group,
		packet_group,
		ammo_drop_group,
		explosion_group
	];
	groups_to_clear.forEach((group) => {
		while (group.children.length) group.remove(group.children[0]);
	});
	bullets.forEach((b) => scene.remove(b));
	bullets = [];
	if (city_mesh) scene.remove(city_mesh);
	if (floor_mesh) scene.remove(floor_mesh);
	city_bounds = [];

	const current_level_num = GAME_STATE.current_level;
	const base_config = GAME_STATE.BASE_CONFIG;

	// Calculate current parameters based on level scaling rules
	if (base_config) {
		const level_inc = current_level_num - 1;

		// 1. +1 enemy every 3 levels
		const enemies_inc = Math.floor(level_inc / 3);
		const current_enemies = base_config.enemies_total + enemies_inc;

		// 2. +1 target every 2 levels
		const packets_inc = Math.floor(level_inc / 2);
		const current_packets = base_config.packets_total + packets_inc;

		// 3. +1 speed enemy every 1 level
		const current_enemy_speed = base_config.enemy_base_speed + level_inc * 1.0;

		// 4. +1 difficulty every 1 level
		const current_difficulty = base_config.ai_difficulty + level_inc * 1.0;

		// 5. +1 sec alerts every 1 level
		const current_alert_duration = base_config.alert_duration + level_inc * 1.0;
		// Also scale pursuit duration for game coherence
		const current_pursuit_duration =
			base_config.pursuit_duration + level_inc * 1.0;

		// Apply scaled values to GAME_STATE
		GAME_STATE.enemies_total = current_enemies;
		GAME_STATE.packets_total = current_packets;
		GAME_STATE.enemy_base_speed = current_enemy_speed;
		GAME_STATE.ai_difficulty = current_difficulty;
		GAME_STATE.alert_duration = current_alert_duration;
		GAME_STATE.pursuit_duration = current_pursuit_duration;

		// Keeping grid size simple (linear scaling)
		GAME_STATE.grid_size = base_config.grid_size + level_inc * 2;
	}

	const level_display = document.getElementById("level-display-br");
	if (level_display)
		level_display.innerText = "LEVEL " + GAME_STATE.current_level;
	const diff_display = document.getElementById("diff-display-br");
	// Display the currently scaled difficulty value
	if (diff_display) diff_display.innerText = GAME_STATE.ai_difficulty.toFixed(0);

	const packets_total_el = document.getElementById("packets-total");
	if (packets_total_el) packets_total_el.innerText = GAME_STATE.packets_total;

	const world_range = GAME_STATE.grid_size;
	const floor_size = world_range * 3;

	const grid_texture = createVrGridTexture(
		"#" + ENV_COLORS.I.light.getHexString()
	);
	grid_texture.repeat.set(world_range / 5, world_range / 5);

	floor_material.map = grid_texture;
	floor_material.needsUpdate = true;

	const floor = new THREE.Mesh(
		new THREE.PlaneGeometry(floor_size, floor_size),
		floor_material
	);
	floor.rotation.x = -Math.PI / 2;
	scene.add(floor);
	floor_mesh = floor;

	const geometry = new THREE.BoxGeometry(1, 1, 1);
	geometry.translate(0, 0.5, 0);
	const block_texture = createBlockTexture(
		"#" + ENV_COLORS.I.light.getHexString()
	);
	const material = new THREE.MeshStandardMaterial({
		color: 0x888888,
		map: block_texture,
		roughness: 0.2,
		metalness: 0.6,
		emissive: 0x020508
	});

	const instances = [];
	const spacing = 12;
	const cells = Math.floor(world_range / spacing);

	for (let x = -cells; x <= cells; x++) {
		for (let z = -cells; z <= cells; z++) {
			if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
			if (Math.random() > GAME_STATE.complexity / 100.0) continue;

			const s = 4 + Math.random() * 4;
			const h = 4 + Math.random() * 20;
			const px = x * spacing;
			const pz = z * spacing;

			instances.push({ x: px, z: pz, s: s, h: h });
			city_bounds.push({
				minX: px - s / 2,
				maxX: px + s / 2,
				minZ: pz - s / 2,
				maxZ: pz + s / 2
			});
		}
	}

	if (instances.length > 0) {
		city_mesh = new THREE.InstancedMesh(geometry, material, instances.length);
		const dummy = new THREE.Object3D();
		instances.forEach((d, i) => {
			dummy.position.set(d.x, 0, d.z);
			dummy.scale.set(d.s, d.h, d.s);
			dummy.updateMatrix();
			city_mesh.setMatrixAt(i, dummy.matrix);
		});
		scene.add(city_mesh);
	} else {
		city_mesh = new THREE.Mesh();
		scene.add(city_mesh);
	}

	const packet_positions = [];
	for (let i = 0; i < GAME_STATE.packets_total; i++) {
		let px,
			pz,
			safe = false;
		while (!safe) {
			px = (Math.random() - 0.5) * world_range;
			pz = (Math.random() - 0.5) * world_range;
			if (isSafeSpawn(px, pz)) safe = true;
		}

		const packet_mesh = new THREE.Mesh(
			new THREE.IcosahedronGeometry(0.8, 0),
			new THREE.MeshBasicMaterial({
				color: GAME_STATE.packet_color,
				wireframe: true
			})
		);
		packet_mesh.position.set(px, 2, pz);
		packet_group.add(packet_mesh);
		packet_positions.push(new THREE.Vector3(px, 2, pz));
	}
	scene.add(packet_group);

	// Enemy Name and Voice Assignment Pools
	const available_enemy_names = [...AI_NAMES];
	const voice_pool = [...TARGET_VOICES];

	for (let i = 0; i < GAME_STATE.enemies_total; i++) {
		let ex,
			ez,
			safe = false;
		while (!safe) {
			ex = (Math.random() - 0.5) * world_range;
			ez = (Math.random() - 0.5) * world_range;
			if (isSafeSpawn(ex, ez) && Math.sqrt(ex * ex + ez * ez) > 30) safe = true;
		}

		// Assign unique name from the pool
		let enemy_name = "Unit-" + (i + 1);
		if (available_enemy_names.length > 0) {
			const name_index = Math.floor(Math.random() * available_enemy_names.length);
			enemy_name = available_enemy_names.splice(name_index, 1)[0];
		}

		// Assign unique voice from the pool
		let voice = null;
		if (voice_pool.length)
			voice = voice_pool.splice(
				Math.floor(Math.random() * voice_pool.length),
				1
			)[0];
		else voice = TARGET_VOICES[i % TARGET_VOICES.length];

		new Enemy(new THREE.Vector3(ex, 2, ez), enemy_name, packet_positions, voice);
	}
	scene.add(enemy_group);
	scene.add(ammo_drop_group);

	GAME_STATE.enemies_remaining = enemy_group.children.length;

	const penalty = Math.floor((GAME_STATE.current_level - 1) / 4);
	GAME_STATE.player_ammo = Math.max(1, GAME_STATE.start_ammo - penalty);
}

// Update Player Physics
function updatePhysics(dt) {
	dt = Math.min(dt, 0.05);
	MOVEMENT.velocity.y -= MOVEMENT.gravity * dt;

	const previous_pos = player_object.position.clone();

	const forward_vector = new THREE.Vector3(0, 0, -1)
		.applyQuaternion(player_object.quaternion)
		.setY(0)
		.normalize();
	const right_vector = new THREE.Vector3(1, 0, 0)
		.applyQuaternion(player_object.quaternion)
		.setY(0)
		.normalize();

	const input_vector = new THREE.Vector3();

	if (Math.abs(gamepad_lx) > 0.2 || Math.abs(gamepad_ly) > 0.2) {
		input_vector.addScaledVector(right_vector, gamepad_lx);
		input_vector.addScaledVector(forward_vector, -gamepad_ly);
	} else {
		if (keys.w) input_vector.add(forward_vector);
		if (keys.s) input_vector.sub(forward_vector);
		if (keys.d) input_vector.add(right_vector);
		if (keys.a) input_vector.sub(right_vector);
	}

	input_vector.normalize();

	const current_speed = keys.shift
		? GAME_STATE.player_run_speed
		: GAME_STATE.player_base_speed;

	MOVEMENT.velocity.x = input_vector.x * current_speed;
	MOVEMENT.velocity.z = input_vector.z * current_speed;

	if (Math.abs(gamepad_lx) > 0.2 || Math.abs(gamepad_ly) > 0.2) {
		const magnitude = Math.min(
			1.0,
			Math.sqrt(gamepad_lx * gamepad_lx + gamepad_ly * gamepad_ly)
		);
		MOVEMENT.velocity.x *= magnitude;
		MOVEMENT.velocity.z *= magnitude;
	}

	if (Math.abs(MOVEMENT.velocity.x) > 0.001) {
		const direction_x = new THREE.Vector3(Math.sign(MOVEMENT.velocity.x), 0, 0);
		const ray_x = new THREE.Raycaster(player_object.position, direction_x);
		const hits_x = city_mesh ? ray_x.intersectObject(city_mesh) : [];
		if (hits_x.length > 0 && hits_x[0].distance < PLAYER_RADIUS + 0.5)
			MOVEMENT.velocity.x = 0;
	}
	player_object.position.x += MOVEMENT.velocity.x * dt;

	if (Math.abs(MOVEMENT.velocity.z) > 0.001) {
		const direction_z = new THREE.Vector3(0, 0, Math.sign(MOVEMENT.velocity.z));
		const ray_z = new THREE.Raycaster(player_object.position, direction_z);
		const hits_z = city_mesh ? ray_z.intersectObject(city_mesh) : [];
		if (hits_z.length > 0 && hits_z[0].distance < PLAYER_RADIUS + 0.5)
			MOVEMENT.velocity.z = 0;
	}
	player_object.position.z += MOVEMENT.velocity.z * dt;

	const limit = GAME_STATE.grid_size * 1.5;
	player_object.position.x = Math.max(
		-limit,
		Math.min(limit, player_object.position.x)
	);
	player_object.position.z = Math.max(
		-limit,
		Math.min(limit, player_object.position.z)
	);

	player_object.position.y += MOVEMENT.velocity.y * dt;

	if (player_object.position.y < PLAYER_HEIGHT) {
		player_object.position.y = PLAYER_HEIGHT;
		MOVEMENT.velocity.y = 0;
		MOVEMENT.on_ground = true;
	} else MOVEMENT.on_ground = false;

	const score_multiplier = getScoreMultiplier();

	// SCORING: +0.25 per step (distance unit)
	const current_pos = player_object.position;
	const distance_moved = previous_pos.distanceTo(current_pos);
	GAME_STATE.score +=
		distance_moved * SCORE_VALUES.DISTANCE_UNIT * score_multiplier;
}

// Update Game State and Environment
function updateGame(dt) {
	const score_multiplier = getScoreMultiplier();

	// SCORING: +0.25 per second
	GAME_STATE.score += dt * SCORE_VALUES.TIME_PER_SECOND * score_multiplier;

	const transition_speed = dt * 2;
	if (floor_material && floor_material.emissive)
		floor_material.emissive.lerp(GAME_STATE.target_floor_color, transition_speed);
	if (scene.background)
		scene.background.lerp(GAME_STATE.target_bg_color, transition_speed);
	if (scene.fog && scene.fog.color)
		scene.fog.color.lerp(GAME_STATE.target_fog_color, transition_speed);
	if (ambient_light)
		ambient_light.color.lerp(GAME_STATE.target_light_color, transition_speed);
	if (directional_light)
		directional_light.color.lerp(GAME_STATE.target_light_color, transition_speed);

	const rgb_shift_amount =
		GAME_STATE.alert_level === "II"
			? 0.003
			: GAME_STATE.alert_level === "III"
			? 0.006
			: 0.0015;

	if (rgb_shift_pass)
		rgb_shift_pass.uniforms["amount"].value = 0.0015 + rgb_shift_amount;

	if (glitch_pass && GAME_STATE.alert_level === "III" && Math.random() > 0.99) {
		glitch_pass.enabled = true;
		setTimeout(() => (glitch_pass.enabled = false), 200);
	}

	if (GAME_STATE.alert_level === "III" && Math.random() > 0.9)
		camera.position.set(
			(Math.random() - 0.5) * 0.2,
			(Math.random() - 0.5) * 0.2,
			(Math.random() - 0.5) * 0.2
		);
	else camera.position.set(0, 0, 0);

	if (particle_system) {
		const pos = particle_system.geometry.attributes.position.array;
		const count = pos.length / 3;
		const color_hex =
			GAME_STATE.alert_level === "I"
				? ENV_COLORS.I.light.getHex()
				: GAME_STATE.alert_level === "II"
				? ENV_COLORS.II.light.getHex()
				: ENV_COLORS.III.light.getHex();

		particle_system.material.color.setHex(color_hex);

		for (let i = 0; i < count; i++) {
			pos[i * 3 + 1] -= 0.2 + Math.random() * 0.1;
			if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 100;
		}
		particle_system.geometry.attributes.position.needsUpdate = true;
	}

	updateBullets(dt);
	updateExplosionParticles(dt);

	let max_alert = ALERT_LEVELS.I;
	let max_timer = 0;

	enemy_group.children.forEach((mesh) => {
		const enemy_instance = mesh.userData.instance;
		enemy_instance.update(dt, player_object.position);

		if (enemy_instance.alert === ALERT_LEVELS.III) {
			max_alert = ALERT_LEVELS.III;
			max_timer = Math.max(max_timer, enemy_instance.timer);
		} else if (
			enemy_instance.alert === ALERT_LEVELS.II &&
			max_alert !== ALERT_LEVELS.III
		) {
			max_alert = ALERT_LEVELS.II;
			max_timer = Math.max(max_timer, enemy_instance.timer);
		}
	});

	setGameAlert(max_alert);
	audio_controller.setMood(max_alert);

	for (let i = packet_group.children.length - 1; i >= 0; i--) {
		const packet = packet_group.children[i];
		packet.rotation.y += dt;
		packet.rotation.z += dt * 0.5;

		if (packet.position.distanceTo(player_object.position) < 2) {
			packet_group.remove(packet);
			GAME_STATE.packets_collected++;
			audio_controller.playSfx("packet");

			// SCORING: +30 per target (packet)
			const score_multiplier = getScoreMultiplier();
			GAME_STATE.score += SCORE_VALUES.PACKET_COLLECTED * score_multiplier;

			if (GAME_STATE.packets_collected >= GAME_STATE.packets_total) gameOver(true);
		}
	}

	for (let i = ammo_drop_group.children.length - 1; i >= 0; i--) {
		const drop = ammo_drop_group.children[i];
		drop.rotation.y += dt * 2;

		if (drop.position.distanceTo(player_object.position) < 2) {
			ammo_drop_group.remove(drop);
			GAME_STATE.player_ammo += GAME_STATE.ammo_drop_amount;
			audio_controller.playSfx("packet");
		}
	}

	if (Date.now() > GAME_STATE.invulnerable_until) {
		enemy_group.children.forEach((enemy_mesh) => {
			if (enemy_mesh.position.distanceTo(player_object.position) < 1.5)
				takeDamage();
		});
	}

	updateHud(max_timer);
}

// Set Global Game Alert State
function setGameAlert(lvl) {
	if (GAME_STATE.alert_level === lvl) return;
	GAME_STATE.alert_level = lvl;

	let color_hex = "#29ff7a";
	if (lvl === "I") color_hex = "#" + ENV_COLORS.I.light.getHexString();
	if (lvl === "II") color_hex = "#" + ENV_COLORS.II.light.getHexString();
	if (lvl === "III") color_hex = "#" + ENV_COLORS.III.light.getHexString();

	document.documentElement.style.setProperty("--active-color", color_hex);

	const alert_box = document.getElementById("alert-box");
	if (alert_box) {
		if (lvl === "III") alert_box.classList.add("pulse-anim");
		else alert_box.classList.remove("pulse-anim");
	}

	const alert_text = document.getElementById("alert-text");
	if (alert_text) alert_text.innerText = ALERT_DISPLAY_TEXT[lvl];

	if (ENV_COLORS[lvl]) {
		GAME_STATE.target_bg_color = ENV_COLORS[lvl].bg;
		GAME_STATE.target_fog_color = ENV_COLORS[lvl].fog;
		GAME_STATE.target_light_color = ENV_COLORS[lvl].light;
		GAME_STATE.target_floor_color = ENV_COLORS[lvl].floor;
	}
}

// Update Heads-Up Display (HUD)
function updateHud(timer) {
	const elapsed_seconds = Math.floor(
		(Date.now() - GAME_STATE.time_start) / 1000
	);
	const time_elapsed_el = document.getElementById("time-elapsed");
	if (time_elapsed_el) {
		time_elapsed_el.innerText = `${Math.floor(elapsed_seconds / 60)
			.toString()
			.padStart(2, "0")}:${(elapsed_seconds % 60).toString().padStart(2, "0")}`;
	}

	const packets_collected_el = document.getElementById("packets-collected");
	if (packets_collected_el)
		packets_collected_el.innerText = GAME_STATE.packets_collected;

	const score_display_el = document.getElementById("score-display");
	if (score_display_el)
		score_display_el.innerText = Math.floor(GAME_STATE.score);

	const score_multiplier = getScoreMultiplier();
	const score_mult_el = document.getElementById("score-multiplier");
	if (score_mult_el) {
		score_mult_el.innerText = `x${score_multiplier.toFixed(2)}`;
	}

	const enemies_remaining_el = document.getElementById("enemies-remaining");
	if (enemies_remaining_el)
		enemies_remaining_el.innerText = GAME_STATE.enemies_remaining;

	const ammo_display_el = document.getElementById("ammo-display");
	if (ammo_display_el) ammo_display_el.innerText = GAME_STATE.player_ammo;

	const alert_timer_el = document.getElementById("alert-timer");
	if (alert_timer_el)
		alert_timer_el.innerText = timer > 0 ? timer.toFixed(1) + "s" : "";

	const reload_msg_el = document.getElementById("reload-msg");
	if (reload_msg_el) {
		reload_msg_el.style.display =
			Date.now() - GAME_STATE.last_shot_time < GAME_STATE.weapon_reload_time
				? "inline"
				: "none";
	}

	const life_bar_fill_el = document.getElementById("life-bar-fill");
	if (life_bar_fill_el) {
		life_bar_fill_el.style.width = `${
			(GAME_STATE.lives / GAME_STATE.max_lives) * 100
		}%`;
	}

	const canvas = document.getElementById("radar-canvas");
	if (!canvas) return;

	const ctx = canvas.getContext("2d");
	canvas.width = 180;
	canvas.height = 180;
	const radar_center = 90;
	const radar_range = 80; // Outer grid circle radius

	ctx.fillStyle = "rgba(0,10,5,0.8)";
	ctx.fillRect(0, 0, 180, 180);

	const ui_color = getComputedStyle(document.body)
		.getPropertyValue("--active-color")
		.trim();

	// Draw Grid Circles
	ctx.strokeStyle = ui_color;
	ctx.globalAlpha = 0.3;
	ctx.beginPath();
	ctx.arc(radar_center, radar_center, 40, 0, 7);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(radar_center, radar_center, radar_range, 0, 7);
	ctx.stroke();
	ctx.globalAlpha = 1.0;

	// Draw Enemies
	enemy_group.children.forEach((enemy_mesh) => {
		const dx = enemy_mesh.position.x - player_object.position.x;
		const dz = enemy_mesh.position.z - player_object.position.z;
		if (Math.abs(dx) < radar_range && Math.abs(dz) < radar_range) {
			ctx.fillStyle =
				enemy_mesh.userData.instance.alert === ALERT_LEVELS.III
					? "#cb000c"
					: "#fb8500";
			ctx.fillRect(radar_center + dx - 3, radar_center + dz - 3, 6, 6);
		}
	});

	// Find Closest Packet and Draw Packets
	ctx.fillStyle = "#fff";
	let closest_dist = Infinity;
	let closest_packet = null;
	packet_group.children.forEach((packet_mesh) => {
		const dist = player_object.position.distanceTo(packet_mesh.position);
		if (dist < closest_dist) {
			closest_dist = dist;
			closest_packet = packet_mesh;
		}
		const dx = packet_mesh.position.x - player_object.position.x;
		const dz = packet_mesh.position.z - player_object.position.z;
		if (Math.abs(dx) < radar_range && Math.abs(dz) < radar_range) {
			ctx.beginPath();
			ctx.arc(radar_center + dx, radar_center + dz, 3, 0, 7);
			ctx.fill();
		}
	});

	// Draw Player Marker (Arrow)
	const rotation_y = player_object.rotation.y;
	ctx.save();
	ctx.translate(radar_center, radar_center);
	ctx.rotate(-rotation_y);
	ctx.fillStyle = ui_color;
	ctx.beginPath();
	ctx.moveTo(0, -6);
	ctx.lineTo(-4, 4);
	ctx.lineTo(4, 4);
	ctx.fill();
	ctx.restore();

	// Radar nearest target arrow indicator (Objective Arrow)
	if (closest_packet) {
		const dx = closest_packet.position.x - player_object.position.x;
		const dz = closest_packet.position.z - player_object.position.z;

		// Angle of the packet relative to the player (in world space)
		// We use -dz because the radar Y axis (up) corresponds to world negative Z (forward direction)
		const angle_to_packet = Math.atan2(dx, -dz);

		// Relative angle (packet direction minus player's current yaw rotation)
		// This calculates the angle the arrow needs to be rotated by relative to the player's view (rotation_y)
		const relative_angle = angle_to_packet - rotation_y;

		ctx.save();
		ctx.translate(radar_center, radar_center);
		ctx.rotate(relative_angle % 360);

		const arrow_start_radius = radar_range; // 80px (on the outer grid circle)
		const arrow_end_radius = 70; // 10px inside
		const arrow_size = 8;
		const indicator_color = "#00ffff"; // Cyan

		ctx.fillStyle = indicator_color;

		// Draw a solid triangle arrow pointing outwards at the player's current position (0, 0)
		ctx.beginPath();
		ctx.moveTo(0, -arrow_start_radius); // Point 1: At the edge of the radar circle (pointing 'up' relative to rotation)
		ctx.lineTo(arrow_size, -arrow_end_radius); // Point 2: Right side base
		ctx.lineTo(-arrow_size, -arrow_end_radius); // Point 3: Left side base
		ctx.closePath();
		ctx.fill();

		ctx.restore();
	}
}

// Toggle Pause State
function togglePause(force_pause) {
	const is_playing = GAME_STATE.mode === GAME_MODE.PLAYING;
	const pause_menu = document.getElementById("pause-menu");

	if (force_pause || is_playing) {
		if (GAME_STATE.mode !== GAME_MODE.PAUSED) {
			if (GAME_STATE.is_transitioning) return;

			GAME_STATE.mode = GAME_MODE.PAUSED;
			document.exitPointerLock();

			if (pause_menu) {
				pause_menu.style.display = "flex";
			}

			audio_controller.suspend();
			updateSocialsVisibility();
		}
	} else if (GAME_STATE.mode === GAME_MODE.PAUSED) {
		GAME_STATE.is_transitioning = true;

		try {
			renderer.domElement.requestPointerLock();
		} catch (e) {}

		GAME_STATE.mode = GAME_MODE.PLAYING;

		if (pause_menu) {
			pause_menu.style.display = "none";
		}

		audio_controller.resume();
		updateSocialsVisibility();

		setTimeout(() => {
			GAME_STATE.is_transitioning = false;
		}, 200);
	}
}

// Start Game Protocol
function startGame(reset_level) {
	GAME_STATE.lives = GAME_STATE.max_lives;
	GAME_STATE.packets_collected = 0;
	GAME_STATE.total_distance_moved = 0;
	GAME_STATE.time_start = Date.now();

	if (reset_level) {
		GAME_STATE.current_level = 1;
		GAME_STATE.score = 0; // Reset score only on a completely new game or restart

		// Capture Level 1 base configuration derived from UI settings
		GAME_STATE.BASE_CONFIG = {
			enemies_total: GAME_STATE.enemies_total,
			packets_total: GAME_STATE.packets_total,
			ai_difficulty: GAME_STATE.ai_difficulty,
			enemy_base_speed: GAME_STATE.enemy_base_speed,
			alert_duration: GAME_STATE.alert_duration,
			pursuit_duration: GAME_STATE.pursuit_duration,
			grid_size: GAME_STATE.grid_size
		};
	}

	const menu_ids = [
		"main-menu",
		"config-menu",
		"info-modal-overlay",
		"game-over-menu",
		"pause-menu"
	];
	menu_ids.forEach((id) => {
		const el = document.getElementById(id);
		if (el) el.style.display = "none";
	});

	try {
		renderer.domElement.requestPointerLock();
	} catch (e) {}

	createLevel();
	GAME_STATE.mode = GAME_MODE.PLAYING;
	audio_controller.resume();
	updateSocialsVisibility();
}

// Show Main Menu Interface
function showMenu() {
	GAME_STATE.mode = GAME_MODE.MENU;

	const main_menu = document.getElementById("main-menu");
	if (main_menu) {
		main_menu.style.display = "flex";
	}

	const hidden_menu_ids = [
		"config-menu",
		"info-modal-overlay",
		"pause-menu",
		"game-over-menu"
	];
	hidden_menu_ids.forEach((id) => {
		const el = document.getElementById(id);
		if (el) el.style.display = "none";
	});

	document.exitPointerLock();
	updateSocialsVisibility();
}

// Process Game Over Event
function gameOver(win) {
	GAME_STATE.mode = GAME_MODE.GAMEOVER;
	document.exitPointerLock();
	updateSocialsVisibility();

	if (win) audio_controller.playJingle("win");
	else audio_controller.playJingle("lose");

	const title = document.getElementById("game-over-title");
	const message = document.getElementById("game-over-msg");
	const retry_button = document.getElementById("retry-btn");

	if (win) {
		const score_multiplier = getScoreMultiplier();

		// SCORING: +100 per level
		GAME_STATE.score += SCORE_VALUES.LEVEL_COMPLETE * score_multiplier;

		if (title) title.innerText = "MISSION COMPLETE";
		if (message) message.innerText = "DATA SECURED - ADVANCING...";
		if (retry_button) retry_button.innerText = "NEXT LEVEL";
		document.documentElement.style.setProperty("--active-color", "#29ff7a");

		setTimeout(() => {
			if (GAME_STATE.mode === GAME_MODE.GAMEOVER) {
				GAME_STATE.current_level++;
				startGame(false); // New level, do not reset score
			}
		}, 3000);
	} else {
		if (title) title.innerText = "CRITICAL FAILURE";
		if (message) message.innerText = "SIGNAL LOST";
		if (retry_button) retry_button.innerText = "RETRY";
		document.documentElement.style.setProperty("--active-color", "#cb000c");
	}

	const game_over_menu = document.getElementById("game-over-menu");
	if (game_over_menu) game_over_menu.style.display = "flex";

	audio_controller.suspend();
}

// Animation Loop
function animate() {
	requestAnimationFrame(animate);
	const dt = clock.getDelta();

	pollGamepad();

	if (GAME_STATE.mode === GAME_MODE.PLAYING) {
		updatePhysics(dt);
		updateGame(dt);
	}

	composer.render();
}
console.clear();
init();
