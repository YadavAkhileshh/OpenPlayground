const input = document.getElementById("wordInput");
const button = document.getElementById("searchBtn");
const result = document.getElementById("result");

button.addEventListener("click", searchWord);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchWord();
});

async function searchWord() {
  const word = input.value.trim();
  result.innerHTML = "";

  if (!word) {
    showError("Please enter a word.");
    return;
  }

  result.innerHTML = `<div class="loading">Searching meaning...</div>`;


  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    if (!res.ok) {
      throw new Error("Word not found");
    }

    const data = await res.json();
    displayResult(data[0]);
  } 
  catch (err) {
  if (err.message === "Word not found") {
    showError("Word not found. Please check spelling.");
  } else {
    showError("Network error. Try again later.");
  }
}

}

function displayResult(data) {
  const meaning = data.meanings[0];
  const definition = meaning.definitions[0];

  const audioUrl = data.phonetics.find(p => p.audio)?.audio;

  result.innerHTML = `
    <div class="word">
      ${data.word}
      ${audioUrl ? `<button class="audio-btn" onclick="playAudio('${audioUrl}')">🔊</button>` : ""}
    </div>
    <div class="part-of-speech">${meaning.partOfSpeech}</div>
    <div class="definition">${definition.definition}</div>
    ${
      definition.example
        ? `<div class="definition"><strong>Example:</strong> ${definition.example}</div>`
        : ""
    }
  `;
}

function playAudio(url) {
  new Audio(url).play();
}

function showError(message) {
  result.innerHTML = `<div class="error">${message}</div>`;
}
