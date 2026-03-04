// ================================================================
// BROWSER-SYNTH // Step Sequencer
// Web Audio API powered, Look-ahead scheduled step sequencer
// ================================================================

let audioCtx = null;
let masterGain,
  analyser,
  waveformAnalyser,
  reverbNode,
  delayNode,
  filterNode,
  distNode;
let reverbGain, delayGain, filterBypPass, distGain;
let isPlaying = false;
let isRecording = false;
let currentStep = 0;
let nextNoteTime = 0;
let timerID = null;
let startTime = 0;
let scheduleAheadTime = 0.1;
let lookahead = 25; // ms

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_FREQS = {
  C2: 65.41,
  "C#2": 69.3,
  D2: 73.42,
  "D#2": 77.78,
  E2: 82.41,
  F2: 87.31,
  "F#2": 92.5,
  G2: 98.0,
  "G#2": 103.83,
  A2: 110.0,
  "A#2": 116.54,
  B2: 123.47,
  C3: 130.81,
  "C#3": 138.59,
  D3: 146.83,
  "D#3": 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  G3: 196.0,
  "G#3": 207.65,
  A3: 220.0,
  "A#3": 233.08,
  B3: 246.94,
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  "G#4": 415.3,
  A4: 440.0,
  "A#4": 466.16,
  B4: 493.88,
  C5: 523.25,
  "C#5": 554.37,
  D5: 587.33,
  "D#5": 622.25,
  E5: 659.25,
  F5: 698.46,
  "F#5": 739.99,
  G5: 783.99,
  "G#5": 830.61,
  A5: 880.0,
  "A#5": 932.33,
  B5: 987.77,
};

// Synthesizer percussion types
const TRACK_CONFIGS = [
  {
    name: "KICK",
    color: "#00f5c4",
    type: "kick",
    note: "C2",
    wave: "sine",
    vol: 0.9,
    cutoff: 200,
    decay: 0.5,
  },
  {
    name: "SNARE",
    color: "#ff3d6b",
    type: "snare",
    note: "D3",
    wave: "noise",
    vol: 0.7,
    cutoff: 8000,
    decay: 0.2,
  },
  {
    name: "HH-CL",
    color: "#ffb800",
    type: "hihat",
    note: "F#4",
    wave: "noise",
    vol: 0.5,
    cutoff: 12000,
    decay: 0.05,
  },
  {
    name: "HH-OP",
    color: "#7c4dff",
    type: "openhat",
    note: "A#4",
    wave: "noise",
    vol: 0.4,
    cutoff: 10000,
    decay: 0.4,
  },
  {
    name: "BASS",
    color: "#00b4ff",
    type: "synth",
    note: "C2",
    wave: "sawtooth",
    vol: 0.6,
    cutoff: 800,
    decay: 0.3,
  },
  {
    name: "LEAD",
    color: "#ff8a00",
    type: "synth",
    note: "C4",
    wave: "square",
    vol: 0.4,
    cutoff: 4000,
    decay: 0.25,
  },
];

let bpm = 128;
let swing = 0;
let numSteps = 16;
let numPatterns = 8;
let currentPattern = 0;
let selectedTrack = 0;

// patterns[pattern][track][step] = true/false
let patterns = Array.from({ length: numPatterns }, () =>
  TRACK_CONFIGS.map(() => Array(numSteps).fill(false))
);

// track settings per pattern
let trackSettings = TRACK_CONFIGS.map((t) => ({
  note: t.note,
  wave: t.wave,
  vol: t.vol,
  cutoff: t.cutoff,
  decay: t.decay,
}));

// custom wave data
let customWaveData = new Array(256).fill(0);
let drawingWave = false;

// effects state
let fxState = {
  reverb: { on: false, decay: 2.5, mix: 0.3 },
  delay: { on: false, time: 0.375, feedback: 0.4 },
  filter: { on: false, cutoff: 8000, res: 1 },
  dist: { on: false, drive: 100, mix: 0.5 },
};

