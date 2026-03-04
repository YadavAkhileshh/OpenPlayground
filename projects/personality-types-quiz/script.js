function startQuiz() {
let name = document.getElementById("username").value;

if(name.trim() === ""){
alert("Please enter your name!");
return;
}

alert("Hey " + name + " 👋 Let's find your personality type!");

document.getElementById("quizContainer").classList.remove("hidden");
}

function calculateResult(){

let introvertScore = 0;
let extrovertScore = 0;

let answers = document.querySelectorAll("input[type='radio']:checked");

answers.forEach(answer=>{
if(answer.value === "introvert") introvertScore++;
if(answer.value === "extrovert") extrovertScore++;
});

let resultTitle = document.getElementById("resultTitle");
let resultText = document.getElementById("resultText");

if(introvertScore > extrovertScore){
resultTitle.innerText = "You are an Introvert 🌿";
resultText.innerText = "You recharge alone and enjoy calm environments. Your quiet strength is powerful!";
}
else if(extrovertScore > introvertScore){
resultTitle.innerText = "You are an Extrovert 🌟";
resultText.innerText = "You gain energy from people and social settings. Your enthusiasm inspires others!";
}
else{
resultTitle.innerText = "You are an Ambivert ⚖️";
resultText.innerText = "You balance social and alone time beautifully. You adapt easily!";
}

document.getElementById("resultModal").classList.remove("hidden");
}

function closeModal(){
  const modal = document.getElementById("resultModal");
  modal.classList.add("hidden");
}