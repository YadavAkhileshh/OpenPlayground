/**
 * Real-Time Analytics Platform - Logic
 * Day 117
 */

const CONFIG = {
    chartPoints: 40,
    updateInterval: 1000,
    colors: {
        blue: '#00d2ff',
        green: '#28c76f',
        red: '#ff4d4d',
        orange: '#ff9f43',
        grid: '#1a1a1c'
    }
};

/* --- Data Generator --- */
const AnalyticsData = {
    trafficData: Array.from({ length: CONFIG.chartPoints }, () => 20 + Math.random() * 30),
    startTime: Date.now(),

    getSnapshot() {
        return {
            liveUsers: Math.floor(1200 + Math.random() * 200),
            requestsPerSec: (45 + Math.random() * 15).toFixed(1),
            cpu: Math.floor(30 + Math.random() * 40),
            memory: Math.floor(55 + Math.random() * 10),
            errorRate: (0.01 + Math.random() * 0.03).toFixed(2)
        };
    },

    getGeoData() {
        return [
            { country: 'United States', count: 450, percent: 85 },
            { country: 'Germany', count: 320, percent: 65 },
            { country: 'India', count: 280, percent: 55 },
            { country: 'Japan', count: 190, percent: 40 },
            { country: 'United Kingdom', count: 150, percent: 30 }
        ];
    },

    getRandomLog() {
        const events = [
            { msg: 'New session established: US-East-1', type: 'info' },
            { msg: 'Cache miss on key: user_profile_882', type: 'warn' },
            { msg: 'API request served by secondary node', type: 'info' },
            { msg: 'Inbound spike detected from IP 142.x.x.x', type: 'info' },
            { msg: 'Latency exceeded threshold (150ms)', type: 'warn' },
            { msg: 'Database connection pool near capacity', type: 'warn' },
            { msg: 'Failed authentication attempt: Admin', type: 'error' }
        ];
        return events[Math.floor(Math.random() * events.length)];
    }
};

/* --- Visualizers --- */

