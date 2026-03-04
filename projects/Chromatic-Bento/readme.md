# Chromatic Bento

A sophisticated web-based color palette design tool that helps designers create harmonious, accessible color schemes. Built with vanilla JavaScript, Chromatic Bento provides an intuitive interface for generating, editing, and analyzing color palettes with real-time contrast checking and export capabilities.

## Features

- **Interactive Color Editing**: Click on any color swatch to open the color picker and modify individual colors
- **Palette Generation**: Generate complete palettes from a base color using different harmony modes:
  - Analogous
  - Complementary
  - Triadic
- **Real-time Contrast Analysis**: Automatic WCAG contrast ratio calculations with AA/AAA compliance indicators
- **Color Temperature Mapping**: Visual representation of cool and warm tones in your palette
- **Harmony Visualization**: See how colors work together with harmony strips and role assignments
- **Type Hierarchy Preview**: Sample text styling with your color palette
- **Usage Examples**: See how your palette looks in real UI components
- **Export Functionality**: Export palettes as CSS custom properties or JSON data
- **Auto-Randomization**: Dynamic palette generation on page load (stops on user interaction)
- **Accessibility Focus**: Built-in contrast checking ensures readable combinations

## Color Roles

The tool uses a 6-color system with predefined roles:

- **Teal**: Base color, primary cool tone
- **Clay**: Warm accent, used for emphasis and CTAs
- **Sun**: Bright highlight, friendly accents
- **Sand**: Neutral background, structural elements
- **Sage**: Secondary neutral, subtle variations
- **Ink**: Dark text, strong contrast

## Technologies Used

- **HTML5**: Semantic structure and accessibility features
- **CSS3**: Custom properties for dynamic theming, CSS Grid for layout
- **Vanilla JavaScript**: No frameworks, pure DOM manipulation and color calculations
- **Color Theory Algorithms**: HSL color space conversions, contrast ratio calculations
- **Clipboard API**: Modern clipboard integration with fallback support

## How to Use

1. **Open the Application**: Open `index.html` in any modern web browser.

2. **Edit Colors Manually**:
   - Click on any color swatch in the "Palette Swatches" section
   - Use the color picker to select new values
   - See real-time updates across all interface elements

3. **Generate Palettes**:
   - Choose a base color in the "Palette Controls" section
   - Select a harmony mode (Analogous, Complementary, or Triadic)
   - Click "Generate" to create a complete palette

4. **Randomize**: Click "Randomize" for instant inspiration with randomly generated palettes.

5. **Check Contrast**: The "Contrast Ladder" shows WCAG compliance for key color combinations. Click "Check Contrast" to refresh calculations.

6. **Export Your Palette**:
   - Click "Export Palette" to copy CSS variables and JSON to clipboard
   - If clipboard access fails, it downloads as a text file

## Color Harmony Modes

- **Analogous**: Colors adjacent on the color wheel (harmonious, serene)
- **Complementary**: Colors opposite each other (high contrast, vibrant)
- **Triadic**: Three colors evenly spaced (balanced, energetic)

## Accessibility Features

- WCAG 2.1 AA/AAA contrast ratio compliance checking
- Semantic HTML structure
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader friendly labels

## Browser Support

Works in all modern browsers with ES6 support:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Development

This project is part of the [OpenPlayground](https://github.com/YadavAkhileshh/OpenPlayground) repository. To contribute:

1. Clone the repository
2. Navigate to `projects/Chromatic-Bento/`
3. Open `index.html` in your browser for development
4. Edit `app.js` for functionality, `style.css` for styling

## Algorithm Details

The palette generation uses HSL color space for accurate hue shifting and maintains consistent saturation/lightness relationships. Contrast calculations follow the WCAG relative luminance formula for precise accessibility compliance.

## License

This project follows the same license as the main OpenPlayground repository.