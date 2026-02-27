const Economy = {
    money: 100000,
    population: 0,
    powerUsed: 0,
    powerCapacity: 0,

    costs: {
        road: 100,
        residential: 500,
        commercial: 800,
        industrial: 1200,
        powerplant: 2000,
        park: 300,
        bulldoze: 20
    },

    powerPerLevel: {
        residential: 5,
        commercial: 10,
        industrial: 25,
        park: 2
    },

    income: {
        residential: 50,
        commercial: 120,
        industrial: 200
    },

    init() {
        this.updateUI();
        // Start income cycle
        setInterval(() => this.processInterval(), 10000); // Every 10 seconds
    },

    canAfford(type) {
        return this.money >= this.costs[type];
    },

    spend(type) {
        if (this.canAfford(type)) {
            this.money -= this.costs[type];
            this.updateUI();
            return true;
        }
        return false;
    },

    refund(type) {
        // Refund 50% on bulldoze?
        this.money -= this.costs.bulldoze;
        this.updateUI();
    },

    processInterval() {
        if (Game.paused) return;
        let earnings = 0;
        let totalPowerUsed = 0;
        let totalPowerCapacity = 0;

        const buildings = document.querySelectorAll('.building');

        // First pass: Calculate Capacity
        buildings.forEach(b => {
            if (b.classList.contains('powerplant')) {
                totalPowerCapacity += 100;
            }
        });

        // Second pass: Consumption and Earnings
        buildings.forEach(b => {
            const type = b.classList.contains('residential') ? 'residential' :
                b.classList.contains('commercial') ? 'commercial' :
                    b.classList.contains('industrial') ? 'industrial' : null;

            if (type) {
                const level = parseInt(b.dataset.level) || 1;
                const powerNeeded = this.powerPerLevel[type] * level;

                if (totalPowerUsed + powerNeeded <= totalPowerCapacity) {
                    totalPowerUsed += powerNeeded;
                    const typeIncome = this.income[type] || 0;
                    earnings += typeIncome * level;
                    b.classList.remove('unpowered');
                } else {
                    b.classList.add('unpowered');
                }
            }
        });

        this.money += earnings;
        this.powerUsed = totalPowerUsed;
        this.powerCapacity = totalPowerCapacity;
        this.updateUI();

        if (earnings > 0) {
            Game.notify(`Earnings collected: +$${earnings}`);
        }
    },

    updateUI() {
        document.querySelector('#stat-money .value').textContent = `$${this.money.toLocaleString()}`;
        document.querySelector('#stat-population .value').textContent = this.population.toLocaleString();
        document.querySelector('#stat-power .value').textContent = `${this.powerUsed}/${this.powerCapacity} MW`;
    },

    addPopulation(amount) {
        this.population += amount;
        this.updateUI();
    },

    removePopulation(amount) {
        this.population = Math.max(0, this.population - amount);
        this.updateUI();
    }
};
