const convertPdfBtn = document.getElementById("convert-pdf-btn");
const convertWordBtn = document.getElementById("convert-word-btn");

convertPdfBtn.addEventListener("click", convertPdfToWord);
convertWordBtn.addEventListener("click", convertWordToPdf);

function convertPdfToWord() {
  const pdfFile = document.getElementById("pdf-file").files[0];
  // code to convert PDF to Word
}

function convertWordToPdf() {
  const wordFile = document.getElementById("word-file").files[0];
  // code to convert Word to PDF
}
