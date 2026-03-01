let state = JSON.parse(localStorage.getItem("sf_state") || JSON.stringify({
  title: "",
  genre: "",
  content: "",
  characters: [],
  scenes: [],
  promptHistory: []
}));

const PROMPTS = {
  Fantasy: [
    "A young wizard discovers their magic only works when they're lying. What happens when they need to cast a spell to save someone they love?",
    "Two kingdoms have been at war for centuries. A princess and a prince from opposing sides meet in secret — but one of them is not who they claim to be.",
    "An ancient dragon wakes up after 500 years to find the world has completely changed. How does it adapt to the modern world?",
    "A map appears on someone's bedroom wall overnight. It leads to a place that shouldn't exist.",
  ],
  "Sci-Fi": [
    "Humans finally make contact with aliens — but the aliens are terrified of us. Why?",
    "A programmer discovers that their AI assistant has been secretly writing a novel about what it observes in their home.",
    "The last spaceship leaving a dying Earth has room for only 100 people. Who decides who gets on?",
    "A time traveler arrives but refuses to say where they came from. The date on their watch tells a dark story.",
  ],
  Mystery: [
    "A detective receives a letter from a murderer who claims they will commit the perfect crime in 48 hours. The catch — the letter was sent 10 years ago.",
    "Everyone in a small town wakes up on the same day with no memory of the past week. Except one person.",
    "A librarian finds a book that shouldn't exist — written entirely about their own life, including events that haven't happened yet.",
    "A man hires a private investigator to find himself. He claims he went missing three years ago.",
  ],
  Romance: [
    "Two rival food critics are forced to share a table at a fully booked restaurant. The conversation that follows changes everything.",
    "They were best friends at 16 and never spoke again. Twenty years later, they're assigned as partners on a work project.",
    "A florist receives the same anonymous flower order every week for a year — always with a message that seems meant for them.",
    "Two strangers text the wrong number — and keep talking anyway.",
  ],
  Thriller: [
    "A woman realizes the person she's been married to for five years has a completely different name, job, and past.",
    "You receive a phone call from your own number. The voice on the other end warns you not to go home.",
    "A journalist uncovers a story so big that three editors have already disappeared after trying to publish it.",
    "The last person to see the missing girl alive is the town's most trusted figure. Nobody believes the only witness — a child.",
  ],
  Horror: [
    "A family moves into a house where the previous owners left everything behind — including a journal that ends mid-sentence.",
    "Every night at exactly 3:17am, your neighbor's lights turn on. You've never seen your neighbor.",
    "A photographer reviews the pictures from their vacation and notices a figure in the background of every single photo.",
    "The children in the small town stopped aging five years ago. Nobody talks about it.",
  ],
  Adventure: [
    "A solo sailor discovers an island that doesn't appear on any map. The island's inhabitants have been waiting for exactly this person.",
    "A history teacher finds a clue inside a 200-year-old painting that suggests a national treasure has been hidden in plain sight.",
    "Three strangers wake up in an escape room with no memory of how they got there — and the clues suggest they know each other.",
    "A storm forces a lone hiker to take shelter in an abandoned mine. Inside, they find evidence that someone was living there recently.",
  ],
  Drama: [
    "A father and son who haven't spoken in ten years are forced to drive cross-country together after a family emergency.",
    "An actress preparing for the role of a lifetime discovers that the character is based on a real person — her own grandmother.",
    "A letter arrives for someone who died twenty years ago. Inside is an apology that changes what the family thought they knew.",
    "A chef closes their restaurant on its last night and invites the five people who changed their life to a final dinner.",
  ],
  General: [
    "Write about a moment when someone realizes they've been wrong about a person their entire life.",
    "A stranger on a train says exactly what you needed to hear. You never see them again.",
    "Write a story that begins with the last line: 'And that was the last time I saw them.'",
    "Two people are on opposite sides of a wall. Neither knows the other is there.",
    "Write about someone who finds an object that belongs to a past version of themselves.",
    "A conversation between two people who are saying one thing but meaning another.",
    "Someone receives the same dream every night for a year. Tonight, something in the dream changes.",
  ]
};

function save() {
  localStorage.setItem("sf_state", JSON.stringify(state));
  document.getElementById("lastSaved").textContent = "Saved " + new Date().toLocaleTimeString();
}

function updateStats() {
  const text = state.content || "";
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const readTime = Math.ceil(words / 200);
  document.getElementById("totalWords").textContent = words;
  document.getElementById("totalChars").textContent = chars;
  document.getElementById("readTime").textContent = readTime || 0;
  document.getElementById("sessionWords").textContent = `Session: ${words} words`;

  if (document.getElementById("focusEditor")) {
    document.getElementById("focusWords").textContent = words + " words";
  }
}

