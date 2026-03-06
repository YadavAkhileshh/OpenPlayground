const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");

searchInput.addEventListener("keyup", function() {
let value = this.value.toLowerCase();

cards.forEach(card => {
let name = card.getAttribute("data-name");

if (name.includes(value)) {
card.style.display = "block";
} else {
card.style.display = "none";
}
});
});