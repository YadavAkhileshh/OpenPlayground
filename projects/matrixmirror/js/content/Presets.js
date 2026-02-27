/**
 * @file Presets.js
 * @description predefined configurations for different aesthetics.
 */

export const PRESETS = {
    'MATRIX_DEFAULT': {
        ascii: {
            density: 12,
            charSet: 'custom',
            invert: false,
            brightness: 1.0,
            contrast: 1.2
        },
        render: {
            colorMode: 'matrix',
            phosphorFade: 0.3,
            scanlines: true
        },
        effects: {
            digitalRain: true
        }
    },
    'TERMINAL_Retro': {
        ascii: {
            density: 16,
            charSet: 'standard',
            invert: false,
            brightness: 1.2,
            contrast: 1.5
        },
        render: {
            colorMode: 'matrix',
            phosphorFade: 0.6, // High persistence
            scanlines: true
        },
        effects: {
            digitalRain: false
        }
    },
    'HEATMAP_Vision': {
        ascii: {
            density: 10,
            charSet: 'blocks',
            invert: true,
            brightness: 1.0,
            contrast: 1.0
        },
        render: {
            colorMode: 'heatmap',
            phosphorFade: 0.1,
            scanlines: false
        },
        effects: {
            digitalRain: false
        }
    },
    'CYBER_PUNK': {
        ascii: {
            density: 14,
            charSet: 'katakana',
            invert: false,
            brightness: 1.1,
            contrast: 1.3
        },
        render: {
            colorMode: 'truecolor',
            phosphorFade: 0.2,
            scanlines: true
        },
        effects: {
            digitalRain: true
        }
    },
    'INK_PAPER': {
        ascii: {
            density: 8,
            charSet: 'standard',
            invert: true, // Black on white
            brightness: 1.1,
            contrast: 1.4
        },
        render: {
            colorMode: 'matrix', // Will need a tweak for black-on-white logic or use truecolor
            phosphorFade: 0.05,
            scanlines: false
        },
        effects: {
            digitalRain: false
        }
    }
};
