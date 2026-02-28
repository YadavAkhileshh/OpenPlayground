# Mind Rooms – Spatial Recall Challenge

Mind Rooms is a **cognitive memory experiment** that tests a user’s ability to recall objects based on **spatial navigation**, not repetition.

Unlike traditional memory games, this project guides the user through a sequence of rooms and later evaluates how well they remember *what belonged where*.

Built using **pure HTML, CSS, and JavaScript**.

---

## Concept

The project is inspired by spatial memory techniques where information is remembered more effectively when associated with **locations**.

Instead of showing everything at once, Mind Rooms:
- Reveals one room at a time
- Introduces a distraction
- Tests recall through questions

This mimics real-world memory conditions.

---

## Application Flow

### 1. Exploration Phase
- Users move through a sequence of rooms
- Each room contains exactly one item
- The user observes but does not interact

### 2. Distraction Phase
- A short cognitive task (simple math)
- Prevents short-term memory bias

### 3. Recall Phase
- Users answer questions like:
  > “What item was in the Kitchen Shelf?”
- Answers are selected from visual options

### 4. Result Summary
- Final accuracy score is displayed
- Session-based evaluation

---

## Features

- Navigation-based memory learning
- Distraction task to improve test validity
- Question-based recall instead of grid clicking
- Cognitive-experiment style UI
- Responsive, minimal design
- Frontend-only, no dependencies

---

## Tech Stack

- **HTML** – Semantic structure
- **CSS** – Card-based layout and responsive design
- **JavaScript** – State-driven game flow and logic

---

## 📂 Project Structure

mind-rooms/
│
├── index.html
├── README.md
├── assets/
│ 
├── style.css
└── js/
├── data.js
└── game.js