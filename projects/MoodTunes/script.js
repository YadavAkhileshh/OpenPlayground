document.addEventListener("DOMContentLoaded", () => {

  loadPlaylist("happy");
  document.body.className = "happy";

  // Mood Change
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMood = btn.dataset.mood;
      document.body.className = currentMood;

      loadPlaylist(currentMood);
    });
  });

  // Controls
  document.getElementById("play-btn").addEventListener("click", togglePlay);
  document.getElementById("next-btn").addEventListener("click", nextSong);
  document.getElementById("prev-btn").addEventListener("click", prevSong);

});
