const MAX = 100, MIN = 20;
let temp = MIN, heating = false, alarmed = false, muted = false, thr = 80;
let iv = null, cv = null, bctx = null, bloop = null;
const g = id => document.getElementById(id);
const water = g('water'), bar = g('bar'), tv = g('tv'), td = g('td');
const dot = g('dot'), st = g('st'), ab = g('ab');
const btnS = g('btnS'), btnX = g('btnX'), bm = g('bm'), sl = g('sl');
const ss = [g('s1'), g('s2'), g('s3')];

sl.oninput = () => { thr = +sl.value; td.textContent = thr + '°C' };

function ui() {
    const p = ((temp - MIN) / (MAX - MIN)) * 100;
    tv.textContent = Math.round(temp);
    bar.style.width = p + '%';
    const r = Math.round(p / 100 * 255);
    bar.style.background = `linear-gradient(90deg,rgb(0,${200 - r},${255 - r}),rgb(${r},${Math.round((100 - p) / 100 * 180)},50))`;
    water.style.height = (30 + p * .6) + '%';
    water.style.background = `linear-gradient(0deg,rgb(${r},${100 - Math.round(r / 3)},${220 - r}),rgb(0,${180 - r},${220 - r}))`;
    ss.forEach(s => temp > thr - 15 ? s.classList.add('on') : s.classList.remove('on'));
}

function setS(s) {
    dot.className = 'dot' + (s === 'h' ? ' h' : s === 'a' ? ' a' : '');
    st.textContent = s === 'h' ? 'Heating in progress…' : s === 'a' ? '🔴 ALARM — target temperature reached!' : 'Idle — ready to heat';
}

function startBeep() {
    if (muted) return;
    try {
        bctx = new (window.AudioContext || window.webkitAudioContext)();
        const play = () => {
            if (!alarmed || muted) return;
            const o = bctx.createOscillator(), g2 = bctx.createGain();
            o.connect(g2); g2.connect(bctx.destination);
            o.frequency.value = 880; o.type = 'square';
            g2.gain.setValueAtTime(.25, bctx.currentTime);
            g2.gain.exponentialRampToValueAtTime(.001, bctx.currentTime + .35);
            o.start(bctx.currentTime); o.stop(bctx.currentTime + .35);
            if (alarmed && !muted) bloop = setTimeout(play, 700);
        }; play();
    } catch (e) { }
}

function stopBeep() { clearTimeout(bloop); if (bctx) { try { bctx.close() } catch (e) { } bctx = null } }
function doAlarm() { alarmed = true; ab.classList.add('on'); setS('a'); startBeep() }
function clearAlarm() { alarmed = false; muted = false; ab.classList.remove('on'); bm.textContent = 'MUTE'; bm.style.opacity = '1'; stopBeep() }

btnS.onclick = () => {
    if (heating) return;
    clearInterval(cv); clearAlarm(); heating = true;
    btnS.disabled = true; btnX.disabled = false; setS('h');
    iv = setInterval(() => {
        temp += .5 + Math.random(); if (temp > MAX) temp = MAX;
        ui();
        if (temp >= thr && !alarmed) doAlarm();
        if (temp >= MAX) stop();
    }, 200);
};

btnX.onclick = stop;

function stop() {
    heating = false; clearInterval(iv);
    btnS.disabled = false; btnX.disabled = true;
    if (!alarmed) setS('');
    cv = setInterval(() => {
        if (heating) { clearInterval(cv); return }
        temp -= .25; if (temp <= MIN) { temp = MIN; clearInterval(cv) }
        ui();
        if (temp < thr && alarmed) { clearAlarm(); setS('') }
    }, 300);
}

bm.onclick = () => { muted = true; stopBeep(); bm.textContent = '✓ MUTED'; bm.style.opacity = '.5' };
ui();