// ================================================================
// AUDIO INIT
// ================================================================
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.7;

  // Analyser for spectrum
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.85;

  // Waveform analyser
  waveformAnalyser = audioCtx.createAnalyser();
  waveformAnalyser.fftSize = 1024;

  // === FX CHAIN ===
  // Filter
  filterNode = audioCtx.createBiquadFilter();
  filterNode.type = "lowpass";
  filterNode.frequency.value = 8000;
  filterNode.Q.value = 1;

  // Distortion
  distNode = audioCtx.createWaveShaper();
  distGain = audioCtx.createGain();
  distGain.gain.value = 0;
  updateDistCurve(100);

  // Delay
  delayNode = audioCtx.createDelay(2.0);
  delayNode.delayTime.value = 0.375;
  let delayFB = audioCtx.createGain();
  delayFB.gain.value = 0.4;
  let delayWet = audioCtx.createGain();
  delayWet.gain.value = 0;
  delayNode.connect(delayFB);
  delayFB.connect(delayNode);
  delayNode.connect(delayWet);
  fxState._delayWet = delayWet;
  fxState._delayFB = delayFB;

  // Reverb (convolver with synthesized IR)
  reverbNode = audioCtx.createConvolver();
  buildReverb(2.5);
  let reverbWet = audioCtx.createGain();
  reverbWet.gain.value = 0;
  reverbNode.connect(reverbWet);
  fxState._reverbWet = reverbWet;

  // Chain: masterGain -> filter -> dist+dry -> delay+dry -> reverb+dry -> analysers -> destination
  masterGain.connect(filterNode);
  filterNode.connect(distNode);
  filterNode.connect(distGain); // dry signal passes through gain=1 initially...
  // Actually use parallel dry/wet for dist
  let distDry = audioCtx.createGain();
  distDry.gain.value = 0.5;
  let distWet2 = audioCtx.createGain();
  distWet2.gain.value = 0.5;
  filterNode.connect(distDry);
  distNode.connect(distWet2);
  fxState._distDry = distDry;
  fxState._distWet = distWet2;

  let preDelay = audioCtx.createGain();
  distDry.connect(preDelay);
  distWet2.connect(preDelay);

  preDelay.connect(delayNode);
  preDelay.connect(fxState._delayWet);

  let preReverb = audioCtx.createGain();
  preDelay.connect(preReverb);
  fxState._delayWet.connect(preReverb);

  preReverb.connect(reverbNode);
  preReverb.connect(fxState._reverbWet);

  let output = audioCtx.createGain();
  preReverb.connect(output);
  fxState._reverbWet.connect(output);

  output.connect(analyser);
  output.connect(waveformAnalyser);
  analyser.connect(audioCtx.destination);
}

function buildReverb(decay) {
  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * decay;
  const impulse = audioCtx.createBuffer(2, length, sampleRate);
  for (let c = 0; c < 2; c++) {
    const channel = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      channel[i] =
        (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay * 0.5);
    }
  }
  reverbNode.buffer = impulse;
}

function updateDistCurve(amount) {
  const k = amount;
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20) / (Math.PI + k * Math.abs(x));
  }
  if (distNode) distNode.curve = curve;
}

