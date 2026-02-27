/**
 * SDFGenerator.js – Top-level orchestrator for SDF construction.
 * Coordinates FontParser → GlyphRasterizer → BezierExtractor → DistanceField → SDFSampler.
 */

const SDFGenerator = (() => {
    'use strict';

    const {
        GlyphRasterizer, BezierExtractor, DistanceField,
        GlyphCache, SDFSampler, Config, EventBus, FontParser
    } = window.SDFChisel;

    let _currentData = null;

    /**
     * Build the SDF for the given text on the given canvas size.
     * Results are cached by (text, canvasW, canvasH).
     * @param {string} text
     * @param {number} canvasW
     * @param {number} canvasH
     * @returns {SDFData}
     */
    function build(text, canvasW, canvasH) {
        const key = GlyphCache.makeKey(text, canvasW, canvasH);
        if (GlyphCache.has(key)) {
            const cached = GlyphCache.get(key);
            SDFSampler.init(cached.sdf, cached.gridW, cached.gridH, canvasW, canvasH);
            _currentData = cached;
            EventBus.emit(EventBus.EVENTS.SDF_READY, cached);
            return cached;
        }

        EventBus.emit(EventBus.EVENTS.SDF_BUILD_START, { text });

        // Step 1: High-res rasterization
        const rasterResult = GlyphRasterizer.rasterizeAndBuild(text, canvasW, canvasH);
        const { grid, gridW, gridH } = rasterResult;

        // Step 2: Extract Bezier curves from edge pixels
        const edgePixels = FontParser.traceEdgePixels(grid, gridW, gridH);
        const beziers = BezierExtractor.extractBeziers(edgePixels, gridW, gridH);

        // Step 3: Compute EDT-based SDF
        let sdf = DistanceField.computeSDF(grid, gridW, gridH);

        // Step 4: Optional smoothing
        if (Config.SDF.SMOOTH_PASSES > 0) {
            sdf = DistanceField.smoothSDF(sdf, gridW, gridH, Config.SDF.SMOOTH_PASSES);
        }

        // Step 5: Compute range for normalization
        const range = DistanceField.sdfRange(sdf);

        // Build result object
        const data = {
            text,
            sdf,
            grid,
            gridW,
            gridH,
            beziers,
            edgePixels,
            canvasW,
            canvasH,
            cellSizeX: canvasW / gridW,
            cellSizeY: canvasH / gridH,
            range,
        };

        GlyphCache.set(key, data);
        SDFSampler.init(sdf, gridW, gridH, canvasW, canvasH);
        _currentData = data;

        EventBus.emit(EventBus.EVENTS.SDF_BUILD_END, {
            text,
            gridW,
            gridH,
            bezierCount: beziers.length,
            range,
        });
        EventBus.emit(EventBus.EVENTS.SDF_READY, data);

        return data;
    }

    /**
     * Re-build the SDF when the canvas is resized.
     */
    function rebuild(canvasW, canvasH) {
        if (!_currentData) return null;
        GlyphCache.clear();
        return build(_currentData.text, canvasW, canvasH);
    }

    /**
     * Get the currently active SDF data.
     */
    function getCurrent() {
        return _currentData;
    }

    /**
     * Clear all state.
     */
    function reset() {
        GlyphCache.clear();
        _currentData = null;
        SDFSampler.init(null, 0, 0, 0, 0);
    }

    return {
        build,
        rebuild,
        getCurrent,
        reset,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.SDFGenerator = SDFGenerator;
