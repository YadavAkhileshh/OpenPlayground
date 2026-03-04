const previewBox = document.getElementById("preview-box");
const downloadBtn = document.getElementById("download-btn");
const deleteBtn = document.getElementById("delete-btn");

let currentFileIndex = null;

function previewFile(index) {
  currentFileIndex = index;
  const file = uploadedFiles[index];

  previewBox.innerHTML = "";

  const fileType = file.type;

  if(fileType.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    previewBox.appendChild(img);
  } else if(fileType.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.style.maxWidth = "100%";
    video.style.maxHeight = "100%";
    previewBox.appendChild(video);
  } else if(fileType.startsWith("audio/")) {
    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(file);
    audio.controls = true;
    previewBox.appendChild(audio);
  } else {
    previewBox.textContent = `Cannot preview ${file.name}`;
  }

  downloadBtn.href = URL.createObjectURL(file);
  downloadBtn.download = file.name;
  downloadBtn.disabled = false;

  deleteBtn.disabled = false;
}

deleteBtn.addEventListener("click", () => {
  if(currentFileIndex !== null){
    uploadedFiles.splice(currentFileIndex, 1);
    currentFileIndex = null;
    renderFileList();
    previewBox.innerHTML = "<p>Select a file to preview</p>";
    downloadBtn.disabled = true;
    deleteBtn.disabled = true;
  }
});
