class MoodPoet {
  constructor() {
    this.moodOrb = document.getElementById("moodOrb");
    this.poemContent = document.getElementById("poemContent");
    this.poemAuthor = document.getElementById("poemAuthor");
    this.particleField = document.getElementById("particleField");
    this.poems = {};

    this.init();
  }

  async init() {
    await this.loadPoems();
    this.setupEventListeners();
    this.createParticles();
    this.setMood("cosmic"); // default mood
  }

  async loadPoems() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      this.poems = data.poems;
      this.updateBackgroundGradient(data.themeColors);
    } catch (error) {
      console.error("Failed to load poems:", error);
    }
  }

  setupEventListeners() {
    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const mood = e.target.dataset.mood;
        this.setMood(mood);
        this.createRipple(e);
      });
    });
  }

  setMood(mood) {
    const poem = this.poems[mood];
    if (!poem) return;

    // Update poem content with animation
    this.poemContent.style.opacity = "0";
    setTimeout(() => {
      this.poemContent.innerHTML = poem.lines
        .map((line) => `<p class="poem-line">${line}</p>`)
        .join("");
      this.poemAuthor.textContent = `— ${poem.author}`;
      this.poemContent.style.opacity = "1";
    }, 300);

    // Update mood orb color
    this.moodOrb.style.background = `radial-gradient(circle at 30% 30%, ${poem.color}, ${poem.darkColor})`;

    // Update body gradient
    document.body.style.background = `radial-gradient(circle at 50% 50%, ${poem.darkColor}20, #0a0a0a)`;

    // Trigger particle color change
    this.updateParticles(poem.color);
  }

  createParticles() {
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.width = Math.random() * 3 + 1 + "px";
      particle.style.height = particle.style.width;
      particle.style.animationDuration = Math.random() * 10 + 10 + "s";
      particle.style.animationDelay = Math.random() * -20 + "s";
      this.particleField.appendChild(particle);
    }
  }

  updateParticles(color) {
    document.querySelectorAll(".particle").forEach((p) => {
      p.style.background = color;
      p.style.boxShadow = `0 0 10px ${color}`;
    });
  }

  createRipple(e) {
    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.width = "10px";
    ripple.style.height = "10px";
    ripple.style.background = "rgba(255,255,255,0.5)";
    ripple.style.borderRadius = "50%";
    ripple.style.left = e.clientX - btn.offsetLeft + "px";
    ripple.style.top = e.clientY - btn.offsetTop + "px";
    ripple.style.transform = "scale(0)";
    ripple.style.transition = "all 1s";
    ripple.style.pointerEvents = "none";

    btn.appendChild(ripple);

    setTimeout(() => {
      ripple.style.transform = "scale(30)";
      ripple.style.opacity = "0";
    }, 10);

    setTimeout(() => ripple.remove(), 1000);
  }

  updateBackgroundGradient(colors) {
    // Dynamic gradient update based on time
    setInterval(() => {
      const hour = new Date().getHours();
      if (hour < 6 || hour > 18) {
        document.body.style.background =
          "linear-gradient(145deg, #0a0a1a, #1a1a2e)";
      }
    }, 60000);
  }
}

// Initialize the poet
new MoodPoet();
