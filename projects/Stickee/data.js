let pages = JSON.parse(localStorage.getItem("pages")) || [
  { id: 1, color: "#fff9c4", text: "" }
];

let boardNotes = JSON.parse(localStorage.getItem("board")) || [];

function saveAll() {
  localStorage.setItem("pages", JSON.stringify(pages));
  localStorage.setItem("board", JSON.stringify(boardNotes));
}