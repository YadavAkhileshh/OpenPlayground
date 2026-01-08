const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const saveBtn = document.getElementById("saveBtn");
const notesList = document.getElementById("notesList");
const searchInput = document.getElementById("search");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let editIndex = null;

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

function renderNotes(filter = "") {
    notesList.innerHTML = "";

    notes
        .filter(
            note =>
                note.title.toLowerCase().includes(filter) ||
                note.content.toLowerCase().includes(filter)
        )
        .forEach((note, index) => {
            const div = document.createElement("div");
            div.className = "note";

            div.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <div class="note-actions">
                    <button onclick="editNote(${index})">Edit</button>
                    <button class="delete" onclick="deleteNote(${index})">Delete</button>
                </div>
            `;

            notesList.appendChild(div);
        });
}

saveBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) return;

    if (editIndex !== null) {
        notes[editIndex] = { title, content };
        editIndex = null;
        saveBtn.textContent = "Save Note";
    } else {
        notes.push({ title, content });
    }

    titleInput.value = "";
    contentInput.value = "";

    saveNotes();
    renderNotes();
});

function editNote(index) {
    titleInput.value = notes[index].title;
    contentInput.value = notes[index].content;
    editIndex = index;
    saveBtn.textContent = "Update Note";
}

function deleteNote(index) {
    if (!confirm("Delete this note?")) return;
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
}

searchInput.addEventListener("input", e => {
    renderNotes(e.target.value.toLowerCase());
});

renderNotes();
