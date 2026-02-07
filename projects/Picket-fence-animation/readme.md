# Picket Fence Animation

An interactive optical illusion animation that demonstrates the power of modern CSS scroll-based animations. This project creates a mesmerizing picket fence effect where vertical stripes appear to move as you scroll, creating the illusion of motion through clever use of CSS animation-timeline.

## Features

- **Optical Illusion**: Creates a visual effect where stationary stripes appear to move when scrolling
- **Multiple Themes**: Choose between different animated subjects (running man, cheetah, BMX biker)
- **Scroll-Based Animation**: Uses the modern `animation-timeline: scroll()` CSS property
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Performance**: Hardware-accelerated CSS animations

## How It Works

The animation works by:
1. Using `animation-timeline: scroll()` to tie the animation progress to scroll position
2. Applying a striped background that moves horizontally as you scroll
3. Combining this with animated character sprites to create the optical illusion

## Controls

- **Man**: Select to see a running man animation
- **Cheetah**: Switch to a fast cheetah running animation
- **Bike**: Choose the BMX biker animation

## Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern CSS features including:
  - `animation-timeline: scroll()`
  - CSS custom properties (`@property`)
  - Layered styling with `@layer`
  - Gradient backgrounds
- **JavaScript**: Minimal JS for interactive controls

## Browser Support

Requires a modern browser that supports `animation-timeline: scroll()`:
- Chrome 115+
- Edge 115+
- Firefox (limited support)
- Safari (limited support)

## Learning Outcomes

This project demonstrates:
- Advanced CSS animation techniques
- Scroll-based animations
- Optical illusions in web design
- Modern CSS features and fallbacks
- Responsive design principles

## Usage

Simply open `index.html` in a supported browser and start scrolling to see the animation in action. Use the radio buttons at the bottom to switch between different character animations.