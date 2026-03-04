        // Chemical database with reactions
        const chemicals = [
            { id: 1, name: "Hydrochloric Acid", formula: "HCl", type: "acid", colorClass: "color-acid", icon: "H⁺" },
            { id: 2, name: "Sodium Hydroxide", formula: "NaOH", type: "base", colorClass: "color-base", icon: "OH⁻" },
            { id: 3, name: "Water", formula: "H₂O", type: "neutral", colorClass: "color-water", icon: "H₂O" },
            { id: 4, name: "Sodium Chloride", formula: "NaCl", type: "salt", colorClass: "color-salt", icon: "Na⁺" },
            { id: 5, name: "Copper Sulfate", formula: "CuSO₄", type: "metal", colorClass: "color-metal", icon: "Cu²⁺" },
            { id: 6, name: "Hydrogen Peroxide", formula: "H₂O₂", type: "oxidizer", colorClass: "color-oxidizer", icon: "O₂" },
            { id: 7, name: "Silver Nitrate", formula: "AgNO₃", type: "precipitate", colorClass: "color-precipitate", icon: "Ag⁺" },
            { id: 8, name: "Ammonia", formula: "NH₃", type: "gas", colorClass: "color-gas", icon: "NH₃" },
            { id: 9, name: "Calcium Carbonate", formula: "CaCO₃", type: "neutral", colorClass: "color-neutral", icon: "Ca²⁺" }
        ];

        // Reaction database
        const reactions = [
            {
                chemicals: [1, 2], // HCl + NaOH
                name: "Neutralization",
                equation: "HCl + NaOH → NaCl + H₂O",
                description: "A strong acid reacts with a strong base to form salt and water.",
                resultColor: "#a0d0e0",
                safety: "Produces heat. Use caution when mixing strong acids and bases.",
                bubbles: true,
                heat: true
            },
            {
                chemicals: [1, 5], // HCl + CuSO₄
                name: "Acid-Metal Reaction",
                equation: "2HCl + CuSO₄ → CuCl₂ + H₂SO₄",
                description: "Acid reacts with copper sulfate to produce copper chloride and sulfuric acid.",
                resultColor: "#60c0c0",
                safety: "Produces toxic gas. Conduct in fume hood with proper PPE.",
                bubbles: true,
                heat: false
            },
            {
                chemicals: [2, 7], // NaOH + AgNO₃
                name: "Precipitation",
                equation: "NaOH + AgNO₃ → AgOH + NaNO₃",
                description: "Forms silver hydroxide precipitate which decomposes to brown silver oxide.",
                resultColor: "#e0e0c0",
                safety: "Silver compounds are toxic and can stain skin. Handle with care.",
                bubbles: false,
                heat: false
            },
            {
                chemicals: [6, 8], // H₂O₂ + NH₃
                name: "Oxidation",
                equation: "3H₂O₂ + 2NH₃ → N₂ + 6H₂O",
                description: "Hydrogen peroxide oxidizes ammonia to nitrogen gas and water.",
                resultColor: "#d0e0f0",
                safety: "Produces nitrogen gas rapidly. Risk of pressure buildup.",
                bubbles: true,
                heat: true
            },
            {
                chemicals: [4, 7], // NaCl + AgNO₃
                name: "Double Displacement",
                equation: "NaCl + AgNO₃ → AgCl + NaNO₃",
                description: "Forms insoluble silver chloride as a white precipitate.",
                resultColor: "#f0f0d0",
                safety: "Silver chloride is photosensitive. Keep away from direct light.",
                bubbles: false,
                heat: false
            },
            {
                chemicals: [1, 9], // HCl + CaCO₃
                name: "Acid-Carbonate Reaction",
                equation: "2HCl + CaCO₃ → CaCl₂ + H₂O + CO₂",
                description: "Acid reacts with calcium carbonate to produce calcium chloride, water, and carbon dioxide gas.",
                resultColor: "#c0e0d0",
                safety: "Produces carbon dioxide gas. Ensure adequate ventilation.",
                bubbles: true,
                heat: false
            }
        ];

        // DOM elements
        const chemicalsGrid = document.getElementById('chemicalsGrid');
        const beakerLiquid = document.getElementById('beakerLiquid');
        const beakerContents = document.getElementById('beakerContents');
        const mixBtn = document.getElementById('mixBtn');
        const clearBtn = document.getElementById('clearBtn');
        const reactionAnimation = document.getElementById('reactionAnimation');
        const safetyWarning = document.getElementById('safetyWarning');
        const warningText = document.getElementById('warningText');
        const reactionResult = document.getElementById('reactionResult');
        const reactionEquation = document.getElementById('reactionEquation');
        const reactionDescription = document.getElementById('reactionDescription');
        const logContainer = document.getElementById('logContainer');

        // State
        let beakerChemicals = [];
        let currentColor = null;
        let logEntries = 0;

        // Initialize chemicals
        function initializeChemicals() {
            chemicalsGrid.innerHTML = '';
            chemicals.forEach(chemical => {
                const chemicalElement = document.createElement('div');
                chemicalElement.className = `chemical ${chemical.colorClass}`;
                chemicalElement.draggable = true;
                chemicalElement.dataset.id = chemical.id;
                
                chemicalElement.innerHTML = `
                    <div class="chemical-icon ${chemical.colorClass}">${chemical.icon}</div>
                    <div class="chemical-name">${chemical.name}</div>
                    <div class="chemical-formula">${chemical.formula}</div>
                `;
                
                // Drag events
                chemicalElement.addEventListener('dragstart', handleDragStart);
                chemicalElement.addEventListener('dragend', handleDragEnd);
                
                chemicalsGrid.appendChild(chemicalElement);
            });
        }

        // Drag and drop
        function handleDragStart(e) {
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.dataset.id);
            
            // Create a custom drag image
            const dragIcon = document.createElement('div');
            dragIcon.className = `chemical-icon ${this.querySelector('.chemical-icon').className}`;
            dragIcon.textContent = this.querySelector('.chemical-icon').textContent;
            dragIcon.style.position = 'absolute';
            dragIcon.style.top = '-1000px';
            document.body.appendChild(dragIcon);
            e.dataTransfer.setDragImage(dragIcon, 30, 30);
            
            setTimeout(() => document.body.removeChild(dragIcon), 0);
        }

        function handleDragEnd() {
            this.classList.remove('dragging');
        }

        // Setup drop zone
        const beaker = document.querySelector('.beaker');
        beaker.addEventListener('dragover', e => {
            e.preventDefault();
            beaker.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });

        beaker.addEventListener('dragleave', () => {
            beaker.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });

        beaker.addEventListener('drop', e => {
            e.preventDefault();
            beaker.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            
            const chemicalId = parseInt(e.dataTransfer.getData('text/plain'));
            addChemicalToBeaker(chemicalId);
        });

        // Add chemical to beaker
        function addChemicalToBeaker(chemicalId) {
            const chemical = chemicals.find(c => c.id === chemicalId);
            if (!chemical) return;
            
            // Check if already in beaker (limit 2 chemicals for simplicity)
            if (beakerChemicals.length >= 2) {
                addLogEntry("Beaker is full. Mix or clear before adding more chemicals.", "warning");
                return;
            }
            
            if (beakerChemicals.some(c => c.id === chemicalId)) {
                addLogEntry(`${chemical.name} is already in the beaker.`, "warning");
                return;
            }
            
            beakerChemicals.push(chemical);
            updateBeakerDisplay();
            addLogEntry(`Added ${chemical.name} (${chemical.formula}) to beaker.`, "success");
            
            // Enable mix button if we have 2 chemicals
            if (beakerChemicals.length === 2) {
                mixBtn.disabled = false;
            }
        }

        // Update beaker display
        function updateBeakerDisplay() {
            if (beakerChemicals.length === 0) {
                beakerLiquid.style.height = '0%';
                beakerLiquid.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                beakerContents.textContent = 'Empty';
                currentColor = null;
                return;
            }
            
            // Calculate liquid level
            const liquidLevel = beakerChemicals.length * 40;
            beakerLiquid.style.height = `${liquidLevel}%`;
            
            // Update contents text
            const chemicalNames = beakerChemicals.map(c => c.formula).join(' + ');
            beakerContents.textContent = chemicalNames;
            
            // Set initial color based on first chemical
            if (!currentColor) {
                const firstChemical = beakerChemicals[0];
                beakerLiquid.style.backgroundColor = getColorForChemical(firstChemical);
                currentColor = getColorForChemical(firstChemical);
            }
        }

        // Get color for chemical
        function getColorForChemical(chemical) {
            const colorMap = {
                'acid': '#e0a050',
                'base': '#60c0c0',
                'neutral': '#b0b0b0',
                'salt': '#d0d0a0',
                'metal': '#c0c0c0',
                'oxidizer': '#f0a0a0',
                'precipitate': '#e0e0c0',
                'gas': '#d0e0f0'
            };
            return colorMap[chemical.type] || '#b0b0b0';
        }

        // Mix chemicals
        function mixChemicals() {
            if (beakerChemicals.length < 2) {
                addLogEntry("Need at least 2 chemicals to mix.", "warning");
                return;
            }
            
            const chemicalIds = beakerChemicals.map(c => c.id).sort();
            
            // Find matching reaction
            let reaction = null;
            for (const r of reactions) {
                const sortedReactionChems = [...r.chemicals].sort();
                if (JSON.stringify(sortedReactionChems) === JSON.stringify(chemicalIds)) {
                    reaction = r;
                    break;
                }
            }
            
            // Hide previous results
            safetyWarning.style.display = 'none';
            reactionResult.style.display = 'none';
            
            // Animate mixing
            animateMixing();
            
            // Show reaction result after animation
            setTimeout(() => {
                if (reaction) {
                    // Successful reaction
                    showReactionResult(reaction);
                    beakerLiquid.style.backgroundColor = reaction.resultColor;
                    currentColor = reaction.resultColor;
                    
                    addLogEntry(`Successfully created: ${reaction.name} reaction.`, "success");
                } else {
                    // No reaction
                    reactionResult.style.display = 'block';
                    reactionEquation.textContent = "No Reaction";
                    reactionDescription.textContent = "These chemicals do not react under standard conditions.";
                    safetyWarning.style.display = 'none';
                    
                    // Mix colors
                    const color1 = getColorForChemical(beakerChemicals[0]);
                    const color2 = getColorForChemical(beakerChemicals[1]);
                    beakerLiquid.style.backgroundColor = blendColors(color1, color2);
                    
                    addLogEntry("No reaction occurred between the selected chemicals.", "warning");
                }
            }, 1500);
        }

        // Show reaction result
        function showReactionResult(reaction) {
            reactionResult.style.display = 'block';
            reactionEquation.textContent = reaction.equation;
            reactionDescription.textContent = reaction.description;
            
            if (reaction.safety) {
                safetyWarning.style.display = 'block';
                warningText.textContent = reaction.safety;
            }
        }

        // Animate mixing
        function animateMixing() {
            reactionAnimation.innerHTML = '';
            reactionAnimation.style.opacity = '1';
            
            // Create bubbles
            if (beakerChemicals.some(c => c.type === 'acid') || 
                beakerChemicals.some(c => c.type === 'base')) {
                for (let i = 0; i < 30; i++) {
                    createBubble();
                }
            }
            
            // Add heat effect
            if (beakerChemicals.some(c => c.type === 'acid') && 
                beakerChemicals.some(c => c.type === 'base')) {
                beakerLiquid.style.boxShadow = 'inset 0 0 30px rgba(255, 200, 100, 0.5)';
                setTimeout(() => {
                    beakerLiquid.style.boxShadow = 'none';
                }, 2000);
            }
            
            // Reset animation
            setTimeout(() => {
                reactionAnimation.style.opacity = '0';
            }, 2000);
        }

        // Create bubble animation
        function createBubble() {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            const size = Math.random() * 15 + 5;
            const left = Math.random() * 160 + 20;
            const delay = Math.random() * 1;
            
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${left}px`;
            bubble.style.animationDelay = `${delay}s`;
            
            reactionAnimation.appendChild(bubble);
            
            // Remove bubble after animation
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            }, 2000);
        }

        // Blend two colors
        function blendColors(color1, color2) {
            // Simple color blending
            const hex1 = color1.replace('#', '');
            const hex2 = color2.replace('#', '');
            
            const r1 = parseInt(hex1.substr(0, 2), 16);
            const g1 = parseInt(hex1.substr(2, 2), 16);
            const b1 = parseInt(hex1.substr(4, 2), 16);
            
            const r2 = parseInt(hex2.substr(0, 2), 16);
            const g2 = parseInt(hex2.substr(2, 2), 16);
            const b2 = parseInt(hex2.substr(4, 2), 16);
            
            const r = Math.floor((r1 + r2) / 2);
            const g = Math.floor((g1 + g2) / 2);
            const b = Math.floor((b1 + b2) / 2);
            
            return `rgb(${r}, ${g}, ${b})`;
        }

        // Clear beaker
        function clearBeaker() {
            beakerChemicals = [];
            updateBeakerDisplay();
            safetyWarning.style.display = 'none';
            reactionResult.style.display = 'none';
            mixBtn.disabled = true;
            addLogEntry("Beaker cleared.", "success");
        }

        // Add log entry
        function addLogEntry(message, type = "info") {
            logEntries++;
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${type}`;
            
            const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            logEntry.textContent = `[${timestamp}] ${message}`;
            
            logContainer.prepend(logEntry);
            
            // Limit log entries
            if (logEntries > 10) {
                logContainer.removeChild(logContainer.lastChild);
            }
        }

        // Initialize
        function initialize() {
            initializeChemicals();
            updateBeakerDisplay();
            
            // Event listeners
            mixBtn.addEventListener('click', mixChemicals);
            clearBtn.addEventListener('click', clearBeaker);
            
            // Add initial log
            addLogEntry("Chemistry Lab Simulator initialized. Ready for experiments.");
        }

        // Start the simulator
        initialize();
