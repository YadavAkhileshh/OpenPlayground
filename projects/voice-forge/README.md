# VoiceForge - Advanced Speech AI Platform

![VoiceForge](https://img.shields.io/badge/VoiceForge-Advanced%20Speech%20AI-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-purple)

A modern, dark-themed web application for advanced Text-to-Speech (TTS) and Speech-to-Text (STT) conversion with real-time audio visualization.

## ✨ Features

### 🎤 **Text-to-Speech (TTS)**
- **Multiple AI Voices**: Natural-sounding voices with emotional inflection
- **Real-time Controls**: Adjust speed, pitch, and volume on-the-fly
- **Live Audio Visualization**: CSS-based visualizer that responds to speech output
- **Voice Customization**: Fine-tune parameters for personalized speech
- **Playback Controls**: Play, pause, resume, and stop functionality

### 🎙️ **Speech-to-Text (STT)**
- **Real-time Transcription**: Convert speech to text with live updates
- **Multi-language Support**: 10+ languages including English, Spanish, French, etc.
- **Echo Cancellation**: Advanced echo prevention for accurate transcription
- **Confidence Scoring**: Shows accuracy percentage of transcription
- **Export Options**: Save transcripts as text files or download audio recordings

### 🎨 **Visual Features**
- **Dark Theme UI**: Modern dark interface with gradient accents
- **Animated Background**: Dynamic particle system and grid lines
- **Audio Visualizer**: Real-time CSS-based audio visualization
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Smooth Animations**: Fluid transitions and interactive elements

### 🔧 **Technical Features**
- **No External Dependencies**: Pure HTML/CSS/JavaScript implementation
- **Web Audio API**: Advanced audio processing and analysis
- **MediaRecorder API**: Audio recording and download capabilities
- **SpeechSynthesis API**: Native browser TTS functionality
- **SpeechRecognition API**: Native browser STT functionality

## 📁 Project Structure

```
voice-forge/
├── index.html          # Main HTML file
├── style.css           # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md           # This file
```
## 🖥️ Browser Compatibility

| Browser | TTS Support | STT Support | Notes |
|---------|-------------|-------------|-------|
| **Google Chrome** | ✅ Excellent | ✅ Excellent | Best experience |
| **Microsoft Edge** | ✅ Excellent | ✅ Excellent | Chromium-based |
| **Firefox** | ✅ Good | ⚠️ Limited | Some STT limitations |
| **Safari** | ✅ Good | ⚠️ Limited | Limited Web Speech API |
| **Mobile Browsers** | ✅ Good | ⚠️ Limited | Use Chrome for best results |

## 🎯 Usage Guide

### Text-to-Speech
1. **Navigate** to the TTS section
2. **Enter text** in the input box (or use sample text)
3. **Select a voice** from the dropdown menu
4. **Adjust parameters** (speed, pitch, volume)
5. **Click "Speak Text"** to generate speech
6. **Watch the visualizer** respond to audio output

### Speech-to-Text
1. **Navigate** to the STT section
2. **Click the microphone** or "Start Listening" button
3. **Allow microphone access** when prompted
4. **Speak clearly** into your microphone
5. **View live transcription** as you speak
6. **Save or copy** the transcript when done

### Tips for Best Results
- **Use headphones** for STT to prevent echo
- **Enable Echo Cancellation** in STT settings
- **Adjust microphone sensitivity** based on your environment
- **Use Chrome/Edge** for full functionality
- **Allow all permissions** when prompted by browser

## 🔧 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Microphone not working** | Check browser permissions, ensure mic is not muted |
| **No speech output** | Check browser TTS support, try different voice |
| **Echo in STT** | Enable echo cancellation, use headphones |
| **Visualizer not working** | Refresh page, check browser console for errors |
| **Slow performance** | Close other tabs, update browser to latest version |

### Browser Permissions
The application requires:
- **Microphone access** for Speech-to-Text
- **Audio playback** permission for Text-to-Speech
- **No special cookies** or localStorage requirements

## 📱 Mobile Usage

VoiceForge is fully responsive and works on mobile devices:
- **Touch-optimized** controls and buttons
- **Mobile-friendly** visualizer
- **Adaptive layout** for all screen sizes
- **Gesture support** for interactive elements

## 🔒 Privacy & Security

- **No data storage**: All processing happens in your browser
- **No server communication**: No audio or text sent to external servers
- **Local processing**: Everything runs on your device
- **Permission-based**: Requires explicit user consent for microphone

## 🌐 API Usage

### Web Speech API
The application uses the following browser APIs:
- **SpeechSynthesis** for TTS
- **SpeechRecognition** for STT
- **Web Audio API** for visualization
- **MediaRecorder** for audio recording

### Browser Requirements
- Modern browser with ES6+ support
- Web Speech API enabled
- Microphone access permissions
- Audio playback capability

## 🎨 Customization

### Theme Customization
Modify CSS variables in `style.css`:
```css
:root {
    --primary: #6C63FF;
    --dark-bg: #0F0F1E;
    --text-primary: #FFFFFF;
    /* Add your custom colors */
}
```

### Adding Voices
Add custom voice options in `script.js`:
```javascript
const defaultVoices = [
    'Alex (Natural Male)',
    'Samantha (Natural Female)',
    // Add your custom voices here
];
```

## 📈 Performance

- **Lightweight**: No heavy frameworks or libraries
- **Fast loading**: Optimized CSS and JavaScript
- **Smooth animations**: 60fps visualizations
- **Memory efficient**: Proper cleanup of audio resources

## 🙏 Acknowledgments

- **Web Speech API** by W3C
- **Font Awesome** for icons
- **Google Fonts** for typography
- **Unsplash** for AI imagery
- **Contributors** and testers
