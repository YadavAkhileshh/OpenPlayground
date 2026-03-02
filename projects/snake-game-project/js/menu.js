const startBtn = document.getElementById('startBtn');
const exitBtn = document.getElementById('exitBtn');

startBtn.addEventListener('click', () => {
    window.location.href = "game.html"; e
});

exitBtn.addEventListener('click', () => {
    alert('Thanks for visiting!');
    window.close(); 
});
