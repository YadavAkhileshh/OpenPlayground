/**
 * Smart Campus Dashboard - Script
 * Handles D3.js visualizations and mock real-time data simulation.
 */

/* --- Configuration --- */
const CONFIG = {
    updateInterval: 3000, // Update every 3 seconds
    colors: {
        primary: '#6366f1',
        accent: '#22d3ee',
        bg: '#141521',
        grid: '#2d3748',
        low: '#10b981',
        med: '#f59e0b',
        high: '#ef4444'
    }
};

/* --- Mock Data Generator --- */
const DataService = {
    // Generate Library Occupancy Data (Time Series 9AM - 9PM)
    getLibraryData() {
        // Simulate a bell curve (busy in afternoon)
        const hours = Array.from({ length: 13 }, (_, i) => 9 + i); // 9 to 21
        return hours.map(h => {
            const peak = 14; // 2 PM
            const dist = Math.abs(h - peak);
            const base = 100 - (dist * 10);
            return {
                hour: `${h}:00`,
                occupancy: base + (Math.random() * 20 - 10) // Noise
            };
        });
    },

    // Generate Energy Breakdown
    getEnergyData() {
        return [
            { id: "Science", value: Math.floor(Math.random() * 300) + 200 },
            { id: "Arts", value: Math.floor(Math.random() * 200) + 100 },
            { id: "Admin", value: Math.floor(Math.random() * 150) + 50 },
            { id: "Dorms", value: Math.floor(Math.random() * 400) + 300 }
        ];
    },

    // Generate Heatmap Grid (5x5 Campus Zones)
    getHeatmapData() {
        const rows = 5;
        const cols = 5;
        const data = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                data.push({
                    row: r,
                    col: c,
                    value: Math.floor(Math.random() * 100)
                });
            }
        }
        return data;
    },

    // Recent Activities
    activities: [
        "Library 2nd Floor at 90% capacity.",
        "AC Maintenance Warning: Science Block.",
        "Main Gate: High traffic inflow.",
        "Energy Saver Mode enabled in Arts Wing.",
        "Computer Lab 3 reserved for Workshop."
    ],

    getRandomActivity() {
        const events = [
            "Motion detected in Restricted Zone B.",
            "Cafeteria payment system online.",
            "Water levels low in Tank 4.",
            "Smart Lights auto-dimmed in Hallways.",
            "Projector disconnected in Room 101."
        ];
        return events[Math.floor(Math.random() * events.length)];
    }
};

/* --- Visualization Controllers --- */

// 1. Heatmap Controller
const Heatmap = {
    init() {
        const container = document.getElementById('heatmap-viz');
        const width = container.clientWidth;
        const height = container.clientHeight || 300;
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };

        this.svg = d3.select("#heatmap-viz")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`);

        this.group = this.svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;

        // Scales
        this.x = d3.scaleBand().range([0, this.width]).domain([0, 1, 2, 3, 4]).padding(0.05);
        this.y = d3.scaleBand().range([0, this.height]).domain([0, 1, 2, 3, 4]).padding(0.05);
        this.color = d3.scaleLinear().domain([0, 100]).range(["#1e1b4b", "#6366f1"]); // Dark blue to Indigo

        this.update();

        // Tooltip
        this.tooltip = d3.select("body").append("div").attr("class", "d3-tooltip").style("opacity", 0);
    },

    update() {
        const data = DataService.getHeatmapData();

        const rects = this.group.selectAll("rect")
            .data(data, d => `${d.row}:${d.col}`);

        rects.enter()
            .append("rect")
            .attr("x", d => this.x(d.col))
            .attr("y", d => this.y(d.row))
            .attr("width", this.x.bandwidth())
            .attr("height", this.y.bandwidth())
            .attr("rx", 4)
            .attr("ry", 4)
            .style("fill", d => this.color(d.value))
            .on("mouseover", (event, d) => {
                this.tooltip.transition().duration(200).style("opacity", .9);
                this.tooltip.html(`Zone ${d.row}-${d.col}<br/>Density: ${d.value}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                this.tooltip.transition().duration(500).style("opacity", 0);
            })
            .merge(rects)
            .transition()
            .duration(1000)
            .style("fill", d => this.color(d.value));

        rects.exit().remove();
    }
};

