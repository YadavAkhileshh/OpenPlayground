/**
 * Color.js – HSL/RGB color utilities, palettes, and SDF heatmap sampling.
 */
const Color = (() => {
    'use strict';

    const rgb = (r, g, b, a = 1) => ({ r: Math.round(r), g: Math.round(g), b: Math.round(b), a });

    function hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
        return rgb((r + m) * 255, (g + m) * 255, (b + m) * 255);
    }
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const i = parseInt(hex, 16);
        return rgb((i >> 16) & 255, (i >> 8) & 255, i & 255);
    }
    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    const toCss = (r, g, b, a = 1) => a >= 1 ? `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})` : `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(3)})`;
    const hslCss = (h, s, l, a = 1) => a >= 1 ? `hsl(${h},${s}%,${l}%)` : `hsla(${h},${s}%,${l}%,${a.toFixed(3)})`;

    function lerpRgb(c0, c1, t) {
        return rgb(c0.r + (c1.r - c0.r) * t, c0.g + (c1.g - c0.g) * t, c0.b + (c1.b - c0.b) * t,
            (c0.a ?? 1) + ((c1.a ?? 1) - (c0.a ?? 1)) * t);
    }
    function gradientSample(stops, t) {
        if (t <= stops[0].t) return stops[0];
        if (t >= stops[stops.length - 1].t) return stops[stops.length - 1];
        for (let i = 0; i < stops.length - 1; i++) {
            const a = stops[i], b = stops[i + 1];
            if (t >= a.t && t <= b.t) return lerpRgb(a, b, (t - a.t) / (b.t - a.t));
        }
        return stops[stops.length - 1];
    }

    const SDF_PALETTE = [
        { t: 0.00, ...hexToRgb('#1e1b4b') }, { t: 0.25, ...hexToRgb('#4c1d95') },
        { t: 0.50, ...hexToRgb('#7c3aed') }, { t: 0.75, ...hexToRgb('#c084fc') }, { t: 1.00, ...hexToRgb('#f0abfc') }
    ];
    const PARTICLE_PALETTE = [
        { t: 0.00, ...hexToRgb('#3b0764') }, { t: 0.40, ...hexToRgb('#7c3aed') },
        { t: 0.75, ...hexToRgb('#a78bfa') }, { t: 1.00, ...hexToRgb('#ede9fe') }
    ];
    const GRADIENT_PALETTE = [
        { t: 0.00, ...hexToRgb('#0f172a') }, { t: 0.33, ...hexToRgb('#1d4ed8') },
        { t: 0.66, ...hexToRgb('#06b6d4') }, { t: 1.00, ...hexToRgb('#6ee7f7') }
    ];
    const VELOCITY_PALETTE = [
        { t: 0.00, ...hexToRgb('#1e1b4b') }, { t: 0.20, ...hexToRgb('#065f46') },
        { t: 0.55, ...hexToRgb('#d97706') }, { t: 1.00, ...hexToRgb('#ef4444') }
    ];

    const sampleSDF = (t) => gradientSample(SDF_PALETTE, t);
    const sampleParticle = (t) => gradientSample(PARTICLE_PALETTE, t);
    const sampleGradient = (t) => gradientSample(GRADIENT_PALETTE, t);
    const sampleVelocity = (t) => gradientSample(VELOCITY_PALETTE, t);

    function glowColor(t, alpha = 0.6) { const c = sampleParticle(t); return toCss(c.r, c.g, c.b, alpha); }

    function writePixel(data, off, r, g, b, a = 255) { data[off] = r; data[off + 1] = g; data[off + 2] = b; data[off + 3] = a; }
    const luminance = (r, g, b) => 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
    const contrastColor = (r, g, b) => luminance(r, g, b) > 0.5 ? '#000000' : '#ffffff';

    const NAMED = {
        accent: hexToRgb('#7c3aed'), gold: hexToRgb('#d4a017'), cyan: hexToRgb('#22d3ee'),
        white: rgb(255, 255, 255), black: rgb(0, 0, 0),
    };

    return {
        rgb, hexToRgb, hslToRgb, rgbToHex, toCss, hslCss,
        lerpRgb, gradientSample,
        SDF_PALETTE, PARTICLE_PALETTE, GRADIENT_PALETTE, VELOCITY_PALETTE,
        sampleSDF, sampleParticle, sampleGradient, sampleVelocity,
        glowColor, writePixel, luminance, contrastColor, NAMED
    };
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.Color = Color;
