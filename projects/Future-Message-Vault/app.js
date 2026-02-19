const titleInput = document.getElementById("titleInput");
const msgInput = document.getElementById("msgInput");
const timeInput = document.getElementById("timeInput");
const saveBtn = document.getElementById("saveBtn");
const vault = document.getElementById("vault");

let notes = JSON.parse(localStorage.getItem("vaultNotes")) || [];

saveBtn.addEventListener("click", () => {
  const note = {
    id: Date.now(),
    title: titleInput.value,
    message: msgInput.value,
    unlockTime: timeInput.value
  };

  notes.push(note);
  localStorage.setItem("vaultNotes", JSON.stringify(notes));

  titleInput.value = "";
  msgInput.value = "";
  timeInput.value = "";

  renderNotes();
});

function renderNotes() {
  vault.innerHTML = "";

  notes.forEach(note => {
    const div = document.createElement("div");
    div.classList.add("note");

    const now = new Date();
    const unlockDate = new Date(note.unlockTime);

    if (now >= unlockDate) {
      div.innerHTML = `
        <h3>${note.title}</h3>
        <p class="unlocked">🔓 ${note.message}</p>
      `;
    } else {
      div.innerHTML = `
        <h3>${note.title}</h3>
        <p class="locked">🔒 Locked until ${unlockDate.toLocaleString()}</p>
      `;
    }

    vault.appendChild(div);
  });
}

renderNotes();
setInterval(renderNotes, 60000);