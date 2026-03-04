

const canvas  = document.getElementById('sim-canvas');
const ctx     = canvas.getContext('2d');
const ctrlBox = document.getElementById('controls-wrap');

let animId = null;
let currentSim = null;
let frameCount = 0, lastFPSTime = performance.now();

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width  = rect.width  - 8;
  canvas.height = Math.max(440, rect.height - 8);
  if (currentSim && currentSim.onResize) currentSim.onResize();
}
window.addEventListener('resize', resizeCanvas);


function updateFPS() {
  frameCount++;
  const now = performance.now();
  if (now - lastFPSTime >= 600) {
    const fps = Math.round(frameCount * 1000 / (now - lastFPSTime));
    document.getElementById('fps-pill').textContent = fps + ' FPS';
    frameCount = 0; lastFPSTime = now;
  }
}

// ── Live stats helper ──
function setStats(data) {
  const el = document.getElementById('live-stats');
  if (!data || !data.length) { el.innerHTML = '<p class="stat-empty">—</p>'; return; }
  el.innerHTML = data.map(([k,v]) =>
    `<div class="stat-row"><span class="stat-key">${k}</span><span class="stat-val">${v}</span></div>`
  ).join('');
}

// ── Simulation selector ──
function selectSim(name, btn) {
  document.querySelectorAll('.sim-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('sim-name-pill').textContent = btn.querySelector('strong').textContent;

  if (animId) { cancelAnimationFrame(animId); animId = null; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  resizeCanvas();

  const sims = { projectile: simProjectile, wave: simWave, gravity: simGravity,
                 pendulum: simPendulum, gas: simGas, spring: simSpring };
  currentSim = sims[name]();
  currentSim.start();
}

// ── Draw util: round rect ──
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
}

// ══════════════════════════════════════════════════════
//  1. PROJECTILE MOTION SIMULATOR
// ══════════════════════════════════════════════════════
function simProjectile() {
  let angle = 45, speed = 60, gravity = 9.8, wind = 0;
  let trails = [], running = false, t = 0, dt = 0.04;
  let maxH = 0, range = 0, flightTime = 0;
  let colors = ['#7b6ff0','#38d9f5','#f06292','#66ffa6','#ffb347'];
  let colorIdx = 0;

  function getControls() {
    ctrlBox.innerHTML = `
      <div class="ctrl-group">
        <label>Launch Angle</label>
        <div class="ctrl-row">
          <input type="range" id="p-angle" min="5" max="85" value="${angle}" oninput="pAngle(this.value)"/>
          <span class="ctrl-value" id="p-angle-val">${angle}°</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Initial Speed (m/s)</label>
        <div class="ctrl-row">
          <input type="range" id="p-speed" min="10" max="120" value="${speed}" oninput="pSpeed(this.value)"/>
          <span class="ctrl-value" id="p-speed-val">${speed}</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Gravity (m/s²)</label>
        <div class="ctrl-row">
          <input type="range" id="p-grav" min="1" max="25" step="0.1" value="${gravity}" oninput="pGrav(this.value)"/>
          <span class="ctrl-value" id="p-grav-val">${gravity}</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Wind (m/s)</label>
        <div class="ctrl-row">
          <input type="range" id="p-wind" min="-20" max="20" value="${wind}" oninput="pWind(this.value)"/>
          <span class="ctrl-value" id="p-wind-val">${wind}</span>
        </div>
      </div>
      <button class="ctrl-btn" onclick="pLaunch()">🚀 Launch</button>
      <button class="ctrl-btn danger" onclick="pClear()">✕ Clear</button>
    `;
  }

  window.pAngle = v => { angle = +v; document.getElementById('p-angle-val').textContent = v+'°'; };
  window.pSpeed = v => { speed = +v; document.getElementById('p-speed-val').textContent = v; };
  window.pGrav  = v => { gravity = +v; document.getElementById('p-grav-val').textContent = v; };
  window.pWind  = v => { wind = +v; document.getElementById('p-wind-val').textContent = v; };

  window.pLaunch = () => {
    const rad = angle * Math.PI / 180;
    const vx0 = speed * Math.cos(rad), vy0 = speed * Math.sin(rad);
    flightTime = (vy0 + Math.sqrt(vy0*vy0)) / gravity * 2;
    maxH = vy0*vy0 / (2*gravity);
    range = vx0 * flightTime;

    const col = colors[colorIdx++ % colors.length];
    const pts = [];
    for (let tt = 0; tt <= flightTime; tt += dt) {
      const x = vx0*tt + 0.5*wind*tt*tt;
      const y = vy0*tt - 0.5*gravity*tt*tt;
      if (y < 0) break;
      pts.push({x, y});
    }
    trails.push({ pts, col, angle, speed, vx0, vy0, maxH, range });
    running = true;
    setStats([
      ['Angle', angle+'°'], ['Speed', speed+' m/s'],
      ['Max Height', maxH.toFixed(1)+' m'], ['Range', range.toFixed(1)+' m'],
      ['Gravity', gravity+' m/s²'], ['Wind', wind+' m/s'],
    ]);
  };

  window.pClear = () => { trails = []; running = false; setStats(null); };

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;
    const pad = 50, usW = W - pad*2, usH = H - pad*2;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(pad + i*usW/10, pad); ctx.lineTo(pad + i*usW/10, pad+usH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, pad + i*usH/10); ctx.lineTo(pad+usW, pad + i*usH/10); ctx.stroke();
    }

    // Ground line
    ctx.strokeStyle = 'rgba(102,255,166,0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad, pad+usH); ctx.lineTo(pad+usW, pad+usH); ctx.stroke();

    // Launcher
    const lx = pad, ly = pad + usH;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(-angle * Math.PI / 180);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(30, 0); ctx.stroke();
    ctx.restore();

    // Draw trails
    if (!trails.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.font = '14px DM Mono';
      ctx.textAlign = 'center';
      ctx.fillText('Press 🚀 Launch to fire a projectile', W/2, H/2);
    }

    const maxR = trails.reduce((m,t) => Math.max(m, t.range), 1);
    const maxHh = trails.reduce((m,t) => Math.max(m, t.maxH), 1);
    const scaleX = usW / (maxR * 1.05);
    const scaleY = usH / (maxHh * 1.15);

    trails.forEach(tr => {
      // Trajectory line
      ctx.beginPath();
      tr.pts.forEach((p, i) => {
        const sx = pad + p.x * scaleX;
        const sy = pad + usH - p.y * scaleY;
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      });
      ctx.strokeStyle = tr.col + 'cc';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = tr.col; ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Landing dot
      const last = tr.pts[tr.pts.length-1];
      const lsx = pad + last.x * scaleX;
      ctx.beginPath(); ctx.arc(lsx, pad+usH, 5, 0, Math.PI*2);
      ctx.fillStyle = tr.col; ctx.fill();

      // Label
      ctx.fillStyle = tr.col;
      ctx.font = '11px DM Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${tr.angle}° / ${tr.speed}m/s`, lsx, pad+usH+16);
    });

    updateFPS();
    animId = requestAnimationFrame(draw);
  }

  document.getElementById('formula-text').textContent =
    'x = v₀·cos(θ)·t + ½·w·t²   |   y = v₀·sin(θ)·t − ½·g·t²   |   Range = v₀²·sin(2θ)/g';

  return {
    start() { getControls(); pLaunch(); draw(); },
    onResize() {}
  };
}

