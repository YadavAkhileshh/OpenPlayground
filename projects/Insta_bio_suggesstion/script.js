// ===============================
// DATA
// ===============================
const emojis = ["😎", "🌸", "✨", "🏀", "🎨", "☕", "🥀", "💡", "🔥", "🖤"];
const hobbies = [
  "coffee lover",
  "gamer",
  "anime fan",
  "artist",
  "bookworm",
  "traveller"
];
const vibes = [
  "dreamer",
  "chill",
  "chaotic",
  "ambitious",
  "quiet storm",
  "meme dealer"
];
const phrases = [
  "living my best life",
  "scrolling & chilling",
  "pixels & vibes",
  "no filter needed",
  "just vibin'",
  "always hungry"
];

// THEMES
const themes = [
  "theme-pastel",
  "theme-dark",
  "theme-neon",
  "theme-earth",
  "theme-sunset"
];

let currentTheme = "";

// ===============================
// ELEMENTS
// ===============================
const bioDiv = document.getElementById("bio");
const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy");

// ===============================
// FUNCTIONS
// ===============================

// Apply random theme (no repeat)
function applyRandomTheme() {
  let newTheme;
  do {
    newTheme = themes[Math.floor(Math.random() * themes.length)];
  } while (newTheme === currentTheme);

  document.body.classList.remove(...themes);
  document.body.classList.add(newTheme);
  currentTheme = newTheme;
}

// Generate bio text
function generateBio() {
  applyRandomTheme();

  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const hobby = hobbies[Math.floor(Math.random() * hobbies.length)];
  const vibe = vibes[Math.floor(Math.random() * vibes.length)];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];

  return `${emoji} ${hobby} | ${vibe} | ${phrase}`;
}

// ===============================
// EVENTS
// ===============================

// Generate button
generateBtn.addEventListener("click", () => {
  bioDiv.style.opacity = "0";
  bioDiv.style.transform = "translateY(10px)";

  setTimeout(() => {
    bioDiv.textContent = generateBio();
    bioDiv.style.opacity = "1";
    bioDiv.style.transform = "translateY(0)";
  }, 150);
});

// Copy button
copyBtn.addEventListener("click", () => {
  if (!bioDiv.textContent || bioDiv.textContent.includes("Click")) {
    alert("Generate a bio first!");
    return;
  }

  navigator.clipboard.writeText(bioDiv.textContent);
  alert("Bio copied 📋");
});
