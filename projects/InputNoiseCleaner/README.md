# Input Noise Cleaner

A powerful utility tool that intelligently cleans messy user input by removing common noise patterns.

## 🎯 What It Does

Input Noise Cleaner automatically detects and removes various types of noise from user input:

- **Extra Spaces** - Removes multiple consecutive spaces
- **Repeated Characters** - Fixes reeeepeated letters
- **Accidental Caps** - Normalizes SHOUTING TEXT
- **Emoji Noise** - Removes excessive emojis
- **Punctuation Abuse** - Fixes !!!! and ????
- **Edge Whitespace** - Trims leading/trailing spaces

## ✨ Features

### Live Preview
See your text get cleaned in real-time as you type or paste content.

### Toggleable Cleanup Rules
Enable or disable specific cleanup rules based on your needs:
- Extra Spaces
- Repeated Characters
- Fix Caps Lock
- Emoji Noise
- Punctuation
- Trim Edges

### Before/After Diff View
Visual side-by-side comparison showing exactly what changed between the original and cleaned text.

### Noise Classification
Detailed statistics showing:
- Number of extra spaces removed
- Count of repeated character fixes
- Caps lock corrections made
- Emoji noise removed
- Punctuation fixes applied
- Overall noise percentage

### Smart Detection
- Noise level indicator (Low/Medium/High)
- Character count for both input and output
- Reduction percentage showing how much noise was removed

## 🚀 How to Use

1. **Enter Text**
   - Paste or type your messy text into the input area
   - Or click "Load Sample" to see an example

2. **Configure Rules**
   - Toggle individual cleanup rules on/off
   - Use "Toggle All" to quickly enable/disable all rules

3. **Review Output**
   - See the cleaned text in the output section
   - Check the noise classification statistics
   - View the before/after diff for detailed changes

4. **Copy Result**
   - Click the "Copy" button to copy cleaned text to clipboard

## 📊 Use Cases

- **Form Input Validation** - Clean user-submitted data
- **Chat Moderation** - Normalize messages before processing
- **Data Cleaning** - Prepare text data for analysis
- **Content Formatting** - Fix common typing mistakes
- **API Input Sanitization** - Clean data before sending to APIs

## 🛠️ Technical Details

- **Pure JavaScript** - No dependencies required
- **Real-time Processing** - Instant feedback as you type
- **Smart Regex Patterns** - Efficient pattern matching for noise detection
- **Responsive Design** - Works on desktop, tablet, and mobile

## 💡 Why It's Unique

Unlike generic text formatters, Input Noise Cleaner specifically targets human input noise patterns:
- Preserves intentional formatting
- Focuses on common typing mistakes
- Provides transparency with diff view
- Customizable cleanup rules
- Real-time noise analysis

## 🎨 Interface

The clean, modern interface includes:
- Gradient header with clear branding
- Organized sections for input, rules, output, diff, and stats
- Visual feedback with icons and color coding
- Toast notifications for user actions
- Fully responsive layout

## 📝 Example

**Before:**
```
HELLOOOO    WORLD!!!   😀😀😀😀😀

This   has    way     too     many     spaces.

WHY IS CAPS LOCK ALWAYS ON????
```

**After:**
```
Hello World! 😀😀

This has way too many spaces.

Why is caps lock always on?
```

## 🔒 Privacy

All text processing happens entirely in your browser. No data is sent to any server.

## 📄 License

This project is open source and available for personal and commercial use.

---

Built with ❤️ for cleaner input
