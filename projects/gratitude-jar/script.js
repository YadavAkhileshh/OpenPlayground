const jar = [];

function addGratitude() {
  const input = document.getElementById("gratitudeInput");
  const text = input.value.trim();

  if (!text) return;

  jar.push(text);
  input.value = "";
  document.getElementById("result").innerText = "✨ Added to the jar!";
}

function openJar() {
  if (jar.length === 0) {
    result.innerText = "The jar is empty 💔";
    return;
  }

  const random = jar[Math.floor(Math.random() * jar.length)];
  result.innerText = "💖 " + random;
}