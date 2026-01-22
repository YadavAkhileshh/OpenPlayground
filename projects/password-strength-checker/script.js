/**
 * GuardiX Enterprise Password Security Suite
 * Version: 2.1.0-Enterprise
 * Description: Advanced cryptographic password generation and security analytics engine.
 */

(function () {
  'use strict';

  /**
   * @constant {Object} CONFIG - Global configuration for the security suite
   */
  const CONFIG = {
    CHARSETS: {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      similar: 'iIl1Lo0O'
    },
    DICEWARE: [
      "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
      "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
      "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
      "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
      "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
      "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
      "always", "amaze", "ambush", "amount", "amuse", "analysis", "anchor", "ancient", "anger", "angle",
      "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique", "anxiety",
      "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic", "area",
      "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest", "arrive",
      "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset", "assist",
      "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction", "audit",
      "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake", "aware",
      "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge", "bag",
      "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain", "barrel",
      "base", "basic", "basket", "battle", "beach", "beam", "bean", "beauty", "because", "become",
      "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit",
      "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology",
      "bird", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless",
      "blind", "blood", "blossom", "blue", "blur", "blush", "board", "boat", "body", "boil",
      "bomb", "bone", "bonus", "book", "boost", "border", "boring", "borrow", "boss", "bottom",
      "bounce", "box", "boy", "bracket", "brain", "brand", "brass", "brave", "bread", "breeze",
      "brick", "bridge", "brief", "bright", "bring", "brisk", "broad", "bronze", "broom", "brother",
      "brown", "brush", "bubble", "buddy", "budget", "buffalo", "build", "bulb", "bulk", "bullet"
      // ... expanded in full implementation ...
    ],
    ENCRYPTION_KEY: 'guardix-session-key',
    TOAST_DURATION: 3000
  };

  /**
   * @class CryptoService
   * @description Provides cryptographically secure random values and algorithms.
   */
  class CryptoService {
    /**
     * Generates a cryptographically secure random number between 0 and max.
     * @param {number} max - The upper bound (exclusive).
     * @returns {number}
     */
    static getRandomInt(max) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] % max;
    }

    /**
     * Shuffles an array using the Durstenfeld shuffle algorithm with CS random.
     * @param {Array} array 
     * @returns {Array}
     */
    static shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = this.getRandomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    /**
     * Standard CSPRNG password generation.
     * @param {Object} options 
     * @returns {string}
     */
    static generateCSPRNG(options) {
      const { length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar } = options;

      let charset = '';
      let mandatory = [];

      if (includeUpper) {
        let pool = CONFIG.CHARSETS.uppercase;
        if (excludeSimilar) pool = pool.replace(/[I L O]/g, '');
        charset += pool;
        mandatory.push(pool[this.getRandomInt(pool.length)]);
      }
      if (includeLower) {
        let pool = CONFIG.CHARSETS.lowercase;
        if (excludeSimilar) pool = pool.replace(/[i l o]/g, '');
        charset += pool;
        mandatory.push(pool[this.getRandomInt(pool.length)]);
      }
      if (includeNumbers) {
        let pool = CONFIG.CHARSETS.numbers;
        if (excludeSimilar) pool = pool.replace(/[1 0]/g, '');
        charset += pool;
        mandatory.push(pool[this.getRandomInt(pool.length)]);
      }
      if (includeSymbols) {
        charset += CONFIG.CHARSETS.symbols;
        mandatory.push(CONFIG.CHARSETS.symbols[this.getRandomInt(CONFIG.CHARSETS.symbols.length)]);
      }

      if (charset.length === 0) return 'Error_No_Charset';

      let password = [...mandatory];
      for (let i = password.length; i < length; i++) {
        password.push(charset[this.getRandomInt(charset.length)]);
      }

      return this.shuffle(password).join('');
    }

    /**
     * Generates a password using the Diceware algorithm.
     * @param {number} length - Number of words.
     * @returns {string}
     */
    static generateDiceware(length) {
      let words = [];
      const wordCount = Math.max(3, Math.floor(length / 4));
      for (let i = 0; i < wordCount; i++) {
        words.push(CONFIG.DICEWARE[this.getRandomInt(CONFIG.DICEWARE.length)]);
      }
      return words.join('-').substring(0, length);
    }

    /**
     * Generates a phonetic (pronounceable) password.
     * @param {number} length 
     * @returns {string}
     */
    static generatePhonetic(length) {
      const vowels = 'aeiou';
      const consonants = 'bcdfghjklmnpqrstvwxyz';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += (i % 2 === 0)
          ? consonants[this.getRandomInt(consonants.length)]
          : vowels[this.getRandomInt(vowels.length)];
      }
      return password;
    }
  }

  /**
   * @class AnalyzerEngine
   * @description Performs security analysis on strings.
   */
  class AnalyzerEngine {
    /**
     * Calculates the entropy of a password.
     * @param {string} password 
     * @returns {number}
     */
    static calculateEntropy(password) {
      if (!password) return 0;
      let poolSize = 0;
      if (/[a-z]/.test(password)) poolSize += 26;
      if (/[A-Z]/.test(password)) poolSize += 26;
      if (/[0-9]/.test(password)) poolSize += 10;
      if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;

      if (poolSize === 0) return 0;
      return Math.floor(password.length * Math.log2(poolSize));
    }

    /**
     * Estimates crack time based on brute force capability.
     * @param {number} entropy 
     * @returns {string}
     */
    static estimateCrackTime(entropy) {
      // Assumed 10 billion guesses per second
      const seconds = Math.pow(2, entropy) / 1e10;

      if (seconds < 1) return "Instant";
      if (seconds < 60) return `${Math.floor(seconds)} seconds`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
      if (seconds < 31536000) return `${Math.floor(seconds / 86400)} days`;
      if (seconds < 3153600000) return `${Math.floor(seconds / 31536000)} years`;
      return "Centuries";
    }

    /**
     * Runs a full security audit on a password.
     * @param {string} password 
     * @returns {Object}
     */
    static audit(password) {
      return {
        length: password.length >= 12,
        mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password),
        leaked: false // Simulation: checking against breach DB
      };
    }
  }

  /**
   * @class HistoryManager
   * @description Handles local persistent storage for generated passwords.
   */
  class HistoryManager {
    constructor() {
      this.history = JSON.parse(sessionStorage.getItem('guardix_history') || '[]');
    }

    /**
     * Adds a password to history.
     * @param {string} password 
     */
    add(password) {
      const entry = {
        id: Date.now(),
        value: password,
        timestamp: new Date().toLocaleTimeString(),
        entropy: AnalyzerEngine.calculateEntropy(password)
      };
      this.history.unshift(entry);
      if (this.history.length > 50) this.history.pop();
      this.save();
      return entry;
    }

    clear() {
      this.history = [];
      this.save();
    }

    save() {
      sessionStorage.setItem('guardix_history', JSON.stringify(this.history));
    }
  }

  /**
   * @class UIController
   * @description Manages all DOM interactions and application state.
   */
  class UIController {
    constructor() {
      this.history = new HistoryManager();
      this.initializeElements();
      this.attachEventListeners();
      this.updateAnalyzerDisplay("");
      this.renderHistory();
    }

    initializeElements() {
      // Tabs
      this.tabBtns = document.querySelectorAll('.tab-btn');
      this.tabContents = document.querySelectorAll('.tab-content');

      // Generator Inputs
      this.genInput = document.getElementById('generated-password');
      this.lengthSlider = document.getElementById('pass-length');
      this.lengthValDisplay = document.getElementById('length-val');
      this.genMethod = document.getElementById('gen-method');

      // Checkboxes
      this.includeUpper = document.getElementById('include-upper');
      this.includeLower = document.getElementById('include-lower');
      this.includeNumbers = document.getElementById('include-numbers');
      this.includeSymbols = document.getElementById('include-symbols');
      this.excludeSimilar = document.getElementById('exclude-similar');

      // Analyzer Inputs
      this.checkInput = document.getElementById('check-password');
      this.visibilityBtn = document.getElementById('toggle-visibility');

      // Displays
      this.entropyCircle = document.getElementById('entropy-circle');
      this.entropyVal = document.getElementById('metric-entropy');
      this.crackTimeVal = document.getElementById('metric-crack-time');
      this.auditItems = document.querySelectorAll('.audit-item');
      this.historyContainer = document.getElementById('history-container');

      // Buttons
      this.masterGenBtn = document.getElementById('master-gen-btn');
      this.syncGenBtn = document.getElementById('sync-gen-btn');
      this.copyBtn = document.getElementById('copy-btn');
      this.clearHistBtn = document.getElementById('clear-history');
    }

    attachEventListeners() {
      // Tab Switching
      this.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
      });

      // Length Slider Update
      this.lengthSlider.addEventListener('input', (e) => {
        this.lengthValDisplay.textContent = e.target.value;
      });

      // Generation
      this.masterGenBtn.addEventListener('click', () => this.generateAndDisplay());
      this.syncGenBtn.addEventListener('click', () => this.generateAndDisplay());

      // Copy to Clipboard
      this.copyBtn.addEventListener('click', () => this.copyToClipboard());

      // Analyzer Realtime Check
      this.checkInput.addEventListener('input', (e) => this.updateAnalyzerDisplay(e.target.value));

      // Visibility Toggle
      this.visibilityBtn.addEventListener('click', () => {
        const isPass = this.checkInput.type === 'password';
        this.checkInput.type = isPass ? 'text' : 'password';
        this.visibilityBtn.innerHTML = isPass ? '<i class="ri-eye-off-line"></i>' : '<i class="ri-eye-line"></i>';
      });

      // Clear History
      this.clearHistBtn.addEventListener('click', () => {
        this.history.clear();
        this.renderHistory();
        this.showToast("History cleared successfully", "success");
      });

      // Advanced Settings Toggle
      document.getElementById('toggle-algo-settings').addEventListener('click', () => {
        document.getElementById('algo-settings').classList.toggle('hidden');
      });
    }

    switchTab(tabId) {
      this.tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
      this.tabContents.forEach(content => content.classList.toggle('active', content.id === `tab-${tabId}`));
    }

    generateAndDisplay() {
      const options = {
        length: parseInt(this.lengthSlider.value),
        includeUpper: this.includeUpper.checked,
        includeLower: this.includeLower.checked,
        includeNumbers: this.includeNumbers.checked,
        includeSymbols: this.includeSymbols.checked,
        excludeSimilar: this.excludeSimilar.checked,
        method: this.genMethod.value
      };

      let password = '';
      switch (options.method) {
        case 'diceware': password = CryptoService.generateDiceware(options.length); break;
        case 'phonetic': password = CryptoService.generatePhonetic(options.length); break;
        default: password = CryptoService.generateCSPRNG(options);
      }

      this.genInput.value = password;
      const entropy = AnalyzerEngine.calculateEntropy(password);

      // Visual feedback
      const miniBar = document.getElementById('entropy-lvl');
      miniBar.className = '';
      if (entropy < 40) miniBar.classList.add('lvl-low');
      else if (entropy < 65) miniBar.classList.add('lvl-mid');
      else miniBar.classList.add('lvl-high');
      miniBar.style.width = `${Math.min(100, (entropy / 128) * 100)}%`;

      this.history.add(password);
      this.renderHistory();
      this.showToast("Secure password generated", "primary");
    }

    updateAnalyzerDisplay(password) {
      const entropy = AnalyzerEngine.calculateEntropy(password);
      const audit = AnalyzerEngine.audit(password);

      // Update Circle
      const percent = Math.min(100, (entropy / 128) * 100);
      this.entropyCircle.style.strokeDasharray = `${percent}, 100`;
      this.entropyCircle.style.stroke = entropy < 40 ? 'var(--danger)' : entropy < 65 ? 'var(--accent)' : 'var(--primary)';

      this.entropyVal.textContent = entropy;
      this.crackTimeVal.textContent = AnalyzerEngine.estimateCrackTime(entropy);

      // Update Audit Checklist
      this.auditItems.forEach(item => {
        const rule = item.dataset.rule;
        if (audit[rule]) {
          item.classList.add('valid');
          item.querySelector('i').className = 'ri-checkbox-circle-line';
        } else {
          item.classList.remove('valid');
          item.querySelector('i').className = 'ri-close-circle-line';
        }
      });
    }

    copyToClipboard() {
      if (!this.genInput.value) return;
      navigator.clipboard.writeText(this.genInput.value);
      this.showToast("Copied to clipboard!", "success");

      // Internal Animation
      this.copyBtn.innerHTML = '<i class="ri-check-line"></i>';
      setTimeout(() => this.copyBtn.innerHTML = '<i class="ri-clipboard-line"></i>', 2000);
    }

    showToast(message, type) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      const icon = type === 'success' ? 'ri-checkbox-circle-line' : 'ri-shield-flash-line';
      toast.innerHTML = `<i class="${icon}"></i> ${message}`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
      }, CONFIG.TOAST_DURATION);
    }

    renderHistory() {
      if (this.history.history.length === 0) {
        this.historyContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="ri-history-line"></i>
                        <p>No passwords generated yet</p>
                    </div>`;
        return;
      }

      this.historyContainer.innerHTML = this.history.history.map(item => `
                <div class="history-item animated-in">
                    <div class="hist-main">
                        <span class="hist-pass">${this.maskPassword(item.value)}</span>
                        <span class="hist-meta">${item.timestamp} • ${item.entropy} bits</span>
                    </div>
                    <button class="btn-icon" data-id="${item.id}" onclick="navigator.clipboard.writeText('${item.value}')"><i class="ri-file-copy-line"></i></button>
                </div>
            `).join('');
    }

    maskPassword(pass) {
      if (pass.length <= 4) return "****";
      return pass.substring(0, 2) + "•".repeat(pass.length - 4) + pass.slice(-2);
    }
  }

  // Initialize the Suite
  document.addEventListener('DOMContentLoaded', () => {
    window.GuardiX = new UIController();
    console.log("%c GuardiX Enterprise Suite Initialized ", "background: #10b981; color: white; font-weight: bold;");
  });

})();