// ================================================================
// SOUND SYNTHESIS
// ================================================================
function triggerSound(trackIdx, time) {
  if (!audioCtx) return;
  const cfg = TRACK_CONFIGS[trackIdx];
  const ts = trackSettings[trackIdx];
  const vol = ts.vol;

  const env = audioCtx.createGain();
  env.connect(masterGain);

  if (cfg.type === "kick") {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + ts.decay);
    env.gain.setValueAtTime(vol, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + ts.decay + 0.1);
    osc.connect(env);
    osc.start(time);
    osc.stop(time + ts.decay + 0.15);

    // click
    const buf = audioCtx.createBuffer(
      1,
      audioCtx.sampleRate * 0.01,
      audioCtx.sampleRate
    );
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const click = audioCtx.createBufferSource();
    click.buffer = buf;
    const cg = audioCtx.createGain();
    cg.gain.setValueAtTime(vol * 0.6, time);
    cg.gain.exponentialRampToValueAtTime(0.001, time + 0.01);
    click.connect(cg);
    cg.connect(masterGain);
    click.start(time);
  } else if (cfg.type === "snare") {
    const noiseLen = Math.max(0.01, ts.decay + 0.1);
    const buf = audioCtx.createBuffer(
      1,
      audioCtx.sampleRate * noiseLen,
      audioCtx.sampleRate
    );
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200;
    noise.connect(filter);
    filter.connect(env);
    env.gain.setValueAtTime(vol, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + noiseLen);
    noise.start(time);

    // tone layer
    const osc = audioCtx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    const tg = audioCtx.createGain();
    tg.gain.setValueAtTime(vol * 0.4, time);
    tg.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(tg);
    tg.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.2);
  } else if (cfg.type === "hihat") {
    const decayT = ts.decay;
    const buf = audioCtx.createBuffer(
      1,
      audioCtx.sampleRate * (decayT + 0.02),
      audioCtx.sampleRate
    );
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = ts.cutoff;
    filter.Q.value = 1;
    noise.connect(filter);
    filter.connect(env);
    env.gain.setValueAtTime(vol, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + decayT);
    noise.start(time);
  } else if (cfg.type === "openhat") {
    const decayT = ts.decay;
    const buf = audioCtx.createBuffer(
      1,
      audioCtx.sampleRate * (decayT + 0.05),
      audioCtx.sampleRate
    );
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 8000;
    noise.connect(filter);
    filter.connect(env);
    env.gain.setValueAtTime(vol, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + decayT);
    noise.start(time);
  } else if (cfg.type === "synth") {
    const freq = NOTE_FREQS[ts.note] || 440;
    const osc = audioCtx.createOscillator();

    if (ts.wave === "custom") {
      const real = new Float32Array(customWaveData.length / 2);
      const imag = new Float32Array(customWaveData.length / 2);
      // Convert custom wave to Fourier coefficients via simple FFT-ish
      const N = customWaveData.length;
      for (let k = 1; k < real.length; k++) {
        let re = 0,
          im = 0;
        for (let n = 0; n < N; n++) {
          const angle = (2 * Math.PI * k * n) / N;
          re += customWaveData[n] * Math.cos(angle);
          im -= customWaveData[n] * Math.sin(angle);
        }
        real[k] = (re / N) * 2;
        imag[k] = (im / N) * 2;
      }
      const wave = audioCtx.createPeriodicWave(real, imag, {
        disableNormalization: false,
      });
      osc.setPeriodicWave(wave);
    } else {
      osc.type = ts.wave;
    }

    osc.frequency.value = freq;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(ts.cutoff * 3, time);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(20, ts.cutoff * 0.3),
      time + ts.decay
    );

    osc.connect(filter);
    filter.connect(env);
    env.gain.setValueAtTime(vol, time);
    env.gain.setValueAtTime(vol, time + 0.005);
    env.gain.exponentialRampToValueAtTime(0.001, time + ts.decay + 0.05);
    osc.start(time);
    osc.stop(time + ts.decay + 0.1);
  }
}

// ================================================================
// SCHEDULER (look-ahead)
// ================================================================
function scheduler() {
  while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
    scheduleNote(currentStep, nextNoteTime);
    advanceStep();
  }
  timerID = setTimeout(scheduler, lookahead);
}

function scheduleNote(step, time) {
  const pat = patterns[currentPattern];
  for (let t = 0; t < TRACK_CONFIGS.length; t++) {
    if (pat[t][step]) {
      triggerSound(t, time);
    }
  }
  // Update UI step indicator
  const uiStep = step;
  setTimeout(() => {
    if (!isPlaying) return;
    updateStepUI(uiStep);
  }, (time - audioCtx.currentTime) * 1000);
}

function advanceStep() {
  const secondsPerBeat = 60.0 / bpm;
  const secondsPerStep = secondsPerBeat / 4;
  let swingOffset = 0;
  if (swing > 0 && currentStep % 2 === 1) {
    swingOffset = secondsPerStep * swing;
  }
  nextNoteTime += secondsPerStep + swingOffset;
  currentStep = (currentStep + 1) % numSteps;
}

let lastHighlightedStep = -1;
function updateStepUI(step) {
  const rows = document.querySelectorAll(".seq-row");
  rows.forEach((row) => {
    const btns = row.querySelectorAll(".step-btn");
    if (lastHighlightedStep >= 0 && lastHighlightedStep < btns.length) {
      btns[lastHighlightedStep].classList.remove("playing");
    }
    if (step < btns.length) {
      btns[step].classList.add("playing");
    }
  });
  // Step indicators
  const inds = document.querySelectorAll("#stepIndicators .step-num");
  inds.forEach((ind, i) => {
    ind.classList.toggle("current", i === step + 1); // +1 because first is empty
  });
  document.getElementById("stepDisplay").textContent = `STEP: ${String(
    step + 1
  ).padStart(2, "0")}`;
  lastHighlightedStep = step;
}

