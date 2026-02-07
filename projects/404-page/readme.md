# 404 Error Page Animation

A creative and delightful 404 error page that transforms the "404" into an animated face using SVG and CSS animations. This project demonstrates advanced CSS animation techniques and SVG manipulation to create an engaging user experience for error pages.

## Animation Sequence

The 404 page comes to life through a carefully choreographed animation sequence:

1. **Eyes Appear**: The number "4" transforms into eyes that slide down from above
2. **Blinking**: Eye lids periodically blink with smooth animations
3. **Pupil Movement**: Pupils look left and right, then blink vertically
4. **Nose Forms**: The number "0" becomes a nose that slides down
5. **Mouth Appears**: A smile forms as mouth pieces animate from both sides

## Features

- **Smooth Animations**: Fluid transitions using CSS keyframes and cubic-bezier timing
- **Dark Mode Support**: Automatic light/dark theme detection using `light-dark()` CSS function
- **Responsive Design**: Font sizes adapt using `clamp()` for optimal viewing on all devices
- **Accessibility**: Proper ARIA labels and semantic HTML structure
- **Performance Optimized**: Hardware-accelerated CSS animations
- **Creative Concept**: Innovative transformation of error numbers into facial features

## Technologies Used

- **HTML5**: Semantic structure with SVG integration
- **CSS3**: Advanced features including:
  - CSS Custom Properties (CSS Variables)
  - `light-dark()` color function for theme support
  - `clamp()` for responsive typography
  - Complex keyframe animations
  - CSS Grid for layout
- **SVG**: Scalable vector graphics with stroke animations
- **No JavaScript**: Pure CSS animations for optimal performance

## How It Works

### SVG Structure
The face is built using SVG elements:
- **Eyes**: Two symmetrical eye shapes with lids and pupils
- **Nose**: A rectangular shape that animates downward
- **Mouth**: Two curved paths that form a smile from left and right

### Animation Techniques

**Eyes Animation (`eyes` keyframe)**:
```css
@keyframes eyes {
  from { transform: translateY(112.5px); }
  to { transform: translateY(15px); }
}
```

**Blinking (`eye-lid` keyframe)**:
```css
@keyframes eye-lid {
  from, 40%, 45%, to { transform: translateY(0); }
  42.5% { transform: translateY(17.5px); }
}
```

**Pupil Movement (`pupil` keyframe)**:
Complex animation combining horizontal movement and vertical blinking using `stroke-dashoffset` and `transform`.

**Mouth Formation**:
Left and right mouth pieces animate using `stroke-dashoffset` to create the appearance of drawing the smile.

### Color Scheme
- **Light Theme**: Soft blue-gray hues (HSL: 223, 10%, 95% background)
- **Dark Theme**: Dark blue-gray (HSL: 223, 10%, 5% background)
- **Automatic Detection**: Uses `color-scheme: light dark` and `light-dark()` function

## Browser Support

- **Modern Browsers**: Full support for CSS animations, SVG, and modern color functions
- **Chrome 96+**: Support for `light-dark()` color function
- **Firefox 120+**: Recent versions support modern CSS features
- **Safari 15.4+**: Support for `light-dark()` and advanced animations
- **Progressive Enhancement**: Graceful degradation on older browsers

## Learning Outcomes

This project demonstrates advanced web animation techniques:

- **SVG Animation**: Using CSS to animate SVG stroke properties
- **Complex Keyframes**: Multi-stage animations with precise timing
- **Modern CSS**: Cutting-edge features like `light-dark()` and `clamp()`
- **Performance**: Hardware-accelerated animations without JavaScript
- **Creative Problem Solving**: Transforming static error pages into engaging experiences
- **Accessibility**: Creating inclusive animations with proper labeling

## Technical Details

### Animation Timing
- **Initial Animation**: 1s duration with 0.3s delay using `cubic-bezier(0.65, 0, 0.35, 1)`
- **Blinking Cycle**: 4s infinite loop with 1.3s initial delay
- **Mouth Formation**: Uses `cubic-bezier(0.33, 1, 0.68, 1)` for natural easing

### CSS Custom Properties
```css
:root {
  --hue: 223;
  --sat: 10%;
  --light: hsl(var(--hue), var(--sat), 95%);
  --dark: hsl(var(--hue), var(--sat), 5%);
  --trans-dur: 0.3s;
}
```

### Responsive Typography
```css
font-size: clamp(1rem, 0.95rem + 0.25vw, 1.25rem);
```

## Usage

Simply open `index.html` in any modern web browser to see the animation. The page is self-contained with no external dependencies and works offline.

## Inspiration

This project was created for the CodePen community, demonstrating how error pages can be transformed from frustrating experiences into delightful moments through creative animation and thoughtful design.

## Customization

The animation can be customized by modifying:
- **Color Scheme**: Change `--hue` and `--sat` values in CSS custom properties
- **Animation Speed**: Adjust `animation-duration` values
- **Timing**: Modify `animation-delay` and keyframe percentages
- **Face Features**: Edit SVG paths and animation transforms

Perfect for developers looking to create memorable error pages or learn advanced CSS animation techniques!