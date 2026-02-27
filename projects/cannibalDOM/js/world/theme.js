/* js/world/theme.js */
export const Themes = {
    dark: {
        background: '#2c3e50',
        text: '#ecf0f1',
        primary: '#e74c3c',
        secondary: '#3498db'
    },
    light: {
        background: '#ecf0f1',
        text: '#2c3e50',
        primary: '#3498db',
        secondary: '#9b59b6'
    },
    neon: {
        background: '#000000',
        text: '#00ff00',
        primary: '#ff00ff',
        secondary: '#00ffff'
    }
};

export const getRandomTheme = () => {
    const keys = Object.keys(Themes);
    return Themes[keys[Math.floor(Math.random() * keys.length)]];
};
