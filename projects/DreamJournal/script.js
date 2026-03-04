class DreamJournal {
  constructor() {
    this.dreams = [];
    this.emotionKeywords = {};
    this.symbols = ["🌙", "⭐", "🌌", "🦋", "🌊", "🏔️", "🌳", "🕊️", "🔮", "✨"];

    this.init();
  }

  async init() {
    await this.loadDreamData();
    this.setupEventListeners();
    this.updateDate();
    this.createFloatingSymbols();
    this.loadDreamsFromStorage();
    this.updateMoonPhase();
    this.startDreamAnimation();
  }

  async loadDreamData() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      this.emotionKeywords = data.emotionKeywords;
      document.title = data.name;
    } catch (error) {
      console.error("Failed to load dream data:", error);
      // Fallback emotion keywords
      this.emotionKeywords = {
        joy: ["happy", "laugh", "smile", "dance", "celebrate"],
        fear: ["scared", "afraid", "run", "hide", "monster"],
        wonder: ["magic", "fly", "discover", "amazing", "beautiful"],
        sadness: ["cry", "alone", "lost", "miss", "gone"],
        excitement: ["adventure", "chase", "race", "win", "explore"],
      };
    }
  }

  setupEventListeners() {
    document.getElementById("analyzeDreamBtn").addEventListener("click", () => {
      this.analyzeDream();
    });

    document.getElementById("dreamInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.analyzeDream();
      }
    });
  }

  updateDate() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    document.getElementById("currentDate").textContent = now.toLocaleDateString(
      "en-US",
      options,
    );
  }

  createFloatingSymbols() {
    const container = document.getElementById("floatingSymbols");
    for (let i = 0; i < 20; i++) {
      const symbol = document.createElement("div");
      symbol.className = "floating-symbol";
      symbol.textContent =
        this.symbols[Math.floor(Math.random() * this.symbols.length)];
      symbol.style.left = Math.random() * 100 + "%";
      symbol.style.animationDelay = Math.random() * 20 + "s";
      symbol.style.animationDuration = 15 + Math.random() * 10 + "s";
      symbol.style.fontSize = 10 + Math.random() * 30 + "px";
      container.appendChild(symbol);
    }
  }

  analyzeDream() {
    const dreamText = document.getElementById("dreamInput").value.trim();
    if (!dreamText) {
      this.showAnalysis("Please share your dream first...", []);
      return;
    }

    // Analyze emotions
    const emotions = this.detectEmotions(dreamText);
    const symbols = this.extractSymbols(dreamText);
    const lucid = this.checkLucid(dreamText);

    // Generate analysis
    const analysis = this.generateAnalysis(dreamText, emotions, symbols, lucid);
    this.showAnalysis(analysis, emotions);

    // Save dream
    this.saveDream(dreamText, emotions, lucid, symbols);

    // Clear input
    document.getElementById("dreamInput").value = "";
  }

  detectEmotions(text) {
    const lowerText = text.toLowerCase();
    const emotions = [];

    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          emotions.push(emotion);
          break;
        }
      }
    }

    return emotions.length ? [...new Set(emotions)] : ["mysterious"];
  }

  extractSymbols(text) {
    const commonSymbols = {
      "water|ocean|sea|river": "🌊",
      "fly|flying|soar": "🕊️",
      "house|home|room": "🏠",
      "tree|forest|woods": "🌳",
      "animal|cat|dog|bird": "🦊",
      "light|sun|shine": "☀️",
      "dark|night|shadow": "🌑",
    };

    const found = [];
    for (const [pattern, symbol] of Object.entries(commonSymbols)) {
      if (new RegExp(pattern, "i").test(text)) {
        found.push(symbol);
      }
    }

    return found;
  }

  checkLucid(text) {
    const lucidKeywords = [
      "know i was dreaming",
      "realized",
      "controlled",
      "conscious",
      "aware",
    ];
    return lucidKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword),
    );
  }

  generateAnalysis(text, emotions, symbols, lucid) {
    const intensity = text.split(" ").length > 50 ? "vivid" : "gentle";
    const timeOfNight =
      new Date().getHours() < 12 ? "early morning" : "late night";

    let analysis = `This feels like a ${intensity} ${timeOfNight} dream. `;

    if (emotions.includes("joy")) {
      analysis += "There's a warmth and lightness to it. ";
    }
    if (emotions.includes("fear")) {
      analysis += "A shadow of unease lingers. ";
    }
    if (emotions.includes("wonder")) {
      analysis += "The dream sparkles with mystery. ";
    }

    if (symbols.length) {
      analysis += `I notice ${symbols.join(" ")} appearing. `;
    }

    if (lucid) {
      analysis +=
        "You were aware you were dreaming - a sign of growing consciousness. ";
    }

    // Dream interpretation
    const interpretations = [
      "Your subconscious is processing recent experiences.",
      "This might reflect your inner desires.",
      "Pay attention to how this dream made you feel upon waking.",
      "The symbols suggest personal meaning unique to you.",
      "Dreams often speak in metaphors - what do these images mean to you?",
    ];

    analysis +=
      interpretations[Math.floor(Math.random() * interpretations.length)];

    return analysis;
  }

  showAnalysis(analysis, emotions) {
    const container = document.getElementById("dreamAnalysis");

    const emotionTags = emotions
      .map(
        (e) =>
          `<span class="emotion-tag" style="background: ${this.getEmotionColor(e)}">${e}</span>`,
      )
      .join("");

    container.innerHTML = `
            <div style="margin-bottom: 1rem">${emotionTags}</div>
            <p style="line-height: 1.8; font-size: 1.1rem">${analysis}</p>
        `;
  }

  getEmotionColor(emotion) {
    const colors = {
      joy: "rgba(255, 215, 0, 0.2)",
      fear: "rgba(75, 0, 130, 0.2)",
      wonder: "rgba(0, 191, 255, 0.2)",
      sadness: "rgba(70, 130, 180, 0.2)",
      excitement: "rgba(255, 69, 0, 0.2)",
      mysterious: "rgba(138, 43, 226, 0.2)",
    };
    return colors[emotion] || "rgba(255,255,255,0.1)";
  }

  saveDream(text, emotions, lucid, symbols) {
    const dream = {
      id: Date.now(),
      text: text,
      emotions: emotions,
      lucid: lucid,
      symbols: symbols,
      date: new Date().toISOString(),
      interpretation: "Stored in the dream library",
    };

    this.dreams.unshift(dream);
    if (this.dreams.length > 10) this.dreams.pop();

    localStorage.setItem("dreams", JSON.stringify(this.dreams));
    this.updateDreamHistory();
    this.updateStats();
  }

  loadDreamsFromStorage() {
    const stored = localStorage.getItem("dreams");
    if (stored) {
      this.dreams = JSON.parse(stored);
      this.updateDreamHistory();
      this.updateStats();
    }
  }

  updateDreamHistory() {
    const container = document.getElementById("dreamCards");

    if (this.dreams.length === 0) {
      container.innerHTML =
        '<p class="analysis-placeholder">No dreams recorded yet...</p>';
      return;
    }

    container.innerHTML = this.dreams
      .map(
        (dream) => `
            <div class="dream-card" onclick="dreamJournal.showDreamDetails(${dream.id})">
                <div class="dream-card-date">${new Date(dream.date).toLocaleDateString()}</div>
                <div class="dream-card-text">${dream.text}</div>
                <div class="dream-card-emotions">
                    ${dream.emotions
                      .map(
                        (e) =>
                          `<span class="emotion-tag" style="background: ${this.getEmotionColor(e)}">${e}</span>`,
                      )
                      .join("")}
                </div>
            </div>
        `,
      )
      .join("");
  }

  showDreamDetails(id) {
    const dream = this.dreams.find((d) => d.id === id);
    if (!dream) return;

    const analysis = document.getElementById("dreamAnalysis");
    analysis.innerHTML = `
            <div style="margin-bottom: 1rem">
                ${dream.emotions
                  .map(
                    (e) =>
                      `<span class="emotion-tag" style="background: ${this.getEmotionColor(e)}">${e}</span>`,
                  )
                  .join("")}
                ${dream.lucid ? '<span class="emotion-tag" style="background: rgba(255,215,0,0.2)">✨ lucid</span>' : ""}
            </div>
            <p style="line-height: 1.8; font-size: 1rem; color: rgba(255,255,255,0.8)">
                ${dream.text}
            </p>
            <p style="margin-top: 1rem; font-style: italic; color: rgba(255,255,255,0.5)">
                ${new Date(dream.date).toLocaleString()}
            </p>
        `;
  }

  updateStats() {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const weeklyDreams = this.dreams.filter(
      (d) => new Date(d.date) > weekAgo,
    ).length;
    document.getElementById("weeklyCount").textContent = weeklyDreams;

    const lucidCount = this.dreams.filter((d) => d.lucid).length;
    document.getElementById("lucidCount").textContent = lucidCount;

    // Find top emotion
    const emotionCount = {};
    this.dreams.forEach((d) => {
      d.emotions.forEach((e) => {
        emotionCount[e] = (emotionCount[e] || 0) + 1;
      });
    });

    const topEmotion = Object.entries(emotionCount).sort(
      (a, b) => b[1] - a[1],
    )[0];
    document.getElementById("topEmotion").textContent = topEmotion
      ? topEmotion[0]
      : "✨";
  }

  updateMoonPhase() {
    const moon = document.getElementById("moonPhase");
    const date = new Date();
    const phase = (date.getDate() / 29.53) * 100; // Simplified moon phase

    moon.style.boxShadow = `0 0 ${30 + phase}px #f1c40f`;
  }

  startDreamAnimation() {
    setInterval(() => {
      this.updateMoonPhase();
    }, 60000);
  }
}

// Initialize
const dreamJournal = new DreamJournal();
