const moodColors = {
    happy: {
        primary: '#FFD700',
        secondary: '#FFA500',
        accent: '#FF6347',
        background: '#FFFACD',
        text: '#333333'
    },
    sad: {
        primary: '#4682B4',
        secondary: '#708090',
        accent: '#778899',
        background: '#F0F8FF',
        text: '#2F4F4F'
    },
    angry: {
        primary: '#DC143C',
        secondary: '#B22222',
        accent: '#FF4500',
        background: '#FFE4E1',
        text: '#8B0000'
    },
    calm: {
        primary: '#98FB98',
        secondary: '#AFEEEE',
        accent: '#87CEEB',
        background: '#F0FFFF',
        text: '#2E8B57'
    },
    excited: {
        primary: '#FF1493',
        secondary: '#FF69B4',
        accent: '#DC143C',
        background: '#FFF0F5',
        text: '#C71585'
    },
    peaceful: {
        primary: '#E6E6FA',
        secondary: '#DDA0DD',
        accent: '#BA55D3',
        background: '#F8F8FF',
        text: '#4B0082'
    },
    energetic: {
        primary: '#32CD32',
        secondary: '#00FF00',
        accent: '#ADFF2F',
        background: '#F0FFF0',
        text: '#006400'
    },
    melancholic: {
        primary: '#696969',
        secondary: '#808080',
        accent: '#A9A9A9',
        background: '#F5F5F5',
        text: '#2F2F2F'
    },
    // Additional moods for more variety
    romantic: {
        primary: '#FF69B4',
        secondary: '#FFC0CB',
        accent: '#FF1493',
        background: '#FFF0F5',
        text: '#8B0000'
    },
    mysterious: {
        primary: '#800080',
        secondary: '#4B0082',
        accent: '#9370DB',
        background: '#F8F8FF',
        text: '#2E2E2E'
    },
    adventurous: {
        primary: '#FF4500',
        secondary: '#FFD700',
        accent: '#32CD32',
        background: '#FFFACD',
        text: '#8B4513'
    },
    nostalgic: {
        primary: '#DEB887',
        secondary: '#F5DEB3',
        accent: '#D2B48C',
        background: '#FAF0E6',
        text: '#8B4513'
    },
    hopeful: {
        primary: '#00CED1',
        secondary: '#48D1CC',
        accent: '#20B2AA',
        background: '#F0FFFF',
        text: '#006400'
    },
    anxious: {
        primary: '#FFFF00',
        secondary: '#FFD700',
        accent: '#FFA500',
        background: '#FFFFE0',
        text: '#FF6347'
    },
    confident: {
        primary: '#000080',
        secondary: '#0000CD',
        accent: '#4169E1',
        background: '#F0F8FF',
        text: '#FFFFFF'
    },
    creative: {
        primary: '#FF6347',
        secondary: '#FF4500',
        accent: '#DC143C',
        background: '#FFE4E1',
        text: '#8B0000'
    },
    focused: {
        primary: '#000000',
        secondary: '#2F2F2F',
        accent: '#696969',
        background: '#FFFFFF',
        text: '#000000'
    },
    joyful: {
        primary: '#FFD700',
        secondary: '#FFA500',
        accent: '#FF6347',
        background: '#FFFACD',
        text: '#333333'
    },
    // Even more moods
    serene: {
        primary: '#E0FFFF',
        secondary: '#B0E0E6',
        accent: '#87CEEB',
        background: '#F0FFFF',
        text: '#4682B4'
    },
    passionate: {
        primary: '#DC143C',
        secondary: '#FF6347',
        accent: '#FF4500',
        background: '#FFE4E1',
        text: '#8B0000'
    },
    dreamy: {
        primary: '#DDA0DD',
        secondary: '#EE82EE',
        accent: '#DA70D6',
        background: '#F8F8FF',
        text: '#4B0082'
    },
    vibrant: {
        primary: '#FF1493',
        secondary: '#FF69B4',
        accent: '#FF00FF',
        background: '#FFF0F5',
        text: '#C71585'
    },
    earthy: {
        primary: '#8FBC8F',
        secondary: '#90EE90',
        accent: '#32CD32',
        background: '#F0FFF0',
        text: '#006400'
    },
    cool: {
        primary: '#00CED1',
        secondary: '#48D1CC',
        accent: '#20B2AA',
        background: '#E0FFFF',
        text: '#008B8B'
    },
    warm: {
        primary: '#FFDAB9',
        secondary: '#FFE4B5',
        accent: '#FFA500',
        background: '#FFFACD',
        text: '#FF6347'
    },
    bold: {
        primary: '#FF0000',
        secondary: '#DC143C',
        accent: '#B22222',
        background: '#FFE4E1',
        text: '#8B0000'
    },
    subtle: {
        primary: '#F5F5F5',
        secondary: '#D3D3D3',
        accent: '#A9A9A9',
        background: '#FFFFFF',
        text: '#696969'
    },
    dynamic: {
        primary: '#FF4500',
        secondary: '#FFD700',
        accent: '#32CD32',
        background: '#FFFACD',
        text: '#8B4513'
    }
};

const moodSelect = document.getElementById('mood');
const palette = document.getElementById('palette');
const exportCssBtn = document.getElementById('export-css');
const exportJsonBtn = document.getElementById('export-json');
const saveThemeBtn = document.getElementById('save-theme');
const customMoodName = document.getElementById('custom-mood-name');
const saveCustomMoodBtn = document.getElementById('save-custom-mood');
const loadCustomMoodBtn = document.getElementById('load-custom-mood');

