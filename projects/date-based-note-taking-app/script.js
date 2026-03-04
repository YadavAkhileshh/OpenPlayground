const titleInput = document.getElementById("entry-title");
const contentInput = document.getElementById("entry-content");
const saveBtn = document.getElementById("save-btn");
const updateBtn = document.getElementById("update-btn");
const deleteBtn = document.getElementById("delete-btn");
const newBtn = document.getElementById("new-btn");

const notesList = document.getElementById("entries-container");
const searchInput = document.getElementById("search-input");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let editIndex = null;

/* Save to localStorage */
function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

/* Render notes (FIXED INDEX ISSUE) */
function renderNotes(filter = "") {
    notesList.innerHTML = "";

    const filteredNotes = notes
        .map((note, index) => ({ note, index }))
        .filter(({ note }) =>
            note.title.toLowerCase().includes(filter) ||
            note.content.toLowerCase().includes(filter)
        );

    if (filteredNotes.length === 0) {
        notesList.innerHTML = `<p class="empty-state">No entries found</p>`;
        return;
    }

    filteredNotes.forEach(({ note, index }) => {
        const div = document.createElement("div");
        div.className = "entry-item";

        div.innerHTML = `
            <div class="entry-header">
                <strong>${note.title}</strong>
            </div>
            <p class="entry-content">${note.content}</p>
            <div class="entry-actions">
                <button class="btn btn-secondary" onclick="editNote(${index})">Edit</button>
                <button class="btn btn-danger" onclick="deleteNote(${index})">Delete</button>
            </div>
        `;

        notesList.appendChild(div);
    });
}

/* Save new note */
saveBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) return;

    notes.push({ title, content });

    clearForm();
    saveNotes();
    renderNotes(searchInput.value.toLowerCase());
});

/* Edit note */
function editNote(index) {
    titleInput.value = notes[index].title;
    contentInput.value = notes[index].content;
    editIndex = index;

    saveBtn.classList.add("hidden");
    updateBtn.classList.remove("hidden");
    deleteBtn.classList.remove("hidden");
}

/* Update note */
updateBtn.addEventListener("click", () => {
    if (editIndex === null) return;

    notes[editIndex] = {
        title: titleInput.value.trim(),
        content: contentInput.value.trim()
    };

    clearForm();
    saveNotes();
    renderNotes(searchInput.value.toLowerCase());
});

/* Delete note (NOW WORKS) */
function deleteNote(index) {
    if (!confirm("Delete this entry?")) return;

    notes.splice(index, 1);

    clearForm();
    saveNotes();
    renderNotes(searchInput.value.toLowerCase());
}

/* New entry */
newBtn.addEventListener("click", clearForm);

/* Clear form */
function clearForm() {
    titleInput.value = "";
    contentInput.value = "";
    editIndex = null;

    saveBtn.classList.remove("hidden");
    updateBtn.classList.add("hidden");
    deleteBtn.classList.add("hidden");
}

/* Search */
searchInput.addEventListener("input", e => {
    renderNotes(e.target.value.toLowerCase());
});

/* Initial load */
renderNotes();
