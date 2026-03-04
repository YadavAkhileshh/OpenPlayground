const elements = {
  timerDisplay: document.getElementById("timer-display"),
  timerMode: document.getElementById("timer-mode"),
  sessionLabel: document.getElementById("session-label"),
  startBtn: document.getElementById("start-btn"),
  pauseBtn: document.getElementById("pause-btn"),
  resetBtn: document.getElementById("reset-btn"),
  skipBtn: document.getElementById("skip-btn"),
  focusMin: document.getElementById("focus-min"),
  shortBreak: document.getElementById("short-break"),
  longBreak: document.getElementById("long-break"),
  sessionsBeforeLong: document.getElementById("sessions-before-long"),
  autoStart: document.getElementById("auto-start"),
  saveSettings: document.getElementById("save-settings"),
  suggestionTitle: document.getElementById("suggestion-title"),
  suggestionBody: document.getElementById("suggestion-body"),
  suggestionMeta: document.getElementById("suggestion-meta"),
  refreshSuggestion: document.getElementById("refresh-suggestion"),
  soundscape: document.getElementById("soundscape"),
  volume: document.getElementById("volume"),
  soundToggle: document.getElementById("sound-toggle"),
  noteInput: document.getElementById("note-input"),
  saveNote: document.getElementById("save-note"),
  notesList: document.getElementById("notes-list"),
  dailyProgress: document.getElementById("daily-progress"),
  weeklyProgress: document.getElementById("weekly-progress"),
  completionRate: document.getElementById("completion-rate"),
  dailyBar: document.getElementById("daily-bar"),
  weeklyBar: document.getElementById("weekly-bar"),
  weeklyChart: document.getElementById("weekly-chart"),
  weeklyGoal: document.getElementById("weekly-goal"),
  saveGoal: document.getElementById("save-goal"),
  goalProgress: document.getElementById("goal-progress"),
  goalBar: document.getElementById("goal-bar"),
  milestones: document.getElementById("milestones"),
  todayMinutes: document.getElementById("today-minutes"),
  focusScore: document.getElementById("focus-score"),
  weeklySessions: document.getElementById("weekly-sessions")
};

const STORAGE_KEYS = {
  settings: "studyflow_settings",
  sessions: "studyflow_sessions",
  notes: "studyflow_notes",
  goal: "studyflow_goal"
};

const defaultSettings = {
  focusMinutes: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLong: 4,
  autoStart: false
};

let state = {
  settings: { ...defaultSettings },
  mode: "focus",
  remaining: defaultSettings.focusMinutes * 60,
  running: false,
  timerId: null,
  sessionCount: 1,
  startedSessions: 0,
  completedSessions: 0,
  sessions: [],
  notes: [],
  weeklyGoal: 12
};

let audioState = {
  context: null,
  source: null,
  gain: null,
  isPlaying: false,
  currentType: "rain"
};

