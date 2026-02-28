let notes = JSON.parse(localStorage.getItem("notes")) || [];

function saveNote() {
  notes.push({
    title: title.value,
    content: content.value,
    time: new Date().toLocaleString()
  });
  localStorage.setItem("notes", JSON.stringify(notes));
  title.value = content.value = "";
  renderNotes();
}

function renderNotes() {
  const q = search.value.toLowerCase();
  notesBox.innerHTML = "";
  notes.filter(n => n.title.toLowerCase().includes(q)).forEach(n => {
    notesBox.innerHTML += `<div class="note">
      <h3>${n.title}</h3><p>${n.content}</p><small>${n.time}</small>
    </div>`;
  });
}

const notesBox = document.getElementById("notes");
renderNotes();
