
        // Quantum Dice Roller - Core Logic
        document.addEventListener('DOMContentLoaded', function() {
            // State
            let diceCount = 1;
            let isEntangled = false;
            let totalRolls = 0;
            let entangledRolls = 0;
            let distribution = {};
            let lastRoll = [];
            
            // DOM Elements
            const diceContainer = document.getElementById('dice-container');
            const rollBtn = document.getElementById('roll-btn');
            const entangleBtn = document.getElementById('entangle-btn');
            const separateBtn = document.getElementById('separate-btn');
            const autoRollBtn = document.getElementById('auto-roll-btn');
            const diceCountBtns = document.querySelectorAll('.dice-count-btn');
            const entanglementStatus = document.getElementById('entanglement-status');
            const entanglementEffect = document.getElementById('entanglement-effect');
            const lastRollDisplay = document.getElementById('last-roll-display');
            const lastRollValues = document.getElementById('last-roll-values');
            const lastRollSum = document.querySelector('#last-roll-sum span');
            const totalRollsEl = document.getElementById('total-rolls');
            const entangledRollsEl = document.getElementById('entangled-rolls');
            const distributionBars = document.getElementById('distribution-bars');
            const probabilityLaw = document.getElementById('probability-law');
            const observerText = document.getElementById('observer-text');

            // Initialize
            initDice();
            updateDistributionDisplay();
            
            // Event Listeners
            rollBtn.addEventListener('click', rollDice);
            entangleBtn.addEventListener('click', () => setEntanglement(true));
            separateBtn.addEventListener('click', () => setEntanglement(false));
            autoRollBtn.addEventListener('click', runAutoExperiment);
            
            diceCountBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    diceCount = parseInt(this.dataset.dice);
                    diceCountBtns.forEach(b => b.classList.remove('active', 'bg-blue-600'));
                    diceCountBtns.forEach(b => b.classList.add('bg-gray-700'));
                    this.classList.add('active', 'bg-blue-600');
                    this.classList.remove('bg-gray-700');
                    initDice();
                });
            });

            // Functions
            function initDice() {
                diceContainer.innerHTML = '';
                lastRoll = [];
                
                for (let i = 0; i < diceCount; i++) {
                    const dice = document.createElement('div');
                    dice.className = 'relative w-32 h-32 dice-3d cursor-pointer';
                    dice.dataset.index = i;
                    dice.innerHTML = createDiceFaces();
                    
                    // Add quantum glow if entangled
                    if (isEntangled) {
                        dice.classList.add('animate-quantumGlow');
                        dice.style.animation = 'quantumGlow 2s infinite';
                    }
                    
                    // Initial rotation
                    const rotation = i * 45;
                    dice.style.transform = `rotateX(${rotation}deg) rotateY(${rotation}deg)`;
                    
                    diceContainer.appendChild(dice);
                }
                
                // Add entanglement visualization
                updateEntanglementVisuals();
            }

            function createDiceFaces() {
                // Create 6 faces for a 3D dice
                const faces = [
                    '<div class="dice-face" style="transform: translateZ(60px)"><div class="pip-container grid-cols-1"><div class="pip"></div></div></div>',
                    '<div class="dice-face" style="transform: rotateY(180deg) translateZ(60px)"><div class="pip-container grid-cols-3"><div class="pip col-start-3"></div><div class="pip col-start-2 row-start-2"></div><div class="pip col-start-1 row-start-3"></div></div></div>',
                    '<div class="dice-face" style="transform: rotateY(90deg) translateZ(60px)"><div class="pip-container grid-cols-3"><div class="pip"></div><div class="pip col-start-2 row-start-2"></div><div class="pip col-start-3 row-start-3"></div></div></div>',
                    '<div class="dice-face" style="transform: rotateY(-90deg) translateZ(60px)"><div class="pip-container grid-cols-2"><div class="pip"></div><div class="pip col-start-2"></div><div class="pip row-start-2"></div><div class="pip col-start-2 row-start-2"></div></div></div>',
                    '<div class="dice-face" style="transform: rotateX(90deg) translateZ(60px)"><div class="pip-container grid-cols-3"><div class="pip"></div><div class="pip col-start-3"></div><div class="pip col-start-2 row-start-2"></div><div class="pip row-start-3"></div><div class="pip col-start-3 row-start-3"></div></div></div>',
                    '<div class="dice-face" style="transform: rotateX(-90deg) translateZ(60px)"><div class="pip-container grid-cols-3"><div class="pip"></div><div class="pip col-start-2"></div><div class="pip col-start-3"></div><div class="pip col-start-1 row-start-2"></div><div class="pip col-start-2 row-start-2"></div><div class="pip col-start-3 row-start-2"></div><div class="pip col-start-1 row-start-3"></div><div class="pip col-start-2 row-start-3"></div><div class="pip col-start-3 row-start-3"></div></div></div>'
                ];
                
                return faces.join('');
            }

            function rollDice() {
                totalRolls++;
                if (isEntangled) entangledRolls++;
                
                // Update counters
                totalRollsEl.textContent = totalRolls;
                entangledRollsEl.textContent = entangledRolls;
                
                // Get dice elements
                const diceElements = document.querySelectorAll('.dice-3d');
                const results = [];
                
                // Generate results based on entanglement
                if (isEntangled) {
                    // For entangled dice, generate correlated results
                    const baseValue = Math.floor(Math.random() * 6) + 1;
                    
                    for (let i = 0; i < diceCount; i++) {
                        // Correlated but not identical: second die often adds to 7 with first, etc.
                        let result;
                        if (i === 0) {
                            result = baseValue;
                        } else {
                            // Create correlation: often sum to 7 or have other relationship
                            const correlation = Math.random();
                            if (correlation < 0.6) {
                                // Strong correlation: sum often equals 7 or other patterns
                                result = 7 - baseValue;
                                if (result < 1) result = 1;
                                if (result > 6) result = 6;
                            } else {
                                // Some randomness still
                                result = Math.floor(Math.random() * 6) + 1;
                            }
                        }
                        results.push(result);
                    }
                } else {
                    // Independent dice
                    for (let i = 0; i < diceCount; i++) {
                        results.push(Math.floor(Math.random() * 6) + 1);
                    }
                }
                
                lastRoll = results;
                
                // Animate dice
                diceElements.forEach((dice, index) => {
                    // Reset animation
                    dice.style.animation = 'diceSpin 1s ease-out';
                    
                    // Determine which face to show based on result
                    const result = results[index];
                    const rotations = {
                        1: 'rotateX(0deg) rotateY(0deg)',
                        2: 'rotateX(0deg) rotateY(-180deg)',
                        3: 'rotateX(0deg) rotateY(-90deg)',
                        4: 'rotateX(0deg) rotateY(90deg)',
                        5: 'rotateX(-90deg) rotateY(0deg)',
                        6: 'rotateX(90deg) rotateY(0deg)'
                    };
                    
                    // Apply final rotation after animation
                    setTimeout(() => {
                        dice.style.animation = '';
                        dice.style.transform = rotations[result];
                    }, 1000);
                });
                
                // Update distribution
                const sum = results.reduce((a, b) => a + b, 0);
                distribution[sum] = (distribution[sum] || 0) + 1;
                
                // Update UI
                updateLastRollDisplay(results);
                updateDistributionDisplay();
                updateProbabilityLaw();
                updateObserverText();
                
                // Show last roll display
                lastRollDisplay.classList.remove('hidden');
            }

            function setEntanglement(entangled) {
                isEntangled = entangled;
                
                // Update UI
                if (isEntangled) {
                    entangleBtn.classList.add('from-purple-600', 'to-blue-600');
                    entangleBtn.classList.remove('from-gray-700', 'to-gray-600');
                    separateBtn.classList.remove('from-purple-600', 'to-blue-600');
                    separateBtn.classList.add('from-gray-700', 'to-gray-600');
                    entanglementStatus.textContent = 'Status: Dice are quantum entangled!';
                    entanglementStatus.classList.add('text-purple-300');
                    entanglementEffect.classList.remove('hidden');
                    
                    // Add quantum glow to dice
                    document.querySelectorAll('.dice-3d').forEach(dice => {
                        dice.style.animation = 'quantumGlow 2s infinite';
                    });
                } else {
                    entangleBtn.classList.remove('from-purple-600', 'to-blue-600');
                    entangleBtn.classList.add('from-gray-700', 'to-gray-600');
                    separateBtn.classList.add('from-purple-600', 'to-blue-600');
                    separateBtn.classList.remove('from-gray-700', 'to-gray-600');
                    entanglementStatus.textContent = 'Status: Dice are independent';
                    entanglementStatus.classList.remove('text-purple-300');
                    entanglementEffect.classList.add('hidden');
                    
                    // Remove glow from dice
                    document.querySelectorAll('.dice-3d').forEach(dice => {
                        dice.style.animation = '';
                    });
                }
                
                updateEntanglementVisuals();
            }

            function updateEntanglementVisuals() {
                // Remove existing entanglement lines
                document.querySelectorAll('.entangle-line').forEach(el => el.remove());
                
                if (isEntangled && diceCount > 1) {
                    // Add visual connection lines between dice
                    const diceElements = document.querySelectorAll('.dice-3d');
                    
                    for (let i = 0; i < diceElements.length - 1; i++) {
                        for (let j = i + 1; j < diceElements.length; j++) {
                            const line = document.createElement('div');
                            line.className = 'entangle-line';
                            line.style.width = '100px';
                            line.style.top = '50%';
                            line.style.left = 'calc(50% - 50px)';
                            line.style.opacity = '0.5';
                            line.style.animation = `entanglePulse 2s infinite ${i * 0.2}s`;
                            
                            diceContainer.appendChild(line);
                        }
                    }
                }
            }

            function updateLastRollDisplay(results) {
                lastRollValues.innerHTML = results.map((val, idx) => `
                    <div class="inline-flex flex-col items-center mx-2">
                        <div class="text-3xl bg-gray-800 w-16 h-16 rounded-xl flex items-center justify-center border-2 border-blue-500">
                            ${val}
                        </div>
                        <div class="text-xs mt-1 text-gray-400">Die ${idx + 1}</div>
                    </div>
                `).join('');
                
                const sum = results.reduce((a, b) => a + b, 0);
                lastRollSum.textContent = sum;
            }

            function updateDistributionDisplay() {
                if (Object.keys(distribution).length === 0) {
                    distributionBars.innerHTML = '<p class="text-gray-500 text-center py-4">No rolls yet. Roll the dice to see distribution!</p>';
                    return;
                }
                
                const total = Object.values(distribution).reduce((a, b) => a + b, 0);
                const maxValue = Math.max(...Object.values(distribution));
                
                let barsHTML = '';
                for (let sum = diceCount; sum <= diceCount * 6; sum++) {
                    const count = distribution[sum] || 0;
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    const barWidth = total > 0 ? (count / maxValue * 100) : 0;
                    
                    barsHTML += `
                        <div class="flex items-center">
                            <div class="w-10 text-sm font-medium">${sum}</div>
                            <div class="flex-1 ml-2">
                                <div class="h-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500" 
                                     style="width: ${barWidth}%"></div>
                            </div>
                            <div class="w-16 text-right text-sm">${percentage}%</div>
                        </div>
                    `;
                }
                
                distributionBars.innerHTML = barsHTML;
            }

            function updateProbabilityLaw() {
                if (isEntangled) {
                    probabilityLaw.textContent = "Quantum Entanglement: Dice outcomes are correlated!";
                } else {
                    if (diceCount === 1) {
                        probabilityLaw.textContent = "Single die: Equal 1/6 probability for each outcome";
                    } else if (diceCount === 2) {
                        probabilityLaw.textContent = "Two dice: Bell curve distribution centered around 7";
                    } else {
                        probabilityLaw.textContent = "Multiple dice: Normal distribution applies";
                    }
                }
            }

            function updateObserverText() {
                const texts = [
                    "Wave function collapsed! Dice have taken definite values.",
                    "The quantum superposition has been observed!",
                    "Measurement complete. The dice are now in a definite state.",
                    "Observer effect in action: Rolling collapsed the probabilities!"
                ];
                
                observerText.textContent = texts[Math.floor(Math.random() * texts.length)];
            }

            function runAutoExperiment() {
                autoRollBtn.disabled = true;
                autoRollBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Running Experiment...';
                
                let rollsCompleted = 0;
                const totalExperimentRolls = 100;
                
                const rollInterval = setInterval(() => {
                    rollDice();
                    rollsCompleted++;
                    
                    if (rollsCompleted >= totalExperimentRolls) {
                        clearInterval(rollInterval);
                        autoRollBtn.disabled = false;
                        autoRollBtn.innerHTML = 'Run Experiment';
                        
                        // Show completion message
                        probabilityLaw.textContent = `Experiment complete: ${totalExperimentRolls} rolls analyzed!`;
                    }
                }, 50);
            }

            // Add some initial rolls for demo
            setTimeout(() => {
                if (totalRolls === 0) {
                    rollDice();
                    setTimeout(() => rollDice(), 1200);
                }
            }, 500);
        });
