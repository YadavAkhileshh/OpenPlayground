const speakBtn = document.getElementById("speakBtn");

speakBtn.addEventListener("click", () => {
  const caption = document.getElementById("captionText").innerText;

  if (caption.includes("upload")) {
    alert("⚠ Generate a caption first!");
    return;
  }

  let speech = new SpeechSynthesisUtterance(caption);
  speech.lang = "en-US";
  speech.rate = 1;

  window.speechSynthesis.speak(speech);
});
