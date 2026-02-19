function copyToClipboard() {

  const text = document.getElementById("outputBox").innerText;

  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to Clipboard");
  });
}

function downloadTXT() {

  const text = document.getElementById("outputBox").innerText;

  const blob = new Blob([text], { type: "text/plain" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "IndigoWrite_Content.txt";
  link.click();
}
