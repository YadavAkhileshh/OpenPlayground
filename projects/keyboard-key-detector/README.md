# Modern Keyboard Detector 🎮⌨️

A sleek, modern keyboard event detector with deep dark contrast orange-red theme, real-time visual feedback, and comprehensive key tracking capabilities.

## ✨ Features

### 🎯 Core Functionality
- **Real-time Key Detection**: Instantly detects and displays key presses with detailed information
- **Visual Keyboard**: Interactive keyboard visualization showing pressed keys in real-time
- **Key Press History**: Track and review all pressed keys with timestamps
- **Comprehensive Statistics**: Monitor total keys, unique keys, and session metrics

### 🎨 Design & UI
- **Deep Dark Contrast Theme**: Sleek orange-red gradient color scheme
- **Modern Animations**: Smooth transitions, glowing effects, and interactive feedback
- **Responsive Design**: Fully responsive layout for desktop, tablet, and mobile
- **Glassmorphism Effects**: Modern UI with backdrop blur and transparency effects

### 🔧 Advanced Features
- **Key Testing Mode**: Practice mode with guided key sequence testing
- **Sound Effects**: Optional auditory feedback for key presses
- **Data Export**: Copy key history data to clipboard
- **Session Tracking**: Track statistics across your browsing session

## 📁 Project Structure

```
modern-keyboard-detector/
│
├── index.html          # Main HTML structure
├── style.css           # Deep dark orange-red themed CSS
├── script.js           # Keyboard detection and interaction logic
│
└── README.md           # This documentation file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic structure and modern elements
- **CSS3**: Advanced styling with CSS Grid, Flexbox, and custom properties
- **JavaScript (ES6+)**: Modern JavaScript with event handling and DOM manipulation
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Custom typography (Inter, Poppins, JetBrains Mono, Orbitron)

## 🎮 How to Use

### Basic Usage
1. **Open** the application in your browser
2. **Press any key** on your keyboard
3. **Observe** the real-time feedback in the key display
4. **Check** the history panel for your key press log
5. **Watch** the visual keyboard highlight pressed keys

### Advanced Features
- **Clear History**: Click the broom icon to reset all statistics
- **Toggle Sound**: Enable/disable auditory feedback
- **Key Test Mode**: Practice specific key sequences
- **Copy Data**: Export your key press history to clipboard

### Keyboard Shortcuts
- `Space`: Quick test (animates the space bar)
- `Esc`: Reset the current display
- `Tab`: Navigate between controls

## 🎨 Theme Details

### Color Palette
- **Primary**: `#ff3c00` (Vibrant Orange)
- **Secondary**: `#ff6b35` (Soft Orange)
- **Accent**: `#ff9500` (Golden Orange)
- **Background**: `#0a0a0a` (Deep Black)
- **Surface**: `#111111` (Dark Gray)
- **Text**: `#ffffff` (Pure White)

### Typography
- **Headers**: Poppins (Semi-bold, 600)
- **Body**: Inter (Regular, 400)
- **Code**: JetBrains Mono (Medium, 500)
- **Display**: Orbitron (Semi-bold, 600)

## 📱 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | ✅ Fully Supported | Recommended |
| Firefox 88+ | ✅ Fully Supported | Works perfectly |
| Safari 14+ | ✅ Fully Supported | Minor animation differences |
| Edge 90+ | ✅ Fully Supported | Based on Chromium |

## 🔧 Customization

### Changing Colors
Edit the CSS custom properties in `style.css`:

```css
:root {
    --primary: #ff3c00;      /* Change to your preferred color */
    --secondary: #ff6b35;    /* Secondary color */
    --accent: #ff9500;       /* Accent color */
    /* ... other variables ... */
}
```

### Modifying Keyboard Layout
Edit the `createKeyboard()` function in `script.js` to change the visual keyboard layout.

### Adding New Features
The modular JavaScript code makes it easy to add new features. Look for the `// Feature Functions` section in `script.js`.

## 🚀 Performance

- **Lightweight**: Under 200KB total (uncompressed)
- **Fast Loading**: Optimized for instant startup
- **Smooth Animations**: 60fps animations using CSS transitions
- **Memory Efficient**: Automatic cleanup of old history items

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Font Awesome** for the beautiful icons
- **Google Fonts** for the typography
- **Modern CSS** techniques from various online resources
- **Browser vendors** for implementing the KeyboardEvent API

## 📊 Project Stats

![Lines of Code](https://img.shields.io/badge/lines%20of%20code-850%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Status](https://img.shields.io/badge/status-active-brightgreen)

