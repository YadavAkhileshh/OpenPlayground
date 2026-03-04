let historyData = JSON.parse(localStorage.getItem("personaHistory")) || [];

const typeResult = document.getElementById("typeResult");
const insightText = document.getElementById("insightText");
const historyList = document.getElementById("historyList");

document.getElementById("quizForm").addEventListener("submit", function(e){
    e.preventDefault();

    let q1 = parseInt(document.getElementById("q1").value);
    let q2 = parseInt(document.getElementById("q2").value);
    let q3 = parseInt(document.getElementById("q3").value);

    let scores = calculateTraits(q1, q2, q3);
    let type = determineType(scores);

    displayResult(type, scores);
    saveHistory(type);
    renderHistory();
    renderRadar(scores);
});

function calculateTraits(a, b, c){
    return {
        leadership: a + b,
        resilience: c + a,
        strategy: b + c
    };
}

function determineType(scores){
    let max = Math.max(scores.leadership, scores.resilience, scores.strategy);

    if(max === scores.leadership) return "Visionary Leader 🚀";
    if(max === scores.resilience) return "Resilient Executor 💪";
    return "Strategic Thinker 🧠";
}

function displayResult(type, scores){
    typeResult.innerText = type;

    if(type.includes("Leader")){
        insightText.innerText = "You thrive in high responsibility roles and drive innovation.";
    }
    else if(type.includes("Resilient")){
        insightText.innerText = "You handle pressure with composure and persistence.";
    }
    else{
        insightText.innerText = "You analyze deeply before acting and value long-term planning.";
    }
}

function saveHistory(type){
    historyData.push(type);
    localStorage.setItem("personaHistory", JSON.stringify(historyData));
}

function renderHistory(){
    historyList.innerHTML = "";
    historyData.slice(-5).reverse().forEach(item=>{
        let li = document.createElement("li");
        li.innerText = item;
        historyList.appendChild(li);
    });
}

function renderRadar(scores){
    let ctx = document.getElementById("radarChart").getContext("2d");

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ["Leadership","Resilience","Strategy"],
            datasets: [{
                data: [
                    scores.leadership,
                    scores.resilience,
                    scores.strategy
                ],
                backgroundColor: "rgba(255,127,17,0.3)",
                borderColor: "#ff7f11"
            }]
        }
    });
}

window.onload = renderHistory;