class WordDetective {
  constructor() {
    this.wordBank = [
      {
        word: "MYSTERY",
        clue: "Something unexplained or unknown",
        difficulty: "ROOKIE",
      },
      {
        word: "CLUE",
        clue: "Evidence that helps solve a puzzle",
        difficulty: "ROOKIE",
      },
      {
        word: "EVIDENCE",
        clue: "Proof used in investigation",
        difficulty: "DETECTIVE",
      },
      {
        word: "SLEUTH",
        clue: "Another word for detective",
        difficulty: "DETECTIVE",
      },
      {
        word: "CIPHER",
        clue: "A secret or disguised way of writing",
        difficulty: "EXPERT",
      },
      {
        word: "FORENSIC",
        clue: "Scientific analysis of crime evidence",
        difficulty: "EXPERT",
      },
    ];
    this.currentCase = null;
    this.selectedLetters = [];
    this.foundWords = [];
    this.stats = { solved: 0, attempts: 0, streak: 0 };
    this.hintsLeft = 3;
  }
  newCase() {
    this.currentCase =
      this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
    this.selectedLetters = [];
    this.foundWords = [];
    this.generateGrid();
    return this.currentCase;
  }
  generateGrid() {
    const word = this.currentCase.word;
    const letters = word.split("");
    const extraLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    this.grid = [...letters];
    while (this.grid.length < 25) {
      const randomLetter =
        extraLetters[Math.floor(Math.random() * extraLetters.length)];
      this.grid.push(randomLetter);
    }
    this.grid.sort(() => Math.random() - 0.5);
  }
  selectLetter(index) {
    if (!this.selectedLetters.includes(index)) {
      this.selectedLetters.push(index);
      return true;
    }
    return false;
  }
  clearSelection() {
    this.selectedLetters = [];
  }
  getSelectedWord() {
    return this.selectedLetters.map((i) => this.grid[i]).join("");
  }
  submitWord() {
    const word = this.getSelectedWord();
    this.stats.attempts++;
    if (word === this.currentCase.word) {
      this.foundWords.push(word);
      this.stats.solved++;
      this.stats.streak++;
      return { success: true, word };
    }
    this.stats.streak = 0;
    return { success: false };
  }
  getHint() {
    if (
      this.hintsLeft > 0 &&
      this.selectedLetters.length < this.currentCase.word.length
    ) {
      this.hintsLeft--;
      const wordLetters = this.currentCase.word.split("");
      for (let i = 0; i < this.grid.length; i++) {
        if (
          wordLetters.includes(this.grid[i]) &&
          !this.selectedLetters.includes(i)
        ) {
          return i;
        }
      }
    }
    return null;
  }
}
