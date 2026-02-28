const emojiList = document.getElementById("emoji-list");
const searchInput = document.getElementById("search");

let selectedCategory = "all";

function displayEmojis() {

  const query = searchInput.value.toLowerCase();
  emojiList.innerHTML = "";

  const filtered = emojis.filter(e => {

    const matchSearch = e.name.includes(query);

    const matchCategory =
      selectedCategory === "all" ||
      e.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  filtered.forEach(e => {

    const span = document.createElement("span");
    span.textContent = e.emoji;
    span.classList.add("emoji-item");
    span.title = e.name;

    span.addEventListener("click", () => copyEmoji(e.emoji));

    emojiList.appendChild(span);
  });
}
