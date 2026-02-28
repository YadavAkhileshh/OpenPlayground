const interactBtn = document.getElementById('interactBtn');
const speedDisplay = document.getElementById('speedDisplay');
const balls = document.querySelectorAll('.moving-ball');

let lastClickTime = Date.now();
let clickIntervals = [];
const maxIntervals = 5; // Average over last 5 clicks

interactBtn.addEventListener('click', handleInteract);

function handleInteract() {
    const now = Date.now();
    const interval = now - lastClickTime;
    lastClickTime = now;

    clickIntervals.push(interval);
    if (clickIntervals.length > maxIntervals) {
        clickIntervals.shift();
    }

    const avgInterval = clickIntervals.reduce((a, b) => a + b, 0) / clickIntervals.length;

    // Faster clicks (smaller interval) -> higher speed (smaller duration)
    // Slower clicks -> lower speed (larger duration)
    const baseDuration = 2; // seconds
    const minDuration = 0.5;
    const maxDuration = 5;
    let duration = baseDuration;

    if (avgInterval < 500) { // Fast clicks
        duration = Math.max(minDuration, baseDuration * (avgInterval / 500));
    } else if (avgInterval > 2000) { // Slow clicks
        duration = Math.min(maxDuration, baseDuration * (avgInterval / 2000));
    }

    // Update animation duration
    balls.forEach(ball => {
        ball.style.animationDuration = duration + 's';
    });

    // Update display
    const speedMultiplier = baseDuration / duration;
    speedDisplay.textContent = `Current Speed: ${speedMultiplier.toFixed(1)}x`;
}