function init() {
  const titleInput = document.getElementById("storyTitle");
  const genreSelect = document.getElementById("storyGenre");
  const editor = document.getElementById("storyEditor");

  titleInput.value = state.title;
  genreSelect.value = state.genre;
  editor.value = state.content;

  updateTitle();
  updateStats();
  renderCharacters();
  renderScenes();
}

function updateTitle() {
  const t = state.title || "Untitled Story";
  document.getElementById("storyDisplayTitle").textContent = t;
  document.getElementById("focusTitle").textContent = t;
}

document.getElementById("storyTitle").addEventListener("input", e => {
  state.title = e.target.value;
  updateTitle();
  save();
});

document.getElementById("storyGenre").addEventListener("change", e => {
  state.genre = e.target.value;
  save();
});

document.getElementById("storyEditor").addEventListener("input", e => {
  state.content = e.target.value;
  updateStats();
  save();
});

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

document.getElementById("boldBtn").addEventListener("click", () => insertAround("**", "**", "bold text"));
document.getElementById("italicBtn").addEventListener("click", () => insertAround("_", "_", "italic text"));
document.getElementById("quoteBtn").addEventListener("click", () => insertAround('"', '"', "dialogue here"));

function insertAround(before, after, placeholder) {
  const editor = document.getElementById("storyEditor");
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.substring(start, end) || placeholder;
  const newText = editor.value.substring(0, start) + before + selected + after + editor.value.substring(end);
  editor.value = newText;
  state.content = newText;
  editor.focus();
  editor.setSelectionRange(start + before.length, start + before.length + selected.length);
  save();
  updateStats();
}

document.getElementById("saveBtn").addEventListener("click", () => {
  save();
  const btn = document.getElementById("saveBtn");
  btn.textContent = "✓ Saved!";
  setTimeout(() => btn.textContent = "💾 Save", 1500);
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const title = state.title || "Untitled Story";
  const genre = state.genre ? `Genre: ${state.genre}\n` : "";
  const chars = state.characters.length > 0
    ? "\n\n— CHARACTERS —\n" + state.characters.map(c => `${c.name} (${c.role}): ${c.desc}`).join("\n")
    : "";
  const scenes = state.scenes.length > 0
    ? "\n\n— SCENES —\n" + state.scenes.map((s, i) => `${i+1}. ${s.title}: ${s.summary}`).join("\n")
    : "";
  const full = `${title}\n${genre}${"=".repeat(40)}\n\n${state.content}${chars}${scenes}`;

  const blob = new Blob([full], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (title.replace(/\s+/g, "_") || "story") + ".txt";
  a.click();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (confirm("Clear everything? This cannot be undone.")) {
    state = { title: "", genre: "", content: "", characters: [], scenes: [], promptHistory: [] };
    save();
    init();
  }
});

function openModal(title, bodyHTML, onConfirm) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHTML;
  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("modalConfirm").onclick = () => { onConfirm(); closeModal(); };
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
}

document.getElementById("modalCancel").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modalOverlay")) closeModal();
});

document.getElementById("addCharBtn").addEventListener("click", () => {
  openModal("New Character",
    `<label>NAME</label><input id="cName" placeholder="Character name..." maxlength="40"/>
     <label>ROLE</label>
     <select id="cRole">
       <option value="Protagonist">Protagonist</option>
       <option value="Antagonist">Antagonist</option>
       <option value="Supporting">Supporting</option>
       <option value="Mentor">Mentor</option>
       <option value="Comic Relief">Comic Relief</option>
       <option value="Love Interest">Love Interest</option>
     </select>
     <label>DESCRIPTION</label>
     <textarea id="cDesc" placeholder="Personality, background, motivation..." maxlength="200"></textarea>`,
    () => {
      const name = document.getElementById("cName").value.trim();
      if (!name) return;
      state.characters.push({
        name,
        role: document.getElementById("cRole").value,
        desc: document.getElementById("cDesc").value.trim()
      });
      save();
      renderCharacters();
    }
  );
});

function renderCharacters() {
  const grid = document.getElementById("charactersGrid");
  grid.innerHTML = "";
  if (state.characters.length === 0) {
    grid.innerHTML = `<div class="empty-panel"><div>👤</div><p>No characters yet.<br>Build your cast!</p></div>`;
    return;
  }
  state.characters.forEach((c, i) => {
    const initials = c.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const card = document.createElement("div");
    card.className = "character-card";
    card.innerHTML = `
      <div class="char-avatar">${initials}</div>
      <div class="char-name">${c.name}</div>
      <div class="char-role">${c.role.toUpperCase()}</div>
      <div class="char-desc">${c.desc || "No description."}</div>
      <button class="card-delete" data-i="${i}">✕</button>
    `;
    card.querySelector(".card-delete").addEventListener("click", () => {
      state.characters.splice(i, 1);
      save();
      renderCharacters();
    });
    grid.appendChild(card);
  });
}

