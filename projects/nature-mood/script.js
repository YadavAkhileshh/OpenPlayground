const moods = [
  "Rainy window 🌧️ — slow down and rest",
  "Forest breeze 🌲 — steady and grounded",
  "Ocean waves 🌊 — let things flow",
  "Golden sunset 🌅 — you did enough today",
  "Mountain air ⛰️ — quiet strength"
];

function generateMood() {
  document.getElementById("mood").innerText =
    moods[Math.floor(Math.random() * moods.length)];
}