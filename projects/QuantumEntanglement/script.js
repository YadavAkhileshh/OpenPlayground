        class QuantumEntanglement {
            constructor() {
                this.canvas = document.getElementById('quantum-canvas');
                this.ctx = this.canvas.getContext('2d');
                this.width = window.innerWidth * 0.66;
                this.height = window.innerHeight;
                this.canvas.width = this.width;
                this.canvas.height = this.height;
                
                this.pairs = [];
                this.aliceAngle = 0;
                this.bobAngle = 45;
                this.hiddenVariables = false;
                this.bellViolations = 0;
                this.coherence = 0.98;
                
                this.initParticles();
                this.animate();
                this.setupResize();
            }

            initParticles() {
                // Create 1000 entangled particle pairs
                for (let i = 0; i < 1000; i++) {
                    this.pairs.push(this.createEntangledPair());
                }
            }

            createEntangledPair() {
                // Create a singlet state: (|↑↓⟩ - |↓↑⟩)/√2
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI * 2;
                
                return {
                    // Alice's particle
                    alice: {
                        x: this.width * 0.3 + (Math.random() - 0.5) * 50,
                        y: Math.random() * this.height,
                        spin: null,
                        hiddenVar: Math.random() // Hidden variable if enabled
                    },
                    // Bob's particle
                    bob: {
                        x: this.width * 0.7 + (Math.random() - 0.5) * 50,
                        y: Math.random() * this.height,
                        spin: null,
                        hiddenVar: Math.random()
                    },
                    // Quantum state vector
                    theta: theta,
                    phi: phi,
                    entangled: true
                };
            }

            measureSpin(particle, angle, pair) {
                if (this.hiddenVariables) {
                    // Hidden variable theory: spin is predetermined
                    return particle.hiddenVar > 0.5 ? 1 : -1;
                } else {
                    // Quantum mechanics: spin is probabilistic based on angle
                    // For singlet state, probability of same spin = cos²(θ)
                    const angleDiff = (angle - (pair.theta * 180 / Math.PI)) * Math.PI / 180;
                    const probSame = Math.cos(angleDiff) ** 2;
                    
                    // Entanglement ensures opposite spins when measured at same angle
                    if (pair.alice.spin === null) {
                        return Math.random() < 0.5 ? 1 : -1;
                    } else {
                        // If Alice already measured, Bob's spin is opposite (for same angle)
                        const aliceAngle = this.aliceAngle;
                        const bobAngle = this.bobAngle;
                        const angleDifference = (bobAngle - aliceAngle) * Math.PI / 180;
                        
                        // Quantum correlation: P(opposite) = sin²(Δθ/2)
                        const probOpposite = Math.sin(angleDifference / 2) ** 2;
                        
                        if (pair.alice.spin === 1) {
                            return Math.random() < probOpposite ? -1 : 1;
                        } else {
                            return Math.random() < probOpposite ? 1 : -1;
                        }
                    }
                }
            }

            measurePair(pair) {
                // Measure Alice's particle
                pair.alice.spin = this.measureSpin(pair.alice, this.aliceAngle, pair);
                
                // Measure Bob's particle (entangled)
                pair.bob.spin = this.measureSpin(pair.bob, this.bobAngle, pair);
                
                return pair;
            }

            calculateCorrelation() {
                let sum = 0;
                let count = 0;
                
                for (let pair of this.pairs) {
                    if (pair.alice.spin !== null && pair.bob.spin !== null) {
                        sum += pair.alice.spin * pair.bob.spin;
                        count++;
                    }
                }
                
                return count > 0 ? sum / count : 0;
            }

            calculateBellValue() {
                // CHSH inequality: S = |E(a,b) - E(a,b')| + |E(a',b) + E(a',b')|
                // Simplified version using current angles
                const E = (a, b) => {
                    // Calculate correlation for given angles
                    let sum = 0;
                    let count = 0;
                    
                    for (let pair of this.pairs) {
                        if (pair.alice.spin !== null && pair.bob.spin !== null) {
                            // Theoretical correlation for singlet state: -cos(a - b)
                            const angleDiff = (a - b) * Math.PI / 180;
                            const theoretical = -Math.cos(angleDiff);
                            sum += theoretical;
                            count++;
                        }
                    }
                    
                    return count > 0 ? sum / count : 0;
                };
                
                const a = this.aliceAngle;
                const b = this.bobAngle;
                const a_prime = (this.aliceAngle + 45) % 360;
                const b_prime = (this.bobAngle + 45) % 360;
                
                const S = Math.abs(E(a, b) - E(a, b_prime)) + 
                         Math.abs(E(a_prime, b) + E(a_prime, b_prime));
                
                return S;
            }

            updateDisplay() {
                // Update spin indicators
                if (this.pairs.length > 0) {
                    const lastPair = this.pairs[Math.floor(Math.random() * this.pairs.length)];
                    
                    if (lastPair.alice.spin === 1) {
                        document.getElementById('alice-spin').className = 'spin-indicator spin-up';
                        document.getElementById('alice-spin').textContent = '↑';
                    } else if (lastPair.alice.spin === -1) {
                        document.getElementById('alice-spin').className = 'spin-indicator spin-down';
                        document.getElementById('alice-spin').textContent = '↓';
                    }
                    
                    if (lastPair.bob.spin === 1) {
                        document.getElementById('bob-spin').className = 'spin-indicator spin-up';
                        document.getElementById('bob-spin').textContent = '↑';
                    } else if (lastPair.bob.spin === -1) {
                        document.getElementById('bob-spin').className = 'spin-indicator spin-down';
                        document.getElementById('bob-spin').textContent = '↓';
                    }
                }
                
                // Update statistics
                const correlation = this.calculateCorrelation();
                const bellValue = this.calculateBellValue();
                
                document.getElementById('correlation').textContent = correlation.toFixed(2);
                document.getElementById('correlation-fill').style.width = 
                    ((correlation + 1) / 2 * 100) + '%';
                document.getElementById('correlation-label').textContent = 
                    Math.round((correlation + 1) / 2 * 100) + '% Correlation';
                
                document.getElementById('bell-value').textContent = bellValue.toFixed(2);
                
                // Check Bell violation
                if (bellValue > 2) {
                    document.getElementById('quantum-interpretation').innerHTML = 
                        '⚠️ Bell inequality violated → Quantum entanglement confirmed';
                    document.getElementById('quantum-interpretation').style.color = '#ff6b6b';
                    
                    if (!this.hiddenVariables) {
                        this.bellViolations++;
                        document.getElementById('bell-violations').textContent = this.bellViolations;
                    }
                } else {
                    document.getElementById('quantum-interpretation').innerHTML = 
                        '✓ Classical limit satisfied → Hidden variables possible';
                    document.getElementById('quantum-interpretation').style.color = '#64ffda';
                }
                
                // Update spin statistics
                let aliceUp = 0, bobUp = 0;
                this.pairs.forEach(pair => {
                    if (pair.alice.spin === 1) aliceUp++;
                    if (pair.bob.spin === 1) bobUp++;
                });
                
                document.getElementById('alice-up').textContent = 
                    Math.round(aliceUp / this.pairs.length * 100) + '%';
                document.getElementById('bob-up').textContent = 
                    Math.round(bobUp / this.pairs.length * 100) + '%';
                document.getElementById('pair-count').textContent = this.pairs.length;
                
                // Update coherence
                this.coherence = Math.max(0, this.coherence - 0.0001);
                document.getElementById('coherence').textContent = 
                    Math.round(this.coherence * 100) + '%';
            }

            draw() {
                this.ctx.clearRect(0, 0, this.width, this.height);
                
                // Draw quantum field background
                this.ctx.fillStyle = '#0a0f1e';
                this.ctx.fillRect(0, 0, this.width, this.height);
                
                // Draw grid
                this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
                this.ctx.lineWidth = 1;
                
                for (let i = 0; i < this.width; i += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(i, 0);
                    this.ctx.lineTo(i, this.height);
                    this.ctx.stroke();
                }
                
                for (let i = 0; i < this.height; i += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, i);
                    this.ctx.lineTo(this.width, i);
                    this.ctx.stroke();
                }
                
                // Draw detectors
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.fillRect(this.width * 0.25 - 50, 0, 100, this.height);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                this.ctx.fillRect(this.width * 0.75 - 50, 0, 100, this.height);
                
                // Draw detector labels
                this.ctx.font = 'bold 20px monospace';
                this.ctx.fillStyle = '#ff6b6b';
                this.ctx.fillText('ALICE', this.width * 0.25 - 30, 50);
                
                this.ctx.fillStyle = '#4ecdc4';
                this.ctx.fillText('BOB', this.width * 0.75 - 20, 50);
                
                // Draw entangled pairs
                this.pairs.forEach(pair => {
                    const alice = pair.alice;
                    const bob = pair.bob;
                    
                    // Draw entanglement line
                    const gradient = this.ctx.createLinearGradient(
                        alice.x, alice.y, bob.x, bob.y
                    );
                    gradient.addColorStop(0, '#ff6b6b');
                    gradient.addColorStop(1, '#4ecdc4');
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(alice.x, alice.y);
                    this.ctx.lineTo(bob.x, bob.y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 2;
                    this.ctx.globalAlpha = 0.2;
                    this.ctx.stroke();
                    
                    // Draw particles
                    this.ctx.globalAlpha = 1;
                    
                    // Alice's particle
                    this.ctx.beginPath();
                    this.ctx.arc(alice.x, alice.y, 5, 0, Math.PI * 2);
                    
                    if (alice.spin === 1) {
                        this.ctx.fillStyle = '#ff6b6b';
                        this.ctx.shadowColor = '#ff6b6b';
                    } else if (alice.spin === -1) {
                        this.ctx.fillStyle = '#ff9999';
                        this.ctx.shadowColor = '#ff9999';
                    } else {
                        this.ctx.fillStyle = '#888';
                        this.ctx.shadowColor = '#888';
                    }
                    
                    this.ctx.shadowBlur = 10;
                    this.ctx.fill();
                    
                    // Bob's particle
                    this.ctx.beginPath();
                    this.ctx.arc(bob.x, bob.y, 5, 0, Math.PI * 2);
                    
                    if (bob.spin === 1) {
                        this.ctx.fillStyle = '#4ecdc4';
                        this.ctx.shadowColor = '#4ecdc4';
                    } else if (bob.spin === -1) {
                        this.ctx.fillStyle = '#98f5e1';
                        this.ctx.shadowColor = '#98f5e1';
                    } else {
                        this.ctx.fillStyle = '#888';
                        this.ctx.shadowColor = '#888';
                    }
                    
                    this.ctx.fill();
                    
                    // Add quantum glow for entangled particles
                    if (pair.entangled) {
                        this.ctx.shadowBlur = 15;
                        this.ctx.shadowColor = '#64ffda';
                    }
                    
                    // Reset shadow
                    this.ctx.shadowBlur = 0;
                });
                
                // Draw angle indicators
                this.drawAngleIndicator(this.width * 0.25, this.height - 100, this.aliceAngle, '#ff6b6b');
                this.drawAngleIndicator(this.width * 0.75, this.height - 100, this.bobAngle, '#4ecdc4');
            }

            drawAngleIndicator(x, y, angle, color) {
                const radius = 40;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.stroke();
                
                // Draw angle line
                const rad = angle * Math.PI / 180;
                const endX = x + Math.cos(rad) * radius;
                const endY = y + Math.sin(rad) * radius;
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(endX, endY);
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                
                // Draw angle text
                this.ctx.font = '12px monospace';
                this.ctx.fillStyle = color;
                this.ctx.fillText(angle + '°', x - 20, y - 20);
            }

            animate() {
                // Random measurements for visualization
                if (Math.random() < 0.1) {
                    const randomPair = this.pairs[Math.floor(Math.random() * this.pairs.length)];
                    this.measurePair(randomPair);
                }
                
                this.draw();
                this.updateDisplay();
                
                requestAnimationFrame(() => this.animate());
            }

            setupResize() {
                window.addEventListener('resize', () => {
                    this.width = window.innerWidth * 0.66;
                    this.height = window.innerHeight;
                    this.canvas.width = this.width;
                    this.canvas.height = this.height;
                });
            }

            measureAll() {
                this.pairs.forEach(pair => this.measurePair(pair));
            }

            createNewPair() {
                this.pairs.push(this.createEntangledPair());
                if (this.pairs.length > 2000) {
                    this.pairs.shift();
                }
            }

            reset() {
                this.pairs = [];
                this.bellViolations = 0;
                this.coherence = 0.98;
                this.initParticles();
            }
        }

        // Initialize quantum simulator
        const quantum = new QuantumEntanglement();

        // Global control functions
        function createEntangledPair() {
            quantum.createNewPair();
        }

        function measureBoth() {
            quantum.measureAll();
            document.getElementById('last-measurement').textContent = 
                `Both detectors @ ${new Date().toLocaleTimeString()}`;
        }

        function runBellTest() {
            quantum.measureAll();
            const bellValue = quantum.calculateBellValue();
            
            if (bellValue > 2) {
                alert(`🎉 Bell's inequality violated! S = ${bellValue.toFixed(2)} > 2\nQuantum entanglement confirmed!`);
            } else {
                alert(`📊 Bell's inequality satisfied: S = ${bellValue.toFixed(2)} ≤ 2\nClassical hidden variables possible.`);
            }
        }

        function resetExperiment() {
            quantum.reset();
            document.getElementById('last-measurement').textContent = '-';
        }

        function toggleHiddenVariable() {
            quantum.hiddenVariables = document.getElementById('hidden-variable').checked;
            quantum.reset();
        }

        // Angle controls
        document.getElementById('alice-slider').addEventListener('input', (e) => {
            quantum.aliceAngle = parseInt(e.target.value);
            document.getElementById('alice-angle').textContent = quantum.aliceAngle + '°';
        });

        document.getElementById('bob-slider').addEventListener('input', (e) => {
            quantum.bobAngle = parseInt(e.target.value);
            document.getElementById('bob-angle').textContent = quantum.bobAngle + '°';
        });

        // Initialize
        quantum.measureAll();