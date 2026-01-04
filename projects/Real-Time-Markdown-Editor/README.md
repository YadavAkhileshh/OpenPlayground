# Real-Time Markdown Editor

A professional, feature-rich Markdown editor with real-time preview, built with vanilla HTML, CSS, and JavaScript.

![Markdown Editor](https://via.placeholder.com/800x450/4a6fa5/ffffff?text=Markdown+Editor+Screenshot)

## Features ✨

### 📝 Editor Features
- **Real-time preview** - See your Markdown rendered instantly as you type
- **Syntax highlighting** - Beautiful code highlighting for multiple programming languages
- **Multiple themes** - Light and dark themes with smooth transitions
- **Auto-save** - Your work is automatically saved to browser storage
- **Word/character count** - Real-time statistics for your document

### 📁 File Management
- **Multiple documents** - Create, edit, and organize multiple Markdown files
- **File search** - Quickly find documents by name or content
- **File templates** - Start with pre-built templates for notes, blogs, READMEs, etc.
- **Rename & delete** - Easily manage your files with right-click options

### 📤 Export Options
- **HTML export** - Export as standalone HTML files with styling
- **Markdown export** - Save as plain Markdown (.md) files
- **PDF-ready** - Export as HTML that can be printed to PDF
- **Custom filenames** - Choose your own filename for exports

### 🎨 User Interface
- **Clean, modern design** - Intuitive and user-friendly interface
- **Responsive layout** - Works perfectly on desktop and mobile devices
- **Split-pane view** - Editor and preview side by side
- **Fullscreen mode** - Focus on writing with distraction-free fullscreen preview
- **Toolbar** - Quick access to common Markdown formatting options

### ⚡ Performance
- **Local storage** - All data stays on your device (no server required)
- **Fast rendering** - Optimized Markdown parsing and preview updates
- **Keyboard shortcuts** - Boost productivity with time-saving shortcuts
- **No dependencies** - Runs entirely in the browser

### No Installation Needed
This editor runs entirely in your browser. No server setup, no npm installs, no build process required. Just open the HTML file and start writing.

## Markdown Support ✅

The editor supports all standard Markdown syntax:

### Basic Formatting
- **Headers**: `# H1`, `## H2`, `### H3`
- **Emphasis**: `*italic*`, `**bold**`, `~~strikethrough~~`
- **Lists**: `- unordered`, `1. ordered`
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Code**: `` `inline` `` and ```` ```blocks````
- **Blockquotes**: `> quote`
- **Horizontal rules**: `---`

## Keyboard Shortcuts ⌨️

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save document |
| `Ctrl/Cmd + B` | Bold formatting |
| `Ctrl/Cmd + I` | Italic formatting |
| `Ctrl/Cmd + K` | Insert link |
| `Ctrl/Cmd + E` | Toggle preview fullscreen |
| `Ctrl/Cmd + /` | Open help |
| `Escape` | Close modals/fullscreen |


## Data Storage 💾

All documents are saved to your browser's **localStorage**. This means:
- ✅ Your documents persist between browser sessions
- ✅ All data stays on your computer (no cloud storage)
- ✅ Each browser/profile has its own set of documents
- ✅ No account or login required

To back up your documents, use the **Export** feature to save them as files on your computer.

## Project Structure 📁
projects\Real-Time-Markdown-Editor/
├── index.html # Main HTML file
├── style.css # All styles and themes
├── script.js # Application logic
└── README.md # This documentation