// ================================================================
// TRANSPORT CONTROLS
// ================================================================
function togglePlay() {
  initAudio();
  if (audioCtx.state === "suspended") audioCtx.resume();

  isPlaying = !isPlaying;
  if (isPlaying) {
    currentStep = 0;
    nextNoteTime = audioCtx.currentTime + 0.05;
    startTime = Date.now();
    scheduler();
    document.getElementById("playBtn").classList.add("active");
    document.getElementById("playBtn").textContent = "⏸ PAUSE";
    document.getElementById("statusDot").classList.add("active");
    document.getElementById("statusText").textContent = "PLAYING";
  } else {
    clearTimeout(timerID);
    document.getElementById("playBtn").classList.remove("active");
    document.getElementById("playBtn").textContent = "▶ PLAY";
    document.getElementById("statusDot").classList.remove("active");
    document.getElementById("statusText").textContent = "PAUSED";
  }
}

function stopSeq() {
  isPlaying = false;
  clearTimeout(timerID);
  currentStep = 0;
  lastHighlightedStep = -1;
  document.getElementById("playBtn").classList.remove("active");
  document.getElementById("playBtn").textContent = "▶ PLAY";
  document.getElementById("statusDot").classList.remove("active");
  document.getElementById("statusText").textContent = "STOPPED";
  document.getElementById("stepDisplay").textContent = "STEP: --";
  // Clear all playing highlights
  document
    .querySelectorAll(".step-btn.playing")
    .forEach((b) => b.classList.remove("playing"));
  document
    .querySelectorAll(".step-num.current")
    .forEach((b) => b.classList.remove("current"));
}

function recordToggle() {
  isRecording = !isRecording;
  document.getElementById("recBtn").classList.toggle("active", isRecording);
}

function clearAll() {
  patterns[currentPattern] = TRACK_CONFIGS.map(() =>
    Array(numSteps).fill(false)
  );
  renderSequencer();
}

function randomize() {
  const densities = [0.5, 0.25, 0.3, 0.2, 0.3, 0.25];
  patterns[currentPattern] = TRACK_CONFIGS.map((_, t) =>
    Array(numSteps)
      .fill(false)
      .map(() => Math.random() < densities[t])
  );
  renderSequencer();
}

function fillTrack() {
  const pat = patterns[currentPattern];
  pat[selectedTrack] = Array(numSteps).fill(true);
  renderSequencer();
}

function setBPM(v) {
  bpm = parseInt(v);
  document.getElementById("bpmDisplay").textContent = bpm;
}
function setSwing(v) {
  swing = parseFloat(v);
}
function setMasterVol(v) {
  if (masterGain) masterGain.gain.value = parseFloat(v);
}

function setSteps(v) {
  numSteps = parseInt(v);
  patterns = patterns.map((pat) =>
    TRACK_CONFIGS.map((_, t) => {
      const old = pat[t] || [];
      const arr = Array(numSteps).fill(false);
      for (let i = 0; i < Math.min(old.length, numSteps); i++) arr[i] = old[i];
      return arr;
    })
  );
  renderStepIndicators();
  renderSequencer();
}

// ================================================================
// PATTERN MANAGEMENT
// ================================================================
function selectPattern(i) {
  currentPattern = i;
  document.querySelectorAll(".pattern-btn").forEach((b, idx) => {
    b.classList.toggle("active", idx === i);
  });
  renderSequencer();
}

// ================================================================
// SEQUENCER RENDER
// ================================================================
function renderStepIndicators() {
  const container = document.getElementById("stepIndicators");
  container.innerHTML = "";
  // empty placeholder for track-info column
  const ph = document.createElement("div");
  container.appendChild(ph);
  for (let s = 0; s < numSteps; s++) {
    const div = document.createElement("div");
    div.className = "step-num" + (s % 4 === 0 ? " beat" : "");
    div.id = `sind-${s}`;
    div.textContent = s % 4 === 0 ? s / 4 + 1 : "·";
    container.appendChild(div);
  }
  // empty placeholder for track-params column
  const ph2 = document.createElement("div");
  container.appendChild(ph2);
  // update grid template
  container.style.gridTemplateColumns = `160px repeat(${numSteps}, 1fr) 180px`;
}

