/**
 * Geometry.js
 * Helpers for drawing geometric primitives like axes and grids.
 */

import { Vector3 } from '../math/Vector3.js';
import { Projection } from './Projection.js';

export class Geometry {
    constructor() {
        this.axisLength = 50;
    }

    /**
     * Draws 3D axes at the origin.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     * @param {number} width 
     * @param {number} height 
     */
    drawAxes(ctx, camera, width, height) {
        const origin = new Vector3(0, 0, 0);
        const xEst = new Vector3(this.axisLength, 0, 0);
        const yEst = new Vector3(0, this.axisLength, 0);
        const zEst = new Vector3(0, 0, this.axisLength);

        const pOrigin = Projection.project(origin, camera, width, height, 1.0);

        // If origin is behind camera, we might simple act weird, but usually axes are centered.
        if (!pOrigin) return;

        const pX = Projection.project(xEst, camera, width, height, 1.0);
        const pY = Projection.project(yEst, camera, width, height, 1.0);
        const pZ = Projection.project(zEst, camera, width, height, 1.0);

        ctx.lineWidth = 2;

        // X Axis - Red
        if (pX) {
            ctx.beginPath();
            ctx.moveTo(pOrigin.x, pOrigin.y);
            ctx.lineTo(pX.x, pX.y);
            ctx.strokeStyle = '#ff3333';
            ctx.stroke();
            this.drawLabel(ctx, 'X', pX);
        }

        // Y Axis - Green
        if (pY) {
            ctx.beginPath();
            ctx.moveTo(pOrigin.x, pOrigin.y);
            ctx.lineTo(pY.x, pY.y);
            ctx.strokeStyle = '#33ff33';
            ctx.stroke();
            this.drawLabel(ctx, 'Y', pY);
        }

        // Z Axis - Blue
        if (pZ) {
            ctx.beginPath();
            ctx.moveTo(pOrigin.x, pOrigin.y);
            ctx.lineTo(pZ.x, pZ.y);
            ctx.strokeStyle = '#3333ff';
            ctx.stroke();
            this.drawLabel(ctx, 'Z', pZ);
        }
    }

    drawLabel(ctx, text, pos) {
        ctx.fillStyle = '#fff';
        ctx.font = '12px Space Mono';
        ctx.fillText(text, pos.x + 5, pos.y + 5);
    }
}
