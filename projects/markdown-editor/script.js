const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

// Update preview in real time
editor.addEventListener("input", () => {
  preview.innerHTML = marked.parse(editor.value);
});
