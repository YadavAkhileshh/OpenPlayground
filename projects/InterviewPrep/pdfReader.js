// Resume PDF Analyzer using PDF.js
async function analyzeResume() {
  const fileInput = document.getElementById("resumeUpload");

  if (fileInput.files.length === 0) {
    alert("Please upload your resume in PDF format.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);

    // Load PDF
    const pdf = await pdfjsLib.getDocument(typedarray).promise;

    let extractedText = "";

    // Extract All Pages Text
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      content.items.forEach(item => {
        extractedText += item.str + " ";
      });
    }

    resumeText = extractedText.toLowerCase();

    alert("✅ Resume successfully analyzed!");

    // Generate Questions
    generateQuestions();

    // Reset Index
    currentIndex = 0;
    answers = [];

    // Start Timer
    startTimer();

    // Show First Question
    document.getElementById("questionText").innerText = questions[0];
  };

  reader.readAsArrayBuffer(file);
}
