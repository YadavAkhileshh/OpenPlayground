const addBtn = document.getElementById("addNote");
const notesContainer = document.getElementById("notesContainer");
const searchInput = document.getElementById("search");

let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Save notes
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Render notes
function renderNotes(filter = "") {
  notesContainer.innerHTML = "";

  notes
    .filter(note =>
      note.text.toLowerCase().includes(filter.toLowerCase())
    )
    .forEach(note => {
      const div = document.createElement("div");
      div.className = "note";

      div.innerHTML = `
        <strong>${note.title}</strong>
        <textarea>${note.text}</textarea>
        <div class="note-footer">
          <small>${new Date(note.date).toLocaleString()}</small>
          <button class="delete">Delete</button>
        </div>
      `;

      const textarea = div.querySelector("textarea");
      textarea.addEventListener("input", () => {
        note.text = textarea.value;
        saveNotes();
      });

      div.querySelector(".delete").addEventListener("click", () => {
        notes = notes.filter(n => n.id !== note.id);
        saveNotes();
        renderNotes(searchInput.value);
      });

      notesContainer.appendChild(div);
    });
}

// Add note
addBtn.addEventListener("click", () => {
  const title = prompt("Enter note title:");
  if (!title) return;

  notes.unshift({
    id: Date.now(),
    title,
    text: "",
    date: Date.now()
  });

  saveNotes();
  renderNotes(searchInput.value);
});

// Search
searchInput.addEventListener("input", () => {
  renderNotes(searchInput.value);
});

// Initial load
renderNotes();