let audio = document.getElementById("audio");
let songTitle = document.getElementById("songTitle");
let progress = document.getElementById("progress");

let songs = {
  happy: "happy.mp3",
  sad: "sad.mp3",
  focus: "focus.mp3"
};

function setMood(mood) {
  audio.src = songs[mood];
  songTitle.innerText = "Mood: " + mood.toUpperCase();
  changeTheme(mood);
  audio.play();
}

function playMusic() {
  audio.play();
}

function pauseMusic() {
  audio.pause();
}

audio.addEventListener("timeupdate", () => {
  progress.value = (audio.currentTime / audio.duration) * 100;
});

progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});

function changeTheme(mood) {
  if (mood === "happy") {
    document.body.style.background = "linear-gradient(135deg,#ffdd00,#ff8800)";
  } else if (mood === "sad") {
    document.body.style.background = "linear-gradient(135deg,#1e3c72,#2a5298)";
  } else if (mood === "focus") {
    document.body.style.background = "linear-gradient(135deg,#11998e,#38ef7d)";
  }
}