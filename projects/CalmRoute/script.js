const elements = {
  routineForm: document.getElementById("routine-form"),
  routineName: document.getElementById("routine-name"),
  routineTime: document.getElementById("routine-time"),
  routineDuration: document.getElementById("routine-duration"),
  routineCategory: document.getElementById("routine-category"),
  routineList: document.getElementById("routine-list"),
  moodOptions: document.getElementById("mood-options"),
  moodNote: document.getElementById("mood-note"),
  saveMood: document.getElementById("save-mood"),
  moodHistory: document.getElementById("mood-history"),
  breathingDisplay: document.getElementById("breathing-display"),
  breathingStart: document.getElementById("breathing-start"),
  breathingPause: document.getElementById("breathing-pause"),
  breathingReset: document.getElementById("breathing-reset"),
  breathingLength: document.getElementById("breathing-length"),
  consistencyRate: document.getElementById("consistency-rate"),
  consistencyBar: document.getElementById("consistency-bar"),
  moodBalance: document.getElementById("mood-balance"),
  moodChart: document.getElementById("mood-chart"),
  weeklyGoal: document.getElementById("weekly-goal"),
  saveGoal: document.getElementById("save-goal"),
  goalProgress: document.getElementById("goal-progress"),
  goalBar: document.getElementById("goal-bar"),
  badges: document.getElementById("badges"),
  reminders: document.getElementById("reminders"),
  enableNotifications: document.getElementById("enable-notifications"),
  refreshSuggestions: document.getElementById("refresh-suggestions"),
  suggestions: document.getElementById("suggestions"),
  wellnessGoal: document.getElementById("wellness-goal"),
  quote: document.getElementById("quote"),
  darkMode: document.getElementById("dark-mode"),
  shareProgress: document.getElementById("share-progress"),
  todayRoutines: document.getElementById("today-routines"),
  weeklyCheckins: document.getElementById("weekly-checkins"),
  streak: document.getElementById("streak")
};

const STORAGE_KEYS = {
  routines: "calmroute_routines",
  moods: "calmroute_moods",
  goal: "calmroute_goal",
  theme: "calmroute_theme",
  settings: "calmroute_settings"
};

const MOODS = [
  { label: "Great", emoji: "😄", score: 5 },
  { label: "Good", emoji: "🙂", score: 4 },
  { label: "Okay", emoji: "😌", score: 3 },
  { label: "Low", emoji: "😕", score: 2 },
  { label: "Tough", emoji: "😞", score: 1 }
];

const AI_SUGGESTIONS = [
  "Add a 10-minute walk right after lunch.",
  "Schedule a 2-minute breathing reset between meetings.",
  "Pair hydration with your first routine to anchor consistency.",
  "Wind down with a short journal before sleep.",
  "Create a low-energy routine for tough days."
];

const QUOTES = [
  "Wellness is built from small, repeated choices.",
  "Soft routines create strong resilience.",
  "Consistency turns self-care into strength.",
  "Breathe deeply, move gently, rest fully.",
  "Your nervous system loves predictable care."
];

let state = {
  routines: [],
  moods: [],
  weeklyGoal: 10,
  breathingRemaining: 4 * 60,
  breathingTimer: null,
  selectedMood: MOODS[2]
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const loadState = () => {
  const routines = localStorage.getItem(STORAGE_KEYS.routines);
  const moods = localStorage.getItem(STORAGE_KEYS.moods);
  const goal = localStorage.getItem(STORAGE_KEYS.goal);
  const theme = localStorage.getItem(STORAGE_KEYS.theme);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "{}");

  if (routines) state.routines = JSON.parse(routines);
  if (moods) state.moods = JSON.parse(moods);
  if (goal) state.weeklyGoal = JSON.parse(goal).weeklyGoal ?? state.weeklyGoal;

  elements.wellnessGoal.value = settings.wellnessGoal || "";

  if (theme === "dark") {
    document.body.classList.add("dark");
    elements.darkMode.checked = true;
  }
};

const saveState = () => {
  localStorage.setItem(STORAGE_KEYS.routines, JSON.stringify(state.routines));
  localStorage.setItem(STORAGE_KEYS.moods, JSON.stringify(state.moods));
  localStorage.setItem(STORAGE_KEYS.goal, JSON.stringify({ weeklyGoal: state.weeklyGoal }));
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ wellnessGoal: elements.wellnessGoal.value }));
};

const addRoutine = (routine) => {
  state.routines.unshift(routine);
  saveState();
  render();
};

const removeRoutine = (id) => {
  state.routines = state.routines.filter((item) => item.id !== id);
  saveState();
  render();
};