function renderSequencer() {
  const grid = document.getElementById("seqGrid");
  grid.innerHTML = "";

  TRACK_CONFIGS.forEach((cfg, t) => {
    const row = document.createElement("div");
    row.className = `seq-row track-${t}`;
    row.style.gridTemplateColumns = `160px repeat(${numSteps}, 1fr) 180px`;

    // Track info
    const info = document.createElement("div");
    info.className = "track-info";
    info.innerHTML = `
      <div class="track-name" style="color:${cfg.color}">${cfg.name}</div>
      <div class="track-controls">
        <span style="font-size:9px;color:var(--text-dim)">${trackSettings[t].note}</span>
        <input type="range" class="track-vol" min="0" max="1" step="0.01" value="${trackSettings[t].vol}" 
          style="width:60px;height:3px;" oninput="trackSettings[${t}].vol=parseFloat(this.value)">
      </div>
    `;
    info.onclick = () => selectTrack(t);
    row.appendChild(info);

    // Steps
    for (let s = 0; s < numSteps; s++) {
      const btn = document.createElement("div");
      btn.className =
        "step-btn" +
        (s % 4 === 0 && s > 0 ? " beat-4" : "") +
        (patterns[currentPattern][t][s] ? " on" : "");
      btn.dataset.track = t;
      btn.dataset.step = s;
      btn.addEventListener("mousedown", (e) => {
        stepMouseDown(e, t, s);
        e.preventDefault();
      });
      btn.addEventListener("mouseenter", (e) => {
        if (e.buttons === 1) stepMouseDown(e, t, s);
      });
      row.appendChild(btn);
    }

    // Track params
    const params = document.createElement("div");
    params.className = "track-params";
    params.innerHTML = `
      <div class="knob-group">
        <div class="knob" id="knob-dec-${t}" data-tip="DECAY"></div>
        <div class="knob-label">DEC</div>
      </div>
      <div class="knob-group">
        <div class="knob" id="knob-cut-${t}" data-tip="CUTOFF"></div>
        <div class="knob-label">CUT</div>
      </div>
    `;
    row.appendChild(params);
    grid.appendChild(row);
  });

  initKnobs();
}

let dragStep = null;
let dragValue = null;
function stepMouseDown(e, t, s) {
  if (dragStep === null) {
    dragValue = !patterns[currentPattern][t][s];
  }
  patterns[currentPattern][t][s] = dragValue;
  const btn = document.querySelector(`[data-track="${t}"][data-step="${s}"]`);
  if (btn) btn.classList.toggle("on", dragValue);
  dragStep = { t, s };
}
document.addEventListener("mouseup", () => {
  dragStep = null;
  dragValue = null;
});

// ================================================================
// KNOBS
// ================================================================
function initKnobs() {
  TRACK_CONFIGS.forEach((cfg, t) => {
    const knobDec = document.getElementById(`knob-dec-${t}`);
    const knobCut = document.getElementById(`knob-cut-${t}`);
    if (knobDec) {
      setKnobRotation(knobDec, trackSettings[t].decay, 0, 2);
      makeKnobDraggable(knobDec, 0, 2, (v) => {
        trackSettings[t].decay = v;
        setKnobRotation(knobDec, v, 0, 2);
      });
    }
    if (knobCut) {
      setKnobRotation(
        knobCut,
        Math.log(trackSettings[t].cutoff) / Math.log(20000),
        0,
        1
      );
      makeKnobDraggable(knobCut, 0, 1, (v) => {
        trackSettings[t].cutoff = Math.pow(20000, v);
        setKnobRotation(knobCut, v, 0, 1);
      });
    }
  });
}

function setKnobRotation(el, val, min, max) {
  const pct = (val - min) / (max - min);
  const deg = -135 + pct * 270;
  el.style.setProperty("--rot", `${deg}deg`);
  el.querySelector && null; // just store
  el.dataset.rot = deg;
  // rotate the indicator
  const after = el;
  after.style.background = `radial-gradient(circle at 40% 35%, #3a3a52, #1a1a26)`;
  // Use CSS custom property for pseudo-element rotation
  el.style.cssText += `--knob-rot: ${deg}deg`;
}

function makeKnobDraggable(el, min, max, onChange) {
  let startY, startVal;
  el.addEventListener("mousedown", (e) => {
    startY = e.clientY;
    startVal = parseFloat(el.dataset.val || (min + max) / 2);
    e.preventDefault();
    const move = (e2) => {
      const delta = (startY - e2.clientY) / 150;
      const newVal = Math.max(
        min,
        Math.min(max, startVal + delta * (max - min))
      );
      el.dataset.val = newVal;
      onChange(newVal);
    };
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });
}

