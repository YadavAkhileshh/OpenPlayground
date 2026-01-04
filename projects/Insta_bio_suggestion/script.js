const emojis = ["😎", "🌸", "✨", "🏀", "🎨", "☕", "🥀", "💡"];
const hobbies = ["coffee lover", "gamer", "anime fan", "artist", "bookworm", "traveller"];
const vibes = ["dreamer", "chill", "chaotic", "ambitious", "quiet storm", "meme dealer"];
const phrases = [
  "living my best life",
  "scrolling & chilling",
  "pixels & vibes",
  "no filter needed",
  "just vibin'",
  "always hungry"
];

const bioDiv = document.getElementById("bio");
const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy");
const toggleThemeBtn = document.getElementById("toggle-theme");

// Generate bio
function generateBio() {
  return `${random(emojis)} ${random(hobbies)} | ${random(vibes)} | ${random(phrases)}`;
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

generateBtn.addEventListener("click", () => {
  bioDiv.textContent = generateBio();
});

// Copy bio
copyBtn.addEventListener("click", () => {
  if (!bioDiv.textContent) return;
  navigator.clipboard.writeText(bioDiv.textContent);
  alert("Bio copied to clipboard!");
});

// 🌙 Theme Toggle
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  toggleThemeBtn.textContent =
    document.body.classList.contains("dark")
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";
});
