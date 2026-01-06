const filters = {
  brightness: {
    value: 100,
    min: 0,
    max: 200,
    unit: "%",
  },
  contrast: {
    value: 100,
    min: 0,
    max: 200,
    unit: "%",
  },
  saturate: {
    value: 100,
    min: 0,
    max: 200,
    unit: "%",
  },
  "hue-rotate": {
    value: 0,
    min: 0,
    max: 360,
    unit: "deg",
  },
  blur: {
    value: 0,
    min: 0,
    max: 20,
    unit: "px",
  },
  grayscale: {
    value: 0,
    min: 0,
    max: 100,
    unit: "%",
  },
  sepia: {
    value: 0,
    min: 0,
    max: 100,
    unit: "%",
  },
  opacity: {
    value: 100,
    min: 0,
    max: 100,
    unit: "%",
  },
  invert: {
    value: 0,
    min: 0,
    max: 100,
    unit: "%",
  },
};

const imageCanvas = document.querySelector("#image-canvas");
const imgInput = document.querySelector("#image-input");
const canvasCtx = imageCanvas.getContext("2d");
const placeholder = document.querySelector(".placeholder");

const filtersContainer = document.querySelector(".filters");
const resetBtn = document.querySelector("#reset-btn");
const downloadBtn = document.querySelector("#download-btn");

let originalImage = null;

function createFilterElement(name, unit = "%", value, min, max) {
  const div = document.createElement("div");
  div.classList.add("filter");

  const input = document.createElement("input");
  input.type = "range";
  input.min = min;
  input.max = max;
  input.value = value;
  input.id = name;

  const p = document.createElement("p");
  p.innerText = name;

  div.appendChild(p);
  div.appendChild(input);

  return div;
}

function applyFilters() {
  if (!originalImage) return;

  let filterString = "";
  for (const key in filters) {
    if (filters.hasOwnProperty(key)) {
      const filter = filters[key];
      filterString += `${key}(${filter.value}${filter.unit}) `;
    }
  }

  canvasCtx.filter = filterString.trim();
  canvasCtx.drawImage(originalImage, 0, 0);
}

Object.keys(filters).forEach((key) => {
  const filtersElement = createFilterElement(
    key,
    filters[key].unit,
    filters[key].value,
    filters[key].min,
    filters[key].max
  );

  filtersContainer.appendChild(filtersElement);

  const input = filtersElement.querySelector("input");
  input.addEventListener("input", (event) => {
    filters[key].value = event.target.value;
    applyFilters();
  });
});

imgInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    originalImage = img;
    imageCanvas.width = img.width;
    imageCanvas.height = img.height;
    imageCanvas.style.display = "block";
    placeholder.style.display = "none";
    applyFilters();
  };
});

resetBtn.addEventListener("click", () => {
  for (const key in filters) {
    if (filters.hasOwnProperty(key)) {
      const filter = filters[key];
      if (key === "brightness" || key === "contrast" || key === "saturate" || key === "opacity") {
        filter.value = 100;
      } else {
        filter.value = 0;
      }
    }
  }

  const inputs = filtersContainer.querySelectorAll("input");
  inputs.forEach((input) => {
    const key = input.id;
    if (key === "brightness" || key === "contrast" || key === "saturate" || key === "opacity") {
      input.value = 100;
    } else {
      input.value = 0;
    }
  });

  applyFilters();
});

downloadBtn.addEventListener("click", () => {
  if (!originalImage) return;

  const link = document.createElement("a");
  link.download = "image.png";
  link.href = imageCanvas.toDataURL();
  link.click();
});