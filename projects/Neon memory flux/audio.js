const ctx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep() {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = 440;
  g.gain.value = 0.05;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.1);
}
