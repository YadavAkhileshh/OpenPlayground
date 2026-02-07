/**
 * =============================================
 * Accessibility Contrast Scanner
 * WCAG 2.1 DOM Auditor
 * =============================================
 *
 * Features:
 * - Scan HTML snippets or fetched pages for WCAG contrast issues
 * - Toggle AA / AAA and Normal / Large text modes
 * - Inline highlights for failing elements with keyboard navigation
 * - Color-suggestion engine (1-3 candidates per failing element)
 * - Export results as JSON / CSV and copy-to-clipboard summary
 */

// ============================================
// SECTION 1: Color Utilities
// ============================================

function hexToRgb(hex) {
    const clean = hex.replace(/^#/, '');
    if (!/^[0-9A-Fa-f]{3}$/.test(clean) && !/^[0-9A-Fa-f]{6}$/.test(clean)) return null;
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    return {
        r: parseInt(full.substring(0, 2), 16),
        g: parseInt(full.substring(2, 4), 16),
        b: parseInt(full.substring(4, 6), 16)
    };
}

function rgbToHex(r, g, b) {
    const h = c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1; if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * Parse any CSS color string to {r,g,b} using a temporary canvas.
 */
function parseColor(colorStr) {
    if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') return null;
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = colorStr;
    const computed = ctx.fillStyle; // normalised to #rrggbb or rgba(...)
    if (computed.startsWith('#')) return hexToRgb(computed);
    const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    return null;
}

// ============================================
// SECTION 2: WCAG Contrast Calculations
// ============================================

function getRelativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Return the required contrast ratio for the current settings.
 */
function getRequiredRatio(level, size) {
    if (level === 'AAA') return size === 'large' ? 4.5 : 7;
    return size === 'large' ? 3 : 4.5; // AA
}

// ============================================
// SECTION 3: Color Suggestion Engine
// ============================================

/**
 * Given a foreground and background, return 1-3 suggested foreground colors
 * that meet the target contrast ratio while staying close to the original hue.
 */
function suggestForegrounds(fgRgb, bgRgb, targetRatio) {
    const suggestions = [];
    const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);

    // Strategy 1: Darken or lighten the foreground along its own hue
    const needDark = bgLum > 0.5; // light bg → need dark fg
    const startL = needDark ? Math.min(fgHsl.l, 45) : Math.max(fgHsl.l, 55);
    const step = needDark ? -5 : 5;

    for (let l = startL; needDark ? l >= 0 : l <= 100; l += step) {
        const candidate = hslToRgb(fgHsl.h, fgHsl.s, l);
        if (getContrastRatio(candidate, bgRgb) >= targetRatio) {
            suggestions.push(candidate);
            break;
        }
    }

    // Strategy 2: Increase saturation while adjusting lightness
    for (let s = Math.min(90, fgHsl.s + 20); s >= 10; s -= 20) {
        const l = needDark ? 15 : 85;
        const candidate = hslToRgb(fgHsl.h, s, l);
        if (getContrastRatio(candidate, bgRgb) >= targetRatio) {
            if (!suggestions.some(c => rgbToHex(c.r, c.g, c.b) === rgbToHex(candidate.r, candidate.g, candidate.b))) {
                suggestions.push(candidate);
            }
            if (suggestions.length >= 3) break;
        }
    }

    // Strategy 3: Pure black or white fallback
    if (suggestions.length === 0) {
        const black = { r: 0, g: 0, b: 0 };
        const white = { r: 255, g: 255, b: 255 };
        suggestions.push(getContrastRatio(black, bgRgb) >= targetRatio ? black : white);
    }

    return suggestions.slice(0, 3);
}

/**
 * Suggest 1-3 background colors that meet the target ratio.
 */
function suggestBackgrounds(fgRgb, bgRgb, targetRatio) {
    const suggestions = [];
    const fgLum = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
    const needLight = fgLum < 0.5;
    const startL = needLight ? Math.max(bgHsl.l, 60) : Math.min(bgHsl.l, 40);
    const step = needLight ? 5 : -5;

    for (let l = startL; needLight ? l <= 100 : l >= 0; l += step) {
        const candidate = hslToRgb(bgHsl.h, bgHsl.s, l);
        if (getContrastRatio(fgRgb, candidate) >= targetRatio) {
            suggestions.push(candidate);
            break;
        }
    }

    if (suggestions.length === 0) {
        const black = { r: 0, g: 0, b: 0 };
        const white = { r: 255, g: 255, b: 255 };
        suggestions.push(getContrastRatio(fgRgb, white) >= targetRatio ? white : black);
    }

    return suggestions.slice(0, 3);
}

/**
 * Combined: return up to 3 {fg, bg, ratio} suggestions for a failing element.
 */
function getSuggestions(fgRgb, bgRgb, targetRatio) {
    const results = [];
    const fgSugs = suggestForegrounds(fgRgb, bgRgb, targetRatio);
    fgSugs.forEach(fg => {
        const ratio = getContrastRatio(fg, bgRgb);
        if (ratio >= targetRatio) {
            results.push({ fg, bg: bgRgb, ratio, type: 'fg' });
        }
    });

    const bgSugs = suggestBackgrounds(fgRgb, bgRgb, targetRatio);
    bgSugs.forEach(bg => {
        const ratio = getContrastRatio(fgRgb, bg);
        if (ratio >= targetRatio) {
            results.push({ fg: fgRgb, bg, ratio, type: 'bg' });
        }
    });

    // Deduplicate and limit to 3
    const seen = new Set();
    return results.filter(s => {
        const key = rgbToHex(s.fg.r, s.fg.g, s.fg.b) + rgbToHex(s.bg.r, s.bg.g, s.bg.b);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 3);
}

// ============================================
// SECTION 4: DOM Scanner
// ============================================

/**
 * Walk a document's DOM tree and collect text elements with computed colors.
 * Returns an array of result objects.
 */
function scanDocument(doc, targetRatio) {
    const results = [];
    const textTags = new Set([
        'P', 'SPAN', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'LI', 'TD', 'TH', 'LABEL', 'BUTTON', 'STRONG', 'EM', 'B', 'I',
        'SMALL', 'BLOCKQUOTE', 'CAPTION', 'FIGCAPTION', 'LEGEND',
        'DT', 'DD', 'SUMMARY', 'MARK', 'CODE', 'PRE', 'DIV', 'SECTION',
        'ARTICLE', 'HEADER', 'FOOTER', 'NAV', 'MAIN', 'ASIDE'
    ]);

    const walker = doc.createTreeWalker(doc.body || doc.documentElement, NodeFilter.SHOW_ELEMENT, {
        acceptNode(node) {
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'NOSCRIPT') {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    let idx = 0;
    let node = walker.nextNode();
    while (node) {
        // Only consider elements that have direct text content
        const text = getDirectText(node).trim();
        if (text && textTags.has(node.tagName)) {
            const style = doc.defaultView
                ? doc.defaultView.getComputedStyle(node)
                : null;

            if (style) {
                const fgColor = parseColor(style.color);
                const bgColor = findEffectiveBackground(node, doc);

                if (fgColor && bgColor) {
                    const ratio = getContrastRatio(fgColor, bgColor);
                    const passes = ratio >= targetRatio;
                    const fontSize = parseFloat(style.fontSize);
                    const fontWeight = parseInt(style.fontWeight) || (style.fontWeight === 'bold' ? 700 : 400);
                    const isLargeText = fontSize >= 24 || (fontSize >= 18.5 && fontWeight >= 700);

                    const suggestions = passes ? [] : getSuggestions(fgColor, bgColor, targetRatio);

                    idx++;
                    results.push({
                        index: idx,
                        element: node,
                        tag: node.tagName.toLowerCase(),
                        text: text.substring(0, 80),
                        fg: fgColor,
                        bg: bgColor,
                        fgHex: rgbToHex(fgColor.r, fgColor.g, fgColor.b),
                        bgHex: rgbToHex(bgColor.r, bgColor.g, bgColor.b),
                        ratio: Math.round(ratio * 100) / 100,
                        passes,
                        isLargeText,
                        fontSize,
                        fontWeight,
                        suggestions
                    });
                }
            }
        }
        node = walker.nextNode();
    }

    return results;
}

/**
 * Get only the direct text content of a node (not from children).
 */
function getDirectText(node) {
    let text = '';
    for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent;
        }
    }
    return text;
}

/**
 * Walk up the DOM to find the effective background color.
 */
function findEffectiveBackground(el, doc) {
    let current = el;
    while (current && current !== doc.documentElement) {
        const style = doc.defaultView ? doc.defaultView.getComputedStyle(current) : null;
        if (style) {
            const bg = style.backgroundColor;
            if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
                return parseColor(bg);
            }
        }
        current = current.parentElement;
    }
    // Default to white if no background found
    return { r: 255, g: 255, b: 255 };
}

// ============================================
// SECTION 5: State & DOM References
// ============================================

const state = {
    theme: localStorage.getItem('contrastScannerTheme') || 'light',
    level: 'AA',
    size: 'normal',
    results: [],
    failIndices: [],
    currentFailIdx: -1,
    highlightsOn: true,
    filter: 'all'
};

const $ = id => document.getElementById(id);

const dom = {
    htmlInput: $('htmlInput'),
    urlInput: $('urlInput'),
    scanBtn: $('scanBtn'),
    loadDemoBtn: $('loadDemoBtn'),
    themeToggle: $('themeToggle'),
    keyboardHintBtn: $('keyboardHintBtn'),
    keyboardModal: $('keyboardModal'),
    closeModalBtn: $('closeModalBtn'),
    toastContainer: $('toastContainer'),

    summarySection: $('summarySection'),
    statTotal: $('statTotal'),
    statPass: $('statPass'),
    statFail: $('statFail'),
    statRatio: $('statRatio'),
    copySummaryBtn: $('copySummaryBtn'),

    previewSection: $('previewSection'),
    previewFrame: $('previewFrame'),
    toggleHighlightsBtn: $('toggleHighlightsBtn'),
    prevFailBtn: $('prevFailBtn'),
    nextFailBtn: $('nextFailBtn'),
    failCounter: $('failCounter'),

    resultsSection: $('resultsSection'),
    resultsBody: $('resultsBody'),

    exportSection: $('exportSection'),
    exportJsonBtn: $('exportJsonBtn'),
    exportCsvBtn: $('exportCsvBtn'),
    copyJsonBtn: $('copyJsonBtn'),
    copyCsvBtn: $('copyCsvBtn')
};

// ============================================
// SECTION 6: Demo Snippet
// ============================================

const DEMO_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Demo Page</title></head>
<body style="font-family: sans-serif; padding: 2rem; background: #ffffff;">

  <h1 style="color: #1a1a2e;">Welcome to the Demo Page</h1>
  <p style="color: #999999;">This paragraph has low contrast text on a white background — it will fail AA.</p>

  <div style="background: #1e293b; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
    <h2 style="color: #f1f5f9;">Dark Card Title</h2>
    <p style="color: #64748b;">This muted text on a dark background may fail contrast checks.</p>
    <a href="#" style="color: #818cf8;">A link with decent contrast</a>
  </div>

  <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
    <p style="color: #fbbf24;">Yellow text on a yellow-ish background — very poor contrast!</p>
    <p style="color: #92400e;">This amber text should pass easily.</p>
  </div>

  <button style="background: #6366f1; color: #ffffff; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 1rem;">
    Accessible Button
  </button>

  <button style="background: #e2e8f0; color: #cbd5e1; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 1rem; margin-left: 0.5rem;">
    Low Contrast Button
  </button>

  <footer style="margin-top: 2rem; color: #d1d5db;">
    <small>Footer text with questionable contrast</small>
  </footer>

</body>
</html>`;

// ============================================
// SECTION 7: Core Actions
// ============================================

function runScan() {
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    const targetRatio = getRequiredRatio(state.level, state.size);

    if (activeTab === 'url') {
        const url = dom.urlInput.value.trim();
        if (!url) { showToast('Please enter a URL', 'error'); return; }
        fetchAndScan(url, targetRatio);
    } else {
        const html = dom.htmlInput.value.trim();
        if (!html) { showToast('Please enter some HTML to scan', 'error'); return; }
        scanHTML(html, targetRatio);
    }
}

function scanHTML(html, targetRatio) {
    // Write HTML into the iframe
    const frame = dom.previewFrame;
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Wait for styles to compute
    setTimeout(() => {
        state.results = scanDocument(doc, targetRatio);
        state.failIndices = state.results.filter(r => !r.passes).map((_, i) => i);
        state.currentFailIdx = -1;
        state.highlightsOn = true;

        renderSummary();
        renderResults();
        applyHighlights();
        showSections();
        updateFailCounter();

        const failCount = state.results.filter(r => !r.passes).length;
        showToast(`Scan complete: ${state.results.length} elements, ${failCount} failing`);
    }, 300);
}

function fetchAndScan(url, targetRatio) {
    showToast('Fetching page…');
    // Use allorigins CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    fetch(proxyUrl)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
        })
        .then(html => {
            dom.htmlInput.value = html;
            scanHTML(html, targetRatio);
        })
        .catch(err => {
            showToast(`Failed to fetch: ${err.message}`, 'error');
        });
}

function showSections() {
    dom.summarySection.classList.remove('hidden');
    dom.previewSection.classList.remove('hidden');
    dom.resultsSection.classList.remove('hidden');
    dom.exportSection.classList.remove('hidden');
}

// ============================================
// SECTION 8: Rendering
// ============================================

function renderSummary() {
    const total = state.results.length;
    const pass = state.results.filter(r => r.passes).length;
    const fail = total - pass;
    const worst = state.results.reduce((min, r) => Math.min(min, r.ratio), Infinity);

    dom.statTotal.querySelector('.stat-value').textContent = total;
    dom.statPass.querySelector('.stat-value').textContent = pass;
    dom.statFail.querySelector('.stat-value').textContent = fail;
    dom.statRatio.querySelector('.stat-value').textContent = total > 0 ? `${worst.toFixed(2)}:1` : '—';
}

function renderResults() {
    const filtered = state.filter === 'all'
        ? state.results
        : state.results.filter(r => state.filter === 'fail' ? !r.passes : r.passes);

    dom.resultsBody.innerHTML = filtered.map(r => {
        const sugHtml = r.suggestions.length > 0
            ? r.suggestions.map(s => {
                const fgH = rgbToHex(s.fg.r, s.fg.g, s.fg.b);
                const bgH = rgbToHex(s.bg.r, s.bg.g, s.bg.b);
                const label = s.type === 'fg' ? `FG ${fgH}` : `BG ${bgH}`;
                const dotColor = s.type === 'fg' ? fgH : bgH;
                return `<span class="suggestion-chip" data-fg="${fgH}" data-bg="${bgH}" data-idx="${r.index}" title="${s.ratio.toFixed(1)}:1">
                    <span class="sug-dot" style="background:${dotColor}"></span>${label}
                </span>`;
            }).join('')
            : '<span style="color:var(--text3);font-size:.78rem;">—</span>';

        return `<tr class="${r.passes ? 'row-pass' : 'row-fail'}" data-idx="${r.index}">
            <td>${r.index}</td>
            <td><span class="element-tag">&lt;${r.tag}&gt;</span></td>
            <td><span class="text-preview" title="${escapeHtml(r.text)}">${escapeHtml(r.text)}</span></td>
            <td><span class="color-chip"><span class="color-dot" style="background:${r.fgHex}"></span>${r.fgHex}</span></td>
            <td><span class="color-chip"><span class="color-dot" style="background:${r.bgHex}"></span>${r.bgHex}</span></td>
            <td><strong>${r.ratio.toFixed(2)}:1</strong></td>
            <td><span class="status-badge ${r.passes ? 'pass' : 'fail'}">${r.passes ? 'Pass' : 'Fail'}</span></td>
            <td><div class="suggestion-chips">${sugHtml}</div></td>
        </tr>`;
    }).join('');

    // Suggestion chip click handlers
    dom.resultsBody.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const idx = parseInt(chip.dataset.idx);
            const result = state.results.find(r => r.index === idx);
            if (!result) return;
            const fgHex = chip.dataset.fg;
            const bgHex = chip.dataset.bg;

            // Apply suggestion in the iframe
            const el = result.element;
            if (el) {
                el.style.color = fgHex;
                el.style.backgroundColor = bgHex;
                showToast(`Applied suggestion to <${result.tag}>`);
            }
        });
    });

    // Row click → scroll to element in preview
    dom.resultsBody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.closest('.suggestion-chip')) return;
            const idx = parseInt(row.dataset.idx);
            const result = state.results.find(r => r.index === idx);
            if (result && result.element) {
                scrollToElement(result.element);
            }
        });
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================
// SECTION 9: Inline Highlights
// ============================================

const HIGHLIGHT_STYLE = 'outline: 3px solid #ef4444 !important; outline-offset: 2px !important; position: relative !important;';
const HIGHLIGHT_BADGE_STYLE = `
    position: absolute; top: -10px; right: -10px; z-index: 10000;
    background: #ef4444; color: #fff; font-size: 10px; font-weight: 700;
    padding: 1px 5px; border-radius: 8px; font-family: sans-serif;
    pointer-events: none; line-height: 1.4;
`;
const FOCUS_STYLE = 'outline: 3px solid #6366f1 !important; outline-offset: 2px !important; box-shadow: 0 0 0 6px rgba(99,102,241,.25) !important;';

function applyHighlights() {
    const doc = dom.previewFrame.contentDocument;
    if (!doc) return;

    // Remove old highlights
    clearHighlights(doc);

    if (!state.highlightsOn) return;

    state.results.forEach(r => {
        if (!r.passes && r.element) {
            r.element.setAttribute('style', (r.element.getAttribute('style') || '') + ';' + HIGHLIGHT_STYLE);
            r.element.setAttribute('data-acc-fail', 'true');

            // Add ratio badge
            const badge = doc.createElement('span');
            badge.setAttribute('style', HIGHLIGHT_BADGE_STYLE);
            badge.textContent = `${r.ratio.toFixed(1)}:1`;
            badge.className = 'acc-badge';
            r.element.style.position = 'relative';
            r.element.appendChild(badge);
        }
    });
}

function clearHighlights(doc) {
    if (!doc) return;
    doc.querySelectorAll('[data-acc-fail]').forEach(el => {
        el.removeAttribute('data-acc-fail');
        // Remove the outline we added
        let style = el.getAttribute('style') || '';
        style = style.replace(/outline:\s*3px solid #ef4444[^;]*;?/gi, '');
        style = style.replace(/outline-offset:\s*2px[^;]*;?/gi, '');
        style = style.replace(/box-shadow:\s*0 0 0 6px[^;]*;?/gi, '');
        el.setAttribute('style', style);
    });
    doc.querySelectorAll('.acc-badge').forEach(b => b.remove());
    doc.querySelectorAll('[data-acc-focus]').forEach(el => {
        el.removeAttribute('data-acc-focus');
        let style = el.getAttribute('style') || '';
        style = style.replace(/outline:\s*3px solid #6366f1[^;]*;?/gi, '');
        style = style.replace(/outline-offset:\s*2px[^;]*;?/gi, '');
        style = style.replace(/box-shadow:\s*0 0 0 6px[^;]*;?/gi, '');
        el.setAttribute('style', style);
    });
}

function toggleHighlights() {
    state.highlightsOn = !state.highlightsOn;
    dom.toggleHighlightsBtn.classList.toggle('active', state.highlightsOn);
    applyHighlights();
    showToast(state.highlightsOn ? 'Highlights on' : 'Highlights off');
}

// ============================================
// SECTION 10: Keyboard Navigation of Failures
// ============================================

function getFailingResults() {
    return state.results.filter(r => !r.passes);
}

function navigateFail(direction) {
    const fails = getFailingResults();
    if (fails.length === 0) return;

    state.currentFailIdx += direction;
    if (state.currentFailIdx >= fails.length) state.currentFailIdx = 0;
    if (state.currentFailIdx < 0) state.currentFailIdx = fails.length - 1;

    const target = fails[state.currentFailIdx];
    if (target && target.element) {
        // Clear previous focus highlight
        const doc = dom.previewFrame.contentDocument;
        doc.querySelectorAll('[data-acc-focus]').forEach(el => {
            el.removeAttribute('data-acc-focus');
            let style = el.getAttribute('style') || '';
            style = style.replace(/outline:\s*3px solid #6366f1[^;]*;?/gi, '');
            style = style.replace(/outline-offset:\s*2px[^;]*;?/gi, '');
            style = style.replace(/box-shadow:\s*0 0 0 6px[^;]*;?/gi, '');
            el.setAttribute('style', style);
        });

        // Apply focus highlight
        target.element.setAttribute('data-acc-focus', 'true');
        target.element.setAttribute('style', (target.element.getAttribute('style') || '') + ';' + FOCUS_STYLE);
        scrollToElement(target.element);

        // Highlight corresponding row in table
        dom.resultsBody.querySelectorAll('tr').forEach(row => row.classList.remove('row-focused'));
        const row = dom.resultsBody.querySelector(`tr[data-idx="${target.index}"]`);
        if (row) {
            row.classList.add('row-focused');
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    updateFailCounter();
}

function scrollToElement(el) {
    try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) { /* iframe security */ }
}

function updateFailCounter() {
    const fails = getFailingResults();
    const current = state.currentFailIdx >= 0 ? state.currentFailIdx + 1 : 0;
    dom.failCounter.textContent = `${current} / ${fails.length}`;
}

// ============================================
// SECTION 11: Export Functions
// ============================================

function buildExportData() {
    return state.results.map(r => ({
        index: r.index,
        element: `<${r.tag}>`,
        text: r.text,
        foreground: r.fgHex,
        background: r.bgHex,
        contrastRatio: r.ratio,
        status: r.passes ? 'PASS' : 'FAIL',
        isLargeText: r.isLargeText,
        fontSize: r.fontSize,
        fontWeight: r.fontWeight,
        wcagLevel: state.level,
        textSizeMode: state.size,
        requiredRatio: getRequiredRatio(state.level, state.size),
        suggestions: r.suggestions.map(s => ({
            type: s.type,
            foreground: rgbToHex(s.fg.r, s.fg.g, s.fg.b),
            background: rgbToHex(s.bg.r, s.bg.g, s.bg.b),
            ratio: Math.round(s.ratio * 100) / 100
        }))
    }));
}

function exportJSON() {
    const data = {
        scanDate: new Date().toISOString(),
        wcagLevel: state.level,
        textSizeMode: state.size,
        requiredRatio: getRequiredRatio(state.level, state.size),
        totalElements: state.results.length,
        passing: state.results.filter(r => r.passes).length,
        failing: state.results.filter(r => !r.passes).length,
        results: buildExportData()
    };
    return JSON.stringify(data, null, 2);
}

function exportCSV() {
    const headers = ['#', 'Element', 'Text', 'Foreground', 'Background', 'Contrast Ratio', 'Status', 'Large Text', 'Font Size', 'Font Weight', 'WCAG Level', 'Required Ratio', 'Suggestions'];
    const rows = buildExportData().map(r => [
        r.index,
        `"${r.element}"`,
        `"${r.text.replace(/"/g, '""')}"`,
        r.foreground,
        r.background,
        r.contrastRatio,
        r.status,
        r.isLargeText,
        r.fontSize,
        r.fontWeight,
        r.wcagLevel,
        r.requiredRatio,
        `"${r.suggestions.map(s => `${s.type}:${s.foreground}/${s.background}(${s.ratio}:1)`).join('; ')}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function copySummary() {
    const total = state.results.length;
    const pass = state.results.filter(r => r.passes).length;
    const fail = total - pass;
    const worst = state.results.reduce((min, r) => Math.min(min, r.ratio), Infinity);
    const text = `WCAG Contrast Scan Summary\n` +
        `Level: ${state.level} | Text Size: ${state.size}\n` +
        `Required Ratio: ${getRequiredRatio(state.level, state.size)}:1\n` +
        `Total: ${total} | Pass: ${pass} | Fail: ${fail}\n` +
        `Worst Ratio: ${total > 0 ? worst.toFixed(2) + ':1' : 'N/A'}`;
    copyToClipboard(text, 'Summary copied!');
}

function copyToClipboard(text, msg) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(msg || 'Copied!');
    }).catch(() => {
        showToast('Copy failed', 'error');
    });
}

// ============================================
// SECTION 12: UI Helpers
// ============================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="${type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'}"></i><span>${message}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('contrastScannerTheme', state.theme);
}

function openModal() {
    dom.keyboardModal.classList.add('active');
    dom.keyboardModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    dom.keyboardModal.classList.remove('active');
    dom.keyboardModal.setAttribute('aria-hidden', 'true');
}

// ============================================
// SECTION 13: Event Listeners
// ============================================

function initEvents() {
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
        });
    });

    // WCAG level toggle
    document.querySelectorAll('[data-level]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-level]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-checked', 'false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
            state.level = btn.dataset.level;
        });
    });

    // Text size toggle
    document.querySelectorAll('[data-size]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-size]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-checked', 'false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
            state.size = btn.dataset.size;
        });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filter = btn.dataset.filter;
            renderResults();
        });
    });

    // Scan
    dom.scanBtn.addEventListener('click', runScan);

    // Demo
    dom.loadDemoBtn.addEventListener('click', () => {
        dom.htmlInput.value = DEMO_HTML;
        // Switch to HTML tab
        document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('tab-html').classList.add('active');
        document.getElementById('tab-html').setAttribute('aria-selected', 'true');
        document.getElementById('panel-html').classList.add('active');
        showToast('Demo snippet loaded — hit Scan!');
    });

    // Theme
    dom.themeToggle.addEventListener('click', toggleTheme);

    // Modal
    dom.keyboardHintBtn.addEventListener('click', openModal);
    dom.closeModalBtn.addEventListener('click', closeModal);
    dom.keyboardModal.addEventListener('click', e => { if (e.target === dom.keyboardModal) closeModal(); });

    // Preview controls
    dom.toggleHighlightsBtn.addEventListener('click', toggleHighlights);
    dom.nextFailBtn.addEventListener('click', () => navigateFail(1));
    dom.prevFailBtn.addEventListener('click', () => navigateFail(-1));

    // Summary copy
    dom.copySummaryBtn.addEventListener('click', copySummary);

    // Export
    dom.exportJsonBtn.addEventListener('click', () => {
        downloadFile(exportJSON(), 'contrast-scan-results.json', 'application/json');
        showToast('JSON exported!');
    });
    dom.exportCsvBtn.addEventListener('click', () => {
        downloadFile(exportCSV(), 'contrast-scan-results.csv', 'text/csv');
        showToast('CSV exported!');
    });
    dom.copyJsonBtn.addEventListener('click', () => copyToClipboard(exportJSON(), 'JSON copied!'));
    dom.copyCsvBtn.addEventListener('click', () => copyToClipboard(exportCSV(), 'CSV copied!'));

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case 'enter': runScan(); break;
            case 'h': toggleHighlights(); break;
            case 'j': navigateFail(1); break;
            case 'k': navigateFail(-1); break;
            case '1':
                state.level = state.level === 'AA' ? 'AAA' : 'AA';
                document.querySelectorAll('[data-level]').forEach(b => {
                    b.classList.toggle('active', b.dataset.level === state.level);
                    b.setAttribute('aria-checked', b.dataset.level === state.level ? 'true' : 'false');
                });
                showToast(`WCAG level: ${state.level}`);
                break;
            case '2':
                state.size = state.size === 'normal' ? 'large' : 'normal';
                document.querySelectorAll('[data-size]').forEach(b => {
                    b.classList.toggle('active', b.dataset.size === state.size);
                    b.setAttribute('aria-checked', b.dataset.size === state.size ? 'true' : 'false');
                });
                showToast(`Text size: ${state.size}`);
                break;
            case 't': toggleTheme(); break;
            case '?': openModal(); break;
            case 'escape': closeModal(); break;
        }
    });
}

// ============================================
// SECTION 14: Init
// ============================================

function init() {
    document.documentElement.setAttribute('data-theme', state.theme);
    dom.toggleHighlightsBtn.classList.add('active');
    initEvents();
}

document.addEventListener('DOMContentLoaded', init);
