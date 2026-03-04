const elements = {
  habits: document.getElementById("habits"),
  habitForm: document.getElementById("habit-form"),
  habitName: document.getElementById("habit-name"),
  habitCategory: document.getElementById("habit-category"),
  habitFrequency: document.getElementById("habit-frequency"),
  habitTarget: document.getElementById("habit-target"),
  habitReminder: document.getElementById("habit-reminder"),
  habitReminderTime: document.getElementById("habit-reminder-time"),
  toggleView: document.getElementById("toggle-view"),
  achievements: document.getElementById("achievements"),
  weeklyRate: document.getElementById("weekly-rate"),
  monthlyRate: document.getElementById("monthly-rate"),
  weeklyBar: document.getElementById("weekly-bar"),
  monthlyBar: document.getElementById("monthly-bar"),
  streakHighlight: document.getElementById("streak-highlight"),
  insights: document.getElementById("insights"),
  suggestions: document.getElementById("suggestions"),
  refreshSuggestions: document.getElementById("refresh-suggestions"),
  goal: document.getElementById("goal"),
  quote: document.getElementById("quote"),
  reminders: document.getElementById("reminders"),
  enableNotifications: document.getElementById("enable-notifications"),
  darkMode: document.getElementById("dark-mode"),
  shareProgress: document.getElementById("share-progress"),
  activeHabits: document.getElementById("active-habits"),
  weeklyCompletions: document.getElementById("weekly-completions"),
  level: document.getElementById("level")
};

const STORAGE_KEYS = {
  habits: "habitnest_habits",
  settings: "habitnest_settings"
};

const defaultSettings = {
  showArchived: false,
  darkMode: false,
  goal: "",
  notifications: false
};

let state = {
  habits: [],
  settings: { ...defaultSettings }
};

const quotes = [
  "Small steps every day lead to stunning progress.",
  "Your future self will thank you for showing up today.",
  "Consistency is the real superpower.",
  "Habits grow when you make them easy to repeat.",
  "Celebrate the win, then keep going."
];

const AI_SUGGESTIONS = [
  { goal: "focus", tip: "Create a morning focus ritual with a 5-minute setup cue." },
  { goal: "energy", tip: "Anchor an afternoon stretch habit after lunch." },
  { goal: "fitness", tip: "Pair workouts with a playlist to make the cue stronger." },
  { goal: "sleep", tip: "Add a screen-free wind-down habit 30 minutes before bed." },
  { goal: "learning", tip: "Use a 10-minute review habit right after classes." }
];

const ACHIEVEMENTS = [
  { title: "First Spark", requirement: 1, description: "Complete your first habit." },
  { title: "Momentum", requirement: 10, description: "Log 10 total completions." },
  { title: "Streak Master", requirement: 7, description: "Reach a 7-day streak." },
  { title: "Consistency", requirement: 30, description: "Log 30 completions." },
  { title: "Habit Hero", requirement: 60, description: "Log 60 completions." }
];

const generateId = () => crypto.randomUUID();

const getToday = () => new Date().toISOString().split("T")[0];

const getWeekKey = (date) => {
  const target = new Date(date);
  const firstDay = new Date(target.getFullYear(), 0, 1);
  const dayOffset = Math.floor((target - firstDay) / (1000 * 60 * 60 * 24));
  return `${target.getFullYear()}-W${Math.ceil((dayOffset + firstDay.getDay() + 1) / 7)}`;
};

const getDateRange = (days) => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days);
  return { start, end: now };
};

const loadState = () => {
  const storedHabits = localStorage.getItem(STORAGE_KEYS.habits);
  const storedSettings = localStorage.getItem(STORAGE_KEYS.settings);

  if (storedHabits) {
    state.habits = JSON.parse(storedHabits);
  }

  if (storedSettings) {
    state.settings = { ...defaultSettings, ...JSON.parse(storedSettings) };
  }
};

const saveState = () => {
  localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(state.habits));
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
};

const normalizeHabit = (habit) => ({
  ...habit,
  completions: habit.completions || [],
  reminders: habit.reminders || [],
  archived: habit.archived || false
});