// ================================================================
// EFFECTS
// ================================================================
function toggleFX(name) {
  fxState[name].on = !fxState[name].on;
  document
    .getElementById(`${name}Toggle`)
    .classList.toggle("on", fxState[name].on);
  applyFX(name);
}

function updateFX(name, param, value) {
  value = parseFloat(value);
  fxState[name][param] = value;
  applyFX(name);
}

function applyFX(name) {
  if (!audioCtx) return;
  const s = fxState[name];
  if (name === "reverb") {
    fxState._reverbWet.gain.value = s.on ? s.mix : 0;
    if (s.on) buildReverb(s.decay);
  } else if (name === "delay") {
    fxState._delayWet.gain.value = s.on ? 0.5 : 0;
    fxState._delayFB.gain.value = s.feedback;
    delayNode.delayTime.value = s.time;
  } else if (name === "filter") {
    filterNode.frequency.value = s.on ? s.cutoff : 22000;
    filterNode.Q.value = s.res;
  } else if (name === "dist") {
    fxState._distDry.gain.value = s.on ? 1 - s.mix : 1;
    fxState._distWet.gain.value = s.on ? s.mix : 0;
    updateDistCurve(s.drive);
  }
}

// ================================================================
// WAVE EDITOR
// ================================================================
const waveCanvas = document.getElementById("waveCanvas");
const waveCtx = waveCanvas.getContext("2d");

function resizeWaveCanvas() {
  waveCanvas.width = waveCanvas.offsetWidth;
  waveCanvas.height = waveCanvas.offsetHeight;
  drawWaveEditor();
}

function drawWaveEditor() {
  const w = waveCanvas.width,
    h = waveCanvas.height;
  waveCtx.fillStyle = "#0d0d14";
  waveCtx.fillRect(0, 0, w, h);

  // Grid
  waveCtx.strokeStyle = "rgba(42,42,56,0.8)";
  waveCtx.lineWidth = 1;
  for (let x = 0; x < w; x += w / 8) {
    waveCtx.beginPath();
    waveCtx.moveTo(x, 0);
    waveCtx.lineTo(x, h);
    waveCtx.stroke();
  }
  waveCtx.beginPath();
  waveCtx.moveTo(0, h / 2);
  waveCtx.lineTo(w, h / 2);
  waveCtx.stroke();

  // Custom wave
  const trackWave = trackSettings[selectedTrack].wave;
  let waveData;

  if (trackWave === "custom") {
    waveData = customWaveData;
  } else {
    // Generate built-in waveform preview
    waveData = Array(256)
      .fill(0)
      .map((_, i) => {
        const t2 = i / 256;
        if (trackWave === "sine") return Math.sin(2 * Math.PI * t2);
        if (trackWave === "square") return t2 < 0.5 ? 1 : -1;
        if (trackWave === "sawtooth") return 2 * t2 - 1;
        if (trackWave === "triangle")
          return t2 < 0.5 ? 4 * t2 - 1 : -4 * t2 + 3;
        return 0;
      });
  }

  const color = TRACK_CONFIGS[selectedTrack].color;
  waveCtx.strokeStyle = color;
  waveCtx.lineWidth = 2;
  waveCtx.shadowColor = color;
  waveCtx.shadowBlur = 8;
  waveCtx.beginPath();
  for (let i = 0; i < waveData.length; i++) {
    const x = (i / waveData.length) * w;
    const y = h / 2 - waveData[i] * h * 0.45;
    i === 0 ? waveCtx.moveTo(x, y) : waveCtx.lineTo(x, y);
  }
  waveCtx.stroke();
  waveCtx.shadowBlur = 0;
}

waveCanvas.addEventListener("mousedown", (e) => {
  if (trackSettings[selectedTrack].wave !== "custom") return;
  drawingWave = true;
  drawOnWave(e);
});
waveCanvas.addEventListener("mousemove", (e) => {
  if (drawingWave) drawOnWave(e);
});
waveCanvas.addEventListener("mouseup", () => {
  drawingWave = false;
});
waveCanvas.addEventListener("mouseleave", () => {
  drawingWave = false;
});

function drawOnWave(e) {
  const rect = waveCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const w = waveCanvas.width,
    h = waveCanvas.height;
  const idx = Math.floor((x / w) * customWaveData.length);
  const val = -((y / h) * 2 - 1);
  if (idx >= 0 && idx < customWaveData.length) {
    customWaveData[idx] = Math.max(-1, Math.min(1, val));
    // Smooth neighboring points
    if (idx > 0) customWaveData[idx - 1] = (customWaveData[idx - 1] + val) / 2;
    if (idx < customWaveData.length - 1)
      customWaveData[idx + 1] = (customWaveData[idx + 1] + val) / 2;
    drawWaveEditor();
  }
}

