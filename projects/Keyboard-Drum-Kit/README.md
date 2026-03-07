# 🥁 Keyboard Drum Kit

An interactive drum machine that lets you create beats using your keyboard! Press different keys to trigger realistic drum sounds powered by the Web Audio API.

## 🎮 How to Play

Use your keyboard to trigger drum sounds. Each key plays a different drum sample:

### Key Mappings:
- **Q** = Kick Drum (deep bass sound)
- **W** = Snare (sharp crack)
- **E** = Hi-Hat (metallic sizzle)
- **R** = Tom (resonant tone)
- **A** = Clap (hand clap sound)
- **S** = Cymbal (crash cymbal)
- **D** = Percussion (additional rhythm)
- **F** = Bass (low-frequency tone)

### Mouse Alternative:
You can also click on the drum pads directly with your mouse for the same effect.

## 🎵 Features

- **Web Audio API**: Generates realistic drum sounds using oscillators and filters
- **Visual Feedback**: Animated drum pads that respond to your input
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Modern glassmorphism UI with hover effects
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance Optimized**: Efficient audio generation with proper cleanup

## 🛠️ Technical Details

### Audio Generation
- Uses Web Audio API oscillators (sine, square, sawtooth, triangle waves)
- Applies filters and envelopes for realistic drum timbres
- Adds noise components for cymbals and hi-hats
- Proper audio context management for browser compatibility

### Code Structure
- `index.html` - Main HTML structure
- `style.css` - Modern CSS with animations and responsive design
- `script.js` - Web Audio API implementation and event handling

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🎯 Learning Objectives

This project demonstrates:
- Web Audio API usage
- Keyboard event handling
- CSS animations and transitions
- Responsive web design
- Audio synthesis techniques
- User interaction patterns

## 🚀 Getting Started

1. Open `index.html` in a modern web browser
2. Click anywhere or press a key to initialize audio
3. Start playing drums with Q, W, E, R, A, S, D, F keys
4. Experiment with different combinations to create rhythms

## 🎨 Customization

### Adding New Drum Sounds
Edit the `drumPads` array in `script.js`:

```javascript
{ key: 'X', name: 'New Drum', frequency: 250, type: 'triangle', duration: 0.3 }
```

### Changing Colors
Modify the CSS variables in `style.css` to customize the appearance.

### Audio Parameters
Adjust frequency, duration, and oscillator type for different sounds.

## 🐛 Troubleshooting

### No Sound?
- Make sure you've clicked or pressed a key first (browsers require user interaction)
- Check browser console for Web Audio API errors
- Try refreshing the page

### Performance Issues?
- Close other browser tabs using audio
- The app automatically manages audio resources

### Mobile Issues?
- Some mobile browsers have limited Web Audio API support
- Use desktop browsers for best experience

## 🤝 Contributing

Feel free to:
- Add new drum sounds
- Improve the visual design
- Add recording/playback features
- Enhance mobile support

## 📄 License

Part of the Community Card Showcase project.

---

**Have fun making music! 🎶**