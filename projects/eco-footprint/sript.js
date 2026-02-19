const form = document.getElementById("ecoForm");
const scoreDisplay = document.getElementById("score");
const suggestionList = document.getElementById("suggestionList");
const progressFill = document.getElementById("progressFill");
const historyList = document.getElementById("historyList");
const themeToggle = document.getElementById("themeToggle");

form.addEventListener("submit", function(e){
    e.preventDefault();

    let electricity = parseInt(document.getElementById("electricity").value);
    let carTravel = parseInt(document.getElementById("carTravel").value);
    let flights = parseInt(document.getElementById("flights").value);
    let meat = parseInt(document.getElementById("meat").value);
    let plastic = parseInt(document.getElementById("plastic").value);

    let score = calculateScore(electricity, carTravel, flights, meat, plastic);
    scoreDisplay.innerText = score;

    generateSuggestions(electricity, carTravel, flights, meat, plastic);

    updateProgress(score);
    saveHistory(score);
});

function calculateScore(e, c, f, m, p){
    return (e*0.4 + c*0.3 + f*10 + m*5 + p*3).toFixed(2);
}

function generateSuggestions(e, c, f, m, p){
    suggestionList.innerHTML = "";

    if(e > 200) addSuggestion("Switch to LED lights.");
    if(c > 100) addSuggestion("Use public transport.");
    if(f > 2) addSuggestion("Limit air travel.");
    if(m > 5) addSuggestion("Reduce meat consumption.");
    if(p > 2) addSuggestion("Avoid single-use plastic.");

    if(suggestionList.innerHTML === "")
        addSuggestion("Great job! Keep maintaining your eco lifestyle.");
}

function addSuggestion(text){
    let li = document.createElement("li");
    li.innerText = text;
    suggestionList.appendChild(li);
}

function updateProgress(score){
    let goal = 500;
    let percent = Math.min((score/goal)*100, 100);
    progressFill.style.width = percent + "%";
}

function saveHistory(score){
    let history = JSON.parse(localStorage.getItem("ecoHistory")) || [];
    history.push(score);
    localStorage.setItem("ecoHistory", JSON.stringify(history));
    renderHistory(history);
}

function renderHistory(history){
    historyList.innerHTML = "";
    history.forEach((item)=>{
        let li = document.createElement("li");
        li.innerText = "Score: " + item;
        historyList.appendChild(li);
    });
}

themeToggle.addEventListener("click", function(){
    document.body.classList.toggle("dark-mode");
});

window.onload = function(){
    let history = JSON.parse(localStorage.getItem("ecoHistory")) || [];
    renderHistory(history);
}