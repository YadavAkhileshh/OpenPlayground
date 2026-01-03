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

// Get elements from HTML
const bioDiv = document.getElementById("bio");
const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy");

// Function to generate bio
function generateBio() {
  const emojiPart = emojis[Math.floor(Math.random() * emojis.length)];
  const hobbyPart = hobbies[Math.floor(Math.random() * hobbies.length)];
  const vibePart = vibes[Math.floor(Math.random() * vibes.length)];
  const phrasePart = phrases[Math.floor(Math.random() * phrases.length)];

  return `${emojiPart} ${hobbyPart} | ${vibePart} | ${phrasePart}`;
}

// Button click to generate bio
generateBtn.addEventListener("click", () => {
  bioDiv.textContent = generateBio();
});

// Button click to copy bio
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(bioDiv.textContent);
  alert("Bio copied to clipboard!");
});
