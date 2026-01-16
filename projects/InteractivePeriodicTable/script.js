// Interactive Periodic Table - Main Application Logic
// Elements and Details are now loaded from data.js

document.addEventListener('DOMContentLoaded', function () {
        // DOM Elements
        const tableContainer = document.getElementById('tableContainer');
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const resultCount = document.getElementById('resultCount');
        const elementModal = document.getElementById('elementModal');
        const closeModal = document.getElementById('closeModal');
        const prevElementBtn = document.getElementById('prevElement');
        const nextElementBtn = document.getElementById('nextElement');

        // State
        let currentFilter = 'all';
        let currentSearch = '';
        let currentElementIndex = 0;

        // Ensure elements exists
        if (typeof elements === 'undefined') {
                console.error('Elements data not loaded! Make sure data.js is included before script.js');
                return;
        }

        let filteredElements = [...elements];

        // Initialize
        generatePeriodicTable();
        updateResultCount();
        setupEventListeners();

        // Generate Periodic Table Grid
        function generatePeriodicTable() {
                const tableGrid = document.createElement('div');
                tableGrid.className = 'table-grid';

                // Create empty cells for the periodic table structure
                // This creates a 10x18 grid representing the periodic table layout
                for (let row = 0; row < 10; row++) {
                        for (let col = 0; col < 18; col++) {
                                const cell = document.createElement('div');
                                cell.className = 'element-cell empty';
                                cell.style.gridColumn = col + 1;
                                cell.style.gridRow = row + 1;

                                // Add element if it exists in this position
                                const element = findElementAtPosition(row, col);
                                if (element) {
                                        cell.className = `element-cell ${element.category}`;
                                        cell.innerHTML = `
                        <div class="atomic-number">${element.number}</div>
                        <div class="element-symbol">${element.symbol}</div>
                        <div class="element-name">${element.name}</div>
                    `;
                                        cell.dataset.number = element.number;
                                        cell.addEventListener('click', () => openElementModal(element.number));
                                }

                                tableGrid.appendChild(cell);
                        }
                }

                tableContainer.innerHTML = '';
                tableContainer.appendChild(tableGrid);
        }

        function findElementAtPosition(row, col) {
                // Source data uses 1-based indexing for xpos/ypos
                const targetX = col + 1;
                const targetY = row + 1;
                return elements.find(e => e.xpos === targetX && e.ypos === targetY);
        }

        function setupEventListeners() {
                // Search functionality
                searchInput.addEventListener('input', handleSearch);
                clearSearch.addEventListener('click', clearSearchInput);

                // Filter buttons
                filterButtons.forEach(button => {
                        button.addEventListener('click', () => {
                                const category = button.dataset.category;
                                setActiveFilter(category);
                                filterElements();
                        });
                });

                // Modal controls
                closeModal.addEventListener('click', closeElementModal);
                prevElementBtn.addEventListener('click', showPreviousElement);
                nextElementBtn.addEventListener('click', showNextElement);

                // Close modal on outside click
                elementModal.addEventListener('click', (e) => {
                        if (e.target === elementModal) {
                                closeElementModal();
                        }
                });

                // Close modal on Escape key
                document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') {
                                closeElementModal();
                        }
                });

                // Legend click to filter
                document.querySelectorAll('.legend-item').forEach(item => {
                        item.addEventListener('click', () => {
                                const category = item.dataset.category;
                                setActiveFilter(category);
                                filterElements();
                        });
                });
        }

        // Search Handling
        function handleSearch(e) {
                currentSearch = e.target.value.toLowerCase().trim();
                filterElements();

                // Show/hide clear button
                clearSearch.style.display = currentSearch ? 'block' : 'none';
        }

        function clearSearchInput() {
                searchInput.value = '';
                currentSearch = '';
                filterElements();
                clearSearch.style.display = 'none';
                searchInput.focus();
        }

        // Filter Elements
        function filterElements() {
                // Note: This logic only highlights elements in the grid, it doesn't remove cells
                // because the grid layout is fixed.
                const tableCells = document.querySelectorAll('.element-cell:not(.empty)');

                filteredElements = elements.filter(element => {
                        // Apply search filter
                        const matchesSearch = !currentSearch ||
                                element.name.toLowerCase().includes(currentSearch) ||
                                element.symbol.toLowerCase().includes(currentSearch) ||
                                element.number.toString().includes(currentSearch);

                        // Apply category filter
                        const matchesCategory = currentFilter === 'all' || element.category === currentFilter;

                        return matchesSearch && matchesCategory;
                });

                // Highlight matching elements
                tableCells.forEach(cell => {
                        const elementNumber = parseInt(cell.dataset.number);
                        const element = elements.find(e => e.number === elementNumber);

                        if (element && filteredElements.includes(element)) {
                                cell.style.opacity = '1';
                                cell.style.pointerEvents = 'auto'; // Enable interaction
                                cell.style.filter = 'none';
                        } else {
                                cell.style.opacity = '0.1'; // Make non-matching faint
                                cell.style.pointerEvents = 'none'; // Disable interaction
                                cell.style.filter = 'grayscale(100%)';
                        }
                });

                updateResultCount();
        }

        function setActiveFilter(category) {
                filterButtons.forEach(button => {
                        button.classList.remove('active');
                        if (button.dataset.category === category) {
                                button.classList.add('active');
                        }
                });
                currentFilter = category;
        }

        function updateResultCount() {
                const count = filteredElements.length;
                resultCount.textContent = `${count} element${count !== 1 ? 's' : ''} shown`;
        }

        // Modal Functions
        function openElementModal(elementNumber) {
                const element = elements.find(e => e.number === elementNumber);
                if (!element) return;

                // Update index for next/prev
                currentElementIndex = filteredElements.findIndex(e => e.number === elementNumber);
                if (currentElementIndex === -1) {
                        // If opened element is not in filtered list (rare but possible via url param?)
                        // Just default to index 0 or something safe 
                        currentElementIndex = 0;
                }

                // Update modal content
                document.getElementById('modalTitle').textContent = `Element: ${element.name}`;

                // Safety check for elements
                const nameEl = document.getElementById('modalElementName');
                if (nameEl) nameEl.textContent = element.name;

                const symbolEl = document.getElementById('modalSymbol');
                if (symbolEl) symbolEl.textContent = element.symbol;

                const numberEl = document.getElementById('modalAtomicNumber');
                if (numberEl) numberEl.textContent = element.number;

                // Set category and color
                const categoryNames = {
                        alkali: "Alkali Metal",
                        alkaline: "Alkaline Earth Metal",
                        transition: "Transition Metal",
                        basic: "Basic Metal",
                        metalloid: "Metalloid",
                        nonmetal: "Nonmetal",
                        halogen: "Halogen",
                        noble: "Noble Gas",
                        lanthanide: "Lanthanide",
                        actinide: "Actinide"
                };

                const categoryTag = document.getElementById('modalCategory');
                if (categoryTag) {
                        categoryTag.textContent = categoryNames[element.category] || element.category;
                        categoryTag.className = `element-category-tag ${element.category}`;
                }

                // Set modal symbol color
                if (symbolEl) symbolEl.className = `element-symbol-large ${element.category}`;

                // Update properties
                const massEl = document.getElementById('modalAtomicMass');
                if (massEl) massEl.textContent = `${element.mass} u`;

                const configEl = document.getElementById('modalElectronConfig');
                if (configEl) configEl.textContent = element.config;

                // Get detailed data
                // elementDetails is global from data.js
                const details = (typeof elementDetails !== 'undefined' && elementDetails[element.number])
                        ? elementDetails[element.number]
                        : getDefaultDetails(element);

                const setDetail = (id, value) => {
                        const el = document.getElementById(id);
                        if (el) el.textContent = value || "N/A";
                };

                setDetail('modalDensity', details.density);
                setDetail('modalMeltingPoint', details.melting);
                setDetail('modalBoilingPoint', details.boiling);
                setDetail('modalPhase', details.phase);
                setDetail('modalElectronegativity', element.electronegativity);
                setDetail('modalAtomicRadius', details.radius);
                setDetail('modalElectronAffinity', details.affinity);
                setDetail('modalIonization', details.ionization);
                setDetail('modalOxidationStates', details.oxidation);
                setDetail('modalCrystal', details.crystal);
                setDetail('modalHistory', details.history);
                setDetail('modalUses', details.uses);

                // Show modal
                elementModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
        }

        function getDefaultDetails(element) {
                return {
                        density: "Data not available",
                        melting: "Data not available",
                        boiling: "Data not available",
                        phase: "Unknown",
                        radius: "Data not available",
                        affinity: "Data not available",
                        ionization: "Data not available",
                        oxidation: "Data not available",
                        crystal: "Unknown",
                        history: `No detailed history available for ${element.name}. This element is part of the periodic table of chemical elements.`,
                        uses: `Common uses information for ${element.name} is not available in this demo database.`
                };
        }

        function closeElementModal() {
                elementModal.style.display = 'none';
                document.body.style.overflow = 'auto';
        }

        function showPreviousElement() {
                if (filteredElements.length === 0) return;

                currentElementIndex = (currentElementIndex - 1 + filteredElements.length) % filteredElements.length;
                openElementModal(filteredElements[currentElementIndex].number);
        }

        function showNextElement() {
                if (filteredElements.length === 0) return;

                currentElementIndex = (currentElementIndex + 1) % filteredElements.length;
                openElementModal(filteredElements[currentElementIndex].number);
        }

        // Initialize with Hydrogen selected (optional visual hint)
        setTimeout(() => {
                const firstElement = document.querySelector('.element-cell[data-number="1"]');
                if (firstElement) {
                        // firstElement.classList.add('active'); // No specific active class styling in css shown, avoiding.
                }
        }, 100);
});