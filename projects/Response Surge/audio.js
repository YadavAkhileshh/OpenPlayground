const Sound = (() => {
  const sfx = {
    go: new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-game-level-start-1009.mp3",
    ),
    hit: new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3",
    ),
    fail: new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3",
    ),
  };

  Object.values(sfx).forEach((s) => {
    s.volume = 0.6;
    s.preload = "auto";
  });

  return {
    play(name) {
      if (!sfx[name]) return;
      sfx[name].currentTime = 0;
      sfx[name].play();
    },
  };
})();
