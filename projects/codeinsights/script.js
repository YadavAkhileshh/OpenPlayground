let historyData = JSON.parse(localStorage.getItem("codeHistory")) || [];

const complexityScore = document.getElementById("complexityScore");
const readabilityScore = document.getElementById("readabilityScore");
const bugScore = document.getElementById("bugScore");
const suggestionList = document.getElementById("suggestionList");
const historyList = document.getElementById("historyList");

document.getElementById("analyzeBtn").addEventListener("click", function(){

    let code = document.getElementById("codeInput").value;

    let complexity = calculateComplexity(code);
    let readability = calculateReadability(code);
    let bugs = detectBugPatterns(code);

    complexityScore.innerText = complexity;
    readabilityScore.innerText = readability;
    bugScore.innerText = bugs.score;

    displaySuggestions(bugs.suggestions);

    saveHistory(complexity, readability);
    renderHistory();
});

function calculateComplexity(code){

    let conditions = (code.match(/if|for|while|switch|case/g) || []).length;
    let functions = (code.match(/function|=>/g) || []).length;
    let nesting = (code.match(/{/g) || []).length;

    let score = conditions * 10 + functions * 8 + nesting * 2;

    return Math.min(score,100);
}

function calculateReadability(code){

    let lines = code.split("\n").length;
    let avgLineLength = code.length / lines;

    if(avgLineLength < 50) return 90;
    if(avgLineLength < 80) return 70;
    return 50;
}

function detectBugPatterns(code){

    let suggestions = [];
    let score = 0;

    if(code.includes("var ")){
        suggestions.push("Use let/const instead of var.");
        score += 20;
    }

    if(code.includes("==")){
        suggestions.push("Consider using strict equality (===).");
        score += 15;
    }

    if(code.includes("console.log")){
        suggestions.push("Remove console.log in production.");
        score += 10;
    }

    if(!code.includes("try") && code.includes("fetch")){
        suggestions.push("Add error handling for async calls.");
        score += 20;
    }

    return {score: Math.min(score,100), suggestions};
}

function displaySuggestions(list){
    suggestionList.innerHTML = "";
    list.forEach(item=>{
        let li = document.createElement("li");
        li.innerText = item;
        suggestionList.appendChild(li);
    });
}

function saveHistory(complexity, readability){
    historyData.push({complexity, readability});
    localStorage.setItem("codeHistory", JSON.stringify(historyData));
}

function renderHistory(){
    historyList.innerHTML = "";
    historyData.slice(-5).reverse().forEach(entry=>{
        let li = document.createElement("li");
        li.innerText = "Complexity: " + entry.complexity +
                       " | Readability: " + entry.readability;
        historyList.appendChild(li);
    });
}

window.onload = renderHistory;