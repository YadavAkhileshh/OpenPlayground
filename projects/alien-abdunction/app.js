const CONFIG = {
  WIDTH: 640,
  HEIGHT: 360,
  PALETTE: {
    bg: "#050505",
    ufo: "#e0e0e0",
    ufoGlass: "#83bbff",
    beam: "rgba(189, 255, 0, 0.3)",
    beamCore: "rgba(255, 255, 255, 0.6)",
    enemyAlert: "#ffff00",
    projectile: "#ff0044",
    shell: "#ffaa00",
    shadow: "rgba(0,0,0,0.4)",
    powerup: { hp: "#f33", energy: "#ff0", shield: "#0ff" }
  },
  BIOMES: [
    {
      type: "FARM",
      grass: "#1a3324",
      grid: "rgba(50,255,50,0.05)",
      tree: "oak",
      weather: "clear"
    },
    {
      type: "DESERT",
      grass: "#c2b280",
      grid: "rgba(200,100,0,0.05)",
      tree: "palm",
      weather: "clear"
    },
    {
      type: "SNOW",
      grass: "#e8e8e8",
      grid: "rgba(100,100,255,0.05)",
      tree: "pine",
      weather: "snow"
    },
    {
      type: "WASTELAND",
      grass: "#3d342b",
      grid: "rgba(255,0,0,0.05)",
      tree: "dead",
      weather: "rain"
    }
  ],
  PLAYER: {
    speed: 3.5,
    boostMult: 1.8,
    maxHp: 100,
    maxEnergy: 100,
    energyRecharge: 0.25,
    beamCost: 0.8,
    boostCost: 0.5
  },
  SCORING: {
    cow: 100,
    pig: 150,
    chicken: 200,
    heli: 400,
    tank: 500,
    kill: 50,
    powerup: 50
  }
};

const KEYS = {
  UP: ["ArrowUp", "w"],
  DOWN: ["ArrowDown", "s"],
  LEFT: ["ArrowLeft", "a"],
  RIGHT: ["ArrowRight", "d"],
  ACTION: [" "],
  BOOST: ["Shift"],
  PAUSE: ["p", "Escape"]
};

const $ = (id) => document.getElementById(id);
const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
const rand = (min, max) => Math.random() * (max - min) + min;

const checkRectCollide = (r1, r2, pad = 4) => {
  const p1 = Math.min(pad, Math.min(r1.w, r1.h) / 2 - 0.5);
  const p2 = Math.min(pad, Math.min(r2.w, r2.h) / 2 - 0.5);
  return (
    r1.x + p1 < r2.x + r2.w - p2 &&
    r1.x + r1.w - p1 > r2.x + p2 &&
    r1.y + p1 < r2.y + r2.h - p2 &&
    r1.y + r1.h - p1 > r2.y + p2
  );
};

const checkCircleCollide = (e1, e2, r1Ratio = 0.35, r2Ratio = 0.4) => {
  const x1 = e1.x + e1.w / 2;
  const y1 = e1.y + e1.h / 2;
  const x2 = e2.x + e2.w / 2;
  const y2 = e2.y + e2.h / 2;
  const r1 = Math.max(e1.w, e1.h) * r1Ratio;
  const r2 = Math.max(e2.w, e2.h) * r2Ratio;
  return (x1 - x2) ** 2 + (y1 - y2) ** 2 < (r1 + r2) ** 2;
};

const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const lerp = (a, b, t) => a + (b - a) * t;

const Storage = {
  get: (key, def) => {
    try {
      return JSON.parse(localStorage.getItem("alien_game_" + key)) || def;
    } catch (e) {
      return def;
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem("alien_game_" + key, JSON.stringify(val));
    } catch (e) {}
  }
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = Storage.get("audio", true);
    this.musicInterval = null;
    const unlock = () => {
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchstart", unlock);
    document.addEventListener("click", unlock);
  }
  init() {
    if (!this.enabled || this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
  }
  toggle() {
    this.enabled = !this.enabled;
    Storage.set("audio", this.enabled);
    if (!this.enabled && this.ctx) this.ctx.suspend();
    if (this.enabled) {
      if (!this.ctx) this.init();
      else this.ctx.resume();
    }
    return this.enabled;
  }
  playTone(freq, type, duration, vol = 1, slideTo = null) {
    if (!this.ctx || !this.enabled || this.ctx.state === "suspended") return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideTo)
      osc.frequency.exponentialRampToValueAtTime(
        slideTo,
        this.ctx.currentTime + duration
      );
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration
    );
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
  playNoise(duration, vol = 0.5) {
    if (!this.ctx || !this.enabled) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration
    );
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }
  sfx(name) {
    switch (name) {
      case "beam":
        this.playTone(120, "sine", 0.1, 0.3);
        break;
      case "shoot":
        this.playTone(600, "square", 0.1, 0.2, 200);
        this.playNoise(0.05, 0.2);
        break;
      case "hit":
        this.playNoise(0.2, 0.6);
        this.playTone(150, "sawtooth", 0.2, 0.5, 50);
        break;
      case "pickup":
        this.playTone(880, "sine", 0.1, 0.4);
        setTimeout(() => this.playTone(1760, "square", 0.1, 0.4), 80);
        break;
      case "powerup":
        this.playTone(440, "square", 0.1, 0.5);
        setTimeout(() => this.playTone(880, "square", 0.1, 0.5), 100);
        setTimeout(() => this.playTone(1760, "square", 0.2, 0.5), 200);
        break;
      case "die":
        this.playTone(300, "sawtooth", 0.6, 0.6, 50);
        this.playNoise(0.5, 0.5);
        break;
      case "start":
        this.playTone(440, "square", 0.1);
        setTimeout(() => this.playTone(554, "square", 0.1), 100);
        setTimeout(() => this.playTone(659, "square", 0.2), 200);
        break;
      case "charge":
        this.playTone(200, "triangle", 0.3, 0.2, 600);
        break;
      case "select":
        this.playTone(440, "square", 0.05, 0.1);
        break;
      case "confirm":
        this.playTone(880, "square", 0.1, 0.2);
        break;
    }
  }
  startMusic() {
    if (!this.enabled || this.musicInterval) return;
    let step = 0;
    const bass = [110, 110, 110, 110, 98, 98, 130, 130];
    const arp = [220, 261, 329, 261, 196, 220, 261, 196];
    this.musicInterval = setInterval(() => {
      if (this.ctx && this.ctx.state === "running") {
        if (step % 2 === 0)
          this.playTone(bass[(step / 2) % 8] / 2, "triangle", 0.3, 0.3);
        if (Math.random() > 0.4)
          this.playTone(arp[step % 8], "square", 0.1, 0.05);
        step++;
      }
    }, 150);
  }
  stopMusic() {
    if (this.musicInterval) clearInterval(this.musicInterval);
    this.musicInterval = null;
  }
}