// 2. Library Chart (Line) Controller
const LibraryChart = {
    init() {
        const container = document.getElementById('library-chart');
        const width = container.clientWidth;
        const height = container.clientHeight || 250;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        this.svg = d3.select("#library-chart")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`);

        this.group = this.svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;

        // Scales
        this.x = d3.scalePoint().range([0, this.width]);
        this.y = d3.scaleLinear().domain([0, 120]).range([this.height, 0]);

        // Line Generator
        this.line = d3.line()
            .x(d => this.x(d.hour))
            .y(d => this.y(d.occupancy))
            .curve(d3.curveMonotoneX);

        // Axes
        this.xAxis = this.group.append("g")
            .attr("transform", `translate(0, ${this.height})`)
            .attr("class", "axis");

        this.yAxis = this.group.append("g")
            .attr("class", "axis");

        // Path
        this.path = this.group.append("path")
            .attr("fill", "none")
            .attr("stroke", CONFIG.colors.accent)
            .attr("stroke-width", 3);

        this.update();
    },

    update() {
        const data = DataService.getLibraryData();
        this.x.domain(data.map(d => d.hour));

        // Update Axes
        this.xAxis.call(d3.axisBottom(this.x).tickValues(this.x.domain().filter((d, i) => i % 2 === 0))) // Show every 2nd tick
            .select(".domain").attr("stroke", CONFIG.colors.grid);
        this.xAxis.selectAll("text").attr("fill", "#94a3b8");
        this.xAxis.selectAll("line").attr("stroke", CONFIG.colors.grid);

        this.yAxis.call(d3.axisLeft(this.y).ticks(5))
            .select(".domain").remove(); // Hide Y axis line
        this.yAxis.selectAll("text").attr("fill", "#94a3b8");
        this.yAxis.selectAll("line").attr("stroke", CONFIG.colors.grid);

        // Update Line
        this.path.datum(data)
            .transition()
            .duration(1000)
            .attr("d", this.line);
    }
};

// 3. Energy Chart (Donut) Controller
const EnergyChart = {
    init() {
        const container = document.getElementById('energy-chart');
        const width = container.clientWidth;
        const height = container.clientHeight || 250;
        const radius = Math.min(width, height) / 2 - 20;

        this.svg = d3.select("#energy-chart")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        this.color = d3.scaleOrdinal()
            .range(["#6366f1", "#a855f7", "#ec4899", "#22d3ee"]);

        this.pie = d3.pie().value(d => d.value).sort(null);
        this.arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);

        this.update();
    },

    update() {
        const data = DataService.getEnergyData();

        const path = this.svg.selectAll("path")
            .data(this.pie(data));

        path.enter()
            .append("path")
            .attr("fill", d => this.color(d.data.id))
            .attr("stroke", "#141521")
            .style("stroke-width", "2px")
            .attr("d", this.arc)
            .each(function (d) { this._current = d; }) // Store initial angles
            .merge(path)
            .transition()
            .duration(1000)
            .attrTween("d", function (d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    return EnergyChart.arc(interpolate(t));
                };
            });

        path.exit().remove();

        // Optional: Add Center Text (Total kWh)
        const total = data.reduce((acc, curr) => acc + curr.value, 0);

        // Remove old text
        this.svg.selectAll("text").remove();

        this.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.2em")
            .style("fill", "#fff")
            .style("font-size", "1.2rem")
            .style("font-weight", "bold")
            .text(total);

        this.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.2em")
            .style("fill", "#94a3b8")
            .style("font-size", "0.8rem")
            .text("kWh");
    }
};

// 4. Activity Feed Controller
const ActivityFeed = {
    init() {
        this.list = document.getElementById('activity-list');
        DataService.activities.forEach(msg => this.addItem(msg, 'Just now'));
    },

    addItem(msg, time) {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
            <div class="activity-time">${time}</div>
            <div class="activity-content">
                <h4>System Alert</h4>
                <p>${msg}</p>
            </div>
        `;

        this.list.prepend(li);

        // Limit items
        if (this.list.children.length > 6) {
            this.list.removeChild(this.list.lastChild);
        }
    },

    update() {
        // Randomly add new activity
        if (Math.random() > 0.7) {
            this.addItem(DataService.getRandomActivity(), 'Just now');
        }
    }
};

/* --- Main Logic --- */
document.addEventListener('DOMContentLoaded', () => {
    // Init Visualizations
    Heatmap.init();
    LibraryChart.init();
    EnergyChart.init();
    ActivityFeed.init();

    // Start Simulation Loop
    setInterval(() => {
        Heatmap.update();
        LibraryChart.update();
        EnergyChart.update(); // Updates donut and total text
        ActivityFeed.update();

        // Update basic stat numbers slightly to feel "alive"
        updateStat('stat-students', 12450, 50);
        updateStat('stat-energy', 845, 20);

    }, CONFIG.updateInterval);
});

function updateStat(id, base, variance) {
    const el = document.querySelector(`#${id} .value`);
    if (el) {
        let current = parseInt(el.textContent.replace(/,/g, ''));
        if (isNaN(current)) current = base; // Handle first run or text like "78%"

        // Only update numeric stats
        if (!el.textContent.includes('%')) {
            const newVal = base + Math.floor(Math.random() * variance) - (variance / 2);
            el.textContent = newVal.toLocaleString();
        }
    }
}

// Handle Window Resize for Reponsiveness
window.addEventListener('resize', () => {
    // A full re-render would be ideal, but for now we just reload 
    // or we could implement specific logic to resize SVGs
    // d3 viewbox handles scaling, so plain CSS resizing works for the container
});