// Event listeners
moodSelect.addEventListener('change', updatePalette);
exportCssBtn.addEventListener('click', exportAsCss);
exportJsonBtn.addEventListener('click', exportAsJson);
saveThemeBtn.addEventListener('click', saveTheme);
saveCustomMoodBtn.addEventListener('click', saveCustomMood);
loadCustomMoodBtn.addEventListener('click', loadCustomMood);

const colorInputs = document.querySelectorAll('.color-input');
colorInputs.forEach(input => {
    input.addEventListener('input', updateFromInput);
});

// Populate mood select with all moods
for (const mood in moodColors) {
    const option = document.createElement('option');
    option.value = mood;
    option.textContent = mood.charAt(0).toUpperCase() + mood.slice(1);
    moodSelect.appendChild(option);
}

function updatePalette() {
    const selectedMood = moodSelect.value;
    if (!selectedMood) {
        resetPalette();
        disableButtons();
        return;
    }
    
    const colors = moodColors[selectedMood];
    const colorElements = palette.querySelectorAll('.color');
    
    colorElements.forEach(el => {
        const type = el.id;
        const colorBox = el.querySelector('.color-box');
        const hexSpan = el.querySelector('.hex');
        const input = el.querySelector('.color-input');
        
        colorBox.style.backgroundColor = colors[type];
        hexSpan.textContent = colors[type];
        input.value = colors[type];
    });
    
    updatePreview();
    enableButtons();
}

function resetPalette() {
    const colorElements = palette.querySelectorAll('.color');
    colorElements.forEach(el => {
        const colorBox = el.querySelector('.color-box');
        const hexSpan = el.querySelector('.hex');
        const input = el.querySelector('.color-input');
        
        colorBox.style.backgroundColor = '#000000';
        hexSpan.textContent = '#000000';
        input.value = '#000000';
    });
    updatePreview();
}

function updateFromInput(e) {
    const type = e.target.id.replace('-input', '');
    const color = e.target.value;
    const colorEl = document.getElementById(type);
    colorEl.querySelector('.color-box').style.backgroundColor = color;
    colorEl.querySelector('.hex').textContent = color;
    updatePreview();
}

function updatePreview() {
    const root = document.documentElement;
    const colors = {};
    ['primary', 'secondary', 'accent', 'background', 'text'].forEach(type => {
        colors[type] = document.getElementById(type).querySelector('.hex').textContent;
        root.style.setProperty(`--${type}`, colors[type]);
    });
}

function enableButtons() {
    exportCssBtn.disabled = false;
    exportJsonBtn.disabled = false;
    saveThemeBtn.disabled = false;
}

function disableButtons() {
    exportCssBtn.disabled = true;
    exportJsonBtn.disabled = true;
    saveThemeBtn.disabled = true;
}

function exportAsCss() {
    const colors = getCurrentColors();
    const css = `:root {
  --primary: ${colors.primary};
  --secondary: ${colors.secondary};
  --accent: ${colors.accent};
  --background: ${colors.background};
  --text: ${colors.text};
}`;
    copyToClipboard(css, 'CSS');
}

function exportAsJson() {
    const colors = getCurrentColors();
    const json = JSON.stringify(colors, null, 2);
    copyToClipboard(json, 'JSON');
}

function getCurrentColors() {
    const colors = {};
    ['primary', 'secondary', 'accent', 'background', 'text'].forEach(type => {
        colors[type] = document.getElementById(type).querySelector('.hex').textContent;
    });
    return colors;
}

function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text).then(() => {
        alert(`${type} copied to clipboard!`);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert(`Copy this ${type}:\n` + text);
    });
}

function saveTheme() {
    const colors = getCurrentColors();
    localStorage.setItem('savedTheme', JSON.stringify(colors));
    alert('Theme saved!');
}

function saveCustomMood() {
    const name = customMoodName.value.trim();
    if (!name) {
        alert('Please enter a mood name.');
        return;
    }
    const colors = getCurrentColors();
    const customMoods = JSON.parse(localStorage.getItem('customMoods') || '{}');
    customMoods[name] = colors;
    localStorage.setItem('customMoods', JSON.stringify(customMoods));
    alert('Custom mood saved!');
    updateMoodSelect();
}

function loadCustomMood() {
    const customMoods = JSON.parse(localStorage.getItem('customMoods') || '{}');
    const names = Object.keys(customMoods);
    if (names.length === 0) {
        alert('No custom moods saved.');
        return;
    }
    const name = prompt('Enter mood name to load:');
    if (name && customMoods[name]) {
        moodColors[name] = customMoods[name];
        moodSelect.value = name;
        updatePalette();
    } else {
        alert('Mood not found.');
    }
}

function updateMoodSelect() {
    // Clear existing custom options
    const options = moodSelect.querySelectorAll('option');
    options.forEach(option => {
        if (!moodColors.hasOwnProperty(option.value) || option.value === '') return;
        if (!Object.keys(moodColors).includes(option.value)) {
            option.remove();
        }
    });
    // Add custom moods
    const customMoods = JSON.parse(localStorage.getItem('customMoods') || '{}');
    for (const name in customMoods) {
        if (!moodSelect.querySelector(`option[value="${name}"]`)) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
            moodSelect.appendChild(option);
        }
    }
}

// Load saved theme on page load
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('savedTheme');
    if (savedTheme) {
        const colors = JSON.parse(savedTheme);
        for (const type in colors) {
            const el = document.getElementById(type);
            el.querySelector('.color-box').style.backgroundColor = colors[type];
            el.querySelector('.hex').textContent = colors[type];
            el.querySelector('.color-input').value = colors[type];
        }
        updatePreview();
        enableButtons();
    }
    updateMoodSelect();
});