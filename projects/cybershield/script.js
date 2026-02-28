let risk = 0;
let integrity = 100;
let defense = 50;

const riskLevel = document.getElementById("riskLevel");
const integrityLevel = document.getElementById("integrityLevel");
const defenseLevel = document.getElementById("defenseLevel");
const integrityBar = document.getElementById("integrityBar");
const logList = document.getElementById("logList");

function simulateAttack(){

    let attackType = document.getElementById("attackType").value;
    let impact = calculateImpact(attackType);

    integrity -= impact.damage;
    risk += impact.risk;

    if(integrity < 0) integrity = 0;

    updateUI();
    logAttack(attackType, impact.damage);
}

function calculateImpact(type){

    let baseDamage = 0;
    let riskIncrease = 0;

    if(type === "malware"){
        baseDamage = 20;
        riskIncrease = 15;
    }
    if(type === "phishing"){
        baseDamage = 10;
        riskIncrease = 10;
    }
    if(type === "ddos"){
        baseDamage = 25;
        riskIncrease = 20;
    }
    if(type === "ransomware"){
        baseDamage = 30;
        riskIncrease = 25;
    }

    let defenseReduction = defense / 10;

    return {
        damage: Math.max(baseDamage - defenseReduction, 5),
        risk: riskIncrease
    };
}

function upgradeDefense(){
    defense += 10;
    if(defense > 100) defense = 100;
    updateUI();
    logEvent("Defense upgraded.");
}

function updateUI(){
    riskLevel.innerText = risk;
    integrityLevel.innerText = integrity;
    defenseLevel.innerText = defense;
    integrityBar.style.width = integrity + "%";
}

function logAttack(type, damage){
    let li = document.createElement("li");
    li.innerText = "Attack: " + type +
                   " | Damage: -" + damage +
                   " | Integrity: " + integrity + "%";
    logList.appendChild(li);
}

function logEvent(message){
    let li = document.createElement("li");
    li.innerText = message;
    logList.appendChild(li);
}

updateUI();