function setWaveType(type, btn) {
  trackSettings[selectedTrack].wave = type;
  document
    .querySelectorAll(".wave-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  drawWaveEditor();
}

// ================================================================
// NOTE SELECTOR
// ================================================================
function renderNoteSelector() {
  const container = document.getElementById("noteSelector");
  container.innerHTML = "";
  const octaves = [2, 3, 4, 5];
  octaves.forEach((oct) => {
    NOTES.forEach((note) => {
      const key = `${note}${oct}`;
      if (!NOTE_FREQS[key]) return;
      const btn = document.createElement("div");
      btn.className =
        "note-btn" +
        (note.includes("#") ? " sharp" : "") +
        (trackSettings[selectedTrack].note === key ? " active" : "");
      btn.textContent = key;
      btn.onclick = () => {
        trackSettings[selectedTrack].note = key;
        renderNoteSelector();
      };
      container.appendChild(btn);
    });
  });
}

// ================================================================
// TRACK SELECTOR
// ================================================================
function selectTrack(t) {
  selectedTrack = t;
  document
    .querySelectorAll(".track-sel-btn")
    .forEach((b, i) => b.classList.toggle("active", i === t));
  document.querySelectorAll(".track-info").forEach((b, i) => {
    b.style.borderColor = i === t ? TRACK_CONFIGS[t].color : "";
  });
  // Sync wave type buttons
  const wave = trackSettings[t].wave;
  document.querySelectorAll(".wave-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.wave === wave);
  });
  renderNoteSelector();
  drawWaveEditor();
}

// ================================================================
// SPECTRUM VISUALIZER
// ================================================================
const specCanvas = document.getElementById("specCanvas");
const specCtx = specCanvas.getContext("2d");
const wfCanvas = document.getElementById("waveformCanvas");
const wfCtx = wfCanvas.getContext("2d");

let animFrame;
function drawVisualizer() {
  animFrame = requestAnimationFrame(drawVisualizer);

  const W = specCanvas.offsetWidth;
  const H = specCanvas.offsetHeight;
  if (specCanvas.width !== W) specCanvas.width = W;
  if (specCanvas.height !== H) specCanvas.height = H;

  const wfW = wfCanvas.offsetWidth;
  const wfH = wfCanvas.offsetHeight;
  if (wfCanvas.width !== wfW) wfCanvas.width = wfW;
  if (wfCanvas.height !== wfH) wfCanvas.height = wfH;

  if (!analyser) {
    // Draw idle state
    specCtx.fillStyle = "#0a0a0c";
    specCtx.fillRect(0, 0, W, H);
    specCtx.strokeStyle = "rgba(0,245,196,0.15)";
    specCtx.lineWidth = 1;
    specCtx.beginPath();
    specCtx.moveTo(0, H / 2);
    specCtx.lineTo(W, H / 2);
    specCtx.stroke();

    wfCtx.fillStyle = "#0a0a0c";
    wfCtx.fillRect(0, 0, wfW, wfH);
    return;
  }

  const bufLen = analyser.frequencyBinCount;
  const freqData = new Uint8Array(bufLen);
  const waveData = new Uint8Array(waveformAnalyser.fftSize);
  analyser.getByteFrequencyData(freqData);
  waveformAnalyser.getByteTimeDomainData(waveData);

  // Spectrum
  specCtx.fillStyle = "rgba(10,10,12,0.85)";
  specCtx.fillRect(0, 0, W, H);

  const barCount = 64;
  const barW = W / barCount;
  for (let i = 0; i < barCount; i++) {
    const dataIdx = Math.floor((i / barCount) * bufLen * 0.7);
    const val = freqData[dataIdx] / 255;
    const barH = val * H;

    const hue = 160 - val * 120;
    const sat = 80 + val * 20;
    const lit = 40 + val * 30;
    specCtx.fillStyle = `hsl(${hue},${sat}%,${lit}%)`;
    specCtx.fillRect(i * barW, H - barH, barW - 1, barH);

    // Peak dot
    specCtx.fillStyle = `hsla(${hue},100%,80%,0.8)`;
    specCtx.fillRect(i * barW, H - barH - 2, barW - 1, 2);
  }

  // Waveform
  wfCtx.fillStyle = "rgba(10,10,12,0.9)";
  wfCtx.fillRect(0, 0, wfW, wfH);
  wfCtx.strokeStyle = "rgba(0,245,196,0.8)";
  wfCtx.lineWidth = 1.5;
  wfCtx.shadowColor = "rgba(0,245,196,0.4)";
  wfCtx.shadowBlur = 4;
  wfCtx.beginPath();
  const sliceWidth = wfW / waveData.length;
  for (let i = 0; i < waveData.length; i++) {
    const x = i * sliceWidth;
    const y = (waveData[i] / 128) * (wfH / 2);
    i === 0 ? wfCtx.moveTo(x, y) : wfCtx.lineTo(x, y);
  }
  wfCtx.stroke();
  wfCtx.shadowBlur = 0;

  // Level meters
  const meters = document.querySelectorAll(".meter-fill");
  const rms = freqData.slice(0, 20).reduce((a, b) => a + b, 0) / 20 / 255;
  const mid = freqData.slice(20, 60).reduce((a, b) => a + b, 0) / 40 / 255;
  const hi = freqData.slice(60, 120).reduce((a, b) => a + b, 0) / 60 / 255;
  const peak = Math.max(...freqData.slice(0, 200)) / 255;
  const vals = [
    rms * 100,
    mid * 100,
    hi * 100,
    peak * 100,
    (rms + mid) * 50,
    hi * 100 * 0.8,
  ];
  meters.forEach((m, i) => {
    m.style.height = Math.min(100, (vals[i] || 0) * 1.5) + "%";
  });
}

