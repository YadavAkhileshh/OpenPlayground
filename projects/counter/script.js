let count = 0;

const counter = document.getElementById('counter');
const decrease = document.getElementById('decrease');
const reset = document.getElementById('reset');
const increase = document.getElementById('increase');
const themeToggle = document.getElementById('themeToggle');

function updateCounter() {
    counter.textContent = count;
}

decrease.addEventListener('click', () => {
    count--;
    updateCounter();
});

increase.addEventListener('click', () => {
    count++;
    updateCounter();
});

reset.addEventListener('click', () => {
    count = 0;
    updateCounter();
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark')
        ? '☀️ Light Mode'
        : '🌙 Dark Mode';
});

/* ===============================
   Keyboard Accessibility
=============================== */

document.body.focus();

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        count++;
        updateCounter();
    }

    if (event.key === 'ArrowDown') {
        count--;
        updateCounter();
    }

    if (event.key === 'r' || event.key === 'R') {
        count = 0;
        updateCounter();
    }
});