// ══════════════════════════════════════════════════════
//  2. WAVE INTERFERENCE SIMULATOR
// ══════════════════════════════════════════════════════
function simWave() {
  let freq1=2, freq2=2, amp1=50, amp2=50, phase=0, speed=1;
  let showComponents = true, t = 0;

  function getControls() {
    ctrlBox.innerHTML = `
      <div class="ctrl-group">
        <label>Wave 1 Frequency</label>
        <div class="ctrl-row">
          <input type="range" id="w-f1" min="0.5" max="6" step="0.1" value="${freq1}" oninput="wF1(this.value)"/>
          <span class="ctrl-value" id="w-f1-val">${freq1} Hz</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Wave 2 Frequency</label>
        <div class="ctrl-row">
          <input type="range" id="w-f2" min="0.5" max="6" step="0.1" value="${freq2}" oninput="wF2(this.value)"/>
          <span class="ctrl-value" id="w-f2-val">${freq2} Hz</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Amplitude 1</label>
        <div class="ctrl-row">
          <input type="range" id="w-a1" min="5" max="90" value="${amp1}" oninput="wA1(this.value)"/>
          <span class="ctrl-value" id="w-a1-val">${amp1}</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Phase Shift (°)</label>
        <div class="ctrl-row">
          <input type="range" id="w-ph" min="0" max="360" value="${phase}" oninput="wPh(this.value)"/>
          <span class="ctrl-value" id="w-ph-val">${phase}°</span>
        </div>
      </div>
      <label class="toggle-row">
        <input type="checkbox" id="w-show" ${showComponents?'checked':''} onchange="wShow(this.checked)"/>
        <span>Show Components</span>
      </label>
    `;
  }

  window.wF1   = v => { freq1 = +v; document.getElementById('w-f1-val').textContent = v+' Hz'; };
  window.wF2   = v => { freq2 = +v; document.getElementById('w-f2-val').textContent = v+' Hz'; };
  window.wA1   = v => { amp1  = +v; document.getElementById('w-a1-val').textContent = v; };
  window.wPh   = v => { phase = +v; document.getElementById('w-ph-val').textContent = v+'°'; };
  window.wShow = v => { showComponents = v; };

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;
    t += 0.018;

    const cy1 = H * 0.22, cy2 = H * 0.5, cy3 = H * 0.78;
    const phRad = phase * Math.PI / 180;

    function drawWave(cy, col, fq, amp, ph, label) {
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = cy + amp * Math.sin(2*Math.PI*fq*(x/W) - t*fq + ph);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = col;
      ctx.lineWidth = showComponents ? 2 : 0;
      ctx.shadowColor = col; ctx.shadowBlur = showComponents ? 10 : 0;
      ctx.stroke(); ctx.shadowBlur = 0;

      if (showComponents) {
        ctx.fillStyle = col; ctx.font = '11px DM Mono';
        ctx.textAlign = 'left';
        ctx.fillText(label, 10, cy - amp - 8);
      }
    }

    // Horizontal separator lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    [cy1, cy2, cy3].forEach(cy => {
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    });

    if (showComponents) {
      drawWave(cy1, 'rgba(123,111,240,0.7)', freq1, amp1, 0, `Wave 1: f=${freq1}Hz A=${amp1}`);
      drawWave(cy2, 'rgba(56,217,245,0.7)',  freq2, amp2, phRad, `Wave 2: f=${freq2}Hz φ=${phase}°`);
    }

    // Superposition
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const y1 = amp1 * Math.sin(2*Math.PI*freq1*(x/W) - t*freq1);
      const y2 = amp2 * Math.sin(2*Math.PI*freq2*(x/W) - t*freq2 + phRad);
      const y = (showComponents ? cy3 : H/2) + y1 + y2;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#f06292';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f06292'; ctx.shadowBlur = 14;
    ctx.stroke(); ctx.shadowBlur = 0;

    ctx.fillStyle = '#f06292'; ctx.font = 'bold 11px DM Mono'; ctx.textAlign = 'left';
    ctx.fillText('Superposition (Sum)', 10, (showComponents ? cy3 : H/2) - (amp1+amp2) - 6);

    // Beat frequency label
    const beatFreq = Math.abs(freq1 - freq2);
    setStats([
      ['Wave 1 f', freq1+' Hz'], ['Wave 2 f', freq2+' Hz'],
      ['Beat Freq', beatFreq.toFixed(1)+' Hz'], ['Phase Δ', phase+'°'],
      ['Amp 1', amp1], ['Amp 2', amp2],
    ]);

    updateFPS();
    animId = requestAnimationFrame(draw);
  }

  document.getElementById('formula-text').textContent =
    'y = A₁·sin(2πf₁t) + A₂·sin(2πf₂t + φ)   |   Beat Frequency = |f₁ − f₂|';

  return { start() { getControls(); draw(); }, onResize() {} };
}

