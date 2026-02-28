const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl");

/* ---- Uniforms state ---- */
const state = {
	speed: 1.0,
	size: 1.8,
	count: 8,
	glow: 1.0,
	softness: 1.0,
	bg: 0.05,
	paused: false,
	time: 0,
	lastFrame: 0,
	colors: [
		[1.0, 0.09, 0.27],
		[0.16, 0.47, 1.0],
		[0.0, 0.9, 0.46],
		[1.0, 0.92, 0.0],
		[0.84, 0.0, 0.98],
		[1.0, 0.57, 0.0]
	]
};

const PALETTES = {
	neon: ["#ff1744", "#2979ff", "#00e676", "#ffea00", "#d500f9", "#ff9100"],
	sunset: ["#ff6b35", "#f7c59f", "#efa0a0", "#d62839", "#7b2d8b", "#f0a500"],
	ocean: ["#0077b6", "#00b4d8", "#90e0ef", "#48cae4", "#023e8a", "#03045e"],
	pastel: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#bdb2ff"],
	fire: ["#ff0000", "#ff4500", "#ff8c00", "#ffd700", "#ff6347", "#dc143c"]
};

function hexToGL(hex) {
	return [
		parseInt(hex.slice(1, 3), 16) / 255,
		parseInt(hex.slice(3, 5), 16) / 255,
		parseInt(hex.slice(5, 7), 16) / 255
	];
}

function glToHex(c) {
	const r = Math.round(c[0] * 255)
		.toString(16)
		.padStart(2, "0");
	const g = Math.round(c[1] * 255)
		.toString(16)
		.padStart(2, "0");
	const b = Math.round(c[2] * 255)
		.toString(16)
		.padStart(2, "0");
	return "#" + r + g + b;
}