const SUGGESTIONS = {
  focus: [
    {
      title: "Prep your next task",
      body: "Before the timer ends, jot the next micro-step to start quickly.",
      meta: "Boosts momentum for the next focus block."
    }
  ],
  break: [
    {
      title: "2-minute mobility reset",
      body: "Stand up, roll shoulders, and stretch your wrists.",
      meta: "Great for short breaks."
    },
    {
      title: "Hydration check",
      body: "Drink a glass of water and take 5 deep breaths.",
      meta: "Recommended after intense focus."
    },
    {
      title: "Quick visual reset",
      body: "Look at something 20 feet away for 20 seconds.",
      meta: "Reduces eye strain on screens."
    },
    {
      title: "Mini tidy sprint",
      body: "Clear the top of your desk for a fresh session.",
      meta: "Improves cognitive clarity."
    }
  ],
  longBreak: [
    {
      title: "Walk & reflect",
      body: "Take a 5-minute walk and summarize what you learned.",
      meta: "Ideal for long breaks."
    },
    {
      title: "Snack refuel",
      body: "Grab a healthy snack and reset your posture.",
      meta: "Maintain energy for the next cycle."
    }
  ]
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const loadData = () => {
  const storedSettings = localStorage.getItem(STORAGE_KEYS.settings);
  const storedSessions = localStorage.getItem(STORAGE_KEYS.sessions);
  const storedNotes = localStorage.getItem(STORAGE_KEYS.notes);
  const storedGoal = localStorage.getItem(STORAGE_KEYS.goal);

  if (storedSettings) {
    state.settings = { ...defaultSettings, ...JSON.parse(storedSettings) };
  }

  if (storedSessions) {
    state.sessions = JSON.parse(storedSessions);
    const counts = state.sessions.reduce(
      (acc, session) => {
        if (session.type === "focus") {
          acc.started += 1;
          if (session.completed) acc.completed += 1;
        }
        return acc;
      },
      { started: 0, completed: 0 }
    );
    state.startedSessions = counts.started;
    state.completedSessions = counts.completed;
  }

  if (storedNotes) {
    state.notes = JSON.parse(storedNotes);
  }

  if (storedGoal) {
    state.weeklyGoal = JSON.parse(storedGoal).weeklyGoal ?? state.weeklyGoal;
  }
};

const saveSettings = () => {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
};

const saveSessions = () => {
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(state.sessions.slice(-200)));
};

const saveNotes = () => {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(state.notes.slice(-50)));
};

const saveGoal = () => {
  localStorage.setItem(STORAGE_KEYS.goal, JSON.stringify({ weeklyGoal: state.weeklyGoal }));
};

const updateTimerDisplay = () => {
  elements.timerDisplay.textContent = formatTime(state.remaining);
  elements.timerMode.textContent =
    state.mode === "focus" ? "Focus" : state.mode === "short" ? "Short Break" : "Long Break";
  elements.sessionLabel.textContent = `Session ${state.sessionCount}`;
};

const setMode = (mode) => {
  state.mode = mode;
  const duration =
    mode === "focus"
      ? state.settings.focusMinutes
      : mode === "short"
        ? state.settings.shortBreak
        : state.settings.longBreak;
  state.remaining = duration * 60;
  updateTimerDisplay();
  updateSuggestion();
};

const startTimer = () => {
  if (state.running) return;

  if (state.mode === "focus") {
    state.startedSessions += 1;
  }

  state.running = true;
  elements.startBtn.disabled = true;

  state.timerId = setInterval(() => {
    state.remaining -= 1;
    updateTimerDisplay();
    if (state.remaining <= 0) {
      handleSessionComplete();
    }
  }, 1000);
};

const pauseTimer = () => {
  state.running = false;
  elements.startBtn.disabled = false;
  clearInterval(state.timerId);
};

const resetTimer = () => {
  pauseTimer();
  setMode(state.mode);
};

const logSession = (completed) => {
  state.sessions.push({
    type: state.mode,
    duration:
      state.mode === "focus"
        ? state.settings.focusMinutes
        : state.mode === "short"
          ? state.settings.shortBreak
          : state.settings.longBreak,
    completed,
    timestamp: new Date().toISOString()
  });
  saveSessions();
};

const handleSessionComplete = () => {
  pauseTimer();
  logSession(true);
  playBeep();

  if (state.mode === "focus") {
    state.completedSessions += 1;
    const isLongBreak = state.sessionCount % state.settings.sessionsBeforeLong === 0;
    setMode(isLongBreak ? "long" : "short");
  } else {
    state.sessionCount += 1;
    setMode("focus");
  }

  updateAnalytics();

  if (state.settings.autoStart) {
    startTimer();
  }
};

const skipBreak = () => {
  if (state.mode === "focus") return;
  setMode("focus");
  state.sessionCount += 1;
  if (state.settings.autoStart) {
    startTimer();
  }
};

