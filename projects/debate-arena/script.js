let historyData = JSON.parse(localStorage.getItem("debateHistory")) || [];

const logicScore = document.getElementById("logicScore");
const biasScore = document.getElementById("biasScore");
const clarityScore = document.getElementById("clarityScore");
const counterArgument = document.getElementById("counterArgument");
const historyList = document.getElementById("historyList");

document.getElementById("analyzeBtn").addEventListener("click", function(){

    let argument = document.getElementById("argument").value.toLowerCase();
    let stance = document.getElementById("stance").value;
    let topic = document.getElementById("topic").value;

    let logic = analyzeLogic(argument);
    let bias = analyzeBias(argument);
    let clarity = analyzeClarity(argument);

    logicScore.innerText = logic;
    biasScore.innerText = bias;
    clarityScore.innerText = clarity;

    let counter = generateCounterArgument(topic, stance);
    counterArgument.innerText = counter;

    saveHistory(topic, stance, logic);
    renderHistory();
});

function analyzeLogic(text){
    let keywords = ["because","therefore","evidence","data","research"];
    let score = 0;

    keywords.forEach(word=>{
        if(text.includes(word)) score += 15;
    });

    return Math.min(score,100);
}

function analyzeBias(text){
    let emotionalWords = ["always","never","worst","best","hate","love"];
    let score = 0;

    emotionalWords.forEach(word=>{
        if(text.includes(word)) score += 20;
    });

    return Math.min(score,100);
}

function analyzeClarity(text){
    let length = text.split(" ").length;
    if(length > 100) return 90;
    if(length > 50) return 70;
    return 40;
}

function generateCounterArgument(topic, stance){
    if(stance === "Support"){
        return "Critics argue that " + topic + " may have hidden drawbacks that require regulation and ethical consideration.";
    }
    else{
        return "Supporters believe that " + topic + " offers innovation and long-term societal benefits.";
    }
}

function saveHistory(topic, stance, logic){
    historyData.push({topic, stance, logic});
    localStorage.setItem("debateHistory", JSON.stringify(historyData));
}

function renderHistory(){
    historyList.innerHTML = "";
    historyData.slice(-5).reverse().forEach(entry=>{
        let li = document.createElement("li");
        li.innerText = entry.topic + " - " + entry.stance + " (Logic: " + entry.logic + ")";
        historyList.appendChild(li);
    });
}

window.onload = renderHistory;