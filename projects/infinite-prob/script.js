        const prefixes = ["Quantum", "Reverse", "Subliminal", "Chronal", "Magnetic", "Etheric", "Oscillating"];
        const nouns = ["Toaster", "Hamster", "Doorway", "Calculator", "Umbrella", "Sock", "Kettle", "Pendulum"];
        const suffixes = ["of Doom", "of Prosperity", "of Static", "of Forever", "of Glitch", "of Whimsy", "of Depth"];
        
        const inventionEl = document.getElementById('inventionText');
        const lever = document.getElementById('lever');
        const leds = document.querySelectorAll('.led');
        const gauges = document.querySelectorAll('.gauge');
        
        function generateInvention() {
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            return `${prefix} ${noun} ${suffix}`;
        }
        
        function updateLightsAndGauges() {
            // Random LEDs
            leds.forEach(led => {
                led.classList.toggle('active', Math.random() > 0.5);
            });
            
            // Random gauge rotations
            gauges.forEach(gauge => {
                const randomDeg = Math.floor(Math.random() * 180);
                gauge.style.setProperty('--value', randomDeg);
            });
        }
        
        function activate() {
            inventionEl.textContent = generateInvention();
            updateLightsAndGauges();
            
            // Lever animation
            lever.style.transform = 'rotate(15deg)';
            setTimeout(() => {
                lever.style.transform = 'rotate(0deg)';
            }, 150);
        }
        
        document.getElementById('generateBtn').addEventListener('click', activate);
        lever.addEventListener('click', activate);
        
        // Initial random state
        updateLightsAndGauges();