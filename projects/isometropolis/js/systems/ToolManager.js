import { Vector2 } from '../math/Vector2.js';

/**
 * Handles interactions like Dragging Zones, Placing Roads, Bulldozing.
 */
export class ToolManager {
    /**
     * @param {CityMap} map
     * @param {IsometricMath} isoMath
     * @param {Camera} camera
     * @param {EconomySystem} economy
     * @param {ZoningSystem} zoning
     * @param {PowerGrid} powerGrid
     * @param {EventEmitter} events
     */
    constructor(map, isoMath, camera, economy, zoning, powerGrid, events) {
        this.map = map;
        this.isoMath = isoMath;
        this.camera = camera;
        this.economy = economy;
        this.zoning = zoning;
        this.powerGrid = powerGrid;
        this.events = events;

        this.activeTool = 'select';

        this.dragStartNode = null;
        this.dragCurrentNode = null;
        this.isDragging = false;
        this.hoveredNode = null;

        // Costs
        this.COST_ROAD = 10;
        this.COST_BULLDOZE = 2;
        this.COST_POWER_LINE = 5;
        this.COST_POWER_PLANT = 2500;

        this.events.on('input:pointerDown', (d) => this.onPointerDown(d));
        this.events.on('input:pointerDrag', (d) => this.onPointerDrag(d));
        this.events.on('input:pointerUp', (d) => this.onPointerUp(d));
        this.events.on('input:pointerMove', (d) => this.onPointerMove(d));
    }

    setTool(toolName) {
        this.activeTool = toolName;
        this.isDragging = false;
        this.dragStartNode = null;
    }

    _getGridPos(screenPos) {
        const worldPos = this.camera.screenToWorld(screenPos.x, screenPos.y);
        return this.isoMath.screenToGrid(worldPos.x, worldPos.y);
    }

    onPointerMove(data) {
        this.hoveredNode = this._getGridPos(data.pos);
        this.events.emit('ui:hoverInfo', this.hoveredNode);
    }

    onPointerDown(data) {
        const gridPos = this._getGridPos(data.pos);
        if (!this.map.isValid(gridPos.x, gridPos.y)) return;

        this.isDragging = true;
        this.dragStartNode = gridPos.clone();
        this.dragCurrentNode = gridPos.clone();

        // Single click actions
        if (this.activeTool === 'select') {
            this.events.emit('ui:selectTile', this.map.getTile(gridPos.x, gridPos.y));
        } else if (this.activeTool === 'power') {
            // Let's assume holding SHIFT builds plant, otherwise line
            if (data.originalEvent.shiftKey) {
                if (this.economy.spend(this.COST_POWER_PLANT)) {
                    const t = this.map.getTile(gridPos.x, gridPos.y);
                    if (t && t.type === 'empty') {
                        t.setPowerPlant();
                        this.powerGrid.recalculate();
                    } else {
                        this.economy.spend(-this.COST_POWER_PLANT); // Refund
                    }
                }
            } else {
                if (this.economy.spend(this.COST_POWER_LINE)) {
                    if (!this.powerGrid.placePowerLine(gridPos.x, gridPos.y)) {
                        this.economy.spend(-this.COST_POWER_LINE);
                    }
                }
            }
        }
    }

    onPointerDrag(data) {
        if (!this.isDragging) return;
        this.dragCurrentNode = this._getGridPos(data.pos);
        this.hoveredNode = this.dragCurrentNode;
        this.events.emit('ui:hoverInfo', this.hoveredNode);
    }

    onPointerUp(data) {
        if (!this.isDragging) return;
        this.isDragging = false;

        const endNode = this._getGridPos(data.pos);

        if (this.activeTool.startsWith('zone-')) {
            const type = this.activeTool.split('-')[1]; // residential, commercial, industrial
            this._applyZoning(this.dragStartNode, endNode, type);
        } else if (this.activeTool === 'road') {
            this._applyRoads(this.dragStartNode, endNode);
        } else if (this.activeTool === 'bulldoze') {
            this._applyBulldoze(this.dragStartNode, endNode);
        }
    }

    _applyZoning(start, end, type) {
        const x1 = Math.min(start.x, end.x);
        const x2 = Math.max(start.x, end.x);
        const y1 = Math.min(start.y, end.y);
        const y2 = Math.max(start.y, end.y);

        let cost = 0;
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                cost += 10;
            }
        }

        if (this.economy.spend(cost)) {
            const actualCost = this.zoning.zoneArea(x1, y1, x2, y2, type);
            // Refund unzoned tiles difference if needed
            if (actualCost < cost) {
                this.economy.spend(-(cost - actualCost));
            }
        }
    }

    _applyRoads(start, end) {
        // Find L-shape or straight line. We choose horizontal then vertical
        let x1 = start.x, y1 = start.y;
        const x2 = end.x, y2 = end.y;

        const path = [];
        const dx = Math.sign(x2 - x1);
        const dy = Math.sign(y2 - y1);

        while (x1 !== x2) { path.push({ x: x1, y: y1 }); x1 += dx; }
        while (y1 !== y2) { path.push({ x: x1, y: y1 }); y1 += dy; }
        path.push({ x: x2, y: y2 });

        const totalCost = path.length * this.COST_ROAD;

        if (this.economy.spend(totalCost)) {
            let placed = 0;
            for (const p of path) {
                const t = this.map.getTile(p.x, p.y);
                if (t && t.type !== 'power_plant' && t.type !== 'building') {
                    if (t.type !== 'road') {
                        t.setRoad();
                        placed++;
                        this.map.updateRoadNetworkAround(p.x, p.y);
                    }
                }
            }
            if (placed > 0) this.powerGrid.recalculate(); // Roads carry power

            // Refund unplaced
            if (placed < path.length) {
                this.economy.spend(-((path.length - placed) * this.COST_ROAD));
            }
        }
    }

    _applyBulldoze(start, end) {
        const x1 = Math.min(start.x, end.x);
        const x2 = Math.max(start.x, end.x);
        const y1 = Math.min(start.y, end.y);
        const y2 = Math.max(start.y, end.y);

        let cost = 0;
        let powerChanged = false;

        // Count first
        let targets = 0;
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                if (this.map.getTile(x, y)?.type !== 'empty' || this.map.getTile(x, y)?.zoning !== 'none') targets++;
            }
        }

        if (this.economy.spend(targets * this.COST_BULLDOZE)) {
            for (let x = x1; x <= x2; x++) {
                for (let y = y1; y <= y2; y++) {
                    const r = this.zoning.bulldoze(x, y);
                    if (r && r.demolishedPower) powerChanged = true;
                }
            }
            if (powerChanged) this.powerGrid.recalculate();
        }
    }
}
