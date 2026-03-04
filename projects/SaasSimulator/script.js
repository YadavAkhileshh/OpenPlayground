let currentPlan = null;
let usage = 0;
let revenue = 0;

const plans = {
    Free: {
        price: 0,
        limit: 5
    },
    Pro: {
        price: 20,
        limit: 50
    },
    Enterprise: {
        price: 100,
        limit: Infinity
    }
};

function selectPlan(planName) {
    currentPlan = planName;
    usage = 0;

    revenue += plans[planName].price;

    document.getElementById("currentPlan").textContent = planName;
    document.getElementById("usage").textContent = usage;
    document.getElementById("revenue").textContent = revenue;

    alert(planName + " plan activated!");
}

function simulateApiCall() {
    if (!currentPlan) {
        alert("Please select a plan first!");
        return;
    }

    let limit = plans[currentPlan].limit;

    if (usage >= limit) {
        alert("API limit reached! Upgrade your plan.");
        return;
    }

    usage++;
    document.getElementById("usage").textContent = usage;
}

function resetUsage() {
    usage = 0;
    document.getElementById("usage").textContent = usage;
}
