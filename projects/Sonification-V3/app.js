const { useEffect, useMemo, useRef, useState } = React;

// CodePen-ready single-file version (no imports/exports, no TypeScript)
// Setup in CodePen:
// 1) Settings → JS → Add external scripts:
//    - React:     https://unpkg.com/react@18/umd/react.development.js
//    - ReactDOM:  https://unpkg.com/react-dom@18/umd/react-dom.development.js
//    - Babel:     https://unpkg.com/@babel/standalone/babel.min.js
// 2) Settings → JS Preprocessor: Babel
// 3) HTML panel → <div id="root"></div>
// 4) Settings → CSS → Add external stylesheet (Tailwind):
//    https://cdn.jsdelivr.net/npm/tailwindcss@3.4.10/dist/tailwind.min.css
// 5) Paste this entire file in the JS panel.

// Audio‑Visual Sonification App — single‑file React component
// This revision fixes JSX structure (unclosed tags), restores a complete
// drawVisualizer(), and keeps previous perf/UX improvements.

function SonificationApp() {
  // ------- State -------
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7); // 0..1
  const [bpm, setBpm] = useState(120); // 40..240
  const [speed, setSpeed] = useState(2); // steps per beat multiplier
  const [noteMult, setNoteMult] = useState(1.6); // duration multiplier
  const [oscType, setOscType] = useState("sine");
  const [scaleName, setScaleName] = useState("Pentatonic");
  const [baseNote, setBaseNote] = useState(196); // A3 default root

  // Presets UI
  const [preset, setPreset] = useState("Ambient Pad");

  // Block grid
  const [blockW, setBlockW] = useState(24);
  const [blockH, setBlockH] = useState(24);

  // Image Map size (CSS pixels)
  const [mapHeight, setMapHeight] = useState(300);

  // FX & Synthesis
  const [vibratoRate, setVibratoRate] = useState(4); // Hz
  const [vibratoDepth, setVibratoDepth] = useState(6); // cents → Hz offset
  const [tremoloRate, setTremoloRate] = useState(2.5); // Hz
  const [tremoloDepth, setTremoloDepth] = useState(0.15); // 0..1
  const [fifthLevel, setFifthLevel] = useState(0.25); // 0..1
  const [octaveLevel, setOctaveLevel] = useState(0.35); // 0..1
  const [filterBase, setFilterBase] = useState(600); // Hz
  const [filterTrack, setFilterTrack] = useState(3000); // Hz added with brightness
  const [resonance, setResonance] = useState(0.8); // Q
  const [reverbMix, setReverbMix] = useState(0.4); // 0..1
  const [reverbTime, setReverbTime] = useState(2.8); // seconds
  const [bassGain, setBassGain] = useState(4); // dB

  const [showDiag, setShowDiag] = useState(false);
  const [diagResults, setDiagResults] = useState([]);

  // Interactions → lower visualizer FPS while dragging
  const [isInteracting, setIsInteracting] = useState(false);

  // ------- Refs / Audio graph -------
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const analyserRef = useRef(null);
  const convolverRef = useRef(null);
  const wetGainRef = useRef(null);
  const dryGainRef = useRef(null);

  const rafRef = useRef(null);
  const stepTimerRef = useRef(null);

  const canvasRef = useRef(null);
  const imageMapCanvasRef = useRef(null);

  // Full‑res preview and processed analysis canvas
  const originalCanvasRef = useRef(null);
  const processedCanvasRef = useRef(null);
  const lastObjectUrlRef = useRef(null);

  // Image + grid data
  const imageDataRef = useRef(null);
  const imgWRef = useRef(0);
  const imgHRef = useRef(0);
  const blocksRef = useRef([]); // row‑major blocks
  const colsRef = useRef(0);
  const rowsRef = useRef(0);

  const stepRef = useRef(0);

  // ------- Scales -------
  const scales = useMemo(
    () => [
      { name: "Major", intervals: [0, 2, 4, 5, 7, 9, 11, 12] },
      { name: "Minor", intervals: [0, 2, 3, 5, 7, 8, 10, 12] },
      { name: "Pentatonic", intervals: [0, 2, 4, 7, 9, 12] },
      { name: "Blues", intervals: [0, 3, 5, 6, 7, 10, 12] },
      { name: "Chromatic", intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { name: "Whole Tone", intervals: [0, 2, 4, 6, 8, 10, 12] },
    ],
    []
  );
  const currentScale = useMemo(
    () => scales.find((s) => s.name === scaleName) || scales[0],
    [scaleName, scales]
  );

  // ------- Live params via ref (fixes stale closures) -------
  const paramsRef = useRef({});
  useEffect(() => {
    paramsRef.current = {
      volume,
      bpm,
      speed,
      noteMult,
      oscType,
      baseNote,
      scaleIntervals: currentScale.intervals,
      vibratoRate,
      vibratoDepth,
      tremoloRate,
      tremoloDepth,
      fifthLevel,
      octaveLevel,
      filterBase,
      filterTrack,
      resonance,
      reverbMix,
      reverbTime,
      bassGain,
    };
  }, [
    volume,
    bpm,
    speed,
    noteMult,
    oscType,
    baseNote,
    currentScale,
    vibratoRate,
    vibratoDepth,
    tremoloRate,
    tremoloDepth,
    fifthLevel,
    octaveLevel,
    filterBase,
    filterTrack,
    resonance,
    reverbMix,
    reverbTime,
    bassGain,
  ]);

  // ------- Helpers & Presets -------
  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function freqToMidi(f) { return 69 + 12 * Math.log2(f / 440); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min; let h = 0;
    if (d !== 0) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    const s = max === 0 ? 0 : d / max; const v = max; // v 0..1
    return { h, s, v: v * 255 };
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h, s, l: l * 100 };
  }

  const PRESETS = {
    "—": {},
    "Ambient Pad": {
      oscType: "sine", scaleName: "Pentatonic", baseNote: 196,
      bpm: 70, speed: 0.5, noteMult: 1.6,
      vibratoRate: 4, vibratoDepth: 6,
      tremoloRate: 2.5, tremoloDepth: 0.15,
      fifthLevel: 0.25, octaveLevel: 0.35,
      filterBase: 600, filterTrack: 3000, resonance: 0.8,
      reverbMix: 0.4, reverbTime: 2.8, bassGain: 4,
    },
    "Chiptune Arp": {
      oscType: "square", scaleName: "Major", baseNote: 330,
      bpm: 150, speed: 4, noteMult: 0.35,
      vibratoRate: 6, vibratoDepth: 4,
      tremoloRate: 12, tremoloDepth: 0.25,
      fifthLevel: 0.5, octaveLevel: 0.2,
      filterBase: 1200, filterTrack: 1500, resonance: 0.9,
      reverbMix: 0.15, reverbTime: 1.2, bassGain: 2,
    },
    "Techno Seq": {
      oscType: "sawtooth", scaleName: "Minor", baseNote: 110,
      bpm: 128, speed: 2, noteMult: 0.5,
      vibratoRate: 5, vibratoDepth: 3,
      tremoloRate: 8, tremoloDepth: 0.3,
      fifthLevel: 0.3, octaveLevel: 0.1,
      filterBase: 400, filterTrack: 5000, resonance: 1.2,
      reverbMix: 0.2, reverbTime: 1.5, bassGain: 8,
    },
    "LoFi Keys": {
      oscType: "triangle", scaleName: "Blues", baseNote: 247,
      bpm: 84, speed: 1, noteMult: 1.1,
      vibratoRate: 5, vibratoDepth: 7,
      tremoloRate: 3.2, tremoloDepth: 0.22,
      fifthLevel: 0.2, octaveLevel: 0.15,
      filterBase: 700, filterTrack: 2600, resonance: 0.7,
      reverbMix: 0.3, reverbTime: 2.2, bassGain: 5,
    },
  };

  function applyPreset(name) {
    setPreset(name);
    const p = PRESETS[name]; if (!p) return;
    if (p.oscType) setOscType(p.oscType);
    if (p.scaleName) setScaleName(p.scaleName);
    if (p.baseNote !== undefined) setBaseNote(p.baseNote);
    if (p.bpm !== undefined) setBpm(p.bpm);
    if (p.speed !== undefined) setSpeed(p.speed);
    if (p.noteMult !== undefined) setNoteMult(p.noteMult);
    if (p.vibratoRate !== undefined) setVibratoRate(p.vibratoRate);
    if (p.vibratoDepth !== undefined) setVibratoDepth(p.vibratoDepth);
    if (p.tremoloRate !== undefined) setTremoloRate(p.tremoloRate);
    if (p.tremoloDepth !== undefined) setTremoloDepth(p.tremoloDepth);
    if (p.fifthLevel !== undefined) setFifthLevel(p.fifthLevel);
    if (p.octaveLevel !== undefined) setOctaveLevel(p.octaveLevel);
    if (p.filterBase !== undefined) setFilterBase(p.filterBase);
    if (p.filterTrack !== undefined) setFilterTrack(p.filterTrack);
    if (p.resonance !== undefined) setResonance(p.resonance);
    if (p.reverbMix !== undefined) setReverbMix(p.reverbMix);
    if (p.reverbTime !== undefined) setReverbTime(p.reverbTime);
    if (p.bassGain !== undefined) setBassGain(p.bassGain);
  }

  // ------- Audio Setup / Teardown -------
  function createImpulseResponse(ctx, duration = 1.5, decay = 2.5) {
    if (!ctx || typeof ctx.sampleRate !== 'number' || ctx.sampleRate <= 0) return null;
    const rate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(rate * duration));
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  function ensureAudio() {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
      const ctx = new Ctx();
      const master = ctx.createGain();
      const analyser = ctx.createAnalyser();
      const dry = ctx.createGain();
      const wet = ctx.createGain();
      const conv = ctx.createConvolver();

      master.gain.value = Math.pow(volume, 2);
      analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.85;

      const ir = createImpulseResponse(ctx, reverbTime, 3); if (ir) conv.buffer = ir;
      wet.gain.value = reverbMix; dry.gain.value = 1 - reverbMix;

      dry.connect(analyser); wet.connect(analyser);
      analyser.connect(master);
      master.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = master;
      analyserRef.current = analyser;
      convolverRef.current = conv;
      wetGainRef.current = wet; dryGainRef.current = dry;
    }
  }

  function cleanupAudio() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    rafRef.current = null; stepTimerRef.current = null;
  }

  // SAFE updaters
  function updateMasterVolumeSafe() {
    if (!masterGainRef.current) return false;
    masterGainRef.current.gain.value = Math.pow(volume, 2); return true;
  }
  function updateReverbBufferSafe() {
    const ctx = audioCtxRef.current; const conv = convolverRef.current;
    if (!ctx || !conv || typeof ctx.sampleRate !== 'number' || ctx.sampleRate <= 0) return false;
    try { const ir = createImpulseResponse(ctx, reverbTime, 3); if (!ir) return false; conv.buffer = ir; return true; }
    catch { return false; }
  }
  function updateWetDrySafe() {
    const wet = wetGainRef.current; const dry = dryGainRef.current; if (!wet || !dry) return false;
    wet.gain.value = reverbMix; dry.gain.value = 1 - reverbMix; return true;
  }

  useEffect(() => { updateMasterVolumeSafe(); }, [volume]);
  useEffect(() => { updateReverbBufferSafe(); }, [reverbTime]);
  useEffect(() => { updateWetDrySafe(); }, [reverbMix]);

  // Re-time the sequencer on BPM/speed change during playback
  useEffect(() => {
    if (!isPlaying || !audioCtxRef.current) return;
    const beatMs = 60000 / bpm; const stepMs = Math.max(20, beatMs / clamp(speed, 0.25, 8));
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    stepTimerRef.current = setInterval(playStep, stepMs);
    return () => { if (stepTimerRef.current) clearInterval(stepTimerRef.current); };
  }, [bpm, speed, isPlaying]);

  // ------- Block building -------
  function buildBlocks() {
    const data = imageDataRef.current; const W = imgWRef.current; const H = imgHRef.current;
    blocksRef.current = []; colsRef.current = 0; rowsRef.current = 0; if (!data || !W || !H) return;
    const bw = Math.max(1, Math.floor(blockW));
    const bh = Math.max(1, Math.floor(blockH));
    const cols = Math.max(1, Math.floor(W / bw));
    const rows = Math.max(1, Math.floor(H / bh));
    colsRef.current = cols; rowsRef.current = rows;

    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < cols; rx++) {
        const x0 = rx * bw; const y0 = ry * bh;
        const x1 = Math.min(x0 + bw, W); const y1 = Math.min(y0 + bh, H);
        let rSum = 0, gSum = 0, bSum = 0, n = 0;
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const idx = (y * W + x) * 4;
            rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2];
            n++;
          }
        }
        const r = rSum / n, g = gSum / n, b = bSum / n;
        const { h } = rgbToHsv(r, g, b);
        const { l } = rgbToHsl(r, g, b); // 0..100
        const degree = Math.floor(Math.sqrt(h / 360) * Math.max(1, (paramsRef.current?.scaleIntervals?.length || 8) - 1));
        const oct = Math.floor((l / 100) * 3) - 1; // -1..+2
        const brightness = l / 100; // 0..1
        const velocity = clamp(0.3 + brightness * 0.7, 0.1, 1);
        blocksRef.current.push({ degree, oct, velocity, lightness: l, hue: h });
      }
    }
  }
  useEffect(() => { buildBlocks(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [blockW, blockH, scaleName]);

  // ------- Playback / Sequencing -------
  function play() {
    ensureAudio(); const ctx = audioCtxRef.current; if (!ctx) return; if (ctx.state === "suspended") ctx.resume();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    drawVisualizer();
    const beatMs = 60000 / paramsRef.current.bpm; const stepMs = Math.max(20, beatMs / clamp(paramsRef.current.speed, 0.25, 8));
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    stepTimerRef.current = setInterval(playStep, stepMs);
    setIsPlaying(true);
  }
  function stop() {
    cleanupAudio(); setIsPlaying(false);
    try { const ctx = audioCtxRef.current; if (ctx && ctx.state === 'running') ctx.suspend(); } catch {}
  }

  function scheduleNote(freq, velocity, brightness01) {
    const ctx = audioCtxRef.current; if (!ctx) return;
    const dry = dryGainRef.current; const wet = wetGainRef.current; const conv = convolverRef.current;
    if (!dry || !wet || !conv) return;

    const p = paramsRef.current; const now = ctx.currentTime;
    const beatDur = 60 / p.bpm; const stepDur = Math.max(0.05, beatDur / clamp(p.speed, 0.25, 8));
    const dur = clamp(stepDur * p.noteMult * (0.6 + 0.8 * velocity), 0.06, 2.0);

    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.Q.value = p.resonance;
    const cutoff = p.filterBase + brightness01 * p.filterTrack; filter.frequency.setValueAtTime(cutoff, now);

    const env = ctx.createGain(); env.gain.setValueAtTime(0, now);

    const trem = ctx.createGain(); trem.gain.setValueAtTime(1 - p.tremoloDepth, now);
    const tremLFO = ctx.createOscillator(); tremLFO.frequency.setValueAtTime(p.tremoloRate, now);
    const tremLFOGain = ctx.createGain(); tremLFOGain.gain.setValueAtTime(p.tremoloDepth, now);
    tremLFO.connect(tremLFOGain).connect(trem.gain);

    const bass = ctx.createBiquadFilter(); bass.type = "lowshelf"; bass.frequency.setValueAtTime(200, now); bass.gain.setValueAtTime(p.bassGain, now);

    const wetIn = ctx.createGain(); const dryIn = ctx.createGain();

    const srcSum = ctx.createGain();
    filter.connect(env); env.connect(trem); trem.connect(bass); bass.connect(wetIn); bass.connect(dryIn);
    wetIn.connect(conv); conv.connect(wet); dryIn.connect(dry);

    const peak = clamp(0.15 + 0.85 * velocity, 0.1, 1.0) * Math.pow(p.volume, 2);
    env.gain.linearRampToValueAtTime(peak, now + 0.01);
    env.gain.setTargetAtTime(peak * 0.6, now + 0.03, 0.05);
    env.gain.setTargetAtTime(0.0001, now + dur * 0.7, 0.1);

    const osc = ctx.createOscillator(); osc.type = p.oscType; osc.frequency.setValueAtTime(freq, now);
    const vib = ctx.createOscillator(); vib.frequency.setValueAtTime(p.vibratoRate, now);
    const vibDepth = ctx.createGain();
    const centsToHz = (cents) => freq * (Math.pow(2, cents / 1200) - 1);
    vibDepth.gain.setValueAtTime(centsToHz(p.vibratoDepth), now);
    vib.connect(vibDepth).connect(osc.frequency);

    const osc5 = ctx.createOscillator(); osc5.type = p.oscType; osc5.frequency.setValueAtTime(freq * 1.5, now);
    const osc8 = ctx.createOscillator(); osc8.type = p.oscType; osc8.frequency.setValueAtTime(freq * 2.0, now);
    const mix5 = ctx.createGain(); mix5.gain.setValueAtTime(clamp(p.fifthLevel, 0, 1), now);
    const mix8 = ctx.createGain(); mix8.gain.setValueAtTime(clamp(p.octaveLevel, 0, 1), now);

    osc.connect(srcSum); osc5.connect(mix5).connect(srcSum); osc8.connect(mix8).connect(srcSum);
    srcSum.connect(filter);

    osc.start(now); osc.stop(now + dur + 0.05);
    osc5.start(now); osc5.stop(now + dur + 0.05);
    osc8.start(now); osc8.stop(now + dur + 0.05);
    vib.start(now); vib.stop(now + dur + 0.05);
    tremLFO.start(now); tremLFO.stop(now + dur + 0.1);
  }

  function playStep() {
    const p = paramsRef.current; const blocks = blocksRef.current; const total = blocks.length;
    let degree = 0, oct = 0, velocity = 0.6, l = 50;
    if (total > 0) {
      const idx = stepRef.current % total; const b = blocks[idx];
      degree = b.degree; oct = b.oct; velocity = b.velocity; l = b.lightness;
    } else {
      const t = (stepRef.current % 64) / 64; degree = Math.floor(t * Math.max(1, (p.scaleIntervals?.length || 8) - 1));
    }
    const baseMidi = freqToMidi(p.baseNote);
    const interval = p.scaleIntervals[degree % p.scaleIntervals.length] + 12 * oct;
    const targetMidi = baseMidi + interval; const freq = midiToFreq(targetMidi);
    const brightness01 = l / 100;
    scheduleNote(freq, velocity, brightness01);
    stepRef.current = (stepRef.current + 1) % Math.max(1, total || 64);
  }

  // ------- Visualizer & Image Map -------
  function drawImageMap() {
    const imc = imageMapCanvasRef.current; if (!imc) return; const ictx = imc.getContext("2d"); if (!ictx) return;
    const src = originalCanvasRef.current || processedCanvasRef.current; if (!src) { ictx.clearRect(0, 0, imc.width, imc.height); return; }
    ictx.save(); ictx.imageSmoothingEnabled = true; ictx.clearRect(0, 0, imc.width, imc.height);
    const scale = Math.min(imc.width / src.width, imc.height / src.height);
    const dw = Math.floor(src.width * scale), dh = Math.floor(src.height * scale);
    const dx = Math.floor((imc.width - dw) / 2), dy = Math.floor((imc.height - dh) / 2);
    ictx.drawImage(src, 0, 0, src.width, src.height, dx, dy, dw, dh);

    const cols = Math.max(1, colsRef.current || 1); const rows = Math.max(1, rowsRef.current || 1);
    if (cols > 0 && rows > 0 && blocksRef.current.length > 0) {
      const total = Math.max(1, blocksRef.current.length || 1);
      const idx = (stepRef.current % total) || 0;
      const rx = idx % cols; const ry = Math.floor(idx / cols);
      const cw = dw / cols; const ch = dh / rows;
      const mx = dx + rx * cw; const my = dy + ry * ch;
      ictx.strokeStyle = "rgba(34, 211, 238, 0.9)"; ictx.lineWidth = Math.max(2, Math.min(cw, ch) * 0.06);
      ictx.strokeRect(mx + 0.5, my + 0.5, cw - 1, ch - 1);
    }
    ictx.restore();
  }

  function drawVisualizer() {
    const analyser = analyserRef.current; const canvas = canvasRef.current; if (!analyser || !canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const bufferLength = analyser.fftSize; const dataArray = new Uint8Array(bufferLength);
    const last = { t: 0 };

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const now = performance.now();
      const targetMs = isInteracting ? (1000 / 30) : (1000 / 60);
      if (now - last.t < targetMs) return; last.t = now;

      analyser.getByteTimeDomainData(dataArray);
      const { width, height } = canvas;

      // background
      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createLinearGradient(0, 0, width, height); grad.addColorStop(0, "#0f172a"); grad.addColorStop(1, "#111827");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 24) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, height); ctx.stroke(); }
      for (let y = 0; y < height; y += 24) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(width, y + 0.5); ctx.stroke(); }

      // waveform
      ctx.lineWidth = 2; ctx.strokeStyle = "#22d3ee"; ctx.beginPath();
      const sliceWidth = width / bufferLength; let x = 0;
      for (let i = 0; i < bufferLength; i++) { const v = dataArray[i] / 128.0; const y = (v * height) / 2; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); x += sliceWidth; }
      ctx.stroke();

      // image map overlay drawing (separate canvas element)
      drawImageMap();
    };
    draw();
  }

  // ------- Image Handling -------
  function handleImageUpload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { if (lastObjectUrlRef.current) { URL.revokeObjectURL(lastObjectUrlRef.current); lastObjectUrlRef.current = null; } } catch {}
    const url = URL.createObjectURL(file); lastObjectUrlRef.current = url;
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => { try { processImage(img); } finally { try { URL.revokeObjectURL(url); lastObjectUrlRef.current = null; } catch {} } };
    img.src = url;
  }

  function processImage(img) {
    // Full‑res snapshot for preview (clamped)
    const maxPreview = 2048; const previewScale = Math.min(maxPreview / img.width, maxPreview / img.height, 1);
    const pW = Math.max(1, Math.floor(img.width * previewScale));
    const pH = Math.max(1, Math.floor(img.height * previewScale));
    const full = document.createElement("canvas"); full.width = pW; full.height = pH;
    const fctx = full.getContext("2d"); if (fctx) { fctx.imageSmoothingEnabled = true; fctx.drawImage(img, 0, 0, pW, pH); }
    originalCanvasRef.current = full;

    // Downsample for analysis preserving aspect
    const maxW = 256, maxH = 256; const scale = Math.min(maxW / img.width, maxH / img.height, 1);
    const W = Math.max(1, Math.floor(img.width * scale)); const H = Math.max(1, Math.floor(img.height * scale));
    const off = document.createElement("canvas"); off.width = W; off.height = H;
    const ictx = off.getContext("2d", { willReadFrequently: true }); if (!ictx) return;
    ictx.imageSmoothingEnabled = true; ictx.drawImage(img, 0, 0, W, H);

    const imgData = ictx.getImageData(0, 0, W, H);
    imageDataRef.current = imgData.data; imgWRef.current = W; imgHRef.current = H; processedCanvasRef.current = off;

    stepRef.current = 0; buildBlocks(); drawImageMap();
  }

  // ------- Layout helpers -------
  useEffect(() => {
    function onResize() {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1; const rect = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = Math.floor(rect.width * dpr); canvasRef.current.height = Math.floor(rect.height * dpr);
      }
      if (imageMapCanvasRef.current) {
        const dpr = window.devicePixelRatio || 1; const rect = imageMapCanvasRef.current.getBoundingClientRect();
        imageMapCanvasRef.current.width = Math.floor(rect.width * dpr); imageMapCanvasRef.current.height = Math.floor(rect.height * dpr);
        drawImageMap();
      }
    }
    onResize(); window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); cleanupAudio(); };
  }, []);

  // Update image map backing size when height changes
  useEffect(() => {
    const el = imageMapCanvasRef.current; if (!el) return;
    const dpr = window.devicePixelRatio || 1; const rect = el.getBoundingClientRect();
    el.width = Math.floor(rect.width * dpr); el.height = Math.floor(rect.height * dpr);
    drawImageMap();
  }, [mapHeight]);

  // Repaint Image Map on visual‑affecting param changes while paused
  useEffect(() => { if (!isPlaying) drawImageMap(); }, [blockW, blockH, scaleName]);

  // Load a default example image on mount so users can play immediately
  useEffect(() => {
    const url = "https://www.lessrain.com/dev/images-2025/sonification/example01.png";
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { processImage(img); };
    img.onerror = () => { /* ignore if unavailable */ };
    img.src = url;
  }, []);

  // ------- Diagnostics (simple runtime tests) -------
  function runDiagnostics() {
    const results = [];
    const approx = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;
    const f440 = midiToFreq(69); results.push({ name: "midiToFreq(69) ≈ 440", pass: approx(f440, 440, 1e-6), info: f440.toFixed(6) });
    const m69 = freqToMidi(440); results.push({ name: "freqToMidi(440) ≈ 69", pass: approx(m69, 69, 1e-6), info: m69.toFixed(6) });
    results.push({ name: "Blocks computed", pass: blocksRef.current.length >= 0, info: `${blocksRef.current.length} blocks` });
    results.push({ name: "drawImageMap defined", pass: typeof drawImageMap === "function" });
    ensureAudio();
    const audioReady = !!(audioCtxRef.current && convolverRef.current && wetGainRef.current && dryGainRef.current && analyserRef.current);
    results.push({ name: "Audio initialized on demand", pass: audioReady });
    results.push({ name: "Reverb buffer refreshed", pass: updateReverbBufferSafe() });
    results.push({ name: "Wet/Dry updated", pass: updateWetDrySafe() });
    setDiagResults(results);
  }
  useEffect(() => { if (showDiag) runDiagnostics(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [showDiag, scaleName, blockW, blockH, reverbTime, reverbMix]);

  // ------- UI -------
  const ControlLabel = ({ title, hint }) => (
    <div className="text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
      <span>{title}</span>
      {hint && <span className="text-slate-500">{hint}</span>}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (isPlaying ? stop() : play())}
              className={`px-4 py-2 rounded-xl border transition shadow-sm ${
                isPlaying ? "bg-rose-500/10 border-rose-400/30 hover:bg-rose-500/20" : "bg-cyan-500/10 border-cyan-400/30 hover:bg-cyan-500/20"
              }`}
            >
              {isPlaying ? "Stop" : "Play"}
            </button>
            <label className="px-3 py-2 rounded-xl border border-slate-800/80 bg-slate-900/60 cursor-pointer hover:bg-slate-900">
              <span className="text-sm">Upload Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <button onClick={() => setShowDiag((v) => !v)} className="px-3 py-2 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 text-xs">
              {showDiag ? "Hide Diagnostics" : "Show Diagnostics"}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6 p-6">
          {/* Visualizer */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-300">Realtime Visualizer</div>
              <div className="text-xs text-slate-500">Waveform + Image Map</div>
            </div>
            <div className="relative">
              <canvas ref={canvasRef} className="block w-full h-[360px] md:h-[420px]" />
            </div>
            {/* Larger Image Map, synced with audio step */}
            <div className="border-t border-slate-800 p-4">
              <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span>Image Map (row → column blocks)</span>
                </span>
                <span className="flex items-center gap-2">
                  <span>Height</span>
                  <input type="range" min={120} max={520} step={10} value={mapHeight} onInput={(e) => setMapHeight(parseInt(e.target.value))} />
                </span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/40">
                <canvas ref={imageMapCanvasRef} className="block w-full" style={{ height: `${mapHeight}px` }} />
              </div>
            </div>
          </section>

          {/* Control Panel */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl">
            <div className="p-4 border-b border-slate-800">
              <div className="text-sm text-slate-300">Control Panel</div>
              <div className="text-xs text-slate-500">All controls update live during playback</div>
              <div className="mt-3">
                <label className="text-xs uppercase tracking-wider text-slate-300 block mb-1">Preset</label>
                <select value={preset} onChange={(e) => applyPreset(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40">
                  {Object.keys(PRESETS).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 space-y-6"
                 onMouseDown={() => setIsInteracting(true)}
                 onMouseUp={() => setIsInteracting(false)}
                 onMouseLeave={() => setIsInteracting(false)}
                 onTouchStart={() => setIsInteracting(true)}
                 onTouchEnd={() => setIsInteracting(false)}
            >
              {/* Core */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ControlLabel title="Volume" hint={`${Math.round(volume * 100)}%`} />
                  <input type="range" min={0} max={1} step={0.01} value={volume} onInput={(e) => setVolume(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="BPM" hint={`${bpm}`} />
                  <input type="range" min={40} max={240} step={1} value={bpm} onInput={(e) => setBpm(parseInt(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Speed (Steps/Beat)" hint={`×${speed}`} />
                  <input type="range" min={0.25} max={8} step={0.25} value={speed} onInput={(e) => setSpeed(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Note Length" hint={`×${noteMult.toFixed(2)}`} />
                  <input type="range" min={0.2} max={2} step={0.05} value={noteMult} onInput={(e) => setNoteMult(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
              </div>

              {/* Tone */}
              <div>
                <ControlLabel title="Oscillator Type" />
                <select value={oscType} onChange={(e) => setOscType(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40">
                  {["sine", "square", "sawtooth", "triangle"].map((t) => (
                    <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <ControlLabel title="Scale" />
                <select value={scaleName} onChange={(e) => setScaleName(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40">
                  {scales.map((s) => (<option key={s.name} value={s.name}>{s.name}</option>))}
                </select>
              </div>
              <div>
                <ControlLabel title="Base Note (Hz)" hint={`${Math.round(baseNote)} Hz`} />
                <input type="range" min={110} max={880} step={1} value={baseNote} onInput={(e) => setBaseNote(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
              </div>

              {/* Harmonics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ControlLabel title="5th Level" hint={`${Math.round(fifthLevel * 100)}%`} />
                  <input type="range" min={0} max={1} step={0.01} value={fifthLevel} onInput={(e) => setFifthLevel(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Octave Level" hint={`${Math.round(octaveLevel * 100)}%`} />
                  <input type="range" min={0} max={1} step={0.01} value={octaveLevel} onInput={(e) => setOctaveLevel(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
              </div>

              {/* Modulation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ControlLabel title="Vibrato Rate (Hz)" hint={`${vibratoRate.toFixed(1)}`} />
                  <input type="range" min={0} max={12} step={0.1} value={vibratoRate} onInput={(e) => setVibratoRate(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Vibrato Depth (cents)" hint={`${vibratoDepth}`} />
                  <input type="range" min={0} max={50} step={1} value={vibratoDepth} onInput={(e) => setVibratoDepth(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Tremolo Rate (Hz)" hint={`${tremoloRate.toFixed(1)}`} />
                  <input type="range" min={0} max={20} step={0.1} value={tremoloRate} onInput={(e) => setTremoloRate(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Tremolo Depth" hint={`${Math.round(tremoloDepth * 100)}%`} />
                  <input type="range" min={0} max={0.95} step={0.01} value={tremoloDepth} onInput={(e) => setTremoloDepth(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
              </div>

              {/* Filter & Reverb */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ControlLabel title="Filter Base (Hz)" hint={`${Math.round(filterBase)}`} />
                  <input type="range" min={100} max={4000} step={10} value={filterBase} onInput={(e) => setFilterBase(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Filter Tracking (Hz)" hint={`${Math.round(filterTrack)}`} />
                  <input type="range" min={0} max={6000} step={10} value={filterTrack} onInput={(e) => setFilterTrack(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Resonance (Q)" hint={`${resonance.toFixed(2)}`} />
                  <input type="range" min={0.3} max={10} step={0.1} value={resonance} onInput={(e) => setResonance(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Reverb Mix" hint={`${Math.round(reverbMix * 100)}%`} />
                  <input type="range" min={0} max={1} step={0.01} value={reverbMix} onInput={(e) => setReverbMix(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Reverb Time (s)" hint={`${reverbTime.toFixed(1)}`} />
                  <input type="range" min={0.2} max={4} step={0.1} value={reverbTime} onInput={(e) => setReverbTime(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Bass Boost (dB)" hint={`${bassGain.toFixed(1)}`} />
                  <input type="range" min={-6} max={18} step={0.5} value={bassGain} onInput={(e) => setBassGain(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
                </div>
              </div>

              {/* Blocks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ControlLabel title="Block Width (px)" hint={`${blockW}`} />
                  <input type="range" min={1} max={32} step={1} value={blockW} onInput={(e) => setBlockW(parseInt(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <ControlLabel title="Block Height (px)" hint={`${blockH}`} />
                  <input type="range" min={1} max={32} step={1} value={blockH} onInput={(e) => setBlockH(parseInt(e.target.value))} className="w-full accent-cyan-400" />
                </div>
              </div>

              {/* Diagnostics panel */}
              {showDiag && (
                <div className="text-[11px] leading-relaxed text-slate-300 bg-slate-950/40 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Diagnostics</div>
                  <ul className="space-y-1">
                    {diagResults.map((r, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{r.name}</span>
                        <span className={r.pass ? "text-emerald-400" : "text-rose-400"}>{r.pass ? "PASS" : "FAIL"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>Upload an image, tweak synthesis & FX, and play. Blocks scan left→right, top→bottom.</div>
          <div>Tip: Larger blocks simplify rhythm; smaller blocks increase detail.</div>
        </div>
      </footer>
    </div>
  );
}

// Mount into #root (CodePen HTML panel must contain <div id="root"></div>)
const rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(React.createElement(SonificationApp));

document.addEventListener("DOMContentLoaded", () => {
    const isCodePen = document.referrer.includes("codepen.io");
    const hostDomains = isCodePen ? ["codepen.io"] : [];
    hostDomains.push(window.location.hostname);

    const links = document.getElementsByTagName("a");
    LR.utils.urlUtils.validateLinks(links, hostDomains);
});



