    (function() {
        // ---------- Fenwick tree state (1‑based, size 8) ----------
        const SIZE = 8;
        // original array values (1‑based, index 1..8)
        let A = [0, 3, 2, 7, 1, 8, 4, 5, 6]; // A[1]=3, A[2]=2, A[3]=7, A[4]=1, A[5]=8, A[6]=4, A[7]=5, A[8]=6
        
        // build BIT from A
        let BIT = new Array(SIZE + 1).fill(0);
        
        // build initially
        function buildBIT() {
            BIT.fill(0);
            for (let i = 1; i <= SIZE; i++) {
                _updateBIT(i, A[i]);
            }
        }
        
        // internal point update (delta)
        function _updateBIT(idx, delta) {
            while (idx <= SIZE) {
                BIT[idx] += delta;
                idx += idx & -idx;
            }
        }
        
        // public update
        function pointUpdate(index, delta) {
            if (index < 1 || index > SIZE) return;
            A[index] += delta;               // update original array
            _updateBIT(index, delta);        // propagate to BIT
            renderArray();
            renderTree();
        }
        
        // prefix sum 1..r
        function prefixSum(r) {
            let sum = 0;
            while (r > 0) {
                sum += BIT[r];
                r -= r & -r;
            }
            return sum;
        }
        
        // initial build
        buildBIT();

        // ---------- DOM elements ----------
        const arrayContainer = document.getElementById('arrayContainer');
        const treeSvg = document.getElementById('treeSvg');
        const updateIdx = document.getElementById('updateIdx');
        const updateDelta = document.getElementById('updateDelta');
        const applyUpdate = document.getElementById('applyUpdate');
        const queryIdx = document.getElementById('queryIdx');
        const runQuery = document.getElementById('runQuery');
        const queryResultSpan = document.getElementById('queryResult');
        const resetBtn = document.getElementById('resetBtn');

        // render array boxes
        function renderArray() {
            let html = '';
            for (let i = 1; i <= SIZE; i++) {
                html += `<div class="array-cell"><span class="idx">${i}</span><span class="val">${A[i]}</span></div>`;
            }
            arrayContainer.innerHTML = html;
        }

        // draw BIT tree with nodes (1..8)
        function renderTree() {
            // fixed positions for nodes (x, y) – nice layout
            const coords = {
                1: { x: 70, y: 250 },
                2: { x: 170, y: 200 },
                3: { x: 270, y: 250 },
                4: { x: 370, y: 120 },
                5: { x: 470, y: 250 },
                6: { x: 570, y: 200 },
                7: { x: 670, y: 250 },
                8: { x: 200, y: 40 }   // top node
            };

            // children lines (based on BIT update chain: i -> i + lowbit)
            // we draw edges from node to its "parent" (i+lowbit) – nicer visualization.
            // typical BIT visualization: each i is responsible to i+lowbit
            let edges = [];
            for (let i = 1; i <= SIZE; i++) {
                let parent = i + (i & -i);
                if (parent <= SIZE) {
                    edges.push({ from: i, to: parent });
                }
            }

            // start SVG content
            let svgContent = '';

            // draw edges (grey lines)
            edges.forEach(edge => {
                const from = coords[edge.from];
                const to = coords[edge.to];
                svgContent += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#2a4f70" stroke-width="3" stroke-dasharray="6 6" opacity="0.7" />`;
            });

            // draw nodes (circles + text)
            for (let i = 1; i <= SIZE; i++) {
                const c = coords[i];
                // main circle
                svgContent += `<circle cx="${c.x}" cy="${c.y}" r="34" fill="#102433" stroke="#2f76b5" stroke-width="3" filter="url(#glow)" />`;
                // index label
                svgContent += `<text x="${c.x}" y="${c.y - 6}" text-anchor="middle" fill="#80b5dc" font-size="14" font-weight="500">BIT[${i}]</text>`;
                // value label
                svgContent += `<text x="${c.x}" y="${c.y + 18}" text-anchor="middle" fill="#b2f0c0" font-size="20" font-weight="700" font-family="monospace">${BIT[i]}</text>`;
            }

            // filter definition for subtle glow
            svgContent += `<defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="4"/><feMerge><feMergeNode in="offsetblur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>`;

            treeSvg.innerHTML = svgContent;
        }

        // update query result display
        function updateQueryDisplay() {
            let r = parseInt(queryIdx.value, 10);
            if (isNaN(r) || r < 0) r = 0;
            if (r > SIZE) r = SIZE;
            const res = prefixSum(r);
            queryResultSpan.innerText = res;
        }

        // event: apply point update
        applyUpdate.addEventListener('click', () => {
            const idx = parseInt(updateIdx.value, 10);
            const delta = parseInt(updateDelta.value, 10);
            if (isNaN(idx) || idx < 1 || idx > SIZE) {
                alert('index must be between 1 and 8');
                return;
            }
            if (isNaN(delta)) {
                alert('delta must be a number');
                return;
            }
            pointUpdate(idx, delta);
            updateQueryDisplay();  // query result may change because prefix sum changed
        });

        // event: run query
        runQuery.addEventListener('click', () => {
            updateQueryDisplay();
        });

        // reset to initial values
        resetBtn.addEventListener('click', () => {
            // reinit A
            A = [0, 3, 2, 7, 1, 8, 4, 5, 6];
            buildBIT();
            renderArray();
            renderTree();
            updateQueryDisplay();
            // reset inputs to defaults
            updateIdx.value = 3;
            updateDelta.value = 2;
            queryIdx.value = 5;
        });

        // initial render
        renderArray();
        renderTree();
        updateQueryDisplay();

        // also update query when input changes (optional)
        queryIdx.addEventListener('input', updateQueryDisplay);

        // helper to sync after manual update
        function syncAll() {
            renderTree();
            renderArray();
        }

        // extra: if you want to see tree on update
        window.pointUpdate = pointUpdate; // debug

        // ensure everything updates on any change via pointUpdate already calls render.
        // but we also call in reset.
    })();