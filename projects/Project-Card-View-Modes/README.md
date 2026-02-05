# Project Card View Modes & Grid Layouts
**Feature #1985 - Frontend Utility Project**

## Overview
A flexible and powerful viewing system that gives users complete control over how they browse projects on OpenPlayground. This feature allows users to switch between multiple layout styles, customize information display, filter by category, and sort projects in various ways. All preferences are automatically saved for a personalized experience.

## ✨ Key Features

### 📱 **Multiple View Modes**
1. **Standard Grid** - Balanced 2-3 column layout (default)
2. **Compact Grid** - Dense 4-6 column layout for maximum projects on screen
3. **Large Cards** - 1-2 columns with extended information and larger thumbnails
4. **Masonry Layout** - Pinterest-style dynamic height cards
5. **Timeline View** - Chronological display with date markers
6. **List View** - Compact linear list format

### 💾 **Persistence & Personalization**
- **Saved Preferences** - Remember view mode across sessions using LocalStorage
- **Per-User Settings** - Each browser saves individual preferences
- **Per-Category Views** - Different view modes for different categories (coming soon)

### ⌨️ **Keyboard Shortcuts**
- **1** - Switch to Standard Grid
- **2** - Switch to Compact Grid
- **3** - Switch to Large Cards
- **4** - Switch to Masonry
- **5** - Switch to Timeline
- **6** - Switch to List View
- **Shift+S** - Cycle through sort modes

### 🎨 **User Experience**
- Smooth layout transition animations (respects `prefers-reduced-motion`)
- Responsive design for all screen sizes
- Dark mode support
- Real-time keyboard shortcut feedback
- Quick toggle buttons with visual feedback

## 🛠️ Tech Stack
- **CSS Grid** - Multiple layout configurations
- **CSS Columns** - Masonry layout implementation
- **LocalStorage API** - User preference persistence
- **JavaScript (ES6+)** - View mode switching and sorting logic
- **CSS3 Transitions** - Smooth layout animations
- **Flexbox** - Responsive card arrangements

## 📁 File Structure
```
js/
├── viewModeManager.js          # Core view mode management
├── cardRenderer.js              # Enhanced card rendering (updated)
└── app.js                       # Integration with project manager (updated)

css/
├── viewModes.css                # All view mode styles
└── style.css                    # Main styles

components/
└── projects.html                # Updated with view controls
```

## 🚀 Usage

### Basic Implementation
The view mode system is automatically initialized when the page loads. Users can:

1. **Click View Mode Buttons** - Use the button bar to switch between view modes
2. **Use Keyboard Shortcuts** - Press 1-6 to quickly switch layouts
3. **Watch Preferences Persist** - Preferences are saved automatically

### Programmatic Usage

```javascript
// Import the view mode manager
import { viewModeManager } from './js/viewModeManager.js';

// Switch to a specific view mode
viewModeManager.setViewMode('masonry');

// Set sort mode
viewModeManager.setSortMode('recent');

// Get current view mode
const currentMode = viewModeManager.currentViewMode;

// Listen for view mode changes
window.addEventListener('viewModeChanged', (e) => {
    console.log('View mode changed to:', e.detail.viewMode);
});

// Listen for sort mode changes
window.addEventListener('sortModeChanged', (e) => {
    console.log('Sort mode changed to:', e.detail.sortMode);
});

// Export preferences
const prefs = viewModeManager.exportPreferences();

// Import preferences
viewModeManager.importPreferences(prefs);

// Reset to defaults
viewModeManager.resetPreferences();
```

## 📊 View Mode Details

### Standard Grid (Default)
- **Columns**: 2-3 columns (auto-fit)
- **Min Width**: 300px
- **Gap**: 1.5rem
- **Best For**: Balanced view with good information density

### Compact Grid
- **Columns**: 4-6 columns (auto-fit)
- **Min Width**: 180px
- **Gap**: 1rem
- **Best For**: Browsing many projects quickly
- **Features**: Minimal card information, icon-heavy buttons

### Large Cards
- **Columns**: 1-2 columns (auto-fit)
- **Min Width**: 500px
- **Gap**: 2rem
- **Best For**: Detailed exploration
- **Features**: Larger cover images, full tech stack, extended actions

