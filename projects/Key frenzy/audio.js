const Sound = (() => {
  const sounds = {
    hit: new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-game-click-1114.mp3",
    ),
    wrong: new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3",
    ),
    start: new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-start-222.mp3",
    ),
  };

  Object.values(sounds).forEach((s) => {
    s.volume = 0.5;
    s.preload = "auto";
  });

  return {
    play(name) {
      if (!sounds[name]) return;
      sounds[name].currentTime = 0;
      sounds[name].play();
    },
  };
})();
