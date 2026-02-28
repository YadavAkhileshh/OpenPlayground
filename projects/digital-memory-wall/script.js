const memoryInput = document.getElementById("memoryInput");
const memoryList = document.getElementById("memoryList");

let memories = JSON.parse(localStorage.getItem("memories")) || [];

function renderMemories() {
  memoryList.innerHTML = "";

  memories.forEach(memory => {
    const div = document.createElement("div");
    div.className = "memory-item";
    div.textContent = memory;
    memoryList.appendChild(div);
  });
}

function addMemory() {
  const text = memoryInput.value.trim();

  if (!text) {
    alert("Please write a memory!");
    return;
  }

  memories.push(text);
  localStorage.setItem("memories", JSON.stringify(memories));

  memoryInput.value = "";
  renderMemories();
}

renderMemories();