let wealth = 50;
let happiness = 50;
let career = 50;
let relationships = 50;

let step = 0;

const scenarios = [
    {
        title: "Startup Life",
        text: "You join a fast-growing startup. Long hours but big opportunity.",
        effects: {wealth: +10, career: +15, happiness: -5}
    },
    {
        title: "Higher Studies",
        text: "You pursue masters abroad. Knowledge increases.",
        effects: {career: +10, wealth: -10, happiness: +5}
    },
    {
        title: "World Travel",
        text: "You explore cultures and experiences.",
        effects: {happiness: +15, relationships: +10, wealth: -15}
    }
];

function makeChoice(choice){
    if(step >= 3) return;

    let scenario = scenarios[choice-1];

    applyEffects(scenario.effects);

    document.getElementById("scenarioTitle").innerText = scenario.title;
    document.getElementById("scenarioText").innerText = scenario.text;

    step++;

    updateBars();

    if(step === 3){
        generateEnding();
    }
}

function applyEffects(effects){
    wealth += effects.wealth || 0;
    happiness += effects.happiness || 0;
    career += effects.career || 0;
    relationships += effects.relationships || 0;
}

function updateBars(){
    document.getElementById("wealthBar").style.width = wealth + "%";
    document.getElementById("happinessBar").style.width = happiness + "%";
    document.getElementById("careerBar").style.width = career + "%";
    document.getElementById("relationshipBar").style.width = relationships + "%";
}

function generateEnding(){
    let score = wealth + happiness + career + relationships;

    let endingTitle = document.getElementById("endingTitle");
    let endingText = document.getElementById("endingText");

    if(score > 260){
        endingTitle.innerText = "🌟 Balanced Success";
        endingText.innerText = "You achieved a balanced and fulfilling life.";
    }
    else if(wealth > 80){
        endingTitle.innerText = "💰 Wealth Titan";
        endingText.innerText = "Financial success defined your path.";
    }
    else if(happiness > 80){
        endingTitle.innerText = "😊 Joyful Explorer";
        endingText.innerText = "You prioritized happiness and experiences.";
    }
    else{
        endingTitle.innerText = "🧠 Complex Journey";
        endingText.innerText = "Your life was full of lessons and growth.";
    }
}

updateBars();