const updateSettingsForm = () => {
  elements.focusMin.value = state.settings.focusMinutes;
  elements.shortBreak.value = state.settings.shortBreak;
  elements.longBreak.value = state.settings.longBreak;
  elements.sessionsBeforeLong.value = state.settings.sessionsBeforeLong;
  elements.autoStart.checked = state.settings.autoStart;
};

const applySettings = () => {
  state.settings = {
    focusMinutes: Number(elements.focusMin.value),
    shortBreak: Number(elements.shortBreak.value),
    longBreak: Number(elements.longBreak.value),
    sessionsBeforeLong: Number(elements.sessionsBeforeLong.value),
    autoStart: elements.autoStart.checked
  };
  saveSettings();
  setMode(state.mode);
};

const updateSuggestion = () => {
  const focusScore = calculateFocusScore();
  const key = state.mode === "focus" ? "focus" : state.mode === "short" ? "break" : "longBreak";
  const pool = SUGGESTIONS[key];
  const suggestion = pool[Math.floor(Math.random() * pool.length)];
  const adaptiveNote = focusScore < 60
    ? "Tip: choose a gentle reset to rebuild focus."
    : "Tip: keep it short to preserve momentum.";

  elements.suggestionTitle.textContent = suggestion.title;
  elements.suggestionBody.textContent = suggestion.body;
  elements.suggestionMeta.textContent = `${suggestion.meta} ${adaptiveNote}`;
};

const addNote = () => {
  const text = elements.noteInput.value.trim();
  if (!text) return;
  state.notes.unshift({ text, timestamp: new Date().toISOString() });
  elements.noteInput.value = "";
  saveNotes();
  renderNotes();
};

const renderNotes = () => {
  elements.notesList.innerHTML = "";
  state.notes.slice(0, 6).forEach((note) => {
    const noteEl = document.createElement("div");
    noteEl.className = "note";
    const time = new Date(note.timestamp);
    noteEl.innerHTML = `<time>${time.toLocaleString()}</time><p>${note.text}</p>`;
    elements.notesList.appendChild(noteEl);
  });
};

const filterSessions = (days) => {
  const now = new Date();
  return state.sessions.filter((session) => {
    const date = new Date(session.timestamp);
    const diff = (now - date) / (1000 * 60 * 60 * 24);
    return diff <= days;
  });
};

const calculateFocusScore = () => {
  if (state.startedSessions === 0) return 0;
  return Math.round((state.completedSessions / state.startedSessions) * 100);
};

const updateAnalytics = () => {
  const dailySessions = filterSessions(1).filter((s) => s.type === "focus");
  const weeklySessions = filterSessions(7).filter((s) => s.type === "focus");

  const dailyMinutes = dailySessions.reduce((sum, s) => sum + s.duration, 0);
  const weeklyMinutes = weeklySessions.reduce((sum, s) => sum + s.duration, 0);

  const dailyTarget = state.settings.focusMinutes * 4;
  const weeklyTarget = state.settings.focusMinutes * state.weeklyGoal;

  elements.dailyProgress.textContent = `${dailyMinutes} / ${dailyTarget} min`;
  elements.weeklyProgress.textContent = `${weeklyMinutes} / ${weeklyTarget} min`;

  elements.dailyBar.style.width = `${Math.min((dailyMinutes / dailyTarget) * 100, 100)}%`;
  elements.weeklyBar.style.width = `${Math.min((weeklyMinutes / weeklyTarget) * 100, 100)}%`;

  const completion = calculateFocusScore();
  elements.completionRate.textContent = `${completion}%`;
  elements.focusScore.textContent = `${completion}%`;
  elements.todayMinutes.textContent = dailyMinutes;
  elements.weeklySessions.textContent = weeklySessions.length;

  updateWeeklyChart(weeklySessions);
  updateGoals(weeklySessions.length);
};

