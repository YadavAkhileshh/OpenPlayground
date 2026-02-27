let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
const totalExpense = document.getElementById("totalExpense");
const prediction = document.getElementById("prediction");
const savingsSuggestion = document.getElementById("savingsSuggestion");

document.getElementById("expenseForm").addEventListener("submit", function(e){
    e.preventDefault();

    let amount = parseFloat(document.getElementById("amount").value);
    let category = document.getElementById("category").value;

    expenses.push({amount, category});
    localStorage.setItem("expenses", JSON.stringify(expenses));

    updateSummary();
    renderChart();
});

function updateSummary(){
    let total = expenses.reduce((sum, item)=> sum + item.amount, 0);
    totalExpense.innerText = total.toFixed(2);

    let predicted = predictNextMonth(total);
    prediction.innerText = predicted.toFixed(2);

    savingsSuggestion.innerText = (predicted * 0.2).toFixed(2);
}

function predictNextMonth(currentTotal){
    let growthRate = 0.1;
    return currentTotal + (currentTotal * growthRate);
}

function renderChart(){
    let ctx = document.getElementById("financeChart").getContext("2d");

    let categories = {};
    expenses.forEach(item=>{
        categories[item.category] = (categories[item.category] || 0) + item.amount;
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#ffb4a2','#bde0fe','#caffbf','#ffd6a5','#e2ece9']
            }]
        }
    });
}

document.getElementById("saveNotes").addEventListener("click", function(){
    let notes = document.getElementById("plannerNotes").value;
    localStorage.setItem("plannerNotes", notes);
});

window.onload = function(){
    updateSummary();
    renderChart();
    document.getElementById("plannerNotes").value =
        localStorage.getItem("plannerNotes") || "";
}