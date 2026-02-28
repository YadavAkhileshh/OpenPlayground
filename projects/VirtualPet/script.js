const tom = document.getElementById("tom");
const textBox = document.getElementById("text");

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";

function startListening() {
    textBox.innerText = "Listening...";
    recognition.start();
}

recognition.onresult = function(event) {
    const speechText = event.results[0][0].transcript;
    textBox.innerText = "You said: " + speechText;
    talk(speechText);
};

recognition.onerror = () => {
    textBox.innerText = "Microphone access denied!";
};

function talk(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.pitch = 1.3;
    utterance.rate = 0.9;

    tom.classList.add("talking");

    utterance.onend = () => {
        tom.classList.remove("talking");
    };

    speechSynthesis.speak(utterance);
}

// Click reaction
tom.addEventListener("click", () => {
    talk("Hey! That tickles!");
});