/* ---- Shader sources ---- */
const VS = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0, 1); }
`;

const FS = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_size;
uniform int u_count;
uniform float u_glow;
uniform float u_softness;
uniform float u_bg;
uniform vec3 u_colors[6];

// Deterministic per-ball motion using its index
vec2 ballPos(int i, float t) {
  float fi = float(i);
  float a1 = fi * 1.17 + 0.3;
  float a2 = fi * 0.73 + 1.5;
  float s1 = 0.4 + fi * 0.03;
  float s2 = 0.35 + fi * 0.04;
  return vec2(
    sin(t * s1 + a1) * 0.35 + cos(t * s2 * 0.7 + a2 * 2.0) * 0.15,
    cos(t * s2 + a2) * 0.35 + sin(t * s1 * 0.6 + a1 * 1.5) * 0.15
  );
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);

  float totalInfluence = 0.0;
  vec3 totalColor = vec3(0.0);

  float radius = 0.08 * u_size;

  for (int i = 0; i < 20; i++) {
    if (i >= u_count) break;

    vec2 pos = ballPos(i, u_time);
    float d = length(uv - pos);
    float influence = (radius * radius) / (d * d + 0.0001);
    influence = pow(influence, u_softness);

    vec3 col = u_colors[i - (i / 6) * 6]; // mod 6

    totalInfluence += influence;
    totalColor += col * influence;
  }

  // Normalize color by total influence
  vec3 col = totalColor / (totalInfluence + 0.001);

  // Apply glow: smooth threshold
  float edge = smoothstep(0.8, 1.6 * u_glow, totalInfluence);

  // Outer glow halo
  float halo = smoothstep(0.3, 0.8, totalInfluence) * 0.15 * u_glow;

  vec3 bgColor = vec3(u_bg);
  vec3 finalColor = mix(bgColor, col, edge) + col * halo;

  // Subtle vignette
  float vig = 1.0 - length((gl_FragCoord.xy / u_res - 0.5) * 1.4);
  finalColor *= 0.7 + 0.3 * vig;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

/* ---- Compile shaders ---- */
function createShader(type, src) {
	const s = gl.createShader(type);
	gl.shaderSource(s, src);
	gl.compileShader(s);
	if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(s));
		return null;
	}
	return s;
}

const vs = createShader(gl.VERTEX_SHADER, VS);
const fs = createShader(gl.FRAGMENT_SHADER, FS);
const prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
gl.useProgram(prog);

/* ---- Fullscreen quad ---- */
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(
	gl.ARRAY_BUFFER,
	new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
	gl.STATIC_DRAW
);
const aPos = gl.getAttribLocation(prog, "a_pos");
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

/* ---- Uniform locations ---- */
const uRes = gl.getUniformLocation(prog, "u_res");
const uTime = gl.getUniformLocation(prog, "u_time");
const uSize = gl.getUniformLocation(prog, "u_size");
const uCount = gl.getUniformLocation(prog, "u_count");
const uGlow = gl.getUniformLocation(prog, "u_glow");
const uSoftness = gl.getUniformLocation(prog, "u_softness");
const uBg = gl.getUniformLocation(prog, "u_bg");
const uColors = [];
for (let i = 0; i < 6; i++) {
	uColors.push(gl.getUniformLocation(prog, `u_colors[${i}]`));
}

/* ---- Resize ---- */
function resize() {
	const dpr = window.devicePixelRatio || 1;
	canvas.width = window.innerWidth * dpr;
	canvas.height = window.innerHeight * dpr;
	gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resize);
resize();

/* ---- Render loop ---- */
function render(now) {
	now *= 0.001;
	if (!state.paused) {
		const dt = state.lastFrame ? now - state.lastFrame : 0;
		state.time += dt * state.speed;
	}
	state.lastFrame = now;

	gl.uniform2f(uRes, canvas.width, canvas.height);
	gl.uniform1f(uTime, state.time);
	gl.uniform1f(uSize, state.size);
	gl.uniform1i(uCount, state.count);
	gl.uniform1f(uGlow, state.glow);
	gl.uniform1f(uSoftness, state.softness);
	gl.uniform1f(uBg, state.bg);
	for (let i = 0; i < 6; i++) {
		gl.uniform3f(
			uColors[i],
			state.colors[i][0],
			state.colors[i][1],
			state.colors[i][2]
		);
	}

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	requestAnimationFrame(render);
}

requestAnimationFrame(render);

/* ---- UI wiring ---- */
const $ = (id) => document.getElementById(id);

function wireSlider(id, key, valId) {
	const slider = $(id);
	const valEl = $(valId);
	slider.addEventListener("input", () => {
		state[key] = parseFloat(slider.value);
		valEl.textContent = slider.value;
	});
}

wireSlider("speed", "speed", "speedVal");
wireSlider("size", "size", "sizeVal");
wireSlider("count", "count", "countVal");
wireSlider("glow", "glow", "glowVal");
wireSlider("softness", "softness", "softnessVal");
wireSlider("bg", "bg", "bgVal");

// Color inputs
const colorRow = $("colorRow");
colorRow.querySelectorAll('input[type="color"]').forEach((input) => {
	input.addEventListener("input", () => {
		const idx = parseInt(input.dataset.idx);
		state.colors[idx] = hexToGL(input.value);
		$("palette").value = "custom";
	});
});

function syncColorInputs() {
	colorRow.querySelectorAll('input[type="color"]').forEach((input) => {
		const idx = parseInt(input.dataset.idx);
		input.value = glToHex(state.colors[idx]);
	});
}

// Palette selector
$("palette").addEventListener("change", (e) => {
	const key = e.target.value;
	if (key === "custom") return;
	const pal = PALETTES[key];
	for (let i = 0; i < 6; i++) {
		state.colors[i] = hexToGL(pal[i]);
	}
	syncColorInputs();
});

// Buttons
$("pauseBtn").addEventListener("click", () => {
	state.paused = !state.paused;
	$("pauseBtn").textContent = state.paused ? "Play" : "Pause";
});

$("randomBtn").addEventListener("click", () => {
	for (let i = 0; i < 6; i++) {
		state.colors[i] = [Math.random(), Math.random(), Math.random()];
	}
	syncColorInputs();
	$("palette").value = "custom";
});

$("resetBtn").addEventListener("click", () => {
	state.speed = 1;
	$("speed").value = 1;
	$("speedVal").textContent = "1.0";
	state.size = 1.8;
	$("size").value = 1.8;
	$("sizeVal").textContent = "1.8";
	state.count = 8;
	$("count").value = 8;
	$("countVal").textContent = "8";
	state.glow = 1;
	$("glow").value = 1;
	$("glowVal").textContent = "1.0";
	state.softness = 1;
	$("softness").value = 1;
	$("softnessVal").textContent = "1.0";
	state.bg = 0.05;
	$("bg").value = 0.05;
	$("bgVal").textContent = "0.05";
	const pal = PALETTES.neon;
	for (let i = 0; i < 6; i++) state.colors[i] = hexToGL(pal[i]);
	syncColorInputs();
	$("palette").value = "neon";
});

// Menu toggle
const menu = $("menu");
const toggle = $("menuToggle");

$("closeMenu").addEventListener("click", () => {
	menu.classList.add("collapsed");
	toggle.classList.remove("hidden");
});

toggle.addEventListener("click", () => {
	menu.classList.remove("collapsed");
	toggle.classList.add("hidden");
});
