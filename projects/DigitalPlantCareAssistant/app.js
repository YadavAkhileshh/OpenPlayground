// Digital Plant Care Assistant - Main JS

const plantForm = document.getElementById('plantForm');
const plantList = document.getElementById('plantList');
const reminderList = document.getElementById('reminderList');
const healthList = document.getElementById('healthList');

let plants = JSON.parse(localStorage.getItem('plants')) || [];

function renderPlants() {
    plantList.innerHTML = '';
    plants.forEach((plant, idx) => {
        const li = document.createElement('li');
        li.textContent = `${plant.name} (${plant.type})`;
        li.appendChild(createLogHealthButton(idx));
        plantList.appendChild(li);
    });
    renderReminders();
    renderHealth();
}

function createLogHealthButton(idx) {
    const btn = document.createElement('button');
    btn.textContent = 'Log Health';
    btn.onclick = () => logHealth(idx);
    btn.style.marginLeft = '1rem';
    return btn;
}

plantForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('plantName').value.trim();
    const type = document.getElementById('plantType').value.trim();
    if (name && type) {
        plants.push({ name, type, lastWatered: null, lastFertilized: null, health: [] });
        localStorage.setItem('plants', JSON.stringify(plants));
        plantForm.reset();
        renderPlants();
    }
};

function renderReminders() {
    reminderList.innerHTML = '';
    plants.forEach((plant, idx) => {
        const li = document.createElement('li');
        const now = new Date();
        let waterMsg = 'Needs watering';
        let fertMsg = 'Needs fertilizing';
        if (plant.lastWatered) {
            const last = new Date(plant.lastWatered);
            const days = Math.floor((now - last) / (1000*60*60*24));
            waterMsg = days < 3 ? `Watered ${days} day(s) ago` : 'Needs watering';
        }
        if (plant.lastFertilized) {
            const last = new Date(plant.lastFertilized);
            const days = Math.floor((now - last) / (1000*60*60*24));
            fertMsg = days < 14 ? `Fertilized ${days} day(s) ago` : 'Needs fertilizing';
        }
        li.textContent = `${plant.name}: ${waterMsg}, ${fertMsg}`;
        li.appendChild(createWaterButton(idx));
        li.appendChild(createFertilizeButton(idx));
        reminderList.appendChild(li);
    });
}

function createWaterButton(idx) {
    const btn = document.createElement('button');
    btn.textContent = 'Water';
    btn.onclick = () => {
        plants[idx].lastWatered = new Date().toISOString();
        localStorage.setItem('plants', JSON.stringify(plants));
        renderPlants();
    };
    btn.style.marginLeft = '1rem';
    return btn;
}

function createFertilizeButton(idx) {
    const btn = document.createElement('button');
    btn.textContent = 'Fertilize';
    btn.onclick = () => {
        plants[idx].lastFertilized = new Date().toISOString();
        localStorage.setItem('plants', JSON.stringify(plants));
        renderPlants();
    };
    btn.style.marginLeft = '0.5rem';
    return btn;
}

function logHealth(idx) {
    const status = prompt('Enter health status for ' + plants[idx].name + ' (e.g., Good, Wilting, Yellow leaves):');
    if (status) {
        plants[idx].health.push({ date: new Date().toLocaleDateString(), status });
        localStorage.setItem('plants', JSON.stringify(plants));
        renderPlants();
    }
}

function renderHealth() {
    healthList.innerHTML = '';
    plants.forEach((plant) => {
        if (plant.health.length > 0) {
            const li = document.createElement('li');
            li.textContent = `${plant.name}: ` + plant.health.map(h => `${h.date} - ${h.status}`).join('; ');
            healthList.appendChild(li);
        }
    });
}

renderPlants();
