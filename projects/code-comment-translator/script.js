const translateBtn = document.getElementById("translateBtn");
const commentSelect = document.getElementById("commentSelect");
const output = document.getElementById("output");

const translations = {
  temp: "This was supposed to be temporary, but it has emotionally settled here.",
  dontTouch: "Nobody understands this code. Including the person who wrote it.",
  hack: "This solution ignores best practices but somehow works.",
  legacy: "Old code written years ago. No one dares to delete it.",
  works: "The bug still exists, just not on my computer."
};

translateBtn.addEventListener("click", () => {
  const value = commentSelect.value;

  if (!value) {
    showOutput("Please select a comment first.");
    return;
  }

  showOutput(translations[value]);
});

function showOutput(text) {
  output.textContent = text;
  output.classList.remove("hidden");
}