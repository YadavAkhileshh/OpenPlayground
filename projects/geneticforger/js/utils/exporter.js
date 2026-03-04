import { Genome } from '../engine/genome.js';

/**
 * Utility to export the genome as an SVG string.
 * Allows users to save their evolved art as scalable vector graphics.
 */
export class SVGExporter {
    /**
     * Converts a genome to an SVG string.
     * Iterates through all polygons and creates SVG polygon elements.
     * 
     * @param {Genome} genome - The genome to export.
     * @param {number} width - Width of the output SVG.
     * @param {number} height - Height of the output SVG.
     * @returns {string} The SVG markup.
     */
    static export(genome, width, height) {
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;

        // Background rect (optional, mimicking canvas background)
        svg += `  <rect width="100%" height="100%" fill="#000" />\n`;

        for (const poly of genome.polygons) {
            const points = poly.vertices.map(v => `${v.x * width},${v.y * height}`).join(' ');
            const color = `rgb(${poly.color.r},${poly.color.g},${poly.color.b})`;

            // SVG uses 0-1 opacity, our alpha is 0-1
            svg += `  <polygon points="${points}" fill="${color}" fill-opacity="${poly.color.a.toFixed(3)}" />\n`;
        }

        svg += '</svg>';
        return svg;
    }

    /**
     * Triggers a browser download of the SVG file.
     * Creates a temporary blob and anchor tag to initiate download.
     * 
     * @param {Genome} genome - The genome to export.
     */
    static download(genome) {
        const svgContent = this.export(genome, 800, 800);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `genetic-forger-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
