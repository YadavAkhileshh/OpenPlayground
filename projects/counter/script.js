let count = 0; const counter = document.getElementById('counter'); const decrease = document.getElementById('decrease'); const reset = document.getElementById('reset'); const increase = document.getElementById('increase'); function updateCounter() { counter.textContent = count; counter.style.color = count > 0 ? '#4caf50' : count < 0 ? '#f44336' : '#fa709a' } decrease.addEventListener('click', () => { count--; updateCounter() }); increase.addEventListener('click', () => { count++; updateCounter() }); reset.addEventListener('click', () => { count = 0; updateCounter() });
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');

    themeToggle.textContent = 
        document.body.classList.contains('dark')
        ? '☀️ Light Mode'
        : '🌙 Dark Mode';
});