const addMood = (mood) => {
  state.moods.unshift(mood);
  saveState();
  render();
};

const getToday = () => new Date().toISOString().split("T")[0];

const filterDays = (days) => {
  const now = new Date();
  return state.routines.filter((routine) => {
    const date = new Date(routine.timestamp);
    return (now - date) / (1000 * 60 * 60 * 24) <= days;
  });
};

const renderRoutines = () => {
  elements.routineList.innerHTML = "";
  if (state.routines.length === 0) {
    elements.routineList.innerHTML = `<p class="muted">No routines yet. Add your first block.</p>`;
    return;
  }

  state.routines.slice(0, 6).forEach((routine) => {
    const item = document.createElement("div");
    item.className = "routine";
    item.innerHTML = `
      <div class="routine__row">
        <strong>${routine.name}</strong>
        <span class="tag">${routine.category}</span>
      </div>
      <div class="routine__row">
        <span class="muted">${routine.time} · ${routine.duration} min</span>
        <button class="btn ghost" data-id="${routine.id}">Remove</button>
      </div>
    `;
    elements.routineList.appendChild(item);
  });
};

const renderMoodOptions = () => {
  elements.moodOptions.innerHTML = "";
  MOODS.forEach((mood) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mood__option ${state.selectedMood.label === mood.label ? "active" : ""}`;
    button.textContent = `${mood.emoji}`;
    button.title = mood.label;
    button.addEventListener("click", () => {
      state.selectedMood = mood;
      renderMoodOptions();
    });
    elements.moodOptions.appendChild(button);
  });
};

const renderMoodHistory = () => {
  elements.moodHistory.innerHTML = "";
  state.moods.slice(0, 5).forEach((mood) => {
    const item = document.createElement("div");
    item.className = "routine";
    const time = new Date(mood.timestamp).toLocaleString();
    item.innerHTML = `
      <div class="routine__row">
        <strong>${mood.emoji} ${mood.label}</strong>
        <span class="muted">${time}</span>
      </div>
      <p class="muted">${mood.note || "No notes"}</p>
    `;
    elements.moodHistory.appendChild(item);
  });
};

const renderBreathing = () => {
  elements.breathingDisplay.textContent = formatTime(state.breathingRemaining);
};

const startBreathing = () => {
  if (state.breathingTimer) return;
  state.breathingTimer = setInterval(() => {
    state.breathingRemaining -= 1;
    renderBreathing();
    if (state.breathingRemaining <= 0) {
      pauseBreathing();
    }
  }, 1000);
};

const pauseBreathing = () => {
  clearInterval(state.breathingTimer);
  state.breathingTimer = null;
};

const resetBreathing = () => {
  pauseBreathing();
  state.breathingRemaining = Number(elements.breathingLength.value) * 60;
  renderBreathing();
};

const renderAnalytics = () => {
  const weeklyRoutines = filterDays(7);
  const routineCount = weeklyRoutines.length;
  const progress = Math.min((routineCount / state.weeklyGoal) * 100, 100);

  elements.consistencyRate.textContent = `${Math.round(progress)}%`;
  elements.consistencyBar.style.width = `${progress}%`;

  const moodScores = state.moods.slice(0, 7).map((m) => m.score);
  const average = moodScores.length
    ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length
    : 3;
  const balance = average >= 4 ? "Positive" : average >= 3 ? "Neutral" : "Needs care";
  elements.moodBalance.textContent = balance;

  elements.moodChart.innerHTML = "";
  const max = Math.max(...moodScores, 1);
  moodScores.forEach((score) => {
    const bar = document.createElement("span");
    bar.style.height = `${(score / max) * 100}%`;
    elements.moodChart.appendChild(bar);
  });
};

const renderBadges = () => {
  const badges = [];
  if (state.routines.length >= 5) badges.push("Consistency Starter");
  if (state.routines.length >= 12) badges.push("Routine Builder");
  if (state.moods.length >= 5) badges.push("Reflective Check-in");

  elements.badges.innerHTML = "";
  if (badges.length === 0) {
    elements.badges.innerHTML = `<p class="muted">Unlock badges by logging routines.</p>`;
    return;
  }

  badges.forEach((badge) => {
    const item = document.createElement("div");
    item.className = "badge-card";
    item.textContent = badge;
    elements.badges.appendChild(item);
  });
};

const renderReminders = () => {
  elements.reminders.innerHTML = "";
  if (state.routines.length === 0) {
    elements.reminders.innerHTML = `<p class="muted">Add routines to activate reminders.</p>`;
    return;
  }

  state.routines.slice(0, 5).forEach((routine) => {
    const item = document.createElement("div");
    item.className = "routine";
    item.innerHTML = `
      <div class="routine__row">
        <strong>${routine.name}</strong>
        <span class="tag">${routine.time}</span>
      </div>
      <span class="muted">${routine.category}</span>
    `;
    elements.reminders.appendChild(item);
  });
};

const renderSuggestions = () => {
  elements.suggestions.innerHTML = "";
  const pool = AI_SUGGESTIONS.sort(() => 0.5 - Math.random()).slice(0, 3);
  pool.forEach((text) => {
    const item = document.createElement("div");
    item.className = "suggestion";
    item.textContent = text;
    elements.suggestions.appendChild(item);
  });
};

const renderQuote = () => {
  const index = Math.floor(Math.random() * QUOTES.length);
  elements.quote.textContent = QUOTES[index];
};

const renderStats = () => {
  const today = getToday();
  const todayCount = state.routines.filter((routine) => routine.timestamp.startsWith(today)).length;
  const weeklyCheckins = state.moods.filter((mood) => {
    const diff = (new Date() - new Date(mood.timestamp)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  elements.todayRoutines.textContent = todayCount;
  elements.weeklyCheckins.textContent = weeklyCheckins;

  const streakDays = Math.min(weeklyCheckins, 7);
  elements.streak.textContent = `${streakDays} days`;
};

const toggleDarkMode = () => {
  const enabled = elements.darkMode.checked;
  document.body.classList.toggle("dark", enabled);
  localStorage.setItem(STORAGE_KEYS.theme, enabled ? "dark" : "light");
};

const shareProgress = async () => {
  const text = `CalmRoute update: ${state.routines.length} routine blocks, ${state.moods.length} mood check-ins.`;
  try {
    await navigator.clipboard.writeText(text);
    elements.shareProgress.textContent = "Copied!";
    setTimeout(() => {
      elements.shareProgress.textContent = "Share progress";
    }, 1500);
  } catch {
    alert(text);
  }
};

const enableNotifications = async () => {
  if (!("Notification" in window)) return;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const now = new Date();
  state.routines.forEach((routine) => {
    const [hours, minutes] = routine.time.split(":").map(Number);
    const reminder = new Date(now);
    reminder.setHours(hours, minutes, 0, 0);
    if (reminder < now) reminder.setDate(reminder.getDate() + 1);

    const delay = reminder - now;
    setTimeout(() => {
      new Notification("CalmRoute Reminder", {
        body: `Time for ${routine.name}`
      });
    }, delay);
  });
};

const setupListeners = () => {
  elements.routineForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const routine = {
      id: crypto.randomUUID(),
      name: elements.routineName.value.trim(),
      time: elements.routineTime.value,
      duration: Number(elements.routineDuration.value),
      category: elements.routineCategory.value,
      timestamp: new Date().toISOString()
    };
    if (!routine.name) return;
    addRoutine(routine);
    elements.routineForm.reset();
  });

  elements.routineList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    removeRoutine(button.dataset.id);
  });

  elements.saveMood.addEventListener("click", () => {
    addMood({
      label: state.selectedMood.label,
      emoji: state.selectedMood.emoji,
      score: state.selectedMood.score,
      note: elements.moodNote.value.trim(),
      timestamp: new Date().toISOString()
    });
    elements.moodNote.value = "";
  });

  elements.breathingStart.addEventListener("click", startBreathing);
  elements.breathingPause.addEventListener("click", pauseBreathing);
  elements.breathingReset.addEventListener("click", resetBreathing);
  elements.breathingLength.addEventListener("change", resetBreathing);

  elements.saveGoal.addEventListener("click", () => {
    state.weeklyGoal = Number(elements.weeklyGoal.value);
    saveState();
    render();
  });

  elements.refreshSuggestions.addEventListener("click", renderSuggestions);
  elements.wellnessGoal.addEventListener("input", saveState);
  elements.darkMode.addEventListener("change", toggleDarkMode);
  elements.shareProgress.addEventListener("click", shareProgress);
  elements.enableNotifications.addEventListener("click", enableNotifications);
};

const render = () => {
  renderRoutines();
  renderMoodOptions();
  renderMoodHistory();
  renderBreathing();
  renderAnalytics();
  renderBadges();
  renderReminders();
  renderSuggestions();
  renderQuote();
  renderStats();
  saveState();
};

const init = () => {
  loadState();
  resetBreathing();
  render();
  setupListeners();
};

init();
