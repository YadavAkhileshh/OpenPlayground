function spin() {
  const input = document.getElementById("optionsInput").value;
  const resultEl = document.getElementById("result");

  if (!input.trim()) {
    alert("Please enter some options!");
    return;
  }

  const options = input
    .split(",")
    .map(opt => opt.trim())
    .filter(opt => opt !== "");

  if (options.length < 2) {
    alert("Enter at least two options!");
    return;
  }

  const randomChoice =
    options[Math.floor(Math.random() * options.length)];

  resultEl.textContent = `🎉 Result: ${randomChoice}`;
}