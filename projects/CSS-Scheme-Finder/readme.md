# CSS Scheme Finder

An interactive web tool for finding and adjusting color schemes. Select a base color and the tool will search through predefined color schemes to find ones with similar colors, then optionally adjust the entire scheme to match your selected color.

## Features

- **Color Scheme Database:** Predefined collection of color schemes
- **Similarity Matching:** Finds schemes containing colors similar to your base color
- **Auto-Adjustment:** Automatically adjusts all colors in matched schemes to harmonize with your base color
- **Real-time Preview:** Instant visual feedback as you change colors
- **HSL Color Space:** Uses HSL color space for accurate color adjustments

## How to Use

1. Open `index.html` in a web browser
2. Pick a base color using the color picker
3. Toggle "Auto adjust schemes" to enable/disable automatic color adjustment
4. Browse through the displayed color schemes that match your selection

## Algorithm

- **Similarity Check:** Compares colors using HSL distance with configurable tolerance
- **Color Adjustment:** Calculates the difference between your base color and the matched color, then applies that difference to all colors in the scheme
- **HSL Manipulation:** Adjusts Hue, Saturation, and Lightness values to maintain color harmony

## Files

- `index.html`: Main interface with color picker and controls
- `app.js`: Scheme matching and adjustment logic
- `style.css`: Styling for the interface and color displays

## Technologies Used

- HTML5 for structure
- CSS3 for styling
- Vanilla JavaScript for color calculations and DOM manipulation

## License

This project is part of the dev-card-showcase repository.