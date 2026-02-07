# Vertical Clock

A sleek, animated digital clock that displays time using vertical scrolling digits, reminiscent of old slot machines. Features multiple themes, format options, and smooth CSS animations.

## Features

### Time Display
- **Vertical Scrolling Digits**: Each digit scrolls vertically to display the current time
- **Real-time Updates**: Updates every second with smooth animations
- **Slot Machine Effect**: Digits flip and scroll like casino slot machines

### Format Options
- **24-Hour Format**: Standard 24-hour time display (default)
- **12-Hour Format**: AM/PM format with period indicator
- **Format Toggle**: Switch between formats with a button click
- **Persistent Settings**: Remembers your format preference

### Visual Themes
- **Default Theme**: Clean, minimalist design with accent colors
- **Cards Theme**: Playing card-inspired design with suit symbols
  - Hearts (♥) and Diamonds (♦) in red
  - Spades (♠) and Clubs (♣) in black
  - Card-patterned backgrounds with flip animations

### Design Features
- **Responsive Layout**: Adapts to different screen sizes
- **Dark/Light Mode**: Automatic theme switching based on system preference
- **Smooth Animations**: CSS transitions for all state changes
- **Typography**: Space Mono font for a technical, monospace aesthetic

## Controls

### Time Format Toggle
- **Button**: "24-hour" / "12-hour" toggle button in top-left corner
- **Persistent**: Your choice is saved and restored on page reload

### Theme Selection
- **Dropdown**: Theme selector in top-left corner
- **Options**: Default and Cards themes
- **Persistent**: Theme preference is saved locally

## Technical Details

### Dependencies
- **Google Fonts**: Space Mono font family
- **CSS Grid**: For responsive layout
- **CSS Custom Properties**: For theme colors and variables
- **Local Storage**: For saving user preferences

### Browser Support
- Modern browsers with CSS Grid support
- CSS Custom Properties (CSS Variables)
- ES6+ JavaScript features
- Automatic dark/light mode detection

### Performance
- Lightweight vanilla JavaScript (no frameworks)
- CSS-only animations (hardware accelerated)
- Minimal DOM manipulation
- Efficient state management

## How to Run

1. **Open the Project**: Navigate to the `Vertical-clock` directory
2. **Launch**: Open `index.html` in any modern web browser
3. **Customize**: Use the controls in the top-left to change format and theme
4. **Enjoy**: Watch the time update with smooth scrolling animations

## Architecture

### HTML Structure
- **Wrapper**: Centered container for the clock
- **Clock Grid**: CSS Grid layout with digit columns and spacers
- **Control Panel**: Format toggle and theme selector
- **Digit Columns**: Individual columns for hours, minutes, seconds, and AM/PM

### CSS Organization
- **Root Variables**: Color scheme and sizing variables
- **Grid Layout**: Responsive column-based layout
- **Animation System**: Transform-based scrolling animations
- **Theme System**: Data attributes for theme switching

### JavaScript Logic
- **Time Calculation**: Real-time clock with format conversion
- **Animation Control**: CSS transform manipulation for digit scrolling
- **State Management**: Active digit highlighting and position tracking
- **Persistence**: Local storage for user preferences

## Customization

### Adding New Themes
Create new theme styles using data attributes:

```css
[data-theme="your-theme"] {
  --accent-color: #your-color;
  --background: #your-bg;
  --color: #your-text;
  /* Additional theme-specific styles */
}
```

### Modifying Digit Ranges
Adjust the HTML structure for different digit ranges:

```html
<div class="col digit">
  <span><span>0</span></span>
  <!-- Add or remove spans for different ranges -->
</div>
```

### Animation Timing
Modify transition durations in CSS:

```css
.col > span {
  transition: all 1s ease; /* Change timing here */
}
```

## Theme Details

### Default Theme
- Pink accent color (#ffaacc)
- Clean borders and backgrounds
- Subtle transparency effects
- Monospace digit display

### Cards Theme
- Blue accent color (#444cf7)
- Playing card suit symbols on active digits
- Patterned backgrounds with diagonal stripes
- 3D flip animation effects
- Card-inspired color scheme

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 10.3+)
- **Mobile Browsers**: Responsive design with touch support

## Accessibility

- **Keyboard Navigation**: Tab through interactive elements
- **Screen Readers**: Semantic HTML structure
- **Color Contrast**: High contrast ratios for readability
- **Reduced Motion**: Respects system motion preferences

## Contributing

The project uses vanilla web technologies for maximum compatibility:
- Pure HTML/CSS/JavaScript
- No build process required
- Easy to modify and extend
- Well-commented code structure

## License

This project is part of the Dev Card Showcase collection. See the main repository for licensing information.

## Credits

Inspired by vintage slot machines and modern digital interfaces. Built with clean, semantic HTML and efficient CSS animations.