export const PRESETS = {
    'focus-deep': {
        name: 'Deep Focus',
        channels: {
            'brown-noise': 40,
            'rain': 20
        }
    },
    'cafe-morning': {
        name: 'Morning Cafe',
        channels: {
            'cafe': 50,
            'rain': 10
        }
    },
    'forest-zen': {
        name: 'Forest Zen',
        channels: {
            'forest': 40,
            'wind': 30
        }
    },
    'pure-silence': {
        name: 'Silence',
        channels: {}
    }
};

export const SOUND_LIBRARY = {
    'rain': { type: 'file', url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3', label: 'Rain' },
    'forest': { type: 'file', url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-bird-singing-1210.mp3', label: 'Forest' },
    'cafe': { type: 'file', url: 'https://assets.mixkit.co/sfx/preview/mixkit-restaurant-ambience-loop-2139.mp3', label: 'Cafe' },
    'wind': { type: 'file', url: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-through-trees-1224.mp3', label: 'Wind' },
    'white-noise': { type: 'noise', subtype: 'white', label: 'White Noise' },
    'pink-noise': { type: 'noise', subtype: 'pink', label: 'Pink Noise' },
    'brown-noise': { type: 'noise', subtype: 'brown', label: 'Brown Noise' }
};
