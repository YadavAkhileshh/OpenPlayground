/**
 * Palette Lab - Accessible Color Palette Builder
 * @version 3.0.0
 * @license MIT
 */

// ============================================
// CONSTANTS
// ============================================

const CONFIG = Object.freeze({
  MIN_COLORS: 2,
  MAX_COLORS: 12,
  DEFAULT_COLOR_COUNT: 6,
  HISTORY_LIMIT: 50,
  DEBOUNCE_MS: 150,
  TOAST_DURATION_MS: 3000,

  WCAG: Object.freeze({
    AA_NORMAL: 4.5,
    AA_LARGE: 3,
    AAA_NORMAL: 7,
    AAA_LARGE: 4.5
  }),

  STORAGE_KEY: "palette-lab-state"
});

const HARMONY_ANGLES = Object.freeze({
  complementary: [180],
  "split-complementary": [150, 210],
  triadic: [120, 240],
  tetradic: [90, 180, 270],
  analogous: [-30, 30]
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
  /**
   * Generate a unique ID
   * @returns {string}
   */
  generateId() {
    return `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  },

  /**
   * Clamp a number between min and max
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Generate random number in range
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  /**
   * Debounce function execution
   * @param {Function} fn
   * @param {number} ms
   * @returns {Function}
   */
  debounce(fn, ms) {
    let timeoutId;
    const debounced = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), ms);
    };
    debounced.cancel = () => clearTimeout(timeoutId);
    return debounced;
  },

  /**
   * Deep clone an object (handles Sets and Maps)
   * @param {*} obj
   * @returns {*}
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Set) {
      return new Set([...obj].map((item) => this.deepClone(item)));
    }

    if (obj instanceof Map) {
      return new Map(
        [...obj].map(([k, v]) => [this.deepClone(k), this.deepClone(v)])
      );
    }

    if (obj instanceof Date) {
      return new Date(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepClone(item));
    }

    const cloned = {};
    for (const key of Object.keys(obj)) {
      cloned[key] = this.deepClone(obj[key]);
    }
    return cloned;
  },

  /**
   * Escape HTML entities
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return str.replace(/[&<>"']/g, (char) => escapeMap[char]);
  },

  /**
   * Validate hex color
   * @param {string} hex
   * @returns {boolean}
   */
  isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  },

  /**
   * Safe query selector
   * @param {string} selector
   * @param {Element} [context=document]
   * @returns {Element|null}
   */
  $(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch {
      console.warn(`Invalid selector: ${selector}`);
      return null;
    }
  },

  /**
   * Safe query selector all
   * @param {string} selector
   * @param {Element} [context=document]
   * @returns {Element[]}
   */
  $$(selector, context = document) {
    try {
      return Array.from(context.querySelectorAll(selector));
    } catch {
      console.warn(`Invalid selector: ${selector}`);
      return [];
    }
  }
};

// ============================================
// COLOR CONVERTER MODULE
// ============================================

const ColorConverter = {
  /**
   * Convert hex to RGB
   * @param {string} hex
   * @returns {RGB|null}
   */
  hexToRgb(hex) {
    if (!Utils.isValidHex(hex)) {
      return null;
    }

    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  },

  /**
   * Convert RGB to hex
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {string}
   */
  rgbToHex(r, g, b) {
    const toHex = (n) => {
      const clamped = Utils.clamp(Math.round(n), 0, 255);
      return clamped.toString(16).padStart(2, "0");
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  },

  /**
   * Convert hex to HSL
   * @param {string} hex
   * @returns {HSL|null}
   */
  hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
      return { h: 0, s: 0, l: Math.round(l * 100) };
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h;
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  },

  /**
   * Convert HSL to hex
   * @param {HSL} hsl
   * @returns {string}
   */
  hslToHex(hsl) {
    const h = ((hsl.h % 360) + 360) % 360;
    const s = Utils.clamp(hsl.s, 0, 100) / 100;
    const l = Utils.clamp(hsl.l, 0, 100) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r, g, b;

    if (h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return this.rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  },

  /**
   * Get all formats for an HSL color
   * @param {HSL} hsl
   * @returns {ColorFormats}
   */
  getFormats(hsl) {
    const hex = this.hslToHex(hsl);
    const rgb = this.hexToRgb(hex);

    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(
        hsl.l
      )}%)`
    };
  },

  /**
   * Get relative luminance
   * @param {string} hex
   * @returns {number}
   */
  getLuminance(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  /**
   * Get contrast ratio between two colors
   * @param {string} hex1
   * @param {string} hex2
   * @returns {number}
   */
  getContrastRatio(hex1, hex2) {
    const lum1 = this.getLuminance(hex1);
    const lum2 = this.getLuminance(hex2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Get contrasting text color for background
   * @param {string} bgHex
   * @returns {string}
   */
  getContrastingText(bgHex) {
    return this.getLuminance(bgHex) > 0.179 ? "#000000" : "#FFFFFF";
  }
};

// ============================================
// COLOR GENERATOR MODULE
// ============================================

const ColorGenerator = {
  /**
   * Generate palette based on mode
   * @param {string} mode
   * @param {string} baseHex
   * @param {number} count
   * @returns {HSL[]}
   */
  generate(mode, baseHex, count) {
    const base = ColorConverter.hexToHsl(baseHex);
    if (!base) {
      return this.random(count);
    }

    switch (mode) {
      case "monochromatic":
        return this.monochromatic(base, count);
      case "analogous":
        return this.harmonious(base, count, HARMONY_ANGLES.analogous, 15);
      case "complementary":
        return this.harmonious(base, count, HARMONY_ANGLES.complementary, 10);
      case "split-complementary":
        return this.harmonious(
          base,
          count,
          HARMONY_ANGLES["split-complementary"],
          10
        );
      case "triadic":
        return this.harmonious(base, count, HARMONY_ANGLES.triadic, 8);
      case "tetradic":
        return this.harmonious(base, count, HARMONY_ANGLES.tetradic, 8);
      default:
        return this.random(count);
    }
  },

  /**
   * Generate monochromatic palette
   * @param {HSL} base
   * @param {number} count
   * @returns {HSL[]}
   */
  monochromatic(base, count) {
    const colors = [];
    const lightnessRange = { min: 15, max: 90 };
    const step =
      (lightnessRange.max - lightnessRange.min) / Math.max(count - 1, 1);

    for (let i = 0; i < count; i++) {
      colors.push({
        h: base.h,
        s: Utils.clamp(base.s + Utils.random(-5, 5), 20, 100),
        l: Utils.clamp(lightnessRange.min + step * i, 10, 95)
      });
    }

    return colors;
  },

  /**
   * Generate harmonious palette from angles
   * @param {HSL} base
   * @param {number} count
   * @param {number[]} angles
   * @param {number} variance
   * @returns {HSL[]}
   */
  harmonious(base, count, angles, variance) {
    const hues = [base.h, ...angles.map((a) => (base.h + a + 360) % 360)];
    const colors = [];

    for (let i = 0; i < count; i++) {
      const hue = hues[i % hues.length];
      colors.push({
        h: (hue + Utils.random(-variance, variance) + 360) % 360,
        s: Utils.clamp(base.s + Utils.random(-15, 15), 25, 100),
        l: Utils.clamp(20 + i * (65 / Math.max(count - 1, 1)), 15, 90)
      });
    }

    return colors;
  },

  /**
   * Generate random harmonious palette
   * @param {number} count
   * @returns {HSL[]}
   */
  random(count) {
    const colors = [];
    const baseHue = Utils.random(0, 360);
    const goldenRatio = 0.618033988749895;
    let hue = baseHue;

    for (let i = 0; i < count; i++) {
      hue = (hue + goldenRatio * 360) % 360;
      colors.push({
        h: hue,
        s: Utils.random(50, 85),
        l: Utils.random(35, 65)
      });
    }

    return colors.sort((a, b) => a.l - b.l);
  },

  /**
   * Apply tone to color
   * @param {HSL} color
   * @param {string} tone
   * @returns {HSL}
   */
  applyTone(color, tone) {
    const adjusted = { ...color };

    const toneAdjustments = {
      vibrant: () => {
        adjusted.s = Utils.clamp(color.s * 1.1, 55, 100);
        adjusted.l = Utils.clamp(color.l, 30, 70);
      },
      pastel: () => {
        adjusted.s = Utils.clamp(color.s * 0.45, 20, 45);
        adjusted.l = Utils.clamp(color.l * 0.4 + 55, 75, 92);
      },
      muted: () => {
        adjusted.s = Utils.clamp(color.s * 0.5, 15, 50);
        adjusted.l = Utils.clamp(color.l * 0.8 + 10, 35, 70);
      },
      earth: () => {
        // Earth tones: warm browns, tans, olives
        const earthHueShift = [0, 15, 30, 45, 75][
          Math.floor(Utils.random(0, 5))
        ];
        adjusted.h = (earthHueShift + Utils.random(-10, 10) + 360) % 360;
        adjusted.s = Utils.clamp(color.s * 0.35, 15, 40);
        adjusted.l = Utils.clamp(color.l * 0.6 + 15, 25, 60);
      },
      jewel: () => {
        adjusted.s = Utils.clamp(color.s * 1.25, 70, 100);
        adjusted.l = Utils.clamp(color.l * 0.6, 25, 45);
      },
      neon: () => {
        adjusted.s = 100;
        adjusted.l = Utils.clamp(color.l * 0.8 + 20, 50, 70);
      }
    };

    const applyFn = toneAdjustments[tone] || toneAdjustments.vibrant;
    applyFn();

    // Ensure bounds
    adjusted.h = ((adjusted.h % 360) + 360) % 360;
    adjusted.s = Utils.clamp(adjusted.s, 0, 100);
    adjusted.l = Utils.clamp(adjusted.l, 0, 100);

    return adjusted;
  }
};

// ============================================
// STATE MANAGEMENT
// ============================================

class Store {
  #state;
  #listeners = new Map();
  #history = [];
  #historyIndex = -1;

  constructor(initialState) {
    this.#state = Utils.deepClone(initialState);
    this.#saveToHistory();
  }

  /**
   * Get current state
   * @returns {AppState}
   */
  getState() {
    return Utils.deepClone(this.#state);
  }

  /**
   * Update state
   * @param {Partial<AppState>} updates
   * @param {Object} options
   */
  setState(updates, { addToHistory = false, silent = false } = {}) {
    const prevState = this.#state;
    this.#state = { ...this.#state, ...updates };

    if (addToHistory) {
      this.#saveToHistory();
    }

    if (!silent) {
      this.#notify(Object.keys(updates), prevState);
    }
  }

  /**
   * Subscribe to state changes
   * @param {string|string[]} keys
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(keys, callback) {
    const keyArray = Array.isArray(keys) ? keys : [keys];

    keyArray.forEach((key) => {
      if (!this.#listeners.has(key)) {
        this.#listeners.set(key, new Set());
      }
      this.#listeners.get(key).add(callback);
    });

    return () => {
      keyArray.forEach((key) => {
        this.#listeners.get(key)?.delete(callback);
      });
    };
  }

  /**
   * Undo last change
   * @returns {boolean}
   */
  undo() {
    if (this.#historyIndex <= 0) return false;

    this.#historyIndex--;
    this.#state = Utils.deepClone(this.#history[this.#historyIndex]);
    this.#notify(["colors"], null);
    return true;
  }

  /**
   * Redo last undone change
   * @returns {boolean}
   */
  redo() {
    if (this.#historyIndex >= this.#history.length - 1) return false;

    this.#historyIndex++;
    this.#state = Utils.deepClone(this.#history[this.#historyIndex]);
    this.#notify(["colors"], null);
    return true;
  }

  /**
   * Check if undo available
   * @returns {boolean}
   */
  canUndo() {
    return this.#historyIndex > 0;
  }

  /**
   * Check if redo available
   * @returns {boolean}
   */
  canRedo() {
    return this.#historyIndex < this.#history.length - 1;
  }

  #saveToHistory() {
    // Remove future states
    this.#history = this.#history.slice(0, this.#historyIndex + 1);

    // Add current state
    this.#history.push(Utils.deepClone(this.#state));

    // Limit history size
    if (this.#history.length > CONFIG.HISTORY_LIMIT) {
      this.#history.shift();
    } else {
      this.#historyIndex++;
    }
  }

  #notify(changedKeys, prevState) {
    const currentState = this.getState();

    changedKeys.forEach((key) => {
      const listeners = this.#listeners.get(key);
      listeners?.forEach((callback) => {
        try {
          callback(currentState, prevState);
        } catch (error) {
          console.error(`Error in store listener for "${key}":`, error);
        }
      });
    });

    // Notify wildcard listeners
    const wildcardListeners = this.#listeners.get("*");
    wildcardListeners?.forEach((callback) => {
      try {
        callback(currentState, prevState);
      } catch (error) {
        console.error("Error in wildcard store listener:", error);
      }
    });
  }
}

// ============================================
// SERVICES
// ============================================

const ClipboardService = {
  /**
   * Copy text to clipboard
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async copy(text) {
    // Try modern API first
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn("Clipboard API failed, trying fallback:", error);
      }
    }

    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch (error) {
      console.error("Clipboard fallback failed:", error);
      return false;
    }
  }
};

const ExportService = {
  /**
   * Generate export code
   * @param {PaletteColor[]} colors
   * @param {string} format
   * @returns {string}
   */
  generate(colors, format) {
    const formats = colors.map((c) => ColorConverter.getFormats(c.hsl));

    const generators = {
      css: () =>
        `:root {\n${formats
          .map((f, i) => `  --color-${i + 1}: ${f.hex};`)
          .join("\n")}\n}`,

      scss: () =>
        formats.map((f, i) => `$color-${i + 1}: ${f.hex};`).join("\n"),

      tailwind: () => `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
${formats.map((f, i) => `        'palette-${i + 1}': '${f.hex}',`).join("\n")}
      }
    }
  }
}`,

      json: () =>
        JSON.stringify(
          formats.reduce((acc, f, i) => {
            acc[`color${i + 1}`] = { hex: f.hex, rgb: f.rgb, hsl: f.hsl };
            return acc;
          }, {}),
          null,
          2
        )
    };

    return (generators[format] || generators.css)();
  }
};

const StorageService = {
  /**
   * Save state to localStorage
   * @param {Object} state
   */
  save(state) {
    try {
      const serialized = JSON.stringify({
        version: 1,
        timestamp: Date.now(),
        state: {
          colors: state.colors,
          mode: state.mode,
          tone: state.tone,
          baseColor: state.baseColor
        }
      });
      localStorage.setItem(CONFIG.STORAGE_KEY, serialized);
    } catch (error) {
      console.warn("Failed to save state:", error);
    }
  },

  /**
   * Load state from localStorage
   * @returns {Object|null}
   */
  load() {
    try {
      const serialized = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!serialized) return null;

      const { version, state } = JSON.parse(serialized);
      if (version !== 1) return null;

      return state;
    } catch (error) {
      console.warn("Failed to load state:", error);
      return null;
    }
  },

  /**
   * Clear saved state
   */
  clear() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear state:", error);
    }
  }
};

// ============================================
// TOAST COMPONENT
// ============================================

class ToastManager {
  #container;
  #template;
  #toasts = new Map();

  constructor() {
    this.#container = Utils.$("#toastContainer");
    this.#template = Utils.$("#toastTemplate");
  }

  /**
   * Show a toast notification
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {number} duration
   */
  show(message, type = "info", duration = CONFIG.TOAST_DURATION_MS) {
    if (!this.#container || !this.#template) return;

    const id = Utils.generateId();
    const clone = this.#template.content.cloneNode(true);
    const toast = clone.querySelector(".toast");

    toast.classList.add(`toast--${type}`);
    toast.querySelector(".toast__message").textContent = message;
    toast.dataset.toastId = id;

    const closeBtn = toast.querySelector(".toast__close");
    closeBtn?.addEventListener("click", () => this.dismiss(id));

    this.#container.appendChild(toast);
    this.#toasts.set(id, toast);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  /**
   * Dismiss a toast
   * @param {string} id
   */
  dismiss(id) {
    const toast = this.#toasts.get(id);
    if (!toast) return;

    toast.classList.add("is-leaving");

    toast.addEventListener(
      "animationend",
      () => {
        toast.remove();
        this.#toasts.delete(id);
      },
      { once: true }
    );
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.#toasts.forEach((_, id) => this.dismiss(id));
  }
}

// ============================================
// MAIN APPLICATION
// ============================================

class PaletteLab {
  #store;
  #toast;
  #elements = {};
  #unsubscribers = [];
  #abortController;

  constructor() {
    this.#abortController = new AbortController();
    this.#toast = new ToastManager();

    this.#initStore();
    this.#cacheElements();
    this.#bindEvents();
    this.#subscribeToStore();
    this.#hideLoading();

    // Initial render
    this.#generatePalette();
  }

  // ----------------------------------------
  // INITIALIZATION
  // ----------------------------------------

  #initStore() {
    const savedState = StorageService.load();

    const defaultState = {
      colors: [],
      mode: "random",
      tone: "vibrant",
      baseColor: "#6366F1",
      fgColor: null,
      bgColor: null,
      exportFormat: "css"
    };

    this.#store = new Store(
      savedState ? { ...defaultState, ...savedState } : defaultState
    );
  }

  #cacheElements() {
    const selectors = {
      // Containers
      app: "#app",
      paletteGrid: '[data-container="palette"]',
      contrastPreview: '[data-container="contrast-preview"]',
      previewCard: '[data-container="preview-card"]',
      previewStats: '[data-container="preview-stats"]',

      // Controls
      modeSelect: '[data-control="mode"]',
      toneSelect: '[data-control="tone"]',
      countSelect: '[data-control="count"]',
      basePicker: '[data-control="base-picker"]',
      baseHex: '[data-control="base-hex"]',
      fgSelect: '[data-control="fg-color"]',
      bgSelect: '[data-control="bg-color"]',

      // Previews
      fgPreview: '[data-preview="fg"]',
      bgPreview: '[data-preview="bg"]',

      // Outputs
      paletteInfo: '[data-output="palette-info"]',
      ratioOutput: '[data-output="ratio"]',
      exportCode: '[data-output="export-code"]',

      // Badges
      badgeAANormal: '[data-badge="aa-normal"]',
      badgeAALarge: '[data-badge="aa-large"]',
      badgeAAANormal: '[data-badge="aaa-normal"]',
      badgeAAALarge: '[data-badge="aaa-large"]'
    };

    for (const [key, selector] of Object.entries(selectors)) {
      this.#elements[key] = Utils.$(selector);
    }

    // Cache button collections
    this.#elements.actionBtns = Utils.$$("[data-action]");
    this.#elements.exportTabs = Utils.$$(".export__tab");
  }

  #bindEvents() {
    const { signal } = this.#abortController;

    // Action buttons
    this.#elements.actionBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.#handleAction(e), { signal });
    });

    // Export tabs
    this.#elements.exportTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => this.#handleExportTab(e), {
        signal
      });
    });

    // Control selects
    this.#elements.modeSelect?.addEventListener(
      "change",
      (e) => {
        this.#store.setState({ mode: e.target.value });
      },
      { signal }
    );

    this.#elements.toneSelect?.addEventListener(
      "change",
      (e) => {
        this.#store.setState({ tone: e.target.value });
      },
      { signal }
    );

    this.#elements.countSelect?.addEventListener(
      "change",
      () => {
        this.#generatePalette();
      },
      { signal }
    );

    // Base color
    this.#elements.basePicker?.addEventListener(
      "input",
      (e) => {
        const hex = e.target.value.toUpperCase();
        this.#elements.baseHex.value = hex;
        this.#store.setState({ baseColor: hex });
      },
      { signal }
    );

    const debouncedHexInput = Utils.debounce((e) => {
      let value = e.target.value.toUpperCase();
      if (!value.startsWith("#")) value = "#" + value;

      if (Utils.isValidHex(value)) {
        this.#elements.basePicker.value = value;
        this.#elements.baseHex.classList.remove("is-invalid");
        this.#store.setState({ baseColor: value });
      } else if (value.length >= 7) {
        this.#elements.baseHex.classList.add("is-invalid");
      }
    }, CONFIG.DEBOUNCE_MS);

    this.#elements.baseHex?.addEventListener("input", debouncedHexInput, {
      signal
    });

    // Contrast checker
    this.#elements.fgSelect?.addEventListener(
      "change",
      () => this.#updateContrast(),
      { signal }
    );
    this.#elements.bgSelect?.addEventListener(
      "change",
      () => this.#updateContrast(),
      { signal }
    );

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.#handleKeyboard(e), {
      signal
    });

    // Save on visibility change
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "hidden") {
          StorageService.save(this.#store.getState());
        }
      },
      { signal }
    );
  }

  #subscribeToStore() {
    this.#unsubscribers.push(
      this.#store.subscribe("colors", () => {
        this.#renderPalette();
        this.#updateContrastOptions();
        this.#updatePreview();
        this.#updateExport();
        this.#updateHistoryButtons();
      }),

      this.#store.subscribe("exportFormat", () => {
        this.#updateExport();
      })
    );
  }

  #hideLoading() {
    const loading = Utils.$("#appLoading");
    const app = Utils.$("#app");

    if (loading) loading.hidden = true;
    if (app) app.hidden = false;
  }

  // ----------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------

  #handleAction(e) {
    const action = e.currentTarget.dataset.action;

    const actions = {
      generate: () => this.#generatePalette(),
      undo: () => this.#undo(),
      redo: () => this.#redo(),
      "swap-colors": () => this.#swapContrastColors(),
      "copy-export": () => this.#copyExport()
    };

    actions[action]?.();
  }

  #handleExportTab(e) {
    const format = e.currentTarget.dataset.format;

    this.#elements.exportTabs.forEach((tab) => {
      const isActive = tab === e.currentTarget;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive);
    });

    this.#store.setState({ exportFormat: format });
  }

  #handleKeyboard(e) {
    // Ignore when typing in inputs
    if (e.target.matches("input, select, textarea")) return;

    const handlers = {
      Space: () => {
        e.preventDefault();
        this.#generatePalette();
      },
      KeyZ: () => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.shiftKey ? this.#redo() : this.#undo();
        }
      },
      KeyY: () => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.#redo();
        }
      }
    };

    handlers[e.code]?.();
  }

  // ----------------------------------------
  // PALETTE OPERATIONS
  // ----------------------------------------

  #generatePalette() {
    const state = this.#store.getState();
    const count = parseInt(
      this.#elements.countSelect?.value || CONFIG.DEFAULT_COLOR_COUNT,
      10
    );

    // Generate new colors
    let newHsls = ColorGenerator.generate(state.mode, state.baseColor, count);

    // Apply tone
    newHsls = newHsls.map((hsl) => ColorGenerator.applyTone(hsl, state.tone));

    // Preserve locked colors
    const newColors = newHsls.map((hsl, index) => {
      const existing = state.colors[index];
      if (existing?.locked) {
        return existing;
      }
      return {
        id: Utils.generateId(),
        hsl,
        locked: false
      };
    });

    // Check if all are locked
    const allLocked =
      state.colors.length > 0 &&
      newColors.every((c, i) => state.colors[i]?.locked);

    if (allLocked) {
      this.#toast.show(
        "All colors are locked. Unlock some to generate new colors.",
        "warning"
      );
    }

    this.#store.setState({ colors: newColors }, { addToHistory: true });
  }

  #updateColor(index, hex) {
    if (!Utils.isValidHex(hex)) return;

    const state = this.#store.getState();
    const colors = [...state.colors];

    colors[index] = {
      ...colors[index],
      hsl: ColorConverter.hexToHsl(hex)
    };

    this.#store.setState({ colors }, { addToHistory: true });
  }

  #toggleLock(index) {
    const state = this.#store.getState();
    const colors = [...state.colors];

    colors[index] = {
      ...colors[index],
      locked: !colors[index].locked
    };

    this.#store.setState({ colors });
  }

  #deleteColor(index) {
    const state = this.#store.getState();

    if (state.colors.length <= CONFIG.MIN_COLORS) {
      this.#toast.show(
        `Minimum ${CONFIG.MIN_COLORS} colors required`,
        "warning"
      );
      return;
    }

    const colors = state.colors.filter((_, i) => i !== index);

    // Update count select
    if (this.#elements.countSelect) {
      this.#elements.countSelect.value = colors.length.toString();
    }

    this.#store.setState({ colors }, { addToHistory: true });
  }

  #undo() {
    if (this.#store.undo()) {
      this.#toast.show("Undone", "success");
    }
  }

  #redo() {
    if (this.#store.redo()) {
      this.#toast.show("Redone", "success");
    }
  }

  // ----------------------------------------
  // RENDERING
  // ----------------------------------------

  #renderPalette() {
    const container = this.#elements.paletteGrid;
    if (!container) return;

    const state = this.#store.getState();
    const template = Utils.$("#swatchTemplate");

    // Clear container
    container.innerHTML = "";

    state.colors.forEach((color, index) => {
      const swatch = this.#createSwatch(color, index, template);
      container.appendChild(swatch);
    });

    // Update info
    this.#updatePaletteInfo();
  }

  #createSwatch(color, index, template) {
    const formats = ColorConverter.getFormats(color.hsl);
    const textColor = ColorConverter.getContrastingText(formats.hex);

    const clone = template.content.cloneNode(true);
    const swatch = clone.querySelector(".swatch");

    // Set data
    swatch.dataset.index = index;
    if (color.locked) swatch.classList.add("is-locked");

    // Color area
    const colorArea = swatch.querySelector(".swatch__color");
    colorArea.style.backgroundColor = formats.hex;

    const label = swatch.querySelector(".swatch__label");
    label.style.color = textColor;

    // Color picker
    const picker = swatch.querySelector(".swatch__picker");
    picker.value = formats.hex;
    picker.addEventListener(
      "input",
      Utils.debounce((e) => {
        this.#updateColor(index, e.target.value);
      }, CONFIG.DEBOUNCE_MS)
    );

    // Lock button
    const lockBtn = swatch.querySelector('[data-action="lock"]');
    lockBtn.setAttribute("aria-pressed", color.locked);
    lockBtn.setAttribute(
      "aria-label",
      color.locked ? "Unlock color" : "Lock color"
    );
    lockBtn.style.color = textColor;
    lockBtn.addEventListener("click", () => this.#toggleLock(index));

    // Delete button
    const deleteBtn = swatch.querySelector('[data-action="delete"]');
    deleteBtn.style.color = textColor;
    deleteBtn.addEventListener("click", () => this.#deleteColor(index));

    // Info section
    const hexBtn = swatch.querySelector(".swatch__hex");
    hexBtn.querySelector(".swatch__value").textContent = formats.hex;
    hexBtn.dataset.copyValue = formats.hex;
    hexBtn.addEventListener("click", () => this.#copyValue(formats.hex));

    // Format buttons
    const rgbBtn = swatch.querySelector('[data-format="rgb"]');
    rgbBtn.textContent = formats.rgb;
    rgbBtn.dataset.copyValue = formats.rgb;
    rgbBtn.addEventListener("click", () => this.#copyValue(formats.rgb));

    const hslBtn = swatch.querySelector('[data-format="hsl"]');
    hslBtn.textContent = formats.hsl;
    hslBtn.dataset.copyValue = formats.hsl;
    hslBtn.addEventListener("click", () => this.#copyValue(formats.hsl));

    return swatch;
  }

  #updatePaletteInfo() {
    const output = this.#elements.paletteInfo;
    if (!output) return;

    const state = this.#store.getState();
    const lockedCount = state.colors.filter((c) => c.locked).length;

    if (lockedCount > 0) {
      output.innerHTML = `<span class="locked">${lockedCount} locked</span>`;
    } else {
      output.textContent = "";
    }
  }

  #updateHistoryButtons() {
    const undoBtn = Utils.$('[data-action="undo"]');
    const redoBtn = Utils.$('[data-action="redo"]');

    if (undoBtn) undoBtn.disabled = !this.#store.canUndo();
    if (redoBtn) redoBtn.disabled = !this.#store.canRedo();
  }

  // ----------------------------------------
  // CONTRAST CHECKER
  // ----------------------------------------

  #updateContrastOptions() {
    const state = this.#store.getState();
    const { fgSelect, bgSelect } = this.#elements;

    if (!fgSelect || !bgSelect) return;

    const options = state.colors
      .map((color, i) => {
        const hex = ColorConverter.hslToHex(color.hsl);
        return `<option value="${hex}">Color ${i + 1}: ${hex}</option>`;
      })
      .join("");

    fgSelect.innerHTML = options;
    bgSelect.innerHTML = options;

    // Set intelligent defaults (darkest vs lightest)
    if (state.colors.length >= 2) {
      const sorted = [...state.colors]
        .map((c, i) => ({ index: i, lightness: c.hsl.l }))
        .sort((a, b) => a.lightness - b.lightness);

      fgSelect.selectedIndex = sorted[0].index;
      bgSelect.selectedIndex = sorted[sorted.length - 1].index;
    }

    this.#updateContrast();
  }

  #updateContrast() {
    const {
      fgSelect,
      bgSelect,
      fgPreview,
      bgPreview,
      ratioOutput,
      contrastPreview
    } = this.#elements;

    const fg = fgSelect?.value;
    const bg = bgSelect?.value;

    if (!fg || !bg || !Utils.isValidHex(fg) || !Utils.isValidHex(bg)) {
      this.#resetContrastDisplay();
      return;
    }

    // Update previews
    if (fgPreview) fgPreview.style.backgroundColor = fg;
    if (bgPreview) bgPreview.style.backgroundColor = bg;

    // Calculate ratio
    const ratio = ColorConverter.getContrastRatio(fg, bg);
    const ratioText = ratio.toFixed(2) + ":1";

    // Update ratio display
    if (ratioOutput) {
      const valueEl = ratioOutput.querySelector(".contrast-ratio__value");
      if (valueEl) {
        valueEl.textContent = ratioText;
        valueEl.className = "contrast-ratio__value";

        if (ratio >= CONFIG.WCAG.AAA_NORMAL) {
          valueEl.classList.add("is-excellent");
        } else if (ratio >= CONFIG.WCAG.AA_NORMAL) {
          valueEl.classList.add("is-good");
        } else {
          valueEl.classList.add("is-poor");
        }
      }
    }

    // Update badges
    this.#updateBadge(
      this.#elements.badgeAANormal,
      ratio >= CONFIG.WCAG.AA_NORMAL
    );
    this.#updateBadge(
      this.#elements.badgeAALarge,
      ratio >= CONFIG.WCAG.AA_LARGE
    );
    this.#updateBadge(
      this.#elements.badgeAAANormal,
      ratio >= CONFIG.WCAG.AAA_NORMAL
    );
    this.#updateBadge(
      this.#elements.badgeAAALarge,
      ratio >= CONFIG.WCAG.AAA_LARGE
    );

    // Update preview
    if (contrastPreview) {
      contrastPreview.style.backgroundColor = bg;
      contrastPreview.style.color = fg;

      const button = contrastPreview.querySelector(".contrast-preview__button");
      if (button) {
        button.style.backgroundColor = fg;
        button.style.color = bg;
      }
    }

    // Store selection
    this.#store.setState({ fgColor: fg, bgColor: bg }, { silent: true });
  }

  #updateBadge(badge, passes) {
    if (!badge) return;

    badge.classList.toggle("is-pass", passes);
    badge.classList.toggle("is-fail", !passes);

    const status = badge.querySelector(".wcag-badge__status");
    if (status) {
      status.textContent = passes ? "Pass" : "Fail";
    }
  }

  #resetContrastDisplay() {
    const { ratioOutput } = this.#elements;

    if (ratioOutput) {
      const valueEl = ratioOutput.querySelector(".contrast-ratio__value");
      if (valueEl) {
        valueEl.textContent = "--";
        valueEl.className = "contrast-ratio__value";
      }
    }

    [
      this.#elements.badgeAANormal,
      this.#elements.badgeAALarge,
      this.#elements.badgeAAANormal,
      this.#elements.badgeAAALarge
    ].forEach((badge) => {
      if (badge) {
        badge.classList.remove("is-pass", "is-fail");
        const status = badge.querySelector(".wcag-badge__status");
        if (status) status.textContent = "--";
      }
    });
  }

  #swapContrastColors() {
    const { fgSelect, bgSelect } = this.#elements;
    if (!fgSelect || !bgSelect) return;

    const temp = fgSelect.value;
    fgSelect.value = bgSelect.value;
    bgSelect.value = temp;

    this.#updateContrast();
  }

  // ----------------------------------------
  // PREVIEW
  // ----------------------------------------

  #updatePreview() {
    const state = this.#store.getState();
    const { previewCard, previewStats } = this.#elements;

    if (state.colors.length < 2) return;

    const formats = state.colors.map((c) => ColorConverter.getFormats(c.hsl));

    // Find lightest and darkest
    const sorted = [...state.colors]
      .map((c, i) => ({ index: i, lightness: c.hsl.l }))
      .sort((a, b) => a.lightness - b.lightness);

    const darkest = formats[sorted[0].index];
    const lightest = formats[sorted[sorted.length - 1].index];
    const accent = formats[Math.min(2, formats.length - 1)];

    // Card preview
    if (previewCard) {
      previewCard.style.backgroundColor = lightest.hex;
      previewCard.style.color = darkest.hex;

      const badge = previewCard.querySelector(".preview-card__badge");
      if (badge) {
        badge.style.backgroundColor = accent.hex;
        badge.style.color = ColorConverter.getContrastingText(accent.hex);
      }

      const primaryBtn = previewCard.querySelector(
        ".preview-card__btn--primary"
      );
      if (primaryBtn) {
        primaryBtn.style.backgroundColor = accent.hex;
        primaryBtn.style.color = ColorConverter.getContrastingText(accent.hex);
      }

      const secondaryBtn = previewCard.querySelector(
        ".preview-card__btn--secondary"
      );
      if (secondaryBtn) {
        secondaryBtn.style.borderColor = darkest.hex;
        secondaryBtn.style.color = darkest.hex;
      }
    }

    // Stats preview
    if (previewStats) {
      const mid = formats[Math.floor(formats.length / 2)];
      previewStats.style.backgroundColor = mid.hex;
      previewStats.style.color = ColorConverter.getContrastingText(mid.hex);
    }
  }

  // ----------------------------------------
  // EXPORT
  // ----------------------------------------

  #updateExport() {
    const state = this.#store.getState();
    const { exportCode } = this.#elements;

    if (!exportCode) return;

    const code = ExportService.generate(state.colors, state.exportFormat);
    exportCode.textContent = code;
  }

  async #copyExport() {
    const { exportCode } = this.#elements;
    if (!exportCode) return;

    const code = exportCode.textContent;
    const success = await ClipboardService.copy(code);

    if (success) {
      const btn = Utils.$('[data-action="copy-export"]');
      if (btn) {
        btn.classList.add("is-copied");
        setTimeout(() => btn.classList.remove("is-copied"), 2000);
      }
      this.#toast.show("Code copied to clipboard", "success");
    } else {
      this.#toast.show("Failed to copy code", "error");
    }
  }

  async #copyValue(value) {
    const success = await ClipboardService.copy(value);

    if (success) {
      const preview = value.length > 25 ? value.slice(0, 25) + "..." : value;
      this.#toast.show(`Copied: ${preview}`, "success");
    } else {
      this.#toast.show("Failed to copy", "error");
    }
  }

  // ----------------------------------------
  // CLEANUP
  // ----------------------------------------

  destroy() {
    this.#abortController.abort();
    this.#unsubscribers.forEach((unsub) => unsub());
    this.#toast.dismissAll();
    StorageService.save(this.#store.getState());
  }
}

// ============================================
// INITIALIZATION
// ============================================

let app;

document.addEventListener("DOMContentLoaded", () => {
  try {
    app = new PaletteLab();
  } catch (error) {
    console.error("Failed to initialize Palette Lab:", error);

    // Show error state
    const loading = Utils.$("#appLoading");
    if (loading) {
      loading.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h2>Failed to load application</h2>
          <p>Please refresh the page or try again later.</p>
          <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">
            Refresh
          </button>
        </div>
      `;
    }
  }
});

window.addEventListener("beforeunload", () => {
  app?.destroy();
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    Utils,
    ColorConverter,
    ColorGenerator,
    Store,
    CONFIG
  };
}