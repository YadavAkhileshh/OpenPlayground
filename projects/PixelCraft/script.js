let grid = document.getElementById("grid");
let colorPicker = document.getElementById("colorPicker");
let gridSizeSlider = document.getElementById("gridSize");

function createGrid(size) {
  if (!grid) return;

  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  for (let i = 0; i < size * size; i++) {
    let pixel = document.createElement("div");
    pixel.classList.add("pixel");

    pixel.addEventListener("click", () => {
      pixel.style.background = colorPicker.value;
    });

    grid.appendChild(pixel);
  }
}

function clearGrid() {
  document.querySelectorAll(".pixel").forEach((pixel) => {
    pixel.style.background = "rgba(255,255,255,0.12)";
  });
}

function saveArtwork() {
  let pixels = document.querySelectorAll(".pixel");
  let artwork = [];

  pixels.forEach((pixel) => {
    artwork.push(pixel.style.background || "rgba(255,255,255,0.12)");
  });

  let gallery = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  gallery.push(artwork);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));

  alert("🎉 Artwork Saved Successfully!");
}

function loadGallery() {
  let galleryGrid = document.getElementById("galleryGrid");
  if (!galleryGrid) return;

  let gallery = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (gallery.length === 0) {
    galleryGrid.innerHTML = "<p>No artworks saved yet 🎨</p>";
    return;
  }

  gallery.forEach((art) => {
    let box = document.createElement("div");
    box.classList.add("art-box");

    let miniGrid = document.createElement("div");
    miniGrid.style.display = "grid";
    miniGrid.style.gridTemplateColumns = "repeat(8, 1fr)";
    miniGrid.style.gap = "1px";

    art.slice(0, 64).forEach((color) => {
      let cell = document.createElement("div");
      cell.style.aspectRatio = "1";
      cell.style.background = color;
      miniGrid.appendChild(cell);
    });

    box.appendChild(miniGrid);
    galleryGrid.appendChild(box);
  });
}

if (gridSizeSlider) {
  gridSizeSlider.addEventListener("input", () => {
    createGrid(gridSizeSlider.value);
  });
}

/* Load Default */
createGrid(16);
loadGallery();
