const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const dropText = document.getElementById("dropText");

const captionText = document.getElementById("captionText");
const generateBtn = document.getElementById("generateBtn");

let uploadedImage = null;

// Click Upload
dropArea.addEventListener("click", () => fileInput.click());

// File Input Change
fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

// Drag Events
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("active");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("active");
  handleFile(e.dataTransfer.files[0]);
});

// Handle File Upload
function handleFile(file) {
  if (!file) return;

  uploadedImage = file;
  previewImg.src = URL.createObjectURL(file);
  previewImg.style.display = "block";
  dropText.style.display = "none";

  captionText.innerText = "Image uploaded successfully! Click Generate Caption ✨";
}

// Caption Generator (Dummy AI captions)
generateBtn.addEventListener("click", () => {
  if (!uploadedImage) {
    captionText.innerText = "⚠ Please upload an image first!";
    return;
  }

  const captions = [
    "A beautiful moment captured in nature 🌿",
    "An inspiring view full of life and colors 🌈",
    "A stunning scene with deep emotions ✨",
    "An image worth a thousand words 📸",
    "A peaceful snapshot of the world 🌍"
  ];

  const randomCaption = captions[Math.floor(Math.random() * captions.length)];
  captionText.innerText = randomCaption;
});