const Sprites = {};
function generateSprites() {
  const create = (w, h, drawFn) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    drawFn(ctx, w, h);
    return c;
  };
  const createAnim = (w, h, frames, drawFn) => {
    const arr = [];
    for (let i = 0; i < frames; i++)
      arr.push(create(w, h, (ctx) => drawFn(ctx, w, h, i)));
    return arr;
  };

  Sprites.player = createAnim(34, 30, 8, (c, w, h, f) => {
    const cx = w / 2,
      cy = h / 2;
    const headY = cy - 2 + Math.sin(f * 0.5) * 1;
    c.fillStyle = "#6f6";
    c.beginPath();
    c.ellipse(cx, headY, 3.5, 4.5, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#000";
    const look = Math.sin(f * 0.2) * 1.5;
    c.beginPath();
    c.ellipse(cx - 1.5 + look, headY, 1.2, 2, -0.2, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(cx + 1.5 + look, headY, 1.2, 2, 0.2, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#aaa";
    c.beginPath();
    c.ellipse(cx, cy + 4, 16, 6, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#777";
    c.beginPath();
    c.ellipse(cx, cy + 6, 12, 3, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(131, 187, 255, 0.6)";
    c.beginPath();
    c.arc(cx, cy, 9, Math.PI, 0);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.7)";
    c.beginPath();
    c.arc(cx - 4, cy - 4, 2, 0, Math.PI * 2);
    c.fill();
    const totalLights = 5;
    const colors = ["#f00", "#ff0", "#0f0", "#0ff", "#f0f"];
    for (let i = 0; i < totalLights; i++) {
      const angle = (i / totalLights) * Math.PI * 2 + f * 0.4;
      const lx = cx + Math.cos(angle) * 14;
      const ly = cy + 4 + Math.sin(angle) * 5;
      if (Math.sin(angle) > 0) {
        const intensity = (Math.sin(angle) + 1) / 2;
        c.globalAlpha = intensity;
        c.fillStyle = colors[i % colors.length];
        c.beginPath();
        c.arc(lx, ly, 1.5, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
      }
    }
  });

  Sprites.cow = createAnim(28, 20, 2, (c, w, h, f) => {
    const legOffset = f === 0 ? 0 : 2;
    c.fillStyle = "#000";
    c.fillRect(22, 1, 1, 2);
    c.fillRect(26, 1, 1, 2);
    c.fillStyle = "#aaa";
    c.fillRect(7 + legOffset, 14, 2, 5);
    c.fillRect(19 - legOffset, 14, 2, 5);
    c.fillStyle = "#fff";
    c.fillRect(5, 4, 18, 11);
    c.fillStyle = "#000";
    c.fillRect(8, 5, 4, 3);
    c.fillRect(16, 8, 3, 4);
    c.fillStyle = "#fff";
    c.fillRect(21, 2, 6, 7);
    c.fillStyle = "#000";
    c.fillRect(24, 4, 1, 1);
    c.fillStyle = "#faa";
    c.fillRect(24, 7, 3, 2);
    c.fillRect(12, 15, 4, 1);
    c.fillStyle = "#fff";
    c.fillRect(5 - legOffset, 15, 2, 5);
    c.fillRect(21 + legOffset, 15, 2, 5);
    c.fillStyle = "#111";
    c.fillRect(5 - legOffset, 19, 2, 1);
    c.fillRect(21 + legOffset, 19, 2, 1);
  });

  Sprites.pig = createAnim(22, 16, 2, (c, w, h, f) => {
    const off = f === 0 ? 0 : 2;
    c.fillStyle = "#c68";
    c.fillRect(5 + off, 12, 2, 4);
    c.fillRect(14 - off, 12, 2, 4);
    c.fillStyle = "#e8a";
    c.fillRect(1, 6, 2, 2);
    c.fillStyle = "#ffb5b5";
    c.fillRect(3, 4, 16, 9);
    c.fillRect(3, 11, 15, 2);
    c.fillStyle = "#ffb5b5";
    c.fillRect(15, 4, 6, 7);
    c.fillStyle = "#e8a";
    c.fillRect(19, 7, 3, 3);
    c.fillStyle = "#000";
    c.fillRect(17, 5, 1, 1);
    c.fillStyle = "#ffb5b5";
    c.fillRect(16, 2, 2, 2);
    c.fillStyle = "#ffd1d1";
    c.fillRect(4 - off, 13, 2, 3);
    c.fillRect(15 + off, 13, 2, 3);
  });

  Sprites.chicken = createAnim(18, 18, 2, (c, w, h, f) => {
    const y = f === 0 ? 0 : 1;
    c.fillStyle = "#f90";
    c.fillRect(6, 13 + y, 2, 3);
    c.fillRect(10, 13 + y, 2, 3);
    c.fillStyle = "#eee";
    c.fillRect(1, 6 + y, 3, 4);
    c.fillStyle = "#fff";
    c.fillRect(4, 5 + y, 10, 9);
    c.fillStyle = "#ddd";
    c.fillRect(5, 9 + y, 4, 3);
    c.fillStyle = "#d00";
    c.fillRect(8, 3 + y, 2, 2);
    c.fillRect(10, 4 + y, 2, 1);
    c.fillStyle = "#fa0";
    c.fillRect(14, 8 + y, 3, 2);
    c.fillStyle = "#d00";
    c.fillRect(14, 10 + y, 2, 2);
    c.fillStyle = "#000";
    c.fillRect(10, 7 + y, 1, 1);
    c.fillRect(12, 7 + y, 1, 1);
  });

  Sprites.enemy = createAnim(22, 24, 2, (c, w, h, f) => {
    const y = f === 0 ? 0 : 1;
    c.fillStyle = "#349";
    c.fillRect(7, 16, 3, 6);
    c.fillRect(12, 16, 3, 6);
    c.fillStyle = "#d22";
    c.fillRect(6, 9, 10, 7);
    c.fillStyle = "#222";
    c.fillRect(6, 15, 10, 2);
    c.fillStyle = "#fa0";
    c.fillRect(10, 15, 2, 2);
    c.fillStyle = "#349";
    c.fillRect(8, 11, 6, 5);
    c.fillStyle = "#d22";
    c.fillRect(2, 10 + y, 4, 3);
    c.fillRect(3, 13 + y, 3, 3);
    c.fillRect(16, 10 + y, 4, 3);
    c.fillRect(16, 13 + y, 3, 3);
    c.fillStyle = "#fca";
    c.fillRect(2, 15 + y, 3, 3);
    c.fillRect(17, 15 + y, 3, 3);
    c.fillStyle = "#fca";
    c.fillRect(8, 4, 6, 5);
    c.fillStyle = "#eec";
    c.fillRect(5, 3, 12, 2);
    c.fillRect(7, 1, 8, 2);
  });

  Sprites.tank = createAnim(48, 32, 2, (c, w, h, f) => {
    const off = f === 0 ? 0 : 1;
    c.fillStyle = "#222";
    c.fillRect(2, 22, 44, 10);
    c.fillStyle = "#555";
    for (let i = 0; i < 5; i++)
      c.beginPath(), c.arc(8 + i * 8 + off, 27, 3, 0, Math.PI * 2), c.fill();
    c.fillStyle = "#4b5e28";
    c.fillRect(4, 14, 40, 10);
    c.fillStyle = "#3a4a20";
    c.beginPath();
    c.arc(24, 14, 10, 0, Math.PI * 2);
    c.fill();
  });

  Sprites.tankTurret = create(32, 12, (c, w, h) => {
    c.fillStyle = "#111";
    c.fillRect(14, 4, 18, 4);
    c.fillStyle = "#000";
    c.fillRect(30, 3, 2, 6);
    c.fillStyle = "#3a4a20";
    c.fillRect(0, 0, 14, 12);
    c.fillStyle = "#4b5e28";
    c.fillRect(2, 2, 10, 8);
  });

  Sprites.helicopter = createAnim(48, 32, 2, (c, w, h, f) => {
    c.fillStyle = "#222";
    c.fillRect(8, 28, 32, 2);
    c.fillRect(14, 24, 2, 4);
    c.fillRect(32, 24, 2, 4);
    c.fillStyle = "#35402a";
    c.fillRect(34, 12, 14, 6);
    c.fillRect(44, 8, 4, 10);
    c.beginPath();
    c.moveTo(4, 14);
    c.lineTo(12, 8);
    c.lineTo(36, 8);
    c.lineTo(36, 24);
    c.lineTo(12, 24);
    c.lineTo(4, 18);
    c.fill();
    c.fillStyle = "#8cf";
    c.beginPath();
    c.moveTo(5, 16);
    c.lineTo(12, 10);
    c.lineTo(24, 10);
    c.lineTo(24, 18);
    c.lineTo(6, 18);
    c.fill();
    c.fillStyle = "#333";
    if (f === 0) c.fillRect(4, 2, 40, 2);
    else {
      c.fillRect(14, 2, 20, 2);
      c.globalAlpha = 0.3;
      c.fillRect(2, 1, 44, 4);
      c.globalAlpha = 1;
    }
  });

  Sprites.treePine = [
    create(32, 64, (c) => {
      c.fillStyle = "#321";
      c.fillRect(12, 48, 8, 16);
      c.fillStyle = "#142";
      c.beginPath();
      c.moveTo(16, 0);
      c.lineTo(32, 48);
      c.lineTo(0, 48);
      c.fill();
      c.fillStyle = "#163";
      c.beginPath();
      c.moveTo(16, 0);
      c.lineTo(24, 48);
      c.lineTo(8, 48);
      c.fill();
    })
  ];
  Sprites.treeOak = [
    create(48, 64, (c) => {
      c.fillStyle = "#432";
      c.fillRect(20, 40, 8, 24);
      c.fillStyle = "#262";
      c.beginPath();
      c.arc(24, 24, 20, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#383";
      c.beginPath();
      c.arc(24, 20, 15, 0, Math.PI * 2);
      c.fill();
    })
  ];
  Sprites.treeDead = [
    create(32, 48, (c) => {
      c.fillStyle = "#433";
      c.fillRect(14, 20, 4, 28);
      c.strokeStyle = "#433";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(16, 30);
      c.lineTo(4, 10);
      c.moveTo(16, 35);
      c.lineTo(28, 15);
      c.stroke();
    })
  ];
  Sprites.treePalm = [
    create(48, 64, (c) => {
      c.fillStyle = "#8B4513";
      c.beginPath();
      c.moveTo(22, 64);
      c.lineTo(26, 64);
      c.lineTo(24, 20);
      c.fill();
      c.strokeStyle = "#228B22";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(24, 20);
      c.quadraticCurveTo(10, 20, 0, 30);
      c.moveTo(24, 20);
      c.quadraticCurveTo(38, 20, 48, 30);
      c.moveTo(24, 20);
      c.quadraticCurveTo(14, 10, 10, 0);
      c.moveTo(24, 20);
      c.quadraticCurveTo(34, 10, 38, 0);
      c.stroke();
    })
  ];

  Sprites.rock = [
    create(32, 28, (c) => {
      c.fillStyle = "#5a5a5a";
      c.beginPath();
      c.moveTo(10, 28);
      c.lineTo(2, 18);
      c.lineTo(8, 6);
      c.lineTo(20, 4);
      c.lineTo(30, 12);
      c.lineTo(28, 24);
      c.lineTo(18, 28);
      c.fill();

      c.fillStyle = "#7a7a7a";
      c.beginPath();
      c.moveTo(8, 6);
      c.lineTo(20, 4);
      c.lineTo(24, 10);
      c.lineTo(12, 14);
      c.lineTo(4, 12);
      c.fill();

      c.fillStyle = "#3a3a3a";
      c.beginPath();
      c.moveTo(28, 24);
      c.lineTo(30, 12);
      c.lineTo(22, 16);
      c.lineTo(20, 26);
      c.fill();

      c.strokeStyle = "#333";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(14, 16);
      c.lineTo(18, 20);
      c.stroke();
    })
  ];

  Sprites.bush = [
    create(26, 20, (c) => {
      c.fillStyle = "#262";
      c.beginPath();
      c.arc(8, 12, 7, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(18, 12, 7, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(13, 8, 7, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#383";
      c.beginPath();
      c.arc(13, 8, 4, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#d22";
      c.fillRect(6, 12, 2, 2);
      c.fillRect(19, 10, 2, 2);
      c.fillRect(13, 6, 2, 2);
    })
  ];

  Sprites.cactus = [
    create(24, 32, (c) => {
      c.fillStyle = "#2a2";
      c.fillRect(10, 2, 4, 30);
      c.fillRect(4, 12, 6, 4);
      c.fillRect(4, 6, 4, 6);
      c.fillRect(14, 16, 6, 4);
      c.fillRect(16, 12, 4, 4);
      c.fillStyle = "rgba(0,0,0,0.1)";
      c.fillRect(11, 2, 1, 30);
    })
  ];

  const drawBox = (c, color, char) => {
    c.fillStyle = "#333";
    c.fillRect(0, 0, 16, 16);
    c.fillStyle = color;
    c.fillRect(2, 2, 12, 12);
    c.fillStyle = "#fff";
    c.font = "10px monospace";
    c.fillText(char, 4, 12);
  };
  Sprites.powerHp = [
    create(16, 16, (c) => drawBox(c, CONFIG.PALETTE.powerup.hp, "♥"))
  ];
  Sprites.powerEnergy = [
    create(16, 16, (c) => drawBox(c, CONFIG.PALETTE.powerup.energy, "⚡"))
  ];
  Sprites.powerShield = [
    create(16, 16, (c) => drawBox(c, CONFIG.PALETTE.powerup.shield, "🛡"))
  ];
}

class InputManager {
  constructor() {
    this.keys = { up: 0, down: 0, left: 0, right: 0, action: 0, boost: 0 };
    this.internalKeys = { ...this.keys };
    this.prevKeys = { ...this.keys };
    this.touchStart = null;
    window.addEventListener("keydown", (e) => this.handleKey(e, 1));
    window.addEventListener("keyup", (e) => this.handleKey(e, 0));
    const bindTouch = (id, key) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.internalKeys[key] = 1;
        el.classList.add("active");
      });
      el.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.internalKeys[key] = 0;
        el.classList.remove("active");
      });
    };
    bindTouch("btn-beam", "action");
    bindTouch("btn-boost", "boost");
    const container = $("game-container");
    container.addEventListener(
      "touchstart",
      (e) => {
        const t = e.changedTouches[0];
        if (t.clientX < window.innerWidth / 2)
          this.touchStart = { x: t.clientX, y: t.clientY };
      },
      { passive: false }
    );
    container.addEventListener(
      "touchmove",
      (e) => {
        if (!this.touchStart) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - this.touchStart.x;
        const dy = t.clientY - this.touchStart.y;
        this.internalKeys.right = dx > 15 ? 1 : 0;
        this.internalKeys.left = dx < -15 ? 1 : 0;
        this.internalKeys.down = dy > 15 ? 1 : 0;
        this.internalKeys.up = dy < -15 ? 1 : 0;
      },
      { passive: false }
    );
    container.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0];
      if (t.clientX < window.innerWidth / 2) {
        this.touchStart = null;
        this.internalKeys.up = 0;
        this.internalKeys.down = 0;
        this.internalKeys.left = 0;
        this.internalKeys.right = 0;
      }
    });
  }
  handleKey(e, state) {
    if (document.activeElement && document.activeElement.tagName === "INPUT")
      return;
    if (KEYS.UP.includes(e.key)) this.internalKeys.up = state;
    if (KEYS.DOWN.includes(e.key)) this.internalKeys.down = state;
    if (KEYS.LEFT.includes(e.key)) this.internalKeys.left = state;
    if (KEYS.RIGHT.includes(e.key)) this.internalKeys.right = state;
    if (KEYS.ACTION.includes(e.key)) this.internalKeys.action = state;
    if (KEYS.BOOST.includes(e.key)) this.internalKeys.boost = state;
    if (state && KEYS.PAUSE.includes(e.key)) Game.togglePause();
  }
  update() {
    this.prevKeys = { ...this.keys };
    this.keys = { ...this.internalKeys };
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let gp of gps) {
      if (!gp) continue;
      const pressed = (b) => b && b.pressed;
      const dead = (v) => (Math.abs(v) > 0.4 ? (v > 0 ? 1 : -1) : 0);
      if (pressed(gp.buttons[0]) || pressed(gp.buttons[2]))
        this.keys.action = 1;
      if (pressed(gp.buttons[1]) || pressed(gp.buttons[5])) this.keys.boost = 1;
      const ax = dead(gp.axes[0]);
      const ay = dead(gp.axes[1]);
      if (ax < 0 || pressed(gp.buttons[14])) this.keys.left = 1;
      if (ax > 0 || pressed(gp.buttons[15])) this.keys.right = 1;
      if (ay < 0 || pressed(gp.buttons[12])) this.keys.up = 1;
      if (ay > 0 || pressed(gp.buttons[13])) this.keys.down = 1;
    }
  }
  justPressed(k) {
    return this.keys[k] && !this.prevKeys[k];
  }
}

