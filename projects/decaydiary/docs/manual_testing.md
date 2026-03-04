# Manual testing Guide - DecayDiary

This document outlines the steps required to manually verify the functionality and performance of DecayDiary.

## 1. Visual Verification

### 1.1. Minimalist Aesthetic
- **Step**: Open `index.html` in a modern browser.
- **Expected**: The page should load with a dark background, a subtle vignette, and a clear "DecayDiary" logo.
- **Verification**: Ensure no scrollbars are visible on the initial load and the placeholder text is legible.

### 1.2. Smooth Fading
- **Step**: Type a single sentence and wait for 20 seconds.
- **Expected**:
    - 0-10s: Text remains solid.
    - 10-20s: Text gradually loses opacity and potentially develops a subtle blur.
    - 20s+: Text indexically disappears from the screen.
- **Verification**: Check the browser console (Inspect -> Elements) to confirm the `<span>` tags are removed from the DOM.

## 2. Interaction Testing

### 2.1. Rapid Typing
- **Step**: Type as fast as possible for 30 seconds.
- **Expected**: Interface remains responsive with 0 characters of lag.
- **Verification**: Character count at bottom left should update in real-time. Use `performanceMonitor.toggle(true)` in console to verify FPS > 55.

### 2.2. Theme Cycling
- **Step**: Press `Ctrl + T`.
- **Expected**: The background and text colors should transition to the next theme (Void -> Parchment -> Dusk).
- **Verification**: All UI elements (status indicator, footer text) should adapt to the new palette.

### 2.3. Paste Functionality
- **Step**: Copy a paragraph from another source and paste it into the editor.
- **Expected**: The text should appear and every character should immediately begin its individual 10/20s lifecycle.
- **Verification**: Confirm that each pasted character is wrapped in a `decay-char` span.

## 3. Boundary Conditions

### 3.1. Tab Inactivity
- **Step**: Type some text, then switch to a different browser tab for 30 seconds. Return to DecayDiary.
- **Expected**: The characters should have expired or progressed in their decay while the tab was backgrounded.
- **Verification**: Checking if the engine correctly calculated the delta time or paused appropriately.

### 3.2. Empty State
- **Step**: Delete all text or wait for it to expire.
- **Expected**: The placeholder "Begin typing your fleeting thoughts..." should reappear smoothly.
- **Verification**: Use character count indicator as a secondary source of truth.

---
*Target Line Count Verification: ~70 lines*
