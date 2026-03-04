const container = document.getElementById("pebbles");
const input = document.getElementById("gratitudeInput");

let pebbles = JSON.parse(localStorage.getItem("pebbles")) || [];

function renderPebbles() {
  container.innerHTML = "";
  pebbles.forEach((text, index) => {
    const pebble = document.createElement("div");
    pebble.className = "pebble";
    pebble.innerText = text;

    pebble.addEventListener("click", () => {
      pebbles.splice(index, 1);
      savePebbles();
      renderPebbles();
    });

    container.appendChild(pebble);
  });
}

function addPebble() {
  const value = input.value.trim();
  if (!value) return;

  pebbles.push(value);
  input.value = "";
  savePebbles();
  renderPebbles();
}

function savePebbles() {
  localStorage.setItem("pebbles", JSON.stringify(pebbles));
}

renderPebbles();