let activeTime = 0;
let inactiveTime = 0;
let isActive = true;
let lastChange = Date.now();

const statusEl = document.getElementById('status');
const activeTimeEl = document.getElementById('activeTime');
const inactiveTimeEl = document.getElementById('inactiveTime');
const statusContainer = document.querySelector('.status');

function pad(n) {
    return n.toString().padStart(2, '0');
}

function formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function updateDisplay() {
    activeTimeEl.textContent = formatTime(activeTime);
    inactiveTimeEl.textContent = formatTime(inactiveTime);
    statusEl.textContent = isActive ? 'Active' : 'Inactive';
    statusContainer.classList.toggle('inactive', !isActive);
}

function tick() {
    const now = Date.now();
    const diff = Math.floor((now - lastChange) / 1000);
    if (isActive) {
        activeTime += diff;
    } else {
        inactiveTime += diff;
    }
    lastChange = now;
    updateDisplay();
}

document.addEventListener('visibilitychange', () => {
    tick();
    isActive = !document.hidden;
    updateDisplay();
});

window.addEventListener('focus', () => {
    tick();
    isActive = true;
    updateDisplay();
});

window.addEventListener('blur', () => {
    tick();
    isActive = false;
    updateDisplay();
});

setInterval(() => {
    if (isActive) {
        activeTime++;
    } else {
        inactiveTime++;
    }
    updateDisplay();
}, 1000);

updateDisplay();
