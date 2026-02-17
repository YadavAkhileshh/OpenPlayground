const fileInput = document.getElementById("file-input");
const fileListUI = document.getElementById("file-list");

fileInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);

  files.forEach(file => {
    uploadedFiles.push(file);
  });

  renderFileList();
});

function renderFileList() {
  fileListUI.innerHTML = "";
  uploadedFiles.forEach((file, index) => {
    const li = document.createElement("li");
    li.textContent = file.name;

    li.onclick = () => {
      document.querySelectorAll("#file-list li").forEach(item =>
        item.classList.remove("active")
      );
      li.classList.add("active");
      previewFile(index);
    };

    fileListUI.appendChild(li);
  });
}
