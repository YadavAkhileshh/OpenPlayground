const readBtn = document.getElementById("readBtn");
const statusEl = document.getElementById("status");
const textEl = document.getElementById("clipboardText");

readBtn.addEventListener("click", async () => {
  if (!navigator.clipboard) {
    statusEl.textContent = "Clipboard API not supported";
    return;
  }

  try {
    const text = await navigator.clipboard.readText();
    textEl.textContent = text || "(Clipboard is empty)";
    statusEl.textContent = "Clipboard read successfully";
  } catch (err) {
    statusEl.textContent = "Permission denied or error occurred";
  }
});
