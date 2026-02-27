// ========== AURORA BACKGROUND ==========
const canvas = document.getElementById('aurora');
const ctx = canvas.getContext('2d');
let W, H;
function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let time = 0;
let currentPaletteColors = ['#7b68ee','#00d4ff','#ff6bca','#50fa7b','#ff8a50'];

function drawAurora() {
  ctx.fillStyle = 'rgba(10,10,26,0.08)';
  ctx.fillRect(0, 0, W, H);
  
  currentPaletteColors.forEach((color, i) => {
    const r = parseInt(color.slice(1,3),16);
    const g = parseInt(color.slice(3,5),16);
    const b = parseInt(color.slice(5,7),16);
    
    ctx.beginPath();
    const baseY = H * 0.3 + Math.sin(time * 0.3 + i * 1.5) * H * 0.15;
    ctx.moveTo(0, baseY);
    
    for (let x = 0; x <= W; x += 5) {
      const y = baseY + 
        Math.sin(x * 0.003 + time * 0.5 + i * 2) * 40 +
        Math.sin(x * 0.007 + time * 0.3 + i) * 25 +
        Math.cos(x * 0.001 + time * 0.2) * 30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, baseY - 60, 0, baseY + 120);
    grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    grad.addColorStop(0.3, 'rgba(' + r + ',' + g + ',' + b + ',0.04)');
    grad.addColorStop(0.6, 'rgba(' + r + ',' + g + ',' + b + ',0.02)');
    grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    ctx.fillStyle = grad;
    ctx.fill();
  });
  
  time += 0.016;
  requestAnimationFrame(drawAurora);
}
drawAurora();

// ========== COLOR UTILITIES ==========
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1,3),16)/255;
  let g = parseInt(hex.slice(3,5),16)/255;
  let b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case r: h = ((g-b)/d + (g<b?6:0)) * 60; break;
      case g: h = ((b-r)/d + 2) * 60; break;
      case b: h = ((r-g)/d + 4) * 60; break;
    }
  }
  return { h: Math.round(h), s: Math.round(s*100), l: Math.round(l*100) };
}

function getLuminance(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const toLinear = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b);
}

function getContrastColor(hex) {
  return getLuminance(hex) > 0.35 ? '#1a1a2e' : '#ffffff';
}

function getColorName(h, s, l) {
  if (l < 15) return 'Abyss';
  if (l > 90) return 'Ethereal';
  if (s < 10) return l > 60 ? 'Mist' : 'Shadow';
  if (s < 25) return l > 60 ? 'Haze' : 'Dusk';
  
  const names = [
    [0, 'Ember'], [20, 'Flame'], [35, 'Amber'], [50, 'Gold'],
    [65, 'Citrine'], [80, 'Peridot'], [100, 'Fern'], [130, 'Jade'],
    [160, 'Teal'], [185, 'Cyan'], [200, 'Azure'], [220, 'Cobalt'],
    [245, 'Indigo'], [270, 'Amethyst'], [290, 'Orchid'], [310, 'Magenta'],
    [330, 'Rose'], [350, 'Crimson'], [360, 'Ember']
  ];
  
  let name = 'Prisma';
  for (let i = 0; i < names.length - 1; i++) {
    if (h >= names[i][0] && h < names[i+1][0]) { name = names[i][1]; break; }
  }
  
  if (l > 70) return 'Light ' + name;
  if (l < 35) return 'Deep ' + name;
  if (s > 80) return 'Vivid ' + name;
  return name;
}

// ========== HARMONY ENGINE ==========
let baseHue = 210;
let currentHarmony = 'analogous';