// 1. Streaming Chart (D3)
const TrafficChart = {
    init() {
        const container = d3.select("#traffic-viz");
        this.margin = { top: 20, right: 30, bottom: 30, left: 40 };
        this.width = container.node().clientWidth - this.margin.left - this.margin.right;
        this.height = container.node().clientHeight - this.margin.top - this.margin.bottom;

        this.svg = container.append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        this.x = d3.scaleLinear().domain([0, CONFIG.chartPoints - 1]).range([0, this.width]);
        this.y = d3.scaleLinear().domain([0, 100]).range([this.height, 0]);

        this.line = d3.line()
            .x((d, i) => this.x(i))
            .y(d => this.y(d))
            .curve(d3.curveBasis);

        // Path
        this.path = this.svg.append("path")
            .datum(AnalyticsData.trafficData)
            .attr("class", "line")
            .attr("d", this.line)
            .attr("fill", "none")
            .attr("stroke", CONFIG.colors.blue)
            .attr("stroke-width", 3);

        // Gradient
        this.svg.append("linearGradient")
            .attr("id", "line-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", this.y(0))
            .attr("x2", 0).attr("y2", this.y(100))
            .selectAll("stop")
            .data([
                { offset: "0%", color: CONFIG.colors.blue },
                { offset: "100%", color: "transparent" }
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        this.area = d3.area()
            .x((d, i) => this.x(i))
            .y0(this.height)
            .y1(d => this.y(d))
            .curve(d3.curveBasis);

        this.areaPath = this.svg.append("path")
            .datum(AnalyticsData.trafficData)
            .attr("d", this.area)
            .attr("fill", "url(#line-gradient)")
            .attr("opacity", 0.2);

        // Grid
        this.svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(this.y).ticks(5).tickSize(-this.width).tickFormat(""))
            .attr("stroke", CONFIG.colors.grid)
            .attr("opacity", 0.5);

        this.update();
    },

    update() {
        const newVal = 30 + Math.random() * 40;
        AnalyticsData.trafficData.push(newVal);
        AnalyticsData.trafficData.shift();

        this.path.datum(AnalyticsData.trafficData).attr("d", this.line);
        this.areaPath.datum(AnalyticsData.trafficData).attr("d", this.area);
    }
};

// 2. Gauges (D3)
const Gauge = {
    create(selector, value, color) {
        const container = d3.select(selector);
        const width = 120, height = 70;
        const radius = 60;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${radius})`);

        const scale = d3.scaleLinear().domain([0, 100]).range([-Math.PI / 2, Math.PI / 2]);

        // Background
        const arcBg = d3.arc()
            .innerRadius(45)
            .outerRadius(55)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2);

        svg.append("path")
            .attr("d", arcBg)
            .attr("fill", CONFIG.colors.grid);

        // Value Arc
        const arcValue = d3.arc()
            .innerRadius(45)
            .outerRadius(55)
            .startAngle(-Math.PI / 2)
            .cornerRadius(5);

        const pathVal = svg.append("path")
            .datum({ endAngle: scale(value) })
            .attr("d", arcValue)
            .attr("fill", color);

        const text = svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.5rem")
            .attr("fill", "#fff")
            .attr("font-family", "JetBrains Mono")
            .attr("font-weight", "bold")
            .text(`${value}%`);

        return {
            update(newVal) {
                pathVal.transition().duration(800)
                    .attrTween("d", function (d) {
                        const interpolate = d3.interpolate(d.endAngle, scale(newVal));
                        return function (t) {
                            d.endAngle = interpolate(t);
                            return arcValue(d);
                        };
                    });
                text.text(`${newVal}%`);
            }
        };
    }
};

/* --- UI Controllers --- */

const Dashboard = {
    init() {
        TrafficChart.init();
        this.cpuGauge = Gauge.create("#cpu-gauge", 45, CONFIG.colors.blue);
        this.memGauge = Gauge.create("#mem-gauge", 62, CONFIG.colors.blue);

        this.renderGeo();
        this.setupClock();
        this.setupEventListeners();

        // Start Loop
        setInterval(() => this.tick(), CONFIG.updateInterval);
    },

    tick() {
        const data = AnalyticsData.getSnapshot();

        // Update Metrics
        document.getElementById('live-users').innerText = data.liveUsers.toLocaleString();
        document.getElementById('req-sec').innerText = data.requestsPerSec;
        document.getElementById('err-rate').innerText = data.errorRate + '%';

        // Update Chart
        TrafficChart.update();

        // Update Gauges
        this.cpuGauge.update(data.cpu);
        this.memGauge.update(data.memory);

        // Random Log
        if (Math.random() > 0.6) {
            this.addLog(AnalyticsData.getRandomLog());
        }
    },

    renderGeo() {
        const container = document.getElementById('geo-list');
        const data = AnalyticsData.getGeoData();

        container.innerHTML = data.map((d, i) => `
            <div class="geo-row">
                <span class="geo-rank">#${i + 1}</span>
                <span class="geo-country">${d.country}</span>
                <div class="geo-progress-container">
                    <div class="geo-progress-fill" style="width: ${d.percent}%"></div>
                </div>
                <span class="geo-count">${d.count}</span>
            </div>
        `).join('');
    },

    addLog(log) {
        const container = document.getElementById('log-list');
        const time = new Date().toLocaleTimeString([], { hour12: false });

        const entry = document.createElement('div');
        entry.className = `log-entry ${log.type}`;
        entry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-msg">${log.msg}</span>
        `;

        container.prepend(entry);
        if (container.children.length > 50) container.removeChild(container.lastChild);
    },

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour12: false });
        };
        setInterval(updateClock, 1000);
        updateClock();
    },

    setupEventListeners() {
        // Mobile Sidebar
        document.getElementById('mobileToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // Clear Logs
        document.getElementById('clear-logs').addEventListener('click', () => {
            document.getElementById('log-list').innerHTML = '';
        });
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => Dashboard.init());
