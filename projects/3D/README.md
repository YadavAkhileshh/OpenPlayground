# 3D QR Code Generator

A stunning 3D QR code generator built with Three.js that creates interactive, metallic QR cubes with realistic visual effects including dust particles, sharp cracks, and customizable materials.

## Features

### 🎨 Visual Effects
- **Metallic Surface**: High-quality metallic material with adjustable metalness and roughness
- **Dust Overlay**: Procedurally generated fine dust particles with adjustable density
- **Sharp Cracks**: Realistic jagged crack patterns with branching effects
- **PBR Lighting**: HDR environment mapping for photorealistic reflections
- **Real-time Shadows**: Dynamic shadow casting with soft shadow maps

### 📱 QR Code Types
- **URL Links**: Generate QR codes for websites and URLs
- **vCard**: Create contact information QR codes with:
  - Full Name
  - Email Address
  - Phone Numbers (Cell & Work)
  - Website URL

### 🎮 Interactive Controls
- **Orbit Controls**: Click and drag to rotate, scroll to zoom
- **Auto Rotation**: Optional automatic rotation
- **Real-time GUI**: Adjust all parameters on-the-fly with lil-gui

### ⚙️ Customization Options

#### Geometry
- **Quiet Zone (Frame)**: Toggle white border frame around QR code
- **Layer Depth**: Adjust the thickness of the metallic tiles (0.01 - 1)

#### Dust Layer
- **Opacity**: Control dust visibility (0 - 1)
- **Density**: Adjust dust particle concentration (0.1 - 2.0)

#### Crack Layer
- **Scale/Frequency**: Control crack size and density (0.1 - 3.0)
- **Cut Width**: Adjust crack visibility threshold (0 - 0.9)

#### Materials
- **Metalness**: Control how metallic the surface appears (0 - 1)
- **Roughness**: Adjust surface smoothness (0 - 1)

## Technologies Used

- **Three.js** (v0.160.0) - 3D rendering engine
- **OrbitControls** - Camera interaction
- **RGBELoader** - HDR environment loading
- **lil-gui** (v0.19.1) - GUI controls
- **qrcode-generator** (v1.4.4) - QR code generation

## Installation

No installation required! Simply open `index.html` in a modern web browser.

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd projects/3D

# Open in browser
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux
```

## Usage

### Basic Usage

1. Open `index.html` in your browser
2. The 3D QR code will automatically generate
3. Use the GUI panel (bottom-right) to customize

### Generating a URL QR Code

1. Select **QR Type**: "URL Link"
2. Expand **URL Data** folder
3. Enter your desired link
4. QR code updates automatically

### Generating a vCard QR Code

1. Select **QR Type**: "vCard"
2. Expand **vCard Data** folder
3. Fill in contact information fields
4. QR code updates automatically

### Saving Your QR Code

While the application doesn't have a built-in export feature, you can:
- Take a screenshot of the 3D visualization
- Scan the QR code directly from the screen
- Right-click and save the canvas (may require browser developer tools)

## Configuration

You can modify default values by editing the `USER_DEFAULTS` object in the HTML file:

```javascript
const USER_DEFAULTS = {
    mode: 'URL Link',              // 'URL Link' or 'vCard'
    url: 'https://example.com/',   // Default URL
    vName: 'John Doe',             // vCard name
    vEmail: 'john@example.com',    // vCard email
    vPhone1: '+1234567890',        // vCard phone
    vPhone2: '',                   // vCard alt phone
    vWeb: 'https://example.com/',  // vCard website
    cutScale: 0.450,               // Crack scale
    border: false                  // Quiet zone frame
};
```

## Browser Compatibility

Requires a modern browser with WebGL support:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 15+
- ✅ Edge 90+

## Performance Notes

- The application uses instanced rendering for optimal performance
- HDR environment map loads asynchronously from polyhaven.org
- Logarithmic depth buffer prevents z-fighting
- Anisotropic filtering maximizes texture quality

## Technical Details

### Rendering Pipeline
1. **Base Cube**: Black inner core with low metalness
2. **Instanced Tiles**: White metallic tiles for QR pattern
3. **Dust Layer**: Masked fine noise overlay
4. **Crack Layer**: Sharp procedural veins with masking

### Material System
- **Base Material**: Dark, matte finish for QR "holes"
- **Metal Material**: Highly reflective chrome-like surface
- **Side Material**: Dark edges for tile depth
- **Overlay Materials**: Transparent effects with alpha compositing

### QR Code Logic
- Border offset system for quiet zones
- Module-based coordinate mapping
- 6-face cube generation with proper UV mapping
- Masking system prevents effects over data holes

## Customization Ideas

- Modify HDR environment for different lighting moods
- Adjust camera position for alternative viewing angles
- Change color schemes by modifying material colors
- Add animation effects to tile generation
- Implement export functionality for STL/OBJ 3D printing

## Known Limitations

- Very long data may exceed QR code capacity
- HDR loading requires internet connection
- No built-in screenshot/export feature
- Performance may vary on low-end devices

## Credits

- **Three.js** - 3D graphics library
- **Poly Haven** - HDR environment assets
- **qrcode-generator** - QR encoding library
- **lil-gui** - Lightweight GUI framework

## License

[Add your license here]

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

**Made with ❤️ using Three.js**