function generateHarmony(hue, type) {
  const palettes = {
    analogous: [
      { h: hue, s: 75, l: 55 },
      { h: hue - 25, s: 65, l: 45 },
      { h: hue + 25, s: 70, l: 60 },
      { h: hue - 40, s: 55, l: 35 },
      { h: hue + 45, s: 80, l: 68 },
      { h: hue, s: 30, l: 85 }
    ],
    complementary: [
      { h: hue, s: 78, l: 52 },
      { h: hue, s: 50, l: 72 },
      { h: hue + 180, s: 75, l: 50 },
      { h: hue + 180, s: 45, l: 68 },
      { h: hue, s: 25, l: 88 },
      { h: hue + 180, s: 20, l: 25 }
    ],
    triadic: [
      { h: hue, s: 75, l: 55 },
      { h: hue + 120, s: 70, l: 50 },
      { h: hue + 240, s: 72, l: 52 },
      { h: hue, s: 40, l: 78 },
      { h: hue + 120, s: 35, l: 75 },
      { h: hue + 240, s: 25, l: 30 }
    ],
    split: [
      { h: hue, s: 80, l: 54 },
      { h: hue + 150, s: 68, l: 48 },
      { h: hue + 210, s: 70, l: 50 },
      { h: hue, s: 35, l: 80 },
      { h: hue + 150, s: 30, l: 72 },
      { h: hue + 210, s: 22, l: 28 }
    ],
    tetradic: [
      { h: hue, s: 76, l: 52 },
      { h: hue + 90, s: 70, l: 48 },
      { h: hue + 180, s: 74, l: 50 },
      { h: hue + 270, s: 68, l: 46 },
      { h: hue + 45, s: 30, l: 82 },
      { h: hue + 225, s: 20, l: 22 }
    ]
  };
  return palettes[type] || palettes.analogous;
}

// ========== HUE WHEEL ==========
const hueCanvas = document.getElementById('hueWheel');
const hueCtx = hueCanvas.getContext('2d');
const hueIndicator = document.getElementById('hueIndicator');
const hueValueEl = document.getElementById('hueValue');

function drawHueWheel() {
  const cx = 90, cy = 90, outerR = 85, innerR = 55;
  hueCtx.clearRect(0, 0, 180, 180);
  
  for (let angle = 0; angle < 360; angle += 1) {
    const startAngle = (angle - 1) * Math.PI / 180;
    const endAngle = (angle + 1) * Math.PI / 180;
    
    hueCtx.beginPath();
    hueCtx.arc(cx, cy, outerR, startAngle, endAngle);
    hueCtx.arc(cx, cy, innerR, endAngle, startAngle, true);
    hueCtx.closePath();
    hueCtx.fillStyle = 'hsl(' + angle + ', 80%, 55%)';
    hueCtx.fill();
  }
  
  // inner circle
  hueCtx.beginPath();
  hueCtx.arc(cx, cy, innerR - 4, 0, Math.PI * 2);
  hueCtx.fillStyle = 'rgba(10,10,26,0.9)';
  hueCtx.fill();
  
  // Draw current hue text in center
  hueCtx.fillStyle = hslToHex(baseHue, 75, 55);
  hueCtx.font = '700 22px Outfit';
  hueCtx.textAlign = 'center';
  hueCtx.textBaseline = 'middle';
  hueCtx.fillText(Math.round(baseHue) + '\u00B0', cx, cy);
}

function updateHueIndicator() {
  const cx = 90, cy = 90, r = 70;
  const angle = baseHue * Math.PI / 180;
  const x = cx + r * Math.cos(angle - Math.PI/2);
  const y = cy + r * Math.sin(angle - Math.PI/2);
  hueIndicator.style.left = x + 'px';
  hueIndicator.style.top = y + 'px';
  hueIndicator.style.background = hslToHex(baseHue, 80, 55);
  hueValueEl.textContent = Math.round(baseHue);
}

drawHueWheel();
updateHueIndicator();

let isDragging = false;
function handleHueInput(e) {
  const rect = hueCanvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left - 90;
  const y = (e.clientY || e.touches[0].clientY) - rect.top - 90;
  baseHue = ((Math.atan2(y, x) * 180 / Math.PI + 90) + 360) % 360;
  drawHueWheel();
  updateHueIndicator();
  generatePalette();
}

