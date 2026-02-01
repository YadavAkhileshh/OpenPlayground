const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const input = document.getElementById("qrInput");
const qrBox = document.getElementById("qrBox");

let currentCanvas = null;

generateBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  qrBox.innerHTML = ""; // Clear previous

  QRCode.toCanvas(text, { width: 200 }, (err, canvas) => {
    if (err) return console.error(err);

    qrBox.appendChild(canvas);
    currentCanvas = canvas;
    downloadBtn.style.display = "block";
  });
};

downloadBtn.onclick = () => {
  if (!currentCanvas) return;

  const link = document.createElement("a");
  link.download = "qrcode.png";
  link.href = currentCanvas.toDataURL();
  link.click();
};
