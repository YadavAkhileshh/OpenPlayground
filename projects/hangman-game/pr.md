### 🔤 Overview
This Pull Request introduces **Hangman-Game**, a logic-heavy, state-driven adaptation of the classic word puzzle. The application accepts inputs via physical keystrokes or an interactive on-screen keyboard, progressively revealing the hidden word or drawing the hangman figure upon failure.

Built entirely within a single-file architecture, this project demonstrates advanced array tracking, progressive visual rendering, and rigorous input sanitization.

Closes #4043

<img width="1911" height="981" alt="Image" src="https://github.com/user-attachments/assets/efdec8a3-5bc1-4b25-ba59-9062f801a461" />

<img width="1851" height="952" alt="Image" src="https://github.com/user-attachments/assets/2675f308-88b5-41c0-b114-1e31c6b366b7" />

<img width="1877" height="979" alt="Image" src="https://github.com/user-attachments/assets/631adc35-d3ab-4c5c-91f9-31e136665d61" />

### ✨ Core Technical Implementations

#### 1. Complex State Tracking
* **Data Structures:** Maintains a strict state object that tracks the `targetWord` (split into an array), a `guessedLetters` array, and an integer `mistakeCount`. 
* **Win/Loss Resolution:** Continuously maps the user's guessed array against the target array after every valid keystroke to accurately resolve win/loss conditions and trigger the appropriate endgame overlay.

#### 2. Progressive Visual Rendering
* **State-Mapped Graphics:** Uses the `mistakeCount` variable as an index to sequentially trigger the drawing of specific body parts (scaffold, head, torso, arms, legs).
* **Dynamic DOM/Canvas Integration:** The visual state of the hangman updates in tandem with the DOM elements representing the hidden word, keeping the UI perfectly synced with the underlying JavaScript state.

#### 3. Keyboard Event Sanitization
* **Input Filtering:** Implements regex and KeyCode validation on the `keyup` event listener to ensure only valid alphabetical characters (A-Z) are processed. 
* **Duplicate Prevention:** Checks the `guessedLetters` array before processing an input to ignore redundant keystrokes and prevent the user from being unfairly penalized for hitting the same letter twice.

### 🚀 Performance Optimizations
* **Single-File Portability:** All CSS, HTML, and Vanilla JavaScript logic are consolidated into `index.html` for maximum performance and portability.
* **Responsive Keyboard:** The on-screen keyboard utilizes CSS Grid/Flexbox to ensure the layout remains perfectly usable on both desktop and mobile viewports.

### 🕹️ How to Test
1. Launch `index.html` in your browser.
2. Use your physical keyboard or click the on-screen letters to guess the hidden word.
3. Watch the hangman draw progressively with each incorrect guess.
4. Try to complete the word before the drawing is finished!