hueCanvas.addEventListener('mousedown', (e) => { isDragging = true; handleHueInput(e); });
window.addEventListener('mousemove', (e) => { if (isDragging) handleHueInput(e); });
window.addEventListener('mouseup', () => { isDragging = false; });
hueCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDragging = true; handleHueInput(e); });
window.addEventListener('touchmove', (e) => { if (isDragging) handleHueInput(e); });
window.addEventListener('touchend', () => { isDragging = false; });

// ========== PALETTE GENERATION ==========
const container = document.getElementById('paletteContainer');
const infoEl = document.getElementById('paletteInfo');

function createParticles(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 3;
    const size = 2 + Math.random() * 3;
    html += '<div class="swatch-particle" style="left:' + left + '%;animation-delay:' + delay + 's;width:' + size + 'px;height:' + size + 'px;bottom:-5px"></div>';
  }
  return html;
}

function generatePalette() {
  const colors = generateHarmony(baseHue, currentHarmony);
  const hexColors = colors.map(c => hslToHex(c.h, c.s, c.l));
  currentPaletteColors = hexColors;
  
  container.innerHTML = '';
  
  colors.forEach((c, i) => {
    const hex = hexColors[i];
    const contrast = getContrastColor(hex);
    const hsl = hexToHSL(hex);
    const name = getColorName(hsl.h, hsl.s, hsl.l);
    
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.background = hex;
    swatch.style.animationDelay = (i * 0.1) + 's';
    
    swatch.innerHTML = 
      '<div class="swatch-particles">' + createParticles(5) + '</div>' +
      '<div class="swatch-inner">' +
        '<div class="swatch-label" style="background:' + contrast + '22;color:' + contrast + '">' + hex.toUpperCase() + '</div>' +
        '<div class="swatch-hex" style="color:' + contrast + '">HSL ' + hsl.h + ' / ' + hsl.s + ' / ' + hsl.l + '</div>' +
        '<div class="swatch-name" style="color:' + contrast + '">' + name + '</div>' +
      '</div>';
    
    swatch.addEventListener('click', () => copyToClipboard(hex, swatch));
    container.appendChild(swatch);
  });
  
  updateInfo(colors, hexColors);
}

function updateInfo(colors, hexColors) {
  const harmonyName = currentHarmony.charAt(0).toUpperCase() + currentHarmony.slice(1);
  let cssVars = ':root {\n';
  hexColors.forEach((hex, i) => {
    cssVars += '  --color-' + (i + 1) + ': ' + hex + ';\n';
  });
  cssVars += '}';
  
  infoEl.innerHTML = 
    '<h3>' + harmonyName + ' Harmony &bull; Base ' + Math.round(baseHue) + '&deg;</h3>' +
    '<p>Click any swatch to copy its hex value. Drag the hue wheel to explore.</p>' +
    '<div class="css-output">' + cssVars + '</div>';
}

function copyToClipboard(text, el) {
  navigator.clipboard.writeText(text).catch(() => {});
  
  let toast = document.querySelector('.copied-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'copied-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = 'Copied ' + text.toUpperCase() + ' \u2714';
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

// ========== BUTTON HANDLERS ==========
document.querySelectorAll('.harmony-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.harmony-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentHarmony = btn.dataset.harmony;
    generatePalette();
  });
});

document.getElementById('generateBtn').addEventListener('click', () => generatePalette());

document.getElementById('randomBtn').addEventListener('click', () => {
  baseHue = Math.random() * 360;
  const harmonies = ['analogous','complementary','triadic','split','tetradic'];
  currentHarmony = harmonies[Math.floor(Math.random() * harmonies.length)];
  document.querySelectorAll('.harmony-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.harmony === currentHarmony);
  });
  drawHueWheel();
  updateHueIndicator();
  generatePalette();
});

// Initial generation
generatePalette();