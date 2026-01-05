function playSound(e) {
    // Check if triggered by keyboard (e.keyCode) or mouse click (attribute)
    const keyCode = e.keyCode || this.getAttribute('data-key');
    
    const audio = document.querySelector(`audio[data-key="${keyCode}"]`);
    const key = document.querySelector(`.key[data-key="${keyCode}"]`);

    if (!audio) return; // Exit if a key with no audio is pressed

    key.classList.add('playing');
    audio.currentTime = 0; // Rewind to start so you can spam keys
    audio.play();
}

function removeTransition(e) {
    // We only care about the transform property being finished
    if (e.propertyName !== 'transform') return;
    this.classList.remove('playing');
}

// 1. Listen for Keyboard Keys
window.addEventListener('keydown', playSound);

// 2. Listen for Mouse Clicks on each key
const keys = document.querySelectorAll('.key');
keys.forEach(key => {
    key.addEventListener('click', playSound);
    key.addEventListener('transitionend', removeTransition);
});