document.addEventListener('DOMContentLoaded', function() {
    const elements = [
        // Period 1
        { number: 1, symbol: "H", name: "Hydrogen", category: "nonmetal", mass: 1.008, discovered: 1766 },
        { number: 2, symbol: "He", name: "Helium", category: "noble-gas", mass: 4.0026, discovered: 1868 },
        
        // Period 2
        { number: 3, symbol: "Li", name: "Lithium", category: "alkali-metal", mass: 6.94, discovered: 1817 },
        { number: 4, symbol: "Be", name: "Beryllium", category: "alkaline-earth", mass: 9.0122, discovered: 1798 },
        { number: 5, symbol: "B", name: "Boron", category: "semimetal", mass: 10.81, discovered: 1808 },
        { number: 6, symbol: "C", name: "Carbon", category: "nonmetal", mass: 12.011, discovered: "Ancient" },
        { number: 7, symbol: "N", name: "Nitrogen", category: "nonmetal", mass: 14.007, discovered: 1772 },
        { number: 8, symbol: "O", name: "Oxygen", category: "nonmetal", mass: 15.999, discovered: 1774 },
        { number: 9, symbol: "F", name: "Fluorine", category: "halogen", mass: 18.998, discovered: 1886 },
        { number: 10, symbol: "Ne", name: "Neon", category: "noble-gas", mass: 20.180, discovered: 1898 },
        
        // Period 3
        { number: 11, symbol: "Na", name: "Sodium", category: "alkali-metal", mass: 22.990, discovered: 1807 },
        { number: 12, symbol: "Mg", name: "Magnesium", category: "alkaline-earth", mass: 24.305, discovered: 1808 },
        { number: 13, symbol: "Al", name: "Aluminum", category: "basic-metal", mass: 26.982, discovered: 1825 },
        { number: 14, symbol: "Si", name: "Silicon", category: "semimetal", mass: 28.085, discovered: 1854 },
        { number: 15, symbol: "P", name: "Phosphorus", category: "nonmetal", mass: 30.974, discovered: 1669 },
        { number: 16, symbol: "S", name: "Sulfur", category: "nonmetal", mass: 32.06, discovered: "Ancient" },
        { number: 17, symbol: "Cl", name: "Chlorine", category: "halogen", mass: 35.45, discovered: 1774 },
        { number: 18, symbol: "Ar", name: "Argon", category: "noble-gas", mass: 39.948, discovered: 1894 },
        
        // Period 4
        { number: 19, symbol: "K", name: "Potassium", category: "alkali-metal", mass: 39.098, discovered: 1807 },
        { number: 20, symbol: "Ca", name: "Calcium", category: "alkaline-earth", mass: 40.078, discovered: 1808 },
        { number: 21, symbol: "Sc", name: "Scandium", category: "transition-metal", mass: 44.956, discovered: 1879 },
        { number: 22, symbol: "Ti", name: "Titanium", category: "transition-metal", mass: 47.867, discovered: 1791 },
        { number: 23, symbol: "V", name: "Vanadium", category: "transition-metal", mass: 50.942, discovered: 1801 },
        { number: 24, symbol: "Cr", name: "Chromium", category: "transition-metal", mass: 51.996, discovered: 1797 },
        { number: 25, symbol: "Mn", name: "Manganese", category: "transition-metal", mass: 54.938, discovered: 1774 },
        { number: 26, symbol: "Fe", name: "Iron", category: "transition-metal", mass: 55.845, discovered: "Ancient" },
        { number: 27, symbol: "Co", name: "Cobalt", category: "transition-metal", mass: 58.933, discovered: 1735 },
        { number: 28, symbol: "Ni", name: "Nickel", category: "transition-metal", mass: 58.693, discovered: 1751 },
        { number: 29, symbol: "Cu", name: "Copper", category: "transition-metal", mass: 63.546, discovered: "Ancient" },
        { number: 30, symbol: "Zn", name: "Zinc", category: "transition-metal", mass: 65.38, discovered: 1746 },
        { number: 31, symbol: "Ga", name: "Gallium", category: "basic-metal", mass: 69.723, discovered: 1875 },
        { number: 32, symbol: "Ge", name: "Germanium", category: "semimetal", mass: 72.630, discovered: 1886 },
        { number: 33, symbol: "As", name: "Arsenic", category: "semimetal", mass: 74.922, discovered: 1250 },
        { number: 34, symbol: "Se", name: "Selenium", category: "nonmetal", mass: 78.971, discovered: 1817 },
        { number: 35, symbol: "Br", name: "Bromine", category: "halogen", mass: 79.904, discovered: 1826 },
        { number: 36, symbol: "Kr", name: "Krypton", category: "noble-gas", mass: 83.798, discovered: 1898 },
        
        // Period 5
        { number: 37, symbol: "Rb", name: "Rubidium", category: "alkali-metal", mass: 85.468, discovered: 1861 },
        { number: 38, symbol: "Sr", name: "Strontium", category: "alkaline-earth", mass: 87.62, discovered: 1790 },
        { number: 39, symbol: "Y", name: "Yttrium", category: "transition-metal", mass: 88.906, discovered: 1794 },
        { number: 40, symbol: "Zr", name: "Zirconium", category: "transition-metal", mass: 91.224, discovered: 1789 },
        { number: 41, symbol: "Nb", name: "Niobium", category: "transition-metal", mass: 92.906, discovered: 1801 },
        { number: 42, symbol: "Mo", name: "Molybdenum", category: "transition-metal", mass: 95.95, discovered: 1778 },
        { number: 43, symbol: "Tc", name: "Technetium", category: "transition-metal", mass: 98, discovered: 1937 },
        { number: 44, symbol: "Ru", name: "Ruthenium", category: "transition-metal", mass: 101.07, discovered: 1844 },
        { number: 45, symbol: "Rh", name: "Rhodium", category: "transition-metal", mass: 102.91, discovered: 1803 },
        { number: 46, symbol: "Pd", name: "Palladium", category: "transition-metal", mass: 106.42, discovered: 1803 },
        { number: 47, symbol: "Ag", name: "Silver", category: "transition-metal", mass: 107.87, discovered: "Ancient" },
        { number: 48, symbol: "Cd", name: "Cadmium", category: "transition-metal", mass: 112.41, discovered: 1817 },
        { number: 49, symbol: "In", name: "Indium", category: "basic-metal", mass: 114.82, discovered: 1863 },
        { number: 50, symbol: "Sn", name: "Tin", category: "basic-metal", mass: 118.71, discovered: "Ancient" },
        { number: 51, symbol: "Sb", name: "Antimony", category: "semimetal", mass: 121.76, discovered: 1600 },
        { number: 52, symbol: "Te", name: "Tellurium", category: "semimetal", mass: 127.60, discovered: 1783 },
        { number: 53, symbol: "I", name: "Iodine", category: "halogen", mass: 126.90, discovered: 1811 },
        { number: 54, symbol: "Xe", name: "Xenon", category: "noble-gas", mass: 131.29, discovered: 1898 },
        
        // Period 6
        { number: 55, symbol: "Cs", name: "Cesium", category: "alkali-metal", mass: 132.91, discovered: 1860 },
        { number: 56, symbol: "Ba", name: "Barium", category: "alkaline-earth", mass: 137.33, discovered: 1808 },
        // Lanthanides
        { number: 57, symbol: "La", name: "Lanthanum", category: "lanthanide", mass: 138.91, discovered: 1839 },
        { number: 58, symbol: "Ce", name: "Cerium", category: "lanthanide", mass: 140.12, discovered: 1803 },
        { number: 59, symbol: "Pr", name: "Praseodymium", category: "lanthanide", mass: 140.91, discovered: 1885 },
        { number: 60, symbol: "Nd", name: "Neodymium", category: "lanthanide", mass: 144.24, discovered: 1885 },
        { number: 61, symbol: "Pm", name: "Promethium", category: "lanthanide", mass: 145, discovered: 1945 },
        { number: 62, symbol: "Sm", name: "Samarium", category: "lanthanide", mass: 150.36, discovered: 1879 },
        { number: 63, symbol: "Eu", name: "Europium", category: "lanthanide", mass: 151.96, discovered: 1901 },
        { number: 64, symbol: "Gd", name: "Gadolinium", category: "lanthanide", mass: 157.25, discovered: 1880 },
        { number: 65, symbol: "Tb", name: "Terbium", category: "lanthanide", mass: 158.93, discovered: 1843 },
        { number: 66, symbol: "Dy", name: "Dysprosium", category: "lanthanide", mass: 162.50, discovered: 1886 },
        { number: 67, symbol: "Ho", name: "Holmium", category: "lanthanide", mass: 164.93, discovered: 1878 },
        { number: 68, symbol: "Er", name: "Erbium", category: "lanthanide", mass: 167.26, discovered: 1843 },
        { number: 69, symbol: "Tm", name: "Thulium", category: "lanthanide", mass: 168.93, discovered: 1879 },
        { number: 70, symbol: "Yb", name: "Ytterbium", category: "lanthanide", mass: 173.05, discovered: 1878 },
        { number: 71, symbol: "Lu", name: "Lutetium", category: "lanthanide", mass: 174.97, discovered: 1907 },
        // Continue Period 6
        { number: 72, symbol: "Hf", name: "Hafnium", category: "transition-metal", mass: 178.49, discovered: 1923 },
        { number: 73, symbol: "Ta", name: "Tantalum", category: "transition-metal", mass: 180.95, discovered: 1802 },
        { number: 74, symbol: "W", name: "Tungsten", category: "transition-metal", mass: 183.84, discovered: 1783 },
        { number: 75, symbol: "Re", name: "Rhenium", category: "transition-metal", mass: 186.21, discovered: 1925 },
        { number: 76, symbol: "Os", name: "Osmium", category: "transition-metal", mass: 190.23, discovered: 1803 },
        { number: 77, symbol: "Ir", name: "Iridium", category: "transition-metal", mass: 192.22, discovered: 1803 },
        { number: 78, symbol: "Pt", name: "Platinum", category: "transition-metal", mass: 195.08, discovered: 1735 },
        { number: 79, symbol: "Au", name: "Gold", category: "transition-metal", mass: 196.97, discovered: "Ancient" },
        { number: 80, symbol: "Hg", name: "Mercury", category: "transition-metal", mass: 200.59, discovered: "Ancient" },
        { number: 81, symbol: "Tl", name: "Thallium", category: "basic-metal", mass: 204.38, discovered: 1861 },
        { number: 82, symbol: "Pb", name: "Lead", category: "basic-metal", mass: 207.2, discovered: "Ancient" },
        { number: 83, symbol: "Bi", name: "Bismuth", category: "basic-metal", mass: 208.98, discovered: 1753 },
        { number: 84, symbol: "Po", name: "Polonium", category: "semimetal", mass: 209, discovered: 1898 },
        { number: 85, symbol: "At", name: "Astatine", category: "halogen", mass: 210, discovered: 1940 },
        { number: 86, symbol: "Rn", name: "Radon", category: "noble-gas", mass: 222, discovered: 1900 },
        
        // Period 7
        { number: 87, symbol: "Fr", name: "Francium", category: "alkali-metal", mass: 223, discovered: 1939 },
        { number: 88, symbol: "Ra", name: "Radium", category: "alkaline-earth", mass: 226, discovered: 1898 },
        // Actinides
        { number: 89, symbol: "Ac", name: "Actinium", category: "actinide", mass: 227, discovered: 1899 },
        { number: 90, symbol: "Th", name: "Thorium", category: "actinide", mass: 232.04, discovered: 1829 },
        { number: 91, symbol: "Pa", name: "Protactinium", category: "actinide", mass: 231.04, discovered: 1913 },
        { number: 92, symbol: "U", name: "Uranium", category: "actinide", mass: 238.03, discovered: 1789 },
        { number: 93, symbol: "Np", name: "Neptunium", category: "actinide", mass: 237, discovered: 1940 },
        { number: 94, symbol: "Pu", name: "Plutonium", category: "actinide", mass: 244, discovered: 1940 },
        { number: 95, symbol: "Am", name: "Americium", category: "actinide", mass: 243, discovered: 1944 },
        { number: 96, symbol: "Cm", name: "Curium", category: "actinide", mass: 247, discovered: 1944 },
        { number: 97, symbol: "Bk", name: "Berkelium", category: "actinide", mass: 247, discovered: 1949 },
        { number: 98, symbol: "Cf", name: "Californium", category: "actinide", mass: 251, discovered: 1950 },
        { number: 99, symbol: "Es", name: "Einsteinium", category: "actinide", mass: 252, discovered: 1952 },
        { number: 100, symbol: "Fm", name: "Fermium", category: "actinide", mass: 257, discovered: 1952 },
        { number: 101, symbol: "Md", name: "Mendelevium", category: "actinide", mass: 258, discovered: 1955 },
        { number: 102, symbol: "No", name: "Nobelium", category: "actinide", mass: 259, discovered: 1958 },
        { number: 103, symbol: "Lr", name: "Lawrencium", category: "actinide", mass: 262, discovered: 1961 },
        // Continue Period 7
        { number: 104, symbol: "Rf", name: "Rutherfordium", category: "transition-metal", mass: 267, discovered: 1969 },
        { number: 105, symbol: "Db", name: "Dubnium", category: "transition-metal", mass: 268, discovered: 1970 },
        { number: 106, symbol: "Sg", name: "Seaborgium", category: "transition-metal", mass: 269, discovered: 1974 },
        { number: 107, symbol: "Bh", name: "Bohrium", category: "transition-metal", mass: 270, discovered: 1981 },
        { number: 108, symbol: "Hs", name: "Hassium", category: "transition-metal", mass: 269, discovered: 1984 },
        { number: 109, symbol: "Mt", name: "Meitnerium", category: "transition-metal", mass: 278, discovered: 1982 },
        { number: 110, symbol: "Ds", name: "Darmstadtium", category: "transition-metal", mass: 281, discovered: 1994 },
        { number: 111, symbol: "Rg", name: "Roentgenium", category: "transition-metal", mass: 282, discovered: 1994 },
        { number: 112, symbol: "Cn", name: "Copernicium", category: "transition-metal", mass: 285, discovered: 1996 },
        { number: 113, symbol: "Nh", name: "Nihonium", category: "basic-metal", mass: 286, discovered: 2004 },
        { number: 114, symbol: "Fl", name: "Flerovium", category: "basic-metal", mass: 289, discovered: 1999 },
        { number: 115, symbol: "Mc", name: "Moscovium", category: "basic-metal", mass: 290, discovered: 2004 },
        { number: 116, symbol: "Lv", name: "Livermorium", category: "basic-metal", mass: 293, discovered: 2000 },
        { number: 117, symbol: "Ts", name: "Tennessine", category: "halogen", mass: 294, discovered: 2010 },
        { number: 118, symbol: "Og", name: "Oganesson", category: "noble-gas", mass: 294, discovered: 2006 }
    ];

    const periodicTable = document.getElementById('periodic-table');
    const elementDetails = document.getElementById('elementDetails');
    const quizPanel = document.getElementById('quizPanel');
    const viewModeBtn = document.getElementById('viewMode');
    const quizModeBtn = document.getElementById('quizMode');
    const resetBtn = document.getElementById('reset');
    const questionText = document.getElementById('questionText');
    const quizOptions = document.getElementById('quizOptions');
    const quizFeedback = document.getElementById('quizFeedback');
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const scoreElement = document.getElementById('score');
    const totalElement = document.getElementById('total');
    
    let currentMode = 'view';
    let currentQuestion = null;
    let quizScore = 0;
    let questionsAsked = 0;
    let selectedElement = null;

    // Position mapping for periodic table layout (row, column)
    const elementPositions = new Map();
    
    // Main table positions (Periods 1-7, Groups 1-18)
    const mainTablePositions = [
        // Period 1
        [1, 1, 1], [1, 18, 2],
        // Period 2
        [2, 1, 3], [2, 2, 4], [2, 13, 5], [2, 14, 6], [2, 15, 7], [2, 16, 8], [2, 17, 9], [2, 18, 10],
        // Period 3
        [3, 1, 11], [3, 2, 12], [3, 13, 13], [3, 14, 14], [3, 15, 15], [3, 16, 16], [3, 17, 17], [3, 18, 18],
        // Period 4
        [4, 1, 19], [4, 2, 20], [4, 3, 21], [4, 4, 22], [4, 5, 23], [4, 6, 24], [4, 7, 25], [4, 8, 26],
        [4, 9, 27], [4, 10, 28], [4, 11, 29], [4, 12, 30], [4, 13, 31], [4, 14, 32], [4, 15, 33], [4, 16, 34],
        [4, 17, 35], [4, 18, 36],
        // Period 5
        [5, 1, 37], [5, 2, 38], [5, 3, 39], [5, 4, 40], [5, 5, 41], [5, 6, 42], [5, 7, 43], [5, 8, 44],
        [5, 9, 45], [5, 10, 46], [5, 11, 47], [5, 12, 48], [5, 13, 49], [5, 14, 50], [5, 15, 51], [5, 16, 52],
        [5, 17, 53], [5, 18, 54],
        // Period 6
        [6, 1, 55], [6, 2, 56], [6, 3, 57], // La placeholder
        // Period 6 continuation after lanthanides
        [6, 4, 72], [6, 5, 73], [6, 6, 74], [6, 7, 75], [6, 8, 76], [6, 9, 77], [6, 10, 78], [6, 11, 79],
        [6, 12, 80], [6, 13, 81], [6, 14, 82], [6, 15, 83], [6, 16, 84], [6, 17, 85], [6, 18, 86],
        // Period 7
        [7, 1, 87], [7, 2, 88], [7, 3, 89], // Ac placeholder
        // Period 7 continuation after actinides
        [7, 4, 104], [7, 5, 105], [7, 6, 106], [7, 7, 107], [7, 8, 108], [7, 9, 109], [7, 10, 110],
        [7, 11, 111], [7, 12, 112], [7, 13, 113], [7, 14, 114], [7, 15, 115], [7, 16, 116], [7, 17, 117], [7, 18, 118],
        // Lanthanides row (row 8)
        [8, 3, 57], [8, 4, 58], [8, 5, 59], [8, 6, 60], [8, 7, 61], [8, 8, 62], [8, 9, 63], [8, 10, 64],
        [8, 11, 65], [8, 12, 66], [8, 13, 67], [8, 14, 68], [8, 15, 69], [8, 16, 70], [8, 17, 71],
        // Actinides row (row 9)
        [9, 3, 89], [9, 4, 90], [9, 5, 91], [9, 6, 92], [9, 7, 93], [9, 8, 94], [9, 9, 95], [9, 10, 96],
        [9, 11, 97], [9, 12, 98], [9, 13, 99], [9, 14, 100], [9, 15, 101], [9, 16, 102], [9, 17, 103]
    ];

    // Store positions in map for easy lookup
    mainTablePositions.forEach(([row, col, num]) => {
        elementPositions.set(num, { row, col });
    });

    function createPeriodicTable() {
        // Clear the table
        periodicTable.innerHTML = '';
        
        // Create a 9x18 grid (7 periods + 2 rows for lanthanides/actinides)
        for (let row = 1; row <= 9; row++) {
            for (let col = 1; col <= 18; col++) {
                const cell = document.createElement('div');
                
                // Find element at this position
                let elementAtPos = null;
                for (const [num, pos] of elementPositions.entries()) {
                    if (pos.row === row && pos.col === col) {
                        const element = elements.find(e => e.number === num);
                        if (element) {
                            elementAtPos = element;
                        }
                        break;
                    }
                }
                
                if (elementAtPos) {
                    const element = elementAtPos;
                    cell.className = `element ${element.category}`;
                    cell.innerHTML = `
                        <div class="element-number">${element.number}</div>
                        <div class="element-symbol">${element.symbol}</div>
                        <div class="element-name">${element.name}</div>
                    `;
                    cell.dataset.number = element.number;
                    
                    cell.addEventListener('click', () => {
                        if (currentMode === 'view') {
                            showElementDetails(element);
                        }
                    });
                    
                    // Special styling for Lanthanides and Actinides
                    if (row >= 8) {
                        cell.classList.add('separated-row');
                    }
                } else {
                    // Check if this is the La or Ac placeholder in main table
                    if ((row === 6 && col === 3) || (row === 7 && col === 3)) {
                        cell.className = 'element placeholder';
                        cell.innerHTML = `<div class="placeholder-text">*</div>`;
                        cell.title = "Click to see lanthanides/actinides";
                        cell.addEventListener('click', () => {
                            // Scroll to the lanthanides/actinides row
                            const targetRow = row === 6 ? 8 : 9;
                            document.querySelector(`.element[data-number="${targetRow === 8 ? 57 : 89}"]`)
                                .scrollIntoView({ behavior: 'smooth', block: 'center' });
                        });
                    } else {
                        cell.className = 'empty-cell';
                    }
                }
                
                periodicTable.appendChild(cell);
            }
        }
    }

    function showElementDetails(element) {
        selectedElement = element;
        
        const categoryNames = {
            'alkali-metal': 'Alkali Metal',
            'alkaline-earth': 'Alkaline Earth Metal',
            'transition-metal': 'Transition Metal',
            'basic-metal': 'Basic Metal',
            'semimetal': 'Semimetal',
            'nonmetal': 'Nonmetal',
            'halogen': 'Halogen',
            'noble-gas': 'Noble Gas',
            'lanthanide': 'Lanthanide',
            'actinide': 'Actinide'
        };

        const group = getGroup(element.number);
        const period = getPeriod(element.number);
        const state = getState(element.number);
        const electronConfig = getElectronConfig(element.number);

        elementDetails.innerHTML = `
            <div class="element-info active">
                <div class="element-header">
                    <div class="element-big-symbol" style="color: ${getCategoryColor(element.category)}">${element.symbol}</div>
                    <div class="element-title">
                        <h3>${element.name}</h3>
                        <p>Atomic Number: ${element.number}</p>
                        <p>Period: ${period}, Group: ${group}</p>
                        <p>Category: ${categoryNames[element.category] || element.category}</p>
                    </div>
                </div>
                <div class="element-properties">
                    <div class="property">
                        <div class="property-name">Atomic Mass</div>
                        <div>${element.mass} u</div>
                    </div>
                    <div class="property">
                        <div class="property-name">Year Discovered</div>
                        <div>${element.discovered}</div>
                    </div>
                    <div class="property">
                        <div class="property-name">Electron Configuration</div>
                        <div>${electronConfig}</div>
                    </div>
                    <div class="property">
                        <div class="property-name">State at Room Temperature</div>
                        <div>${state}</div>
                    </div>
                    <div class="property">
                        <div class="property-name">Density</div>
                        <div>${getDensity(element.number)} g/cm³</div>
                    </div>
                    <div class="property">
                        <div class="property-name">Melting Point</div>
                        <div>${getMeltingPoint(element.number)} °C</div>
                    </div>
                </div>
                <p style="margin-top: 20px; font-style: italic;">Click on other elements to see their details.</p>
            </div>
        `;
    }

    function getGroup(number) {
        // Simplified group assignment
        if (number === 1 || number === 3 || number === 11 || number === 19 || 
            number === 37 || number === 55 || number === 87) return 1;
        if (number === 2) return 18;
        if (number === 4 || number === 12 || number === 20 || number === 38 || 
            number === 56 || number === 88) return 2;
        if (number >= 57 && number <= 71) return 3; // Lanthanides
        if (number >= 89 && number <= 103) return 3; // Actinides
        if (number >= 21 && number <= 30) return number - 18; // Transition metals period 4
        if (number >= 39 && number <= 48) return number - 36; // Transition metals period 5
        if (number >= 72 && number <= 80) return number - 54; // Transition metals period 6
        if (number >= 104 && number <= 112) return number - 86; // Transition metals period 7
        
        // Main group elements
        const groups = {
            5: 13, 6: 14, 7: 15, 8: 16, 9: 17, 10: 18,
            13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18,
            31: 13, 32: 14, 33: 15, 34: 16, 35: 17, 36: 18,
            49: 13, 50: 14, 51: 15, 52: 16, 53: 17, 54: 18,
            81: 13, 82: 14, 83: 15, 84: 16, 85: 17, 86: 18,
            113: 13, 114: 14, 115: 15, 116: 16, 117: 17, 118: 18
        };
        
        return groups[number] || "N/A";
    }

    function getPeriod(number) {
        if (number <= 2) return 1;
        if (number <= 10) return 2;
        if (number <= 18) return 3;
        if (number <= 36) return 4;
        if (number <= 54) return 5;
        if (number <= 86) return 6;
        return 7;
    }

    function getState(number) {
        const gases = [1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86, 118];
        const liquids = [35, 80];
        
        if (gases.includes(number)) return "Gas";
        if (liquids.includes(number)) return "Liquid";
        return "Solid";
    }

    function getElectronConfig(number) {
        // Simplified electron configurations for first 20 elements
        const configs = {
            1: "1s¹", 2: "1s²", 3: "[He] 2s¹", 4: "[He] 2s²", 5: "[He] 2s² 2p¹",
            6: "[He] 2s² 2p²", 7: "[He] 2s² 2p³", 8: "[He] 2s² 2p⁴", 9: "[He] 2s² 2p⁵",
            10: "[He] 2s² 2p⁶", 11: "[Ne] 3s¹", 12: "[Ne] 3s²", 13: "[Ne] 3s² 3p¹",
            14: "[Ne] 3s² 3p²", 15: "[Ne] 3s² 3p³", 16: "[Ne] 3s² 3p⁴", 17: "[Ne] 3s² 3p⁵",
            18: "[Ne] 3s² 3p⁶", 19: "[Ar] 4s¹", 20: "[Ar] 4s²"
        };
        
        // For elements beyond 20, provide a simplified configuration
        if (number > 20) {
            const element = elements.find(e => e.number === number);
            const nobleGas = getNobleGasBefore(number);
            if (nobleGas) {
                return `[${nobleGas.symbol}] ...`;
            }
        }
        
        return configs[number] || "Complex configuration";
    }

    function getNobleGasBefore(number) {
        const nobleGases = [2, 10, 18, 36, 54, 86];
        for (let i = nobleGases.length - 1; i >= 0; i--) {
            if (nobleGases[i] < number) {
                return elements.find(e => e.number === nobleGases[i]);
            }
        }
        return null;
    }

    function getDensity(number) {
        // Sample densities for some elements
        const densities = {
            1: 0.0000899, 2: 0.0001785, 3: 0.534, 4: 1.85, 6: 2.267,
            7: 0.0012506, 8: 0.001429, 10: 0.0008999, 11: 0.971,
            12: 1.738, 13: 2.698, 14: 2.3296, 16: 2.067, 17: 0.003214,
            19: 0.862, 20: 1.54, 26: 7.874, 29: 8.96, 47: 10.49,
            50: 7.287, 79: 19.30, 80: 13.534, 82: 11.34, 92: 19.1
        };
        return densities[number] || "Variable";
    }

    function getMeltingPoint(number) {
        // Sample melting points for some elements
        const meltingPoints = {
            1: -259.16, 2: -272.20, 3: 180.54, 4: 1287, 6: 3550,
            7: -210.1, 8: -218.79, 10: -248.59, 11: 97.72,
            12: 650, 13: 660.32, 14: 1414, 16: 115.21, 17: -101.5,
            19: 63.38, 20: 842, 26: 1538, 29: 1084.62, 47: 961.78,
            50: 231.93, 79: 1064.18, 80: -38.83, 82: 327.46, 92: 1135
        };
        return meltingPoints[number] || "Variable";
    }

    function getCategoryColor(category) {
        const colors = {
            'alkali-metal': '#ff6b6b',
            'alkaline-earth': '#ffa726',
            'transition-metal': '#29b6f6',
            'basic-metal': '#66bb6a',
            'semimetal': '#ab47bc',
            'nonmetal': '#26c6da',
            'halogen': '#ffca28',
            'noble-gas': '#7e57c2',
            'lanthanide': '#ec407a',
            'actinide': '#8d6e63'
        };
        return colors[category] || '#ffffff';
    }

    function setViewMode() {
        currentMode = 'view';
        viewModeBtn.style.background = '#3498db';
        quizModeBtn.style.background = '#9b59b6';
        elementDetails.style.display = 'block';
        quizPanel.classList.remove('active');
        
        if (selectedElement) {
            showElementDetails(selectedElement);
        }
    }

    function setQuizMode() {
        currentMode = 'quiz';
        viewModeBtn.style.background = '#3498db';
        quizModeBtn.style.background = '#2980b9';
        elementDetails.style.display = 'none';
        quizPanel.classList.add('active');
        generateQuestion();
    }

    function generateQuestion() {
        const questionTypes = [
            {
                type: 'symbol',
                generate: () => {
                    const element = elements[Math.floor(Math.random() * elements.length)];
                    currentQuestion = {
                        element: element,
                        type: 'symbol',
                        correctAnswer: element.symbol
                    };
                    questionText.textContent = `What is the chemical symbol for ${element.name}?`;
                    generateOptions(element.symbol, 'symbol');
                }
            },
            {
                type: 'name',
                generate: () => {
                    const element = elements[Math.floor(Math.random() * elements.length)];
                    currentQuestion = {
                        element: element,
                        type: 'name',
                        correctAnswer: element.name
                    };
                    questionText.textContent = `What is the name of the element with symbol ${element.symbol}?`;
                    generateOptions(element.name, 'name');
                }
            },
            {
                type: 'number',
                generate: () => {
                    const element = elements[Math.floor(Math.random() * elements.length)];
                    currentQuestion = {
                        element: element,
                        type: 'number',
                        correctAnswer: element.number.toString()
                    };
                    questionText.textContent = `What is the atomic number of ${element.name}?`;
                    generateOptions(element.number.toString(), 'number');
                }
            },
            {
                type: 'category',
                generate: () => {
                    const element = elements[Math.floor(Math.random() * elements.length)];
                    currentQuestion = {
                        element: element,
                        type: 'category',
                        correctAnswer: element.category
                    };
                    questionText.textContent = `What category does ${element.name} belong to?`;
                    generateOptions(element.category, 'category');
                }
            }
        ];

        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        selectedType.generate();
        questionsAsked++;
        totalElement.textContent = questionsAsked;
        
        quizFeedback.style.display = 'none';
        nextQuestionBtn.style.display = 'none';
    }

    function generateOptions(correctAnswer, type) {
        quizOptions.innerHTML = '';
        
        const options = [correctAnswer];
        
        while (options.length < 4) {
            let option;
            if (type === 'symbol') {
                option = elements[Math.floor(Math.random() * elements.length)].symbol;
            } else if (type === 'name') {
                option = elements[Math.floor(Math.random() * elements.length)].name;
            } else if (type === 'number') {
                option = (Math.floor(Math.random() * 118) + 1).toString();
            } else {
                const categories = ['alkali-metal', 'alkaline-earth', 'transition-metal', 
                                   'basic-metal', 'semimetal', 'nonmetal', 'halogen', 
                                   'noble-gas', 'lanthanide', 'actinide'];
                option = categories[Math.floor(Math.random() * categories.length)];
            }
            
            if (!options.includes(option)) {
                options.push(option);
            }
        }
        
        options.sort(() => Math.random() - 0.5);
        
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'quiz-option';
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => checkAnswer(option, optionElement));
            quizOptions.appendChild(optionElement);
        });
    }

    function checkAnswer(selected, element) {
        const correct = selected === currentQuestion.correctAnswer;
        
        if (correct) {
            quizScore++;
            scoreElement.textContent = quizScore;
            quizFeedback.textContent = "Correct! Well done!";
            quizFeedback.style.background = "rgba(46, 204, 113, 0.3)";
            quizFeedback.style.border = "2px solid #2ecc71";
            quizFeedback.style.color = "#2ecc71";
            element.classList.add('correct');
        } else {
            quizFeedback.textContent = `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`;
            quizFeedback.style.background = "rgba(231, 76, 60, 0.3)";
            quizFeedback.style.border = "2px solid #e74c3c";
            quizFeedback.style.color = "#e74c3c";
            element.classList.add('incorrect');
            
            Array.from(quizOptions.children).forEach(opt => {
                if (opt.textContent === currentQuestion.correctAnswer) {
                    opt.classList.add('correct');
                }
            });
        }
        
        quizFeedback.style.display = 'block';
        nextQuestionBtn.style.display = 'block';
        
        Array.from(quizOptions.children).forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
    }

    function resetApp() {
        quizScore = 0;
        questionsAsked = 0;
        scoreElement.textContent = '0';
        totalElement.textContent = '0';
        setViewMode();
        elementDetails.innerHTML = `
            <h2>Select an Element</h2>
            <p>Click on any element to see its details here.</p>
        `;
    }

    viewModeBtn.addEventListener('click', setViewMode);
    quizModeBtn.addEventListener('click', setQuizMode);
    resetBtn.addEventListener('click', resetApp);
    nextQuestionBtn.addEventListener('click', generateQuestion);

    createPeriodicTable();
    setViewMode();
});