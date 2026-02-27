
        // Character data arrays
        const names = [
            "Aelar Windrider", "Lyra Moonshadow", "Thrain Ironfist", "Seraphina Flameheart",
            "Kaelen Stormcaller", "Isolde Silverleaf", "Dorian Blackwood", "Elara Starweaver",
            "Cassian Bloodfang", "Rowan Swiftarrow", "Valeria Nightshade", "Orion Skyborn",
            "Morgana Darkwater", "Finnian Greenbriar", "Selene Frostveil", "Gideon Stoneheart"
        ];
        
        const professions = [
            "Sky Pirate Captain", "Arcane Archaeologist", "Steampunk Inventor", "Dreamweaver Bard",
            "Celestial Cartographer", "Time Travel Historian", "Ghost Hunter Detective", "Alchemy Chef",
            "Crystal Resonance Healer", "Beast Tamer Diplomat", "Memory Sculptor Artist", "Quantum Blacksmith",
            "Echo Location Navigator", "Shadow Dancer Spy", "Reality Warping Librarian", "Mystic Forge Engineer"
        ];
        
        const personalityTraits = [
            ["Charismatic", "Impulsive", "Optimistic"],
            ["Cautious", "Analytical", "Reserved"],
            ["Bold", "Adventurous", "Reckless"],
            ["Wise", "Patient", "Mysterious"],
            ["Eccentric", "Creative", "Forgetful"],
            ["Loyal", "Brave", "Stubborn"],
            ["Clever", "Sarcastic", "Resourceful"],
            ["Kind", "Empathetic", "Idealistic"],
            ["Ambitious", "Charming", "Manipulative"],
            ["Calm", "Observant", "Secretive"]
        ];
        
        const strengths = [
            ["Excellent pilot", "Natural leader", "Quick thinker"],
            ["Photographic memory", "Master strategist", "Polyglot"],
            ["Fearless in combat", "Expert survivalist", "Strong intuition"],
            ["Powerful magic affinity", "Deep knowledge of lore", "Meditation mastery"],
            ["Inventive problem solver", "Mechanical genius", "Artistic talent"],
            ["Unbreakable will", "Inspirational speaker", "Master negotiator"],
            ["Expert lockpicker", "Skilled actor", "Escape artist"],
            ["Healing abilities", "Animal communication", "Plant manipulation"],
            ["Political savvy", "Wealthy connections", "Persuasive orator"],
            ["Stealth mastery", "Keen senses", "Trap detection"]
        ];
        
        const weaknesses = [
            ["Too trusting", "Fear of confined spaces", "Poor with finances"],
            ["Overthinks everything", "Socially awkward", "Physical weakness"],
            ["Acts before thinking", "Trouble with authority", "Addicted to risk"],
            ["Too detached from reality", "Easily distracted by mysteries", "Poor at practical tasks"],
            ["Absent-minded", "Disorganized", "Easily bored"],
            ["Blind loyalty", "Holds grudges", "Refuses to ask for help"],
            ["Trust issues", "Sarcasm gets him in trouble", "Gambling habit"],
            ["Too idealistic", "Easily manipulated", "Avoids conflict"],
            ["Arrogant", "Moral flexibility", "Workaholic"],
            ["Secretive to a fault", "Paranoid", "Difficulty trusting others"]
        ];
        
        // DOM Elements
        const characterName = document.getElementById('character-name');
        const characterAge = document.getElementById('character-age');
        const characterProfession = document.getElementById('character-profession');
        const personalityTraitsContainer = document.getElementById('personality-traits');
        const strengthsContainer = document.getElementById('strengths');
        const weaknessesContainer = document.getElementById('weaknesses');
        const generateBtn = document.getElementById('generate-btn');
        const animationArea = document.getElementById('animation-area');
        
        // Stat elements
        const charismaStat = document.getElementById('charisma');
        const intelligenceStat = document.getElementById('intelligence');
        const courageStat = document.getElementById('courage');
        const wisdomStat = document.getElementById('wisdom');
        
        // Generate random age between 18 and 120
        function getRandomAge() {
            return Math.floor(Math.random() * (120 - 18 + 1)) + 18;
        }
        
        // Generate random stats between 30 and 100
        function getRandomStat() {
            return Math.floor(Math.random() * (100 - 30 + 1)) + 30;
        }
        
        // Get random item from array
        function getRandomItem(array) {
            return array[Math.floor(Math.random() * array.length)];
        }
        
        // Generate a new character
        function generateCharacter() {
            // Trigger fade-out animation
            animationArea.classList.remove('fade-in');
            animationArea.classList.add('fade-out');
            
            // After a short delay, update character and trigger fade-in
            setTimeout(() => {
                // Update character details
                characterName.textContent = getRandomItem(names);
                characterAge.textContent = getRandomAge();
                characterProfession.textContent = getRandomItem(professions);
                
                // Get random trait sets
                const randomPersonality = getRandomItem(personalityTraits);
                const randomStrengths = getRandomItem(strengths);
                const randomWeaknesses = getRandomItem(weaknesses);
                
                // Clear existing traits
                personalityTraitsContainer.innerHTML = '';
                strengthsContainer.innerHTML = '';
                weaknessesContainer.innerHTML = '';
                
                // Add new personality traits
                randomPersonality.forEach(trait => {
                    const traitElement = document.createElement('div');
                    traitElement.className = 'trait';
                    traitElement.textContent = trait;
                    personalityTraitsContainer.appendChild(traitElement);
                });
                
                // Add new strengths
                randomStrengths.forEach(strength => {
                    const strengthElement = document.createElement('div');
                    strengthElement.className = 'strength';
                    strengthElement.textContent = strength;
                    strengthsContainer.appendChild(strengthElement);
                });
                
                // Add new weaknesses
                randomWeaknesses.forEach(weakness => {
                    const weaknessElement = document.createElement('div');
                    weaknessElement.className = 'weakness';
                    weaknessElement.textContent = weakness;
                    weaknessesContainer.appendChild(weaknessElement);
                });
                
                // Update stats
                charismaStat.textContent = getRandomStat();
                intelligenceStat.textContent = getRandomStat();
                courageStat.textContent = getRandomStat();
                wisdomStat.textContent = getRandomStat();
                
                // Trigger fade-in animation
                animationArea.classList.remove('fade-out');
                animationArea.classList.add('fade-in');
                
            }, 500); // Half second delay to match animation duration
        }
        
        // Add event listener to generate button
        generateBtn.addEventListener('click', generateCharacter);
        
        // Generate initial character on page load
        window.addEventListener('DOMContentLoaded', () => {
            // Trigger initial fade-in animation
            animationArea.classList.add('fade-in');
        });
        
        // Generate a character every 30 seconds automatically
        setInterval(generateCharacter, 30000);
    