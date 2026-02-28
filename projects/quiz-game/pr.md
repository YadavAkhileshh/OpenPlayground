### 🧠 Overview
This Pull Request introduces **Quiz-Game**, a dynamic, state-driven trivia application. Designed to be highly robust and modular, the engine cleanly separates the trivia data layer from the UI presentation layer, resulting in a seamless, zero-reload experience for the user.

The entire application is housed within a single `index.html` file, showcasing advanced DOM manipulation, asynchronous timer management, and comprehensive state tracking without the need for front-end frameworks like React or Vue.

Closes #3917

<img width="1638" height="966" alt="Image" src="https://github.com/user-attachments/assets/d8c27bf2-2465-43da-a485-6e2dc80348f0" />

<img width="1401" height="816" alt="Image" src="https://github.com/user-attachments/assets/00b94c33-2a60-4970-b1d4-43f5fdb71573" />

### ✨ Core Technical Implementations

#### 1. Complex State & Data Management
* **JSON/Object Architecture:** The trivia questions, multiple-choice options, and correct answer indices are structured as a scalable array of objects, mimicking a fetched JSON database response.
* **Global State Tracking:** Maintains strict tracking of the `currentQuestionIndex`, `playerScore`, and `hasAnswered` boolean flags to prevent double-clicking and sequence breaking.

#### 2. Asynchronous Interval Logic
* **Countdown Engine:** Implements a robust `setInterval` timer for each question round. If the timer reaches zero before the user selects an option, the engine automatically resolves the question as incorrect, reveals the right answer, and transitions the state.
* **Memory Management:** Strictly enforces `clearInterval()` protocols during state transitions to prevent overlapping timers from causing erratic countdown speeds.

#### 3. Dynamic DOM Rendering
* **Programmatic UI Updates:** Rather than reloading the page, the JavaScript engine clears and repopulates the question text and answer buttons on the fly.
* **CSS Class Toggling for Feedback:** Utilizes JavaScript to dynamically append `.correct` or `.incorrect` CSS classes to the selected buttons, triggering smooth color transitions and visual feedback before loading the next view.

### 🚀 Performance Optimizations
* **Single-File Portability:** Zero external CSS or JS file dependencies.
* **Event Delegation:** Uses efficient event listeners mapped correctly to dynamically generated DOM nodes to prevent memory bloating.

### 🕹️ How to Test
1. Launch `index.html` in your browser.
2. Click "Start Game" and quickly read the first question.
3. Select an answer before the visual timer bar depletes.
4. Review the final score screen at the end of the question array!
