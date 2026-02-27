function saveMemory() {
  let imageInput = document.getElementById("memoryImage");
  let textInput = document.getElementById("memoryText");

  if (!imageInput.files[0] || textInput.value.trim() === "") {
    alert("Please upload an image and write a caption!");
    return;
  }

  let reader = new FileReader();

  reader.onload = function () {
    let memory = {
      img: reader.result,
      text: textInput.value
    };

    let memories = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    memories.push(memory);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));

    alert("Memory Saved Successfully 🎉");
    textInput.value = "";
    imageInput.value = "";
  };

  reader.readAsDataURL(imageInput.files[0]);
}

function loadGallery() {
  let gallery = document.getElementById("memoryGallery");
  if (!gallery) return;

  let memories = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (memories.length === 0) {
    gallery.innerHTML = "<p>No memories saved yet 💛</p>";
    return;
  }

  memories.forEach((memory) => {
    let card = document.createElement("div");
    card.classList.add("memory-card");

    card.innerHTML = `
      <img src="${memory.img}" alt="Memory">
      <h3>${memory.text}</h3>
    `;

    gallery.appendChild(card);
  });
}

loadGallery();