// ══════════════════════════════════════════════════════
//  3. ORBITAL GRAVITY SIMULATOR (N-Body)
// ══════════════════════════════════════════════════════
function simGravity() {
  const G = 500;
  let bodies = [], trails = [], trailLen = 180, paused = false;
  let showTrails = true;

  function resetBodies(preset) {
    bodies = []; trails = [];
    const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;
    if (preset === 'solar') {
      bodies = [
        { x:cx,    y:cy,    vx:0,    vy:0,    m:8000, r:18, col:'#ffb347', name:'Star'    },
        { x:cx+120,y:cy,    vx:0,    vy:64,   m:20,   r:6,  col:'#38d9f5', name:'Planet A'},
        { x:cx-200,y:cy,    vx:0,    vy:-50,  m:35,   r:8,  col:'#7b6ff0', name:'Planet B'},
        { x:cx,    y:cy-160,vx:55,   vy:0,    m:10,   r:5,  col:'#66ffa6', name:'Moon'    },
        { x:cx+300,y:cy,    vx:0,    vy:40,   m:60,   r:10, col:'#f06292', name:'Giant'   },
      ];
    } else if (preset === 'binary') {
      bodies = [
        { x:cx-80, y:cy, vx:0, vy:45,  m:3000, r:14, col:'#38d9f5', name:'Star A' },
        { x:cx+80, y:cy, vx:0, vy:-45, m:3000, r:14, col:'#f06292', name:'Star B' },
        { x:cx,    y:cy-180, vx:55, vy:0, m:5, r:4, col:'#66ffa6', name:'Rogue' },
      ];
    } else {
      // Random
      for (let i = 0; i < 5; i++) {
        const angle = (i/5)*Math.PI*2;
        const r = 100 + Math.random()*80;
        bodies.push({
          x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle),
          vx: -30*Math.sin(angle) + (Math.random()-0.5)*10,
          vy:  30*Math.cos(angle) + (Math.random()-0.5)*10,
          m: 20 + Math.random()*60, r: 5 + Math.random()*6,
          col: ['#7b6ff0','#38d9f5','#f06292','#66ffa6','#ffb347'][i],
          name: 'Body '+(i+1),
        });
      }
      bodies.unshift({ x:cx, y:cy, vx:0, vy:0, m:6000, r:16, col:'#fff', name:'Center' });
    }
    bodies.forEach(() => trails.push([]));
  }

  function getControls() {
    ctrlBox.innerHTML = `
      <button class="ctrl-btn" onclick="gPreset('solar')">☀ Solar System</button>
      <button class="ctrl-btn" onclick="gPreset('binary')">⭐ Binary Stars</button>
      <button class="ctrl-btn" onclick="gPreset('random')">🎲 Random</button>
      <button class="ctrl-btn" onclick="gTogglePause()"  id="g-pause-btn">⏸ Pause</button>
      <label class="toggle-row" style="margin-left:8px">
        <input type="checkbox" id="g-trails" checked onchange="gTrails(this.checked)"/>
        <span>Show Trails</span>
      </label>
    `;
  }

  window.gPreset = p => { resetBodies(p); };
  window.gTogglePause = () => {
    paused = !paused;
    document.getElementById('g-pause-btn').textContent = paused ? '▶ Resume' : '⏸ Pause';
  };
  window.gTrails = v => { showTrails = v; if (!v) trails.forEach(t => t.length=0); };

  function step() {
    const dt = 0.016;
    // Compute forces
    for (let i = 0; i < bodies.length; i++) {
      let fx = 0, fy = 0;
      for (let j = 0; j < bodies.length; j++) {
        if (i === j) continue;
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const dist = Math.sqrt(dx*dx + dy*dy) + 5;
        const force = G * bodies[i].m * bodies[j].m / (dist*dist);
        fx += force * dx / dist;
        fy += force * dy / dist;
      }
      bodies[i].ax = fx / bodies[i].m;
      bodies[i].ay = fy / bodies[i].m;
    }
    // Integrate
    bodies.forEach((b,i) => {
      b.vx += b.ax * dt;
      b.vy += b.ay * dt;
      b.x  += b.vx * dt;
      b.y  += b.vy * dt;
      if (showTrails) {
        trails[i].push({x: b.x, y: b.y});
        if (trails[i].length > trailLen) trails[i].shift();
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;

    // Starfield
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 80; i++) {
      const sx = ((i*137 + 13) % W), sy = ((i*211 + 47) % H);
      ctx.fillRect(sx, sy, 1, 1);
    }

    if (!paused) step();

    // Trails
    if (showTrails) {
      bodies.forEach((b,i) => {
        const tr = trails[i];
        if (tr.length < 2) return;
        ctx.beginPath();
        tr.forEach((p,j) => j===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
        ctx.strokeStyle = b.col + '55';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // Bodies
    bodies.forEach(b => {
      // Glow
      const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r*3);
      grd.addColorStop(0, b.col + 'cc');
      grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r*3, 0, Math.PI*2);
      ctx.fillStyle = grd; ctx.fill();
      // Body
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fillStyle = b.col; ctx.fill();
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '10px DM Mono'; ctx.textAlign = 'center';
      ctx.fillText(b.name, b.x, b.y - b.r - 5);
    });

    const ke = bodies.reduce((s,b) => s + 0.5*b.m*(b.vx*b.vx+b.vy*b.vy), 0);
    setStats([
      ['Bodies', bodies.length],
      ['KE (total)', ke.toFixed(0)+' J'],
      ['Simulation', paused ? 'PAUSED' : 'RUNNING'],
      ['Trails', showTrails ? 'ON' : 'OFF'],
    ]);

    updateFPS();
    animId = requestAnimationFrame(draw);
  }

  document.getElementById('formula-text').textContent =
    'F = G·m₁·m₂ / r²   |   Fₓ = F·Δx/r   |   a = F/m   |   v += a·dt   |   x += v·dt';

  return {
    start() { getControls(); resetBodies('solar'); draw(); },
    onResize() { resetBodies('solar'); }
  };
}

// ══════════════════════════════════════════════════════
//  4. DOUBLE PENDULUM (Chaotic)
// ══════════════════════════════════════════════════════
function simPendulum() {
  let L1=140, L2=120, m1=20, m2=15, g=9.8, damping=0.0002;
  let th1=Math.PI/2, th2=Math.PI/3, w1=0, w2=0;
  let trailPts=[], maxTrail=600, paused=false, trailOn=true;
  let trailHue=0;

  function getControls() {
    ctrlBox.innerHTML = `
      <div class="ctrl-group">
        <label>Length 1 (px)</label>
        <div class="ctrl-row">
          <input type="range" id="pd-l1" min="50" max="180" value="${L1}" oninput="pdL1(this.value)"/>
          <span class="ctrl-value" id="pd-l1-v">${L1}</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Length 2 (px)</label>
        <div class="ctrl-row">
          <input type="range" id="pd-l2" min="50" max="180" value="${L2}" oninput="pdL2(this.value)"/>
          <span class="ctrl-value" id="pd-l2-v">${L2}</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Mass 1</label>
        <div class="ctrl-row">
          <input type="range" id="pd-m1" min="5" max="50" value="${m1}" oninput="pdM1(this.value)"/>
          <span class="ctrl-value" id="pd-m1-v">${m1}</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Gravity</label>
        <div class="ctrl-row">
          <input type="range" id="pd-g" min="1" max="20" step="0.5" value="${g}" oninput="pdG(this.value)"/>
          <span class="ctrl-value" id="pd-g-v">${g}</span>
        </div>
      </div>
      <button class="ctrl-btn" onclick="pdReset()">↺ Reset</button>
      <button class="ctrl-btn" onclick="pdPause()" id="pd-pause">⏸ Pause</button>
      <label class="toggle-row">
        <input type="checkbox" checked onchange="pdTrail(this.checked)"/>
        <span>Chaos Trail</span>
      </label>
    `;
  }

  window.pdL1 = v => { L1=+v; document.getElementById('pd-l1-v').textContent=v; };
  window.pdL2 = v => { L2=+v; document.getElementById('pd-l2-v').textContent=v; };
  window.pdM1 = v => { m1=+v; document.getElementById('pd-m1-v').textContent=v; };
  window.pdG  = v => { g=+v;  document.getElementById('pd-g-v').textContent=v; };
  window.pdReset = () => {
    th1=Math.PI/2+0.1*Math.random(); th2=Math.PI/3+0.1*Math.random();
    w1=0; w2=0; trailPts=[];
  };
  window.pdPause = () => {
    paused=!paused;
    document.getElementById('pd-pause').textContent = paused ? '▶ Resume' : '⏸ Pause';
  };
  window.pdTrail = v => { trailOn=v; if(!v) trailPts=[]; };

  function step(dt) {
    // RK4-lite double pendulum equations
    const mu = 1 + m1/m2;
    const d  = th1 - th2;
    const denom1 = (mu*L1) - L1*Math.cos(d)*Math.cos(d);
    const denom2 = (L2/L1)*denom1;

    const a1 = (-g*(mu+1)*Math.sin(th1) - L2*w2*w2*Math.sin(d)
                - L1*Math.cos(d)*Math.sin(d)*w1*w1 - damping*w1) / denom1;
    const a2 = (L1*(mu+1)*(Math.cos(d)*Math.sin(th1) - Math.sin(th2))
                + L2*Math.cos(d)*w2*w2*Math.sin(d)
                + L1*(mu+1)*w1*w1*Math.sin(d) - damping*w2) / denom2;

    w1 += a1*dt; w2 += a2*dt;
    th1 += w1*dt; th2 += w2*dt;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;
    const ox = W/2, oy = H*0.25;

    if (!paused) {
      for (let s = 0; s < 5; s++) step(0.016);
    }

    const x1 = ox + L1*Math.sin(th1);
    const y1 = oy + L1*Math.cos(th1);
    const x2 = x1 + L2*Math.sin(th2);
    const y2 = y1 + L2*Math.cos(th2);

    if (trailOn) {
      trailPts.push({x:x2, y:y2, hue: trailHue});
      trailHue = (trailHue + 1.5) % 360;
      if (trailPts.length > maxTrail) trailPts.shift();

      for (let i = 1; i < trailPts.length; i++) {
        const alpha = i / trailPts.length;
        ctx.beginPath();
        ctx.moveTo(trailPts[i-1].x, trailPts[i-1].y);
        ctx.lineTo(trailPts[i].x,   trailPts[i].y);
        ctx.strokeStyle = `hsla(${trailPts[i].hue},100%,65%,${alpha*0.8})`;
        ctx.lineWidth = 1.5 * alpha;
        ctx.stroke();
      }
    }

    // Rods
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

    // Pivot
    ctx.beginPath(); ctx.arc(ox, oy, 6, 0, Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fill();

    // Bobs
    [[x1,y1,m1,'#7b6ff0'],[x2,y2,m2,'#f06292']].forEach(([x,y,m,c]) => {
      const grd = ctx.createRadialGradient(x,y,0,x,y,m/1.5+10);
      grd.addColorStop(0, c); grd.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(x,y,m/1.5+10,0,Math.PI*2);
      ctx.fillStyle=grd; ctx.fill();
      ctx.beginPath(); ctx.arc(x,y,m/1.5,0,Math.PI*2);
      ctx.fillStyle=c; ctx.fill();
    });

    // Energy
    const KE = 0.5*(m1+m2)*L1*L1*w1*w1 + 0.5*m2*L2*L2*w2*w2 + m2*L1*L2*w1*w2*Math.cos(th1-th2);
    setStats([
      ['θ₁', (th1*180/Math.PI).toFixed(1)+'°'],
      ['θ₂', (th2*180/Math.PI).toFixed(1)+'°'],
      ['ω₁', w1.toFixed(2)+' rad/s'],
      ['ω₂', w2.toFixed(2)+' rad/s'],
      ['KE', KE.toFixed(1)+' J'],
    ]);

    updateFPS();
    animId = requestAnimationFrame(draw);
  }

  document.getElementById('formula-text').textContent =
    'α₁ = [−g(μ+1)sin θ₁ − L₂ω₂²sin Δ − ...] / [(μ+1)L₁ − L₁cos²Δ]   (Lagrangian mechanics)';

  return { start() { getControls(); draw(); }, onResize() {} };
}

// ══════════════════════════════════════════════════════
//  5. IDEAL GAS SIMULATOR
// ══════════════════════════════════════════════════════
function simGas() {
  let particles=[], N=80, T=300, paused=false;
  const k=1.38e-23, baseSpeed=200;

  function maxwell(temp) {
    const sigma = Math.sqrt(k*temp/5e-26);
    const u = Math.random(), v = Math.random();
    return sigma * Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v) * 0.002;
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < N; i++) {
      const spd = baseSpeed * Math.sqrt(T/300);
      const ang = Math.random()*Math.PI*2;
      particles.push({
        x: 40 + Math.random()*(canvas.width-80),
        y: 40 + Math.random()*(canvas.height-80),
        vx: spd*Math.cos(ang),
        vy: spd*Math.sin(ang),
        r: 5, col: `hsl(${Math.random()*360},80%,65%)`,
      });
    }
  }

  function getControls() {
    ctrlBox.innerHTML = `
      <div class="ctrl-group">
        <label>Temperature (K)</label>
        <div class="ctrl-row">
          <input type="range" id="gas-T2" min="100" max="1000" value="${T}" oninput="gasT(this.value)"/>
          <span class="ctrl-value" id="gas-T2-v">${T} K</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Particles</label>
        <div class="ctrl-row">
          <input type="range" id="gas-N" min="20" max="150" value="${N}" oninput="gasN(this.value)"/>
          <span class="ctrl-value" id="gas-N-v">${N}</span>
        </div>
      </div>
      <button class="ctrl-btn" onclick="gasReset()">↺ Reset</button>
      <button class="ctrl-btn" onclick="gasPause()" id="gas-pause-btn">⏸ Pause</button>
    `;
  }

  window.gasT = v => {
    const ratio = Math.sqrt(+v/T); T=+v;
    document.getElementById('gas-T2-v').textContent=v+' K';
    particles.forEach(p => { p.vx*=ratio; p.vy*=ratio; });
  };
  window.gasN = v => {
    N=+v; document.getElementById('gas-N-v').textContent=v;
    gasReset();
  };
  window.gasReset = () => initParticles();
  window.gasPause = () => {
    paused=!paused;
    document.getElementById('gas-pause-btn').textContent = paused?'▶ Resume':'⏸ Pause';
  };

  function step() {
    const W=canvas.width, H=canvas.height, dt=0.016;
    particles.forEach(p => {
      p.x += p.vx*dt; p.y += p.vy*dt;
      if (p.x-p.r < 0)   { p.x=p.r;    p.vx=Math.abs(p.vx); }
      if (p.x+p.r > W)   { p.x=W-p.r;  p.vx=-Math.abs(p.vx); }
      if (p.y-p.r < 0)   { p.y=p.r;    p.vy=Math.abs(p.vy); }
      if (p.y+p.r > H)   { p.y=H-p.r;  p.vy=-Math.abs(p.vy); }
    });

    // Elastic collisions
    for (let i=0; i<particles.length; i++) {
      for (let j=i+1; j<particles.length; j++) {
        const a=particles[i], b=particles[j];
        const dx=b.x-a.x, dy=b.y-a.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if (dist < a.r+b.r) {
          const nx=dx/dist, ny=dy/dist;
          const dvx=a.vx-b.vx, dvy=a.vy-b.vy;
          const dot=dvx*nx+dvy*ny;
          if (dot>0) {
            a.vx-=dot*nx; a.vy-=dot*ny;
            b.vx+=dot*nx; b.vy+=dot*ny;
          }
          const overlap=(a.r+b.r-dist)/2;
          a.x-=overlap*nx; a.y-=overlap*ny;
          b.x+=overlap*nx; b.y+=overlap*ny;
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W=canvas.width, H=canvas.height;

    // Container border
    ctx.strokeStyle='rgba(123,111,240,0.4)'; ctx.lineWidth=2;
    roundRect(2,2,W-4,H-4,12); ctx.stroke();

    if (!paused) step();

    // Particles
    particles.forEach(p => {
      const spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
      const heat=Math.min(1, spd/(baseSpeed*2*Math.sqrt(T/300)));
      const col=`hsl(${240-heat*200},80%,${50+heat*30}%)`;

      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=col;
      ctx.shadowColor=col; ctx.shadowBlur=4;
      ctx.fill(); ctx.shadowBlur=0;
    });

    const avgSpeed=particles.reduce((s,p)=>s+Math.sqrt(p.vx*p.vx+p.vy*p.vy),0)/particles.length;
    const KE=particles.reduce((s,p)=>s+0.5*5e-26*(p.vx*p.vx+p.vy*p.vy),0);
    const P = N * 5e-26 * avgSpeed*avgSpeed / (3 * (W*H)*1e-6);

    setStats([
      ['Particles', N], ['Temp', T+' K'],
      ['Avg Speed', avgSpeed.toFixed(1)+' m/s'],
      ['Avg KE', (KE/N*1e21).toFixed(2)+' ×10⁻²¹J'],
      ['Pressure', P.toFixed(3)+' Pa'],
    ]);

    updateFPS();
    animId = requestAnimationFrame(draw);
  }

  document.getElementById('formula-text').textContent =
    'PV = NkT   |   KE = ½mv² = 3/2·kT   |   v_rms = √(3kT/m)   |   Elastic collision: Δv = (v₁−v₂)·n̂';

  return { start() { getControls(); initParticles(); draw(); }, onResize() { initParticles(); } };
}









function simSpring() {
  let k=80, mass=2, damping=0.3, x=1.5, v=0, t=0;
  let posHistory=[], velHistory=[], maxHist=300;
  let paused=false;

  function getControls() {
    ctrlBox.innerHTML = `
      <div class="ctrl-group">
        <label>Spring Constant k (N/m)</label>
        <div class="ctrl-row">
          <input type="range" id="sp-k" min="10" max="200" value="${k}" oninput="spK(this.value)"/>
          <span class="ctrl-value" id="sp-k-v">${k}</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Mass (kg)</label>
        <div class="ctrl-row">
          <input type="range" id="sp-m" min="0.5" max="10" step="0.5" value="${mass}" oninput="spM(this.value)"/>
          <span class="ctrl-value" id="sp-m-v">${mass}</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Damping (b)</label>
        <div class="ctrl-row">
          <input type="range" id="sp-d" min="0" max="5" step="0.1" value="${damping}" oninput="spD(this.value)"/>
          <span class="ctrl-value" id="sp-d-v">${damping}</span>
        </div>
      </div>
      <div class="ctrl-group">
        <label>Initial Displacement (m)</label>
        <div class="ctrl-row">
          <input type="range" id="sp-x0" min="0.5" max="3" step="0.1" value="${x}" oninput="spX(this.value)"/>
          <span class="ctrl-value" id="sp-x0-v">${x}</span>
        </div>
      </div>
      <button class="ctrl-btn" onclick="spReset()">↺ Reset</button>
      <button class="ctrl-btn" onclick="spPause()" id="sp-pause">⏸ Pause</button>
    `;
  }

  window.spK = val => { k=+val; document.getElementById('sp-k-v').textContent=val; };
  window.spM = val => { mass=+val; document.getElementById('sp-m-v').textContent=val; };
  window.spD = val => { damping=+val; document.getElementById('sp-d-v').textContent=val; };
  window.spX = val => { x=+val; v=0; t=0; posHistory=[]; velHistory=[]; document.getElementById('sp-x0-v').textContent=val; };
  window.spReset = () => { x=1.5; v=0; t=0; posHistory=[]; velHistory=[]; };
  window.spPause = () => {
    paused=!paused;
    document.getElementById('sp-pause').textContent = paused ? '▶ Resume' : '⏸ Pause';
  };

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W=canvas.width, H=canvas.height;
    const dt=0.025;

    if (!paused) {
      // Verlet integration
      const a = (-k*x - damping*v) / mass;
      v += a*dt;
      x += v*dt;
      t += dt;
      posHistory.push(x);
      velHistory.push(v);
      if (posHistory.length > maxHist) { posHistory.shift(); velHistory.shift(); }
    }

    // ── Spring visual (left side) ──
    const springX = W*0.08, wallY = H*0.45;
    const equilibriumY = H*0.45;
    const scale = H * 0.14;
    const bobY = equilibriumY + x * scale;

    // Wall
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(springX-16, equilibriumY-80, 16, 160);

    // Spring coils
    const coilCount = 12;
    const springTop = equilibriumY - 60;
    const springBot = bobY - 20;
    const springLen = springBot - springTop;
    ctx.beginPath();
    ctx.moveTo(springX, springTop);
    for (let i = 0; i <= coilCount*2; i++) {
      const py = springTop + (i/(coilCount*2))*springLen;
      const px = springX + (i%2===0 ? -14 : 14);
      ctx.lineTo(px, py);
    }
    ctx.lineTo(springX, springBot);
    const springStrain = Math.abs(x)/3;
    ctx.strokeStyle = `hsl(${240-springStrain*160},80%,65%)`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 8;
    ctx.stroke(); ctx.shadowBlur = 0;

    // Bob
    const bobGrd = ctx.createRadialGradient(springX,bobY,0,springX,bobY,22);
    bobGrd.addColorStop(0, '#7b6ff0');
    bobGrd.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(springX, bobY, 28, 0, Math.PI*2);
    ctx.fillStyle=bobGrd; ctx.fill();
    ctx.beginPath(); ctx.arc(springX, bobY, 18, 0, Math.PI*2);
    ctx.fillStyle='#7b6ff0'; ctx.fill();

    // Equilibrium line
    ctx.setLineDash([5,5]);
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(springX-30, equilibriumY); ctx.lineTo(springX+40, equilibriumY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px DM Mono';
    ctx.fillText('x=0', springX+18, equilibriumY-4);

    // ── Position-Time graph (right side) ──
    const gX=W*0.22, gW=W*0.75, gH=H*0.4, gY=H*0.05;
    ctx.fillStyle='rgba(255,255,255,0.03)';
    roundRect(gX,gY,gW,gH,8); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
    roundRect(gX,gY,gW,gH,8); ctx.stroke();

    // Graph grid & axes
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1;
    for(let i=1;i<=4;i++){
      ctx.beginPath(); ctx.moveTo(gX,gY+gH*i/4); ctx.lineTo(gX+gW,gY+gH*i/4); ctx.stroke();
    }
    // Center line
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(gX,gY+gH/2); ctx.lineTo(gX+gW,gY+gH/2); ctx.stroke();

    // Position curve
    if (posHistory.length>1) {
      ctx.beginPath();
      posHistory.forEach((px2,i) => {
        const gx = gX + (i/maxHist)*gW;
        const gy = gY+gH/2 - px2*(gH/8);
        i===0 ? ctx.moveTo(gx,gy) : ctx.lineTo(gx,gy);
      });
      ctx.strokeStyle='#38d9f5'; ctx.lineWidth=2;
      ctx.shadowColor='#38d9f5'; ctx.shadowBlur=6;
      ctx.stroke(); ctx.shadowBlur=0;
    }

    // Velocity curve
    if (velHistory.length>1) {
      ctx.beginPath();
      velHistory.forEach((vv,i) => {
        const gx = gX + (i/maxHist)*gW;
        const gy = gY+gH/2 - vv*(gH/16);
        i===0 ? ctx.moveTo(gx,gy) : ctx.lineTo(gx,gy);
      });
      ctx.strokeStyle='rgba(240,98,146,0.6)'; ctx.lineWidth=1.5;
      ctx.stroke();
    }

    // Graph labels
    ctx.fillStyle='rgba(56,217,245,0.8)'; ctx.font='11px DM Mono'; ctx.textAlign='left';
    ctx.fillText('— Position x(t)', gX+6, gY+14);
    ctx.fillStyle='rgba(240,98,146,0.8)';
    ctx.fillText('— Velocity v(t)', gX+6, gY+28);

    // Phase space (bottom right)
    const psX=W*0.22, psW=W*0.36, psH=H*0.38, psY=H*0.55;
    ctx.fillStyle='rgba(255,255,255,0.03)';
    roundRect(psX,psY,psW,psH,8); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
    roundRect(psX,psY,psW,psH,8); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='10px DM Mono'; ctx.textAlign='center';
    ctx.fillText('Phase Space (x vs v)', psX+psW/2, psY+14);

    if (posHistory.length>1) {
      ctx.beginPath();
      posHistory.forEach((px2,i) => {
        const vv=velHistory[i];
        const gx = psX+psW/2 + px2*(psW/8);
        const gy = psY+psH/2 - vv*(psH/16);
        i===0 ? ctx.moveTo(gx,gy) : ctx.lineTo(gx,gy);
      });
      const phase_hue = (t*30) % 360;
      ctx.strokeStyle=`hsl(${phase_hue},80%,65%)`;
      ctx.lineWidth=1.5;
      ctx.shadowColor=ctx.strokeStyle; ctx.shadowBlur=5;
      ctx.stroke(); ctx.shadowBlur=0;
    }

    // Current point on phase space
    const cpx = psX+psW/2 + x*(psW/8);
    const cpy = psY+psH/2 - v*(psH/16);
    ctx.beginPath(); ctx.arc(cpx, cpy, 5, 0, Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill();

    // Energy bar (bottom right)
    const ebX=W*0.61, ebW=W*0.36, ebH=H*0.38, ebY=H*0.55;
    ctx.fillStyle='rgba(255,255,255,0.03)';
    roundRect(ebX,ebY,ebW,ebH,8); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
    roundRect(ebX,ebY,ebW,ebH,8); ctx.stroke();

    const PE = 0.5*k*x*x;
    const KE2 = 0.5*mass*v*v;
    const total = PE+KE2 || 1;
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='10px DM Mono'; ctx.textAlign='center';
    ctx.fillText('Energy Distribution', ebX+ebW/2, ebY+14);

    const barY=ebY+30, barH=ebH-60, barW=40;
    // PE bar
    const peH = (PE/total)*barH;
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.fillRect(ebX+30, barY, barW, barH);
    ctx.fillStyle='#7b6ff0';
    ctx.shadowColor='#7b6ff0'; ctx.shadowBlur=8;
    ctx.fillRect(ebX+30, barY+barH-peH, barW, peH);
    ctx.shadowBlur=0;

    // KE bar
    const keH = (KE2/total)*barH;
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.fillRect(ebX+90, barY, barW, barH);
    ctx.fillStyle='#f06292';
    ctx.shadowColor='#f06292'; ctx.shadowBlur=8;
    ctx.fillRect(ebX+90, barY+barH-keH, barW, keH);
    ctx.shadowBlur=0;

    ctx.fillStyle='rgba(123,111,240,0.9)'; ctx.textAlign='center'; ctx.font='10px DM Mono';
    ctx.fillText('PE', ebX+50, barY+barH+14);
    ctx.fillStyle='rgba(240,98,146,0.9)';
    ctx.fillText('KE', ebX+110, barY+barH+14);

    const omega=Math.sqrt(k/mass);
    const critDamp=2*Math.sqrt(k*mass);
    const regime = damping<critDamp*0.4?'Under-damped':damping<critDamp*0.8?'Near-critical':'Over-damped';

    setStats([
      ['Position x', x.toFixed(3)+' m'],
      ['Velocity v', v.toFixed(3)+' m/s'],
      ['PE', PE.toFixed(3)+' J'],
      ['KE', KE2.toFixed(3)+' J'],
      ['ω₀', omega.toFixed(2)+' rad/s'],
      ['Period', (2*Math.PI/omega).toFixed(2)+' s'],
      ['Regime', regime],
    ]);

    updateFPS();
    animId = requestAnimationFrame(draw);
  }

  document.getElementById('formula-text').textContent =
    'F = −kx − bv   |   mẍ + bẋ + kx = 0   |   ω₀ = √(k/m)   |   ζ = b/(2√km)   |   T = 2π/ω₀';

  return { start() { getControls(); draw(); }, onResize() {} };
}

// ── INIT: start with projectile ──
resizeCanvas();
selectSim('projectile', document.querySelector('.sim-btn.active'));
