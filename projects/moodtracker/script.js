const historyEl = document.getElementById("history");

function saveMood(mood) {
  const today = new Date().toDateString();
  const moods = JSON.parse(localStorage.getItem("moods")) || [];

  moods.unshift({ date: today, mood }); // newest first
  localStorage.setItem("moods", JSON.stringify(moods));

  render();
}

function render() {
  const moods = JSON.parse(localStorage.getItem("moods")) || [];
  historyEl.innerHTML = "";

  moods.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.date} — ${entry.mood}`;
    historyEl.appendChild(li);
  });
}

render();
