console.log("One-Button Economy Initialized");

const player = document.getElementById('player');
const statusText = document.getElementById('status-text');

// State
let isPressed = false;
let pressStartTime = 0;
let clickCount = 0;
let clickTimer = null;

// Constants
const SHORT_PRESS_MAX_TIME = 200; // ms
const DOUBLE_CLICK_DELAY = 300; // ms

function handleInputStart() {
    isPressed = true;
    pressStartTime = Date.now();
    player.style.filter = "brightness(0.8)";
}

function handleInputEnd() {
    if (!isPressed) return;
    isPressed = false;
    player.style.filter = "none";
    
    const pressDuration = Date.now() - pressStartTime;
    
    if (pressDuration > SHORT_PRESS_MAX_TIME) {
        // Long Press
        performAction('ATTACK');
        clickCount = 0; // Reset double click counter on long press
        clearTimeout(clickTimer);
    } else {
        // Short Press candidate
        clickCount++;
        
        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                performAction('MOVE');
                clickCount = 0;
            }, DOUBLE_CLICK_DELAY);
        } else {
            // Double Click
            clearTimeout(clickTimer);
            performAction('DASH');
            clickCount = 0;
        }
    }
}

function performAction(action) {
    console.log("Action:", action);
    statusText.innerText = action;
    
    // Reset classes
    player.className = '';
    
    // Trigger Reflow to restart animations if needed
    void player.offsetWidth;

    switch (action) {
        case 'MOVE':
            player.classList.add('moving');
            setTimeout(() => player.classList.remove('moving'), 200);
            break;
        case 'ATTACK':
            player.classList.add('attacking');
            setTimeout(() => player.classList.remove('attacking'), 400);
            break;
        case 'DASH':
            player.classList.add('dashing');
            setTimeout(() => player.classList.remove('dashing'), 300);
            break;
    }
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat && !isPressed) {
        handleInputStart();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        handleInputEnd();
    }
});

document.addEventListener('mousedown', handleInputStart);
document.addEventListener('mouseup', handleInputEnd);

document.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior (scrolling, etc.)
    handleInputStart();
}, { passive: false });

document.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleInputEnd();
});
