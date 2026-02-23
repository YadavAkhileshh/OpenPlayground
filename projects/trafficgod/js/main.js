/**
 * @file main.js
 * @description Entry point for the TrafficGod simulation.
 */

import { Simulation } from './simulation/simulation.js';
import { Renderer } from './visualization/renderer.js';
import { Graph } from './visualization/graph.js';
import { setupControls, updateStats } from './ui/controls.js';
import { EffectsSystem } from './visualization/effects.js';
import { HelpSystem } from './ui/help.js';
import { WeatherSystem } from './simulation/weather.js';
import { CONFIG } from './utils/constants.js';

window.addEventListener('load', () => {
    console.log('TrafficGod Initializing...');

    const canvas = document.getElementById(CONFIG.CANVAS_ID);
    const graphCanvas = document.getElementById('graph-canvas'); // Needs to be in HTML or created

    // Init Components
    const sim = new Simulation();
    const renderer = new Renderer(canvas, sim);
    const graph = new Graph('graph-canvas'); // Pass ID or element? Graph expects ID.
    const effects = new EffectsSystem();
    const help = new HelpSystem();
    const weather = new WeatherSystem(canvas.width, canvas.height);

    setupControls(sim);

    // Weather Controls
    const btnSun = document.getElementById('weather-sun');
    const btnRain = document.getElementById('weather-rain');

    // Helper for buttons
    function setWeather(type) {
        weather.setWeather(type);
        sim.setWeatherMods(weather.getFrictionDetails());

        btnSun.classList.toggle('primary', type === 'SUNNY');
        btnRain.classList.toggle('primary', type === 'RAIN');
    }

    if (btnSun && btnRain) {
        btnSun.addEventListener('click', () => setWeather('SUNNY'));
        btnRain.addEventListener('click', () => setWeather('RAIN'));
        // Initialize with sunny
        setWeather('SUNNY');
    }

    // Camera Handling
    window.addEventListener('camera-change', (e) => {
        const { mode, targetId } = e.detail;
        renderer.setCameraMode(mode, targetId);
        // Hide panel if global
        if (mode === 'global') {
            document.getElementById('details-panel').style.display = 'none';
        }
    });

    document.getElementById('detail-close').addEventListener('click', () => {
        renderer.setCameraMode('global');
        document.getElementById('details-panel').style.display = 'none';
    });

    sim.start();

    // Click to select
    canvas.addEventListener('mousedown', (e) => {
        // Simple hit testing is hard with transforms.
        // For now, let's just use the "Follow Random" button or logic.
        // Implementing precise raycasting/unprojection for canvas clicks is complex.
        // But we can approximate if in global mode.
        // If in global mode:
        if (renderer.camera.mode === 'global') {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - canvas.width / 2;
            const mouseY = e.clientY - rect.top - canvas.height / 2;

            // Undo global scaling
            const minDim = Math.min(canvas.width, canvas.height);
            const fitScale = (minDim * 0.9) / (sim.road.radius * 2);

            const worldX = mouseX / fitScale;
            const worldY = mouseY / fitScale;

            // Find closest vehicle
            let closest = null;
            let minDist = 20; // Hit radius

            sim.vehicles.forEach(v => {
                const { x, y } = sim.road.getCoordinates(v.position);
                const dx = x - worldX;
                const dy = y - worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    closest = v;
                    minDist = dist;
                }
            });

            if (closest) {
                renderer.setCameraMode('follow', closest.id);
                // Also update UI to show 'Custom' or something? 
                // We'll rely on the visual feedback.
                console.log(`Following vehicle ${closest.id}`);
            }
        } else {
            renderer.setCameraMode('global');
        }
    });

    sim.start();

    // Resize handling
    function resize() {
        const container = document.getElementById('canvas-container');
        renderer.resize(container.clientWidth, container.clientHeight);
        weather.resize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener('resize', resize);
    resize();

    // Loop
    let lastTime = 0;
    const statsUpdateRate = 200; // ms
    let lastStatsTime = 0;

    function loop(timestamp) {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        // Limit dt to avoid spirals if tab inactive
        const safeDt = Math.min(dt, 0.1);

        sim.update(safeDt);
        weather.update(safeDt);

        // Effects logic: braking particles
        sim.vehicles.forEach(v => {
            if (v.acceleration < -1.5) {
                // Get coords
                const { x, y } = sim.road.getCoordinates(v.position);
                // Random offset slightly
                effects.emit(x, y, 'rgba(255, 50, 50, 0.5)', 1);
            }
        });
        effects.update();

        renderer.render(effects);
        weather.draw(renderer.ctx); // Draw weather on top

        // Update Stats & Graph
        if (timestamp - lastStatsTime > statsUpdateRate) {
            // Calculate stats
            let totalSpeed = 0;
            sim.vehicles.forEach(v => totalSpeed += v.velocity);
            const avgSpeed = sim.vehicles.length > 0 ? totalSpeed / sim.vehicles.length : 0;

            // Flow: vehicles passing a point per minute? 
            // Approximation: Density * Speed
            // density = N / L
            // Flow = density * speed * 60
            const density = sim.vehicles.length / sim.road.circumference; // veh/m
            const flow = density * avgSpeed * 60; // veh/min

            // Jam Factor: % of vehicles with v < 5km/h?
            // Let's say v < 2 m/s
            const jammed = sim.vehicles.filter(v => v.velocity < 2).length;
            const jamFactor = sim.vehicles.length > 0 ? jammed / sim.vehicles.length : 0;

            const stats = {
                avgSpeed: avgSpeed * 3.6, // m/s to km/h
                flow: flow,
                jamFactor: jamFactor
            };

            updateStats(stats);
            graph.addValue(stats.avgSpeed); // Graph shows speed
            lastStatsTime = timestamp;

            // Update Details Panel
            if (renderer.camera.mode === 'follow' && renderer.camera.targetId !== null) {
                const target = sim.vehicles.find(v => v.id === renderer.camera.targetId);
                if (target) {
                    const panel = document.getElementById('details-panel');
                    panel.style.display = 'block';
                    document.getElementById('detail-id').textContent = '#' + target.id;
                    document.getElementById('detail-type').textContent = target.type.toUpperCase();
                    document.getElementById('detail-speed').textContent = (target.velocity * 3.6).toFixed(1) + ' km/h';
                    document.getElementById('detail-accel').textContent = target.acceleration.toFixed(2) + ' m/s²';

                    // Simple headway calc (distance to next car)
                    // We don't store it on vehicle, but we can compute or access from stored state if we refactor simulation.js
                    // For now, let's just leave it or remove it.
                    // Or precise calculation:
                    // Find lead vehicle
                    // We don't have easy access to lead vehicle here without sorting again.
                    // Remove headway for now to save perf/complexity in UI update.
                    document.getElementById('detail-headway').textContent = '--';
                }
            } else {
                document.getElementById('details-panel').style.display = 'none';
            }
        }

        // Render Graph (on different canvas? or overlay?)
        // We have a separate canvas for graph in UI
        // Graph.render() might be expensive to do every frame if canvas is small vs updating data
        // But 60fps is fine for small canvas
        // Wait, graph.js implementation clears its own canvas.
        // We need to pass the graph canvas ID to Graph constructor.
        // The HTML has `id="graph-canvas"`

        // Actually Graph.render() is driven by its internal loop or called here?
        // Graph.js has a render method. Let's call it.
        // If we only add value every 200ms, we only need to render then? 
        // Or render every frame for smooth scroll? 
        // My graph impl is simple static line from data.
        if (timestamp - lastStatsTime < 20) { // Render when we update stats
            graph.render();
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
});
