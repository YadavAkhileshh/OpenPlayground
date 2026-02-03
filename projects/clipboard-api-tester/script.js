const textInput = document.getElementById("textInput");
const copyBtn = document.getElementById("copyBtn");
const pasteBtn = document.getElementById("pasteBtn");
const statusMsg = document.getElementById("statusMsg");

copyBtn.addEventListener("click", async () => {
  const text = textInput.value;

  if (!text) {
    statusMsg.textContent = "Nothing to copy!";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    statusMsg.textContent = "Text copied to clipboard ✔️";
  } catch (err) {
    statusMsg.textContent = "Copy failed ❌";
  }
});

pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    textInput.value = text;
    statusMsg.textContent = "Text pasted from clipboard ✔️";
  } catch (err) {
    statusMsg.textContent = "Paste failed ❌";
  }
});