// ================================================================
// UI INIT
// ================================================================
function initUI() {
  // Pattern buttons
  const patternRow = document.getElementById("patternRow");
  for (let i = 0; i < numPatterns; i++) {
    const btn = document.createElement("button");
    btn.className = "pattern-btn" + (i === 0 ? " active" : "");
    btn.textContent = i + 1;
    btn.onclick = () => selectPattern(i);
    patternRow.appendChild(btn);
  }

  // Track selector
  const trackSel = document.getElementById("trackSelector");
  TRACK_CONFIGS.forEach((cfg, i) => {
    const btn = document.createElement("button");
    btn.className = "track-sel-btn" + (i === 0 ? " active" : "");
    btn.textContent = cfg.name;
    btn.style.borderColor = i === 0 ? cfg.color : "";
    btn.style.color = i === 0 ? cfg.color : "";
    btn.onclick = () => selectTrack(i);
    trackSel.appendChild(btn);
  });

  // Meter bars
  const meterStrip = document.getElementById("meterStrip");
  for (let i = 0; i < 6; i++) {
    const bar = document.createElement("div");
    bar.className = "meter-bar";
    const fill = document.createElement("div");
    fill.className = "meter-fill";
    bar.appendChild(fill);
    meterStrip.appendChild(bar);
  }

  // Load a default pattern
  loadDefaultPattern();

  renderStepIndicators();
  renderSequencer();
  renderNoteSelector();
  resizeWaveCanvas();
  drawVisualizer();

  // Time display
  setInterval(() => {
    if (isPlaying) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      const ms = Math.floor(((Date.now() - startTime) % 1000) / 10);
      document.getElementById("timeDisplay").textContent = `${String(
        m
      ).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(ms).padStart(
        2,
        "0"
      )}`;
    }
  }, 50);
}

function loadDefaultPattern() {
  // Classic drum pattern
  const pat = patterns[0];
  // Kick: beats 1 and 3 (steps 0, 4, 8, 12 in 16-step = 0 and 8)
  [0, 4, 8, 12].forEach((s) => {
    if (s < numSteps) pat[0][s] = true;
  });
  // Snare: beats 2 and 4 (steps 4, 12)
  [4, 12].forEach((s) => {
    if (s < numSteps) pat[1][s] = true;
  });
  // HH: every 8th note
  [0, 2, 4, 6, 8, 10, 12, 14].forEach((s) => {
    if (s < numSteps) pat[2][s] = true;
  });
  // Bass: syncopated
  [0, 3, 7, 10, 14].forEach((s) => {
    if (s < numSteps) pat[4][s] = true;
  });
}

window.addEventListener("resize", () => {
  resizeWaveCanvas();
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  }
  if (e.code === "Escape") stopSeq();
  if (e.code === "KeyR") recordToggle();
});

// Init on load
window.addEventListener("load", initUI);