const addHabit = (habit) => {
  state.habits.unshift(normalizeHabit(habit));
  saveState();
  render();
};

const toggleCompletion = (habitId) => {
  const habit = state.habits.find((item) => item.id === habitId);
  if (!habit) return;
  const today = getToday();
  const index = habit.completions.indexOf(today);
  if (index >= 0) {
    habit.completions.splice(index, 1);
  } else {
    habit.completions.push(today);
  }
  saveState();
  render();
};

const archiveHabit = (habitId) => {
  const habit = state.habits.find((item) => item.id === habitId);
  if (!habit) return;
  habit.archived = !habit.archived;
  saveState();
  render();
};

const deleteHabit = (habitId) => {
  state.habits = state.habits.filter((habit) => habit.id !== habitId);
  saveState();
  render();
};

const computeDailyStreak = (habit) => {
  if (habit.frequency !== "daily") return 0;
  const dates = habit.completions.map((date) => new Date(date)).sort((a, b) => b - a);
  if (dates.length === 0) return 0;
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const date of dates) {
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === current.getTime()) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    }
  }
  return streak;
};

const computeWeeklyStreak = (habit) => {
  if (habit.frequency !== "weekly") return 0;
  const grouped = habit.completions.reduce((acc, date) => {
    const key = getWeekKey(date);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const weekKeys = Object.keys(grouped).sort().reverse();
  if (weekKeys.length === 0) return 0;

  let streak = 0;
  let current = getWeekKey(new Date());

  for (const key of weekKeys) {
    if (key === current && grouped[key] >= habit.target) {
      streak += 1;
      const [year, week] = key.split("-W");
      const prevWeek = Number(week) - 1;
      current = `${year}-W${String(prevWeek).padStart(2, "0")}`;
    }
  }

  return streak;
};

const computeCompletionRate = (rangeDays) => {
  const { start, end } = getDateRange(rangeDays);
  const totalHabits = state.habits.filter((habit) => !habit.archived).length;
  if (totalHabits === 0) return 0;

  const completions = state.habits
    .filter((habit) => !habit.archived)
    .reduce((sum, habit) => {
      return (
        sum +
        habit.completions.filter((date) => {
          const day = new Date(date);
          return day >= start && day <= end;
        }).length
      );
    }, 0);

  const expected = totalHabits * rangeDays;
  return Math.min(Math.round((completions / expected) * 100), 100);
};

const getHighestStreak = () => {
  const streaks = state.habits.map((habit) =>
    habit.frequency === "daily" ? computeDailyStreak(habit) : computeWeeklyStreak(habit)
  );
  return Math.max(0, ...streaks);
};

const getTotalCompletions = () =>
  state.habits.reduce((sum, habit) => sum + habit.completions.length, 0);

const computeLevel = () => {
  const completions = getTotalCompletions();
  const level = Math.max(1, Math.floor(completions / 10) + 1);
  return level;
};

const renderHabits = () => {
  elements.habits.innerHTML = "";
  const list = state.habits.filter((habit) => habit.archived === state.settings.showArchived);

  if (list.length === 0) {
    elements.habits.innerHTML = `<p class="muted">No habits here yet.</p>`;
    return;
  }

  list.forEach((habit) => {
    const habitEl = document.createElement("div");
    habitEl.className = "habit";

    const isDoneToday = habit.completions.includes(getToday());
    const streak = habit.frequency === "daily" ? computeDailyStreak(habit) : computeWeeklyStreak(habit);
    const progress = habit.frequency === "daily" ? (isDoneToday ? 100 : 0) : Math.min((habit.completions.filter((date) => getWeekKey(date) === getWeekKey(new Date())).length / habit.target) * 100, 100);

    habitEl.innerHTML = `
      <div class="habit__header">
        <div>
          <div class="habit__title">${habit.name}</div>
          <div class="habit__meta">
            <span class="tag">${habit.category}</span>
            <span>${habit.frequency === "daily" ? "Daily" : `Weekly · ${habit.target}x`}</span>
            <span>${streak} streak</span>
          </div>
        </div>
        <div class="habit__actions">
          <button class="btn ${isDoneToday ? "primary" : ""}" data-action="toggle" data-id="${habit.id}">
            ${isDoneToday ? "Completed" : "Mark done"}
          </button>
          <button class="btn ghost" data-action="archive" data-id="${habit.id}">
            ${habit.archived ? "Restore" : "Archive"}
          </button>
          <button class="btn ghost" data-action="delete" data-id="${habit.id}">
            Delete
          </button>
        </div>
      </div>
      <div class="progress"><span style="width: ${progress}%"></span></div>
    `;

    elements.habits.appendChild(habitEl);
  });
};

const renderAchievements = () => {
  elements.achievements.innerHTML = "";
  const completions = getTotalCompletions();
  const highestStreak = getHighestStreak();

  ACHIEVEMENTS.forEach((achievement) => {
    let completed = false;
    if (achievement.title === "Streak Master") {
      completed = highestStreak >= achievement.requirement;
    } else {
      completed = completions >= achievement.requirement;
    }

    const item = document.createElement("div");
    item.className = `achievement ${completed ? "completed" : ""}`;
    item.innerHTML = `
      <strong>${achievement.title}</strong>
      <span class="muted">${achievement.description}</span>
    `;
    elements.achievements.appendChild(item);
  });
};

const renderAnalytics = () => {
  const weeklyRate = computeCompletionRate(7);
  const monthlyRate = computeCompletionRate(30);

  elements.weeklyRate.textContent = `${weeklyRate}%`;
  elements.monthlyRate.textContent = `${monthlyRate}%`;
  elements.weeklyBar.style.width = `${weeklyRate}%`;
  elements.monthlyBar.style.width = `${monthlyRate}%`;

  const highestStreak = getHighestStreak();
  elements.streakHighlight.textContent = highestStreak
    ? `${highestStreak} day/week streak`
    : "No streaks yet";

  elements.insights.innerHTML = "";
  const insights = [];
  if (weeklyRate >= 80) insights.push("Fantastic weekly consistency. Keep momentum! 🟢");
  if (monthlyRate < 50) insights.push("Try scheduling reminders to increase follow-through.");
  if (highestStreak >= 7) insights.push("Your streaks show strong habit formation signals.");
  if (insights.length === 0) insights.push("Start with one habit to build consistency.");

  insights.forEach((text) => {
    const item = document.createElement("div");
    item.className = "insight";
    item.textContent = text;
    elements.insights.appendChild(item);
  });
};

const renderSuggestions = () => {
  const goal = elements.goal.value.toLowerCase();
  const matches = AI_SUGGESTIONS.filter((item) => goal.includes(item.goal));
  const pool = matches.length ? matches : AI_SUGGESTIONS;
  elements.suggestions.innerHTML = "";

  pool.slice(0, 3).forEach((item) => {
    const suggestion = document.createElement("div");
    suggestion.className = "suggestion";
    suggestion.innerHTML = `<strong>${item.goal.toUpperCase()}</strong><p>${item.tip}</p>`;
    elements.suggestions.appendChild(suggestion);
  });
};

const renderQuote = () => {
  const index = Math.floor(Math.random() * quotes.length);
  elements.quote.textContent = quotes[index];
};

const renderReminders = () => {
  elements.reminders.innerHTML = "";
  const reminders = state.habits.filter((habit) => habit.reminderEnabled && !habit.archived);

  if (reminders.length === 0) {
    elements.reminders.innerHTML = `<p class="muted">No reminders configured.</p>`;
    return;
  }

  reminders.forEach((habit) => {
    const item = document.createElement("div");
    item.className = "reminder";
    item.innerHTML = `
      <span>${habit.name} · ${habit.reminderTime}</span>
      <span>${habit.frequency === "daily" ? "Daily" : "Weekly"}</span>
    `;
    elements.reminders.appendChild(item);
  });
};

const scheduleNotifications = () => {
  if (!state.settings.notifications || Notification.permission !== "granted") return;
  const now = new Date();

  state.habits.forEach((habit) => {
    if (!habit.reminderEnabled || habit.archived) return;
    const [hours, minutes] = habit.reminderTime.split(":").map(Number);
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);
    if (reminderTime < now) reminderTime.setDate(reminderTime.getDate() + 1);

    const delay = reminderTime - now;
    setTimeout(() => {
      new Notification("HabitNest Reminder", {
        body: `Time for ${habit.name}`,
        icon: "https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/System/notification-3-line.svg"
      });
    }, delay);
  });
};

const renderStats = () => {
  const activeHabits = state.habits.filter((habit) => !habit.archived).length;
  const weeklyCompletions = state.habits.reduce((sum, habit) => {
    return (
      sum +
      habit.completions.filter((date) => {
        const now = new Date();
        const day = new Date(date);
        return (now - day) / (1000 * 60 * 60 * 24) <= 7;
      }).length
    );
  }, 0);

  elements.activeHabits.textContent = activeHabits;
  elements.weeklyCompletions.textContent = weeklyCompletions;
  elements.level.textContent = `Level ${computeLevel()}`;
};

const render = () => {
  renderHabits();
  renderAchievements();
  renderAnalytics();
  renderReminders();
  renderStats();
  renderSuggestions();
  renderQuote();
  scheduleNotifications();
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  const habit = {
    id: generateId(),
    name: elements.habitName.value.trim(),
    category: elements.habitCategory.value,
    frequency: elements.habitFrequency.value,
    target: Number(elements.habitTarget.value),
    reminderEnabled: elements.habitReminder.checked,
    reminderTime: elements.habitReminderTime.value,
    completions: [],
    archived: false
  };

  if (!habit.name) return;

  addHabit(habit);
  elements.habitForm.reset();
  elements.habitTarget.value = 3;
};

const toggleView = () => {
  state.settings.showArchived = !state.settings.showArchived;
  elements.toggleView.textContent = state.settings.showArchived ? "Show active" : "Show archived";
  saveState();
  renderHabits();
};

const enableNotifications = async () => {
  if (!("Notification" in window)) return;
  const permission = await Notification.requestPermission();
  state.settings.notifications = permission === "granted";
  saveState();
  scheduleNotifications();
};

const toggleDarkMode = () => {
  state.settings.darkMode = elements.darkMode.checked;
  document.body.classList.toggle("dark", state.settings.darkMode);
  saveState();
};

const shareProgress = async () => {
  const text = `HabitNest update: ${getTotalCompletions()} completions, Level ${computeLevel()}!`;
  try {
    await navigator.clipboard.writeText(text);
    elements.shareProgress.textContent = "Copied!";
    setTimeout(() => {
      elements.shareProgress.textContent = "Share achievements";
    }, 1500);
  } catch {
    alert(text);
  }
};

const handleHabitActions = (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const habitId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "toggle") toggleCompletion(habitId);
  if (action === "archive") archiveHabit(habitId);
  if (action === "delete") deleteHabit(habitId);
};

const init = () => {
  loadState();
  state.habits = state.habits.map(normalizeHabit);
  elements.goal.value = state.settings.goal || "";
  elements.darkMode.checked = state.settings.darkMode;
  document.body.classList.toggle("dark", state.settings.darkMode);
  elements.toggleView.textContent = state.settings.showArchived ? "Show active" : "Show archived";

  render();

  elements.habitForm.addEventListener("submit", handleFormSubmit);
  elements.habits.addEventListener("click", handleHabitActions);
  elements.toggleView.addEventListener("click", toggleView);
  elements.refreshSuggestions.addEventListener("click", renderSuggestions);
  elements.goal.addEventListener("input", () => {
    state.settings.goal = elements.goal.value;
    saveState();
    renderSuggestions();
  });
  elements.enableNotifications.addEventListener("click", enableNotifications);
  elements.darkMode.addEventListener("change", toggleDarkMode);
  elements.shareProgress.addEventListener("click", shareProgress);
};

init();
