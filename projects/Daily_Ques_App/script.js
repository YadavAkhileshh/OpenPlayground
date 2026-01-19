const questionEl = document.getElementById("dailyQuestion");
const dateEl = document.getElementById("todayDate");
const newQuestionBtn = document.getElementById("newQuestionBtn");

const QUESTIONS = [
  "What is one thing you’re grateful for today?",
  "What would you do today if you weren’t afraid?",
  "What’s something you’ve been avoiding, and why?",
  "What’s one small win you can celebrate today?",
  "Who is someone you should appreciate more?",
  "What’s a habit that’s helping you right now?",
  "What’s one thing you need to let go of?",
  "What do you want more of in your life?",
  "What did you learn recently that changed your perspective?",
  "What’s one promise you can keep to yourself today?",
  "What’s something that made you smile recently?",
  "If today had a theme, what would it be?",
  "What’s one thing you can simplify in your life?",
  "What does “success” mean to you right now?",
  "What’s one belief you’ve outgrown?"
];

// Get date key in YYYY-MM-DD format
function getTodayKey() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

function formatDate() {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Generate deterministic question index (same for everyone per date)
// This is optional, but cool for consistency.
function getDailyIndex(dateKey) {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % 100000;
  }
  return hash % QUESTIONS.length;
}

// Load question for today from localStorage or compute it
function loadDailyQuestion() {
  const todayKey = getTodayKey();
  const saved = JSON.parse(localStorage.getItem("daily_question_data"));

  if (saved && saved.date === todayKey && saved.question) {
    return saved.question;
  }

  const index = getDailyIndex(todayKey);
  const question = QUESTIONS[index];

  localStorage.setItem(
    "daily_question_data",
    JSON.stringify({ date: todayKey, question })
  );

  return question;
}

// Optional: Let user pick a different one for today only
function shuffleTodayQuestion() {
  const todayKey = getTodayKey();
  const randomIndex = Math.floor(Math.random() * QUESTIONS.length);
  const question = QUESTIONS[randomIndex];

  localStorage.setItem(
    "daily_question_data",
    JSON.stringify({ date: todayKey, question })
  );

  render();
}

function render() {
  dateEl.textContent = formatDate();
  questionEl.textContent = loadDailyQuestion();
}

newQuestionBtn.addEventListener("click", shuffleTodayQuestion);

render();
