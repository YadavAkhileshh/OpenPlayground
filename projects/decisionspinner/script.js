let options = [];

function addOption() {
  const input = document.getElementById("optionInput");
  if (input.value === "") return;

  options.push(input.value);
  input.value = "";
  render();
}

function render() {
  const list = document.getElementById("optionsList");
  list.innerHTML = "";

  options.forEach(opt => {
    const li = document.createElement("li");
    li.textContent = opt;
    list.appendChild(li);
  });
}

function spin() {
  if (options.length === 0) return;
  const choice = options[Math.floor(Math.random() * options.length)];
  document.getElementById("result").textContent = `🎉 Choose: ${choice}`;
}
