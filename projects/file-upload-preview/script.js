const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("previewContainer");
const error = document.getElementById("error");

const MAX_SIZE_MB = 2;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
];

fileInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  error.textContent = "";

  const files = [...fileInput.files];

  files.forEach((file, index) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      error.textContent = "Unsupported file type selected.";
      return;
    }

    if (file.size > MAX_SIZE) {
      error.textContent = `File size must be under ${MAX_SIZE_MB}MB.`;
      return;
    }

    createPreview(file);
  });
});

function createPreview(file) {
  const div = document.createElement("div");
  div.className = "preview-item";

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "×";
  removeBtn.onclick = () => div.remove();

  div.appendChild(removeBtn);

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;
      div.appendChild(img);
      addFileInfo(div, file);
    };
    reader.readAsDataURL(file);
  } else {
    const icon = document.createElement("div");
    icon.className = "file-icon";
    icon.textContent = "📄";
    div.appendChild(icon);
    addFileInfo(div, file);
  }

  previewContainer.appendChild(div);
}

function addFileInfo(container, file) {
  const name = document.createElement("p");
  name.className = "file-name";
  name.textContent = file.name;

  const size = document.createElement("p");
  size.className = "file-size";
  size.textContent = formatFileSize(file.size);

  container.appendChild(name);
  container.appendChild(size);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
