const components = document.querySelectorAll(".component");
const canvas = document.getElementById("canvas");

let draggedType = null;

// Drag start
components.forEach(comp => {
  comp.addEventListener("dragstart", () => {
    draggedType = comp.dataset.type;
  });
});

// Allow drop
canvas.addEventListener("dragover", e => {
  e.preventDefault();
});

// Drop element
canvas.addEventListener("drop", e => {
  e.preventDefault();

  const placeholder = canvas.querySelector(".placeholder");
  if (placeholder) placeholder.remove();

  const el = createElement(draggedType);
  canvas.appendChild(el);
});

// Create components
function createElement(type) {
  const wrapper = document.createElement("div");
  wrapper.className = "element";

  let el;

  switch (type) {
    case "heading":
      el = document.createElement("h2");
      el.textContent = "Editable Heading";
      break;

    case "paragraph":
      el = document.createElement("p");
      el.textContent = "Editable paragraph text...";
      break;

    case "button":
      el = document.createElement("button");
      el.textContent = "Click Me";
      el.style.padding = "8px 12px";
      break;

    case "image":
      el = document.createElement("img");
      el.src = "https://via.placeholder.com/300x150";
      el.style.maxWidth = "100%";
      break;
  }

  wrapper.appendChild(el);

  // Click to edit
  wrapper.addEventListener("click", () => {
    document.querySelectorAll(".element")
      .forEach(e => e.classList.remove("selected"));

    wrapper.classList.add("selected");

    if (el.tagName !== "IMG") {
      const text = prompt("Edit content:", el.textContent);
      if (text !== null) el.textContent = text;
    }
  });

  // Double click delete
  wrapper.addEventListener("dblclick", () => {
    wrapper.remove();
    if (!canvas.children.length) {
      canvas.innerHTML =
        '<p class="placeholder">Drag components here to build your page</p>';
    }
  });

  return wrapper;
}