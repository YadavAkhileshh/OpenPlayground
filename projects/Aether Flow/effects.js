function screenShake() {
  const el = document.getElementById("game-container");
  el.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
  setTimeout(() => (el.style.transform = "translate(0,0)"), 50);
}

// Hook into the hit logic in script.js
// if (ent.type === 'void') { screenShake(); }
