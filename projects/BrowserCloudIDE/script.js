const runBtn = document.getElementById("runBtn");
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

/* Run code */
function runCode(){
  const code = editor.value;
  const doc = preview.contentDocument || preview.contentWindow.document;

  doc.open();
  doc.write(code);
  doc.close();
}

runBtn.addEventListener("click",runCode);

/* initial run */
runCode();