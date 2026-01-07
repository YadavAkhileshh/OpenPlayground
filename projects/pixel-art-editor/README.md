# PixelCanvas Pro 🎨

An advanced, feature-rich pixel art editor built with modern web technologies. Create stunning pixel art with professional-grade tools, layers, animations, and export options—all in your browser.

## 🌟 Features

### 🖌️ Drawing Tools
- **Pencil Tool** - Basic drawing with adjustable size and opacity
- **Eraser Tool** - Remove pixels with precision
- **Bucket Fill** - Fill connected areas with color
- **Color Picker** - Sample colors from your artwork
- **Line Tool** - Draw straight lines
- **Rectangle & Circle Tools** - Create shapes with outline, fill, or both options
- **Spray Tool** - Create spray paint effects
- **Selection Tool** - Select and manipulate areas
- **Move Tool** - Move selections around
- **Text Tool** - Add pixel-perfect text
- **Gradient Tool** - Create beautiful gradients

### 🎨 Color Management
- Custom color picker with hex/RGB support
- Pre-defined color palettes
- Recent colors history
- Color swatch library
- Palette generator from existing artwork

### 📑 Layer System
- Multiple layers with drag-and-drop reordering
- Layer opacity control
- 16+ blend modes (Normal, Multiply, Screen, Overlay, etc.)
- Layer visibility toggle
- Layer locking
- Layer duplication and merging
- Layer preview thumbnails

### 🔧 Advanced Features
- **Canvas Resizing** - Flexible canvas dimensions with anchor points
- **Grid & Snap** - Pixel-perfect alignment
- **Zoom Controls** - 10% to 800% zoom levels
- **Image Import** - Auto-adjust images to pixel art
- **Animation Tools** - Create frame-by-frame animations
- **Onion Skinning** - See previous/next frames while animating

### ✨ Effects & Filters
- Invert Colors
- Grayscale
- Sepia
- Brightness/Contrast
- Saturation
- Hue Rotation
- Blur
- Sharpen
- Edge Detection
- Add Noise
- Pixelate

### 💾 Import & Export
- **Import Formats**: PNG, JPG, WebP, GIF, SVG
- **Export Formats**: PNG, JPG, WebP, GIF, SVG
- Scale multipliers (1x to 32x)
- Custom background options
- Quality settings
- Animation export (GIF)
- Project saving/loading (.pxl format)

### ⌨️ Keyboard Shortcuts
- **Tools**: P (Pencil), E (Eraser), B (Bucket), I (Picker), etc.
- **Actions**: Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+S (Save)
- **Layers**: Ctrl+Shift+N (New), Ctrl+J (Duplicate)
- **Canvas**: Ctrl+G (Grid), Ctrl++ (Zoom), Ctrl+0 (Reset Zoom)

## 🛠️ Technical Details

### Built With
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript (ES6+)** - Full application logic
- **Canvas API** - Image processing and export
- **LocalStorage** - Project auto-save (planned feature)

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

### Performance
- Optimized rendering engine
- Efficient memory management
- 60 FPS drawing performance
- History stack management

## 📱 Responsive Design

PixelCanvas Pro works on:
- **Desktop** (1920x1080 and up)
- **Laptop** (1366x768 and up)
- **Tablet** (768px and up)
- **Mobile** (with limited toolbar)

## 🎯 Use Cases

### 🎮 Game Development
- Create character sprites
- Design tilesets and backgrounds
- Animate game elements
- Export in multiple resolutions

### 🎨 Digital Art
- Pixel art illustrations
- Profile pictures and avatars
- Social media graphics
- Digital stickers and emojis

### 📱 App Development
- App icons and logos
- UI elements and buttons
- Loading animations
- Custom cursor designs

### 🎓 Education
- Learn pixel art fundamentals
- Understand color theory
- Practice animation basics
- Digital art classes

## 🔧 Advanced Usage

### Importing Images
1. Click the **Import** button (or press Ctrl+I)
2. Choose your image
3. Select import method:
   - **Fit to Canvas** - Auto-resize to current canvas
   - **Resize Canvas** - Adjust canvas to match image
   - **New Layer** - Add image as separate layer
