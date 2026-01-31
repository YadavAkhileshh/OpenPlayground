function screenShake() {
  canvas.style.transform = `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`;
  setTimeout(() => (canvas.style.transform = ""), 80);
}

setInterval(() => {
  if (energy < 30 && running) screenShake();
}, 500);
