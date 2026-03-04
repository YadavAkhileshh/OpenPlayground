       // DOM Elements
        const canvas = document.getElementById('constellationCanvas');
        const ctx = canvas.getContext('2d');
        const canvasOverlay = document.getElementById('canvasOverlay');
        const starsBg = document.getElementById('starsBg');
        
        // Control elements
        const addStarBtn = document.getElementById('addStarBtn');
        const connectBtn = document.getElementById('connectBtn');
        const moveBtn = document.getElementById('moveBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const colorOptions = document.querySelectorAll('.color-option');
        const starSizeSlider = document.getElementById('starSizeSlider');
        const starSizeValue = document.getElementById('starSizeValue');
        const solidLineBtn = document.getElementById('solidLineBtn');
        const dashedLineBtn = document.getElementById('dashedLineBtn');
        const glowLineBtn = document.getElementById('glowLineBtn');
        const saveBtn = document.getElementById('saveBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const constellationNameInput = document.getElementById('constellationNameInput');
        const constellationList = document.getElementById('constellationList');
        const constellationCount = document.getElementById('constellationCount');
        
        // Modal elements
        const saveModal = document.getElementById('saveModal');
        const saveMessage = document.getElementById('saveMessage');
        const modalOkBtn = document.getElementById('modalOkBtn');
        const modalShareBtn = document.getElementById('modalShareBtn');
