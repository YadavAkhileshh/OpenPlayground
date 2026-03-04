        const geodeCanvas = document.getElementById('geodeCanvas');
        const crystalType = document.getElementById('crystalType');
        const crystalDescription = document.getElementById('crystalDescription');
        const growthInfo = document.getElementById('growthInfo');
        
        let crystals = [];
        let currentMineral = 'amethyst';
        let growthStage = 0;
        
        const mineralColors = {
            amethyst: '#9966ff',
            quartz: '#ffffff',
            citrine: '#ffcc66'
        };
        
        function createGeode() {
            geodeCanvas.innerHTML = '';
            
            // Create outer shell
            const shell = document.createElement('div');
            shell.style.position = 'absolute';
            shell.style.width = '100%';
            shell.style.height = '100%';
            shell.style.borderRadius = '60px';
            shell.style.background = '#5a5a6f';
            shell.style.border = '20px solid #3a3a4f';
            shell.style.boxShadow = 'inset 0 0 50px #000000';
            geodeCanvas.appendChild(shell);
            
            // Add crystals
            crystals.forEach(crystal => {
                const crystalEl = document.createElement('div');
                crystalEl.className = 'crystal';
                crystalEl.style.left = crystal.x + '%';
                crystalEl.style.bottom = crystal.y + '%';
                crystalEl.style.width = crystal.size + 'px';
                crystalEl.style.height = crystal.size * 2 + 'px';
                crystalEl.style.background = crystal.color;
                crystalEl.style.boxShadow = `0 0 20px ${crystal.color}`;
                crystalEl.style.transform = `rotate(${crystal.rotation}deg)`;
                geodeCanvas.appendChild(crystalEl);
            });
        }
        
        function growCrystals() {
            growthStage++;
            
            // Add new crystals
            for (let i = 0; i < 3; i++) {
                crystals.push({
                    x: 20 + Math.random() * 60,
                    y: 20 + Math.random() * 40,
                    size: 5 + Math.random() * 15,
                    rotation: -30 + Math.random() * 60,
                    color: mineralColors[currentMineral]
                });
            }
            
            // Grow existing crystals
            crystals.forEach(crystal => {
                crystal.size *= 1.2;
            });
            
            growthInfo.innerHTML = `✨ Crystals growing... stage ${growthStage}`;
            createGeode();
        }
        
        function crackGeode() {
            // Simulate cracking open
            growthInfo.innerHTML = '💥 The geode cracks open!';
            
            // Reveal crystals inside
            if (crystals.length === 0) {
                for (let i = 0; i < 15; i++) {
                    crystals.push({
                        x: 20 + Math.random() * 60,
                        y: 20 + Math.random() * 40,
                        size: 5 + Math.random() * 20,
                        rotation: -30 + Math.random() * 60,
                        color: mineralColors[currentMineral]
                    });
                }
            }
            
            createGeode();
        }
        
        function resetGeode() {
            crystals = [];
            growthStage = 0;
            growthInfo.innerHTML = 'A new geode is forming...';
            createGeode();
        }
        
        function changeMineral(mineral) {
            currentMineral = mineral;
            
            if (mineral === 'amethyst') {
                crystalType.textContent = 'AMETHYST';
                crystalDescription.innerHTML = 'Purple quartz variety, forms in volcanic geodes';
            } else if (mineral === 'quartz') {
                crystalType.textContent = 'QUARTZ';
                crystalDescription.innerHTML = 'Clear crystal, most common mineral on Earth';
            } else if (mineral === 'citrine') {
                crystalType.textContent = 'CITRINE';
                crystalDescription.innerHTML = 'Yellow quartz, rare in nature';
            }
            
            // Change existing crystal colors
            crystals.forEach(crystal => {
                crystal.color = mineralColors[mineral];
            });
            
            createGeode();
        }
        
        geodeCanvas.addEventListener('click', crackGeode);
        
        document.getElementById('amethystBtn').addEventListener('click', () => changeMineral('amethyst'));
        document.getElementById('quartzBtn').addEventListener('click', () => changeMineral('quartz'));
        document.getElementById('citrineBtn').addEventListener('click', () => changeMineral('citrine'));
        document.getElementById('growBtn').addEventListener('click', growCrystals);
        document.getElementById('crackBtn').addEventListener('click', crackGeode);
        document.getElementById('resetBtn').addEventListener('click', resetGeode);
        
        // Initialize
        resetGeode();
        
        // Natural growth over time
        setInterval(() => {
            if (crystals.length > 0 && Math.random() > 0.7) {
                growCrystals();
            }
        }, 5000);