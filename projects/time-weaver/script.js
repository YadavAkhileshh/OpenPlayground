        const knots = document.querySelectorAll('.knot');
        const timeWeave = document.getElementById('timeWeave');
        
        const pastEvents = [
            "The first sunrise", "A forgotten vow", "The broken hourglass", 
            "A letter never sent", "The last dance", "A whisper in the dark"
        ];
        
        const futureEvents = [
            "A meeting with fate", "The silver door opens", "Echoes of tomorrow",
            "A crown of starlight", "The final page turns", "Wings of dawn"
        ];
        
        // State of knots (active = memory locked)
        let knotStates = [false, false, false, false, false];
        let currentWeave = "⏳ weave the threads ⏳";
        
        function updateKnots() {
            knots.forEach((knot, index) => {
                if (knotStates[index]) {
                    knot.classList.add('active');
                } else {
                    knot.classList.remove('active');
                }
            });
        }
        
        function weaveTime(direction) {
            // Count active knots (memories)
            const activeCount = knotStates.filter(v => v).length;
            if (activeCount === 0) {
                timeWeave.textContent = "⚡ no memories locked ⚡";
                return;
            }
            
            let selectedEvents = [];
            if (direction === 'past') {
                // Pick random past events based on active knots
                for (let i = 0; i < activeCount; i++) {
                    selectedEvents.push(pastEvents[Math.floor(Math.random() * pastEvents.length)]);
                }
            } else {
                for (let i = 0; i < activeCount; i++) {
                    selectedEvents.push(futureEvents[Math.floor(Math.random() * futureEvents.length)]);
                }
            }
            
            // Remove duplicates for mystique
            selectedEvents = [...new Set(selectedEvents)];
            
            if (selectedEvents.length === 0) {
                timeWeave.textContent = "🌀 the loom is silent 🌀";
            } else {
                timeWeave.textContent = "❄ " + selectedEvents.join(" ❄ ... ❄ ") + " ❄";
            }
            
            // Also change knot appearance based on destiny
            knots.forEach((knot, idx) => {
                if (knotStates[idx]) {
                    knot.style.background = direction === 'past' ? '#a56b3a' : '#d4af37';
                }
            });
        }
        
        // Knot click toggles memory lock
        knots.forEach((knot, index) => {
            knot.addEventListener('click', () => {
                knotStates[index] = !knotStates[index];
                updateKnots();
                
                // If any knot active, show hint
                if (knotStates.some(v => v)) {
                    timeWeave.textContent = "☯ memories locked, weave time ☯";
                } else {
                    timeWeave.textContent = "⏳ weave the threads ⏳";
                }
            });
        });
        
        document.getElementById('weavePast').addEventListener('click', () => weaveTime('past'));
        document.getElementById('weaveFuture').addEventListener('click', () => weaveTime('future'));