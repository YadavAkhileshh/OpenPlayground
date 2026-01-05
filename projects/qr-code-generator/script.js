const qrBox = document.getElementById("qrBox");
const downloadBtn = document.querySelector(".download");
const themeToggle = document.getElementById("themeToggle");

let qrImage = null;

// Generate QR
function generateQR() {
  const text = document.getElementById("qrText").value.trim();
  const size = document.getElementById("qrSize").value;

  if (text === "") {
    alert("Please enter text or URL");
    return;
  }

  qrBox.innerHTML = "";
  downloadBtn.style.display = "none";

  qrImage = document.createElement("img");
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  qrImage.alt = "QR Code";

  qrBox.appendChild(qrImage);
  downloadBtn.style.display = "block";
}

// Download QR
function downloadQR() {
  if (!qrImage) return;

  const link = document.createElement("a");
  link.href = qrImage.src;
  link.download = "qr-code.png";
  link.click();
}

// Dark Mode Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});