const updateWeeklyChart = (weeklySessions) => {
  const buckets = Array.from({ length: 7 }, () => 0);
  const now = new Date();

  weeklySessions.forEach((session) => {
    const date = new Date(session.timestamp);
    const dayDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (dayDiff >= 0 && dayDiff < 7) {
      buckets[6 - dayDiff] += session.duration;
    }
  });

  const max = Math.max(...buckets, 1);
  elements.weeklyChart.innerHTML = "";
  buckets.forEach((value) => {
    const bar = document.createElement("span");
    bar.style.height = `${(value / max) * 100}%`;
    elements.weeklyChart.appendChild(bar);
  });
};

const updateGoals = (weeklyCount) => {
  const goal = state.weeklyGoal;
  elements.goalProgress.textContent = `${weeklyCount} / ${goal} sessions`;
  elements.goalBar.style.width = `${Math.min((weeklyCount / goal) * 100, 100)}%`;

  const milestones = [25, 50, 75, 100];
  elements.milestones.innerHTML = "";
  milestones.forEach((percent) => {
    const required = Math.ceil((goal * percent) / 100);
    const item = document.createElement("li");
    const achieved = weeklyCount >= required;
    item.className = achieved ? "completed" : "";
    item.innerHTML = `${achieved ? "✔" : "○"} ${percent}% milestone (${required} sessions)`;
    elements.milestones.appendChild(item);
  });
};

const setupGoal = () => {
  elements.weeklyGoal.value = state.weeklyGoal;
};

const updateSoundButton = () => {
  elements.soundToggle.textContent = audioState.isPlaying
    ? "Stop ambient sound"
    : "Start ambient sound";
};

const createNoiseSource = (type) => {
  const context = audioState.context;
  const bufferSize = context.sampleRate * 2;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = type === "cafe" ? "bandpass" : "lowpass";
  filter.frequency.value = type === "waves" ? 600 : type === "cafe" ? 1200 : 800;
  filter.Q.value = type === "cafe" ? 0.7 : 0.5;

  source.connect(filter);
  filter.connect(audioState.gain);
  return source;
};

const toggleSound = () => {
  if (!audioState.context) {
    audioState.context = new (window.AudioContext || window.webkitAudioContext)();
    audioState.gain = audioState.context.createGain();
    audioState.gain.connect(audioState.context.destination);
  }

  if (audioState.isPlaying) {
    audioState.source?.stop();
    audioState.isPlaying = false;
  } else {
    audioState.currentType = elements.soundscape.value;
    audioState.source = createNoiseSource(audioState.currentType);
    audioState.source.start();
    audioState.isPlaying = true;
  }

  updateSoundButton();
};

const updateVolume = () => {
  if (!audioState.gain) return;
  audioState.gain.gain.value = Number(elements.volume.value) / 100;
};

const playBeep = () => {
  try {
    const context = audioState.context || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.1;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
  } catch (error) {
    console.warn("Audio context not available", error);
  }
};

const setupEventListeners = () => {
  elements.startBtn.addEventListener("click", startTimer);
  elements.pauseBtn.addEventListener("click", pauseTimer);
  elements.resetBtn.addEventListener("click", resetTimer);
  elements.skipBtn.addEventListener("click", skipBreak);
  elements.saveSettings.addEventListener("click", applySettings);
  elements.refreshSuggestion.addEventListener("click", updateSuggestion);
  elements.saveNote.addEventListener("click", addNote);
  elements.saveGoal.addEventListener("click", () => {
    state.weeklyGoal = Number(elements.weeklyGoal.value);
    saveGoal();
    updateAnalytics();
  });
  elements.soundToggle.addEventListener("click", toggleSound);
  elements.soundscape.addEventListener("change", () => {
    if (audioState.isPlaying) {
      toggleSound();
      toggleSound();
    }
  });
  elements.volume.addEventListener("input", updateVolume);
};

const init = () => {
  loadData();
  updateSettingsForm();
  setupGoal();
  setMode(state.mode);
  renderNotes();
  updateAnalytics();
  updateVolume();
  updateSoundButton();
  setupEventListeners();
  updateSuggestion();
};

init();