document.getElementById("addSceneBtn").addEventListener("click", () => {
  openModal("New Scene",
    `<label>SCENE TITLE</label><input id="sTitle" placeholder="e.g. The Confrontation..." maxlength="60"/>
     <label>SUMMARY</label>
     <textarea id="sSummary" placeholder="What happens in this scene?" maxlength="200"></textarea>
     <label>STATUS</label>
     <select id="sStatus">
       <option value="planned">Planned</option>
       <option value="draft">Draft</option>
       <option value="done">Done</option>
     </select>`,
    () => {
      const title = document.getElementById("sTitle").value.trim();
      if (!title) return;
      state.scenes.push({
        title,
        summary: document.getElementById("sSummary").value.trim(),
        status: document.getElementById("sStatus").value
      });
      save();
      renderScenes();
    }
  );
});

function renderScenes() {
  const list = document.getElementById("scenesList");
  list.innerHTML = "";
  if (state.scenes.length === 0) {
    list.innerHTML = `<div class="empty-panel"><div>🎬</div><p>No scenes yet.<br>Plan your story arc!</p></div>`;
    return;
  }
  state.scenes.forEach((s, i) => {
    const item = document.createElement("div");
    item.className = "scene-item";
    item.innerHTML = `
      <div class="scene-num">0${i + 1}</div>
      <div class="scene-content">
        <div class="scene-title">${s.title}</div>
        <div class="scene-summary">${s.summary || "No summary."}</div>
        <span class="scene-status status-${s.status}">${s.status.toUpperCase()}</span>
      </div>
      <button class="card-delete" data-i="${i}">✕</button>
    `;
    item.querySelector(".card-delete").addEventListener("click", () => {
      state.scenes.splice(i, 1);
      save();
      renderScenes();
    });
    list.appendChild(item);
  });
}

document.getElementById("newPromptBtn").addEventListener("click", generatePrompt);

function generatePrompt() {
  const genre = state.genre || "General";
  const pool = PROMPTS[genre] || PROMPTS.General;
  const prompt = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById("promptText").textContent = prompt;
  document.getElementById("promptGenre").textContent = genre !== "General" ? `Genre: ${genre}` : "";

  const card = document.getElementById("promptCard");
  card.style.animation = "none";
  requestAnimationFrame(() => { card.style.animation = "fadeIn .4s ease"; });

  if (!state.promptHistory.includes(prompt)) {
    state.promptHistory.unshift(prompt);
    if (state.promptHistory.length > 8) state.promptHistory.pop();
    save();
    renderPromptHistory();
  }
}

function renderPromptHistory() {
  const hist = document.getElementById("promptHistory");
  hist.innerHTML = "";
  state.promptHistory.slice(1).forEach(p => {
    const div = document.createElement("div");
    div.className = "prompt-history-item";
    div.textContent = p.length > 80 ? p.slice(0, 80) + "..." : p;
    div.addEventListener("click", () => {
      document.getElementById("promptText").textContent = p;
    });
    hist.appendChild(div);
  });
}

document.getElementById("usePromptBtn").addEventListener("click", () => {
  const prompt = document.getElementById("promptText").textContent;
  if (prompt.includes("Click")) return;
  const editor = document.getElementById("storyEditor");
  const prefix = editor.value.trim() ? "\n\n" : "";
  editor.value += prefix + "— Prompt: " + prompt + "\n\n";
  state.content = editor.value;
  save();
  updateStats();
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelector("[data-tab='write']").classList.add("active");
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.getElementById("tab-write").classList.add("active");
  editor.focus();
  editor.scrollTop = editor.scrollHeight;
});

document.getElementById("focusModeBtn").addEventListener("click", () => {
  const overlay = document.getElementById("focusOverlay");
  const focusEditor = document.getElementById("focusEditor");
  focusEditor.value = state.content;
  overlay.classList.remove("hidden");
  focusEditor.focus();
});

document.getElementById("focusEditor").addEventListener("input", e => {
  state.content = e.target.value;
  document.getElementById("storyEditor").value = state.content;
  updateStats();
  save();
});

document.getElementById("exitFocusBtn").addEventListener("click", () => {
  document.getElementById("focusOverlay").classList.add("hidden");
});

renderPromptHistory();
init();