4. Apply dithering and color reduction if needed

### Creating Animations
1. Click the **Animation Mode** button
2. Add frames using the **+** button
3. Draw on each frame
4. Adjust frame delay
5. Use onion skinning for smooth animation
6. Export as GIF

### Using Layers Effectively
1. **Background Layer** - Base colors and shapes
2. **Detail Layer** - Add textures and details
3. **Shading Layer** - Apply shadows and highlights (set to Multiply blend mode)
4. **Highlight Layer** - Add reflections and sparkles (set to Screen blend mode)
5. **Effects Layer** - Apply filters and adjustments

### Exporting for Different Platforms
- **Web**: PNG with transparent background
- **Print**: PNG/JPG with 300 DPI equivalent
- **Games**: Multiple sizes (16x16, 32x32, 64x64)
- **Animation**: GIF with optimized palette

## 📖 Keyboard Shortcuts Reference

### Tools
```
P - Pencil Tool
E - Eraser Tool
B - Bucket Fill
I - Color Picker
L - Line Tool
R - Rectangle Tool
C - Circle Tool
S - Spray Tool
V - Selection Tool
M - Move Tool
T - Text Tool
G - Gradient Tool
```

### Actions
```
Ctrl+Z - Undo
Ctrl+Y - Redo
Ctrl+S - Save Project
Ctrl+E - Export Image
Ctrl+N - New Project
Ctrl+O - Open Project
Ctrl+G - Toggle Grid
Ctrl++ - Zoom In
Ctrl+- - Zoom Out
Ctrl+0 - Reset Zoom
Delete - Clear Selection/Canvas
Esc - Cancel Selection/Close Modals
```

### Layers
```
Ctrl+Shift+N - New Layer
Ctrl+J - Duplicate Layer
Ctrl+Shift+↑ - Move Layer Up
Ctrl+Shift+↓ - Move Layer Down
Ctrl+Shift+E - Merge Layers
Ctrl+Shift+V - Toggle Visibility
Ctrl+Shift+L - Toggle Lock
```

### Brush Controls
```
[ - Decrease Brush Size
] - Increase Brush Size
Shift+[ - Decrease Opacity
Shift+] - Increase Opacity
X - Swap Foreground/Background Colors
D - Reset Colors (Black/White)
F - Fill Layer with Foreground Color
```

## 🎨 Color Theory Tips

### Pixel Art Color Palettes
- **2-4 Colors**: Simple sprites, retro style
- **8-16 Colors**: Detailed characters, NES/SNES style
- **32-64 Colors**: Complex scenes, modern pixel art
- **Full Palette**: Photorealistic pixel art

### Creating Harmonious Palettes
1. **Monochromatic**: Different shades of one color
2. **Analogous**: Colors next to each other on the wheel
3. **Complementary**: Opposite colors for contrast
4. **Triadic**: Three equally spaced colors
5. **Tetradic**: Four colors forming a rectangle

### Shading Techniques
- **Cel Shading**: 2-3 shades per color
- **Soft Shading**: Smooth gradient transitions
- **Dithering**: Mix colors using patterns
- **Anti-aliasing**: Smooth edges with intermediate colors

## 🔍 Tips & Tricks

### Pixel Art Best Practices
1. **Start Small**: Begin with 16x16 or 32x32 canvases
2. **Use References**: Keep real images nearby for inspiration
3. **Limit Colors**: Restrict your palette for cohesive look
4. **Consistent Lighting**: Establish light source direction
5. **Clean Lines**: Avoid "jaggies" with smooth curves
6. **Readability**: Ensure your art is clear at small sizes

### Performance Optimization
- Work on smaller canvases first
- Use fewer layers when possible
- Merge layers when done editing
- Clear history periodically
- Close unnecessary browser tabs

### Workflow Suggestions
1. **Sketch**: Rough outline with basic shapes
2. **Block Colors**: Fill main areas with base colors
3. **Shading**: Add shadows and highlights
4. **Details**: Add textures and fine details
5. **Polish**: Clean up edges, add effects
6. **Export**: Choose appropriate format and size

*Made with ❤️ for pixel artists everywhere*