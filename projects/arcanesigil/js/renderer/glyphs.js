/* js/renderer/glyphs.js */

/**
 * Renders primitive magitech arcane shapes based on token/node type.
 */
class Glyphs {
    static drawGlyph(ctx, x, y, size, type, color, rotation = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        // Subtle glow
        ctx.shadowColor = color;
        ctx.shadowBlur = CONFIG.RENDERER.NODE_GLOW_BLUR;

        switch (type) {
            case 'BlockStatement':
            case 'Program':
                this.drawOuterCircleIndicator(ctx, size);
                break;
            case 'IfStatement':
                this.drawTriangle(ctx, size);
                break;
            case 'ForStatement':
            case 'WhileStatement':
                this.drawPentagram(ctx, size);
                break;
            case 'BinaryExpression':
            case 'LogicalExpression':
                this.drawCrossedStar(ctx, size);
                break;
            case 'FunctionDeclaration':
            case 'CallExpression':
                this.drawEye(ctx, size);
                break;
            case 'LetStatement':
            case 'AssignmentExpression':
                this.drawDiamond(ctx, size);
                break;
            case 'Identifier':
            case 'Literal':
                this.drawDotOrSmallSquare(ctx, size);
                break;
            default:
                this.drawHexagon(ctx, size);
                break;
        }

        ctx.restore();
    }

    static drawTriangle(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
            ctx.lineTo(size * Math.cos(angle), size * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
    }

    static drawPentagram(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            ctx.lineTo(size * Math.cos(angle), size * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
    }

    static drawCrossedStar(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(-size, 0); ctx.lineTo(size, 0);
        ctx.moveTo(0, -size); ctx.lineTo(0, size);
        const diag = size * 0.7;
        ctx.moveTo(-diag, -diag); ctx.lineTo(diag, diag);
        ctx.moveTo(-diag, diag); ctx.lineTo(diag, -diag);
        ctx.stroke();
    }

    static drawEye(ctx, size) {
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.stroke();
    }

    static drawDiamond(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.moveTo(size, 0);
        ctx.lineTo(0, size);
        ctx.moveTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.moveTo(-size, 0);
        ctx.lineTo(0, -size);
        ctx.stroke();
    }

    static drawHexagon(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            ctx.lineTo(size * Math.cos(angle), size * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
    }

    static drawDotOrSmallSquare(ctx, size) {
        const s = size * 0.5;
        ctx.beginPath();
        ctx.rect(-s / 2, -s / 2, s, s);
        ctx.stroke();
    }

    static drawOuterCircleIndicator(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.2, 0, Math.PI * 2);
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

window.Glyphs = Glyphs;
