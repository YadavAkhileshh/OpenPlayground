// Memory Match Game Logic
class MemoryGame {
  constructor() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.timer = 0;
    this.timerInterval = null;
    this.isProcessing = false;
    this.difficulty = "easy";

    // Card symbols - mystical theme
    this.symbols = [
      "🌙",
      "⭐",
      "🔮",
      "✨",
      "🦋",
      "🌸",
      "🍄",
      "🌿",
      "🐉",
      "🦄",
      "👑",
      "💎",
      "🔥",
      "",
      "🌊",
      "🌈",
      "🎭",
      "",
      "🎪",
      "🎯",
    ];
  }

  init(difficulty = "easy") {
    this.difficulty = difficulty;
    this.reset();

    // Set number of pairs based on difficulty
    const pairCounts = {
      easy: 6,
      medium: 8,
      hard: 10,
    };

    const pairsCount = pairCounts[difficulty];
    this.createCardDeck(pairsCount);
  }

  createCardDeck(pairsCount) {
    this.cards = [];
    const selectedSymbols = this.symbols.slice(0, pairsCount);

    // Create pairs
    selectedSymbols.forEach((symbol) => {
      this.cards.push({ symbol, matched: false });
      this.cards.push({ symbol, matched: false });
    });

    // Shuffle cards
    this.shuffle(this.cards);
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  flipCard(index) {
    if (this.isProcessing) return false;
    if (this.flippedCards.length >= 2) return false;
    if (this.flippedCards.includes(index)) return false;
    if (this.cards[index].matched) return false;

    this.flippedCards.push(index);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkMatch();
    }

    return true;
  }

  checkMatch() {
    this.isProcessing = true;

    const [index1, index2] = this.flippedCards;
    const card1 = this.cards[index1];
    const card2 = this.cards[index2];

    if (card1.symbol === card2.symbol) {
      // Match found
      setTimeout(() => {
        card1.matched = true;
        card2.matched = true;
        this.matchedPairs++;
        this.flippedCards = [];
        this.isProcessing = false;

        // Trigger match callback
        if (this.onMatch) {
          this.onMatch(index1, index2);
        }

        // Check win condition
        if (this.matchedPairs === this.cards.length / 2) {
          this.win();
        }
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        this.flippedCards = [];
        this.isProcessing = false;

        // Trigger no match callback
        if (this.onNoMatch) {
          this.onNoMatch(index1, index2);
        }
      }, 1000);
    }
  }

  startTimer() {
    if (this.timerInterval) return;

    this.timerInterval = setInterval(() => {
      this.timer++;
      if (this.onTimerUpdate) {
        this.onTimerUpdate(this.timer);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getFormattedTime() {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  reset() {
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.timer = 0;
    this.isProcessing = false;
    this.stopTimer();
  }

  win() {
    this.stopTimer();
    if (this.onWin) {
      this.onWin({
        moves: this.moves,
        time: this.timer,
        formattedTime: this.getFormattedTime(),
      });
    }
  }

  // Callback setters
  setOnMatch(callback) {
    this.onMatch = callback;
  }

  setOnNoMatch(callback) {
    this.onNoMatch = callback;
  }

  setOnTimerUpdate(callback) {
    this.onTimerUpdate = callback;
  }

  setOnWin(callback) {
    this.onWin = callback;
  }
}

// Particle System for visual effects
class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
  }

  createFloatingParticles(count = 30) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 15 + "s";
      particle.style.animationDuration = Math.random() * 10 + 10 + "s";
      this.container.appendChild(particle);
    }
  }

  createSparkles(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      sparkle.style.left = x + "px";
      sparkle.style.top = y + "px";
      sparkle.style.animationDelay = i * 0.05 + "s";

      const angle = (Math.PI * 2 * i) / count;
      const distance = 30 + Math.random() * 30;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      sparkle.style.setProperty("--tx", tx + "px");
      sparkle.style.setProperty("--ty", ty + "px");

      document.body.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 1000);
    }
  }

  createBurst(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "burst-particle";
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.animationDelay = i * 0.03 + "s";

      const angle = (Math.PI * 2 * i) / count;
      const tx = Math.cos(angle) * 100;
      const ty = Math.sin(angle) * 100;

      particle.style.setProperty("--tx", tx + "px");
      particle.style.setProperty("--ty", ty + "px");

      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 1000);
    }
  }
}
