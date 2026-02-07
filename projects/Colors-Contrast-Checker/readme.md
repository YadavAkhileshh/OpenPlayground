# Colors Contrast Checker

An interactive web tool for testing text contrast ratios against WCAG accessibility standards. Check all CSS named colors for compliance with AA and AAA accessibility guidelines.

## Features

### Color Testing
- **All CSS Named Colors**: Test every standard CSS color name (147 colors)
- **Interactive Swatches**: Click any color to test its contrast ratios
- **Sorted Display**: Colors organized from light to dark for easy browsing

### Contrast Analysis
- **WCAG Compliance**: Checks against AA (4.5:1) and AAA (7:1) standards
- **Text Size Categories**:
  - Small text (18.5px): Requires higher contrast ratios
  - Large text (24px): More lenient contrast requirements
  - UI components: Special contrast requirements for interactive elements

### Text Color Options
- **White Text**: Test contrast with white text on colored backgrounds
- **Black Text**: Test contrast with black text on colored backgrounds
- **Real-time Toggle**: Switch between text colors instantly

### Visual Preview
- **Live Preview**: See exactly how text appears on selected backgrounds
- **Sample Content**: Includes headings, body text, and icon examples
- **Background Adaptation**: Page background changes to match selected color

## WCAG Standards

### AA Level (Minimum)
- **Small Text** (< 18pt): 4.5:1 contrast ratio
- **Large Text** (≥ 18pt): 3:1 contrast ratio
- **UI Components**: 3:1 contrast ratio

### AAA Level (Enhanced)
- **Small Text**: 7:1 contrast ratio
- **Large Text**: 4.5:1 contrast ratio

## Technical Details

### Algorithm
- **Luminance Calculation**: Uses WCAG relative luminance formula
- **Contrast Ratio**: (L1 + 0.05) / (L2 + 0.05) where L is relative luminance
- **Color Parsing**: Extracts RGB values from computed CSS colors

### Dependencies
- **Vanilla JavaScript**: No external libraries required
- **CSS Grid**: For responsive swatch layout
- **CSS Custom Properties**: For theming and responsive design

### Performance
- **Efficient Rendering**: All colors pre-calculated on load
- **Instant Updates**: Real-time contrast calculation
- **Lightweight**: Minimal DOM manipulation

## How to Use

1. **Open the Tool**: Navigate to the `Colors-Contrast-Checker` directory
2. **Launch**: Open `index.html` in any modern web browser
3. **Select Colors**: Click on any color swatch to test its contrast
4. **Toggle Text**: Switch between white and black text using the buttons
5. **Check Results**: View WCAG compliance results in the preview panel

## Interface Elements

### Color Swatches
- **Grid Layout**: Responsive grid of color squares
- **Hover Effects**: Scale animation on hover
- **Active State**: Outline indicates currently selected color
- **Sorted Order**: Light to dark arrangement for logical browsing

### Preview Panel
- **Color Block**: Shows selected background color
- **Sample Text**: Realistic text examples at different sizes
- **Icons**: Common UI icons for component testing
- **Metadata**: Color name and hex value display

### Results Display
- **Pass/Fail Indicators**: Green checkmarks for passing, red X for failing
- **Multiple Categories**: Separate results for different text sizes
- **Real-time Updates**: Instant recalculation when changing text color

## Accessibility Features

### WCAG Compliance
- **Color Contrast**: Ensures text meets accessibility standards
- **Color Independence**: Works with system color preferences
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML structure

### Design Principles
- **High Contrast UI**: Tool itself meets WCAG standards
- **Clear Visual Hierarchy**: Easy to read results and labels
- **Responsive Design**: Works on all device sizes

## Color Collection

The tool includes all 147 CSS named colors:
- **Reds**: Crimson, FireBrick, DarkRed, etc.
- **Blues**: Navy, RoyalBlue, DodgerBlue, etc.
- **Greens**: ForestGreen, LimeGreen, SeaGreen, etc.
- **Neutrals**: White, Black, Gray, Silver, etc.
- **And more**: Purples, oranges, yellows, pinks, etc.

## Browser Compatibility

- **Modern Browsers**: Full support for all features
- **CSS Grid Support**: Required for swatch layout
- **ES6 Features**: Arrow functions, destructuring, etc.
- **Canvas Optional**: Not used in this implementation

## Customization

### Adding Colors
To test custom colors, modify the HTML list:

```html
<ul class="swatches">
  <li>MyCustomColor</li>
  <!-- Add more colors -->
</ul>
```

### Changing Standards
Modify contrast requirements in the `passFail` function:

```javascript
const passFail = (val, req) =>
  val >= req ? "✓ Pass" : "✕ Fail";
```

### Styling Updates
Customize appearance through CSS variables and classes.

## Educational Value

### Learning Contrast
- **Visual Examples**: See contrast ratios in action
- **Standard Reference**: WCAG guidelines made practical
- **Color Theory**: Understand luminance and perception

### Development Tool
- **Design Testing**: Check color combinations quickly
- **Compliance Verification**: Ensure accessibility standards
- **Color Selection**: Make informed color choices

## Performance Considerations

### Load Time
- **Pre-calculation**: All colors processed on page load
- **Minimal DOM**: Efficient HTML structure
- **No Images**: Pure CSS color rendering

### Memory Usage
- **Small Dataset**: Only 147 colors with minimal data per color
- **No External Resources**: Self-contained application

## Contributing

The project uses standard web technologies:
- Pure HTML/CSS/JavaScript
- No build process required
- Easy to modify and extend
- Well-commented accessibility calculations

## License

This project is part of the Dev Card Showcase collection. See the main repository for licensing information.

## Credits

Built using WCAG accessibility guidelines and standard web color specifications. Implements the official contrast ratio calculation formula for accurate accessibility testing.