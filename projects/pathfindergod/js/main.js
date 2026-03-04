import { Grid } from './core/grid.js';
import { Renderer } from './view/renderer.js';
import { InputHandler } from './core/events.js';
import { AudioEngine } from './core/audio.js';
import { dijkstra, getNodesInShortestPathOrder as getDijkstraPath } from './algorithms/dijkstra.js';
import { astar, getNodesInShortestPathOrder as getAstarPath } from './algorithms/astar.js';
import { bfs, getNodesInShortestPathOrder as getBFSPath } from './algorithms/bfs.js';
import { dfs, getNodesInShortestPathOrder as getDFSPath } from './algorithms/dfs.js';
import { recursiveDivisionMaze } from './algorithms/maze/recursiveDivision.js';

// Configuration
const GRID_ROWS = 50;
const GRID_COLS = 100;

class App {
    constructor() {
        this.canvas = document.getElementById('grid-canvas');
        this.audio = new AudioEngine();
        this.grid = new Grid(50, 100);
        this.renderer = new Renderer(this.canvas, this.grid, this.audio);
        this.inputHandler = new InputHandler(this.canvas, this.grid, this.renderer);

        this.isAnimating = false;
        this.speed = 50;

        this.initialize();
        this.bindEvents();
    }

    initialize() {
        this.grid.setStartNode(25, 10);
        this.grid.setEndNode(25, 90);
        this.renderer.drawGrid();
    }

    bindEvents() {
        document.getElementById('btn-visualize').addEventListener('click', () => this.visualize());
        document.getElementById('btn-clear').addEventListener('click', () => this.clearBoard());
        document.getElementById('btn-clear-path').addEventListener('click', () => this.clearPath());
        document.getElementById('btn-maze').addEventListener('click', () => {
            recursiveDivisionMaze(this.grid, this.grid.startNode, this.grid.endNode);
            this.renderer.drawGrid();
        });

        document.getElementById('btn-save').addEventListener('click', () => this.saveMap());
        document.getElementById('btn-load').addEventListener('click', () => this.loadMap());

        document.getElementById('diagonal-toggle').addEventListener('change', () => this.clearPath());
        document.getElementById('sound-toggle').addEventListener('change', (e) => this.audio.toggle(e.target.checked));

        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
        });
    }

    visualize() {
        if (this.isAnimating) return;

        this.clearPath(false);
        this.audio.playStart();

        const algorithm = document.getElementById('algorithm-select').value;
        const allowDiagonal = document.getElementById('diagonal-toggle').checked;
        const startNode = this.grid.startNode;
        const endNode = this.grid.endNode;

        let visitedNodes = [];
        let finalPath = [];

        this.isAnimating = true;
        this.disableControls(true);

        const startTime = performance.now();

        if (algorithm === 'dijkstra') {
            visitedNodes = dijkstra(this.grid, startNode, endNode);
            finalPath = getDijkstraPath(endNode);
        } else if (algorithm === 'astar') {
            visitedNodes = astar(this.grid, startNode, endNode);
            finalPath = getAstarPath(endNode);
        } else if (algorithm === 'bfs') {
            visitedNodes = bfs(this.grid, startNode, endNode, allowDiagonal);
            finalPath = getBFSPath(endNode);
        } else if (algorithm === 'dfs') {
            visitedNodes = dfs(this.grid, startNode, endNode, allowDiagonal);
            finalPath = getDFSPath(endNode);
        }

        const endTime = performance.now();
        const timeTaken = (endTime - startTime).toFixed(2);

        this.updateStats(visitedNodes.length, finalPath.length, timeTaken);

        this.renderer.animatePath(visitedNodes, finalPath, this.speed, () => {
            this.isAnimating = false;
            this.disableControls(false);
            if (finalPath.length > 0) this.audio.playSuccess();
            else this.audio.playFail();
        });
    }

    clearBoard() {
        if (this.isAnimating) return;
        this.grid.clearBoard();
        this.grid.setStartNode(25, 10);
        this.grid.setEndNode(25, 90);
        this.renderer.drawGrid();
        this.resetStats();
    }

    clearPath(redraw = true) {
        if (this.isAnimating) return;
        this.grid.resetPath();
        if (redraw) this.renderer.drawGrid();
        this.resetStats();
    }

    saveMap() {
        const mapData = this.grid.nodes.map(row => row.map(node => ({
            row: node.row, col: node.col,
            isWall: node.isWall, weight: node.weight,
            isStart: node.isStart, isEnd: node.isEnd
        })));
        localStorage.setItem('pathfinderMap', JSON.stringify(mapData));
        alert('Map Saved!');
    }

    loadMap() {
        const data = localStorage.getItem('pathfinderMap');
        if (!data) return alert('No saved map found!');

        const mapData = JSON.parse(data);
        // Basic validation/loading
        this.grid.nodes.forEach((row, r) => {
            row.forEach((node, c) => {
                const saved = mapData[r][c];
                node.isWall = saved.isWall;
                node.weight = saved.weight;
                if (saved.isStart) this.grid.setStartNode(r, c);
                if (saved.isEnd) this.grid.setEndNode(r, c);
            });
        });
        this.renderer.drawGrid();
    }

    disableControls(disabled) {
        document.getElementById('btn-visualize').disabled = disabled;
        document.getElementById('btn-clear').disabled = disabled;
        document.getElementById('btn-clear-path').disabled = disabled;
        document.getElementById('btn-maze').disabled = disabled;
        document.getElementById('algorithm-select').disabled = disabled;
    }

    updateStats(visited, length, time) {
        document.getElementById('stat-visited').textContent = visited;
        document.getElementById('stat-length').textContent = length;
        document.getElementById('stat-time').textContent = time + 'ms';
    }

    resetStats() {
        this.updateStats(0, 0, 0);
    }
}

// Start application
window.onload = () => {
    const app = new App();
};
