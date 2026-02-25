
    // ===============================
    // DATA
    // ===============================
    const emojis = ["😎", "🌸", "✨", "🏀", "🎨", "☕", "🥀", "💡", "🔥", "🖤", "🌙", "⚡", "🎭", "🦋", "🌊", "📚", "🎵", "🌺", "🎬", "🌿"];
    const hobbies = [
      "coffee lover",
      "gamer",
      "anime fan",
      "artist",
      "bookworm",
      "traveller",
      "foodie",
      "music lover",
      "fitness enthusiast",
      "plant parent",
      "photographer",
      "writer",
      "movie buff",
      "nature lover",
      "adventure seeker"
    ];
    const vibes = [
      "dreamer",
      "chill",
      "creative",
      "ambitious",
      "free spirit",
      "night owl",
      "morning person",
      "optimist",
      "wanderer",
      "passionate",
      "curious",
      "minimalist",
      "spontaneous",
      "peaceful",
      "energetic"
    ];
    const phrases = [
      "living my best life",
      "enjoying the journey",
      "making memories",
      "chasing dreams",
      "staying positive",
      "finding beauty everywhere",
      "growing every day",
      "creating my story",
      "exploring the world",
      "embracing change",
      "loving life",
      "seeking adventure",
      "being authentic",
      "living in the moment",
      "following my passion"
    ];

    // ===============================
    // ELEMENTS
    // ===============================
    const bioDiv = document.getElementById("bio");
    const generateBtn = document.getElementById("generate");
    const copyBtn = document.getElementById("copy");
    const toggleThemeBtn = document.getElementById("toggleTheme");
    const themeIcon = document.getElementById("themeIcon");
    const themeText = document.getElementById("themeText");

    // ===============================
    // THEME MANAGEMENT
    // ===============================
    let isDark = false;

    toggleThemeBtn.addEventListener("click", () => {
      isDark = !isDark;
      
      if (isDark) {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
        themeIcon.textContent = "☀️";
        themeText.textContent = "light mode";
      } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
        themeIcon.textContent = "🌙";
        themeText.textContent = "dark mode";
      }
    });

    // ===============================
    // BIO GENERATION
    // ===============================
    function generateBio() {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const hobby = hobbies[Math.floor(Math.random() * hobbies.length)];
      const vibe = vibes[Math.floor(Math.random() * vibes.length)];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];

      return `${emoji} ${hobby} | ${vibe} | ${phrase}`;
    }

    // Generate initial bio on load
    bioDiv.textContent = generateBio();

    // ===============================
    // EVENTS
    // ===============================
    generateBtn.addEventListener("click", () => {
      bioDiv.style.opacity = "0";
      bioDiv.style.transform = "scale(0.8) rotate(-5deg)";

      setTimeout(() => {
        bioDiv.textContent = generateBio();
        bioDiv.style.opacity = "1";
        bioDiv.style.transform = "scale(1) rotate(1deg)";
      }, 200);
    });

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(bioDiv.textContent);
      
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = "✓ got it";
      copyBtn.style.transform = "scale(1.1) rotate(-3deg)";
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.transform = "";
      }, 2000);
    });
  