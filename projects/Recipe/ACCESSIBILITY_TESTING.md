# Accessibility Testing Checklist for Recipe App

## Test Date: January 17, 2026

### Focus Management ✅

**Test: Modal opens and closes with proper focus management**
- [ ] Click "Add Recipe" button
- [ ] Verify focus moves into the modal (first input field gets focus)
- [ ] Press Tab repeatedly - focus should cycle within modal only
- [ ] Press Shift+Tab - focus should cycle backwards within modal
- [ ] Press Escape key - modal should close
- [ ] After closing, focus should return to "Add Recipe" button

**Test: Recipe detail modal**
- [ ] Click "View" button on any recipe card
- [ ] Verify focus moves into the recipe detail modal
- [ ] Tab through all buttons (Start Timer, Export PDF, AI Suggest, etc.)
- [ ] Press Escape - modal closes and focus returns to "View" button

### Keyboard Navigation ✅

**Test: All interactive elements are keyboard accessible**
- [ ] Tab through header: Toggle theme button → Add Recipe button
- [ ] Tab through recipe cards: each favorite button, View button, Check Format button (if PNG)
- [ ] All buttons respond to Enter/Space key
- [ ] Favorite toggle works with keyboard and announces state

### Screen Reader Support ✅

**Test: ARIA labels and roles (use VoiceOver on Mac or NVDA/JAWS on Windows)**
- [ ] Header buttons announce their purpose ("Toggle theme", "Add recipe")
- [ ] Recipe cards announce "Recipe card: [Recipe Name]"
- [ ] Favorite buttons announce "Toggle favorite for [Recipe Name]" and current state (pressed/not pressed)
- [ ] View buttons announce "View recipe [Recipe Name]"
- [ ] Modal announces as dialog with proper title
- [ ] All form inputs have labels (Recipe title, Image URL, Ingredients, etc.)
- [ ] Upload info area announces changes (role="status", aria-live="polite")
- [ ] Image error messages announce when images fail to load

### Visual Indicators ✅

**Test: Focus visible styles**
- [ ] Tab through page - all focused elements show clear focus outline (3px outline with offset)
- [ ] Focus outline is visible in both light and dark modes
- [ ] Focus outline doesn't obscure button content

### Reduced Motion ✅

**Test: Respects user preference for reduced motion**
- [ ] Enable reduced motion in OS settings:
  - **macOS**: System Preferences → Accessibility → Display → Reduce Motion
  - **Windows**: Settings → Ease of Access → Display → Show animations
- [ ] Reload page
- [ ] Hover over recipe cards - images should NOT scale
- [ ] All transitions and animations should be disabled

### Empty State ✅

**Test: Empty state is accessible**
- [ ] Clear localStorage: `localStorage.removeItem('recipes'); location.reload();`
- [ ] Empty state shows with proper role="status" and aria-live="polite"
- [ ] "Add Recipe" button in empty state is keyboard accessible
- [ ] Screen reader announces empty state message

### Error States ✅

**Test: Image loading errors are announced**
- [ ] Add a recipe with an invalid image URL
- [ ] Verify inline error message appears below broken image
- [ ] Error message has role="status" and aria-live="polite"
- [ ] Screen reader announces "Image failed to load. Showing placeholder."

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)

## Screen Reader Testing

Test with:
- [ ] VoiceOver (macOS): Cmd+F5 to enable
- [ ] NVDA (Windows, free)
- [ ] JAWS (Windows, commercial)

## Automated Testing

Run with browser DevTools:
- [ ] Chrome Lighthouse accessibility audit (score should be 95+)
- [ ] axe DevTools extension
- [ ] WAVE browser extension

## Quick Test Commands

```bash
# Start local server
cd "/Users/pankajsingh/Movies/OPENSOURCE PROJECT/os/OpenPlayground/projects/Recipe"
python3 -m http.server 8081 --bind localhost

# Open in browser
open "http://localhost:8081/index.html"
```

## Expected Results

All tests should pass with:
- ✅ Focus trap working in modals
- ✅ Escape key closes modals
- ✅ Focus returns to opener after modal close
- ✅ All interactive elements have aria-labels
- ✅ Keyboard navigation works throughout
- ✅ Screen readers announce all content properly
- ✅ Reduced motion is respected
- ✅ Error and empty states are accessible

## Notes

- All icons marked with `aria-hidden="true"` so screen readers skip decorative icons
- Interactive favorite buttons use proper button element with aria-pressed
- Modal uses proper dialog role with aria-modal and aria-labelledby
- Focus management implemented with __modalOpenerElement tracking
- All form inputs have descriptive aria-labels
