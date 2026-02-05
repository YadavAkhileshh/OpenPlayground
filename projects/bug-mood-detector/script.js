const moods = [
  "😡 Angry Bug – broke everything",
  "😴 Sleeping Bug – hiding somewhere",
  "🤡 Troll Bug – messing with you",
  "😇 Innocent Bug – not my fault",
  "🫥 Invisible Bug – can't be found",
  "😈 Evil Bug – enjoying the chaos"
];

function detectMood() {
  const randomIndex = Math.floor(Math.random() * moods.length);
  document.getElementById("mood").innerText = moods[randomIndex];
}