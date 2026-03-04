# Tron Minesweeper

A futuristic, 3D-themed take on the classic Minesweeper game, featuring Tron-inspired visuals, glowing animations, and immersive 3D effects. Built as a CodePen challenge, this game combines traditional Minesweeper logic with stunning visual effects using GSAP animations and CSS 3D transforms.

## Features

- **3D Tron Aesthetics**: Immersive 3D grid with glowing surfaces and dynamic lighting effects
- **Classic Minesweeper Logic**: 6x6 grid with 6 hidden mines, proximity numbers, and auto-clearing
- **Interactive Animations**: GSAP-powered glowing trails, hover effects, and smooth transitions
- **Dual Control Modes**:
  - **Mouse**: Left-click to clear cells, right-click to flag/detect mines
  - **Touch**: Toggle switch for detect mode on mobile devices
- **Real-time Stats**: Live tracking of detected mines, click count, and elapsed time
- **First-Click Safety**: Automatically moves mines away from your first click
- **Auto-Clearing**: Empty areas clear automatically like traditional Minesweeper
- **Win/Lose Conditions**: Clear all non-mine cells to win, hit a mine to lose
- **Responsive Design**: Works on both desktop and mobile devices

## How to Play

1. **Objective**: Clear all cells that don't contain mines without clicking on any mines.

2. **Controls**:
   - **Desktop**: Left-click to clear a cell, right-click to flag/detect a mine
   - **Mobile**: Tap to clear, use the toggle switch to enter detect mode, then tap to flag

3. **Gameplay**:
   - Numbers indicate how many mines are adjacent to that cell
   - Use logic to deduce mine locations
   - Flag suspected mines to mark them
   - Clear all safe cells to win

4. **Special Features**:
   - First click is always safe (mine moves if present)
   - Empty areas auto-clear recursively
   - Visual feedback with glowing animations

## Technologies Used

- **HTML5**: Semantic structure with 3D CSS transforms
- **CSS3**: Advanced styling with 3D perspective, gradients, filters, and animations
- **Vanilla JavaScript**: Game logic, event handling, and DOM manipulation
- **GSAP (GreenSock Animation Platform)**: High-performance animations and timeline controls
- **SVG**: Custom gradients and filters for visual effects

## Game Mechanics

- **Grid Size**: 6×6 (36 cells total)
- **Mine Count**: 6 mines (16.7% mine density)
- **Proximity Numbers**: 1-8 indicating adjacent mines
- **Auto-Clearing**: Recursive clearing of empty areas
- **First-Click Protection**: Mines relocate on initial click if hit
- **Detection System**: Flag mines to track progress (6/6 required)

## Visual Effects

- **Glowing Trails**: Animated light patterns that sweep across the grid
- **3D Perspective**: Isometric view with mouse-controlled rotation
- **Surface Glow**: Individual cell highlighting on hover/interaction
- **Color-Coded Feedback**: Different colors for various game states
- **Particle Effects**: Dynamic lighting and shadow effects

## Browser Compatibility

Requires modern browser support for:
- CSS 3D Transforms
- ES6 JavaScript features
- SVG filters and gradients

Compatible with:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Development

This project is part of the [OpenPlayground](https://github.com/YadavAkhileshh/OpenPlayground) repository. Originally created as a CodePen challenge.

To modify or extend:
1. Clone the repository
2. Navigate to `projects/Tron-Minesweeper/`
3. Open `index.html` in a modern browser
4. Edit `app.js` for game logic, `style.css` for visuals

## Credits

- **Original Concept**: Classic Minesweeper game
- **Visual Design**: Tron-inspired aesthetic
- **CodePen Challenge**: January 2026 challenge by ikrProjects
- **Animations**: Powered by GSAP

## License

This project follows the same license as the main OpenPlayground repository.