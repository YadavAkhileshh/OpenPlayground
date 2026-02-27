const audio = new Audio();
let isPlaying = false;

function playSong(index) {
  const song = playlistSongs[index];

  document.getElementById("current-song").innerText = song.trackName;
  document.getElementById("current-artist").innerText = song.artistName;

  document.getElementById("album-art").src = song.artworkUrl100;

  audio.src = song.previewUrl;
  audio.play();

  isPlaying = true;
  document.getElementById("play-btn").innerText = "⏸";
}

/* Play Pause */
function togglePlay() {
  if (!isPlaying) {
    audio.play();
    isPlaying = true;
    document.getElementById("play-btn").innerText = "⏸";
  } else {
    audio.pause();
    isPlaying = false;
    document.getElementById("play-btn").innerText = "▶";
  }
}

/* Next Song */
function nextSong() {
  currentIndex++;
  if (currentIndex >= playlistSongs.length) currentIndex = 0;
  playSong(currentIndex);
}

/* Previous Song */
function prevSong() {
  currentIndex--;
  if (currentIndex < 0) currentIndex = playlistSongs.length - 1;
  playSong(currentIndex);
}

/* Progress Update */
audio.addEventListener("timeupdate", () => {
  const progress = document.getElementById("progress");
  progress.value = (audio.currentTime / audio.duration) * 100;
});

/* Seek Control */
document.getElementById("progress").addEventListener("input", (e) => {
  audio.currentTime = (e.target.value / 100) * audio.duration;
});
