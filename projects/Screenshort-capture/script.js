const container = document.getElementById("container");
const captureButton = document.getElementById("capture-button");
const previewContainer = document.getElementById("preview-container");
const downloadButton = document.getElementById("download-button");

captureButton.addEventListener("click", async () => {
  downloadButton.classList.remove("hide");
  const canvas = await html2canvas(container);
  const imageURL = canvas.toDataURL();
  previewContainer.innerHTML = `<img src="${imageURL}" id="image">`;
  downloadButton.href = imageURL;
  downloadButton.download = "image.png";
});

window.onload = () => {
  downloadButton.classList.add("hide");
  previewContainer.innerHTML = "";
};
