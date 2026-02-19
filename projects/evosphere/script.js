let generation = 1;
let population = 100;
let avgFitness = 50;

let traits = [];

function initializePopulation(){
    traits = [];
    for(let i=0; i<population; i++){
        traits.push({
            adaptability: Math.random()*100,
            strength: Math.random()*100,
            intelligence: Math.random()*100
        });
    }
}

function calculateFitness(individual, temperature, food){
    let envImpact = (temperature + food) / 2;
    return (
        individual.adaptability * 0.4 +
        individual.strength * 0.3 +
        individual.intelligence * 0.3
    ) - Math.abs(envImpact - 50);
}

function nextGeneration(){

    let temperature = parseInt(document.getElementById("temperature").value);
    let food = parseInt(document.getElementById("food").value);

    let survivors = [];

    traits.forEach(ind=>{
        let fitness = calculateFitness(ind, temperature, food);
        if(fitness > 40){
            survivors.push(mutate(ind));
        }
    });

    population = survivors.length;
    traits = survivors;

    avgFitness = calculateAverageFitness(temperature, food);

    generation++;

    updateUI();
    renderChart();
}

function mutate(ind){
    return {
        adaptability: clamp(ind.adaptability + randomMutation()),
        strength: clamp(ind.strength + randomMutation()),
        intelligence: clamp(ind.intelligence + randomMutation())
    };
}

function randomMutation(){
    return (Math.random() - 0.5) * 10;
}

function clamp(value){
    return Math.max(0, Math.min(100, value));
}

function calculateAverageFitness(temp, food){
    let total = 0;
    traits.forEach(ind=>{
        total += calculateFitness(ind, temp, food);
    });
    return traits.length ? (total/traits.length).toFixed(2) : 0;
}

function updateUI(){
    document.getElementById("generation").innerText = generation;
    document.getElementById("populationSize").innerText = population;
    document.getElementById("fitnessScore").innerText = avgFitness;
}

function renderChart(){

    let ctx = document.getElementById("evolutionChart").getContext("2d");

    let adaptabilityAvg = averageTrait("adaptability");
    let strengthAvg = averageTrait("strength");
    let intelligenceAvg = averageTrait("intelligence");

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Adaptability","Strength","Intelligence"],
            datasets: [{
                data: [adaptabilityAvg, strengthAvg, intelligenceAvg],
                backgroundColor: ["#00bfa5","#008e76","#004d40"]
            }]
        }
    });
}

function averageTrait(type){
    let total = 0;
    traits.forEach(ind=>{
        total += ind[type];
    });
    return traits.length ? (total/traits.length).toFixed(2) : 0;
}

initializePopulation();
updateUI();
renderChart();