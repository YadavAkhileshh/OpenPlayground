
        // Encounter data
        const encounterData = {
            peaceful: {
                icon: '😌',
                colorClass: 'peaceful',
                descriptions: [
                    "A friendly traveler offers to share their provisions and tells tales of distant lands. They have a map that could be useful for your journey.",
                    "You discover a serene glade with a crystal-clear pond. The area is safe for resting and there are edible berries growing nearby.",
                    "A group of merchants sets up a temporary camp. They're willing to trade supplies at fair prices and share news from nearby settlements.",
                    "You encounter a wise old hermit who lives in harmony with nature. They offer healing herbs and valuable advice about the region.",
                    "A family of deer grazes peacefully in a sun-dappled clearing. They are unafraid of your presence and continue their gentle activities.",
                    "You find an abandoned campsite that's still in good condition. There's firewood stacked neatly and a clean water source nearby."
                ]
            },
            neutral: {
                icon: '😐',
                colorClass: 'neutral',
                descriptions: [
                    "A patrol from a nearby kingdom passes by. They're cautious but not hostile, asking about your business in the area before continuing.",
                    "You spot mysterious ruins that appear undisturbed. While there may be artifacts of value, the area gives off an uneasy feeling.",
                    "A wandering minstrel plays a melancholic tune. They'll share stories in exchange for coin or news from your travels.",
                    "The weather suddenly changes, bringing heavy fog that reduces visibility. Navigation becomes difficult but there's no immediate threat.",
                    "You find tracks from an unknown creature. They're large but don't appear aggressive—possibly just passing through the area.",
                    "A disputed territory lies ahead with markers from two rival factions. Proceeding requires careful negotiation or stealth."
                ]
            },
            dangerous: {
                icon: '😨',
                colorClass: 'dangerous',
                descriptions: [
                    "Bandits have set up an ambush on the road ahead! They're well-armed and demand all your valuables.",
                    "A territorial beast guards the path forward. Its aggressive posture suggests it will attack if you come any closer.",
                    "The ground gives way to a hidden pit trap! Sharpened stakes line the bottom, and the sides are too steep to climb easily.",
                    "You accidentally disturb a nest of giant wasps. They swarm aggressively, their stingers capable of delivering paralyzing venom.",
                    "A sudden rockslide blocks the path forward while unstable debris continues to fall from the cliff above.",
                    "A cursed area radiates dark energy. Strange whispers fill the air and shadows seem to move with malicious intent."
                ]
            }
        };

        // DOM Elements
        const encounterTypeElement = document.getElementById('encounterType');
        const typeIconElement = document.getElementById('typeIcon');
        const typeTextElement = document.getElementById('typeText');
        const encounterDescriptionElement = document.getElementById('encounterDescription');
        const generateBtn = document.getElementById('generateBtn');
        const diceElement = document.getElementById('dice');
        const encounterCountElement = document.getElementById('encounterCount');
        const dangerLevelElement = document.getElementById('dangerLevel');
        const totalEncountersElement = document.getElementById('totalEncounters');

        // Statistics
        let encounterCount = 0;
        let currentType = '';
        
        // Initialize total encounters count
        totalEncountersElement.textContent = Object.keys(encounterData).length;

        // Function to get a random item from an array
        function getRandomItem(array) {
            return array[Math.floor(Math.random() * array.length)];
        }

        // Function to generate a random encounter
        function generateEncounter() {
            // Reset dice animation
            diceElement.classList.remove('rolling');
            void diceElement.offsetWidth; // Trigger reflow to restart animation
            diceElement.classList.add('rolling');
            
            // Generate a random number for dice face
            const diceRoll = Math.floor(Math.random() * 6) + 1;
            
            // Determine encounter type based on dice roll
            let type;
            if (diceRoll <= 2) {
                type = 'peaceful';
            } else if (diceRoll <= 4) {
                type = 'neutral';
            } else {
                type = 'dangerous';
            }
            
            // Update dice to show the rolled number
            setTimeout(() => {
                diceElement.style.transform = `rotateX(${360 * diceRoll}deg) rotateY(${180 * diceRoll}deg)`;
            }, 800);
            
            // Get encounter data
            const encounter = encounterData[type];
            const description = getRandomItem(encounter.descriptions);
            
            // Update UI with a delay to sync with dice animation
            setTimeout(() => {
                // Update encounter type display
                typeIconElement.textContent = encounter.icon;
                typeTextElement.textContent = type.toUpperCase();
                
                // Update encounter description
                encounterDescriptionElement.textContent = description;
                
                // Update colors and classes
                encounterTypeElement.className = `encounter-type ${encounter.colorClass}`;
                
                // Update danger level
                dangerLevelElement.textContent = type.toUpperCase();
                
                // Add pulse animation to encounter container
                document.querySelector('.encounter-container').classList.add('pulse');
                setTimeout(() => {
                    document.querySelector('.encounter-container').classList.remove('pulse');
                }, 500);
                
                // Update encounter count
                encounterCount++;
                encounterCountElement.textContent = encounterCount;
                
                // Update current type for stats
                currentType = type;
            }, 1000);
        }

        // Event listener for generate button
        generateBtn.addEventListener('click', generateEncounter);

        // Generate initial encounter on page load
        window.addEventListener('load', () => {
            // Small delay to let page load completely
            setTimeout(generateEncounter, 500);
        });
    