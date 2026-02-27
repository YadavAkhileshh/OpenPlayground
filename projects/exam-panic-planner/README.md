# Exam Panic Planner 📚🚨

A browser-based study planning application that automatically generates a day-wise study schedule based on syllabus size, available daily study hours, and exam date. The system tracks progress, persists data locally, and warns users when they are falling behind.

---

## 🚀 Features

- User setup (name, daily study hours, exam date)
- Add subjects and syllabus units
- Auto-generated daily study plan
- Task completion tracking
- Progress percentage calculation
- Panic mode detection
- Works completely offline
- Data stored using browser localStorage

---

## 🧠 How It Works

1. User enters study capacity and exam date  
2. User adds syllabus units with estimated hours  
3. System calculates remaining days  
4. Workload is distributed day-wise  
5. User marks tasks completed  
6. Progress and panic status are updated dynamically  

---

## 🛠 Tech Stack

- HTML  
- CSS  
- JavaScript (Vanilla)  
- Browser localStorage  

---

## 📂 Project Structure

exam-panic-planner/
│
├── index.html
├── setup.html
├── planner.html
│
├── css/
│ ├── base.css
│ ├── layout.css
│ └── components.css
│
├── js/
│ ├── storage.js
│ ├── setup.js
│ ├── syllabus.js
│ ├── generator.js
│ ├── planner.js
│ └── progress.js