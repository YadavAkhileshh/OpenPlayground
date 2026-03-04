const exportWrapper = document.getElementById("export-wrapper");

function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

function exportJSON() {
  const blob = new Blob(
    [localStorage.getItem("mindmap")],
    { type: "application/json" }
  );
  download(blob, "mindmap.json");
}

function importJSON() {
  document.getElementById("importFile").click();
}

document.getElementById("importFile").onchange = (e) => {

  const reader = new FileReader();

  reader.onload = () => {
    localStorage.setItem("mindmap", reader.result);
    location.reload();
  };

  reader.readAsText(e.target.files[0]);
};

function exportPNG() {
  html2canvas(exportWrapper).then(canvasImg => {
    canvasImg.toBlob(blob => download(blob, "mindmap.png"));
  });
}
