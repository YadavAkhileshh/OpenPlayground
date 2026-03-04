const dictionary = {
  hello:{
    hindi:"नमस्ते",
    spanish:"hola",
    french:"bonjour"
  },
  thankyou:{
    hindi:"धन्यवाद",
    spanish:"gracias",
    french:"merci"
  },
  water:{
    hindi:"पानी",
    spanish:"agua",
    french:"eau"
  }
};

/* Translator */
document.getElementById("translateBtn")
  .addEventListener("click",()=>{

  const word =
    document.getElementById("wordInput")
      .value.toLowerCase().replace(/\s/g,"");

  const lang =
    document.getElementById("languageSelect").value;

  const result =
    dictionary[word]?.[lang] || "Not found";

  document.getElementById("translationResult")
    .textContent = "Translation: " + result;
});

/* Quiz */
const words = Object.keys(dictionary);
let currentWord=null;

function nextQuiz(){
  currentWord =
    words[Math.floor(Math.random()*words.length)];

  document.getElementById("quizQuestion")
    .textContent =
      `Translate "${currentWord}" to Hindi`;
  document.getElementById("quizResult")
    .textContent="";
  document.getElementById("quizAnswer").value="";
}

document.getElementById("nextBtn")
  .addEventListener("click",nextQuiz);

document.getElementById("checkBtn")
  .addEventListener("click",()=>{

  if(!currentWord) return;

  const ans =
    document.getElementById("quizAnswer")
      .value.trim();

  const correct = dictionary[currentWord].hindi;

  document.getElementById("quizResult")
    .textContent =
      ans===correct ? "✔ Correct!" : "❌ Wrong";
});

nextQuiz();