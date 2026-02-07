# Maze Generator

A web-based maze generator that creates perfect mazes using the recursive backtracking algorithm. Features instant generation, clean visualization, and responsive design.

## Features

### Maze Generation
- **Recursive Backtracking**: Creates perfect mazes with exactly one solution path
- **Instant Generation**: Generates new mazes instantly with a button click
- **Perfect Mazes**: Every maze has exactly one path from start to finish

### Visualization
- **Canvas Rendering**: Clean, crisp maze rendering using HTML5 Canvas
- **Grid-Based**: Classic grid maze with walls between cells
- **Responsive Design**: Adapts to different screen sizes
- **System Theme Support**: Automatically uses dark or light colors based on system preference

### Interactive Controls
- **Generate Button**: Create new random mazes on demand
- **Real-time Updates**: Instant visual feedback when generating new mazes

## Algorithm Details

### Recursive Backtracking
The maze generation uses the recursive backtracking algorithm:

1. **Start**: Begin at a random cell (top-left corner)
2. **Mark Visited**: Mark the current cell as visited
3. **Find Neighbors**: Look for unvisited neighboring cells
4. **Choose Random**: Randomly select one unvisited neighbor
5. **Remove Wall**: Remove the wall between current cell and chosen neighbor
6. **Recurse**: Make the chosen neighbor the current cell and repeat
7. **Backtrack**: If no unvisited neighbors, backtrack to previous cell
8. **Complete**: Finish when all cells are visited

### Maze Properties
- **Perfect Maze**: Exactly one path between any two points
- **No Loops**: No circular paths or dead ends that loop back
- **Fully Connected**: Every cell is reachable from every other cell
- **High Branching**: Many possible paths and dead ends

## Technical Details

### Dependencies
- **HTML5 Canvas**: For maze rendering
- **Vanilla JavaScript**: No external libraries required
- **CSS**: For styling and responsive design

### Configuration
```javascript
const cols = 20;        // Number of columns
const rows = 20;        // Number of rows
const cellSize = 12;    // Pixel size of each cell
```

### Performance
- **Efficient Algorithm**: O(n) time complexity where n is number of cells
- **Memory Efficient**: Minimal memory usage for grid storage
- **Fast Rendering**: Instant canvas drawing for all maze sizes

### Browser Support
- Modern browsers with Canvas support
- ES6+ JavaScript features
- CSS custom properties for theming

## How to Run

1. **Open the Project**: Navigate to the `Maze-generator` directory
2. **Launch**: Open `index.html` in any modern web browser
3. **Generate**: Click the "Generate New Maze" button to create random mazes
4. **View**: Watch the maze render instantly on the canvas

## Architecture

### Core Components
- **Cell Class**: Represents individual maze cells with wall and visited states
- **Grid System**: 2D grid stored as 1D array for efficient access
- **Algorithm Engine**: Recursive backtracking implementation
- **Renderer**: Canvas-based drawing system

### Data Structures
- **Grid Array**: 1D array storing all cells (cols × rows)
- **Cell Walls**: Object with top/right/bottom/left wall states
- **Visited Tracking**: Boolean flag for algorithm state
- **Stack**: Array for backtracking path storage

### Rendering System
- **Wall Drawing**: Individual line segments for each wall
- **Color Adaptation**: Uses CSS custom properties for theme colors
- **Coordinate System**: Pixel-perfect positioning based on cell size

## Customization

### Changing Maze Size
Modify the configuration constants:

```javascript
const cols = 30;        // Increase for larger mazes
const rows = 30;
const cellSize = 8;     // Decrease for finer detail
```

### Styling Modifications
Adjust colors and appearance through CSS:

```css
canvas {
  /* Change border, background, etc. */
}

body {
  /* Modify overall theme colors */
}
```

### Algorithm Variations
The recursive backtracking can be modified to:
- Start from different positions
- Use different neighbor selection strategies
- Add bias for certain directions

## Maze Theory

### Perfect Mazes
A perfect maze has:
- Exactly one path between any two points
- No loops or inaccessible areas
- Maximum branching factor

### Generation Algorithms
- **Recursive Backtracking**: Depth-first search approach
- **Kruskal's Algorithm**: Union-find based approach
- **Prim's Algorithm**: Minimum spanning tree approach
- **Eller's Algorithm**: Row-by-row generation

### Applications
- **Games**: Puzzle games and adventure games
- **Education**: Algorithm visualization and learning
- **Art**: Generative art and procedural content
- **Research**: Pathfinding algorithm testing

## Performance Considerations

### Size Limits
- **Browser Dependent**: Large mazes may cause performance issues
- **Memory Usage**: Scales linearly with grid size
- **Rendering Time**: Canvas drawing scales with wall count

### Optimization Opportunities
- **WebGL Rendering**: For very large mazes
- **Progressive Generation**: Show maze building process
- **Worker Threads**: Move generation to background thread

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile Browsers**: Touch and responsive support

## Contributing

The project uses simple, vanilla web technologies:
- Pure HTML/CSS/JavaScript
- No build process required
- Easy to modify and extend
- Well-commented algorithm implementation

## License

This project is part of the Dev Card Showcase collection. See the main repository for licensing information.

## Credits

Implementation of the classic recursive backtracking maze generation algorithm. Inspired by maze generation literature and procedural content generation techniques.