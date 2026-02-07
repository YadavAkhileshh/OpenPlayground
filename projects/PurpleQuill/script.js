const promptInput = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");

/* Load last saved prompt */
promptInput.value = loadPrompt();

/* Typing Animation */
function typeEffect(text) {

  outputBox.innerText = "";
  let i = 0;

  let interval = setInterval(() => {
    outputBox.innerText += text.charAt(i);
    i++;

    if (i >= text.length) clearInterval(interval);
  }, 20);
}

/* Generate Content */
function generateContent() {

  const prompt = promptInput.value;

  savePrompt(prompt);

  const result = aiGenerate(prompt, selectedTone, selectedPlatform);

  typeEffect(result);
}
