const display = document.getElementById('password-display');
const slider = document.getElementById('length-slider');
const label = document.getElementById('length-label');
const bar = document.getElementById('entropy-bar');
const strengthText = document.getElementById('strength-text');
const copyArea = document.getElementById('copy-area');
const genBtn = document.getElementById('gen-btn');

const charset = "ABCDEGHJKLMNPQRSTUVWZabcdefghijkpqrstuvwz23456789!@#$%&*+=-";

function generate() {
    let len = slider.value;
    label.innerText = len;
    let password = "";
    
    for (let i = 0; i < len; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    display.innerText = password;
    updateStrength(len);
}

function updateStrength(len) {
    let width, color, text;
    
    if (len < 12) {
        width = "33%";
        color = "#ff4d4d";
        text = "WEAK";
    } else if (len < 20) {
        width = "66%";
        color = "#ffaa00";
        text = "MEDIUM";
    } else {
        width = "100%";
        color = "#00ff41";
        text = "ULTRA SECURE";
    }
    
    bar.style.setProperty('--strength-width', width);
    bar.style.setProperty('--strength-color', color);
    strengthText.innerText = text;
    strengthText.style.color = color;
}

copyArea.addEventListener('click', () => {
    navigator.clipboard.writeText(display.innerText);
    const icon = document.getElementById('copy-icon');
    
    // Quick success feedback
    icon.classList.replace('ri-file-copy-2-line', 'ri-checkbox-circle-line');
    icon.style.color = '#00ff41';
    
    setTimeout(() => {
        icon.classList.replace('ri-checkbox-circle-line', 'ri-file-copy-2-line');
        icon.style.color = '';
    }, 2000);
});

genBtn.addEventListener('click', generate);
slider.addEventListener('input', generate);

// Initial call
generate();