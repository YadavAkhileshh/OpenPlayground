# Named Color Finder

A web application that helps developers and designers find CSS named colors that closely match any selected color. Simply pick a color using the color picker, and the app will display all CSS named colors within a similarity threshold, showing both the color name and hex value.

## Features

- **Color Picker Interface**: Easy-to-use HTML5 color input for selecting base colors
- **Similarity Matching**: Finds CSS named colors within a configurable tolerance range
- **Visual Display**: Each matching color is displayed as a colored card with the name and hex code
- **Responsive Grid Layout**: Adapts from 5 columns on desktop to 1 column on mobile
- **Real-time Updates**: Results update instantly as you change the selected color
- **Complete Color Database**: Includes all 147 standard CSS named colors

## How It Works

The application uses color distance calculation in RGB space to find named colors similar to your selected color:

1. **Color Selection**: Choose a base color using the HTML5 color picker
2. **RGB Conversion**: Convert the selected hex color to RGB values
3. **Distance Calculation**: Compare the base color with each CSS named color using the formula: `|R1-R2| + |G1-G2| + |B1-B2|`
4. **Filtering**: Display only colors where the total RGB difference is within the tolerance threshold (default: 100)
5. **Visual Rendering**: Show matching colors in a responsive grid with color swatches

## Technologies Used

- **HTML5**: Semantic structure with color input element
- **CSS3**: Grid layout, responsive design, custom styling with Poppins font
- **JavaScript (Vanilla)**: Color processing, DOM manipulation, event handling
- **CSS Named Colors Database**: Complete list of 147 standard web colors with RGB and hex values

## Usage

1. Open `index.html` in any modern web browser
2. Click on the color picker input to select your base color
3. The app will automatically display similar CSS named colors
4. Each result shows the color name and its hex code
5. Change the base color to see different matches

## Color Matching Algorithm

The similarity is calculated using Manhattan distance in RGB color space:

```
distance = |baseRed - namedRed| + |baseGreen - namedGreen| + |baseBlue - namedBlue|
```

Colors with distance ≤ 100 are considered similar and displayed.

## Browser Support

- **Modern Browsers**: Full support for HTML5 color input
- **Mobile Browsers**: Touch-friendly color picker interface
- **Responsive**: Works on all screen sizes from mobile to desktop

## Learning Outcomes

This project demonstrates:
- Working with HTML5 form inputs (color picker)
- Color theory and RGB color space calculations
- Array filtering and manipulation in JavaScript
- Responsive CSS Grid layouts
- Real-time DOM updates based on user input
- Integration of external fonts (Google Fonts)

## Customization

You can modify the `tolerance` variable in the JavaScript to change how strict the color matching is:
- Lower values (e.g., 50): More precise matches, fewer results
- Higher values (e.g., 150): Broader matches, more results

## CSS Named Colors Included

The app includes all standard CSS color names from the W3C specification, including:
- Basic colors (red, blue, green, etc.)
- Extended colors (aliceblue, antiquewhite, etc.)
- Gray scale variations
- Specialty colors (rebeccapurple, etc.)

Perfect for developers who need to find the closest named color equivalent for any hex color!