### Masonry
- **Columns**: Dynamic (4 on desktop, 2 on tablet, 1 on mobile)
- **Best For**: Visual browsing, variable content heights
- **Features**: Pinterest-style layout optimized for thumbnails

### Timeline View
- **Columns**: 1 (fixed)
- **Best For**: Chronological discovery
- **Features**: Date markers, visual timeline line, project progression

### List View
- **Columns**: 1 (fixed)
- **Gap**: 0.75rem
- **Best For**: Scanning many projects quickly
- **Features**: Minimal horizontal layout, optimized for small screens

## 🎯 Responsive Behavior

### Desktop (>1200px)
- All view modes fully functional
- Masonry: 4 columns
- Compact Grid: 6 columns
- Large Cards: 2 columns

### Tablet (768px - 1200px)
- All view modes functional
- Masonry: 2-3 columns
- Compact Grid: 4-5 columns
- Large Cards: 1-2 columns

### Mobile (<768px)
- Optimized single/dual column layouts
- Masonry: 1-2 columns
- Compact Grid: 2 columns
- Large Cards: 1 column
- Timeline & List: 1 column (full width)

## 🌓 Dark Mode Support
All view modes include full dark mode support with:
- Automatic color scheme detection
- Context-aware backgrounds and text
- Maintained contrast ratios for accessibility

## ♿ Accessibility Features
- **Keyboard Navigation** - Full keyboard shortcut support
- **Reduced Motion** - Respects `prefers-reduced-motion` media query
- **Focus Management** - Proper focus states for all interactive elements
- **ARIA Labels** - Descriptive labels for screen readers
- **Semantic HTML** - Proper heading hierarchy and structure

## 📈 Performance Optimizations
- **Efficient Rendering** - CSS-based layouts, minimal JavaScript
- **LocalStorage** - Fast preference loading
- **Event Delegation** - Optimized event listener patterns
- **CSS Animations** - GPU-accelerated transitions
- **Lazy Loading** - Viewport observer for card tracking

## 🔄 Sorting Modes Integration
View modes work seamlessly with existing sort modes:
- **Recent** - Recently added projects first
- **Popular** - Most viewed projects
- **A-Z** - Alphabetical ordering
- **By Category** - Grouped by project type
- **By Difficulty** - From easiest to hardest

## 🎨 Customization

### Colors
The system uses CSS custom properties (variables) for theming:
```css
--primary-color: #d4a574
--text-primary: #333
--text-secondary: #666
--surface: #fff
--bg-secondary: #f9f7f3
--border-color: #e8e0d8
```

### Column Widths
Modify minimum column widths in `viewModeManager.js`:
```javascript
compact: { minWidth: '180px' },  // Adjust for tighter/looser layout
standard: { minWidth: '300px' },
```

### Gaps
Adjust spacing between cards in the `getGridGap()` method:
```javascript
compact: '1rem',     // Tighter spacing
standard: '1.5rem',  // Balanced spacing
large: '2rem'        // Generous spacing
```

## 🐛 Troubleshooting

### Preferences Not Saving
- Check if LocalStorage is enabled in browser
- Clear browser cache and try again
- Check browser console for errors

### View Mode Not Switching
- Verify JavaScript is enabled
- Check that viewModeManager is loaded correctly
- Inspect browser console for errors

### Keyboard Shortcuts Not Working
- Ensure focus is not on an input element
- Check if shortcuts are bound correctly
- Verify no other script is intercepting keyboard events

## 📝 Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎓 Integration Example

```html
<!-- In your component/projects.html -->
<div id="view-mode-controls-container"></div>
```

```javascript
// In your app.js
import { viewModeManager } from "./viewModeManager.js";

// The manager auto-initializes and creates controls
// Preferences are automatically saved/loaded
```

## 🚀 Future Enhancements
- [ ] Per-category default view modes
- [ ] Custom column count preferences
- [ ] Card information customization (choose which fields to display)
- [ ] Sort mode customization per view
- [ ] Favorite view mode combinations
- [ ] Export/import settings between devices

## 📞 Support
For issues or feature requests related to view modes, please open an issue on GitHub with:
- Browser and OS information
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable

## 📜 License
Part of OpenPlayground - See main repository LICENSE

---

**Created with ❤️ for a better project browsing experience**
