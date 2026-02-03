const display = document.getElementById('password-display');
const slider = document.getElementById('length-slider');
const label = document.getElementById('length-label');
const bar = document.getElementById('entropy-bar');
const strengthText = document.getElementById('strength-text');
const copyIcon = document.getElementById('copy-icon');
const genBtn = document.getElementById('gen-btn');
const toggleVisibility = document.getElementById('toggle-visibility');

const charset =
  "ABCDEGHJKLMNPQRSTUVWZabcdefghijkpqrstuvwz23456789!@#$%&*+=-";

let hidden = true;

/* Generate password */
function generate() {
  const len = slider.value;
  label.innerText = len;

  let password = "";
  for (let i = 0; i < len; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  display.innerText = password;
  updateStrength(len);

  genBtn.classList.add("loading");
  setTimeout(() => genBtn.classList.remove("loading"), 300);
}

/* Strength logic */
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

/* Copy password */
copyIcon.addEventListener('click', () => {
  navigator.clipboard.writeText(display.innerText);

  copyIcon.classList.replace('ri-file-copy-2-line', 'ri-checkbox-circle-line');
  copyIcon.style.color = '#00ff41';

  setTimeout(() => {
    copyIcon.classList.replace('ri-checkbox-circle-line', 'ri-file-copy-2-line');
    copyIcon.style.color = '';
  }, 1500);
});

/* Show / hide password */
toggleVisibility.addEventListener('click', () => {
  hidden = !hidden;
  display.classList.toggle('masked');

  toggleVisibility.className = hidden
    ? 'ri-eye-line'
    : 'ri-eye-off-line';
});

/* Events */
genBtn.addEventListener('click', generate);
slider.addEventListener('input', generate);

/* Initial load */
generate();
