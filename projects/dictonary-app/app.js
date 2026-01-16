const searchBtn = document.getElementById('searchBtn');
const resultDiv = document.getElementById('result');

searchBtn.addEventListener('click', () => {
    const word = document.getElementById('wordInput').value.trim();

    if (!word) {
        return;
    }

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(res => res.json())
    .then(data => {
        if (data.title) {
            resultDiv.innerHTML = '<p>Word not found try again</p>';
            return;
        }

        const wordData = data[0];
        const meaning = wordData.meanings[0].definitions[0].definition;
        const example = wordData.meanings[0].definitions[0].example || 'No example available';
        const audio = wordData.phonetics[0]?.audio;

        resultDiv.innerHTML = `
            <h2>${wordData.word}</h2>
            <p><strong>Meaning: </strong>${meaning}</p>
            <p><strong>Example: </strong>${example}</p>
            ${audio ? `<button onclick="playAudio('${audio}')">Play Pronunciation</button>` : ""}
        `;


    }).catch(err => {
        resultDiv.innerHTML = '<p>Something went wrong, Please try again!</p>';
    })
})

function playAudio(audioUrl){
    new Audio(audioUrl).play();
}