class Entity {
  constructor(x, y, w, h, frames) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.frames = frames || [];
    this.frameIndex = 0;
    this.animTimer = 0;
    this.animSpeed = 0.2;
    this.dead = false;
    this.z = 0;
    this.shadow = true;
    this.flying = false;
    this.isObstacle = false;
  }
  update(dt) {
    this.x += this.vx;
    this.y += this.vy;
    if (
      this.frames.length > 1 &&
      (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1 || this.alwaysAnimate)
    ) {
      this.animTimer += dt * this.animSpeed;
      if (this.animTimer >= 1) {
        this.animTimer = 0;
        this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      }
    }
  }
  drawShadow(ctx) {
    if (this.shadow && this.z > -10 && !this.dead) {
      ctx.save();
      ctx.translate(
        Math.floor(this.x + this.w / 2),
        Math.floor(this.y + this.h - 2)
      );
      const sScale = Math.max(0.2, 1 - this.z / 120);
      ctx.scale(sScale, sScale);
      ctx.fillStyle = CONFIG.PALETTE.shadow;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.w / 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  drawSprite(ctx) {
    if (!this.frames.length) return;
    ctx.save();
    ctx.translate(
      Math.floor(this.x + this.w / 2),
      Math.floor(this.y + this.h / 2 - this.z)
    );
    if (this.vx < 0) ctx.scale(-1, 1);
    ctx.drawImage(this.frames[this.frameIndex], -this.w / 2, -this.h / 2);
    ctx.restore();
  }
  draw(ctx) {
    this.drawShadow(ctx);
    this.drawSprite(ctx);
  }
}

class FloatingText {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 60;
    this.vy = -0.5;
  }
  update() {
    this.y += this.vy;
    this.life--;
  }
  draw(ctx) {
    ctx.globalAlpha = Math.max(0, this.life / 60);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.font = '10px "Press Start 2P"';
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

class Player extends Entity {
  constructor() {
    super(CONFIG.WIDTH / 2, 100, 32, 32, Sprites.player);
    this.hp = CONFIG.PLAYER.maxHp;
    this.energy = CONFIG.PLAYER.maxEnergy;
    this.invuln = 0;
    this.shieldActive = 0;
    this.bobble = 0;
    this.flying = true;
    this.z = 70;
    this.animSpeed = 0.2;
    this.alwaysAnimate = true;
  }
  update(dt, input) {
    let speed = CONFIG.PLAYER.speed;
    if (input.keys.boost && (this.energy > 0 || this.infiniteEnergy)) {
      speed *= CONFIG.PLAYER.boostMult;
      if (!this.infiniteEnergy) this.energy -= CONFIG.PLAYER.boostCost;
      if (Math.random() > 0.5)
        Game.particles.push(
          ParticlePool.get(this.x + 16, this.y + 16, "#0ff", 0.5)
        );
    } else {
      this.energy = Math.min(
        this.energy + CONFIG.PLAYER.energyRecharge,
        CONFIG.PLAYER.maxEnergy
      );
    }
    this.vx = lerp(this.vx, (input.keys.right - input.keys.left) * speed, 0.2);
    this.vy = lerp(this.vy, (input.keys.down - input.keys.up) * speed, 0.2);

    this.bobble += 0.1;
    this.z = 70 + Math.sin(this.bobble) * 2;

    const visualTopLimit = this.z - 10;
    const visualBottomLimit = Game.levelH + 40;

    this.x = clamp(this.x + this.vx, 0, Game.levelW - this.w);
    this.y = clamp(this.y + this.vy, visualTopLimit, visualBottomLimit);

    if (
      input.keys.action &&
      (this.energy > CONFIG.PLAYER.beamCost || this.infiniteEnergy)
    ) {
      if (!this.infiniteEnergy) this.energy -= CONFIG.PLAYER.beamCost;
      this.beaming = true;
      if (Math.random() > 0.85) audio.sfx("beam");
    } else {
      this.beaming = false;
    }
    if (this.invuln > 0) this.invuln--;
    if (this.shieldActive > 0) this.shieldActive--;
    if (this.infiniteEnergy > 0) this.infiniteEnergy--;
    super.update(dt);
  }
  drawSprite(ctx) {
    if (
      this.invuln > 0 &&
      this.shieldActive <= 0 &&
      Math.floor(Date.now() / 50) % 2 === 0
    )
      return;
    if (this.beaming) {
      ctx.save();
      ctx.translate(Math.floor(this.x + 16), Math.floor(this.y + 32 - this.z));
      const beamLen = Math.max(0, this.z);
      const spread = 8 + beamLen * 0.2;
      const grad = ctx.createLinearGradient(0, 0, 0, beamLen);
      grad.addColorStop(0, CONFIG.PALETTE.beam);
      grad.addColorStop(1, "rgba(189, 255, 0, 0.05)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-spread, beamLen);
      ctx.lineTo(spread, beamLen);
      ctx.lineTo(6, 0);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(-1, 0, 2, beamLen);
      ctx.restore();
    }
    super.drawSprite(ctx);
    if (this.shieldActive > 0) {
      ctx.save();
      ctx.translate(Math.floor(this.x + 16), Math.floor(this.y + 16 - this.z));
      ctx.strokeStyle = `rgba(0, 255, 255, ${Math.abs(
        Math.sin(Date.now() / 100)
      )})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

class Animal extends Entity {
  constructor(x, y, type) {
    const specs = {
      cow: { s: Sprites.cow, hp: 100, score: CONFIG.SCORING.cow, w: 26, h: 20 },
      pig: { s: Sprites.pig, hp: 60, score: CONFIG.SCORING.pig, w: 22, h: 16 },
      chicken: {
        s: Sprites.chicken,
        hp: 30,
        score: CONFIG.SCORING.chicken,
        w: 18,
        h: 18
      }
    };
    const s = specs[type];
    super(x, y, s.w, s.h, s.s);
    this.type = type;
    this.maxResist = s.hp;
    this.resist = s.hp;
    this.value = s.score;
    this.state = "idle";
    this.moveTimer = 0;
    this.animSpeed = 0.15;
  }
  update(dt, player) {
    if (this.state === "lifted") {
      this.z += 2.5;
      const targetX = player.x + player.w / 2 - this.w / 2;
      const targetY = player.y + player.h / 2 - this.h / 2;
      this.x += (targetX - this.x) * 0.15;
      this.y += (targetY - this.y) * 0.15;

      if (this.z > player.z - 5) {
        this.dead = true;
        Game.addScore(this.value, this.x, this.y);
        audio.sfx("pickup");
        for (let i = 0; i < 8; i++)
          Game.particles.push(
            ParticlePool.get(this.x + this.w / 2, this.y, "#fff")
          );
      }
      return;
    }

    let inBeam = false;
    if (player.beaming) {
      const centerX = player.x + 16;
      const centerY = player.y + 16;
      const myCenterX = this.x + this.w / 2;
      const myCenterY = this.y + this.h / 2;
      const d = Math.hypot(centerX - myCenterX, centerY - myCenterY);
      if (d < 24) inBeam = true;
    }

    if (inBeam) {
      this.resist -= 2;
      this.z = Math.random() * 5;
      if (this.resist <= 0) this.state = "lifted";
    } else {
      this.resist = Math.min(this.resist + 0.5, this.maxResist);
      if (this.z > 0) this.z = Math.max(0, this.z - 1);
    }

    this.moveTimer--;
    if (this.moveTimer <= 0) {
      this.moveTimer = rand(60, 200);
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
    }

    const nextX = this.x + this.vx;
    const nextY = this.y + this.vy;
    let collide = false;

    if (
      nextX < 0 ||
      nextX > Game.levelW - 16 ||
      nextY < 0 ||
      nextY > Game.levelH - 16
    ) {
      collide = true;
    } else {
      const r1 = { x: nextX, y: nextY, w: this.w, h: this.h };
      for (let e of Game.entities) {
        if (e.isObstacle && !e.dead && checkRectCollide(r1, e)) {
          collide = true;
          break;
        }
      }
    }

    if (collide) {
      this.vx *= -1;
      this.vy *= -1;
      if (this.x <= 0) this.x = 1;
      else if (this.x >= Game.levelW - 16) this.x = Game.levelW - 16;
      if (this.y <= 0) this.y = 1;
      else if (this.y >= Game.levelH - 16) this.y = Game.levelH - 16;
    } else {
      this.x += this.vx;
      this.y += this.vy;
    }

    super.update(dt);
  }
  drawSprite(ctx) {
    if (this.state === "lifted") {
      ctx.globalAlpha = 0.7;
      ctx.save();
      const s = 1 - this.z / 150;
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
      ctx.scale(s, s);
      ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));
    }
    super.drawSprite(ctx);
    if (this.state === "lifted") {
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    if (this.resist < this.maxResist && this.state !== "lifted") {
      const pct = this.resist / this.maxResist;
      ctx.fillStyle = "#000";
      ctx.fillRect(this.x, this.y - 6, this.w, 3);
      ctx.fillStyle = pct < 0.3 ? "#0f0" : "#f00";
      ctx.fillRect(this.x + 1, this.y - 5, (this.w - 2) * (1 - pct), 1);
    }
  }
}

class Enemy extends Entity {
  constructor(x, y) {
    super(x, y, 22, 24, Sprites.enemy);
    this.cooldown = rand(100, 200);

    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * 0.5;
    this.vy = Math.sin(angle) * 0.5;

    this.state = "PATROL";
    this.alertTimer = 0;
    this.animSpeed = 0.15;
    this.moveTimer = 0;
  }
  update(dt, player) {
    if (this.dead) return;
    const d = dist(this.x, this.y, player.x, player.y);

    if (this.state === "PATROL") {
      this.moveTimer--;
      if (this.moveTimer <= 0) {
        this.moveTimer = rand(60, 180);
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * 0.8;
        this.vy = Math.sin(angle) * 0.8;
      }

      this.x += this.vx;
      if (this.x <= 0) {
        this.x = 0;
        this.vx = Math.abs(this.vx);
      } else if (this.x >= Game.levelW - 16) {
        this.x = Game.levelW - 16;
        this.vx = -Math.abs(this.vx);
      }

      this.y += this.vy;
      if (this.y <= 0) {
        this.y = 0;
        this.vy = Math.abs(this.vy);
      } else if (this.y >= Game.levelH - 22) {
        this.y = Game.levelH - 22;
        this.vy = -Math.abs(this.vy);
      }

      if (d < 250 && this.cooldown <= 0) {
        this.state = "ALERT";
        this.alertTimer = 80;
        audio.sfx("charge");
        this.vx = 0;
        this.vy = 0;
      }
    } else if (this.state === "ALERT") {
      this.vx = 0;
      this.vy = 0;
      this.alertTimer--;
      if (this.alertTimer <= 0) {
        const accuracy = Math.max(0, 0.5 - Game.level * 0.05);
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const tx = player.x + player.w / 2;
        const ty = player.y + player.h / 2;
        const angle =
          Math.atan2(ty - cy, tx - cx) + (Math.random() - 0.5) * accuracy;

        const speed = 3 + Game.level * 0.1;
        const spawnDist = 12;
        const distToTarget = Math.hypot(tx - cx, ty - cy);
        const timeToTarget = distToTarget / speed;
        const startZ = 12;
        const vz = (70 - startZ) / timeToTarget;

        Game.projectiles.push(
          new Projectile(
            cx + Math.cos(angle) * spawnDist,
            cy + Math.sin(angle) * spawnDist,
            angle,
            speed,
            false,
            startZ,
            vz
          )
        );
        audio.sfx("shoot");
        this.cooldown = 200 - Math.min(80, Game.level * 5);
        this.state = "PATROL";
      }
    }
    if (this.cooldown > 0) this.cooldown--;
    super.update(dt);
  }
  drawSprite(ctx) {
    super.drawSprite(ctx);
    if (this.state === "ALERT" && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.fillStyle = CONFIG.PALETTE.enemyAlert;
      ctx.font = "bold 10px monospace";
      ctx.fillText("!", this.x + 6, this.y - 5);
    }
  }
}

class Tank extends Entity {
  constructor(x, y) {
    super(x, y, 48, 32, Sprites.tank);
    this.cooldown = 300;
    this.hp = 5;
    this.dir = Math.random() > 0.5 ? 1 : -1;
    this.animSpeed = 0.1;
    this.turretAngle = 0;
  }
  update(dt, player) {
    if (this.dead) return;
    this.x += this.dir * 0.2;
    if (this.x < 50) {
      this.x = 50;
      this.dir = 1;
    } else if (this.x > Game.levelW - 50) {
      this.x = Game.levelW - 50;
      this.dir = -1;
    }

    const centerX = this.x + this.w / 2;
    const centerY = this.y + 14;
    const targetX = player.x + player.w / 2;
    const targetY = player.y + player.h / 2;
    this.turretAngle = Math.atan2(targetY - centerY, targetX - centerX);

    const distToPlayer = Math.hypot(targetX - centerX, targetY - centerY);
    if (distToPlayer < 400 && this.cooldown <= 0) {
      const barrelLen = 30;
      const px = centerX + Math.cos(this.turretAngle) * barrelLen;
      const py = centerY + Math.sin(this.turretAngle) * barrelLen;

      const speed = 5;
      const t = distToPlayer / speed;
      const startZ = 20;
      const vz = (70 - startZ) / t;

      Game.projectiles.push(
        new Projectile(px, py, this.turretAngle, speed, true, startZ, vz)
      );
      audio.sfx("shoot");
      this.cooldown = 300;
    }
    if (this.cooldown > 0) this.cooldown--;
    super.update(dt);
  }
  drawSprite(ctx) {
    super.drawSprite(ctx);
    ctx.save();
    const pivotX = Math.floor(this.x + this.w / 2);
    const pivotY = Math.floor(this.y + 14 - this.z);
    ctx.translate(pivotX, pivotY);
    ctx.rotate(this.turretAngle);
    ctx.drawImage(Sprites.tankTurret, -7, -6);
    ctx.restore();
  }
}

class Helicopter extends Entity {
  constructor(x, y) {
    super(x, y, 48, 32, Sprites.helicopter);
    this.z = 40;
    this.timer = Math.random() * 10;
    this.cooldown = 250;
    this.hp = 3;
    this.flying = true;
    this.alwaysAnimate = true;
    this.animSpeed = 0.3;
  }
  update(dt, player) {
    if (this.dead) return;
    this.timer += dt * 0.05;
    const dx = player.x - this.x;
    this.vx = (dx > 0 ? 1 : -1) * 1.0;
    this.vy = Math.sin(this.timer) * 1.5;
    if (dx < 0 && this.vx > 0) this.vx *= -1;
    if (Math.abs(dx) > 10) this.x += this.vx;
    this.y += this.vy;
    this.cooldown--;
    if (Math.abs(dx) < 150 && this.cooldown <= 0) {
      const speed = 5;
      const t = 40;
      const startZ = 40;
      const vz = (70 - startZ) / t;
      Game.projectiles.push(
        new Projectile(
          this.x + 24,
          this.y + 10,
          Math.PI / 2,
          speed,
          false,
          startZ,
          vz
        )
      );
      audio.sfx("shoot");
      this.cooldown = 250;
    }
    super.update(dt);
  }
}

class Projectile extends Entity {
  constructor(x, y, angle, speed, isShell, startZ, vz) {
    super(x, y, isShell ? 6 : 4, isShell ? 6 : 4, null);
    this.speed = speed || 3 + Game.level * 0.1;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.life = 120;
    this.shadow = false;
    this.flying = true;
    this.z = startZ;
    this.vz = vz || 0;
    this.isShell = isShell;
  }
  update() {
    super.update();
    this.life--;
    if (this.life <= 0) this.dead = true;
    this.z += this.vz;
  }
  drawSprite(ctx) {
    ctx.save();
    ctx.translate(
      Math.floor(this.x + this.w / 2),
      Math.floor(this.y + this.h / 2 - this.z)
    );
    ctx.fillStyle = this.isShell
      ? CONFIG.PALETTE.shell
      : CONFIG.PALETTE.projectile;
    ctx.beginPath();
    ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class PowerUp extends Entity {
  constructor(x, y, type) {
    const sprite =
      type === "hp"
        ? Sprites.powerHp
        : type === "energy"
        ? Sprites.powerEnergy
        : Sprites.powerShield;
    super(x, y, 16, 16, sprite);
    this.type = type;
    this.bobble = Math.random() * 10;
    this.flying = false;
    this.z = 10;
  }
  update(dt) {
    this.bobble += 0.1;
    this.z = Math.sin(this.bobble) * 3 + 10;
  }
}

class Particle {
  constructor(x, y, color, speed = 1, type = "pixel") {
    this.init(x, y, color, speed, type);
  }
  init(x, y, color, speed, type) {
    this.x = x;
    this.y = y;
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 2 * speed;
    this.vx = Math.cos(a) * s;
    this.vy = Math.sin(a) * s;
    this.life = rand(20, 40);
    this.maxLife = this.life;
    this.color = color;
    this.type = type || "pixel";
    this.size = rand(2, 4);
    this.flying = true;
    return this;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  draw(ctx) {
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    if (this.type === "pixel") ctx.fillRect(this.x, this.y, 2, 2);
    else if (this.type === "circle") {
      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y,
        this.size * (this.life / this.maxLife),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
const ParticlePool = {
  pool: [],
  get(x, y, color, speed, type) {
    return this.pool.length > 0
      ? this.pool.pop().init(x, y, color, speed, type)
      : new Particle(x, y, color, speed, type);
  },
  release(p) {
    this.pool.push(p);
  }
};

class Star {
  constructor() {
    this.reset(true);
  }
  reset(randomY = false) {
    this.x = rand(0, CONFIG.WIDTH);
    this.y = randomY ? rand(0, CONFIG.HEIGHT) : 0;
    this.z = rand(0.5, 2);
    this.size = Math.random() > 0.9 ? 2 : 1;
    this.alpha = rand(0.3, 0.8);
  }
  update(camX, camY) {
    this.y += this.z * 0.2;
    if (this.y > CONFIG.HEIGHT) this.y = 0;
    this.drawX = (this.x - camX * (this.z * 0.1)) % CONFIG.WIDTH;
    if (this.drawX < 0) this.drawX += CONFIG.WIDTH;
    this.drawY = (this.y - camY * (this.z * 0.1)) % CONFIG.HEIGHT;
    if (this.drawY < 0) this.drawY += CONFIG.HEIGHT;
  }
  draw(ctx) {
    ctx.fillStyle = CONFIG.PALETTE.star;
    ctx.globalAlpha = this.alpha;
    ctx.fillRect(this.drawX, this.drawY, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

const audio = new AudioEngine();
const input = new InputManager();

const Game = {
  canvas: $("gameCanvas"),
  ctx: $("gameCanvas").getContext("2d"),
  state: "MENU",
  levelW: 1000,
  levelH: 800,
  camera: { x: 0, y: 0 },
  shake: 0,
  player: null,
  entities: [],
  stars: [],
  score: 0,
  level: 1,
  highScoreData: { score: 0, name: "AAA" },
  levelTransitioning: false,
  projectiles: [],
  particles: [],
  floatingTexts: [],
  biome: CONFIG.BIOMES[0],
  combo: 0,
  comboTimer: 0,
  deathTimer: 0,
  menuNav: {
    "screen-start": ["btn-start", "btn-help", "btn-settings"],
    "screen-help": ["btn-back-help"],
    "screen-settings": [
      "btn-toggle-audio",
      "btn-reset-save",
      "btn-back-settings"
    ],
    "screen-gameover": ["btn-retry", "btn-menu"],
    "screen-pause": ["btn-resume", "btn-quit"],
    "screen-hiscore": ["btn-submit-score"]
  },
  menuIdx: 0,
  currentScreenId: "screen-start",

  init() {
    generateSprites();
    const rawScore = Storage.get("hiscore", 0);
    this.highScoreData =
      typeof rawScore === "number"
        ? { score: rawScore, name: "AAA" }
        : rawScore;
    this.updateHighScoreDisplay();
    for (let i = 0; i < 80; i++) this.stars.push(new Star());
    const _0x1a2b = [
      169,
      32,
      50,
      48,
      50,
      54,
      32,
      45,
      32,
      72,
      76,
      32,
      82,
      69,
      84,
      82,
      79,
      32,
      71,
      65,
      77,
      69,
      83
    ];
    $("secure-title-msg").innerText = String.fromCharCode(..._0x1a2b);
    $("secure-title-msg").style.cssText =
      "font-size: 1.5vmin; color: #666; margin-bottom: 2vmin;";

    const setupBtn = (id, fn) => {
      const el = $(id);
      if (el) {
        el.onclick = () => {
          audio.sfx("confirm");
          fn(el);
          el.blur();
        };
        el.onmouseenter = () => {
          const screenBtns = this.menuNav[this.currentScreenId];
          if (screenBtns) {
            const idx = screenBtns.indexOf(id);
            if (idx !== -1 && idx !== this.menuIdx) {
              this.menuIdx = idx;
              audio.sfx("select");
              this.updateMenuVisuals();
            }
          }
        };
      }
    };
    setupBtn("btn-start", () => this.transition(() => this.start()));
    setupBtn("btn-help", () => this.setScreen("screen-help"));
    setupBtn("btn-back-help", () => this.setScreen("screen-start"));
    setupBtn("btn-settings", () => this.setScreen("screen-settings"));
    setupBtn("btn-back-settings", () => this.setScreen("screen-start"));
    setupBtn("btn-toggle-audio", (el) => {
      const s = audio.toggle();
      el.innerText = `AUDIO: ${s ? "ON" : "OFF"}`;
    });
    setupBtn("btn-reset-save", () => {
      localStorage.clear();
      location.reload();
    });
    setupBtn("btn-resume", () => this.togglePause());
    setupBtn("btn-quit", () => this.transition(() => this.gameOver(true)));
    setupBtn("btn-retry", () => this.transition(() => this.start()));
    setupBtn("btn-menu", () =>
      this.transition(() => this.setScreen("screen-start"))
    );
    setupBtn("btn-submit-score", () => this.submitHighScore());

    if ("ontouchstart" in window || navigator.maxTouchPoints > 0)
      $("mobile-controls").style.display = "flex";
    this.updateMenuVisuals();

    let lastTime = 0;
    const loop = (timestamp) => {
      let dt = (timestamp - lastTime) / 16.66;
      lastTime = timestamp;
      if (dt > 5) dt = 5;
      input.update();
      if (this.state === "PLAY") this.update(dt);
      else {
        this.handleMenuInput();
        this.stars.forEach((s) => {
          s.update(0, 5);
          s.draw(this.ctx);
        });
      }
      if (this.state === "PLAY") this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  updateHighScoreDisplay() {
    $(
      "high-score-val"
    ).innerText = this.highScoreData.score.toString().padStart(5, "0");
    $("high-score-name").innerText = this.highScoreData.name;
  },
  transition(callback) {
    const layer = $("transition-layer");
    layer.classList.add("active");
    setTimeout(() => {
      callback();
      setTimeout(() => {
        layer.classList.remove("active");
      }, 300);
    }, 400);
  },
  setScreen(id) {
    document
      .querySelectorAll(".overlay")
      .forEach((el) => el.classList.add("hidden"));
    const el = $(id);
    if (el) {
      el.classList.remove("hidden");
      this.currentScreenId = id;
      this.menuIdx = 0;
      this.updateMenuVisuals();
      if (id === "screen-gameover") {
        audio.sfx("die");
        audio.stopMusic();
        document.body.style.cursor = "default";
      }
      if (id === "screen-hiscore") {
        setTimeout(() => $("hiscore-input").focus(), 100);
        document.body.style.cursor = "default";
      }
    }
  },
  handleMenuInput() {
    const btns = this.menuNav[this.currentScreenId];
    if (!btns) return;
    if (
      this.currentScreenId === "screen-hiscore" &&
      document.activeElement === $("hiscore-input")
    ) {
      if (input.justPressed("action")) {
        $("btn-submit-score").click();
        return;
      }
      return;
    }
    if (input.justPressed("up")) {
      this.menuIdx--;
      if (this.menuIdx < 0) this.menuIdx = btns.length - 1;
      audio.sfx("select");
      this.updateMenuVisuals();
    }
    if (input.justPressed("down")) {
      this.menuIdx++;
      if (this.menuIdx >= btns.length) this.menuIdx = 0;
      audio.sfx("select");
      this.updateMenuVisuals();
    }
    if (input.justPressed("action")) {
      const btnId = btns[this.menuIdx];
      if (btnId) $(btnId).click();
    }
  },
  updateMenuVisuals() {
    document
      .querySelectorAll(".btn")
      .forEach((b) => b.classList.remove("selected"));
    const btns = this.menuNav[this.currentScreenId];
    if (btns && btns[this.menuIdx])
      $(btns[this.menuIdx]).classList.add("selected");
  },

  start() {
    audio.init();
    audio.startMusic();
    this.score = 0;
    this.level = 1;
    this.player = new Player();
    this.levelTransitioning = false;
    this.combo = 0;
    this.comboTimer = 0;
    this.deathTimer = 0;
    this.loadLevel();
    this.state = "PLAY";
    $("hud").classList.remove("hidden");
    $("combo-meter").style.display = "block";
    document
      .querySelectorAll(".overlay")
      .forEach((el) => el.classList.add("hidden"));
    document.body.style.cursor = "none";
  },

  findSafePos(w, h) {
    for (let k = 0; k < 50; k++) {
      const x = rand(20, this.levelW - 20 - w);
      const y = rand(20, this.levelH - 20 - h);
      let safe = true;
      if (dist(x, y, this.player.x, this.player.y) < 200) safe = false;

      if (safe) {
        for (let e of this.entities) {
          const cx1 = x + w / 2;
          const cy1 = y + h / 2;
          const cx2 = e.x + e.w / 2;
          const cy2 = e.y + e.h / 2;
          if (
            dist(cx1, cy1, cx2, cy2) <
            (Math.max(w, h) + Math.max(e.w, e.h)) / 1.5
          ) {
            safe = false;
            break;
          }
        }
      }
      if (safe) return { x, y };
    }
    return { x: rand(0, this.levelW - w), y: rand(0, this.levelH - h) };
  },

  loadLevel() {
    this.entities = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.levelW = 800 + this.level * 100;
    this.levelH = 600 + this.level * 50;

    const biomeIndex = Math.floor((this.level - 1) / 2) % CONFIG.BIOMES.length;
    this.biome = CONFIG.BIOMES[biomeIndex];

    for (let i = 0; i < 30; i++) {
      const r = Math.random();
      let sprite,
        w,
        h = 64;
      if (this.biome.type === "DESERT") {
        sprite = Sprites.treePalm;
        w = 48;
      } else if (this.biome.type === "WASTELAND") {
        sprite = Sprites.treeDead;
        w = 32;
        h = 48;
      } else if (this.biome.type === "SNOW") {
        sprite = Sprites.treePine;
        w = 32;
      } else {
        sprite = r > 0.5 ? Sprites.treeOak : Sprites.treePine;
        w = sprite === Sprites.treeOak ? 48 : 32;
      }

      if (r > 0.8) {
        sprite = r > 0.9 ? Sprites.rock : Sprites.bush;
        w = 26;
        h = sprite === Sprites.rock ? 20 : 20;
        if (this.biome.type === "WASTELAND" && sprite === Sprites.bush)
          sprite = Sprites.rock;
        if (this.biome.type === "DESERT" && sprite === Sprites.bush) {
          sprite = Sprites.cactus;
          w = 24;
          h = 32;
        }
      }

      const pos = this.findSafePos(w, h);
      const ent = {
        x: pos.x,
        y: pos.y,
        w: w,
        h: h,
        frames: sprite,
        frameIndex: 0,
        z: 0,
        shadow: true,
        flying: false,
        isObstacle: true,
        update: function () {},
        drawShadow: Entity.prototype.drawShadow,
        drawSprite: Entity.prototype.drawSprite
      };
      this.entities.push(ent);
    }

    const animalCount = 5 + Math.ceil(this.level * 0.8);
    for (let i = 0; i < animalCount; i++) {
      const r = Math.random();
      const type = r > 0.6 ? (r > 0.9 ? "chicken" : "pig") : "cow";
      let w = 26,
        h = 20;
      if (type === "pig") {
        w = 22;
        h = 16;
      } else if (type === "chicken") {
        w = 18;
        h = 18;
      }

      const pos = this.findSafePos(w, h);
      this.entities.push(new Animal(pos.x, pos.y, type));
    }

    const enemyCount = 1 + Math.floor((this.level - 1) / 2);
    for (let i = 0; i < enemyCount; i++) {
      const pos = this.findSafePos(18, 22);
      this.entities.push(new Enemy(pos.x, pos.y));
    }

    if (this.level >= 4) {
      const tankCount = Math.floor((this.level - 2) / 3);
      for (let i = 0; i < tankCount; i++) {
        const pos = this.findSafePos(48, 32);
        this.entities.push(new Tank(pos.x, pos.y));
      }
    }

    if (this.level >= 5) {
      const heliCount = Math.floor((this.level - 3) / 3);
      for (let i = 0; i < heliCount; i++)
        this.entities.push(
          new Helicopter(rand(0, this.levelW), rand(0, this.levelH / 2))
        );
    }

    if (Math.random() > 0.5)
      this.spawnPowerUp(rand(50, this.levelW - 50), rand(50, this.levelH - 50));

    this.showSubtitle(`${this.biome.type} ZONE - LEVEL ${this.level}`);
  },

  spawnPowerUp(x, y) {
    const types = ["hp", "energy", "shield"];
    const t = types[Math.floor(Math.random() * types.length)];
    this.entities.push(new PowerUp(x, y, t));
  },
  togglePause() {
    if (this.state === "PLAY") {
      this.state = "PAUSE";
      audio.ctx.suspend();
      this.setScreen("screen-pause");
      document.body.style.cursor = "default";
    } else if (this.state === "PAUSE") {
      this.state = "PLAY";
      audio.ctx.resume();
      $("screen-pause").classList.add("hidden");
      this.currentScreenId = null;
      document.body.style.cursor = "none";
    }
  },
  explodePlayer() {
    this.player.dead = true;
    this.deathTimer = 120;
    this.shake = 20;
    audio.sfx("die");
    const colors = ["#f00", "#ff0", "#0f0", "#0ff", "#f0f", "#fff", "#ffa"];
    for (let i = 0; i < 100; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      Game.particles.push(
        ParticlePool.get(this.player.x + 16, this.player.y + 16, c, 3, "pixel")
      );
      Game.particles.push(
        ParticlePool.get(this.player.x + 16, this.player.y + 16, c, 2, "circle")
      );
    }
  },
  gameOver(forceQuit = false) {
    this.state = "GAMEOVER";
    $("hud").classList.add("hidden");
    $("combo-meter").style.display = "none";
    $("final-score").innerText = this.score;
    if (forceQuit) {
      this.setScreen("screen-start");
      audio.stopMusic();
      document.body.style.cursor = "default";
      return;
    }
    if (this.score > this.highScoreData.score) {
      this.setScreen("screen-hiscore");
      audio.sfx("powerup");
    } else {
      this.setScreen("screen-gameover");
    }
  },
  submitHighScore() {
    const inp = $("hiscore-input");
    let name = inp.value.toUpperCase().trim();
    if (!name) name = "AAA";
    this.highScoreData = { score: this.score, name: name.substring(0, 3) };
    Storage.set("hiscore", this.highScoreData);
    this.updateHighScoreDisplay();
    inp.value = "";
    this.setScreen("screen-gameover");
  },
  addScore(val, x, y) {
    this.combo++;
    this.comboTimer = 180;
    const multiplier = Math.min(this.combo, 5);
    const finalVal = val * multiplier;
    this.score += finalVal;
    $("comboVal").innerText = this.combo;
    $("combo-meter").style.transform = "scale(1.5)";
    setTimeout(() => ($("combo-meter").style.transform = "scale(1)"), 100);
    if (x !== undefined && y !== undefined) {
      this.floatingTexts.push(
        new FloatingText(x, y - 20, `+${finalVal}`, "#ff0")
      );
      if (multiplier > 1)
        this.floatingTexts.push(
          new FloatingText(x, y - 40, `${multiplier}x COMBO!`, "#0ff")
        );
    }
    const animalsLeft = this.entities.filter(
      (e) => e instanceof Animal && !e.dead
    ).length;
    if (animalsLeft === 0 && !this.levelTransitioning) {
      this.levelTransitioning = true;
      this.showSubtitle("ZONE CLEARED!");
      audio.sfx("start");
      setTimeout(() => this.transition(() => this.nextLevel()), 2000);
    }
  },
  nextLevel() {
    this.level++;
    this.player.hp = Math.min(this.player.hp + 30, CONFIG.PLAYER.maxHp);
    this.loadLevel();
    this.levelTransitioning = false;
  },
  showSubtitle(text) {
    const el = $("subtitle");
    el.innerText = text;
    el.style.opacity = 1;
    setTimeout(() => (el.style.opacity = 0), 2500);
  },

  update(dt) {
    if (this.shake > 0) this.shake *= 0.9;
    if (this.shake < 0.5) this.shake = 0;

    if (this.player.dead) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) this.gameOver();
    }

    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        $("comboVal").innerText = 0;
      }
    }
    const targetCamX = clamp(
      this.player.x - CONFIG.WIDTH / 2,
      0,
      this.levelW - CONFIG.WIDTH
    );
    const targetCamY = clamp(
      this.player.y - CONFIG.HEIGHT / 2,
      0,
      this.levelH - CONFIG.HEIGHT
    );
    this.camera.x = lerp(this.camera.x, targetCamX, 0.1);
    this.camera.y = lerp(this.camera.y, targetCamY, 0.1);

    if (!this.player.dead) {
      this.player.update(dt, input);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update();
      if (!p.dead && !this.player.dead && checkCircleCollide(p, this.player)) {
        if (this.player.shieldActive > 0) {
          p.dead = true;
          audio.sfx("hit");
          Game.particles.push(ParticlePool.get(p.x, p.y, "#0ff", 2, "circle"));
        } else if (this.player.invuln <= 0) {
          const dmg = p.isShell ? 20 : 5 + Math.floor(Game.level * 0.5);
          this.player.hp -= dmg;
          this.player.invuln = 60;
          this.shake = 10;
          audio.sfx("hit");
          this.floatingTexts.push(
            new FloatingText(this.player.x, this.player.y, `-${dmg}`, "#f00")
          );
          if (this.player.hp <= 0) {
            this.explodePlayer();
          }
        }
        p.dead = true;
        Game.particles.push(ParticlePool.get(p.x, p.y, "#ff0"));
      }
      if (p.dead) {
        this.projectiles[i] = this.projectiles[this.projectiles.length - 1];
        this.projectiles.pop();
      }
    }

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      if (e.update) e.update(dt, this.player);
      if (
        !this.player.dead &&
        e instanceof PowerUp &&
        !e.dead &&
        checkRectCollide(this.player, e)
      ) {
        e.dead = true;
        audio.sfx("powerup");
        if (e.type === "hp") {
          this.player.hp = Math.min(this.player.hp + 25, CONFIG.PLAYER.maxHp);
          this.showSubtitle("HP +25");
        } else if (e.type === "energy") {
          this.player.energy = CONFIG.PLAYER.maxEnergy;
          this.player.infiniteEnergy = 300;
          this.showSubtitle("MAX ENERGY + BOOST");
        } else if (e.type === "shield") {
          this.player.shieldActive = 480;
          this.showSubtitle("SHIELD ACTIVE");
        }
      }
      if (e.dead) {
        this.entities[i] = this.entities[this.entities.length - 1];
        this.entities.pop();
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.update();
      if (ft.life <= 0) {
        this.floatingTexts[i] = this.floatingTexts[
          this.floatingTexts.length - 1
        ];
        this.floatingTexts.pop();
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (p.life <= 0) {
        ParticlePool.release(p);
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
      }
    }

    $("scoreVal").innerText = this.score.toString().padStart(5, "0");
    $("levelVal").innerText = this.level.toString().padStart(2, "0");
    $("hpBar").style.width =
      Math.max(0, (this.player.hp / CONFIG.PLAYER.maxHp) * 100) + "%";
    $("energyBar").style.background =
      this.player.infiniteEnergy > 0 ? "#ff0" : "#30f";
    $("energyBar").style.width =
      Math.max(0, (this.player.energy / CONFIG.PLAYER.maxEnergy) * 100) + "%";
  },

  drawVignette(ctx) {
    if (!this.player) return;
    const px = this.player.x - this.camera.x + 16;
    const py = this.player.y - this.camera.y + 16;
    const grad = ctx.createRadialGradient(
      px,
      py,
      150,
      px,
      py,
      CONFIG.WIDTH * 0.8
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  },
  drawWeather(ctx) {
    if (this.biome.weather === "clear") return;
    ctx.fillStyle =
      this.biome.weather === "rain"
        ? "rgba(99, 155, 255, 0.3)"
        : "rgba(255, 255, 255, 0.4)";
    const time = Date.now();
    for (let i = 0; i < 50; i++) {
      const x =
        (i * 30 + time * (this.biome.weather === "rain" ? 0.5 : 0.1)) %
        CONFIG.WIDTH;
      const y =
        (i * 20 + time * (this.biome.weather === "rain" ? 0.8 : 0.2)) %
        CONFIG.HEIGHT;
      if (this.biome.weather === "rain") ctx.fillRect(x, y, 1, 6);
      else ctx.fillRect(x, y, 2, 2);
    }
    ctx.fillStyle =
      this.biome.weather === "rain"
        ? "rgba(0,0,20,0.1)"
        : "rgba(200,200,255,0.05)";
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  },

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = CONFIG.PALETTE.bg;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    this.stars.forEach((s) => {
      if (this.state === "PLAY") s.update(this.camera.x, this.camera.y);
      else s.update(0, 5);
      s.draw(ctx);
    });
    if (this.state === "MENU") return;
    ctx.save();
    const shakeX = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    const shakeY = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    ctx.translate(
      Math.floor(-this.camera.x + shakeX),
      Math.floor(-this.camera.y + shakeY)
    );

    ctx.fillStyle = this.biome.grass;
    ctx.fillRect(0, 0, this.levelW, this.levelH);

    const pad = 64;
    const camL = this.camera.x - pad;
    const camR = this.camera.x + CONFIG.WIDTH + pad;
    const camT = this.camera.y - pad;
    const camB = this.camera.y + CONFIG.HEIGHT + pad;
    const renderList = [];
    if (!this.player.dead) renderList.push(this.player);
    for (let i = 0; i < this.entities.length; i++) {
      const e = this.entities[i];
      if (e.x + e.w > camL && e.x < camR && e.y + e.h > camT && e.y < camB)
        renderList.push(e);
    }
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (p.x + p.w > camL && p.x < camR && p.y + p.h > camT && p.y < camB)
        renderList.push(p);
    }
    renderList.sort((a, b) => a.y + a.h - (b.y + b.h));

    for (let i = 0; i < renderList.length; i++)
      if (renderList[i].drawShadow) renderList[i].drawShadow(ctx);
    for (let i = 0; i < renderList.length; i++)
      if (!renderList[i].flying && renderList[i].drawSprite)
        renderList[i].drawSprite(ctx);
    for (let i = 0; i < renderList.length; i++)
      if (renderList[i].flying && renderList[i].drawSprite)
        renderList[i].drawSprite(ctx);
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.x > camL && p.x < camR && p.y > camT && p.y < camB) p.draw(ctx);
    }
    for (let i = 0; i < this.floatingTexts.length; i++)
      this.floatingTexts[i].draw(ctx);

    ctx.restore();
    this.drawWeather(ctx);
    this.drawVignette(ctx);
  }
};

window.onload = () => Game.init();
