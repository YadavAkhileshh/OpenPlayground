const ideas = [
  "Drink a glass of water 💧",
  "Step outside for fresh air 🌿",
  "Stretch your body for 5 minutes 🤸",
  "Take 3 deep breaths 🌬️",
  "Rest your eyes for a moment 👀",
  "Listen to your favorite song 🎧",
  "Write one positive thought ✨",
  "Smile — you’re doing your best 😊"
];

function gen() {
  const randomIndex = Math.floor(Math.random() * ideas.length);
  document.getElementById("idea").innerText = ideas[randomIndex];
}