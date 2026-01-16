// All bio categories
const bios = {
  motivational: [
    "Dream big. Work hard. Stay focused 💪",
    "Turning goals into reality ✨",
    "Hustle until your haters ask if you’re hiring"
  ],
  funny: [
    "I put the pro in procrastinate 😎",
    "Life is short. Smile while you still have teeth 😁",
    "Probably eating right now 🍕"
  ],
  professional: [
    "Building ideas into reality",
    "Focused. Driven. Professional.",
    "Helping brands grow digitally 🚀"
  ],
  aesthetic: [
    "Lost in my own vibe",
    "Chasing sunsets & good energy",
    "Minimal mind. Maximum dreams"
  ],
  attitude: [
    "I don’t chase, I attract",
    "Born to stand out, not fit in",
    "Silent moves, loud results"
  ]
};

// Emojis to append
const emojis = ["✨", "🔥", "💫", "😎", "🌙", "👑", "🎧", "💖"];

// Generate random bio
function generateBio() {
  const category = document.getElementById("category").value;
  const bio = bios[category][Math.floor(Math.random() * bios[category].length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  document.getElementById("bioOutput").innerText = `${bio} ${emoji}`;
}

// Copy bio to clipboard
function copyBio() {
  const bioText = document.getElementById("bioOutput").innerText;
  if (!bioText) return alert("Generate a bio first!");
  navigator.clipboard.writeText(bioText).then(() => {
    alert("Bio copied to clipboard!");
  });
}

// Toggle dark/light mode
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

// Save bio to list
function saveBio() {
  const bioText = document.getElementById("bioOutput").innerText;
  if (!bioText) return alert("Generate a bio first!");
  const li = document.createElement("li");
  li.innerText = bioText;
  document.getElementById("savedBios").appendChild(li);
}
