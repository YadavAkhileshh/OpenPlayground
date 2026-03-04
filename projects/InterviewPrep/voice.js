// Voice Recognition Setup
let recognition;

// Start Voice Input
function startVoice() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice recognition is not supported in this browser.");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;

  recognition.onresult = function (event) {
    let transcript =
      event.results[event.results.length - 1][0].transcript;

    document.getElementById("answerBox").value += transcript + " ";
  };

  recognition.start();
}

// Stop Voice Input
function stopVoice() {
  if (recognition) recognition.stop();
}
