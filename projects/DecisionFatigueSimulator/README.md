# Consent Fatigue Simulator

> "You have successfully agreed to sell your kidney in Level 8."

**Consent Fatigue Simulator** is an interactive web experience that demonstrates how digital "terms of service" design (dark patterns) exploits human cognitive fatigue.

## 🎮 How to Play
1.  Open `index.html` in your browser.
2.  You will be presented with **10 update requests** for hypothetical apps.
3.  Read the terms (or don't) and accept/decline.
4.  Watch out for **Dark Patterns**:
    -   Hidden "Decline" buttons.
    -   Confusing checkbox logic ("Do not uncheck to opt-out").
    -   Fake urgency timers.
    -   Visual interference.
5.  At the end, receive your **Privacy Integrity Score**.

## 🧠 The Concept
This project simulates **Decision Fatigue** and **Consent Blindness**. As the levels progress, the UI becomes increasingly hostile, mirroring the real-world erosion of user agency in the digital space. It tracks:
-   **Time-to-Action**: Did you read the text?
-   **Scroll Depth**: Did you see the bottom?
-   **Trap Triggers**: Did you fall for the trick?

## 🛠️ Tech Stack
-   **HTML5**: Semantic structure.
-   **CSS3**: Custom Cyberpunk/Glassmorphism theme with CSS Variables. No frameworks.
-   **Vanilla JavaScript**: Game logic, state management, and DOM manipulation.

## 📂 Project Structure
-   `index.html`: Main application entry point.
-   `style.css`: All visual styles and animations.
-   `script.js`: Contains the `SCENARIOS` array (level data) and game loop.
-   `project.json`: Metadata for project aggregators.

## 📸 Attribution
-   Icons by [Remix Icon](https://remixicon.com/).
-   Fonts by [Google Fonts](https://fonts.google.com/) (Inter, JetBrains Mono).
